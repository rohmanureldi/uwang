import { Transaction } from '../types';

export interface ITransactionService {
  validateTransaction(transaction: Omit<Transaction, 'id'>): boolean;
  formatTransactionData(transaction: Omit<Transaction, 'id'>, selectedWallet?: string): Omit<Transaction, 'id'>;
  createTransactionId(): string;
}

export class TransactionService implements ITransactionService {
  validateTransaction(transaction: Omit<Transaction, 'id'>): boolean {
    return !!(transaction.amount && transaction.category && transaction.description);
  }

  formatTransactionData(transaction: Omit<Transaction, 'id'>, selectedWallet?: string): Omit<Transaction, 'id'> {
    return {
      ...transaction,
      amount: typeof transaction.amount === 'string' 
        ? parseFloat(transaction.amount.replace(/\./g, '')) 
        : transaction.amount,
      subcategory: transaction.subcategory || undefined,
      wallet_id: selectedWallet === 'global' ? (transaction.wallet_id || undefined) : selectedWallet
    };
  }

  createTransactionId(): string {
    return Date.now().toString();
  }
}