import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Layers, 
  Check, 
  Clock, 
  ShieldAlert, 
  ShieldCheck, 
  Calendar,
  AlertCircle,
  Sparkles,
  Info,
  User,
  Home,
  Phone
} from 'lucide-react';
import { FIXED_SLOTS, SLOT_CONFIG, TOTAL_HOSTEL_STUDENTS, DEFAULT_STUDENT_DIRECTORY } from '../utils/constants';
import { 
  getUpcoming7Days, 
  getSlotDateString, 
  formatSlotDateDisplay, 
  getSlotTimestamps,
  checkWeeklyCooldown,
  verifyStudentIdentity
} from '../utils/helpers';
import { sound } from '../utils/audio';

const BEDSHEET_PRESETS = [
  { id: '1-single', label: '1 Single Bedsheet', items: 1 },
  { id: '1-double', label: '1 Double Bedsheet', items: 1 },
  { id: '2-bedsheets', label: '2 Bedsheets', items: 2 },
  { id: 'bedsheet-blanket', label: 'Bedsheet + Blanket', items: 2 },
  { id: 'thick-blanket', label: 'Heavy Blanket / Quilt', items: 1 },
  { id: 'towels-linens', label: 'Towels & Linens', items: 6 },
];

export default function RegistrationModal({
  isOpen,
  onClose,
  onSubmit,
  machines = [],
  queue = [],
  history = [],
  studentDirectory = DEFAULT_STUDENT_DIRECTORY,
  preselectedMachineId = 'machine-1',
  currentUser = null
}) {
  const upcomingDays = useMemo(() => getUpcoming7Days(), []);
  const todayStr = upcomingDays[0]?.dateStr || getSlotDateString(new Date());

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedSlotId, setSelectedSlotId] = useState('slot-1');
  const [formData, setFormData] = useState({
    name: '',
    roomNumber: '',
    phone: '',
    laundryType: 'clothes', // 'clothes' | 'bedsheet'
    clothesCount: 10,
    bedsheetPreset: '1-double',
    assignedMachineId: 'machine-1',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  // Populate user data upon opening
  useEffect(() => {
    if (isOpen) {
      if (currentUser) {
        setFormData((prev) => ({
          ...prev,
          name: currentUser.name || '',
          roomNumber: currentUser.roomNo ? currentUser.roomNo.replace(/[^0-9a-zA-Z]/g, '') : '',
          phone: currentUser.phone || '',
          assignedMachineId: preselectedMachineId || 'machine-1',
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          assignedMachineId: preselectedMachineId || 'machine-1',
        }));
      }

      setSelectedDate(todayStr);
      const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
      const firstFutureSlot = FIXED_SLOTS.find((s) => s.endMinutes > nowMinutes) || FIXED_SLOTS[0];
      setSelectedSlotId(firstFutureSlot.id);
      setErrors({});
    }
  }, [isOpen, currentUser, preselectedMachineId, todayStr]);

  // Current active identity
  const currentIdentity = useMemo(() => {
    if (currentUser) {
      return {
        name: currentUser.name,
        roomNo: currentUser.roomNo,
        phone: currentUser.phone,
      };
    }
    return {
      name: formData.name,
      roomNo: formData.roomNumber,
      phone: formData.phone,
    };
  }, [currentUser, formData.name, formData.roomNumber, formData.phone]);

  // Check weekly cooldown for the active student identity
  const cooldownStatus = useMemo(() => {
    return checkWeeklyCooldown(currentIdentity, queue, history);
  }, [currentIdentity, queue, history]);

  if (!isOpen) return null;

  const handleClothesChange = (count) => {
    const num = Math.max(1, Math.min(50, Number(count) || 1));
    setFormData((prev) => ({ ...prev, clothesCount: num }));
  };

  const selectedSlot = FIXED_SLOTS.find((s) => s.id === selectedSlotId) || FIXED_SLOTS[0];
  const { startTimestamp, endTimestamp } = getSlotTimestamps(selectedDate, selectedSlot);

  // Determine slot status for each slot on the chosen date
  const getSlotAvailability = (slot) => {
    const now = Date.now();
    const timestamps = getSlotTimestamps(selectedDate, slot);

    // 1. Is this slot already passed in time today?
    if (selectedDate === todayStr && timestamps.endTimestamp <= now) {
      return { status: 'PASSED', label: 'Passed', bookedBy: null };
    }

    // 2. Is this slot currently running on the machine?
    const isRunningNow = machines.some((m) => {
      if (m.status === 'RUNNING' && m.currentWash) {
        return selectedDate === todayStr && (m.currentWash.slotId === slot.id || (now >= timestamps.startTimestamp && now < timestamps.endTimestamp));
      }
      return false;
    });

    if (isRunningNow && selectedDate === todayStr) {
      const activeMachine = machines.find((m) => m.status === 'RUNNING');
      return {
        status: 'IN_USE',
        label: 'Active Wash',
        bookedBy: activeMachine?.currentWash?.roomNo || 'In Use',
        phone: activeMachine?.currentWash?.phone,
      };
    }

    // 3. Is this slot booked in the queue for this date?
    const bookedInQueue = queue.find((q) => {
      if (q.status === 'cancelled') return false;
      const isSameDate = q.slotDate === selectedDate || (!q.slotDate && selectedDate === todayStr);
      const isSameSlot = q.slotId === slot.id || (q.scheduledTime && q.scheduledTime.includes(slot.startTime));
      return isSameDate && isSameSlot;
    });

    if (bookedInQueue) {
      return {
        status: 'BOOKED',
        label: `Booked (${bookedInQueue.roomNo})`,
        bookedBy: bookedInQueue.roomNo,
        phone: bookedInQueue.phone,
      };
    }

    // 4. Slot is free
    return { status: 'AVAILABLE', label: 'Available', bookedBy: null };
  };

  const validate = () => {
    const errs = {};

    // 1. If not logged in, enforce 3-Way Identity Verification
    if (!currentUser) {
      if (!formData.name.trim()) errs.name = 'Please enter your name';
      if (!formData.roomNumber.trim()) errs.roomNumber = 'Please enter room number';
      if (!formData.phone.trim()) errs.phone = 'Please enter 10-digit mobile number';

      if (!errs.name && !errs.roomNumber && !errs.phone) {
        const verification = verifyStudentIdentity(
          formData.name,
          formData.roomNumber,
          formData.phone,
          studentDirectory
        );

        if (!verification.isValid) {
          errs.identity = verification.message;
          if (verification.errorType === 'ROOM_MISMATCH') errs.roomNumber = verification.message;
          else if (verification.errorType === 'NAME_MISMATCH') errs.name = verification.message;
          else errs.phone = verification.message;
        }
      }
    }

    // 2. Check Weekly 1-Slot Quota (Cooldown)
    if (cooldownStatus.isCooldownActive) {
      errs.cooldown = cooldownStatus.message;
    }

    // 3. Check if chosen slot is actually available
    const chosenAvailability = getSlotAvailability(selectedSlot);
    if (chosenAvailability.status !== 'AVAILABLE') {
      errs.slot = 'The selected time slot is already booked or has passed.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    sound.playStart();

    const selectedPresetObj = BEDSHEET_PRESETS.find((p) => p.id === formData.bedsheetPreset);
    const itemSummary = formData.laundryType === 'bedsheet'
      ? (selectedPresetObj?.label || 'Bedsheet & Linens')
      : `${formData.clothesCount} clothes`;

    const cycleName = formData.laundryType === 'bedsheet' 
      ? 'Bedding Wash (1h 30m Slot)' 
      : 'Standard Wash (1h 30m Slot)';

    const finalName = currentUser ? currentUser.name : formData.name.trim();
    const rawRoom = currentUser ? currentUser.roomNo : formData.roomNumber.trim();
    const cleanRoomNo = rawRoom.toLowerCase().startsWith('room') ? rawRoom : `Room ${rawRoom.replace(/[^0-9a-zA-Z]/g, '')}`;
    const finalPhone = currentUser ? currentUser.phone : formData.phone.trim();

    const newBooking = {
      id: `q-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 5)}`,
      name: finalName,
      roomNo: cleanRoomNo,
      phone: finalPhone,
      laundryType: formData.laundryType,
      clothesCount: formData.laundryType === 'clothes' ? formData.clothesCount : (selectedPresetObj?.items || 2),
      itemSummary,
      cycleName,
      durationMinutes: SLOT_CONFIG.totalDurationMinutes, // 90 mins
      washDurationMinutes: SLOT_CONFIG.washDurationMinutes, // 65 mins
      restDurationMinutes: SLOT_CONFIG.restDurationMinutes, // 25 mins
      assignedMachineId: formData.assignedMachineId || 'machine-1',
      
      // Generalized Fixed Slot Data
      slotDate: selectedDate,
      slotDateDisplay: formatSlotDateDisplay(selectedDate),
      slotId: selectedSlot.id,
      slotLabel: selectedSlot.label,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      startTimestamp,
      endTimestamp,
      timeSlot: `${formatSlotDateDisplay(selectedDate)} · ${selectedSlot.label}`,
      timeSlotType: 'scheduled_fixed',
      
      joinedAt: Date.now(),
      notes: formData.notes.trim(),
      status: 'waiting',
    };

    onSubmit(newBooking);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[88vh] flex flex-col my-0 sm:my-auto animate-in fade-in slide-in-from-bottom-4 duration-150">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Book Laundry Slot</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                1 Slot / Week Quota
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Strict 3-Way Identity Verification (Name + Room + Phone) · QR Machine Activation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
            
            {/* Weekly Cooldown Alert Banner */}
            {cooldownStatus.isCooldownActive && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Weekly 1-Slot Quota Locked</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  {cooldownStatus.message}
                </p>
              </div>
            )}

            {/* Identity Mismatch Alert Banner */}
            {errors.identity && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Hostel Directory Verification Failed</span>
                </div>
                <p className="text-[11px] text-rose-800 leading-relaxed">
                  {errors.identity}
                </p>
              </div>
            )}

            {/* Section 1: Resident Details */}
            <div>
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
                1. Resident Identity (3-Way Verified)
              </label>

              {currentUser ? (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                      {currentUser.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-900">{currentUser.name}</span>
                        <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                          {currentUser.roomNo}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {currentUser.phone} · Verified Resident
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                    Verified
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                    <div>
                      <label className="text-xs text-slate-600 mb-1 block font-medium">Full Name (Registered) *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Harsh"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                      />
                      {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="text-xs text-slate-600 mb-1 block font-medium">Room No (e.g. 101) *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 101"
                        value={formData.roomNumber}
                        onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                      />
                      {errors.roomNumber && <p className="text-[11px] text-rose-600 mt-1">{errors.roomNumber}</p>}
                    </div>

                    <div>
                      <label className="text-xs text-slate-600 mb-1 block font-medium">Mobile (10 digits) *</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 9876543210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 font-mono"
                      />
                      {errors.phone && <p className="text-[11px] text-rose-600 mt-1">{errors.phone}</p>}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Hostel security check: Phone number must belong to your registered room and name in the master directory.
                  </p>
                </div>
              )}
            </div>

            {/* Section 2: 7-Day Date Picker */}
            <div className="pt-3 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>2. Choose Booking Date (7-Day Schedule)</span>
                </span>
                <span className="text-[11px] font-normal text-slate-500">
                  {TOTAL_HOSTEL_STUDENTS} students / 1 machine
                </span>
              </label>

              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                {upcomingDays.map((day) => {
                  const isSelected = selectedDate === day.dateStr;
                  return (
                    <button
                      key={day.dateStr}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setSelectedDate(day.dateStr);
                      }}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-[10px] font-medium block uppercase tracking-wider opacity-80">
                        {day.weekday}
                      </span>
                      <span className="text-sm sm:text-base font-bold block mt-0.5">
                        {day.dayNumber}
                      </span>
                      <span className="text-[9px] block opacity-75 truncate">
                        {day.isToday ? 'Today' : day.isTomorrow ? 'Tmrw' : day.monthName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 3: 12 Fixed Time Slots (6:00 AM to 12:00 AM) */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>3. Select Fixed 1h 30m Time Slot ({formatSlotDateDisplay(selectedDate)})</span>
                </label>
                <span className="text-[10px] font-mono font-medium text-slate-500">
                  12 Slots Daily
                </span>
              </div>

              {/* 12 Slots Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {FIXED_SLOTS.map((slot) => {
                  const availability = getSlotAvailability(slot);
                  const isSelected = selectedSlotId === slot.id;
                  const isAvailable = availability.status === 'AVAILABLE';

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => {
                        sound.playClick();
                        setSelectedSlotId(slot.id);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all relative ${
                        isSelected && isAvailable
                          ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-600/30 shadow-xs'
                          : isAvailable
                          ? 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                          : 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 font-mono">
                          Slot {slot.index}
                        </span>
                        {isAvailable ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            Free
                          </span>
                        ) : availability.status === 'PASSED' ? (
                          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">
                            Passed
                          </span>
                        ) : (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 truncate max-w-[70px]">
                            {availability.bookedBy || 'Booked'}
                          </span>
                        )}
                      </div>

                      <div className="mt-1 font-mono font-bold text-xs text-slate-900">
                        {slot.label}
                      </div>

                      <div className="text-[10px] text-slate-500 mt-0.5 flex items-center justify-between">
                        <span>{slot.period}</span>
                        <span className="font-mono">90 mins</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              {errors.slot && <p className="text-[11px] text-rose-600 mt-1.5">{errors.slot}</p>}
            </div>

            {/* Section 4: What are you washing? */}
            <div className="pt-3 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
                4. Laundry Items
              </label>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, laundryType: 'clothes' })}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    formData.laundryType === 'clothes'
                      ? 'bg-blue-50/70 border-blue-600 ring-1 ring-blue-600/30'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Regular Clothes</span>
                    <span className="text-[10px] text-slate-500">Shirts, pants, gym wear</span>
                  </div>
                  {formData.laundryType === 'clothes' && (
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs shrink-0">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, laundryType: 'bedsheet' })}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    formData.laundryType === 'bedsheet'
                      ? 'bg-blue-50/70 border-blue-600 ring-1 ring-blue-600/30'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Bedsheet & Linens</span>
                    <span className="text-[10px] text-slate-500">Bedsheets, blankets, towels</span>
                  </div>
                  {formData.laundryType === 'bedsheet' && (
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs shrink-0">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </button>
              </div>

              {formData.laundryType === 'clothes' ? (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Number of Clothes ({formData.clothesCount} items)
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Est. {(formData.clothesCount * 0.35).toFixed(1)} kg
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2">
                    {[5, 10, 15, 20, 25, 30].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => handleClothesChange(count)}
                        className={`py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          formData.clothesCount === count
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {count} pcs
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                  <span className="text-xs font-bold text-slate-800 block">
                    Select Bedsheet / Linens Type:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
                    {BEDSHEET_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, bedsheetPreset: preset.id })}
                        className={`py-2 px-2.5 rounded-lg text-xs font-medium border text-left transition-colors ${
                          formData.bedsheetPreset === preset.id
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span className="font-bold block truncate">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Booking Summary Box */}
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-blue-900 block">
                  Selected Slot: {formatSlotDateDisplay(selectedDate)} · {selectedSlot.label}
                </span>
                <p className="text-[11px] text-blue-800 mt-0.5">
                  Assigned Unit: <strong>Washing Machine 1</strong> · QR code scan required at machine.
                </p>
              </div>
              <div className="sm:text-right shrink-0">
                <span className="text-[10px] text-blue-700 uppercase tracking-wider block font-semibold">
                  Slot Duration
                </span>
                <span className="font-mono font-bold text-sm text-blue-900">
                  1h 30m Total
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-100 flex gap-2.5 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={cooldownStatus.isCooldownActive}
              className={`flex-2 py-2.5 rounded-xl text-xs font-bold text-white transition-colors flex items-center justify-center gap-1.5 shadow-sm ${
                cooldownStatus.isCooldownActive
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Confirm 1h 30m Slot Booking</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
