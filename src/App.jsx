import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import MachineCard from './components/MachineCard';
import QueueBoard from './components/QueueBoard';
import RegistrationModal from './components/RegistrationModal';
import AdminAuthModal from './components/AdminAuthModal';
import ViewQRCodeModal from './components/ViewQRCodeModal';
import QRScannerModal from './components/QRScannerModal';
import StudentDirectoryModal from './components/StudentDirectoryModal';
import AdminDashboardModal from './components/AdminDashboardModal';
import InsightsAndStats from './components/InsightsAndStats';
import GuidelinesModal from './components/GuidelinesModal';
import Toast from './components/Toast';

import { Plus, Camera, QrCode } from 'lucide-react';
import { 
  INITIAL_MACHINES, 
  INITIAL_QUEUE, 
  INITIAL_HISTORY, 
  SLOT_CONFIG,
  FIXED_SLOTS,
  DEFAULT_STUDENT_DIRECTORY,
  ADMIN_PHONE_NUMBERS
} from './utils/constants';
import { sound } from './utils/audio';
import { 
  sendBrowserNotification, 
  getCurrentActiveSlot, 
  getSlotTimestamps, 
  getSlotDateString,
  calculateLateArrivalRemainingSeconds,
  formatTimer,
  normalizePhone,
  normalizeRoomNo
} from './utils/helpers';

const STORAGE_KEY_MACHINES = 'spinflow_machines_v7';
const STORAGE_KEY_QUEUE = 'spinflow_queue_v7';
const STORAGE_KEY_HISTORY = 'spinflow_history_v7';
const STORAGE_KEY_ADMIN = 'spinflow_admin_auth';
const STORAGE_KEY_DIRECTORY = 'spinflow_student_directory_v1';

