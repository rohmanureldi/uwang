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
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}
      onClick={onClose}
    >
      <div 
        className="w-full sm:w-96 sm:rounded-xl rounded-t-xl max-h-[80vh] overflow-hidden border border-white/20 shadow-2xl"
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.9)', 
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-white/20 flex justify-between items-center">
          <h3 className="font-semibold text-lg text-gray-800">Pilih Kategori</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800 text-xl">×</button>
        </div>
        
        <div className="p-4 max-h-64 overflow-y-auto">
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center justify-between p-3 rounded-lg border border-white/30 hover:bg-white/50 backdrop-blur-sm transition-all">
                <button
                  onClick={() => handleSelect(category)}
                  className="flex-1 text-left text-gray-800"
                >
                  {category}
                </button>
                {!DEFAULT_CATEGORIES[type].includes(category) && (
                  <button
                    onClick={() => handleDelete(category)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-white/20">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Kategori baru"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg text-sm border border-white/30 bg-white/50 backdrop-blur-sm placeholder-gray-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAddNew()}
            />
            <button
              onClick={handleAddNew}
              className="px-4 py-2 rounded-lg text-sm text-white font-medium transition-all"
              style={{ 
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(147, 51, 234, 0.8))',
                backdropFilter: 'blur(10px)'
              }}
            >
              Tambah
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}