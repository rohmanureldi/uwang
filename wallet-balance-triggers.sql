thre-- Drop the view since we're going back to stored balances
DROP VIEW IF EXISTS wallet_balances;

-- Create function to update wallet balance
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Add to wallet balance
    UPDATE wallets 
    SET balance = balance + (CASE WHEN NEW.type = 'income' THEN NEW.amount ELSE -NEW.amount END)
    WHERE id = NEW.wallet_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Remove old amount and add new amount
    UPDATE wallets 
    SET balance = balance 
      - (CASE WHEN OLD.type = 'income' THEN OLD.amount ELSE -OLD.amount END)
      + (CASE WHEN NEW.type = 'income' THEN NEW.amount ELSE -NEW.amount END)
    WHERE id = NEW.wallet_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Subtract from wallet balance
    UPDATE wallets 
    SET balance = balance - (CASE WHEN OLD.type = 'income' THEN OLD.amount ELSE -OLD.amount END)
    WHERE id = OLD.wallet_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS wallet_balance_trigger ON transactions;
CREATE TRIGGER wallet_balance_trigger
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_wallet_balance();

-- Optional: Function to recalculate all wallet balances (for data integrity)
CREATE OR REPLACE FUNCTION recalculate_wallet_balances()
RETURNS void AS $$
BEGIN
  UPDATE wallets 
  SET balance = COALESCE(
    (SELECT SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END)
     FROM transactions t 
     WHERE t.wallet_id = wallets.id), 0
  );
END;
$$ LANGUAGE plpgsql;