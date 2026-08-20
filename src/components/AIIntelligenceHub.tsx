import React, { useState } from 'react';
import { 
  Video, 
  Mic, 
  Brain, 
  Sparkles, 
  ArrowUpRight,
  Shield,
  Layers
} from 'lucide-react';
import { AppSettings } from '../types';
import { t as translateText } from '../utils/translate';
import { VideoAnalyzerModal } from './VideoAnalyzerModal';
import { LiveAudioTranscriberModal } from './LiveAudioTranscriberModal';
import { HighThinkingModal } from './HighThinkingModal';

interface AIIntelligenceHubProps {
  settings: AppSettings;
}

export const AIIntelligenceHub: React.FC<AIIntelligenceHubProps> = ({ settings }) => {
  const tr = (str: string) => translateText(str, settings.language);

  const [activeModal, setActiveModal] = useState<'video' | 'audio' | 'thinking' | null>(null);

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>{tr("Advanced AI Intelligence Modules")}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-white">
            {tr("Multimodal Legal Intelligence & High Reasoning")}
          </h2>
        </div>
        <p className="text-xs text-slate-400 max-w-sm">
          {tr("Powered by Gemini 3.7 Flash with High Thinking level and native video & audio understanding.")}
        </p>
      </div>

      {/* 3 AI Cards matching user's requested layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* 1. Analyze Video Content Card */}
        <div 
          onClick={() => setActiveModal('video')}
          className="group p-6 rounded-3xl bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5 relative shadow-xl hover:shadow-blue-500/10"
        >
          <div className="space-y-4">
            {/* Top Icon Badge */}
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Video className="w-6 h-6 stroke-[2]" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                  {tr("Analyze video content")}
                </h3>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {tr("Help users find the key moments in long videos. Add a feature to analyze video content to instantly generate summaries, flashcards, or legal highlights.")}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-blue-400">
            <span>{tr("Launch Video Analyzer")}</span>
            <span className="font-mono text-[10px] text-slate-500">MP4 / WebM</span>
          </div>
        </div>

        {/* 2. Transcribe Audio Card */}
        <div 
          onClick={() => setActiveModal('audio')}
          className="group p-6 rounded-3xl bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5 relative shadow-xl hover:shadow-blue-500/10"
        >
          <div className="space-y-4">
            {/* Top Icon Badge */}
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mic className="w-6 h-6 stroke-[2]" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                  {tr("Transcribe audio")}
                </h3>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {tr("Add a feature to provide live, real-time transcription of any audio feed for your users.")}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-blue-400">
            <span>{tr("Launch Live Audio Studio")}</span>
            <span className="font-mono text-[10px] text-slate-500">{tr("Live Mic / Audio")}</span>
          </div>
        </div>

        {/* 3. Enable High Thinking Card */}
        <div 
          onClick={() => setActiveModal('thinking')}
          className="group p-6 rounded-3xl bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5 relative shadow-xl hover:shadow-blue-500/10"
        >
          <div className="space-y-4">
            {/* Top Icon Badge */}
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Brain className="w-6 h-6 stroke-[2]" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                  {tr("Enable high thinking")}
                </h3>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {tr("Give your app's AI time to think. Enable 'Thinking Mode' to handle your users' most complex queries.")}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-blue-400">
            <span>{tr("Engage Thinking Engine")}</span>
            <span className="font-mono text-[10px] text-slate-500">ThinkingLevel.HIGH</span>
          </div>
        </div>

      </div>

      {/* Modals */}
      {activeModal === 'video' && (
        <VideoAnalyzerModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          settings={settings}
        />
      )}

      {activeModal === 'audio' && (
        <LiveAudioTranscriberModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          settings={settings}
        />
      )}

      {activeModal === 'thinking' && (
        <HighThinkingModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          settings={settings}
        />
      )}
    </section>
  );
};
