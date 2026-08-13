import React, { useState } from 'react';
import { AppSettings } from '../types';
import { 
  CheckSquare, 
  Square, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  UserCheck, 
  FolderLock, 
  Building2, 
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Download
} from 'lucide-react';
import { generateLegalReadinessPDF } from '../utils/pdfGenerator';

interface LegalReadinessCheckupProps {
  settings: AppSettings;
  onNavigate?: (view: string) => void;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: string;
  completed: boolean;
  actionText: string;
  targetView: string;
}

export const LegalReadinessCheckup: React.FC<LegalReadinessCheckupProps> = ({ settings, onNavigate }) => {
  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: 'chk-will',
      title: 'Is a Registered Will Prepared?',
      description: 'Ensures testamentary intent prevails over statutory intestate rules.',
      category: 'Will & Testament',
      completed: true,
      actionText: 'Draft / Upload Will',
      targetView: 'interview'
    },
    {
      id: 'chk-docs',
      title: 'Are Property Sale Deeds & Jamabandi Clear?',
      description: 'Conveyance deeds, revenue mutation cards, and Khasra records uploaded.',
      category: 'Property Records',
      completed: true,
      actionText: 'Open Document Vault',
      targetView: 'storage'
    },
    {
      id: 'chk-nominees',
      title: 'Are Nominees Assigned in Bank Accounts & Mutual Funds?',
      description: 'Assigning nominees prevents bank account freezing during probate delays.',
      category: 'Financial Assets',
      completed: false,
      actionText: 'Update Nominee List',
      targetView: 'calculator'
    },
    {
      id: 'chk-heir-docs',
      title: 'Are Legal Heir Certificates & Aadhaar Cards Verified?',
      description: 'Government IDs and birth certificates proving Class I heir status.',
      category: 'Identity Records',
      completed: false,
      actionText: 'Verify Identity Proofs',
      targetView: 'tree'
    },
    {
      id: 'chk-family-tree',
      title: 'Is the Multi-Generational Family Tree Mapped?',
      description: 'Lineage graph detailing all coparceners, daughters, and Class II heirs.',
      category: 'Lineage Graph',
      completed: true,
      actionText: 'Update Family Tree',
      targetView: 'tree'
    }
  ]);

  const toggleItem = (id: string) => {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const completedCount = items.filter((i) => i.completed).length;
  const completionPercentage = Math.round((completedCount / items.length) * 100);

  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-xl flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" /> Guided Readiness Audit
            </span>
            <span className="text-[11px] text-slate-400 font-mono">5-Step Legal Compliance</span>
          </div>
          <h2 className="text-2xl font-bold text-white font-sans">Legal Readiness Checkup</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Step-by-step checklist to ensure your legal documents, bank nominations, and family lineage are 100% dispute-proof.
          </p>
        </div>

        {/* Completion Gauge & PDF Export */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => generateLegalReadinessPDF(items, completedCount, completionPercentage)}
            className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all border border-indigo-400/30"
            title="Download Official PDF Certificate"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Certificate PDF</span>
          </button>

          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 shrink-0">
            <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-emerald-400 border-r-indigo-500 flex items-center justify-center font-mono font-extrabold text-sm text-white">
              {completionPercentage}%
            </div>
            <div>
              <span className="text-xs font-bold text-white block">{completedCount} of {items.length} Ready</span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                {completionPercentage >= 80 ? 'High Compliance' : 'Action Required'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Metric Bar */}
      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
        <div 
          className="bg-emerald-400 h-full rounded-full transition-all duration-500"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      {/* Checklist Grid */}
      <div className="space-y-3">
        {items.map((item) => (
          <div 
            key={item.id}
            className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              item.completed 
                ? 'bg-slate-950/80 border-slate-800/80 text-slate-300' 
                : 'bg-slate-950 border-indigo-500/30 text-white shadow-lg shadow-indigo-500/5'
            }`}
          >
            <div className="flex items-start gap-3.5 flex-1 min-w-0">
              <button
                onClick={() => toggleItem(item.id)}
                className="mt-0.5 shrink-0 transition-transform active:scale-95"
              >
                {item.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Square className="w-5 h-5 text-slate-500 hover:text-indigo-400" />
                )}
              </button>

              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    item.completed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {item.category}
                  </span>
                  <h4 className={`text-sm font-bold ${item.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                    {item.title}
                  </h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
              </div>
            </div>

            {/* Direct Action Trigger */}
            {onNavigate && (
              <button
                onClick={() => onNavigate(item.targetView)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 self-end sm:self-auto shadow-md"
              >
                <span>{item.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};
