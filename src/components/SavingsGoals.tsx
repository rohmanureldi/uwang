import { useState } from 'react';
import { SavingsGoal } from '../types';
import { formatIDR } from '../utils/currency';

export default function SavingsGoals() {
  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem('savingsGoals');
    return saved ? JSON.parse(saved) : [];
  });
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
    description: ''
  });

  const saveGoals = (newGoals: SavingsGoal[]) => {
    setGoals(newGoals);
    localStorage.setItem('savingsGoals', JSON.stringify(newGoals));
  };

  const addGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.targetDate) return;
    
    const goal: SavingsGoal = {
      id: Date.now().toString(),
      name: newGoal.name,
      targetAmount: parseFloat(newGoal.targetAmount.replace(/\./g, '')),
      currentAmount: 0,
      targetDate: newGoal.targetDate,
      description: newGoal.description
    };
    
    saveGoals([...goals, goal]);
    setNewGoal({ name: '', targetAmount: '', targetDate: '', description: '' });
    setShowAddGoal(false);
  };

  const updateGoalAmount = (id: string, amount: number) => {
    const updated = goals.map(g => 
      g.id === id ? { ...g, currentAmount: Math.max(0, g.currentAmount + amount) } : g
    );
    saveGoals(updated);
  };

  const deleteGoal = (id: string) => {
    saveGoals(goals.filter(g => g.id !== id));
  };

  const formatNumber = (value: string) => {
    const num = value.replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  return (
    <div className="bg-slate-700 rounded-xl p-4 sm:p-6 shadow-lg border border-slate-600 animate-scaleIn">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-100 text-lg">🎯 Target Tabungan</h3>
        <button
          onClick={() => setShowAddGoal(!showAddGoal)}
          className="text-indigo-400 hover:text-indigo-300 text-sm"
        >
          {showAddGoal ? 'Batal' : '+ Tambah'}
        </button>
      </div>

      {showAddGoal && (
        <div className="mb-4 p-3 bg-slate-600 rounded-lg space-y-3">
          <input
            type="text"
            placeholder="Nama target (misal: Liburan Bali)"
            value={newGoal.name}
            onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-500 rounded text-gray-100 text-sm"
          />
          <input
            type="text"
            placeholder="Target jumlah"
            value={newGoal.targetAmount}
            onChange={(e) => setNewGoal({...newGoal, targetAmount: formatNumber(e.target.value)})}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-500 rounded text-gray-100 text-sm"
          />
          <input
            type="date"
            value={newGoal.targetDate}
            onChange={(e) => setNewGoal({...newGoal, targetDate: e.target.value})}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-500 rounded text-gray-100 text-sm"
            style={{ colorScheme: 'dark' }}
          />
          <button
            onClick={addGoal}
            className="w-full bg-indigo-600 text-white py-2 rounded text-sm hover:bg-indigo-700"
          >
            Buat Target
          </button>
        </div>
      )}

      <div className="space-y-4">
        {goals.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">Belum ada target tabungan</p>
        ) : (
          goals.map((goal) => {
            const percentage = (goal.currentAmount / goal.targetAmount) * 100;
            const isCompleted = goal.currentAmount >= goal.targetAmount;
            const daysLeft = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <div key={goal.id} className="p-3 bg-slate-600 rounded-lg space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-100">{goal.name}</h4>
                    <p className="text-xs text-gray-400">
                      {daysLeft > 0 ? `${daysLeft} hari lagi` : 'Target terlewat'}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    🗑️
                  </button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">{formatIDR(goal.currentAmount)}</span>
                    <span className="text-gray-300">{formatIDR(goal.targetAmount)}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isCompleted 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                          : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-center">
                    <span className={`text-sm font-semibold ${isCompleted ? 'text-green-400' : 'text-gray-300'}`}>
                      {percentage.toFixed(0)}% {isCompleted && '🎉'}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => updateGoalAmount(goal.id, 50000)}
                    className="flex-1 bg-green-600 text-white py-1 rounded text-xs hover:bg-green-700"
                  >
                    +50k
                  </button>
                  <button
                    onClick={() => updateGoalAmount(goal.id, 100000)}
                    className="flex-1 bg-green-600 text-white py-1 rounded text-xs hover:bg-green-700"
                  >
                    +100k
                  </button>
                  <button
                    onClick={() => updateGoalAmount(goal.id, -50000)}
                    className="flex-1 bg-red-600 text-white py-1 rounded text-xs hover:bg-red-700"
                  >
                    -50k
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}