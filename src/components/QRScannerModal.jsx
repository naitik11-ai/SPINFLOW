import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  QrCode, 
  Camera, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { sound } from '../utils/audio';

export default function QRScannerModal({
  isOpen,
  onClose,
  onScanSuccess,
  machines = [],
  currentActiveSlot = null,
  nextSlot = null,
  currentUser = null
}) {
  const [cameraError, setCameraError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } else {
        setCameraError('Camera access not supported on this browser.');
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      setCameraError('Camera permission denied or camera not found. You can use the 1-Click Scan Simulator button below.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleSimulateScan = (machineId = 'machine-1') => {
    sound.playStart();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onScanSuccess(machineId, `SPINFLOW-${machineId.toUpperCase()}`);
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900">Scan Machine QR Code</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Active Slot Context Card */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-blue-900">Current Slot Window:</span>
              <span className="font-mono font-bold px-2 py-0.5 rounded bg-blue-600 text-white">
                {currentActiveSlot ? currentActiveSlot.label : '06:00 - 07:30'}
              </span>
            </div>
            <p className="text-[11px] text-blue-800 leading-tight">
              Scanning the QR code on the machine will immediately trigger the timer for the remaining duration of this slot.
            </p>
          </div>

          {/* Camera Viewfinder Box */}
          <div className="relative aspect-square max-h-56 sm:max-h-64 mx-auto rounded-xl bg-slate-900 overflow-hidden flex items-center justify-center border-2 border-slate-800 shadow-inner">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="p-4 text-center text-slate-400 space-y-2">
                <QrCode className="w-12 h-12 mx-auto text-slate-500 opacity-60" />
                <p className="text-xs text-slate-300">
                  {cameraError || 'Point your camera at the QR code on Washing Machine 1'}
                </p>
              </div>
            )}

            {/* Viewfinder Target Graphic */}
            <div className="absolute inset-8 border-2 border-blue-500/70 rounded-lg pointer-events-none flex items-center justify-center">
              <div className="w-full h-0.5 bg-blue-400/80 animate-pulse" />
            </div>
          </div>

          {/* 1-Click Scan Simulator Button */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleSimulateScan('machine-1')}
              className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <QrCode className="w-4 h-4" />
              <span>{isProcessing ? 'Verifying QR Code...' : 'Simulate Scan for Washing Machine 1'}</span>
            </button>
            <p className="text-[11px] text-center text-slate-500">
              Payload: <code className="font-mono font-bold text-slate-700">SPINFLOW-M1</code>
            </p>
          </div>

          {/* Hard Slot End-Time Explainer */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Strict Slot End-Time Boundary</span>
            </div>
            <p className="leading-relaxed">
              If you arrive 15 minutes late into your 90-minute window, your cycle will run for 1h 15m. All slots terminate at their exact scheduled boundary to ensure the next resident starts on time.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
