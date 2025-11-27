# Wallet Feature Setup

## Database Setup

To enable the wallet feature, you need to run the SQL migration in your Supabase database:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase_wallet_migration.sql`
4. Run the query

This will:
- Create the `wallets` table
- Add `wallet_id` column to the `transactions` table
- Create a default wallet
- Set up proper permissions

## Features Added

### 1. Wallet Management
- Create multiple wallets with custom names and colors
- Each wallet tracks its own balance
- Wallets are automatically updated when transactions are added

### 2. Transaction Integration
- Each transaction can be assigned to a specific wallet
- Wallet balances are automatically updated when transactions are added
- Wallet selector in the transaction form

### 3. Dashboard Integration
- New "Wallets" widget showing all wallet balances
- Sidebar balance now shows total across all wallets
- Wallet selector in transaction forms

### 4. Components Added
- `WalletSelector`: Dropdown to select wallet with add wallet functionality
- `WalletBalance`: Display component showing all wallets and their balances
- `walletService`: Service for Supabase wallet operations
- `useWallets`: Hook for wallet state management

## Usage

1. **Adding a Wallet**: Click the "+" button next to the wallet selector in the transaction form
2. **Selecting a Wallet**: Use the dropdown in the transaction form to choose which wallet to use
3. **Viewing Balances**: Add the "Wallets" widget to your dashboard to see all wallet balances
4. **Total Balance**: The sidebar shows the total balance across all wallets

## Fallback Support

The wallet feature includes localStorage fallback for when Supabase is not configured, ensuring the app continues to work offline or without a database connection.