import { useState, useEffect } from 'react';
import { Wallet2, Plus, Trash2 } from 'lucide-react';
import { Wallet, Transaction } from '../types';
import { walletService } from '../services/walletService';
import { formatIDR } from '../utils/currency';
import CurrencyInput from './CurrencyInput';

const WALLET_COLORS = [
  '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'
];

interface Props {
  onAddTransaction?: (transaction: Omit<Transaction, 'id'>) => void;
  onWalletChange?: () => void;
  selectedWallet?: string;
  onWalletSelect?: (walletId: string) => void;
  onDeleteTransactions?: (walletId: string) => void;
  transactions?: Transaction[];
}

export default function WalletManager({ onAddTransaction, onWalletChange, selectedWallet, onWalletSelect, onDeleteTransactions, transactions = [] }: Props) {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newWallet, setNewWallet] = useState({ name: '', initialBalance: '', color: WALLET_COLORS[0] });
  const [error, setError] = useState('');

  useEffect(() => {
    loadWallets();
    
    // Listen for expand form event
    const handleExpandForm = () => {
      setShowForm(true);
    };
    
    window.addEventListener('expandWalletForm', handleExpandForm);
    return () => window.removeEventListener('expandWalletForm', handleExpandForm);
  }, []);

  const loadWallets = async () => {
    try {
      const data = await walletService.getWallets();
      setWallets(data);
    } catch (error) {
      console.error('Error loading wallets:', error);
      const saved = localStorage.getItem('wallets');
      if (saved) {
        setWallets(JSON.parse(saved));
      }
    }
  };

  const handleCreateWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newWallet.name.trim()) {
      setError('Wallet name is required');
      return;
    }

    if (newWallet.name.toLowerCase() === 'global') {
      setError('Cannot use "Global" as wallet name');
      return;
    }

    const balance = parseFloat(newWallet.initialBalance.replace(/\./g, '')) || 0;

    try {
      const wallet = await walletService.createWallet({
        name: newWallet.name.trim(),
        color: newWallet.color,
        icon: 'Wallet2'
      });

      if (balance !== 0) {
        // Create initial balance transaction (this will update wallet balance automatically)
        const initialTransaction = {
          amount: Math.abs(balance),
          description: `Initial balance for ${newWallet.name.trim()}`,
          category: 'Initial Balance',
          type: balance > 0 ? 'income' : 'expense' as 'income' | 'expense',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().slice(0, 5),
          wallet_id: wallet.id
        };
        
        // Add transaction to record the initial balance
        if (onAddTransaction) {
          onAddTransaction(initialTransaction);
        }
      }

      setWallets([...wallets, { ...wallet, balance }]);
      setNewWallet({ name: '', initialBalance: '', color: WALLET_COLORS[0] });
      setShowForm(false);
      
      if (onWalletChange) {
        onWalletChange();
      }
    } catch (error) {
      console.error('Error creating wallet:', error);
      const newWalletData: Wallet = {
        id: Date.now().toString(),
        name: newWallet.name.trim(),
        color: newWallet.color,
        icon: 'Wallet2',
        balance,
        created_at: new Date().toISOString()
      };
      const updated = [...wallets, newWalletData];
      setWallets(updated);
      localStorage.setItem('wallets', JSON.stringify(updated));
      setNewWallet({ name: '', initialBalance: '', color: WALLET_COLORS[0] });
      setShowForm(false);
    }
  };

  const handleDeleteWallet = async (walletId: string) => {
    if (!confirm('Are you sure you want to delete this wallet?')) return;

    try {
      await walletService.deleteWallet(walletId);
      setWallets(wallets.filter(w => w.id !== walletId));
      
      // Delete all transactions for this wallet
      if (onDeleteTransactions) {
        onDeleteTransactions(walletId);
      }
      
      // If deleted wallet was selected, switch to global
      if (selectedWallet === walletId && onWalletSelect) {
        onWalletSelect('global');
      }
      
      if (onWalletChange) {
        onWalletChange();
      }
    } catch (error) {
      console.error('Error deleting wallet:', error);
      const updated = wallets.filter(w => w.id !== walletId);
      setWallets(updated);
      localStorage.setItem('wallets', JSON.stringify(updated));
      
      // Delete all transactions for this wallet
      if (onDeleteTransactions) {
        onDeleteTransactions(walletId);
      }
      
      // If deleted wallet was selected, switch to global
      if (selectedWallet === walletId && onWalletSelect) {
        onWalletSelect('global');
      }
      
      if (onWalletChange) {
        onWalletChange();
      }
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Wallet2 className="w-6 h-6 text-purple-400" />
          Wallet Management
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Wallet
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateWallet} className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-600">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Wallet Name</label>
              <input
                type="text"
                value={newWallet.name}
                onChange={(e) => setNewWallet({ ...newWallet, name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                placeholder="Enter wallet name"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Initial Balance</label>
              <CurrencyInput
                value={newWallet.initialBalance}
                onChange={(value) => setNewWallet({ ...newWallet, initialBalance: value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                placeholder="0"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm text-gray-300 mb-2">Color</label>
            <div className="flex gap-2">
              {WALLET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewWallet({ ...newWallet, color })}
                  className={`w-8 h-8 rounded-full border-2 ${
                    newWallet.color === color ? 'border-white' : 'border-gray-600'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="mt-3 text-red-400 text-sm">{error}</div>
          )}

          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Create Wallet
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setError('');
                setNewWallet({ name: '', initialBalance: '', color: WALLET_COLORS[0] });
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {wallets.map((wallet) => {
          const walletTransactions = transactions.filter(t => t.wallet_id === wallet.id);
          const calculatedBalance = walletTransactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
          
          return (
            <div key={wallet.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: wallet.color }}
                />
                <div>
                  <span className="text-gray-100 font-medium">{wallet.name}</span>
                  <div className="text-sm text-gray-400">
                    Created: {new Date(wallet.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-semibold ${
                  calculatedBalance >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {formatIDR(calculatedBalance)}
                </span>
                <button
                  onClick={() => handleDeleteWallet(wallet.id)}
                  className="text-red-400 hover:text-red-300 p-1 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
        
        {wallets.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No wallets created yet. Click "Add Wallet" to create your first wallet.
          </div>
        )}
      </div>
    </div>
  );
}