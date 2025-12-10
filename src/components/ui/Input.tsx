import { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  variant?: 'base' | 'search';
}

const variants = {
  base: 'w-full pl-10 pr-3 py-3 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg text-sm',
  search: 'w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm placeholder-gray-400'
};

export default function Input({ 
  icon, 
  variant = 'base', 
  className = '', 
  ...props 
}: InputProps) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
          {icon}
        </div>
      )}
      <input
        className={`${variants[variant]} ${className}`}
        {...props}
      />
    </div>
  );
}