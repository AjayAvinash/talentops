import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'loading';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    addToast: (message: string, type: ToastType, duration?: number) => string;
    removeToast: (id: string) => void;
    updateToast: (id: string, updates: Partial<Toast>) => void;
    toasts: Toast[];
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType, duration = 3000) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type, duration }]);

        if (type !== 'loading' && duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const updateToast = useCallback((id: string, updates: Partial<Toast>) => {
        setToasts((prev) =>
            prev.map((toast) => (toast.id === id ? { ...toast, ...updates } : toast))
        );

        if (updates.type && updates.type !== 'loading') {
            const duration = updates.duration || 3000;
            if (duration > 0) {
                setTimeout(() => {
                    removeToast(id);
                }, duration);
            }
        }
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ addToast, removeToast, updateToast, toasts }}>
            {children}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
