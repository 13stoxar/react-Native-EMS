import { parseOCRBlocks } from '../ocr.api';

describe('OCR Parser', () => {
  it('should extract items and prices from a standard bill structure', () => {
    const mockBlocks = [
      {
        lines: [
          { text: 'Milk 1.50' },
          { text: 'Eggs 2.99' },
          { text: 'Bread 1.00' },
        ],
      },
      {
        lines: [
          { text: 'TOTAL 5.49' },
        ],
      },
    ];

    const result = parseOCRBlocks(mockBlocks);
    
    expect(result.items).toHaveLength(3);
    expect(result.items[0].name).toBe('Milk');
    expect(result.items[0].price).toBe(1.50);
    expect(result.items[1].name).toBe('Eggs');
    expect(result.items[1].price).toBe(2.99);
    expect(result.total).toBe(5.49);
  });

  it('should handle currency symbols and messy prefixes', () => {
    const mockBlocks = [
      {
        lines: [
          { text: '₹ Milk 120.00' },
          { text: ': Eggs 60.50' },
          { text: '$ Bread 45' },
        ],
      }
    ];

    const result = parseOCRBlocks(mockBlocks);
    
    expect(result.items).toHaveLength(3);
    expect(result.items[0].name).toBe('Milk');
    expect(result.items[0].price).toBe(120);
    expect(result.items[1].name).toBe('Eggs');
    expect(result.items[1].price).toBe(60.5);
    expect(result.items[2].name).toBe('Bread');
    expect(result.items[2].price).toBe(45);
  });

  it('should fallback to items sum if total is missing', () => {
    const mockBlocks = [
      {
        lines: [
          { text: 'Item 1 10' },
          { text: 'Item 2 20' },
        ],
      }
    ];

    const result = parseOCRBlocks(mockBlocks);
    expect(result.total).toBe(30);
  });

  it('should ignore short or non-item text', () => {
    const mockBlocks = [
      {
        lines: [
          { text: 'A 1' }, // Too short name
          { text: 'DATE: 2024-02-20' }, // No trailing price
          { text: 'VALID ITEM 50' },
        ],
      }
    ];

    const result = parseOCRBlocks(mockBlocks);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toBe('VALID ITEM');
  });
});
