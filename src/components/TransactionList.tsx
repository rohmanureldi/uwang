import { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { formatIDR } from '../utils/currency';
import { getCategoryIcon } from '../utils/categoryIcons';
import { DollarSign, List, Table, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import CategoryModal from './CategoryModal';

interface Props {
  transactions: Transaction[];
  onEditTransaction: (id: string, transaction: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  isInSidebar?: boolean;
}

export default function TransactionList({ transactions, onEditTransaction, onDeleteTransaction, isInSidebar = false }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list');
  const [currentPage, setCurrentPage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
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
      amount: transaction.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
      description: transaction.description,
      category: transaction.category,
      type: transaction.type,
      date: transaction.date,
      time: transaction.time || ''
    });
  };

  const saveEdit = (id: string) => {
    if (!editForm.amount || !editForm.category) {
      if (!editForm.amount) {
        setErrorMessage('Masukkan jumlah terlebih dahulu');
      } else if (!editForm.category) {
        setErrorMessage('Pilih kategori terlebih dahulu');
      }
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    setErrorMessage('');

    onEditTransaction(id, {
      amount: parseFloat(editForm.amount.replace(/\./g, '')),
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

  const formatNumber = (value: string) => {
    const num = value.replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleEditAmountChange = (value: string) => {
    const formatted = formatNumber(value);
    setEditForm({...editForm, amount: formatted});
  };

  const filteredAndSortedTransactions = transactions
    .filter(t => !filterCategory || t.category === filterCategory)
    .sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time || '00:00'}`);
      const dateB = new Date(`${b.date} ${b.time || '00:00'}`);
      return sortOrder === 'desc' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
    });

  // Group transactions by date and paginate by 2 days per page
  const { paginatedGroups, totalPages, uniqueDates } = useMemo(() => {
    const grouped = filteredAndSortedTransactions.reduce((groups, transaction) => {
      const date = new Date(transaction.date);
      const key = `${date.getDate()} ${date.toLocaleDateString('id-ID', { month: 'long' })}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(transaction);
      return groups;
    }, {} as Record<string, typeof transactions>);

    const dates = Object.keys(grouped);
    const totalPages = Math.ceil(dates.length / 2);
    
    // Get 2 days for current page
    const startIndex = currentPage * 2;
    const endIndex = startIndex + 2;
    const currentDates = dates.slice(startIndex, endIndex);
    
    const paginatedGroups = currentDates.reduce((acc, date) => {
      acc[date] = grouped[date];
      return acc;
    }, {} as Record<string, typeof transactions>);

    return { paginatedGroups, totalPages, uniqueDates: dates };
  }, [filteredAndSortedTransactions, currentPage]);

  const categories = [...new Set(transactions.map(t => t.category))];
  
  const categoryCount = transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (transactions.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 sm:p-8 shadow-lg border border-gray-700 text-center">
        <div className="text-gray-300 text-4xl sm:text-5xl mb-2 flex justify-center">
          <DollarSign className="w-12 h-12" />
        </div>
        <p className="text-gray-300 text-sm sm:text-base">Belum ada transaksi</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-100 text-lg">Riwayat Transaksi</h3>
        
        {/* View Mode Toggle - Hidden in sidebar */}
        {!isInSidebar && (
          <div className="bg-gray-800 rounded-lg p-1 border border-gray-600 flex">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-xs transition-all flex items-center gap-1 ${
                viewMode === 'list' 
                  ? 'bg-purple-600 text-white shadow-sm' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <List className="w-3 h-3" /> List
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded text-xs transition-all flex items-center gap-1 ${
                viewMode === 'table' 
                  ? 'bg-purple-600 text-white shadow-sm' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Table className="w-3 h-3" /> Table
            </button>
          </div>
        )}
      </div>
      

      
      <div className={`flex justify-between items-center gap-2 mb-4 ${isInSidebar ? 'text-xs' : 'text-sm'}`}>
        <div className="flex items-center gap-2">
          <span className="text-gray-300">Filter:</span>
          <div className="relative">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={`border border-gray-600 bg-gray-800 text-gray-100 rounded appearance-none ${
                isInSidebar ? 'pl-2 pr-6 py-1 text-xs' : 'pl-3 pr-8 py-2'
              }`}
            >
              <option value="">{isInSidebar ? 'Semua' : `Semua (${transactions.length})`}</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{isInSidebar ? cat : `${cat} (${categoryCount[cat]})`}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className={`text-gray-300 ${isInSidebar ? 'w-2 h-2' : 'w-3 h-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isInSidebar && <span className="text-gray-300">Urut:</span>}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className={`border border-gray-600 bg-gray-800 text-gray-100 rounded hover:bg-gray-700 transition-colors flex items-center gap-1 ${
              isInSidebar ? 'px-2 py-1 text-xs' : 'px-3 py-2'
            }`}
          >
            {sortOrder === 'desc' ? (isInSidebar ? '↓' : '↓ Terbaru') : (isInSidebar ? '↑' : '↑ Terlama')}
          </button>
        </div>
      </div>
      
      {(isInSidebar || viewMode === 'list') ? (
        <div className={`transition-opacity duration-150 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
          <div className="space-y-6">
            {Object.entries(paginatedGroups).map(([dateGroup, groupTransactions], index) => (
            <div key={dateGroup} className="animate-fadeIn" style={{animationDelay: `${index * 0.1}s`}}>
              {index > 0 && <div className="border-t border-slate-600 mb-4"></div>}
              <h4 className={`font-semibold text-gray-100 mb-3 bg-slate-600 px-3 py-2 rounded-lg transition-all ${
                isInSidebar ? 'text-sm' : 'text-base'
              }`}>{dateGroup}</h4>
              <div className="space-y-3">
                {groupTransactions.map((transaction, txIndex) => (
            <div key={transaction.id} className="border-b border-slate-600 last:border-b-0 pb-3 last:pb-0 animate-fadeIn transition-all hover:bg-opacity-30 rounded-lg px-2 py-1" style={{animationDelay: `${(index * 0.1) + (txIndex * 0.05)}s`}}>
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
                      type="text"
                      value={editForm.amount}
                      onChange={(e) => handleEditAmountChange(e.target.value)}
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
                  
                  {errorMessage && (
                    <div className="mt-2 p-2 bg-red-600 bg-opacity-20 border border-red-600 text-red-400 rounded text-sm animate-fadeIn">
                      {errorMessage}
                    </div>
                  )}
                </div>
              ) : (
                <div className={`flex items-center justify-between ${isInSidebar ? 'gap-2' : 'gap-4'}`}>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-gray-100 truncate ${
                      isInSidebar ? 'text-xs' : 'text-sm sm:text-base'
                    }`}>{transaction.description || (transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran')}</p>
                    <div className={`flex items-center gap-2 text-gray-400 ${
                      isInSidebar ? 'text-xs' : 'text-xs sm:text-sm'
                    }`}>
                      <span className="flex items-center gap-1">
                        {(() => {
                          const IconComponent = getCategoryIcon(transaction.category);
                          return <IconComponent className="w-3 h-3 text-purple-400" />;
                        })()}
                        <span className={isInSidebar ? 'truncate max-w-16' : ''}>{transaction.category}</span>
                      </span>
                      {transaction.time && !isInSidebar && <span>• {transaction.time}</span>}
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
                        onClick={() => startEdit(transaction)}
                        className={`text-purple-400 hover:bg-gray-800 rounded ${
                          isInSidebar ? 'p-0.5 text-xs' : 'p-1'
                        }`}
                        title="Edit"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(transaction.id)}
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
              )}
            </div>
                ))}
              </div>
            </div>
          ))}
          </div>
        </div>
      ) : (
        <div className={`transition-opacity duration-150 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
          <div className="overflow-auto">
            <div className="min-w-full">
            <div className="bg-slate-600 rounded-t-lg">
              <div className="grid grid-cols-5 gap-4 px-4 py-3 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                <div>Tanggal</div>
                <div>Deskripsi</div>
                <div>Kategori</div>
                <div className="text-right">Jumlah</div>
                <div className="text-center">Aksi</div>
              </div>
            </div>
            <div className="bg-slate-700 rounded-b-lg">
              {Object.values(paginatedGroups).flat().map((transaction, index) => (
                <div key={transaction.id} className={`grid grid-cols-5 gap-4 px-4 py-3 text-sm border-b border-slate-600 last:border-b-0 hover:bg-slate-600 transition-colors animate-fadeIn items-center ${
                  editingId === transaction.id ? 'bg-slate-600' : ''
                }`} style={{animationDelay: `${index * 0.05}s`}}>
                  {editingId === transaction.id ? (
                    <>
                      <div className="col-span-5 space-y-3">
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
                            type="text"
                            value={editForm.amount}
                            onChange={(e) => handleEditAmountChange(e.target.value)}
                            className="px-3 py-2 border border-slate-500 bg-slate-600 text-gray-100 rounded text-sm"
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
                          className="w-full px-3 py-2 border border-slate-500 bg-slate-600 text-gray-100 rounded text-sm"
                          placeholder="Deskripsi"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="date"
                            value={editForm.date}
                            onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                            className="px-3 py-2 border border-slate-500 bg-slate-600 text-gray-100 rounded text-sm"
                            style={{ colorScheme: 'dark' }}
                          />
                          <input
                            type="time"
                            value={editForm.time}
                            onChange={(e) => setEditForm({...editForm, time: e.target.value})}
                            className="px-3 py-2 border border-slate-500 bg-slate-600 text-gray-100 rounded text-sm"
                            style={{ colorScheme: 'dark' }}
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
                        {errorMessage && (
                          <div className="p-2 bg-red-600 bg-opacity-20 border border-red-600 text-red-400 rounded text-sm">
                            {errorMessage}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-gray-300">
                        <div>{new Date(transaction.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</div>
                        {transaction.time && <div className="text-xs text-gray-400">{transaction.time}</div>}
                      </div>
                      <div className="text-gray-100 truncate" title={transaction.description || (transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran')}>
                        {transaction.description || (transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran')}
                      </div>
                      <div className="flex items-center gap-1 text-gray-300">
                        {(() => {
                          const IconComponent = getCategoryIcon(transaction.category);
                          return <IconComponent className="w-4 h-4 text-purple-400" />;
                        })()}
                        <span className="truncate">{transaction.category}</span>
                      </div>
                      <div className={`text-right font-semibold ${
                        transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatIDR(Math.abs(transaction.amount))}
                      </div>
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => startEdit(transaction)}
                          className="p-1 text-purple-400 hover:bg-gray-800 rounded"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(transaction.id)}
                          className="p-1 text-red-400 hover:bg-gray-800 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
          <button
            onClick={() => {
              if (currentPage > 0) {
                setIsAnimating(true);
                setTimeout(() => {
                  setCurrentPage(currentPage - 1);
                  setIsAnimating(false);
                }, 150);
              }
            }}
            disabled={currentPage === 0 || isAnimating}
            className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-400">
            Page {currentPage + 1} of {totalPages}
          </span>
          
          <button
            onClick={() => {
              if (currentPage < totalPages - 1) {
                setIsAnimating(true);
                setTimeout(() => {
                  setCurrentPage(currentPage + 1);
                  setIsAnimating(false);
                }, 150);
              }
            }}
            disabled={currentPage === totalPages - 1 || isAnimating}
            className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Next
          </button>
        </div>
      )}

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