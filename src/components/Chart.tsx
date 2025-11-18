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
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border text-center">
        <div className="text-gray-400 text-4xl mb-2">📊</div>
        <p className="text-gray-500 text-sm">Belum ada data untuk grafik</p>
      </div>
    );
  }

  const data = {
    labels: ['Pemasukan', 'Pengeluaran'],
    datasets: [
      {
        data: [income, expenses],
        backgroundColor: ['#10b981', '#ef4444'],
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
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.label}: ${formatIDR(context.raw)}`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
      <h3 className="font-semibold text-gray-900 mb-4 text-lg">Grafik Keuangan</h3>
      <div className="h-48 sm:h-56">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
}