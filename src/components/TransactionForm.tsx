import { useState } from 'react';
import { Transaction } from '../types';
import CategoryModal from './CategoryModal';

interface Props {
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

export default function TransactionForm({ onAddTransaction }: Props) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [amountError, setAmountError] = useState('');
  const [categoryError, setCategoryError] = useState('');

  const formatNumber = (value: string) => {
    const num = value.replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumber(e.target.value);
    setAmount(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAmountError('');
    setCategoryError('');
    
    if (!amount || !category) {
      if (!amount) {
        setAmountError('Masukkan jumlah terlebih dahulu');
        setTimeout(() => setAmountError(''), 3000);
      }
      if (!category) {
        setCategoryError('Pilih kategori terlebih dahulu');
        setTimeout(() => setCategoryError(''), 3000);
      }
      return;
    }

    onAddTransaction({
      amount: parseFloat(amount.replace(/\./g, '')),
      description,
      category,
      type,
      date,
      time
    });

    setAmount('');
    setDescription('');
    setCategory('');
  };

  return (
    <div className="bg-slate-700 rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg border border-slate-600 transition-all animate-scaleIn">
      <h3 className="font-semibold text-gray-100 mb-3 sm:mb-4 text-base sm:text-lg">Tambah Transaksi</h3>
      
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div className="flex gap-4 sm:gap-6">
          <label className="flex items-center gap-2 cursor-pointer py-2">
            <input
              type="radio"
              value="income"
              checked={type === 'income'}
              onChange={(e) => {
                setType(e.target.value as 'income');
                setCategory('');
              }}
              className="text-green-600 w-4 h-4"
            />
            <span className="text-sm text-green-400">Pemasukan</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer py-2">
            <input
              type="radio"
              value="expense"
              checked={type === 'expense'}
              onChange={(e) => {
                setType(e.target.value as 'expense');
                setCategory('');
              }}
              className="text-red-400 w-4 h-4"
            />
            <span className="text-sm text-red-400">Pengeluaran</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="Jumlah"
              value={amount}
              onChange={handleAmountChange}
              className="px-3 py-3 border border-slate-500 bg-slate-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm placeholder-gray-400 w-full touch-manipulation"
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
              className="px-3 py-3 border border-slate-500 bg-slate-600 text-gray-100 rounded-lg text-left text-sm hover:bg-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none w-full touch-manipulation"
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

        <input
          type="text"
          placeholder="Deskripsi"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-3 border border-slate-500 bg-slate-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm placeholder-gray-400 touch-manipulation"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-3 border border-slate-500 bg-slate-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm cursor-pointer w-full touch-manipulation"
            style={{ colorScheme: 'dark' }}
            required
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="px-3 py-3 border border-slate-500 bg-slate-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm cursor-pointer w-full touch-manipulation"
            style={{ colorScheme: 'dark' }}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-all text-sm touch-manipulation min-h-[44px]"
        >
          Tambah
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