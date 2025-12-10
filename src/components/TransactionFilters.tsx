import { Search, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterState {
  searchText: string;
  typeFilter: 'all' | 'income' | 'expense';
  filterCategory: string;
  dateFrom: string;
  dateTo: string;
  sortOrder: 'desc' | 'asc';
}

interface Props {
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  showAdvancedFilters: boolean;
  onToggleAdvancedFilters: () => void;
  categories: string[];
  onExportCSV: () => void;
  onImportCSV: () => void;
  onClearFilters: () => void;
  isInSidebar?: boolean;
}

export default function TransactionFilters({
  filters,
  onFiltersChange,
  showAdvancedFilters,
  onToggleAdvancedFilters,
  categories,
  onExportCSV,
  onImportCSV,
  onClearFilters,
  isInSidebar = false
}: Props) {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-100 text-lg">Transactions</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleAdvancedFilters}
            className="px-3 py-2 bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-lg text-sm transition-colors"
          >
            {showAdvancedFilters ? 'Hide' : 'Show'} Filters
          </button>
        </div>
      </div>
      
      <div className="flex justify-between items-center gap-2 mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-1/2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={filters.searchText}
              onChange={(e) => onFiltersChange({ searchText: e.target.value })}
              className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm placeholder-gray-400"
            />
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="mb-4 overflow-hidden"
          >
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-600 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select
                  value={filters.typeFilter}
                  onChange={(e) => onFiltersChange({ 
                    typeFilter: e.target.value as 'all' | 'income' | 'expense',
                    filterCategory: ''
                  })}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
                
                <select
                  value={filters.filterCategory}
                  onChange={(e) => onFiltersChange({ filterCategory: e.target.value })}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="date"
                  placeholder="Date From"
                  value={filters.dateFrom}
                  onChange={(e) => onFiltersChange({ dateFrom: e.target.value })}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg text-sm"
                  style={{ colorScheme: 'dark' }}
                />
                <input
                  type="date"
                  placeholder="Date To"
                  value={filters.dateTo}
                  onChange={(e) => onFiltersChange({ dateTo: e.target.value })}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg text-sm"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex gap-3">
                  {!isInSidebar && (
                    <>
                      <button
                        onClick={onImportCSV}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-1"
                      >
                        <Upload className="w-4 h-4" />
                        Import CSV
                      </button>
                      <button
                        onClick={onExportCSV}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        Export CSV
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => onFiltersChange({ 
                      sortOrder: filters.sortOrder === 'desc' ? 'asc' : 'desc' 
                    })}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    {filters.sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                  </button>
                </div>
                
                <button
                  onClick={onClearFilters}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Clear All
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}