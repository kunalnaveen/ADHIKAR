import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Building2, 
  Phone, 
  Clock, 
  ExternalLink, 
  Compass, 
  Sparkles, 
  Globe, 
  ShieldCheck, 
  ArrowUpRight, 
  RefreshCw, 
  CheckCircle2,
  FileCheck2,
  Landmark,
  Scale
} from 'lucide-react';
import { 
  detectUserLocationAndOffices, 
  GeoLocationResult, 
  getOfficesForCity, 
  STATE_PORTALS, 
  GovOffice 
} from '../utils/geolocationServices';
import { AppSettings } from '../types';
import { t as translateText } from '../utils/translate';

interface GeoOfficeSuggesterProps {
  settings: AppSettings;
  onSelectState?: (state: string) => void;
}

export const GeoOfficeSuggester: React.FC<GeoOfficeSuggesterProps> = ({ settings, onSelectState }) => {
  const tr = (str: string) => translateText(str, settings.language);

  const [loading, setLoading] = useState<boolean>(true);
  const [geoResult, setGeoResult] = useState<GeoLocationResult | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('Bengaluru');
  const [selectedState, setSelectedState] = useState<string>('Karnataka');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const availableCities = [
    { city: 'Bengaluru', state: 'Karnataka' },
    { city: 'Mumbai', state: 'Maharashtra' },
    { city: 'Pune', state: 'Maharashtra' },
    { city: 'Delhi', state: 'Delhi' },
    { city: 'Chennai', state: 'Tamil Nadu' },
    { city: 'Hyderabad', state: 'Telangana' },
    { city: 'Lucknow', state: 'Uttar Pradesh' },
    { city: 'Kolkata', state: 'West Bengal' },
    { city: 'Ahmedabad', state: 'Gujarat' },
    { city: 'Jaipur', state: 'Rajasthan' },
    { city: 'Patna', state: 'Bihar' },
    { city: 'Varanasi', state: 'Uttar Pradesh' },
    { city: 'Chandigarh', state: 'Punjab' },
    { city: 'Kochi', state: 'Kerala' },
    { city: 'Bhubaneswar', state: 'Odisha' },
    { city: 'Guwahati', state: 'Assam' }
  ];

  const handleDetectLocation = async () => {
    setLoading(true);
    try {
      const res = await detectUserLocationAndOffices();
      setGeoResult(res);
      setSelectedCity(res.city);
      setSelectedState(res.state);
      onSelectState?.(res.state);
    } catch (err) {
      console.error('Geo detection error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleDetectLocation();
  }, []);

  const handleCityChange = (newCity: string) => {
    const matched = availableCities.find((c) => c.city === newCity);
    if (matched) {
      setSelectedCity(matched.city);
      setSelectedState(matched.state);
      onSelectState?.(matched.state);

      const offices = getOfficesForCity(matched.city, matched.state);
      const portal = STATE_PORTALS[matched.state] || STATE_PORTALS['Karnataka'];
      setGeoResult({
        latitude: 0,
        longitude: 0,
        city: matched.city,
        state: matched.state,
        detectedNearbyOffices: offices,
        statePortal: portal
      });
    }
  };

  const officesToDisplay = geoResult?.detectedNearbyOffices.filter((o) => {
    if (activeCategory === 'all') return true;
    return o.category.toLowerCase().includes(activeCategory.toLowerCase());
  }) || [];

  const currentPortal = geoResult?.statePortal || STATE_PORTALS[selectedState] || STATE_PORTALS['Karnataka'];

  return (
    <div className="bg-slate-900 border-2 border-indigo-500/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 relative overflow-hidden">
      
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with GPS Auto-detection Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>{tr("GPS Geolocation Automated Jurisdiction")}</span>
          </div>

          <h3 className="text-xl md:text-2xl font-bold font-serif text-white flex items-center gap-2">
            <span>{tr("State-Specific Revenue Offices & Procedure Links")}</span>
          </h3>
          <p className="text-xs text-slate-400 max-w-xl">
            {tr("Automatically suggests verified Sub-Registrar Offices (SRO), Tehsildar courts, and official land record portals for your city.")}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* City Selector */}
          <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2.5 rounded-2xl border border-slate-800 shadow-sm">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <select
              value={selectedCity}
              onChange={(e) => handleCityChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
            >
              {availableCities.map((c) => (
                <option key={c.city} value={c.city} className="bg-slate-900 text-white">
                  {c.city} ({c.state})
                </option>
              ))}
            </select>
          </div>

          {/* Detect Location Button */}
          <button
            onClick={handleDetectLocation}
            disabled={loading}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
            title="Refresh GPS Coordinates"
          >
            <Navigation className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? tr("Detecting GPS...") : tr("Detect My Location")}</span>
          </button>
        </div>
      </div>

      {/* State Official E-Governance Portal Banner */}
      {currentPortal && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950/50 to-slate-950 border border-indigo-500/40 relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                Official {currentPortal.state} Land Record & Mutation Gateway
              </span>
            </div>
            <h4 className="text-base font-bold text-white font-serif">
              {currentPortal.portalName}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              {currentPortal.portalDescription}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-300">
              <span className="font-semibold text-emerald-400">
                • Standard Extract: {currentPortal.landRecordName}
              </span>
              <span className="font-semibold text-amber-300">
                • Fees: {currentPortal.mutationFee}
              </span>
            </div>
            <p className="text-[11px] text-purple-300 font-medium pt-0.5">
              ⚖️ {currentPortal.femaleConcession}
            </p>
          </div>

          <a
            href={currentPortal.portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all shrink-0"
          >
            <span>Open {currentPortal.state} Portal</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      )}

      {/* Office Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 relative z-10">
        {[
          { id: 'all', label: 'All Offices' },
          { id: 'SRO', label: 'Sub-Registrar (SRO)' },
          { id: 'Tehsildar', label: 'Tehsildar & Taluk Court' },
          { id: 'DLSA', label: 'Free Legal Aid (DLSA)' },
          { id: 'LandRegistry', label: 'Land Record Branches' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeCategory === tab.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Recommended Offices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        {officesToDisplay.map((office) => (
          <div
            key={office.id}
            className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-indigo-500/40 shadow-md transition-all flex flex-col justify-between space-y-3 group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  office.category === 'SRO'
                    ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                    : office.category === 'Tehsildar'
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                    : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                }`}>
                  {office.category === 'SRO' ? 'Sub-Registrar Office' : office.category === 'Tehsildar' ? 'Taluk Tehsildar Court' : 'Legal Services Authority'}
                </span>

                <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <Navigation className="w-3 h-3" />
                  ~{office.distanceKm} km away
                </span>
              </div>

              <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                {office.name}
              </h4>

              <p className="text-xs text-slate-400 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span>{office.address}</span>
              </p>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="truncate">{office.timings}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{office.phone}</span>
                </div>
              </div>

              {/* Key Services Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {office.services.map((srv, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium bg-slate-900 text-slate-300 px-2 py-0.5 rounded-md border border-slate-800"
                  >
                    • {srv}
                  </span>
                ))}
              </div>
            </div>

            {/* Directions & Maps Trigger */}
            <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 uppercase font-mono">
                Verified Govt Landmark
              </span>

              <a
                href={office.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-300 hover:text-white font-bold text-xs flex items-center gap-1.5 border border-slate-800 transition-colors"
              >
                <span>Get Directions</span>
                <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
              </a>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
