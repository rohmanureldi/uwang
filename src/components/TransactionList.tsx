import { useState } from 'react';
import { Transaction } from '../types';
import { formatIDR } from '../utils/currency';
import { DEFAULT_CATEGORIES } from '../utils/categories';
import CategoryModal from './CategoryModal';

interface Props {
  transactions: Transaction[];
  onEditTransaction: (id: string, transaction: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
}

export default function TransactionList({ transactions, onEditTransaction, onDeleteTransaction }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editForm, setEditForm] = useState({
    amount: '',
    description: '',
    category: '',
    type: 'expense' as 'income' | 'expense'
  });

  const startEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setEditForm({
      amount: transaction.amount.toString(),
      description: transaction.description,
      category: transaction.category,
      type: transaction.type
    });
  };

  const saveEdit = (id: string) => {
    if (!editForm.amount || !editForm.description || !editForm.category) return;

    onEditTransaction(id, {
      amount: parseFloat(editForm.amount),
      description: editForm.description,
      category: editForm.category,
      type: editForm.type,
      date: new Date().toISOString().split('T')[0]
    });
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border text-center">
        <div className="text-gray-400 text-4xl sm:text-5xl mb-2">💰</div>
        <p className="text-gray-500 text-sm sm:text-base">Belum ada transaksi</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
      <h3 className="font-semibold text-gray-900 mb-4 text-lg">Riwayat Transaksi</h3>
      
      <div className="space-y-3 max-h-96 lg:max-h-[500px] overflow-y-auto">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="border-b last:border-b-0 pb-3 last:pb-0">
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
                    <span className="text-sm text-green-600">Pemasukan</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="expense"
                      checked={editForm.type === 'expense'}
                      onChange={(e) => setEditForm({...editForm, type: e.target.value as 'expense', category: ''})}
                    />
                    <span className="text-sm text-red-600">Pengeluaran</span>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={editForm.amount}
                    onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                    className="px-3 py-2 border rounded text-sm"
                    placeholder="Jumlah"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(true)}
                    className="px-3 py-2 border rounded text-sm text-left hover:bg-gray-50"
                  >
                    {editForm.category || 'Pilih Kategori'}
                  </button>
                </div>
                <input
                  type="text"
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded text-sm"
                  placeholder="Deskripsi"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(transaction.id)}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Simpan
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{transaction.description}</p>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                    <span>{transaction.category}</span>
                    <span>• {transaction.date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`font-semibold text-sm sm:text-base whitespace-nowrap ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatIDR(Math.abs(transaction.amount))}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(transaction)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onDeleteTransaction(transaction.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSelect={(category) => setEditForm({...editForm, category})}
        type={editForm.type}
      />
    </div>
  );
}