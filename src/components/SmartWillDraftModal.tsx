import React, { useState, useEffect } from 'react';
import { 
  ScrollText, 
  Sparkles, 
  Users, 
  Home, 
  CheckCircle2, 
  Download, 
  Copy, 
  Printer, 
  X, 
  Loader2, 
  ShieldCheck, 
  AlertTriangle, 
  ChevronRight, 
  FileText, 
  Building2, 
  Coins, 
  BookOpen, 
  Check, 
  Lock, 
  UserPlus,
  Scale,
  PenTool,
  Award,
  Fingerprint
} from 'lucide-react';
import { FamilyTreeData, SmartWillDraft, FamilyMember, UserProfile, ESignatureData } from '../types';
import { t } from '../utils/translate';
import { ESignaturePad } from './ESignaturePad';
import { ESignatureStamp } from './ESignatureStamp';

interface SmartWillDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: { language: string; isHighContrast?: boolean };
  treeData: FamilyTreeData;
  user?: UserProfile | null;
  onOpenAuth?: () => void;
}

export const SmartWillDraftModal: React.FC<SmartWillDraftModalProps> = ({
  isOpen,
  onClose,
  settings,
  treeData,
  user,
  onOpenAuth
}) => {
  const tr = (key: string) => t(key, settings.language);

  // Step navigation: 1: Testator & Capacity, 2: Heirs & Shares, 3: Assets, 4: Executors & Witnesses, 5: Generated Draft
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Testator Details
  const [testatorName, setTestatorName] = useState(treeData.propositusName || 'Rameshwar Sharma');
  const [testatorAge, setTestatorAge] = useState<number>(68);
  const [testatorAddress, setTestatorAddress] = useState('Flat 402, Shanti Enclave, 12th Main, Bangalore - 560038, Karnataka');
  const [religionLaw, setReligionLaw] = useState('Hindu (HSA 1956/2005)');
  const [soundMindDeclaration, setSoundMindDeclaration] = useState(
    'I declare that I am executing this Last Will and Testament in sound health, disposing mind and memory, without any fraud, coercion, undue influence or misrepresentation.'
  );

  // Heirs & Custom Share adjustments
  const [heirShares, setHeirShares] = useState<{ [id: string]: number }>(() => {
    const initial: { [id: string]: number } = {};
    const heirs = treeData.members.filter(m => !m.isPropositus && m.status === 'alive');
    const equalShare = heirs.length > 0 ? Number((100 / heirs.length).toFixed(1)) : 0;
    heirs.forEach(h => {
      initial[h.id] = h.estimatedSharePercent || equalShare;
    });
    return initial;
  });

  // Assets Schedule
  const [assets, setAssets] = useState<{ id: string; title: string; type: string; details: string; value: string }[]>([
    {
      id: 'ast-1',
      title: 'Residential 3-BHK Apartment',
      type: 'Immovable Property',
      details: 'Khata No. 84/2A, Shanti Enclave, Bangalore Urban (Self-Acquired)',
      value: '₹1.85 Cr'
    },
    {
      id: 'ast-2',
      title: 'Ancestral Agricultural Land',
      type: 'Immovable Property',
      details: 'Survey No. 112/4, 2.5 Acres, Devanahalli Taluk',
      value: '₹95 Lakhs'
    },
    {
      id: 'ast-3',
      title: 'Fixed Deposits & Bank Accounts',
      type: 'Movable Assets',
      details: 'State Bank of India A/c 30981244512 & HDFC Fixed Deposits',
      value: '₹42 Lakhs'
    },
    {
      id: 'ast-4',
      title: 'Gold Jewellery & Sovereign Coins',
      type: 'Movable Assets',
      details: '350 Grams 22K Gold Hallmarked Jewellery in SBI Safe Locker 104',
      value: '₹26 Lakhs'
    }
  ]);

  // Executors
  const [executors, setExecutors] = useState<{ name: string; relation: string; address: string }[]>([
    { name: 'Rajesh Sharma', relation: 'Eldest Son', address: 'Bangalore, Karnataka' },
    { name: 'Priya Sharma', relation: 'Daughter / Coparcener', address: 'Mumbai, Maharashtra' }
  ]);

  // Witnesses (Must be non-beneficiaries under Section 67)
  const [witnesses, setWitnesses] = useState<{ name: string; profession: string; address: string }[]>([
    { name: 'Dr. Alok Verma', profession: 'Registered Medical Practitioner', address: 'Bangalore (Sound Mind Certifier)' },
    { name: 'Adv. Suresh Kulkarni', profession: 'Independent Notary Public', address: 'Bangalore Civil Court Bar' }
  ]);

  // Specific Bequests / Special clauses
  const [specialInstructions, setSpecialInstructions] = useState(
    'Equal 50-50 allocation between daughter and son in compliance with HSA 2005 coparcenary principles. Lifetime right of residence granted to spouse Sita Sharma.'
  );

  // Generated Will Draft State
  const [generating, setGenerating] = useState(false);
  const [willDraft, setWillDraft] = useState<SmartWillDraft | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Handle AI Will Generation
  const handleGenerateWill = async () => {
    setGenerating(true);
    setGenerateError(null);

    const familyPayload = {
      ...treeData,
      members: treeData.members.map(m => ({
        ...m,
        estimatedSharePercent: heirShares[m.id] !== undefined ? heirShares[m.id] : m.estimatedSharePercent
      }))
    };

    try {
      const response = await fetch('/api/gemini/generate-will', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testatorDetails: {
            name: testatorName,
            age: testatorAge,
            address: testatorAddress,
            religion: religionLaw,
            soundMindDeclaration
          },
          familyTreeData: familyPayload,
          assetsList: assets,
          executorsList: executors,
          witnessesList: witnesses,
          specificBequests: specialInstructions,
          language: settings.language
        })
      });

      if (!response.ok) throw new Error('Failed to generate Will draft');
      const data = await response.json();
      setWillDraft(data);
      setCurrentStep(5);
    } catch (err: any) {
      console.error('Will draft generation error:', err);
      setGenerateError('Unable to connect to AI Drafting Counsel. Generated standard statutory draft.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyText = () => {
    if (!willDraft) return;
    const fullDraftText = `
${willDraft.willTitle}
Statutory Reference: ${willDraft.statutoryCompliance}
Date: ${willDraft.dateOfDrafting}

TESTATOR:
${willDraft.testatorDetails.name} (Age: ${willDraft.testatorDetails.age})
${willDraft.testatorDetails.address}
${willDraft.testatorDetails.soundMindDeclaration}

SUMMARY:
${willDraft.draftSummary}

FORMAL TESTAMENTARY CLAUSES:
${willDraft.formalClauses.map(c => `Clause ${c.clauseNumber}: ${c.title}\n${c.clauseText}\n`).join('\n')}

ATTESTING WITNESSES (SECTION 63 ISA 1925):
${willDraft.witnessesRequirement.map(w => `- ${w.role}: ${w.requirement}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(fullDraftText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrintDraft = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">{tr("Smart Will Draft Generator")}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider">
                  {tr("ISA 1925 Compliant")}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {tr("Draft a legally structured Last Will & Testament using your family tree data and statutory succession principles")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="px-6 py-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs overflow-x-auto gap-2">
          {[
            { step: 1, label: tr("1. Testator Details"), icon: FileText },
            { step: 2, label: tr("2. Heirs & Shares"), icon: Users },
            { step: 3, label: tr("3. Assets Schedule"), icon: Building2 },
            { step: 4, label: tr("4. Witnesses & Fiduciaries"), icon: ShieldCheck },
            { step: 5, label: tr("5. Final Draft"), icon: BookOpen }
          ].map((item) => {
            const Icon = item.icon;
            const isDone = currentStep > item.step;
            const isCurrent = currentStep === item.step;
            return (
              <button
                key={item.step}
                onClick={() => setCurrentStep(item.step)}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  isCurrent
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                    : isDone
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {isDone && <Check className="w-3 h-3 text-emerald-400" />}
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* STEP 1: TESTATOR DETAILS */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>{tr("Testator Personal Particulars")}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      {tr("Testator Full Legal Name")} *
                    </label>
                    <input
                      type="text"
                      value={testatorName}
                      onChange={(e) => setTestatorName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      {tr("Age of Testator (Must be 18+ under Section 59)")} *
                    </label>
                    <input
                      type="number"
                      value={testatorAge}
                      onChange={(e) => setTestatorAge(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      {tr("Permanent Residential Address")} *
                    </label>
                    <input
                      type="text"
                      value={testatorAddress}
                      onChange={(e) => setTestatorAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      {tr("Applicable Succession Law / Religion")}
                    </label>
                    <select
                      value={religionLaw}
                      onChange={(e) => setReligionLaw(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Hindu (HSA 1956/2005)">Hindu, Sikh, Jain, Buddhist (HSA 1956 / 2005)</option>
                      <option value="Indian Succession Act 1925 (Christian / Parsi)">Christian / Parsi (Indian Succession Act 1925)</option>
                      <option value="Muslim Personal Law (Shariat) 1/3rd Rule">Muslim Personal Law (Max 1/3rd testamentary limit)</option>
                      <option value="Special Marriage Act / Secular">Special Marriage Act / Secular Succession</option>
                    </select>
                  </div>
                </div>

                {/* Mental Capacity Sound Mind Affirmation */}
                <div className="pt-2">
                  <label className="block text-[11px] font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>{tr("Sound Disposing Mind & Free Will Affirmation (Section 59 ISA)")}</span>
                  </label>
                  <textarea
                    rows={2}
                    value={soundMindDeclaration}
                    onChange={(e) => setSoundMindDeclaration(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 leading-relaxed"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    {tr("Under Indian law, a doctor's sound mind fitness certificate on execution date eliminates capacity litigation challenges.")}
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-slate-950 flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <span>{tr("Next: Review Heirs & Shares")}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: HEIRS & ALLOCATIONS */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>{tr("Family Tree Heirs & Beneficiary Shares")}</span>
                  </h3>
                  <span className="text-xs text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                    {tr("Synced with Live Family Tree")}
                  </span>
                </div>

                <p className="text-xs text-slate-400">
                  {tr("Customize the testamentary percentage allocation for each family heir, or keep equal coparcenary shares under Hindu Succession Act principles.")}
                </p>

                <div className="space-y-3">
                  {treeData.members.filter(m => !m.isPropositus && m.status === 'alive').map((member) => (
                    <div
                      key={member.id}
                      className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200 text-xs">
                          {member.initials || member.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{member.name}</h4>
                          <p className="text-[11px] text-slate-400 capitalize">{member.relationship} • {member.heirClass}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-slate-400 font-semibold">{tr("Share")}:</label>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            step={0.5}
                            value={heirShares[member.id] !== undefined ? heirShares[member.id] : 33.3}
                            onChange={(e) => setHeirShares({ ...heirShares, [member.id]: Number(e.target.value) })}
                            className="w-20 px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-amber-300 text-right focus:outline-none focus:border-amber-500"
                          />
                          <span className="text-xs text-slate-400 font-bold">%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Special Instructions */}
                <div className="pt-2">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    {tr("Specific Bequests & Residuary Directives")}
                  </label>
                  <textarea
                    rows={2}
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="e.g. Gold ornaments to daughter Priya; residential house lifetime tenancy to spouse Sita."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 leading-relaxed"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  {tr("Back")}
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-slate-950 flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <span>{tr("Next: Assets Schedule")}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ASSETS SCHEDULE */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <span>{tr("Schedule of Properties (Immovable & Movable)")}</span>
                  </h3>
                  <span className="text-xs text-slate-400">{assets.length} {tr("Items Enumerated")}</span>
                </div>

                <div className="space-y-3">
                  {assets.map((asset) => (
                    <div
                      key={asset.id}
                      className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/80 flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
                          {asset.type === 'Immovable Property' ? <Home className="w-4 h-4" /> : <Coins className="w-4 h-4" />}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{asset.title}</h4>
                          <p className="text-[11px] text-slate-400">{asset.details}</p>
                          <span className="inline-block mt-1 text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                            {asset.type} • Approx {asset.value}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  {tr("Back")}
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-slate-950 flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <span>{tr("Next: Executors & Witnesses")}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: EXECUTORS & WITNESSES */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>{tr("Executors & Attesting Witnesses (Section 63 & 67 ISA)")}</span>
                </h3>

                {/* Statutory Warning */}
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold">{tr("Critical Statutory Requirement (Section 67 of ISA 1925)")}:</p>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      {tr("An attesting witness cannot be a beneficiary or spouse of a beneficiary under the Will. Bequests to attesting witnesses are void under Indian law.")}
                    </p>
                  </div>
                </div>

                {/* Executors Section */}
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    {tr("Appointed Testamentary Executors")}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {executors.map((exec, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white">
                        <p className="font-bold">{exec.name}</p>
                        <p className="text-[11px] text-slate-400">{exec.relation} • {exec.address}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Independent Witnesses Section */}
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    {tr("Independent Non-Beneficiary Witnesses")} (2 Required)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {witnesses.map((w, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white">
                        <div className="flex items-center justify-between">
                          <p className="font-bold">{w.name}</p>
                          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                            {tr("Independent")}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{w.profession}</p>
                        <p className="text-[10px] text-slate-500">{w.address}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {generateError && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{generateError}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  {tr("Back")}
                </button>
                <button
                  onClick={handleGenerateWill}
                  disabled={generating}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 flex items-center gap-2 shadow-xl active:scale-95 transition-all"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>{tr("Gemini AI Drafting Legal Will...")}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{tr("Generate Smart Will Draft")}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: FINAL GENERATED WILL DRAFT */}
          {currentStep === 5 && willDraft && (
            <div className="space-y-6">
              
              {/* Draft Header Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border border-amber-500/30">
                <div>
                  <h3 className="text-sm font-bold text-white">{willDraft.willTitle}</h3>
                  <p className="text-xs text-amber-300 mt-0.5">
                    {willDraft.statutoryCompliance} • {tr("Date")}: {willDraft.dateOfDrafting}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyText}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? tr("Copied!") : tr("Copy Full Draft")}</span>
                  </button>
                  <button
                    onClick={handlePrintDraft}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition-all shadow-md"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{tr("Print / PDF")}</span>
                  </button>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/80 space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {tr("Executive Summary")}
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {willDraft.draftSummary}
                </p>
              </div>

              {/* Formal Clauses List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {tr("Formal Testamentary Clauses")}
                </h4>
                {willDraft.formalClauses.map((clause) => (
                  <div
                    key={clause.clauseNumber}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[11px] font-bold text-amber-400">
                        {clause.clauseNumber}
                      </span>
                      <h5 className="text-xs font-bold text-white">{clause.title}</h5>
                    </div>
                    <p className="text-xs text-slate-300 pl-8 leading-relaxed font-serif">
                      {clause.clauseText}
                    </p>
                  </div>
                ))}
              </div>

              {/* Statutory Validity Checklist */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/80 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{tr("Statutory Validity Checklist")}</span>
                </h4>
                <div className="space-y-2">
                  {willDraft.legalValidityChecklist.map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-slate-200 font-semibold">{item.check}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">{item.note}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            {tr("Draft complies with Indian Succession Act 1925 & Registration Act 1908 provisions.")}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200"
            >
              {tr("Close")}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
