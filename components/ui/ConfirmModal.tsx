import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'primary';
    isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    isLoading = false
}) => {
    const getVariantClasses = () => {
        switch (variant) {
            case 'danger':
                return 'bg-red-600 hover:bg-red-700 text-white shadow-red-200';
            case 'warning':
                return 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200';
            default:
                return 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200';
        }
    };

    const getIconColor = () => {
        switch (variant) {
            case 'danger':
                return 'text-red-500 bg-red-50';
            case 'warning':
                return 'text-amber-500 bg-amber-50';
            default:
                return 'text-indigo-500 bg-indigo-50';
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="flex flex-col items-center justify-center p-4 text-center">
                <div className={`p-4 rounded-full mb-6 ${getIconColor()}`}>
                    <AlertTriangle size={36} />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 mb-8 max-w-sm">
                    {message}
                </p>

                <div className="flex gap-3 w-full">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        className="flex-1"
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`
                            flex-1 py-2.5 px-4 rounded-xl font-semibold transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:pointer-events-none
                            ${getVariantClasses()}
                        `}
                    >
                        {isLoading ? 'Processing...' : confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
