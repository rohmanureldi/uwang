export const DEFAULT_CATEGORIES = {
  income: [
    'Gaji',
    'Bonus',
    'Freelance',
    'Investasi',
    'Bisnis',
    'Hadiah'
  ],
  expense: [
    'Makanan',
    'Transportasi',
    'Belanja',
    'Tagihan',
    'Kesehatan',
    'Hiburan',
    'Pendidikan',
    'Rumah Tangga'
  ]
};

export const getCategories = (type: 'income' | 'expense'): string[] => {
  const saved = localStorage.getItem('customCategories');
  const customCategories = saved ? JSON.parse(saved) : { income: [], expense: [] };
  
  return [...DEFAULT_CATEGORIES[type], ...customCategories[type]];
};

export const addCustomCategory = (type: 'income' | 'expense', category: string) => {
  const saved = localStorage.getItem('customCategories');
  const customCategories = saved ? JSON.parse(saved) : { income: [], expense: [] };
  
  if (!customCategories[type].includes(category)) {
    customCategories[type].push(category);
    localStorage.setItem('customCategories', JSON.stringify(customCategories));
  }
};

export const deleteCustomCategory = (type: 'income' | 'expense', category: string) => {
  if (DEFAULT_CATEGORIES[type].includes(category)) return; // Cannot delete default
  
  const saved = localStorage.getItem('customCategories');
  const customCategories = saved ? JSON.parse(saved) : { income: [], expense: [] };
  
  customCategories[type] = customCategories[type].filter((c: string) => c !== category);
  localStorage.setItem('customCategories', JSON.stringify(customCategories));
};