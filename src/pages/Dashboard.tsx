import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useTransactions } from '../hooks/useTransactions';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import Balance from '../components/Balance';
import Chart from '../components/Chart';
import QuickStats from '../components/QuickStats';
import BudgetTracker from '../components/BudgetTracker';
import SavingsGoals from '../components/SavingsGoals';
import SpendingTrends from '../components/SpendingTrends';
import FinancialHealth from '../components/FinancialHealth';
import SpendingInsights from '../components/SpendingInsights';
import CategoryCharts from '../components/CategoryCharts';
import { DashboardCard } from '../components/DashboardCustomizer';
import DraggableCard from '../components/DraggableCard';

interface Props {
  dashboardCards: DashboardCard[];
  setDashboardCards: (cards: DashboardCard[]) => void;
}

export default function Dashboard({ dashboardCards, setDashboardCards }: Props) {
  const { transactions, loading, addTransaction, editTransaction, deleteTransaction } = useTransactions();
  const [viewMode, setViewMode] = useState<'all' | 'month'>('month');
  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getFilteredTransactions = () => {
    if (viewMode === 'month') {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      return transactions.filter(t => {
        const transactionDate = new Date(t.date + 'T00:00:00');
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
      case 'categorycharts':
        return <CategoryCharts transactions={filteredTransactions} />;
      case 'health':
        return <FinancialHealth transactions={transactions} />;
      case 'insights':
        return <SpendingInsights transactions={transactions} />;
      case 'trends':
        return <SpendingTrends transactions={transactions} />;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-800 p-3 sm:p-4 lg:p-8">
      <div className="max-w-full sm:max-w-md lg:max-w-6xl mx-auto">
        <div className="text-center py-4 lg:py-8 animate-fadeIn">
          <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">💰 Uwang</h1>
          <p className="text-gray-400 text-xs sm:text-sm lg:text-base">Kelola Keuangan Rumah Tangga</p>
          
          <div className="lg:hidden mt-2 mb-3">
            <div className="bg-blue-900 bg-opacity-30 border border-blue-600 rounded-lg p-2 mx-4">
              <p className="text-blue-300 text-xs">
                💡 <strong>Tip:</strong> Akses dari desktop untuk fitur lengkap seperti analytics, budgeting, dan drag & drop!
              </p>
            </div>
          </div>
          
          <div className="flex justify-center items-center gap-4 mt-3">
            <div className="bg-slate-700 rounded-lg p-1 border border-slate-600 shadow-lg">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-2 rounded text-xs sm:text-sm transition-all duration-300 ${
                  viewMode === 'month' 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-slate-600'
                }`}
              >
                📅 Bulan Ini
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={`px-3 py-2 rounded text-xs sm:text-sm transition-all duration-300 ${
                  viewMode === 'all' 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-slate-600'
                }`}
              >
                📊 Semua
              </button>
            </div>
            
            <div 
              onClick={() => navigate('/settings')}
              className="bg-slate-700 rounded-lg p-1 border border-slate-600 shadow-lg cursor-pointer hover:bg-slate-600 transition-colors"
            >
              <div className="px-3 py-2 text-xs sm:text-sm text-gray-400 hover:text-white transition-colors select-none">
                ⚙️ Settings
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:grid lg:grid-cols-4 lg:gap-6 space-y-4 lg:space-y-0">
          <div className="lg:col-span-1 space-y-4 lg:space-y-6 animate-slideIn">
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
          <div className="lg:col-span-3 space-y-4 lg:space-y-6 animate-slideIn" style={{animationDelay: '0.1s'}}>
            {/* Mobile: Form always on top */}
            <div className="lg:hidden space-y-4">
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
      </div>
    </div>
  );
}