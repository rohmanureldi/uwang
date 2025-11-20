import { useState, useEffect } from 'react';

export interface DashboardCard {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  section?: 'sidebar' | 'main';
  sectionIndex?: number;
}

interface Props {
  cards: DashboardCard[];
  onCardsChange: (cards: DashboardCard[]) => void;
}

export default function DashboardCustomizer({ cards, onCardsChange }: Props) {
  const [sortedCards, setSortedCards] = useState<DashboardCard[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setSortedCards([...cards].sort((a, b) => Number(b.enabled) - Number(a.enabled)));
  }, [cards]);

  const toggleCard = (id: string) => {
    const updated = sortedCards.map(card => 
      card.id === id ? { ...card, enabled: !card.enabled } : card
    );
    setSortedCards(updated);
    setHasChanges(true);
  };

  const handleSave = () => {
    onCardsChange(sortedCards);
    setHasChanges(false);
  };

  const handleReset = () => {
    setSortedCards([...cards]);
    setHasChanges(false);
  };

  return (
    <div>
      <p className="text-gray-400 text-sm mb-4">Select which cards to display on your dashboard</p>
      
      <div className="space-y-3">
        {sortedCards.map((card) => (
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
        <p className="text-xs text-gray-500 mb-3">💡 Tip: Drag cards to reorder them on your dashboard</p>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm"
          >
            Save Changes
          </button>
          <button
            onClick={handleReset}
            disabled={!hasChanges}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}