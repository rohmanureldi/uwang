import { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { TransactionModel, ITransactionModel } from '../models/TransactionModel';
import { useWallets } from '../hooks/useWallets';

type ViewType = 'transactions' | 'financial-analysis' | 'budget-goals' | 'quick-overview' | 'add-transaction' | 'wallets' | 'settings';

interface DashboardState {
  currentView: ViewType;
  selectedWallet: string;
  showTransactionModal: boolean;
  showResetModal: boolean;
  showMobileMenu: boolean;
  loading: boolean;
}

export function useDashboardViewModel(
  transactionModel: ITransactionModel = new TransactionModel()
) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [state, setState] = useState<DashboardState>({
    currentView: 'transactions',
    selectedWallet: '',
    showTransactionModal: false,
    showResetModal: false,
    showMobileMenu: false,
    loading: true
  });

  const { wallets, updateWalletBalance, refreshWallets } = useWallets(transactions);

  // Load transactions on mount
  useEffect(() => {
    loadTransactions();
  }, []);

  // Set default wallet when wallets load
  useEffect(() => {
    if (wallets.length > 0 && !state.selectedWallet) {
      setState(prev => ({ ...prev, selectedWallet: 'global' }));
    }
  }, [wallets, state.selectedWallet]);

  const loadTransactions = async () => {
    try {
      const data = await transactionModel.loadTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const filteredTransactions = state.selectedWallet === 'global' || !state.selectedWallet 
    ? transactions 
    : transactions.filter(t => t.wallet_id === state.selectedWallet);

  const actions = {
    // Navigation
    setCurrentView: (view: ViewType) => {
      setState(prev => ({ ...prev, currentView: view }));
    },

    setSelectedWallet: (walletId: string) => {
      setState(prev => ({ ...prev, selectedWallet: walletId }));
    },

    // Modal management
    showTransactionModal: () => {
      setState(prev => ({ ...prev, showTransactionModal: true }));
    },

    hideTransactionModal: () => {
      setState(prev => ({ ...prev, showTransactionModal: false }));
    },

    showResetModal: () => {
      setState(prev => ({ ...prev, showResetModal: true }));
    },

    hideResetModal: () => {
      setState(prev => ({ ...prev, showResetModal: false }));
    },

    toggleMobileMenu: () => {
      setState(prev => ({ ...prev, showMobileMenu: !prev.showMobileMenu }));
    },

    closeMobileMenu: () => {
      setState(prev => ({ ...prev, showMobileMenu: false }));
    },

    // Transaction operations
    addTransaction: async (transactionData: Omit<Transaction, 'id'>) => {
      if (transactionData.wallet_id && updateWalletBalance) {
        updateWalletBalance(transactionData.wallet_id, transactionData.amount, transactionData.type === 'income');
      }

      try {
        const newTransaction = await transactionModel.saveTransaction(transactionData);
        setTransactions(prev => [newTransaction, ...prev]);
      } catch (error) {
        console.error('Failed to save transaction:', error);
        // Still add to local state even if Supabase fails
        const fallbackTransaction: Transaction = {
          ...transactionData,
          id: Date.now().toString()
        };
        setTransactions(prev => [fallbackTransaction, ...prev]);
      }
    },

    editTransaction: async (id: string, transactionData: Omit<Transaction, 'id'>) => {
      await transactionModel.updateTransaction(id, transactionData);
      setTransactions(prev => 
        prev.map(t => t.id === id ? { ...transactionData, id } : t)
      );
    },

    deleteTransaction: async (id: string) => {
      await transactionModel.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    },

    importTransactions: async (importedTransactions: Omit<Transaction, 'id'>[], walletId?: string) => {
      const transactionsWithWallet = importedTransactions.map(t => ({
        ...t,
        wallet_id: walletId === 'global' ? undefined : walletId
      }));
      await transactionModel.importTransactions(transactionsWithWallet);
      await loadTransactions(); // Reload to get updated data
    },

    deleteTransactionsByWallet: async (walletId: string) => {
      await transactionModel.deleteTransactionsByWallet(walletId);
      setTransactions(prev => prev.filter(t => t.wallet_id !== walletId));
    },

    resetData: async () => {
      await transactionModel.resetAllData();
      setTransactions([]);
      setState(prev => ({ ...prev, showResetModal: false }));
    },

    // Navigation helpers
    navigateToWallets: () => {
      setState(prev => ({ ...prev, currentView: 'wallets' }));
      setTimeout(() => {
        const event = new CustomEvent('expandWalletForm');
        window.dispatchEvent(event);
      }, 100);
    }
  };

  return {
    // State
    state,
    transactions,
    filteredTransactions,
    wallets,
    
    // Actions
    actions,
    
    // Wallet actions
    refreshWallets
  };
}