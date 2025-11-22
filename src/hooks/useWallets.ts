import { useState, useEffect } from 'react';
import { Wallet, Transaction } from '../types';
import { walletService } from '../services/walletService';

export function useWallets(transactions: Transaction[] = []) {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = async () => {
    try {
      const data = await walletService.getWallets();
      setWallets(data);
    } catch (error) {
      console.error('Error loading wallets:', error);
      // Fallback to localStorage
      const saved = localStorage.getItem('wallets');
      if (saved) {
        setWallets(JSON.parse(saved));
      } else {
        // Create default wallet
        const defaultWallet: Wallet = {
          id: 'default',
          name: 'Global Wallet',
          color: '#8b5cf6',
          icon: 'Wallet2',
          balance: 0,
          created_at: new Date().toISOString()
        };
        setWallets([defaultWallet]);
        localStorage.setItem('wallets', JSON.stringify([defaultWallet]));
      }
    } finally {
      setLoading(false);
    }
  };

  const addWallet = async (walletData: Omit<Wallet, 'id' | 'created_at' | 'balance'>) => {
    try {
      const newWallet = await walletService.createWallet(walletData);
      setWallets(prev => [...prev, newWallet]);
      return newWallet;
    } catch (error) {
      console.error('Error creating wallet:', error);
      // Fallback to localStorage
      const newWallet: Wallet = {
        ...walletData,
        id: Date.now().toString(),
        balance: 0,
        created_at: new Date().toISOString()
      };
      const updated = [...wallets, newWallet];
      setWallets(updated);
      localStorage.setItem('wallets', JSON.stringify(updated));
      return newWallet;
    }
  };

  const updateWalletBalance = async (walletId: string, amount: number, isIncome: boolean) => {
    const balanceChange = isIncome ? amount : -amount;
    
    try {
      const wallet = wallets.find(w => w.id === walletId);
      if (!wallet) return;
      
      const newBalance = wallet.balance + balanceChange;
      await walletService.updateWallet(walletId, { balance: newBalance });
      
      setWallets(prev => 
        prev.map(w => w.id === walletId ? { ...w, balance: newBalance } : w)
      );
    } catch (error) {
      console.error('Error updating wallet balance:', error);
      // Fallback to localStorage
      const updated = wallets.map(w => 
        w.id === walletId ? { ...w, balance: w.balance + balanceChange } : w
      );
      setWallets(updated);
      localStorage.setItem('wallets', JSON.stringify(updated));
    }
  };

  // Create Global wallet with total balance from all transactions
  const globalWallet: Wallet = {
    id: 'global',
    name: 'Global',
    color: '#6366f1',
    icon: 'Globe',
    balance: transactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0),
    created_at: new Date().toISOString()
  };

  const walletsWithGlobal = [globalWallet, ...wallets];

  return {
    wallets: walletsWithGlobal,
    loading,
    addWallet,
    updateWalletBalance,
    refreshWallets: loadWallets
  };
}