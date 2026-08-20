import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { t as translateText } from '../utils/translate';
import { 
  Mic, 
  MicOff, 
  Compass, 
  Sparkles, 
  CheckCircle2, 
  Volume2, 
  X, 
  Radio, 
  ArrowRight,
  Calculator,
  LayoutDashboard,
  GitFork,
  Scale,
  HeartHandshake,
  Accessibility,
  Gavel,
  ShieldAlert,
  HelpCircle,
  FileCheck2,
  HardDrive
} from 'lucide-react';

interface VoiceCommandListenerProps {
  currentLanguage: Language;
  onNavigate: (view: string) => void;
  activeView: string;
}

interface CommandMapping {
  viewId: string;
  label: string;
  icon: React.ElementType;
  keywords: string[];
  spokenResponseEn: string;
  spokenResponseHi: string;
}

const COMMAND_MAP: CommandMapping[] = [
  {
    viewId: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    keywords: ['dashboard', 'home', 'main', 'start', 'डैशबोर्ड', 'होम', 'मुख्य', 'शुरू', 'முகப்பு', 'హోమ్', 'ಮನೆ'],
    spokenResponseEn: 'Navigating to Dashboard',
    spokenResponseHi: 'डैशबोर्ड खोला जा रहा है'
  },
  {
    viewId: 'calculator',
    label: 'Calculator',
    icon: Calculator,
    keywords: ['calculator', 'calc', 'shares', 'split', 'math', 'calculate', 'कैलकुलेटर', 'हिसाब', 'गणना', 'बंटवारा', 'பகிர்வு', 'కాలిక్యులేటర్', 'ಕ್ಯಾಲ್ಕುಲೇಟರ್'],
    spokenResponseEn: 'Opening Inheritance Calculator',
    spokenResponseHi: 'विरासत कैलकुलेटर खोला जा रहा है'
  },
  {
    viewId: 'tree',
    label: 'Family Tree',
    icon: GitFork,
    keywords: ['tree', 'family tree', 'family', 'lineage', 'heirs', 'परिवार', 'ट्री', 'वंशवृक्ष', 'रिश्तेदार', 'குடும்ப மரம்', 'కుటుంబ వృక్షం'],
    spokenResponseEn: 'Opening Family Lineage Tree',
    spokenResponseHi: 'परिवार ट्री खोला जा रहा है'
  },
  {
    viewId: 'courtroom',
    label: 'AI Judge Courtroom',
    icon: Gavel,
    keywords: ['court', 'judge', 'courtroom', 'lawyer', 'hearing', 'अदालत', 'जज', 'कोर्ट', 'न्यायाधीश', 'सुनवाई', 'நீதிமன்றம்', 'కోర్టు'],
    spokenResponseEn: 'Entering AI Courtroom Bench',
    spokenResponseHi: 'न्यायाधीश अदालत कक्ष खोला जा रहा है'
  },
  {
    viewId: 'womensRights',
    label: "Women's Rights",
    icon: HeartHandshake,
    keywords: ['women', 'rights', 'daughter', 'widow', 'female', 'महिला', 'स्त्री', 'अधिकार', 'बेटी', 'विधवा', 'பெண்கள் உரிமை', 'మహిళా హక్కులు'],
    spokenResponseEn: "Opening Women's Rights & Coparcenary Module",
    spokenResponseHi: 'महिला अधिकार गाइड खोला जा रहा है'
  },
  {
    viewId: 'senior',
    label: 'Senior Mode',
    icon: Accessibility,
    keywords: ['senior', 'elder', 'large', 'grandpa', 'बुजुर्ग', 'सीनियर', 'बड़ा फॉन्ट', 'दादा', 'முதியோர்', 'సీనియర్'],
    spokenResponseEn: 'Enabling Senior Accessibility Mode',
    spokenResponseHi: 'सीनियर मोड चालू किया जा रहा है'
  },
  {
    viewId: 'radar',
    label: 'Dispute Radar',
    icon: ShieldAlert,
    keywords: ['radar', 'dispute', 'risk', 'fight', 'conflict', 'झगड़ा', 'विवाद', 'जोखिम', 'राडार', 'சிக்கல்', 'వివాదం'],
    spokenResponseEn: 'Opening Dispute Risk Radar',
    spokenResponseHi: 'विवाद जोखिम रडार खोला जा रहा है'
  },
  {
    viewId: 'simulator',
    label: 'What Happens If',
    icon: Scale,
    keywords: ['simulator', 'what if', 'scenario', 'अगर', 'सिम्युलेटर', 'परिदृश्य', 'என்ன நடக்கும்', 'ఏమి జరుగుతుంది'],
    spokenResponseEn: 'Opening Scenario Simulator',
    spokenResponseHi: 'परिदृश्य सिम्युलेटर खोला जा रहा है'
  },
  {
    viewId: 'interview',
    label: 'AI Legal Assist',
    icon: Sparkles,
    keywords: ['interview', 'assist', 'help', 'ask', 'ai', 'सलाह', 'सहायक', 'बातचीत', 'मदद', 'உதவி', 'సహాయం'],
    spokenResponseEn: 'Opening AI Legal Consultation',
    spokenResponseHi: 'एआई कानूनी सलाह शुरू की जा रही है'
  },
  {
    viewId: 'storage',
    label: 'Offline Vault',
    icon: HardDrive,
    keywords: ['storage', 'offline', 'cache', 'vault', 'sync', 'स्टोरेज', 'वॉल्ट', 'ऑफ़लाइन', 'डाटा', 'சேமிப்பு', 'నిల్వ'],
    spokenResponseEn: 'Opening Offline Vault Storage',
    spokenResponseHi: 'ऑफ़लाइन वॉल्ट खोला जा रहा है'
  },
  {
    viewId: 'checkup',
    label: 'Readiness Checkup',
    icon: FileCheck2,
    keywords: ['checkup', 'readiness', 'audit', 'test', 'जांच', 'चेकअप', 'तैयारी', 'தணிக்கை', 'తనిఖీ'],
    spokenResponseEn: 'Opening Legal Readiness Checkup',
    spokenResponseHi: 'कानूनी तत्परता जांच खोली जा रही है'
  }
];

