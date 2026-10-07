import React from 'react';
import { AlertTriangle, Bell, CheckCheck } from 'lucide-react';
import { formatRelativeTime } from '../utils/helpers';
import { sound } from '../utils/audio';

export default function UnclaimedAlertBanner({ 
  unclaimedMachines = [], 
  onCollectClothes, 
  onNotifyResident 
}) {
  if (unclaimedMachines.length === 0) return null;

  return (
    <div className="space-y-2.5">
      {unclaimedMachines.map((m) => {
        const wash = m.currentWash;
        return (
          <div
            key={m.id}
            className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
          >
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-amber-900">
                    {m.name} Finished
                  </h4>
                  <span className="text-[11px] text-amber-700 font-medium">
                    · Finished {formatRelativeTime(m.unclaimedSince || (Date.now() - 5 * 60 * 1000))}
                  </span>
                </div>
                <p className="text-xs text-amber-800 mt-0.5">
                  Clothes belong to <strong className="font-semibold">{wash?.userName || 'Resident'}</strong> (Room {wash?.roomNo || 'N/A'}, {wash?.clothesCount || 0} items). Please collect to free up the machine.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  sound.playNextAlert();
                  onNotifyResident(wash);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-amber-100/50 text-amber-800 border border-amber-300 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Send Reminder</span>
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  onCollectClothes(m.id);
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Mark Collected</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
