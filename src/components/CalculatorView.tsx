import React, { useState } from 'react';
import { AppSettings, FamilyTreeData, LegalProcessStep } from '../types';
import { translations } from '../data/translations';
import { generateLegalSummaryPDF } from '../utils/pdfGenerator';
import { Gavel, CheckCircle2, ChevronRight, Download, Info, ShieldAlert, Sparkles, Building, Landmark, Gem } from 'lucide-react';

interface CalculatorViewProps {
  tree: FamilyTreeData;
  steps: LegalProcessStep[];
  settings: AppSettings;
}

export const CalculatorView: React.FC<CalculatorViewProps> = ({ tree, steps, settings }) => {
  const t = translations[settings.language] || translations.EN;
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = () => {
    setDownloading(true);
    setTimeout(() => {
      generateLegalSummaryPDF(tree, 95, steps);
      setDownloading(false);
    }, 400);
  };

  return (
    <div className="flex flex-col w-full px-4 md:px-8 max-w-7xl mx-auto pt-6 pb-28 text-slate-100 gap-6">
      {/* Prevention Score Card */}
      <div className="relative flex flex-col p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none" />

        <div className="flex justify-between items-start mb-4 relative z-10">
          <div>
            <h2 className="text-xl font-bold text-white font-sans">{t.preventionScore}</h2>
            <p className="text-xs text-slate-400 mt-0.5">Based on Hindu Succession Act, 1956 & 2005 Amendment</p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-4xl font-extrabold text-emerald-400">95</span>
            <span className="text-[10px] font-bold text-emerald-400 px-3 py-1 bg-emerald-500/10 rounded-xl mt-1 border border-emerald-500/20">
              {t.highClarity}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden relative z-10 border border-slate-800">
          <div className="h-full bg-emerald-500 rounded-full w-[95%] shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
        </div>
      </div>

      {/* Property Allocation Donut & Asset Breakdown */}
      <div className="flex flex-col p-6 rounded-2xl bg-slate-900/50 border border-slate-800 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-6 font-sans">{t.propertyAllocation}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Donut Visual */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                {/* Real Estate 60% */}
                <circle
                  className="text-indigo-500"
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="3.8"
                  strokeDasharray="60 40"
                  strokeDashoffset="0"
                />
                {/* Bank 25% */}
                <circle
                  className="text-emerald-400"
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="3.8"
                  strokeDasharray="25 75"
                  strokeDashoffset="-60"
                />
                {/* Gold 15% */}
                <circle
                  className="text-amber-400"
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="3.8"
                  strokeDasharray="15 85"
                  strokeDashoffset="-85"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-white">100%</span>
                <span className="text-[10px] uppercase font-bold text-slate-400">{t.totalEstate}</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-5 text-xs">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-indigo-500" /><span className="text-slate-300 font-medium">Real Estate (60%)</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-400" /><span className="text-slate-300 font-medium">Bank (25%)</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-amber-400" /><span className="text-slate-300 font-medium">Gold (15%)</span></div>
            </div>
          </div>

          {/* Asset Portfolio List */}
          <div className="flex flex-col gap-3">
            {tree.assets.map((asset) => (
              <div key={asset.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  {asset.type === 'real_estate' && <Building className="w-6 h-6 text-indigo-400" />}
                  {asset.type === 'bank_deposit' && <Landmark className="w-6 h-6 text-emerald-400" />}
                  {asset.type === 'gold' && <Gem className="w-6 h-6 text-amber-400" />}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{asset.title}</h4>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{asset.location}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-xl border border-emerald-500/20">
                    {asset.statusBadge}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-lg font-bold text-white">{asset.sharePercentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legal Reasoning Box */}
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 shadow-lg flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Gavel className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold text-white font-sans">{t.legalReasoning}</h3>
        </div>

        <ul className="space-y-3 text-xs text-slate-300">
          <li className="flex items-start gap-3">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p>Applied <strong className="text-white">Hindu Succession Act, 1956 & 2005 Amendment</strong> for intestate succession.</p>
          </li>
          <li className="flex items-start gap-3">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p>Mother, Widow, Son, and Daughter are recognized as equal <strong className="text-white">Class I Heirs</strong>.</p>
          </li>
          <li className="flex items-start gap-3">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p>Property is distributed in exactly <strong className="text-white">equal shares (33.3% each)</strong> among Class I heirs.</p>
          </li>
        </ul>
      </div>

      {/* Required Legal Process Timeline */}
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 shadow-lg flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white font-sans">{t.nextSteps}</h3>
        </div>

        <div className="space-y-3">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                  step.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {step.id}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{step.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{step.description}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </div>
          ))}
        </div>
      </div>

      {/* PDF Download Button */}
      <button
        onClick={handleDownloadPDF}
        disabled={downloading}
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
      >
        <Download className="w-5 h-5" />
        <span>{downloading ? "Generating PDF..." : t.downloadReport}</span>
      </button>
    </div>
  );
};
