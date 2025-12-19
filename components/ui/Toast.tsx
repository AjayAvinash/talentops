import React from 'react';
import { useToast } from '../../context/ToastContext';
import { CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToast();

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-md w-full sm:w-auto">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`
                        flex items-center gap-3 p-4 rounded-2xl shadow-2xl border animate-in slide-in-from-right-full duration-500
                        ${toast.type === 'success' ? 'bg-indigo-600 border-indigo-500 text-white shadow-indigo-500/20' : ''}
                        ${toast.type === 'error' ? 'bg-rose-600 border-rose-500 text-white shadow-rose-500/20' : ''}
                        ${toast.type === 'loading' ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-black/40' : ''}
                    `}
                >
                    <div className="flex-shrink-0 flex items-center justify-center">
                        {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-indigo-100" />}
                        {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-100" />}
                        {toast.type === 'loading' && <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />}
                    </div>

                    <div className="flex-grow text-sm font-semibold tracking-wide">
                        {toast.message}
                    </div>

                    {toast.type !== 'loading' && (
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="flex-shrink-0 hover:bg-white/10 p-1.5 rounded-xl transition-colors"
                        >
                            <X className="w-4 h-4 text-white/80" />
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};
