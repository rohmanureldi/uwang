import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Transaction } from '../types';

export function useTransactions(onWalletBalanceUpdate?: (walletId: string, amount: number, isIncome: boolean) => void) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [useLocalStorage, setUseLocalStorage] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    if (useLocalStorage) {
      localStorage.setItem('transactions', JSON.stringify(transactions));
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
      const saved = localStorage.getItem('transactions');
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

    if (useLocalStorage || !supabase) {
      const newTransaction: Transaction = {
        ...transactionData,
        id: Date.now().toString()
      };
      const updated = [newTransaction, ...transactions];
      setTransactions(updated);
      localStorage.setItem('transactions', JSON.stringify(updated));
      return;
    }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([transactionData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      setTransactions(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error adding transaction, falling back to localStorage:', error);
      setUseLocalStorage(true);
      
      // Fallback to localStorage
      const newTransaction: Transaction = {
        ...transactionData,
        id: Date.now().toString()
      };
      const updated = [newTransaction, ...transactions];
      setTransactions(updated);
      localStorage.setItem('transactions', JSON.stringify(updated));
    }
  };

  const editTransaction = async (id: string, transactionData: Omit<Transaction, 'id'>) => {
    if (useLocalStorage || !supabase) {
      const updated = transactions.map(t => t.id === id ? { ...transactionData, id } : t);
      setTransactions(updated);
      localStorage.setItem('transactions', JSON.stringify(updated));
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
      localStorage.setItem('transactions', JSON.stringify(updated));
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
      localStorage.removeItem('transactions');
      localStorage.removeItem('wallets');
      localStorage.removeItem('customCategories');
      localStorage.removeItem('dashboardCards');
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
      localStorage.removeItem('transactions');
      localStorage.removeItem('wallets');
      localStorage.removeItem('customCategories');
      localStorage.removeItem('dashboardCards');
    }
  };

  const deleteTransactionsByWallet = async (walletId: string) => {
    if (useLocalStorage || !supabase) {
      const updated = transactions.filter(t => t.wallet_id !== walletId && t.wallet_id !== null && t.wallet_id !== undefined);
      setTransactions(updated);
      localStorage.setItem('transactions', JSON.stringify(updated));
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
      localStorage.setItem('transactions', JSON.stringify(updated));
    }
  };

  return {
    transactions,
    loading,
    addTransaction,
    editTransaction,
    deleteTransaction,
    deleteTransactionsByWallet,
    resetData
  };
}