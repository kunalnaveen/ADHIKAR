import React, { useState } from 'react';
import { 
  Building2, 
  PieChart as PieChartIcon, 
  GitCommit, 
  MapPin, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  Plus, 
  ChevronRight, 
  Info,
  ShieldCheck,
  Edit2,
  Trash2,
  Award
} from 'lucide-react';

export interface PropertyAsset {
  id: string;
  name: string;
  location: string;
  type: 'Residential' | 'Agricultural' | 'Commercial' | 'Plot';
  estimatedValue: string; // e.g. "₹1.5 Crore"
  numericValue: number; // in Rupees
  status: 'Clear Title' | 'Joint Mutated' | 'Pending Partition' | 'Encumbered';
  owners: Array<{
    name: string;
    relation: string;
    percentage: number;
    color: string;
  }>;
}

const DEFAULT_ASSETS: PropertyAsset[] = [
  {
    id: 'prop-1',
    name: 'Ancestral Residence - Green Park',
    location: 'Sector 14, Gurugram, Haryana',
    type: 'Residential',
    estimatedValue: '₹1.80 Crore',
    numericValue: 18000000,
    status: 'Clear Title',
    owners: [
      { name: 'Father (Late Rajesh)', relation: 'Deceased Original Owner', percentage: 50, color: '#6366f1' }, // Indigo
      { name: 'Mother (Sunita Devi)', relation: 'Class I Statutory Heir', percentage: 25, color: '#10b981' }, // Emerald
      { name: 'Daughter (Ananya)', relation: 'Coparcener Heir', percentage: 25, color: '#f59e0b' }, // Amber
    ]
  },
  {
    id: 'prop-2',
    name: '4 Acres Agricultural Farmland',
    location: 'Tehsil Ludhiana, Punjab',
    type: 'Agricultural',
    estimatedValue: '₹2.40 Crore',
    numericValue: 24000000,
    status: 'Pending Partition',
    owners: [
      { name: 'Mother (Sunita Devi)', relation: 'Class I Heir', percentage: 25, color: '#10b981' },
      { name: 'Son (Rohan)', relation: 'Class I Heir', percentage: 25, color: '#3b82f6' },
      { name: 'Daughter 1 (Ananya)', relation: 'Equal Coparcener (HSA)', percentage: 25, color: '#f59e0b' },
      { name: 'Daughter 2 (Priya)', relation: 'Equal Coparcener (HSA)', percentage: 25, color: '#ec4899' },
    ]
  },
  {
    id: 'prop-3',
    name: 'Commercial Shop Unit #12',
    location: 'Jaipur Market, Rajasthan',
    type: 'Commercial',
    estimatedValue: '₹95 Lakh',
    numericValue: 9500000,
    status: 'Joint Mutated',
    owners: [
      { name: 'Father (Late Rajesh)', relation: 'Original Title Holder', percentage: 60, color: '#6366f1' },
      { name: 'Mother (Sunita Devi)', relation: 'Co-applicant', percentage: 40, color: '#10b981' },
    ]
  }
];

