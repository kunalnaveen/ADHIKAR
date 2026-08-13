import React, { useState } from 'react';
import { FamilyTreeData, FamilyMember, AppSettings, SimulatorEvent } from '../types';
import { 
  Plus, 
  Minus, 
  Users, 
  Building2, 
  Heart, 
  UserMinus, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  RotateCcw,
  Scale,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface InheritanceSimulatorProps {
  tree: FamilyTreeData;
  settings: AppSettings;
}

export const InheritanceSimulator: React.FC<InheritanceSimulatorProps> = ({ tree, settings }) => {
  // Base initial members from tree
  const [baseMembers, setBaseMembers] = useState<FamilyMember[]>(() => [...tree.members]);
  const [simulatedEvents, setSimulatedEvents] = useState<SimulatorEvent[]>([]);
  const [estateValueINR, setEstateValueINR] = useState<number>(10000000); // 1 Crore default

  // Compute baseline shares
  const calculateBaselineShares = (members: FamilyMember[]): Record<string, number> => {
    const aliveHeirs = members.filter((m) => m.status === 'alive');
    if (aliveHeirs.length === 0) return {};
    const equalShare = 100 / aliveHeirs.length;
    const result: Record<string, number> = {};
    aliveHeirs.forEach((m) => {
      result[m.id] = Number(equalShare.toFixed(2));
    });
    return result;
  };

  // State of simulated modified members
  const [simulatedMembers, setSimulatedMembers] = useState<FamilyMember[]>(() => [...tree.members]);

  const baselineShares = calculateBaselineShares(baseMembers);

  // Recalculate simulated shares under HSA 2005 Class I rules
  const calculateSimulatedShares = (members: FamilyMember[]): Record<string, number> => {
    const aliveMembers = members.filter((m) => m.status === 'alive');
    if (aliveMembers.length === 0) return {};

    // Filter Class I statutory heirs (widow, son, daughter, mother)
    const classI = aliveMembers.filter((m) => 
      ['widow', 'son', 'daughter', 'mother'].includes(m.relationship)
    );

    const activeList = classI.length > 0 ? classI : aliveMembers;
    const equalShare = 100 / activeList.length;

    const result: Record<string, number> = {};
    activeList.forEach((m) => {
      result[m.id] = Number(equalShare.toFixed(2));
    });

    return result;
  };

  const simulatedShares = calculateSimulatedShares(simulatedMembers);

  // Simulation Handlers
  const handleAddChild = () => {
    const newId = `sim-child-${Date.now()}`;
    const newMember: FamilyMember = {
      id: newId,
      name: `New Child (${simulatedMembers.filter((m) => m.relationship === 'daughter' || m.relationship === 'son').length + 1})`,
      relationship: 'daughter',
      status: 'alive',
      heirClass: 'Class I',
      gender: 'female',
      estimatedSharePercent: 0,
      initials: 'NC'
    };

    setSimulatedMembers((prev) => [...prev, newMember]);
    setSimulatedEvents((prev) => [
      ...prev,
      {
        id: `ev-${Date.now()}`,
        type: 'add_child',
        title: 'Child Born / Added',
        details: 'Added a new Class I Coparcener (Daughter) under HSA 2005.',
        impactNote: 'Shares of existing heirs decrease proportionally.'
      }
    ]);
  };

  const handleRemarriage = () => {
    const newId = `sim-spouse-${Date.now()}`;
    const newSpouse: FamilyMember = {
      id: newId,
      name: 'Second Wife / Spouse',
      relationship: 'widow',
      status: 'alive',
      heirClass: 'Class I',
      gender: 'female',
      estimatedSharePercent: 0,
      initials: 'SW'
    };

    setSimulatedMembers((prev) => [...prev, newSpouse]);
    setSimulatedEvents((prev) => [
      ...prev,
      {
        id: `ev-${Date.now()}`,
        type: 'remarriage',
        title: 'Remarriage / Second Spouse',
        details: 'Added second legal spouse as Class I statutory heir.',
        impactNote: 'Second wife receives an equal statutory share alongside existing children.'
      }
    ]);
  };

  const handleAdoption = () => {
    const newId = `sim-adopted-${Date.now()}`;
    const adoptedChild: FamilyMember = {
      id: newId,
      name: 'Adopted Child (HAMA)',
      relationship: 'son',
      status: 'alive',
      heirClass: 'Class I',
      gender: 'male',
      estimatedSharePercent: 0,
      initials: 'AC'
    };

    setSimulatedMembers((prev) => [...prev, adoptedChild]);
    setSimulatedEvents((prev) => [
      ...prev,
      {
        id: `ev-${Date.now()}`,
        type: 'adoption',
        title: 'Legal Adoption (HAMA 1956)',
        details: 'Registered adoption deed creates equal coparcenary rights.',
        impactNote: 'Adopted child severed from biological family and granted full Class I status.'
      }
    ]);
  };

  const handlePropertySaleOrAdd = (deltaPercent: number, label: string) => {
    setEstateValueINR((prev) => Math.max(1000000, prev + (prev * deltaPercent) / 100));
    setSimulatedEvents((prev) => [
      ...prev,
      {
        id: `ev-${Date.now()}`,
        type: deltaPercent > 0 ? 'property_add' : 'property_sale',
        title: label,
        details: `Estate value adjusted by ${deltaPercent > 0 ? '+' : ''}${deltaPercent}%.`,
        impactNote: 'Total monetary inheritance shifts dynamically.'
      }
    ]);
  };

  const handleRemoveMember = (id: string) => {
    const target = simulatedMembers.find((m) => m.id === id);
    if (!target) return;

    setSimulatedMembers((prev) => prev.filter((m) => m.id !== id));
    setSimulatedEvents((prev) => [
      ...prev,
      {
        id: `ev-${Date.now()}`,
        type: 'remove_heir',
        title: `Heir Excluded / Deceased (${target.name})`,
        details: `Removed ${target.name} from active inheritance calculation.`,
        impactNote: `Excluded share redistributes among remaining Class I legal heirs.`
      }
    ]);
  };

  const handleResetSimulator = () => {
    setSimulatedMembers([...tree.members]);
    setSimulatedEvents([]);
    setEstateValueINR(10000000);
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-indigo-400 bg-indigo-600/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-xl flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Interactive HSA 2005 Simulator
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Real-Time Share Recalculator</span>
          </div>
          <h2 className="text-2xl font-bold text-white font-sans">"What Happens If?" Inheritance Simulator</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Test life scenarios—births, marriages, adoptions, property sales—and instantly visualize before vs after share deltas.
          </p>
        </div>

        <button
          onClick={handleResetSimulator}
          className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-bold flex items-center gap-1.5 shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Scenario</span>
        </button>
      </div>

      {/* Simulator Control Action Buttons */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Scale className="w-4 h-4 text-emerald-400" />
          <span>Simulate Life & Family Conditions</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2">
          <button
            onClick={handleAddChild}
            className="p-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center gap-1.5 justify-center transition-all"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Add Child / Birth</span>
          </button>

          <button
            onClick={handleRemarriage}
            className="p-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center gap-1.5 justify-center transition-all"
          >
            <Heart className="w-4 h-4 text-indigo-400" />
            <span>Remarriage</span>
          </button>

          <button
            onClick={handleAdoption}
            className="p-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center gap-1.5 justify-center transition-all"
          >
            <Users className="w-4 h-4 text-amber-400" />
            <span>Legal Adoption</span>
          </button>

          <button
            onClick={() => handlePropertySaleOrAdd(25, 'Property Purchased (+25%)')}
            className="p-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 justify-center transition-all"
          >
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Buy Estate (+25%)</span>
          </button>

          <button
            onClick={() => handlePropertySaleOrAdd(-20, 'Property Sold (-20%)')}
            className="p-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1.5 justify-center transition-all"
          >
            <UserMinus className="w-4 h-4 text-rose-400" />
            <span>Sell Estate (-20%)</span>
          </button>
        </div>
      </div>

      {/* Before vs After Share Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Baseline Shares Card */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Original Family Tree</span>
              <h3 className="text-base font-bold text-white">Before Simulation Shares</h3>
            </div>
            <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800">
              ₹{(estateValueINR / 10000000).toFixed(1)} Cr Estate
            </span>
          </div>

          <div className="space-y-3">
            {baseMembers.map((m) => {
              const sharePct = baselineShares[m.id] || 0;
              const valINR = (estateValueINR * sharePct) / 100;

              return (
                <div key={m.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">{m.name} ({m.relationship})</span>
                    <span className="font-mono text-indigo-400 font-bold">{sharePct}%</span>
                  </div>

                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${sharePct}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>Statutory Class I</span>
                    <span>₹{valINR.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Simulated Shares Card */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" /> Recalculated Share Distribution
              </span>
              <h3 className="text-base font-bold text-white">After Scenario Simulation</h3>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20 font-bold">
              {simulatedMembers.length} Total Heirs
            </span>
          </div>

          <div className="space-y-3">
            {simulatedMembers.map((m) => {
              const simPct = simulatedShares[m.id] || 0;
              const basePct = baselineShares[m.id] || 0;
              const diffPct = Number((simPct - basePct).toFixed(2));
              const valINR = (estateValueINR * simPct) / 100;

              return (
                <div key={m.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 relative group">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{m.name}</span>
                      <span className="text-[10px] text-slate-500">({m.relationship})</span>
                    </div>

                    <div className="flex items-center gap-2 font-mono">
                      {diffPct !== 0 && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          diffPct > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {diffPct > 0 ? `+${diffPct}%` : `${diffPct}%`}
                        </span>
                      )}
                      <span className="text-emerald-400 font-bold text-xs">{simPct}%</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${simPct}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
                    <span>Est Share: ₹{valINR.toLocaleString('en-IN')}</span>

                    {/* Quick remove button */}
                    <button
                      onClick={() => handleRemoveMember(m.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors text-[10px] font-bold"
                      title="Exclude from scenario"
                    >
                      [Exclude]
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Applied Simulation Events Log */}
      {simulatedEvents.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Simulation Event History Log</h4>
          <div className="space-y-1.5">
            {simulatedEvents.map((ev) => (
              <div key={ev.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-white block">{ev.title}: {ev.details}</span>
                  <span className="text-[11px] text-slate-400">{ev.impactNote}</span>
                </div>
                <span className="text-[10px] text-indigo-400 font-mono bg-indigo-600/10 px-2 py-0.5 rounded border border-indigo-500/20 shrink-0">
                  HSA Recalculated
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
