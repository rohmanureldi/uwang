import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'blue' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const variants = {
  primary: 'bg-purple-600 text-white hover:bg-purple-700',
  secondary: 'bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  success: 'bg-green-600 text-white hover:bg-green-700',
  blue: 'bg-blue-600 text-white hover:bg-blue-700',
  gray: 'bg-gray-700 border border-gray-600 text-gray-100 hover:bg-gray-600'
};

const sizes = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-3 text-base'
};

export default function Button({ 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  children, 
  ...props 
}: ButtonProps) {
  return (
    <button
      className={`${variants[variant]} ${sizes[size]} rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}