export const styles = {
  container: 'bg-gray-900 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-700',
  emptyState: 'bg-gray-900 rounded-xl p-6 sm:p-8 shadow-lg border border-gray-700 text-center',
  header: 'flex justify-between items-center mb-4',
  title: 'font-semibold text-gray-100 text-lg',
  button: {
    primary: 'px-3 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg text-sm transition-colors',
    secondary: 'px-3 py-2 bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-lg text-sm transition-colors',
    danger: 'px-3 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg text-sm transition-colors',
    success: 'px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm',
    blue: 'px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-1',
    gray: 'px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg hover:bg-gray-600 transition-colors text-sm'
  },
  input: {
    base: 'w-full pl-10 pr-3 py-3 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg text-sm',
    search: 'w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm placeholder-gray-400',
    select: 'px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg text-sm',
    date: 'px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg text-sm'
  },
  modal: {
    overlay: 'fixed inset-0 flex items-center justify-center z-50',
    content: 'bg-gray-800 rounded-xl p-6 border border-gray-600 shadow-2xl max-w-md mx-4 w-full max-h-[90vh] overflow-y-auto',
    confirmContent: 'bg-slate-700 rounded-xl p-6 border border-slate-600 shadow-2xl max-w-sm mx-4'
  },
  table: {
    container: 'overflow-x-auto',
    table: 'w-full bg-gray-800/30 rounded-xl overflow-hidden border border-gray-700/30',
    header: 'bg-gray-700/20',
    headerCell: 'px-6 py-4 text-left text-gray-300 font-semibold text-xs uppercase tracking-wider',
    headerCellCenter: 'px-6 py-4 text-center text-gray-300 font-semibold text-xs uppercase tracking-wider',
    headerCellRight: 'px-6 py-4 text-right text-gray-300 font-semibold text-xs uppercase tracking-wider',
    row: 'border-t border-gray-600/20 transition-all duration-200 hover:bg-gray-700/20 cursor-pointer',
    cell: 'px-4 py-3',
    cellContent: 'px-2 py-1 text-gray-300 rounded text-sm min-h-[24px]'
  },
  list: {
    container: 'space-y-6',
    dateHeader: 'font-semibold text-gray-100 mb-3 bg-slate-600 px-3 py-2 rounded-lg transition-all',
    item: 'border-b border-slate-600 last:border-b-0 pb-3 last:pb-0 transition-all hover:bg-opacity-30 rounded-lg px-2 py-1'
  },
  form: {
    typeButton: {
      base: 'flex-1 py-3 px-4 rounded-lg text-sm transition-colors',
      expense: 'bg-red-600 text-white',
      income: 'bg-green-600 text-white',
      inactive: 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    },
    suggestion: {
      container: 'absolute top-full left-0 right-0 bg-gray-700 border border-gray-600 rounded mt-1 max-h-32 overflow-y-auto z-20',
      item: 'w-full text-left px-3 py-2 text-gray-100 text-sm',
      itemSelected: 'bg-purple-600',
      itemHover: 'hover:bg-gray-600'
    }
  },
  icon: {
    position: 'absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400',
    positionZ: 'absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10'
  },
  pagination: {
    container: 'flex items-center justify-between mt-4 pt-4 border-t border-gray-700',
    button: 'px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm',
    text: 'text-sm text-gray-400'
  },
  filters: {
    container: 'mb-4 overflow-hidden',
    content: 'p-4 bg-gray-800 rounded-lg border border-gray-600 space-y-4',
    grid: 'grid grid-cols-1 md:grid-cols-2 gap-3',
    actions: 'flex justify-between items-center'
  }
};