import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ShieldCheck, 
  Shirt, 
  Layers, 
  Clock, 
  Check, 
  Ban,
  Info,
  BookOpen
} from 'lucide-react';
import { sound } from '../utils/audio';
import { LAUNDRY_GUIDELINES } from '../utils/constants';

export default function GuidelinesModal({
  isOpen,
  onClose,
  isAutoPopup = false,
  onAcknowledge
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'dos' | 'donts'
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    sound.playClick();
    if (onAcknowledge) {
      onAcknowledge(dontShowAgain);
    }
    onClose();
  };

  const dosList = LAUNDRY_GUIDELINES?.dos || [];
  const dontsList = LAUNDRY_GUIDELINES?.donts || [];

  return (
    <div className="fixed inset-0 z-60 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[88vh] flex flex-col my-0 sm:my-auto animate-in slide-in-from-bottom-4 duration-200">
        
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Hostel Laundry Guidelines & Rules
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/40">
                  Required Reading
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Highlight Banner: Key Constraints */}
        <div className="p-3 sm:px-6 bg-blue-50/80 border-b border-blue-200/70 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs shrink-0">
          <div className="p-2 bg-white rounded-xl border border-blue-200 shadow-2xs">
            <span className="font-bold text-blue-950 block text-[11px] sm:text-xs">Max 10 Clothes</span>
            <span className="text-[10px] text-blue-700 leading-tight block mt-0.5">5 pairs shirts/pants (dry only)</span>
          </div>

          <div className="p-2 bg-white rounded-xl border border-rose-200 shadow-2xs">
            <span className="font-bold text-rose-950 block text-[11px] sm:text-xs">No Small Items</span>
            <span className="text-[10px] text-rose-700 leading-tight block mt-0.5">No socks or handkerchiefs</span>
          </div>

          <div className="p-2 bg-white rounded-xl border border-indigo-200 shadow-2xs">
            <span className="font-bold text-indigo-950 block text-[11px] sm:text-xs">Liquid Only</span>
            <span className="text-[10px] text-indigo-700 leading-tight block mt-0.5">No powder detergent / bars</span>
          </div>

          <div className="p-2 bg-white rounded-xl border border-emerald-200 shadow-2xs">
            <span className="font-bold text-emerald-950 block text-[11px] sm:text-xs">1 Bedsheet / Slot</span>
            <span className="text-[10px] text-emerald-700 leading-tight block mt-0.5">Strict slot punctuality</span>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="px-4 sm:px-6 pt-3 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium">
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('all');
              }}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Rules
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('dos');
              }}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 ${
                activeTab === 'dos'
                  ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                  : 'text-emerald-700 hover:text-emerald-900'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>What To Do</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('donts');
              }}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 ${
                activeTab === 'donts'
                  ? 'bg-rose-600 text-white font-bold shadow-2xs'
                  : 'text-rose-700 hover:text-rose-900'
              }`}
            >
              <Ban className="w-3.5 h-3.5" />
              <span>What To Avoid</span>
            </button>
          </div>
        </div>

        {/* Scrollable Rules Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          
          {/* Section: What to Do (DO's) */}
          {(activeTab === 'all' || activeTab === 'dos') && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 pb-1 border-b border-emerald-100">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-emerald-900 uppercase tracking-wider">
                  What To Do (Allowed & Recommended)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {dosList.map((item, index) => (
                  <div 
                    key={index}
                    className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/70 hover:border-emerald-300 transition-colors space-y-1"
                  >
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <h4 className="text-xs font-bold text-emerald-950 leading-tight">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-emerald-900 pl-6 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: What Not to Do (DON'Ts) */}
          {(activeTab === 'all' || activeTab === 'donts') && (
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2 pb-1 border-b border-rose-100">
                <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
                  <Ban className="w-3 h-3" />
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-rose-900 uppercase tracking-wider">
                  What NOT To Do (Strictly Prohibited)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {dontsList.map((item, index) => (
                  <div 
                    key={index}
                    className="p-3 rounded-xl bg-rose-50/50 border border-rose-200/70 hover:border-rose-300 transition-colors space-y-1"
                  >
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-rose-600 text-white font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <h4 className="text-xs font-bold text-rose-950 leading-tight">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-rose-900 pl-6 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Machine Health Notice */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px] uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Hostel Laundry Policy Enforcement</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Misuse of the machine (overloading with more than 10 clothes, putting loose socks, or wet clothes) causes pump failures and motor burnout. Repeat violations will result in temporary suspension of weekly booking quotas.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Do not show this pop-up automatically again</span>
          </label>

          <button
            type="button"
            onClick={handleConfirm}
            className="py-2.5 px-6 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Check className="w-4 h-4" />
            <span>I Understand & Agree</span>
          </button>
        </div>
      </div>
    </div>
  );
}
