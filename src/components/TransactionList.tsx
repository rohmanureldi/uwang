import { useState, useMemo, useEffect } from 'react';
import { Transaction } from '../types';
import { formatIDR } from '../utils/currency';
import { getCategoryIcon } from '../utils/categoryIcons';
import { DollarSign, Edit, Trash2, Search, Upload, TrendingUp, TrendingDown } from 'lucide-react';
import CategoryModal from './CategoryModal';
import CSVImportModal from './CSVImportModal';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  transactions: Transaction[];
  onEditTransaction: (id: string, transaction: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  onAddTransaction?: (transaction: Omit<Transaction, 'id'>) => void;
  onImportTransactions?: (transactions: Omit<Transaction, 'id'>[], walletId: string) => void;
  wallets?: Array<{ id: string; name: string; color?: string; icon?: string; }>;
  isInSidebar?: boolean;
  selectedWallet?: string;
}

export default function TransactionList({ transactions, onEditTransaction, onDeleteTransaction, onAddTransaction, onImportTransactions, wallets = [], isInSidebar = false, selectedWallet }: Props) {
  const [editingCell, setEditingCell] = useState<{id: string, field: string} | null>(null);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(-1);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    description: '',
    category: '',
    subcategory: '',
    type: 'expense' as 'income' | 'expense',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    wallet_id: ''
  });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategorySuggestions, setShowSubcategorySuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [showDescriptionSuggestions, setShowDescriptionSuggestions] = useState(false);
  const [selectedDescriptionIndex, setSelectedDescriptionIndex] = useState(-1);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [viewMode] = useState<'list' | 'table'>(() => {
    return window.innerWidth < 768 ? 'list' : 'table';
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [pageSize, setPageSize] = useState(2);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editForm, setEditForm] = useState({
    amount: '',
    description: '',
    category: '',
    subcategory: '',
    type: 'expense' as 'income' | 'expense',
    date: '',
    time: ''
  });

  const startCellEdit = (id: string, field: string) => {
    setEditingCell({id, field});
    if (id !== 'new') {
      const transaction = transactions.find(t => t.id === id);
      if (transaction) {
        setEditForm({
          amount: transaction.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
          description: transaction.description,
          category: transaction.category,
          subcategory: transaction.subcategory || '',
          type: transaction.type,
          date: transaction.date,
          time: transaction.time || ''
        });
      }
    }
  };

  const saveCellEdit = (id: string, field: string) => {
    if (id === 'new') {
      // Save new transaction
      if (!newTransaction.amount || !newTransaction.category || !newTransaction.description) {
        setErrorMessage('Please fill in amount, description, and category');
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }
      
      const transactionData = {
        amount: parseFloat(newTransaction.amount.replace(/\./g, '')),
        description: newTransaction.description,
        category: newTransaction.category,
        subcategory: newTransaction.subcategory || undefined,
        type: newTransaction.type,
        date: newTransaction.date,
        time: newTransaction.time,
        wallet_id: selectedWallet === 'global' ? (newTransaction.wallet_id || undefined) : selectedWallet
      };
      
      if (onAddTransaction) {
        onAddTransaction(transactionData);
        setNewTransaction({
          amount: '',
          description: '',
          category: '',
          subcategory: '',
          type: 'expense',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().slice(0, 5),
          wallet_id: ''
        });
        setIsAddingNew(false);
      }
    } else {
      // Save existing transaction edit
      const transaction = transactions.find(t => t.id === id);
      if (transaction) {
        const updatedData = {
          amount: field === 'amount' ? parseFloat(editForm.amount.replace(/\./g, '')) : transaction.amount,
          description: field === 'description' ? editForm.description : transaction.description,
          category: field === 'category' ? editForm.category : transaction.category,
          subcategory: field === 'subcategory' ? (editForm.subcategory || undefined) : transaction.subcategory,
          type: field === 'type' ? editForm.type : transaction.type,
          date: (field === 'date' || field === 'datetime') ? editForm.date : transaction.date,
          time: (field === 'time' || field === 'datetime') ? editForm.time : (transaction.time || '')
        };
        
        onEditTransaction(id, updatedData);
      }
    }
    setEditingCell(null);
  };

  const addNewTransaction = () => {
    if (!newTransaction.amount || !newTransaction.category || !newTransaction.description) {
      setErrorMessage('Please fill in amount, description, and category');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    
    const transactionData = {
      amount: parseFloat(newTransaction.amount.replace(/\./g, '')),
      description: newTransaction.description,
      category: newTransaction.category,
      subcategory: newTransaction.subcategory || undefined,
      type: newTransaction.type,
      date: newTransaction.date,
      time: newTransaction.time,
      wallet_id: selectedWallet === 'global' ? (newTransaction.wallet_id || undefined) : selectedWallet
    };
    
    if (onAddTransaction) {
      onAddTransaction(transactionData);
      setNewTransaction({
        amount: '',
        description: '',
        category: '',
        subcategory: '',
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        wallet_id: ''
      });
      setIsAddingNew(false);
    }
  };

  const formatNumber = (value: string) => {
    const num = value.replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleEditAmountChange = (value: string) => {
    const formatted = formatNumber(value);
    setEditForm({...editForm, amount: formatted});
  };



  const exportToCSV = () => {
    const csvData = filteredAndSortedTransactions.map(t => ({
      Date: t.date,
      Time: t.time || '',
      Type: t.type === 'income' ? 'Income' : 'Expense',
      Amount: t.amount,
      Category: t.category,
      Description: t.description,
      Subcategory: t.subcategory || ''
    }));

    const headers = ['Date', 'Time', 'Type', 'Amount', 'Category', 'Description', 'Subcategory'];
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => `"${row[header as keyof typeof row]}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAndSortedTransactions = transactions
    .filter(t => {
      // Transaction type filter
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      
      // Category filter
      if (filterCategory && t.category !== filterCategory) return false;
      
      // Text search
      if (debouncedSearchText && !t.description.toLowerCase().includes(debouncedSearchText.toLowerCase()) && 
          !t.category.toLowerCase().includes(debouncedSearchText.toLowerCase())) return false;
      
      // Date range filter
      if (dateFrom && t.date < dateFrom) return false;
      if (dateTo && t.date > dateTo) return false;
      

      
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time || '00:00'}`);
      const dateB = new Date(`${b.date} ${b.time || '00:00'}`);
      return sortOrder === 'desc' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
    });

  // Check if search has no results
  const hasSearchResults = filteredAndSortedTransactions.length > 0;
  const isSearching = debouncedSearchText.trim() !== '';

  // Group transactions by date and paginate by 2 days per page
  const { paginatedGroups, totalPages, uniqueDates } = useMemo(() => {
    const grouped = filteredAndSortedTransactions.reduce((groups, transaction) => {
      const date = new Date(transaction.date);
      const key = `${date.getDate()} ${date.toLocaleDateString('id-ID', { month: 'long' })}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(transaction);
      return groups;
    }, {} as Record<string, typeof transactions>);

    const dates = Object.keys(grouped);
    const totalPages = Math.ceil(dates.length / pageSize);
    
    // Get days for current page based on page size
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    const currentDates = dates.slice(startIndex, endIndex);
    
    const paginatedGroups = currentDates.reduce((acc, date) => {
      acc[date] = grouped[date];
      return acc;
    }, {} as Record<string, typeof transactions>);

    return { paginatedGroups, totalPages, uniqueDates: dates };
  }, [filteredAndSortedTransactions, currentPage]);

  // Filter categories based on transaction type
  const filteredTransactionsForCategories = typeFilter === 'all' 
    ? transactions 
    : transactions.filter(t => t.type === typeFilter);
    
  const categories = [...new Set(filteredTransactionsForCategories.map(t => t.category))];
  
  const categoryCount = filteredTransactionsForCategories.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (transactions.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 sm:p-8 shadow-lg border border-gray-700 text-center">
        <div className="text-gray-300 text-4xl sm:text-5xl mb-2 flex justify-center">
          <DollarSign className="w-12 h-12" />
        </div>
        <p className="text-gray-300 text-sm sm:text-base mb-4">Belum ada transaksi atau</p>
        <button
          onClick={() => setShowImportModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2 mx-auto"
        >
          <Upload className="w-4 h-4" />
          Import CSV
        </button>
        
        <CSVImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={(transactions, walletId) => {
            if (onImportTransactions) {
              onImportTransactions(transactions, walletId);
            }
          }}
          wallets={wallets}
        />
      </div>
    );
  }

  return (
    <motion.div 
      layout
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-gray-900 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-700"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-100 text-lg">Transactions</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="px-3 py-2 bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-lg text-sm transition-colors"
          >
            {showAdvancedFilters ? 'Hide' : 'Show'} Filters
          </button>
        </div>
      </div>
      
      <div className="flex justify-between items-center gap-2 mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-1/2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm placeholder-gray-400"
            />
          </div>
          
          <div className="flex items-center bg-gray-800 border border-gray-600 rounded-lg overflow-hidden">
            <AnimatePresence mode="wait">
              {!deleteMode ? (
              <motion.button
                key="delete-icon"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => setDeleteMode(true)}
                className="px-3 py-2 bg-red-600 text-white hover:bg-red-700 text-sm transition-colors rounded-lg"
                whileTap={{ scale: 0.95 }}
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            ) : (
              <>
                <motion.button
                  key="delete-text"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setShowBulkDeleteConfirm(true)}
                  disabled={selectedTransactions.size === 0}
                  className="px-3 py-2 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
                >
                  Delete ({selectedTransactions.size})
                </motion.button>
                <motion.button
                  key="cancel-button"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  onClick={() => {
                    setDeleteMode(false);
                    setSelectedTransactions(new Set());
                  }}
                  className="px-3 py-2 text-gray-300 hover:bg-gray-700 text-sm transition-colors border-l border-gray-600"
                >
                  Cancel
                </motion.button>
              </>
            )}
            </AnimatePresence>
          </div>
        </div>
        {!isInSidebar && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400 text-sm">Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(0);
              }}
              className="bg-gray-800 border border-gray-600 text-gray-100 rounded px-3 py-2 text-sm"
            >
              <option value={1}>1 day</option>
              <option value={2}>2 days</option>
              <option value={3}>3 days</option>
              <option value={5}>5 days</option>
              <option value={7}>1 week</option>
            </select>
          </div>
        )}
      </div>
      
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="mb-4 overflow-hidden"
          >
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-600 space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value as 'all' | 'income' | 'expense');
                    setFilterCategory('');
                  }}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
                
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="date"
                  placeholder="Date From"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg text-sm"
                  style={{ colorScheme: 'dark' }}
                />
                <input
                  type="date"
                  placeholder="Date To"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg text-sm"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex gap-3">
                  {!isInSidebar && (
                    <>
                      <button
                        onClick={() => setShowImportModal(true)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-1"
                      >
                        <Upload className="w-4 h-4" />
                        Import CSV
                      </button>
                      <button
                        onClick={exportToCSV}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        Export CSV
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                  </button>
                </div>
                
                <button
                  onClick={() => {
                    setSearchText('');
                    setDateFrom('');
                    setDateTo('');
                    setFilterCategory('');
                    setTypeFilter('all');
                  }}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Clear All
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div>
        {isSearching && !hasSearchResults ? (
          <div className="text-center py-8">
            <div className="text-gray-300 text-4xl mb-2 flex justify-center">
              <Search className="w-12 h-12" />
            </div>
            <p className="text-gray-300 text-sm">No transactions found for "{debouncedSearchText}"</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-6">
            {Object.entries(paginatedGroups).map(([dateGroup, groupTransactions], index) => (
            <div key={dateGroup}>
              {index > 0 && <div className="border-t border-slate-600 mb-4"></div>}
              <h4 className={`font-semibold text-gray-100 mb-3 bg-slate-600 px-3 py-2 rounded-lg transition-all ${
                isInSidebar ? 'text-sm' : 'text-base'
              }`}>{dateGroup}</h4>
              <div className="space-y-3">
                {groupTransactions.map((transaction, txIndex) => (
            <div key={transaction.id} className="border-b border-slate-600 last:border-b-0 pb-3 last:pb-0 transition-all hover:bg-opacity-30 rounded-lg px-2 py-1">
              {false ? (
                <div className="space-y-3">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="income"
                        checked={editForm.type === 'income'}
                        onChange={(e) => setEditForm({...editForm, type: e.target.value as 'income', category: ''})}
                      />
                      <span className="text-sm text-green-400">Pemasukan</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="expense"
                        checked={editForm.type === 'expense'}
                        onChange={(e) => setEditForm({...editForm, type: e.target.value as 'expense', category: ''})}
                      />
                      <span className="text-sm text-red-400">Pengeluaran</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={editForm.amount}
                      onChange={(e) => handleEditAmountChange(e.target.value)}
                      className="px-3 py-2 border border-slate-500 bg-slate-600 text-gray-100 rounded text-sm placeholder-gray-400"
                      placeholder="Jumlah"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCategoryModal(true)}
                      className="px-3 py-2 border border-slate-500 bg-slate-600 text-gray-100 rounded text-sm text-left hover:bg-slate-500"
                    >
                      {editForm.category || 'Pilih Kategori'}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={editForm.description}
                      onChange={(e) => {
                        setEditForm({...editForm, description: e.target.value});
                        setSelectedDescriptionIndex(-1);
                      }}
                      onFocus={() => setShowDescriptionSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowDescriptionSuggestions(false), 200)}
                      onKeyDown={(e) => {
                        const descriptionMap = new Map();
                        transactions.forEach(t => {
                          if (t.description && t.description.toLowerCase().includes(editForm.description.toLowerCase())) {
                            descriptionMap.set(t.description, t.created_at || t.date);
                          }
                        });
                        const existingDescriptions = Array.from(descriptionMap.entries())
                          .sort((a, b) => new Date(b[1]).getTime() - new Date(a[1]).getTime())
                          .map(([description]) => description)
                          .slice(0, 5);
                        
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          setSelectedDescriptionIndex(prev => prev < existingDescriptions.length - 1 ? prev + 1 : prev);
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          setSelectedDescriptionIndex(prev => prev > 0 ? prev - 1 : -1);
                        } else if (e.key === 'Enter' && selectedDescriptionIndex >= 0) {
                          e.preventDefault();
                          setEditForm({...editForm, description: existingDescriptions[selectedDescriptionIndex]});
                          setShowDescriptionSuggestions(false);
                          setSelectedDescriptionIndex(-1);
                        } else if (e.key === 'Escape') {
                          setShowDescriptionSuggestions(false);
                          setSelectedDescriptionIndex(-1);
                        }
                      }}
                      className="w-full px-3 py-2 border border-slate-500 bg-slate-600 text-gray-100 rounded text-sm placeholder-gray-400"
                      placeholder="Deskripsi"
                    />
                    {showDescriptionSuggestions && (() => {
                      const descriptionMap = new Map();
                      transactions.forEach(t => {
                        if (t.description && t.description.toLowerCase().includes(editForm.description.toLowerCase())) {
                          descriptionMap.set(t.description, t.created_at || t.date);
                        }
                      });
                      const existingDescriptions = Array.from(descriptionMap.entries())
                        .sort((a, b) => new Date(b[1]).getTime() - new Date(a[1]).getTime())
                        .map(([description]) => description)
                        .slice(0, 5);
                      
                      return existingDescriptions.length > 0 ? (
                        <div className="absolute top-full left-0 right-0 bg-slate-700 border border-slate-500 rounded mt-1 max-h-32 overflow-y-auto z-10">
                          {existingDescriptions.map((desc, index) => (
                            <button
                              key={desc}
                              type="button"
                              onClick={() => {
                                setEditForm({...editForm, description: desc});
                                setShowDescriptionSuggestions(false);
                                setSelectedDescriptionIndex(-1);
                              }}
                              className={`w-full text-left px-3 py-2 text-gray-100 text-sm ${
                                index === selectedDescriptionIndex ? 'bg-purple-600' : 'hover:bg-slate-600'
                              }`}
                            >
                              {desc}
                            </button>
                          ))}
                        </div>
                      ) : null;
                    })()}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={editForm.subcategory}
                      onChange={(e) => {
                        setEditForm({...editForm, subcategory: e.target.value});
                        setSelectedSuggestionIndex(-1);
                      }}
                      onFocus={() => setShowSubcategorySuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSubcategorySuggestions(false), 200)}
                      onKeyDown={(e) => {
                        const subcategoryMap = new Map();
                        transactions.forEach(t => {
                          if (t.subcategory && t.subcategory.toLowerCase().includes(editForm.subcategory.toLowerCase())) {
                            subcategoryMap.set(t.subcategory, t.created_at || t.date);
                          }
                        });
                        const existingSubcategories = Array.from(subcategoryMap.entries())
                          .sort((a, b) => new Date(b[1]).getTime() - new Date(a[1]).getTime())
                          .map(([subcategory]) => subcategory)
                          .slice(0, 5);
                        
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          setSelectedSuggestionIndex(prev => prev < existingSubcategories.length - 1 ? prev + 1 : prev);
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
                        } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
                          e.preventDefault();
                          setEditForm({...editForm, subcategory: existingSubcategories[selectedSuggestionIndex]});
                          setShowSubcategorySuggestions(false);
                          setSelectedSuggestionIndex(-1);
                        } else if (e.key === 'Escape') {
                          setShowSubcategorySuggestions(false);
                          setSelectedSuggestionIndex(-1);
                        }
                      }}
                      className="w-full px-3 py-2 border border-slate-500 bg-slate-600 text-gray-100 rounded text-sm placeholder-gray-400"
                      placeholder="Subkategori (Opsional)"
                    />
                    {showSubcategorySuggestions && (() => {
                      const subcategoryMap = new Map();
                      transactions.forEach(t => {
                        if (t.subcategory && t.subcategory.toLowerCase().includes(editForm.subcategory.toLowerCase())) {
                          subcategoryMap.set(t.subcategory, t.created_at || t.date);
                        }
                      });
                      const existingSubcategories = Array.from(subcategoryMap.entries())
                        .sort((a, b) => new Date(b[1]).getTime() - new Date(a[1]).getTime())
                        .map(([subcategory]) => subcategory)
                        .slice(0, 5);
                      
                      return existingSubcategories.length > 0 ? (
                        <div className="absolute top-full left-0 right-0 bg-slate-700 border border-slate-500 rounded mt-1 max-h-32 overflow-y-auto z-10">
                          {existingSubcategories.map((sub, index) => (
                            <button
                              key={sub}
                              type="button"
                              onClick={() => {
                                setEditForm({...editForm, subcategory: sub});
                                setShowSubcategorySuggestions(false);
                                setSelectedSuggestionIndex(-1);
                              }}
                              className={`w-full text-left px-3 py-2 text-gray-100 text-sm ${
                                index === selectedSuggestionIndex ? 'bg-purple-600' : 'hover:bg-slate-600'
                              }`}
                            >
                              {sub}
                            </button>
                          ))}
                        </div>
                      ) : null;
                    })()}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={editForm.date}
                      onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                      className="px-3 py-2 border border-slate-500 bg-slate-600 text-gray-100 rounded text-sm cursor-pointer"
                      style={{ colorScheme: 'dark', WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                      onFocus={(e) => e.target.showPicker?.()}
                    />
                    <input
                      type="time"
                      value={editForm.time}
                      onChange={(e) => setEditForm({...editForm, time: e.target.value})}
                      className="px-3 py-2 border border-slate-500 bg-slate-600 text-gray-100 rounded text-sm cursor-pointer"
                      style={{ colorScheme: 'dark', WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                      onFocus={(e) => e.target.showPicker?.()}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {}}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Simpan
                    </button>
                    <button
                      onClick={() => {}}
                      className="px-3 py-1 bg-slate-500 text-white rounded text-sm hover:bg-slate-400"
                    >
                      Batal
                    </button>
                  </div>
                  
                  {errorMessage && (
                    <div className="mt-2 p-2 bg-red-600 bg-opacity-20 border border-red-600 text-red-400 rounded text-sm animate-fadeIn">
                      {errorMessage}
                    </div>
                  )}
                </div>
              ) : (
                <div className={`flex items-center justify-between ${isInSidebar ? 'gap-2' : 'gap-4'}`}>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-gray-100 truncate ${
                      isInSidebar ? 'text-xs' : 'text-sm sm:text-base'
                    }`}>{transaction.description || (transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran')}</p>
                    <div className={`text-gray-400 space-y-1 ${
                      isInSidebar ? 'text-xs' : 'text-xs sm:text-sm'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          {(() => {
                            const IconComponent = getCategoryIcon(transaction.category);
                            return <IconComponent className="w-3 h-3 text-purple-400" />;
                          })()}
                          <span className={isInSidebar ? 'truncate max-w-16' : ''}>{transaction.category}</span>
                        </span>
                        {transaction.time && !isInSidebar && <span>• {transaction.time}</span>}
                      </div>
                      {selectedWallet === 'global' && transaction.wallet_id && (
                        <div className="flex items-center gap-1">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: wallets.find(w => w.id === transaction.wallet_id)?.color || '#8b5cf6' }}
                          />
                          <span className="text-xs text-gray-500">
                            {wallets.find(w => w.id === transaction.wallet_id)?.name || 'Unknown'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={`font-semibold whitespace-nowrap ${
                      transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                    } ${isInSidebar ? 'text-xs' : 'text-sm sm:text-base'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatIDR(Math.abs(transaction.amount))}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setDeleteConfirmId(transaction.id)}
                        className={`text-red-400 hover:bg-gray-800 rounded ${
                          isInSidebar ? 'p-0.5 text-xs' : 'p-1'
                        }`}
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
                ))}
              </div>
            </div>
          ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-gray-800/30 rounded-xl overflow-hidden border border-gray-700/30">
              <thead className="bg-gray-700/20">
                <tr>
                  {deleteMode && <th className="px-6 py-4 text-center text-gray-300 font-semibold text-xs uppercase tracking-wider">Select</th>}
                  <th className="px-6 py-4 text-center text-gray-300 font-semibold text-xs uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-gray-300 font-semibold text-xs uppercase tracking-wider w-40">Date & Time</th>
                  <th className="px-6 py-4 text-left text-gray-300 font-semibold text-xs uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-left text-gray-300 font-semibold text-xs uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-gray-300 font-semibold text-xs uppercase tracking-wider">Subcategory</th>
                  {selectedWallet === 'global' && <th className="px-6 py-4 text-left text-gray-300 font-semibold text-xs uppercase tracking-wider min-w-[140px]">Wallet</th>}
                  <th className="px-6 py-4 text-right text-gray-300 font-semibold text-xs uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody>
                {/* Add New Row */}
                {!deleteMode && (!isAddingNew ? (
                  <tr className="border-t border-gray-600 bg-gray-750">
                    <td colSpan={selectedWallet === 'global' ? 7 : 6} className="px-4 py-3 text-center">
                      <button
                        onClick={() => setIsAddingNew(true)}
                        className="text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded px-4 py-2 text-sm transition-colors"
                      >
                        + Add new transaction
                      </button>
                    </td>
                  </tr>
                ) : (
                  <><tr className="border-t border-gray-600 bg-gray-750">
                          {deleteMode && <td className="px-4 py-3"></td>}
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => setNewTransaction({ ...newTransaction, type: newTransaction.type === 'income' ? 'expense' : 'income' })}
                              className={`p-1 rounded transition-colors ${newTransaction.type === 'income' ? 'text-green-400 hover:bg-green-400/20' : 'text-red-400 hover:bg-red-400/20'}`}
                              title={newTransaction.type === 'income' ? 'Income' : 'Expense'}
                            >
                              {newTransaction.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="datetime-local"
                              value={`${newTransaction.date}T${newTransaction.time}`}
                              onChange={(e) => {
                                const [date, time] = e.target.value.split('T');
                                setNewTransaction({ ...newTransaction, date, time });
                              }}
                              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 text-gray-100 rounded text-sm" />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={newTransaction.description}
                              onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 text-gray-100 rounded text-sm"
                              placeholder="Description" />
                          </td>
                          <td className="px-4 py-3 relative">
                            <input
                              type="text"
                              value={newTransaction.category}
                              onChange={(e) => {
                                setNewTransaction({ ...newTransaction, category: e.target.value });
                                setSelectedCategoryIndex(-1);
                              } }
                              onFocus={() => setShowCategorySuggestions(true)}
                              onBlur={() => setTimeout(() => setShowCategorySuggestions(false), 200)}
                              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 text-gray-100 rounded text-sm"
                              placeholder="Category" />
                            {showCategorySuggestions && (() => {
                              const existingCategories = [...new Set(transactions.map(t => t.category))]
                                .filter(cat => cat.toLowerCase().includes(newTransaction.category.toLowerCase()))
                                .slice(0, 5);

                              return existingCategories.length > 0 ? (
                                <div className="absolute top-full left-0 right-0 bg-gray-700 border border-gray-600 rounded mt-1 max-h-32 overflow-y-auto z-20">
                                  {existingCategories.map((cat, index) => (
                                    <button
                                      key={cat}
                                      type="button"
                                      onClick={() => {
                                        setNewTransaction({ ...newTransaction, category: cat });
                                        setShowCategorySuggestions(false);
                                      } }
                                      className={`w-full text-left px-3 py-2 text-gray-100 text-sm hover:bg-gray-600`}
                                    >
                                      {cat}
                                    </button>
                                  ))}
                                </div>
                              ) : null;
                            })()}
                          </td>
                          <td className="px-4 py-3 relative">
                            <input
                              type="text"
                              value={newTransaction.subcategory}
                              onChange={(e) => {
                                setNewTransaction({ ...newTransaction, subcategory: e.target.value });
                                setSelectedSuggestionIndex(-1);
                              } }
                              onFocus={() => setShowSubcategorySuggestions(true)}
                              onBlur={() => setTimeout(() => setShowSubcategorySuggestions(false), 200)}
                              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 text-gray-100 rounded text-sm"
                              placeholder="Subcategory" />
                            {showSubcategorySuggestions && (() => {
                              const existingSubcategories = [...new Set(transactions.map(t => t.subcategory).filter(Boolean))]
                                .filter(sub => sub!.toLowerCase().includes(newTransaction.subcategory.toLowerCase()))
                                .slice(0, 5);

                              return existingSubcategories.length > 0 ? (
                                <div className="absolute top-full left-0 right-0 bg-gray-700 border border-gray-600 rounded mt-1 max-h-32 overflow-y-auto z-20">
                                  {existingSubcategories.map((sub, index) => (
                                    <button
                                      key={sub}
                                      type="button"
                                      onClick={() => {
                                        setNewTransaction({ ...newTransaction, subcategory: sub! });
                                        setShowSubcategorySuggestions(false);
                                      } }
                                      className={`w-full text-left px-3 py-2 text-gray-100 text-sm hover:bg-gray-600`}
                                    >
                                      {sub}
                                    </button>
                                  ))}
                                </div>
                              ) : null;
                            })()}
                          </td>
                          {selectedWallet === 'global' && (
                            <td className="px-4 py-3">
                              <select
                                value={newTransaction.wallet_id || ''}
                                onChange={(e) => setNewTransaction({ ...newTransaction, wallet_id: e.target.value })}
                                className="w-full px-2 py-1 bg-gray-700 border border-gray-600 text-gray-100 rounded text-sm truncate"
                              >
                                <option value="">Select Wallet</option>
                                {wallets.filter(wallet => wallet.id !== 'global').map(wallet => (
                                  <option key={wallet.id} value={wallet.id}>{wallet.name}</option>
                                ))}
                              </select>
                            </td>
                          )}
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={newTransaction.amount}
                              onChange={(e) => setNewTransaction({ ...newTransaction, amount: formatNumber(e.target.value) })}
                              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 text-gray-100 rounded text-sm text-right"
                              placeholder="Amount" />
                          </td>
                        </tr>
                          {/* Add/Cancel buttons for new transaction */}
                          <tr className="border-t border-gray-600 bg-gray-750">
                            <td colSpan={deleteMode ? (selectedWallet === 'global' ? 8 : 7) : (selectedWallet === 'global' ? 7 : 6)} className="px-4 py-3 text-center">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={addNewTransaction}
                                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                                  disabled={!newTransaction.amount || !newTransaction.category || !newTransaction.description}
                                >
                                  Add Transaction
                                </button>
                                <button
                                  onClick={() => {
                                    setIsAddingNew(false);
                                    setNewTransaction({
                                      amount: '',
                                      description: '',
                                      category: '',
                                      subcategory: '',
                                      type: 'expense',
                                      date: new Date().toISOString().split('T')[0],
                                      time: new Date().toTimeString().slice(0, 5),
                                      wallet_id: ''
                                    });
                                  } }
                                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </td>
                          </tr></>
                ))}
                
                {/* Existing Transactions */}
                {Object.entries(paginatedGroups).map(([dateGroup, groupTransactions]) =>
                  groupTransactions.map((transaction, index) => (
                    <motion.tr
                      key={transaction.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`border-t border-gray-600/20 transition-all duration-200 ${
                        deleteMode 
                          ? `cursor-pointer ${selectedTransactions.has(transaction.id) ? 'bg-purple-600/20 border-purple-500/30' : 'hover:bg-gray-700/20'}` 
                          : 'hover:bg-gray-700/20'
                      }`}
                      onClick={deleteMode ? () => {
                        const newSelected = new Set(selectedTransactions);
                        if (selectedTransactions.has(transaction.id)) {
                          newSelected.delete(transaction.id);
                        } else {
                          newSelected.add(transaction.id);
                        }
                        setSelectedTransactions(newSelected);
                      } : undefined}
                    >
                      {deleteMode && (
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedTransactions.has(transaction.id)}
                            onChange={(e) => {
                              const newSelected = new Set(selectedTransactions);
                              if (e.target.checked) {
                                newSelected.add(transaction.id);
                              } else {
                                newSelected.delete(transaction.id);
                              }
                              setSelectedTransactions(newSelected);
                            }}
                            className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                          />
                        </td>
                      )}
                      <td className="px-4 py-3 text-center">
                        {deleteMode ? (
                          <div className={`p-1 rounded ${
                            transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {transaction.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const newType = transaction.type === 'income' ? 'expense' : 'income';
                              setEditForm({...editForm, type: newType});
                              onEditTransaction(transaction.id, {
                                ...transaction,
                                type: newType
                              });
                            }}
                            className={`p-1 rounded cursor-pointer transition-colors ${
                              transaction.type === 'income' ? 'text-green-400 hover:bg-green-400/20' : 'text-red-400 hover:bg-red-400/20'
                            }`}
                            title={transaction.type === 'income' ? 'Income' : 'Expense'}
                          >
                            {transaction.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {!deleteMode && editingCell?.id === transaction.id && editingCell?.field === 'datetime' ? (
                          <input
                            type="datetime-local"
                            value={`${editForm.date}T${editForm.time}`}
                            onChange={(e) => {
                              const [date, time] = e.target.value.split('T');
                              setEditForm({...editForm, date, time});
                            }}
                            onBlur={() => saveCellEdit(transaction.id, 'datetime')}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 text-gray-100 rounded text-sm"
                            autoFocus
                          />
                        ) : (
                          <div
                            onClick={!deleteMode ? (e) => {
                              e.stopPropagation();
                              startCellEdit(transaction.id, 'datetime');
                            } : undefined}
                            className={`px-2 py-1 text-gray-300 rounded text-sm min-h-[24px] ${
                              !deleteMode ? 'hover:bg-gray-700 cursor-pointer' : ''
                            }`}
                          >
                            {new Date(transaction.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })} {transaction.time || ''}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {!deleteMode && editingCell?.id === transaction.id && editingCell?.field === 'description' ? (
                          <input
                            type="text"
                            value={editForm.description}
                            onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                            onBlur={() => saveCellEdit(transaction.id, 'description')}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 text-gray-100 rounded text-sm"
                            autoFocus
                          />
                        ) : (
                          <div
                            onClick={!deleteMode ? (e) => {
                              e.stopPropagation();
                              startCellEdit(transaction.id, 'description');
                            } : undefined}
                            className={`px-2 py-1 text-gray-100 rounded text-sm min-h-[24px] ${
                              !deleteMode ? 'hover:bg-gray-700 cursor-pointer' : ''
                            }`}
                          >
                            {transaction.description || (transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran')}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 relative">
                        {!deleteMode && editingCell?.id === transaction.id && editingCell?.field === 'category' ? (
                          <div className="relative">
                            <input
                              type="text"
                              value={editForm.category}
                              onChange={(e) => {
                                setEditForm({...editForm, category: e.target.value});
                                setSelectedCategoryIndex(-1);
                              }}
                              onFocus={() => setShowCategorySuggestions(true)}
                              onBlur={() => {
                                setTimeout(() => {
                                  setShowCategorySuggestions(false);
                                  saveCellEdit(transaction.id, 'category');
                                }, 200);
                              }}
                              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 text-gray-100 rounded text-sm"
                              autoFocus
                            />
                            {showCategorySuggestions && (() => {
                              const existingCategories = [...new Set(transactions.map(t => t.category))]
                                .filter(cat => cat.toLowerCase().includes(editForm.category.toLowerCase()))
                                .slice(0, 5);
                              
                              return existingCategories.length > 0 ? (
                                <div className="absolute top-full left-0 right-0 bg-gray-700 border border-gray-600 rounded mt-1 max-h-32 overflow-y-auto z-20">
                                  {existingCategories.map((cat, index) => (
                                    <button
                                      key={cat}
                                      type="button"
                                      onClick={() => {
                                        setEditForm({...editForm, category: cat});
                                        setShowCategorySuggestions(false);
                                        saveCellEdit(transaction.id, 'category');
                                      }}
                                      className={`w-full text-left px-3 py-2 text-gray-100 text-sm hover:bg-gray-600`}
                                    >
                                      {cat}
                                    </button>
                                  ))}
                                </div>
                              ) : null;
                            })()}
                          </div>
                        ) : (
                          <div
                            onClick={!deleteMode ? (e) => {
                              e.stopPropagation();
                              startCellEdit(transaction.id, 'category');
                            } : undefined}
                            className={`px-2 py-1 text-gray-300 rounded text-sm min-h-[24px] flex items-center gap-1 ${
                              !deleteMode ? 'hover:bg-gray-700 cursor-pointer' : ''
                            }`}
                          >
                            {(() => {
                              const IconComponent = getCategoryIcon(transaction.category);
                              return <IconComponent className="w-4 h-4 text-purple-400" />;
                            })()}
                            <span>{transaction.category}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 relative">
                        {!deleteMode && editingCell?.id === transaction.id && editingCell?.field === 'subcategory' ? (
                          <div className="relative">
                            <input
                              type="text"
                              value={editForm.subcategory}
                              onChange={(e) => {
                                setEditForm({...editForm, subcategory: e.target.value});
                                setSelectedSuggestionIndex(-1);
                              }}
                              onFocus={() => setShowSubcategorySuggestions(true)}
                              onBlur={() => {
                                setTimeout(() => {
                                  setShowSubcategorySuggestions(false);
                                  saveCellEdit(transaction.id, 'subcategory');
                                }, 200);
                              }}
                              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 text-gray-100 rounded text-sm"
                              autoFocus
                            />
                            {showSubcategorySuggestions && (() => {
                              const existingSubcategories = [...new Set(transactions.map(t => t.subcategory).filter(Boolean))]
                                .filter(sub => sub!.toLowerCase().includes(editForm.subcategory.toLowerCase()))
                                .slice(0, 5);
                              
                              return existingSubcategories.length > 0 ? (
                                <div className="absolute top-full left-0 right-0 bg-gray-700 border border-gray-600 rounded mt-1 max-h-32 overflow-y-auto z-20">
                                  {existingSubcategories.map((sub, index) => (
                                    <button
                                      key={sub}
                                      type="button"
                                      onClick={() => {
                                        setEditForm({...editForm, subcategory: sub!});
                                        setShowSubcategorySuggestions(false);
                                        saveCellEdit(transaction.id, 'subcategory');
                                      }}
                                      className={`w-full text-left px-3 py-2 text-gray-100 text-sm hover:bg-gray-600`}
                                    >
                                      {sub}
                                    </button>
                                  ))}
                                </div>
                              ) : null;
                            })()}
                          </div>
                        ) : (
                          <div
                            onClick={!deleteMode ? (e) => {
                              e.stopPropagation();
                              startCellEdit(transaction.id, 'subcategory');
                            } : undefined}
                            className={`px-2 py-1 text-gray-300 rounded text-sm min-h-[24px] ${
                              !deleteMode ? 'hover:bg-gray-700 cursor-pointer' : ''
                            }`}
                          >
                            {transaction.subcategory || '-'}
                          </div>
                        )}
                      </td>
                      {selectedWallet === 'global' && (
                        <td className="px-4 py-3 text-gray-300 text-sm">
                          {transaction.wallet_id && (
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: wallets.find(w => w.id === transaction.wallet_id)?.color || '#8b5cf6' }}
                              />
                              <span>{wallets.find(w => w.id === transaction.wallet_id)?.name || 'Unknown'}</span>
                            </div>
                          )}
                        </td>
                      )}
                      <td className="px-4 py-3">
                        {!deleteMode && editingCell?.id === transaction.id && editingCell?.field === 'amount' ? (
                          <input
                            type="text"
                            value={editForm.amount}
                            onChange={(e) => handleEditAmountChange(e.target.value)}
                            onBlur={() => saveCellEdit(transaction.id, 'amount')}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 text-gray-100 rounded text-sm text-right"
                            autoFocus
                          />
                        ) : (
                          <div
                            onClick={!deleteMode ? (e) => {
                              e.stopPropagation();
                              startCellEdit(transaction.id, 'amount');
                            } : undefined}
                            className={`px-2 py-1 rounded text-sm text-right font-medium min-h-[24px] ${
                              transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                            } ${!deleteMode ? 'hover:bg-gray-700 cursor-pointer' : ''}`}
                          >
                            {transaction.type === 'income' ? '+' : '-'}
                            {formatIDR(Math.abs(transaction.amount))}
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 0}
            className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-400">
            Page {currentPage + 1} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Next
          </button>
        </div>
      )}

      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSelect={(category) => setEditForm({...editForm, category})}
        type={editForm.type}
      />

      {deleteConfirmId && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(10px)' }}
          onClick={() => setDeleteConfirmId(null)}
        >
          <div 
            className="bg-slate-700 rounded-xl p-6 border border-slate-600 shadow-2xl max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-gray-100 mb-4">Konfirmasi Hapus</h3>
            <p className="text-gray-300 mb-6">Yakin ingin menghapus transaksi ini?</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  onDeleteTransaction(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Hapus
              </button>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 bg-slate-600 text-white py-2 rounded-lg font-medium hover:bg-slate-500 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {showBulkDeleteConfirm && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(10px)' }}
          onClick={() => setShowBulkDeleteConfirm(false)}
        >
          <div 
            className="bg-slate-700 rounded-xl p-6 border border-slate-600 shadow-2xl max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-gray-100 mb-4">Confirm Delete</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete {selectedTransactions.size} transaction{selectedTransactions.size > 1 ? 's' : ''}?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  selectedTransactions.forEach(id => onDeleteTransaction(id));
                  setSelectedTransactions(new Set());
                  setDeleteMode(false);
                  setShowBulkDeleteConfirm(false);
                }}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="flex-1 bg-slate-600 text-white py-2 rounded-lg font-medium hover:bg-slate-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <CSVImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={(transactions, walletId) => {
          if (onImportTransactions) {
            onImportTransactions(transactions, walletId);
          }
        }}
        wallets={wallets}
      />

    </motion.div>
  );
}