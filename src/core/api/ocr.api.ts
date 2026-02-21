import MlkitOcr from 'react-native-mlkit-ocr';
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
}

/**
 * Enhanced heuristic parser for bills.
 * Specifically looks for "Amount" patterns and cleans up currency symbols.
 */
export const parseOCRBlocks = (result: any): OCRResult => {
  const items: ScannedItem[] = [];
  let total = 0;
  let lines: string[] = [];
  let merchant = '';

  // Handle results from both MlkitOcr (blocks) and expo-text-recognition (string array)
  if (Array.isArray(result)) {
    result.forEach((block: any) => {
      if (typeof block === 'string') {
        lines.push(block);
      } else if (block.lines) {
        block.lines.forEach((line: any) => lines.push(line.text));
      } else if (block.text) {
        lines.push(block.text);
      }
    });
  }

  // First few lines often contain the merchant name
  if (lines.length > 0) {
    const potentialMerchant = lines[0].trim();
    if (potentialMerchant && potentialMerchant.length > 2 && !potentialMerchant.match(/\d/)) {
      merchant = potentialMerchant;
    }
  }

  // Regex to find numbers that look like prices (e.g. 99.00, 1500, 45.5, 45)
  // Support for: 100, 100.0, 100.00, 100,00
  const priceRegex = /(\d+[\.,]\d{1,2})|(\s\d+)(\s|$)/;

  lines.forEach((text) => {
    const cleanedText = text.trim();
    if (!cleanedText) return;

    const match = cleanedText.match(priceRegex);
    
    if (match) {
      let priceStr = match[0].trim();
      // If there's a comma used as decimal separator, replace it
      if (priceStr.includes(',') && !priceStr.includes('.')) {
        priceStr = priceStr.replace(',', '.');
      } else if (priceStr.includes(',') && priceStr.includes('.')) {
        // Handle thousands separator (e.g., 1,200.00 -> 1200.00)
        priceStr = priceStr.replace(/,/g, '');
      }
      
      const price = parseFloat(priceStr);
      
      // Remove the price and common currency symbols from the name
      let name = cleanedText.replace(match[0], '').trim();
      name = name.replace(/[₹$RS\.\[\]\(\):\-]/g, '').trim();
      
      if (name && !isNaN(price) && name.length > 1 && price > 0) {
        // Filter out lines that are just "Total" or "Subtotal"
        const upperName = name.toUpperCase();
        if (!upperName.includes('TOTAL') && !upperName.includes('CASH') && !upperName.includes('TAX')) {
          items.push({
            id: Math.random().toString(36).substr(2, 9),
            name,
            price,
          });
        }
      }
    }
  });

  // Specifically search for the TOTAL amount
  for (const line of lines) {
    const upperLine = line.toUpperCase();
    if (upperLine.includes('TOTAL') || upperLine.includes('NET') || upperLine.includes('PAYABLE')) {
      const totalMatch = line.match(/(\d+[\.,]\d{2})|(\s\d+)$/);
      if (totalMatch) {
        const val = parseFloat(totalMatch[0].replace(',', '.'));
        if (val > total) total = val;
      }
    }
  }

  const itemsSum = items.reduce((sum, item) => sum + item.price, 0);
  if (total === 0 || total < itemsSum) {
    total = itemsSum;
  }

  return { items, total, merchant };
};

export const processOCR = async (imagePath: string): Promise<OCRResult> => {
  try {
    // Try MlkitOcr first (better for blocks)
    try {
      if (MlkitOcr && typeof MlkitOcr.detectFromUri === 'function') {
        const result = await MlkitOcr.detectFromUri(imagePath);
        if (result && result.length > 0) {
          return parseOCRBlocks(result);
        }
      }
    } catch (e) {
      console.log('MlkitOcr failed, trying fallback:', e);
    }

    // Fallback to expo-text-recognition
    if (TextRecognition && typeof (TextRecognition as any).getTextFromFrame === 'function') {
      const result = await (TextRecognition as any).getTextFromFrame(imagePath, false);
      return parseOCRBlocks(result);
    }

    throw new Error('No OCR module found. Please ensure you are running on a real device with the native app installed.');
  } catch (error: any) {
    console.error('OCR Error:', error);
    throw new Error(error.message || 'OCR Failed');
  }
};
