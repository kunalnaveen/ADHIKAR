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
  Compass
} from 'lucide-react';

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

export const GovOfficeNavigator: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(1);
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});
  const [selectedState, setSelectedState] = useState<string>('Punjab & Haryana');

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
            <option value="Punjab & Haryana">Punjab & Haryana Revenue Rules</option>
            <option value="Uttar Pradesh">Uttar Pradesh Revenue Code (Lekhpal)</option>
            <option value="Maharashtra">Maharashtra Land Revenue (Talathi/7-12)</option>
            <option value="Tamil Nadu">Tamil Nadu e-Patta (VAO Office)</option>
            <option value="Delhi NCR">Delhi DDA & Revenue Department</option>
            <option value="Karnataka">Karnataka Bhoomi Revenue System</option>
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
                  ? 'bg-indigo-600/20 border-indigo-500/60 shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-950 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`w-7 h-7 rounded-xl font-mono text-xs font-bold flex items-center justify-center ${
                  isActive ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
                }`}>
                  {s.stageNumber}
                </span>

                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {s.timeline}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white leading-snug line-clamp-1">{s.title}</h4>
                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{s.locationType}</p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800/60">
                <span>Checklist Progress</span>
                <span className="font-mono text-emerald-400 font-bold">{completedCount}/{totalDocs} Docs</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Stage Detailed View Box */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-6">
        
        {/* Stage Header Info */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20 uppercase tracking-widest">
                Stage {stage.stageNumber} Procedure
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                Fee: {stage.estimatedFee}
              </span>
            </div>
            <h3 className="text-xl font-bold font-serif text-white">{stage.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-3xl pt-1">{stage.description}</p>
          </div>

          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-emerald-400 mb-1" />
            <span className="text-xs font-bold text-white">Estimated Turnaround</span>
            <span className="text-sm font-extrabold font-mono text-emerald-400">{stage.timeline}</span>
          </div>
        </div>

        {/* Location & Authority Card */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Landmark className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Designated Authority Office</span>
              <h4 className="text-sm font-bold text-white">{stage.officeName}</h4>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-2 rounded-xl border border-indigo-500/20 shrink-0">
            <MapPin className="w-4 h-4 text-indigo-400" />
            <span>{stage.locationType} ({selectedState})</span>
          </div>
        </div>

        {/* Documentation Checklist Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              <span>Mandatory Documentation Checklist for Stage {stage.stageNumber}</span>
            </h4>
            <span className="text-xs font-mono text-slate-400">
              {getCompletedDocsCountForStage(stage)} of {stage.requiredDocuments.length} Collected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {stage.requiredDocuments.map((doc) => {
              const isChecked = !!checkedDocs[doc.id];

              return (
                <div
                  key={doc.id}
                  onClick={() => toggleDoc(doc.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                    isChecked
                      ? 'bg-emerald-950/20 border-emerald-500/50 shadow-md'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}} // handled by parent onClick
                    className="w-4 h-4 accent-emerald-500 mt-0.5 rounded cursor-pointer shrink-0"
                  />

                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h5 className={`text-xs font-bold ${isChecked ? 'text-emerald-300 line-through' : 'text-white'}`}>
                        {doc.label}
                      </h5>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                        doc.isMandatory 
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {doc.isMandatory ? 'Mandatory' : 'Optional'}
                      </span>
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

      </div>

    </div>
  );
};
