import React, { useState, useEffect } from 'react';
import { 
  X, 
  Phone, 
  User, 
  Home, 
  KeyRound, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  Building2
} from 'lucide-react';
import { sound } from '../utils/audio';
import { verifyStudentIdentity } from '../utils/helpers';
import { DEFAULT_STUDENT_DIRECTORY } from '../utils/constants';

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  currentUser,
  studentDirectory = DEFAULT_STUDENT_DIRECTORY
}) {
  const [step, setStep] = useState(1); // 1: Info & Phone, 2: OTP
  const [formData, setFormData] = useState({
    name: '',
    roomNo: '',
    phone: '',
    rememberMe: true,
  });
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const [errors, setErrors] = useState({});
  const [verifiedStudent, setVerifiedStudent] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setOtp('');
      setErrors({});
      setVerifiedStudent(null);
      if (currentUser) {
        setFormData({
          name: currentUser.name || '',
          roomNo: currentUser.roomNo ? currentUser.roomNo.replace(/[^0-9a-zA-Z]/g, '') : '',
          phone: currentUser.phone || '',
          rememberMe: true,
        });
      }
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    let interval = null;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isOpen) return null;

  const validateStep1 = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Please enter your full name';
    if (!formData.roomNo.trim()) errs.roomNo = 'Please enter your room number';
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      errs.phone = 'Please enter a valid 10-digit mobile number';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return false;
    }

    // STRICT 3-WAY VERIFICATION against Master Hostel Directory
    const verification = verifyStudentIdentity(
      formData.name,
      formData.roomNo,
      formData.phone,
      studentDirectory
    );

    if (!verification.isValid) {
      if (verification.errorType === 'ROOM_MISMATCH') {
        errs.roomNo = verification.message;
      } else if (verification.errorType === 'NAME_MISMATCH') {
        errs.name = verification.message;
      } else {
        errs.phone = verification.message;
      }
      errs.global = verification.message;
      setErrors(errs);
      return false;
    }

    setVerifiedStudent(verification.student);
    setErrors({});
    return true;
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!validateStep1()) return;

    sound.playClick();
    // Generate a realistic 4-digit OTP
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setTimer(30);
    setStep(2);
    setOtp(code); // Pre-fill for seamless demo testing
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!otp || otp.trim().length !== 4) {
      setErrors({ otp: 'Please enter the 4-digit OTP' });
      return;
    }

    if (otp !== generatedOtp && otp !== '1234') {
      setErrors({ otp: 'Invalid OTP code. Please try again or use the demo code.' });
      return;
    }

    sound.playStart();
    const finalStudent = verifiedStudent || {
      name: formData.name.trim(),
      roomNo: formData.roomNo.trim(),
      phone: formData.phone.trim(),
    };

    const verifiedUser = {
      id: `user-${finalStudent.phone.replace(/\D/g, '')}`,
      name: finalStudent.name,
      roomNo: `Room ${finalStudent.roomNo.replace(/[^0-9a-zA-Z]/g, '')}`,
      rawRoomNo: finalStudent.roomNo,
      phone: finalStudent.phone,
      loggedInAt: Date.now(),
    };

    onLoginSuccess(verifiedUser, formData.rememberMe);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {step === 1 ? 'Resident Phone Login' : 'Verify Mobile OTP'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {step === 1 ? '3-Way Verified against Hostel Directory' : `SMS sent to ${formData.phone}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6">
          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              {/* Verification Info Note */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>3-Way Identity Verification</span>
                </div>
                <p className="text-[11px] text-blue-800 leading-tight">
                  Your <strong>Name</strong>, <strong>Room Number</strong>, and <strong>Phone Number</strong> must match the registered hostel master directory.
                </p>
              </div>

              {errors.global && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Identity Verification Failed</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">{errors.global}</p>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name (as registered) *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Harsh or Alex Chen"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
              </div>

              {/* Room Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hostel Room Number (e.g. 101) *
                </label>
                <div className="relative">
                  <Home className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 101"
                    value={formData.roomNo}
                    onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                {errors.roomNo && <p className="text-[11px] text-rose-600 mt-1">{errors.roomNo}</p>}
              </div>

              {/* Mobile Phone Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Registered Mobile Number (10 digits) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>
                {errors.phone && <p className="text-[11px] text-rose-600 mt-1">{errors.phone}</p>}
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <label htmlFor="rememberMe" className="text-xs text-slate-600 select-none">
                  Remember my login on this device
                </label>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                className="w-full py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Verify Identity & Send OTP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {/* Verified Identity Pill */}
              {verifiedStudent && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-950 block">
                      {verifiedStudent.name}
                    </span>
                    <span className="text-[11px] text-emerald-800 font-mono">
                      Room {verifiedStudent.roomNo} · {verifiedStudent.phone}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white">
                    Verified
                  </span>
                </div>
              )}

              {/* OTP Hint Banner */}
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                    Demo OTP Code
                  </span>
                  <span className="font-mono text-base font-bold text-blue-950">
                    {generatedOtp}
                  </span>
                </div>
                <span className="text-[11px] text-blue-800 bg-white px-2 py-1 rounded border border-blue-200 font-medium">
                  Auto-filled for testing
                </span>
              </div>

              {/* OTP Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enter 4-Digit OTP
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="4-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-center text-lg sm:text-xl font-mono tracking-widest text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                </div>
                {errors.otp && <p className="text-[11px] text-rose-600 mt-1">{errors.otp}</p>}
              </div>

              {/* Resend Timer & Edit Phone */}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-blue-600 hover:underline"
                >
                  Change details
                </button>
                {timer > 0 ? (
                  <span>Resend in {timer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const newCode = Math.floor(1000 + Math.random() * 9000).toString();
                      setGeneratedOtp(newCode);
                      setOtp(newCode);
                      setTimer(30);
                    }}
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Resend OTP
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <button
                type="submit"
                className="w-full py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify & Log In</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
