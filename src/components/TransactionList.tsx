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
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [editForm, setEditForm] = useState({
    amount: '',
    description: '',
    category: '',
    type: 'expense' as 'income' | 'expense',
    date: '',
    time: ''
  });

  const startEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setEditForm({
      amount: transaction.amount.toString(),
      description: transaction.description,
      category: transaction.category,
      type: transaction.type,
      date: transaction.date,
      time: transaction.time || ''
    });
  };

  const saveEdit = (id: string) => {
    if (!editForm.amount || !editForm.description || !editForm.category) return;

    onEditTransaction(id, {
      amount: parseFloat(editForm.amount),
      description: editForm.description,
      category: editForm.category,
      type: editForm.type,
      date: editForm.date,
      time: editForm.time
    });
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const filteredAndSortedTransactions = transactions
    .filter(t => {
      if (filterCategory && t.category !== filterCategory) return false;
      if (dateFrom && t.date < dateFrom) return false;
      if (dateTo && t.date > dateTo) return false;
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time || '00:00'}`);
      const dateB = new Date(`${b.date} ${b.time || '00:00'}`);
      return sortOrder === 'desc' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
    });

  const groupedTransactions = filteredAndSortedTransactions.reduce((groups, transaction) => {
    const date = new Date(transaction.date);
    const key = `${date.getDate()} ${date.toLocaleDateString('id-ID', { month: 'long' })}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(transaction);
    return groups;
  }, {} as Record<string, typeof transactions>);

  const categories = [...new Set(transactions.map(t => t.category))];

  if (transactions.length === 0) {
    return (
      <div className="bg-slate-700 rounded-xl p-6 sm:p-8 shadow-lg border border-slate-600 text-center">
        <div className="text-gray-400 text-4xl sm:text-5xl mb-2">💰</div>
        <p className="text-gray-400 text-sm sm:text-base">Belum ada transaksi</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-700 rounded-xl p-4 sm:p-6 shadow-lg border border-slate-600">
      <h3 className="font-semibold text-gray-100 mb-4 text-lg">Riwayat Transaksi</h3>
      
      <div className="bg-slate-600 rounded-lg p-3 mb-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-32">
            <label className="block text-xs text-gray-300 mb-1">Urutkan</label>
            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
                className="w-full pl-3 pr-10 py-2 border border-slate-500 bg-slate-700 text-gray-100 rounded text-sm appearance-none"
              >
                <option value="desc">Terbaru</option>
                <option value="asc">Terlama</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex-1 min-w-32">
            <label className="block text-xs text-gray-300 mb-1">Kategori</label>
            <div className="relative">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full pl-3 pr-10 py-2 border border-slate-500 bg-slate-700 text-gray-100 rounded text-sm appearance-none"
              >
                <option value="">Semua Kategori</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-32">
            <label className="block text-xs text-gray-300 mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-slate-500 bg-slate-700 text-gray-100 rounded text-sm cursor-pointer"
              style={{ colorScheme: 'dark', WebkitAppearance: 'none', MozAppearance: 'textfield' }}
              onFocus={(e) => e.target.showPicker?.()}
            />
          </div>
          <div className="flex-1 min-w-32">
            <label className="block text-xs text-gray-300 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-slate-500 bg-slate-700 text-gray-100 rounded text-sm cursor-pointer"
              style={{ colorScheme: 'dark', WebkitAppearance: 'none', MozAppearance: 'textfield' }}
              onFocus={(e) => e.target.showPicker?.()}
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-4 max-h-96 lg:max-h-[500px] overflow-y-auto">
        {Object.entries(groupedTransactions).map(([dateGroup, groupTransactions]) => (
          <div key={dateGroup}>
            <h4 className="font-medium text-gray-300 mb-2 text-sm">{dateGroup}</h4>
            <div className="space-y-3">
              {groupTransactions.map((transaction) => (
          <div key={transaction.id} className="border-b border-slate-600 last:border-b-0 pb-3 last:pb-0">
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
                    <span className="text-sm text-green-400">Pemasukan</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="expense"
                      checked={editForm.type === 'expense'}
                      onChange={(e) => setEditForm({...editForm, type: e.target.value as 'expense', category: ''})}
                    />
                    <span className="text-sm text-red-400">Pengeluaran</span>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={editForm.amount}
                    onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                    className="px-3 py-2 border border-slate-500 bg-slate-600 text-gray-100 rounded text-sm placeholder-gray-400"
                    placeholder="Jumlah"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(true)}
                    className="px-3 py-2 border border-slate-500 bg-slate-600 text-gray-100 rounded text-sm text-left hover:bg-slate-500"
                  >
                    {editForm.category || 'Pilih Kategori'}
                  </button>
                </div>
                <input
                  type="text"
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-500 bg-slate-600 text-gray-100 rounded text-sm placeholder-gray-400"
                  placeholder="Deskripsi"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                    className="px-3 py-2 border border-slate-500 bg-slate-600 text-gray-100 rounded text-sm cursor-pointer"
                    style={{ colorScheme: 'dark', WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                    onFocus={(e) => e.target.showPicker?.()}
                  />
                  <input
                    type="time"
                    value={editForm.time}
                    onChange={(e) => setEditForm({...editForm, time: e.target.value})}
                    className="px-3 py-2 border border-slate-500 bg-slate-600 text-gray-100 rounded text-sm cursor-pointer"
                    style={{ colorScheme: 'dark', WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                    onFocus={(e) => e.target.showPicker?.()}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(transaction.id)}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Simpan
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-3 py-1 bg-slate-500 text-white rounded text-sm hover:bg-slate-400"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-100 text-sm sm:text-base truncate">{transaction.description}</p>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                    <span>{transaction.category}</span>
                    {transaction.time && <span>• {transaction.time}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`font-semibold text-sm sm:text-base whitespace-nowrap ${
                    transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatIDR(Math.abs(transaction.amount))}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(transaction)}
                      className="p-1 text-primary-400 hover:bg-slate-600 rounded"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(transaction.id)}
                      className="p-1 text-red-400 hover:bg-slate-600 rounded"
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
          </div>
        ))}
      </div>

      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSelect={(category) => setEditForm({...editForm, category})}
        type={editForm.type}
      />

      {deleteConfirmId && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(10px)' }}
          onClick={() => setDeleteConfirmId(null)}
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
                  onDeleteTransaction(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Hapus
              </button>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 bg-slate-600 text-white py-2 rounded-lg font-medium hover:bg-slate-500 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}