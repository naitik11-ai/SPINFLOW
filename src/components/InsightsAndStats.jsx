import React, { useState } from 'react';
import { 
  BarChart3, 
  Clock, 
  ShieldCheck, 
  History, 
  CheckCircle2,
  Check, 
  Ban 
} from 'lucide-react';
import { HOURLY_BUSYNESS, LAUNDRY_GUIDELINES } from '../utils/constants';
import { formatRelativeTime } from '../utils/helpers';

export default function InsightsAndStats({ history = [] }) {
  const [activeTab, setActiveTab] = useState('busyness');
  const [rulesSubTab, setRulesSubTab] = useState('all'); // 'all' | 'dos' | 'donts'

  const currentHour = new Date().getHours();
  const currentHourString = `${currentHour.toString().padStart(2, '0')}:00`;

  return (
    <div className="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
      {/* Tabs */}
      <div className="p-3.5 sm:p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>Laundry Information</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500">Peak hours analytics, machine rules & Do's/Don'ts</p>
        </div>

        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setActiveTab('busyness')}
            className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-md transition-colors whitespace-nowrap text-center ${
              activeTab === 'busyness'
                ? 'bg-white text-blue-700 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Peak Hours
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-md transition-colors whitespace-nowrap text-center ${
              activeTab === 'history'
                ? 'bg-white text-blue-700 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Recent ({history.length})
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-md transition-colors whitespace-nowrap text-center ${
              activeTab === 'rules'
                ? 'bg-white text-blue-700 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Do's & Don'ts
          </button>
        </div>
      </div>

      {/* Tab 1: Peak Hours Chart */}
      {activeTab === 'busyness' && (
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" /> Low (0-35%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-blue-500" /> Moderate (36-70%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" /> Peak (71-100%)
              </span>
            </div>
            <span className="text-slate-700 font-medium">
              Optimal laundry hours: 06:00 - 08:00 & 12:00 - 15:00
            </span>
          </div>

          {/* Bar Chart Container */}
          <div className="h-36 flex items-end justify-between gap-1.5 pt-4 pb-2 px-3 bg-slate-50 rounded-lg border border-slate-100 overflow-x-auto">
            {HOURLY_BUSYNESS.map((slot) => {
              const isCurrent = slot.hour === currentHourString;
              let barColor = 'bg-emerald-500';
              if (slot.level > 70) barColor = 'bg-rose-500';
              else if (slot.level > 35) barColor = 'bg-blue-500';

              return (
                <div
                  key={slot.hour}
                  className="flex-1 flex flex-col items-center justify-end h-full min-w-[24px]"
                >
                  <div
                    className={`w-full max-w-[16px] rounded-t-xs transition-all ${barColor} ${
                      isCurrent ? 'ring-2 ring-blue-600 scale-105' : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ height: `${slot.level}%` }}
                    title={`${slot.hour}: ${slot.level}% (${slot.label})`}
                  />
                  <span className={`text-[10px] font-mono mt-2 ${
                    isCurrent ? 'font-bold text-blue-700 underline' : 'text-slate-500'
                  }`}>
                    {slot.hour.slice(0, 2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Recent Washes */}
      {activeTab === 'history' && (
        <div className="p-4 sm:p-5">
          {history.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {history.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-slate-900 font-semibold">{item.name}</strong>
                      <span className="font-mono text-slate-500">({item.roomNo})</span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      {item.machineName} · {item.clothesCount} clothes · {item.cycleName}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-emerald-700 font-semibold block">{item.status || 'Collected'}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatRelativeTime(item.completedAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              No completed washes recorded in this session.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Do's & Don'ts Guidelines */}
      {activeTab === 'rules' && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Quick Summary Pill Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg">
              <span className="font-bold text-blue-950 block">Load Limits</span>
              <span className="text-[11px] text-blue-800">Max 10 clothes (5 pairs) or 1 bedsheet only. Dry clothes only.</span>
            </div>
            <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg">
              <span className="font-bold text-amber-950 block">Strictly Avoid</span>
              <span className="text-[11px] text-amber-800">No loose socks, wet clothes, shoes, or multiple bedsheets.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* What to Do */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>What To Do</span>
              </h4>
              <div className="space-y-1.5">
                {LAUNDRY_GUIDELINES.dos.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200/60 text-xs">
                    <strong className="text-emerald-950 block">{item.title}</strong>
                    <span className="text-[11px] text-emerald-850 mt-0.5 block">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* What to Avoid */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                <Ban className="w-3.5 h-3.5 text-rose-600" />
                <span>What To Avoid</span>
              </h4>
              <div className="space-y-1.5">
                {LAUNDRY_GUIDELINES.donts.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-rose-50/50 border border-rose-200/60 text-xs">
                    <strong className="text-rose-950 block">{item.title}</strong>
                    <span className="text-[11px] text-rose-850 mt-0.5 block">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
