import React, { useState } from 'react';
import { AppSettings, FamilyTreeData, UserProfile } from './types';
import { initialFamilyTree, defaultLegalSteps } from './data/mockData';

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

export default function App() {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [treeData, setTreeData] = useState<FamilyTreeData>(initialFamilyTree);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authOpen, setAuthOpen] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  // Sync state tracking
  const [syncState, setSyncState] = useState<'synced' | 'pending' | 'syncing' | 'offline'>('pending');
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(1);

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

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleUpdateTree = (updatedTree: FamilyTreeData) => {
    setTreeData(updatedTree);
    setSyncState('pending');
    setPendingSyncCount((prev) => prev + 1);
  };

  const handleSyncNow = () => {
    setSyncState('syncing');
    setTimeout(() => {
      setSyncState('synced');
      setPendingSyncCount(0);
    }, 1200);
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

      {/* Main View Area */}
      <main className="flex-1 w-full pt-16">
        {currentView === 'senior' ? (
          <SeniorModeView onNavigate={setCurrentView} settings={settings} onUpdateSettings={handleUpdateSettings} />
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
              />
            )}
            {currentView === 'calculator' && (
              <CalculatorView
                tree={treeData}
                steps={defaultLegalSteps}
                settings={settings}
              />
            )}
            {currentView === 'interview' && (
              <AiInterviewView settings={settings} />
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
                <DisputeRiskRadar settings={settings} onNavigate={setCurrentView} />
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
                <AiJudgeCourtroomView tree={treeData} settings={settings} onNavigate={setCurrentView} />
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
