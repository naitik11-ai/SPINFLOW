export const SLOT_CONFIG = {
  totalDurationMinutes: 90,
  washDurationMinutes: 65,
  restDurationMinutes: 25,
  totalSeconds: 90 * 60,
  washSeconds: 65 * 60,
  restSeconds: 25 * 60,
  slotLabel: '1 Hour 30 Minutes (90m)',
  washLabel: '1 Hour 05 Mins Wash',
  restLabel: '25 Mins Machine Rest & Pickup',
};

// Daily Operating Hours: 6:00 AM (06:00) to 12:00 AM Midnight (00:00) - 18 Hours Total
export const OPERATING_HOURS = {
  start: '06:00',
  end: '00:00',
  totalHours: 18,
  startHour: 6,
  endHour: 24, // Midnight
};

// 12 Fixed Generalized Time Slots per day (1h 30m each)
export const FIXED_SLOTS = [
  { id: 'slot-1', index: 1, label: '06:00 - 07:30', startTime: '06:00', endTime: '07:30', startMinutes: 360, endMinutes: 450, period: 'Morning' },
  { id: 'slot-2', index: 2, label: '07:30 - 09:00', startTime: '07:30', endTime: '09:00', startMinutes: 450, endMinutes: 540, period: 'Morning' },
  { id: 'slot-3', index: 3, label: '09:00 - 10:30', startTime: '09:00', endTime: '10:30', startMinutes: 540, endMinutes: 630, period: 'Morning' },
  { id: 'slot-4', index: 4, label: '10:30 - 12:00', startTime: '10:30', endTime: '12:00', startMinutes: 630, endMinutes: 720, period: 'Morning' },
  { id: 'slot-5', index: 5, label: '12:00 - 13:30', startTime: '12:00', endTime: '13:30', startMinutes: 720, endMinutes: 810, period: 'Afternoon' },
  { id: 'slot-6', index: 6, label: '13:30 - 15:00', startTime: '13:30', endTime: '15:00', startMinutes: 810, endMinutes: 900, period: 'Afternoon' },
  { id: 'slot-7', index: 7, label: '15:00 - 16:30', startTime: '15:00', endTime: '16:30', startMinutes: 900, endMinutes: 990, period: 'Afternoon' },
  { id: 'slot-8', index: 8, label: '16:30 - 18:00', startTime: '16:30', endTime: '18:00', startMinutes: 990, endMinutes: 1080, period: 'Evening' },
  { id: 'slot-9', index: 9, label: '18:00 - 19:30', startTime: '18:00', endTime: '19:30', startMinutes: 1080, endMinutes: 1170, period: 'Evening' },
  { id: 'slot-10', index: 10, label: '19:30 - 21:00', startTime: '19:30', endTime: '21:00', startMinutes: 1170, endMinutes: 1260, period: 'Night' },
  { id: 'slot-11', index: 11, label: '21:00 - 22:30', startTime: '21:00', endTime: '22:30', startMinutes: 1260, endMinutes: 1350, period: 'Night' },
  { id: 'slot-12', index: 12, label: '22:30 - 00:00', startTime: '22:30', endTime: '00:00', startMinutes: 1350, endMinutes: 1440, period: 'Night' },
];

// Cooldown rule: 1 slot per student per 7 days (105 students sharing 1 washing machine)
export const WEEKLY_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
export const TOTAL_HOSTEL_STUDENTS = 105;

// Authorized Administrator Phone Numbers (strictly protected by Admin OTP)
export const ADMIN_PHONE_NUMBERS = [
  '9999999999',
  '9876500000',
  '9811111111',
  '9800000000',
  '9876543210', // Harsh / Demo Admin
];

// Currently 1 active machine (Washing Machine 1), modular for adding more units
export const INITIAL_MACHINES = [
  {
    id: 'machine-1',
    name: 'Washing Machine 1',
    qrCodePayload: 'SPINFLOW-M1',
    capacityKg: 8.5,
    status: 'AVAILABLE', // 'AVAILABLE' | 'RUNNING' | 'COMPLETED_UNCLAIMED' | 'MAINTENANCE'
    currentWash: null,
  },
];

export const INITIAL_QUEUE = [];
export const INITIAL_HISTORY = [];

