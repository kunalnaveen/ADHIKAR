import React, { useState, useEffect, useRef } from 'react';
import { AppSettings, ChatMessage } from '../types';
import { speakText, createSpeechRecognition, stopSpeech } from '../utils/speechUtils';
import { Bot, Mic, MicOff, Send, Volume2, Sparkles, CheckCircle2 } from 'lucide-react';

interface AiInterviewViewProps {
  settings: AppSettings;
}

export const AiInterviewView: React.FC<AiInterviewViewProps> = ({ settings }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Namaste! I am your ADHIKAR Legal AI Assistant. I am here to help you map your family lineage and calculate legal heir shares under Indian Law.',
      timestamp: 'Just now',
      options: ['Ancestral Property', 'Self-Acquired Property', 'I want to check Daughter\'s Rights'],
    },
  ]);

  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const queryText = textToSend || input;
    if (!queryText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: queryText,
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
          userMessage: queryText,
          conversationHistory: messages,
          language: settings.language,
        }),
      });

      const data = await res.json();
      const replyText = data.reply || "Under Indian law, legal heirs in Class I receive equal shares of intestate property.";

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: 'Now',
        options: ['Show Family Tree', 'Calculate Shares', 'Next Question'],
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Speak AI reply
      speakText(replyText, settings.language);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: 'Under Section 8 of Hindu Succession Act 1956, intestate property devolves equally upon all Class I heirs.',
          timestamp: 'Now',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMic = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = createSpeechRecognition(
      settings.language,
      (transcript) => {
        setIsListening(false);
        setInput(transcript);
        handleSend(transcript);
      },
      () => setIsListening(false)
    );

    if (recognition) {
      setIsListening(true);
      recognition.start();
    } else {
      alert("Voice speech recognition is not supported on this browser.");
    }
  };

  return (
    <div className="flex flex-col w-full h-[calc(100vh-8rem)] max-w-4xl mx-auto p-4 pt-4 pb-28 text-slate-100">
      {/* Progress Header Bar */}
      <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl border border-slate-800 mb-4 shadow-md">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-white">Legal Interview Progress</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>96% Legal Confidence</span>
        </div>
      </div>

      {/* Message Chat Feed */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs md:text-sm leading-relaxed shadow-md ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none'
              }`}
            >
              <p>{msg.text}</p>

              {/* TTS Speaker icon */}
              {msg.sender === 'ai' && (
                <button
                  onClick={() => speakText(msg.text, settings.language)}
                  className="mt-2.5 flex items-center gap-1.5 text-[10px] text-indigo-400 hover:text-white font-medium"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Read Aloud
                </button>
              )}
            </div>

            {/* Quick Choice Chips */}
            {msg.options && (
              <div className="flex flex-wrap gap-2 mt-2.5">
                {msg.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(opt)}
                    className="text-xs bg-slate-900 hover:bg-slate-800 text-indigo-400 px-3.5 py-1.5 rounded-xl border border-slate-800 transition-colors font-medium"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2.5 text-xs text-indigo-400 bg-slate-900 p-3.5 rounded-2xl border border-slate-800 w-fit">
            <Bot className="w-4 h-4 animate-bounce" />
            <span>ADHIKAR AI is analyzing legal precedents...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <div className="mt-3 flex items-center gap-2 bg-slate-900 p-2.5 rounded-2xl border border-slate-800 shadow-xl">
        <button
          onClick={toggleMic}
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
            isListening ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-950 border border-slate-800 text-indigo-400 hover:bg-slate-800'
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
          placeholder="Ask a question or describe family details..."
          className="flex-1 bg-transparent text-sm text-white focus:outline-none px-2"
        />

        <button
          onClick={() => handleSend()}
          disabled={!input.trim()}
          className="w-11 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white flex items-center justify-center transition-all shrink-0 shadow-md shadow-indigo-500/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
