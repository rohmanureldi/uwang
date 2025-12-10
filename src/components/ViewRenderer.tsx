import { ReactNode } from 'react';
import { Transaction } from '../types';
import TransactionList from './TransactionList';
import Balance from './Balance';
import Chart from './Chart';
import QuickStats from './QuickStats';
import BudgetTracker from './BudgetTracker';
import SavingsGoals from './SavingsGoals';
import SpendingTrends from './SpendingTrends';
import FinancialHealth from './FinancialHealth';
import SpendingInsights from './SpendingInsights';
import CategoryCharts from './CategoryCharts';
import WalletManager from './WalletManager';
import TransactionForm from './TransactionForm';

type ViewType = 'transactions' | 'financial-analysis' | 'budget-goals' | 'quick-overview' | 'add-transaction' | 'wallets' | 'settings';

interface Props {
  currentView: ViewType;
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  wallets: Array<{ id: string; name: string; color?: string; icon?: string; }>;
  selectedWallet: string;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onEditTransaction: (id: string, transaction: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  onImportTransactions: (transactions: Omit<Transaction, 'id'>[], walletId: string) => void;
  onDeleteTransactionsByWallet: (walletId: string) => void;
  onRefreshWallets: () => void;
  onWalletSelect: (walletId: string) => void;
  onResetData: () => void;
  onShowResetModal: () => void;
  onNavigateToWallets: () => void;
}

export default function ViewRenderer(props: Props) {
  const views: Record<ViewType, ReactNode> = {
    transactions: (
      <TransactionList 
        transactions={props.filteredTransactions} 
        onEditTransaction={props.onEditTransaction}
        onDeleteTransaction={props.onDeleteTransaction}
        onAddTransaction={props.onAddTransaction}
        onImportTransactions={props.onImportTransactions}
        wallets={props.wallets}
        isInSidebar={false}
        selectedWallet={props.selectedWallet}
      />
    ),
    'financial-analysis': (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Chart transactions={props.filteredTransactions} />
          <CategoryCharts transactions={props.filteredTransactions} isInSidebar={false} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SpendingTrends transactions={props.transactions} />
          <SpendingInsights transactions={props.transactions} />
        </div>
        <FinancialHealth transactions={props.transactions} />
      </div>
    ),
    'budget-goals': (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetTracker transactions={props.transactions} />
        <SavingsGoals />
      </div>
    ),
    'quick-overview': (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Balance transactions={props.filteredTransactions} />
        <QuickStats transactions={props.filteredTransactions} />
      </div>
    ),
    'add-transaction': (
      <div className="max-w-2xl mx-auto">
        <TransactionForm 
          onAddTransaction={props.onAddTransaction} 
          selectedWallet={props.selectedWallet} 
          wallets={props.wallets}
          onCreateWallet={props.onNavigateToWallets}
        />
      </div>
    ),
    wallets: (
      <div className="max-w-4xl mx-auto">
        <WalletManager 
          onAddTransaction={props.onAddTransaction}
          onWalletChange={props.onRefreshWallets}
          selectedWallet={props.selectedWallet}
          onWalletSelect={props.onWalletSelect}
          deleteTransactionsByWallet={props.onDeleteTransactionsByWallet}
          transactions={props.transactions}
        />
      </div>
    ),
    settings: (
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Data Management</h3>
          <p className="text-gray-400 mb-6">
            Reset all your data. This action cannot be undone.
          </p>
          <button
            onClick={props.onShowResetModal}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Reset Data
          </button>
        </div>
      </div>
    )
  };

  return (
    <div className="space-y-6">
      {views[props.currentView]}
    </div>
  );
}