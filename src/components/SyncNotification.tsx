import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { syncService } from '../services/syncService';

export default function SyncNotification() {
  const [syncStatus, setSyncStatus] = useState(syncService.getStatus());

  useEffect(() => {
    const unsubscribe = syncService.subscribe(setSyncStatus);
    return unsubscribe;
  }, []);

  if (syncStatus.isSyncing) {
    return (
      <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-fadeIn">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Syncing data...</span>
        </div>
      </div>
    );
  }

  if (!syncStatus.isOnline) {
    return (
      <div className="fixed top-4 right-4 bg-orange-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-fadeIn">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span>Offline mode</span>
        </div>
      </div>
    );
  }

  return null;
}