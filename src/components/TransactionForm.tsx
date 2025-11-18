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
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
      <h3 className="font-semibold text-gray-900 mb-4 text-lg">Tambah Transaksi</h3>
      
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
            <span className="text-sm sm:text-base text-green-600">Pemasukan</span>
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
              className="text-red-600"
            />
            <span className="text-sm sm:text-base text-red-600">Pengeluaran</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="Jumlah"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base"
            required
          />
          <button
            type="button"
            onClick={() => setShowCategoryModal(true)}
            className="px-4 py-3 border rounded-lg text-left text-sm sm:text-base hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            {category || 'Pilih Kategori'}
          </button>
        </div>

        <input
          type="text"
          placeholder="Deskripsi"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base"
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