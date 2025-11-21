import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Transaction } from '../types';
import { formatIDR } from '../utils/currency';
import { PieChart } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

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
      <div className="bg-gray-900 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-700 text-center">
        <div className="text-gray-300 text-4xl mb-2 flex justify-center">
          <PieChart className="w-12 h-12" />
        </div>
        <p className="text-gray-300 text-sm">Belum ada data untuk grafik</p>
      </div>
    );
  }

  const data = {
    labels: ['Pemasukan', 'Pengeluaran'],
    datasets: [
      {
        data: [income, expenses],
        backgroundColor: [
          'rgba(52, 211, 153, 0.8)',
          'rgba(248, 113, 113, 0.8)'
        ],
        borderColor: ['#34d399', '#f87171'],
        borderWidth: 2,
        hoverBackgroundColor: ['#34d399', '#f87171'],
        hoverBorderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#d1d5db',
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: '#111827',
        titleColor: '#f1f5f9',
        bodyColor: '#f1f5f9',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: (context: any) => {
            return `${context.label}: ${formatIDR(context.raw)}`;
          },
        },
      },
      datalabels: {
        color: '#ffffff',
        font: {
          weight: 'bold' as const,
          size: 12,
        },
        formatter: (value: number) => {
          return formatIDR(value);
        },
      },
    },
  };

  return (
    <div className="bg-gray-900 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-700 transition-all animate-scaleIn">
      <h3 className="font-semibold text-gray-100 mb-4 text-lg">Grafik Keuangan</h3>
      <div className="h-48 sm:h-56">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
}