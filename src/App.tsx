import React, { useState, useEffect } from 'react';
import { AppSettings, FamilyTreeData, UserProfile, Language } from './types';
import { initialFamilyTree, defaultLegalSteps } from './data/mockData';
import { 
  subscribeToAuth, 
  getUserProfile, 
  getFamilyTreesFromFirestore, 
  saveFamilyTreeToFirestore 
} from './lib/firebase';
import { LanguageProvider } from './contexts/LanguageContext';
import { t as translateText } from './utils/translate';

import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { FamilyTreeNetworkView } from './components/FamilyTreeNetworkView';
import { CalculatorView } from './components/CalculatorView';
import { AiInterviewView } from './components/AiInterviewView';
import { WomensRightsView } from './components/WomensRightsView';
import { OfflineStorageView } from './components/OfflineStorageView';
import { SeniorModeView } from './components/SeniorModeView';
import { AuthModal } from './components/AuthModal';

// Advanced Feature Modules
import { DisputeRiskRadar } from './components/DisputeRiskRadar';
import { InheritanceSimulator } from './components/InheritanceSimulator';
import { InheritanceHealthScore } from './components/InheritanceHealthScore';
import { FamilyLegacyTimeline } from './components/FamilyLegacyTimeline';
import { LegalReadinessCheckup } from './components/LegalReadinessCheckup';
import { AiJudgeCourtroomView } from './components/AiJudgeCourtroomView';
import { OnboardingModal } from './components/OnboardingModal';
import { GeminiLiveVoiceModal } from './components/GeminiLiveVoiceModal';
import { VoiceCommandListener } from './components/VoiceCommandListener';
import { OfflineNotificationToast } from './components/OfflineNotificationToast';
import { CinematicLanding } from './components/CinematicLanding';
import { SecurityAuditModal } from './components/SecurityAuditModal';
import { Footer } from './components/Footer';
import { Mic, Globe, Sparkles, ShieldCheck } from 'lucide-react';

const QUICK_LANGS: { code: Language; native: string }[] = [
  { code: 'EN', native: 'English' },
  { code: 'HI', native: 'हिन्दी' },
  { code: 'TA', native: 'தமிழ்' },
  { code: 'TE', native: 'తెలుగు' },
  { code: 'KN', native: 'ಕನ್ನಡ' },
  { code: 'BN', native: 'বাংলা' },
  { code: 'MR', native: 'मराठी' },
];

