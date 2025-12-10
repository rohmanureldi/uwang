import { Transaction } from '../types';
import { formatIDR } from '../utils/currency';
import { getCategoryIcon } from '../utils/categoryIcons';
import { DollarSign, Trash2, Search, Upload, TrendingUp, TrendingDown } from 'lucide-react';
import CSVImportModal from './CSVImportModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useTransactionListViewModel } from '../viewmodels/useTransactionListViewModel';
import { MOBILE_BREAKPOINT } from '../utils/constants';

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
  const viewModel = useTransactionListViewModel(transactions, selectedWallet);
  const { editing, filters, ui, newTransaction, filteredAndSortedTransactions, paginatedGroups, totalPages, categories, hasSearchResults, isSearching, actions } = viewModel;
  
  const viewMode = window.innerWidth < MOBILE_BREAKPOINT ? 'list' : 'table';

  const formatNumber = (value: string) => {
    const num = value.replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const exportToCSV = () => {
    const csvData = viewModel.filteredAndSortedTransactions.map(t => ({
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

  if (transactions.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 sm:p-8 shadow-lg border border-gray-700 text-center">
        <div className="text-gray-300 text-4xl sm:text-5xl mb-2 flex justify-center">
          <DollarSign className="w-12 h-12" />
        </div>
        <p className="text-gray-300 text-sm sm:text-base mb-4">Belum ada transaksi atau</p>
        <button
          onClick={() => actions.setUiState({ showImportModal: true })}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2 mx-auto"
        >
          <Upload className="w-4 h-4" />
          Import CSV
        </button>
        
        <CSVImportModal
          isOpen={ui.showImportModal}
          onClose={() => actions.setUiState({ showImportModal: false })}
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
          {onAddTransaction && (
            <button
              onClick={() => actions.setUiState({ isAddingNew: true })}
              className="px-3 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg text-sm transition-colors"
            >
              + Add Transaction
            </button>
          )}
          <button
            onClick={() => actions.setUiState({ showAdvancedFilters: !ui.showAdvancedFilters })}
            className="px-3 py-2 bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-lg text-sm transition-colors"
          >
            {ui.showAdvancedFilters ? 'Hide' : 'Show'} Filters
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
              value={filters.searchText}
              onChange={(e) => actions.updateFilters({ searchText: e.target.value })}
              className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm placeholder-gray-400"
            />
          </div>
          
          <div className="flex items-center bg-gray-800 border border-gray-600 rounded-lg overflow-hidden">
            <AnimatePresence mode="wait">
              {!ui.deleteMode ? (
              <motion.button
                key="delete-icon"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={actions.toggleDeleteMode}
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
                  onClick={() => actions.setUiState({ showBulkDeleteConfirm: true })}
                  disabled={ui.selectedTransactions.size === 0}
                  className="px-3 py-2 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
                >
                  Delete ({ui.selectedTransactions.size})
                </motion.button>
                <motion.button
                  key="cancel-button"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  onClick={actions.toggleDeleteMode}
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
              value={ui.pageSize}
              onChange={(e) => {
                actions.setUiState({ pageSize: Number(e.target.value), currentPage: 0 });
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
        {ui.showAdvancedFilters && (
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
                  value={filters.typeFilter}
                  onChange={(e) => {
                    actions.updateFilters({ typeFilter: e.target.value as 'all' | 'income' | 'expense', filterCategory: '' });
                  }}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
                
                <select
                  value={filters.filterCategory}
                  onChange={(e) => actions.updateFilters({ filterCategory: e.target.value })}
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
                  value={filters.dateFrom}
                  onChange={(e) => actions.updateFilters({ dateFrom: e.target.value })}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg text-sm"
                  style={{ colorScheme: 'dark' }}
                />
                <input
                  type="date"
                  placeholder="Date To"
                  value={filters.dateTo}
                  onChange={(e) => actions.updateFilters({ dateTo: e.target.value })}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg text-sm"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex gap-3">
                  {!isInSidebar && (
                    <>
                      <button
                        onClick={() => actions.setUiState({ showImportModal: true })}
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
                    onClick={() => actions.updateFilters({ sortOrder: filters.sortOrder === 'desc' ? 'asc' : 'desc' })}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    {filters.sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                  </button>
                </div>
                
                <button
                  onClick={() => {
                    actions.updateFilters({
                      searchText: '',
                      dateFrom: '',
                      dateTo: '',
                      filterCategory: '',
                      typeFilter: 'all'
                    });
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
            <p className="text-gray-300 text-sm">No transactions found for "{filters.searchText}"</p>
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
                        onClick={() => actions.setUiState({ deleteConfirmId: transaction.id })}
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
                  {ui.deleteMode && <th className="px-6 py-4 text-center text-gray-300 font-semibold text-xs uppercase tracking-wider">Select</th>}
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
                {Object.entries(paginatedGroups).map(([dateGroup, groupTransactions]) =>
                  groupTransactions.map((transaction, index) => (
                    <motion.tr
                      key={transaction.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`border-t border-gray-600/20 transition-all duration-200 ${
                        ui.deleteMode 
                          ? `cursor-pointer ${ui.selectedTransactions.has(transaction.id) ? 'bg-purple-600/20 border-purple-500/30' : 'hover:bg-gray-700/20'}` 
                          : 'hover:bg-gray-700/20 cursor-pointer'
                      }`}
                      onClick={ui.deleteMode ? () => {
                        const newSelected = new Set(ui.selectedTransactions);
                        if (ui.selectedTransactions.has(transaction.id)) {
                          newSelected.delete(transaction.id);
                        } else {
                          newSelected.add(transaction.id);
                        }
                        actions.setUiState({ selectedTransactions: newSelected });
                      } : () => {
                        actions.setUiState({ 
                          isEditing: true,
                          editingTransactionId: transaction.id
                        });
                        actions.updateNewTransaction({
                          amount: transaction.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                          description: transaction.description,
                          category: transaction.category,
                          subcategory: transaction.subcategory || '',
                          type: transaction.type,
                          date: transaction.date,
                          time: transaction.time || '',
                          wallet_id: transaction.wallet_id || ''
                        });
                      }}
                    >
                      {ui.deleteMode && (
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={ui.selectedTransactions.has(transaction.id)}
                            onChange={(e) => {
                              const newSelected = new Set(ui.selectedTransactions);
                              if (e.target.checked) {
                                newSelected.add(transaction.id);
                              } else {
                                newSelected.delete(transaction.id);
                              }
                              actions.setUiState({ selectedTransactions: newSelected });
                            }}
                            className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                          />
                        </td>
                      )}
                      <td className="px-4 py-3 text-center">
                        <div className={`p-1 rounded ${
                          transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {transaction.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="px-2 py-1 text-gray-300 rounded text-sm min-h-[24px]">
                          {new Date(transaction.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })} {transaction.time || ''}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="px-2 py-1 text-gray-100 rounded text-sm min-h-[24px]">
                          {transaction.description || (transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran')}
                        </div>
                      </td>
                      <td className="px-4 py-3 relative">
                        <div className="px-2 py-1 text-gray-300 rounded text-sm min-h-[24px] flex items-center gap-1">
                          {(() => {
                            const IconComponent = getCategoryIcon(transaction.category);
                            return <IconComponent className="w-4 h-4 text-purple-400" />;
                          })()}
                          <span>{transaction.category}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 relative">
                        <div className="px-2 py-1 text-gray-300 rounded text-sm min-h-[24px]">
                          {transaction.subcategory || '-'}
                        </div>
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
                        <div className={`px-2 py-1 rounded text-sm text-right font-medium min-h-[24px] ${
                          transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatIDR(Math.abs(transaction.amount))}
                        </div>
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
            onClick={() => actions.setUiState({ currentPage: ui.currentPage - 1 })}
            disabled={ui.currentPage === 0}
            className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-400">
            Page {ui.currentPage + 1} of {totalPages}
          </span>
          
          <button
            onClick={() => actions.setUiState({ currentPage: ui.currentPage + 1 })}
            disabled={ui.currentPage === totalPages - 1}
            className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Next
          </button>
        </div>
      )}

      {ui.deleteConfirmId && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(10px)' }}
          onClick={() => actions.setUiState({ deleteConfirmId: null })}
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
                  onDeleteTransaction(ui.deleteConfirmId!);
                  actions.setUiState({ deleteConfirmId: null });
                }}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Hapus
              </button>
              <button
                onClick={() => actions.setUiState({ deleteConfirmId: null })}
                className="flex-1 bg-slate-600 text-white py-2 rounded-lg font-medium hover:bg-slate-500 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {ui.showBulkDeleteConfirm && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(10px)' }}
          onClick={() => actions.setUiState({ showBulkDeleteConfirm: false })}
        >
          <div 
            className="bg-slate-700 rounded-xl p-6 border border-slate-600 shadow-2xl max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-gray-100 mb-4">Confirm Delete</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete {ui.selectedTransactions.size} transaction{ui.selectedTransactions.size > 1 ? 's' : ''}?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  ui.selectedTransactions.forEach(id => onDeleteTransaction(id));
                  actions.setUiState({ selectedTransactions: new Set(), deleteMode: false, showBulkDeleteConfirm: false });
                }}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => actions.setUiState({ showBulkDeleteConfirm: false })}
                className="flex-1 bg-slate-600 text-white py-2 rounded-lg font-medium hover:bg-slate-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <CSVImportModal
        isOpen={ui.showImportModal}
        onClose={() => actions.setUiState({ showImportModal: false })}
        onImport={(transactions, walletId) => {
          if (onImportTransactions) {
            onImportTransactions(transactions, walletId);
          }
        }}
        wallets={wallets}
      />

      {/* Add/Edit Transaction Modal */}
      {(ui.isAddingNew || ui.isEditing) && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(10px)' }}
          onClick={() => actions.setUiState({ isAddingNew: false })}
        >
          <div 
            className="bg-gray-800 rounded-xl p-6 border border-gray-600 shadow-2xl max-w-md mx-4 w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-gray-100 mb-4">{ui.isEditing ? 'Edit Transaction' : 'Add Transaction'}</h3>
            <div className="space-y-4">
              {/* Transaction Type */}
              <div className="flex gap-3">
                <button
                  onClick={() => actions.updateNewTransaction({ type: 'expense' })}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm transition-colors ${
                    newTransaction.type === 'expense' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  📉 Pengeluaran
                </button>
                <button
                  onClick={() => actions.updateNewTransaction({ type: 'income' })}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm transition-colors ${
                    newTransaction.type === 'income' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  📈 Pemasukan
                </button>
              </div>
              
              {/* Amount */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">💰</div>
                <input
                  type="text"
                  placeholder="Jumlah"
                  value={newTransaction.amount}
                  onChange={(e) => actions.updateNewTransaction({ amount: formatNumber(e.target.value) })}
                  className="w-full pl-10 pr-3 py-3 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg text-sm"
                />
              </div>
              
              {/* Category */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">🏷️</div>
                <input
                  type="text"
                  placeholder="Kategori"
                  value={newTransaction.category}
                  onChange={(e) => {
                    actions.updateNewTransaction({ category: e.target.value });
                    actions.setUiState({ showCategorySuggestions: true, selectedCategoryIndex: -1 });
                  }}
                  onFocus={() => actions.setUiState({ showCategorySuggestions: true })}
                  onBlur={() => setTimeout(() => actions.setUiState({ showCategorySuggestions: false }), 200)}
                  onKeyDown={(e) => {
                    const allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
                    const customCategories = JSON.parse(localStorage.getItem('customCategories') || '[]');
                    const defaultCategories = newTransaction.type === 'income' 
                      ? ['Gaji', 'Bonus', 'Freelance', 'Investasi', 'Bisnis', 'Hadiah']
                      : ['Makanan', 'Transportasi', 'Belanja', 'Tagihan', 'Kesehatan', 'Hiburan', 'Pendidikan', 'Rumah Tangga'];
                    const customCats = customCategories.filter((c: any) => c.type === newTransaction.type).map((c: any) => c.name);
                    const allCategories = [...defaultCategories, ...customCats];
                    const filteredCategories = allCategories.filter(cat => 
                      cat.toLowerCase().includes(newTransaction.category.toLowerCase())
                    ).slice(0, 5);
                    
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      actions.setUiState({ selectedCategoryIndex: ui.selectedCategoryIndex < filteredCategories.length - 1 ? ui.selectedCategoryIndex + 1 : ui.selectedCategoryIndex });
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      actions.setUiState({ selectedCategoryIndex: ui.selectedCategoryIndex > 0 ? ui.selectedCategoryIndex - 1 : -1 });
                    } else if (e.key === 'Enter' && ui.selectedCategoryIndex >= 0) {
                      e.preventDefault();
                      actions.updateNewTransaction({ category: filteredCategories[ui.selectedCategoryIndex] });
                      actions.setUiState({ showCategorySuggestions: false, selectedCategoryIndex: -1 });
                    }
                  }}
                  className="w-full pl-10 pr-3 py-3 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg text-sm"
                />
                {ui.showCategorySuggestions && (() => {
                  const allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
                  const customCategories = JSON.parse(localStorage.getItem('customCategories') || '[]');
                  const defaultCategories = newTransaction.type === 'income' 
                    ? ['Gaji', 'Bonus', 'Freelance', 'Investasi', 'Bisnis', 'Hadiah']
                    : ['Makanan', 'Transportasi', 'Belanja', 'Tagihan', 'Kesehatan', 'Hiburan', 'Pendidikan', 'Rumah Tangga'];
                  const customCats = customCategories.filter((c: any) => c.type === newTransaction.type).map((c: any) => c.name);
                  const allCategories = [...defaultCategories, ...customCats];
                  const filteredCategories = allCategories.filter(cat => 
                    cat.toLowerCase().includes(newTransaction.category.toLowerCase())
                  ).slice(0, 5);
                  
                  return filteredCategories.length > 0 ? (
                    <div className="absolute top-full left-0 right-0 bg-gray-700 border border-gray-600 rounded mt-1 max-h-32 overflow-y-auto z-20">
                      {filteredCategories.map((cat, index) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            actions.updateNewTransaction({ category: cat });
                            actions.setUiState({ showCategorySuggestions: false, selectedCategoryIndex: -1 });
                          }}
                          className={`w-full text-left px-3 py-2 text-gray-100 text-sm ${
                            index === ui.selectedCategoryIndex ? 'bg-purple-600' : 'hover:bg-gray-600'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  ) : null;
                })()}
              </div>
              
              {/* Subcategory */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">🔖</div>
                <input
                  type="text"
                  placeholder="Subkategori (Opsional)"
                  value={newTransaction.subcategory}
                  onChange={(e) => {
                    actions.updateNewTransaction({ subcategory: e.target.value });
                    actions.setUiState({ showSubcategorySuggestions: true, selectedSubcategoryIndex: -1 });
                  }}
                  onFocus={() => actions.setUiState({ showSubcategorySuggestions: true })}
                  onBlur={() => setTimeout(() => actions.setUiState({ showSubcategorySuggestions: false }), 200)}
                  onKeyDown={(e) => {
                    const allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
                    const existingSubcategories = [...new Set(allTransactions.map((t: any) => t.subcategory).filter(Boolean))]
                      .filter(sub => sub.toLowerCase().includes(newTransaction.subcategory.toLowerCase()))
                      .slice(0, 5);
                    
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      actions.setUiState({ selectedSubcategoryIndex: ui.selectedSubcategoryIndex < existingSubcategories.length - 1 ? ui.selectedSubcategoryIndex + 1 : ui.selectedSubcategoryIndex });
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      actions.setUiState({ selectedSubcategoryIndex: ui.selectedSubcategoryIndex > 0 ? ui.selectedSubcategoryIndex - 1 : -1 });
                    } else if (e.key === 'Enter' && ui.selectedSubcategoryIndex >= 0) {
                      e.preventDefault();
                      actions.updateNewTransaction({ subcategory: existingSubcategories[ui.selectedSubcategoryIndex] });
                      actions.setUiState({ showSubcategorySuggestions: false, selectedSubcategoryIndex: -1 });
                    }
                  }}
                  className="w-full pl-10 pr-3 py-3 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg text-sm"
                />
                {ui.showSubcategorySuggestions && (() => {
                  const allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
                  const existingSubcategories = [...new Set(allTransactions.map((t: any) => t.subcategory).filter(Boolean))]
                    .filter(sub => sub.toLowerCase().includes(newTransaction.subcategory.toLowerCase()))
                    .slice(0, 5);
                  
                  return existingSubcategories.length > 0 ? (
                    <div className="absolute top-full left-0 right-0 bg-gray-700 border border-gray-600 rounded mt-1 max-h-32 overflow-y-auto z-20">
                      {existingSubcategories.map((sub, index) => (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => {
                            actions.updateNewTransaction({ subcategory: sub });
                            actions.setUiState({ showSubcategorySuggestions: false, selectedSubcategoryIndex: -1 });
                          }}
                          className={`w-full text-left px-3 py-2 text-gray-100 text-sm ${
                            index === ui.selectedSubcategoryIndex ? 'bg-purple-600' : 'hover:bg-gray-600'
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  ) : null;
                })()}
              </div>
              
              {/* Description */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📝</div>
                <input
                  type="text"
                  placeholder="Deskripsi"
                  value={newTransaction.description}
                  onChange={(e) => actions.updateNewTransaction({ description: e.target.value })}
                  className="w-full pl-10 pr-3 py-3 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg text-sm"
                />
              </div>
              
              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📅</div>
                  <input
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) => actions.updateNewTransaction({ date: e.target.value })}
                    className="w-full pl-10 pr-3 py-3 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg text-sm"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🕐</div>
                  <input
                    type="time"
                    value={newTransaction.time}
                    onChange={(e) => actions.updateNewTransaction({ time: e.target.value })}
                    className="w-full pl-10 pr-3 py-3 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg text-sm"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>
              
              {/* Wallet Selection */}
              {selectedWallet === 'global' && (
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">💳</div>
                  <select
                    value={newTransaction.wallet_id || ''}
                    onChange={(e) => actions.updateNewTransaction({ wallet_id: e.target.value })}
                    className="w-full pl-10 pr-3 py-3 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg text-sm"
                  >
                    <option value="">Pilih Wallet</option>
                    {wallets.filter(wallet => wallet.id !== 'global').map(wallet => (
                      <option key={wallet.id} value={wallet.id}>{wallet.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  if (newTransaction.amount && newTransaction.category) {
                    const amount = parseFloat(newTransaction.amount.replace(/\./g, ''));
                    const transactionData = {
                      ...newTransaction,
                      amount,
                      description: newTransaction.description || (newTransaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'),
                      wallet_id: selectedWallet === 'global' ? newTransaction.wallet_id : selectedWallet
                    };
                    
                    if (ui.isEditing && ui.editingTransactionId) {
                      onEditTransaction(ui.editingTransactionId, transactionData);
                    } else if (onAddTransaction) {
                      onAddTransaction(transactionData);
                    }
                    
                    actions.setUiState({ isAddingNew: false, isEditing: false, editingTransactionId: null });
                    actions.updateNewTransaction({
                      amount: '',
                      description: '',
                      category: '',
                      subcategory: '',
                      type: 'expense',
                      date: new Date().toISOString().split('T')[0],
                      time: new Date().toTimeString().slice(0, 5),
                      wallet_id: ''
                    });
                  }
                }}
                disabled={!newTransaction.amount || !newTransaction.category}
                className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ✨ {ui.isEditing ? 'Update Transaksi' : 'Tambah Transaksi'}
              </button>
              <button
                onClick={() => actions.setUiState({ isAddingNew: false, isEditing: false, editingTransactionId: null })}
                className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
}