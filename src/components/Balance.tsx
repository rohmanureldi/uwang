import { Transaction } from '../types';
import { formatIDR } from '../utils/currency';
import { getCategoryIcon } from '../utils/categoryIcons';

interface Props {
  transactions: Transaction[];
}

export default function Balance({ transactions }: Props) {
  const balance = transactions.reduce((total, transaction) => {
    return transaction.type === 'income' 
      ? total + transaction.amount 
      : total - transaction.amount;
  }, 0);

  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const categoryBreakdown = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryBreakdown)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  return (
    <div className="bg-slate-700 rounded-xl p-4 sm:p-6 shadow-lg border border-slate-600 h-fit transition-all animate-scaleIn">
      <div className="text-center">
        <p className="text-gray-400 text-sm mb-2">Saldo</p>
        <p className={`text-xl sm:text-2xl lg:text-3xl font-bold break-words transition-all duration-300 ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {formatIDR(balance)}
        </p>
      </div>
      
      <div className="flex justify-between mt-4 sm:mt-6 pt-4 border-t border-slate-600 gap-4">
        <div className="text-center flex-1">
          <p className="text-xs text-gray-500">Pemasukan</p>
          <p className="text-green-400 font-semibold text-xs sm:text-sm break-words">{formatIDR(income)}</p>
        </div>
        <div className="text-center flex-1">
          <p className="text-xs text-gray-500">Pengeluaran</p>
          <p className="text-red-400 font-semibold text-xs sm:text-sm break-words">{formatIDR(expenses)}</p>
        </div>
      </div>
      
      {topCategories.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-600">
          <p className="text-xs text-gray-500 mb-3">Top Kategori</p>
          <div className="space-y-2">
            {topCategories.map(([category, amount]) => {
              const percentage = expenses > 0 ? (amount / expenses * 100) : 0;
              return (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1">
                      <span>{getCategoryIcon(category)}</span>
                      <span className="text-gray-400 truncate">{category}</span>
                    </div>
                    <span className="text-gray-300">{percentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-1.5">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}