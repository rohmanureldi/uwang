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

export const getCategories = (type: 'income' | 'expense', customCategories: Array<{name: string, type: string}>): string[] => {
  const custom = customCategories
    .filter(c => c.type === type)
    .map(c => c.name);
  return [...DEFAULT_CATEGORIES[type], ...custom];
};

export const isDefaultCategory = (type: 'income' | 'expense', category: string): boolean => {
  return DEFAULT_CATEGORIES[type].includes(category);
};