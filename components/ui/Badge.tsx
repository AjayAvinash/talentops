import React from 'react';

export type BadgeVariant = 'gray' | 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'indigo';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'gray', className = '' }) => {
  const variants = {
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    yellow: 'bg-amber-50 text-amber-700 border-amber-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const getStatusBadgeVariant = (status: string): BadgeVariant => {
  switch (status) {
    case 'Applied': return 'blue';
    case 'Screening': return 'purple';
    case 'Technical': return 'indigo';
    case 'Manager': return 'yellow';
    case 'Offer': return 'green';
    case 'Hired': return 'green';
    case 'Rejected': return 'red';
    case 'Open': return 'green';
    case 'Closed': return 'gray';
    case 'On Hold': return 'yellow';
    default: return 'gray';
  }
};
