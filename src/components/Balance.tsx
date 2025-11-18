import { Transaction } from '../types';
import { formatIDR } from '../utils/currency';

interface Props {
  transactions: Transaction[];
}

export default function Balance({ transactions }: Props) {
  const balance = transactions.reduce((total, transaction) => {
    return transaction.type === 'income' 
      ? total + transaction.amount 
      : total - transaction.amount;
  }, 0);

  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border h-fit">
      <div className="text-center">
        <p className="text-gray-600 text-sm mb-2">Saldo</p>
        <p className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatIDR(balance)}
        </p>
      </div>
      
      <div className="flex justify-between mt-4 sm:mt-6 pt-4 border-t gap-4">
        <div className="text-center flex-1">
          <p className="text-xs text-gray-500">Pemasukan</p>
          <p className="text-green-600 font-semibold text-sm sm:text-base">{formatIDR(income)}</p>
        </div>
        <div className="text-center flex-1">
          <p className="text-xs text-gray-500">Pengeluaran</p>
          <p className="text-red-600 font-semibold text-sm sm:text-base">{formatIDR(expenses)}</p>
        </div>
      </div>
    </div>
  );
}