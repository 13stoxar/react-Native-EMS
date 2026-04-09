import MlkitOcr from 'react-native-mlkit-ocr';
// @ts-ignore
import * as TextRecognition from 'expo-text-recognition';

export interface ScannedItem {
  id: string;
  name: string;
  price: number;
}

export interface OCRResult {
  items: ScannedItem[];
  total: number;
  merchant?: string;
  date?: string;
  time?: string;
}

/**
 * Enhanced heuristic parser for bills.
 * Uses spatial information (y-coordinates) to group text into lines.
 */
export const parseOCRBlocks = (result: any): OCRResult => {
  const items: ScannedItem[] = [];
  let total = 0;
  let merchant = '';
  let date = '';
  let time = '';
  
  // Extract all lines with their vertical positions
  let allLines: any[] = [];

  // Standardize results from different libraries
  if (Array.isArray(result)) {
    result.forEach((block: any, index: number) => {
      if (typeof block === 'string') {
        // If it's just a string, give it a unique vertical position to prevent merging
        allLines.push({ text: block, top: index * 50, left: 0, height: 20, hasCoords: false });
      } 
      else if (block.lines) {
        block.lines.forEach((line: any) => {
          allLines.push({
            text: line.text,
            top: line.frame?.top || line.boundingPoly?.vertices?.[0]?.y || 0,
            left: line.frame?.left || line.boundingPoly?.vertices?.[0]?.x || 0,
            height: line.frame?.height || (line.frame?.bottom - line.frame?.top) || 20,
            hasCoords: true
          });
        });
      } else if (block.text) {
        allLines.push({
          text: block.text,
          top: block.frame?.top || 0,
          left: block.frame?.left || 0,
          height: block.frame?.height || 20,
          hasCoords: block.frame ? true : false
        });
      }
    });
  }

  // Sort by vertical position
  allLines.sort((a, b) => a.top - b.top);

  // Group lines that are on the same vertical level (roughly)
  const groupedLines: string[] = [];
  if (allLines.length > 0) {
    let currentGroup = [allLines[0]];
    for (let i = 1; i < allLines.length; i++) {
      const prev = currentGroup[currentGroup.length - 1];
      const curr = allLines[i];
      
      // Only merge if both have coordinates and are vertically close
      if (curr.hasCoords && prev.hasCoords && Math.abs(curr.top - prev.top) < (prev.height / 1.5)) {
        currentGroup.push(curr);
      } else {
        currentGroup.sort((a, b) => a.left - b.left);
        groupedLines.push(currentGroup.map(g => g.text).join(' '));
        currentGroup = [curr];
      }
    }
    currentGroup.sort((a, b) => a.left - b.left);
    groupedLines.push(currentGroup.map(g => g.text).join(' '));
  }

  // MERCHANT: Usually at the top, first few lines
  for (let i = 0; i < Math.min(8, groupedLines.length); i++) {
    const line = groupedLines[i].trim();
    const upperLine = line.toUpperCase();
    if (line.length > 3 && 
        !line.match(/\d{4,}/) && // Not a long number
        !upperLine.includes('TAX') && 
        !upperLine.includes('BILL') && 
        !upperLine.includes('INVOICE') && 
        !upperLine.includes('RECEIPT') &&
        !upperLine.includes('TEL:') &&
        !upperLine.includes('PH:')) {
      merchant = line;
      break;
    }
  }

  // DATE and TIME: Standard formats
  const dateRegex = /(\d{1,4}[\/\-.]\d{1,2}[\/\-.]\d{1,4})|(\d{1,2} [A-Za-z]{3,9} \d{2,4})/;
  const timeRegex = /(\d{1,2}:\d{2}(?::\d{2})?\s?(?:AM|PM)?)/i;

  for (const line of groupedLines) {
    if (!date) {
      const dateMatch = line.match(dateRegex);
      if (dateMatch) date = dateMatch[0];
    }
    if (!time) {
      const timeMatch = line.match(timeRegex);
      if (timeMatch) time = timeMatch[0];
    }
  }

  // PRICE: Robust regex for various formats (e.g., 99.00, 1500, 1,200.50)
  const priceRegex = /(?:[₹$RS\s])?(\d{1,3}(?:[.,]\d{3})*[.,]\d{1,2}|\d{1,6}(?:[.,]\d{1,2})?)(?!\d)/g;
  
  // Noise filtering - 'QTY' removed from noise to allow item detection with quantities
  const noiseKeywords = ['TOTAL', 'SUBTOTAL', 'TAX', 'CASH', 'CHANGE', 'GST', 'VAT', 'DISCOUNT', 'SAVED', 'PAYMENT', 'VISA', 'CARD', 'MOBILE', 'PHONE', 'BALANCE', 'ROUND', 'DUE', 'TENDERED'];

  groupedLines.forEach((text) => {
    const upperText = text.toUpperCase();
    
    // Find all potential prices in the line
    let match;
    const linePrices: { price: number, str: string, index: number }[] = [];
    
    // Reset regex index for global search
    priceRegex.lastIndex = 0;
    while ((match = priceRegex.exec(text)) !== null) {
      let priceStr = match[1].replace(/,/g, '');
      const price = parseFloat(priceStr);
      if (!isNaN(price) && price > 0) {
        linePrices.push({ price, str: match[0], index: match.index });
      }
    }
    
    if (linePrices.length > 0) {
      const isTotalLine = noiseKeywords.some(kw => upperText.includes(kw)) && 
                          (upperText.includes('TOTAL') || upperText.includes('NET') || upperText.includes('PAYABLE') || upperText.includes('AMOUNT PAID') || upperText.includes('DUE'));

      if (isTotalLine) {
        // Capture the largest price on a Total line as the grand total
        const maxPrice = Math.max(...linePrices.map(p => p.price));
        if (maxPrice > total) total = maxPrice;
      } else {
        // If not a total line, try to extract items. 
        // If there are multiple prices on one line, they might be separate items or QTY + Price
        // For simplicity and common bill formats, we'll take the last price as the item price
        // unless they are far apart, but usually last price is safest.
        
        const mainPriceObj = linePrices[linePrices.length - 1];
        const price = mainPriceObj.price;
        
        let name = text.replace(mainPriceObj.str, '').trim();
        // If there were other prices (like quantities or unit prices), clean them too
        linePrices.slice(0, -1).forEach(p => {
          name = name.replace(p.str, '');
        });

        // Clean name from common junk and currency symbols
        name = name.replace(/[₹$RS\.\[\]\(\):\-#\*\|]/gi, '').trim();
        // Remove quantities like "1x" or "2 x"
        name = name.replace(/\d+\s*[xX]\s*/g, '').trim();
        
        const isNoise = noiseKeywords.some(kw => upperText.includes(kw));
        
        if (name && name.length >= 2 && !isNoise) {
          items.push({
            id: Math.random().toString(36).substr(2, 9),
            name: name.substring(0, 50),
            price,
          });
        }
      }
    }
  });

  const itemsSum = items.reduce((sum, item) => sum + item.price, 0);
  if (total === 0 || (total < itemsSum && itemsSum > 0)) {
    total = itemsSum;
  }

  return { items, total, merchant, date, time };
};

export const processOCR = async (imagePath: string): Promise<OCRResult> => {
  try {
    // 1. Try MlkitOcr (Preferred)
    try {
      const result = await MlkitOcr.detectFromUri(imagePath);
      if (result && result.length > 0) {
        return parseOCRBlocks(result);
      }
    } catch (e) {
      console.log('MlkitOcr failed, trying TextRecognition:', e);
    }

    // 2. Try expo-text-recognition (Fallback)
    try {
      // @ts-ignore
      if (TextRecognition && typeof TextRecognition.getTextFromFrame === 'function') {
        const result = await TextRecognition.getTextFromFrame(imagePath, false);
        if (result && result.length > 0) {
          return parseOCRBlocks(result);
        }
      }
    } catch (e) {
      console.log('TextRecognition failed:', e);
    }
    
    throw new Error('All OCR methods failed. Please ensure you are on a real device.');
    
  } catch (error: any) {
    console.error('OCR Error:', error);
    throw new Error(error.message || 'OCR Failed');
  }
};

