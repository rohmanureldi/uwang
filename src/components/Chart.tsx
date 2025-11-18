import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Transaction } from '../types';
import { formatIDR } from '../utils/currency';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  transactions: Transaction[];
}

export default function Chart({ transactions }: Props) {
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  if (income === 0 && expenses === 0) {
    return (
      <div className="bg-slate-700 rounded-xl p-4 sm:p-6 shadow-lg border border-slate-600 text-center">
        <div className="text-gray-400 text-4xl mb-2">📊</div>
        <p className="text-gray-400 text-sm">Belum ada data untuk grafik</p>
      </div>
    );
  }

  const data = {
    labels: ['Pemasukan', 'Pengeluaran'],
    datasets: [
      {
        data: [income, expenses],
        backgroundColor: ['#34d399', '#f87171'],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#d1d5db',
        },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f1f5f9',
        bodyColor: '#f1f5f9',
        borderColor: '#475569',
        borderWidth: 1,
        callbacks: {
          label: (context: any) => {
            return `${context.label}: ${formatIDR(context.raw)}`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-slate-700 rounded-xl p-4 sm:p-6 shadow-lg border border-slate-600 transition-all animate-scaleIn">
      <h3 className="font-semibold text-gray-100 mb-4 text-lg">Grafik Keuangan</h3>
      <div className="h-48 sm:h-56">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
}