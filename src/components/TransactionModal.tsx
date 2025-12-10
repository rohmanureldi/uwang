import { Transaction } from '../types';
import { styles } from '../styles/transactionList.styles';
import { Button, Input, Modal } from './ui';

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
  };
  actions: {
    updateNewTransaction: (data: Partial<Props['newTransaction']>) => void;
    setUiState: (state: Partial<Props['ui']>) => void;
  };
  onSave: (data: Omit<Transaction, 'id'>) => void;
  onClose: () => void;
}

export default function TransactionModal({ isOpen, isEditing, newTransaction, selectedWallet, wallets, ui, actions, onSave, onClose }: Props) {
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

  const handleSave = () => {
    if (newTransaction.amount && newTransaction.category) {
      const amount = parseFloat(newTransaction.amount.replace(/\./g, ''));
      const transactionData = {
        ...newTransaction,
        amount,
        description: newTransaction.description || (newTransaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'),
        wallet_id: selectedWallet === 'global' ? newTransaction.wallet_id : selectedWallet
      };
      onSave(transactionData);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEditing ? 'Edit Transaction' : 'Add Transaction'}
    >
        <div className="space-y-4">
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
        
        <div className="flex gap-3 mt-6">
          <Button
            onClick={handleSave}
            disabled={!newTransaction.amount || !newTransaction.category}
            variant="primary"
            className="flex-1 py-3 font-medium"
          >
            ✨ {isEditing ? 'Update Transaksi' : 'Tambah Transaksi'}
          </Button>
          <Button
            onClick={onClose}
            variant="secondary"
            className="flex-1 py-3 font-medium"
          >
            Batal
          </Button>
        </div>
    </Modal>
  );
}