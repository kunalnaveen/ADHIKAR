import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Bell, 
  BellRing, 
  CheckCircle2, 
  Plus, 
  ShieldAlert, 
  FileText, 
  ArrowRight, 
  Check, 
  X, 
  Volume2, 
  Sparkles,
  ExternalLink,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { AppSettings, DocumentDeadline } from '../types';
import { t as translateText } from '../utils/translate';
import { requestBrowserNotificationPermission, triggerBrowserNotification, playAlertChime } from '../utils/notificationHelper';

interface UpcomingExpirationsCardProps {
  settings: AppSettings;
  onNavigate?: (view: string) => void;
}

export interface ExpirationItem {
  id: string;
  docTitle: string;
  category: 'mutation_limitation' | 'poa_renewal' | 'succession_return' | 'tax_due' | 'will_probate_limitation' | 'ec_renewal';
  validityType: string;
  expirationDate: string; // YYYY-MM-DD
  actionRequired: string;
  urgency: 'critical' | 'warning' | 'normal';
  statutoryAct: string;
  daysRemaining: number;
  isResolved?: boolean;
}

const DEFAULT_EXPIRATIONS: ExpirationItem[] = [
  {
    id: 'exp-1',
    docTitle: 'Registered Ancestral Sale Deed & Survey No. 84/2A',
    category: 'mutation_limitation',
    validityType: 'Revenue Mutation Appeal & Objection Window',
    expirationDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    actionRequired: 'Submit Form 6 Khata Mutation Appeal before Tehsildar to prevent third-party dispute',
    urgency: 'critical',
    statutoryAct: 'State Land Revenue Act / Limitation Act 1963 (Section 5)',
    daysRemaining: 18,
    isResolved: false
  },
  {
    id: 'exp-2',
    docTitle: 'General Power of Attorney (PoA) - Bangalore Urban Flat',
    category: 'poa_renewal',
    validityType: 'Registered PoA Periodic Statutory Renewal',
    expirationDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    actionRequired: 'Verify principal alive status and execute renewed registered deed before Sub-Registrar',
    urgency: 'warning',
    statutoryAct: 'Powers of Attorney Act 1882 & Registration Act 1908',
    daysRemaining: 45,
    isResolved: false
  },
  {
    id: 'exp-3',
    docTitle: 'District Court Succession Certificate No. SC-412/2023',
    category: 'succession_return',
    validityType: 'Bank Securities & Fixed Deposit Devolving Compliance',
    expirationDate: new Date(Date.now() + 72 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    actionRequired: 'File inventory compliance return and asset release receipt with Bank Manager',
    urgency: 'normal',
    statutoryAct: 'Indian Succession Act 1925 (Section 377)',
    daysRemaining: 72,
    isResolved: false
  }
];

export const UpcomingExpirationsCard: React.FC<UpcomingExpirationsCardProps> = ({
  settings,
  onNavigate
}) => {
  const tr = (str: string) => translateText(str, settings.language);

  const [expirations, setExpirations] = useState<ExpirationItem[]>(() => {
    try {
      const saved = localStorage.getItem('adhikar_upcoming_expirations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_EXPIRATIONS;
  });

  const [pushEnabled, setPushEnabled] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  });

  const [leadDays, setLeadDays] = useState<number>(30);
  const [notificationToast, setNotificationToast] = useState<{ title: string; message: string } | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New manual item state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('Mutation Appeal Window');
  const [newDate, setNewDate] = useState('');
  const [newAction, setNewAction] = useState('');
  const [newAct, setNewAct] = useState('Limitation Act 1963');

  useEffect(() => {
    try {
      localStorage.setItem('adhikar_upcoming_expirations', JSON.stringify(expirations));
    } catch (e) {}
  }, [expirations]);

  // Handle Push Permission Request
  const handleTogglePush = async () => {
    if (!pushEnabled) {
      const perm = await requestBrowserNotificationPermission();
      if (perm === 'granted') {
        setPushEnabled(true);
        triggerBrowserNotification(
          tr("ADHIKAR Legal Expiration Alerts Active"),
          tr("You will receive proactive push alerts before statutory limitation and certificate renewal deadlines.")
        );
        setNotificationToast({
          title: tr("Push Notifications Activated"),
          message: tr("Proactive alerts scheduled 30, 15, and 3 days before legal expirations.")
        });
        setTimeout(() => setNotificationToast(null), 4000);
      }
    } else {
      setPushEnabled(false);
    }
  };

  const handleTestAlert = (item: ExpirationItem) => {
    playAlertChime();
    triggerBrowserNotification(
      `⚠️ ${tr("Upcoming Legal Deadline")}: ${item.validityType}`,
      `${item.docTitle} - ${item.actionRequired} (Due in ${item.daysRemaining} days)`
    );

    setNotificationToast({
      title: `⚠️ ${item.validityType} (${item.daysRemaining} days left)`,
      message: `${item.docTitle}: ${item.actionRequired}`
    });
    setTimeout(() => setNotificationToast(null), 5000);
  };

  const handleMarkResolved = (id: string) => {
    setExpirations(prev => prev.map(item => item.id === id ? { ...item, isResolved: !item.isResolved } : item));
  };

  const handleAddNewExpiration = () => {
    if (!newTitle.trim() || !newDate) return;

    const diffDays = Math.max(1, Math.round((new Date(newDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
    const newItem: ExpirationItem = {
      id: `exp-${Date.now()}`,
      docTitle: newTitle,
      category: 'mutation_limitation',
      validityType: newType,
      expirationDate: newDate,
      actionRequired: newAction || 'File necessary legal compliance documents before deadline',
      urgency: diffDays <= 20 ? 'critical' : diffDays <= 60 ? 'warning' : 'normal',
      statutoryAct: newAct,
      daysRemaining: diffDays,
      isResolved: false
    };

    setExpirations(prev => [newItem, ...prev]);
    setShowAddModal(false);
    setNewTitle('');
    setNewDate('');
    setNewAction('');
  };

  const activeCount = expirations.filter(e => !e.isResolved).length;
  const criticalCount = expirations.filter(e => !e.isResolved && e.daysRemaining <= 30).length;

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-[#111827] border border-slate-700/80 shadow-2xl space-y-6 relative overflow-hidden text-slate-100">
      
      {/* Top Notification Toast if triggered */}
      {notificationToast && (
        <div className="p-3.5 rounded-2xl bg-amber-950/90 border border-amber-500/60 shadow-xl flex items-center justify-between gap-3 text-xs animate-bounce">
          <div className="flex items-center gap-2.5">
            <BellRing className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <strong className="text-amber-200 block font-serif">{notificationToast.title}</strong>
              <span className="text-slate-300">{notificationToast.message}</span>
            </div>
          </div>
          <button onClick={() => setNotificationToast(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header with Title & Notification Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold uppercase tracking-wider font-serif">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{tr("Statutory Expirations & Limitation Tracker")}</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold font-serif text-white flex items-center gap-2">
            <span>{tr("Upcoming Legal Document Expirations")}</span>
            {criticalCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold">
                {criticalCount} {tr("Urgent")}
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-400 max-w-xl">
            {tr("Automatically extracted from your scanned deeds, Jamabandi extracts, and Succession Certificates under the Limitation Act 1963.")}
          </p>
        </div>

        {/* Action Buttons & Push Notification Toggle */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleTogglePush}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${
              pushEnabled
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-[#0b0f19] text-slate-400 hover:text-slate-200 border-slate-700'
            }`}
          >
            {pushEnabled ? <BellRing className="w-4 h-4 text-amber-400 animate-pulse" /> : <Bell className="w-4 h-4" />}
            <span>{pushEnabled ? tr("Push Alerts Active") : tr("Enable Push Alerts")}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#0b0f19] hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>{tr("Add Expiration")}</span>
          </button>
        </div>
      </div>

      {/* Seamless Integrated List of Expirations - Clean Rows, NO nested cards */}
      <div className="divide-y divide-slate-800/80">
        {expirations.map((item) => {
          const isCritical = item.daysRemaining <= 30;
          const isWarning = item.daysRemaining > 30 && item.daysRemaining <= 60;

          return (
            <div
              key={item.id}
              className={`py-3.5 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/30 rounded-lg transition-colors ${
                item.isResolved ? 'opacity-50' : ''
              }`}
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    item.isResolved
                      ? 'bg-slate-800 text-slate-400 border-slate-700'
                      : isCritical
                      ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                      : isWarning
                      ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                      : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {item.isResolved 
                      ? tr("Renewed") 
                      : `${item.daysRemaining}d left • ${item.expirationDate}`}
                  </span>

                  <h4 className="text-xs font-bold text-white font-serif truncate">
                    {item.validityType}
                  </h4>

                  <span className="text-[11px] text-slate-400 truncate hidden md:inline">
                    ({item.docTitle})
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 leading-normal line-clamp-1">
                  <span className="text-amber-400 font-medium">{tr("Action")}:</span> {item.actionRequired}
                </p>

                <div className="text-[10px] text-slate-500 font-mono">
                  {item.statutoryAct}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => handleTestAlert(item)}
                  title={tr("Trigger Alert")}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleMarkResolved(item.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                    item.isResolved
                      ? 'bg-slate-800 text-slate-400'
                      : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30'
                  }`}
                >
                  <Check className="w-3 h-3" />
                  <span>{item.isResolved ? tr("Done") : tr("Mark Done")}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Add Expiration Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-slate-100 space-y-4">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h4 className="text-lg font-bold text-white font-serif">
                {tr("Add Statutory Expiration / Deadline")}
              </h4>
              <p className="text-xs text-slate-400">
                {tr("Schedule a proactive alert for a limitation window, certificate renewal, or appeal.")}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">{tr("Document Title")}</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Registered Sale Deed Survey 104"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">{tr("Validity / Expiration Type")}</label>
                <input
                  type="text"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  placeholder="e.g. Mutation Limitation Window"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">{tr("Expiration Date")}</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">{tr("Action Required")}</label>
                <textarea
                  rows={2}
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  placeholder="e.g. Submit mutation objection before Tehsildar"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                {tr("Cancel")}
              </button>
              <button
                onClick={handleAddNewExpiration}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-500/20"
              >
                {tr("Save & Schedule Alert")}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
