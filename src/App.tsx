import { useState, useEffect } from 'react';
import { Transaction } from './types';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Balance from './components/Balance';
import Chart from './components/Chart';
import QuickStats from './components/QuickStats';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [viewMode, setViewMode] = useState<'all' | 'month'>('month');

  useEffect(() => {
    const saved = localStorage.getItem('transactions');
    if (saved) {
      setTransactions(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: Date.now().toString()
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const editTransaction = (id: string, transactionData: Omit<Transaction, 'id'>) => {
    setTransactions(prev => 
      prev.map(t => t.id === id ? { ...transactionData, id } : t)
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const getFilteredTransactions = () => {
    if (viewMode === 'month') {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      return transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
      });
    }
    return transactions;
  };

  const filteredTransactions = getFilteredTransactions();

  return (
    <div className="min-h-screen bg-slate-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-sm sm:max-w-md lg:max-w-6xl mx-auto">
        <div className="text-center py-6 lg:py-8 animate-fadeIn">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">💰 Uwang</h1>
          <p className="text-gray-400 text-sm lg:text-base">Kelola Keuangan Rumah Tangga</p>
          
          <div className="flex justify-center mt-4">
            <div className="bg-slate-700 rounded-lg p-1 border border-slate-600 shadow-lg">
              <button
                onClick={() => setViewMode('month')}
                className={`px-4 py-2 rounded text-sm transition-all duration-300 transform ${
                  viewMode === 'month' 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105' 
                    : 'text-gray-400 hover:text-white hover:bg-slate-600'
                }`}
              >
                📅 Bulan Ini
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={`px-4 py-2 rounded text-sm transition-all duration-300 transform ${
                  viewMode === 'all' 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105' 
                    : 'text-gray-400 hover:text-white hover:bg-slate-600'
                }`}
              >
                📊 Semua
              </button>
            </div>
          </div>
        </div>
        
        <div className="lg:grid lg:grid-cols-4 lg:gap-6 space-y-6 lg:space-y-0">
          <div className="lg:col-span-1 space-y-6 animate-slideIn">
            <Balance transactions={filteredTransactions} />
            <Chart transactions={filteredTransactions} />
          </div>
          <div className="lg:col-span-3 space-y-6 animate-slideIn" style={{animationDelay: '0.1s'}}>
            <QuickStats transactions={filteredTransactions} />
            <TransactionForm onAddTransaction={addTransaction} />
            <TransactionList 
              transactions={filteredTransactions} 
              onEditTransaction={editTransaction}
              onDeleteTransaction={deleteTransaction}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;