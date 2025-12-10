import { Transaction } from '../types';
import { supabase } from '../lib/supabase';
import { syncService } from '../services/syncService';
import { STORAGE_KEYS } from '../utils/constants';

export interface ITransactionModel {
  loadTransactions(): Promise<Transaction[]>;
  saveTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction>;
  updateTransaction(id: string, transaction: Omit<Transaction, 'id'>): Promise<void>;
  deleteTransaction(id: string): Promise<void>;
  importTransactions(transactions: Omit<Transaction, 'id'>[]): Promise<void>;
  deleteTransactionsByWallet(walletId: string): Promise<void>;
  resetAllData(): Promise<void>;
}

export class TransactionModel implements ITransactionModel {
  private useLocalStorage = false;

  async loadTransactions(): Promise<Transaction[]> {
    try {
      if (!supabase) throw new Error('Supabase not configured');
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('Supabase failed, using localStorage:', error);
      this.useLocalStorage = true;
      
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return saved ? JSON.parse(saved) : [];
    }
  }

  async saveTransaction(transactionData: Omit<Transaction, 'id'>): Promise<Transaction> {
    const newTransaction: Transaction = {
      ...transactionData,
      id: Date.now().toString()
    };

    if (this.useLocalStorage || !supabase) {
      const existing = await this.loadTransactions();
      const updated = [newTransaction, ...existing];
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
      return newTransaction;
    }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([transactionData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      syncService.addPendingTransaction(newTransaction);
      throw error;
    }
  }

  async updateTransaction(id: string, transactionData: Omit<Transaction, 'id'>): Promise<void> {
    if (this.useLocalStorage || !supabase) {
      const existing = await this.loadTransactions();
      const updated = existing.map(t => t.id === id ? { ...transactionData, id } : t);
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
      return;
    }

    const { error } = await supabase
      .from('transactions')
      .update(transactionData)
      .eq('id', id);

    if (error) throw error;
  }

  async deleteTransaction(id: string): Promise<void> {
    if (this.useLocalStorage || !supabase) {
      const existing = await this.loadTransactions();
      const updated = existing.filter(t => t.id !== id);
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
      return;
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async importTransactions(transactions: Omit<Transaction, 'id'>[]): Promise<void> {
    const newTransactions = transactions.map(t => ({
      ...t,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    }));

    if (this.useLocalStorage || !supabase) {
      const existing = await this.loadTransactions();
      const updated = [...newTransactions, ...existing];
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
      return;
    }

    const { error } = await supabase
      .from('transactions')
      .insert(transactions);

    if (error) {
      newTransactions.forEach(t => syncService.addPendingTransaction(t));
      throw error;
    }
  }

  async deleteTransactionsByWallet(walletId: string): Promise<void> {
    if (this.useLocalStorage || !supabase) {
      const existing = await this.loadTransactions();
      const updated = existing.filter(t => t.wallet_id !== walletId);
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
      return;
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('wallet_id', walletId);

    if (error) throw error;
  }

  async resetAllData(): Promise<void> {
    if (this.useLocalStorage || !supabase) {
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEYS.WALLETS);
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_CATEGORIES);
      localStorage.removeItem(STORAGE_KEYS.DASHBOARD_CARDS);
      return;
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) throw error;
  }
}