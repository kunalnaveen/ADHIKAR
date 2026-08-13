import React, { useState } from 'react';
import { AppSettings, Language } from '../types';
import { translations } from '../data/translations';
import { 
  Accessibility, 
  PhoneCall, 
  GitFork, 
  Calculator, 
  Bot, 
  ArrowRight, 
  ShieldCheck, 
  CheckSquare, 
  AlertTriangle, 
  Scale, 
  UserCheck, 
  History, 
  FolderLock, 
  Volume2, 
  Check, 
  Sparkles,
  Phone,
  X,
  Mic,
  Globe
} from 'lucide-react';

interface SeniorModeViewProps {
  onNavigate: (view: string) => void;
  settings: AppSettings;
  onUpdateSettings?: (newSettings: Partial<AppSettings>) => void;
  onOpenVoiceModal?: () => void;
}

export const SeniorModeView: React.FC<SeniorModeViewProps> = ({ 
  onNavigate, 
  settings,
  onUpdateSettings,
  onOpenVoiceModal
}) => {
  const t = translations[settings.language] || translations.EN;
  const [activeFeedback, setActiveFeedback] = useState<string | null>(null);
  const [showHelplineModal, setShowHelplineModal] = useState<boolean>(false);
  const [speakingText, setSpeakingText] = useState<boolean>(false);

  const handleAction = (viewKey: string, labelName: string) => {
    setActiveFeedback(`Opening ${labelName}...`);
    setTimeout(() => {
      setActiveFeedback(null);
      onNavigate(viewKey);
    }, 350);
  };

  const speakGuide = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance("Welcome to Senior Citizen Mode. Tap the large microphone button to speak your family details in English, Hindi, Tamil, Telugu, Malayalam, Kannada, Bengali, or Marathi.");
      utterance.rate = 0.9;
      setSpeakingText(true);
      utterance.onend = () => setSpeakingText(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setActiveFeedback("Audio guide: Tap any button to navigate.");
      setTimeout(() => setActiveFeedback(null), 2500);
    }
  };

  return (
    <div className="flex flex-col w-full px-4 md:px-8 max-w-5xl mx-auto pt-6 pb-32 text-slate-100 gap-6">
      
      {/* Immediate Interaction Feedback Toast */}
      {activeFeedback && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 text-white font-bold text-base px-6 py-3 rounded-2xl shadow-2xl border-2 border-indigo-300 flex items-center gap-3 animate-pulse">
          <Sparkles className="w-5 h-5 text-emerald-300" />
          <span>{activeFeedback}</span>
        </div>
      )}

      {/* Senior Mode Banner */}
      <div className="p-6 rounded-3xl bg-[#001736] border-2 border-[#775a19] shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#775a19] flex items-center justify-center text-[#ffdea5] shrink-0 border border-[#ffdea5]/40 shadow-lg">
            <Accessibility className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl md:text-3xl font-bold font-serif text-[#ffdea5]">Senior Citizen Portal</h2>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-500/30">
                Large Touch Target Mode
              </span>
            </div>
            <p className="text-base text-slate-200 mt-1">
              High contrast, enlarged text, and simplified 1-touch legal tools.
            </p>
          </div>
        </div>

        {/* Quick Voice Assistant Audio Guide */}
        <button
          onClick={speakGuide}
          className={`px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2.5 shadow-lg active:scale-95 transition-all shrink-0 border ${
            speakingText
              ? 'bg-amber-500 text-slate-950 border-amber-300 animate-pulse'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400'
          }`}
        >
          <Volume2 className="w-5 h-5 text-emerald-300" />
          <span>{speakingText ? "Reading Guide..." : "Listen Audio Guide"}</span>
        </button>
      </div>

      {/* Voice-First Hero Card for Senior Citizens */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border-2 border-indigo-500/50 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Mic className="w-6 h-6 text-emerald-400 animate-pulse" />
              <h3 className="text-xl md:text-2xl font-bold text-white font-serif">Voice-First Gemini AI</h3>
            </div>
            <p className="text-sm text-slate-300">
              No typing needed! Speak naturally in English, Hindi, Tamil, Telugu, Malayalam, Kannada, Bengali, or Marathi.
            </p>
          </div>

          <button
            onClick={onOpenVoiceModal}
            className="px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-extrabold text-base flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all shrink-0 border-2 border-emerald-300/40"
          >
            <Mic className="w-6 h-6 text-amber-300 animate-bounce" />
            <span>Tap & Speak Now</span>
          </button>
        </div>

        {/* Spoken Language Quick Pills */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-indigo-300 uppercase shrink-0 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5" />
            8 Languages:
          </span>
          {['English', 'हिन्दी', 'தமிழ்', 'తెలుగు', 'മലയാളം', 'ಕನ್ನಡ', 'বাংলা', 'मराठी'].map((langName, idx) => (
            <button
              key={idx}
              onClick={onOpenVoiceModal}
              className="px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 text-xs font-bold shrink-0 hover:bg-slate-800"
            >
              {langName}
            </button>
          ))}
        </div>
      </div>

      {/* High Priority 3 Core Step Modules */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-[#ffdea5] font-serif uppercase tracking-wider">Primary Legal Tasks</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1 */}
          <button
            onClick={() => handleAction('tree', 'Family Tree Network')}
            className="bg-slate-900/90 hover:bg-slate-800 border-2 border-indigo-500/40 rounded-3xl p-6 flex flex-col justify-between text-left shadow-xl active:scale-98 transition-all group min-h-[160px]"
          >
            <div className="flex items-center justify-between w-full mb-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
                <GitFork className="w-6 h-6" />
              </div>
              <span className="text-xs font-extrabold text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-400/30">
                Step 1
              </span>
            </div>
            <div>
              <h4 className="text-xl font-bold text-white font-serif group-hover:text-indigo-300 transition-colors">
                Map Family Tree
              </h4>
              <p className="text-sm text-slate-300 mt-1">
                Visual lineage builder with heir calculation.
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-indigo-400 mt-4 pt-2 border-t border-slate-800">
              <span>Open Tree Builder</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Step 2 */}
          <button
            onClick={() => handleAction('calculator', 'Property Share Calculator')}
            className="bg-slate-900/90 hover:bg-slate-800 border-2 border-emerald-500/40 rounded-3xl p-6 flex flex-col justify-between text-left shadow-xl active:scale-98 transition-all group min-h-[160px]"
          >
            <div className="flex items-center justify-between w-full mb-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-md">
                <Calculator className="w-6 h-6" />
              </div>
              <span className="text-xs font-extrabold text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-400/30">
                Step 2
              </span>
            </div>
            <div>
              <h4 className="text-xl font-bold text-white font-serif group-hover:text-emerald-300 transition-colors">
                Calculate Shares
              </h4>
              <p className="text-sm text-slate-300 mt-1">
                HSA 2005 Hindu Succession Act share split.
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400 mt-4 pt-2 border-t border-slate-800">
              <span>Calculate Property</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Step 3 */}
          <button
            onClick={() => handleAction('interview', 'AI Voice Assistant')}
            className="bg-slate-900/90 hover:bg-slate-800 border-2 border-amber-500/40 rounded-3xl p-6 flex flex-col justify-between text-left shadow-xl active:scale-98 transition-all group min-h-[160px]"
          >
            <div className="flex items-center justify-between w-full mb-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-600 flex items-center justify-center text-white shrink-0 shadow-md">
                <Bot className="w-6 h-6" />
              </div>
              <span className="text-xs font-extrabold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30">
                Step 3
              </span>
            </div>
            <div>
              <h4 className="text-xl font-bold text-white font-serif group-hover:text-amber-300 transition-colors">
                Voice Assistant
              </h4>
              <p className="text-sm text-slate-300 mt-1">
                Ask legal questions in native voice.
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-amber-400 mt-4 pt-2 border-t border-slate-800">
              <span>Start Voice Assistant</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* Secondary Direct Touch Features Grid */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-[#ffdea5] font-serif uppercase tracking-wider">Additional Senior Legal Tools</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Health Index */}
          <button
            onClick={() => handleAction('health', 'Inheritance Health Score')}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 p-4 rounded-2xl flex items-center gap-3.5 text-left active:scale-95 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-bold text-white block group-hover:text-purple-300">Health Audit</span>
              <span className="text-xs text-slate-400">0-100 Estate Index</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
          </button>

          {/* Legal Readiness */}
          <button
            onClick={() => handleAction('checkup', 'Legal Readiness Checklist')}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 p-4 rounded-2xl flex items-center gap-3.5 text-left active:scale-95 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 shrink-0">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-bold text-white block group-hover:text-emerald-300">Legal Checkup</span>
              <span className="text-xs text-slate-400">Will & Title Verification</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
          </button>

          {/* Risk Radar */}
          <button
            onClick={() => handleAction('radar', 'Dispute Risk Radar')}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 p-4 rounded-2xl flex items-center gap-3.5 text-left active:scale-95 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-300 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-bold text-white block group-hover:text-rose-300">Dispute Radar</span>
              <span className="text-xs text-slate-400">Litigation Risk Meter</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
          </button>

          {/* What-If Simulator */}
          <button
            onClick={() => handleAction('simulator', 'Inheritance Simulator')}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 p-4 rounded-2xl flex items-center gap-3.5 text-left active:scale-95 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-bold text-white block group-hover:text-indigo-300">Share Simulator</span>
              <span className="text-xs text-slate-400">Test Life Events</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
          </button>

          {/* Women's Rights */}
          <button
            onClick={() => handleAction('womensRights', 'Women\'s Rights Center')}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 p-4 rounded-2xl flex items-center gap-3.5 text-left active:scale-95 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-bold text-white block group-hover:text-cyan-300">Women's Parity</span>
              <span className="text-xs text-slate-400">Coparcenary Protections</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
          </button>

          {/* Offline Document Vault */}
          <button
            onClick={() => handleAction('storage', 'Document Vault')}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 p-4 rounded-2xl flex items-center gap-3.5 text-left active:scale-95 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0">
              <FolderLock className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-bold text-white block group-hover:text-amber-300">Document Vault</span>
              <span className="text-xs text-slate-400">Offline Deed Caching</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
          </button>
        </div>
      </div>

      {/* Floating Emergency Helpline Button */}
      <div className="fixed bottom-20 right-6 z-40">
        <button
          onClick={() => setShowHelplineModal(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-5 py-3.5 rounded-2xl flex items-center gap-2.5 shadow-2xl border-2 border-emerald-300 animate-bounce active:scale-95 transition-all"
        >
          <PhoneCall className="w-5 h-5 text-emerald-100" />
          <span>Senior Helpline 14567</span>
        </button>
      </div>

      {/* Helpline Direct Modal */}
      {showHelplineModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-emerald-500 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-6 h-6 text-emerald-400" />
                <h3 className="text-xl font-bold text-white font-serif">Elderline Toll-Free 14567</h3>
              </div>
              <button 
                onClick={() => setShowHelplineModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Elderline (14567) is the National Helpline for Senior Citizens providing free legal counseling, pension guidance, and estate dispute support across India.
            </p>

            <div className="flex gap-3 pt-2">
              <a
                href="tel:14567"
                onClick={() => setShowHelplineModal(false)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg"
              >
                <Phone className="w-4 h-4" />
                <span>Call 14567 Now</span>
              </a>
              <button
                onClick={() => setShowHelplineModal(false)}
                className="px-4 py-3 rounded-2xl bg-slate-800 text-slate-300 text-sm font-bold hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
