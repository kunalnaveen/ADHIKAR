import React, { useState } from 'react';
import { AppSettings } from '../types';
import { translations } from '../data/translations';
import { 
  HardDrive, 
  WifiOff, 
  Trash2, 
  Smartphone, 
  CheckCircle2, 
  QrCode, 
  Lock, 
  Fingerprint, 
  ScanFace, 
  ShieldCheck, 
  FileText, 
  Building2, 
  MapPin,
  Check
} from 'lucide-react';
import { OfflineSmsMode } from './OfflineSmsMode';
import { GovOfficeNavigator } from './GovOfficeNavigator';
import { PropertyOwnershipMap } from './PropertyOwnershipMap';

interface OfflineStorageViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const OfflineStorageView: React.FC<OfflineStorageViewProps> = ({ settings, onUpdateSettings }) => {
  const t = translations[settings.language] || translations.EN;
  const [activeTab, setActiveTab] = useState<'vault' | 'gov' | 'map' | 'sms'>('vault');
  const [cleared, setCleared] = useState(false);

  // Biometric Authentication States
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [authMethod, setAuthMethod] = useState<'fingerprint' | 'face' | null>(null);
  const [authProgress, setAuthProgress] = useState<number>(0);
  const [authStatus, setAuthStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');

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
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
              <Lock className="w-3.5 h-3.5" /> Biometric Locked
            </span>
          )}

          <span className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Cached
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('vault')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'vault'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Encrypted Vault & Documents</span>
        </button>

        <button
          onClick={() => setActiveTab('gov')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'gov'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Tehsil & Revenue Navigator</span>
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'map'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Property Ownership Map</span>
        </button>

        <button
          onClick={() => setActiveTab('sms')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'sms'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>SMS / USSD Gateway</span>
        </button>
      </div>

      {/* TAB 1: VAULT */}
      {activeTab === 'vault' && (
        <div className="space-y-6">
          {!isAuthenticated ? (
            <div className="w-full rounded-3xl bg-slate-900/90 border border-slate-800 p-8 md:p-12 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center space-y-6 relative overflow-hidden my-2">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl relative">
                <Lock className="w-8 h-8 text-amber-400 animate-pulse" />
              </div>

              <div className="max-w-md space-y-2">
                <h3 className="text-2xl font-bold font-serif text-white tracking-tight">
                  Biometric Verification Required
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Legal documents and offline revenue records are encrypted with 256-bit AES protection.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                <button
                  onClick={() => triggerBiometricScan('fingerprint')}
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                >
                  <Fingerprint className="w-4 h-4" />
                  <span>Scan Fingerprint</span>
                </button>
                <button
                  onClick={() => triggerBiometricScan('face')}
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 active:scale-95 transition-all"
                >
                  <ScanFace className="w-4 h-4" />
                  <span>Facial Biometrics</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Vault Documents List */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-bold text-white">Protected Offline Documents</h3>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                    {cachedDocuments.length} Documents Synced
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {cachedDocuments.map((doc) => (
                    <div key={doc.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{doc.title}</h4>
                          <p className="text-[10px] text-slate-400 font-mono">{doc.size} • {doc.date}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Local Storage Manager */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg font-bold text-white">Local Storage Manager</h3>
                  </div>
                  <span className="text-xs font-mono text-slate-400">Total: 124 MB</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-200">Family Tree Data & Lineages</span>
                    <span className="font-mono text-blue-400 font-bold">12 MB</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-200">Drafted Documents & Legal Precedents</span>
                    <span className="font-mono text-emerald-400 font-bold">45 MB</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-200">Offline Voice Audio Models</span>
                    <span className="font-mono text-amber-400 font-bold">67 MB</span>
                  </div>
                </div>

                <button
                  onClick={handleClearCache}
                  className="self-end px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors mt-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{cleared ? "Cache Cleared!" : t.clearCache}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GOVERNMENT REVENUE NAVIGATOR */}
      {activeTab === 'gov' && (
        <div className="space-y-4">
          <GovOfficeNavigator settings={settings} />
        </div>
      )}

      {/* TAB 3: PROPERTY OWNERSHIP MAP */}
      {activeTab === 'map' && (
        <div className="space-y-4">
          <PropertyOwnershipMap />
        </div>
      )}

      {/* TAB 4: OFFLINE SMS & USSD */}
      {activeTab === 'sms' && (
        <div className="space-y-6">
          <OfflineSmsMode />
        </div>
      )}

    </div>
  );
};
