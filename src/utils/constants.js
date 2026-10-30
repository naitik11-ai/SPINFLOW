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
  '7020387424', // Naitik Ramani (Hostel Admin / Room 204)
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

export const LAUNDRY_GUIDELINES = {
  dos: [
    {
      title: 'Only Dry Clothes Allowed',
      desc: 'Load only completely dry clothes into the machine. Never put pre-soaked or dripping wet clothes.'
    },
    {
      title: 'Only Standard Apparel Allowed (Shirts, Pants, Track Pants)',
      desc: 'Only wash regular apparel such as shirts, t-shirts, pants, jeans, track pants, and shorts. No small items allowed.'
    },
    {
      title: 'Use Liquid Detergent Only',
      desc: 'Always use liquid detergent in the dispenser drawer. Powder detergents and soap cakes are strictly prohibited.'
    },
    {
      title: 'Maximum 5 Pairs of Clothes (10 Clothes Limit)',
      desc: 'Limit your wash load to a maximum of 5 pairs of clothes (total 10 clothes maximum) per wash cycle.'
    },
    {
      title: 'Only 1 Bedsheet at a Time',
      desc: 'Wash only 1 single or double bedsheet per slot. Never mix bedsheets with regular clothes or wash multiple bedsheets together.'
    },
    {
      title: 'Empty All Pockets Completely',
      desc: 'Check all pockets for coins, keys, safety pins, ID cards, earphones, clips, pens, and paper/tissues before loading.'
    },
    {
      title: 'Come Strictly According to Your Allocated Slot',
      desc: 'Arrive strictly on time at the start of your reserved 1h 30m slot and scan the machine QR sticker to start your cycle.'
    },
    {
      title: 'Collect Clothes Promptly & Leave Door Ajar',
      desc: 'Remove washed laundry promptly during the 25-minute rest/pickup window and leave the front door slightly cracked open to air out the drum.'
    }
  ],
  donts: [
    {
      title: 'Do NOT Wash Small Items (Socks, Handkerchiefs, Napkins)',
      desc: 'Small items like socks, handkerchiefs, napkins, or small cloths get sucked past the gasket into the drain pump filter and choke the machine.'
    },
    {
      title: 'Do NOT Use Powder Detergent or Soap Bars',
      desc: 'Strictly use liquid detergent only. Powder detergents leave chemical residue, generate excessive suds, and clog internal pipes.'
    },
    {
      title: 'Do NOT Put Dripping Wet / Pre-Soaked Clothes',
      desc: 'Never put bucket-soaked or waterlogged clothes; the unbalanced heavy water weight trips and damages the spin motor.'
    },
    {
      title: 'Do NOT Arrive Outside Your Reserved Slot',
      desc: 'Never attempt to use the machine before/after your scheduled slot or interfere with another resident\'s booked window.'
    },
    {
      title: 'Do NOT Exceed 10 Clothes / 5 Pairs Limit',
      desc: 'Never overload the machine beyond 10 clothes (5 pairs). Overloading burns the motor and leaves clothes uncleaned.'
    },
    {
      title: 'Do NOT Wash Multiple Bedsheets or Heavy Blankets',
      desc: 'Only 1 bedsheet is allowed per wash. Heavy bulky blankets or multiple bedsheets cause severe drum imbalance and vibration faults.'
    },
    {
      title: 'Do NOT Wash Shoes, Footwear, or Heavy Doormats',
      desc: 'Hard soles and heavy rugs crack the glass door, damage drum paddles, and break internal suspension springs.'
    },
    {
      title: 'Do NOT Put Hard/Sharp Objects (Coins, Belts, Open Zippers)',
      desc: 'Unzipped metal zippers, open safety pins, and heavy metal belt buckles scratch the drum and damage internal sensors.'
    },
    {
      title: 'Do NOT Force Open the Door While Running',
      desc: 'The door remains electronically locked during the cycle. Forcing it open will break the safety latch.'
    },
    {
      title: 'Do NOT Exceed Weekly 1-Slot Quota',
      desc: 'Each resident is strictly allowed 1 slot per 7 days. Do not attempt multiple bookings in the same week.'
    }
  ]
};

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
    title: 'Load Limit: Max 10 Clothes (5 Pairs) or 1 Bedsheet',
    desc: 'Strictly dry clothes only. Max 5 pairs of clothes (10 clothes) or 1 bedsheet per cycle. No loose socks or wet clothes.',
  },
  {
    title: 'Liquid Detergent Only · No Small Items',
    desc: 'Use liquid detergent only (no powder). Only shirts, pants, track pants allowed (no socks or handkerchiefs).',
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

// Official Master Student Directory (105 Registered Hostel Students across Floors 1 to 4)
export const DEFAULT_STUDENT_DIRECTORY = [
  { id: 'std-1', name: 'MUTHA HARDIK RATNESH', roomNo: '101', phone: '9529348097', status: 'Old', floor: '1st Floor' },
  { id: 'std-2', name: 'BANGAR RUDRA AJAY', roomNo: '101', phone: '8999282820', status: 'Old', floor: '1st Floor' },
  { id: 'std-3', name: 'BHANDARI SANSKAR SANDESH', roomNo: '101', phone: '9623391366', status: 'Old', floor: '1st Floor' },
  { id: 'std-4', name: 'CHAUDHARI VEDAANG SUBODH', roomNo: '102', phone: '9284217388', status: 'Old', floor: '1st Floor' },
  { id: 'std-5', name: 'KOTANGALE CHETAN GORKSHANATH', roomNo: '102', phone: '8055409952', status: 'Old', floor: '1st Floor' },
  { id: 'std-6', name: 'KARNAWAT SIDDHANT SANDESH', roomNo: '102', phone: '9307769415', status: 'Old', floor: '1st Floor' },
  { id: 'std-7', name: 'PAHADE ARYAN NILESH', roomNo: '103', phone: '9322917930', status: 'Old', floor: '1st Floor' },
  { id: 'std-8', name: 'SANCHETI SIDDHANT SACHIN', roomNo: '103', phone: '9423337976', status: 'Old', floor: '1st Floor' },
  { id: 'std-9', name: 'SHINDE UJJWAL PRAKASH', roomNo: '103', phone: '8080559446', status: 'Old', floor: '1st Floor' },
  { id: 'std-10', name: 'PATANI ROCHIS TUSHAR', roomNo: '104', phone: '8767320322', status: 'Old', floor: '1st Floor' },
  { id: 'std-11', name: 'PADHARIYA DEV TULSIDAS', roomNo: '104', phone: '8767628407', status: 'Old', floor: '1st Floor' },
  { id: 'std-12', name: 'KALA RAMYAK NIRMALKUMAR', roomNo: '104', phone: '9563646560', status: 'Old', floor: '1st Floor' },
  { id: 'std-13', name: 'JAIN SAMYAK NILESH', roomNo: '105', phone: '9423779421', status: 'Old', floor: '1st Floor' },
  { id: 'std-14', name: 'PANDE VIPUL NITIN', roomNo: '105', phone: '7219632943', status: 'Old', floor: '1st Floor' },
  { id: 'std-15', name: 'KASLIWAL SAMYAK NILESH', roomNo: '105', phone: '8788741261', status: 'Old', floor: '1st Floor' },
  { id: 'std-16', name: 'BANSODE RASIK RAMDAS', roomNo: '201', phone: '9699393911', status: 'New', floor: '2nd Floor' },
  { id: 'std-17', name: 'CHAVAN VIKRANT VIJAYKUMAR', roomNo: '201', phone: '8999151919', status: 'Old', floor: '2nd Floor' },
  { id: 'std-18', name: 'GANDHI VEER PANKAJ', roomNo: '201', phone: '9158141008', status: 'Old', floor: '2nd Floor' },
  { id: 'std-19', name: 'PARBHALE YASH SHARAD', roomNo: '202', phone: '9699162215', status: 'Old', floor: '2nd Floor' },
  { id: 'std-20', name: 'JAIN RITIK SACHIN', roomNo: '202', phone: '9503593015', status: 'New', floor: '2nd Floor' },
  { id: 'std-21', name: 'CHAUDHARI HARSH NITESH', roomNo: '202', phone: '9284170362', status: 'Old', floor: '2nd Floor' },
  { id: 'std-22', name: 'BIBEKAR BHUPEN ARUN', roomNo: '203', phone: '9767567903', status: 'Old', floor: '2nd Floor' },
  { id: 'std-23', name: 'AGRAWAL MOHIT RAJESH', roomNo: '203', phone: '9637991199', status: 'Old', floor: '2nd Floor' },
  { id: 'std-24', name: 'HAGE JAYESH SHRIKRISHNA', roomNo: '203', phone: '9158359036', status: 'Old', floor: '2nd Floor' },
  { id: 'std-25', name: 'JAIN SAIYYAM RUPESH', roomNo: '204', phone: '9356970376', status: 'Old', floor: '2nd Floor' },
  { id: 'std-26', name: 'PATEL THAKRANI MEET SURESH', roomNo: '204', phone: '9819944202', status: 'Old', floor: '2nd Floor' },
  { id: 'std-27', name: 'RAMANI NAITIK HITENDRA', roomNo: '204', phone: '7020387424', status: 'Old', floor: '2nd Floor' },
  { id: 'std-28', name: 'PATEL DEEP VINOD', roomNo: '205', phone: '9373143036', status: 'New', floor: '2nd Floor' },
  { id: 'std-29', name: 'PATEL KASHYAP AMIT', roomNo: '205', phone: '8308021010', status: 'New', floor: '2nd Floor' },
  { id: 'std-30', name: 'PATEL SOHAM DHANSUKH', roomNo: '205', phone: '9834853424', status: 'New', floor: '2nd Floor' },
  { id: 'std-31', name: 'SETH RAJ JITENDRA', roomNo: '206', phone: '7219151728', status: 'New', floor: '2nd Floor' },
  { id: 'std-32', name: 'POKAR DHRUV KANTILAL', roomNo: '206', phone: '7620167282', status: 'Old', floor: '2nd Floor' },
  { id: 'std-33', name: 'PATEL DEEP KISHOR', roomNo: '206', phone: '9834539036', status: 'Old', floor: '2nd Floor' },
  { id: 'std-34', name: 'MASANE AYUSH MANISH', roomNo: '207', phone: '9309963098', status: 'Old', floor: '2nd Floor' },
  { id: 'std-35', name: 'PITKE ATHARVA PRAVIN', roomNo: '207', phone: '9579180594', status: 'Old', floor: '2nd Floor' },
  { id: 'std-36', name: 'NAKARANI PARTH KAPIL', roomNo: '207', phone: '9284383929', status: 'Old', floor: '2nd Floor' },
  { id: 'std-37', name: 'RAMANI YASH KALPESH', roomNo: '208', phone: '9699826371', status: 'Old', floor: '2nd Floor' },
  { id: 'std-38', name: 'KEDAR YASH GIRISH', roomNo: '208', phone: '7020084352', status: 'Old', floor: '2nd Floor' },
  { id: 'std-39', name: 'MAVANI ASHISH SHANTILAL', roomNo: '208', phone: '9665944115', status: 'Old', floor: '2nd Floor' },
  { id: 'std-40', name: 'SOLANKI AARYA PRAFFUL', roomNo: '209', phone: '8208926945', status: 'New', floor: '2nd Floor' },
  { id: 'std-41', name: 'AGRAWAL GAGAN OMPRAKASH', roomNo: '209', phone: '9371441069', status: 'Old', floor: '2nd Floor' },
  { id: 'std-42', name: 'DAYMA VINEET YOGESH', roomNo: '209', phone: '7057381828', status: 'Old', floor: '2nd Floor' },
  { id: 'std-43', name: 'LALWANI PARTH ANAND', roomNo: '210', phone: '8793005953', status: 'Old', floor: '2nd Floor' },
  { id: 'std-44', name: 'CHHORIYA BHAVIK RIKHAB', roomNo: '210', phone: '8600252810', status: 'Old', floor: '2nd Floor' },
  { id: 'std-45', name: 'JAIN HARSHIT ABHAY', roomNo: '210', phone: '7666140085', status: 'Old', floor: '2nd Floor' },
  { id: 'std-46', name: 'MUNDLIK MOHAK SHRIKANT', roomNo: '301', phone: '9096030404', status: 'Old', floor: '3rd Floor' },
  { id: 'std-47', name: 'KOTHARI ROHIT JITENDRA', roomNo: '301', phone: '7387879977', status: 'Old', floor: '3rd Floor' },
  { id: 'std-48', name: 'POLE SHIVTEJ SATISH', roomNo: '301', phone: '8080734134', status: 'Old', floor: '3rd Floor' },
  { id: 'std-49', name: 'NAVARKAR ANAGH RAJANISH', roomNo: '302', phone: '8010723204', status: 'Old', floor: '3rd Floor' },
  { id: 'std-50', name: 'PANDEY ARNAV VISHAL', roomNo: '302', phone: '8235025517', status: 'New', floor: '3rd Floor' },
  { id: 'std-51', name: 'PATODI AAYUSH PARASKUMAR', roomNo: '302', phone: '9112699036', status: 'New', floor: '3rd Floor' },
  { id: 'std-52', name: 'JOSHI MAYANK NITIN', roomNo: '303', phone: '9359936987', status: 'New', floor: '3rd Floor' },
  { id: 'std-53', name: 'WANKHEDE RUDRATEJ MANOJ', roomNo: '303', phone: '9511615919', status: 'New', floor: '3rd Floor' },
  { id: 'std-54', name: 'SHEKHAWAT SANDEEP MAHAVEER', roomNo: '303', phone: '6376073611', status: 'Old', floor: '3rd Floor' },
  { id: 'std-55', name: 'JAIN MEHUL DINESHKUMAR', roomNo: '304', phone: '7020172756', status: 'Old', floor: '3rd Floor' },
  { id: 'std-56', name: 'GADODIYA ATHARV MAHABIR', roomNo: '304', phone: '8421157858', status: 'Old', floor: '3rd Floor' },
  { id: 'std-57', name: 'PATEL JAYOM RAJESHKUMAR', roomNo: '304', phone: '9552644444', status: 'New', floor: '3rd Floor' },
  { id: 'std-58', name: 'VYAS YUG TUSHARKUMAR', roomNo: '305', phone: '9377726738', status: 'Old', floor: '3rd Floor' },
  { id: 'std-59', name: 'CHANDAGADE ADITYA SATISH', roomNo: '305', phone: '7620794381', status: 'Old', floor: '3rd Floor' },
  { id: 'std-60', name: 'HIRAN NEEL PANKAJ', roomNo: '305', phone: '9422533170', status: 'Old', floor: '3rd Floor' },
  { id: 'std-61', name: 'DHOKE AASHAY MAHENDRA', roomNo: '306', phone: '8369835346', status: 'Old', floor: '3rd Floor' },
  { id: 'std-62', name: 'AGRAWAL TANAY VIJAY', roomNo: '306', phone: '9623144944', status: 'Old', floor: '3rd Floor' },
  { id: 'std-63', name: 'GANDHI GOVIND PRASHANT', roomNo: '306', phone: '8459291929', status: 'Old', floor: '3rd Floor' },
  { id: 'std-64', name: 'KHEDLEKAR NIRGUN NITIN', roomNo: '307', phone: '9890969420', status: 'Old', floor: '3rd Floor' },
  { id: 'std-65', name: 'SAHNI JASHANPREET SINGH JAGPREET SINGH', roomNo: '307', phone: '7575004375', status: 'Old', floor: '3rd Floor' },
  { id: 'std-66', name: 'JAIN PRATIK PRITESH', roomNo: '307', phone: '7498182199', status: 'New', floor: '3rd Floor' },
  { id: 'std-67', name: 'GANDEWAR SANKALP SANDEEP', roomNo: '308', phone: '7393931293', status: 'Old', floor: '3rd Floor' },
  { id: 'std-68', name: 'BHANGALE ARNAV PRASHANT', roomNo: '308', phone: '7588283937', status: 'New', floor: '3rd Floor' },
  { id: 'std-69', name: 'POWAR SHOURYA GANESH', roomNo: '308', phone: '7385689521', status: 'Old', floor: '3rd Floor' },
  { id: 'std-70', name: 'PATIL DEEPARAJ GORAKH', roomNo: '309', phone: '8320355844', status: 'Old', floor: '3rd Floor' },
  { id: 'std-71', name: 'BHOMAJ KEVAL SANJAY', roomNo: '309', phone: '9881393033', status: 'Old', floor: '3rd Floor' },
  { id: 'std-72', name: 'CHHAJER RIDHAM AMRUTLAL', roomNo: '309', phone: '9209388138', status: 'Old', floor: '3rd Floor' },
  { id: 'std-73', name: 'KOTHAWADE OM AJAY', roomNo: '310', phone: '9960313105', status: 'New', floor: '3rd Floor' },
  { id: 'std-74', name: 'CHOUGULE MANAS SHASHIKANT', roomNo: '310', phone: '8329179324', status: 'New', floor: '3rd Floor' },
  { id: 'std-75', name: 'PAGARIYA KARTIK RAJESH', roomNo: '310', phone: '7020387403', status: 'Old', floor: '3rd Floor' },
  { id: 'std-76', name: 'HIRUGADE OM RAVINDRA', roomNo: '401', phone: '9689894301', status: 'New', floor: '4th Floor' },
  { id: 'std-77', name: 'GAIKWAD SARVESH SANJAY', roomNo: '401', phone: '7972683378', status: 'New', floor: '4th Floor' },
  { id: 'std-78', name: 'ULAPE ADITYA UDAY', roomNo: '401', phone: '8308089599', status: 'Old', floor: '4th Floor' },
  { id: 'std-79', name: 'KATHURIA KARTIK PRATAP', roomNo: '402', phone: '7666774909', status: 'Old', floor: '4th Floor' },
  { id: 'std-80', name: 'ARGULWAR MAYURESH VISHWANATH', roomNo: '402', phone: '9156874264', status: 'Old', floor: '4th Floor' },
  { id: 'std-81', name: 'JAIPURIA ROHIT MUKESH', roomNo: '402', phone: '9823598680', status: 'New', floor: '4th Floor' },
  { id: 'std-82', name: 'PAWAR SOHAM KASHINATH', roomNo: '403', phone: '7385689521', status: 'Old', floor: '4th Floor' },
  { id: 'std-83', name: 'PATIL JYOTIRJAI PRAMOD', roomNo: '403', phone: '8421644562', status: 'New', floor: '4th Floor' },
  { id: 'std-84', name: 'NIRHALE AJINKYA AMOL', roomNo: '403', phone: '6265908151', status: 'Old', floor: '4th Floor' },
  { id: 'std-85', name: 'NALAWADE TANISHQ LALITKUMAR', roomNo: '404', phone: '9322779299', status: 'Old', floor: '4th Floor' },
  { id: 'std-86', name: 'KHAMKAR OM HARIPANDIT', roomNo: '404', phone: '7796681337', status: 'Old', floor: '4th Floor' },
  { id: 'std-87', name: 'GANDHI OM SANTOSH', roomNo: '404', phone: '7350073716', status: 'Old', floor: '4th Floor' },
  { id: 'std-88', name: 'YAWLE VIRAJ DHARMENDRA', roomNo: '405', phone: '9518912697', status: 'Old', floor: '4th Floor' },
  { id: 'std-89', name: 'KORADE SUJAY NITIN', roomNo: '405', phone: '7219444546', status: 'Old', floor: '4th Floor' },
  { id: 'std-90', name: 'GONGE SHALIN SACHIN', roomNo: '405', phone: '7620199396', status: 'Old', floor: '4th Floor' },
  { id: 'std-91', name: 'NAKRANI OM HEMANT', roomNo: '406', phone: '8766020343', status: 'New', floor: '4th Floor' },
  { id: 'std-92', name: 'VALAMBHIYA DHRUV KAUSHALBHAI', roomNo: '406', phone: '9316021604', status: 'New', floor: '4th Floor' },
  { id: 'std-93', name: 'LIMBANI DARSHAN KHIMJI', roomNo: '406', phone: '9325024091', status: 'New', floor: '4th Floor' },
  { id: 'std-94', name: 'GOTHI HARRY DINESHBHAI', roomNo: '407', phone: '9173397798', status: 'New', floor: '4th Floor' },
  { id: 'std-95', name: 'PATEL KIRTAN HARESHKUMAR', roomNo: '407', phone: '9099200346', status: 'New', floor: '4th Floor' },
  { id: 'std-96', name: 'SENGHANI SHIV RAJESHBHAI', roomNo: '407', phone: '8799049385', status: 'New', floor: '4th Floor' },
  { id: 'std-97', name: 'PUND TANMAY JITENDRA', roomNo: '408', phone: '7972271708', status: 'New', floor: '4th Floor' },
  { id: 'std-98', name: 'BARDIA ANANT PRADEEP', roomNo: '408', phone: '8827139859', status: 'Old', floor: '4th Floor' },
  { id: 'std-99', name: 'AGRAWAL SOMYA MAHESHKUMAR', roomNo: '408', phone: '8208599436', status: 'New', floor: '4th Floor' },
  { id: 'std-100', name: 'BARDIA ABHINANDAN PANKAJ', roomNo: '409', phone: '9302221467', status: 'Old', floor: '4th Floor' },
  { id: 'std-101', name: 'WALKE HARSH SUHAS', roomNo: '409', phone: '9970548171', status: 'Old', floor: '4th Floor' },
  { id: 'std-102', name: 'KANNAWAR ESHAN UDAY', roomNo: '409', phone: '7558206741', status: 'Old', floor: '4th Floor' },
  { id: 'std-103', name: 'BADODARIYA KARAN VRUJLAL', roomNo: '410', phone: '9426497529', status: 'New', floor: '4th Floor' },
  { id: 'std-104', name: 'JAGANI KRISH JATIN', roomNo: '410', phone: '8055478435', status: 'New', floor: '4th Floor' },
  { id: 'std-105', name: 'VAISHNANI MADHAV GIRISH', roomNo: '410', phone: '9979138334', status: 'New', floor: '4th Floor' },
];
