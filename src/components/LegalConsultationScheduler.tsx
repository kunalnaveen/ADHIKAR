import React, { useState, useEffect } from 'react';
import { LegalExpert, ConsultationAppointment, AppSettings } from '../types';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Video, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  Star, 
  Sparkles, 
  Download, 
  Plus, 
  Trash2, 
  ExternalLink, 
  MessageSquare, 
  Building,
  CalendarCheck,
  Check,
  Bell,
  BellRing,
  BellOff,
  Volume2,
  AlertCircle
} from 'lucide-react';
import { 
  requestBrowserNotificationPermission, 
  triggerBrowserNotification 
} from '../utils/notificationHelper';

interface LegalConsultationSchedulerProps {
  settings: AppSettings;
  onClose?: () => void;
  defaultTopic?: string;
}

export const DEFAULT_APPOINTMENTS: ConsultationAppointment[] = [
  {
    id: 'app-demo-1',
    expertId: 'exp-1',
    expertName: 'Adv. Meenakshi Sharma',
    expertTitle: 'Senior Counsel, Supreme Court of India',
    date: '2026-08-16',
    timeSlot: '11:00 AM',
    mode: 'video',
    topic: "Daughter's Equal Coparcenary Right (Section 6 HSA)",
    notes: 'Discussion regarding ancestral farm property inheritance in Punjab.',
    status: 'confirmed',
    meetLink: 'https://meet.adhikar.legal/room-ms-8821',
    createdAt: '2026-08-12',
    reminderMinutes: 15,
    reminderSet: true
  },
  {
    id: 'app-demo-2',
    expertId: 'exp-2',
    expertName: 'Adv. Ananya Deshmukh',
    expertTitle: 'Family Law Advocate, Bombay High Court',
    date: '2026-08-22',
    timeSlot: '02:00 PM',
    mode: 'video',
    topic: "Widow's Absolute Inheritance & Residence Right",
    notes: 'Consultation on Class I inheritance priority under Section 14 HSA regarding residential apartment.',
    status: 'confirmed',
    meetLink: 'https://meet.adhikar.legal/room-ad-3912',
    createdAt: '2026-08-10',
    reminderMinutes: 30,
    reminderSet: true
  },
  {
    id: 'app-demo-3',
    expertId: 'exp-3',
    expertName: 'Adv. Sunita Rao',
    expertTitle: 'Succession & Estate Planning Specialist',
    date: '2026-08-02',
    timeSlot: '03:30 PM',
    mode: 'phone',
    topic: 'Stridhan Recovery & Jewelry Claim',
    notes: 'Completed review of Stridhan inventory list and formal demand notice drafted for gold ornaments recovery.',
    status: 'completed',
    createdAt: '2026-07-28',
    reminderMinutes: 0,
    reminderSet: false
  }
];

export const LEGAL_EXPERTS: LegalExpert[] = [
  {
    id: 'exp-1',
    name: 'Adv. Meenakshi Sharma',
    title: 'Senior Counsel, Supreme Court of India',
    specialty: 'Hindu Succession Act & Coparcenary Share Division',
    experienceYears: 18,
    rating: 4.9,
    totalConsultations: 1240,
    languages: ['English', 'Hindi', 'Punjabi'],
    location: 'New Delhi / Online',
    availableModes: ['video', 'phone', 'in_person'],
    avatarBg: 'bg-indigo-600'
  },
  {
    id: 'exp-2',
    name: 'Adv. Ananya Deshmukh',
    title: 'Family Law Advocate, Bombay High Court',
    specialty: 'Women\'s Property Rights, Stridhan & Partition Suits',
    experienceYears: 14,
    rating: 4.8,
    totalConsultations: 980,
    languages: ['English', 'Hindi', 'Marathi'],
    location: 'Mumbai / Online',
    availableModes: ['video', 'phone'],
    avatarBg: 'bg-emerald-600'
  },
  {
    id: 'exp-3',
    name: 'Adv. Sunita Rao',
    title: 'Succession & Estate Planning Specialist',
    specialty: 'Wills, Succession Certificates & Probate Disputes',
    experienceYears: 16,
    rating: 4.9,
    totalConsultations: 1120,
    languages: ['English', 'Hindi', 'Telugu', 'Kannada'],
    location: 'Bengaluru / Online',
    availableModes: ['video', 'phone', 'in_person'],
    avatarBg: 'bg-amber-600'
  },
  {
    id: 'exp-4',
    name: 'Adv. Priyanka Verma',
    title: 'Senior Legal Aid Fellow, High Court',
    specialty: 'Widow Rights, Residence Claims & Senior Maintenance',
    experienceYears: 11,
    rating: 4.7,
    totalConsultations: 750,
    languages: ['English', 'Hindi', 'Bengali'],
    location: 'Kolkata / Online',
    availableModes: ['video', 'phone'],
    avatarBg: 'bg-rose-600'
  }
];

