import React, { useState } from 'react';
import { 
  Brain, 
  Sparkles, 
  Scale, 
  BookOpen, 
  AlertTriangle, 
  X, 
  Loader2, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Cpu
} from 'lucide-react';
import { AppSettings } from '../types';
import { t as translateText } from '../utils/translate';

interface HighThinkingModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  initialQuery?: string;
}

interface HighThinkingResult {
  reasoningSteps: Array<{
    stepNumber: number;
    title: string;
    rationale: string;
  }>;
  deepThinkingSummary: string;
  applicablePrecedents: Array<{
    caseName: string;
    principle: string;
  }>;
  riskMatrix: {
    litigationVulnerability: string;
    preventiveAction: string;
  };
}

const PRESET_COMPLEX_QUERIES = [
  "Can daughters claim coparcenary share in ancestral property if the father passed away before 2005?",
  "Father died intestate leaving self-acquired land, 1 son, 2 married daughters, and 1 predeceased son's widow. How are shares divided?",
  "Hindu male married under Special Marriage Act and left no Will. Does Indian Succession Act apply instead of Hindu Succession Act?",
  "Grandfather executed an unregistered Will favoring only the youngest grandson. Can other Class I heirs challenge it?"
];

export const HighThinkingModal: React.FC<HighThinkingModalProps> = ({
  isOpen,
  onClose,
  settings,
  initialQuery = ''
}) => {
  const tr = (str: string) => translateText(str, settings.language);

  const [query, setQuery] = useState<string>(initialQuery || PRESET_COMPLEX_QUERIES[0]);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [thinkingResult, setThinkingResult] = useState<HighThinkingResult | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(1);

  const handleRunHighThinking = async (customQ?: string) => {
    const activeQuery = customQ || query;
    if (!activeQuery.trim()) return;

    setIsThinking(true);
    try {
      const res = await fetch('/api/gemini/high-thinking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: activeQuery,
          language: settings.language
        })
      });

      const data = await res.json();
      setThinkingResult(data);
      setExpandedStep(1);
    } catch (err) {
      console.error('High thinking error:', err);
    } finally {
      setIsThinking(false);
    }
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
            <Brain className="w-3.5 h-3.5 text-blue-400" />
            <span>{tr("Enable High Thinking Mode")}</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold font-serif text-white flex items-center gap-2">
            <span>{tr("Gemini Deep Legal Thinking Engine")}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-500/40">
              ThinkingLevel.HIGH
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            {tr("Gives AI time to perform deep, multi-step statutory deduction across complex multi-generational coparcenary disputes, retrospective amendments, and Supreme Court precedent citations.")}
          </p>
        </div>

        {/* Input & Query Selector */}
        <div className="space-y-3">
          <div className="relative">
            <textarea
              rows={3}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tr("Enter a complex inheritance scenario or legal conflict...")}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all resize-none"
            />
          </div>

          {/* Preset Prompts Chips */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              {tr("Try Complex Scenarios")}:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_COMPLEX_QUERIES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuery(preset);
                    handleRunHighThinking(preset);
                  }}
                  className="text-left text-[11px] px-3 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all truncate max-w-full"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={() => handleRunHighThinking()}
              disabled={isThinking}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {isThinking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-200" />
                  <span>{tr("Thinking Deeply with Gemini AI...")}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{tr("Engage High Thinking Mode")}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Stream */}
        {thinkingResult && (
          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            
            {/* Thinking Chain Header */}
            <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 flex items-start gap-3">
              <Cpu className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-300 uppercase tracking-wider text-[11px]">
                    {tr("High Thinking Jurisprudential Conclusion")}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-blue-900 text-blue-200">
                    {thinkingResult.reasoningSteps.length} {tr("Reasoning Steps")}
                  </span>
                </div>
                <p className="text-slate-200 leading-relaxed font-serif">
                  {thinkingResult.deepThinkingSummary}
                </p>
              </div>
            </div>

            {/* Step-by-Step Statutory Reasoning Trace */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {tr("Step-by-Step Statutory Deduction Chain")}:
              </span>
              <div className="space-y-2">
                {thinkingResult.reasoningSteps.map((step) => {
                  const isExpanded = expandedStep === step.stepNumber;
                  return (
                    <div 
                      key={step.stepNumber}
                      className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedStep(isExpanded ? null : step.stepNumber)}
                        className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-900/50 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-blue-500/30">
                            {step.stepNumber}
                          </span>
                          <span className="text-xs font-bold text-white">{step.title}</span>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-3.5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 bg-slate-900/20">
                          {step.rationale}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Applicable Supreme Court Precedents */}
            {thinkingResult.applicablePrecedents?.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-300 uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{tr("Supreme Court Precedents & Legal Citations")}</span>
                </div>
                <div className="space-y-2">
                  {thinkingResult.applicablePrecedents.map((precedent, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                      <div className="font-bold text-white font-mono text-[11px]">{precedent.caseName}</div>
                      <div className="text-slate-400">{precedent.principle}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risk & Preventive Shield */}
            {thinkingResult.riskMatrix && (
              <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-start gap-2.5 text-xs">
                <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-emerald-300 uppercase tracking-wider text-[10px]">
                    {tr("Recommended Preventive Shield")}:
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {thinkingResult.riskMatrix.preventiveAction}
                  </p>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
