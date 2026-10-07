import React, { useState, useMemo } from 'react';
import { 
  X, 
  Users, 
  Clock, 
  Search, 
  Download, 
  RotateCcw, 
  ShieldCheck, 
  ShieldAlert, 
  BarChart3, 
  Building2, 
  Layers, 
  Phone, 
  Calendar,
  ChevronRight,
  Filter,
  Trash2,
  Play,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { 
  normalizePhone, 
  normalizeRoomNo, 
  formatTimer, 
  formatLocalTime, 
  formatSlotDateDisplay 
} from '../utils/helpers';
import { WEEKLY_COOLDOWN_MS } from '../utils/constants';
import { sound } from '../utils/audio';

export default function AdminDashboardModal({
  isOpen,
  onClose,
  machines = [],
  queue = [],
  history = [],
  directory = [],
  onResetStudentQuota,
  onCancelQueueItem,
  onToggleMaintenance
}) {
  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'roster' | 'analytics'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('all');
  const [filterQuota, setFilterQuota] = useState('all'); // 'all' | 'locked' | 'eligible' | 'active'
  const [sortBy, setSortBy] = useState('usage_desc'); // 'usage_desc' | 'room_asc' | 'recent'
  const [selectedStudentHistory, setSelectedStudentHistory] = useState(null);

  if (!isOpen) return null;

  const now = Date.now();

  // Aggregate per-student usage statistics
  const studentUsageStats = useMemo(() => {
    return directory.map((student) => {
      const cleanPhone = normalizePhone(student.phone);
      const cleanRoom = normalizeRoomNo(student.roomNo);
      const cleanName = student.name.toLowerCase();

      const matchesStudent = (item) => {
        const itemPhone = normalizePhone(item.phone || '');
        const itemRoom = normalizeRoomNo(item.roomNo || '');
        const itemName = (item.name || item.userName || '').toLowerCase();

        return (
          (cleanPhone && itemPhone && cleanPhone === itemPhone) ||
          (cleanRoom && itemRoom && cleanRoom === itemRoom && (cleanName === itemName || cleanName.includes(itemName) || itemName.includes(cleanName)))
        );
      };

      // Find in history
      const studentHistory = history.filter(matchesStudent).sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

      // Find in queue
      const studentQueue = queue.filter(matchesStudent);

      // Check if currently washing
      const isCurrentlyWashing = machines.some(
        (m) => m.status === 'RUNNING' && m.currentWash && matchesStudent(m.currentWash)
      );

      const activeWashSession = machines.find(
        (m) => m.status === 'RUNNING' && m.currentWash && matchesStudent(m.currentWash)
      )?.currentWash;

      // Total usage calculations (90 mins per completed slot + active slot)
      const completedSlotsCount = studentHistory.length;
      const totalMinutesUsed = (completedSlotsCount + (isCurrentlyWashing ? 1 : 0)) * 90;
      const totalHoursFormatted = (totalMinutesUsed / 60).toFixed(1);

      // Weekly quota check
      const lastWash = studentHistory[0];
      const isHistoryCooldown = lastWash && (now - (lastWash.completedAt || 0) < WEEKLY_COOLDOWN_MS);
      const hasUpcomingBooking = studentQueue.length > 0;
      const isQuotaLocked = isCurrentlyWashing || isHistoryCooldown || hasUpcomingBooking;

      let quotaUnlockTimestamp = null;
      let quotaUnlockDays = 0;
      if (lastWash && isHistoryCooldown) {
        quotaUnlockTimestamp = (lastWash.completedAt || now) + WEEKLY_COOLDOWN_MS;
        quotaUnlockDays = Math.max(1, Math.ceil((quotaUnlockTimestamp - now) / (24 * 60 * 60 * 1000)));
      }

      return {
        ...student,
        completedSlotsCount,
        totalMinutesUsed,
        totalHoursFormatted,
        isCurrentlyWashing,
        activeWashSession,
        hasUpcomingBooking,
        upcomingBooking: studentQueue[0],
        studentHistory,
        lastWash,
        isQuotaLocked,
        quotaUnlockTimestamp,
        quotaUnlockDays,
      };
    });
  }, [directory, history, queue, machines, now]);

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    return studentUsageStats
      .filter((s) => {
        const matchesSearch =
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.roomNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.phone.includes(searchTerm);

        const matchesFloor =
          selectedFloor === 'all' ||
          s.floor === selectedFloor ||
          (selectedFloor === '1st Floor' && Number(s.roomNo) >= 100 && Number(s.roomNo) < 200) ||
          (selectedFloor === '2nd Floor' && Number(s.roomNo) >= 200 && Number(s.roomNo) < 300) ||
          (selectedFloor === '3rd Floor' && Number(s.roomNo) >= 300 && Number(s.roomNo) < 400);

        let matchesQuota = true;
        if (filterQuota === 'locked') matchesQuota = s.isQuotaLocked;
        else if (filterQuota === 'eligible') matchesQuota = !s.isQuotaLocked;
        else if (filterQuota === 'active') matchesQuota = s.isCurrentlyWashing;

        return matchesSearch && matchesFloor && matchesQuota;
      })
      .sort((a, b) => {
        if (sortBy === 'usage_desc') return b.totalMinutesUsed - a.totalMinutesUsed;
        if (sortBy === 'room_asc') return Number(a.roomNo) - Number(b.roomNo);
        if (sortBy === 'recent') {
          const aTime = a.lastWash?.completedAt || 0;
          const bTime = b.lastWash?.completedAt || 0;
          return bTime - aTime;
        }
        return 0;
      });
  }, [studentUsageStats, searchTerm, selectedFloor, filterQuota, sortBy]);

  // Overall Statistics
  const totalWashesCompleted = history.length;
  const totalRuntimeMinutes = totalWashesCompleted * 90;
  const totalRuntimeHours = (totalRuntimeMinutes / 60).toFixed(1);
  const totalLockedQuotas = studentUsageStats.filter((s) => s.isQuotaLocked).length;
  const totalEligibleQuotas = studentUsageStats.length - totalLockedQuotas;

  // Export full CSV report
  const handleExportCSV = () => {
    const header = 'Name,Room Number,Phone Number,Floor,Total Minutes Used,Total Hours Used,Completed Slots,Weekly Quota Status,Last Wash Date\n';
    const rows = studentUsageStats.map((s) => {
      const quotaStatus = s.isCurrentlyWashing ? 'Currently Washing' : s.isQuotaLocked ? 'Quota Locked (Used this week)' : 'Eligible';
      const lastDate = s.lastWash?.completedAt ? new Date(s.lastWash.completedAt).toLocaleDateString() : 'Never';
      return `"${s.name}","${s.roomNo}","${s.phone}","${s.floor || ''}","${s.totalMinutesUsed}","${s.totalHoursFormatted}h","${s.completedSlotsCount}","${quotaStatus}","${lastDate}"`;
    }).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `hostel_student_usage_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Hostel Laundry Admin Dashboard
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                  105 Students · 1 Machine
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Monitor student usage durations, weekly quota compliance, and live washer operations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick KPI Overview Cards */}
        <div className="p-4 sm:px-6 bg-white border-b border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-xl">
            <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
              Total Machine Runtime
            </span>
            <span className="font-mono text-xl sm:text-2xl font-bold text-blue-950 block mt-0.5">
              {totalRuntimeHours} hrs
            </span>
            <span className="text-[10px] text-blue-700">
              {totalWashesCompleted} wash sessions
            </span>
          </div>

          <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              Eligible for Booking
            </span>
            <span className="font-mono text-xl sm:text-2xl font-bold text-emerald-950 block mt-0.5">
              {totalEligibleQuotas} Students
            </span>
            <span className="text-[10px] text-emerald-700">
              Quota available this week
            </span>
          </div>

          <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
              Quota Locked
            </span>
            <span className="font-mono text-xl sm:text-2xl font-bold text-amber-950 block mt-0.5">
              {totalLockedQuotas} Students
            </span>
            <span className="text-[10px] text-amber-700">
              Used 1-slot weekly limit
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Machine Status
              </span>
              <span className="text-xs font-bold text-slate-900 block mt-0.5">
                {machines[0]?.status === 'RUNNING' ? 'In Use (Washing)' : 'Available / Idle'}
              </span>
            </div>
            <button
              onClick={handleExportCSV}
              className="mt-1 py-1 px-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-2xs transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 sm:px-6 pt-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('students')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'students'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Student Usage & Time Spent ({directory.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('roster')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'roster'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Active Machine & Scheduled Slots ({queue.length})</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Student Usage & Time Spent Table */}
        {activeTab === 'students' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Filter Bar */}
            <div className="p-3 sm:px-6 bg-white border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search resident, room (e.g. 101), or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <select
                  value={selectedFloor}
                  onChange={(e) => setSelectedFloor(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Floors</option>
                  <option value="1st Floor">1st Floor (101-135)</option>
                  <option value="2nd Floor">2nd Floor (201-235)</option>
                  <option value="3rd Floor">3rd Floor (301-335)</option>
                </select>

                <select
                  value={filterQuota}
                  onChange={(e) => setFilterQuota(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Quotas</option>
                  <option value="locked">Quota Locked (Used)</option>
                  <option value="eligible">Eligible (Ready)</option>
                  <option value="active">Currently Washing</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500"
                >
                  <option value="usage_desc">Highest Usage Time</option>
                  <option value="room_asc">Room Number (Asc)</option>
                  <option value="recent">Most Recent Wash</option>
                </select>
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-y-auto flex-1 p-3 sm:px-6 divide-y divide-slate-100">
              {filteredStudents.length > 0 ? (
                <div className="space-y-2">
                  {filteredStudents.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-slate-50/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white"
                    >
                      {/* Student Info */}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 font-mono font-bold text-xs flex items-center justify-center text-slate-700 shrink-0">
                          {s.roomNo}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-slate-900">
                              {s.name}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                              Room {s.roomNo}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400 hidden md:inline">
                              {s.phone}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                            <span>
                              Total Time Used: <strong className="text-blue-700 font-mono">{s.totalHoursFormatted} hrs</strong> ({s.totalMinutesUsed} mins)
                            </span>
                            <span>·</span>
                            <span>
                              {s.completedSlotsCount} Slot{s.completedSlotsCount !== 1 ? 's' : ''} Completed
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quota Badge & Controls */}
                      <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        {s.isCurrentlyWashing ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                            In Wash Now
                          </span>
                        ) : s.isQuotaLocked ? (
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                              <ShieldAlert className="w-3 h-3 text-amber-600" />
                              Quota Locked
                            </span>
                            {s.quotaUnlockDays > 0 && (
                              <span className="text-[10px] text-slate-500 block mt-0.5">
                                Unlocks in {s.quotaUnlockDays}d
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Eligible
                          </span>
                        )}

                        {/* View History Drawer */}
                        <button
                          onClick={() => {
                            sound.playClick();
                            setSelectedStudentHistory(s);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1"
                        >
                          <span>Log</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>

                        {/* Admin Override / Reset Quota Button */}
                        {s.isQuotaLocked && onResetStudentQuota && (
                          <button
                            onClick={() => {
                              sound.playClick();
                              onResetStudentQuota(s);
                            }}
                            title="Admin Reset Weekly Quota for this student"
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-colors flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3 text-amber-700" />
                            <span>Reset Quota</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No students found matching your filters.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Active Machine & Scheduled Slots Roster */}
        {activeTab === 'roster' && (
          <div className="p-4 sm:px-6 overflow-y-auto flex-1 space-y-4">
            {/* Active Machine Session */}
            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200">
              <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">
                Active Washing Machine 1 Session
              </h3>
              {machines[0]?.status === 'RUNNING' && machines[0].currentWash ? (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{machines[0].currentWash.userName}</span>
                      <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-white text-slate-700 border">
                        {machines[0].currentWash.roomNo}
                      </span>
                      <span className="font-mono text-xs text-slate-500">
                        {machines[0].currentWash.phone}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Slot: <strong>{machines[0].currentWash.slotLabel}</strong> · {machines[0].currentWash.itemSummary}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-lg text-blue-700 block">
                      {formatTimer(machines[0].currentWash.remainingSeconds || 0)} left
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Ends at {machines[0].currentWash.endTime}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Washing Machine 1 is currently idle and available for the next slot.
                </p>
              )}
            </div>

            {/* Upcoming Queue Roster */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Upcoming Scheduled Bookings ({queue.length})
              </h3>
              {queue.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {queue.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3 bg-white flex items-center justify-between hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-xs text-slate-500">
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-xs text-slate-900">{item.name}</strong>
                            <span className="font-mono text-[11px] text-slate-700 px-1.5 py-0.2 rounded bg-slate-100 border">
                              {item.roomNo}
                            </span>
                            <span className="font-mono text-[11px] text-slate-400">
                              {item.phone}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {item.slotDateDisplay || 'Today'} · <strong className="text-blue-800">{item.slotLabel}</strong> ({item.durationMinutes}m)
                          </p>
                        </div>
                      </div>

                      {/* Admin Cancel Button */}
                      <button
                        onClick={() => {
                          sound.playClick();
                          onCancelQueueItem(item.id);
                        }}
                        title="Admin cancel invalid slot"
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Cancel Booking</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
                  No upcoming bookings currently scheduled in the queue.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Selected Student Detail History Drawer */}
        {selectedStudentHistory && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {selectedStudentHistory.name} · Wash History & Time Logs
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Room {selectedStudentHistory.roomNo} · {selectedStudentHistory.phone}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedStudentHistory(null)}
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Total Time Used</span>
                    <span className="font-mono text-base font-bold text-blue-900">
                      {selectedStudentHistory.totalHoursFormatted} hrs ({selectedStudentHistory.totalMinutesUsed}m)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Quota Status</span>
                    <span className={`font-bold ${selectedStudentHistory.isQuotaLocked ? 'text-amber-800' : 'text-emerald-700'}`}>
                      {selectedStudentHistory.isQuotaLocked ? 'Locked (1-Slot Quota Used)' : 'Eligible'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-800 block">
                    Completed Wash Sessions ({selectedStudentHistory.studentHistory.length}):
                  </span>

                  {selectedStudentHistory.studentHistory.length > 0 ? (
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl">
                      {selectedStudentHistory.studentHistory.map((h, i) => (
                        <div key={h.id || i} className="p-3 text-xs flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {h.cycleName || '1h 30m Standard Wash'}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {h.machineName || 'Washing Machine 1'} · {h.clothesCount || 10} clothes
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-slate-700 block">
                              90 mins
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {h.completedAt ? new Date(h.completedAt).toLocaleDateString() : 'Recent'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 py-4 text-center bg-slate-50 rounded-xl">
                      No past wash history recorded yet.
                    </p>
                  )}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedStudentHistory(null)}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-500">
            Hostel Administrator Security Console · <strong>105 Verified Students</strong>
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors"
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
