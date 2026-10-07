import React from 'react';
import { 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  User, 
  CheckCheck,
  Wrench,
  Shirt,
  Plus,
  Calendar,
  Sparkles,
  QrCode,
  Camera,
  Layers,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { formatTimer, formatLocalTime } from '../utils/helpers';
import { sound } from '../utils/audio';
import { SLOT_CONFIG } from '../utils/constants';

export default function MachineCard({ 
  machine, 
  onStartNext, 
  onCollectClothes, 
  onToggleMaintenance, 
  onQuickBook,
  onOpenQRScanner,
  onOpenQRSticker,
  currentActiveSlot = null,
  currentSlotBooking = null,
  upcomingReservation = null,
  currentUser = null
}) {
  const isRunning = machine.status === 'RUNNING' && machine.currentWash;
  const isAvailable = machine.status === 'AVAILABLE';
  const isUnclaimed = machine.status === 'COMPLETED_UNCLAIMED';
  const isMaintenance = machine.status === 'MAINTENANCE';

  const currentWash = machine.currentWash;
  const isMyWash = currentUser && currentWash && (
    (currentWash.phone && currentUser.phone && currentWash.phone.replace(/\D/g, '') === currentUser.phone.replace(/\D/g, '')) ||
    (currentWash.userId && currentUser.id && currentWash.userId === currentUser.id)
  );

  const isMyUpcomingSlot = currentUser && currentSlotBooking && (
    (currentSlotBooking.phone && currentUser.phone && currentSlotBooking.phone.replace(/\D/g, '') === currentUser.phone.replace(/\D/g, '')) ||
    (currentSlotBooking.userId && currentUser.id && currentSlotBooking.userId === currentUser.id)
  );

  // Overall 1 Hour 30 Minutes (90m = 5400s) Slot Calculations
  const totalSlotSec = currentWash?.totalDurationSeconds || (90 * 60);
  const remainingSec = currentWash?.remainingSeconds ?? totalSlotSec;
  const elapsedSec = Math.max(0, totalSlotSec - remainingSec);
  const progressPercent = totalSlotSec > 0 ? Math.min(100, Math.max(0, Math.round((elapsedSec / totalSlotSec) * 100))) : 0;
  const isWashPhase = remainingSec > 25 * 60; // First 65m is active wash, last 25m is rest/pickup

  return (
    <div className={`bg-white rounded-2xl border p-4 sm:p-6 flex flex-col justify-between transition-all shadow-xs hover:shadow-md ${
      isRunning 
        ? isMyWash ? 'border-blue-400 ring-2 ring-blue-100 bg-blue-50/10' : 'border-blue-200 ring-1 ring-blue-50' 
        : isAvailable 
        ? 'border-slate-200' 
        : isUnclaimed
        ? 'border-amber-300 bg-amber-50/20'
        : 'border-slate-200 opacity-80'
    }`}>
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {machine.name}
              </h3>
              {isMyWash && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-600 text-white shadow-xs">
                  Your Wash
                </span>
              )}
            </div>
          </div>

          {/* Machine Status Badge */}
          <div className="flex items-center gap-1.5">
            {isRunning && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                In Use · 1h 30m
              </span>
            )}
            {isAvailable && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                Available
              </span>
            )}
            {isUnclaimed && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                Resting & Pickup
              </span>
            )}
            {isMaintenance && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                Service Mode
              </span>
            )}

            {/* View QR Code Sticker Button */}
            <button
              onClick={() => {
                sound.playClick();
                onOpenQRSticker(machine);
              }}
              title="View Machine QR Sticker (Printable)"
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
            >
              <QrCode className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* State Content Area */}
        <div className="mt-5 space-y-4">
          {/* Running State: Overall 1h 30m Slot Countdown */}
          {isRunning && (
            <>
              {/* Large Timer with Hard Slot Boundary */}
              <div className="text-center py-4 px-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium px-2 mb-1">
                  <span>Slot: {currentWash.slotLabel || '1h 30m Window'}</span>
                  <span className="font-mono text-slate-700 font-bold">
                    Ends at {currentWash.endTime ? `${currentWash.endTime}` : formatLocalTime(Date.now() + remainingSec * 1000)}
                  </span>
                </div>

                <span className="font-mono text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight block">
                  {formatTimer(remainingSec)}
                </span>

                <div className="mt-2 flex items-center justify-center gap-2 text-xs font-medium">
                  {isWashPhase ? (
                    <span className="text-blue-800 bg-blue-100/70 px-2.5 py-0.5 rounded-full border border-blue-200">
                      Phase 1: Washing (65m)
                    </span>
                  ) : (
                    <span className="text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                      Phase 2: Machine Rest & Pickup (25m)
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1 font-medium">
                  <span>Slot Window Progress</span>
                  <span className="font-mono text-slate-900 font-bold">{progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Current Resident Information */}
              <div className="pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between text-slate-900 font-bold">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{currentWash.userName}</span>
                  </div>
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800">
                    {currentWash.roomNo}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] mt-1 pl-5.5">
                  {currentWash.itemSummary || `${currentWash.clothesCount} clothes`} · {currentWash.cycleName || '1h 30m Slot'}
                </p>
              </div>
            </>
          )}

          {/* Phase 2: Rest & Pickup State (25m) */}
          {isUnclaimed && (
            <>
              <div className="text-center py-4 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                  Machine Cooling & Pickup Window
                </span>
                <span className="font-mono text-3xl sm:text-4xl font-bold text-amber-950 tracking-tight block">
                  {formatTimer(remainingSec)}
                </span>
                <span className="text-xs text-amber-700 block">
                  Wash completed · Clothes ready for collection
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs text-amber-800 mb-1 font-medium">
                  <span>Rest Window Progress (25m)</span>
                  <span className="font-mono text-amber-950 font-bold">{progressPercent}%</span>
                </div>
                <div className="w-full bg-amber-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-amber-100 text-xs">
                <div className="flex items-center justify-between text-slate-900 font-bold">
                  <span>{currentWash?.userName}</span>
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white border border-amber-200 text-amber-900">
                    {currentWash?.roomNo}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] mt-1">
                  Please collect clothes so the machine is cool and ready for the next scheduled slot.
                </p>
              </div>
            </>
          )}

          {/* Available State: Awaiting QR Scan or Open for Booking */}
          {isAvailable && (
            <div className="py-4 px-4 bg-slate-50/80 rounded-xl border border-dashed border-slate-200 space-y-3">
              {currentSlotBooking ? (
                /* There is a booked slot for the current window awaiting QR scan at the physical machine */
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>Slot Reserved: {currentSlotBooking.slotLabel || 'Current Window'}</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      Awaiting QR Scan
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{currentSlotBooking.name}</span>
                        <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {currentSlotBooking.roomNo}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {currentSlotBooking.itemSummary || 'Scheduled Wash'}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        sound.playClick();
                        onOpenQRScanner(machine.id);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Scan QR</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Scan the machine QR code to start wash. Timer will run until the slot ends at <strong>{currentSlotBooking.endTime}</strong>.
                  </p>
                </div>
              ) : (
                /* No current booking for this moment */
                <div className="text-center py-2 space-y-1">
                  <p className="text-xs font-bold text-emerald-700">Ready for Next Slot</p>
                  <p className="text-[11px] text-slate-500">
                    Current Window: <strong className="text-slate-700">{currentActiveSlot?.label || '06:00 - 07:30'}</strong>
                  </p>

                  {upcomingReservation && (
                    <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-blue-800 flex items-center justify-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>
                        Next: {upcomingReservation.slotDateDisplay || 'Today'} ({upcomingReservation.slotLabel}) by {upcomingReservation.name} ({upcomingReservation.roomNo})
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Maintenance State */}
          {isMaintenance && (
            <div className="py-8 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p className="text-xs font-bold text-slate-800">Under Service & Maintenance</p>
              <p className="text-[11px] text-slate-500">Unit temporarily offline for scheduled upkeep.</p>
            </div>
          )}
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2.5">
        {isRunning && (
          <div className="w-full py-2 px-3 rounded-lg bg-slate-50 text-center text-xs text-slate-600 font-medium">
            {isMyWash ? 'Your active wash is running' : 'Cycle in progress until slot end'}
          </div>
        )}

        {isAvailable && (
          <div className="w-full flex gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onOpenQRScanner(machine.id);
              }}
              className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Scan Machine QR</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onQuickBook(machine.id);
              }}
              className="py-2.5 px-3.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Book Slot</span>
            </button>
          </div>
        )}

        {isUnclaimed && (
          <button
            onClick={() => {
              sound.playClick();
              onCollectClothes(machine.id);
            }}
            className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark Collected & Free Machine</span>
          </button>
        )}

        {isMaintenance && (
          <button
            onClick={() => {
              sound.playClick();
              onToggleMaintenance(machine.id);
            }}
            className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <Wrench className="w-3.5 h-3.5 text-emerald-600" />
            <span>Restore Unit Online</span>
          </button>
        )}
      </div>
    </div>
  );
}
