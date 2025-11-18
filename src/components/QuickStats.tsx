import { Transaction } from '../types';
import { formatIDR } from '../utils/currency';

interface Props {
  transactions: Transaction[];
}

export default function QuickStats({ transactions }: Props) {
  if (transactions.length === 0) return null;

  const expenses = transactions.filter(t => t.type === 'expense');
  const income = transactions.filter(t => t.type === 'income');
  
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
  const avgDailySpending = expenses.length > 0 ? totalExpenses / Math.max(1, new Set(expenses.map(t => t.date)).size) : 0;
  
  const biggestExpense = expenses.reduce((max, t) => t.amount > max.amount ? t : max, expenses[0] || { amount: 0, description: '-' });
  
  const categoryTotals = transactions.reduce((acc, t) => {
    if (t.type === 'expense') {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
    }
    return acc;
  }, {} as Record<string, number>);
  
  const topCategory = Object.entries(categoryTotals).reduce((max, [cat, amount]) => 
    amount > max[1] ? [cat, amount] : max, ['', 0]
  );

  const stats = [
    {
      label: 'Rata-rata Harian',
      value: formatIDR(avgDailySpending),
      icon: '📊'
    },
    {
      label: 'Pengeluaran Terbesar',
      value: biggestExpense.amount > 0 ? formatIDR(biggestExpense.amount) : '-',
      subtitle: biggestExpense.description,
      icon: '💸'
    },
    {
      label: 'Kategori Pengeluaran',
      value: topCategory[1] > 0 ? formatIDR(topCategory[1]) : '-',
      subtitle: topCategory[0],
      icon: '🏆'
    },
    {
      label: 'Total Transaksi',
      value: transactions.length.toString(),
      subtitle: `${income.length} masuk, ${expenses.length} keluar`,
      icon: '📝'
    }
  ];

  return (
    <div className="bg-slate-700 rounded-xl p-4 sm:p-6 shadow-lg border border-slate-600 animate-scaleIn">
      <h3 className="font-semibold text-gray-100 mb-4 text-lg">Statistik Cepat</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="text-center p-3 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg border border-slate-500 hover:scale-105 transition-all duration-300 animate-fadeIn"
            style={{animationDelay: `${index * 0.1}s`}}
          >
            <div className="text-2xl mb-2 animate-bounce" style={{animationDelay: `${index * 0.2}s`, animationDuration: '2s'}}>{stat.icon}</div>
            <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
            <p className="font-semibold text-gray-100 text-sm break-words bg-gradient-to-r from-white to-gray-300 bg-clip-text">{stat.value}</p>
            {stat.subtitle && (
              <p className="text-xs text-gray-500 mt-1 truncate" title={stat.subtitle}>
                {stat.subtitle}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}