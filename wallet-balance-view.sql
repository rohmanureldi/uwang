-- Create a view that calculates wallet balances from transactions
CREATE OR REPLACE VIEW wallet_balances AS
SELECT 
  w.id,
  w.name,
  w.color,
  w.icon,
  w.created_at,
  COALESCE(
    SUM(
      CASE 
        WHEN t.type = 'income' THEN t.amount 
        WHEN t.type = 'expense' THEN -t.amount 
        ELSE 0 
      END
    ), 0
  ) as balance
FROM wallets w
LEFT JOIN transactions t ON w.id = t.wallet_id
GROUP BY w.id, w.name, w.color, w.icon, w.created_at;