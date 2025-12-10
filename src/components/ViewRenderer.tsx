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

interface ViewConfig {
  component: ReactNode;
  title: string;
  description: string;
}

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

export default function ViewRenderer({
  currentView,
  transactions,
  filteredTransactions,
  wallets,
  selectedWallet,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onImportTransactions,
  onDeleteTransactionsByWallet,
  onRefreshWallets,
  onWalletSelect,
  onResetData,
  onShowResetModal,
  onNavigateToWallets
}: Props) {
  const viewConfigs: Record<ViewType, ViewConfig> = {
    transactions: {
      title: 'Transactions',
      description: 'Monitor and manage your transactions',
      component: (
        <TransactionList 
          transactions={filteredTransactions} 
          onEditTransaction={onEditTransaction}
          onDeleteTransaction={onDeleteTransaction}
          onAddTransaction={onAddTransaction}
          onImportTransactions={onImportTransactions}
          wallets={wallets}
          isInSidebar={false}
          selectedWallet={selectedWallet}
        />
      )
    },
    'financial-analysis': {
      title: 'Financial Analysis',
      description: 'Comprehensive analysis of your financial data',
      component: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Chart transactions={filteredTransactions} />
            <CategoryCharts transactions={filteredTransactions} isInSidebar={false} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SpendingTrends transactions={transactions} />
            <SpendingInsights transactions={transactions} />
          </div>
          <FinancialHealth transactions={transactions} />
        </div>
      )
    },
    'budget-goals': {
      title: 'Budget & Goals',
      description: 'Track your budget and savings goals',
      component: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BudgetTracker transactions={transactions} />
          <SavingsGoals />
        </div>
      )
    },
    'quick-overview': {
      title: 'Quick Overview',
      description: 'Essential financial metrics at a glance',
      component: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Balance transactions={filteredTransactions} />
          <QuickStats transactions={filteredTransactions} />
        </div>
      )
    },
    'add-transaction': {
      title: 'Add Transaction',
      description: 'Record your income or expense',
      component: (
        <div className="max-w-2xl mx-auto">
          <TransactionForm 
            onAddTransaction={onAddTransaction} 
            selectedWallet={selectedWallet} 
            wallets={wallets}
            onCreateWallet={onNavigateToWallets}
          />
        </div>
      )
    },
    wallets: {
      title: 'Wallet Management',
      description: 'Create and manage your wallets',
      component: (
        <div className="max-w-4xl mx-auto">
          <WalletManager 
            onAddTransaction={onAddTransaction}
            onWalletChange={onRefreshWallets}
            selectedWallet={selectedWallet}
            onWalletSelect={onWalletSelect}
            deleteTransactionsByWallet={onDeleteTransactionsByWallet}
            transactions={transactions}
          />
        </div>
      )
    },
    settings: {
      title: 'Settings',
      description: 'Manage your application settings',
      component: (
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Data Management</h3>
            <p className="text-gray-400 mb-6">
              Reset all your data. This action cannot be undone.
            </p>
            <button
              onClick={onShowResetModal}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Reset Data
            </button>
          </div>
        </div>
      )
    }
  };

  const config = viewConfigs[currentView];
  
  return (
    <div className="space-y-6">
      {config.component}
    </div>
  );
}