import { Wallet2 } from 'lucide-react';
import { Wallet } from '../types';
import { formatIDR } from '../utils/currency';

interface Props {
  wallets: Wallet[];
}

export default function WalletBalance({ wallets }: Props) {
  const globalWallet = wallets.find(w => w.id === 'global');
  const otherWallets = wallets.filter(w => w.id !== 'global');

  return (
    <div className="bg-gray-900 rounded-xl p-4 shadow-lg border border-gray-700">
      <h3 className="font-semibold text-gray-100 mb-4 text-lg flex items-center gap-2">
        <Wallet2 className="w-5 h-5 text-purple-400" /> Wallets
      </h3>
      
      <div className="space-y-3">
        {globalWallet && (
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-lg border border-indigo-500/30">
            <div className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: globalWallet.color }}
              />
              <span className="text-gray-100 font-bold">{globalWallet.name}</span>
            </div>
            <span className={`font-bold text-lg ${
              globalWallet.balance >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {formatIDR(globalWallet.balance)}
            </span>
          </div>
        )}
        
        {otherWallets.length > 0 && globalWallet && (
          <div className="border-t border-gray-700 pt-3" />
        )}
        
        {otherWallets.map((wallet) => (
          <div key={wallet.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: wallet.color }}
              />
              <span className="text-gray-100 font-medium">{wallet.name}</span>
            </div>
            <span className={`font-semibold ${
              wallet.balance >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {formatIDR(wallet.balance)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}