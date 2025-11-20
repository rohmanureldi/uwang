import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Transaction } from '../types';

export function useTransactions() {
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
        setTransactions(JSON.parse(saved));
      }
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transactionData: Omit<Transaction, 'id'>) => {
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

  return {
    transactions,
    loading,
    addTransaction,
    editTransaction,
    deleteTransaction
  };
}