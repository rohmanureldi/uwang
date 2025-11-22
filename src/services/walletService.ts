import { supabase } from '../lib/supabase';
import { Wallet } from '../types';
import { syncService } from './syncService';

export const walletService = {
  async getWallets(): Promise<Wallet[]> {
    // Always try localStorage first for offline support
    const localWallets = localStorage.getItem('wallets');
    
    if (!syncService.getStatus().isOnline || !supabase) {
      return localWallets ? JSON.parse(localWallets) : [];
    }
    
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Update localStorage with server data
      localStorage.setItem('wallets', JSON.stringify(data || []));
      return data || [];
    } catch (error) {
      console.error('Failed to fetch wallets from server, using local:', error);
      return localWallets ? JSON.parse(localWallets) : [];
    }
  },

  async createWallet(wallet: Omit<Wallet, 'id' | 'created_at' | 'balance'>): Promise<Wallet> {
    const newWallet: Wallet = {
      ...wallet,
      id: Date.now().toString(),
      balance: 0,
      created_at: new Date().toISOString()
    };

    // Always save to localStorage first
    const localWallets = JSON.parse(localStorage.getItem('wallets') || '[]');
    const updated = [...localWallets, newWallet];
    localStorage.setItem('wallets', JSON.stringify(updated));

    // Try to sync to server if online
    if (syncService.getStatus().isOnline && supabase) {
      try {
        const { data, error } = await supabase
          .from('wallets')
          .insert([{ ...wallet, balance: 0 }])
          .select()
          .single();
        
        if (error) throw error;
        
        // Update localStorage with server data
        const serverUpdated = updated.map(w => w.id === newWallet.id ? data : w);
        localStorage.setItem('wallets', JSON.stringify(serverUpdated));
        return data;
      } catch (error) {
        console.error('Failed to sync wallet, will sync later:', error);
        syncService.addPendingWallet(newWallet);
      }
    } else {
      syncService.addPendingWallet(newWallet);
    }
    
    return newWallet;
  },

  async updateWallet(id: string, updates: Partial<Wallet>): Promise<Wallet> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('wallets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteWallet(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { error } = await supabase
      .from('wallets')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};