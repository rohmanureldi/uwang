import { Transaction } from '../types';
import { formatIDR } from './currency';

export const calculateTotalBalance = (transactions: Transaction[]): number => {
  return transactions.reduce((total, transaction) => {
    return transaction.type === 'income' 
      ? total + transaction.amount 
      : total - transaction.amount;
  }, 0);
};

export const formatBalance = (balance: number): string => {
  return formatIDR(balance);
};

export const getBalanceColor = (balance: number): string => {
  return balance >= 0 ? 'text-green-400' : 'text-red-400';
};