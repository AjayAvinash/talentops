import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', padding = 'md', onClick }) => {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`bg-white rounded-xl border border-gray-300 shadow-[0_2px_4px_rgba(0,0,0,0.02)] ${paddings[padding]} ${className} ${onClick ? 'cursor-pointer hover:shadow-md hover:border-gray-400 transition-all duration-200' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};