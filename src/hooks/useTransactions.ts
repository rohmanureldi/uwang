import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Transaction } from '../types';
import { syncService } from '../services/syncService';
import { STORAGE_KEYS } from '../utils/constants';
import { TransactionService, ITransactionService } from '../services/TransactionService';

export function useTransactions(
  onWalletBalanceUpdate?: (walletId: string, amount: number, isIncome: boolean) => void,
  transactionService: ITransactionService = new TransactionService()
) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [useLocalStorage, setUseLocalStorage] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    if (useLocalStorage) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    }
  }, [transactions, useLocalStorage]);

  const loadTransactions = async () => {
    try {
      // Check if Supabase is configured
      if (!supabase) {
        throw new Error('Supabase not configured');
      }
      
      // Try Supabase first
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase load error:', error);
        throw error;
      }
      
      setTransactions(data || []);
      console.log('Loaded from Supabase:', data?.length || 0, 'transactions');
      
      // Subscribe to real-time changes if successful
      const subscription = supabase
        .channel('transactions')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
          loadTransactions();
        })
        .subscribe();

      return () => subscription.unsubscribe();
    } catch (error) {
      console.warn('Supabase failed, using localStorage:', error);
      setUseLocalStorage(true);
      
      // Fallback to localStorage
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) {
        try {
          const parsedTransactions = JSON.parse(saved);
          setTransactions(parsedTransactions);
          console.log('Loaded from localStorage:', parsedTransactions.length, 'transactions');
        } catch (parseError) {
          console.error('Error parsing localStorage transactions:', parseError);
          setTransactions([]);
        }
      } else {
        setTransactions([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transactionData: Omit<Transaction, 'id'>) => {
    // Update wallet balance if wallet is selected
    if (transactionData.wallet_id && onWalletBalanceUpdate) {
      onWalletBalanceUpdate(transactionData.wallet_id, transactionData.amount, transactionData.type === 'income');
    }

    const formattedData = transactionService.formatTransactionData(transactionData);
    const newTransaction: Transaction = {
      ...formattedData,
      id: transactionService.createTransactionId()
    };

    // Always save to localStorage first
    const updated = [newTransaction, ...transactions];
    setTransactions(updated);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));

    // Try to sync to server if online
    if (syncService.getStatus().isOnline && supabase && !useLocalStorage) {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .insert([transactionData])
          .select()
          .single();

        if (error) throw error;
        
        // Update with server ID
        const serverUpdated = updated.map(t => t.id === newTransaction.id ? data : t);
        setTransactions(serverUpdated);
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(serverUpdated));
      } catch (error) {
        console.error('Failed to sync transaction, will sync later:', error);
        // Add to pending sync queue
        syncService.addPendingTransaction(newTransaction);
      }
    } else {
      // Add to pending sync queue for when online
      syncService.addPendingTransaction(newTransaction);
    }
  };

  const editTransaction = async (id: string, transactionData: Omit<Transaction, 'id'>) => {
    if (useLocalStorage || !supabase) {
      const updated = transactions.map(t => t.id === id ? { ...transactionData, id } : t);
      setTransactions(updated);
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
      return;
    }

    try {
      const { error } = await supabase
        .from('transactions')
        .update(transactionData)
        .eq('id', id);

      if (error) throw error;
      setTransactions(prev => 
        prev.map(t => t.id === id ? { ...transactionData, id } : t)
      );
    } catch (error) {
      console.error('Error editing transaction:', error);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (useLocalStorage || !supabase) {
      const updated = transactions.filter(t => t.id !== id);
      setTransactions(updated);
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
      return;
    }

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const resetData = async () => {
    if (useLocalStorage || !supabase) {
      setTransactions([]);
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEYS.WALLETS);
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_CATEGORIES);
      localStorage.removeItem(STORAGE_KEYS.DASHBOARD_CARDS);
      return;
    }

    try {
      // Delete all transactions
      const { error: transactionError } = await supabase
        .from('transactions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (transactionError) throw transactionError;

      // Delete all wallets
      const { error: walletError } = await supabase
        .from('wallets')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (walletError) throw walletError;

      // Delete all custom categories
      const { error: categoryError } = await supabase
        .from('custom_categories')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (categoryError) throw categoryError;

      // Delete dashboard settings
      const { error: dashboardError } = await supabase
        .from('dashboard_settings')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (dashboardError) throw dashboardError;

      setTransactions([]);
    } catch (error) {
      console.error('Error resetting data:', error);
      // Fallback to localStorage reset
      setTransactions([]);
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEYS.WALLETS);
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_CATEGORIES);
      localStorage.removeItem(STORAGE_KEYS.DASHBOARD_CARDS);
    }
  };

  const importTransactions = async (importedTransactions: Omit<Transaction, 'id'>[]) => {
    const newTransactions = importedTransactions.map(t => ({
      ...t,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    }));

    const updated = [...newTransactions, ...transactions];
    setTransactions(updated);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));

    if (syncService.getStatus().isOnline && supabase && !useLocalStorage) {
      try {
        const { error } = await supabase
          .from('transactions')
          .insert(importedTransactions);

        if (error) throw error;
      } catch (error) {
        console.error('Failed to sync imported transactions:', error);
        newTransactions.forEach(t => syncService.addPendingTransaction(t));
      }
    } else {
      newTransactions.forEach(t => syncService.addPendingTransaction(t));
    }
  };

  const deleteTransactionsByWallet = async (walletId: string) => {
    if (useLocalStorage || !supabase) {
      const updated = transactions.filter(t => t.wallet_id !== walletId && t.wallet_id !== null && t.wallet_id !== undefined);
      setTransactions(updated);
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
      return;
    }

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('wallet_id', walletId);

      if (error) throw error;
      setTransactions(prev => prev.filter(t => t.wallet_id !== walletId));
    } catch (error) {
      console.error('Error deleting wallet transactions:', error);
      const updated = transactions.filter(t => t.wallet_id !== walletId);
      setTransactions(updated);
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
    }
  };

  return {
    transactions,
    loading,
    addTransaction,
    editTransaction,
    deleteTransaction,
    importTransactions,
    deleteTransactionsByWallet,
    resetData
  };
}