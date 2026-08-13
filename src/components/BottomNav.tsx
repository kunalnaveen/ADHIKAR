import React from 'react';
import { Home, GitFork, Calculator, Bot, Gavel, Shield, HardDrive } from 'lucide-react';
import { Language, AppSettings } from '../types';
import { translations } from '../data/translations';

interface BottomNavProps {
  currentView: string;
  onSelectView: (view: string) => void;
  settings: AppSettings;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onSelectView,
  settings,
}) => {
  const t = translations[settings.language] || translations.EN;

  const navItems = [
    { id: 'dashboard', label: t.home, icon: Home },
    { id: 'tree', label: t.network, icon: GitFork },
    { id: 'calculator', label: t.calc, icon: Calculator },
    { id: 'courtroom', label: 'Courtroom', icon: Gavel },
    { id: 'interview', label: t.assist, icon: Bot },
    { id: 'womensRights', label: t.womenRights.split(' ')[0], icon: Shield },
    { id: 'storage', label: t.storage, icon: HardDrive },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 w-full z-50 pb-safe transition-all duration-200 ${
      settings.seniorMode
        ? 'bg-[#001736] border-t-2 border-[#775a19] shadow-2xl py-1'
        : 'bg-slate-950/90 backdrop-blur-2xl border-t border-slate-800 shadow-2xl'
    }`}>
      <div className="flex justify-around items-center h-16 max-w-xl mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-12 transition-all rounded-xl my-auto ${
                isActive
                  ? settings.seniorMode
                    ? 'text-[#ffdea5] font-bold bg-[#775a19]/40'
                    : 'text-indigo-400 font-bold bg-indigo-600/10 border border-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Icon className={`transition-transform ${isActive ? 'scale-110' : ''} ${
                settings.seniorMode ? 'w-6 h-6' : 'w-5 h-5'
              }`} />
              <span className={`tracking-wide font-medium ${
                settings.seniorMode ? 'text-[11px] font-bold' : 'text-[10px]'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
