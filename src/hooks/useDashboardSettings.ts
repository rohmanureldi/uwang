import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DashboardCard } from '../components/DashboardCustomizer';

export function useDashboardSettings() {
  const [dashboardCards, setDashboardCards] = useState<DashboardCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [useLocalStorage, setUseLocalStorage] = useState(false);

  const defaultCards: DashboardCard[] = [
    { id: 'balance', name: 'Balance', icon: '💰', enabled: true },
    { id: 'chart', name: 'Chart', icon: '📊', enabled: true },
    { id: 'quickstats', name: 'Quick Stats', icon: '⚡', enabled: true },
    { id: 'categorycharts', name: 'Category Charts', icon: '📈', enabled: false },
    { id: 'health', name: 'Financial Health', icon: '🏥', enabled: false },
    { id: 'insights', name: 'Spending Insights', icon: '🔍', enabled: false },
    { id: 'trends', name: 'Spending Trends', icon: '📈', enabled: false },
    { id: 'budget', name: 'Budget Tracker', icon: '💰', enabled: false },
    { id: 'savings', name: 'Savings Goals', icon: '🎯', enabled: false },
    { id: 'form', name: 'Tambah Transaksi', icon: '➕', enabled: true },
    { id: 'list', name: 'Riwayat Transaksi', icon: '📝', enabled: true }
  ];

  useEffect(() => {
    loadDashboardSettings();
  }, []);

  const loadDashboardSettings = async () => {
    try {
      if (!supabase) {
        throw new Error('Supabase not configured');
      }

      const { data, error } = await supabase
        .from('dashboard_settings')
        .select('cards')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data?.cards) {
        setDashboardCards(data.cards);
      } else {
        setDashboardCards(defaultCards);
      }
    } catch (error) {
      console.warn('Supabase failed for dashboard settings, using localStorage:', error);
      setUseLocalStorage(true);
      
      // Fallback to localStorage
      const saved = localStorage.getItem('dashboardCards');
      if (saved) {
        const savedCards = JSON.parse(saved);
        const filteredCards = savedCards.filter((c: DashboardCard) => c.id !== 'breakdown');
        
        const hasForm = filteredCards.find((c: DashboardCard) => c.id === 'form');
        const hasList = filteredCards.find((c: DashboardCard) => c.id === 'list');
        const hasCategoryCharts = filteredCards.find((c: DashboardCard) => c.id === 'categorycharts');
        
        if (!hasForm) {
          filteredCards.push({ id: 'form', name: 'Tambah Transaksi', icon: '➕', enabled: true });
        }
        if (!hasList) {
          filteredCards.push({ id: 'list', name: 'Riwayat Transaksi', icon: '📝', enabled: true });
        }
        if (!hasCategoryCharts) {
          filteredCards.push({ id: 'categorycharts', name: 'Category Charts', icon: '📈', enabled: false });
        }
        
        setDashboardCards(filteredCards);
      } else {
        setDashboardCards(defaultCards);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveDashboardSettings = async (cards: DashboardCard[]) => {
    setDashboardCards(cards);

    if (useLocalStorage || !supabase) {
      localStorage.setItem('dashboardCards', JSON.stringify(cards));
      return;
    }

    try {
      // First try to get existing record
      const { data: existing } = await supabase
        .from('dashboard_settings')
        .select('id')
        .limit(1)
        .single();

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('dashboard_settings')
          .update({ cards, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('dashboard_settings')
          .insert({ cards });
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error saving dashboard settings:', error);
      // Fallback to localStorage
      localStorage.setItem('dashboardCards', JSON.stringify(cards));
    }
  };

  return {
    dashboardCards,
    loading,
    saveDashboardSettings
  };
}