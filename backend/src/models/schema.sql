-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AA Consents Table
CREATE TABLE IF NOT EXISTS consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    consent_id TEXT UNIQUE NOT NULL, -- Artefact ID from AA Provider
    status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, ACTIVE, EXPIRED, REVOKED
    consent_start TIMESTAMP WITH TIME ZONE,
    consent_expiry TIMESTAMP WITH TIME ZONE,
    data_start TIMESTAMP WITH TIME ZONE,
    data_expiry TIMESTAMP WITH TIME ZONE,
    frequency TEXT, -- ONETIME, DAILY, WEEKLY, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Financial Information (FI) Data
CREATE TABLE IF NOT EXISTS fi_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    consent_id UUID REFERENCES consents(id) ON DELETE CASCADE,
    account_type TEXT, -- SAVINGS, CURRENT
    account_number_masked TEXT,
    bank_name TEXT,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transaction Records
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    fi_data_id UUID REFERENCES fi_data(id) ON DELETE CASCADE,
    txn_id TEXT UNIQUE, -- Original transaction ID from bank
    amount DECIMAL(15, 2) NOT NULL,
    type TEXT NOT NULL, -- DEBIT, CREDIT
    mode TEXT, -- UPI, NEFT, RTGS, IMPS
    description TEXT,
    merchant_name TEXT,
    txn_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
