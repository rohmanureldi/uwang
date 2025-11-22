import { useState } from 'react';
import { Transaction, Wallet } from '../types';
import CategoryModal from './CategoryModal';
import { Wallet2 } from 'lucide-react';

interface Props {
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  selectedWallet?: string;
  wallets: Wallet[];
}

export default function TransactionForm({ onAddTransaction, selectedWallet = '', wallets }: Props) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [amountError, setAmountError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [walletError, setWalletError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formWallet, setFormWallet] = useState(selectedWallet === 'global' ? '' : selectedWallet);

  const formatNumber = (value: string) => {
    const num = value.replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and dots
    if (value === '' || /^[0-9.]*$/.test(value.replace(/\./g, ''))) {
      const formatted = formatNumber(value);
      setAmount(formatted);
      if (amountError) setAmountError('');
    }
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
        type,
        date,
        time,
        wallet_id: formWallet
      });

      // Reset form on successful submission
      setAmount('');
      setDescription('');
      setCategory('');
      setFormWallet('');
    } catch (error) {
      console.error('Error adding transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg border border-gray-700 transition-all animate-scaleIn">
      <h3 className="font-semibold text-gray-100 mb-3 sm:mb-4 text-base sm:text-lg">Tambah Transaksi</h3>
      
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div className="bg-gray-800 rounded-lg p-1 flex">
          <button
            type="button"
            onClick={() => {
              setType('income');
              setCategory('');
            }}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              type === 'income'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            Pemasukan
          </button>
          <button
            type="button"
            onClick={() => {
              setType('expense');
              setCategory('');
            }}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              type === 'expense'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            Pengeluaran
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="Jumlah"
              value={amount}
              onChange={handleAmountChange}
              className="px-3 py-3 border border-gray-600 bg-gray-800 text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm placeholder-gray-400 w-full touch-manipulation"
            />
            {amountError && (
              <div className="mt-1 text-red-400 text-sm animate-fadeIn">
                {amountError}
              </div>
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={() => setShowCategoryModal(true)}
              className="px-3 py-3 border border-gray-600 bg-gray-800 text-gray-100 rounded-lg text-left text-sm hover:bg-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none w-full touch-manipulation"
            >
              {category || 'Pilih Kategori'}
            </button>
            {categoryError && (
              <div className="mt-1 text-red-400 text-sm animate-fadeIn">
                {categoryError}
              </div>
            )}
          </div>
        </div>
        
        <div>
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
        </div>

        <input
          type="text"
          placeholder="Deskripsi"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-3 border border-gray-600 bg-gray-800 text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm placeholder-gray-400 touch-manipulation"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-3 border border-gray-600 bg-gray-800 text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm cursor-pointer w-full touch-manipulation"
            style={{ colorScheme: 'dark' }}
            required
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="px-3 py-3 border border-gray-600 bg-gray-800 text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm cursor-pointer w-full touch-manipulation"
            style={{ colorScheme: 'dark' }}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:from-purple-400 disabled:to-pink-400 disabled:cursor-not-allowed transition-all text-sm touch-manipulation min-h-[44px]"
        >
          {isSubmitting ? 'Menambah...' : 'Tambah'}
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