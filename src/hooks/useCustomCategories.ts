import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface CustomCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
}

export function useCustomCategories() {
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [useLocalStorage, setUseLocalStorage] = useState(false);

  useEffect(() => {
    loadCustomCategories();
  }, []);

  const loadCustomCategories = async () => {
    try {
      if (!supabase) {
        throw new Error('Supabase not configured');
      }

      const { data, error } = await supabase
        .from('custom_categories')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setCustomCategories(data || []);
    } catch (error) {
      console.warn('Supabase failed for custom categories, using localStorage:', error);
      setUseLocalStorage(true);
      
      // Fallback to localStorage
      const saved = localStorage.getItem('customCategories');
      if (saved) {
        setCustomCategories(JSON.parse(saved));
      }
    } finally {
      setLoading(false);
    }
  };

  const addCustomCategory = async (type: 'income' | 'expense', name: string) => {
    if (useLocalStorage || !supabase) {
      const newCategory: CustomCategory = {
        id: Date.now().toString(),
        name,
        type
      };
      const updated = [...customCategories, newCategory];
      setCustomCategories(updated);
      localStorage.setItem('customCategories', JSON.stringify(updated));
      return;
    }

    try {
      const { data, error } = await supabase
        .from('custom_categories')
        .insert([{ name, type }])
        .select()
        .single();

      if (error) throw error;
      setCustomCategories(prev => [...prev, data]);
    } catch (error) {
      console.error('Error adding custom category:', error);
      // Fallback to localStorage
      const newCategory: CustomCategory = {
        id: Date.now().toString(),
        name,
        type
      };
      const updated = [...customCategories, newCategory];
      setCustomCategories(updated);
      localStorage.setItem('customCategories', JSON.stringify(updated));
    }
  };

  const deleteCustomCategory = async (id: string) => {
    if (useLocalStorage || !supabase) {
      const updated = customCategories.filter(c => c.id !== id);
      setCustomCategories(updated);
      localStorage.setItem('customCategories', JSON.stringify(updated));
      return;
    }

    try {
      const { error } = await supabase
        .from('custom_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCustomCategories(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting custom category:', error);
    }
  };

  const resetCustomCategories = async () => {
    if (useLocalStorage || !supabase) {
      setCustomCategories([]);
      localStorage.removeItem('customCategories');
      return;
    }

    try {
      const { error } = await supabase
        .from('custom_categories')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) throw error;
      setCustomCategories([]);
    } catch (error) {
      console.error('Error resetting custom categories:', error);
      // Fallback to localStorage reset
      setCustomCategories([]);
      localStorage.removeItem('customCategories');
    }
  };

  return {
    customCategories,
    loading,
    addCustomCategory,
    deleteCustomCategory,
    resetCustomCategories
  };
}