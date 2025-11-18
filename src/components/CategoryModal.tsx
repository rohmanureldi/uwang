import { useState } from 'react';
import { getCategories, addCustomCategory, deleteCustomCategory, DEFAULT_CATEGORIES } from '../utils/categories';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (category: string) => void;
  type: 'income' | 'expense';
}

export default function CategoryModal({ isOpen, onClose, onSelect, type }: Props) {
  const [newCategory, setNewCategory] = useState('');
  const categories = getCategories(type);

  const handleSelect = (category: string) => {
    onSelect(category);
    onClose();
  };

  const handleAddNew = () => {
    if (newCategory.trim()) {
      addCustomCategory(type, newCategory.trim());
      handleSelect(newCategory.trim());
      setNewCategory('');
    }
  };

  const handleDelete = (category: string) => {
    deleteCustomCategory(type, category);
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-end sm:items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(10px)' }}
      onClick={onClose}
    >
      <div 
        className="w-full sm:w-96 sm:rounded-xl rounded-t-xl max-h-[80vh] overflow-hidden border border-slate-500 shadow-2xl bg-slate-700 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-600 flex justify-between items-center">
          <h3 className="font-semibold text-lg text-gray-100">Pilih Kategori</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200 text-xl">×</button>
        </div>
        
        <div className="p-4 max-h-64 overflow-y-auto">
          <div className="space-y-2">
            {categories.map((category, index) => (
              <div key={category} className="flex items-center justify-between p-3 rounded-lg border border-slate-500 hover:bg-slate-600 transition-all animate-fadeIn" style={{animationDelay: `${index * 0.05}s`}}>
                <button
                  onClick={() => handleSelect(category)}
                  className="flex-1 text-left text-gray-100"
                >
                  {category}
                </button>
                {!DEFAULT_CATEGORIES[type].includes(category) && (
                  <button
                    onClick={() => handleDelete(category)}
                    className="text-red-400 hover:text-red-300 ml-2"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-600">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Kategori baru"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg text-sm border border-slate-500 bg-slate-600 text-gray-100 placeholder-gray-400"
              onKeyPress={(e) => e.key === 'Enter' && handleAddNew()}
            />
            <button
              onClick={handleAddNew}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-sm text-white font-medium transition-colors"
            >
              Tambah
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}