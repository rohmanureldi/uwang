import { Transaction } from '../types';
import { styles } from '../styles/transactionList.styles';
import { Button, Input, Modal } from './ui';
import { Coffee, Car, Home, ShoppingBag, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatIDR } from '../utils/currency';

interface Props {
  isOpen: boolean;
  isEditing: boolean;
  newTransaction: {
    amount: string;
    description: string;
    category: string;
    subcategory: string;
    type: 'income' | 'expense';
    date: string;
    time: string;
    wallet_id: string;
  };
  selectedWallet: string;
  wallets: Array<{ id: string; name: string; }>;
  ui: {
    showCategorySuggestions: boolean;
    showSubcategorySuggestions: boolean;
    selectedCategoryIndex: number;
    selectedSubcategoryIndex: number;
    showQuickActions?: boolean;
    keepModalOpen?: boolean;
    pendingTransactions?: Array<Omit<Transaction, 'id'>>;
  };
  actions: {
    updateNewTransaction: (data: Partial<Props['newTransaction']>) => void;
    setUiState: (state: Partial<Props['ui']>) => void;
    addToPending?: (transaction: Omit<Transaction, 'id'>) => void;
    removeFromPending?: (index: number) => void;
    clearPending?: () => void;
    submitAllPending?: () => void;
  };
  onSave: (data: Omit<Transaction, 'id'>) => void;
  onAddMore?: (data: Omit<Transaction, 'id'>) => void;
  onClose: () => void;
}

