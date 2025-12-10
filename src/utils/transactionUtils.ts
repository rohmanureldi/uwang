import { Transaction } from '../types';

export const formatNumber = (value: string): string => {
  const num = value.replace(/\D/g, '');
  return num.replace(/\B(?=(\d{3})+(?!\\d))/g, '.');
};

export const parseAmount = (amount: string): number => {
  return parseFloat(amount.replace(/\\./g, ''));
};

export const createDefaultTransaction = (): {
  amount: string;
  description: string;
  category: string;
  subcategory: string;
  type: 'income' | 'expense';
  date: string;
  time: string;
  wallet_id: string;
} => ({
  amount: '',
  description: '',
  category: '',
  subcategory: '',
  type: 'expense',
  date: new Date().toISOString().split('T')[0],
  time: new Date().toTimeString().slice(0, 5),
  wallet_id: ''
});

export const groupTransactionsByDate = (transactions: Transaction[]) => {
  return transactions.reduce((groups, transaction) => {
    const date = new Date(transaction.date);
    const key = `${date.getDate()} ${date.toLocaleDateString('id-ID', { month: 'long' })}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);
};

export const paginateGroups = (
  groups: Record<string, Transaction[]>, 
  currentPage: number, 
  pageSize: number
) => {
  const dates = Object.keys(groups);
  const totalPages = Math.ceil(dates.length / pageSize);
  
  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;
  const currentDates = dates.slice(startIndex, endIndex);
  
  const paginatedGroups = currentDates.reduce((acc, date) => {
    acc[date] = groups[date];
    return acc;
  }, {} as Record<string, Transaction[]>);

  return { paginatedGroups, totalPages, uniqueDates: dates };
};