import { Transaction } from '../../types';
import { formatIDR } from '../../utils/currency';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  transaction: Transaction;
  deleteMode: boolean;
  selectedTransactions: Set<string>;
  onToggleSelection: (id: string) => void;
  onEditTransaction: (id: string, data: Omit<Transaction, 'id'>) => void;
  wallets: Array<{ id: string; name: string; color?: string; }>;
  selectedWallet?: string;
}

export default function TransactionTableRow({ 
  transaction, 
  deleteMode, 
  selectedTransactions, 
  onToggleSelection, 
  onEditTransaction,
  wallets,
  selectedWallet 
}: Props) {
  const handleRowClick = () => {
    if (deleteMode) {
      onToggleSelection(transaction.id);
    }
  };

  const handleTypeToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!deleteMode) {
      const newType = transaction.type === 'income' ? 'expense' : 'income';
      onEditTransaction(transaction.id, { ...transaction, type: newType });
    }
  };

  return (
    <motion.tr
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`border-t border-gray-600/20 transition-all duration-200 ${
        deleteMode 
          ? `cursor-pointer ${selectedTransactions.has(transaction.id) ? 'bg-purple-600/20 border-purple-500/30' : 'hover:bg-gray-700/20'}` 
          : 'hover:bg-gray-700/20'
      }`}
      onClick={handleRowClick}
    >
      {deleteMode && (
        <td className="px-4 py-3 text-center">
          <input
            type="checkbox"
            checked={selectedTransactions.has(transaction.id)}
            onChange={() => onToggleSelection(transaction.id)}
            className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
          />
        </td>
      )}
      
      <td className="px-4 py-3 text-center">
        <button
          onClick={handleTypeToggle}
          className={`p-1 rounded transition-colors ${
            transaction.type === 'income' ? 'text-green-400 hover:bg-green-400/20' : 'text-red-400 hover:bg-red-400/20'
          }`}
          title={transaction.type === 'income' ? 'Income' : 'Expense'}
          disabled={deleteMode}
        >
          {transaction.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        </button>
      </td>

      <td className="px-4 py-3">
        <div className="px-2 py-1 text-gray-300 rounded text-sm min-h-[24px]">
          {new Date(transaction.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })} {transaction.time || ''}
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="px-2 py-1 text-gray-100 rounded text-sm min-h-[24px]">
          {transaction.description || (transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran')}
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="px-2 py-1 text-gray-300 rounded text-sm min-h-[24px] flex items-center gap-1">
          {(() => {
            const IconComponent = getCategoryIcon(transaction.category);
            return <IconComponent className="w-4 h-4 text-purple-400" />;
          })()}
          <span>{transaction.category}</span>
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="px-2 py-1 text-gray-300 rounded text-sm min-h-[24px]">
          {transaction.subcategory || '-'}
        </div>
      </td>

      {selectedWallet === 'global' && (
        <td className="px-4 py-3 text-gray-300 text-sm">
          {transaction.wallet_id && (
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: wallets.find(w => w.id === transaction.wallet_id)?.color || '#8b5cf6' }}
              />
              <span>{wallets.find(w => w.id === transaction.wallet_id)?.name || 'Unknown'}</span>
            </div>
          )}
        </td>
      )}

      <td className="px-4 py-3">
        <div className={`px-2 py-1 rounded text-sm text-right font-medium min-h-[24px] ${
          transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
        }`}>
          {transaction.type === 'income' ? '+' : '-'}
          {formatIDR(Math.abs(transaction.amount))}
        </div>
      </td>
    </motion.tr>
  );
}