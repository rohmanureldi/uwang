import { Transaction } from '../types';
import { formatIDR } from '../utils/currency';
import { getCategoryIcon } from '../utils/categoryIcons';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { styles } from '../styles/transactionList.styles';

interface Props {
  paginatedGroups: Record<string, Transaction[]>;
  ui: {
    deleteMode: boolean;
    selectedTransactions: Set<string>;
  };
  actions: {
    setUiState: (state: { selectedTransactions: Set<string> }) => void;
  };
  selectedWallet: string;
  wallets: Array<{ id: string; name: string; color?: string; }>;
  onEditTransaction: (transaction: Transaction) => void;
}

export default function TransactionTable({ paginatedGroups, ui, actions, selectedWallet, wallets, onEditTransaction }: Props) {
  return (
    <div className={styles.table.container}>
      <table className={styles.table.table}>
        <thead className={styles.table.header}>
          <tr>
            {ui.deleteMode && <th className={styles.table.headerCellCenter}>Select</th>}
            <th className={styles.table.headerCellCenter}>Type</th>
            <th className={`${styles.table.headerCell} w-40`}>Date & Time</th>
            <th className={styles.table.headerCell}>Description</th>
            <th className={styles.table.headerCell}>Category</th>
            <th className={styles.table.headerCell}>Subcategory</th>
            {selectedWallet === 'global' && <th className={`${styles.table.headerCell} min-w-[140px]`}>Wallet</th>}
            <th className={styles.table.headerCellRight}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(paginatedGroups).map(([dateGroup, groupTransactions]) =>
            groupTransactions.map((transaction, index) => (
              <motion.tr
                key={transaction.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`${styles.table.row} ${
                  ui.deleteMode 
                    ? `${ui.selectedTransactions.has(transaction.id) ? 'bg-purple-600/20 border-purple-500/30' : ''}` 
                    : ''
                }`}
                onClick={ui.deleteMode ? () => {
                  const newSelected = new Set(ui.selectedTransactions);
                  if (ui.selectedTransactions.has(transaction.id)) {
                    newSelected.delete(transaction.id);
                  } else {
                    newSelected.add(transaction.id);
                  }
                  actions.setUiState({ selectedTransactions: newSelected });
                } : () => onEditTransaction(transaction)}
              >
                {ui.deleteMode && (
                  <td className={`${styles.table.cell} text-center`}>
                    <input
                      type="checkbox"
                      checked={ui.selectedTransactions.has(transaction.id)}
                      onChange={(e) => {
                        const newSelected = new Set(ui.selectedTransactions);
                        if (e.target.checked) {
                          newSelected.add(transaction.id);
                        } else {
                          newSelected.delete(transaction.id);
                        }
                        actions.setUiState({ selectedTransactions: newSelected });
                      }}
                      className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                    />
                  </td>
                )}
                <td className={`${styles.table.cell} text-center`}>
                  <div className={`p-1 rounded ${
                    transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {transaction.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                </td>
                <td className={styles.table.cell}>
                  <div className={styles.table.cellContent}>
                    {new Date(transaction.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })} {transaction.time || ''}
                  </div>
                </td>
                <td className={styles.table.cell}>
                  <div className={`${styles.table.cellContent} text-gray-100`}>
                    {transaction.description || (transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran')}
                  </div>
                </td>
                <td className={`${styles.table.cell} relative`}>
                  <div className={`${styles.table.cellContent} flex items-center gap-1`}>
                    {(() => {
                      const IconComponent = getCategoryIcon(transaction.category);
                      return <IconComponent className="w-4 h-4 text-purple-400" />;
                    })()}
                    <span>{transaction.category}</span>
                  </div>
                </td>
                <td className={`${styles.table.cell} relative`}>
                  <div className={styles.table.cellContent}>
                    {transaction.subcategory || '-'}
                  </div>
                </td>
                {selectedWallet === 'global' && (
                  <td className={`${styles.table.cell} text-gray-300 text-sm`}>
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
                <td className={styles.table.cell}>
                  <div className={`${styles.table.cellContent} text-right font-medium ${
                    transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatIDR(Math.abs(transaction.amount))}
                  </div>
                </td>
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}