export default function App() {
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ADMIN);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [studentDirectory, setStudentDirectory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DIRECTORY);
      return saved ? JSON.parse(saved) : DEFAULT_STUDENT_DIRECTORY;
    } catch {
      return DEFAULT_STUDENT_DIRECTORY;
    }
  });

  const [machines, setMachines] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MACHINES);
      return saved ? JSON.parse(saved) : INITIAL_MACHINES;
    } catch {
      return INITIAL_MACHINES;
    }
  });

  const [queue, setQueue] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_QUEUE);
      return saved ? JSON.parse(saved) : INITIAL_QUEUE;
    } catch {
      return INITIAL_QUEUE;
    }
  });

  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      return saved ? JSON.parse(saved) : INITIAL_HISTORY;
    } catch {
      return INITIAL_HISTORY;
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isQRStickerOpen, setIsQRStickerOpen] = useState(false);
  const [isDirectoryModalOpen, setIsDirectoryModalOpen] = useState(false);
  const [selectedMachineForQR, setSelectedMachineForQR] = useState(machines[0] || INITIAL_MACHINES[0]);
  const [preselectedMachineId, setPreselectedMachineId] = useState('machine-1');
  const [toast, setToast] = useState(null);

  // Auto-display Guidelines on initial visit
  useEffect(() => {
    try {
      const hasAcknowledged = localStorage.getItem('spinflow_guidelines_acknowledged_v1');
      if (!hasAcknowledged) {
        const timer = setTimeout(() => {
          setIsGuidelinesOpen(true);
        }, 600);
        return () => clearTimeout(timer);
      }
    } catch {
      // Fallback
    }
  }, []);

  const handleAcknowledgeGuidelines = (dontShowAgain) => {
    if (dontShowAgain) {
      try {
        localStorage.setItem('spinflow_guidelines_acknowledged_v1', 'true');
      } catch (e) {
        console.warn(e);
      }
    }
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MACHINES, JSON.stringify(machines));
  }, [machines]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(queue));
  }, [queue]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DIRECTORY, JSON.stringify(studentDirectory));
  }, [studentDirectory]);

  // Determine current active slot window right now
  const todayStr = getSlotDateString(new Date());
  const currentActiveSlot = useMemo(() => getCurrentActiveSlot() || FIXED_SLOTS[0], []);

  // Main countdown timer loop: counts down the machine session until hard slot end-time
  useEffect(() => {
    const interval = setInterval(() => {
      setMachines((prevMachines) => {
        let hasChanges = false;

        const updated = prevMachines.map((m) => {
          if (m.status === 'RUNNING' && m.currentWash) {
            const currentRem = m.currentWash.remainingSeconds ?? (90 * 60);
            const newRem = Math.max(0, currentRem - 1);

            // Phase transition alert: 65m wash completed, entering 25m rest period (at 1500s mark)
            if (currentRem > 25 * 60 && newRem <= 25 * 60) {
              sound.playCompleteChime();
              sendBrowserNotification(`Wash Done on ${m.name}`, {
                body: `${m.currentWash.userName} (${m.currentWash.roomNo}), 65m wash is complete! 25-minute machine rest & collection window active.`,
              });
              setToast({
                type: 'info',
                title: `${m.name} Wash Done`,
                message: `${m.currentWash.userName}'s wash finished. 25m cooling & collection period active.`,
              });
            }

            // Total slot complete (0s / reached hard slot boundary)
            if (newRem <= 0 && currentRem > 0) {
              hasChanges = true;
              sound.playCompleteChime();

              sendBrowserNotification(`Slot Ended on ${m.name}`, {
                body: `${m.name} 1h 30m slot completed and unit is now available for the next slot.`,
              });

              setToast({
                type: 'success',
                title: `${m.name} Slot Finished`,
                message: `${m.currentWash.userName}'s 1h 30m slot has finished. Unit is now ready.`,
              });

              setHistory((prevHist) => [
                {
                  id: `h-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                  name: m.currentWash.userName,
                  roomNo: m.currentWash.roomNo,
                  phone: m.currentWash.phone,
                  machineName: m.name,
                  cycleName: m.currentWash.cycleName,
                  clothesCount: m.currentWash.clothesCount,
                  slotLabel: m.currentWash.slotLabel,
                  completedAt: Date.now(),
                  status: 'Slot Completed',
                },
                ...prevHist.slice(0, 29),
              ]);

              return {
                ...m,
                status: 'AVAILABLE',
                unclaimedSince: null,
                currentWash: null,
              };
            }

            if (newRem !== currentRem) {
              hasChanges = true;
              return {
                ...m,
                currentWash: {
                  ...m.currentWash,
                  remainingSeconds: newRem,
                },
              };
            }
          }

          if (m.status === 'COMPLETED_UNCLAIMED' && m.currentWash) {
            const currentRem = m.currentWash.remainingSeconds ?? 0;
            const newRem = Math.max(0, currentRem - 1);

            if (newRem <= 0) {
              hasChanges = true;
              return {
                ...m,
                status: 'AVAILABLE',
                unclaimedSince: null,
                currentWash: null,
              };
            }

            if (newRem !== currentRem) {
              hasChanges = true;
              return {
                ...m,
                currentWash: {
                  ...m.currentWash,
                  remainingSeconds: newRem,
                },
              };
            }
          }

          return m;
        });

        return hasChanges ? updated : prevMachines;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Handle QR Code Scan Activation at Physical Machine
  const handleQRScanSuccess = (machineId, payload) => {
    sound.playStart();

    const targetMachine = machines.find((m) => m.id === machineId) || machines[0];
    const activeSlot = getCurrentActiveSlot() || FIXED_SLOTS[0];
    const { endTimestamp } = getSlotTimestamps(todayStr, activeSlot);

    // Calculate late arrival remaining time until the slot's scheduled end boundary
    let remainingSec = calculateLateArrivalRemainingSeconds(endTimestamp);
    if (remainingSec <= 0) {
      remainingSec = 90 * 60; // Fallback to full 90m if tested off-hours
    }

    // Check if there is a scheduled booking in queue for today matching this slot
    let bookingToActivate = null;
    let queueIndex = queue.findIndex((q) => {
      const isToday = q.slotDate === todayStr || !q.slotDate;
      const isCurrentSlot = q.slotId === activeSlot.id;
      return isToday && isCurrentSlot;
    });

    if (queueIndex !== -1) {
      bookingToActivate = queue[queueIndex];
      setQueue((prev) => prev.filter((_, idx) => idx !== queueIndex));
    } else {
      // Direct on-spot activation with default student (e.g. Harsh)
      bookingToActivate = {
        id: `q-qr-${Date.now().toString().slice(-4)}`,
        name: 'Harsh',
        roomNo: 'Room 101',
        phone: '9876543210',
        laundryType: 'clothes',
        clothesCount: 10,
        itemSummary: '10 clothes',
        cycleName: 'Standard Wash (1h 30m Slot)',
        slotDate: todayStr,
        slotId: activeSlot.id,
        slotLabel: activeSlot.label,
        startTime: activeSlot.startTime,
        endTime: activeSlot.endTime,
      };
    }

    // Set Machine to RUNNING with hard slot end-time
    setMachines((prev) =>
      prev.map((m) => {
        if (m.id === targetMachine.id) {
          return {
            ...m,
            status: 'RUNNING',
            unclaimedSince: null,
            currentWash: {
              userId: bookingToActivate.id,
              userName: bookingToActivate.name,
              roomNo: bookingToActivate.roomNo,
              phone: bookingToActivate.phone,
              laundryType: bookingToActivate.laundryType || 'clothes',
              clothesCount: bookingToActivate.clothesCount || 10,
              itemSummary: bookingToActivate.itemSummary || `${bookingToActivate.clothesCount} clothes`,
              cycleName: bookingToActivate.cycleName || 'Standard Wash (1h 30m Slot)',
              startedAt: Date.now(),
              totalSlotSeconds: 90 * 60,
              totalDurationSeconds: remainingSec,
              remainingSeconds: remainingSec,
              slotId: activeSlot.id,
              slotLabel: activeSlot.label,
              startTime: activeSlot.startTime,
              endTime: activeSlot.endTime,
              endTimestamp,
            },
          };
        }
        return m;
      })
    );

    sendBrowserNotification(`Machine 1 Activated via QR`, {
      body: `${bookingToActivate.name} (${bookingToActivate.roomNo}), your wash cycle has started! Running until ${activeSlot.endTime}.`,
    });

    setToast({
      type: 'success',
      title: 'QR Code Verified',
      message: `${targetMachine.name} activated for ${bookingToActivate.name}. Timer set to ${formatTimer(remainingSec)} (ends at ${activeSlot.endTime}).`,
    });
  };

  // Handle New 1h 30m Slot Booking (Normal Student Flow)
  const handleBookingSubmit = (newBooking) => {
    setQueue((prev) => [...prev, newBooking]);

    setToast({
      type: 'success',
      title: '1h 30m Slot Reserved',
      message: `${newBooking.name} (${newBooking.roomNo}) booked for ${newBooking.slotDateDisplay} (${newBooking.slotLabel}).`,
    });
  };

  // Admin Login Handler (Phone + OTP Verified)
  const handleAdminLoginSuccess = (admin) => {
    setAdminUser(admin);
    localStorage.setItem(STORAGE_KEY_ADMIN, JSON.stringify(admin));
    setIsAdminDashboardOpen(true);
    setToast({
      type: 'success',
      title: 'Admin Authenticated',
      message: 'Welcome to the Hostel Laundry Administrator Dashboard.',
    });
  };

  // Admin Logout Handler
  const handleAdminLogout = () => {
    sound.playClick();
    setAdminUser(null);
    localStorage.removeItem(STORAGE_KEY_ADMIN);
    setIsAdminDashboardOpen(false);
    setToast({
      type: 'info',
      title: 'Admin Logged Out',
      message: 'Admin session closed securely.',
    });
  };

  // Open Admin Dashboard or Trigger Admin OTP Verification
  const handleOpenAdminClick = () => {
    if (adminUser) {
      setIsAdminDashboardOpen(true);
    } else {
      setIsAdminAuthOpen(true);
    }
  };

  // Update Master Directory
  const handleUpdateDirectory = (newDirectory) => {
    setStudentDirectory(newDirectory);
    setToast({
      type: 'success',
      title: 'Directory Updated',
      message: `Successfully updated master directory with ${newDirectory.length} hostel students.`,
    });
  };

  // Admin: Reset Student Weekly Quota
  const handleResetStudentQuota = (student) => {
    const cleanPhone = normalizePhone(student.phone);
    const cleanRoom = normalizeRoomNo(student.roomNo);

    // Remove past completed entries within 7 days from history
    setHistory((prev) =>
      prev.filter((h) => {
        const hPhone = normalizePhone(h.phone || '');
        const hRoom = normalizeRoomNo(h.roomNo || '');
        const isMatch = (cleanPhone && hPhone === cleanPhone) || (cleanRoom && hRoom === cleanRoom);
        return !isMatch;
      })
    );

    // Also remove from pending queue if any
    setQueue((prev) =>
      prev.filter((q) => {
        const qPhone = normalizePhone(q.phone || '');
        const qRoom = normalizeRoomNo(q.roomNo || '');
        const isMatch = (cleanPhone && qPhone === cleanPhone) || (cleanRoom && qRoom === cleanRoom);
        return !isMatch;
      })
    );

    setToast({
      type: 'success',
      title: 'Quota Reset for Student',
      message: `Weekly 1-slot quota for ${student.name} (Room ${student.roomNo}) has been cleared.`,
    });
  };

  // Cancel queue slot
  const handleCancelQueueItem = (id) => {
    const item = queue.find((q) => q.id === id);
    setQueue((prev) => prev.filter((q) => q.id !== id));
    sound.playClick();
    if (item) {
      setToast({
        type: 'info',
        title: 'Booking Cancelled',
        message: `${item.name}'s slot for ${item.slotDateDisplay || 'today'} was cancelled.`,
      });
    }
  };

  // Notify resident
  const handleNotifyResident = (resident) => {
    sound.playNextAlert();
    sendBrowserNotification('Washing Machine Alert', {
      body: `Hello ${resident.name} (${resident.roomNo}), your reserved 1h 30m slot (${resident.slotLabel}) is up next!`,
    });
    setToast({
      type: 'alert',
      title: 'Reminder Ping Sent',
      message: `Notification sent to ${resident.name} (${resident.roomNo}).`,
    });
  };

  // Mark clothes collected / machine ready
  const handleCollectClothes = (machineId) => {
    sound.playClick();
    setMachines((prev) =>
      prev.map((m) => {
        if (m.id === machineId) {
          return {
            ...m,
            status: 'AVAILABLE',
            unclaimedSince: null,
            currentWash: null,
          };
        }
        return m;
      })
    );

    setToast({
      type: 'success',
      title: 'Machine Available',
      message: 'Washing machine is cool and ready for the next scheduled slot.',
    });
  };

  // Toggle Maintenance Mode
  const handleToggleMaintenance = (machineId) => {
    setMachines((prev) =>
      prev.map((m) => {
        if (m.id === machineId) {
          const nextStatus = m.status === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE';
          return {
            ...m,
            status: nextStatus,
            currentWash: nextStatus === 'MAINTENANCE' ? null : m.currentWash,
          };
        }
        return m;
      })
    );
  };

  // Reset sample data
  const handleResetData = () => {
    sound.playClick();
    setMachines(INITIAL_MACHINES);
    setQueue(INITIAL_QUEUE);
    setHistory(INITIAL_HISTORY);
    setStudentDirectory(DEFAULT_STUDENT_DIRECTORY);
    localStorage.removeItem(STORAGE_KEY_MACHINES);
    localStorage.removeItem(STORAGE_KEY_QUEUE);
    localStorage.removeItem(STORAGE_KEY_HISTORY);
    localStorage.removeItem(STORAGE_KEY_DIRECTORY);
    setToast({
      type: 'info',
      title: 'Reset Completed',
      message: 'Washing machine schedule and student directory reset.',
    });
  };

  // Find booking for current slot window
  const currentSlotBooking = queue.find((q) => {
    const isToday = q.slotDate === todayStr || !q.slotDate;
    return isToday && q.slotId === currentActiveSlot.id && q.status !== 'cancelled';
  });

  const upcomingReservation = queue.find((q) => q.status !== 'cancelled');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col pb-24 sm:pb-16">
      {/* Header */}
      <Header
        machines={machines}
        queue={queue}
        adminUser={adminUser}
        onOpenAdmin={handleOpenAdminClick}
        onLogoutAdmin={handleAdminLogout}
        onOpenBooking={() => {
          setPreselectedMachineId('machine-1');
          setIsModalOpen(true);
        }}
        onOpenQRSticker={() => {
          setSelectedMachineForQR(machines[0] || INITIAL_MACHINES[0]);
          setIsQRStickerOpen(true);
        }}
        onOpenGuidelines={() => {
          sound.playClick();
          setIsGuidelinesOpen(true);
        }}
        onResetData={handleResetData}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        
        {/* Section 1: Washing Machine (Machine 1) with Live Slot Schedule */}
        <section className="space-y-2.5 sm:space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Washing Machine Status
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 max-w-2xl mx-auto">
            {machines.map((machine) => (
              <MachineCard
                key={machine.id}
                machine={machine}
                currentUser={null}
                currentActiveSlot={currentActiveSlot}
                currentSlotBooking={currentSlotBooking}
                upcomingReservation={upcomingReservation}
                onCollectClothes={handleCollectClothes}
                onToggleMaintenance={handleToggleMaintenance}
                onQuickBook={(machineId) => {
                  setPreselectedMachineId(machineId);
                  setIsModalOpen(true);
                }}
                onOpenQRScanner={(machineId) => {
                  setPreselectedMachineId(machineId);
                  setIsQRScannerOpen(true);
                }}
                onOpenQRSticker={(m) => {
                  setSelectedMachineForQR(m);
                  setIsQRStickerOpen(true);
                }}
              />
            ))}
          </div>
        </section>

        {/* Section 2: Scheduled 1h 30m Slot Roster */}
        <section>
          <QueueBoard
            queue={queue}
            machines={machines}
            currentUser={null}
            onCancelQueueItem={handleCancelQueueItem}
            onNotifyResident={handleNotifyResident}
            onOpenBooking={() => {
              setPreselectedMachineId('machine-1');
              setIsModalOpen(true);
            }}
          />
        </section>

        {/* Section 3: Laundry Analytics & Policies */}
        <section>
          <InsightsAndStats history={history} />
        </section>
      </main>

      {/* Mobile Floating Action Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg flex gap-2">
        <button
          onClick={() => {
            sound.playClick();
            setIsQRScannerOpen(true);
          }}
          className="flex-1 py-3 px-3 rounded-xl text-xs font-bold bg-slate-900 active:bg-slate-800 text-white transition-colors flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Camera className="w-4 h-4 text-blue-400" />
          <span>Scan Machine QR</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setPreselectedMachineId('machine-1');
            setIsModalOpen(true);
          }}
          className="flex-1 py-3 px-3 rounded-xl text-xs font-bold bg-blue-600 active:bg-blue-700 text-white transition-colors flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Book Slot</span>
        </button>
      </div>

      {/* 7-Day Slot Registration Modal (Normal Student Flow) */}
      <RegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleBookingSubmit}
        machines={machines}
        queue={queue}
        history={history}
        studentDirectory={studentDirectory}
        preselectedMachineId={preselectedMachineId}
        currentUser={null}
      />

      {/* Machine QR Code Scanner Dialog */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScanSuccess={handleQRScanSuccess}
        machines={machines}
        currentActiveSlot={currentActiveSlot}
        currentUser={null}
      />

      {/* Machine QR Sticker Printable View Modal */}
      <ViewQRCodeModal
        isOpen={isQRStickerOpen}
        onClose={() => setIsQRStickerOpen(false)}
        machine={selectedMachineForQR}
      />

      {/* Admin Phone Number + OTP Authentication Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onAdminLoginSuccess={handleAdminLoginSuccess}
        adminPhoneNumbers={ADMIN_PHONE_NUMBERS}
      />

      {/* Admin Dashboard & Student Usage Logs Modal */}
      <AdminDashboardModal
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        machines={machines}
        queue={queue}
        history={history}
        directory={studentDirectory}
        onResetStudentQuota={handleResetStudentQuota}
        onCancelQueueItem={handleCancelQueueItem}
        onToggleMaintenance={handleToggleMaintenance}
      />

      {/* Master Student Directory Modal (Managed inside Admin) */}
      <StudentDirectoryModal
        isOpen={isDirectoryModalOpen}
        onClose={() => setIsDirectoryModalOpen(false)}
        directory={studentDirectory}
        onUpdateDirectory={handleUpdateDirectory}
      />

      {/* Hostel Laundry Rules & Guidelines Modal (Do's & Don'ts Pop-up) */}
      <GuidelinesModal
        isOpen={isGuidelinesOpen}
        onClose={() => setIsGuidelinesOpen(false)}
        onAcknowledge={handleAcknowledgeGuidelines}
      />

      {/* Notification Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
