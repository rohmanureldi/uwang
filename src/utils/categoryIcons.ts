export const CATEGORY_ICONS: Record<string, string> = {
  // Income
  'Gaji': '💰',
  'Bonus': '🎁',
  'Freelance': '💻',
  'Investasi': '📈',
  'Bisnis': '🏢',
  'Hadiah': '🎉',
  
  // Expense
  'Makanan': '🍽️',
  'Transportasi': '🚗',
  'Belanja': '🛒',
  'Tagihan': '📄',
  'Kesehatan': '🏥',
  'Hiburan': '🎬',
  'Pendidikan': '📚',
  'Rumah Tangga': '🏠'
};

export const getCategoryIcon = (category: string): string => {
  return CATEGORY_ICONS[category] || '📝';
};