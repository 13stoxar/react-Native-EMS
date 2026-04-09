import api from "./client";

export interface ConsentRequest {
  VUA: string;
}

export interface ConsentResponse {
  consentId: string;
  redirectUrl: string;
  status: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  fi_data_id: string;
  txn_id: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  mode: string;
  description: string;
  merchant_name: string;
  txn_date: string;
  created_at: string;
}

export const initiateConsent = async (data: ConsentRequest): Promise<ConsentResponse> => {
  const response = await api.post('/api/aa/consent/initiate', data);
  return response.data;
};

export const getConsentStatus = async (consentId: string): Promise<any> => {
  const response = await api.get(`/api/aa/consent/${consentId}/status`);
  return response.data;
};

export const fetchFIData = async (consentId: string): Promise<any> => {
  const response = await api.post('/api/aa/fi/fetch', { consentId });
  return response.data;
};

export const getUserTransactions = async (): Promise<Transaction[]> => {
  const response = await api.get('/api/aa/transactions');
  return response.data;
};
