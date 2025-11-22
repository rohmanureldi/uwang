import { useState } from 'react';
import { getCategories, isDefaultCategory } from '../utils/categories';
import { getCategoryIcon } from '../utils/categoryIcons';
import { useCustomCategories } from '../hooks/useCustomCategories';
import { Trash2 } from 'lucide-react';
import Modal from './Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (category: string) => void;
  type: 'income' | 'expense';
}

export default function CategoryModal({ isOpen, onClose, onSelect, type }: Props) {
  const [newCategory, setNewCategory] = useState('');
  const { customCategories, addCustomCategory, deleteCustomCategory } = useCustomCategories();
  const categories = getCategories(type, customCategories);

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
    const categoryToDelete = customCategories.find(c => c.name === category && c.type === type);
    if (categoryToDelete) {
      deleteCustomCategory(categoryToDelete.id);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pilih Kategori" maxWidth="sm:w-96">
      <div className="p-4 max-h-64 overflow-y-auto">
        <div className="space-y-2">
          {categories.map((category, index) => (
            <div key={category} className="flex items-center justify-between p-3 rounded-lg border border-gray-600 hover:bg-gray-800 transition-all animate-fadeIn" style={{animationDelay: `${index * 0.05}s`}}>
              <button
                onClick={() => handleSelect(category)}
                className="flex-1 text-left text-gray-100 flex items-center gap-2"
              >
                {(() => {
                  const IconComponent = getCategoryIcon(category);
                  return <IconComponent className="w-4 h-4 text-purple-400" />;
                })()}
                <span>{category}</span>
              </button>
              {!isDefaultCategory(type, category) && (
                <button
                  onClick={() => handleDelete(category)}
                  className="text-red-400 hover:text-red-300 ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Kategori baru"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg text-sm border border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400"
            onKeyPress={(e) => e.key === 'Enter' && handleAddNew()}
          />
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm text-white font-medium transition-colors"
          >
            Tambah
          </button>
        </div>
      </div>
    </Modal>
  );
}