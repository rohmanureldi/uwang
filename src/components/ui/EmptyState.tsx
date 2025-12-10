import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="bg-gray-900 rounded-xl p-6 sm:p-8 shadow-lg border border-gray-700 text-center">
      <div className="text-gray-300 text-4xl sm:text-5xl mb-2 flex justify-center">
        {icon}
      </div>
      <p className="text-gray-300 text-sm sm:text-base mb-4">{title}</p>
      {description && (
        <p className="text-gray-400 text-xs sm:text-sm mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}