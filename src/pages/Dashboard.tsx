import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { DollarSign, Settings, ArrowLeftRight, Edit, Plus, X, Lightbulb, BarChart3 } from 'lucide-react';

interface Props {
  dashboardCards: DashboardCard[];
  setDashboardCards: (cards: DashboardCard[]) => void;
}

export default function Dashboard({ dashboardCards, setDashboardCards }: Props) {
  const { transactions, loading, addTransaction, editTransaction, deleteTransaction } = useTransactions();

  const [editMode, setEditMode] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{section: 'sidebar' | 'main', index: number} | null>(null);
  const [swapMode, setSwapMode] = useState(false);
  const [firstSwapCard, setFirstSwapCard] = useState<DashboardCard | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const navigate = useNavigate();

  const filteredTransactions = transactions;

  const handleSlotClick = (section: 'sidebar' | 'main', index: number) => {
    setSelectedSlot({ section, index });
    setShowCardModal(true);
  };

  const handleCardSelect = (cardId: string) => {
    if (!selectedSlot) return;
    
    const updatedCards = dashboardCards.map(card => {
      if (card.id === cardId) {
        return { ...card, enabled: true, section: selectedSlot.section, sectionIndex: selectedSlot.index };
      }
      return card;
    });
    
    setDashboardCards(updatedCards);
    setShowCardModal(false);
    setSelectedSlot(null);
  };

  const handleCardRemove = (cardId: string) => {
    const updatedCards = dashboardCards.map(card => 
      card.id === cardId ? { ...card, enabled: false } : card
    );
    setDashboardCards(updatedCards);
  };

  const handleCardSwap = (card: DashboardCard) => {
    if (!firstSwapCard) {
      setFirstSwapCard(card);
    } else {
      const updatedCards = dashboardCards.map(c => {
        if (c.id === firstSwapCard.id) {
          return { ...c, section: card.section, sectionIndex: card.sectionIndex };
        }
        if (c.id === card.id) {
          return { ...c, section: firstSwapCard.section, sectionIndex: firstSwapCard.sectionIndex };
        }
        return c;
      });
      setDashboardCards(updatedCards);
      setFirstSwapCard(null);
    }
  };

  const renderCard = (card: DashboardCard | null, section: 'sidebar' | 'main', index: number) => {
    if (!card) {
      // Empty slot placeholder
      if (!editMode) return null;
      return (
        <div 
          onClick={() => handleSlotClick(section, index)}
          className="bg-gray-800 border-2 border-dashed border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500 hover:bg-gray-700 transition-all group"
        >
          <div className="text-gray-400 group-hover:text-purple-400 transition-colors mb-3 flex justify-center">
            <Plus className="w-8 h-8" />
          </div>
          <p className="text-gray-400 group-hover:text-gray-300 text-sm font-medium transition-colors">Add Widget</p>
          <p className="text-gray-500 text-xs mt-1">Click to add a new card</p>
        </div>
      );
    }
    
    const cardContent = (() => {
      switch (card.id) {
      case 'balance':
        return <Balance transactions={filteredTransactions} />;
      case 'chart':
        return window.innerWidth >= 1024 ? <Chart transactions={filteredTransactions} /> : null;
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
        const isInSidebar = sidebarSlots.some(c => c?.id === 'list');
        return <TransactionList 
          transactions={filteredTransactions} 
          onEditTransaction={editTransaction}
          onDeleteTransaction={deleteTransaction}
          isInSidebar={isInSidebar}
        />;
        default:
          return null;
      }
    })();

    return (
      <div className={`relative ${swapMode && firstSwapCard?.id === card.id ? 'ring-2 ring-blue-500' : ''}`}>
        <div className={editMode ? 'pointer-events-none' : ''}>
          {cardContent}
        </div>
        {editMode && (
          <div className="absolute top-2 right-2 flex gap-1 z-10">
            {swapMode ? (
              <button
                onClick={() => handleCardSwap(card)}
                className={`rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors ${
                  firstSwapCard?.id === card.id 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {firstSwapCard?.id === card.id ? '1' : '↔'}
              </button>
            ) : (
              <button
                onClick={() => handleCardRemove(card.id)}
                className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700 transition-colors"
              >
                ×
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const enabledCards = dashboardCards.filter(card => card.enabled);
  const disabledCards = dashboardCards.filter(card => !card.enabled);
  
  // Separate cards by section (filter out balance on mobile for sidebar)
  const sidebarCards = enabledCards.filter(card => {
    if (window.innerWidth < 1024 && card.id === 'balance') return false;
    return card.section === 'sidebar';
  }).sort((a, b) => (a.sectionIndex || 0) - (b.sectionIndex || 0));
  const mainCards = enabledCards.filter(card => card.section === 'main').sort((a, b) => (a.sectionIndex || 0) - (b.sectionIndex || 0));
  
  // Create arrays with placeholders for empty slots
  const sidebarSlots = editMode && sidebarCards.length === 0 
    ? [null] 
    : [...sidebarCards, ...(editMode ? [null] : [])];
  const mainSlots = editMode && mainCards.length === 0 
    ? [null] 
    : [...mainCards, ...(editMode ? [null] : [])];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-gray-900 border-r border-gray-700">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-gray-700">
            <DollarSign className="w-8 h-8 text-purple-400" />
            <h1 className="ml-3 text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Uwang
            </h1>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-3">
              Overview
            </div>
            <button
              onClick={() => setShowSettingsModal(false)}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors ${
                !showSettingsModal ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </button>
            
            {!showSettingsModal && (
              <div className="animate-slideIn" style={{animationDelay: '0.1s'}}>
                <button
                  onClick={async () => {
                    if (editMode) {
                      await setDashboardCards([...dashboardCards]);
                      setSwapMode(false);
                      setFirstSwapCard(null);
                    }
                    setEditMode(!editMode);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors ml-6 ${
                    editMode ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Edit className="w-4 h-4" />
                  <span className="text-sm">{editMode ? 'Save Layout' : 'Edit Layout'}</span>
                </button>
              </div>
            )}
            
            {editMode && !showSettingsModal && (
              <div className="animate-slideIn" style={{animationDelay: '0.2s'}}>
                <button
                  onClick={() => {
                    setSwapMode(!swapMode);
                    setFirstSwapCard(null);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors ml-6 ${
                    swapMode ? 'bg-green-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  <span className="text-sm">{swapMode ? 'Exit Swap' : 'Swap Cards'}</span>
                </button>
              </div>
            )}
            
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-3 mt-6">
              Management
            </div>
            <button 
              onClick={() => setShowSettingsModal(true)}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors ${
                showSettingsModal ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </nav>
          
          {/* Balance Summary */}
          <div className="px-4 py-4 border-t border-gray-700">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Current Balance</div>
              <div className={`text-lg font-bold ${
                (() => {
                  const income = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
                  const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
                  const balance = income - expense;
                  return balance >= 0 ? 'text-green-400' : 'text-red-400';
                })()
              }`}>
                {(() => {
                  const income = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
                  const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
                  const balance = income - expense;
                  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(balance);
                })()
                }
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Top Bar */}
        <header className="bg-gray-900 border-b border-gray-700 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center">
              <DollarSign className="w-6 h-6 text-purple-400" />
              <h1 className="ml-2 text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                Uwang
              </h1>
            </div>
            
            {/* Desktop Title */}
            <div className="hidden lg:block">
              <h2 className="text-xl font-semibold text-white">Financial Dashboard</h2>
              <p className="text-sm text-gray-400">Monitor your financial health and transactions</p>
            </div>
            
            {/* Mobile Settings */}
            <button 
              onClick={() => setShowSettingsModal(true)}
              className="lg:hidden bg-gray-800 rounded-lg p-2 border border-gray-700 hover:bg-gray-700 transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <main className="p-4 lg:p-8">
          {showSettingsModal ? (
            <div className="max-w-2xl mx-auto animate-fadeIn">
              <div className="mb-6 animate-slideIn">
                <h2 className="text-2xl font-bold text-white">Settings</h2>
                <p className="text-gray-400">Manage your application settings</p>
              </div>
              
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 animate-scaleIn" style={{animationDelay: '0.1s'}}>
                <h3 className="text-xl font-semibold text-white mb-4">Data Management</h3>
                <p className="text-gray-400 mb-4">
                  Reset all your transaction data. This action cannot be undone.
                </p>
                <button
                  onClick={() => {
                    setShowSettingsModal(false);
                    navigate('/settings');
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reset Data
                </button>
              </div>
            </div>
          ) : (
            <div className="lg:grid lg:grid-cols-4 lg:gap-6 space-y-6 lg:space-y-0 animate-fadeIn">
              {/* Sidebar Cards */}
              <div className="lg:col-span-1 space-y-6">
                {sidebarSlots.map((card, index) => (
                  <div key={`sidebar-${index}`}>
                    {renderCard(card, 'sidebar', card ? card.sectionIndex || index : sidebarCards.length)}
                  </div>
                ))}
              </div>
              
              {/* Main Cards */}
              <div className="lg:col-span-3 space-y-6">
                {/* Mobile: Only TransactionList */}
                <div className="lg:hidden">
                  <TransactionList 
                    transactions={filteredTransactions} 
                    onEditTransaction={editTransaction}
                    onDeleteTransaction={deleteTransaction}
                    isInSidebar={false}
                  />
                </div>
                
                {/* Desktop: All cards */}
                <div className="hidden lg:block space-y-6">
                  {mainSlots.map((card, index) => (
                    <div key={`main-${index}`}>
                      {renderCard(card, 'main', card ? card.sectionIndex || index : mainCards.length)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      
      {/* Mobile Floating Add Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowTransactionModal(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-2xl transition-all transform hover:scale-105 border-4 border-black"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>
        
      {/* Mobile Transaction Form Modal */}
      {showTransactionModal && (
        <div 
          className="lg:hidden fixed inset-0 flex items-end justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(10px)' }}
          onClick={() => setShowTransactionModal(false)}
        >
          <div 
            className="bg-gray-900 rounded-t-2xl w-full max-h-[85vh] overflow-y-auto border-t border-gray-700 shadow-2xl animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-white">Add Transaction</h3>
                <p className="text-sm text-gray-400">Record your income or expense</p>
              </div>
              <button
                onClick={() => setShowTransactionModal(false)}
                className="text-gray-400 hover:text-white bg-gray-800 rounded-full p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <TransactionForm 
                onAddTransaction={(transaction) => {
                  addTransaction(transaction);
                  setShowTransactionModal(false);
                }} 
              />
            </div>
          </div>
        </div>
      )}
        
        {/* Card Selection Modal */}
        {showCardModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" style={{ backdropFilter: 'blur(10px)' }}>
            <div className="bg-gray-900 rounded-xl border border-gray-700 shadow-2xl max-w-lg w-full">
              <div className="px-6 py-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white">Add Widget</h3>
                <p className="text-sm text-gray-400 mt-1">Choose a widget to add to your dashboard</p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                  {dashboardCards.filter(card => !card.enabled || card.section === undefined).map((card) => (
                    <button
                      key={card.id}
                      onClick={() => handleCardSelect(card.id)}
                      className="flex flex-col items-center gap-3 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 hover:border-purple-500 border border-gray-600 transition-all text-center group"
                    >
                      <span className="text-2xl group-hover:scale-110 transition-transform">{card.icon}</span>
                      <span className="text-gray-100 text-sm font-medium">{card.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-700">
                <button
                  onClick={() => setShowCardModal(false)}
                  className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}