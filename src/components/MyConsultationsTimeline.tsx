import React, { useState, useEffect } from 'react';
import { ConsultationAppointment } from '../types';
import { 
  Calendar, 
  Clock, 
  Video, 
  Phone, 
  Building, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Bell, 
  BellRing, 
  Download, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Filter, 
  Sparkles, 
  UserCheck, 
  FileText,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { DEFAULT_APPOINTMENTS } from './LegalConsultationScheduler';
import { requestBrowserNotificationPermission, triggerBrowserNotification } from '../utils/notificationHelper';

interface MyConsultationsTimelineProps {
  onBookNew: (topic?: string) => void;
}

export const MyConsultationsTimeline: React.FC<MyConsultationsTimelineProps> = ({ onBookNew }) => {
  const [appointments, setAppointments] = useState<ConsultationAppointment[]>(() => {
    const saved = localStorage.getItem('adhikar_consultations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // Fallback
      }
    }
    return DEFAULT_APPOINTMENTS;
  });

  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [activeToast, setActiveToast] = useState<{ title: string; body: string } | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('adhikar_consultations', JSON.stringify(appointments));
  }, [appointments]);

  const handleUpdateReminder = (appId: string, minutes: number) => {
    if (minutes > 0) {
      requestBrowserNotificationPermission();
    }
    setAppointments((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, reminderMinutes: minutes, reminderSet: minutes > 0 } : app))
    );
  };

  const handleTestAlert = (app: ConsultationAppointment) => {
    requestBrowserNotificationPermission().then((perm) => {
      const title = `🔔 Test Alert: ${app.expertName}`;
      const body = `Reminder set for ${app.date} at ${app.timeSlot} (${app.reminderMinutes || 15}m before). Status: ${perm}`;
      triggerBrowserNotification(title, body);
      setActiveToast({ title, body });
      setTimeout(() => setActiveToast(null), 5000);
    });
  };

  const handleCancel = (id: string) => {
    if (window.confirm('Are you sure you want to cancel this legal consultation?')) {
      setAppointments((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: 'cancelled' } : app))
      );
    }
  };

  const handleExportICS = (app: ConsultationAppointment) => {
    const startDateFormatted = app.date.replace(/-/g, '');
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ADHIKAR Legal Consultation//EN',
      'BEGIN:VEVENT',
      `SUMMARY:Legal Consultation with ${app.expertName}`,
      `DESCRIPTION:Topic: ${app.topic}\\nMode: ${app.mode.toUpperCase()}\\nNotes: ${app.notes}`,
      `LOCATION:${app.mode === 'video' ? app.meetLink : 'ADHIKAR Legal Clinic'}`,
      `DTSTART:${startDateFormatted}T100000Z`,
      `DTEND:${startDateFormatted}T110000Z`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ADHIKAR_Consultation_${app.date}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Stats calculation
  const totalCount = appointments.length;
  const upcomingCount = appointments.filter((a) => a.status === 'confirmed').length;
  const completedCount = appointments.filter((a) => a.status === 'completed').length;
  const remindersActiveCount = appointments.filter((a) => a.status === 'confirmed' && (a.reminderMinutes || 0) > 0).length;

  // Filtered appointments
  const filteredAppointments = appointments.filter((a) => {
    if (activeFilter === 'upcoming') return a.status === 'confirmed';
    if (activeFilter === 'completed') return a.status === 'completed';
    if (activeFilter === 'cancelled') return a.status === 'cancelled';
    return true;
  });

  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
      {/* Toast alert feedback */}
      {activeToast && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-amber-400 animate-pulse" />
            <div>
              <span className="font-bold block">{activeToast.title}</span>
              <span className="text-[11px] text-amber-200/80">{activeToast.body}</span>
            </div>
          </div>
          <button onClick={() => setActiveToast(null)} className="text-amber-400 font-bold text-xs">✕</button>
        </div>
      )}

      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-indigo-400 bg-indigo-600/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-xl flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Women's Legal History
            </span>
            <span className="text-[11px] text-emerald-400 font-mono">Real-time Timeline</span>
          </div>
          <h3 className="text-xl font-bold text-white font-sans">My Consultations & Legal Timeline</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Track past and upcoming pro-bono legal consultations with advocates.
          </p>
        </div>

        <button
          onClick={() => onBookNew()}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-500/20 active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Book New Consultation</span>
        </button>
      </div>

      {/* Stat Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Total Sessions</span>
          <div className="text-xl font-bold text-white mt-1 font-mono">{totalCount}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
          <span className="text-[10px] font-bold text-emerald-400 uppercase">Upcoming</span>
          <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">{upcomingCount}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
          <span className="text-[10px] font-bold text-indigo-400 uppercase">Completed</span>
          <div className="text-xl font-bold text-indigo-400 mt-1 font-mono">{completedCount}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
          <span className="text-[10px] font-bold text-amber-400 uppercase">Active Reminders</span>
          <div className="text-xl font-bold text-amber-400 mt-1 font-mono">{remindersActiveCount}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 overflow-x-auto">
        <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0 mr-1">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>

        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeFilter === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          All ({totalCount})
        </button>

        <button
          onClick={() => setActiveFilter('upcoming')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeFilter === 'upcoming'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Upcoming ({upcomingCount})
        </button>

        <button
          onClick={() => setActiveFilter('completed')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeFilter === 'completed'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Completed ({completedCount})
        </button>

        <button
          onClick={() => setActiveFilter('cancelled')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeFilter === 'cancelled'
              ? 'bg-rose-600 text-white'
              : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Cancelled ({appointments.filter(a => a.status === 'cancelled').length})
        </button>
      </div>

      {/* Vertical Timeline View */}
      {filteredAppointments.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 space-y-2">
          <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-slate-300">No consultations in this filter</p>
          <p className="text-xs text-slate-500">Book a new consultation with legal advocates anytime.</p>
        </div>
      ) : (
        <div className="relative border-l-2 border-indigo-500/30 ml-3 md:ml-6 pl-5 md:pl-8 space-y-8 py-2">
          {filteredAppointments.map((app) => {
            const isConfirmed = app.status === 'confirmed';
            const isCompleted = app.status === 'completed';
            const isCancelled = app.status === 'cancelled';

            return (
              <div key={app.id} className="relative group">
                {/* Timeline Axis Node */}
                <div className={`absolute -left-[27px] md:-left-[39px] top-1.5 w-5 h-5 rounded-full flex items-center justify-center border-2 bg-slate-950 ${
                  isConfirmed 
                    ? 'border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/50' 
                    : isCompleted
                    ? 'border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-500/50'
                    : 'border-rose-500 text-rose-400'
                }`}>
                  {isConfirmed && <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {isCancelled && <XCircle className="w-3.5 h-3.5" />}
                </div>

                {/* Main Timeline Card */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/90 shadow-lg space-y-3 hover:border-slate-700 transition-all">
                  
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-xl">
                        📅 {app.date} at {app.timeSlot}
                      </span>

                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-xl uppercase tracking-wider ${
                        isConfirmed 
                          ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' 
                          : isCompleted
                          ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20'
                          : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                      }`}>
                        {app.status}
                      </span>

                      <span className="text-[10px] font-bold text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-xl uppercase font-mono">
                        {app.mode === 'video' ? '📹 Video Call' : app.mode === 'phone' ? '📞 Phone Call' : '🏢 Legal Clinic'}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-500 font-mono">
                      Ref ID: #{app.id.slice(-6)}
                    </span>
                  </div>

                  {/* Advocate & Subject Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{app.expertName}</h4>
                      <span className="text-[10px] font-medium text-indigo-400 bg-indigo-600/10 border border-indigo-500/20 px-2 py-0.5 rounded-lg">
                        {app.expertTitle}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-200 mt-0.5">{app.topic}</p>

                    {app.notes && (
                      <p className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60 italic mt-2">
                        "{app.notes}"
                      </p>
                    )}
                  </div>

                  {/* Reminder Alert Selector (if confirmed) */}
                  {isConfirmed && (
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-amber-500/20 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <BellRing className="w-4 h-4 text-amber-400" />
                        <div>
                          <span className="text-xs font-bold text-white block">Local Notification Reminder</span>
                          <span className="text-[10px] text-slate-400">Triggers browser notification chime before appointment</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={app.reminderMinutes || 0}
                          onChange={(e) => handleUpdateReminder(app.id, Number(e.target.value))}
                          className="bg-slate-950 border border-slate-700 text-xs font-bold text-amber-300 rounded-lg px-2.5 py-1 focus:outline-none focus:border-amber-500"
                        >
                          <option value={15}>🔔 15m before</option>
                          <option value={30}>🔔 30m before</option>
                          <option value={60}>🔔 1h before</option>
                          <option value={1440}>🔔 24h before</option>
                          <option value={0}>🔕 Off</option>
                        </select>

                        <button
                          onClick={() => handleTestAlert(app)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold hover:bg-amber-500/30 flex items-center gap-1"
                        >
                          <Bell className="w-3.5 h-3.5" /> Test Alert
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleExportICS(app)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Export .ics</span>
                      </button>

                      {isCompleted && (
                        <button
                          onClick={() => onBookNew(app.topic)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 text-xs font-bold flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Book Follow-up</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {app.mode === 'video' && app.meetLink && isConfirmed && (
                        <a
                          href={app.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Video Room</span>
                        </a>
                      )}

                      {isConfirmed && (
                        <button
                          onClick={() => handleCancel(app.id)}
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400"
                          title="Cancel Consultation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
