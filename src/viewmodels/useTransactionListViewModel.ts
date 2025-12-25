import { useState, useEffect, useMemo } from 'react';
import { Transaction } from '../types';
import { TransactionModel, ITransactionModel } from '../models/TransactionModel';
import { TransactionService, ITransactionService } from '../services/TransactionService';
import { DEFAULT_PAGE_SIZE, MAX_SUGGESTIONS, SUGGESTION_TIMEOUT, DEFAULT_TRANSACTION_TYPE } from '../utils/constants';
import { formatNumber, createDefaultTransaction, groupTransactionsByDate, paginateGroups } from '../utils/transactionUtils';

interface EditingState {
  editingCell: { id: string; field: string } | null;
  editForm: {
    amount: string;
    description: string;
    category: string;
    subcategory: string;
    type: 'income' | 'expense';
    date: string;
    time: string;
  };
}

interface FilterState {
  searchText: string;
  debouncedSearchText: string;
  typeFilter: 'all' | 'income' | 'expense';
  filterCategory: string;
  dateFrom: string;
  dateTo: string;
  sortOrder: 'desc' | 'asc';
}

export function useTransactionListViewModel(
  transactions: Transaction[],
  selectedWallet?: string,
  transactionModel: ITransactionModel = new TransactionModel(),
  transactionService: ITransactionService = new TransactionService()
) {
  // State
  const [editing, setEditing] = useState<EditingState>({
    editingCell: null,
    editForm: {
      amount: '',
      description: '',
      category: '',
      subcategory: '',
      type: DEFAULT_TRANSACTION_TYPE,
      date: '',
      time: ''
    }
  });

  const [filters, setFilters] = useState<FilterState>({
    searchText: '',
    debouncedSearchText: '',
    typeFilter: 'all',
    filterCategory: '',
    dateFrom: '',
    dateTo: '',
    sortOrder: 'desc'
  });

  const [ui, setUi] = useState({
    deleteMode: false,
    selectedTransactions: new Set<string>(),
    isAddingNew: false,
    showCategorySuggestions: false,
    showSubcategorySuggestions: false,
    showAdvancedFilters: false,
    showImportModal: false,
    showBulkDeleteConfirm: false,
    deleteConfirmId: null as string | null,
    currentPage: 0,
    pageSize: DEFAULT_PAGE_SIZE,
    errorMessage: '',
    selectedCategoryIndex: -1,
    selectedSubcategoryIndex: -1,
    isEditing: false,
    editingTransactionId: null as string | null,
    showQuickActions: false,
    keepModalOpen: false,
    pendingTransactions: [] as Array<Omit<Transaction, 'id'>>
  });

  const [newTransaction, setNewTransaction] = useState(createDefaultTransaction());

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, debouncedSearchText: prev.searchText }));
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.searchText]);

  // Filtered and sorted transactions
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

  // Pagination
  const { paginatedGroups, totalPages } = useMemo(() => {
    const grouped = groupTransactionsByDate(filteredAndSortedTransactions);
    return paginateGroups(grouped, ui.currentPage, ui.pageSize);
  }, [filteredAndSortedTransactions, ui.currentPage, ui.pageSize]);

  // Categories
  const categories = useMemo(() => {
    const filteredTransactions = filters.typeFilter === 'all' 
      ? transactions 
      : transactions.filter(t => t.type === filters.typeFilter);
    return [...new Set(filteredTransactions.map(t => t.category))];
  }, [transactions, filters.typeFilter]);

  // Actions
  const actions = {
    // Editing
    startCellEdit: (id: string, field: string) => {
      setEditing(prev => ({ ...prev, editingCell: { id, field } }));
      if (id !== 'new') {
        const transaction = transactions.find(t => t.id === id);
        if (transaction) {
          setEditing(prev => ({
            ...prev,
            editForm: {
              amount: transaction.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
              description: transaction.description,
              category: transaction.category,
              subcategory: transaction.subcategory || '',
              type: transaction.type,
              date: transaction.date,
              time: transaction.time || ''
            }
          }));
        }
      }
    },



    // Filters
    updateFilters: (newFilters: Partial<FilterState>) => {
      setFilters(prev => ({ ...prev, ...newFilters }));
    },

    clearFilters: () => {
      setFilters({
        searchText: '',
        debouncedSearchText: '',
        typeFilter: 'all',
        filterCategory: '',
        dateFrom: '',
        dateTo: '',
        sortOrder: 'desc'
      });
    },

    // Delete mode
    toggleDeleteMode: () => {
      setUi(prev => ({ 
        ...prev, 
        deleteMode: !prev.deleteMode,
        selectedTransactions: new Set()
      }));
    },

    toggleSelection: (id: string) => {
      setUi(prev => {
        const newSelected = new Set(prev.selectedTransactions);
        if (newSelected.has(id)) {
          newSelected.delete(id);
        } else {
          newSelected.add(id);
        }
        return { ...prev, selectedTransactions: newSelected };
      });
    },

    bulkDelete: async () => {
      for (const id of ui.selectedTransactions) {
        await transactionModel.deleteTransaction(id);
      }
      setUi(prev => ({ 
        ...prev, 
        deleteMode: false, 
        selectedTransactions: new Set(),
        showBulkDeleteConfirm: false
      }));
    },

    // UI actions
    setUiState: (updates: Partial<typeof ui>) => {
      setUi(prev => ({ ...prev, ...updates }));
    },

    setNewTransaction: (updates: Partial<typeof newTransaction>) => {
      setNewTransaction(prev => ({ ...prev, ...updates }));
    },

    updateEditForm: (updates: Partial<typeof editing.editForm>) => {
      setEditing(prev => ({ ...prev, editForm: { ...prev.editForm, ...updates } }));
    },

    updateNewTransaction: (updates: Partial<typeof newTransaction>) => {
      setNewTransaction(prev => ({ ...prev, ...updates }));
    },

    addNewTransaction: async (onAddTransaction?: (transaction: Omit<Transaction, 'id'>) => void) => {
      if (!transactionService.validateTransaction(newTransaction)) {
        setUi(prev => ({ ...prev, errorMessage: 'Please fill in amount, description, and category' }));
        setTimeout(() => setUi(prev => ({ ...prev, errorMessage: '' })), 3000);
        return;
      }
      
      const formattedData = transactionService.formatTransactionData(newTransaction, selectedWallet);
      if (onAddTransaction) {
        onAddTransaction(formattedData);
      }
      setNewTransaction(createDefaultTransaction());
      setUi(prev => ({ ...prev, isAddingNew: false }));
    },

    cancelNewTransaction: () => {
      setNewTransaction(createDefaultTransaction());
      setUi(prev => ({ ...prev, isAddingNew: false }));
    },

    saveCellEdit: async (id: string, field: string, onEditTransaction?: (id: string, transaction: Omit<Transaction, 'id'>) => void) => {
      const transaction = transactions.find(t => t.id === id);
      if (transaction && onEditTransaction) {
        let updatedValue: any = editing.editForm[field as keyof typeof editing.editForm];
        if (field === 'amount') {
          updatedValue = parseFloat(editing.editForm.amount.replace(/\./g, ''));
        } else if (field === 'datetime') {
          // Handle datetime field specially
          const updatedTransaction = {
            ...transaction,
            date: editing.editForm.date,
            time: editing.editForm.time
          };
          onEditTransaction(id, updatedTransaction);
          setEditing(prev => ({ ...prev, editingCell: null }));
          return;
        }
        
        const updatedTransaction = {
          ...transaction,
          [field]: updatedValue
        };
        onEditTransaction(id, updatedTransaction);
      }
      setEditing(prev => ({ ...prev, editingCell: null }));
    },

    handleEditAmountChange: (value: string) => {
      const formatted = formatNumber(value);
      setEditing(prev => ({ ...prev, editForm: { ...prev.editForm, amount: formatted } }));
    },

    // Pending transactions actions
    addToPending: (transaction: Omit<Transaction, 'id'>) => {
      setUi(prev => ({ 
        ...prev, 
        pendingTransactions: [...prev.pendingTransactions, transaction]
      }));
      setNewTransaction(createDefaultTransaction());
    },

    removeFromPending: (index: number) => {
      setUi(prev => ({ 
        ...prev, 
        pendingTransactions: prev.pendingTransactions.filter((_, i) => i !== index)
      }));
    },

    clearPending: () => {
      setUi(prev => ({ ...prev, pendingTransactions: [] }));
    },

    submitAllPending: async (onAddTransaction?: (transaction: Omit<Transaction, 'id'>) => void) => {
      if (onAddTransaction) {
        for (const transaction of ui.pendingTransactions) {
          onAddTransaction(transaction);
        }
      }
      setUi(prev => ({ ...prev, pendingTransactions: [], isAddingNew: false }));
      setNewTransaction(createDefaultTransaction());
    }
  };

  return {
    // State
    editing,
    filters,
    ui,
    newTransaction,
    
    // Computed
    filteredAndSortedTransactions,
    paginatedGroups,
    totalPages,
    categories,
    hasSearchResults: filteredAndSortedTransactions.length > 0,
    isSearching: filters.debouncedSearchText.trim() !== '',
    
    // Computed
    hasPendingTransactions: ui.pendingTransactions.length > 0,
    
    // Actions
    actions
  };
}