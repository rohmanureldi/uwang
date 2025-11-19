import { Transaction } from '../types';
import { formatIDR } from '../utils/currency';

interface Props {
  transactions: Transaction[];
}

export default function FinancialHealth({ transactions }: Props) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
  
  const income = monthlyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expenses = monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
  const expenseRatio = income > 0 ? (expenses / income) * 100 : 0;
  
  const getHealthScore = () => {
    let score = 50; // Base score
    
    // Savings rate scoring (40 points max)
    if (savingsRate >= 20) score += 40;
    else if (savingsRate >= 10) score += 30;
    else if (savingsRate >= 5) score += 20;
    else if (savingsRate >= 0) score += 10;
    else score -= 20; // Negative savings
    
    // Expense ratio scoring (30 points max)
    if (expenseRatio <= 50) score += 30;
    else if (expenseRatio <= 70) score += 20;
    else if (expenseRatio <= 90) score += 10;
    else score -= 10;
    
    // Transaction consistency (20 points max)
    const transactionDays = new Set(monthlyTransactions.map(t => t.date)).size;
    if (transactionDays >= 15) score += 20;
    else if (transactionDays >= 10) score += 15;
    else if (transactionDays >= 5) score += 10;
    
    return Math.max(0, Math.min(100, score));
  };

  const healthScore = getHealthScore();
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Sangat Sehat 🌟';
    if (score >= 60) return 'Sehat 👍';
    if (score >= 40) return 'Cukup ⚠️';
    return 'Perlu Perbaikan 🚨';
  };

  const insights = [];
  
  if (savingsRate < 10) {
    insights.push('💡 Coba tingkatkan tabungan minimal 10% dari pendapatan');
  }
  if (expenseRatio > 80) {
    insights.push('💡 Pengeluaran terlalu tinggi, coba kurangi 10-20%');
  }
  if (income === 0) {
    insights.push('💡 Tambahkan sumber pemasukan untuk analisis yang lebih baik');
  }
  if (savingsRate >= 20) {
    insights.push('🎉 Tingkat tabungan sangat baik! Pertahankan');
  }

  return (
    <div className="bg-slate-700 rounded-xl p-4 sm:p-6 shadow-lg border border-slate-600 animate-scaleIn">
      <h3 className="font-semibold text-gray-100 mb-4 text-lg">🏥 Kesehatan Finansial</h3>
      
      <div className="text-center mb-4">
        <div className={`text-4xl font-bold ${getScoreColor(healthScore)} mb-2`}>
          {healthScore}/100
        </div>
        <p className={`text-sm font-semibold ${getScoreColor(healthScore)}`}>
          {getScoreLabel(healthScore)}
        </p>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Tingkat Tabungan</span>
          <span className={savingsRate >= 10 ? 'text-green-400' : 'text-red-400'}>
            {savingsRate.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-slate-600 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              savingsRate >= 10 ? 'bg-green-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Rasio Pengeluaran</span>
          <span className={expenseRatio <= 70 ? 'text-green-400' : 'text-red-400'}>
            {expenseRatio.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-slate-600 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              expenseRatio <= 70 ? 'bg-green-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(expenseRatio, 100)}%` }}
          ></div>
        </div>
      </div>

      {insights.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-400 font-semibold">Saran:</p>
          {insights.map((insight, index) => (
            <p key={index} className="text-xs text-gray-300 bg-slate-600 p-2 rounded">
              {insight}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}