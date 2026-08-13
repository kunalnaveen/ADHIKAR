import React, { useState, useEffect } from 'react';
import { DocumentDeadline, SecureDocument } from '../types';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Download, 
  FileText, 
  Bell, 
  BellRing, 
  Trash2, 
  ExternalLink, 
  Sparkles, 
  ShieldAlert,
  ArrowRight,
  Filter,
  Check,
  Edit3,
  CalendarCheck
} from 'lucide-react';
import { parseDocumentForDeadlines } from '../utils/documentParser';
import { requestBrowserNotificationPermission, triggerBrowserNotification } from '../utils/notificationHelper';

interface DocumentDeadlineManagerProps {
  documents: SecureDocument[];
  onOpenVaultDocument?: (docId: string) => void;
}

export const DocumentDeadlineManager: React.FC<DocumentDeadlineManagerProps> = ({
  documents,
  onOpenVaultDocument
}) => {
  const [calendarDeadlines, setCalendarDeadlines] = useState<DocumentDeadline[]>(() => {
    const saved = localStorage.getItem('adhikar_calendar_deadlines');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // Fallback
      }
    }

    // Default initial legal document deadlines
    const initialSuggestions: DocumentDeadline[] = [];
    documents.forEach((doc) => {
      const parsed = parseDocumentForDeadlines(doc);
      initialSuggestions.push(...parsed);
    });

    // Mark first 2 as already added to calendar
    if (initialSuggestions.length > 0) {
      initialSuggestions[0].status = 'added';
      if (initialSuggestions.length > 1) initialSuggestions[1].status = 'added';
    }

    return initialSuggestions;
  });

  const [activeTab, setActiveTab] = useState<'calendar' | 'suggestions'>('calendar');
  const [editingDeadline, setEditingDeadline] = useState<DocumentDeadline | null>(null);
  const [activeToast, setActiveToast] = useState<{ title: string; body: string } | null>(null);

  // Custom manual deadline form state
  const [customTitle, setCustomTitle] = useState('');
  const [customCategory, setCustomCategory] = useState<DocumentDeadline['category']>('property_tax');
  const [customDate, setCustomDate] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [customSummary, setCustomSummary] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  useEffect(() => {
    localStorage.setItem('adhikar_calendar_deadlines', JSON.stringify(calendarDeadlines));
  }, [calendarDeadlines]);

  const handleAddToCalendar = (deadline: DocumentDeadline) => {
    requestBrowserNotificationPermission();

    const updated = calendarDeadlines.map((d) => 
      d.id === deadline.id ? { ...d, status: 'added' as const } : d
    );

    // If it was a new item not yet in list
    if (!calendarDeadlines.some((d) => d.id === deadline.id)) {
      updated.unshift({ ...deadline, status: 'added' });
    }

    setCalendarDeadlines(updated);

    const title = `📅 Added to Calendar: ${deadline.title}`;
    const body = `Scheduled for ${deadline.dueDate}. Local reminder alert enabled.`;
    triggerBrowserNotification(title, body);

    setActiveToast({ title, body });
    setTimeout(() => setActiveToast(null), 4000);
  };

  const handleDismiss = (id: string) => {
    setCalendarDeadlines((prev) => prev.filter((d) => d.id !== id));
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle || !customDate) return;

    requestBrowserNotificationPermission();

    const newDl: DocumentDeadline = {
      id: `dl-custom-${Date.now()}`,
      docName: 'Manual Entry / Tax Assessment',
      title: customTitle,
      category: customCategory,
      dueDate: customDate,
      amountINR: customAmount ? `₹${customAmount.replace(/[^0-9]/g, '')}` : undefined,
      urgency: 'warning',
      summary: customSummary || 'User-added document deadline.',
      status: 'added',
      reminderMinutes: 1440,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setCalendarDeadlines((prev) => [newDl, ...prev]);
    setIsAddingCustom(false);
    setCustomTitle('');
    setCustomDate('');
    setCustomAmount('');
    setCustomSummary('');

    const title = `📅 Calendar Deadline Created`;
    const body = `${newDl.title} scheduled for ${newDl.dueDate}.`;
    triggerBrowserNotification(title, body);
    setActiveToast({ title, body });
    setTimeout(() => setActiveToast(null), 4000);
  };

  const handleExportICS = (dl: DocumentDeadline) => {
    const formattedDate = dl.dueDate.replace(/-/g, '');
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ADHIKAR Legal Vault Deadlines//EN',
      'BEGIN:VEVENT',
      `SUMMARY:Legal Deadline: ${dl.title}`,
      `DESCRIPTION:${dl.summary}\\nDocument: ${dl.docName}\\nAmount: ${dl.amountINR || 'N/A'}`,
      `LOCATION:ADHIKAR Legal Portal`,
      `DTSTART:${formattedDate}T090000Z`,
      `DTEND:${formattedDate}T100000Z`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ADHIKAR_Deadline_${dl.title.replace(/\s+/g, '_')}_${dl.dueDate}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const addedCalendarItems = calendarDeadlines.filter((d) => d.status === 'added');
  const suggestedItems = calendarDeadlines.filter((d) => d.status === 'suggested');

  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
      
      {/* Toast Alert Banner */}
      {activeToast && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-emerald-400 animate-pulse" />
            <div>
              <span className="font-bold block">{activeToast.title}</span>
              <span className="text-[11px] text-emerald-200/80">{activeToast.body}</span>
            </div>
          </div>
          <button onClick={() => setActiveToast(null)} className="text-emerald-400 font-bold text-xs">✕</button>
        </div>
      )}

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-indigo-400 bg-indigo-600/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-xl flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> AI Document Parser & Calendar Sync
            </span>
            <span className="text-[11px] text-amber-400 font-mono">Automatic Deadline Extractor</span>
          </div>
          <h3 className="text-xl font-bold text-white font-sans">Legal Deadlines & Tax Payment Calendar</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Auto-parses uploaded deeds, wills & tax notices to suggest property tax due dates and court hearings.
          </p>
        </div>

        <button
          onClick={() => setIsAddingCustom(!isAddingCustom)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-500/20 shrink-0"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Add Custom Deadline</span>
        </button>
      </div>

      {/* Custom Form Modal/Expansion */}
      {isAddingCustom && (
        <form onSubmit={handleCreateCustom} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 animate-fade-in">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-indigo-400" />
            <span>Create Custom Legal / Tax Deadline</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Deadline Title *</label>
              <input
                type="text"
                required
                placeholder="e.g., Property Tax 1st Installment Payment"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Category</label>
              <select
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value as DocumentDeadline['category'])}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="property_tax">Property Tax Payment</option>
                <option value="doc_expiration">Document Expiration / Renewal</option>
                <option value="court_hearing">Mutation / Revenue Hearing</option>
                <option value="lease_renewal">Lease / Partition Deed</option>
                <option value="will_probate">Will Probate Limitation</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Amount in INR (Optional)</label>
              <input
                type="text"
                placeholder="e.g. 12500"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">Notes / Action Summary</label>
            <input
              type="text"
              placeholder="e.g. Pay at Municipal Corporation counter or online portal to claim 10% rebate."
              value={customSummary}
              onChange={(e) => setCustomSummary(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingCustom(false)}
              className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 text-xs font-bold hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md"
            >
              Save to Calendar
            </button>
          </div>
        </form>
      )}

      {/* Mode Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'calendar'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Scheduled Calendar ({addedCalendarItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('suggestions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'suggestions'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Suggested Deadlines ({suggestedItems.length})</span>
          </button>
        </div>
      </div>

      {/* Main List Area */}
      {activeTab === 'calendar' ? (
        <div className="space-y-3">
          {addedCalendarItems.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 space-y-2">
              <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-300">No scheduled deadlines in your calendar</p>
              <p className="text-xs text-slate-500">Check the 'AI Suggested Deadlines' tab or add a custom deadline above.</p>
            </div>
          ) : (
            addedCalendarItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    item.urgency === 'critical'
                      ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                      : item.urgency === 'warning'
                      ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                      : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  }`}>
                    <Clock className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
                      {item.amountINR && (
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">
                          Due: {item.amountINR}
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                        📅 Due: {item.dueDate}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-1">{item.summary}</p>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-1.5">
                      <span>Source: {item.docName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleExportICS(item)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Export .ics</span>
                  </button>

                  <button
                    onClick={() => handleDismiss(item.id)}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400"
                    title="Remove from Calendar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* AI Suggested Tab */
        <div className="space-y-3">
          {suggestedItems.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-sm font-bold text-slate-300">All suggested document deadlines added!</p>
              <p className="text-xs text-slate-500">Upload new property deeds or wills to trigger fresh AI deadline parsing.</p>
            </div>
          ) : (
            suggestedItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
                      {item.amountINR && (
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">
                          Est: {item.amountINR}
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">
                        Predicted Due: {item.dueDate}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400">{item.summary}</p>
                    <span className="text-[11px] text-slate-500 font-mono block mt-1">Parsed from: {item.docName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleAddToCalendar(item)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                  >
                    <CalendarCheck className="w-3.5 h-3.5" />
                    <span>Add to Calendar</span>
                  </button>

                  <button
                    onClick={() => handleDismiss(item.id)}
                    className="p-2 rounded-xl bg-slate-900 text-slate-500 hover:text-slate-300 border border-slate-800"
                    title="Dismiss suggestion"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};
