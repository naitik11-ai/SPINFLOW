import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  Trash2, 
  Bell, 
  Search, 
  Calendar,
  Plus,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { formatTimer, formatLocalTime, formatSlotDateDisplay } from '../utils/helpers';
import { sound } from '../utils/audio';

export default function QueueBoard({
  queue = [],
  machines = [],
  onCancelQueueItem,
  onNotifyResident,
  onOpenBooking,
  currentUser = null
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('all');

  // Filter queue by search and date
  const filteredQueue = queue.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.roomNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.phone && item.phone.includes(searchTerm));

    const matchesDate = 
      selectedDateFilter === 'all' || 
      item.slotDate === selectedDateFilter;

    return matchesSearch && matchesDate;
  });

  // Unique dates present in the queue for the filter dropdown
  const uniqueDates = Array.from(new Set(queue.map((q) => q.slotDate).filter(Boolean)));

  const activeMachine = machines.find((m) => m.status === 'RUNNING' && m.currentWash);
  const upNextSlot = queue[0];

  return (
    <div className="space-y-4">
      {/* Top Cards: Currently In Wash & Up Next */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Active Wash Card */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Currently In Wash
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Live Machine 1</span>
          </div>

          {activeMachine ? (
            <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-200">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{activeMachine.currentWash.userName}</span>
                    <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                      {activeMachine.currentWash.roomNo}
                    </span>
                    {currentUser && activeMachine.currentWash.phone === currentUser.phone && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                        Your Wash
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {activeMachine.currentWash.itemSummary || '1h 30m Wash'} · {activeMachine.currentWash.cycleName}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                    Slot Window: <strong className="text-blue-800">{activeMachine.currentWash.slotLabel || '1h 30m'}</strong>
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-mono font-bold text-blue-700 block">
                    {formatTimer(activeMachine.currentWash.remainingSeconds || 0)}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Ends {activeMachine.currentWash.endTime || formatLocalTime(Date.now() + (activeMachine.currentWash.remainingSeconds || 0) * 1000)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-7 text-slate-400 text-xs bg-slate-50 rounded-lg">
              Washing machine is currently free and ready for the next slot.
            </div>
          )}
        </div>

        {/* Up Next Reserved Slot */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Up Next In Schedule
              </h3>
            </div>
            {upNextSlot && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Priority #1
              </span>
            )}
          </div>

          {upNextSlot ? (
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{upNextSlot.name}</span>
                    <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                      {upNextSlot.roomNo}
                    </span>
                    {currentUser && upNextSlot.phone === currentUser.phone && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                        Your Slot!
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {upNextSlot.slotDateDisplay || 'Today'} · <strong className="text-slate-900">{upNextSlot.slotLabel}</strong>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {upNextSlot.itemSummary} · Assigned to Washing Machine 1
                  </p>
                </div>

                <button
                  onClick={() => {
                    sound.playNextAlert();
                    onNotifyResident(upNextSlot);
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <Bell className="w-3 h-3 text-blue-600" />
                  <span>Notify</span>
                </button>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <span className="text-amber-800 font-medium">
                  Scan machine QR code upon arrival to start timer.
                </span>
                <span>Queued {formatLocalTime(upNextSlot.joinedAt)}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-7 text-slate-400 text-xs bg-slate-50 rounded-lg">
              No upcoming slots booked.
              <button
                onClick={onOpenBooking}
                className="block mx-auto mt-1 text-xs font-medium text-blue-600 hover:underline"
              >
                Book a 1h 30m slot
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Scheduled Slots Table */}
      <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-600" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
              Scheduled Slot Roster ({queue.length} Resident{queue.length !== 1 ? 's' : ''})
            </h2>
          </div>

          {/* Search & Date Filter */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="relative flex-1 sm:w-48 min-w-[140px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search resident or room..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            {uniqueDates.length > 0 && (
              <select
                value={selectedDateFilter}
                onChange={(e) => setSelectedDateFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500 font-medium shrink-0"
              >
                <option value="all">All Dates</option>
                {uniqueDates.map((dateStr) => (
                  <option key={dateStr} value={dateStr}>
                    {formatSlotDateDisplay(dateStr)}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={onOpenBooking}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1 shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Book Slot</span>
            </button>
          </div>
        </div>

        {/* Slot Roster Rows */}
        {filteredQueue.length > 0 ? (
          <div className="divide-y divide-slate-100 mt-1">
            {filteredQueue.map((item, index) => {
              const isMyBooking = currentUser && (
                (item.phone && currentUser.phone && item.phone.replace(/\D/g, '') === currentUser.phone.replace(/\D/g, '')) ||
                (item.userId && currentUser.id && item.userId === currentUser.id)
              );

              return (
                <div
                  key={item.id}
                  className={`py-3 px-2 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                    isMyBooking 
                      ? 'bg-blue-50/60 border border-blue-200 shadow-2xs' 
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg font-bold font-mono text-xs flex items-center justify-center ${
                      index === 0 
                        ? 'bg-blue-600 text-white shadow-xs' 
                        : isMyBooking
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      #{index + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{item.name}</span>
                        <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                          {item.roomNo}
                        </span>
                        {isMyBooking && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-2xs">
                            Your Booking
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
                        <span className="font-semibold text-blue-700">
                          {item.slotDateDisplay || 'Today'} ({item.slotLabel || item.timeSlot})
                        </span>
                        <span>·</span>
                        <span>{item.itemSummary}</span>
                        <span>·</span>
                        <span>Washing Machine 1</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right text-[11px] text-slate-400 mr-2 hidden md:block font-mono">
                      Booked {formatLocalTime(item.joinedAt)}
                    </div>

                    {/* Notify Reminder Ping */}
                    <button
                      onClick={() => {
                        sound.playNextAlert();
                        onNotifyResident(item);
                      }}
                      title="Send Reminder Ping"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-slate-100 transition-colors"
                    >
                      <Bell className="w-3.5 h-3.5" />
                    </button>

                    {/* Cancel Slot Button: ONLY VISIBLE TO THE BOOKING OWNER */}
                    {isMyBooking ? (
                      <button
                        onClick={() => onCancelQueueItem(item.id)}
                        title="Cancel your booking slot"
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Cancel My Slot</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 px-2 py-1 select-none font-medium">
                        Confirmed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-xs">
            {searchTerm ? 'No matching bookings found.' : 'No slots currently reserved in the roster.'}
          </div>
        )}
      </div>
    </div>
  );
}
