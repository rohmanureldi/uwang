import { useState } from 'react';

export interface DashboardCard {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
}

interface Props {
  cards: DashboardCard[];
  onCardsChange: (cards: DashboardCard[]) => void;
}

export default function DashboardCustomizer({ cards, onCardsChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleCard = (id: string) => {
    const updated = cards.map(card => 
      card.id === id ? { ...card, enabled: !card.enabled } : card
    );
    onCardsChange(updated);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-indigo-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-indigo-700 transition-all z-40 flex items-center gap-2"
        title="Customize Dashboard"
      >
        ⚙️
        <span className="text-sm font-medium">Customize</span>
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(10px)' }}
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-slate-700 rounded-xl p-6 border border-slate-600 shadow-2xl max-w-md mx-4 w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-100 text-lg">🎛️ Customize Dashboard</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-200 text-xl">×</button>
            </div>
            
            <p className="text-gray-400 text-sm mb-4">Select which cards to display on your dashboard</p>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {cards.map((card) => (
                <div key={card.id} className="flex items-center justify-between p-3 bg-slate-600 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{card.icon}</span>
                    <span className="text-gray-100">{card.name}</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={card.enabled}
                      onChange={() => toggleCard(card.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-500 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-600">
              <p className="text-xs text-gray-500">💡 Tip: Drag cards to reorder them on your dashboard</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}