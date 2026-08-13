import React, { useState } from 'react';
import { DisputeRiskAnalysis, RiskFactor, AppSettings } from '../types';
import { 
  AlertTriangle, 
  ShieldCheck, 
  Info, 
  Sparkles, 
  FileQuestion, 
  Users, 
  Building2, 
  Heart, 
  FileText, 
  CheckCircle2, 
  TrendingUp, 
  Zap,
  ArrowRight,
  RotateCcw
} from 'lucide-react';

interface DisputeRiskRadarProps {
  settings: AppSettings;
  onNavigate?: (view: string) => void;
}

export const DisputeRiskRadar: React.FC<DisputeRiskRadarProps> = ({ settings, onNavigate }) => {
  // Risk Factor Toggle Inputs
  const [missingWill, setMissingWill] = useState<boolean>(true);
  const [multipleHeirs, setMultipleHeirs] = useState<boolean>(true);
  const [ancestralProperty, setAncestralProperty] = useState<boolean>(true);
  const [jointOwnership, setJointOwnership] = useState<boolean>(false);
  const [documentationGaps, setDocumentationGaps] = useState<boolean>(true);
  const [conflictingClaims, setConflictingClaims] = useState<boolean>(false);
  const [secondMarriage, setSecondMarriage] = useState<boolean>(false);
  const [adoptionCases, setAdoptionCases] = useState<boolean>(false);
  const [propertyAmbiguity, setPropertyAmbiguity] = useState<boolean>(true);
  const [familyComplexityScore, setFamilyComplexityScore] = useState<number>(3); // 1-5 scale

  // Calculate Risk Engine Score dynamically
  const calculateRisk = (): DisputeRiskAnalysis => {
    let score = 10; // baseline
    const factors: RiskFactor[] = [];
    const reasoning: string[] = [];
    const recommendations: string[] = [];

    if (missingWill) {
      score += 25;
      factors.push({
        id: 'rf-will',
        factor: 'Absence of Registered Will',
        category: 'documentation',
        severity: 'critical',
        impactPoints: 25,
        description: 'Intestate succession triggers mandatory Class I share partitions, often resulting in partition suits.',
        preventionTip: 'Draft and register a clear Will witnessed by two independent doctors/attorneys.'
      });
      reasoning.push('Lack of a registered Will forces Hindu Succession Act Class I statutory partitioning, increasing friction among siblings.');
      recommendations.push('Create a legally binding Will via ADHIKAR Will Drafter or register with Sub-Registrar.');
    } else {
      recommendations.push('Keep the registered Will securely backed up in ADHIKAR AES-256 Vault.');
    }

    if (ancestralProperty) {
      score += 20;
      factors.push({
        id: 'rf-ancestry',
        factor: 'Ancestral Property Coparcenary Rights',
        category: 'property_ownership',
        severity: 'high',
        impactPoints: 20,
        description: 'Coparcenary rights under HSA 2005 mean daughters and sons hold birthrights that cannot be willed away entirely.',
        preventionTip: 'Obtain family settlement deed with registered release deeds from all coparceners.'
      });
      reasoning.push('Ancestral property carries birthright coparcenary claims spanning four generations, restricting testamentary freedom.');
      recommendations.push('Execute a Family Settlement Deed to convert undivided coparcenary shares into distinct titles.');
    }

    if (documentationGaps) {
      score += 15;
      factors.push({
        id: 'rf-docs',
        factor: 'Missing Revenue Records & Jamabandi Gaps',
        category: 'documentation',
        severity: 'high',
        impactPoints: 15,
        description: 'Un-updated Jamabandi/Khasra revenue records leave titles registered under deceased ancestors.',
        preventionTip: 'File Intiqal (Mutation) application at the Local Tehsildar revenue court immediately.'
      });
      reasoning.push('Failure to update revenue mutation (Intiqal) creates title uncertainty during property sales or mortgages.');
      recommendations.push('Apply for Mutation of Names in Land Records at your Sub-Divisional Revenue Office.');
    }

    if (propertyAmbiguity) {
      score += 12;
      factors.push({
        id: 'rf-ambiguity',
        factor: 'Undivided Joint Property Boundaries',
        category: 'property_ambiguity',
        severity: 'medium',
        impactPoints: 12,
        description: 'Metes and bounds of physical land divisions are not clearly demarcated on ground surveys.',
        preventionTip: 'Conduct a formal Revenue Demarcation Survey (Nishandehi).'
      });
      reasoning.push('Vague boundary descriptions trigger boundary encroachment lawsuits among joint owners.');
    }

    if (conflictingClaims) {
      score += 15;
      factors.push({
        id: 'rf-claims',
        factor: 'Active Verbal or Legal Family Objections',
        category: 'legal_clarity',
        severity: 'critical',
        impactPoints: 15,
        description: 'Existing family disputes or written notices served by non-cooperative heirs.',
        preventionTip: 'Initiate mediated pre-litigation conciliation with a certified legal expert.'
      });
      reasoning.push('Pre-existing family disputes indicate high probability of partition lawsuits in civil court.');
      recommendations.push('Book a Pro Bono Legal Consultation with an ADHIKAR specialist to draft a consensus deed.');
    }

    if (secondMarriage) {
      score += 10;
      factors.push({
        id: 'rf-second-marriage',
        factor: 'Complex Marital Lineage (Second Marriage)',
        category: 'family_structure',
        severity: 'medium',
        impactPoints: 10,
        description: 'Children from previous marriages have equal statutory Class I rights under Section 8 HSA.',
        preventionTip: 'Explicitly quantify shares for children of first and second marriages in the Will.'
      });
    }

    if (adoptionCases) {
      score += 8;
      factors.push({
        id: 'rf-adoption',
        factor: 'Adopted Child Inheritance Proof',
        category: 'family_structure',
        severity: 'medium',
        impactPoints: 8,
        description: 'Valid adoption under Hindu Adoptions and Maintenance Act (HAMA) must be documented.',
        preventionTip: 'Keep registered Adoption Deed attached to succession records.'
      });
    }

    // Add family complexity multiplier
    score += (familyComplexityScore - 1) * 3;

    // Cap at 100
    const finalScore = Math.min(100, Math.max(0, score));

    let tier: DisputeRiskAnalysis['riskTier'] = 'Low';
    if (finalScore >= 75) tier = 'Critical';
    else if (finalScore >= 50) tier = 'High';
    else if (finalScore >= 30) tier = 'Medium';

    return {
      riskScore: finalScore,
      riskTier: tier,
      factors,
      explainableReasoning: reasoning,
      recommendations
    };
  };

  const riskData = calculateRisk();

  const getTierColor = (tier: DisputeRiskAnalysis['riskTier']) => {
    switch (tier) {
      case 'Critical': return { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', stroke: '#f43f5e' };
      case 'High': return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', stroke: '#f59e0b' };
      case 'Medium': return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30', stroke: '#eab308' };
      default: return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', stroke: '#10b981' };
    }
  };

  const colors = getTierColor(riskData.riskTier);

  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-xl flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Predictive Dispute Risk Engine
            </span>
            <span className="text-[11px] text-slate-400 font-mono">HSA & Civil Court Analytics</span>
          </div>
          <h2 className="text-2xl font-bold text-white font-sans">Dispute Risk Radar</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Analyzes family structure, property documentation gaps, and legal ambiguity to predict future inheritance litigation risks.
          </p>
        </div>

        <button
          onClick={() => {
            setMissingWill(false);
            setAncestralProperty(false);
            setDocumentationGaps(false);
            setConflictingClaims(false);
            setSecondMarriage(false);
            setAdoptionCases(false);
            setPropertyAmbiguity(false);
            setFamilyComplexityScore(1);
          }}
          className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-bold flex items-center gap-1.5 shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Parameters</span>
        </button>
      </div>

      {/* Grid Layout: Gauge Meter + Heatmap & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Animated Gauge Meter & Score Card */}
        <div className="lg:col-span-1 p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-between text-center relative overflow-hidden">
          <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-bold uppercase tracking-wider text-[11px]">Dispute Probability</span>
            <span className="font-mono text-emerald-400">Live Engine</span>
          </div>

          {/* Animated Gauge SVG */}
          <div className="relative w-48 h-48 my-2 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background Circle Track */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#1e293b"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Animated Value Arc */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke={colors.stroke}
                strokeWidth="10"
                fill="transparent"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * riskData.riskScore) / 100}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Central Score Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-extrabold text-white font-mono tracking-tight">{riskData.riskScore}</span>
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">/ 100 Score</span>
            </div>
          </div>

          {/* Risk Tier Badge */}
          <div className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${colors.bg} ${colors.text} ${colors.border} border shadow-lg mt-2`}>
            {riskData.riskTier} Dispute Risk
          </div>

          <p className="text-xs text-slate-400 mt-3 leading-relaxed">
            {riskData.riskScore > 60 
              ? "High probability of family partition suits or revenue injunctions unless documentation gaps are resolved."
              : "Moderate to low risk. Address identified factors to ensure smooth legal succession."}
          </p>
        </div>

        {/* Right Columns: Interactive Risk Factor Controls & Heatmap */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Interactive Factor Toggles */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>Evaluate Family & Property Variables</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* Toggle 1: Missing Will */}
              <label className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                missingWill ? 'bg-rose-500/10 border-rose-500/30 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileQuestion className={`w-4 h-4 shrink-0 ${missingWill ? 'text-rose-400' : 'text-slate-500'}`} />
                  <div>
                    <span className="text-xs font-bold block truncate">No Registered Will</span>
                    <span className="text-[10px] text-slate-500 block">Intestate Law Applicable</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={missingWill}
                  onChange={(e) => setMissingWill(e.target.checked)}
                  className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                />
              </label>

              {/* Toggle 2: Ancestral Property */}
              <label className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                ancestralProperty ? 'bg-amber-500/10 border-amber-500/30 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <Building2 className={`w-4 h-4 shrink-0 ${ancestralProperty ? 'text-amber-400' : 'text-slate-500'}`} />
                  <div>
                    <span className="text-xs font-bold block truncate">Ancestral Property</span>
                    <span className="text-[10px] text-slate-500 block">4th Gen Coparcenary Rights</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={ancestralProperty}
                  onChange={(e) => setAncestralProperty(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </label>

              {/* Toggle 3: Documentation Gaps */}
              <label className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                documentationGaps ? 'bg-amber-500/10 border-amber-500/30 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className={`w-4 h-4 shrink-0 ${documentationGaps ? 'text-amber-400' : 'text-slate-500'}`} />
                  <div>
                    <span className="text-xs font-bold block truncate">Missing Revenue Records</span>
                    <span className="text-[10px] text-slate-500 block">Unupdated Jamabandi / Intiqal</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={documentationGaps}
                  onChange={(e) => setDocumentationGaps(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </label>

              {/* Toggle 4: Conflicting Claims */}
              <label className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                conflictingClaims ? 'bg-rose-500/10 border-rose-500/30 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <AlertTriangle className={`w-4 h-4 shrink-0 ${conflictingClaims ? 'text-rose-400' : 'text-slate-500'}`} />
                  <div>
                    <span className="text-xs font-bold block truncate">Conflicting Heir Claims</span>
                    <span className="text-[10px] text-slate-500 block">Pre-existing Family Objections</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={conflictingClaims}
                  onChange={(e) => setConflictingClaims(e.target.checked)}
                  className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                />
              </label>

              {/* Toggle 5: Second Marriage */}
              <label className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                secondMarriage ? 'bg-indigo-500/10 border-indigo-500/30 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <Heart className={`w-4 h-4 shrink-0 ${secondMarriage ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <div>
                    <span className="text-xs font-bold block truncate">Second Marriage Lineage</span>
                    <span className="text-[10px] text-slate-500 block">Class I Equal Shares</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={secondMarriage}
                  onChange={(e) => setSecondMarriage(e.target.checked)}
                  className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                />
              </label>

              {/* Toggle 6: Property Ambiguity */}
              <label className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                propertyAmbiguity ? 'bg-amber-500/10 border-amber-500/30 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <Building2 className={`w-4 h-4 shrink-0 ${propertyAmbiguity ? 'text-amber-400' : 'text-slate-500'}`} />
                  <div>
                    <span className="text-xs font-bold block truncate">Joint Property Boundary Vague</span>
                    <span className="text-[10px] text-slate-500 block">Undivided Metes & Bounds</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={propertyAmbiguity}
                  onChange={(e) => setPropertyAmbiguity(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </label>

            </div>
          </div>

          {/* Risk Heatmap Visualization */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-300">Risk Intensity Heatmap</span>
              <span className="text-slate-500 font-mono text-[11px]">{riskData.factors.length} Active Triggers</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 h-3.5 rounded-xl overflow-hidden bg-slate-900 p-0.5 border border-slate-800">
              <div className={`rounded-l-lg transition-all ${missingWill ? 'bg-rose-500' : 'bg-slate-800'}`} title="Will Absence" />
              <div className={`transition-all ${ancestralProperty ? 'bg-amber-500' : 'bg-slate-800'}`} title="Ancestral Property" />
              <div className={`transition-all ${documentationGaps ? 'bg-yellow-500' : 'bg-slate-800'}`} title="Revenue Records" />
              <div className={`rounded-r-lg transition-all ${conflictingClaims ? 'bg-rose-600' : 'bg-slate-800'}`} title="Heir Objections" />
            </div>
          </div>

        </div>
      </div>

      {/* Explainable AI Reasoning & Prevention Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Explainable Legal Reasoning */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-400" />
            <span>Explainable Legal Reasoning</span>
          </h4>

          {riskData.explainableReasoning.length === 0 ? (
            <p className="text-xs text-emerald-400 flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4" /> No major legal risk drivers identified.
            </p>
          ) : (
            <ul className="space-y-2 text-xs text-slate-300">
              {riskData.explainableReasoning.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Prevention Recommendations */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Recommended Prevention Roadmap</span>
          </h4>

          <ul className="space-y-2 text-xs text-slate-300">
            {riskData.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>

          {onNavigate && (
            <button
              onClick={() => onNavigate('calculator')}
              className="mt-2 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20"
            >
              <span>Simulate Inheritance Shares</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
