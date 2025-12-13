import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: React.ReactNode;
  size?: 'md' | 'lg' | 'xl' | '2xl';
}

export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, children, title, size = 'md' }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  const sizeClasses = {
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
    '2xl': 'max-w-5xl',
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-gray-900/20 backdrop-blur-[2px] transition-opacity" 
        onClick={onClose}
      />
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className={`w-screen ${sizeClasses[size]} bg-white shadow-2xl flex flex-col animate-[slide-in-right_0.3s_ease-out]`}>
          {title && (
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-white z-10">
               <div className="flex-1">{title}</div>
               <button 
                onClick={onClose}
                className="ml-4 text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-md hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
          )}
          {!title && (
             <button 
                onClick={onClose}
                className="absolute top-6 right-6 z-20 text-gray-400 hover:text-gray-600 bg-white/50 backdrop-blur rounded-full p-2 hover:bg-white shadow-sm"
              >
                <X size={20} />
              </button>
          )}
          <div className="flex-1 overflow-y-auto bg-white">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};