export default class AAService {
  private pg: any;

  constructor(pg: any) {
    this.pg = pg;
  }

  /**
   * Initiate a consent request via AA Gateway
   */
  async initiateConsent(userId: string, vua: string) {
    // 1. In production, call AA Gateway (e.g., Setu, Sahamati) to create a consent request.
    // 2. Here, we'll simulate the response.
    const mockConsentId = `CSNT-${Math.random().toString(36).substring(7).toUpperCase()}`;

    const query = `
      INSERT INTO consents (user_id, consent_id, status)
      VALUES ($1, $2, 'PENDING')
      RETURNING *;
    `;
    const values = [userId, mockConsentId];
    const { rows } = await this.pg.query(query, values);

    return {
      consentId: mockConsentId,
      redirectUrl: `https://mock-aa-provider.in/consent/${mockConsentId}`, // URL to AA consent page
      status: rows[0].status
    };
  }

  /**
   * Fetch current consent status from AA provider
   */
  async getConsentStatus(consentId: string) {
    const query = 'SELECT * FROM consents WHERE consent_id = $1';
    const { rows } = await this.pg.query(query, [consentId]);
    return rows[0] || null;
  }

  /**
   * Fetch Financial Information (FI) data for a given consent
   */
  async fetchFIData(consentId: string) {
    // 1. Verify consent is ACTIVE
    const { rows: consentRows } = await this.pg.query('SELECT * FROM consents WHERE consent_id = $1', [consentId]);
    const consent = consentRows[0];

    if (!consent || consent.status !== 'ACTIVE') {
      throw new Error('Consent is not active or not found.');
    }

    // 2. Simulate data fetch from AA Provider API
    // 3. Store data in fi_data and transactions tables
    const mockFiDataId = await this.storeMockFiData(consent.user_id, consent.id);
    await this.storeMockTransactions(consent.user_id, mockFiDataId);

    return { status: 'success', message: 'Financial Information fetched successfully.' };
  }

  /**
   * Handle async webhook notifications from AA provider
   */
  async handleWebhook(payload: any) {
    // Process webhook: update consent status, or trigger data fetch if notification is for FI data ready
    if (payload.type === 'CONSENT_STATUS_UPDATE') {
      const { consentId, status } = payload;
      await this.pg.query(
        'UPDATE consents SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE consent_id = $2',
        [status, consentId]
      );
    }
  }

  /**
   * Get all transactions for a user
   */
  async getUserTransactions(userId: string) {
    const query = 'SELECT * FROM transactions WHERE user_id = $1 ORDER BY txn_date DESC';
    const { rows } = await this.pg.query(query, [userId]);
    return rows;
  }

  // --- Helper Methods ---

  private async storeMockFiData(userId: string, consentTableId: string) {
    const query = `
      INSERT INTO fi_data (user_id, consent_id, account_type, account_number_masked, bank_name)
      VALUES ($1, $2, 'SAVINGS', 'XXXX-XXXX-1234', 'State Bank of India')
      RETURNING id;
    `;
    const { rows } = await this.pg.query(query, [userId, consentTableId]);
    return rows[0].id;
  }

  private async storeMockTransactions(userId: string, fiDataId: string) {
    const mockTxns = [
      { id: 'T1', amount: 500.0, type: 'DEBIT', mode: 'UPI', desc: 'Transfer to Zomato', merchant: 'Zomato', date: '2024-03-22' },
      { id: 'T2', amount: 1200.0, type: 'DEBIT', mode: 'UPI', desc: 'Amazon.in Pay', merchant: 'Amazon', date: '2024-03-21' },
      { id: 'T3', amount: 45000.0, type: 'CREDIT', mode: 'IMPS', desc: 'Monthly Salary', merchant: 'TCS Ltd', date: '2024-03-01' }
    ];

    for (const txn of mockTxns) {
      const query = `
        INSERT INTO transactions (user_id, fi_data_id, txn_id, amount, type, mode, description, merchant_name, txn_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (txn_id) DO NOTHING;
      `;
      await this.pg.query(query, [userId, fiDataId, txn.id, txn.amount, txn.type, txn.mode, txn.desc, txn.merchant, txn.date]);
    }
  }
}
