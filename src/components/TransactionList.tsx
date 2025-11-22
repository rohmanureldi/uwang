import { useState, useMemo, useEffect } from 'react';
import { Transaction } from '../types';
import { formatIDR } from '../utils/currency';
import { getCategoryIcon } from '../utils/categoryIcons';
import { DollarSign, Edit, Trash2, Search, Upload } from 'lucide-react';
import CategoryModal from './CategoryModal';
import CSVImportModal from './CSVImportModal';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  transactions: Transaction[];
  onEditTransaction: (id: string, transaction: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  onImportTransactions?: (transactions: Omit<Transaction, 'id'>[], walletId: string) => void;
  wallets?: Array<{ id: string; name: string; color?: string; icon?: string; }>;
  isInSidebar?: boolean;
}

export default function TransactionList({ transactions, onEditTransaction, onDeleteTransaction, onImportTransactions, wallets = [], isInSidebar = false }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list');
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
    type: 'expense' as 'income' | 'expense',
    date: '',
    time: ''
  });

  const startEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setEditForm({
      amount: transaction.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
      description: transaction.description,
      category: transaction.category,
      type: transaction.type,
      date: transaction.date,
      time: transaction.time || ''
    });
  };

  const saveEdit = (id: string) => {
    if (!editForm.amount || !editForm.category) {
      if (!editForm.amount) {
        setErrorMessage('Masukkan jumlah terlebih dahulu');
      } else if (!editForm.category) {
        setErrorMessage('Pilih kategori terlebih dahulu');
      }
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    setErrorMessage('');

    onEditTransaction(id, {
      amount: parseFloat(editForm.amount.replace(/\./g, '')),
      description: editForm.description,
      category: editForm.category,
      type: editForm.type,
      date: editForm.date,
      time: editForm.time
    });
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
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
          {!isInSidebar && (
            <div className="bg-gray-800 rounded-lg p-1 border border-gray-600 flex">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded text-xs transition-all ${
                  viewMode === 'list' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded text-xs transition-all ${
                  viewMode === 'table' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                Table
              </button>
            </div>
          )}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="px-3 py-2 bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-lg text-sm transition-colors"
          >
            {showAdvancedFilters ? 'Hide' : 'Show'} Filters
          </button>
        </div>
      </div>
      
      <div className="flex justify-between items-center gap-2 mb-4">
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
              {editingId === transaction.id ? (
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
                  <input
                    type="text"
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-500 bg-slate-600 text-gray-100 rounded text-sm placeholder-gray-400"
                    placeholder="Deskripsi"
                  />
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
                      onClick={() => saveEdit(transaction.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Simpan
                    </button>
                    <button
                      onClick={cancelEdit}
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
                    <div className={`flex items-center gap-2 text-gray-400 ${
                      isInSidebar ? 'text-xs' : 'text-xs sm:text-sm'
                    }`}>
                      <span className="flex items-center gap-1">
                        {(() => {
                          const IconComponent = getCategoryIcon(transaction.category);
                          return <IconComponent className="w-3 h-3 text-purple-400" />;
                        })()}
                        <span className={isInSidebar ? 'truncate max-w-16' : ''}>{transaction.category}</span>
                      </span>
                      {transaction.time && !isInSidebar && <span>• {transaction.time}</span>}
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
                        onClick={() => startEdit(transaction)}
                        className={`text-purple-400 hover:bg-gray-800 rounded ${
                          isInSidebar ? 'p-0.5 text-xs' : 'p-1'
                        }`}
                        title="Edit"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
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
            <table className="w-full bg-gray-800 rounded-lg overflow-hidden">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-300 font-medium">Date</th>
                  <th className="px-4 py-3 text-left text-gray-300 font-medium">Description</th>
                  <th className="px-4 py-3 text-left text-gray-300 font-medium">Category</th>
                  <th className="px-4 py-3 text-right text-gray-300 font-medium">Amount</th>
                  <th className="px-4 py-3 text-center text-gray-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(paginatedGroups).map(([dateGroup, groupTransactions]) =>
                  groupTransactions.map((transaction, index) => (
                    <tr key={transaction.id} className="border-t border-gray-600 hover:bg-gray-700 transition-colors">
                      <td className="px-4 py-3 text-gray-300 text-sm">
                        <div>{new Date(transaction.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</div>
                        {transaction.time && <div className="text-xs text-gray-400">{transaction.time}</div>}
                      </td>
                      <td className="px-4 py-3 text-gray-100">
                        {transaction.description || (transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran')}
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-sm">
                        <div className="flex items-center gap-1">
                          {(() => {
                            const IconComponent = getCategoryIcon(transaction.category);
                            return <IconComponent className="w-4 h-4 text-purple-400" />;
                          })()}
                          <span>{transaction.category}</span>
                        </div>
                      </td>
                      <td className={`px-4 py-3 text-right font-medium ${
                        transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatIDR(Math.abs(transaction.amount))}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => startEdit(transaction)}
                            className="p-1 text-purple-400 hover:bg-gray-800 rounded"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(transaction.id)}
                            className="p-1 text-red-400 hover:bg-gray-800 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
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