export const PropertyOwnershipMap: React.FC = () => {
  const [assets, setAssets] = useState<PropertyAsset[]>(DEFAULT_ASSETS);
  const [selectedAssetId, setSelectedAssetId] = useState<string>(DEFAULT_ASSETS[0].id);
  const [viewMode, setViewMode] = useState<'pie' | 'tree' | 'cards'>('pie');
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);

  // Modal to add new property
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [newPropName, setNewPropName] = useState('');
  const [newPropLocation, setNewPropLocation] = useState('');
  const [newPropType, setNewPropType] = useState<'Residential' | 'Agricultural' | 'Commercial' | 'Plot'>('Residential');
  const [newPropVal, setNewPropVal] = useState('₹50 Lakh');

  const selectedAsset = assets.find((a) => a.id === selectedAssetId) || assets[0];

  // Calculate SVG Pie Slice Path
  const getPieSlices = (owners: PropertyAsset['owners']) => {
    let cumulativePercent = 0;
    const radius = 80;
    const cx = 100;
    const cy = 100;

    return owners.map((owner, idx) => {
      const startPercent = cumulativePercent;
      cumulativePercent += owner.percentage;
      const endPercent = cumulativePercent;

      const startAngle = (startPercent / 100) * 360 - 90;
      const endAngle = (endPercent / 100) * 360 - 90;

      const x1 = cx + radius * Math.cos((Math.PI * startAngle) / 180);
      const y1 = cy + radius * Math.sin((Math.PI * startAngle) / 180);

      const x2 = cx + radius * Math.cos((Math.PI * endAngle) / 180);
      const y2 = cy + radius * Math.sin((Math.PI * endAngle) / 180);

      const largeArcFlag = owner.percentage > 50 ? 1 : 0;

      // Path data for pie slice
      const pathData = [
        `M ${cx} ${cy}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z',
      ].join(' ');

      // Value in Rupees for this share
      const shareValRupees = (selectedAsset.numericValue * (owner.percentage / 100));
      const formattedShareVal = shareValRupees >= 10000000 
        ? `₹${(shareValRupees / 10000000).toFixed(2)} Cr`
        : `₹${(shareValRupees / 100000).toFixed(1)} L`;

      return {
        idx,
        owner,
        pathData,
        formattedShareVal,
      };
    });
  };

  const slices = getPieSlices(selectedAsset.owners);

  const handleAddProperty = () => {
    if (!newPropName.trim()) return;
    const newAsset: PropertyAsset = {
      id: `prop-${Date.now()}`,
      name: newPropName,
      location: newPropLocation || 'Local District',
      type: newPropType,
      estimatedValue: newPropVal || '₹75 Lakh',
      numericValue: 7500000,
      status: 'Clear Title',
      owners: [
        { name: 'Father 50%', relation: 'Primary Co-owner', percentage: 50, color: '#6366f1' },
        { name: 'Mother 25%', relation: 'Class I Heir', percentage: 25, color: '#10b981' },
        { name: 'Daughter 25%', relation: 'Coparcener', percentage: 25, color: '#f59e0b' },
      ]
    };

    setAssets([...assets, newAsset]);
    setSelectedAssetId(newAsset.id);
    setIsAddingProperty(false);
    setNewPropName('');
    setNewPropLocation('');
  };

  return (
    <div className="w-full p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wider">
                HSA 2005 Asset Map
              </span>
            </div>
            <h2 className="text-xl font-bold font-sans text-white mt-0.5">Property Ownership Map</h2>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setViewMode('pie')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'pie'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PieChartIcon className="w-3.5 h-3.5" />
            <span>Pie Chart</span>
          </button>

          <button
            onClick={() => setViewMode('tree')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'tree'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tree Graph</span>
          </button>

          <button
            onClick={() => setIsAddingProperty(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Property</span>
          </button>
        </div>
      </div>

      {/* Asset Switcher Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {assets.map((asset) => (
          <button
            key={asset.id}
            onClick={() => setSelectedAssetId(asset.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 border ${
              asset.id === selectedAssetId
                ? 'bg-indigo-600/20 text-indigo-200 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            <Building2 className={`w-3.5 h-3.5 ${asset.id === selectedAssetId ? 'text-indigo-400' : 'text-slate-500'}`} />
            <span>{asset.name}</span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              {asset.estimatedValue}
            </span>
          </button>
        ))}
      </div>

      {/* Selected Property Details & Interactive Chart Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
        
        {/* Left Side: Property Overview Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                {selectedAsset.type}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                {selectedAsset.status}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white font-serif">{selectedAsset.name}</h3>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-0.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>{selectedAsset.location}</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
            <span className="text-xs text-slate-400 font-medium">Estimated Valuation:</span>
            <span className="text-lg font-extrabold text-emerald-400 font-mono">{selectedAsset.estimatedValue}</span>
          </div>

          {/* Owners Percentage List */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Inheritance Share Allocation</span>
            </h4>

            <div className="space-y-2">
              {selectedAsset.owners.map((owner, idx) => {
                const shareValRupees = (selectedAsset.numericValue * (owner.percentage / 100));
                const formattedVal = shareValRupees >= 10000000 
                  ? `₹${(shareValRupees / 10000000).toFixed(2)} Cr`
                  : `₹${(shareValRupees / 100000).toFixed(1)} Lakh`;

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredSlice(idx)}
                    onMouseLeave={() => setHoveredSlice(null)}
                    className={`p-3 rounded-xl bg-slate-900 border transition-all flex items-center justify-between gap-3 ${
                      hoveredSlice === idx
                        ? 'border-indigo-500 scale-[1.02] shadow-lg'
                        : 'border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: owner.color }}
                      />
                      <div>
                        <h5 className="text-xs font-bold text-white">{owner.name}</h5>
                        <p className="text-[10px] text-slate-400">{owner.relation}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold font-mono text-white block">{owner.percentage}%</span>
                      <span className="text-[10px] font-mono text-emerald-400">{formattedVal}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Visualization Canvas */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-4 min-h-[320px]">
          
          {viewMode === 'pie' ? (
            <div className="relative flex flex-col items-center justify-center space-y-4">
              
              {/* SVG Pie Chart */}
              <div className="relative w-64 h-64 md:w-72 md:h-72">
                <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90 drop-shadow-2xl">
                  {slices.map(({ idx, owner, pathData }) => (
                    <path
                      key={idx}
                      d={pathData}
                      fill={owner.color}
                      stroke="#020617"
                      strokeWidth="2.5"
                      className={`cursor-pointer transition-all duration-300 ${
                        hoveredSlice === idx ? 'opacity-100 scale-105' : 'opacity-90 hover:opacity-100'
                      }`}
                      onMouseEnter={() => setHoveredSlice(idx)}
                      onMouseLeave={() => setHoveredSlice(null)}
                    />
                  ))}
                  {/* Inner Cutout Hole for Donut Aesthetic */}
                  <circle cx="100" cy="100" r="48" fill="#020617" />
                </svg>

                {/* Center Badge in Donut Hole */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Property</span>
                  <span className="text-sm font-extrabold text-white leading-tight font-serif">100%</span>
                  <span className="text-[9px] font-mono text-emerald-400 mt-0.5">Allocated</span>
                </div>
              </div>

              {/* Slice Hover Tooltip Banner */}
              {hoveredSlice !== null ? (
                <div className="p-3 rounded-xl bg-slate-900 border border-indigo-500/40 text-center space-y-0.5 animate-fadeIn shadow-xl">
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-white">
                    <span 
                      className="w-2.5 h-2.5 rounded-full inline-block" 
                      style={{ backgroundColor: selectedAsset.owners[hoveredSlice].color }} 
                    />
                    <span>{selectedAsset.owners[hoveredSlice].name}</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-bold block">
                    {selectedAsset.owners[hoveredSlice].percentage}% Share ({slices[hoveredSlice]?.formattedShareVal})
                  </span>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 font-mono italic">
                  Hover over slices or legend items to inspect financial valuation breakdown
                </p>
              )}

            </div>
          ) : (
            /* Tree Ownership Graph Layout */
            <div className="w-full space-y-4">
              <div className="text-center space-y-1 mb-4">
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 uppercase tracking-widest">
                  Hierarchy Graph
                </span>
                <h4 className="text-base font-bold text-white font-serif">{selectedAsset.name}</h4>
              </div>

              {/* Tree Diagram Visual */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 font-mono">
                {/* Root Node */}
                <div className="flex items-center justify-center">
                  <div className="px-5 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-2 shadow-xl border border-indigo-400/40">
                    <Building2 className="w-4 h-4 text-emerald-300" />
                    <span>{selectedAsset.name} (100%)</span>
                  </div>
                </div>

                <div className="w-0.5 h-6 bg-slate-700 mx-auto" />

                {/* Branch Connections */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {selectedAsset.owners.map((owner, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{owner.name}</span>
                        <span className="text-xs font-bold text-emerald-400">{owner.percentage}%</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">{owner.relation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Add Property Modal */}
      {isAddingProperty && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4 animate-scaleUp">
            <h3 className="text-lg font-bold text-white font-serif">Add Real Estate Property</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Property Name / Title</label>
                <input
                  type="text"
                  value={newPropName}
                  onChange={(e) => setNewPropName(e.target.value)}
                  placeholder="e.g. Ancestral House - Ludhiana"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Location / District</label>
                <input
                  type="text"
                  value={newPropLocation}
                  onChange={(e) => setNewPropLocation(e.target.value)}
                  placeholder="e.g. Sector 18, Noida"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Type</label>
                  <select
                    value={newPropType}
                    onChange={(e) => setNewPropType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-indigo-300 focus:outline-none"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Agricultural">Agricultural</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Plot">Plot / Land</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Estimated Value</label>
                  <input
                    type="text"
                    value={newPropVal}
                    onChange={(e) => setNewPropVal(e.target.value)}
                    placeholder="e.g. ₹1.2 Crore"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsAddingProperty(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProperty}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 shadow-lg shadow-indigo-500/20"
              >
                Save Asset
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
