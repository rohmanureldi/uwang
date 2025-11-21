import { Transaction, Budget } from '../types';
import { formatIDR } from '../utils/currency';
import { BarChart3, TrendingDown, Trophy, FileText, AlertTriangle } from 'lucide-react';

interface Props {
  transactions: Transaction[];
}

export default function QuickStats({ transactions }: Props) {
  if (transactions.length === 0) return null;

  // Check budget alerts
  const budgets: Budget[] = JSON.parse(localStorage.getItem('budgets') || '[]');
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentBudgets = budgets.filter(b => b.month === currentMonth);
  
  const categorySpending = transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
  
  const budgetAlerts = currentBudgets.filter(budget => {
    const spent = categorySpending[budget.category] || 0;
    return spent > budget.limit * 0.8; // Alert at 80%
  });

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
      icon: BarChart3
    },
    {
      label: 'Pengeluaran Terbesar',
      value: biggestExpense.amount > 0 ? formatIDR(biggestExpense.amount) : '-',
      subtitle: biggestExpense.description,
      icon: TrendingDown
    },
    {
      label: 'Kategori Pengeluaran',
      value: topCategory[1] > 0 ? formatIDR(topCategory[1]) : '-',
      subtitle: topCategory[0],
      icon: Trophy
    },
    {
      label: 'Total Transaksi',
      value: transactions.length.toString(),
      subtitle: `${income.length} masuk, ${expenses.length} keluar`,
      icon: FileText
    }
  ];

  return (
    <div className="bg-gray-900 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-700 animate-scaleIn">
      <h3 className="font-semibold text-gray-100 mb-4 text-lg">Statistik Cepat</h3>
      
      {budgetAlerts.length > 0 && (
        <div className="mb-4 p-3 bg-orange-900 bg-opacity-30 border border-orange-600 rounded-lg">
          <p className="text-orange-400 text-sm font-semibold mb-1 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Peringatan Budget
          </p>
          {budgetAlerts.map(budget => {
            const spent = categorySpending[budget.category] || 0;
            const percentage = (spent / budget.limit) * 100;
            return (
              <p key={budget.category} className="text-orange-300 text-xs">
                {budget.category}: {percentage.toFixed(0)}% dari budget
              </p>
            );
          })}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="p-3 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-600 hover:scale-105 transition-all duration-300 animate-fadeIn"
            style={{animationDelay: `${index * 0.1}s`}}
          >
            <div className="flex items-start gap-2 mb-2">
              <stat.icon className="w-5 h-5 text-purple-400 flex-shrink-0" />
              <p className="text-gray-300 font-medium leading-tight" style={{
                fontSize: stat.label.length > 15 ? '10px' : stat.label.length > 10 ? '11px' : '12px',
                lineHeight: '1.2',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>{stat.label}</p>
            </div>
            <p className="font-semibold text-gray-100 text-sm mb-1">{stat.value}</p>
            {stat.subtitle && (
              <p className="text-xs text-gray-400 truncate" title={stat.subtitle}>
                {stat.subtitle}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}