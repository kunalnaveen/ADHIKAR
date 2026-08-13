import React, { useState } from 'react';
import { LegacyTimelineEvent, AppSettings } from '../types';
import { 
  GitCommit, 
  Calendar, 
  UserCheck, 
  Building2, 
  FileCheck2, 
  ArrowDown, 
  Sparkles, 
  ChevronRight,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';

interface FamilyLegacyTimelineProps {
  settings: AppSettings;
}

export const FamilyLegacyTimeline: React.FC<FamilyLegacyTimelineProps> = ({ settings }) => {
  const [selectedGen, setSelectedGen] = useState<string>('All');

  const timelineEvents: LegacyTimelineEvent[] = [
    {
      id: 'evt-1',
      generation: 'Grandparents',
      year: '1962',
      title: 'Ancestral Agricultural Land Acquisition',
      ownerName: 'Shri Ram Prasad Sharma (Grandfather)',
      eventType: 'acquisition',
      assetSummary: '12 Acres Agricultural Land in Kurukshetra, Haryana',
      legalStatus: 'Registered Sale Deed Vol 42, Page 112',
      taxNote: 'Exempt from Capital Gains Tax under Sec 54B.'
    },
    {
      id: 'evt-2',
      generation: 'Grandparents',
      year: '1988',
      title: 'Oral Family Partition (Khangi Takseem)',
      ownerName: 'Ram Prasad & Coparceners',
      eventType: 'partition',
      assetSummary: 'Divided 12 Acres equally among 3 sons and 2 daughters',
      legalStatus: 'Unregistered Family Settlement Memo',
      taxNote: 'Stamp duty pending for formal mutation.'
    },
    {
      id: 'evt-3',
      generation: 'Parents',
      year: '2006',
      title: 'Revenue Mutation & HSA Amendment Parity',
      ownerName: 'Ramesh Sharma & Sisters',
      eventType: 'succession',
      assetSummary: '4 Acres mutated under Jamabandi 2006-07',
      legalStatus: 'Intiqal No. 1842 approved by Tehsildar',
      taxNote: 'Full coparcenary rights granted to sisters per HSA 2005.'
    },
    {
      id: 'evt-4',
      generation: 'Parents',
      year: '2019',
      title: 'Constructed Self-Acquired Residential Property',
      ownerName: 'Ramesh Sharma & Sunita Sharma (Joint)',
      eventType: 'acquisition',
      assetSummary: '3-BHK House in Gurgaon, Haryana (Est ₹2.5 Cr)',
      legalStatus: 'Conveyance Deed & HUDA Allotment Clear',
      taxNote: 'Joint ownership minimizes estate probate requirements.'
    },
    {
      id: 'evt-5',
      generation: 'Children',
      year: '2026 (Current)',
      title: 'Registered Will & ADHIKAR Vault Backup',
      ownerName: 'Current Propositus & Heirs',
      eventType: 'willed_transfer',
      assetSummary: 'Equal share division mapped for Son & Daughter',
      legalStatus: 'AES-256 Encrypted Will Draft in Vault',
      taxNote: 'Probate window pre-calculated under Indian Succession Act.'
    },
    {
      id: 'evt-6',
      generation: 'Future Generations',
      year: '2045 Projections',
      title: 'Automated Multi-Generational Succession',
      ownerName: 'Grandchildren & Descendants',
      eventType: 'projected_transfer',
      assetSummary: 'Trust & Partition Deed succession execution',
      legalStatus: 'Smart Contract / Blockchain Mutation Ready',
      taxNote: 'Zero dispute trajectory projected.'
    }
  ];

  const generations = ['All', 'Grandparents', 'Parents', 'Children', 'Future Generations'];

  const filteredEvents = selectedGen === 'All' 
    ? timelineEvents 
    : timelineEvents.filter((e) => e.generation === selectedGen);

  const getEventBadge = (type: LegacyTimelineEvent['eventType']) => {
    switch (type) {
      case 'acquisition': return { label: 'Land Acquisition', bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' };
      case 'partition': return { label: 'Family Partition', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      case 'succession': return { label: 'HSA Succession', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'willed_transfer': return { label: 'Registered Will', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
      default: return { label: 'Future Projection', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-indigo-400 bg-indigo-600/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-xl flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Multi-Generational Asset Flow
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Generational Lineage Graph</span>
          </div>
          <h2 className="text-2xl font-bold text-white font-sans">Family Legacy Timeline</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualize how property titles, partition deeds, and succession rights transition from grandparents down to future generations.
          </p>
        </div>

        {/* Generation Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
          {generations.map((gen) => (
            <button
              key={gen}
              onClick={() => setSelectedGen(gen)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedGen === gen
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {gen}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Vertical Timeline */}
      <div className="relative pl-6 border-l-2 border-slate-800 space-y-8 my-4">
        {filteredEvents.map((evt) => {
          const badge = getEventBadge(evt.eventType);

          return (
            <div key={evt.id} className="relative group">
              
              {/* Timeline Node Icon */}
              <div className="absolute -left-[31px] top-1.5 w-6 h-6 rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-lg">
                <GitCommit className="w-3.5 h-3.5" />
              </div>

              {/* Event Card */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/40 transition-all space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-indigo-400 bg-indigo-600/10 px-2.5 py-0.5 rounded-lg border border-indigo-500/20">
                      {evt.year}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">({evt.generation})</span>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg} self-start sm:self-auto`}>
                    {badge.label}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white mb-1">{evt.title}</h3>
                  <p className="text-xs text-slate-300 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Title Holder: <strong className="text-white">{evt.ownerName}</strong></span>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Asset Details</span>
                    <span className="text-slate-200">{evt.assetSummary}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Legal & Revenue Record Status</span>
                    <span className="text-emerald-400 font-mono text-[11px]">{evt.legalStatus}</span>
                  </div>
                </div>

                {evt.taxNote && (
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 bg-slate-900/50 p-2 rounded-lg border border-slate-800/80">
                    <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>{evt.taxNote}</span>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
