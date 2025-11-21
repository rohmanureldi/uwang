import { Doughnut } from 'react-chartjs-2';
import { useMemo } from 'react';
import { Transaction } from '../types';
import { formatIDR } from '../utils/currency';
import { PieChart, TrendingUp, DollarSign, TrendingDown } from 'lucide-react';

interface Props {
  transactions: Transaction[];
}

export default function CategoryCharts({ transactions }: Props) {
  console.log('CategoryCharts component rendered with transactions:', transactions);
  
  const { incomeByCategory, expenseByCategory } = useMemo(() => {
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    
    console.log('All transactions:', transactions.length);
    console.log('Income transactions:', incomeTransactions.length, incomeTransactions);
    console.log('Expense transactions:', expenseTransactions.length);
    
    const income = incomeTransactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const expense = expenseTransactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('Income by category:', income);
    console.log('Expense by category:', expense);

    return { incomeByCategory: income, expenseByCategory: expense };
  }, [transactions]);

  const createChartData = (categoryData: Record<string, number>, colors: string[]) => {
    const labels = Object.keys(categoryData);
    const data = Object.values(categoryData);
    return {
      labels,
      datasets: [{
        data,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 2,
        borderColor: '#374151',
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#d1d5db',
          usePointStyle: true,
          padding: 15,
          font: { size: 11 }
        },
        onHover: (event: any, legendItem: any, legend: any) => {
          const chart = legend.chart;
          const canvas = chart.canvas;
          const rect = canvas.getBoundingClientRect();
          const value = chart.data.datasets[0].data[legendItem.index];
          const label = chart.data.labels[legendItem.index];
          
          // Create or update tooltip
          let tooltip = document.getElementById('legend-tooltip');
          if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'legend-tooltip';
            tooltip.style.cssText = `
              position: fixed;
              background: #1e293b;
              color: #f1f5f9;
              padding: 8px 12px;
              border-radius: 6px;
              border: 1px solid #475569;
              font-size: 12px;
              pointer-events: none;
              z-index: 1000;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            `;
            document.body.appendChild(tooltip);
          }
          
          tooltip.innerHTML = `${label}: ${formatIDR(value)}`;
          tooltip.style.left = event.native.clientX + 10 + 'px';
          tooltip.style.top = event.native.clientY - 10 + 'px';
          tooltip.style.display = 'block';
        },
        onLeave: () => {
          const tooltip = document.getElementById('legend-tooltip');
          if (tooltip) {
            tooltip.style.display = 'none';
          }
        },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f1f5f9',
        bodyColor: '#f1f5f9',
        borderColor: '#475569',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: (context: any) => `${context.label}: ${formatIDR(context.raw)}`,
        },
      },
      datalabels: {
        color: '#ffffff',
        font: { weight: 'bold' as const, size: 10 },
        formatter: (value: number, context: any) => {
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(0);
          return percentage > 5 ? `${percentage}%` : '';
        },
      },
    },
  };

  const incomeColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#06b6d4', '#84cc16', '#f97316'];
  const expenseColors = ['#ef4444', '#ec4899', '#8b5cf6', '#f59e0b', '#06b6d4', '#84cc16', '#6366f1'];

  if (Object.keys(incomeByCategory).length === 0 && Object.keys(expenseByCategory).length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-700 animate-scaleIn">
        <h3 className="font-semibold text-gray-100 mb-4 text-lg flex items-center gap-2">
          <PieChart className="w-5 h-5 text-purple-400" /> Grafik Kategori
        </h3>
        <div className="text-center py-8">
          <div className="text-gray-300 text-4xl mb-2 flex justify-center">
            <TrendingUp className="w-12 h-12" />
          </div>
          <p className="text-gray-300 text-sm">Belum ada data untuk grafik kategori</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-700 animate-scaleIn">
      <h3 className="font-semibold text-gray-100 mb-4 text-lg flex items-center gap-2">
        <PieChart className="w-5 h-5 text-purple-400" /> Grafik Kategori
      </h3>
      
      <div className={`grid gap-6 ${
        Object.keys(incomeByCategory).length > 0 && Object.keys(expenseByCategory).length > 0 
          ? 'grid-cols-1 lg:grid-cols-2' 
          : 'grid-cols-1 place-items-center'
      }`}>
        {Object.keys(incomeByCategory).length > 0 && (
          <div key="income-chart">
            <h4 className="text-green-400 font-medium mb-3 text-center flex items-center justify-center gap-2">
              <DollarSign className="w-4 h-4" /> Pemasukan
            </h4>
            <div className="h-48">
              <Doughnut 
                key={`income-${Object.keys(incomeByCategory).join('-')}`}
                data={createChartData(incomeByCategory, incomeColors)} 
                options={chartOptions} 
              />
            </div>
          </div>
        )}
        
        {Object.keys(expenseByCategory).length > 0 && (
          <div key="expense-chart">
            <h4 className="text-red-400 font-medium mb-3 text-center flex items-center justify-center gap-2">
              <TrendingDown className="w-4 h-4" /> Pengeluaran
            </h4>
            <div className="h-48">
              <Doughnut 
                key={`expense-${Object.keys(expenseByCategory).join('-')}`}
                data={createChartData(expenseByCategory, expenseColors)} 
                options={chartOptions} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}