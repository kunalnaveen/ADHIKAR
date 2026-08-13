import React from 'react';
import { AppSettings } from '../types';
import { translations } from '../data/translations';
import { legalAlertsList } from '../data/mockData';
import { 
  Bot, 
  ShieldCheck, 
  GitFork, 
  ArrowRight, 
  Network, 
  PieChart, 
  UserCheck, 
  Mic, 
  Gavel, 
  Bell, 
  FileText, 
  Sparkles, 
  FolderLock,
  AlertTriangle,
  Scale,
  Activity,
  History,
  CheckSquare,
  Compass,
  Building2,
  CheckCircle2,
  Clock,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';
import { SecureDocumentVault } from './SecureDocumentVault';
import { PropertyOwnershipMap } from './PropertyOwnershipMap';
import { GovOfficeNavigator } from './GovOfficeNavigator';

import { OfflineSmsMode } from './OfflineSmsMode';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
  settings: AppSettings;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, settings }) => {
  const t = translations[settings.language] || translations.EN;

  return (
    <div className="flex flex-col w-full gap-6 px-4 md:px-8 max-w-7xl mx-auto pt-6 pb-28 text-slate-100">
      
      {/* Homepage Banner: Dispute Prevention & Live Metrics */}
      <div className="relative w-full rounded-3xl p-6 md:p-8 bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border-2 border-indigo-500/40 shadow-2xl overflow-hidden space-y-6">
        
        {/* Ambient Radial Background Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>National Preventive Legal Impact Mission</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white font-serif tracking-tight leading-tight">
            Prevent tomorrow's property dispute today.
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            In India, millions of families face decades of costly courtroom litigation simply because property ownership, wills, and statutory succession rights were left unrecorded. ADHIKAR protects your family legacy before disputes arise.
          </p>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
          
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1 backdrop-blur-md">
            <div className="flex items-center gap-2 text-rose-400">
              <TrendingUp className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Judicial Backlog</span>
            </div>
            <div className="text-2xl md:text-3xl font-black font-mono text-white">55.8M+</div>
            <p className="text-[11px] text-slate-400">Pending Cases in Indian Courts</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1 backdrop-blur-md">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Unprotected Estates</span>
            </div>
            <div className="text-2xl md:text-3xl font-black font-mono text-amber-400">84%</div>
            <p className="text-[11px] text-slate-400">Families Have No Registered Will</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1 backdrop-blur-md">
            <div className="flex items-center gap-2 text-cyan-400">
              <Clock className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Litigation Duration</span>
            </div>
            <div className="text-2xl md:text-3xl font-black font-mono text-cyan-300">~20 Years</div>
            <p className="text-[11px] text-slate-400">Average Property Dispute Timeline</p>
          </div>

        </div>

        {/* Feature Checklist Pillars / Call to Action Grid */}
        <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative z-10">
          
          <button
            onClick={() => onNavigate('calculator')}
            className="flex items-center justify-between gap-2 text-xs font-bold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 p-3 rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 transition-all text-left group"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Check Inheritance Rights</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
          </button>

          <button
            onClick={() => onNavigate('interview')}
            className="flex items-center justify-between gap-2 text-xs font-bold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 p-3 rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 transition-all text-left group"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Generate Legal Documents</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
          </button>

          <button
            onClick={() => onNavigate('womensRights')}
            className="flex items-center justify-between gap-2 text-xs font-bold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 p-3 rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 transition-all text-left group"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Understand Succession Laws</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
          </button>

          <button
            onClick={() => onNavigate('health')}
            className="flex items-center justify-between gap-2 text-xs font-bold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 p-3 rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 transition-all text-left group"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Prevent Family Disputes</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
          </button>

        </div>

      </div>

      {/* Hero Section */}
      <div className="relative w-full rounded-2xl overflow-hidden shadow-xl bg-slate-900 border border-slate-800 min-h-[260px] md:min-h-[280px] flex flex-col justify-end p-6 md:p-8">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuA14ierbs_gbcqaDqy2826x6ZqzngQUKXZLcsY0dGIVMVME1784q-KFENL7EH5ambalsQAp1kveEQwFhFxX3bIpRxQnloirOJPZ-pr3_bIulG3pVDyuac8zzuE3BopSMix5sELc4GG39pkqdnP5pqZyQo3nFsr5k69P5uvE0ie90e9iEMVP2xF24GZaQj3ZSd2N9mxVgnXvHsNGyEmpd8zv3Rq6mZAG3ZM4k7TrGjiPYcoPYmSVzdWW6g')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />

        <div className="relative z-10 flex flex-col items-start gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Legal Core • HSA 2005 Compliant</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white leading-tight font-sans">
            {t.knowYourRights}
          </h1>
          <p className="text-sm md:text-base text-slate-400 max-w-xl mb-2">
            {t.heroSub}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('interview')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl flex items-center gap-2.5 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
            >
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>{t.startInterview}</span>
            </button>

            <button
              onClick={() => onNavigate('radar')}
              className="bg-slate-950/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs uppercase tracking-wider px-5 py-3.5 rounded-xl flex items-center gap-2 shadow-md active:scale-95 transition-all"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Risk Radar Engine</span>
            </button>
          </div>
        </div>
      </div>

      {/* Advanced AI Intelligence Modules Bento Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">AI Enhancement Modules</h2>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
            5 New Engines Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Module 0: AI Virtual Judge Courtroom & Time Machine */}
          <button
            onClick={() => onNavigate('courtroom')}
            className="w-full bg-slate-900/50 hover:bg-slate-900 text-left rounded-2xl p-5 border border-amber-500/30 hover:border-amber-400/60 shadow-lg shadow-amber-500/5 transition-all group flex flex-col justify-between space-y-3 relative overflow-hidden sm:col-span-2 lg:col-span-1"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Gavel className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                Virtual Courtroom
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">AI Virtual Judge & Time Machine</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                Simulate court rulings, 15-year dispute timeline projections, rural SMS mode & family peace score.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-amber-400 pt-2 border-t border-slate-800/80 w-full">
              <span>Open Virtual Courtroom</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
          
          {/* Module 1: Dispute Risk Radar */}
          <button
            onClick={() => onNavigate('radar')}
            className="w-full bg-slate-900/50 hover:bg-slate-900 text-left rounded-2xl p-5 border border-slate-800 hover:border-rose-500/40 shadow-sm transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                Predictive Risk
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors">Dispute Risk Radar</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                Predict future legal dispute probability (0-100) using family complexity & land title parameters.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-rose-400 pt-2 border-t border-slate-800/80 w-full">
              <span>Launch Radar Engine</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Module 2: What Happens If? Simulator */}
          <button
            onClick={() => onNavigate('simulator')}
            className="w-full bg-slate-900/50 hover:bg-slate-900 text-left rounded-2xl p-5 border border-slate-800 hover:border-indigo-500/40 shadow-sm transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Scale className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                Digital Twin
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">"What Happens If?" Simulator</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                Simulate birth, marriage, adoption, and property sale events with instant share recalculation.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-indigo-400 pt-2 border-t border-slate-800/80 w-full">
              <span>Run Scenario Simulator</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Module 3: Inheritance Health Score */}
          <button
            onClick={() => onNavigate('health')}
            className="w-full bg-slate-900/50 hover:bg-slate-900 text-left rounded-2xl p-5 border border-slate-800 hover:border-emerald-500/40 shadow-sm transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                Index Audit
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">Inheritance Health Score</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                Composite 0-100 readiness index evaluating Wills, property deeds, and family documentation.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-emerald-400 pt-2 border-t border-slate-800/80 w-full">
              <span>View Audit Breakdown</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Module 4: Family Legacy Timeline */}
          <button
            onClick={() => onNavigate('timeline')}
            className="w-full bg-slate-900/50 hover:bg-slate-900 text-left rounded-2xl p-5 border border-slate-800 hover:border-purple-500/40 shadow-sm transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <History className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                Generational Flow
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">Family Legacy Timeline</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                Interactive multi-generational timeline tracking asset transfers from grandparents down to children.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-purple-400 pt-2 border-t border-slate-800/80 w-full">
              <span>Explore Generational Graph</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Module 5: Legal Readiness Checkup */}
          <button
            onClick={() => onNavigate('checkup')}
            className="w-full bg-slate-900/50 hover:bg-slate-900 text-left rounded-2xl p-5 border border-slate-800 hover:border-amber-500/40 shadow-sm transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                Checklist Audit
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">Legal Readiness Checkup</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                Guided checklist verifying Wills, Jamabandi revenue cards, nominees, and identity proofs.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-amber-400 pt-2 border-t border-slate-800/80 w-full">
              <span>Start Legal Checklist</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Module 6: Women's Rights Center */}
          <button
            onClick={() => onNavigate('womensRights')}
            className="w-full bg-slate-900/50 hover:bg-slate-900 text-left rounded-2xl p-5 border border-slate-800 hover:border-indigo-500/40 shadow-sm transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-indigo-300" />
              </div>
              <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                Rights & Protection
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-indigo-200 transition-colors">Women's Rights Insight Center</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                Equal coparcenary rights for daughters, widows, and mothers under HSA 2005 & Vineeta Sharma judgment.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-indigo-300 pt-2 border-t border-slate-800/80 w-full">
              <span>Open Rights Center</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

        </div>
      </div>

      {/* Interactive Property Ownership Map & Dynamic Pie Chart */}
      <div id="property-ownership-section">
        <PropertyOwnershipMap />
      </div>

      {/* Government Office Navigator Component */}
      <div id="gov-navigator-section">
        <GovOfficeNavigator />
      </div>

      {/* Offline SMS & USSD Gateway Utility */}
      <div id="offline-sms-section">
        <OfflineSmsMode onNavigate={onNavigate} />
      </div>

      {/* Quick Stats Bento */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-5 border border-slate-800 flex flex-col justify-center shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          <ShieldCheck className="w-6 h-6 text-emerald-400 mb-2" />
          <span className="text-2xl md:text-3xl font-bold text-white tracking-tight">1.2k+</span>
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">{t.disputesPrevented}</span>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-5 border border-slate-800 flex flex-col justify-center shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
          <GitFork className="w-6 h-6 text-indigo-400 mb-2" />
          <span className="text-2xl md:text-3xl font-bold text-white tracking-tight">5k+</span>
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">{t.successionsAnalyzed}</span>
        </div>
      </div>

      {/* Secure Document Vault Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FolderLock className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">Legal Document Vault & Deadline Calendar</h2>
        </div>
        <SecureDocumentVault settings={settings} />
      </div>

      {/* Legal Alerts Feed */}
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight mb-4">{t.legalAlerts}</h2>
        <div className="flex flex-col gap-3">
          {legalAlertsList.map((alert) => (
            <div key={alert.id} className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800 shadow-sm flex gap-4 items-start relative overflow-hidden hover:bg-slate-900 transition-colors">
              <div className="w-1.5 h-full bg-indigo-500 absolute left-0 top-0" />
              <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center shrink-0 ml-1">
                <Bell className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{alert.tag}</span>
                  <span className="text-[10px] text-slate-500">{alert.date}</span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{alert.title}</h4>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{alert.summary}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
