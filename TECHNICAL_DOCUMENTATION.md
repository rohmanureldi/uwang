# Uwang - Technical Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Component Library](#component-library)
6. [State Management](#state-management)
7. [Data Layer](#data-layer)
8. [Styling System](#styling-system)
9. [Development Guidelines](#development-guidelines)
10. [API Reference](#api-reference)
11. [Deployment](#deployment)
12. [Contributing](#contributing)

## 🎯 Project Overview

**Uwang** is a modern personal finance management application built with React, TypeScript, and Vite. It follows the MVVM (Model-View-ViewModel) architecture pattern and implements a comprehensive component-based design system.

### Key Features
- 💰 Transaction management (income/expense tracking)
- 👛 Multi-wallet support
- 📊 Financial analytics and charts
- 📱 Responsive design (mobile-first)
- 🔄 Real-time data synchronization with Supabase
- 📤 CSV import/export functionality
- 🎨 Dark theme UI

## 🏗️ Architecture

### MVVM Pattern Implementation
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      View       │◄──►│   ViewModel     │◄──►│     Model       │
│   (Components)  │    │   (Hooks)       │    │  (Services)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

- **View**: React components (`src/components/`)
- **ViewModel**: Custom hooks (`src/viewmodels/`, `src/hooks/`)
- **Model**: Services and data layer (`src/models/`, `src/services/`)

### Component Hierarchy
```
App
├── Dashboard
│   ├── Balance
│   ├── QuickStats
│   ├── TransactionList
│   ├── CategoryCharts
│   └── SpendingTrends
├── WalletManager
└── UI Components (Reusable)
```

## 🛠️ Tech Stack

### Core Technologies
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **State Management**: React Hooks + Custom ViewModels
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts

### Development Tools
- **Package Manager**: npm/yarn
- **Linting**: ESLint
- **Type Checking**: TypeScript
- **Version Control**: Git

## 📁 Project Structure

```
uwang/
├── public/                     # Static assets
├── src/
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── index.ts
│   │   ├── TransactionList.tsx
│   │   ├── TransactionModal.tsx
│   │   └── ...
│   ├── hooks/                # Custom React hooks
│   ├── models/               # Data models
│   ├── services/             # API services
│   ├── viewmodels/           # MVVM ViewModels
│   ├── utils/                # Utility functions
│   ├── styles/               # Style definitions
│   ├── types/                # TypeScript type definitions
│   ├── lib/                  # Third-party configurations
│   └── pages/                # Page components
├── database/                 # Database migrations
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

## 🎨 Component Library

### UI Components (`src/components/ui/`)

#### Button Component
```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'blue' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

// Usage
<Button variant="primary" size="lg">Save Transaction</Button>
```

#### Input Component
```tsx
interface InputProps {
  icon?: ReactNode;
  variant?: 'base' | 'search';
}

// Usage
<Input 
  icon="💰" 
  placeholder="Amount" 
  variant="base" 
/>
```

#### Modal Component
```tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

// Usage
<Modal isOpen={isOpen} onClose={onClose} title="Add Transaction">
  <TransactionForm />
</Modal>
```

#### Other Components
- **ConfirmDialog**: Confirmation dialogs with customizable actions
- **EmptyState**: Consistent empty state displays
- **Pagination**: Reusable pagination controls
- **SearchInput**: Search input with icon
- **Select**: Dropdown select with options
- **Card**: Container component with variants

### Component Guidelines
1. **Props Interface**: Always define TypeScript interfaces
2. **Variants**: Use variant props for styling variations
3. **Composition**: Prefer composition over inheritance
4. **Accessibility**: Include ARIA attributes where needed
5. **Performance**: Use React.memo for expensive components

## 🔄 State Management

### ViewModel Pattern
ViewModels encapsulate component state and business logic:

```tsx
// Example: useTransactionListViewModel
export function useTransactionListViewModel(
  transactions: Transaction[],
  selectedWallet?: string
) {
  const [filters, setFilters] = useState<FilterState>({...});
  const [ui, setUi] = useState({...});
  
  // Computed values
  const filteredTransactions = useMemo(() => {...}, [transactions, filters]);
  
  // Actions
  const actions = {
    updateFilters: (newFilters: Partial<FilterState>) => {...},
    setUiState: (updates: Partial<UiState>) => {...},
  };
  
  return {
    // State
    filters,
    ui,
    // Computed
    filteredTransactions,
    // Actions
    actions
  };
}
```

### State Structure
```tsx
interface FilterState {
  searchText: string;
  typeFilter: 'all' | 'income' | 'expense';
  dateFrom: string;
  dateTo: string;
  sortOrder: 'desc' | 'asc';
}

interface UiState {
  deleteMode: boolean;
  selectedTransactions: Set<string>;
  isAddingNew: boolean;
  showAdvancedFilters: boolean;
  currentPage: number;
  pageSize: number;
}
```

## 💾 Data Layer

### Models (`src/models/`)
```tsx
// TransactionModel.ts
export interface ITransactionModel {
  getAllTransactions(): Promise<Transaction[]>;
  addTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction>;
  updateTransaction(id: string, updates: Partial<Transaction>): Promise<void>;
  deleteTransaction(id: string): Promise<void>;
}

export class TransactionModel implements ITransactionModel {
  // Implementation with Supabase + localStorage fallback
}
```

### Services (`src/services/`)
```tsx
// TransactionService.ts
export class TransactionService {
  validateTransaction(transaction: any): boolean;
  formatTransactionData(data: any, walletId?: string): Transaction;
  exportToCSV(transactions: Transaction[]): void;
}
```

### Data Flow
1. **Component** calls ViewModel action
2. **ViewModel** calls Model method
3. **Model** interacts with Supabase/localStorage
4. **Data** flows back through the chain
5. **Component** re-renders with new state

## 🎨 Styling System

### Design Tokens (`src/styles/index.ts`)
```tsx
export const colors = {
  primary: {
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9'
  },
  // ... more colors
};

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '0.75rem',
  // ... more spacing
};
```

### Component Styles (`src/styles/transactionList.styles.ts`)
```tsx
export const styles = {
  container: 'bg-gray-900 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-700',
  button: {
    primary: 'bg-purple-600 text-white hover:bg-purple-700',
    secondary: 'bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700',
  },
  // ... more styles
};
```

### Tailwind Configuration
```js
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Custom color palette
      },
      animation: {
        // Custom animations
      }
    }
  }
}
```

## 📋 Development Guidelines

### Code Style
1. **TypeScript**: Use strict mode, define interfaces for all props
2. **Naming**: Use PascalCase for components, camelCase for functions
3. **File Structure**: One component per file, co-locate related files
4. **Imports**: Use absolute imports, group by type (React, libraries, local)

### Component Development
```tsx
// Template for new components
import { ReactNode } from 'react';

interface ComponentProps {
  // Define all props with types
  children?: ReactNode;
  className?: string;
}

export default function Component({ 
  children, 
  className = '' 
}: ComponentProps) {
  return (
    <div className={`base-styles ${className}`}>
      {children}
    </div>
  );
}
```

### Testing Strategy
1. **Unit Tests**: Test individual components and utilities
2. **Integration Tests**: Test component interactions
3. **E2E Tests**: Test complete user workflows
4. **Type Safety**: Leverage TypeScript for compile-time checks

### Performance Guidelines
1. **React.memo**: Use for expensive components
2. **useMemo/useCallback**: Optimize expensive calculations
3. **Code Splitting**: Lazy load routes and heavy components
4. **Bundle Analysis**: Monitor bundle size regularly

## 📚 API Reference

### Transaction API
```tsx
interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  subcategory?: string;
  type: 'income' | 'expense';
  date: string;
  time: string;
  wallet_id?: string;
}

// CRUD Operations
const transactionModel = new TransactionModel();
await transactionModel.addTransaction(transaction);
await transactionModel.updateTransaction(id, updates);
await transactionModel.deleteTransaction(id);
const transactions = await transactionModel.getAllTransactions();
```

### Wallet API
```tsx
interface Wallet {
  id: string;
  name: string;
  color: string;
  icon: string;
  balance: number;
  created_at: string;
}
```

### Supabase Schema
```sql
-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount DECIMAL NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  type TEXT CHECK (type IN ('income', 'expense')),
  date DATE NOT NULL,
  time TIME,
  wallet_id UUID REFERENCES wallets(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Wallets table
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT DEFAULT '#8b5cf6',
  icon TEXT DEFAULT 'wallet',
  balance DECIMAL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 Deployment

### Environment Setup
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables
```env
# .env.local
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Build Configuration
```ts
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['framer-motion', 'lucide-react']
        }
      }
    }
  }
});
```

## 🤝 Contributing

### Getting Started
1. **Fork** the repository
2. **Clone** your fork locally
3. **Install** dependencies: `npm install`
4. **Create** a feature branch: `git checkout -b feature/new-feature`
5. **Make** your changes following the guidelines
6. **Test** your changes thoroughly
7. **Commit** with descriptive messages
8. **Push** to your fork and create a Pull Request

### Pull Request Guidelines
1. **Description**: Clearly describe what the PR does
2. **Testing**: Include test cases for new features
3. **Documentation**: Update documentation if needed
4. **Code Review**: Address all review comments
5. **Squash**: Squash commits before merging

### Code Review Checklist
- [ ] TypeScript types are properly defined
- [ ] Components follow the established patterns
- [ ] No hardcoded styles (use UI components)
- [ ] Performance considerations addressed
- [ ] Accessibility requirements met
- [ ] Tests pass and coverage maintained

## 🔧 Troubleshooting

### Common Issues

#### TypeScript Errors
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
npm install

# Check types
npm run type-check
```

