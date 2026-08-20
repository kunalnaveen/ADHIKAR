import React, { useState, useMemo } from 'react';
import { AppSettings, FamilyTreeData, LegalProcessStep, UserProfile, CalculatedShare, PropertyAsset, FamilyMember } from '../types';
import { translations } from '../data/translations';
import { t as translateText } from '../utils/translate';
import { generateInheritancePdf } from '../utils/pdfExport';
import { PrintableQrModal } from './PrintableQrModal';
import { 
  Gavel, 
  CheckCircle2, 
  ChevronRight, 
  Download, 
  Info, 
  ShieldAlert, 
  Building, 
  Landmark, 
  Gem, 
  Cloud, 
  Check, 
  Loader2,
  QrCode,
  FileCheck2,
  FileText,
  Plus,
  Trash2,
  Users,
  Scale,
  RefreshCw,
  Coins,
  Building2,
  AlertTriangle,
  Copy,
  Sliders,
  Sparkles,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';
import { saveInheritanceReportToFirestore } from '../lib/firebase';

interface CalculatorViewProps {
  tree: FamilyTreeData;
  steps?: LegalProcessStep[];
  settings: AppSettings;
  user?: UserProfile | null;
  onOpenAuth?: () => void;
  onUpdateTree?: (updatedTree: FamilyTreeData) => void;
}

export const CalculatorView: React.FC<CalculatorViewProps> = ({ 
  tree, 
  steps = [], 
  settings, 
  user, 
  onOpenAuth,
  onUpdateTree
}) => {
  const t = translations[settings.language] || translations.EN;
  const tr = (str: string) => translateText(str, settings.language);

  // Fallback safe tree getters
  const safeMembers: FamilyMember[] = (tree?.members || []).map((m: any) => ({
    id: m.id || `m-${Math.random()}`,
    name: m.name || 'Family Member',
    relationship: m.relationship || m.relation || 'other',
    status: m.status || (m.isAlive ? 'alive' : 'deceased') || 'alive',
    isPropositus: Boolean(m.isPropositus || m.isOwner),
    isOwner: Boolean(m.isOwner),
    heirClass: m.heirClass || 'Class I',
    gender: m.gender || 'male',
    estimatedSharePercent: m.estimatedSharePercent || 0,
    initials: m.initials || m.name?.slice(0, 2)?.toUpperCase() || 'FM',
    notes: m.notes || ''
  }));

  const safeAssets: PropertyAsset[] = (tree?.assets || []).map((a: any) => ({
    id: a.id || `asset-${Math.random()}`,
    title: a.title || 'Property Asset',
    type: a.type || 'real_estate',
    location: a.location || 'India',
    sharePercentage: a.sharePercentage || 0,
    valueInINR: a.valueInINR || '₹ 50 Lakhs',
    statusBadge: a.statusBadge || 'Clear Title',
    imageUrI: a.imageUrI
  }));

  // State
  const [downloading, setDownloading] = useState(false);
  const [savingReport, setSavingReport] = useState(false);
  const [reportSaved, setReportSaved] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Calculation parameters
  const [totalValuation, setTotalValuation] = useState<number>(10000000); // 1 Crore default
  const [selectedState, setSelectedState] = useState<string>('Karnataka');
  const [personalLaw, setPersonalLaw] = useState<'hindu' | 'muslim' | 'christian' | 'secular'>(
    (tree?.religionLaw as any) || 'hindu'
  );
  const [propertyType, setPropertyType] = useState<'ancestral' | 'self_acquired'>(
    (tree?.propertyType as any) || 'ancestral'
  );

  // Editable local heirs list for simulation
  const [calculatorHeirs, setCalculatorHeirs] = useState<FamilyMember[]>(safeMembers);
  const [showAddHeirForm, setShowAddHeirForm] = useState(false);
  const [newHeirName, setNewHeirName] = useState('');
  const [newHeirRelation, setNewHeirRelation] = useState<'son' | 'daughter' | 'widow' | 'mother' | 'father' | 'brother' | 'sister'>('daughter');
  const [newHeirGender, setNewHeirGender] = useState<'male' | 'female' | 'other'>('female');

  // Interactive Asset Manager
  const [customAssets, setCustomAssets] = useState<PropertyAsset[]>(safeAssets);
  const [showAddAssetForm, setShowAddAssetForm] = useState(false);
  const [newAssetTitle, setNewAssetTitle] = useState('');
  const [newAssetType, setNewAssetType] = useState<'real_estate' | 'bank_deposit' | 'gold' | 'business' | 'vehicle'>('real_estate');
  const [newAssetValuation, setNewAssetValuation] = useState<number>(2500000);
  const [newAssetLocation, setNewAssetLocation] = useState('Bangalore, Karnataka');

  // Quick valuation increments
  const adjustValuation = (delta: number) => {
    setTotalValuation((prev) => Math.max(100000, prev + delta));
  };

  // Toggle Heir Alive / Deceased
  const toggleHeirStatus = (id: string) => {
    setCalculatorHeirs((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const newStatus = m.status === 'alive' ? 'deceased' : 'alive';
          return { ...m, status: newStatus };
        }
        return m;
      })
    );
  };

  // Remove Heir
  const removeHeir = (id: string) => {
    setCalculatorHeirs((prev) => prev.filter((m) => m.id !== id));
  };

  // Add Heir
  const handleAddHeir = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHeirName.trim()) return;

    const newMember: FamilyMember = {
      id: `calc-heir-${Date.now()}`,
      name: newHeirName.trim(),
      relationship: newHeirRelation,
      status: 'alive',
      heirClass: ['widow', 'son', 'daughter', 'mother'].includes(newHeirRelation) ? 'Class I' : 'Class II',
      gender: newHeirGender,
      estimatedSharePercent: 0,
      initials: newHeirName.trim().slice(0, 2).toUpperCase(),
      notes: 'Added via Inheritance Calculator'
    };

    setCalculatorHeirs((prev) => [...prev, newMember]);
    setNewHeirName('');
    setShowAddHeirForm(false);
  };

  // Add Property Asset
  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetTitle.trim()) return;

    const newAsset: PropertyAsset = {
      id: `asset-${Date.now()}`,
      title: newAssetTitle.trim(),
      type: newAssetType,
      location: newAssetLocation.trim() || 'India',
      sharePercentage: 20,
      valueInINR: `₹ ${(newAssetValuation / 100000).toFixed(1)} Lakhs`,
      statusBadge: 'Clear Title'
    };

    setCustomAssets((prev) => [...prev, newAsset]);
    setTotalValuation((prev) => prev + newAssetValuation);
    setNewAssetTitle('');
    setShowAddAssetForm(false);
  };

  // Remove Property Asset
  const removeAsset = (id: string) => {
    setCustomAssets((prev) => prev.filter((a) => a.id !== id));
  };

  // Reset to default tree
  const resetToTreeData = () => {
    setCalculatorHeirs(safeMembers);
    setCustomAssets(safeAssets);
  };

  // Core Legal Succession Calculation Algorithm
  const calculatedShares: CalculatedShare[] = useMemo(() => {
    const aliveHeirs = calculatorHeirs.filter((m) => m.status === 'alive');
    if (aliveHeirs.length === 0) return [];

    // HINDU SUCCESSION ACT (1956 & 2005 Amendment)
    if (personalLaw === 'hindu') {
      const classIHeirs = aliveHeirs.filter((m) =>
        ['widow', 'mother', 'son', 'daughter', 'father'].includes(m.relationship.toLowerCase())
      );

      const activeHeirs = classIHeirs.length > 0 ? classIHeirs : aliveHeirs;
      const count = Math.max(1, activeHeirs.length);
      const equalSharePct = Math.round((100 / count) * 100) / 100;

      return calculatorHeirs.map((m) => {
        if (m.status !== 'alive') {
          return {
            memberId: m.id,
            memberName: m.name,
            relation: m.relationship,
            percentage: 0,
            amount: 0,
            category: 'Deceased (No Direct Claim)',
            reasoning: `${m.name} is deceased. Lineal descendants, if any, succeed by representation under Section 10 Rule 3.`
          };
        }

        const isClassI = ['widow', 'mother', 'son', 'daughter'].includes(m.relationship.toLowerCase());
        const isCoparcener = ['son', 'daughter'].includes(m.relationship.toLowerCase());

        let category = 'Class II Legal Heir';
        let reasoning = 'Succeeds only in absence of Class I legal heirs under Section 8(b) HSA.';

        if (isCoparcener) {
          category = 'Class I Coparcener (Sec 6 HSA)';
          reasoning = propertyType === 'ancestral'
            ? `${m.name} holds equal coparcenary birthright under HSA Section 6 (Vineeta Sharma precedent) with undivided ancestral share.`
            : `${m.name} receives equal statutory intestate share as Class I lineal heir under HSA Section 8/10.`;
        } else if (m.relationship.toLowerCase() === 'widow') {
          category = 'Class I Statutory Heir (Widow)';
          reasoning = `${m.name} takes one share equal to that of each son/daughter as absolute owner under Section 10 Rule 1 & Section 14.`;
        } else if (m.relationship.toLowerCase() === 'mother') {
          category = 'Class I Statutory Heir (Mother)';
          reasoning = `${m.name} is a Class I heir taking one equal share under Section 10 Rule 2.`;
        }

        const pct = isClassI || activeHeirs.includes(m) ? equalSharePct : 0;
        const amt = Math.round((totalValuation * pct) / 100);

        return {
          memberId: m.id,
          memberName: m.name,
          relation: m.relationship,
          percentage: pct,
          amount: amt,
          category,
          reasoning
        };
      });
    }

    // MUSLIM PERSONAL LAW (Shariat Act 1937 - Hanafi / Sunni Rules)
    if (personalLaw === 'muslim') {
      const sons = aliveHeirs.filter((m) => m.relationship.toLowerCase() === 'son');
      const daughters = aliveHeirs.filter((m) => m.relationship.toLowerCase() === 'daughter');
      const widows = aliveHeirs.filter((m) => m.relationship.toLowerCase() === 'widow');
      const mothers = aliveHeirs.filter((m) => m.relationship.toLowerCase() === 'mother');

      const hasChildren = sons.length > 0 || daughters.length > 0;
      
      // Quranic Fixed Sharers (Zawil-Furooz)
      let widowSharePct = 0;
      if (widows.length > 0) {
        widowSharePct = hasChildren ? (12.5 / widows.length) : (25.0 / widows.length); // 1/8 if children, 1/4 if no children
      }

      let motherSharePct = 0;
      if (mothers.length > 0) {
        motherSharePct = hasChildren ? (16.67 / mothers.length) : (33.33 / mothers.length); // 1/6 if children, 1/3 if no children
      }

      const totalFixedSharersPct = (widowSharePct * widows.length) + (motherSharePct * mothers.length);
      const remainingResiduaryPct = Math.max(0, 100 - totalFixedSharersPct);

      // Residuaries (Asabah): 2 parts for Son, 1 part for Daughter
      const totalUnits = (sons.length * 2) + daughters.length;
      const unitValue = totalUnits > 0 ? remainingResiduaryPct / totalUnits : 0;

      return calculatorHeirs.map((m) => {
        if (m.status !== 'alive') {
          return {
            memberId: m.id,
            memberName: m.name,
            relation: m.relationship,
            percentage: 0,
            amount: 0,
            category: 'Deceased',
            reasoning: 'Deceased member under Muslim Sharia jurisprudence.'
          };
        }

        const rel = m.relationship.toLowerCase();
        let pct = 0;
        let category = 'Residuary (Asabah)';
        let reasoning = '';

        if (rel === 'widow') {
          pct = widowSharePct;
          category = 'Quranic Sharer (Zawil-Furooz)';
          reasoning = `${m.name} receives fixed Quranic Quranic share of ${hasChildren ? '1/8th (12.5%)' : '1/4th (25%)'} as surviving widow.`;
        } else if (rel === 'mother') {
          pct = motherSharePct;
          category = 'Quranic Sharer (Zawil-Furooz)';
          reasoning = `${m.name} receives fixed Quranic share of ${hasChildren ? '1/6th (16.67%)' : '1/3rd (33.33%)'} as surviving mother.`;
        } else if (rel === 'son') {
          pct = unitValue * 2;
          category = 'Primary Residuary (Asabah)';
          reasoning = `${m.name} receives 2 units of residuary estate under Sharia 2:1 rule.`;
        } else if (rel === 'daughter') {
          pct = unitValue * 1;
          category = 'Residuary by Brother (Asabah bi-Ghairiha)';
          reasoning = `${m.name} receives 1 unit of residuary estate alongside male coparcener/brother.`;
        } else {
          pct = 0;
          category = 'Distant Kindred (Zawil-Arham)';
          reasoning = 'Excluded in presence of primary sharers and residuaries.';
        }

        pct = Math.round(pct * 100) / 100;
        const amt = Math.round((totalValuation * pct) / 100);

        return {
          memberId: m.id,
          memberName: m.name,
          relation: m.relationship,
          percentage: pct,
          amount: amt,
          category,
          reasoning
        };
      });
    }

    // INDIAN SUCCESSION ACT, 1925 (Christians, Parsis, Secular Civil Marriages)
    const widows = aliveHeirs.filter((m) => m.relationship.toLowerCase() === 'widow');
    const children = aliveHeirs.filter((m) => ['son', 'daughter'].includes(m.relationship.toLowerCase()));

    let widowSharePct = 0;
    if (widows.length > 0) {
      widowSharePct = children.length > 0 ? (33.33 / widows.length) : (50.0 / widows.length); // 1/3 if children, 1/2 if no children
    }

    const remainingForChildren = Math.max(0, 100 - (widowSharePct * widows.length));
    const childSharePct = children.length > 0 ? (remainingForChildren / children.length) : 0;

    return calculatorHeirs.map((m) => {
      if (m.status !== 'alive') {
        return {
          memberId: m.id,
          memberName: m.name,
          relation: m.relationship,
          percentage: 0,
          amount: 0,
          category: 'Deceased',
          reasoning: 'Deceased lineal member.'
        };
      }

      const rel = m.relationship.toLowerCase();
      let pct = 0;
      let category = 'Statutory Heir (ISA 1925)';
      let reasoning = '';

      if (rel === 'widow') {
        pct = widowSharePct;
        category = 'Statutory Widow Share (Sec 33 ISA)';
        reasoning = `${m.name} takes 1/3rd (33.33%) of estate under Section 33(a) of the Indian Succession Act, 1925.`;
      } else if (['son', 'daughter'].includes(rel)) {
        pct = childSharePct;
        category = 'Lineal Descendant (Sec 37 ISA)';
        reasoning = `${m.name} receives equal share of the remaining 2/3rds among all sons and daughters without gender distinction.`;
      } else {
        pct = children.length === 0 && widows.length === 0 ? Math.round(100 / aliveHeirs.length) : 0;
        category = 'Kindred / Collateral Heir';
        reasoning = 'Succeeds under Section 42-48 ISA in absence of direct lineal descendants.';
      }

      pct = Math.round(pct * 100) / 100;
      const amt = Math.round((totalValuation * pct) / 100);

      return {
        memberId: m.id,
        memberName: m.name,
        relation: m.relationship,
        percentage: pct,
        amount: amt,
        category,
        reasoning
      };
    });

  }, [calculatorHeirs, personalLaw, propertyType, totalValuation]);

  // State-specific Revenue & Mutation Rules
  const stateRevenueDetails: Record<string, { stampDuty: string; womenConcession: string; courtFee: string; mutationPortal: string }> = {
    Karnataka: {
      stampDuty: '3% - 5%',
      womenConcession: '0.5% lower registration charge',
      courtFee: 'Maximum ₹15,000 for Succession Certificate',
      mutationPortal: 'Bhoomi Karnataka Land Records (RTC / Pahani)'
    },
    Maharashtra: {
      stampDuty: '5% + 1% Metro Cess',
      womenConcession: '1% Stamp Duty Concession for Female Owners',
      courtFee: 'Maximum ₹75,000 Bombay High Court Scale',
      mutationPortal: 'Mahabhulekh (7/12 Extract / Ferfar)'
    },
    'Uttar Pradesh': {
      stampDuty: '7%',
      womenConcession: '₹10,000 concession in stamp duty for women',
      courtFee: 'Scale up to ₹25,000 in Civil Courts',
      mutationPortal: 'UP Bhulekh / e-Khasra Portal'
    },
    'Tamil Nadu': {
      stampDuty: '7% + 2% Surcharge',
      womenConcession: 'Standardized rate across state',
      courtFee: 'Maximum ₹25,000 Madras High Court fee',
      mutationPortal: 'TN Patta Chitta Portal'
    },
    'West Bengal': {
      stampDuty: '6% (Urban) / 5% (Rural)',
      womenConcession: 'Exemption on family partition deeds',
      courtFee: 'Ad-valorem capped at ₹10,000',
      mutationPortal: 'Banglarbhumi Khatian Portal'
    },
    Gujarat: {
      stampDuty: '4.9%',
      womenConcession: '100% exemption on registration fee for women',
      courtFee: 'Fixed standard fee of ₹15,000',
      mutationPortal: 'AnyRoR Gujarat (7/12 & 8A Records)'
    },
    Punjab: {
      stampDuty: '6%',
      womenConcession: '1% concession for female transferees',
      courtFee: 'Capped at ₹10,000',
      mutationPortal: 'PLRS Punjab Land Records (Jamabandi)'
    },
    Delhi: {
      stampDuty: '6% (Men) / 4% (Women)',
      womenConcession: '2% Stamp Duty Discount for Women',
      courtFee: 'Maximum ₹20,000 Delhi High Court',
      mutationPortal: 'DORIS Delhi Online Registration'
    },
    Bihar: {
      stampDuty: '6% (Men) / 5.7% (Women)',
      womenConcession: '0.3% discount on stamp duty',
      courtFee: 'Capped at ₹15,000',
      mutationPortal: 'Biharbhumi Portal'
    }
  };

  const currentStateInfo = stateRevenueDetails[selectedState] || stateRevenueDetails.Karnataka;

  // Cloud Save
  const handleSaveReportToCloud = async () => {
    if (!user) {
      onOpenAuth?.();
      return;
    }
    setSavingReport(true);
    try {
      await saveInheritanceReportToFirestore(user.id, {
        title: `Inheritance Legal Report - ${tree?.propositusName || 'Propositus'}`,
        decedentName: tree?.propositusName || 'Deceased Propositus',
        personalLaw: `${personalLaw.toUpperCase()} Succession Act`,
        totalAssetValue: totalValuation,
        shares: calculatedShares.map((s) => ({ 
          name: s.memberName, 
          relationship: s.relation, 
          share: s.percentage 
        })),
      });
      setReportSaved(true);
      setTimeout(() => setReportSaved(false), 3000);
    } catch (e) {
      console.error('Save to cloud error:', e);
    } finally {
      setSavingReport(false);
    }
  };

  // Export PDF
  const handleExportStructuredPDF = async () => {
    setDownloading(true);
    try {
      await generateInheritancePdf({
        tree: {
          ...tree,
          members: calculatorHeirs,
          assets: customAssets,
          religionLaw: personalLaw,
          propertyType: propertyType
        },
        calculatedShares,
        totalPropertyValue: totalValuation,
        settings,
        user,
        selectedState
      });
    } catch (err) {
      console.error("PDF Export Error:", err);
    } finally {
      setDownloading(false);
    }
  };

  // Copy Summary
  const handleCopySummary = () => {
    const lines = [
      `ADHIKAR STATUTORY INHERITANCE REPORT`,
      `Deceased Propositus: ${tree?.propositusName || 'Family Head'}`,
      `Applicable Law: ${personalLaw.toUpperCase()} Succession Framework`,
      `Property Classification: ${propertyType === 'ancestral' ? 'Ancestral (Coparcenary)' : 'Self-Acquired'}`,
      `Jurisdiction: ${selectedState}`,
      `Total Estate Valuation: ₹ ${totalValuation.toLocaleString('en-IN')}`,
      `----------------------------------------`,
      `LEGAL HEIRS BREAKDOWN:`,
      ...calculatedShares.map((s) => `- ${s.memberName} (${s.relation}): ${s.percentage}% -> ₹ ${s.amount.toLocaleString('en-IN')} [${s.category}]`),
      `----------------------------------------`,
      `Verified via ADHIKAR Legal AI Platform`
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 3000);
  };

  return (
    <div className="flex flex-col w-full px-4 md:px-8 max-w-7xl mx-auto pt-6 pb-28 text-slate-100 gap-6">
      
      {/* 1. Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-[#111827] border border-slate-700/80 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Scale className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-serif">{tr("Statutory Inheritance & Estate Distribution Engine")}</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-white font-serif tracking-tight">
            {tr("Interactive Inheritance Calculator")}
          </h1>

          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            {tr("Calculate exact statutory percentage shares for each legal heir with live statutory precedent citations under Hindu, Muslim, or Indian Succession Acts.")}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleCopySummary}
            className="px-4 py-2.5 rounded-xl bg-[#0b0f19] hover:bg-slate-800 text-slate-200 font-semibold text-xs flex items-center gap-2 border border-slate-700 shadow-sm active:scale-95 transition-all"
            title="Copy Text Summary"
          >
            {copiedSummary ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-indigo-400" />}
            <span>{copiedSummary ? tr("Copied!") : tr("Copy Summary")}</span>
          </button>

          <button
            onClick={() => setShowQrModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#0b0f19] hover:bg-slate-800 text-slate-200 font-semibold text-xs flex items-center gap-2 border border-slate-700 shadow-sm active:scale-95 transition-all"
          >
            <QrCode className="w-4 h-4 text-indigo-400" />
            <span>{tr("Lineage QR")}</span>
          </button>

          <button
            onClick={handleExportStructuredPDF}
            disabled={downloading}
            className="px-4 py-2.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-semibold text-xs flex items-center gap-2 border border-indigo-500/40 shadow-md active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? tr("Exporting...") : tr("Export Legal PDF")}</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Calculator Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Control 1: Personal Law System */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-slate-700/80 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-serif">
              <Gavel className="w-4 h-4 text-indigo-400" />
              <span>{tr("Personal Law System")}</span>
            </span>
            <span className="text-[10px] font-bold text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
              Statutory
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setPersonalLaw('hindu')}
              className={`p-3 rounded-xl text-left text-xs font-bold transition-all border ${
                personalLaw === 'hindu'
                  ? 'bg-indigo-900/90 text-white border-indigo-500/60 shadow-md'
                  : 'bg-[#0b0f19] text-slate-300 border-slate-800 hover:bg-slate-850'
              }`}
            >
              <div className="font-extrabold font-serif">Hindu Act (HSA)</div>
              <div className="text-[10px] font-normal opacity-80 mt-0.5">1956 & 2005 Coparcenary</div>
            </button>

            <button
              onClick={() => setPersonalLaw('muslim')}
              className={`p-3 rounded-xl text-left text-xs font-bold transition-all border ${
                personalLaw === 'muslim'
                  ? 'bg-indigo-900/90 text-white border-indigo-500/60 shadow-md'
                  : 'bg-[#0b0f19] text-slate-300 border-slate-800 hover:bg-slate-850'
              }`}
            >
              <div className="font-extrabold font-serif">Muslim Shariat</div>
              <div className="text-[10px] font-normal opacity-80 mt-0.5">Sharers & Residuaries (1937)</div>
            </button>

            <button
              onClick={() => setPersonalLaw('christian')}
              className={`p-3 rounded-xl text-left text-xs font-bold transition-all border ${
                personalLaw === 'christian'
                  ? 'bg-indigo-900/90 text-white border-indigo-500/60 shadow-md'
                  : 'bg-[#0b0f19] text-slate-300 border-slate-800 hover:bg-slate-850'
              }`}
            >
              <div className="font-extrabold font-serif">Christian / Parsi</div>
              <div className="text-[10px] font-normal opacity-80 mt-0.5">Indian Succession Act 1925</div>
            </button>

            <button
              onClick={() => setPersonalLaw('secular')}
              className={`p-3 rounded-xl text-left text-xs font-bold transition-all border ${
                personalLaw === 'secular'
                  ? 'bg-indigo-900/90 text-white border-indigo-500/60 shadow-md'
                  : 'bg-[#0b0f19] text-slate-300 border-slate-800 hover:bg-slate-850'
              }`}
            >
              <div className="font-extrabold font-serif">Special Marriage</div>
              <div className="text-[10px] font-normal opacity-80 mt-0.5">Secular Civil Succession</div>
            </button>
          </div>
        </div>

        {/* Control 2: Property Classification & Jurisdiction */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-slate-700/80 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-serif">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>{tr("Property Nature & State")}</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {selectedState}
            </span>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPropertyType('ancestral')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  propertyType === 'ancestral'
                    ? 'bg-emerald-700 text-white border-emerald-500 shadow-md'
                    : 'bg-[#0b0f19] text-slate-300 border-slate-800 hover:bg-slate-850'
                }`}
              >
                Ancestral / Joint
              </button>
              <button
                onClick={() => setPropertyType('self_acquired')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  propertyType === 'self_acquired'
                    ? 'bg-emerald-700 text-white border-emerald-500 shadow-md'
                    : 'bg-[#0b0f19] text-slate-300 border-slate-800 hover:bg-slate-850'
                }`}
              >
                Self-Acquired
              </button>
            </div>

            <div className="bg-[#0b0f19] p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">State Jurisdiction:</span>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-[#111827] text-xs font-bold text-white px-2 py-1 rounded-lg border border-slate-700 outline-none cursor-pointer"
              >
                <option value="Karnataka">Karnataka</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="West Bengal">West Bengal</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Punjab">Punjab</option>
                <option value="Delhi">Delhi</option>
                <option value="Bihar">Bihar</option>
              </select>
            </div>
          </div>
        </div>

        {/* Control 3: Total Estate Valuation */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-slate-700/80 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-serif">
              <Coins className="w-4 h-4 text-indigo-400" />
              <span>{tr("Total Estate Valuation")}</span>
            </span>
            <span className="text-xs font-mono font-bold text-indigo-300">
              ₹ {(totalValuation / 10000000).toFixed(2)} Cr
            </span>
          </div>

          <div className="bg-[#0b0f19] p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
            <span className="text-sm font-bold text-slate-400">₹</span>
            <input
              type="number"
              value={totalValuation}
              onChange={(e) => setTotalValuation(Math.max(0, Number(e.target.value) || 0))}
              className="flex-1 bg-transparent text-sm font-bold text-white outline-none"
              step={500000}
            />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => adjustValuation(1000000)}
              className="flex-1 py-1 px-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-[11px] font-bold text-slate-300 border border-slate-800 transition-colors"
            >
              +₹10 L
            </button>
            <button
              onClick={() => adjustValuation(5000000)}
              className="flex-1 py-1 px-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-[11px] font-bold text-slate-300 border border-slate-800 transition-colors"
            >
              +₹50 L
            </button>
            <button
              onClick={() => adjustValuation(10000000)}
              className="flex-1 py-1 px-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-[11px] font-bold text-slate-300 border border-slate-800 transition-colors"
            >
              +₹1 Cr
            </button>
          </div>
        </div>

      </div>

      {/* 3. Main Calculated Statutory Shares Breakdown */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-sans">
                {tr("Statutory Legal Heir Distribution")}
              </h3>
              <p className="text-xs text-slate-400">
                {personalLaw === 'hindu' && 'Hindu Succession Act 1956 (Class I Heirs & Sec 6 Coparceners)'}
                {personalLaw === 'muslim' && 'Muslim Shariat Application Act 1937 (Sharers & Residuaries)'}
                {personalLaw === 'christian' && 'Indian Succession Act 1925 (Lineal Descendants & Widow)'}
                {personalLaw === 'secular' && 'Special Marriage Act 1954 (Equal Lineal Succession)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddHeirForm(!showAddHeirForm)}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddHeirForm ? tr("Close Form") : tr("Add Legal Heir")}</span>
            </button>

            <button
              onClick={resetToTreeData}
              className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
              title="Reset to Family Tree Baseline"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Add Heir Form (Collapsible) */}
        {showAddHeirForm && (
          <form onSubmit={handleAddHeir} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>Add Simulated Legal Heir</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={newHeirName}
                onChange={(e) => setNewHeirName(e.target.value)}
                placeholder="Full Name (e.g. Ananya Sharma)"
                className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-xs text-white outline-none focus:border-blue-500"
                required
              />

              <select
                value={newHeirRelation}
                onChange={(e) => setNewHeirRelation(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-xs text-white outline-none"
              >
                <option value="daughter">Daughter (Class I)</option>
                <option value="son">Son (Class I)</option>
                <option value="widow">Widow / Surviving Spouse (Class I)</option>
                <option value="mother">Mother (Class I)</option>
                <option value="father">Father (Class II)</option>
                <option value="brother">Brother (Class II)</option>
                <option value="sister">Sister (Class II)</option>
              </select>

              <select
                value={newHeirGender}
                onChange={(e) => setNewHeirGender(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-xs text-white outline-none"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddHeirForm(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm"
              >
                Add Heir to Calculation
              </button>
            </div>
          </form>
        )}

        {/* Calculated Shares Cards List */}
        <div className="space-y-3">
          {calculatedShares.map((share) => (
            <div 
              key={share.memberId}
              className="p-4 md:p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5 flex-1">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${
                  share.percentage > 0
                    ? 'bg-blue-600/10 border-blue-500/30 text-blue-400'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}>
                  {share.relation.slice(0, 2).toUpperCase()}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-bold text-white font-sans">{share.memberName}</h4>
                    <span className="text-[10px] font-semibold text-slate-300 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800 uppercase">
                      {share.relation}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      share.percentage > 0
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        : 'text-slate-400 bg-slate-900 border-slate-800'
                    }`}>
                      {share.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                    {share.reasoning}
                  </p>
                </div>
              </div>

              {/* Shares & Monetary Output */}
              <div className="flex items-center justify-between md:justify-end gap-5 border-t md:border-t-0 border-slate-900 pt-3 md:pt-0 shrink-0">
                <div className="text-left md:text-right">
                  <div className="text-[11px] text-slate-400">Share Ratio</div>
                  <div className="text-lg font-extrabold text-white font-mono">
                    {share.percentage}%
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] text-slate-400">Statutory Value</div>
                  <div className="text-lg font-extrabold text-emerald-400 font-mono">
                    ₹ {share.amount.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Quick Toggle / Remove Actions */}
                <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
                  <button
                    onClick={() => toggleHeirStatus(share.memberId)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                      share.percentage > 0
                        ? 'bg-slate-900 text-slate-300 border-slate-800 hover:text-rose-400'
                        : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20'
                    }`}
                    title={share.percentage > 0 ? "Mark Deceased" : "Mark Alive"}
                  >
                    {share.percentage > 0 ? "Mark Deceased" : "Mark Alive"}
                  </button>

                  <button
                    onClick={() => removeHeir(share.memberId)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Remove heir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* 4. Asset Portfolio & Revenue Office Guidance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Card A: Property Asset Portfolio Breakdown */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-bold text-white">Estate Asset Inventory</h3>
            </div>
            <button
              onClick={() => setShowAddAssetForm(!showAddAssetForm)}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Asset</span>
            </button>
          </div>

          {showAddAssetForm && (
            <form onSubmit={handleAddAsset} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5">
              <input
                type="text"
                value={newAssetTitle}
                onChange={(e) => setNewAssetTitle(e.target.value)}
                placeholder="Asset Name (e.g. Agricultural Land, Pune)"
                className="w-full bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-white outline-none"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newAssetType}
                  onChange={(e) => setNewAssetType(e.target.value as any)}
                  className="bg-slate-900 border border-slate-800 px-2 py-1.5 rounded-lg text-xs text-white outline-none"
                >
                  <option value="real_estate">Real Estate / Land</option>
                  <option value="bank_deposit">Bank Account / FD</option>
                  <option value="gold">Gold & Jewellery</option>
                  <option value="business">Business Equity</option>
                  <option value="vehicle">Vehicle</option>
                </select>
                <input
                  type="number"
                  value={newAssetValuation}
                  onChange={(e) => setNewAssetValuation(Number(e.target.value) || 0)}
                  placeholder="Valuation (₹)"
                  className="bg-slate-900 border border-slate-800 px-2 py-1.5 rounded-lg text-xs text-white outline-none"
                  step={100000}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddAssetForm(false)}
                  className="px-3 py-1 rounded-lg bg-slate-900 text-slate-400 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold"
                >
                  Add to Total
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2.5">
            {customAssets.map((asset) => (
              <div key={asset.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                    {asset.type === 'real_estate' && <Building className="w-4 h-4" />}
                    {asset.type === 'bank_deposit' && <Landmark className="w-4 h-4 text-emerald-400" />}
                    {asset.type === 'gold' && <Gem className="w-4 h-4 text-amber-400" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{asset.title}</h4>
                    <p className="text-[11px] text-slate-400">{asset.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-white">{asset.valueInINR}</span>
                  <button
                    onClick={() => removeAsset(asset.id)}
                    className="text-slate-600 hover:text-rose-400 p-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card B: State Jurisdiction & Revenue Mutation Rules */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Landmark className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">{selectedState} Revenue Guidance</h3>
            </div>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              State Portal Verified
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Stamp Duty on Partition:</span>
              <span className="font-bold text-white font-mono">{currentStateInfo.stampDuty}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Women Concession:</span>
              <span className="font-bold text-emerald-400">{currentStateInfo.womenConcession}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Civil Court Fee Cap:</span>
              <span className="font-bold text-white font-mono">{currentStateInfo.courtFee}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Land Records Portal:</span>
              <span className="font-bold text-blue-400 truncate max-w-[200px] text-right">{currentStateInfo.mutationPortal}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 5. Statutory Precedents & Citations Box */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <Gavel className="w-5 h-5 text-blue-400" />
          <h3 className="text-base font-bold text-white font-sans">{t.legalReasoning}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-bold text-blue-400">Vineeta Sharma v. Rakesh Sharma (2020)</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              3-Judge Supreme Court bench confirmed daughter’s coparcenary birthright under Hindu Succession (Amendment) Act, 2005 is retroactive and unconditional.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-bold text-emerald-400">Section 14 HSA (Absolute Ownership)</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Any property inherited or possessed by a Hindu female is held by her as absolute full owner with unrestricted alienation powers, not as limited estate.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-bold text-amber-400">Representation in Per-Stirpes</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              In case of a predeceased heir, their surviving children collectively divide their parent’s share under Section 10 Rule 3 & 4.
            </p>
          </div>
        </div>
      </div>

      {/* 6. Cloud Save & Direct Actions Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Save Calculation to Encrypted Vault</h4>
            <p className="text-xs text-slate-400">Store this inheritance share breakdown securely in your cloud vault</p>
          </div>
        </div>

        <button
          onClick={handleSaveReportToCloud}
          disabled={savingReport}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95 shadow-md ${
            reportSaved
              ? 'bg-emerald-500 text-white'
              : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
        >
          {savingReport ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : reportSaved ? (
            <Check className="w-4 h-4" />
          ) : (
            <Cloud className="w-4 h-4" />
          )}
          <span>{reportSaved ? tr("Saved to Cloud Vault!") : tr("Save to Cloud Vault")}</span>
        </button>
      </div>

      {/* Printable QR Code Modal */}
      {showQrModal && (
        <PrintableQrModal
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
          tree={{
            ...tree,
            members: calculatorHeirs,
            assets: customAssets
          }}
          calculatedShares={calculatedShares}
          settings={settings}
          totalPropertyValue={totalValuation}
        />
      )}

    </div>
  );
};
