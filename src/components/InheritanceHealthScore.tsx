import React from 'react';
import { HealthScoreCategory, AppSettings } from '../types';
import { 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  FileCheck2, 
  ShieldCheck, 
  ArrowRight, 
  TrendingUp, 
  Sparkles,
  HelpCircle,
  FileText,
  Download
} from 'lucide-react';
import { generateHealthScorePDF } from '../utils/pdfGenerator';

interface InheritanceHealthScoreProps {
  settings: AppSettings;
  onNavigate?: (view: string) => void;
}

export const InheritanceHealthScore: React.FC<InheritanceHealthScoreProps> = ({ settings, onNavigate }) => {
  // Evaluated dimensions
  const categories: HealthScoreCategory[] = [
    {
      name: 'Will Availability & Validity',
      score: 45,
      status: 'Needs Attention',
      weight: 25,
      description: 'No registered Will found in vault. Intestate default rules apply under Hindu Succession Act.',
      recommendations: [
        'Draft a formal Will specifying clear shares for Class I heirs.',
        'Upload registered Will copy to ADHIKAR AES-256 Vault.'
      ]
    },
    {
      name: 'Documentation Completeness',
      score: 80,
      status: 'Good',
      weight: 20,
      description: 'Property deeds and government identity cards uploaded and verified.',
      recommendations: [
        'Attach updated Revenue Mutation (Jamabandi/Intiqal) record.'
      ]
    },
    {
      name: 'Property Title Clarity',
      score: 65,
      status: 'Needs Attention',
      weight: 20,
      description: 'Ancestral land carries undivided coparcenary shares among multiple branches.',
      recommendations: [
        'Execute a registered Family Partition Deed to demarcate physical metes and bounds.'
      ]
    },
    {
      name: 'Family Lineage Alignment',
      score: 90,
      status: 'Excellent',
      weight: 15,
      description: 'Family tree graph fully mapped with non-conflicting Class I & Class II heir nodes.',
      recommendations: [
        'Maintain updated contact details for all Class I legal heirs.'
      ]
    },
    {
      name: 'Dispute Mitigation Readiness',
      score: 70,
      status: 'Good',
      weight: 10,
      description: 'Dispute risk radar indicates moderate risk due to ancestral property factors.',
      recommendations: [
        'Convene a family council meeting to establish consensus on land partition.'
      ]
    },
    {
      name: 'Legal & Tax Compliance',
      score: 85,
      status: 'Excellent',
      weight: 10,
      description: 'Property tax payments up to date; no active revenue injunctions.',
      recommendations: [
        'Schedule reminders for annual property tax rebate windows.'
      ]
    }
  ];

  // Calculate weighted composite score
  const totalWeight = categories.reduce((acc, c) => acc + c.weight, 0);
  const weightedScoreSum = categories.reduce((acc, c) => acc + (c.score * c.weight), 0);
  const overallScore = Math.round(weightedScoreSum / totalWeight);

  let overallTier: 'Excellent' | 'Good' | 'Needs Attention' | 'High Risk' = 'Good';
  if (overallScore >= 85) overallTier = 'Excellent';
  else if (overallScore >= 70) overallTier = 'Good';
  else if (overallScore >= 50) overallTier = 'Needs Attention';
  else overallTier = 'High Risk';

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Excellent': return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
      case 'Good': return { text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' };
      case 'Needs Attention': return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
      default: return { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' };
    }
  };

  const colors = getTierColor(overallTier);

  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-xl flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" /> Inheritance Health Index
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Comprehensive Legal Audit</span>
          </div>
          <h2 className="text-2xl font-bold text-white font-sans">Inheritance Health Score</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluates will readiness, property clarity, and documentation strength to ensure your estate is 100% legal-ready.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => generateHealthScorePDF(categories, overallScore, overallTier)}
            className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all border border-indigo-400/30"
            title="Download Official PDF Report"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export PDF Report</span>
          </button>

          <div className={`px-4 py-2 rounded-2xl ${colors.bg} ${colors.border} border flex items-center gap-3 shrink-0`}>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-white font-mono">{overallScore}/100</span>
              <span className={`block text-[10px] font-bold uppercase tracking-wider ${colors.text}`}>{overallTier}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Metric Bar */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-300">Overall Estate Preparedness</span>
          <span className="font-mono text-emerald-400 font-bold">{overallScore}% Ready</span>
        </div>

        <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div 
            className="bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-700"
            style={{ width: `${overallScore}%` }}
          />
        </div>
      </div>

      {/* Category Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat, idx) => {
          const catColors = getTierColor(cat.status);

          return (
            <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-white truncate">{cat.name}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${catColors.bg} ${catColors.text} border ${catColors.border}`}>
                    {cat.score}/100
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-2">{cat.description}</p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-900">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Action Items:</span>
                {cat.recommendations.map((rec, rIdx) => (
                  <div key={rIdx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Banner */}
      {onNavigate && (
        <div className="p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">Boost your Health Score to 95+</h4>
              <p className="text-[11px] text-slate-400">Complete missing Will drafting and upload Jamabandi deeds to vault.</p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('interview')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-md"
          >
            <span>Start Will Drafter</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
};