export const VoiceCommandListener: React.FC<VoiceCommandListenerProps> = ({
  currentLanguage,
  onNavigate,
  activeView
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [matchedCommand, setMatchedCommand] = useState<CommandMapping | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const tr = (str: string) => translateText(str, currentLanguage);

  // Map language to BCP47
  const getBcp47 = (lang: Language) => {
    switch (lang) {
      case 'HI': return 'hi-IN';
      case 'TA': return 'ta-IN';
      case 'TE': return 'te-IN';
      case 'KN': return 'kn-IN';
      case 'ML': return 'ml-IN';
      case 'BN': return 'bn-IN';
      case 'MR': return 'mr-IN';
      case 'GU': return 'gu-IN';
      case 'PA': return 'pa-IN';
      case 'UR': return 'ur-IN';
      case 'OR': return 'or-IN';
      case 'AS': return 'as-IN';
      default: return 'en-IN';
    }
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = true;
        rec.lang = getBcp47(currentLanguage);

        rec.onresult = (event: any) => {
          let text = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            text += event.results[i][0].transcript;
          }
          setTranscript(text);
          parseAndExecuteCommand(text);
        };

        rec.onerror = (e: any) => {
          console.warn("Voice command error:", e.error);
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = rec;
      } catch (err) {
        console.warn("SpeechRecognition init error:", err);
      }
    }
  }, [currentLanguage]);

  const speakFeedback = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getBcp47(currentLanguage);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const parseAndExecuteCommand = (spokenText: string) => {
    const clean = spokenText.toLowerCase().trim();
    if (!clean) return;

    // Find best match in COMMAND_MAP
    let found: CommandMapping | null = null;
    for (const cmd of COMMAND_MAP) {
      for (const kw of cmd.keywords) {
        if (clean.includes(kw.toLowerCase())) {
          found = cmd;
          break;
        }
      }
      if (found) break;
    }

    if (found) {
      setMatchedCommand(found);
      const voiceReply = currentLanguage === 'HI' ? found.spokenResponseHi : found.spokenResponseEn;
      setFeedbackMessage(voiceReply);
      speakFeedback(voiceReply);

      // Trigger navigation
      setTimeout(() => {
        onNavigate(found!.viewId);
        setIsOpen(false);
        setIsListening(false);
        setTranscript('');
      }, 1000);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
      setIsListening(false);
    } else {
      setTranscript('');
      setMatchedCommand(null);
      setFeedbackMessage(null);
      setIsListening(true);

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition && recognitionRef.current) {
        try {
          recognitionRef.current.lang = getBcp47(currentLanguage);
          recognitionRef.current.start();
        } catch (e) {
          console.warn("SpeechRecognition start error:", e);
        }
      }
    }
  };

  const handleManualCommandSelect = (cmd: CommandMapping) => {
    setMatchedCommand(cmd);
    const voiceReply = currentLanguage === 'HI' ? cmd.spokenResponseHi : cmd.spokenResponseEn;
    setFeedbackMessage(voiceReply);
    speakFeedback(voiceReply);
    setTimeout(() => {
      onNavigate(cmd.viewId);
      setIsOpen(false);
    }, 600);
  };

  return (
    <>
      {/* Floating Voice Navigation Trigger Button */}
      <div className="fixed bottom-20 right-4 z-40">
        <button
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => {
              if (!isListening) toggleListening();
            }, 300);
          }}
          className={`px-4 py-3 rounded-2xl flex items-center gap-2 font-bold text-xs shadow-2xl transition-all active:scale-95 border ${
            isListening
              ? 'bg-rose-600 border-rose-300 text-white animate-pulse shadow-rose-500/50'
              : 'bg-indigo-700/95 hover:bg-indigo-600 text-white border-indigo-400/40 shadow-indigo-500/30'
          }`}
          title="Voice Command Navigator / बोलकर नेविगेट करें"
        >
          <div className="relative">
            <Radio className="w-4 h-4 text-emerald-300 animate-spin" />
          </div>
          <span className="font-sans">
            {tr("Voice Navigation")}
          </span>
        </button>
      </div>

      {/* Voice Command Modal Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-slate-100 space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                  <Compass className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-serif">
                    {tr("Voice Navigation")}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {currentLanguage === 'HI' 
                      ? 'उदा. "कैलकुलेटर खोलो" या "डैशबोर्ड दिखाओ"' 
                      : 'e.g. "Go to Calculator", "Show Dashboard"'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  try { recognitionRef.current?.stop(); } catch (e) {}
                  setIsListening(false);
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Microphone Listening Hub */}
            <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
              
              {/* Mic Circle */}
              <button
                onClick={toggleListening}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-transform active:scale-95 ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse border-4 border-rose-300 ring-4 ring-rose-500/30'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white border-2 border-indigo-400'
                }`}
              >
                {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>

              <div className="space-y-1">
                <p className="text-xs font-bold text-white">
                  {isListening ? tr("Listening for command...") : tr("Tap mic to speak your destination")}
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  {transcript ? `"${transcript}"` : tr("Speak clearly in your chosen language")}
                </p>
              </div>

              {/* Matched Outcome feedback */}
              {feedbackMessage && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{feedbackMessage}</span>
                </div>
              )}
            </div>

            {/* Quick One-Tap Spoken Command Shortcuts */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {tr("Quick Voice Navigation Shortcuts:")}
              </span>
              
              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {COMMAND_MAP.slice(0, 8).map((cmd) => {
                  const Icon = cmd.icon;
                  const isActive = activeView === cmd.viewId;
                  return (
                    <button
                      key={cmd.viewId}
                      onClick={() => handleManualCommandSelect(cmd)}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                        isActive
                          ? 'bg-indigo-600/30 border-indigo-400 text-white font-bold'
                          : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Icon className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span className="truncate">{tr(cmd.label)}</span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-2">
              <p className="text-[10px] text-slate-500">
                {tr("Works 100% offline with zero cloud latency")}
              </p>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
