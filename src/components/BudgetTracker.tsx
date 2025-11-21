import { useState } from 'react';
import { Transaction, Budget } from '../types';
import { formatIDR } from '../utils/currency';
import { getCategoryIcon } from '../utils/categoryIcons';
import { DollarSign, Plus, X } from 'lucide-react';
import { getCategories } from '../utils/categories';
import { useCustomCategories } from '../hooks/useCustomCategories';

interface Props {
  transactions: Transaction[];
}

export default function BudgetTracker({ transactions }: Props) {
  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('budgets');
    return saved ? JSON.parse(saved) : [];
  });
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [newBudget, setNewBudget] = useState({ category: '', limit: '' });
  const { customCategories } = useCustomCategories();

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentBudgets = budgets.filter(b => b.month === currentMonth);
  
  const categorySpending = transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const saveBudgets = (newBudgets: Budget[]) => {
    setBudgets(newBudgets);
    localStorage.setItem('budgets', JSON.stringify(newBudgets));
  };

  const addBudget = () => {
    if (!newBudget.category || !newBudget.limit) return;
    
    const budget: Budget = {
      category: newBudget.category,
      limit: parseFloat(newBudget.limit.replace(/\./g, '')),
      month: currentMonth
    };
    
    const updated = budgets.filter(b => !(b.category === budget.category && b.month === currentMonth));
    saveBudgets([...updated, budget]);
    setNewBudget({ category: '', limit: '' });
    setShowAddBudget(false);
  };

  const formatNumber = (value: string) => {
    const num = value.replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const expenseCategories = getCategories('expense', customCategories);

  return (
    <div className="bg-gray-900 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-700 animate-scaleIn">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-100 text-lg flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-purple-400" /> Budget Bulanan
        </h3>
        <button
          onClick={() => setShowAddBudget(!showAddBudget)}
          className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
        >
          {showAddBudget ? (
            <><X className="w-4 h-4" /> Batal</>
          ) : (
            <><Plus className="w-4 h-4" /> Tambah</>
          )}
        </button>
      </div>

      {showAddBudget && (
        <div className="mb-4 p-3 bg-gray-800 rounded-lg space-y-3">
          <select
            value={newBudget.category}
            onChange={(e) => setNewBudget({...newBudget, category: e.target.value})}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-gray-100 text-sm"
          >
            <option value="">Pilih Kategori</option>
            {expenseCategories.map(cat => (
              <option key={cat} value={cat}>{getCategoryIcon(cat)} {cat}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Batas Budget"
            value={newBudget.limit}
            onChange={(e) => setNewBudget({...newBudget, limit: formatNumber(e.target.value)})}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-gray-100 text-sm"
          />
          <button
            onClick={addBudget}
            className="w-full bg-purple-600 text-white py-2 rounded text-sm hover:bg-purple-700"
          >
            Simpan Budget
          </button>
        </div>
      )}

      <div className="space-y-3">
        {currentBudgets.length === 0 ? (
          <p className="text-gray-300 text-sm text-center py-4">Belum ada budget untuk bulan ini</p>
        ) : (
          currentBudgets.map((budget) => {
            const spent = categorySpending[budget.category] || 0;
            const percentage = (spent / budget.limit) * 100;
            const isOverBudget = spent > budget.limit;
            
            return (
              <div key={budget.category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const IconComponent = getCategoryIcon(budget.category);
                      return <IconComponent className="w-4 h-4 text-purple-400" />;
                    })()}
                    <span className="text-gray-100 text-sm">{budget.category}</span>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${isOverBudget ? 'text-red-400' : 'text-gray-100'}`}>
                      {formatIDR(spent)} / {formatIDR(budget.limit)}
                    </div>
                    <div className={`text-xs ${isOverBudget ? 'text-red-400' : 'text-gray-400'}`}>
                      {percentage.toFixed(0)}%
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isOverBudget 
                        ? 'bg-gradient-to-r from-red-500 to-red-600' 
                        : 'bg-gradient-to-r from-green-500 to-emerald-500'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
                {isOverBudget && (
                  <p className="text-red-400 text-xs">⚠️ Melebihi budget {formatIDR(spent - budget.limit)}</p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}