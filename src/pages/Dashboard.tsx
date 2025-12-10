import { useState, useEffect } from 'react';

import { Transaction } from '../types';
import { useDashboardViewModel } from '../viewmodels/useDashboardViewModel';
import TransactionForm from '../components/TransactionForm';
import WalletSelector from '../components/WalletSelector';
import ViewRenderer from '../components/ViewRenderer';
import { DashboardCard } from '../components/DashboardCustomizer';
import { DollarSign, Settings, Plus, X, BarChart3, Wallet2, Menu, TrendingUp, Target, Eye, PlusCircle, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateTotalBalance, formatBalance, getBalanceColor } from '../utils/balance';

interface Props {
  dashboardCards: DashboardCard[];
  setDashboardCards: (cards: DashboardCard[]) => void;
}

type ViewType = 'transactions' | 'financial-analysis' | 'budget-goals' | 'quick-overview' | 'add-transaction' | 'wallets' | 'settings' | 'guide';

export default function Dashboard({ dashboardCards, setDashboardCards }: Props) {
  const { state, transactions, filteredTransactions, wallets, actions, refreshWallets } = useDashboardViewModel();
  


  const menuItems = [
    {
      id: 'transactions' as ViewType,
      name: 'Transactions',
      icon: <BarChart3 className="w-5 h-5" />,
      category: 'main'
    },
    {
      id: 'financial-analysis' as ViewType,
      name: 'Financial Analysis',
      icon: <TrendingUp className="w-5 h-5" />,
      category: 'analysis'
    },
    {
      id: 'budget-goals' as ViewType,
      name: 'Budget & Goals',
      icon: <Target className="w-5 h-5" />,
      category: 'planning'
    },
    {
      id: 'quick-overview' as ViewType,
      name: 'Quick Overview',
      icon: <Eye className="w-5 h-5" />,
      category: 'overview'
    },
    {
      id: 'add-transaction' as ViewType,
      name: 'Add Transaction',
      icon: <PlusCircle className="w-5 h-5" />,
      category: 'actions'
    },
    {
      id: 'wallets' as ViewType,
      name: 'Wallets',
      icon: <Wallet2 className="w-5 h-5" />,
      category: 'management'
    },
    {
      id: 'guide' as ViewType,
      name: 'Financial Guide',
      icon: <BookOpen className="w-5 h-5" />,
      category: 'learning'
    },
    {
      id: 'settings' as ViewType,
      name: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      category: 'management'
    }
  ];



  if (state.loading) {
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
      <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-gray-900 border-r border-gray-700">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-gray-700">
            <DollarSign className="w-8 h-8 text-purple-400" />
            <h1 className="ml-3 text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Uwang
            </h1>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 pb-32">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-3">
              Main
            </div>
            {menuItems.filter(item => item.category === 'main').map((item) => (
              <button
                key={item.id}
                onClick={() => actions.setCurrentView(item.id)}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors ${
                  state.currentView === item.id ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </button>
            ))}
            
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-3 mt-6">
              Analysis
            </div>
            {menuItems.filter(item => item.category === 'analysis').map((item) => (
              <button
                key={item.id}
                onClick={() => actions.setCurrentView(item.id)}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors ${
                  state.currentView === item.id ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            ))}
            
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-3 mt-6">
              Planning
            </div>
            {menuItems.filter(item => item.category === 'planning').map((item) => (
              <button
                key={item.id}
                onClick={() => actions.setCurrentView(item.id)}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors ${
                  state.currentView === item.id ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            ))}
            
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-3 mt-6">
              Overview
            </div>
            {menuItems.filter(item => item.category === 'overview').map((item) => (
              <button
                key={item.id}
                onClick={() => actions.setCurrentView(item.id)}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors ${
                  state.currentView === item.id ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            ))}
            
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-3 mt-6">
              Actions
            </div>
            {menuItems.filter(item => item.category === 'actions').map((item) => (
              <button
                key={item.id}
                onClick={() => actions.setCurrentView(item.id)}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors ${
                  state.currentView === item.id ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            ))}
            
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-3 mt-6">
              Learning
            </div>
            {menuItems.filter(item => item.category === 'learning').map((item) => (
              <button
                key={item.id}
                onClick={() => actions.setCurrentView(item.id)}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors ${
                  state.currentView === item.id ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            ))}
            
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-3 mt-6">
              Management
            </div>
            {menuItems.filter(item => item.category === 'management').map((item) => (
              <button
                key={item.id}
                onClick={() => actions.setCurrentView(item.id)}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors ${
                  state.currentView === item.id ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            ))}
          </nav>
          
          {/* Balance Summary */}
          <div className="px-4 py-4 border-t border-gray-700">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Total Balance</div>
              <div className={`text-lg font-bold ${getBalanceColor(calculateTotalBalance(transactions))}`}>
                {formatBalance(calculateTotalBalance(transactions))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Top Bar */}
        <header className="bg-gray-900 border-b border-gray-700 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Mobile Logo and Menu */}
            <div className="lg:hidden flex items-center gap-3">
              <button
                onClick={() => setShowMobileMenu(true)}
                className="bg-gray-800 rounded-lg p-2 border border-gray-700 hover:bg-gray-700 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-300" />
              </button>
              <div className="flex items-center">
                <DollarSign className="w-6 h-6 text-purple-400" />
                <h1 className="ml-2 text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                  Uwang
                </h1>
              </div>
            </div>
            
            {/* Desktop Title */}
            <div className="hidden lg:block">
              <h2 className="text-xl font-semibold text-white">
                {state.currentView === 'guide' ? 'Financial Guide' : (menuItems.find(item => item.id === state.currentView)?.name || 'Dashboard')}
              </h2>
              <p className="text-sm text-gray-400">
                {state.currentView === 'transactions' && 'Monitor and manage your transactions'}
                {state.currentView === 'financial-analysis' && 'Comprehensive analysis of your financial data'}
                {state.currentView === 'budget-goals' && 'Track your budget and savings goals'}
                {state.currentView === 'quick-overview' && 'Essential financial metrics at a glance'}
                {state.currentView === 'add-transaction' && 'Record your income or expense'}
                {state.currentView === 'wallets' && 'Create and manage your wallets'}
                {state.currentView === 'guide' && 'Learn how to achieve better financial health for your household'}
                {state.currentView === 'settings' && 'Manage your application settings'}
              </p>
            </div>
            
            {/* Right Side - Wallet Picker */}
            <div className="flex items-center gap-3">
              {/* Desktop Wallet Picker */}
              <div className="hidden lg:block">
                <WalletSelector selectedWallet={state.selectedWallet} onWalletChange={actions.setSelectedWallet} wallets={wallets} />
              </div>
            </div>
          </div>
          
          {/* Mobile Wallet Selector */}
          <div className="lg:hidden mt-3 pt-3 border-t border-gray-700">
            <WalletSelector selectedWallet={state.selectedWallet} onWalletChange={actions.setSelectedWallet} wallets={wallets} />
          </div>
        </header>
        
        {/* Dashboard Content */}
        <main className="p-4 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <ViewRenderer
                currentView={state.currentView}
                transactions={transactions}
                filteredTransactions={filteredTransactions}
                wallets={wallets}
                selectedWallet={state.selectedWallet}
                onAddTransaction={actions.addTransaction}
                onEditTransaction={actions.editTransaction}
                onDeleteTransaction={actions.deleteTransaction}
                onImportTransactions={actions.importTransactions}
                onDeleteTransactionsByWallet={actions.deleteTransactionsByWallet}
                onRefreshWallets={refreshWallets}
                onWalletSelect={actions.setSelectedWallet}
                onResetData={actions.resetData}
                onShowResetModal={actions.showResetModal}
                onNavigateToWallets={actions.navigateToWallets}
                onNavigateToView={actions.setCurrentView}
              />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      
      {/* Mobile Floating Add Button - Only show on transactions view */}
      {state.currentView === 'transactions' && (
        <div className="lg:hidden fixed bottom-6 right-6 z-50">
          <button
            onClick={actions.showTransactionModal}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-2xl transition-all transform hover:scale-105 border-4 border-black"
          >
            <Plus className="w-7 h-7" />
          </button>
        </div>
      )}
        
      {/* Mobile Transaction Form Modal */}
      {state.showTransactionModal && (
        <div 
          className="lg:hidden fixed inset-0 flex items-end justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(10px)' }}
          onClick={actions.hideTransactionModal}
        >
          <div 
            className="bg-gray-900 rounded-t-2xl w-full max-h-[90vh] overflow-y-auto border-t border-gray-700 shadow-2xl animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-4 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-900 z-10">
              <div>
                <h3 className="text-lg font-semibold text-white">Add Transaction</h3>
                <p className="text-sm text-gray-400">Record your income or expense</p>
              </div>
              <button
                onClick={actions.hideTransactionModal}
                className="text-gray-400 hover:text-white bg-gray-800 rounded-full p-3 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 pb-8">
              <TransactionForm 
                onAddTransaction={(transaction) => {
                  actions.addTransaction(transaction);
                  actions.hideTransactionModal();
                }}
                selectedWallet={state.selectedWallet}
                wallets={wallets}
                onCreateWallet={() => {
                  actions.hideTransactionModal();
                  actions.navigateToWallets();
                }}
              />
            </div>
          </div>
        </div>
      )}
        

        
        {/* Mobile Menu */}
        {state.showMobileMenu && (
          <div className="lg:hidden fixed inset-0 bg-black bg-opacity-60 z-50" style={{ backdropFilter: 'blur(10px)' }}>
            <div className="bg-gray-900 w-80 h-full shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
                <div className="flex items-center">
                  <DollarSign className="w-6 h-6 text-purple-400" />
                  <h1 className="ml-2 text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                    Uwang
                  </h1>
                </div>
                <button
                  onClick={actions.closeMobileMenu}
                  className="text-gray-400 hover:text-white bg-gray-800 rounded-full p-2 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <nav className="px-4 py-6 space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      actions.setCurrentView(item.id);
                      actions.closeMobileMenu();
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                      state.currentView === item.id ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {item.icon}
                    <span className="font-medium">{item.name}</span>
                  </button>
                ))}
              </nav>
              
              {/* Mobile Balance Summary */}
              <div className="absolute bottom-0 left-0 right-0 px-4 py-4 border-t border-gray-700 bg-gray-900">
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">Total Balance</div>
                  <div className={`text-sm font-bold break-words overflow-hidden ${getBalanceColor(calculateTotalBalance(transactions))}`}>
                    {formatBalance(calculateTotalBalance(transactions))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Reset Data Confirmation Modal */}
        {state.showResetModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" style={{ backdropFilter: 'blur(10px)' }}>
            <div className="bg-gray-900 rounded-xl border border-gray-700 shadow-2xl max-w-md w-full">
              <div className="px-4 lg:px-6 py-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white">Reset All Data</h3>
              </div>
              
              <div className="p-4 lg:p-6">
                <p className="text-gray-300 mb-4 text-sm lg:text-base">This will permanently delete:</p>
                <ul className="text-gray-400 text-sm space-y-2 mb-6">
                  <li>• All transactions</li>
                  <li>• All wallets</li>
                  <li>• Custom categories</li>
                  <li>• Dashboard settings</li>
                </ul>
                <p className="text-red-400 text-sm font-medium">This action cannot be undone!</p>
              </div>
              
              <div className="px-4 lg:px-6 py-4 border-t border-gray-700 flex flex-col lg:flex-row gap-3">
                <button
                  onClick={actions.hideResetModal}
                  className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await actions.resetData();
                    window.location.reload();
                  }}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium min-h-[44px]"
                >
                  Reset All Data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}