import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X, Bell } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isAlert = toast.type === 'alert' || toast.type === 'warning';

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in fade-in duration-150">
      <div className={`p-4 rounded-xl shadow-lg border flex items-start gap-3 bg-white ${
        isSuccess 
          ? 'border-emerald-200' 
          : isAlert 
          ? 'border-amber-200' 
          : 'border-slate-200'
      }`}>
        <div className={`p-1.5 rounded-lg shrink-0 ${
          isSuccess 
            ? 'bg-emerald-50 text-emerald-600' 
            : isAlert 
            ? 'bg-amber-50 text-amber-600' 
            : 'bg-blue-50 text-blue-600'
        }`}>
          {isSuccess ? <CheckCircle2 className="w-4 h-4" /> : isAlert ? <Bell className="w-4 h-4" /> : <Info className="w-4 h-4" />}
        </div>

        <div className="flex-1 pr-2">
          <h5 className="text-xs font-bold text-slate-900">{toast.title}</h5>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{toast.message}</p>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
