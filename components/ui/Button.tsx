import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none";
  
  const variants = {
    primary: "bg-[#10B981] text-white hover:bg-[#059669] shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.1)] border border-transparent",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50/80 hover:border-gray-300 shadow-sm text-gray-800",
    danger: "bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300",
    ghost: "bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900",
  };

  const sizes = {
    sm: "h-9 px-3 text-sm gap-1.5",
    md: "h-10 px-5 text-sm font-semibold gap-2",
    lg: "h-12 px-6 text-base font-semibold gap-2.5",
    icon: "h-9 w-9 p-0",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span className="flex items-center justify-center -ml-0.5">{icon}</span>}
      {children}
    </button>
  );
};