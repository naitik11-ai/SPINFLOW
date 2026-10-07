import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Initialize Supabase Client if environment variables are configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database synchronization service for production deployment
export const dbService = {
  // Fetch latest machines state
  async fetchMachines(fallbackMachines) {
    if (!supabase) return fallbackMachines;
    try {
      const { data, error } = await supabase.from('machines').select('*');
      if (error || !data || data.length === 0) return fallbackMachines;
      return data.map((m) => ({
        id: m.id,
        name: m.name,
        qrCodePayload: m.qr_code_payload,
        capacityKg: m.capacity_kg,
        status: m.status,
        currentWash: m.current_wash,
      }));
    } catch (e) {
      console.warn('Supabase fetchMachines error, using local fallback:', e);
      return fallbackMachines;
    }
  },

  // Update a machine in database
  async updateMachine(machine) {
    if (!supabase) return;
    try {
      await supabase.from('machines').upsert({
        id: machine.id,
        name: machine.name,
        qr_code_payload: machine.qrCodePayload,
        capacity_kg: machine.capacityKg,
        status: machine.status,
        current_wash: machine.currentWash,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Supabase updateMachine error:', e);
    }
  },

  // Fetch all pending bookings
  async fetchBookings(fallbackQueue) {
    if (!supabase) return fallbackQueue;
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('joined_at', { ascending: true });
      if (error || !data) return fallbackQueue;
      return data.map((b) => ({
        id: b.id,
        name: b.name,
        roomNo: b.room_no,
        phone: b.phone,
        laundryType: b.laundry_type,
        clothesCount: b.clothes_count,
        itemSummary: b.item_summary,
        cycleName: b.cycle_name,
        durationMinutes: b.duration_minutes,
        washDurationMinutes: b.wash_duration_minutes,
        restDurationMinutes: b.rest_duration_minutes,
        assignedMachineId: b.assigned_machine_id,
        slotDate: b.slot_date,
        slotDateDisplay: b.slot_date_display,
        slotId: b.slot_id,
        slotLabel: b.slot_label,
        startTime: b.start_time,
        endTime: b.end_time,
        startTimestamp: b.start_timestamp,
        endTimestamp: b.end_timestamp,
        status: b.status,
        joinedAt: b.joined_at,
        notes: b.notes,
      }));
    } catch (e) {
      console.warn('Supabase fetchBookings error, using local fallback:', e);
      return fallbackQueue;
    }
  },

  // Insert a new booking
  async insertBooking(booking) {
    if (!supabase) return;
    try {
      await supabase.from('bookings').insert({
        id: booking.id,
        name: booking.name,
        room_no: booking.roomNo,
        phone: booking.phone,
        laundry_type: booking.laundryType,
        clothes_count: booking.clothesCount,
        item_summary: booking.itemSummary,
        cycle_name: booking.cycleName,
        duration_minutes: booking.durationMinutes,
        wash_duration_minutes: booking.washDurationMinutes,
        rest_duration_minutes: booking.restDurationMinutes,
        assigned_machine_id: booking.assignedMachineId,
        slot_date: booking.slotDate,
        slot_date_display: booking.slotDateDisplay,
        slot_id: booking.slotId,
        slot_label: booking.slotLabel,
        start_time: booking.startTime,
        end_time: booking.endTime,
        start_timestamp: booking.startTimestamp,
        end_timestamp: booking.endTimestamp,
        status: booking.status || 'waiting',
        joined_at: booking.joinedAt,
        notes: booking.notes,
      });
    } catch (e) {
      console.warn('Supabase insertBooking error:', e);
    }
  },

  // Delete a booking by ID
  async deleteBooking(bookingId) {
    if (!supabase) return;
    try {
      await supabase.from('bookings').delete().eq('id', bookingId);
    } catch (e) {
      console.warn('Supabase deleteBooking error:', e);
    }
  },

  // Fetch wash history
  async fetchHistory(fallbackHistory) {
    if (!supabase) return fallbackHistory;
    try {
      const { data, error } = await supabase
        .from('wash_history')
        .select('*')
        .order('completed_at', { ascending: false })
        .limit(50);
      if (error || !data) return fallbackHistory;
      return data.map((h) => ({
        id: h.id,
        name: h.name,
        roomNo: h.room_no,
        phone: h.phone,
        machineName: h.machine_name,
        cycleName: h.cycle_name,
        clothesCount: h.clothes_count,
        slotLabel: h.slot_label,
        status: h.status,
        completedAt: h.completed_at,
      }));
    } catch (e) {
      console.warn('Supabase fetchHistory error, using local fallback:', e);
      return fallbackHistory;
    }
  },

  // Insert into history
  async insertHistory(entry) {
    if (!supabase) return;
    try {
      await supabase.from('wash_history').insert({
        id: entry.id,
        name: entry.name,
        room_no: entry.roomNo,
        phone: entry.phone,
        machine_name: entry.machineName,
        cycle_name: entry.cycleName,
        clothes_count: entry.clothesCount,
        slot_label: entry.slotLabel,
        status: entry.status || 'Slot Completed',
        completed_at: entry.completedAt,
      });
    } catch (e) {
      console.warn('Supabase insertHistory error:', e);
    }
  },

  // Subscribe to real-time updates across student devices
  subscribeRealtime(onMachinesChange, onBookingsChange, onHistoryChange) {
    if (!supabase) return () => {};

    const channel = supabase
      .channel('spinflow_live_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'machines' },
        () => onMachinesChange && onMachinesChange()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => onBookingsChange && onBookingsChange()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'wash_history' },
        () => onHistoryChange && onHistoryChange()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
