import React, { useState, useEffect } from 'react';
import { AppSettings, FamilyMember, FamilyTreeData, UserProfile } from '../types';
import { translations } from '../data/translations';
import { t as translateText, translateNumber } from '../utils/translate';
import { ShaderBackground } from './ShaderBackground';
import { 
  Edit3, 
  Plus, 
  Lightbulb, 
  Gavel, 
  UserCheck, 
  X, 
  Check, 
  Scale, 
  Cloud, 
  Loader2,
  QrCode,
  Download,
  Printer,
  Fingerprint,
  Lock,
  Unlock,
  ShieldCheck,
  KeyRound
} from 'lucide-react';
import { saveFamilyTreeToFirestore } from '../lib/firebase';
import { generateInheritancePdf } from '../utils/pdfExport';
import { PrintableQrModal } from './PrintableQrModal';
import { BiometricAuthModal } from './BiometricAuthModal';
import { DocumentScannerModal } from './DocumentScannerModal';
import { isVaultLocked, isBiometricEnrolled, setVaultLockedState } from '../utils/webAuthn';
import { Camera } from 'lucide-react';

interface FamilyTreeNetworkViewProps {
  tree: FamilyTreeData;
  onUpdateTree: (updatedTree: FamilyTreeData) => void;
  settings: AppSettings;
  user?: UserProfile | null;
  onOpenAuth?: () => void;
}

