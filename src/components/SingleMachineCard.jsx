import React from 'react';
import { 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  User, 
  FastForward, 
  CheckCheck, 
  Wrench, 
  Shirt, 
  Plus, 
  Phone,
  Layers
} from 'lucide-react';
import { formatTimer, formatLocalTime, getCycleStage } from '../utils/helpers';
import { sound } from '../utils/audio';

export default function SingleMachineCard({
  machine,
  onStartNext,
  onFinishEarly,
  onCollectClothes,
  onToggleMaintenance,
  onOpenBooking,
  queue = []
}) {
  const isRunning = machine.status === 'RUNNING' && machine.currentWash;
  const isAvailable = machine.status === 'AVAILABLE';
  const isUnclaimed = machine.status === 'COMPLETED_UNCLAIMED';
  const isMaintenance = machine.status === 'MAINTENANCE';

  const currentWash = machine.currentWash;
  const remainingSec = currentWash?.remainingSeconds || 0;
  const totalSec = currentWash?.totalDurationSeconds || 2400;
  const elapsedSec = totalSec - remainingSec;
  const progressPercent = totalSec > 0 ? Math.min(100, Math.max(0, Math.round((elapsedSec / totalSec) * 100))) : 0;

  const cycleInfo = getCycleStage(progressPercent);
  const nextInQueue = queue[0];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Header Bar */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white shadow-xs ${
            isRunning 
              ? 'bg-blue-600' 
              : isAvailable 
              ? 'bg-emerald-600' 
              : isUnclaimed
              ? 'bg-amber-600'
              : 'bg-slate-600'
          }`}>
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {machine.name}
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {machine.capacityKg}kg Capacity
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {machine.location} · {machine.model}
            </p>
          </div>
        </div>

        {/* Machine Status Pill */}
        <div>
          {isRunning && (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>Currently in Use (1 Person)</span>
            </span>
          )}
          {isAvailable && (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>Available · Ready to Use</span>
            </span>
          )}
          {isUnclaimed && (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Cycle Complete (Awaiting Collection)</span>
            </span>
          )}
          {isMaintenance && (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              <Wrench className="w-3.5 h-3.5" />
              <span>Under Service / Maintenance</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div className="p-5 sm:p-6">
        {/* STATE 1: CURRENTLY IN USE */}
        {isRunning && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left: Timer & Progress Bar (5 cols) */}
            <div className="md:col-span-5 bg-slate-50 p-5 rounded-xl border border-slate-100 text-center flex flex-col justify-center space-y-3">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Time Remaining
                </span>
                <span className="font-mono text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight block mt-1">
                  {formatTimer(remainingSec)}
                </span>
              </div>

              {/* Progress */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <span>{cycleInfo.stage}</span>
                  <span className="font-mono text-slate-900 font-bold">{progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 text-left">{cycleInfo.sub}</p>
              </div>
            </div>

            {/* Right: Current Active Resident Details (7 cols) */}
            <div className="md:col-span-7 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Current User
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Started at {formatLocalTime(currentWash.startedAt)} · Ends ~{formatLocalTime(Date.now() + remainingSec * 1000)}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {currentWash.userName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {currentWash.phone || 'No phone provided'}
                    </p>
                  </div>
                  <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                    {currentWash.roomNo}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-500 block">Laundry Load:</span>
                    <strong className="text-slate-900 font-semibold">{currentWash.clothesCount} clothes</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Wash Cycle:</span>
                    <strong className="text-blue-700 font-semibold">{currentWash.cycleName}</strong>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => {
                    sound.playClick();
                    onFinishEarly();
                  }}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <FastForward className="w-3.5 h-3.5 text-blue-600" />
                  <span>Finish Early (Demo Test)</span>
                </button>

                <button
                  onClick={onToggleMaintenance}
                  className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  Maintenance Mode
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STATE 2: AVAILABLE / EMPTY */}
        {isAvailable && (
          <div className="text-center py-8 sm:py-10 max-w-lg mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Washing Machine is Free Right Now
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {queue.length > 0 
                  ? `There are ${queue.length} resident(s) waiting in the queue. You can start the next in line immediately.`
                  : 'No one is currently washing or waiting. You can start a wash cycle immediately.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {queue.length > 0 ? (
                <button
                  onClick={() => {
                    sound.playStart();
                    onStartNext();
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Wash for {nextInQueue?.name} ({nextInQueue?.roomNo})</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    sound.playClick();
                    onOpenBooking();
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Start New Wash</span>
                </button>
              )}

              <button
                onClick={onToggleMaintenance}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Service Mode
              </button>
            </div>
          </div>
        )}

        {/* STATE 3: FINISHED / UNCLAIMED */}
        {isUnclaimed && (
          <div className="p-6 bg-amber-50 rounded-xl border border-amber-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-amber-900">
                    Wash Cycle Complete · Awaiting Clothes Collection
                  </h3>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Clothes belong to <strong className="font-semibold">{currentWash?.userName}</strong> ({currentWash?.roomNo}, {currentWash?.clothesCount} items).
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  onCollectClothes();
                }}
                className="px-5 py-2.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-colors flex items-center justify-center gap-2 shadow-xs shrink-0"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Mark Clothes Collected & Free Machine</span>
              </button>
            </div>
          </div>
        )}

        {/* STATE 4: MAINTENANCE */}
        {isMaintenance && (
          <div className="text-center py-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto border border-slate-200">
              <Wrench className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Washing Machine is Under Service / Maintenance
            </h3>
            <p className="text-xs text-slate-500">
              Temporarily paused for routine cleaning or maintenance inspection.
            </p>
            <button
              onClick={onToggleMaintenance}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              Restore Machine to Available
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