#### Build Issues
```bash
# Clear build cache
rm -rf dist
npm run build
```

#### Supabase Connection
1. Check environment variables
2. Verify Supabase URL and keys
3. Check network connectivity
4. Review Supabase dashboard for errors

### Performance Issues
1. **Bundle Size**: Use `npm run analyze` to check bundle size
2. **Memory Leaks**: Check for unsubscribed event listeners
3. **Re-renders**: Use React DevTools Profiler
4. **Database**: Optimize Supabase queries

## 📈 Roadmap

### Completed ✅
- [x] UI Component Library
- [x] MVVM Architecture Implementation
- [x] TypeScript Integration
- [x] Supabase Integration
- [x] Responsive Design
- [x] Transaction Management
- [x] Multi-wallet Support

### In Progress 🔄
- [ ] TransactionForm Refactoring
- [ ] Dashboard Widget Extraction
- [ ] Chart Component Standardization
- [ ] Form Validation System

### Planned 📋
- [ ] Unit Test Suite
- [ ] E2E Testing
- [ ] PWA Implementation
- [ ] Offline Support
- [ ] Data Export/Import
- [ ] Budget Management
- [ ] Savings Goals
- [ ] Financial Reports

## 📞 Support

### Documentation
- **Technical Docs**: This document
- **Component Docs**: See individual component files
- **API Docs**: See `src/types/` for interfaces

### Getting Help
1. **Issues**: Create GitHub issues for bugs
2. **Discussions**: Use GitHub discussions for questions
3. **Code Review**: Request reviews for complex changes

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintainers**: Development Team