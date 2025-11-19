import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Transaction } from '../types';
import { formatIDR } from '../utils/currency';
import { getCategoryIcon } from '../utils/categoryIcons';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
  transactions: Transaction[];
}

export default function CategoryBreakdown({ transactions }: Props) {
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  
  const categoryTotals = expenseTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8);

  if (sortedCategories.length === 0) {
    return (
      <div className="bg-slate-700 rounded-xl p-4 sm:p-6 shadow-lg border border-slate-600 text-center">
        <div className="text-gray-400 text-4xl mb-2">📊</div>
        <p className="text-gray-400 text-sm">Belum ada data pengeluaran</p>
      </div>
    );
  }

  const data = {
    labels: sortedCategories.map(([cat]) => `${getCategoryIcon(cat)} ${cat}`),
    datasets: [{
      label: 'Pengeluaran',
      data: sortedCategories.map(([,amount]) => amount),
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(245, 101, 101, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(252, 211, 77, 0.8)',
        'rgba(34, 197, 94, 0.8)'
      ],
      borderColor: [
        '#6366f1', '#a855f7', '#ec4899', '#ef4444',
        '#f56565', '#fb9560', '#fcd34d', '#22c55e'
      ],
      borderWidth: 2,
      borderRadius: 4,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f1f5f9',
        bodyColor: '#f1f5f9',
        borderColor: '#475569',
        borderWidth: 1,
        callbacks: {
          label: (context: any) => formatIDR(context.raw)
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#9ca3af' },
        grid: { color: '#374151' }
      },
      x: {
        ticks: { color: '#9ca3af', maxRotation: 45 },
        grid: { display: false }
      }
    }
  };

  return (
    <div className="bg-slate-700 rounded-xl p-4 sm:p-6 shadow-lg border border-slate-600 animate-scaleIn">
      <h3 className="font-semibold text-gray-100 mb-4 text-lg">📊 Breakdown Kategori</h3>
      <div className="h-64">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}