export const FamilyTreeNetworkView: React.FC<FamilyTreeNetworkViewProps> = ({
  tree,
  onUpdateTree,
  settings,
  user,
  onOpenAuth,
}) => {
  const tr = (str: string) => translateText(str, settings.language);
  const trNum = (num: number | string) => translateNumber(num, settings.language);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);

  // Biometric state
  const [isLocked, setIsLocked] = useState<boolean>(() => isVaultLocked());
  const [showBioModal, setShowBioModal] = useState<boolean>(false);

  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScenarioModal, setShowScenarioModal] = useState(false);

  // New member state
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'son' | 'daughter' | 'brother' | 'sister' | 'widow'>('daughter');

  const handleAddScannedMembers = (newMembers: FamilyMember[]) => {
    const updatedMembers = [...tree.members, ...newMembers];
    // Recalculate shares
    const activeHeirs = updatedMembers.filter((m) => !m.isPropositus && m.status === 'alive');
    const share = activeHeirs.length > 0 ? 100 / activeHeirs.length : 0;

    const recalculated = updatedMembers.map((m) => {
      if (m.isPropositus) return m;
      return { ...m, estimatedSharePercent: Number(share.toFixed(1)) };
    });

    onUpdateTree({ ...tree, members: recalculated });
  };

  // Scenario Simulator State
  const [scenarioIncludePre2005, setScenarioIncludePre2005] = useState(false);
  const [scenarioHasWill, setScenarioHasWill] = useState(false);

  useEffect(() => {
    setIsLocked(isVaultLocked());
  }, []);

  const handleSaveToCloud = async () => {
    if (!user) {
      onOpenAuth?.();
      return;
    }
    setSaving(true);
    try {
      await saveFamilyTreeToFirestore(user.id, tree);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleExportPdf = async () => {
    setDownloadingPdf(true);
    try {
      await generateInheritancePdf({
        tree,
        calculatedShares: tree.members
          .filter((m) => !m.isPropositus)
          .map((m) => ({
            memberId: m.id,
            memberName: m.name,
            relationship: m.relationship,
            heirClass: m.heirClass || 'Class I',
            gender: m.gender,
            isCoparcener: m.gender === 'female' ? true : true,
            rawShareFraction: `${m.estimatedSharePercent}/100`,
            sharePercentage: m.estimatedSharePercent,
            statutoryBasis: 'Hindu Succession (Amendment) Act 2005 (Vineeta Sharma v. Rakesh Sharma)',
            legalNotes: 'Equal coparcenary birthright under Section 6'
          })),
        settings,
        user,
        totalPropertyValue: 15000000,
        selectedState: 'Karnataka',
        propertyType: 'Ancestral residential plot & agricultural holdings'
      });
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newMember: FamilyMember = {
      id: `member-${Date.now()}`,
      name: newName,
      relationship: newRole,
      status: 'alive',
      heirClass: 'Class I',
      gender: newRole === 'daughter' || newRole === 'sister' || newRole === 'widow' ? 'female' : 'male',
      estimatedSharePercent: 0,
      initials: newName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2),
      notes: `${newRole.toUpperCase()} (${tr("Class I Heir")})`,
    };

    const updatedMembers = [...tree.members, newMember];
    
    // Recalculate shares equally among alive Class I heirs
    const activeHeirs = updatedMembers.filter((m) => !m.isPropositus && m.status === 'alive');
    const share = activeHeirs.length > 0 ? 100 / activeHeirs.length : 0;

    const recalculated = updatedMembers.map((m) => {
      if (m.isPropositus) return m;
      return { ...m, estimatedSharePercent: Number(share.toFixed(1)) };
    });

    onUpdateTree({ ...tree, members: recalculated });
    setNewName('');
    setShowAddModal(false);
  };

  const handleToggleBiometricLock = () => {
    if (isLocked) {
      setShowBioModal(true);
    } else {
      setVaultLockedState(true);
      setIsLocked(true);
    }
  };

  return (
    <div className="flex flex-col w-full relative min-h-[calc(100vh-4rem)] pb-28 text-white">
      {/* Background WebGL Shader */}
      <ShaderBackground opacity={0.4} />

      {/* Biometric WebAuthn Auth Modal */}
      {showBioModal && (
        <BiometricAuthModal
          isOpen={showBioModal}
          onClose={() => setShowBioModal(false)}
          onSuccess={() => {
            setIsLocked(false);
            setVaultLockedState(false);
            setShowBioModal(false);
          }}
          settings={settings}
          title={tr("Unlock Family Lineage Tree")}
          subtitle={tr("Scan Fingerprint or Face ID to unlock protected family genealogy records")}
        />
      )}

      {/* Printable QR Code Modal */}
      {showQrModal && (
        <PrintableQrModal
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
          tree={tree}
          settings={settings}
          calculatedShares={tree.members.filter(m => !m.isPropositus).map(m => ({
            memberId: m.id,
            memberName: m.name,
            relationship: m.relationship,
            heirClass: m.heirClass || 'Class I',
            gender: m.gender,
            isCoparcener: true,
            rawShareFraction: `${m.estimatedSharePercent}/100`,
            sharePercentage: m.estimatedSharePercent,
            statutoryBasis: 'HSA 2005 Sec 6',
            legalNotes: 'Equal coparcenary share'
          }))}
        />
      )}

      <div className="relative z-10 flex flex-col w-full h-full p-4 md:p-8 max-w-7xl mx-auto gap-4">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-800 shadow-md">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 uppercase tracking-wider">
                {tr("Interactive Genealogical Tree")}
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {isLocked ? tr("Biometric Locked") : tr("WebAuthn Protected")}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white font-sans">{tr(tree.title)}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{tr(tree.subtitle)} • {tr(tree.propositusName)}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Biometric Lock / Unlock Trigger */}
            <button
              onClick={handleToggleBiometricLock}
              className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                isLocked 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30' 
                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
              }`}
              title={isLocked ? "Unlock with Biometrics" : "Lock Family Tree with Biometrics"}
            >
              <Fingerprint className="w-4 h-4 text-emerald-400" />
              <span>{isLocked ? tr("Unlock (Biometric)") : tr("Lock Tree")}</span>
            </button>

            {/* Printable QR Code Button */}
            <button
              onClick={() => setShowQrModal(true)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              title="Generate Printable QR Code for Offline Authorities"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>{tr("Lineage QR")}</span>
            </button>

            {/* Export Legal PDF Button */}
            <button
              onClick={handleExportPdf}
              disabled={downloadingPdf}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-all shadow-md active:scale-95 shadow-indigo-500/20"
              title="Export Legal Heir Certificate PDF"
            >
              <Download className="w-4 h-4" />
              <span>{downloadingPdf ? tr("Generating...") : tr("Export PDF")}</span>
            </button>

            {/* Cloud Save Button */}
            <button
              onClick={handleSaveToCloud}
              disabled={saving}
              className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all shadow-md ${
                saveSuccess
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border-indigo-500/40'
              }`}
              title="Save Family Tree to Firestore Cloud"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saveSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Cloud className="w-4 h-4" />}
              <span>{saving ? tr("Saving...") : saveSuccess ? tr("Saved to Cloud") : tr("Save Cloud")}</span>
            </button>

            {/* Scan Legal Deed & Auto-Extract Heirs Button */}
            <button
              onClick={() => setShowScannerModal(true)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-blue-600/30 hover:bg-blue-600/40 text-blue-300 border border-blue-500/40 flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              title="Scan Legal Deed or Will to Auto-Extract Family Members"
            >
              <Camera className="w-4 h-4 text-blue-400" />
              <span>{tr("Scan Deed to Add")}</span>
            </button>

            {/* Add Member Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-slate-950 flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{tr("Add Heir")}</span>
            </button>
          </div>
        </div>

        {/* LOCKED STATE VIEW */}
        {isLocked ? (
          <div className="flex-1 w-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 md:p-12 flex flex-col items-center justify-center text-center shadow-2xl space-y-5 my-auto min-h-[420px]">
            <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border-2 border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.25)]">
              <Fingerprint className="w-10 h-10 text-emerald-400 animate-pulse" />
            </div>

            <div className="space-y-1 max-w-md">
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>WebAuthn FIDO2 Biometric Enclave</span>
              </div>
              <h3 className="text-xl font-bold font-serif text-white">
                {tr("Family Tree is Protected")}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {tr("This inheritance tree contains sensitive legal heir details and property distribution. Unlock with your fingerprint or face ID to view and edit.")}
              </p>
            </div>

            <button
              onClick={() => setShowBioModal(true)}
              className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-indigo-500/30 active:scale-95 transition-all"
            >
              <Fingerprint className="w-5 h-5 text-emerald-400" />
              <span>{tr("Unlock with Fingerprint / Face ID")}</span>
            </button>
          </div>
        ) : (
          /* UNLOCKED TREE VISUALIZATION CANVAS */
          <div className="flex-1 w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-center items-center shadow-2xl min-h-[460px]">
            {/* SVG Tree Graph Connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="tree-line-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.6" />
                </linearGradient>
              </defs>
              {/* Draw curves from Root to children */}
              <path d="M 200 80 C 200 150, 100 150, 100 220" fill="none" stroke="url(#tree-line-grad)" strokeWidth="2" strokeDasharray="4 2" />
              <path d="M 200 80 C 200 150, 200 150, 200 220" fill="none" stroke="url(#tree-line-grad)" strokeWidth="2" />
              <path d="M 200 80 C 200 150, 300 150, 300 220" fill="none" stroke="url(#tree-line-grad)" strokeWidth="2" />
            </svg>

            {/* Interactive Nodes Layer */}
            <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center gap-12 py-4">
              {/* Root / Propositus Node */}
              {tree.members.filter((m) => m.isPropositus).map((root) => (
                <div
                  key={root.id}
                  onClick={() => setSelectedMember(root)}
                  className="flex flex-col items-center cursor-pointer group transition-transform hover:scale-105"
                >
                  <div className="w-16 h-16 rounded-2xl bg-indigo-950 border-2 border-indigo-400 flex items-center justify-center shadow-xl relative">
                    <span className="text-lg font-bold text-white">{root.initials}</span>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 rounded-full border-2 border-slate-950 flex items-center justify-center" title="Deceased Owner">
                      <X className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="mt-2 text-center bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800 shadow-sm">
                    <p className="text-xs font-bold text-white">{tr(root.name)}</p>
                    <p className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">{tr("Deceased Propositus")}</p>
                  </div>
                </div>
              ))}

              {/* Heirs Level */}
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
                {tree.members.filter((m) => !m.isPropositus).map((member) => (
                  <div
                    key={member.id}
                    onClick={() => setSelectedMember(member)}
                    className="flex flex-col items-center cursor-pointer group transition-transform hover:scale-105"
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border-2 relative ${
                      member.gender === 'female' 
                        ? 'bg-purple-950/80 border-purple-400 text-purple-200' 
                        : 'bg-slate-900 border-indigo-500/50 text-indigo-200'
                    }`}>
                      <span className="text-base font-bold">{member.initials}</span>
                      <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-emerald-500 text-slate-950 font-bold text-[9px] rounded-md shadow-sm">
                        {trNum(member.estimatedSharePercent)}%
                      </div>
                    </div>
                    <div className="mt-2 text-center bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-800 shadow-sm">
                      <p className="text-xs font-bold text-white">{tr(member.name)}</p>
                      <p className="text-[10px] text-slate-400">{tr(member.relationship)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Member Details Drawer Modal */}
        {selectedMember && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-slate-100 space-y-4">
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold ${
                  selectedMember.gender === 'female' ? 'bg-purple-900/50 text-purple-300' : 'bg-indigo-900/50 text-indigo-300'
                }`}>
                  {selectedMember.initials}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{tr(selectedMember.name)}</h3>
                  <p className="text-xs text-indigo-300 font-semibold">{tr(selectedMember.relationship)} • {tr(selectedMember.heirClass || 'Class I Heir')}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">{tr("Statutory Share")}:</span>
                  <span className="text-emerald-400 font-bold">{trNum(selectedMember.estimatedSharePercent)}% {tr("of Ancestral Estate")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{tr("Coparcener Rights")}:</span>
                  <span className="text-indigo-300 font-medium">HSA 2005 Section 6 (Equal Birthright)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{tr("Status")}:</span>
                  <span className="text-slate-200 capitalize">{tr(selectedMember.status)}</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 italic">"{selectedMember.notes}"</p>

              <button
                onClick={() => setSelectedMember(null)}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              >
                {tr("Close Details")}
              </button>
            </div>
          </div>
        )}

        {/* Add Heir Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <form
              onSubmit={handleAddMember}
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-slate-100 space-y-4"
            >
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-base font-bold text-white">{tr("Add Legal Heir / Coparcener")}</h3>

              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1">{tr("Full Legal Name")}</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Kavita Sharma"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1">{tr("Relationship to Deceased")}</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="daughter">{tr("Daughter (Class I Coparcener)")}</option>
                  <option value="son">{tr("Son (Class I Coparcener)")}</option>
                  <option value="widow">{tr("Widow / Wife (Class I Heir)")}</option>
                  <option value="sister">{tr("Sister (Class II Heir)")}</option>
                  <option value="brother">{tr("Brother (Class II Heir)")}</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  {tr("Cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-slate-950"
                >
                  {tr("Add & Recalculate")}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Camera Document Scanner Modal with Family Tree Sync */}
        {showScannerModal && (
          <DocumentScannerModal
            isOpen={showScannerModal}
            onClose={() => setShowScannerModal(false)}
            settings={settings}
            onAddFamilyMembers={handleAddScannedMembers}
          />
        )}

      </div>
    </div>
  );
};
