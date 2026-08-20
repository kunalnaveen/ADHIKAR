import React, { useState } from 'react';
import { 
  Building, 
  MapPin, 
  CheckSquare, 
  Clock, 
  FileText, 
  ChevronRight, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Landmark, 
  PhoneCall, 
  Layers,
  ArrowRight,
  ShieldCheck,
  Compass,
  ExternalLink,
  Globe,
  Sparkles
} from 'lucide-react';
import { GeoOfficeSuggester } from './GeoOfficeSuggester';
import { AppSettings } from '../types';

interface StageStep {
  id: string;
  stageNumber: number;
  title: string;
  officeName: string;
  locationType: string;
  timeline: string;
  estimatedFee: string;
  description: string;
  requiredDocuments: Array<{
    id: string;
    label: string;
    requiredFor: string;
    isMandatory: boolean;
  }>;
  proTips: string;
}

const NAVIGATOR_STAGES: StageStep[] = [
  {
    id: 'stage-1',
    stageNumber: 1,
    title: 'Death Certificate Registration',
    officeName: 'Gram Panchayat / Municipal Corporation Ward Office',
    locationType: 'Local Municipal Body',
    timeline: '3 - 5 Working Days',
    estimatedFee: '₹20 - ₹100',
    description: 'Register the demise of the original property title holder and obtain 5-10 official certified copies of the Death Certificate with QR verification.',
    requiredDocuments: [
      { id: 'doc-1', label: 'Hospital Discharging Memo / Cremation Slip', requiredFor: 'Proof of Demise', isMandatory: true },
      { id: 'doc-2', label: 'Deceased Person Aadhaar & Voter Card Copy', requiredFor: 'Identity Verification', isMandatory: true },
      { id: 'doc-3', label: 'Applicant Relationship Proof & Aadhaar Card', requiredFor: 'Applicant Legitimacy', isMandatory: true },
      { id: 'doc-4', label: 'Form 2 (Death Reporting Form)', requiredFor: 'Statutory Entry', isMandatory: true },
    ],
    proTips: 'Always request at least 5 certified physical copies with official hologram seal for simultaneous submission to Banks, Electricity Board, and Revenue Office.'
  },
  {
    id: 'stage-2',
    stageNumber: 2,
    title: 'Land Revenue Jamabandi Mutation (Namantaran)',
    officeName: 'Tehsildar Court / Revenue Inspector (Lekhpal / Talathi Office)',
    locationType: 'Taluk Revenue Authority',
    timeline: '7 - 14 Working Days',
    estimatedFee: '₹250 - ₹500',
    description: 'Update the official land revenue records (Jamabandi / Khatauni / Patta) to reflect Class I legal heirs or registered Will legatees as current title holders.',
    requiredDocuments: [
      { id: 'doc-5', label: 'Original Death Certificate (Certified Copy)', requiredFor: 'Title Transfer Trigger', isMandatory: true },
      { id: 'doc-6', label: 'Varisaan (Legal Heir) Certificate / Affidavit', requiredFor: 'Class I Succession Proof', isMandatory: true },
      { id: 'doc-7', label: 'Registered Will Copy (if Testate Succession)', requiredFor: 'Testamentary Partition', isMandatory: false },
      { id: 'doc-8', label: 'Latest Property Tax Receipt & Jamabandi Copy', requiredFor: 'Land Identification', isMandatory: true },
    ],
    proTips: 'Obtain the 15-day public objection notice (Ishtahar) copy issued by the Revenue Inspector as proof of pending mutation.'
  },
  {
    id: 'stage-3',
    stageNumber: 3,
    title: 'Family Settlement Deed Adjudication & Stamp Registration',
    officeName: 'Sub-Registrar Office (SRO)',
    locationType: 'District Judicial Registrar',
    timeline: '1 - 3 Working Days',
    estimatedFee: '1% Stamp Duty (Concessional for female heirs in most states)',
    description: 'Execute and register the formal Partition Deed or Family Settlement Agreement signed by all surviving coparceners to prevent future civil litigation.',
    requiredDocuments: [
      { id: 'doc-9', label: 'Drafted Family Settlement Agreement / Partition Deed', requiredFor: 'Legal Binding Contract', isMandatory: true },
      { id: 'doc-10', label: 'Passport Photos & Aadhaar Cards of All Heirs', requiredFor: 'Biometric Attendance at SRO', isMandatory: true },
      { id: 'doc-11', label: 'Two Independent Witness Identity Proofs', requiredFor: 'Attestation at Registrar', isMandatory: true },
      { id: 'doc-12', label: 'Non-Encumbrance Certificate (EC)', requiredFor: 'Lien Check', isMandatory: true },
    ],
    proTips: 'Female coparceners enjoy 1%-2% state stamp duty exemptions in states like Uttar Pradesh, Punjab, Rajasthan, and Maharashtra.'
  },
  {
    id: 'stage-4',
    stageNumber: 4,
    title: 'Bank Deposits, Locker Transmission & Municipal Utility Transfer',
    officeName: 'Bank Branch, Electricity Discom & Municipal Corporation',
    locationType: 'Commercial Banks & Utility Providers',
    timeline: '5 - 10 Working Days',
    estimatedFee: 'Nominal / Free',
    description: 'Transmit bank accounts, fixed deposits, demat shares, electricity meter connection, and water supply bill title from deceased parent to surviving heirs.',
    requiredDocuments: [
      { id: 'doc-13', label: 'Bank Transmission Form Signed by All Heirs', requiredFor: 'Asset Transfer', isMandatory: true },
      { id: 'doc-14', label: 'Indemnity Bond with Bank Nominee Approval', requiredFor: 'Liability Protection', isMandatory: true },
      { id: 'doc-15', label: 'Mutated Revenue Receipt / Registered Settlement Copy', requiredFor: 'Utility Title Transfer', isMandatory: true },
      { id: 'doc-16', label: 'No Objection Certificate (NOC) from Co-heirs', requiredFor: 'Unanimous Release', isMandatory: true },
    ],
    proTips: 'If bank deposit value is below ₹5,00,000, most public banks accept simplified indemnity bonds without requiring a High Court Probate.'
  }
];

