import { Wallet2 } from 'lucide-react';
import { Wallet } from '../types';

interface Props {
  selectedWallet: string;
  onWalletChange: (walletId: string) => void;
  wallets: Wallet[];
}

export default function WalletSelector({ selectedWallet, onWalletChange, wallets }: Props) {



  return (
    <div className="flex items-center gap-2">
      <Wallet2 className="w-4 h-4 text-purple-400" />
      <select
        value={selectedWallet}
        onChange={(e) => onWalletChange(e.target.value)}
        className="bg-gray-800 border border-gray-600 text-gray-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
      >
        <option value="global">Global (All Wallets)</option>
        {wallets.filter(w => w.id !== 'global').map((wallet) => (
          <option key={wallet.id} value={wallet.id}>
            {wallet.name}
          </option>
        ))}
      </select>
    </div>
  );
}