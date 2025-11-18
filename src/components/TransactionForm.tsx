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
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !category) return;

    onAddTransaction({
      amount: parseFloat(amount),
      description,
      category,
      type,
      date: new Date().toISOString().split('T')[0]
    });

    setAmount('');
    setDescription('');
    setCategory('');
  };

  return (
    <div className="bg-slate-700 rounded-xl p-4 sm:p-6 shadow-lg border border-slate-600">
      <h3 className="font-semibold text-gray-100 mb-4 text-lg">Tambah Transaksi</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4 sm:gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="income"
              checked={type === 'income'}
              onChange={(e) => {
                setType(e.target.value as 'income');
                setCategory('');
              }}
              className="text-green-600"
            />
            <span className="text-sm sm:text-base text-green-400">Pemasukan</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="expense"
              checked={type === 'expense'}
              onChange={(e) => {
                setType(e.target.value as 'expense');
                setCategory('');
              }}
              className="text-red-400"
            />
            <span className="text-sm sm:text-base text-red-400">Pengeluaran</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="Jumlah"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="px-4 py-3 border border-slate-500 bg-slate-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm sm:text-base placeholder-gray-400"
            required
          />
          <button
            type="button"
            onClick={() => setShowCategoryModal(true)}
            className="px-4 py-3 border border-slate-500 bg-slate-600 text-gray-100 rounded-lg text-left text-sm sm:text-base hover:bg-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          >
            {category || 'Pilih Kategori'}
          </button>
        </div>

        <input
          type="text"
          placeholder="Deskripsi"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-3 border border-slate-500 bg-slate-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm sm:text-base placeholder-gray-400"
          required
        />

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors text-sm sm:text-base"
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