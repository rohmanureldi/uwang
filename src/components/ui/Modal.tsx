import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg'
};

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md' 
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(10px)' }}
      onClick={onClose}
    >
      <div 
        className={`bg-gray-800 rounded-xl p-6 border border-gray-600 shadow-2xl ${sizes[size]} mx-4 w-full max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h3 className="font-semibold text-gray-100 mb-4">{title}</h3>
        )}
        {children}
      </div>
    </div>
  );
}