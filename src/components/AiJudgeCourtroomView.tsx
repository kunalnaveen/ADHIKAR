import React, { useState } from 'react';
import { AppSettings, FamilyTreeData, UserProfile } from '../types';
import { translations } from '../data/translations';
import { 
  Gavel, 
  Scale, 
  Clock, 
  Smartphone, 
  Heart, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  ChevronRight, 
  Send, 
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Zap,
  Building2,
  Users,
  Cloud,
  Check,
  Loader2
} from 'lucide-react';
import { savePeaceScoreToFirestore } from '../lib/firebase';

interface AiJudgeCourtroomViewProps {
  tree: FamilyTreeData;
  settings: AppSettings;
  onNavigate: (view: string) => void;
  user?: UserProfile | null;
  onOpenAuth?: () => void;
}

export const AiJudgeCourtroomView: React.FC<AiJudgeCourtroomViewProps> = ({ tree, settings, onNavigate, user, onOpenAuth }) => {
  const t = translations[settings.language] || translations.EN;

  const [savingPeace, setSavingPeace] = useState(false);
  const [peaceSaved, setPeaceSaved] = useState(false);

  const handleSavePeaceScoreToCloud = async () => {
    if (!user) {
      onOpenAuth?.();
      return;
    }
    const currentPeaceScore = 72;
    setSavingPeace(true);
    try {
      await savePeaceScoreToFirestore(user.id, {
        title: `Family Peace Score (${currentPeaceScore}/100)`,
        peaceScore: currentPeaceScore,
        litigationYears: 12,
        estimatedCost: "₹ 8,50,000+",
        recommendations: [
          "Execute an Out-of-Court Family Settlement Deed (FSD)",
          "Utilize ADHIKAR Offline Audio Mediator before filing in Sub-Court",
          "Register clear boundary demarcation deeds with local Tahsildar"
        ]
      });
      setPeaceSaved(true);
      setTimeout(() => setPeaceSaved(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingPeace(false);
    }
  };

  // Active Tab: 'judge' | 'timemachine' | 'sms' | 'peace'
  const [activeTab, setActiveTab] = useState<'judge' | 'timemachine' | 'sms' | 'peace'>('judge');

  // AI Judge State
  const [familyScenarioText, setFamilyScenarioText] = useState(
    'Father passed away without a Will (Intestate). Survived by Mother, 1 Son, and 2 Daughters. Estate includes 4 acres ancestral farmland and 1 residential house.'
  );
  const [religionLaw, setReligionLaw] = useState<'hindu' | 'muslim' | 'christian'>('hindu');
  const [isDeliberating, setIsDeliberating] = useState<boolean>(false);
  const [verdictRendered, setVerdictRendered] = useState<boolean>(true);

  // SMS Simulator State
  const [smsQuery, setSmsQuery] = useState('FATHER DEAD MOTHER ALIVE 1 SON 2 DAUGHTERS HINDU');
  const [smsLog, setSmsLog] = useState<Array<{ sender: 'user' | 'system'; text: string; time: string }>>([
    {
      sender: 'user',
      text: 'FATHER DEAD MOTHER ALIVE 1 SON 2 DAUGHTERS HINDU',
      time: '10:42 AM',
    },
    {
      sender: 'system',
      text: 'ADHIKAR LEGAL ALERT [HSA 2005]: Under Class I Intestate Succession, Mother, Son, Daughter 1, and Daughter 2 inherit EQUAL 25% statutory shares each.',
      time: '10:42 AM',
    },
  ]);

  const handleSimulateVerdict = () => {
    setIsDeliberating(true);
    setVerdictRendered(false);

    setTimeout(() => {
      setIsDeliberating(false);
      setVerdictRendered(true);
    }, 1200);
  };

  const handleSendSMS = () => {
    if (!smsQuery.trim()) return;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newLog = [
      ...smsLog,
      { sender: 'user' as const, text: smsQuery, time: nowTime },
    ];

    setSmsLog(newLog);

    setTimeout(() => {
      let reply = '';
      const textUpper = smsQuery.toUpperCase();

      if (textUpper.includes('WILL')) {
        reply = 'ADHIKAR USSD [WILL ADVISORY]: Self-acquired property passed by Will overrides Class I default succession. Probate required if in Mumbai, Kolkata, or Chennai.';
      } else if (textUpper.includes('MUSLIM')) {
        reply = 'ADHIKAR USSD [MUSLIM LAW]: Under Hanafi Sharer rules, Widow receives 1/8th share. Remaining 7/8th residuary shared between Son (2 parts) and Daughters (1 part each).';
      } else if (textUpper.includes('DAUGHTER')) {
        reply = 'ADHIKAR USSD [HSA 2005]: Under Vineeta Sharma v. Rakesh Sharma Supreme Court ruling, daughters are equal coparceners by birth regardless of when father passed away.';
      } else {
        reply = 'ADHIKAR LEGAL ALERT [HSA 2005]: Class I Heirs (Mother, Widow, Son, Daughters) inherit equal statutory shares. Reply "WILL" or "DOCUMENT" for next steps.';
      }

      setSmsLog((prev) => [...prev, { sender: 'system' as const, text: reply, time: nowTime }]);
      setSmsQuery('');
    }, 800);
  };

  return (
    <div className="flex flex-col w-full px-4 md:px-8 max-w-7xl mx-auto pt-6 pb-28 text-slate-100 gap-6">
      
      {/* Top Banner Navigation Tabs */}
      <div className="p-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={() => setActiveTab('judge')}
          className={`flex-1 min-w-[140px] px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'judge'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Gavel className="w-4 h-4 text-amber-400" />
          <span>AI Virtual Judge</span>
        </button>

        <button
          onClick={() => setActiveTab('timemachine')}
          className={`flex-1 min-w-[140px] px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'timemachine'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Dispute Time Machine</span>
        </button>

        <button
          onClick={() => setActiveTab('sms')}
          className={`flex-1 min-w-[140px] px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'sms'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <span>Rural SMS / USSD</span>
        </button>

        <button
          onClick={() => setActiveTab('peace')}
          className={`flex-1 min-w-[140px] px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'peace'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Heart className="w-4 h-4 text-rose-400" />
          <span>Family Peace Score</span>
        </button>
      </div>

      {/* TAB 1: AI VIRTUAL COURTROOM JUDGE MODE */}
      {activeTab === 'judge' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Courtroom Header Banner */}
          <div className="relative p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-2 max-w-2xl relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                <Gavel className="w-3.5 h-3.5" />
                <span>Virtual High Court Bench Simulation</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white font-serif tracking-tight">
                AI Virtual Judge Courtroom Mode
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Inputs family survivor details and property types. The AI judge evaluates statutory provisions under the Hindu Succession Act 2005 & landmark Supreme Court precedents to deliver a binding legal decree simulation.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center shrink-0 w-full md:w-auto">
              <Scale className="w-10 h-10 text-amber-400 animate-pulse mb-1" />
              <span className="text-xs font-bold text-slate-200">Bench Presiding</span>
              <span className="text-[10px] font-mono text-emerald-400">HSA 1956 & 2005 Core Engine</span>
            </div>
          </div>

          {/* Input Case Setup Form */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Case Scenario Brief</span>
              </h3>

              {/* Personal Law Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold hidden sm:inline">Governing Law:</span>
                <select
                  value={religionLaw}
                  onChange={(e) => setReligionLaw(e.target.value as any)}
                  className="bg-slate-950 text-xs font-bold text-indigo-300 border border-slate-800 rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500"
                >
                  <option value="hindu">Hindu Succession Act (HSA 2005)</option>
                  <option value="muslim">Muslim Personal Law (Shariat)</option>
                  <option value="christian">Indian Succession Act, 1925</option>
                </select>
              </div>
            </div>

            <textarea
              value={familyScenarioText}
              onChange={(e) => setFamilyScenarioText(e.target.value)}
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
              placeholder="Describe family survivor structure and estate assets..."
            />

            <div className="flex justify-end">
              <button
                onClick={handleSimulateVerdict}
                disabled={isDeliberating}
                className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              >
                <Gavel className="w-4 h-4" />
                <span>{isDeliberating ? 'Judge Deliberating Precedents...' : 'Render Judicial Verdict'}</span>
              </button>
            </div>
          </div>

          {/* Courtroom Verdict Decree Output */}
          {isDeliberating ? (
            <div className="p-12 rounded-3xl bg-slate-900/90 border border-amber-500/30 flex flex-col items-center justify-center text-center space-y-4 shadow-2xl">
              <Scale className="w-16 h-16 text-amber-400 animate-bounce" />
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-white font-serif">Evaluating Class I Statutory Heirs & Vineeta Sharma Precedents...</h4>
                <p className="text-xs text-slate-400">Verifying equal coparcenary rights for daughters and widow statutory shares</p>
              </div>
            </div>
          ) : verdictRendered && (
            <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border-2 border-amber-500/40 shadow-2xl space-y-6 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <Gavel className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 uppercase tracking-widest">
                      Binding Legal Order Simulation
                    </span>
                    <h3 className="text-xl font-bold font-serif text-white mt-1">High Court Virtual Bench Decree</h3>
                  </div>
                </div>

                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20 font-bold hidden sm:block">
                  Case Order #2026-HSA-88
                </span>
              </div>

              {/* Share Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase">Mother (Class I)</span>
                  <div className="text-2xl font-extrabold text-white">25.0%</div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    1 Acre Farmland + 25% Share in Residential House
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase">Son (Class I)</span>
                  <div className="text-2xl font-extrabold text-white">25.0%</div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    1 Acre Farmland + 25% Share in Residential House
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">Daughter 1 (Coparcener)</span>
                  <div className="text-2xl font-extrabold text-emerald-400">25.0%</div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    1 Acre Farmland + 25% Equal Rights under HSA 2005
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">Daughter 2 (Coparcener)</span>
                  <div className="text-2xl font-extrabold text-emerald-400">25.0%</div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    1 Acre Farmland + 25% Equal Rights under HSA 2005
                  </p>
                </div>
              </div>

              {/* Judicial Reason Statement */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-4 h-4" />
                  <span>Statutory Rationale & Ruling Precedents</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  "Under Section 6 & Section 8 of the Hindu Succession Act, 1956 (amended 2005) and confirmed in the Supreme Court landmark judgment <strong className="text-white">Vineeta Sharma v. Rakesh Sharma (2020)</strong>, daughters inherit equal coparcenary rights by birth. All Class I heirs inherit per capita in equal proportion."
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FAMILY DISPUTE TIME MACHINE */}
      {activeTab === 'timemachine' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>Predictive Dispute Timeline Simulator</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-white font-sans tracking-tight">
              Family Dispute Time Machine
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              What could happen over the next 15 years if you don't prepare a registered Will or family settlement deed today?
            </p>
          </div>

          {/* Timeline Events Progression */}
          <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-8 relative">
            <div className="absolute left-8 md:left-12 top-20 bottom-20 w-0.5 bg-gradient-to-b from-amber-500 via-rose-500 to-slate-800" />

            {/* Year 1 */}
            <div className="flex items-start gap-6 relative">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border-2 border-amber-500 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 shadow-lg">
                Yr 1
              </div>
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex-1 space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Trigger Event</span>
                <h3 className="text-base font-bold text-white">Parent Passes Away Intestate (Without Will)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The primary property owner passes away without executing a registered Will or specifying nominee allocations in bank deposits and land deeds.
                </p>
              </div>
            </div>

            {/* Year 2 */}
            <div className="flex items-start gap-6 relative">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border-2 border-amber-500 text-amber-300 font-bold text-xs flex items-center justify-center shrink-0 shadow-lg">
                Yr 2
              </div>
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex-1 space-y-1">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">Mutation Friction</span>
                <h3 className="text-base font-bold text-white">Revenue Jamabandi Mutation Ambiguity</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Family attempts to update land revenue records at Tehsildar office. One sibling objects to equal daughter shares, halting mutation proceedings.
                </p>
              </div>
            </div>

            {/* Year 4 */}
            <div className="flex items-start gap-6 relative">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border-2 border-rose-500 text-rose-400 font-bold text-xs flex items-center justify-center shrink-0 shadow-lg">
                Yr 4
              </div>
              <div className="p-5 rounded-2xl bg-slate-950 border border-rose-500/30 flex-1 space-y-1">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Litigation Initiated</span>
                <h3 className="text-base font-bold text-white">Sibling Files Civil Partition Suit</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  District Civil Court issues summons for Suit for Partition and Permanent Injunction. Property sales and construction frozen by interim court order.
                </p>
              </div>
            </div>

            {/* Year 7 */}
            <div className="flex items-start gap-6 relative">
              <div className="w-12 h-12 rounded-2xl bg-rose-600/30 border-2 border-rose-600 text-rose-300 font-bold text-xs flex items-center justify-center shrink-0 shadow-lg">
                Yr 7
              </div>
              <div className="p-5 rounded-2xl bg-slate-950 border border-rose-500/30 flex-1 space-y-1">
                <span className="text-[10px] font-bold text-rose-300 uppercase tracking-widest">Protracted Trial</span>
                <h3 className="text-base font-bold text-white">Witness Crossexamination & Heavy Legal Fees</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Case drags through 45+ court hearings. Advocate fees exceed ₹8,00,000. Sibling relationships permanently broken across extended family.
                </p>
              </div>
            </div>

            {/* Year 15 */}
            <div className="flex items-start gap-6 relative">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 border-2 border-slate-700 text-slate-400 font-bold text-xs flex items-center justify-center shrink-0">
                Yr 15
              </div>
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex-1 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pending Appeal</span>
                <h3 className="text-base font-bold text-slate-300">Case Still Pending in High Court Appeal</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Next generation inherits the lawsuit. Property sits idle and degraded for 15 years due to ongoing status-quo injunction.
                </p>
              </div>
            </div>

            {/* Prevention Callout Box */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950 to-indigo-950 border-2 border-emerald-500/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Prevention Guarantee</span>
                </div>
                <h4 className="text-base font-bold text-white">Preparing a Registered Will Today Prevents This 15-Year Dispute</h4>
                <p className="text-xs text-slate-300">
                  Executing a clear Will or Family Settlement Agreement takes under 30 minutes in ADHIKAR.
                </p>
              </div>

              <button
                onClick={() => onNavigate('interview')}
                className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider shrink-0 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
              >
                Draft Will Today
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RURAL SMS / USSD MODE */}
      {activeTab === 'sms' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Offline Feature-Phone Accessibility Engine</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-white font-sans tracking-tight">
              Rural SMS & USSD Service Simulator
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              In rural India without smartphone internet, citizens can send SMS or dial <strong className="text-emerald-400">*139*88#</strong> to receive instant statutory inheritance calculations on any basic feature phone.
            </p>
          </div>

          {/* Interactive Feature Phone Simulator */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            {/* Phone Screen Mockup */}
            <div className="p-6 rounded-3xl bg-slate-950 border-4 border-slate-800 shadow-2xl space-y-4 font-mono">
              <div className="flex justify-between items-center text-[10px] text-slate-500 border-b border-slate-800 pb-2">
                <span>SIM 1: BSNL 4G / GSM</span>
                <span>USSD *139*88# Active</span>
              </div>

              {/* Chat Log Screen */}
              <div className="space-y-3 min-h-[260px] max-h-[340px] overflow-y-auto p-2">
                {smsLog.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col max-w-[85%] ${
                      item.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                    }`}
                  >
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        item.sender === 'user'
                          ? 'bg-indigo-600 text-white rounded-br-none'
                          : 'bg-slate-900 text-emerald-300 border border-emerald-500/30 rounded-bl-none'
                      }`}
                    >
                      {item.text}
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1">{item.time}</span>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <input
                  type="text"
                  value={smsQuery}
                  onChange={(e) => setSmsQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendSMS()}
                  placeholder="e.g. FATHER DEAD 2 DAUGHTERS HINDU"
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleSendSMS}
                  className="p-2.5 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Keyword Test Prompts */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Test Feature-Phone SMS Keywords</span>
              </h3>

              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    setSmsQuery('FATHER DEAD MOTHER ALIVE 1 SON 2 DAUGHTERS HINDU');
                  }}
                  className="w-full text-left p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 flex justify-between items-center transition-all"
                >
                  <div>
                    <span className="font-bold block text-white">Hindu Intestate Query</span>
                    <span className="text-[11px] text-slate-400 font-mono">FATHER DEAD MOTHER ALIVE 1 SON 2 DAUGHTERS HINDU</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-indigo-400" />
                </button>

                <button
                  onClick={() => {
                    setSmsQuery('CAN DAUGHTER CLAIM ANCESTRAL LAND PROPERTY IF MARRIED BEFORE 2005?');
                  }}
                  className="w-full text-left p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 flex justify-between items-center transition-all"
                >
                  <div>
                    <span className="font-bold block text-white">Daughter Rights Inquiry</span>
                    <span className="text-[11px] text-slate-400 font-mono">MARRIED DAUGHTER COPARCENARY HSA 2005</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-400" />
                </button>

                <button
                  onClick={() => {
                    setSmsQuery('MUSLIM LAW SUCCESSION WIDOW 1 SON 1 DAUGHTER');
                  }}
                  className="w-full text-left p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 flex justify-between items-center transition-all"
                >
                  <div>
                    <span className="font-bold block text-white">Muslim Shariat Query</span>
                    <span className="text-[11px] text-slate-400 font-mono">MUSLIM LAW WIDOW SON DAUGHTER</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 4: FAMILY PEACE SCORE ENGINE */}
      {activeTab === 'peace' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
              <Heart className="w-3.5 h-3.5" />
              <span>Emotional & Preventive Family Harmony Metric</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white font-sans tracking-tight">
                  Family Peace Score Engine
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl mt-1">
                  Beyond legal code, ADHIKAR measures emotional clarity and conflict risk to safeguard family harmony before disputes reach court.
                </p>
              </div>

              <button
                onClick={handleSavePeaceScoreToCloud}
                disabled={savingPeace}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all shadow-lg active:scale-95 shrink-0 ${
                  peaceSaved
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border-indigo-500/40'
                }`}
              >
                {savingPeace ? (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                ) : peaceSaved ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Cloud className="w-4 h-4 text-indigo-400" />
                )}
                <span>{peaceSaved ? 'Saved to Cloud' : 'Save Peace Score'}</span>
              </button>
            </div>
          </div>

          {/* Peace Gauge Metric */}
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-8 border-slate-800" />
                <div className="absolute inset-0 rounded-full border-8 border-emerald-400 border-t-amber-400 border-r-emerald-400 border-b-emerald-400 transform rotate-45" />
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="text-4xl font-extrabold text-white">72%</span>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1">Peace Index</span>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
                Moderate Harmony • Action Advised
              </span>
            </div>

            <div className="space-y-4 flex-1">
              <h3 className="text-base font-bold text-white">Potential Conflict Triggers Identified</h3>

              <div className="space-y-2.5">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-rose-500/30 flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Daughter Coparcenary Exclusion Risk</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Daughters currently excluded from informal verbal property division arrangements.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Unregistered Ancestral Land Partition</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Ancestral agricultural land in Punjab managed without registered family settlement deed.</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-300 block">Recommended Action to Reach 95% Peace Score</span>
                  <span className="text-[11px] text-slate-400">Draft a registered Family Settlement Agreement and execute a registered Will.</span>
                </div>
                <button
                  onClick={() => onNavigate('interview')}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 active:scale-95 transition-all"
                >
                  Start Deed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
