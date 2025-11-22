import { supabase } from '../lib/supabase';
import { Wallet } from '../types';

export const walletService = {
  async getWallets(): Promise<Wallet[]> {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async createWallet(wallet: Omit<Wallet, 'id' | 'created_at' | 'balance'>): Promise<Wallet> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const { data, error } = await supabase
      .from('wallets')
      .insert([{ ...wallet, balance: 0 }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
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