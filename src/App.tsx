import { useState, useEffect } from 'react';
import { Transaction } from './types';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Balance from './components/Balance';
import Chart from './components/Chart';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

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

  return (
    <div className="min-h-screen bg-slate-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-sm sm:max-w-md lg:max-w-6xl mx-auto">
        <div className="text-center py-6 lg:py-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text">Uwang</h1>
          <p className="text-gray-400 text-sm lg:text-base">Kelola Keuangan Rumah Tangga</p>
        </div>
        
        <div className="lg:grid lg:grid-cols-4 lg:gap-6 space-y-6 lg:space-y-0">
          <div className="lg:col-span-1 space-y-6">
            <Balance transactions={transactions} />
            <Chart transactions={transactions} />
          </div>
          <div className="lg:col-span-3 space-y-6">
            <TransactionForm onAddTransaction={addTransaction} />
            <TransactionList 
              transactions={transactions} 
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