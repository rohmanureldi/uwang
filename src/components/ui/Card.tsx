import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'gradient';
}

const variants = {
  default: 'bg-gray-900 border border-gray-700',
  gradient: 'bg-gradient-to-r from-gray-800 to-gray-750 border border-gray-600'
};

export default function Card({ 
  children, 
  className = '', 
  variant = 'default' 
}: CardProps) {
  return (
    <div className={`rounded-xl p-4 shadow-lg ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}