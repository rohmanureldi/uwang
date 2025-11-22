export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: string;
  time: string;
  wallet_id?: string;
}

export interface Wallet {
  id: string;
  name: string;
  color: string;
  icon: string;
  balance: number;
  created_at: string;
}

export interface Budget {
  category: string;
  limit: number;
  month: string; // YYYY-MM format
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  description?: string;
}