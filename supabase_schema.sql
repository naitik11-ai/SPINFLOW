-- =========================================================================
-- SPINFLOW HOSTEL LAUNDRY MANAGEMENT SYSTEM - DATABASE SCHEMA
-- PostgreSQL / Supabase Schema Migration Script
-- =========================================================================

-- 1. Students Master Directory Table (105 Hostel Students)
CREATE TABLE IF NOT EXISTS public.student_directory (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  room_no TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  floor TEXT DEFAULT '1st Floor',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Washing Machines Table
CREATE TABLE IF NOT EXISTS public.machines (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  qr_code_payload TEXT NOT NULL,
  capacity_kg NUMERIC DEFAULT 8.5,
  status TEXT DEFAULT 'AVAILABLE', -- 'AVAILABLE', 'RUNNING', 'COMPLETED_UNCLAIMED', 'MAINTENANCE'
  current_wash JSONB DEFAULT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bookings Queue Table (12 Generalized Fixed Slots)
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  room_no TEXT NOT NULL,
  phone TEXT NOT NULL,
  laundry_type TEXT DEFAULT 'clothes',
  clothes_count INTEGER DEFAULT 10,
  item_summary TEXT,
  cycle_name TEXT,
  duration_minutes INTEGER DEFAULT 90,
  wash_duration_minutes INTEGER DEFAULT 65,
  rest_duration_minutes INTEGER DEFAULT 25,
  assigned_machine_id TEXT DEFAULT 'machine-1',
  slot_date TEXT NOT NULL,
  slot_date_display TEXT,
  slot_id TEXT NOT NULL,
  slot_label TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  start_timestamp BIGINT NOT NULL,
  end_timestamp BIGINT NOT NULL,
  status TEXT DEFAULT 'waiting', -- 'waiting', 'in_progress', 'completed', 'cancelled'
  joined_at BIGINT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Completed Wash History Table (Audit Logs & 7-Day Cooldown Checks)
CREATE TABLE IF NOT EXISTS public.wash_history (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  room_no TEXT NOT NULL,
  phone TEXT NOT NULL,
  machine_name TEXT NOT NULL,
  cycle_name TEXT,
  clothes_count INTEGER,
  slot_label TEXT,
  status TEXT DEFAULT 'Slot Completed',
  completed_at BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Authorized Administrators Table
CREATE TABLE IF NOT EXISTS public.admin_users (
  phone TEXT PRIMARY KEY,
  name TEXT,
  role TEXT DEFAULT 'HOSTEL_ADMIN',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for ultra-fast 3-way identity verification & 7-day cooldown lookups
CREATE INDEX IF NOT EXISTS idx_student_phone ON public.student_directory(phone);
CREATE INDEX IF NOT EXISTS idx_student_room ON public.student_directory(room_no);
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON public.bookings(phone);
CREATE INDEX IF NOT EXISTS idx_bookings_slot_date ON public.bookings(slot_date);
CREATE INDEX IF NOT EXISTS idx_history_phone ON public.wash_history(phone);
CREATE INDEX IF NOT EXISTS idx_history_completed ON public.wash_history(completed_at);

-- Row Level Security (RLS) Configuration
ALTER TABLE public.student_directory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wash_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Public read / write policies for hostel system
CREATE POLICY "Allow public read on student_directory" ON public.student_directory FOR SELECT USING (true);
CREATE POLICY "Allow public read on machines" ON public.machines FOR SELECT USING (true);
CREATE POLICY "Allow public update on machines" ON public.machines FOR UPDATE USING (true);
CREATE POLICY "Allow public read on bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Allow public insert on bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on bookings" ON public.bookings FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on bookings" ON public.bookings FOR DELETE USING (true);
CREATE POLICY "Allow public read on wash_history" ON public.wash_history FOR SELECT USING (true);
CREATE POLICY "Allow public insert on wash_history" ON public.wash_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read on admin_users" ON public.admin_users FOR SELECT USING (true);

-- Enable Realtime Replication for instant live sync across student devices
ALTER PUBLICATION supabase_realtime ADD TABLE public.machines;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wash_history;