export default function App() {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [treeData, setTreeData] = useState<FamilyTreeData>(initialFamilyTree);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authOpen, setAuthOpen] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState<boolean>(false);
  const [securityAuditOpen, setSecurityAuditOpen] = useState<boolean>(false);

  // Sync state tracking
  const [syncState, setSyncState] = useState<'synced' | 'pending' | 'syncing' | 'offline'>('pending');
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  const [settings, setSettings] = useState<AppSettings>(() => {
    let savedLang: Language = 'EN';
    try {
      const stored = localStorage.getItem('adhikar_user_language');
      if (stored) savedLang = stored as Language;
    } catch (e) {}

    return {
      darkMode: true,
      seniorMode: false,
      language: savedLang,
      autoSync: true,
      offlineVoiceAssistant: true,
      textOnlyMode: false,
      compressAssets: true,
      voiceSpeaker: 'Kore',
      lowBandwidth: false,
    };
  });

  // Track online/offline status for syncState
  useEffect(() => {
    const handleOnline = () => {
      if (pendingSyncCount > 0 && user) {
        setSyncState('syncing');
        saveFamilyTreeToFirestore(user.id, treeData)
          .then(() => {
            setSyncState('synced');
            setPendingSyncCount(0);
          })
          .catch(() => setSyncState('pending'));
      } else {
        setSyncState('synced');
      }
    };

    const handleOffline = () => {
      setSyncState('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (!navigator.onLine) {
      setSyncState('offline');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user, treeData, pendingSyncCount]);

  // Subscribe to Firebase Auth
  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (fbUser) => {
      if (fbUser) {
        setSyncState('syncing');
        const profile = await getUserProfile(fbUser.uid);
        const userObj: UserProfile = {
          id: fbUser.uid,
          name: profile?.name || fbUser.displayName || 'User',
          email: profile?.email || fbUser.email || '',
          phone: profile?.phone || '',
          state: profile?.state || 'Karnataka',
          savedTreesCount: profile?.savedTreesCount || 0,
          completedDocsCount: profile?.completedDocsCount || 0,
          upcomingAppointments: 0,
          photoURL: fbUser.photoURL || undefined
        };
        setUser(userObj);

        // Load saved tree if available in Firestore
        try {
          const savedTrees = await getFamilyTreesFromFirestore(fbUser.uid);
          if (savedTrees && savedTrees.length > 0) {
            setTreeData(savedTrees[0] as FamilyTreeData);
          }
        } catch (e) {
          console.error("Error loading family tree:", e);
        }

        setSyncState('synced');
        setPendingSyncCount(0);
      } else {
        setUser(null);
        setSyncState('pending');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (newSettings.language) {
        try {
          localStorage.setItem('adhikar_user_language', newSettings.language);
        } catch (e) {}
      }
      return updated;
    });
  };

  const handleUpdateTree = (updatedTree: FamilyTreeData) => {
    setTreeData(updatedTree);
    if (user && navigator.onLine) {
      setSyncState('syncing');
      saveFamilyTreeToFirestore(user.id, updatedTree)
        .then(() => {
          setSyncState('synced');
          setPendingSyncCount(0);
        })
        .catch(() => {
          setSyncState('pending');
          setPendingSyncCount((prev) => prev + 1);
        });
    } else {
      setSyncState('pending');
      setPendingSyncCount((prev) => prev + 1);
    }
  };

  const handleSyncNow = async () => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    setSyncState('syncing');
    try {
      await saveFamilyTreeToFirestore(user.id, treeData);
      setSyncState('synced');
      setPendingSyncCount(0);
    } catch (e) {
      setSyncState('pending');
    }
  };

  if (currentView === 'landing') {
    return (
      <CinematicLanding
        onGetStarted={() => setCurrentView('dashboard')}
        onViewArchitecture={() => setCurrentView('tree')}
        onNavigateSection={(section) => {
          if (['dashboard', 'tree', 'calculator', 'interview', 'courtroom', 'womens-rights', 'storage', 'senior'].includes(section)) {
            setCurrentView(section);
          } else if (section === 'features') {
            setCurrentView('dashboard');
          } else if (section === 'about') {
            setCurrentView('interview');
          } else if (section === 'faq') {
            setCurrentView('courtroom');
          } else {
            setCurrentView('dashboard');
          }
        }}
      />
    );
  }

  return (
    <LanguageProvider
      initialLanguage={settings.language}
      onLanguageChange={(newLang) => handleUpdateSettings({ language: newLang })}
    >
      <div className={`min-h-screen w-full flex flex-col font-sans transition-colors duration-300 ${
        settings.seniorMode
          ? 'bg-[#001736] text-white'
          : 'bg-[#0b0f19] text-slate-100'
      }`}>
        {/* Top Header */}
        <Header
          currentView={currentView}
          settings={settings}
          user={user}
          syncState={syncState}
          pendingSyncCount={pendingSyncCount}
          onSyncNow={handleSyncNow}
          onNavigate={setCurrentView}
          onUpdateSettings={handleUpdateSettings}
          onOpenAuth={() => setAuthOpen(true)}
          onOpenVoiceModal={() => setVoiceModalOpen(true)}
          onOpenSecurityAudit={() => setSecurityAuditOpen(true)}
        />

        {/* Real-time Offline Transition Toast Notification */}
        <OfflineNotificationToast
          currentLanguage={settings.language}
          onOpenStorage={() => setCurrentView('storage')}
        />

        {/* Quick Language Switcher Bar for Rural / Semi-Rural Accessibility */}
        <div className="fixed top-16 left-0 right-0 z-30 bg-[#0e1626]/95 backdrop-blur-md border-b border-slate-800/80 px-3 py-1.5 flex items-center justify-between overflow-x-auto no-scrollbar shadow-md">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-400 shrink-0 mr-2">
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-serif">भाषा / Language:</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {QUICK_LANGS.map((ql) => (
              <button
                key={ql.code}
                onClick={() => handleUpdateSettings({ language: ql.code })}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  settings.language === ql.code
                    ? 'bg-indigo-800 text-white font-bold shadow-sm ring-1 ring-indigo-400/40'
                    : 'bg-[#0b0f19] text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                {ql.native}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowOnboarding(true)}
            className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-[11px] font-bold shadow-sm flex items-center gap-1 shrink-0 ml-2 border border-slate-700/80"
          >
            <span>{translateText("App Guide", settings.language)}</span>
          </button>
        </div>

        {/* Voice Command Navigator (Spoken Phrases to Navigation Trigger) */}
        <VoiceCommandListener
          currentLanguage={settings.language}
          onNavigate={setCurrentView}
          activeView={currentView}
        />

        {/* Floating One-Click Gemini Live Voice Modal Trigger */}
        <div className="fixed bottom-20 left-4 z-40">
          <button
            onClick={() => setVoiceModalOpen(true)}
            className="bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs px-4 py-3 rounded-2xl flex items-center gap-2 shadow-2xl border border-indigo-500/40 hover:border-indigo-400 active:scale-95 transition-all group"
            title="Open Gemini Live Voice Assistant"
          >
            <div className="w-7 h-7 rounded-xl bg-indigo-950/60 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/40">
              <Mic className="w-4 h-4 text-indigo-300" />
            </div>
            <span className="font-sans font-bold tracking-tight text-indigo-200">
              {translateText("Live Voice", settings.language)}
            </span>
          </button>
        </div>

        {/* Main View Area */}
        <main className="flex-1 w-full pt-24">
          {currentView === 'senior' ? (
            <SeniorModeView 
              onNavigate={setCurrentView} 
              settings={settings} 
              onUpdateSettings={handleUpdateSettings}
              onOpenVoiceModal={() => setVoiceModalOpen(true)}
            />
          ) : (
            <>
              {currentView === 'dashboard' && (
                <DashboardView 
                  onNavigate={setCurrentView} 
                  settings={settings} 
                  tree={treeData}
                  onUpdateTree={handleUpdateTree}
                />
              )}
              {currentView === 'tree' && (
                <FamilyTreeNetworkView
                  tree={treeData}
                  onUpdateTree={handleUpdateTree}
                  settings={settings}
                  user={user}
                  onOpenAuth={() => setAuthOpen(true)}
                />
              )}
              {currentView === 'calculator' && (
                <CalculatorView
                  tree={treeData}
                  steps={defaultLegalSteps}
                  settings={settings}
                  user={user}
                  onOpenAuth={() => setAuthOpen(true)}
                />
              )}
              {currentView === 'interview' && (
                <AiInterviewView settings={settings} user={user} onOpenAuth={() => setAuthOpen(true)} />
              )}
              {currentView === 'womensRights' && (
                <WomensRightsView onNavigate={setCurrentView} settings={settings} />
              )}
              {currentView === 'storage' && (
                <OfflineStorageView
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                />
              )}
              {currentView === 'radar' && (
                <div className="p-4 md:p-8 max-w-7xl mx-auto pb-28">
                  <DisputeRiskRadar settings={settings} onNavigate={setCurrentView} user={user} onOpenAuth={() => setAuthOpen(true)} />
                </div>
              )}
              {currentView === 'simulator' && (
                <div className="p-4 md:p-8 max-w-7xl mx-auto pb-28">
                  <InheritanceSimulator tree={treeData} settings={settings} />
                </div>
              )}
              {currentView === 'health' && (
                <div className="p-4 md:p-8 max-w-7xl mx-auto pb-28">
                  <InheritanceHealthScore settings={settings} onNavigate={setCurrentView} />
                </div>
              )}
              {currentView === 'timeline' && (
                <div className="p-4 md:p-8 max-w-7xl mx-auto pb-28">
                  <FamilyLegacyTimeline settings={settings} />
                </div>
              )}
              {currentView === 'checkup' && (
                <div className="p-4 md:p-8 max-w-7xl mx-auto pb-28">
                  <LegalReadinessCheckup settings={settings} onNavigate={setCurrentView} />
                </div>
              )}
              {currentView === 'courtroom' && (
                <div className="p-4 md:p-8 max-w-7xl mx-auto pb-28">
                  <AiJudgeCourtroomView tree={treeData} settings={settings} onNavigate={setCurrentView} user={user} onOpenAuth={() => setAuthOpen(true)} />
                </div>
              )}
            </>
          )}

          {/* Main Website Global Footer */}
          <Footer
            onNavigate={setCurrentView}
            language={settings.language}
            onOpenSecurityAudit={() => setSecurityAuditOpen(true)}
          />
        </main>

        {/* Gemini Live Voice Modal */}
        {voiceModalOpen && (
          <GeminiLiveVoiceModal
            isOpen={voiceModalOpen}
            onClose={() => setVoiceModalOpen(false)}
            settings={settings}
            tree={treeData}
            onUpdateTree={handleUpdateTree}
            onNavigate={setCurrentView}
            onUpdateSettings={handleUpdateSettings}
          />
        )}

        {/* Interactive Tour Onboarding Modal */}
        {showOnboarding && (
          <OnboardingModal
            onClose={() => setShowOnboarding(false)}
            onNavigate={setCurrentView}
            settings={settings}
          />
        )}

        {/* Auth Modal */}
        {authOpen && (
          <AuthModal
            user={user}
            onClose={() => setAuthOpen(false)}
            onLogin={setUser}
            onLogout={() => setUser(null)}
          />
        )}

        {/* 20 Essential Website Security Checks Compliance Modal */}
        {securityAuditOpen && (
          <SecurityAuditModal
            isOpen={securityAuditOpen}
            onClose={() => setSecurityAuditOpen(false)}
          />
        )}

        {/* Bottom Nav Bar */}
        <BottomNav
          currentView={currentView}
          onSelectView={setCurrentView}
          settings={settings}
        />
      </div>
    </LanguageProvider>
  );
}
