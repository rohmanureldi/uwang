import { Routes, Route } from 'react-router-dom';
import { useDashboardSettings } from './hooks/useDashboardSettings';
import Dashboard from './pages/Dashboard';
import SyncNotification from './components/SyncNotification';

function App() {
  const { dashboardCards, loading: dashboardLoading, saveDashboardSettings } = useDashboardSettings();

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
      <SyncNotification />
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
      </Routes>
    </>
  );
}

export default App;