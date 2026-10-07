import { 
  Volume2, 
  VolumeX, 
  Plus, 
  Layers, 
  LogOut, 
  QrCode, 
  Clock, 
  BarChart3,
  Lock,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { sound } from '../utils/audio';

export default function Header({
  machines = [],
  onOpenBooking,
  onOpenQRSticker,
  onOpenGuidelines,
  adminUser = null,
  onOpenAdmin,
  onLogoutAdmin
}) {
  const [isMuted, setIsMuted] = useState(false);

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
    if (!next) sound.playClick();
  };

  const activeWashers = machines.filter((m) => m.status === 'RUNNING').length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs shrink-0">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 tracking-tight">
                  SpinFlow
                </h1>
                <span className="text-[10px] sm:text-[11px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  Washing Machine 1
                </span>
              </div>
            </div>
          </div>

          {/* Schedule Summary (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-medium">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Operating: 6:00 AM – 12:00 AM (12 Slots)</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              <span className={`w-2 h-2 rounded-full ${activeWashers > 0 ? 'bg-blue-600 animate-pulse' : 'bg-emerald-600'}`} />
              <span>{activeWashers > 0 ? 'Unit in Use' : 'Unit Available'}</span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Admin Portal Button */}
            {adminUser ? (
              <div className="flex items-center bg-slate-900 text-white rounded-lg p-0.5 sm:p-1 text-xs">
                <button
                  onClick={() => {
                    sound.playClick();
                    onOpenAdmin();
                  }}
                  className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1 text-white font-bold hover:text-blue-300 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] sm:text-xs">Admin</span>
                </button>
                <button
                  onClick={onLogoutAdmin}
                  title="Logout Admin"
                  className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenAdmin();
                }}
                title="Admin Dashboard (Requires Admin Phone + OTP)"
                className="py-1.5 px-2 sm:px-2.5 rounded-lg text-[11px] sm:text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors flex items-center gap-1 sm:gap-1.5 shrink-0"
              >
                <Lock className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden xs:inline">Admin</span>
                <span className="hidden sm:inline">Login</span>
              </button>
            )}

            {/* View Machine QR Sticker */}
            <button
              onClick={() => {
                sound.playClick();
                onOpenQRSticker();
              }}
              title="View Machine 1 QR Sticker (Printable)"
              className="py-1.5 px-2 sm:px-2.5 rounded-lg text-[11px] sm:text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1 sm:gap-1.5 shrink-0"
            >
              <QrCode className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">QR Sticker</span>
            </button>

            {/* View Laundry Guidelines / Rules */}
            <button
              onClick={() => {
                sound.playClick();
                onOpenGuidelines();
              }}
              title="Hostel Laundry Guidelines & Rules (Do's and Don'ts)"
              className="py-1.5 px-2 sm:px-2.5 rounded-lg text-[11px] sm:text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 transition-colors flex items-center gap-1 sm:gap-1.5 shrink-0"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Rules</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={handleToggleMute}
              title={isMuted ? 'Unmute' : 'Mute'}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shrink-0"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>

            {/* Book Slot CTA */}
            <button
              onClick={() => {
                sound.playClick();
                onOpenBooking();
              }}
              className="py-1.5 sm:py-2 px-2.5 sm:px-3.5 rounded-lg text-[11px] sm:text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1 shadow-sm shrink-0"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Book<span className="hidden sm:inline"> Slot</span></span>
            </button>
          </div>
        </div>

        {/* Mobile Metrics Strip */}
        <div className="md:hidden flex items-center justify-between gap-1.5 pb-2.5 overflow-x-auto text-[11px] font-medium no-scrollbar">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
            <Clock className="w-3 h-3 text-blue-600" />
            <span>6 AM – 12 AM (12 Slots)</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 shrink-0">
            <span className={`w-1.5 h-1.5 rounded-full ${activeWashers > 0 ? 'bg-blue-600 animate-pulse' : 'bg-emerald-600'}`} />
            <span>{activeWashers > 0 ? 'Unit In Use' : 'Unit Free'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
