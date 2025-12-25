import { Transaction } from '../types';
import { formatIDR } from '../utils/currency';
import { getCategoryIcon } from '../utils/categoryIcons';
import { DollarSign, Trash2, Upload, Search } from 'lucide-react';
import CSVImportModal from './CSVImportModal';
import TransactionModal from './TransactionModal';
import TransactionTable from './TransactionTable';
import { motion, AnimatePresence } from 'framer-motion';
import { useTransactionListViewModel } from '../viewmodels/useTransactionListViewModel';
import { MOBILE_BREAKPOINT } from '../utils/constants';
import { styles } from '../styles/transactionList.styles';
import { Button, SearchInput, EmptyState, Pagination, ConfirmDialog } from './ui';

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

export default function TransactionList({ transactions, onEditTransaction, onDeleteTransaction, onAddTransaction, onImportTransactions, wallets = [], isInSidebar = false, selectedWallet = '' }: Props) {
  const viewModel = useTransactionListViewModel(transactions, selectedWallet);
  const { filters, ui, newTransaction, paginatedGroups, totalPages, categories, hasSearchResults, isSearching, hasPendingTransactions, actions } = viewModel;
  
  const viewMode = window.innerWidth < MOBILE_BREAKPOINT ? 'list' : 'table';

  const handleEditTransaction = (transaction: Transaction) => {
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
  };

  const handleSaveTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    if (ui.isEditing && ui.editingTransactionId) {
      onEditTransaction(ui.editingTransactionId, transactionData);
      actions.setUiState({ isAddingNew: false, isEditing: false, editingTransactionId: null });
    } else if (onAddTransaction) {
      onAddTransaction(transactionData);
      actions.setUiState({ isAddingNew: false });
    }
    
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
  };

  const handleAddMoreTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    actions.addToPending(transactionData);
  };

  const handleSubmitAllPending = () => {
    if (onAddTransaction) {
      actions.submitAllPending(onAddTransaction);
    }
  };

  const exportToCSV = () => {
    const csvData = transactions.map(t => ({
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
      <>
        <EmptyState
          icon={<DollarSign className="w-12 h-12" />}
          title="Belum ada transaksi atau"
          action={
            <Button
              onClick={() => actions.setUiState({ showImportModal: true })}
              variant="blue"
              className="mx-auto flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Import CSV
            </Button>
          }
        />
        
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
      </>
    );
  }

  return (
    <motion.div 
      layout
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={styles.container}
    >
      <div className={styles.header}>
        <h3 className={styles.title}>Transactions</h3>
        <div className="flex items-center gap-3">
          {onAddTransaction && (
            <Button
              onClick={() => actions.setUiState({ isAddingNew: true })}
              variant="primary"
            >
              + Add Transaction
            </Button>
          )}
          <Button
            onClick={() => actions.setUiState({ showAdvancedFilters: !ui.showAdvancedFilters })}
            variant="secondary"
          >
            {ui.showAdvancedFilters ? 'Hide' : 'Show'} Filters
          </Button>
        </div>
      </div>
      
      <div className="flex justify-between items-center gap-2 mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-1/2">
            <SearchInput
              value={filters.searchText}
              onChange={(value) => actions.updateFilters({ searchText: value })}
              placeholder="Search transactions..."
            />
          </div>
          
          <div className="flex items-center bg-gray-800 border border-gray-600 rounded-lg overflow-hidden">
            <AnimatePresence mode="wait">
              {!ui.deleteMode ? (
              <motion.div
                key="delete-icon"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={actions.toggleDeleteMode}
                  variant="danger"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            ) : (
              <>
                <motion.div
                  key="delete-text"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    onClick={() => actions.setUiState({ showBulkDeleteConfirm: true })}
                    disabled={ui.selectedTransactions.size === 0}
                    variant="danger"
                  >
                    Delete ({ui.selectedTransactions.size})
                  </Button>
                </motion.div>
                <motion.div
                  key="cancel-button"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                >
                  <Button
                    onClick={actions.toggleDeleteMode}
                    variant="secondary"
                    className="border-l border-gray-600"
                  >
                    Cancel
                  </Button>
                </motion.div>
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
              className={styles.input.select}
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
            className={styles.filters.container}
          >
            <div className={styles.filters.content}>
              
              <div className={styles.filters.grid}>
                <select
                  value={filters.typeFilter}
                  onChange={(e) => {
                    actions.updateFilters({ typeFilter: e.target.value as 'all' | 'income' | 'expense', filterCategory: '' });
                  }}
                  className={styles.input.select}
                >
                  <option value="all">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
                
                <select
                  value={filters.filterCategory}
                  onChange={(e) => actions.updateFilters({ filterCategory: e.target.value })}
                  className={styles.input.select}
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div className={styles.filters.grid}>
                <input
                  type="date"
                  placeholder="Date From"
                  value={filters.dateFrom}
                  onChange={(e) => actions.updateFilters({ dateFrom: e.target.value })}
                  className={styles.input.date}
                  style={{ colorScheme: 'dark' }}
                />
                <input
                  type="date"
                  placeholder="Date To"
                  value={filters.dateTo}
                  onChange={(e) => actions.updateFilters({ dateTo: e.target.value })}
                  className={styles.input.date}
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              
              <div className={styles.filters.actions}>
                <div className="flex gap-3">
                  {!isInSidebar && (
                    <>
                      <Button
                        onClick={() => actions.setUiState({ showImportModal: true })}
                        variant="blue"
                        className="flex items-center gap-1"
                      >
                        <Upload className="w-4 h-4" />
                        Import CSV
                      </Button>
                      <Button
                        onClick={exportToCSV}
                        variant="success"
                      >
                        Export CSV
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={() => actions.updateFilters({ sortOrder: filters.sortOrder === 'desc' ? 'asc' : 'desc' })}
                    variant="gray"
                  >
                    {filters.sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                  </Button>
                </div>
                
                <Button
                  onClick={() => {
                    actions.updateFilters({
                      searchText: '',
                      dateFrom: '',
                      dateTo: '',
                      filterCategory: '',
                      typeFilter: 'all'
                    });
                  }}
                  variant="danger"
                >
                  Clear All
                </Button>
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
          <div className={styles.list.container}>
            {Object.entries(paginatedGroups).map(([dateGroup, groupTransactions], index) => (
            <div key={dateGroup}>
              {index > 0 && <div className="border-t border-slate-600 mb-4"></div>}
              <h4 className={`${styles.list.dateHeader} ${
                isInSidebar ? 'text-sm' : 'text-base'
              }`}>{dateGroup}</h4>
              <div className="space-y-3">
                {groupTransactions.map((transaction) => (
            <div key={transaction.id} className={styles.list.item}>
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
          <TransactionTable
            paginatedGroups={paginatedGroups}
            ui={ui}
            actions={actions}
            selectedWallet={selectedWallet}
            wallets={wallets}
            onEditTransaction={handleEditTransaction}
          />
        )}
      </div>

      <Pagination
        currentPage={ui.currentPage}
        totalPages={totalPages}
        onPageChange={(page) => actions.setUiState({ currentPage: page })}
      />

      <ConfirmDialog
        isOpen={!!ui.deleteConfirmId}
        onClose={() => actions.setUiState({ deleteConfirmId: null })}
        onConfirm={() => {
          onDeleteTransaction(ui.deleteConfirmId!);
          actions.setUiState({ deleteConfirmId: null });
        }}
        title="Konfirmasi Hapus"
        message="Yakin ingin menghapus transaksi ini?"
        confirmText="Hapus"
        cancelText="Batal"
      />

      <ConfirmDialog
        isOpen={ui.showBulkDeleteConfirm}
        onClose={() => actions.setUiState({ showBulkDeleteConfirm: false })}
        onConfirm={() => {
          ui.selectedTransactions.forEach(id => onDeleteTransaction(id));
          actions.setUiState({ selectedTransactions: new Set(), deleteMode: false, showBulkDeleteConfirm: false });
        }}
        title="Confirm Delete"
        message={`Are you sure you want to delete ${ui.selectedTransactions.size} transaction${ui.selectedTransactions.size > 1 ? 's' : ''}?`}
        confirmText="Delete"
        cancelText="Cancel"
      />

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

      <TransactionModal
        isOpen={ui.isAddingNew || ui.isEditing}
        isEditing={ui.isEditing}
        newTransaction={newTransaction}
        selectedWallet={selectedWallet}
        wallets={wallets}
        ui={ui}
        actions={{
          ...actions,
          submitAllPending: handleSubmitAllPending
        }}
        onSave={handleSaveTransaction}
        onAddMore={handleAddMoreTransaction}
        onClose={() => {
          actions.clearPending();
          actions.setUiState({ isAddingNew: false, isEditing: false, editingTransactionId: null });
        }}
      />

    </motion.div>
  );
}