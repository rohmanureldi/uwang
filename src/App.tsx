import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useTransactions } from './hooks/useTransactions';
import { useCustomCategories } from './hooks/useCustomCategories';
import { DashboardCard } from './components/DashboardCustomizer';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';

function App() {
  const { resetData } = useTransactions();
  const { resetCustomCategories } = useCustomCategories();
  const [showResetNotification, setShowResetNotification] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [dashboardCards, setDashboardCards] = useState<DashboardCard[]>(() => {
    const defaultCards = [
      { id: 'balance', name: 'Balance', icon: '💰', enabled: true },
      { id: 'chart', name: 'Chart', icon: '📊', enabled: true },
      { id: 'quickstats', name: 'Quick Stats', icon: '⚡', enabled: true },
      { id: 'categorycharts', name: 'Category Charts', icon: '📈', enabled: false },
      { id: 'health', name: 'Financial Health', icon: '🏥', enabled: false },
      { id: 'insights', name: 'Spending Insights', icon: '🔍', enabled: false },
      { id: 'trends', name: 'Spending Trends', icon: '📈', enabled: false },
      { id: 'budget', name: 'Budget Tracker', icon: '💰', enabled: false },
      { id: 'savings', name: 'Savings Goals', icon: '🎯', enabled: false },
      { id: 'form', name: 'Tambah Transaksi', icon: '➕', enabled: true },
      { id: 'list', name: 'Riwayat Transaksi', icon: '📝', enabled: true }
    ];
    
    const saved = localStorage.getItem('dashboardCards');
    if (saved) {
      const savedCards = JSON.parse(saved);
      // Ensure form and list cards exist and are enabled
      // Remove deprecated cards
      const filteredCards = savedCards.filter((c: DashboardCard) => c.id !== 'breakdown');
      
      const hasForm = filteredCards.find((c: DashboardCard) => c.id === 'form');
      const hasList = filteredCards.find((c: DashboardCard) => c.id === 'list');
      const hasCategoryCharts = filteredCards.find((c: DashboardCard) => c.id === 'categorycharts');
      
      if (!hasForm) {
        filteredCards.push({ id: 'form', name: 'Tambah Transaksi', icon: '➕', enabled: true });
      }
      if (!hasList) {
        filteredCards.push({ id: 'list', name: 'Riwayat Transaksi', icon: '📝', enabled: true });
      }
      if (!hasCategoryCharts) {
        filteredCards.push({ id: 'categorycharts', name: 'Category Charts', icon: '📈', enabled: false });
      }
      
      return filteredCards;
    }
    
    return defaultCards;
  });

  useEffect(() => {
    localStorage.setItem('dashboardCards', JSON.stringify(dashboardCards));
  }, [dashboardCards]);
  
  // Ensure form and list are always enabled on mount
  useEffect(() => {
    setDashboardCards(prev => prev.map(card => 
      (card.id === 'form' || card.id === 'list') ? { ...card, enabled: true } : card
    ));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('reset') === 'success') {
      setShowResetNotification(true);
      // Clean up URL
      navigate('/', { replace: true });
      setTimeout(() => setShowResetNotification(false), 3000);
    }
  }, [location, navigate]);

  const handleResetData = () => {
    resetData();
    resetCustomCategories();
  };

  return (
    <>
      <Routes>
        <Route 
          path="/" 
          element={
            <Dashboard 
              dashboardCards={dashboardCards}
              setDashboardCards={setDashboardCards}
            />
          } 
        />
        <Route 
          path="/settings" 
          element={
            <Settings 
              dashboardCards={dashboardCards}
              onCardsChange={setDashboardCards}
              onResetData={handleResetData}
            />
          } 
        />
      </Routes>
      
      {/* Global Reset Success Notification */}
      {showResetNotification && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span>Data berhasil direset!</span>
          </div>
        </div>
      )}
    </>
  );
}

export default App;