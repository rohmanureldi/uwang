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
    <div className="bg-gray-900 rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg border border-gray-700 h-fit transition-all animate-scaleIn">
      <div className="text-center">
        <p className="text-gray-300 text-xs sm:text-sm mb-2">Saldo</p>
        <p className={`text-lg sm:text-xl lg:text-3xl font-bold break-words transition-all duration-300 ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {formatIDR(balance)}
        </p>
      </div>
      
      <div className="flex justify-between mt-3 sm:mt-4 lg:mt-6 pt-3 sm:pt-4 border-t border-gray-700 gap-2 sm:gap-4">
        <div className="text-center flex-1">
          <p className="text-xs text-gray-400">Pemasukan</p>
          <p className="text-green-400 font-semibold text-xs break-words">{formatIDR(income)}</p>
        </div>
        <div className="text-center flex-1">
          <p className="text-xs text-gray-400">Pengeluaran</p>
          <p className="text-red-400 font-semibold text-xs break-words">{formatIDR(expenses)}</p>
        </div>
      </div>
      
      {topCategories.length > 0 && (
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-400 mb-2">Top Kategori</p>
          <div className="space-y-2">
            {topCategories.slice(0, 2).map(([category, amount]) => {
              const percentage = expenses > 0 ? (amount / expenses * 100) : 0;
              return (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1">
                      {(() => {
                        const IconComponent = getCategoryIcon(category);
                        return <IconComponent className="w-3 h-3 text-purple-400" />;
                      })()}
                      <span className="text-gray-300 truncate">{category}</span>
                    </div>
                    <span className="text-gray-300 text-xs">{percentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all duration-500"
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