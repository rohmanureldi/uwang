import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Transaction } from '../types';
import { formatIDR } from '../utils/currency';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Props {
  transactions: Transaction[];
}

export default function SpendingTrends({ transactions }: Props) {
  const getLast6Months = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push({
        key: date.toISOString().slice(0, 7),
        label: date.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
      });
    }
    return months;
  };

  const months = getLast6Months();
  
  const monthlyData = months.map(month => {
    const monthTransactions = transactions.filter(t => t.date.startsWith(month.key));
    const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { month: month.label, income, expenses };
  });

  // Check if there's any data to display
  const hasData = monthlyData.some(d => d.income > 0 || d.expenses > 0);
  
  if (!hasData) {
    return (
      <div className="bg-slate-700 rounded-xl p-4 sm:p-6 shadow-lg border border-slate-600 animate-scaleIn">
        <h3 className="font-semibold text-gray-100 mb-4 text-lg">📈 Tren 6 Bulan</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 text-4xl mb-2">📊</div>
            <p className="text-gray-400 text-sm">Belum ada data untuk grafik tren</p>
          </div>
        </div>
      </div>
    );
  }

  const data = {
    labels: monthlyData.map(d => d.month),
    datasets: [
      {
        label: 'Pemasukan',
        data: monthlyData.map(d => d.income),
        borderColor: '#34d399',
        backgroundColor: 'rgba(52, 211, 153, 0.1)',
        tension: 0.4,
        fill: false,
        pointBackgroundColor: '#34d399',
        pointBorderColor: '#34d399',
        pointRadius: 4,
      },
      {
        label: 'Pengeluaran',
        data: monthlyData.map(d => d.expenses),
        borderColor: '#f87171',
        backgroundColor: 'rgba(248, 113, 113, 0.1)',
        tension: 0.4,
        fill: false,
        pointBackgroundColor: '#f87171',
        pointBorderColor: '#f87171',
        pointRadius: 4,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#d1d5db', usePointStyle: true }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f1f5f9',
        bodyColor: '#f1f5f9',
        borderColor: '#475569',
        borderWidth: 1,
        callbacks: {
          label: (context: any) => `${context.dataset.label}: ${formatIDR(context.raw)}`
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
        ticks: { color: '#9ca3af' },
        grid: { color: '#374151' }
      }
    }
  };

  return (
    <div className="bg-slate-700 rounded-xl p-4 sm:p-6 shadow-lg border border-slate-600 animate-scaleIn">
      <h3 className="font-semibold text-gray-100 mb-4 text-lg">📈 Tren 6 Bulan</h3>
      <div className="h-64">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}