import React, { useState } from 'react';
import { Language, AppSettings, UserProfile } from '../types';
import { translations } from '../data/translations';
import { 
  Globe, 
  User as UserIcon, 
  Shield, 
  Accessibility, 
  Check, 
  CloudCheck, 
  CloudUpload, 
  RefreshCw, 
  CloudOff, 
  HardDrive,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface HeaderProps {
  currentView: string;
  settings: AppSettings;
  user: UserProfile | null;
  syncState: 'synced' | 'pending' | 'syncing' | 'offline';
  pendingSyncCount: number;
  onSyncNow: () => void;
  onNavigate: (view: string) => void;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  settings,
  user,
  syncState,
  pendingSyncCount,
  onSyncNow,
  onNavigate,
  onUpdateSettings,
  onOpenAuth,
}) => {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [syncMenuOpen, setSyncMenuOpen] = useState(false);
  const t = translations[settings.language] || translations.EN;

  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'EN', label: 'English', native: 'English' },
    { code: 'HI', label: 'Hindi', native: 'हिंदी' },
    { code: 'TA', label: 'Tamil', native: 'தமிழ்' },
    { code: 'TE', label: 'Telugu', native: 'తెలుగు' },
    { code: 'ML', label: 'Malayalam', native: 'മലയാളം' },
    { code: 'KN', label: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'BN', label: 'Bengali', native: 'বাংলা' },
    { code: 'MR', label: 'Marathi', native: 'मराठी' },
    { code: 'GU', label: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'PA', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
    { code: 'UR', label: 'Urdu', native: 'اردو' },
    { code: 'OR', label: 'Odia', native: 'ଓଡ଼ିଆ' },
    { code: 'AS', label: 'Assamese', native: 'অসমীয়া' },
    { code: 'BHO', label: 'Bhojpuri', native: 'भोजपुरी' },
    { code: 'MAI', label: 'Maithili', native: 'मैथिली' },
  ];

  const viewTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    tree: 'Network',
    calculator: 'Calculator',
    interview: 'Ai Interview',
    womensRights: 'Women\'s Rights',
    storage: 'Storage & Offline',
    senior: 'Senior Mode',
    radar: 'Dispute Risk Radar',
    simulator: 'What Happens If? Simulator',
    health: 'Inheritance Health Score',
    timeline: 'Family Legacy Timeline',
    checkup: 'Legal Readiness Checkup',
  };

  const currentTitle = viewTitles[currentView] || 'ADHIKAR';

  return (
    <header className={`fixed top-0 w-full z-50 transition-colors duration-200 ${
      settings.seniorMode
        ? 'bg-[#001736] text-white border-b-2 border-[#775a19] pt-safe shadow-md'
        : 'bg-slate-950/90 backdrop-blur-xl border-b border-slate-800 pt-safe shadow-lg'
    }`}>
      <div className="h-16 px-3 sm:px-6 max-w-7xl mx-auto flex items-center justify-between gap-2">
        
        {/* Brand Identity */}
        <div 
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-lg sm:text-xl text-white shadow-lg shadow-indigo-500/20 group-hover:bg-indigo-500 transition-colors">
            A
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className={`font-bold tracking-tight uppercase ${
                settings.seniorMode ? 'text-xl sm:text-2xl font-serif text-[#ffdea5]' : 'text-base sm:text-lg text-slate-100'
              }`}>
                {t.appName}
              </span>
              {settings.seniorMode && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-[#775a19] text-white px-2 py-0.5 rounded font-bold uppercase">
                  <Accessibility className="w-3 h-3" /> Senior
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[9px] sm:text-[10px] text-emerald-400 font-mono tracking-widest uppercase font-semibold">
                {t.offlineMode}
              </span>
            </div>
          </div>
        </div>

        {/* Center View Title */}
        <div className="hidden lg:flex flex-1 text-center justify-center">
          <span className={`uppercase tracking-wider font-semibold ${
            settings.seniorMode ? 'text-lg text-white font-serif' : 'text-xs sm:text-sm text-slate-300'
          }`}>
            {currentTitle}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">

          {/* Prominent Visual Sync-Status Indicator (3 States) */}
          <div className="relative">
            <button
              onClick={() => setSyncMenuOpen(!syncMenuOpen)}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all shadow-md active:scale-95 ${
                syncState === 'pending' || syncState === 'offline'
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25 ring-1 ring-amber-500/20'
                  : syncState === 'syncing'
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 ring-1 ring-cyan-500/20'
                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
              }`}
              title="Cloud Sync Status Monitor"
            >
              {syncState === 'pending' || syncState === 'offline' ? (
                <>
                  <div className="relative flex items-center justify-center">
                    <CloudUpload className="w-4 h-4 text-amber-400 animate-bounce" />
                    <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-amber-400 rounded-full animate-ping" />
                  </div>
                  <span className="hidden sm:inline font-sans">
                    Offline-Cached ({pendingSyncCount})
                  </span>
                  <span className="inline sm:hidden font-mono text-[10px] bg-amber-400/20 px-1.5 py-0.5 rounded">
                    {pendingSyncCount}
                  </span>
                </>
              ) : syncState === 'syncing' ? (
                <>
                  <RefreshCw className="w-4 h-4 text-cyan-300 animate-spin" />
                  <span className="hidden sm:inline font-sans">Cloud Syncing...</span>
                  <span className="inline sm:hidden font-mono text-[10px]">Syncing</span>
                </>
              ) : (
                <>
                  <CloudCheck className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline font-sans">Fully Cloud Synced</span>
                  <span className="inline sm:hidden font-mono text-[10px] text-emerald-400">Synced</span>
                </>
              )}
            </button>

            {/* Sync Popover Monitor */}
            {syncMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-50 text-slate-100 space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <HardDrive className="w-4 h-4 text-indigo-400" />
                    <span>Vault Sync Monitor</span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                    syncState === 'pending' || syncState === 'offline'
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : syncState === 'syncing'
                      ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                      : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                  }`}>
                    {syncState === 'pending' || syncState === 'offline' 
                      ? 'Offline-Cached' 
                      : syncState === 'syncing' 
                      ? 'Syncing In Progress' 
                      : 'Fully Cloud Synced'}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  {syncState === 'pending' || syncState === 'offline' ? (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs leading-relaxed space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-amber-300">
                        <CloudUpload className="w-4 h-4" />
                        <span>{pendingSyncCount} Unsynced Record(s)</span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Edits are safely cached in your browser's IndexedDB offline storage. Tap below to upload to cloud servers.
                      </p>
                    </div>
                  ) : syncState === 'syncing' ? (
                    <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-200 text-xs leading-relaxed flex items-center gap-2.5">
                      <RefreshCw className="w-5 h-5 text-cyan-300 animate-spin shrink-0" />
                      <div>
                        <div className="font-bold text-cyan-300">Uploading to ADHIKAR Vault</div>
                        <p className="text-[11px] text-slate-300">Encrypting and pushing records...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs leading-relaxed space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-emerald-300">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Encrypted Cloud Backup Ready</span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        All family tree nodes and legal documents are synchronized with 256-bit AES vault encryption.
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-[11px] pt-1 text-slate-400">
                    <span>Local IndexedDB Cache:</span>
                    <span className="font-mono text-emerald-400 font-bold">Active (Offline-First)</span>
                  </div>
                </div>

                {(syncState === 'pending' || syncState === 'offline') && (
                  <button
                    onClick={() => {
                      onSyncNow();
                      setSyncMenuOpen(false);
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                  >
                    <CloudUpload className="w-4 h-4 text-emerald-400" />
                    <span>Sync Local Vault to Cloud Now</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    onNavigate('storage');
                    setSyncMenuOpen(false);
                  }}
                  className="w-full bg-slate-950 hover:bg-slate-800 text-slate-300 text-[11px] font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 border border-slate-800 transition-colors"
                >
                  <span>Open Offline Storage Manager</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Senior Mode Toggle */}
          <button
            onClick={() => {
              const newSeniorState = !settings.seniorMode;
              onUpdateSettings({ seniorMode: newSeniorState });
              if (newSeniorState) {
                onNavigate('senior');
              }
            }}
            title="Toggle Senior Mode"
            className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1 text-[11px] font-bold transition-all ${
              settings.seniorMode
                ? 'bg-[#775a19] text-white ring-2 ring-[#ffdea5]'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Accessibility className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Senior</span>
          </button>

          {/* Language Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 text-slate-200 text-[11px] font-semibold border border-slate-800 hover:bg-slate-800 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>{settings.language}</span>
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 max-h-80 overflow-y-auto">
                <div className="px-3 py-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800/80 mb-1">
                  Select Language
                </div>
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      onUpdateSettings({ language: l.code });
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800/80 transition-colors ${
                      settings.language === l.code ? 'text-indigo-400 font-bold bg-indigo-600/10' : 'text-slate-200'
                    }`}
                  >
                    <span>{l.native} ({l.code})</span>
                    {settings.language === l.code && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile / Auth Button */}
          <button
            onClick={onOpenAuth}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 border border-indigo-500/30 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 active:scale-95 transition-all shrink-0"
            title={user ? user.name : "Sign In / Profile"}
          >
            {user ? (
              <span className="text-xs font-bold">{user.name.slice(0, 2).toUpperCase()}</span>
            ) : (
              <UserIcon className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
