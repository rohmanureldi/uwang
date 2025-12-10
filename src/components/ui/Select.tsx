import { SelectHTMLAttributes, ReactNode } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  icon?: ReactNode;
  options: Array<{ value: string; label: string; }>;
}

export default function Select({ 
  icon, 
  options, 
  className = '', 
  ...props 
}: SelectProps) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
          {icon}
        </div>
      )}
      <select
        className={`w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-3 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg text-sm ${className}`}
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}