export const HOURLY_BUSYNESS = [
  { hour: '06:00', level: 10, label: 'Low' },
  { hour: '07:30', level: 30, label: 'Low' },
  { hour: '09:00', level: 75, label: 'Moderate' },
  { hour: '10:30', level: 85, label: 'High' },
  { hour: '12:00', level: 50, label: 'Moderate' },
  { hour: '13:30', level: 40, label: 'Low' },
  { hour: '15:00', level: 60, label: 'Moderate' },
  { hour: '16:30', level: 80, label: 'High' },
  { hour: '18:00', level: 95, label: 'Peak' },
  { hour: '19:30', level: 100, label: 'Peak' },
  { hour: '21:00', level: 85, label: 'High' },
  { hour: '22:30', level: 40, label: 'Low' },
];

export const DORM_RULES = [
  {
    title: 'Operating Hours: 6:00 AM - 12:00 AM Midnight',
    desc: 'The washing machine operates strictly in 12 generalized 90-minute slot windows each day.',
  },
  {
    title: 'Weekly 1-Slot Quota per Resident',
    desc: 'With 105 students sharing 1 machine, each resident is allocated 1 slot every 7 days to ensure fair and equal access.',
  },
  {
    title: 'Strict 3-Way Identity Verification',
    desc: 'Name, room number, and phone number must exactly match the registered hostel master directory.',
  },
  {
    title: 'Physical QR Code Activation',
    desc: 'When your time slot begins, scan the QR code sticker on the machine to start your wash cycle.',
  },
];

// Helper to generate official 105 hostel students master directory
const FIRST_NAMES = [
  'Harsh', 'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna',
  'Ishaan', 'Shaurya', 'Atharv', 'Advik', 'Pranav', 'Advaith', 'Aaryan', 'Dhruv', 'Kabir', 'Ritik',
  'Devansh', 'Kian', 'Darsh', 'Samar', 'Laksh', 'Yash', 'Aryan', 'Ayush', 'Rohan', 'Aniket',
  'Nikhil', 'Siddharth', 'Varun', 'Kunal', 'Abhishek', 'Mayank', 'Gaurav', 'Manish', 'Saurabh', 'Amit',
  'Deepak', 'Vikram', 'Pooja', 'Ananya', 'Diya', 'Isha', 'Aadhya', 'Saanvi', 'Kiara', 'Myra',
  'Pari', 'Riya', 'Anushka', 'Avani', 'Sneha', 'Tanvi', 'Khushi', 'Shruti', 'Simran', 'Neha',
  'Meera', 'Kavya', 'Rashi', 'Divya', 'Sanjana', 'Kritika', 'Bhavya', 'Trisha', 'Palak', 'Swati',
  'Alex', 'Brian', 'Chris', 'David', 'Ethan', 'Felix', 'George', 'Harry', 'Ian', 'Jacob',
  'Kevin', 'Liam', 'Marcus', 'Nathan', 'Oliver', 'Peter', 'Quinn', 'Ryan', 'Samuel', 'Thomas',
  'Victor', 'William', 'Xavier', 'Yusuf', 'Zack', 'Aman', 'Karan', 'Tarun', 'Vikas', 'Rahul',
  'Akash', 'Bharat', 'Chirag', 'Dinesh', 'Hemant'
];

export const DEFAULT_STUDENT_DIRECTORY = (() => {
  const students = [];
  let nameIndex = 0;

  // 1st Floor: Rooms 101 to 135 (35 students)
  for (let r = 101; r <= 135; r++) {
    const name = r === 101 ? 'Harsh' : (FIRST_NAMES[nameIndex % FIRST_NAMES.length] || `Student ${r}`);
    const phone = r === 101 ? '9876543210' : `98${String(r).padStart(3, '0')}00${String(100 + (r % 90)).slice(-2)}`;
    students.push({
      id: `std-${r}`,
      name,
      roomNo: String(r),
      phone,
      floor: '1st Floor',
    });
    nameIndex++;
  }

  // 2nd Floor: Rooms 201 to 235 (35 students)
  for (let r = 201; r <= 235; r++) {
    const name = FIRST_NAMES[nameIndex % FIRST_NAMES.length] || `Student ${r}`;
    const phone = `97${String(r).padStart(3, '0')}00${String(100 + (r % 90)).slice(-2)}`;
    students.push({
      id: `std-${r}`,
      name,
      roomNo: String(r),
      phone,
      floor: '2nd Floor',
    });
    nameIndex++;
  }

  // 3rd Floor: Rooms 301 to 335 (35 students)
  for (let r = 301; r <= 335; r++) {
    const name = FIRST_NAMES[nameIndex % FIRST_NAMES.length] || `Student ${r}`;
    const phone = `96${String(r).padStart(3, '0')}00${String(100 + (r % 90)).slice(-2)}`;
    students.push({
      id: `std-${r}`,
      name,
      roomNo: String(r),
      phone,
      floor: '3rd Floor',
    });
    nameIndex++;
  }

  return students;
})();
