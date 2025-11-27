-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7) NOT NULL DEFAULT '#8b5cf6',
  icon VARCHAR(50) NOT NULL DEFAULT 'Wallet2',
  balance DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add wallet_id to transactions table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'wallet_id') THEN
    ALTER TABLE transactions ADD COLUMN wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create default wallet if none exists
INSERT INTO wallets (name, color, icon) 
SELECT 'Global Wallet', '#8b5cf6', 'Wallet2'
WHERE NOT EXISTS (SELECT 1 FROM wallets);

-- Enable RLS
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- Create policies for wallets (adjust based on your auth setup)
CREATE POLICY "Enable all operations for authenticated users" ON wallets
  FOR ALL USING (true);