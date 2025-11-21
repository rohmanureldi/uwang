import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useTransactions } from './hooks/useTransactions';
import { useCustomCategories } from './hooks/useCustomCategories';
import { useDashboardSettings } from './hooks/useDashboardSettings';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';

function App() {
  const { resetData } = useTransactions();
  const { resetCustomCategories } = useCustomCategories();
  const { dashboardCards, loading: dashboardLoading, saveDashboardSettings } = useDashboardSettings();
  const [showResetNotification, setShowResetNotification] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();



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

  if (dashboardLoading) {
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
      <Routes>
        <Route 
          path="/" 
          element={
            <Dashboard 
              dashboardCards={dashboardCards}
              setDashboardCards={saveDashboardSettings}
            />
          } 
        />
        <Route 
          path="/settings" 
          element={
            <Settings 
              onResetData={handleResetData}
            />
          } 
        />
      </Routes>
      
      {/* Global Reset Success Notification */}
      {showResetNotification && (
        <div className="fixed top-4 right-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-fadeIn">
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