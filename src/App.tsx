import React, { useState, useEffect } from 'react';
import { AppSettings, FamilyTreeData, UserProfile } from './types';
import { initialFamilyTree, defaultLegalSteps } from './data/mockData';
import { 
  subscribeToAuth, 
  getUserProfile, 
  getFamilyTreesFromFirestore, 
  saveFamilyTreeToFirestore 
} from './lib/firebase';

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

// New Advanced Feature Modules
import { DisputeRiskRadar } from './components/DisputeRiskRadar';
import { InheritanceSimulator } from './components/InheritanceSimulator';
import { InheritanceHealthScore } from './components/InheritanceHealthScore';
import { FamilyLegacyTimeline } from './components/FamilyLegacyTimeline';
import { LegalReadinessCheckup } from './components/LegalReadinessCheckup';
import { AiJudgeCourtroomView } from './components/AiJudgeCourtroomView';
import { OnboardingModal } from './components/OnboardingModal';
import { GeminiLiveVoiceModal } from './components/GeminiLiveVoiceModal';
import { Mic } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [treeData, setTreeData] = useState<FamilyTreeData>(initialFamilyTree);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authOpen, setAuthOpen] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState<boolean>(false);

  // Sync state tracking
  const [syncState, setSyncState] = useState<'synced' | 'pending' | 'syncing' | 'offline'>('pending');
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  const [settings, setSettings] = useState<AppSettings>({
    darkMode: true,
    seniorMode: false,
    language: 'EN',
    autoSync: true,
    offlineVoiceAssistant: true,
    textOnlyMode: false,
    compressAssets: true,
    voiceSpeaker: 'Kore',
    lowBandwidth: false,
  });

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
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleUpdateTree = (updatedTree: FamilyTreeData) => {
    setTreeData(updatedTree);
    if (user) {
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

  return (
    <div className={`min-h-screen w-full flex flex-col font-sans transition-colors duration-300 ${
      settings.seniorMode
        ? 'bg-slate-950 text-white'
        : 'bg-slate-950 text-slate-100'
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
      />

      {/* Quick Interactive Tour Trigger Pill */}
      <div className="fixed top-20 right-4 z-40">
        <button
          onClick={() => setShowOnboarding(true)}
          className="px-3 py-1.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white text-[11px] font-bold shadow-lg shadow-indigo-500/20 backdrop-blur-md flex items-center gap-1.5 active:scale-95 transition-all border border-indigo-400/30"
        >
          <span>✨ Hackathon Tour</span>
        </button>
      </div>

      {/* Floating One-Click Gemini Live Voice Microphone Trigger */}
      <div className="fixed bottom-20 left-4 z-40">
        <button
          onClick={() => setVoiceModalOpen(true)}
          className="bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-500 hover:scale-105 text-white font-extrabold text-xs px-4 py-3 rounded-2xl flex items-center gap-2 shadow-2xl border-2 border-indigo-300/50 active:scale-95 transition-all group"
          title="Open Gemini Live Voice Assistant"
        >
          <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Mic className="w-4 h-4 text-emerald-300 animate-pulse" />
          </div>
          <span className="font-serif tracking-tight">Gemini Live Voice</span>
        </button>
      </div>

      {/* Main View Area */}
      <main className="flex-1 w-full pt-16">
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
              <DashboardView onNavigate={setCurrentView} settings={settings} />
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
      </main>

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

      {/* Bottom Nav Bar */}
      <BottomNav
        currentView={currentView}
        onSelectView={setCurrentView}
        settings={settings}
      />
    </div>
  );
}
