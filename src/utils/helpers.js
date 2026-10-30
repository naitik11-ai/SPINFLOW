import { FIXED_SLOTS, WEEKLY_COOLDOWN_MS, MAX_WEEKLY_SLOTS_PER_STUDENT, DEFAULT_STUDENT_DIRECTORY } from './constants.js';

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

// Helper to extract words from a name string
export function extractNameWords(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

// Compute Levenshtein distance between two strings
export function levenshteinDistance(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const row = [];
  for (let i = 0; i <= b.length; i++) row[i] = i;
  for (let i = 1; i <= a.length; i++) {
    let prev = i;
    for (let j = 1; j <= b.length; j++) {
      let val;
      if (a[i - 1] === b[j - 1]) {
        val = row[j - 1];
      } else {
        val = Math.min(row[j - 1] + 1, prev + 1, row[j] + 1);
      }
      row[j - 1] = prev;
      prev = val;
    }
    row[b.length] = prev;
  }
  return row[b.length];
}

// Check if two individual words match (exact or 1-character typo tolerance for words >= 4 chars)
export function nameWordsMatch(w1, w2) {
  if (w1 === w2) return true;
  if (w1.length >= 4 && w2.length >= 4) {
    if (Math.abs(w1.length - w2.length) <= 1 && levenshteinDistance(w1, w2) <= 1) {
      return true;
    }
  }
  return false;
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
  // If multiple residents share a phone number, prioritize matching both phone and room first
  let matchedStudent = directory.find(
    (std) => normalizePhone(std.phone) === cleanPhone && normalizeRoomNo(std.roomNo) === cleanRoom
  );

  if (!matchedStudent) {
    matchedStudent = directory.find((std) => normalizePhone(std.phone) === cleanPhone);
  }

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

  // 3. Name Check: Minimum 2 words required (e.g. First Name + Surname in any order)
  const enteredWords = extractNameWords(name);
  if (enteredWords.length < 2) {
    return {
      isValid: false,
      errorType: 'INCOMPLETE_NAME',
      message: 'Please enter your full name with at least your First Name and Surname (minimum 2 words, e.g. Naitik Ramani).',
      matchedStudent,
    };
  }

  const registeredWords = extractNameWords(matchedStudent.name);
  const matchedRegIndices = new Set();
  let matchedCount = 0;

  for (const eWord of enteredWords) {
    let foundIndex = -1;
    for (let i = 0; i < registeredWords.length; i++) {
      if (!matchedRegIndices.has(i) && nameWordsMatch(eWord, registeredWords[i])) {
        foundIndex = i;
        break;
      }
    }
    if (foundIndex !== -1) {
      matchedRegIndices.add(foundIndex);
      matchedCount++;
    }
  }

  if (matchedCount < 2) {
    return {
      isValid: false,
      errorType: 'NAME_MISMATCH',
      message: `Name mismatch: At least 2 words (e.g. First Name & Surname) must match your registered record (${matchedStudent.name}). Only ${matchedCount} word matched.`,
      matchedStudent,
    };
  }

  // All 3 fields match!
  return {
    isValid: true,
    student: matchedStudent,
  };
}

// Check if a student has exceeded their maximum allowed slots per 7-day period (Max 3 slots per week)
export function checkWeeklyCooldown(identity, queue = [], history = []) {
  const maxSlots = MAX_WEEKLY_SLOTS_PER_STUDENT || 3;

  if (!identity) {
    return {
      isCooldownActive: false,
      usedCount: 0,
      maxSlots,
      remainingSlots: maxSlots,
      message: '',
    };
  }

  const cleanPhone = normalizePhone(identity.phone || '');
  const cleanRoom = normalizeRoomNo(identity.roomNo || '');
  const cleanName = (identity.name || '').trim().toLowerCase();

  if (!cleanPhone && !cleanRoom) {
    return {
      isCooldownActive: false,
      usedCount: 0,
      maxSlots,
      remainingSlots: maxSlots,
      message: '',
    };
  }

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

    if (phoneMatch) {
      if (!cleanRoom && !cleanName) return true;
      return roomMatch || nameMatch;
    }
    return roomMatch && nameMatch;
  };

  // 1. Check active/upcoming bookings in queue
  const activeBookings = queue.filter((q) => q.status !== 'cancelled' && matchesIdentity(q));

  // 2. Check completed wash slots in history within 7 days
  const recentHistory = history
    .filter((h) => matchesIdentity(h) && (now - (h.completedAt || 0) < WEEKLY_COOLDOWN_MS))
    .sort((a, b) => (a.completedAt || 0) - (b.completedAt || 0)); // Oldest first to identify earliest unlocking wash

  const totalUsed = activeBookings.length + recentHistory.length;
  const remainingSlots = Math.max(0, maxSlots - totalUsed);

  if (totalUsed >= maxSlots) {
    let unlockDateStr = 'soon';
    let daysRemaining = 7;
    let expiryTimestamp = now + WEEKLY_COOLDOWN_MS;

    if (recentHistory.length > 0) {
      const oldestWash = recentHistory[0];
      expiryTimestamp = (oldestWash.completedAt || now) + WEEKLY_COOLDOWN_MS;
      daysRemaining = Math.max(1, Math.ceil((expiryTimestamp - now) / (24 * 60 * 60 * 1000)));
      unlockDateStr = new Date(expiryTimestamp).toLocaleDateString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }

    return {
      isCooldownActive: true,
      reason: 'QUOTA_EXCEEDED',
      usedCount: totalUsed,
      maxSlots,
      remainingSlots: 0,
      activeBookings,
      recentHistory,
      message: `Weekly limit reached: ${identity.name || 'Resident'} (Room ${identity.roomNo || ''}) has used all ${maxSlots} allowed slots for this week (${activeBookings.length} active, ${recentHistory.length} completed). ${recentHistory.length > 0 ? `Next slot opens in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''} on ${unlockDateStr}.` : 'Please complete your current active booking first.'}`,
      expiryTimestamp,
      expiryDate: unlockDateStr,
      daysRemaining,
    };
  }

  return {
    isCooldownActive: false,
    usedCount: totalUsed,
    maxSlots,
    remainingSlots,
    activeBookings,
    recentHistory,
    message: `Weekly Quota: ${totalUsed}/${maxSlots} slots used (${remainingSlots} slot${remainingSlots === 1 ? '' : 's'} remaining this week).`,
  };
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
