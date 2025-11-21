import { 
  DollarSign, Gift, Laptop, TrendingUp, Building, PartyPopper,
  UtensilsCrossed, Car, ShoppingCart, FileText, Heart, Film, BookOpen, Home, FileEdit
} from 'lucide-react';

export const CATEGORY_ICONS: Record<string, any> = {
  // Income
  'Gaji': DollarSign,
  'Bonus': Gift,
  'Freelance': Laptop,
  'Investasi': TrendingUp,
  'Bisnis': Building,
  'Hadiah': PartyPopper,
  
  // Expense
  'Makanan': UtensilsCrossed,
  'Transportasi': Car,
  'Belanja': ShoppingCart,
  'Tagihan': FileText,
  'Kesehatan': Heart,
  'Hiburan': Film,
  'Pendidikan': BookOpen,
  'Rumah Tangga': Home
};

export const getCategoryIcon = (category: string) => {
  const IconComponent = CATEGORY_ICONS[category] || FileEdit;
  return IconComponent;
};