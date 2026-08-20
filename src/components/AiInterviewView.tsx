import React, { useState, useEffect, useRef } from 'react';
import { AppSettings, ChatMessage, UserProfile } from '../types';
import { speakText, createSpeechRecognition, stopSpeech } from '../utils/speechUtils';
import { Bot, Mic, MicOff, Send, Volume2, Sparkles, CheckCircle2, MessageSquare, Cpu, Zap, Copy, Check } from 'lucide-react';
import { AIIntelligenceHub } from './AIIntelligenceHub';

interface AiInterviewViewProps {
  settings: AppSettings;
  user?: UserProfile | null;
  onOpenAuth?: () => void;
}

export const AiInterviewView: React.FC<AiInterviewViewProps> = ({ settings, user, onOpenAuth }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'multimodal'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Namaste! I am your ADHIKAR Fast Legal AI Assistant. Ask any question about Indian inheritance laws, family tree share calculations, daughters\' coparcenary rights, or government mutation procedures.',
      timestamp: 'Just now',
      options: ['Daughters\' Equal Share (HSA 2005)', 'Ancestral vs Self-Acquired', 'Intestate Division (No Will)', 'Khata / RTC Mutation'],
    },
  ]);

  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const quickPrompts = [
    { label: "Say Hi 👋", query: "Hi" },
    { label: "Daughters' Rights ⚖️", query: "What are daughters' equal rights in ancestral property under HSA 2005?" },
    { label: "Ancestral vs Self-Acquired 🏡", query: "What is the difference between ancestral and self-acquired property?" },
    { label: "No Will (Intestate) 📜", query: "How is father's property divided if he died without a Will?" },
    { label: "Khata Mutation Steps 🏛️", query: "What are the required documents and steps for Khata mutation after death?" },
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (textToSend?: string) => {
    const queryText = textToSend || input;
    if (!queryText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: queryText.trim(),
      timestamp: 'Now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: queryText.trim(),
          conversationHistory: messages.slice(-4),
          language: settings.language,
        }),
      });

      const data = await res.json();
      const replyText = data.reply || "Under Section 8 & Section 6 of the Hindu Succession Act, Class I legal heirs inherit equal statutory shares.";

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: 'Just now',
        options: data.suggestions || ['Calculate Shares', 'Add Family Member', 'Generate Will Draft'],
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      console.error(e);
      const fallbackMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: "Under the Hindu Succession Act (2005 Amendment), all Class I heirs—including daughters and widows—hold equal coparcenary rights by birth. How may I assist your family lineage?",
        timestamp: 'Just now',
        options: ['View Family Tree', 'Check Succession Rules', 'Khata Mutation'],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMic = () => {
    if (isListening) {
      setIsListening(false);
      stopSpeech();
    } else {
      setIsListening(true);
      const recognition = createSpeechRecognition(settings.language, (transcript) => {
        setInput(transcript);
        setIsListening(false);
      });
      recognition?.start();
    }
  };

  return (
    <div className="flex flex-col w-full px-4 md:px-8 max-w-5xl mx-auto pt-6 pb-28 text-slate-100 gap-6">
      
      {/* Top Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">ADHIKAR Legal AI Assistant</h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Zap className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                <span>Ultra-Fast Flash Engine</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">Direct, concise Indian inheritance law & procedural guidance</p>
          </div>
        </div>

        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Fast Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('multimodal')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'multimodal'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Multimodal Hub</span>
          </button>
        </div>
      </div>

      {activeTab === 'multimodal' ? (
        <AIIntelligenceHub settings={settings} />
      ) : (
        <div className="flex flex-col h-[650px] bg-slate-900/60 rounded-3xl border border-slate-800 p-4 md:p-6 shadow-xl relative overflow-hidden">
          
          {/* Quick Prompts Bar */}
          <div className="flex items-center gap-2 pb-3 mb-2 border-b border-slate-800/80 overflow-x-auto no-scrollbar shrink-0">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-400" />
              Quick:
            </span>
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp.query)}
                className="text-xs whitespace-nowrap bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-all font-medium"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Chat Messages Stream */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] md:max-w-[78%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-md'
                      : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-bl-none shadow-md'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {msg.sender === 'ai' && (
                    <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center gap-3 text-[11px] text-slate-400">
                      <button
                        onClick={() => speakText(msg.text, settings.language)}
                        className="hover:text-amber-400 transition-colors flex items-center gap-1"
                        title="Listen to audio"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen</span>
                      </button>

                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="hover:text-blue-400 transition-colors flex items-center gap-1"
                        title="Copy answer"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Quick Choice Chips */}
                {msg.options && msg.options.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2.5">
                    {msg.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(opt)}
                        className="text-xs bg-slate-950 hover:bg-slate-800 text-blue-400 hover:text-blue-300 px-3.5 py-1.5 rounded-xl border border-slate-800 hover:border-blue-500/40 transition-colors font-medium shadow-sm"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2.5 text-xs text-blue-400 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 w-fit">
                <Bot className="w-4 h-4 animate-bounce" />
                <span>ADHIKAR Fast AI is formulating legal answer...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Bar */}
          <div className="mt-3 flex items-center gap-2 bg-slate-950 p-2.5 rounded-2xl border border-slate-800 shadow-xl">
            <button
              onClick={toggleMic}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                isListening ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-900 border border-slate-800 text-blue-400 hover:bg-slate-800'
              }`}
              title="Voice Mic Input"
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask any legal inheritance question or say 'Hi'..."
              className="flex-1 bg-transparent text-sm text-white focus:outline-none px-2 placeholder-slate-500"
            />

            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="w-11 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white flex items-center justify-center transition-all shrink-0 shadow-md shadow-blue-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
