import { Transaction } from '../types';
import { formatIDR } from '../utils/currency';
import { getCategoryIcon } from '../utils/categoryIcons';
import { Search } from 'lucide-react';

interface Props {
  transactions: Transaction[];
}

export default function SpendingInsights({ transactions }: Props) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);
  
  const currentExpenses = transactions.filter(t => t.type === 'expense' && t.date.startsWith(currentMonth));
  const lastMonthExpenses = transactions.filter(t => t.type === 'expense' && t.date.startsWith(lastMonth));
  
  const currentTotal = currentExpenses.reduce((sum, t) => sum + t.amount, 0);
  const lastMonthTotal = lastMonthExpenses.reduce((sum, t) => sum + t.amount, 0);
  
  const spendingChange = lastMonthTotal > 0 ? ((currentTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;
  
  // Category comparison
  const currentCategories = currentExpenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);
  
  const lastMonthCategories = lastMonthExpenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);
  
  const categoryChanges = Object.keys({...currentCategories, ...lastMonthCategories}).map(category => {
    const current = currentCategories[category] || 0;
    const last = lastMonthCategories[category] || 0;
    const change = last > 0 ? ((current - last) / last) * 100 : (current > 0 ? 100 : 0);
    return { category, current, last, change };
  }).sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 5);

  const insights = [];
  
  if (Math.abs(spendingChange) > 20) {
    const direction = spendingChange > 0 ? 'naik' : 'turun';
    insights.push(`📊 Pengeluaran ${direction} ${Math.abs(spendingChange).toFixed(0)}% dari bulan lalu`);
  }
  
  const biggestIncrease = categoryChanges.find(c => c.change > 50);
  if (biggestIncrease) {
    insights.push(`📈 ${biggestIncrease.category} naik signifikan ${biggestIncrease.change.toFixed(0)}%`);
  }
  
  const biggestDecrease = categoryChanges.find(c => c.change < -30);
  if (biggestDecrease) {
    insights.push(`📉 Berhasil kurangi ${biggestDecrease.category} sebesar ${Math.abs(biggestDecrease.change).toFixed(0)}%`);
  }

  if (insights.length === 0) {
    insights.push('📊 Pola pengeluaran cukup stabil bulan ini');
  }

  return (
    <div className="bg-gray-900 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-700 animate-scaleIn">
      <h3 className="font-semibold text-gray-100 mb-4 text-lg flex items-center gap-2">
        <Search className="w-5 h-5 text-purple-400" /> Insight Pengeluaran
      </h3>
      
      <div className="mb-4 p-3 bg-gray-800 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-300 text-sm">Perubahan Total</span>
          <span className={`text-sm font-semibold ${spendingChange > 0 ? 'text-red-400' : 'text-green-400'}`}>
            {spendingChange > 0 ? '+' : ''}{spendingChange.toFixed(1)}%
          </span>
        </div>
        <div className="text-xs text-gray-400">
          {formatIDR(lastMonthTotal)} → {formatIDR(currentTotal)}
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <p className="text-sm font-semibold text-gray-300">Perubahan per Kategori:</p>
        {categoryChanges.slice(0, 3).map(({ category, change }) => (
          <div key={category} className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              {(() => {
                const IconComponent = getCategoryIcon(category);
                return <IconComponent className="w-4 h-4 text-purple-400" />;
              })()}
              <span className="text-gray-300">{category}</span>
            </div>
            <span className={`font-semibold ${change > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {change > 0 ? '+' : ''}{change.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-xs text-gray-300 font-semibold">Insight:</p>
        {insights.map((insight, index) => (
          <p key={index} className="text-xs text-gray-300 bg-gray-800 p-2 rounded">
            {insight}
          </p>
        ))}
      </div>
    </div>
  );
}