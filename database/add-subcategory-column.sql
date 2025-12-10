-- Add subcategory column to transactions table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'subcategory') THEN
    ALTER TABLE transactions ADD COLUMN subcategory TEXT;
  END IF;
END $$;