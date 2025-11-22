import { supabase } from '../lib/supabase';
import { Transaction, Wallet } from '../types';

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: string | null;
}

class SyncService {
  private syncStatus: SyncStatus = {
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSync: localStorage.getItem('lastSync')
  };

  private listeners: ((status: SyncStatus) => void)[] = [];

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }

  subscribe(callback: (status: SyncStatus) => void) {
    this.listeners.push(callback);
    callback(this.syncStatus);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.syncStatus));
  }

  private handleOnline() {
    this.syncStatus.isOnline = true;
    this.notifyListeners();
    this.syncData();
  }

  private handleOffline() {
    this.syncStatus.isOnline = false;
    this.notifyListeners();
  }

  async syncData() {
    if (!this.syncStatus.isOnline || !supabase || this.syncStatus.isSyncing) return;

    this.syncStatus.isSyncing = true;
    this.notifyListeners();

    try {
      await Promise.all([
        this.syncTransactions(),
        this.syncWallets(),
        this.syncCustomCategories(),
        this.syncDashboardSettings()
      ]);

      this.syncStatus.lastSync = new Date().toISOString();
      localStorage.setItem('lastSync', this.syncStatus.lastSync);
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.syncStatus.isSyncing = false;
      this.notifyListeners();
    }
  }

  private async syncTransactions() {
    const localTransactions: Transaction[] = JSON.parse(localStorage.getItem('transactions') || '[]');
    const pendingTransactions: Transaction[] = JSON.parse(localStorage.getItem('pendingTransactions') || '[]');

    // Upload pending transactions
    for (const transaction of pendingTransactions) {
      try {
        const { data, error } = await supabase!
          .from('transactions')
          .insert([transaction])
          .select()
          .single();

        if (error) throw error;

        // Update local storage with server ID
        const updatedTransactions = localTransactions.map(t => 
          t.id === transaction.id ? data : t
        );
        localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
      } catch (error) {
        console.error('Failed to sync transaction:', transaction.id, error);
      }
    }

    // Clear pending transactions
    localStorage.removeItem('pendingTransactions');

    // Download server transactions
    const { data: serverTransactions, error } = await supabase!
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && serverTransactions) {
      localStorage.setItem('transactions', JSON.stringify(serverTransactions));
    }
  }

  private async syncWallets() {
    const localWallets: Wallet[] = JSON.parse(localStorage.getItem('wallets') || '[]');
    const pendingWallets: Wallet[] = JSON.parse(localStorage.getItem('pendingWallets') || '[]');

    // Upload pending wallets
    for (const wallet of pendingWallets) {
      try {
        const { data, error } = await supabase!
          .from('wallets')
          .insert([{ name: wallet.name, color: wallet.color, icon: wallet.icon, balance: 0 }])
          .select()
          .single();

        if (error) throw error;

        // Update local storage with server data
        const updatedWallets = localWallets.map(w => 
          w.id === wallet.id ? data : w
        );
        localStorage.setItem('wallets', JSON.stringify(updatedWallets));
      } catch (error) {
        console.error('Failed to sync wallet:', wallet.id, error);
      }
    }

    // Clear pending wallets
    localStorage.removeItem('pendingWallets');

    // Download server wallets
    const { data: serverWallets, error } = await supabase!
      .from('wallets')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && serverWallets) {
      localStorage.setItem('wallets', JSON.stringify(serverWallets));
    }
  }

  private async syncCustomCategories() {
    const localCategories = JSON.parse(localStorage.getItem('customCategories') || '[]');
    const pendingCategories = JSON.parse(localStorage.getItem('pendingCustomCategories') || '[]');

    // Upload pending categories
    for (const category of pendingCategories) {
      try {
        await supabase!
          .from('custom_categories')
          .insert([category]);
      } catch (error) {
        console.error('Failed to sync category:', category.id, error);
      }
    }

    // Clear pending categories
    localStorage.removeItem('pendingCustomCategories');

    // Download server categories
    const { data: serverCategories, error } = await supabase!
      .from('custom_categories')
      .select('*');

    if (!error && serverCategories) {
      localStorage.setItem('customCategories', JSON.stringify(serverCategories));
    }
  }

  private async syncDashboardSettings() {
    const localSettings = localStorage.getItem('dashboardCards');
    
    if (localSettings) {
      try {
        const cards = JSON.parse(localSettings);
        
        // Try to get existing record
        const { data: existing } = await supabase!
          .from('dashboard_settings')
          .select('id')
          .limit(1)
          .single();

        if (existing) {
          await supabase!
            .from('dashboard_settings')
            .update({ cards })
            .eq('id', existing.id);
        } else {
          await supabase!
            .from('dashboard_settings')
            .insert({ cards });
        }
      } catch (error) {
        console.error('Failed to sync dashboard settings:', error);
      }
    }

    // Download server settings
    const { data: serverSettings } = await supabase!
      .from('dashboard_settings')
      .select('cards')
      .limit(1)
      .single();

    if (serverSettings?.cards) {
      localStorage.setItem('dashboardCards', JSON.stringify(serverSettings.cards));
    }
  }

  // Helper methods for offline operations
  addPendingTransaction(transaction: Transaction) {
    const pending = JSON.parse(localStorage.getItem('pendingTransactions') || '[]');
    pending.push(transaction);
    localStorage.setItem('pendingTransactions', JSON.stringify(pending));
  }

  addPendingWallet(wallet: Wallet) {
    const pending = JSON.parse(localStorage.getItem('pendingWallets') || '[]');
    pending.push(wallet);
    localStorage.setItem('pendingWallets', JSON.stringify(pending));
  }

  addPendingCustomCategory(category: any) {
    const pending = JSON.parse(localStorage.getItem('pendingCustomCategories') || '[]');
    pending.push(category);
    localStorage.setItem('pendingCustomCategories', JSON.stringify(pending));
  }

  getStatus() {
    return this.syncStatus;
  }
}

export const syncService = new SyncService();