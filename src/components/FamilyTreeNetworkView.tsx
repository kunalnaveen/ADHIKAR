import React, { useState } from 'react';
import { AppSettings, FamilyMember, FamilyTreeData, UserProfile } from '../types';
import { translations } from '../data/translations';
import { ShaderBackground } from './ShaderBackground';
import { Edit3, Plus, Lightbulb, Gavel, UserCheck, X, Check, Scale, Cloud, CloudCheck, Loader2 } from 'lucide-react';
import { saveFamilyTreeToFirestore } from '../lib/firebase';

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
  const t = translations[settings.language] || translations.EN;

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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

  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScenarioModal, setShowScenarioModal] = useState(false);

  // New member state
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'son' | 'daughter' | 'brother' | 'sister' | 'widow'>('daughter');

  // Scenario Simulator State
  const [scenarioIncludePre2005, setScenarioIncludePre2005] = useState(false);
  const [scenarioHasWill, setScenarioHasWill] = useState(false);

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
      notes: `${newRole.toUpperCase()} (Class I Heir)`,
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

  return (
    <div className="flex flex-col w-full relative min-h-[calc(100vh-4rem)] pb-28 text-white">
      {/* Background WebGL Shader */}
      <ShaderBackground opacity={0.4} />

      <div className="relative z-10 flex flex-col w-full h-full p-4 md:p-8 max-w-7xl mx-auto gap-4">
        {/* Header Area */}
        <div className="flex justify-between items-center bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-800 shadow-md">
          <div>
            <h2 className="text-lg font-bold text-white font-sans">{tree.title}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{tree.subtitle} • {tree.propositusName}</p>
          </div>
          <div className="flex items-center gap-2">
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
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              ) : saveSuccess ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Cloud className="w-4 h-4 text-indigo-400" />
              )}
              <span className="hidden sm:inline">
                {saveSuccess ? 'Saved to Cloud' : 'Save Tree'}
              </span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 hover:bg-indigo-600/20 transition-colors"
              title="Edit / Add Heir"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tree Container Canvas */}
        <div className="relative w-full min-h-[420px] bg-slate-950/80 rounded-2xl border border-slate-800 p-6 flex flex-col items-center justify-center overflow-hidden">
          {/* SVG Connecting Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
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
                  <p className="text-xs font-bold text-white">{root.name}</p>
                  <p className="text-[10px] text-indigo-400 font-mono">Propositus (Deceased)</p>
                </div>
              </div>
            ))}

            {/* Tier 1 Heirs */}
            <div className="flex justify-around w-full gap-2">
              {tree.members.filter((m) => !m.isPropositus).map((m) => (
                <div
                  key={m.id}
                  onClick={() => setSelectedMember(m)}
                  className="flex flex-col items-center cursor-pointer group transition-transform hover:scale-105"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border-2 border-emerald-400 flex items-center justify-center shadow-lg relative">
                    <span className="text-sm font-bold text-white">{m.initials}</span>
                    <div className="absolute inset-0 border-2 border-emerald-400 rounded-2xl animate-ping opacity-20 pointer-events-none" />
                  </div>
                  <div className="mt-2 text-center bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-800 shadow-sm">
                    <p className="text-xs font-bold text-white">{m.name}</p>
                    <p className="text-[10px] text-emerald-400 font-mono">{m.estimatedSharePercent}% Share</p>
                  </div>
                </div>
              ))}

              {/* Add Heir Button Node */}
              <div
                onClick={() => setShowAddModal(true)}
                className="flex flex-col items-center cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-400 group-hover:border-indigo-400 group-hover:text-indigo-400 bg-slate-900/50 transition-colors">
                  <Plus className="w-6 h-6" />
                </div>
                <p className="text-[10px] text-slate-500 mt-2 group-hover:text-indigo-400">Add Heir</p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Calculation Bar */}
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Gavel className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Hindu Succession Act (2005)</h3>
            </div>
            <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-xl uppercase">Active</span>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
            <div>
              <span className="text-xs text-slate-400">Identified Heirs</span>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">
                {tree.members.filter((m) => !m.isPropositus).length} <span className="text-xs font-normal text-slate-400">Class I</span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Estate Split</span>
              <p className="text-lg font-bold text-white mt-0.5">
                {tree.members.filter((m) => !m.isPropositus).length > 0
                  ? (100 / tree.members.filter((m) => !m.isPropositus).length).toFixed(1)
                  : 0}% <span className="text-xs font-normal text-slate-400">each</span>
              </p>
            </div>
          </div>
        </div>

        {/* Floating Scenario Simulator Button */}
        <button
          onClick={() => setShowScenarioModal(true)}
          className="self-end bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Lightbulb className="w-4 h-4 text-emerald-400" />
          <span>{t.whatHappensIf}</span>
        </button>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-slate-100">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">Add Heir to Lineage</h3>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Ramesh Sharma"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Relationship to Owner</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="daughter">Daughter (Class I Heir)</option>
                  <option value="son">Son (Class I Heir)</option>
                  <option value="widow">Widow (Class I Heir)</option>
                  <option value="sister">Sister (Class II Heir)</option>
                  <option value="brother">Brother (Class II Heir)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Add & Recalculate Shares</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* What Happens If Scenario Simulator Modal */}
      {showScenarioModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-slate-100">
            <button
              onClick={() => setShowScenarioModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Scale className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-white font-sans">Scenario Simulator</h3>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <label className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
                <span>Simulate Pre-2005 Law (No Daughter Coparcenary)</span>
                <input
                  type="checkbox"
                  checked={scenarioIncludePre2005}
                  onChange={(e) => setScenarioIncludePre2005(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
                <span>Simulate Registered Will in Favor of One Heir</span>
                <input
                  type="checkbox"
                  checked={scenarioHasWill}
                  onChange={(e) => setScenarioHasWill(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 rounded"
                />
              </label>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <p className="font-bold text-white">Simulated Legal Outcome:</p>
                {scenarioHasWill ? (
                  <p className="text-amber-400">
                    ⚠️ A Will overrides intestate succession for self-acquired property. However, daughters and coparceners retain valid claims on ancestral coparcenary shares!
                  </p>
                ) : scenarioIncludePre2005 ? (
                  <p className="text-amber-400">
                    📜 Pre-2005 law excluded married daughters from ancestral coparcenary. Under the 2005 Supreme Court ruling, daughters now enjoy full equal coparcenary rights!
                  </p>
                ) : (
                  <p className="text-emerald-400">
                    ✅ Current 2005 HSA Rule: Property is divided equally in 33.3% shares among all Class I heirs without gender distinction.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
