import React from 'react';

interface AvatarProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = 'md', className = '' }) => {
  const initial = name ? name.charAt(0).toUpperCase() : '?';

  // Deterministic color based on name length to keep it consistent across renders
  const colors = [
    'bg-blue-600 text-white',
    'bg-emerald-600 text-white',
    'bg-violet-600 text-white',
    'bg-amber-500 text-white',
    'bg-rose-600 text-white',
    'bg-indigo-600 text-white',
    'bg-teal-600 text-white',
    'bg-orange-500 text-white',
    'bg-cyan-600 text-white',
    'bg-fuchsia-600 text-white'
  ];

  const colorIndex = name ? name.length % colors.length : 0;
  const colorClass = colors[colorIndex];

  const sizeClasses = {
    xs: 'w-5 h-5 text-[10px]',
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-20 h-20 text-3xl',
  };

  return (
    <div className={`rounded-full flex items-center justify-center font-semibold shrink-0 ${colorClass} ${sizeClasses[size]} ${className}`}>
      {initial}
    </div>
  );
};