export default function TransactionModal({ isOpen, isEditing, newTransaction, selectedWallet, wallets, ui, actions, onSave, onAddMore, onClose }: Props) {
  if (!isOpen) return null;

  const formatNumber = (value: string) => {
    const num = value.replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const getCategories = (type: 'income' | 'expense') => {
    const defaultCategories = type === 'income' 
      ? ['Gaji', 'Bonus', 'Freelance', 'Investasi', 'Bisnis', 'Hadiah']
      : ['Makanan', 'Transportasi', 'Belanja', 'Tagihan', 'Kesehatan', 'Hiburan', 'Pendidikan', 'Rumah Tangga'];
    const customCategories = JSON.parse(localStorage.getItem('customCategories') || '[]');
    const customCats = customCategories.filter((c: any) => c.type === type).map((c: any) => c.name);
    return [...defaultCategories, ...customCats];
  };

  const getSubcategories = () => {
    const allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    return [...new Set(allTransactions.map((t: any) => t.subcategory).filter(Boolean))];
  };

  const getQuickActions = () => {
    const allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const transactionCounts = new Map();
    
    allTransactions.forEach((t: any) => {
      const key = `${t.description}-${t.category}-${t.subcategory || ''}`;
      if (transactionCounts.has(key)) {
        transactionCounts.set(key, {
          ...transactionCounts.get(key),
          count: transactionCounts.get(key).count + 1,
          totalAmount: transactionCounts.get(key).totalAmount + t.amount
        });
      } else {
        transactionCounts.set(key, {
          description: t.description,
          category: t.category,
          subcategory: t.subcategory || '',
          count: 1,
          totalAmount: t.amount,
          type: t.type
        });
      }
    });
    
    const topTransactions = Array.from(transactionCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
      .map(t => ({
        icon: t.category === 'Food' || t.category === 'Makanan' ? Coffee : t.category === 'Transportation' || t.category === 'Transportasi' ? Car : t.category === 'Shopping' || t.category === 'Belanja' ? ShoppingBag : Home,
        label: t.description,
        amount: Math.round(t.totalAmount / t.count).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
        category: t.category,
        subcategory: t.subcategory,
        description: t.description
      }));
    
    return topTransactions.length > 0 ? topTransactions : [
      { icon: Coffee, label: 'Kopi', amount: '25.000', category: 'Makanan', subcategory: 'Kopi', description: 'Kopi' },
      { icon: Car, label: 'Transport', amount: '50.000', category: 'Transportasi', subcategory: 'Kantor', description: 'Transportasi' },
      { icon: Utensils, label: 'Makan', amount: '75.000', category: 'Makanan', subcategory: 'Meal', description: 'Makan' },
      { icon: ShoppingBag, label: 'Belanja', amount: '200.000', category: 'Belanja', subcategory: '', description: 'Belanja' },
    ];
  };

  const handleQuickAction = (action: ReturnType<typeof getQuickActions>[0]) => {
    actions.updateNewTransaction({
      amount: action.amount,
      category: action.category,
      subcategory: action.subcategory,
      description: action.description
    });
    actions.setUiState({ showQuickActions: false });
  };

  const createTransactionData = () => {
    if (!newTransaction.amount || !newTransaction.category) return null;
    
    const amount = parseFloat(newTransaction.amount.replace(/\./g, ''));
    return {
      ...newTransaction,
      amount,
      description: newTransaction.description || (newTransaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'),
      wallet_id: selectedWallet === 'global' ? newTransaction.wallet_id : selectedWallet
    };
  };

  const handleAdd = () => {
    const transactionData = createTransactionData();
    if (transactionData) {
      onSave(transactionData);
    }
  };

  const handleAddMore = () => {
    const transactionData = createTransactionData();
    if (transactionData && onAddMore) {
      onAddMore(transactionData);
    }
  };

  const handleClose = () => {
    const hasPending = ui.pendingTransactions && ui.pendingTransactions.length > 0;
    if (hasPending) {
      if (confirm(`You have ${ui.pendingTransactions?.length} pending transactions. Discard them?`)) {
        actions.clearPending?.();
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={
        <div className="flex items-center justify-between w-full">
          <span>{isEditing ? 'Edit Transaction' : 'Add Transaction'}</span>
          <button
            type="button"
            onClick={() => actions.setUiState({ showQuickActions: !ui.showQuickActions })}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              ui.showQuickActions ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Quick
          </button>
        </div>
      }
size={ui.pendingTransactions && ui.pendingTransactions.length > 0 ? 'xl' : 'md'}
    >
      <div className={`grid gap-6 ${ui.pendingTransactions && ui.pendingTransactions.length > 0 ? 'grid-cols-[1fr_320px]' : 'grid-cols-1'}`}>
        <div>
        <div className="space-y-4">
          {/* Quick Actions */}
          <AnimatePresence>
            {ui.showQuickActions && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-3 bg-gray-800 rounded-lg border border-gray-600"
              >
                <div className="text-xs font-medium text-gray-400 mb-2">Most Frequent Transactions</div>
                <div className="grid grid-cols-2 gap-2">
                  {getQuickActions().map((action, index) => {
                    const IconComponent = action.icon;
                    return (
                      <motion.button
                        key={`${action.description}-${index}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15, delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => handleQuickAction(action)}
                        className="flex flex-col items-center gap-1 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-xs"
                      >
                        <IconComponent className="w-4 h-4 text-purple-400" />
                        <span className="text-gray-300 truncate max-w-full">{action.label}</span>
                        <span className="text-gray-400 text-xs">{action.amount}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Transaction Type */}
          <div className="flex gap-3">
            <Button
              onClick={() => actions.updateNewTransaction({ type: 'expense' })}
              variant={newTransaction.type === 'expense' ? 'danger' : 'secondary'}
              className="flex-1 py-3"
            >
              📉 Pengeluaran
            </Button>
            <Button
              onClick={() => actions.updateNewTransaction({ type: 'income' })}
              variant={newTransaction.type === 'income' ? 'success' : 'secondary'}
              className="flex-1 py-3"
            >
              📈 Pemasukan
            </Button>
          </div>
          
          {/* Amount */}
          <Input
            type="text"
            placeholder="Jumlah"
            value={newTransaction.amount}
            onChange={(e) => actions.updateNewTransaction({ amount: formatNumber(e.target.value) })}
            icon="💰"
          />
          
          {/* Category */}
          <div className="relative">
            <Input
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
                const filteredCategories = getCategories(newTransaction.type)
                  .filter(cat => cat.toLowerCase().includes(newTransaction.category.toLowerCase()))
                  .slice(0, 5);
                
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
              icon="🏷️"
            />
            {ui.showCategorySuggestions && (() => {
              const filteredCategories = getCategories(newTransaction.type)
                .filter(cat => cat.toLowerCase().includes(newTransaction.category.toLowerCase()))
                .slice(0, 5);
              
              return filteredCategories.length > 0 ? (
                <div className={styles.form.suggestion.container}>
                  {filteredCategories.map((cat, index) => (
                    <Button
                      key={cat}
                      onClick={() => {
                        actions.updateNewTransaction({ category: cat });
                        actions.setUiState({ showCategorySuggestions: false, selectedCategoryIndex: -1 });
                      }}
                      variant={index === ui.selectedCategoryIndex ? 'primary' : 'secondary'}
                      className="w-full text-left justify-start"
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              ) : null;
            })()}
          </div>
          
          {/* Subcategory */}
          <div className="relative">
            <Input
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
                const filteredSubcategories = getSubcategories()
                  .filter(sub => sub.toLowerCase().includes(newTransaction.subcategory.toLowerCase()))
                  .slice(0, 5);
                
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  actions.setUiState({ selectedSubcategoryIndex: ui.selectedSubcategoryIndex < filteredSubcategories.length - 1 ? ui.selectedSubcategoryIndex + 1 : ui.selectedSubcategoryIndex });
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  actions.setUiState({ selectedSubcategoryIndex: ui.selectedSubcategoryIndex > 0 ? ui.selectedSubcategoryIndex - 1 : -1 });
                } else if (e.key === 'Enter' && ui.selectedSubcategoryIndex >= 0) {
                  e.preventDefault();
                  actions.updateNewTransaction({ subcategory: filteredSubcategories[ui.selectedSubcategoryIndex] });
                  actions.setUiState({ showSubcategorySuggestions: false, selectedSubcategoryIndex: -1 });
                }
              }}
              icon="🔖"
            />
            {ui.showSubcategorySuggestions && (() => {
              const filteredSubcategories = getSubcategories()
                .filter(sub => sub.toLowerCase().includes(newTransaction.subcategory.toLowerCase()))
                .slice(0, 5);
              
              return filteredSubcategories.length > 0 ? (
                <div className={styles.form.suggestion.container}>
                  {filteredSubcategories.map((sub, index) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => {
                        actions.updateNewTransaction({ subcategory: sub });
                        actions.setUiState({ showSubcategorySuggestions: false, selectedSubcategoryIndex: -1 });
                      }}
                      className={`${styles.form.suggestion.item} ${
                        index === ui.selectedSubcategoryIndex ? styles.form.suggestion.itemSelected : styles.form.suggestion.itemHover
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
          <Input
            type="text"
            placeholder="Deskripsi"
            value={newTransaction.description}
            onChange={(e) => actions.updateNewTransaction({ description: e.target.value })}
            icon="📝"
          />
          
          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="date"
              value={newTransaction.date}
              onChange={(e) => actions.updateNewTransaction({ date: e.target.value })}
              icon="📅"
              style={{ colorScheme: 'dark' }}
            />
            <Input
              type="time"
              value={newTransaction.time}
              onChange={(e) => actions.updateNewTransaction({ time: e.target.value })}
              icon="🕐"
              style={{ colorScheme: 'dark' }}
            />
          </div>
          
          {/* Wallet Selection */}
          {selectedWallet === 'global' && (
            <div className="relative">
              <div className={styles.icon.position}>💳</div>
              <select
                value={newTransaction.wallet_id || ''}
                onChange={(e) => actions.updateNewTransaction({ wallet_id: e.target.value })}
                className={styles.input.base}
              >
                <option value="">Pilih Wallet</option>
                {wallets.filter(wallet => wallet.id !== 'global').map(wallet => (
                  <option key={wallet.id} value={wallet.id}>{wallet.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        </div>
        
        {/* Pending Transactions Panel */}
        <AnimatePresence>
          {ui.pendingTransactions && ui.pendingTransactions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="border-l border-gray-600 pl-4"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-100 mb-2">Pending Transactions ({ui.pendingTransactions.length})</h3>
                <div className="max-h-96 overflow-y-auto space-y-3">
                  <AnimatePresence>
                    {ui.pendingTransactions.slice().reverse().map((transaction, index) => {
                      const walletName = wallets.find(w => w.id === transaction.wallet_id)?.name || 'Unknown';
                      return (
                        <motion.div
                          key={ui.pendingTransactions.length - 1 - index}
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="p-3 bg-gray-800 rounded-lg border border-gray-600 text-sm"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <div className="text-base font-medium text-gray-100">
                                  {formatIDR(transaction.amount)}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {walletName}
                                </div>
                              </div>
                              <div className="text-sm text-gray-300 mb-1">
                                {transaction.description || 'No description'}
                              </div>
                              <div className="text-xs text-gray-400">
                                {transaction.category}
                              </div>
                            </div>
                            <button
                              onClick={() => actions.removeFromPending?.(ui.pendingTransactions.length - 1 - index)}
                              className="ml-3 text-red-400 hover:text-red-300 p-1 transition-colors flex-shrink-0"
                            >
                              ×
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={() => actions.clearPending?.()}
                  variant="danger"
                  className="py-2 text-sm"
                >
                  Clear All
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
        
      <div className={`flex gap-3 mt-6 ${isEditing ? 'justify-center' : ''}`}>
        {!isEditing ? (
          <>
            <Button
              onClick={handleAdd}
              disabled={!newTransaction.amount || !newTransaction.category}
              variant="primary"
              className="flex-1 py-3 font-medium"
            >
              ✨ {ui.pendingTransactions && ui.pendingTransactions.length > 0 ? 'Submit' : 'Add'}
            </Button>
            <Button
              onClick={handleAddMore}
              disabled={!newTransaction.amount || !newTransaction.category}
              variant="secondary"
              className="flex-1 py-3 font-medium"
            >
              📝 Add More
            </Button>
          </>
        ) : (
          <Button
            onClick={handleAdd}
            disabled={!newTransaction.amount || !newTransaction.category}
            variant="primary"
            className="flex-1 py-3 font-medium"
          >
            ✨ Update Transaction
          </Button>
        )}
        <Button
          onClick={handleClose}
          variant="gray"
          className="flex-1 py-3 font-medium"
        >
          Close
        </Button>
      </div>
    </Modal>
  );
}