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
          className="bg-slate-600 border-2 border-dashed border-slate-500 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-500 hover:bg-slate-500 transition-all"
        >
          <div className="text-gray-400 text-2xl mb-2">+</div>
          <p className="text-gray-400 text-sm">Add Card</p>
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
        {/* Mobile Top Bar */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between p-4">
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">💰 Uwang</h1>
              <p className="text-sm text-gray-300">
                {(() => {
                  const income = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
                  const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
                  const balance = income - expense;
                  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(balance);
                })()
                }
              </p>
            </div>
            <button 
              onClick={() => navigate('/settings')}
              className="bg-slate-700 rounded-lg p-2 border border-slate-600 shadow-lg hover:bg-slate-600 transition-colors"
            >
              <span className="text-gray-400 hover:text-white text-lg">⚙️</span>
            </button>
          </div>
          <div className="bg-blue-900 bg-opacity-30 border border-blue-600 rounded-lg p-2 mx-4 mb-4">
            <p className="text-blue-300 text-xs">
              💡 <strong>Tip:</strong> Akses dari desktop untuk fitur lengkap seperti analytics, budgeting, dan drag & drop!
            </p>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block text-center py-4 lg:py-8 animate-fadeIn">
          <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">💰 Uwang</h1>
          <p className="text-gray-400 text-xs sm:text-sm lg:text-base">Kelola Keuangan Rumah Tangga</p>
          
          <div className="flex justify-center items-center gap-4 mt-3">
            <div 
              onClick={() => navigate('/settings')}
              className="bg-slate-700 rounded-lg p-1 border border-slate-600 shadow-lg cursor-pointer hover:bg-slate-600 transition-colors"
            >
              <div className="px-3 py-2 text-xs sm:text-sm text-gray-400 hover:text-white transition-colors select-none">
                ⚙️ Settings
              </div>
            </div>
            
            <div className="flex gap-2">
              {editMode && (
                <div 
                  onClick={() => {
                    setSwapMode(!swapMode);
                    setFirstSwapCard(null);
                  }}
                  className={`rounded-lg p-1 border border-slate-600 shadow-lg cursor-pointer transition-colors ${
                    swapMode ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  <div className={`px-3 py-2 text-xs sm:text-sm transition-colors select-none ${
                    swapMode ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`}>
                    ↔️ {swapMode ? 'Remove Mode' : 'Swap Mode'}
                  </div>
                </div>
              )}
              <div 
                onClick={async () => {
                  if (editMode) {
                    await setDashboardCards([...dashboardCards]);
                    setSwapMode(false);
                    setFirstSwapCard(null);
                  }
                  setEditMode(!editMode);
                }}
                className={`rounded-lg p-1 border border-slate-600 shadow-lg cursor-pointer transition-colors ${
                  editMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                <div className={`px-3 py-2 text-xs sm:text-sm transition-colors select-none ${
                  editMode ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}>
                  ✏️ {editMode ? 'Done' : 'Edit'}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:grid lg:grid-cols-4 lg:gap-6 space-y-4 lg:space-y-0">
          <div className="lg:col-span-1 space-y-4 lg:space-y-6 animate-slideIn">
            {sidebarSlots.map((card, index) => (
              <div key={`sidebar-${index}`}>
                {renderCard(card, 'sidebar', card ? card.sectionIndex || index : sidebarCards.length)}
              </div>
            ))}
          </div>
          <div className="lg:col-span-3 space-y-4 lg:space-y-6 animate-slideIn" style={{animationDelay: '0.1s'}}>
            {/* Mobile: Only TransactionList */}
            <div className="lg:hidden space-y-4">
              <TransactionList 
                transactions={filteredTransactions} 
                onEditTransaction={editTransaction}
                onDeleteTransaction={deleteTransaction}
                isInSidebar={false}
              />
            </div>
            
            {/* Large devices: All cards */}
            <div className="hidden lg:block space-y-6">
              {mainSlots.map((card, index) => (
                <div key={`main-${index}`}>
                  {renderCard(card, 'main', card ? card.sectionIndex || index : mainCards.length)}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Mobile Floating Add Button */}
        <div className="lg:hidden fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setShowTransactionModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-colors"
          >
            <span className="text-2xl">+</span>
          </button>
        </div>
        
        {/* Mobile Transaction Form Modal */}
        {showTransactionModal && (
          <div 
            className="lg:hidden fixed inset-0 flex items-end justify-center z-50"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(10px)' }}
            onClick={() => setShowTransactionModal(false)}
          >
            <div 
              className="bg-slate-700 rounded-t-xl w-full max-h-[80vh] overflow-y-auto border border-slate-500 shadow-2xl animate-scaleIn"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-slate-600 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Tambah Transaksi</h3>
                <button
                  onClick={() => setShowTransactionModal(false)}
                  className="text-gray-400 hover:text-white text-xl"
                >
                  ×
                </button>
              </div>
              <div className="p-4">
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
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4" style={{ backdropFilter: 'blur(10px)' }}>
            <div className="bg-slate-700 rounded-xl p-6 max-w-md w-full border border-slate-600">
              <h3 className="text-lg font-semibold text-white mb-4">Select Card</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {dashboardCards.filter(card => !card.enabled || card.section === undefined).map((card) => (
                  <button
                    key={card.id}
                    onClick={() => handleCardSelect(card.id)}
                    className="w-full flex items-center gap-3 p-3 bg-slate-600 rounded-lg hover:bg-slate-500 transition-colors text-left"
                  >
                    <span className="text-lg">{card.icon}</span>
                    <span className="text-gray-100">{card.name}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowCardModal(false)}
                className="mt-4 w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}