const AVAILABLE_TIME_SLOTS = [
  '09:30 AM',
  '11:00 AM',
  '02:00 PM',
  '03:30 PM',
  '05:00 PM',
  '06:30 PM'
];

const CONSULTATION_TOPICS = [
  'Daughter\'s Equal Coparcenary Right (Section 6 HSA)',
  'Widow\'s Absolute Inheritance & Residence Right',
  'Stridhan Recovery & Jewelry Claim',
  'Partition Suit & Family Property Division',
  'Contesting an Unfair / Coerced Will',
  'Senior Mother Maintenance & Protection',
  'Other Women\'s Property Rights Query'
];

export const LegalConsultationScheduler: React.FC<LegalConsultationSchedulerProps> = ({ 
  settings, 
  onClose,
  defaultTopic 
}) => {
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

  const [activeTab, setActiveTab] = useState<'book' | 'my_bookings'>('book');
  const [selectedExpert, setSelectedExpert] = useState<LegalExpert>(LEGAL_EXPERTS[0]);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(AVAILABLE_TIME_SLOTS[1]);
  const [consultationMode, setConsultationMode] = useState<'video' | 'phone' | 'in_person'>('video');
  const [topic, setTopic] = useState<string>(defaultTopic || CONSULTATION_TOPICS[0]);
  const [caseNotes, setCaseNotes] = useState<string>('');
  const [bookingReminderMinutes, setBookingReminderMinutes] = useState<number>(15);
  const [isBookingSuccess, setIsBookingSuccess] = useState<boolean>(false);
  const [latestBooking, setLatestBooking] = useState<ConsultationAppointment | null>(null);

  // Active Toast Alert Banner state
  const [activeToastAlert, setActiveToastAlert] = useState<{ title: string; body: string; meetLink?: string } | null>(null);

  // Calendar month state
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date(2026, 7, 1)); // Aug 2026

  useEffect(() => {
    localStorage.setItem('adhikar_consultations', JSON.stringify(appointments));
  }, [appointments]);

  // Check and trigger local notifications
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date().getTime();
      let triggered: Record<string, boolean> = {};
      try {
        triggered = JSON.parse(localStorage.getItem('adhikar_triggered_reminders') || '{}');
      } catch (e) {
        triggered = {};
      }

      appointments.forEach((app) => {
        if (app.status === 'confirmed' && app.reminderMinutes && app.reminderMinutes > 0) {
          if (triggered[app.id]) return;

          const dateTimeStr = `${app.date} ${app.timeSlot}`;
          const appTime = new Date(dateTimeStr).getTime();

          if (!isNaN(appTime)) {
            const reminderTime = appTime - (app.reminderMinutes * 60 * 1000);
            if (now >= reminderTime && now < appTime + (2 * 60 * 60 * 1000)) {
              triggered[app.id] = true;
              localStorage.setItem('adhikar_triggered_reminders', JSON.stringify(triggered));

              const title = `🚨 Legal Consultation Reminder`;
              const body = `Your appointment with ${app.expertName} (${app.topic}) starts in ${app.reminderMinutes} minutes!`;

              triggerBrowserNotification(title, body);
              setActiveToastAlert({ title, body, meetLink: app.meetLink });
            }
          }
        }
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 12000);
    return () => clearInterval(interval);
  }, [appointments]);

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfWeek = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendarDays = () => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const totalDays = getDaysInMonth(year, month);
    const startDay = getFirstDayOfWeek(year, month);

    const todayStr = new Date().toISOString().split('T')[0];
    const days = [];

    // Empty cells for previous month padding
    for (let i = 0; i < startDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-10 w-full rounded-xl opacity-20 bg-slate-950 pointer-events-none" />
      );
    }

    // Days of current month
    for (let d = 1; d <= totalDays; d++) {
      const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isPast = dayStr < todayStr;
      const isSelected = selectedDate === dayStr;

      days.push(
        <button
          key={dayStr}
          disabled={isPast}
          onClick={() => setSelectedDate(dayStr)}
          className={`h-10 w-full rounded-xl font-medium text-xs flex flex-col items-center justify-center transition-all ${
            isSelected
              ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/30 scale-105'
              : isPast
              ? 'text-slate-600 opacity-40 cursor-not-allowed'
              : 'bg-slate-950 text-slate-200 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <span>{d}</span>
        </button>
      );
    }

    return days;
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (bookingReminderMinutes > 0) {
      requestBrowserNotificationPermission();
    }

    const newAppointment: ConsultationAppointment = {
      id: `app-${Date.now()}`,
      expertId: selectedExpert.id,
      expertName: selectedExpert.name,
      expertTitle: selectedExpert.title,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      mode: consultationMode,
      topic: topic,
      notes: caseNotes.trim() || 'No specific notes added.',
      status: 'confirmed',
      meetLink: `https://meet.adhikar.legal/room-${selectedExpert.id.replace('exp-', '')}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString().split('T')[0],
      reminderMinutes: bookingReminderMinutes,
      reminderSet: bookingReminderMinutes > 0
    };

    setAppointments((prev) => [newAppointment, ...prev]);
    setLatestBooking(newAppointment);
    setIsBookingSuccess(true);
  };

  const handleCancelAppointment = (id: string) => {
    if (window.confirm('Are you sure you want to cancel this legal consultation?')) {
      setAppointments((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: 'cancelled' } : app))
      );
    }
  };

  const handleUpdateReminder = (appId: string, minutes: number) => {
    if (minutes > 0) {
      requestBrowserNotificationPermission();
    }
    setAppointments((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, reminderMinutes: minutes, reminderSet: minutes > 0 } : a))
    );
  };

  const handleTestNotification = (app: ConsultationAppointment) => {
    requestBrowserNotificationPermission().then((perm) => {
      const title = `🔔 Test Alert: Consultation Reminder`;
      const body = `Alert set for ${app.expertName} on ${app.date} at ${app.timeSlot} (${app.reminderMinutes || 15}m before). System status: ${perm}`;
      triggerBrowserNotification(title, body);
      setActiveToastAlert({ title, body, meetLink: app.meetLink });
    });
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

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Active Toast Notification Banner if fired or tested */}
      {activeToastAlert && (
        <div className="p-4 rounded-2xl bg-indigo-950/90 border border-indigo-500/50 shadow-2xl flex items-start justify-between gap-4 animate-bounce-short">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <BellRing className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white font-sans">{activeToastAlert.title}</h5>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{activeToastAlert.body}</p>
              {activeToastAlert.meetLink && (
                <a
                  href={activeToastAlert.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 underline mt-1.5"
                >
                  <Video className="w-3.5 h-3.5" /> Join Consultation Video Call →
                </a>
              )}
            </div>
          </div>
          <button
            onClick={() => setActiveToastAlert(null)}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="relative p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-indigo-400 bg-indigo-600/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-xl inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Women's Rights Legal Helpline
                </span>
                <span className="text-[11px] text-emerald-400 font-mono hidden sm:inline-block">Free Pro Bono Legal Aid</span>
              </div>
              <h3 className="text-xl font-bold text-white font-sans">Legal Expert Consultation Scheduler</h3>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed max-w-xl">
                Book confidential, direct consultations with High Court & Supreme Court advocates with automated local reminder alerts.
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={() => { setActiveTab('book'); setIsBookingSuccess(false); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'book'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Schedule New Meeting</span>
          </button>

          <button
            onClick={() => setActiveTab('my_bookings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'my_bookings'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <CalendarIcon className="w-4 h-4 text-indigo-400" />
            <span>Your Bookings ({appointments.filter(a => a.status === 'confirmed').length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'book' ? (
        isBookingSuccess && latestBooking ? (
          /* Confirmation Success Modal Card */
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col items-center text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl">
                Consultation Confirmed
              </span>
              <h3 className="text-2xl font-bold text-white font-sans mt-3">Legal Consultation Successfully Scheduled!</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Your appointment with <strong className="text-white">{latestBooking.expertName}</strong> has been registered. Local browser reminder alert set for {latestBooking.reminderMinutes || 15} mins before start time.
              </p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 w-full max-w-md text-left space-y-3">
              <div className="flex justify-between items-center text-xs border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Date & Time:</span>
                <span className="font-bold text-white font-mono">{latestBooking.date} at {latestBooking.timeSlot}</span>
              </div>

              <div className="flex justify-between items-center text-xs border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Consultant:</span>
                <span className="font-bold text-indigo-400">{latestBooking.expertName}</span>
              </div>

              <div className="flex justify-between items-center text-xs border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Consultation Mode:</span>
                <span className="font-bold text-emerald-400 uppercase font-mono">{latestBooking.mode} Call</span>
              </div>

              <div className="flex justify-between items-center text-xs border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Reminder Alert:</span>
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  <BellRing className="w-3.5 h-3.5" /> {latestBooking.reminderMinutes ? `${latestBooking.reminderMinutes} mins before` : 'Off'}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Case Topic:</span>
                <span className="font-medium text-slate-200 truncate max-w-[200px]">{latestBooking.topic}</span>
              </div>

              {latestBooking.mode === 'video' && latestBooking.meetLink && (
                <div className="mt-3 p-3 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-xs">
                  <span className="text-indigo-400 font-bold block mb-1">Encrypted Video Conference Room:</span>
                  <a 
                    href={latestBooking.meetLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-indigo-300 underline font-mono text-[11px] break-all flex items-center gap-1"
                  >
                    {latestBooking.meetLink} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => handleTestNotification(latestBooking)}
                className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-xs flex items-center gap-2 hover:bg-amber-500/20"
              >
                <Bell className="w-4 h-4" />
                <span>Test Alert Notification</span>
              </button>

              <button
                onClick={() => handleExportICS(latestBooking)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                <Download className="w-4 h-4" />
                <span>Export to Calendar (.ics)</span>
              </button>

              <button
                onClick={() => setActiveTab('my_bookings')}
                className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 flex items-center gap-2"
              >
                <span>View My Bookings</span>
              </button>
            </div>
          </div>
        ) : (
          /* Main Scheduler Booking Interface */
          <form onSubmit={handleConfirmBooking} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Step 1: Select Legal Expert (Col 1) */}
            <div className="lg:col-span-1 flex flex-col gap-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-400" />
                <span>1. Select Legal Advocate</span>
              </h4>

              <div className="space-y-3">
                {LEGAL_EXPERTS.map((exp) => {
                  const isSelected = selectedExpert.id === exp.id;
                  return (
                    <div
                      key={exp.id}
                      onClick={() => setSelectedExpert(exp)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 border-indigo-500 shadow-md shadow-indigo-500/10'
                          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl ${exp.avatarBg} text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-md`}>
                          {exp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h5 className="text-xs font-bold text-white truncate">{exp.name}</h5>
                            <span className="text-[10px] font-bold text-amber-400 flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-amber-400" /> {exp.rating}
                            </span>
                          </div>

                          <p className="text-[11px] text-indigo-400 font-medium truncate">{exp.title}</p>
                          <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{exp.specialty}</p>

                          <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500 font-mono">
                            <span>{exp.experienceYears} Yrs Exp</span>
                            <span>•</span>
                            <span>{exp.totalConsultations}+ Cases</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Calendar & Time Slot Picker (Col 2) */}
            <div className="lg:col-span-1 flex flex-col gap-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-emerald-400" />
                <span>2. Select Date & Time Slot</span>
              </h4>

              {/* Calendar Control Header */}
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="text-xs font-bold text-white font-mono">
                    {monthNames[currentMonthDate.getMonth()]} {currentMonthDate.getFullYear()}
                  </span>

                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Days Header */}
                <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-500 uppercase">
                  <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                </div>

                {/* Calendar Days Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {renderCalendarDays()}
                </div>
              </div>

              {/* Time Slot Selector */}
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" /> Available Time Slots
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTimeSlot(slot)}
                      className={`p-2.5 rounded-xl text-xs font-bold transition-all ${
                        selectedTimeSlot === slot
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                          : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 3: Consultation Details & Confirmation (Col 3) */}
            <div className="lg:col-span-1 flex flex-col gap-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span>3. Case Topic & Reminder Alert</span>
              </h4>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-4">
                {/* Consultation Mode Buttons */}
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1.5">Consultation Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setConsultationMode('video')}
                      className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                        consultationMode === 'video'
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <Video className="w-4 h-4" />
                      <span>Video Call</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConsultationMode('phone')}
                      className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                        consultationMode === 'phone'
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <Phone className="w-4 h-4" />
                      <span>Phone Call</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConsultationMode('in_person')}
                      className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                        consultationMode === 'in_person'
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <Building className="w-4 h-4" />
                      <span>Legal Clinic</span>
                    </button>
                  </div>
                </div>

                {/* Topic Select */}
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Primary Legal Subject</label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {CONSULTATION_TOPICS.map((top, idx) => (
                      <option key={idx} value={top}>{top}</option>
                    ))}
                  </select>
                </div>

                {/* Local Notification Reminder Dropdown */}
                <div>
                  <label className="text-xs font-bold text-slate-400 flex items-center justify-between mb-1">
                    <span className="flex items-center gap-1 text-amber-400">
                      <BellRing className="w-3.5 h-3.5" /> Local Reminder Alert
                    </span>
                    <span className="text-[10px] text-slate-500">Browser Alert</span>
                  </label>
                  <select
                    value={bookingReminderMinutes}
                    onChange={(e) => {
                      const mins = Number(e.target.value);
                      setBookingReminderMinutes(mins);
                      if (mins > 0) requestBrowserNotificationPermission();
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-amber-300 font-bold focus:outline-none focus:border-indigo-500"
                  >
                    <option value={15}>🔔 15 minutes before meeting</option>
                    <option value={30}>🔔 30 minutes before meeting</option>
                    <option value={60}>🔔 1 hour before meeting</option>
                    <option value={1440}>🔔 24 hours before meeting</option>
                    <option value={0}>🔕 Disabled (No reminder)</option>
                  </select>
                </div>

                {/* Case Briefing */}
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Brief Case Summary (Optional)</label>
                  <textarea
                    rows={2}
                    value={caseNotes}
                    onChange={(e) => setCaseNotes(e.target.value)}
                    placeholder="Mention property location, family tree details, or specific dispute questions..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                {/* Booking Summary Box */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Advocate:</span>
                    <span className="text-white font-bold">{selectedExpert.name}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Selected Slot:</span>
                    <span className="text-emerald-400 font-bold font-mono">{selectedDate} ({selectedTimeSlot})</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Legal Fee:</span>
                    <span className="text-emerald-400 font-bold">100% Free (Pro Bono Legal Aid)</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Confirm Legal Consultation</span>
                </button>
              </div>
            </div>
          </form>
        )
      ) : (
        /* My Scheduled Bookings View */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-indigo-400" />
              <span>Your Scheduled Legal Consultations ({appointments.length})</span>
            </h4>
          </div>

          {appointments.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-400 space-y-2">
              <CalendarIcon className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No appointments scheduled</p>
              <p className="text-xs text-slate-500">Schedule a free consultation with a legal expert using the tab above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {appointments.map((app) => (
                <div
                  key={app.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h5 className="text-sm font-bold text-white">{app.expertName}</h5>
                      <span className="text-[10px] font-bold text-indigo-400 bg-indigo-600/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-xl">
                        {app.expertTitle}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-xl uppercase ${
                        app.status === 'confirmed' 
                          ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' 
                          : app.status === 'completed'
                          ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20'
                          : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                      }`}>
                        {app.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-medium">{app.topic}</p>

                    <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap font-mono pt-1">
                      <span className="text-emerald-400 font-bold">{app.date} at {app.timeSlot}</span>
                      <span>•</span>
                      <span className="capitalize">{app.mode} Consultation</span>
                    </div>

                    {/* Local Reminder Alert Option Control */}
                    {app.status === 'confirmed' && (
                      <div className="flex items-center gap-2 pt-1.5">
                        <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                          <BellRing className="w-3.5 h-3.5" /> Reminder Alert:
                        </span>
                        <select
                          value={app.reminderMinutes || 0}
                          onChange={(e) => handleUpdateReminder(app.id, Number(e.target.value))}
                          className="bg-slate-950 border border-slate-800 text-[11px] font-bold text-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-amber-500"
                        >
                          <option value={15}>15 mins before</option>
                          <option value={30}>30 mins before</option>
                          <option value={60}>1 hour before</option>
                          <option value={1440}>24 hours before</option>
                          <option value={0}>Disabled</option>
                        </select>

                        <button
                          onClick={() => handleTestNotification(app)}
                          className="px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold hover:bg-amber-500/20 flex items-center gap-1"
                        >
                          <Bell className="w-3 h-3" /> Test
                        </button>
                      </div>
                    )}

                    {app.notes && (
                      <p className="text-[11px] text-slate-500 italic mt-1">"{app.notes}"</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                    {app.mode === 'video' && app.meetLink && app.status === 'confirmed' && (
                      <a
                        href={app.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Video Room</span>
                      </a>
                    )}

                    <button
                      onClick={() => handleExportICS(app)}
                      className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
                      title="Download Calendar .ics"
                    >
                      <Download className="w-4 h-4 text-indigo-400" />
                    </button>

                    {app.status === 'confirmed' && (
                      <button
                        onClick={() => handleCancelAppointment(app.id)}
                        className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 transition-colors"
                        title="Cancel Appointment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

