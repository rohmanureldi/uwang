import { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Transaction } from './types';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Balance from './components/Balance';
import Chart from './components/Chart';
import QuickStats from './components/QuickStats';
import BudgetTracker from './components/BudgetTracker';
import SavingsGoals from './components/SavingsGoals';
import SpendingTrends from './components/SpendingTrends';
import CategoryBreakdown from './components/CategoryBreakdown';
import FinancialHealth from './components/FinancialHealth';
import SpendingInsights from './components/SpendingInsights';
import DashboardCustomizer, { DashboardCard } from './components/DashboardCustomizer';
import DraggableCard from './components/DraggableCard';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [viewMode, setViewMode] = useState<'all' | 'month'>('month');
  const [dashboardCards, setDashboardCards] = useState<DashboardCard[]>(() => {
    const defaultCards = [
      { id: 'balance', name: 'Balance', icon: '💰', enabled: true },
      { id: 'chart', name: 'Chart', icon: '📊', enabled: true },
      { id: 'quickstats', name: 'Quick Stats', icon: '⚡', enabled: true },
      { id: 'health', name: 'Financial Health', icon: '🏥', enabled: false },
      { id: 'insights', name: 'Spending Insights', icon: '🔍', enabled: false },
      { id: 'trends', name: 'Spending Trends', icon: '📈', enabled: false },
      { id: 'breakdown', name: 'Category Breakdown', icon: '📊', enabled: false },
      { id: 'budget', name: 'Budget Tracker', icon: '💰', enabled: false },
      { id: 'savings', name: 'Savings Goals', icon: '🎯', enabled: false },
      { id: 'form', name: 'Tambah Transaksi', icon: '➕', enabled: true },
      { id: 'list', name: 'Riwayat Transaksi', icon: '📝', enabled: true }
    ];
    
    const saved = localStorage.getItem('dashboardCards');
    if (saved) {
      const savedCards = JSON.parse(saved);
      // Ensure form and list cards exist and are enabled
      const hasForm = savedCards.find((c: DashboardCard) => c.id === 'form');
      const hasList = savedCards.find((c: DashboardCard) => c.id === 'list');
      
      if (!hasForm) {
        savedCards.push({ id: 'form', name: 'Tambah Transaksi', icon: '➕', enabled: true });
      }
      if (!hasList) {
        savedCards.push({ id: 'list', name: 'Riwayat Transaksi', icon: '📝', enabled: true });
      }
      
      return savedCards;
    }
    
    return defaultCards;
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const saved = localStorage.getItem('transactions');
    if (saved) {
      setTransactions(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('dashboardCards', JSON.stringify(dashboardCards));
  }, [dashboardCards]);
  
  // Ensure form and list are always enabled on mount
  useEffect(() => {
    setDashboardCards(prev => prev.map(card => 
      (card.id === 'form' || card.id === 'list') ? { ...card, enabled: true } : card
    ));
  }, []);

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

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setDashboardCards((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const renderCard = (card: DashboardCard) => {
    if (!card.enabled) return null;
    
    switch (card.id) {
      case 'balance':
        return <Balance transactions={filteredTransactions} />;
      case 'chart':
        return <Chart transactions={filteredTransactions} />;
      case 'quickstats':
        return <QuickStats transactions={filteredTransactions} />;
      case 'health':
        return <FinancialHealth transactions={transactions} />;
      case 'insights':
        return <SpendingInsights transactions={transactions} />;
      case 'trends':
        return <SpendingTrends transactions={transactions} />;
      case 'breakdown':
        return <CategoryBreakdown transactions={filteredTransactions} />;
      case 'budget':
        return <BudgetTracker transactions={transactions} />;
      case 'savings':
        return <SavingsGoals />;
      case 'form':
        return <TransactionForm onAddTransaction={addTransaction} />;
      case 'list':
        return <TransactionList 
          transactions={filteredTransactions} 
          onEditTransaction={editTransaction}
          onDeleteTransaction={deleteTransaction}
        />;
      default:
        return null;
    }
  };

  const enabledCards = dashboardCards.filter(card => card.enabled);
  const sidebarCards = enabledCards.filter(card => ['balance', 'chart', 'budget', 'savings'].includes(card.id));
  const mainCards = enabledCards.filter(card => !['balance', 'chart', 'budget', 'savings'].includes(card.id));
  


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
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sidebarCards.map(c => c.id)} strategy={verticalListSortingStrategy}>
                {sidebarCards.map((card) => (
                  <DraggableCard key={card.id} id={card.id}>
                    {renderCard(card)}
                  </DraggableCard>
                ))}
              </SortableContext>
            </DndContext>
          </div>
          <div className="lg:col-span-3 space-y-6 animate-slideIn" style={{animationDelay: '0.1s'}}>
            {/* Mobile: Form always on top */}
            <div className="lg:hidden space-y-6">
              <TransactionForm onAddTransaction={addTransaction} />
              <TransactionList 
                transactions={filteredTransactions} 
                onEditTransaction={editTransaction}
                onDeleteTransaction={deleteTransaction}
              />
            </div>
            
            {/* Large devices: All cards draggable */}
            <div className="hidden lg:block">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={mainCards.map(c => c.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-6">
                    {mainCards.map((card) => (
                      <DraggableCard key={card.id} id={card.id}>
                        {renderCard(card)}
                      </DraggableCard>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </div>
        </div>
        
        <DashboardCustomizer 
          cards={dashboardCards}
          onCardsChange={setDashboardCards}
        />
      </div>
    </div>
  );
}

export default App;