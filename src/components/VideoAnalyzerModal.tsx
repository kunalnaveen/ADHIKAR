import React, { useState, useRef } from 'react';
import { 
  Video, 
  Play, 
  Pause, 
  Sparkles, 
  Upload, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  AlertTriangle, 
  X, 
  Loader2, 
  ShieldCheck, 
  FileText,
  HelpCircle,
  Film
} from 'lucide-react';
import { AppSettings } from '../types';
import { t as translateText } from '../utils/translate';

interface VideoAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
}

interface VideoAnalysisResult {
  videoTitle: string;
  durationEstimated: string;
  overallSummary: string;
  soundMindVerification: {
    status: string;
    observation: string;
  };
  keyMoments: Array<{
    timestamp: string;
    title: string;
    description: string;
    significance: string;
  }>;
  flashcards: Array<{
    question: string;
    answer: string;
  }>;
  litigationRiskScore: string;
}

export const VideoAnalyzerModal: React.FC<VideoAnalyzerModalProps> = ({
  isOpen,
  onClose,
  settings
}) => {
  const tr = (str: string) => translateText(str, settings.language);

  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const [videoBase64, setVideoBase64] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>('Testamentary Will Oral Declaration & Execution.mp4');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<VideoAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'moments' | 'flashcards' | 'summary'>('moments');
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoTitle(file.name);
    const localUrl = URL.createObjectURL(file);
    setSelectedVideoUrl(localUrl);

    // Read base64
    const reader = new FileReader();
    reader.onload = () => {
      setVideoBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/gemini/analyze-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoBase64: videoBase64 || '',
          title: videoTitle,
          language: settings.language
        })
      });

      const data = await res.json();
      setAnalysisResult(data);
    } catch (err) {
      console.error('Video analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleCard = (index: number) => {
    setFlippedCards(prev => ({ ...prev, [index]: !prev[index] }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 md:p-8 shadow-2xl relative text-slate-100 space-y-6 my-auto max-h-[92vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-bold uppercase tracking-wider">
            <Video className="w-3.5 h-3.5 text-blue-400" />
            <span>{tr("Analyze Video Content")}</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold font-serif text-white">
            {tr("Video Testament & Legal Oral Evidence Analyzer")}
          </h3>
          <p className="text-xs text-slate-400">
            {tr("Upload video recorded Wills, family settlement oral recordings, or property walk-throughs to automatically detect key moments, sound-mind verification, and legal flashcards.")}
          </p>
        </div>

        {/* Upload & Video Preview Section */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleVideoUpload}
            accept="video/*"
            className="hidden"
          />

          {selectedVideoUrl ? (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden bg-black max-h-[240px] flex items-center justify-center border border-slate-800">
                <video
                  src={selectedVideoUrl}
                  controls
                  className="w-full max-h-[240px] object-contain"
                />
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-300 font-mono">
                  <Film className="w-4 h-4 text-blue-400" />
                  <span className="truncate max-w-[280px]">{videoTitle}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    {tr("Change Video")}
                  </button>
                  <button
                    onClick={handleRunAnalysis}
                    disabled={isAnalyzing}
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-500/20 disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{tr("Analyzing Video Moments...")}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{tr("Analyze Video with Gemini AI")}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                <Video className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">
                  {tr("Select a video file to analyze key moments and testamentary capacity")}
                </p>
                <p className="text-xs text-slate-400">
                  {tr("Supported formats: MP4, WebM, MOV (e.g., recorded will creation, family partition video)")}
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
                >
                  <Upload className="w-4 h-4" />
                  <span>{tr("Upload Video File")}</span>
                </button>
                <button
                  type="button"
                  onClick={handleRunAnalysis}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 font-semibold text-xs border border-blue-500/30 transition-all"
                >
                  {tr("Analyze Sample Video")}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        {analysisResult && (
          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            
            {/* Sound Mind Verification Status Banner */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-start gap-3 text-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-300 uppercase tracking-wider text-[11px]">
                    {tr("Sound-Mind & Capacity Status")}: {analysisResult.soundMindVerification.status}
                  </span>
                  <span className="px-2 py-0.2 rounded-full bg-emerald-900/80 text-emerald-200 text-[10px] font-mono">
                    {tr("Litigation Risk")}: {analysisResult.litigationRiskScore}
                  </span>
                </div>
                <p className="text-slate-300">
                  {analysisResult.soundMindVerification.observation}
                </p>
              </div>
            </div>

            {/* Sub Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => setActiveTab('moments')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'moments'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{tr("Key Moments & Timestamps")} ({analysisResult.keyMoments.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('flashcards')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'flashcards'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{tr("Interactive Flashcards")} ({analysisResult.flashcards.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'summary'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{tr("Executive Summary")}</span>
              </button>
            </div>

            {/* Tab: Key Moments */}
            {activeTab === 'moments' && (
              <div className="space-y-2.5">
                {analysisResult.keyMoments.map((moment, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-blue-500/40 flex items-start gap-3 transition-all">
                    <span className="px-2 py-1 rounded-lg bg-blue-950 text-blue-300 font-mono text-xs font-bold shrink-0">
                      {moment.timestamp}
                    </span>
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white">{moment.title}</h4>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          moment.significance === 'Crucial' ? 'bg-amber-950 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {moment.significance}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{moment.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Flashcards */}
            {activeTab === 'flashcards' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {analysisResult.flashcards.map((card, idx) => {
                  const isFlipped = !!flippedCards[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleCard(idx)}
                      className={`p-4 rounded-2xl cursor-pointer transition-all border min-h-[120px] flex flex-col justify-between ${
                        isFlipped 
                          ? 'bg-blue-950/80 border-blue-500/60 shadow-lg' 
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono text-blue-400 uppercase">
                          <span>{isFlipped ? tr("Answer / Legal Rule") : tr("Key Question")}</span>
                          <span className="text-slate-500">{tr("Click to flip")}</span>
                        </div>
                        <p className={`text-xs font-semibold leading-relaxed ${isFlipped ? 'text-blue-100' : 'text-white'}`}>
                          {isFlipped ? card.answer : card.question}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 pt-2">
                        <HelpCircle className="w-3 h-3 text-blue-400" />
                        <span>{tr("Card")} #{idx + 1}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab: Summary */}
            {activeTab === 'summary' && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs leading-relaxed text-slate-300">
                <h4 className="font-bold text-white text-sm">{analysisResult.videoTitle}</h4>
                <p>{analysisResult.overallSummary}</p>
                <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>{tr("Estimated Video Duration")}: {analysisResult.durationEstimated}</span>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
