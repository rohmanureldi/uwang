// UI Constants
export const MOBILE_BREAKPOINT = 768;
export const DEFAULT_PAGE_SIZE = 2;
export const MAX_SUGGESTIONS = 5;
export const SUGGESTION_TIMEOUT = 200;

// Animation Constants
export const ANIMATION_DURATION = 0.2;
export const SCALE_ANIMATION_DURATION = 0.15;

// Storage Keys
export const STORAGE_KEYS = {
  TRANSACTIONS: 'transactions',
  WALLETS: 'wallets',
  CUSTOM_CATEGORIES: 'customCategories',
  DASHBOARD_CARDS: 'dashboardCards'
} as const;

// Default Values
export const DEFAULT_WALLET = 'global';
export const DEFAULT_TRANSACTION_TYPE = 'expense' as const;

// Currency
export const CURRENCY_CONFIG = {
  locale: 'id-ID',
  currency: 'IDR',
  minimumFractionDigits: 0
} as const;