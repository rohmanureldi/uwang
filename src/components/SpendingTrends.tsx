import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Transaction } from '../types';
import { formatIDR } from '../utils/currency';
import { TrendingUp, BarChart3 } from 'lucide-react';

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
    const balance = income - expenses;
    return { month: month.label, balance, income, expenses };
  });

  // Check if there's any data to display
  const hasData = monthlyData.some(d => d.balance !== 0);
  
  if (!hasData) {
    return (
      <div className="bg-gray-900 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-700 animate-scaleIn">
        <h3 className="font-semibold text-gray-100 mb-4 text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" /> Tren 6 Bulan
        </h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-300 text-4xl mb-2 flex justify-center">
              <BarChart3 className="w-12 h-12" />
            </div>
            <p className="text-gray-300 text-sm">Belum ada data untuk grafik tren</p>
          </div>
        </div>
      </div>
    );
  }

  const data = {
    labels: monthlyData.map(d => d.month),
    datasets: [
      {
        label: '',
        data: monthlyData.map(d => d.balance),
        borderColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
          gradient.addColorStop(0, '#8b5cf6');
          gradient.addColorStop(1, '#ec4899');
          return gradient;
        },
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
          gradient.addColorStop(1, 'rgba(139, 92, 246, 0.05)');
          return gradient;
        },
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#8b5cf6',
        pointRadius: 6,
        pointHoverRadius: 8,
        borderWidth: 3,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        display: false
      },
      datalabels: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#f1f5f9',
        bodyColor: '#f1f5f9',
        borderColor: '#6366f1',
        borderWidth: 1,
        cornerRadius: 12,
        padding: 12,
        titleAlign: 'left',
        bodyAlign: 'left',
        rtl: false,
        textDirection: 'ltr',
        displayColors: false,
        callbacks: {
          title: (context: any) => context[0].label,
          label: () => null,
          afterLabel: (context: any) => {
            const dataIndex = context.dataIndex;
            const monthData = monthlyData[dataIndex];
            return [
              `Income: ${formatIDR(monthData.income)}`,
              `Expenses: ${formatIDR(monthData.expenses)}`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { 
          color: '#9ca3af',
          font: { size: 11 },
          maxTicksLimit: 5
        },
        grid: { 
          color: 'rgba(55, 65, 81, 0.3)',
          drawBorder: false
        },
        border: { display: false }
      },
      x: {
        ticks: { 
          color: '#9ca3af',
          font: { size: 11 }
        },
        grid: { 
          display: false
        },
        border: { display: false }
      }
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl p-4 sm:p-6 shadow-2xl border border-gray-700 animate-scaleIn relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none"></div>
      <div className="relative z-10">
        <h3 className="font-semibold text-gray-100 mb-4 text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" /> Tren 6 Bulan
        </h3>
        <div className="h-64 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent pointer-events-none rounded-lg"></div>
          <Line data={data} options={options} />
        </div>
      </div>
    </div>
  );
}