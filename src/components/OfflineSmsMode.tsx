import React, { useState } from 'react';
import { 
  Smartphone, 
  Send, 
  Copy, 
  Check, 
  Zap, 
  HelpCircle, 
  PhoneCall, 
  Info, 
  QrCode, 
  Radio, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  FileText
} from 'lucide-react';

interface OfflineSmsModeProps {
  onNavigate?: (view: string) => void;
}

export const OfflineSmsMode: React.FC<OfflineSmsModeProps> = ({ onNavigate }) => {
  // Schema Inputs
  const [religion, setReligion] = useState<'HINDU' | 'MUSLIM' | 'CHRISTIAN'>('HINDU');
  const [headStatus, setHeadStatus] = useState<'FATHER_DEAD' | 'MOTHER_DEAD'>('FATHER_DEAD');
  const [motherStatus, setMotherStatus] = useState<'MOTHER_ALIVE' | 'MOTHER_DEAD'>('MOTHER_ALIVE');
  const [numSons, setNumSons] = useState<number>(1);
  const [numDaughters, setNumDaughters] = useState<number>(2);
  const [willStatus, setWillStatus] = useState<'NO_WILL' | 'REGISTERED_WILL'>('NO_WILL');

  // Copy Feedback
  const [copied, setCopied] = useState(false);
  
  // Interactive Simulator Log
  const [simLogs, setSimLogs] = useState<Array<{ sender: 'user' | 'system'; text: string; time: string }>>([
    {
      sender: 'user',
      text: 'ADHIKAR HINDU FATHER_DEAD MOTHER_ALIVE 1_SON 2_DAUGHTERS NO_WILL',
      time: '11:05 AM',
    },
    {
      sender: 'system',
      text: 'ADHIKAR AUTO-RESPONDER [HSA 2005]: Under Intestate Succession, estate is divided into 4 equal Class I shares (25% each) between Mother, Son, Daughter 1, and Daughter 2. Equal coparcenary rights apply under Vineeta Sharma precedent.',
      time: '11:05 AM',
    },
  ]);

  // Construct Standardized SMS Payload
  const generatedSchemaText = `ADHIKAR ${religion} ${headStatus} ${motherStatus} ${numSons}_SON ${numDaughters}_DAUGHTERS ${willStatus}`;

  // Parse and Compute Auto-Response
  const computeAutoResponse = (rawText: string) => {
    const uppercaseText = rawText.toUpperCase();
    
    if (uppercaseText.includes('MUSLIM')) {
      return `ADHIKAR AUTO-RESPONDER [SHARIAT]: Widow receives 1/8th fixed Quranic share. Residuary balance divided between Son (2 parts) and Daughters (1 part each).`;
    }
    
    if (uppercaseText.includes('REGISTERED_WILL') || uppercaseText.includes('WILL')) {
      return `ADHIKAR AUTO-RESPONDER [TESTAMENTARY]: Self-acquired property distributed as per Will terms overriding intestate defaults. Probate mandatory if in Presidency towns (Mumbai/Kolkata/Chennai).`;
    }

    if (uppercaseText.includes('CHRISTIAN')) {
      return `ADHIKAR AUTO-RESPONDER [ISA 1925]: Under Indian Succession Act Sec 33, Widow receives 1/3rd share. Remaining 2/3rd divided equally among all children.`;
    }

    // Default Hindu HSA 2005 calculation
    const totalHeirs = (motherStatus === 'MOTHER_ALIVE' ? 1 : 0) + numSons + numDaughters;
    const sharePercentage = (100 / Math.max(1, totalHeirs)).toFixed(1);

    return `ADHIKAR AUTO-RESPONDER [HSA 2005]: Under Class I Intestate Succession, estate is divided into ${totalHeirs} equal statutory shares (${sharePercentage}% each) among surviving Class I heirs (Mother, ${numSons} Son(s), ${numDaughters} Daughter(s)). Equal coparcenary applies.`;
  };

  const handleTestSend = () => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = generatedSchemaText;
    const systemReply = computeAutoResponse(userMsg);

    setSimLogs((prev) => [
      ...prev,
      { sender: 'user', text: userMsg, time: nowTime },
      { sender: 'system', text: systemReply, time: nowTime },
    ]);
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(generatedSchemaText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
      
      {/* Utility Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Smartphone className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wider">
                Offline Rural Infrastructure
              </span>
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                USSD Shortcode *139*88#
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold font-sans text-white mt-0.5">Offline SMS Mode Utility</h2>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 font-bold">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>SMS Gateway: 56161</span>
        </div>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
        Designed for non-smartphone users in remote rural areas without internet access. By sending a standardized SMS schema or dialing USSD, citizens receive automated, legally accurate inheritance calculations under Indian Personal Laws.
      </p>

      {/* Grid: Schema Builder + Live Feature Phone Responder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Standardized Schema Builder Form */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Standardized Message Schema Builder</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Schema Version 2.4</span>
          </div>

          <div className="space-y-3 text-xs">
            
            {/* Religion/Personal Law */}
            <div>
              <label className="text-slate-400 font-bold block mb-1">1. Applicable Personal Law</label>
              <select
                value={religion}
                onChange={(e) => setReligion(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 font-bold"
              >
                <option value="HINDU">HINDU (Hindu Succession Act 2005)</option>
                <option value="MUSLIM">MUSLIM (Shariat Personal Law)</option>
                <option value="CHRISTIAN">CHRISTIAN (Indian Succession Act 1925)</option>
              </select>
            </div>

            {/* Deceased Head & Mother Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 font-bold block mb-1">2. Deceased Title Holder</label>
                <select
                  value={headStatus}
                  onChange={(e) => setHeadStatus(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 font-bold"
                >
                  <option value="FATHER_DEAD">FATHER_DEAD</option>
                  <option value="MOTHER_DEAD">MOTHER_DEAD</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">3. Surviving Mother / Spouse</label>
                <select
                  value={motherStatus}
                  onChange={(e) => setMotherStatus(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 font-bold"
                >
                  <option value="MOTHER_ALIVE">MOTHER_ALIVE</option>
                  <option value="MOTHER_DEAD">MOTHER_DEAD</option>
                </select>
              </div>
            </div>

            {/* Number of Sons & Daughters */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 font-bold block mb-1">4. Surviving Sons</label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={numSons}
                  onChange={(e) => setNumSons(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">5. Surviving Daughters</label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={numDaughters}
                  onChange={(e) => setNumDaughters(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 font-mono font-bold"
                />
              </div>
            </div>

            {/* Will Execution Status */}
            <div>
              <label className="text-slate-400 font-bold block mb-1">6. Will Status</label>
              <select
                value={willStatus}
                onChange={(e) => setWillStatus(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 font-bold"
              >
                <option value="NO_WILL">NO_WILL (Intestate)</option>
                <option value="REGISTERED_WILL">REGISTERED_WILL (Testamentary)</option>
              </select>
            </div>

          </div>

          {/* Formatted Generated Output Command Box */}
          <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-2">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">
              Formatted Standardized SMS Payload
            </span>
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-emerald-300 font-bold break-all">
              {generatedSchemaText}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleCopySchema}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy Payload'}</span>
              </button>

              <a
                href={`sms:56161?body=${encodeURIComponent(generatedSchemaText)}`}
                className="flex-1 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-emerald-500/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send SMS to 56161</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right: Feature Phone Simulator Screen */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-950 border-4 border-slate-800 shadow-2xl space-y-4 font-mono">
          <div className="flex justify-between items-center text-[10px] text-slate-500 border-b border-slate-800 pb-2">
            <span>BSNL / Airtel GSM Network</span>
            <span className="text-emerald-400 font-bold">Auto-Responder Live</span>
          </div>

          {/* Chat / SMS Log Window */}
          <div className="space-y-3 min-h-[260px] max-h-[320px] overflow-y-auto p-2">
            {simLogs.map((log, idx) => (
              <div
                key={idx}
                className={`flex flex-col max-w-[88%] ${
                  log.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                }`}
              >
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    log.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-slate-900 text-emerald-300 border border-emerald-500/30 rounded-bl-none'
                  }`}
                >
                  {log.text}
                </div>
                <span className="text-[9px] text-slate-500 mt-1">{log.time}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleTestSend}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>Simulate Responder Calculation</span>
          </button>
        </div>

      </div>

    </div>
  );
};
