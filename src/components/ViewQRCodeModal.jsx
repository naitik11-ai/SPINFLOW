import React from 'react';
import { X, Printer, QrCode, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function ViewQRCodeModal({ isOpen, onClose, machine }) {
  if (!isOpen || !machine) return null;

  const qrPayload = machine.qrCodePayload || `SPINFLOW-${machine.id.toUpperCase()}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900">Machine QR Code Sticker</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Sticker Content */}
        <div className="p-6 text-center space-y-5" id="printable-qr-sticker">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              Hostel Laundry Management
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-2">{machine.name}</h3>
            <p className="text-xs text-slate-500 font-medium">
              Operating Hours: Daily 6:00 AM – 12:00 AM Midnight (12 Fixed Slots)
            </p>
          </div>

          {/* High-Resolution QR Code */}
          <div className="inline-flex p-4 bg-white border-2 border-slate-900 rounded-2xl shadow-sm">
            <QRCodeSVG
              value={qrPayload}
              size={180}
              level="H"
              includeMargin={false}
            />
          </div>

          <div className="space-y-1">
            <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
              Payload: {qrPayload}
            </span>
            <p className="text-[11px] text-slate-500 pt-1">
              Stick this QR code on the front panel of {machine.name}.
            </p>
          </div>

          {/* Usage Steps */}
          <div className="text-left bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
            <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
              How Residents Use This:
            </p>
            <div className="space-y-1.5 text-slate-600 text-[11px]">
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <span>Book your 1h 30m slot on the hostel website.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <span>Arrive at the machine during your reserved time window.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <span>Click &quot;Scan Machine QR&quot; on your phone to start the timer.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Sticker</span>
          </button>
        </div>
      </div>
    </div>
  );
}
