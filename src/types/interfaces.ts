import { Transaction } from '../types';

// Interface Segregation - Split large interfaces into smaller, focused ones
export interface TransactionActions {
  onEditTransaction: (id: string, transaction: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  onAddTransaction?: (transaction: Omit<Transaction, 'id'>) => void;
}

export interface TransactionImportActions {
  onImportTransactions?: (transactions: Omit<Transaction, 'id'>[], walletId: string) => void;
}

export interface WalletInfo {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

export interface TransactionDisplayProps {
  transactions: Transaction[];
  wallets?: WalletInfo[];
  isInSidebar?: boolean;
  selectedWallet?: string;
}

export interface DeleteModeState {
  deleteMode: boolean;
  selectedTransactions: Set<string>;
  onToggleDeleteMode: () => void;
  onToggleSelection: (id: string) => void;
  onBulkDelete: () => void;
}

export interface EditingState {
  editingCell: { id: string; field: string } | null;
  editForm: {
    amount: string;
    description: string;
    category: string;
    subcategory: string;
    type: 'income' | 'expense';
    date: string;
    time: string;
  };
  onStartEdit: (id: string, field: string) => void;
  onSaveEdit: (id: string, field: string) => void;
}