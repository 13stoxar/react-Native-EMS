import SmsAndroid from 'react-native-get-sms-android';
import { PermissionsAndroid, Platform } from 'react-native';

export interface SMSTransaction {
  id: string;
  address: string; // Sender ID (e.g., QP-HDFCBK)
  date: number; // Timestamp
  body: string;
  amount: number;
  type: 'debit' | 'credit';
  merchant: string;
}

export const requestSmsPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return false;

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_SMS,
      {
        title: 'SMS Permission',
        message: 'App needs access to your SMS to track expenses automatically.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn(err);
    return false;
  }
};

export const fetchSmsTransactions = async (minDate?: number): Promise<SMSTransaction[]> => {
  if (Platform.OS !== 'android') return [];

  const filter = {
    box: 'inbox',
    minDate: minDate || Date.now() - 30 * 24 * 60 * 60 * 1000, // Last 30 days by default
    maxCount: 200, // Limit to recent messages
  };

  return new Promise((resolve, reject) => {
    SmsAndroid.list(
      JSON.stringify(filter),
      (fail: string) => {
        console.log('Failed to fetch SMS:', fail);
        resolve([]); // Return empty array on failure gracefully
      },
      (count: number, smsList: string) => {
        const messages = JSON.parse(smsList);
        const transactions: SMSTransaction[] = [];

        messages.forEach((msg: any) => {
          const parsed = parseTransactionSms(msg.body, msg.address, msg.date);
          if (parsed) {
            transactions.push({
              id: msg._id,
              address: msg.address,
              date: msg.date,
              body: msg.body,
              ...parsed,
            });
          }
        });

        resolve(transactions);
      }
    );
  });
};

const parseTransactionSms = (body: string, sender: string, date: number) => {
  // Ignore personal messages (usually 10 digit numbers)
  if (/^\d+$/.test(sender) || sender.length < 3) return null;

  const text = body.toLowerCase();
  
  // Basic keywords for transaction
  const isDebit = text.includes('debited') || text.includes('spent') || text.includes('paid') || text.includes('sent') || text.includes('purchase');
  const isCredit = text.includes('credited') || text.includes('received') || text.includes('added') || text.includes('refunded');

  if (!isDebit && !isCredit) return null;

  // Regex to find amount (e.g., Rs. 1200, INR 1200, 1200.00)
  // Looks for "Rs" or "INR" or currency symbol, followed by optional space, then number
  const amountRegex = /(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)/i;
  const match = body.match(amountRegex);

  if (!match) return null;

  const amountStr = match[1].replace(/,/g, '');
  const amount = parseFloat(amountStr);

  if (isNaN(amount)) return null;

  // Extract merchant name (heuristic)
  let merchant = 'Unknown';
  
  // Pattern 1: "at MERCHANT" or "to MERCHANT"
  const merchantMatch = body.match(/(?:at|to|from)\s+([A-Za-z0-9\s\*\.]+?)(?:\s+(?:on|using|via|ending|ref)|$)/i);
  if (merchantMatch && merchantMatch[1]) {
    merchant = merchantMatch[1].trim();
  } else {
    // Fallback: Use sender ID as merchant hint (e.g., HDFCBK -> HDFC Bank)
    // Remove headers like "QP-" or "AD-"
    const senderParts = sender.split('-');
    if (senderParts.length > 1) {
      merchant = senderParts[senderParts.length - 1]; // Last part is usually the identifier
    } else {
      merchant = sender;
    }
  }

  // Cleanup merchant name
  merchant = merchant.replace(/\*+/g, '').trim(); 
  if (merchant.toUpperCase() === 'BANK' || merchant.length < 2) merchant = 'Bank Transaction';

  return {
    amount,
    type: isDebit ? 'debit' : 'credit' as 'debit' | 'credit',
    merchant: merchant.toUpperCase(),
  };
};
