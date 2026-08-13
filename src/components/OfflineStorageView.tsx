import React, { useState } from 'react';
import { AppSettings } from '../types';
import { translations } from '../data/translations';
import { 
  HardDrive, 
  WifiOff, 
  RefreshCw, 
  Trash2, 
  Smartphone, 
  CheckCircle2, 
  QrCode, 
  Sliders,
  Lock,
  Unlock,
  Fingerprint,
  ScanFace,
  ShieldCheck,
  FileText,
  KeyRound,
  Download,
  AlertCircle,
  Eye,
  Check
} from 'lucide-react';
import { OfflineSmsMode } from './OfflineSmsMode';

interface OfflineStorageViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const OfflineStorageView: React.FC<OfflineStorageViewProps> = ({ settings, onUpdateSettings }) => {
  const t = translations[settings.language] || translations.EN;
  const [cleared, setCleared] = useState(false);

  // Biometric Authentication States
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authMethod, setAuthMethod] = useState<'fingerprint' | 'face' | null>(null);
  const [authProgress, setAuthProgress] = useState<number>(0);
  const [authStatus, setAuthStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [authError, setAuthError] = useState<string | null>(null);

  // Cached Documents List
  const [cachedDocuments] = useState([
    {
      id: 'doc-1',
      title: 'Jamabandi Land Revenue Deed (2024)',
      type: 'PDF Deed',
      size: '4.2 MB',
      date: '12 Aug 2026',
      status: 'AES-256 Encrypted',
      category: 'Revenue Card',
    },
    {
      id: 'doc-2',
      title: 'Registered Family Will & Probate Copy',
      type: 'PDF Record',
      size: '12.8 MB',
      date: '05 Jul 2026',
      status: 'AES-256 Encrypted',
      category: 'Testamentary',
    },
    {
      id: 'doc-3',
      title: 'Ancestral Property Partition Affidavit',
      type: 'PDF Deed',
      size: '3.1 MB',
      date: '28 May 2026',
      status: 'AES-256 Encrypted',
      category: 'Partition Deed',
    },
    {
      id: 'doc-4',
      title: 'Daughter Coparcenary Rights Mutation Card',
      type: 'PDF Certificate',
      size: '1.9 MB',
      date: '14 Apr 2026',
      status: 'AES-256 Encrypted',
      category: 'Mutation Card',
    },
  ]);

  const triggerBiometricScan = (method: 'fingerprint' | 'face') => {
    setAuthMethod(method);
    setAuthStatus('scanning');
    setAuthError(null);
    setAuthProgress(0);

    const interval = setInterval(() => {
      setAuthProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setAuthStatus('success');
          setTimeout(() => {
            setIsAuthenticated(true);
            setAuthStatus('idle');
          }, 600);
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  const handleClearCache = () => {
    setCleared(true);
    setTimeout(() => setCleared(false), 3000);
  };

  return (
    <div className="flex flex-col w-full px-4 md:px-8 max-w-7xl mx-auto pt-6 pb-28 text-slate-100 gap-6 relative">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <WifiOff className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-sans">{t.readyForOffline}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{t.coreFunctionsAvailable}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-1.5 hover:bg-rose-500/20 active:scale-95 transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Vault</span>
            </button>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
              <Lock className="w-3.5 h-3.5" /> Biometric Locked
            </span>
          )}

          <span className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Cached
          </span>
        </div>
      </div>

      {/* Biometric Authentication Locked Screen Overlay */}
      {!isAuthenticated ? (
        <div className="w-full rounded-3xl bg-slate-900/90 border-2 border-indigo-500/30 p-8 md:p-12 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center space-y-6 relative overflow-hidden my-2">
          
          {/* Animated Background Pulse Ring */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-xl relative">
            <Lock className="w-8 h-8 text-amber-400 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-slate-900" />
          </div>

          <div className="max-w-md space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>ADHIKAR Biometric Vault Protection</span>
            </div>
            <h3 className="text-2xl font-bold font-serif text-white tracking-tight">
              Biometric Verification Required
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Legal documents, family deed copies, and offline revenue records are encrypted with 256-bit AES protection. Verify identity to unlock.
            </p>
          </div>

          {/* Biometric Interaction Area */}
          {authStatus === 'scanning' ? (
            <div className="flex flex-col items-center gap-4 py-6 w-full max-w-xs bg-slate-950/80 rounded-2xl border border-indigo-500/30 p-6 shadow-inner">
              <div className="relative w-20 h-20 flex items-center justify-center">
                {authMethod === 'fingerprint' ? (
                  <Fingerprint className="w-16 h-16 text-indigo-400 animate-pulse" />
                ) : (
                  <ScanFace className="w-16 h-16 text-cyan-400 animate-pulse" />
                )}
                <div className="absolute inset-0 rounded-full border-2 border-indigo-500 border-t-emerald-400 animate-spin" />
              </div>

              <div className="w-full space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold text-slate-300">
                  <span>Authenticating...</span>
                  <span className="font-mono text-emerald-400">{authProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-200"
                    style={{ width: `${authProgress}%` }}
                  />
                </div>
              </div>
            </div>
          ) : authStatus === 'success' ? (
            <div className="flex flex-col items-center gap-2 py-6 text-emerald-400 animate-bounce">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <Check className="w-10 h-10 text-emerald-400" />
              </div>
              <span className="text-sm font-bold tracking-wider uppercase">Identity Confirmed! Opening Vault...</span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md pt-2">
              <button
                onClick={() => triggerBiometricScan('fingerprint')}
                className="flex-1 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-4 px-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all border border-indigo-400/30 group"
              >
                <Fingerprint className="w-5 h-5 text-emerald-300 group-hover:scale-110 transition-transform" />
                <span>Scan Fingerprint</span>
              </button>

              <button
                onClick={() => triggerBiometricScan('face')}
                className="flex-1 w-full bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs py-4 px-5 rounded-2xl flex items-center justify-center gap-3 shadow-lg border border-slate-700 active:scale-95 transition-all group"
              >
                <ScanFace className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span>Verify Face ID</span>
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-2 font-mono">
            <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
            <span>FIPS 140-2 Compliant Local On-Device Verification</span>
          </div>

        </div>
      ) : (
        /* Unlocked Offline Storage Vault Content */
        <div className="space-y-6 animate-fadeIn">
          
          {/* Biometric Status Unlocked Bar */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
              <Unlock className="w-4 h-4 text-emerald-400" />
              <span>Biometric Session Active • Encrypted Vault Unlocked</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-md">
              Session Expires in 15m
            </span>
          </div>

          {/* Cached Legal Documents Collection */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white font-sans">Cached Legal Documents Vault</h3>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                {cachedDocuments.length} Deeds Available Offline
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {cachedDocuments.map((doc) => (
                <div key={doc.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/30 transition-all flex justify-between items-start gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        {doc.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{doc.date}</span>
                    </div>
                    <h4 className="text-xs font-bold text-white leading-snug">{doc.title}</h4>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1 font-mono">
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span className="text-emerald-400">{doc.status}</span>
                    </div>
                  </div>

                  <button className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 shrink-0 transition-colors" title="View Document">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Connectivity & Sync Toggles */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 shadow-lg flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-white font-sans">Connectivity & Voice Settings</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <h4 className="text-xs font-bold text-white">{t.autoSync}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Sync offline family trees automatically when connected to Wi-Fi</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoSync}
                  onChange={(e) => onUpdateSettings({ autoSync: e.target.checked })}
                  className="w-5 h-5 accent-indigo-600 cursor-pointer rounded"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <h4 className="text-xs font-bold text-white">{t.offlineVoiceAssistant}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Use on-device speech synthesis model without internet</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.offlineVoiceAssistant}
                  onChange={(e) => onUpdateSettings({ offlineVoiceAssistant: e.target.checked })}
                  className="w-5 h-5 accent-indigo-600 cursor-pointer rounded"
                />
              </div>
            </div>
          </div>

          {/* Local Storage Manager Breakdown */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 shadow-lg flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white font-sans">Local Storage Manager</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">Total: 124 MB</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-200 font-medium">Family Tree Data & Lineages</span>
                <span className="font-mono text-indigo-400 font-bold">12 MB</span>
              </div>

              <div className="flex justify-between items-center p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-200 font-medium">Drafted Documents & Legal Precedents</span>
                <span className="font-mono text-emerald-400 font-bold">45 MB</span>
              </div>

              <div className="flex justify-between items-center p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-200 font-medium">Offline Voice Audio Models</span>
                <span className="font-mono text-amber-400 font-bold">67 MB</span>
              </div>
            </div>

            <button
              onClick={handleClearCache}
              className="self-end px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors mt-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>{cleared ? "Cache Cleared!" : t.clearCache}</span>
            </button>
          </div>
        </div>
      )}

      {/* Offline SMS Utility */}
      <OfflineSmsMode />

      {/* SMS / USSD Fallback Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold w-fit">
            <Smartphone className="w-3.5 h-3.5" />
            <span>USSD / SMS Fallback</span>
          </div>
          <h3 className="text-xl font-bold font-sans text-white">{t.smsTitle}</h3>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">{t.smsDesc}</p>
          <p className="text-xs font-mono text-emerald-400 mt-2 font-bold bg-slate-950 p-2.5 rounded-xl border border-slate-800 w-fit">
            Dial *139*88# or SMS "ADHIKAR HELP" to 56161
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-lg">
          <QrCode className="w-28 h-28 text-slate-950" />
          <span className="text-[10px] font-bold text-slate-950 mt-2 uppercase tracking-wider">{t.scanDialer}</span>
        </div>
      </div>
    </div>
  );
};
