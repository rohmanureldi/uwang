import { useState, useEffect } from 'react';
import { Transaction, Wallet } from '../types';
import CategoryModal from './CategoryModal';
import { Wallet2, Plus, Zap, Coffee, Car, Home, ShoppingBag, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  selectedWallet?: string;
  wallets: Wallet[];
  onCreateWallet?: () => void;
}

export default function TransactionForm({ onAddTransaction, selectedWallet = '', wallets, onCreateWallet }: Props) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [showSubcategorySuggestions, setShowSubcategorySuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [showDescriptionSuggestions, setShowDescriptionSuggestions] = useState(false);
  const [selectedDescriptionIndex, setSelectedDescriptionIndex] = useState(-1);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [amountError, setAmountError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [walletError, setWalletError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [suggestedCategory, setSuggestedCategory] = useState('');
  const getDefaultWallet = () => {
    const actualWallets = wallets.filter(w => w.id !== 'global');
    
    // If selectedWallet is not global, use it
    if (selectedWallet && selectedWallet !== 'global') {
      return selectedWallet;
    }
    
    // If only one wallet exists, use it
    if (actualWallets.length === 1) {
      return actualWallets[0].id;
    }
    
    return '';
  };
  
  const [formWallet, setFormWallet] = useState(getDefaultWallet());
  
  // Update form wallet when selectedWallet or wallets change
  useEffect(() => {
    const newDefaultWallet = getDefaultWallet();
    setFormWallet(newDefaultWallet);
  }, [selectedWallet, wallets]);

  const formatNumber = (value: string) => {
    const num = value.replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };



  const suggestCategoryFromAmount = (amount: string) => {
    const numericAmount = parseFloat(amount.replace(/\./g, ''));
    if (numericAmount < 25000) return 'Food';
    if (numericAmount < 100000) return 'Transportation';
    if (numericAmount < 500000) return 'Shopping';
    return 'Bills';
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^[0-9.]*$/.test(value.replace(/\./g, ''))) {
      const formatted = formatNumber(value);
      setAmount(formatted);
      if (!category && formatted) {
        setSuggestedCategory(suggestCategoryFromAmount(formatted));
      }
      if (amountError) setAmountError('');
    }
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
        icon: t.category === 'Food' ? Coffee : t.category === 'Transportation' ? Car : t.category === 'Shopping' ? ShoppingBag : Home,
        label: t.description,
        amount: Math.round(t.totalAmount / t.count).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
        category: t.category,
        subcategory: t.subcategory,
        description: t.description
      }));
    
    return topTransactions.length > 0 ? topTransactions : [
      { icon: Coffee, label: 'Coffee', amount: '25.000', category: 'Food', subcategory: 'Kopi', description: 'Kopi' },
      { icon: Car, label: 'Transport', amount: '50.000', category: 'Transportation', subcategory: 'Kantor', description: 'Transportasi' },
      { icon: Utensils, label: 'Meal', amount: '75.000', category: 'Food', subcategory: 'Meal', description: 'Makan' },
      { icon: ShoppingBag, label: 'Shopping', amount: '200.000', category: 'Shopping', subcategory: '', description: 'Belanja' },
    ];
  };
  
  const quickActions = getQuickActions();

  const handleQuickAction = (action: typeof quickActions[0]) => {
    setAmount(action.amount);
    setCategory(action.category);
    setSubcategory(action.subcategory);
    setDescription(action.description);
    setShowQuickActions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAmountError('');
    setCategoryError('');
    setWalletError('');
    
    // Validate amount
    const cleanAmount = amount.replace(/\./g, '');
    const numericAmount = parseFloat(cleanAmount);
    
    if (!amount.trim() || isNaN(numericAmount) || numericAmount <= 0) {
      setAmountError('Masukkan jumlah yang valid');
      setTimeout(() => setAmountError(''), 3000);
      return;
    }
    
    if (!category.trim()) {
      setCategoryError('Pilih kategori terlebih dahulu');
      setTimeout(() => setCategoryError(''), 3000);
      return;
    }
    
    if (!formWallet) {
      setWalletError('Pilih wallet terlebih dahulu');
      setTimeout(() => setWalletError(''), 3000);
      return;
    }

    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      onAddTransaction({
        amount: numericAmount,
        description: description.trim() || (type === 'income' ? 'Pemasukan' : 'Pengeluaran'),
        category: category.trim(),
        subcategory: subcategory.trim() || undefined,
        type,
        date,
        time,
        wallet_id: formWallet
      });

      // Reset form on successful submission
      setAmount('');
      setDescription('');
      setCategory('');
      setSubcategory('');
      setFormWallet(getDefaultWallet());
    } catch (error) {
      console.error('Error adding transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg border border-gray-700 transition-all animate-scaleIn">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-100 text-base sm:text-lg flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-400" />
          Tambah Transaksi
        </h3>
        <button
          type="button"
          onClick={() => setShowQuickActions(!showQuickActions)}
          className={`text-xs px-3 py-1 rounded-full transition-colors ${
            showQuickActions ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Quick
        </button>
      </div>
      
      {/* Quick Actions */}
      <AnimatePresence>
        {showQuickActions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-600"
          >
            <div className="text-xs font-medium text-gray-400 mb-2">Most Frequent Transactions</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {quickActions.map((action, index) => {
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
      
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* Transaction Type - More Prominent */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-750 rounded-xl p-4 border border-gray-600 shadow-inner">
          <div className="text-xs font-medium text-gray-400 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            Jenis Transaksi
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory('');
                setSubcategory('');
                setSuggestedCategory('');
              }}
              className={`flex-1 px-4 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 transform ${
                type === 'income'
                  ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg scale-105 shadow-green-500/25'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700 bg-gray-800 hover:scale-102'
              }`}
            >
              <span className="text-xl">📈</span>
              <div className="text-left">
                <div>Pemasukan</div>
                <div className="text-xs opacity-75">Income</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategory('');
                setSubcategory('');
                setSuggestedCategory('');
              }}
              className={`flex-1 px-4 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 transform ${
                type === 'expense'
                  ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg scale-105 shadow-red-500/25'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700 bg-gray-800 hover:scale-102'
              }`}
            >
              <span className="text-xl">📉</span>
              <div className="text-left">
                <div>Pengeluaran</div>
                <div className="text-xs opacity-75">Expense</div>
              </div>
            </button>
          </div>
        </div>

        {/* Amount & Category - Enhanced */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-750 rounded-xl p-4 pb-8 border border-gray-600 shadow-inner space-y-4">
          <div className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            Detail Transaksi
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                💰
              </div>
              <input
                type="text"
                placeholder="0"
                value={amount}
                onChange={handleAmountChange}
                className={`pl-10 pr-3 py-4 border-2 bg-gray-700 text-gray-100 rounded-xl outline-none text-lg font-semibold placeholder-gray-400 w-full touch-manipulation transition-all duration-300 ${
                  amount ? (
                    parseFloat(amount.replace(/\./g, '')) > 1000000 
                      ? 'border-orange-500 text-orange-300' 
                      : parseFloat(amount.replace(/\./g, '')) > 100000
                      ? 'border-yellow-500 text-yellow-300'
                      : 'border-green-500 text-green-300'
                  ) : 'border-gray-600'
                }`}
              />
              {amount && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                  IDR
                </div>
              )}
              {amountError && (
                <div className="mt-1 text-red-400 text-xs animate-fadeIn">
                  {amountError}
                </div>
              )}
            </div>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
                🏷️
              </div>
              <button
                type="button"
                onClick={() => setShowCategoryModal(true)}
                className={`pl-10 pr-3 py-4 border-2 bg-gray-700 text-gray-100 rounded-xl text-left font-medium hover:bg-gray-600 focus:ring-2 focus:ring-purple-500 outline-none w-full touch-manipulation transition-all duration-300 ${
                  category ? 'border-purple-500' : 'border-gray-600'
                }`}
              >
                {category || 'Pilih Kategori'}
              </button>
              {suggestedCategory && !category && (
                <button
                  type="button"
                  onClick={() => {
                    setCategory(suggestedCategory);
                    setSuggestedCategory('');
                  }}
                  className="absolute top-full mt-1 left-0 text-xs text-blue-400 hover:text-blue-300 animate-fadeIn z-10 cursor-pointer underline"
                >
                  Suggested: {suggestedCategory}
                </button>
              )}
              {categoryError && (
                <div className="mt-1 text-red-400 text-xs animate-fadeIn">
                  {categoryError}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Additional Details */}
        <div className="space-y-4">
          {/* Subcategory */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
              🔖
            </div>
            <input
              type="text"
              placeholder="Subkategori (Opsional)"
              value={subcategory}
              onChange={(e) => {
                setSubcategory(e.target.value);
                setSelectedSuggestionIndex(-1);
              }}
              onFocus={() => setShowSubcategorySuggestions(true)}
              onBlur={() => setTimeout(() => setShowSubcategorySuggestions(false), 200)}
              onKeyDown={(e) => {
                const allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
                const subcategoryMap = new Map();
                allTransactions.forEach((t: any) => {
                  if (t.subcategory && t.subcategory.toLowerCase().includes(subcategory.toLowerCase())) {
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
                  setSubcategory(existingSubcategories[selectedSuggestionIndex]);
                  setShowSubcategorySuggestions(false);
                  setSelectedSuggestionIndex(-1);
                } else if (e.key === 'Escape') {
                  setShowSubcategorySuggestions(false);
                  setSelectedSuggestionIndex(-1);
                }
              }}
              className="w-full pl-10 pr-3 py-3 border border-gray-600 bg-gray-800 text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm placeholder-gray-400 touch-manipulation transition-all duration-300"
            />
            {showSubcategorySuggestions && (() => {
              const allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
              const subcategoryMap = new Map();
              allTransactions.forEach((t: any) => {
                if (t.subcategory && t.subcategory.toLowerCase().includes(subcategory.toLowerCase())) {
                  subcategoryMap.set(t.subcategory, t.created_at || t.date);
                }
              });
              const existingSubcategories = Array.from(subcategoryMap.entries())
                .sort((a, b) => new Date(b[1]).getTime() - new Date(a[1]).getTime())
                .map(([subcategory]) => subcategory)
                .slice(0, 5);
              
              return existingSubcategories.length > 0 ? (
                <div className="absolute top-full left-0 right-0 bg-gray-800 border border-gray-600 rounded-xl mt-2 max-h-40 overflow-y-auto z-20 shadow-xl">
                  {existingSubcategories.map((sub: string, index: number) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => {
                        setSubcategory(sub);
                        setShowSubcategorySuggestions(false);
                        setSelectedSuggestionIndex(-1);
                      }}
                      className={`w-full text-left px-4 py-3 text-gray-100 text-sm transition-colors first:rounded-t-xl last:rounded-b-xl ${
                        index === selectedSuggestionIndex ? 'bg-purple-600' : 'hover:bg-gray-700'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              ) : null;
            })()}
          </div>
        
        <div>
          {wallets.filter(w => w.id !== 'global').length === 0 ? (
            <button
              type="button"
              onClick={onCreateWallet}
              className="w-full flex items-center justify-center gap-2 px-3 py-3 border border-gray-600 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Wallet First
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2 px-3 py-3 border border-gray-600 bg-gray-800 rounded-lg">
                <Wallet2 className="w-4 h-4 text-purple-400" />
                <select
                  value={formWallet}
                  onChange={(e) => {
                    setFormWallet(e.target.value);
                    if (walletError) setWalletError('');
                  }}
                  className="bg-transparent text-gray-100 text-sm focus:outline-none flex-1"
                >
                  <option value="">Pilih Wallet</option>
                  {wallets.filter(w => w.id !== 'global').map((wallet) => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.name}
                    </option>
                  ))}
                </select>
              </div>
              {walletError && (
                <div className="mt-1 text-red-400 text-sm animate-fadeIn">
                  {walletError}
                </div>
              )}
            </>
          )}
        </div>

          {/* Description */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
              📝
            </div>
            <input
              type="text"
              placeholder="Deskripsi"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setSelectedDescriptionIndex(-1);
              }}
              onFocus={() => setShowDescriptionSuggestions(true)}
              onBlur={() => setTimeout(() => setShowDescriptionSuggestions(false), 200)}
              onKeyDown={(e) => {
                const allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
                const descriptionMap = new Map();
                allTransactions.forEach((t: any) => {
                  if (t.description && t.description.toLowerCase().includes(description.toLowerCase())) {
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
                  setDescription(existingDescriptions[selectedDescriptionIndex]);
                  setShowDescriptionSuggestions(false);
                  setSelectedDescriptionIndex(-1);
                } else if (e.key === 'Escape') {
                  setShowDescriptionSuggestions(false);
                  setSelectedDescriptionIndex(-1);
                }
              }}
              className="w-full pl-10 pr-3 py-3 border border-gray-600 bg-gray-800 text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm placeholder-gray-400 touch-manipulation transition-all duration-300"
            />
            {showDescriptionSuggestions && (() => {
              const allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
              const descriptionMap = new Map();
              allTransactions.forEach((t: any) => {
                if (t.description && t.description.toLowerCase().includes(description.toLowerCase())) {
                  descriptionMap.set(t.description, t.created_at || t.date);
                }
              });
              const existingDescriptions = Array.from(descriptionMap.entries())
                .sort((a, b) => new Date(b[1]).getTime() - new Date(a[1]).getTime())
                .map(([description]) => description)
                .slice(0, 5);
              
              return existingDescriptions.length > 0 ? (
                <div className="absolute top-full left-0 right-0 bg-gray-800 border border-gray-600 rounded-xl mt-2 max-h-40 overflow-y-auto z-20 shadow-xl">
                  {existingDescriptions.map((desc: string, index: number) => (
                    <button
                      key={desc}
                      type="button"
                      onClick={() => {
                        setDescription(desc);
                        setShowDescriptionSuggestions(false);
                        setSelectedDescriptionIndex(-1);
                      }}
                      className={`w-full text-left px-4 py-3 text-gray-100 text-sm transition-colors first:rounded-t-xl last:rounded-b-xl ${
                        index === selectedDescriptionIndex ? 'bg-purple-600' : 'hover:bg-gray-700'
                      }`}
                    >
                      {desc}
                    </button>
                  ))}
                </div>
              ) : null;
            })()}
          </div>
        </div>

        {/* Date & Time - Enhanced */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-750 rounded-xl p-4 border border-gray-600 shadow-inner">
          <div className="text-xs font-medium text-gray-400 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            Waktu Transaksi
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                setDate(now.toISOString().split('T')[0]);
                setTime(now.toTimeString().slice(0, 5));
              }}
              className="ml-auto text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
            >
              Now
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
                📅
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="pl-10 pr-3 py-3 border border-gray-600 bg-gray-700 text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm cursor-pointer w-full touch-manipulation transition-all duration-300"
                style={{ colorScheme: 'dark' }}
                required
              />
            </div>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
                🕐
              </div>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="pl-10 pr-3 py-3 border border-gray-600 bg-gray-700 text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm cursor-pointer w-full touch-manipulation transition-all duration-300"
                style={{ colorScheme: 'dark' }}
                required
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !amount || !category}
          className={`w-full py-4 rounded-xl font-bold text-base touch-manipulation min-h-[52px] shadow-lg transition-all duration-300 flex items-center justify-center gap-3 transform ${
            isSubmitting || !amount || !category
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Menambah Transaksi...</span>
            </>
          ) : (
            <>
              <span className="text-xl">✨</span>
              <span>Tambah Transaksi</span>
              <div className={`w-2 h-2 rounded-full transition-colors ${
                amount && category ? 'bg-green-400' : 'bg-gray-500'
              }`}></div>
            </>
          )}
        </button>
      </form>

      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSelect={setCategory}
        type={type}
      />


    </div>
  );
}