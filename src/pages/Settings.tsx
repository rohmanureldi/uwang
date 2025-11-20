import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  onResetData: () => void;
}

export default function Settings({ onResetData }: Props) {
  const navigate = useNavigate();
  const [showResetModal, setShowResetModal] = useState(false);

  const handleResetData = () => {
    onResetData();
    setShowResetModal(false);
    navigate('/?reset=success');
  };

  return (
    <div className="min-h-screen bg-slate-800 p-3 sm:p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
          >
            ← Back
          </button>
        </div>

        <div className="space-y-6">
          {/* Reset Data Section */}
          <div className="bg-slate-700 rounded-xl p-6 border border-slate-600">
            <h2 className="text-xl font-semibold text-white mb-4">Data Management</h2>
            <p className="text-gray-400 mb-4">
              Reset all your transaction data. This action cannot be undone.
            </p>
            <button
              onClick={() => setShowResetModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reset Data
            </button>
          </div>
        </div>

        {/* Reset Confirmation Modal */}
        {showResetModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(10px)' }}>
            <div className="bg-slate-700 rounded-xl p-6 max-w-md w-full border border-slate-600">
              <h3 className="text-lg font-semibold text-white mb-4">Confirm Reset</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete all your transaction data? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetData}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}