import React, { useState, useRef } from 'react';
import { 
  X, 
  Users, 
  Search, 
  Upload, 
  Download, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  FileText,
  Building2,
  Phone,
  UserCheck
} from 'lucide-react';
import { sound } from '../utils/audio';

export default function StudentDirectoryModal({
  isOpen,
  onClose,
  directory = [],
  onUpdateDirectory,
  onSelectStudent
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('all');
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const filteredStudents = directory.filter((std) => {
    const matchesSearch = 
      std.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      std.roomNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      std.phone.includes(searchTerm);

    const matchesFloor = 
      selectedFloor === 'all' || 
      std.floor === selectedFloor || 
      (selectedFloor === '1st Floor' && Number(std.roomNo) >= 100 && Number(std.roomNo) < 200) ||
      (selectedFloor === '2nd Floor' && Number(std.roomNo) >= 200 && Number(std.roomNo) < 300) ||
      (selectedFloor === '3rd Floor' && Number(std.roomNo) >= 300 && Number(std.roomNo) < 400);

    return matchesSearch && matchesFloor;
  });

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        parseAndApplyCSV(content);
      }
    };
    reader.readAsText(file);
  };

  const parseAndApplyCSV = (csvContent) => {
    try {
      setImportError('');
      const lines = csvContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
      const parsed = [];

      // Check header or data
      const startIndex = lines[0].toLowerCase().includes('name') ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.trim());
        if (parts.length >= 3) {
          const name = parts[0];
          const roomNo = parts[1].replace(/[^0-9a-zA-Z]/g, '');
          const phone = parts[2].replace(/\D/g, '');
          
          if (name && roomNo && phone) {
            const roomNum = parseInt(roomNo, 10);
            let floor = '1st Floor';
            if (roomNum >= 200 && roomNum < 300) floor = '2nd Floor';
            else if (roomNum >= 300) floor = '3rd Floor';

            parsed.push({
              id: `std-custom-${parsed.length + 1}`,
              name,
              roomNo,
              phone,
              floor,
            });
          }
        }
      }

      if (parsed.length === 0) {
        setImportError('No valid student rows found. Expected format: Name, Room, Phone (e.g. Harsh, 101, 9876543210)');
        return;
      }

      onUpdateDirectory(parsed);
      setShowImport(false);
      sound.playStart();
    } catch (err) {
      setImportError('Error parsing file. Please verify CSV format.');
    }
  };

  const handleExportCSV = () => {
    const header = 'Name,Room Number,Phone Number,Floor\n';
    const rows = directory.map((s) => `"${s.name}","${s.roomNo}","${s.phone}","${s.floor || ''}"`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `hostel_student_directory_${directory.length}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Hostel Master Student Directory
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  {directory.length} Registered
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Official database for strict 3-way identity verification (Name + Room + Phone)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Directory Controls */}
        <div className="p-4 sm:px-6 border-b border-slate-100 bg-white space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, room (e.g. 101), or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Floor Filter */}
            <div className="flex items-center gap-2">
              <select
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Floors</option>
                <option value="1st Floor">1st Floor (Rooms 101-135)</option>
                <option value="2nd Floor">2nd Floor (Rooms 201-235)</option>
                <option value="3rd Floor">3rd Floor (Rooms 301-335)</option>
              </select>

              {/* Upload CSV Toggle */}
              <button
                onClick={() => setShowImport(!showImport)}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Upload CSV</span>
              </button>

              {/* Export CSV */}
              <button
                onClick={handleExportCSV}
                title="Download Master Directory CSV"
                className="p-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Collapsible CSV Upload / Paste Drawer */}
          {showImport && (
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Upload / Paste Master Student List</span>
                </span>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1 bg-white border border-blue-300 rounded-lg text-xs font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
                >
                  Choose CSV File
                </button>
              </div>

              <textarea
                rows={3}
                placeholder="Or paste CSV rows here: Name, Room, Phone (e.g. Harsh, 101, 9876543210)"
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className="w-full bg-white border border-blue-200 rounded-lg p-2.5 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
              />

              {importError && (
                <p className="text-[11px] text-rose-600 font-medium">{importError}</p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowImport(false)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => parseAndApplyCSV(importText)}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs"
                >
                  Import Master List
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Students Table / Grid */}
        <div className="p-4 sm:px-6 overflow-y-auto flex-1 divide-y divide-slate-100">
          {filteredStudents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {filteredStudents.map((std) => (
                <div
                  key={std.id}
                  className="p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/20 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {std.name}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                        Room {std.roomNo}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 mt-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{std.phone}</span>
                    </div>
                  </div>

                  {onSelectStudent && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => {
                          sound.playClick();
                          onSelectStudent(std);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors flex items-center gap-1"
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>Login as {std.name.split(' ')[0]}</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              No students found matching &quot;{searchTerm}&quot;.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-500">
            Showing <strong>{filteredStudents.length}</strong> of {directory.length} hostel students
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
