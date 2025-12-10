import { useState, useEffect, useMemo } from 'react';
import { Transaction } from '../types';

interface FilterState {
  searchText: string;
  debouncedSearchText: string;
  typeFilter: 'all' | 'income' | 'expense';
  filterCategory: string;
  dateFrom: string;
  dateTo: string;
  sortOrder: 'desc' | 'asc';
}

export function useTransactionFilters(transactions: Transaction[]) {
  const [filters, setFilters] = useState<FilterState>({
    searchText: '',
    debouncedSearchText: '',
    typeFilter: 'all',
    filterCategory: '',
    dateFrom: '',
    dateTo: '',
    sortOrder: 'desc'
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, debouncedSearchText: prev.searchText }));
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.searchText]);

  const filteredAndSortedTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        if (filters.typeFilter !== 'all' && t.type !== filters.typeFilter) return false;
        if (filters.filterCategory && t.category !== filters.filterCategory) return false;
        if (filters.debouncedSearchText && 
            !t.description.toLowerCase().includes(filters.debouncedSearchText.toLowerCase()) && 
            !t.category.toLowerCase().includes(filters.debouncedSearchText.toLowerCase())) return false;
        if (filters.dateFrom && t.date < filters.dateFrom) return false;
        if (filters.dateTo && t.date > filters.dateTo) return false;
        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time || '00:00'}`);
        const dateB = new Date(`${b.date} ${b.time || '00:00'}`);
        return filters.sortOrder === 'desc' 
          ? dateB.getTime() - dateA.getTime() 
          : dateA.getTime() - dateB.getTime();
      });
  }, [transactions, filters]);

  const categories = useMemo(() => {
    const filteredTransactions = filters.typeFilter === 'all' 
      ? transactions 
      : transactions.filter(t => t.type === filters.typeFilter);
    return [...new Set(filteredTransactions.map(t => t.category))];
  }, [transactions, filters.typeFilter]);

  const updateFilters = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      searchText: '',
      debouncedSearchText: '',
      typeFilter: 'all',
      filterCategory: '',
      dateFrom: '',
      dateTo: '',
      sortOrder: 'desc'
    });
  };

  return {
    filters,
    filteredAndSortedTransactions,
    categories,
    updateFilters,
    clearFilters,
    hasSearchResults: filteredAndSortedTransactions.length > 0,
    isSearching: filters.debouncedSearchText.trim() !== ''
  };
}