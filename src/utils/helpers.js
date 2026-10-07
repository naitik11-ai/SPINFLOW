import { FIXED_SLOTS, WEEKLY_COOLDOWN_MS, DEFAULT_STUDENT_DIRECTORY } from './constants';

// Format seconds into HH:MM:SS or MM:SS
export function formatTimer(seconds) {
  if (seconds <= 0) return '00:00';
  const totalSecs = Math.floor(seconds);
  const hours = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Format timestamp into clean local time e.g. "07:30 AM"
export function formatLocalTime(timestamp) {
  if (!timestamp) return '--:--';
  const d = new Date(timestamp);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

// Format relative elapsed time (e.g. "5m ago")
export function formatRelativeTime(timestamp) {
  if (!timestamp) return '';
  const diffSec = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

// Normalize phone number to last 10 digits
export function normalizePhone(phone = '') {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits;
}

// Normalize room number e.g. "Room 101", "rm-101", "B-101" -> "101"
export function normalizeRoomNo(roomNo = '') {
  if (!roomNo) return '';
  return String(roomNo)
    .toLowerCase()
    .replace(/^room\s*/i, '')
    .replace(/^rm\s*/i, '')
    .replace(/[^a-z0-9]/gi, '')
    .trim();
}

// Format date to YYYY-MM-DD
export function getSlotDateString(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Format date string for user display e.g. "Today (07 Oct)", "Tomorrow (08 Oct)", "Thu, 09 Oct"
export function formatSlotDateDisplay(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const todayStr = getSlotDateString(new Date());
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = getSlotDateString(tomorrow);

  const monthName = d.toLocaleString('en-US', { month: 'short' });
  const weekday = d.toLocaleString('en-US', { weekday: 'short' });

  if (dateStr === todayStr) {
    return `Today (${day} ${monthName})`;
  }
  if (dateStr === tomorrowStr) {
    return `Tomorrow (${day} ${monthName})`;
  }
  return `${weekday}, ${day} ${monthName}`;
}

// Generate the upcoming 7-day calendar window for booking
export function getUpcoming7Days() {
  const days = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = getSlotDateString(d);
    days.push({
      dateStr,
      dayNumber: d.getDate(),
      monthName: d.toLocaleString('en-US', { month: 'short' }),
      weekday: d.toLocaleString('en-US', { weekday: 'short' }),
      displayLabel: formatSlotDateDisplay(dateStr),
      isToday: i === 0,
      isTomorrow: i === 1,
    });
  }
  return days;
}

// Calculate exact start and end timestamps for a slot on a given date
export function getSlotTimestamps(dateStr, slot) {
  if (!dateStr || !slot) return { startTimestamp: 0, endTimestamp: 0 };
  const [year, month, day] = dateStr.split('-').map(Number);

  const [startH, startM] = slot.startTime.split(':').map(Number);
  const startDate = new Date(year, month - 1, day, startH, startM, 0, 0);

  let endDate;
  if (slot.endTime === '00:00') {
    endDate = new Date(year, month - 1, day + 1, 0, 0, 0, 0);
  } else {
    const [endH, endM] = slot.endTime.split(':').map(Number);
    endDate = new Date(year, month - 1, day, endH, endM, 0, 0);
  }

  return {
    startTimestamp: startDate.getTime(),
    endTimestamp: endDate.getTime(),
  };
}

// Determine the current slot window right now
export function getCurrentActiveSlot() {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const active = FIXED_SLOTS.find(
    (s) => currentMinutes >= s.startMinutes && currentMinutes < s.endMinutes
  );

  return active || null;
}

// Calculate remaining seconds until slot end-time (Late Arrival rule)
export function calculateLateArrivalRemainingSeconds(slotEndTimestamp) {
  const now = Date.now();
  if (!slotEndTimestamp || slotEndTimestamp <= now) return 0;
  return Math.floor((slotEndTimestamp - now) / 1000);
}

// STRICT 3-WAY IDENTITY VERIFICATION: Name + Room Number + Phone Number against Master Directory
export function verifyStudentIdentity(name = '', roomNo = '', phone = '', directory = DEFAULT_STUDENT_DIRECTORY) {
  const cleanPhone = normalizePhone(phone);
  const cleanRoom = normalizeRoomNo(roomNo);
  const cleanName = (name || '').trim().toLowerCase();

  if (!cleanPhone || cleanPhone.length < 10) {
    return {
      isValid: false,
      errorType: 'INVALID_PHONE',
      message: 'Please enter a valid 10-digit mobile number.',
    };
  }

  if (!cleanRoom) {
    return {
      isValid: false,
      errorType: 'MISSING_ROOM',
      message: 'Please enter your hostel room number.',
    };
  }

  if (!cleanName) {
    return {
      isValid: false,
      errorType: 'MISSING_NAME',
      message: 'Please enter your full name.',
    };
  }

  // 1. Check if the phone number exists in directory
  const matchedStudent = directory.find((std) => normalizePhone(std.phone) === cleanPhone);

  if (!matchedStudent) {
    return {
      isValid: false,
      errorType: 'PHONE_NOT_FOUND',
      message: `Mobile number ${phone} is not found in the hostel master directory. Please enter your registered mobile number or contact hostel management.`,
    };
  }

  // 2. Strict Room Number Check: Does entered room match the registered room for this phone?
  const registeredRoomClean = normalizeRoomNo(matchedStudent.roomNo);
  if (cleanRoom !== registeredRoomClean) {
    return {
      isValid: false,
      errorType: 'ROOM_MISMATCH',
      message: `Room mismatch: In the hostel database, ${matchedStudent.name} (${matchedStudent.phone}) is registered to Room ${matchedStudent.roomNo}, but Room ${roomNo} was entered. You can only book for your own registered room.`,
      matchedStudent,
    };
  }

  // 3. Strict Name Check: Does entered name match registered student name?
  const registeredNameClean = matchedStudent.name.toLowerCase();
  const isNameClose = 
    registeredNameClean === cleanName || 
    registeredNameClean.includes(cleanName) || 
    cleanName.includes(registeredNameClean);

  if (!isNameClose) {
    return {
      isValid: false,
      errorType: 'NAME_MISMATCH',
      message: `Name mismatch: Mobile number ${matchedStudent.phone} in Room ${matchedStudent.roomNo} belongs to ${matchedStudent.name}, but "${name}" was entered. Please enter your exact registered name.`,
      matchedStudent,
    };
  }

  // All 3 fields match!
  return {
    isValid: true,
    student: matchedStudent,
  };
}

// Check if a student is under the 7-day weekly cooldown across all 3 identifiers
export function checkWeeklyCooldown(identity, queue = [], history = []) {
  if (!identity) return { isCooldownActive: false };

  const cleanPhone = normalizePhone(identity.phone || '');
  const cleanRoom = normalizeRoomNo(identity.roomNo || '');
  const cleanName = (identity.name || '').trim().toLowerCase();

  if (!cleanPhone && !cleanRoom) return { isCooldownActive: false };

  const now = Date.now();

  // Helper to match a queue or history item to this identity
  const matchesIdentity = (item) => {
    const itemPhone = normalizePhone(item.phone || '');
    const itemRoom = normalizeRoomNo(item.roomNo || '');
    const itemName = (item.name || item.userName || '').trim().toLowerCase();

    // Match if phone matches, or if room number matches exactly
    const phoneMatch = cleanPhone && itemPhone && cleanPhone === itemPhone;
    const roomMatch = cleanRoom && itemRoom && cleanRoom === itemRoom;
    const nameMatch = cleanName && itemName && (cleanName === itemName || cleanName.includes(itemName) || itemName.includes(cleanName));

    return phoneMatch || (roomMatch && nameMatch);
  };

  // 1. Check active/upcoming bookings in queue
  const activeBooking = queue.find((q) => q.status !== 'cancelled' && matchesIdentity(q));

  if (activeBooking) {
    return {
      isCooldownActive: true,
      reason: 'ACTIVE_BOOKING',
      message: `Weekly 1-slot quota reached: ${identity.name || 'Resident'} (Room ${identity.roomNo || activeBooking.roomNo}) already has an active slot booked for ${activeBooking.slotDateDisplay || activeBooking.slotDate || 'this week'} (${activeBooking.slotLabel || '1h 30m'}). Each student gets 1 slot per 7 days.`,
      booking: activeBooking,
    };
  }

  // 2. Check completed wash slots in history within 7 days
  const recentHistory = history
    .filter((h) => matchesIdentity(h) && (now - (h.completedAt || 0) < WEEKLY_COOLDOWN_MS))
    .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

  if (recentHistory.length > 0) {
    const lastWash = recentHistory[0];
    const expiryTimestamp = (lastWash.completedAt || now) + WEEKLY_COOLDOWN_MS;
    const daysRemaining = Math.max(1, Math.ceil((expiryTimestamp - now) / (24 * 60 * 60 * 1000)));
    const expiryDate = new Date(expiryTimestamp).toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    return {
      isCooldownActive: true,
      reason: 'COOLDOWN_ACTIVE',
      message: `Weekly 1-slot quota reached: Last wash for ${identity.name || lastWash.name} (Room ${identity.roomNo || lastWash.roomNo}) was on ${new Date(lastWash.completedAt).toLocaleDateString()}. Next slot opens in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''} on ${expiryDate}.`,
      lastWash,
      expiryTimestamp,
      expiryDate,
      daysRemaining,
    };
  }

  return { isCooldownActive: false };
}

// Calculate wait time / earliest available slot
export function calculateEstimatedWait(machines = [], queue = []) {
  const running = machines.find((m) => m.status === 'RUNNING');
  if (running && running.currentWash) {
    return Math.ceil((running.currentWash.remainingSeconds || 0) / 60);
  }
  return 0;
}

// Send browser notification
export async function sendBrowserNotification(title, options = {}) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, options);
    } catch (e) {
      console.warn('Notification error:', e);
    }
  } else if (Notification.permission !== 'denied') {
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      new Notification(title, options);
    }
  }
}