export const GovOfficeNavigator: React.FC<{ settings?: AppSettings }> = ({ settings = { language: 'EN', soundEnabled: true, highContrast: false, offlineMode: false, seniorMode: false } }) => {
  const [activeStage, setActiveStage] = useState<number>(1);
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});
  const [selectedState, setSelectedState] = useState<string>('Karnataka');

  const stage = NAVIGATOR_STAGES.find((s) => s.stageNumber === activeStage) || NAVIGATOR_STAGES[0];

  const toggleDoc = (docId: string) => {
    setCheckedDocs((prev) => ({
      ...prev,
      [docId]: !prev[docId]
    }));
  };

  const getCompletedDocsCountForStage = (s: StageStep) => {
    return s.requiredDocuments.filter((d) => checkedDocs[d.id]).length;
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Dynamic GPS Geolocation State-Specific Office & Legal Procedure Links Suggester */}
      <GeoOfficeSuggester 
        settings={settings} 
        onSelectState={(state) => setSelectedState(state)} 
      />

      {/* Main Procedural Stage Tracker */}
      <div className="w-full p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
        {/* Top Banner Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Compass className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wider">
                  Post-Inheritance Action Map
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold font-sans text-white mt-0.5">Government Office Navigator</h2>
            </div>
          </div>

          {/* State Selection Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold hidden sm:inline">State Authority Rules:</span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-slate-950 text-xs font-bold text-emerald-300 border border-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              <option value="Karnataka">Karnataka Bhoomi Revenue System</option>
              <option value="Maharashtra">Maharashtra Land Revenue (Talathi/7-12)</option>
              <option value="Uttar Pradesh">Uttar Pradesh Revenue Code (Lekhpal)</option>
              <option value="Tamil Nadu">Tamil Nadu e-Patta (VAO Office)</option>
              <option value="Telangana">Telangana Dharani Land Portal</option>
              <option value="West Bengal">West Bengal Banglarbhumi</option>
              <option value="Gujarat">Gujarat AnyRoR (VF 7/12)</option>
              <option value="Rajasthan">Rajasthan Apna Khata (E-Dharti)</option>
              <option value="Bihar">Bihar Bhumi Dakhil Kharij</option>
              <option value="Delhi">Delhi DDA & Revenue Department</option>
            </select>
          </div>
        </div>

        {/* Stage Stepper Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {NAVIGATOR_STAGES.map((s) => {
            const completedCount = getCompletedDocsCountForStage(s);
            const totalDocs = s.requiredDocuments.length;
            const isActive = s.stageNumber === activeStage;

            return (
              <button
                key={s.id}
                onClick={() => setActiveStage(s.stageNumber)}
                className={`p-4 rounded-2xl text-left transition-all border flex flex-col justify-between gap-3 ${
                  isActive
                    ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold font-mono ${
                    isActive ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    0{s.stageNumber}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    {completedCount}/{totalDocs} Docs Ready
                  </span>
                </div>

                <div>
                  <h4 className={`text-xs font-bold line-clamp-1 ${isActive ? 'text-white' : 'text-slate-300'}`}>
                    {s.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{s.officeName}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Stage Detailed Guidance Card */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider font-mono">Stage 0{stage.stageNumber}</span>
              <h3 className="text-lg font-bold text-white mt-0.5">{stage.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{stage.description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center min-w-[110px]">
                <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] font-bold uppercase">
                  <Clock className="w-3 h-3 text-indigo-400" />
                  <span>Timeline</span>
                </div>
                <span className="text-xs font-bold text-white mt-0.5 block">{stage.timeline}</span>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center min-w-[110px]">
                <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] font-bold uppercase">
                  <Landmark className="w-3 h-3 text-emerald-400" />
                  <span>Govt Fee</span>
                </div>
                <span className="text-xs font-bold text-emerald-400 mt-0.5 block">{stage.estimatedFee}</span>
              </div>
            </div>
          </div>

          {/* Primary Office Location Detail */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
            <Building className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-white">{stage.officeName}</span>
              <p className="text-xs text-slate-400 mt-0.5">Jurisdiction: {stage.locationType} ({selectedState})</p>
            </div>
          </div>

          {/* Required Documents Interactive Checklist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Mandatory Documents Checklist for {stage.title}</span>
              </h4>
              <span className="text-xs text-slate-400">
                Check off items as you gather them
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stage.requiredDocuments.map((doc) => {
                const isChecked = !!checkedDocs[doc.id];
                return (
                  <div
                    key={doc.id}
                    onClick={() => toggleDoc(doc.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isChecked
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                      isChecked
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                        : 'border-slate-600 bg-slate-950'
                    }`}>
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-bold truncate ${isChecked ? 'text-emerald-300 line-through' : 'text-slate-200'}`}>
                          {doc.label}
                        </span>
                        {doc.isMandatory && (
                          <span className="text-[9px] font-bold text-rose-400 uppercase tracking-wider bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20 shrink-0">
                            Required
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-slate-400 font-mono">Purpose: {doc.requiredFor}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pro-Tips Advice Card */}
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">ADHIKAR Field Pro-Tip</span>
              <p className="text-xs text-slate-300 leading-relaxed">{stage.proTips}</p>
            </div>
          </div>

          {/* Live Google Search Grounded Procedure & Certificate Search Assistant */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Search Government Procedures, Documents & Certificate Guidelines
              </h4>
            </div>
            
            <SearchGroundedProcedureAssistant selectedState={selectedState} />
          </div>

        </div>

      </div>
    </div>
  );
};

const SearchGroundedProcedureAssistant: React.FC<{ selectedState: string }> = ({ selectedState }) => {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<{ answer: string; sources: Array<{ title: string; uri: string }> } | null>(null);

  const presets = [
    `Legal Heir Certificate application procedure in ${selectedState}`,
    `Succession Certificate court petition process & fees in ${selectedState}`,
    `Land mutation & Khata transfer required documents in ${selectedState}`,
    `Procedure for Patta / Varisaan certificate in ${selectedState}`
  ];

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setQuery(searchQuery);
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: searchQuery, topicType: 'procedure' })
      });
      const data = await res.json();
      setResult({
        answer: data.answer || 'Procedure guidelines retrieved successfully.',
        sources: data.sources || []
      });
    } catch (err) {
      console.error('Procedure search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input Box */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
          placeholder={`Search government procedure or document requirements in ${selectedState}...`}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
        <button
          onClick={() => handleSearch(query)}
          disabled={loading || !query.trim()}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 transition-all shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{loading ? 'Searching...' : 'Search'}</span>
        </button>
      </div>

      {/* Preset Suggestions */}
      <div className="flex flex-wrap gap-2">
        {presets.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => handleSearch(preset)}
            className="text-[11px] font-bold text-slate-300 bg-slate-950 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>{preset}</span>
            <ArrowRight className="w-3 h-3 text-emerald-400" />
          </button>
        ))}
      </div>

      {/* Search Grounded Result & Sources */}
      {result && (
        <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              Government Procedure Guidance (Search Grounded)
            </span>
          </div>

          <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-sans">
            {result.answer}
          </div>

          {/* Sources and References */}
          {result.sources && result.sources.length > 0 && (
            <div className="pt-3 border-t border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Official Government Sources & References:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.sources.map((src, idx) => (
                  <a
                    key={idx}
                    href={src.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[11px] text-indigo-300 hover:text-indigo-200 flex items-center justify-between transition-colors group"
                  >
                    <span className="truncate pr-2">{src.title}</span>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
