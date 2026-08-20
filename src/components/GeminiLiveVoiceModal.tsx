import React, { useState, useEffect, useRef } from 'react';
import { AppSettings, FamilyTreeData, Language } from '../types';
import { t as translateText } from '../utils/translate';
import { 
  Mic, 
  MicOff, 
  X, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  GitFork, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle, 
  Globe, 
  Play, 
  RotateCcw,
  Scale,
  Bot,
  AlertCircle
} from 'lucide-react';

interface GeminiLiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  tree: FamilyTreeData;
  onUpdateTree: (updatedTree: FamilyTreeData) => void;
  onNavigate: (view: string) => void;
  onUpdateSettings?: (newSettings: Partial<AppSettings>) => void;
}

export const LANGUAGE_OPTIONS: { code: Language; name: string; native: string; bcp47: string }[] = [
  { code: 'EN', name: 'English', native: 'English', bcp47: 'en-IN' },
  { code: 'HI', name: 'Hindi', native: 'हिन्दी', bcp47: 'hi-IN' },
  { code: 'TA', name: 'Tamil', native: 'தமிழ்', bcp47: 'ta-IN' },
  { code: 'TE', name: 'Telugu', native: 'తెలుగు', bcp47: 'te-IN' },
  { code: 'ML', name: 'Malayalam', native: 'മലയാളം', bcp47: 'ml-IN' },
  { code: 'KN', name: 'Kannada', native: 'ಕನ್ನಡ', bcp47: 'kn-IN' },
  { code: 'BN', name: 'Bengali', native: 'বাংলা', bcp47: 'bn-IN' },
  { code: 'MR', name: 'Marathi', native: 'मराठी', bcp47: 'mr-IN' },
  { code: 'GU', name: 'Gujarati', native: 'ગુજરાતી', bcp47: 'gu-IN' },
  { code: 'PA', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', bcp47: 'pa-IN' },
  { code: 'UR', name: 'Urdu', native: 'اردو', bcp47: 'ur-IN' },
  { code: 'OR', name: 'Odia', native: 'ଓଡ଼ିଆ', bcp47: 'or-IN' },
  { code: 'AS', name: 'Assamese', native: 'অসমীয়া', bcp47: 'as-IN' },
  { code: 'BHO', name: 'Bhojpuri', native: 'भोजपुरी', bcp47: 'hi-IN' },
  { code: 'MAI', name: 'Maithili', native: 'मैथिली', bcp47: 'hi-IN' },
];

export const GeminiLiveVoiceModal: React.FC<GeminiLiveVoiceModalProps> = ({
  isOpen,
  onClose,
  settings,
  tree,
  onUpdateTree,
  onNavigate,
  onUpdateSettings
}) => {
  if (!isOpen) return null;

  const [selectedLang, setSelectedLang] = useState<Language>(settings.language || 'EN');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<any | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const tr = (str: string) => translateText(str, selectedLang);

  // Get BCP-47 locale code
  const currentLangObj = LANGUAGE_OPTIONS.find(l => l.code === selectedLang) || LANGUAGE_OPTIONS[0];

  // Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = true;
        rec.lang = currentLangObj.bcp47;

        rec.onresult = (event: any) => {
          let currentText = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentText += event.results[i][0].transcript;
          }
          setTranscript(currentText);
        };

        rec.onerror = (event: any) => {
          console.warn("Speech recognition notice:", event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            setErrorMessage("Microphone access denied. You can tap any preset example below or type in your language.");
          }
        };

        rec.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = rec;
      } catch (err) {
        console.warn("Speech recognition initialization error:", err);
      }
    }
  }, [selectedLang, currentLangObj.bcp47]);

  const toggleListening = () => {
    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
      setIsListening(false);
      if (transcript.trim().length > 0) {
        handleProcessSpeech(transcript);
      }
    } else {
      setErrorMessage(null);
      setTranscript('');
      setIsListening(true);

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition && recognitionRef.current) {
        try {
          recognitionRef.current.lang = currentLangObj.bcp47;
          recognitionRef.current.start();
        } catch (err) {
          console.warn("SpeechRecognition start fallback:", err);
        }
      } else {
        // Fallback for browsers without SpeechRecognition
        setErrorMessage("Live voice input is using text fallback. Select an example below or type family details.");
      }
    }
  };

  const handleProcessSpeech = async (speechText: string) => {
    if (!speechText || speechText.trim() === '') return;
    setIsProcessing(true);
    setErrorMessage(null);

    // Stop speaking previous response
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    try {
      const response = await fetch('/api/gemini/live-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userSpeech: speechText,
          language: selectedLang,
          currentTree: tree
        })
      });

      const data = await response.json();
      setAiResponse(data);

      // Automatically update the main family tree if updatedTree exists
      if (data.updatedTree) {
        onUpdateTree(data.updatedTree);
      }

      // Automatically speak the response
      if (data.spokenResponse) {
        speakText(data.spokenResponse, currentLangObj.bcp47);
      }
    } catch (err) {
      console.error("Gemini Voice API Error:", err);
      setErrorMessage("Voice processing temporarily offline. Showing deterministic legal calculation.");
    } finally {
      setIsProcessing(false);
    }
  };

  const speakText = (text: string, bcp47: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = bcp47;
      utterance.rate = 0.92;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleQuickSample = (sampleText: string) => {
    setTranscript(sampleText);
    handleProcessSpeech(sampleText);
  };

  const handleSelectLanguage = (langCode: Language) => {
    setSelectedLang(langCode);
    onUpdateSettings?.({ language: langCode });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative text-slate-100 max-h-[92vh] flex flex-col justify-between my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Bot className="w-5 h-5 animate-pulse text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-white font-serif tracking-tight">{tr("Gemini Live Voice")}</h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {tr("Multilingual")}
                </span>
              </div>
              <p className="text-xs text-slate-400">{tr("Built for India's next billion users.")}</p>
            </div>
          </div>

          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="p-2 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Main Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 my-2 pr-1">
          
          {/* Language Selector Chips */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>{tr("Select Language")}</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGE_OPTIONS.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    selectedLang === lang.code
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/20 scale-105'
                      : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 border-slate-800'
                  }`}
                >
                  <span>{lang.native}</span>
                  <span className="text-[10px] opacity-60 ml-1">({lang.code})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Big One-Click Microphone Interactive Hero */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

            {/* Live Visualizer Waves when listening */}
            {isListening && (
              <div className="flex items-center gap-1 my-2">
                <div className="w-1.5 h-6 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-10 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-14 bg-emerald-400 rounded-full animate-bounce" />
                <div className="w-1.5 h-10 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-6 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              </div>
            )}

            {/* Microphone Button */}
            <button
              onClick={toggleListening}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-2xl relative my-2 active:scale-95 ${
                isListening
                  ? 'bg-rose-600 text-white shadow-rose-500/50 animate-pulse border-4 border-rose-300'
                  : 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-500 text-white shadow-indigo-500/40 hover:scale-105 border-2 border-indigo-300/40'
              }`}
            >
              {isListening ? <MicOff className="w-9 h-9" /> : <Mic className="w-9 h-9" />}
            </button>

            <span className="text-xs font-bold text-slate-300 mt-2">
              {isListening ? tr("Listening... Tap to process speech") : tr("Tap Microphone & Speak Family Details")}
            </span>

            {/* Editable or Speech Live Transcript box */}
            <div className="w-full mt-4">
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder={selectedLang === 'HI' ? 'उदा. "मेरे पिता का निधन हो गया। मेरी माता जीवित हैं। मेरा एक भाई और एक बहन है।"' : 'e.g. "My father passed away. My mother is alive. I have one brother and one sister."'}
                rows={2}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-center resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => handleProcessSpeech(transcript)}
                disabled={isProcessing || !transcript.trim()}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg disabled:opacity-50 transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>{isProcessing ? 'Analyzing...' : tr("Analyze Family Voice")}</span>
              </button>

              {transcript && (
                <button
                  onClick={() => setTranscript('')}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                  title="Clear text"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Voice Prompt Shortcuts */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {selectedLang === 'HI' ? 'उदाहरण परिदृश्य चुनें (टैप करें):' : 'Try Preset Example Scenarios:'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickSample("मेरे पिता का निधन हो गया। मेरी माता जीवित हैं। मेरा एक भाई और एक बहन है।")}
                className="bg-slate-950/60 hover:bg-slate-800 border border-slate-800 p-2.5 rounded-xl text-left text-[11px] text-slate-300 hover:text-white transition-colors flex items-center justify-between font-sans"
              >
                <span>"पिताजी का निधन। माताजी, 1 भाई और 1 बहन है।"</span>
                <Play className="w-3 h-3 text-indigo-400 shrink-0 ml-1" />
              </button>
              <button
                onClick={() => handleQuickSample("My father passed away. My mother is alive. I have one brother and one sister.")}
                className="bg-slate-950/60 hover:bg-slate-800 border border-slate-800 p-2.5 rounded-xl text-left text-[11px] text-slate-300 hover:text-white transition-colors flex items-center justify-between"
              >
                <span>"Father deceased. Mother alive. 1 brother, 1 sister."</span>
                <Play className="w-3 h-3 text-indigo-400 shrink-0 ml-1" />
              </button>
            </div>
          </div>

          {/* AI Voice Output & Extracted Family Analysis */}
          {aiResponse && (
            <div className="space-y-4 animate-fade-in border-t border-slate-800 pt-4">
              
              {/* Voice Speech Box */}
              <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">AI Voice Explanation</span>
                  </div>

                  <button
                    onClick={isSpeaking ? stopSpeaking : () => speakText(aiResponse.spokenResponse, currentLangObj.bcp47)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      isSpeaking
                        ? 'bg-amber-500 text-slate-950 animate-pulse'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isSpeaking ? 'Stop Audio' : 'Play Audio'}</span>
                  </button>
                </div>

                <p className="text-xs text-white leading-relaxed font-sans font-medium">
                  "{aiResponse.spokenResponse}"
                </p>
              </div>

              {/* Identified Legal Shares Summary */}
              {aiResponse.extractedHeirsSummary && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      {tr("Class I Heir")} & Legal Rights
                    </span>
                    <button
                      onClick={() => {
                        onClose();
                        onNavigate('tree');
                      }}
                      className="text-xs font-bold text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <span>{tr("Interactive Family Tree")}</span>
                      <GitFork className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-300">
                    {aiResponse.extractedHeirsSummary}
                  </p>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                    <strong>Rule:</strong> {aiResponse.legalExplanation}
                  </div>
                </div>
              )}

              {/* Follow up Voice Questions */}
              {aiResponse.followUpQuestions && aiResponse.followUpQuestions.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    Suggested Follow-ups:
                  </span>
                  <div className="space-y-1.5">
                    {aiResponse.followUpQuestions.map((q: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickSample(q)}
                        className="w-full text-left p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 flex items-center justify-between group transition-colors"
                      >
                        <span>"{q}"</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
          <button
            onClick={() => {
              stopSpeaking();
              onClose();
              onNavigate('calculator');
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-2"
          >
            <Scale className="w-4 h-4 text-emerald-400" />
            <span>{tr("CALC")}</span>
          </button>

          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
          >
            {tr("Done")}
          </button>
        </div>

      </div>
    </div>
  );
};
