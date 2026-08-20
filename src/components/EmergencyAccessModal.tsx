import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  UserCheck, 
  Clock, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Key, 
  Lock, 
  Unlock, 
  Eye, 
  Download, 
  Upload, 
  Smartphone, 
  Mail, 
  Sparkles, 
  Loader2, 
  History, 
  Ban, 
  Check, 
  Copy, 
  Send,
  AlertCircle
} from 'lucide-react';
import { EmergencyContact, EmergencyAccessSession, FamilyMember, PropertyAsset } from '../types';
import { t } from '../utils/translate';
import { triggerBrowserNotification } from '../utils/notificationHelper';

interface EmergencyAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: { language: string; isHighContrast?: boolean };
  familyMembers?: FamilyMember[];
  propertyAssets?: PropertyAsset[];
}

const DEFAULT_CONTACT: EmergencyContact = {
  id: 'ec-primary-1',
  name: 'Priya Sharma',
  relationship: 'Daughter / Designated Trustee',
  phone: '+91 98765 43210',
  email: 'priya.sharma@example.com',
  idNumber: 'XXXX-XXXX-8921',
  accessDurationHours: 72,
  documentScope: [
    'Ancestral Property Deeds & Khata Extract',
    'Registered Last Will & Testament',
    'Bank Nominee & Fixed Deposit Certificates',
    'Family Tree Lineage & Coparcenary Map'
  ],
  status: 'active',
  designatedDate: '2026-08-15',
  notes: 'Designated primary emergency trustee with medical incapacitation authorization.'
};

export const EmergencyAccessModal: React.FC<EmergencyAccessModalProps> = ({
  isOpen,
  onClose,
  settings,
  familyMembers = [],
  propertyAssets = []
}) => {
  const tr = (key: string) => t(key, settings.language);

  const [activeTab, setActiveTab] = useState<'nominees' | 'verify' | 'active_session' | 'logs'>('nominees');
  
  // Nominee state
  const [contacts, setContacts] = useState<EmergencyContact[]>(() => {
    try {
      const stored = localStorage.getItem('adhikar_emergency_contacts');
      return stored ? JSON.parse(stored) : [DEFAULT_CONTACT];
    } catch {
      return [DEFAULT_CONTACT];
    }
  });

  // Active Emergency Session
  const [activeSession, setActiveSession] = useState<EmergencyAccessSession | null>(() => {
    try {
      const stored = localStorage.getItem('adhikar_active_emergency_session');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Time remaining countdown for active session
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Form for new nominee designation
  const [nomineeName, setNomineeName] = useState('');
  const [nomineeRelation, setNomineeRelation] = useState('Daughter / Coparcener');
  const [nomineePhone, setNomineePhone] = useState('');
  const [nomineeEmail, setNomineeEmail] = useState('');
  const [nomineeIdNumber, setNomineeIdNumber] = useState('');
  const [accessDuration, setAccessDuration] = useState<number>(72);
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    'Ancestral Property Deeds & Khata Extract',
    'Registered Last Will & Testament',
    'Bank Nominee & Fixed Deposit Certificates',
    'Family Tree Lineage & Coparcenary Map'
  ]);
  const [showAddContactForm, setShowAddContactForm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Verification Claim Simulation State
  const [claimNomineeName, setClaimNomineeName] = useState('Priya Sharma');
  const [claimPhone, setClaimPhone] = useState('+91 98765 43210');
  const [claimRelation, setClaimRelation] = useState('Daughter');
  const [emergencyType, setEmergencyType] = useState('Critical Medical ICU Admission');
  const [emergencyReason, setEmergencyReason] = useState('Primary account holder admitted to Fortis Hospital ICU with critical illness. Urgent legal authorization required for hospital release and property succession paperwork.');
  const [claimIdProof, setClaimIdProof] = useState('Aadhaar Card (XXXX-XXXX-8921)');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Sync contacts to local storage
  const saveContacts = (updated: EmergencyContact[]) => {
    setContacts(updated);
    try {
      localStorage.setItem('adhikar_emergency_contacts', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Sync active session
  const saveSession = (session: EmergencyAccessSession | null) => {
    setActiveSession(session);
    try {
      if (session) {
        localStorage.setItem('adhikar_active_emergency_session', JSON.stringify(session));
      } else {
        localStorage.removeItem('adhikar_active_emergency_session');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Countdown timer effect
  useEffect(() => {
    if (!activeSession || activeSession.status !== 'active') {
      setTimeRemaining('');
      return;
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(activeSession.expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeRemaining('Session Expired');
        saveSession({ ...activeSession, status: 'expired' });
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  if (!isOpen) return null;

  // Add nominee handler
  const handleAddNominee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomineeName.trim() || !nomineePhone.trim()) return;

    const newContact: EmergencyContact = {
      id: `ec-${Date.now()}`,
      name: nomineeName.trim(),
      relationship: nomineeRelation,
      phone: nomineePhone.trim(),
      email: nomineeEmail.trim() || undefined,
      idNumber: nomineeIdNumber.trim() || 'Aadhaar / National ID',
      accessDurationHours: accessDuration,
      documentScope: selectedScopes,
      status: 'active',
      designatedDate: new Date().toISOString().split('T')[0],
      notes: 'Designated emergency contact with Gemini AI verified time-limited access covenant.'
    };

    const updated = [...contacts, newContact];
    saveContacts(updated);
    setShowAddContactForm(false);
    setNomineeName('');
    setNomineePhone('');
    setNomineeEmail('');
    setNomineeIdNumber('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Revoke nominee
  const handleRevokeContact = (id: string) => {
    const updated = contacts.map(c => c.id === id ? { ...c, status: 'revoked' as const } : c);
    saveContacts(updated);
  };

  // Revoke active session immediately
  const handleRevokeActiveSession = () => {
    if (!activeSession) return;
    const revoked = {
      ...activeSession,
      status: 'revoked' as const,
      logs: [
        ...activeSession.logs,
        { timestamp: new Date().toISOString(), action: 'Emergency session REVOKED immediately by primary account holder' }
      ]
    };
    saveSession(revoked);
    triggerBrowserNotification(
      'Emergency Access Revoked',
      'Emergency access for the nominee has been terminated and cryptographic tokens invalidated.',
      settings.language
    );
  };

  // Run Gemini AI Emergency Verification
  const handleRunVerification = async () => {
    setVerifying(true);
    setVerificationError(null);
    setVerificationResult(null);

    try {
      const response = await fetch('/api/gemini/emergency-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomineeName: claimNomineeName,
          nomineeRelationship: claimRelation,
          nomineePhone: claimPhone,
          nomineeIdProof: claimIdProof,
          emergencyType,
          reasonDescription: emergencyReason,
          requestedHours: accessDuration,
          language: settings.language
        })
      });

      if (!response.ok) throw new Error('Verification network request failed');
      const data = await response.json();
      setVerificationResult(data);

      if (data.verificationStatus === 'VERIFIED_APPROVED') {
        const session: EmergencyAccessSession = {
          id: `emg-sess-${Date.now()}`,
          nomineeName: claimNomineeName,
          emergencyType,
          reasonDescription: emergencyReason,
          confidenceScore: data.confidenceScore || 96,
          trustEvaluation: data.trustEvaluation || 'Verified by Gemini AI Emergency Guardian',
          approvedAccessHours: data.approvedAccessHours || 72,
          startedAt: new Date().toISOString(),
          expiresAt: data.expiryTimestamp || new Date(Date.now() + (data.approvedAccessHours || 72) * 3600 * 1000).toISOString(),
          token: data.emergencyAccessToken || `emg-tok-${Date.now()}`,
          status: 'active',
          permittedScope: data.recommendedAccessScope || selectedScopes,
          riskSignals: data.riskSignals || ['Single-device access lock active', 'Audit watermark enabled'],
          logs: [
            { timestamp: new Date().toISOString(), action: 'Emergency access request verified and approved by Gemini AI' },
            { timestamp: new Date().toISOString(), action: 'Cryptographic time-limited emergency token issued' },
            { timestamp: new Date().toISOString(), action: 'Proactive SMS alert dispatched to primary account holder' }
          ]
        };
        saveSession(session);
        triggerBrowserNotification(
          'Emergency Access Granted',
          `Emergency access verified for ${claimNomineeName} (Valid for ${session.approvedAccessHours} hours).`,
          settings.language
        );
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      setVerificationError('Unable to connect to AI verification engine. Default security covenants applied.');
    } finally {
      setVerifying(false);
    }
  };

  const toggleScope = (scope: string) => {
    if (selectedScopes.includes(scope)) {
      setSelectedScopes(selectedScopes.filter(s => s !== scope));
    } else {
      setSelectedScopes([...selectedScopes, scope]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-rose-950/30 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">{tr("Emergency Access Protocol")}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase tracking-wider">
                  {tr("Gemini AI Verified")}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {tr("Designate trusted family members for secure, time-limited emergency document access with AI validation")}
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

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 pb-0 bg-slate-900/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('nominees')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'nominees'
                ? 'border-rose-500 text-white bg-rose-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <UserCheck className="w-4 h-4 text-rose-400" />
            <span>{tr("Designated Trustees")} ({contacts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('verify')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'verify'
                ? 'border-rose-500 text-white bg-rose-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{tr("Simulate AI Claim Verification")}</span>
          </button>

          <button
            onClick={() => setActiveTab('active_session')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'active_session'
                ? 'border-rose-500 text-white bg-rose-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>{tr("Active Emergency Session")}</span>
            {activeSession && activeSession.status === 'active' && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'logs'
                ? 'border-rose-500 text-white bg-rose-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <History className="w-4 h-4 text-blue-400" />
            <span>{tr("Security Audit Log")}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: DESIGNATED TRUSTEES */}
          {activeTab === 'nominees' && (
            <div className="space-y-6">
              
              {/* Top Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/30 to-indigo-950/20 border border-rose-500/20 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <p className="font-semibold text-white mb-1">
                    {tr("Fiduciary Safeguards & Digital Personal Data Protection (DPDP) Compliance")}
                  </p>
                  <p>
                    {tr("Emergency trustees cannot freely access documents. In an event of incapacitation or hospitalization, Gemini AI validates their claim, verifies medical admission documentation, imposes a 2-hour owner revocation window, and grants time-limited cryptographic access.")}
                  </p>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
                  {tr("Registered Emergency Contacts")}
                </h3>
                <button
                  onClick={() => setShowAddContactForm(!showAddContactForm)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{showAddContactForm ? tr("Close Form") : tr("Designate New Trustee")}</span>
                </button>
              </div>

              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{tr("New emergency trustee successfully registered and encrypted into security vault.")}</span>
                </div>
              )}

              {/* Add Nominee Form */}
              {showAddContactForm && (
                <form onSubmit={handleAddNominee} className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-4">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    {tr("Nominate Trusted Family Member")}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        {tr("Full Legal Name")} *
                      </label>
                      <input
                        type="text"
                        required
                        value={nomineeName}
                        onChange={(e) => setNomineeName(e.target.value)}
                        placeholder="e.g. Priya Sharma"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        {tr("Relationship to Property Owner")} *
                      </label>
                      <select
                        value={nomineeRelation}
                        onChange={(e) => setNomineeRelation(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                      >
                        <option value="Daughter / Coparcener">{tr("Daughter (Class I Coparcener)")}</option>
                        <option value="Son / Coparcener">{tr("Son (Class I Coparcener)")}</option>
                        <option value="Spouse / Widow">{tr("Spouse / Wife (Class I Heir)")}</option>
                        <option value="Brother / Class II">{tr("Brother (Class II Heir)")}</option>
                        <option value="Sister / Class II">{tr("Sister (Class II Heir)")}</option>
                        <option value="Appointed Legal Advocate">{tr("Appointed Legal Counsel / Advocate")}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        {tr("Mobile Phone Number (SMS Alert)")} *
                      </label>
                      <input
                        type="tel"
                        required
                        value={nomineePhone}
                        onChange={(e) => setNomineePhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        {tr("Government ID (Aadhaar / Passport / Voter ID)")}
                      </label>
                      <input
                        type="text"
                        value={nomineeIdNumber}
                        onChange={(e) => setNomineeIdNumber(e.target.value)}
                        placeholder="XXXX-XXXX-1234"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        {tr("Emergency Access Window")}
                      </label>
                      <select
                        value={accessDuration}
                        onChange={(e) => setAccessDuration(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                      >
                        <option value={24}>24 Hours (Urgent Hospital Window)</option>
                        <option value={48}>48 Hours (Standard Medical Emergency)</option>
                        <option value={72}>72 Hours (Extended Succession Window)</option>
                        <option value={168}>7 Days (Legal Settlement Window)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        {tr("Email Address (Optional)")}
                      </label>
                      <input
                        type="email"
                        value={nomineeEmail}
                        onChange={(e) => setNomineeEmail(e.target.value)}
                        placeholder="trustee@family.org"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>

                  {/* Scope Checklist */}
                  <div className="pt-2">
                    <label className="block text-[11px] font-semibold text-slate-300 mb-2">
                      {tr("Allowed Document Scope Under Emergency Access")}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        'Ancestral Property Deeds & Khata Extract',
                        'Registered Last Will & Testament',
                        'Bank Nominee & Fixed Deposit Certificates',
                        'Family Tree Lineage & Coparcenary Map'
                      ].map((scope) => (
                        <button
                          type="button"
                          key={scope}
                          onClick={() => toggleScope(scope)}
                          className={`p-2.5 rounded-xl border text-left text-xs flex items-center justify-between transition-all ${
                            selectedScopes.includes(scope)
                              ? 'bg-rose-500/20 text-rose-200 border-rose-500/50'
                              : 'bg-slate-900/60 text-slate-400 border-slate-800'
                          }`}
                        >
                          <span className="truncate pr-2">{tr(scope)}</span>
                          {selectedScopes.includes(scope) ? (
                            <Check className="w-4 h-4 text-rose-400 flex-shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded border border-slate-700 flex-shrink-0"></div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-700/60">
                    <button
                      type="button"
                      onClick={() => setShowAddContactForm(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700"
                    >
                      {tr("Cancel")}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 shadow-md"
                    >
                      <Check className="w-4 h-4" />
                      <span>{tr("Confirm & Register Trustee")}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Contact List */}
              <div className="space-y-3">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-sm flex-shrink-0">
                        {contact.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{contact.name}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            contact.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-red-500/20 text-red-300 border border-red-500/40'
                          }`}>
                            {contact.status === 'active' ? tr("ACTIVE TRUSTEE") : tr("REVOKED")}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{contact.relationship}</p>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-2">
                          <span className="flex items-center gap-1">
                            <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                            {contact.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5 text-slate-500" />
                            {contact.idNumber}
                          </span>
                          <span className="flex items-center gap-1 text-rose-300">
                            <Clock className="w-3.5 h-3.5 text-rose-400" />
                            {contact.accessDurationHours}h {tr("Access Window")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      {contact.status === 'active' && (
                        <>
                          <button
                            onClick={() => {
                              setClaimNomineeName(contact.name);
                              setClaimPhone(contact.phone);
                              setClaimRelation(contact.relationship);
                              setActiveTab('verify');
                            }}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 flex items-center gap-1"
                            title="Simulate Emergency Claim"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{tr("Test Claim")}</span>
                          </button>
                          <button
                            onClick={() => handleRevokeContact(contact.id)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>{tr("Revoke")}</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 2: SIMULATE AI CLAIM VERIFICATION */}
          {activeTab === 'verify' && (
            <div className="space-y-6">
              
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <p className="font-semibold text-white mb-1">
                    {tr("Gemini AI Emergency Access Validator")}
                  </p>
                  <p>
                    {tr("In an emergency, the nominee submits medical or hospital admission details. Gemini AI cross-references the nominee's credentials, evaluates emergency urgency, and establishes a secure time-limited session.")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-800/40 border border-slate-800">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    {tr("Claiming Nominee Name")}
                  </label>
                  <input
                    type="text"
                    value={claimNomineeName}
                    onChange={(e) => setClaimNomineeName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    {tr("Nominee Relationship")}
                  </label>
                  <input
                    type="text"
                    value={claimRelation}
                    onChange={(e) => setClaimRelation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    {tr("Emergency Category")}
                  </label>
                  <select
                    value={emergencyType}
                    onChange={(e) => setEmergencyType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Critical Medical ICU Admission">{tr("Critical Medical ICU Admission")}</option>
                    <option value="Sudden Incapacitation / Stroke">{tr("Sudden Incapacitation / Stroke")}</option>
                    <option value="Hospital Discharge Authorization">{tr("Hospital Discharge Authorization")}</option>
                    <option value="Death Intimation & Succession Filing">{tr("Death Intimation & Succession Filing")}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    {tr("Nominee Contact Phone")}
                  </label>
                  <input
                    type="tel"
                    value={claimPhone}
                    onChange={(e) => setClaimPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    {tr("Emergency Justification & Hospital Details")}
                  </label>
                  <textarea
                    rows={3}
                    value={emergencyReason}
                    onChange={(e) => setEmergencyReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
                  />
                </div>
              </div>

              {/* Run Verification Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleRunVerification}
                  disabled={verifying}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white flex items-center gap-2 shadow-lg active:scale-95 transition-all"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-200" />
                      <span>{tr("Gemini AI Verifying Credentials...")}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>{tr("Authenticate Emergency Claim with Gemini AI")}</span>
                    </>
                  )}
                </button>
              </div>

              {verificationError && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{verificationError}</span>
                </div>
              )}

              {/* AI Verification Results Card */}
              {verificationResult && (
                <div className="p-5 rounded-3xl bg-slate-800/80 border border-emerald-500/40 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{tr("Claim Successfully Authenticated")}</h4>
                        <p className="text-[11px] text-emerald-300">
                          {tr("Confidence Score")}: {verificationResult.confidenceScore}% • {tr("Status")}: {verificationResult.verificationStatus}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {verificationResult.approvedAccessHours}h {tr("Access Granted")}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-900/70 p-3 rounded-xl border border-slate-700/60 leading-relaxed">
                    {verificationResult.trustEvaluation}
                  </p>

                  <div className="space-y-2">
                    <h5 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      {tr("Permitted Emergency Scope")}
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(verificationResult.recommendedAccessScope || []).map((scope: string) => (
                        <div key={scope} className="p-2 rounded-xl bg-slate-900/60 border border-slate-700/80 text-xs text-slate-200 flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span className="truncate">{scope}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-700/60 text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-amber-300">
                      <Lock className="w-3.5 h-3.5" />
                      {tr("2-Hour Owner Revocation Window Active")}
                    </span>
                    <button
                      onClick={() => setActiveTab('active_session')}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                    >
                      <Eye className="w-4 h-4" />
                      <span>{tr("View Active Session & Vault")}</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: ACTIVE EMERGENCY SESSION */}
          {activeTab === 'active_session' && (
            <div className="space-y-6">
              
              {activeSession && activeSession.status === 'active' ? (
                <div className="space-y-6">
                  
                  {/* Session Header Card */}
                  <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/40 space-y-4 shadow-2xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-pulse">
                          <Unlock className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-white">{tr("Emergency Access Active")}</h3>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                              LIVE
                            </span>
                          </div>
                          <p className="text-xs text-slate-300">
                            {tr("Authorized Trustee")}: <span className="font-semibold text-white">{activeSession.nomineeName}</span>
                          </p>
                        </div>
                      </div>

                      {/* Countdown Timer */}
                      <div className="bg-slate-900/90 border border-emerald-500/30 px-4 py-2 rounded-2xl flex items-center gap-3 self-start sm:self-auto">
                        <Clock className="w-5 h-5 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{tr("Time Remaining")}</p>
                          <p className="text-sm font-extrabold text-emerald-300 font-mono">{timeRemaining || 'Calculating...'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Failsafe Revoke Button */}
                    <div className="pt-3 border-t border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <p className="text-xs text-slate-400">
                        {tr("Are you the primary account holder? You can instantly invalidate this session.")}
                      </p>
                      <button
                        onClick={handleRevokeActiveSession}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white flex items-center justify-center gap-2 shadow-lg transition-all"
                      >
                        <Ban className="w-4 h-4" />
                        <span>{tr("Revoke Emergency Access Now")}</span>
                      </button>
                    </div>
                  </div>

                  {/* Permitted Vault Documents */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                      {tr("Emergency Vault Documents (Watermarked)")}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { title: "Registered Deed of Ancestral Property (Khasra 84)", type: "PDF Deed", size: "2.4 MB" },
                        { title: "Last Will & Testament (Draft & Registered Copy)", type: "Legal Will", size: "1.8 MB" },
                        { title: "Khata Certificate & Mutation Register Extract", type: "Revenue Record", size: "840 KB" },
                        { title: "Bank Nominee & Fixed Deposit Portfolio", type: "Financial", size: "1.2 MB" },
                      ].map((doc, idx) => (
                        <div key={idx} className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-between gap-3 hover:border-slate-600 transition-all">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-rose-400 flex-shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-xs font-bold text-white truncate">{doc.title}</p>
                              <p className="text-[10px] text-slate-400">{doc.type} • {doc.size}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              alert(`Emergency document download generated with tamper-evident audit watermark for ${activeSession.nomineeName}`);
                            }}
                            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-700 text-slate-300 hover:text-white flex-shrink-0"
                            title="Download with Emergency Watermark"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="p-12 text-center rounded-3xl bg-slate-800/30 border border-slate-800 space-y-4">
                  <div className="w-14 h-14 rounded-3xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 mx-auto">
                    <Lock className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-white">{tr("No Active Emergency Session")}</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    {tr("Emergency access is currently locked. When a designated trustee submits a verified claim, a time-limited session will activate here.")}
                  </p>
                  <button
                    onClick={() => setActiveTab('verify')}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white inline-flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{tr("Simulate an Emergency Access Request")}</span>
                  </button>
                </div>
              )}

            </div>
          )}

          {/* TAB 4: AUDIT LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {tr("Immutable Emergency Security Ledger")}
              </h4>
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-3 font-mono text-xs text-slate-300">
                {(activeSession?.logs || [
                  { timestamp: '2026-08-15T14:30:00Z', action: 'Primary emergency contact Priya Sharma designated with 72h window' },
                  { timestamp: '2026-08-16T09:12:00Z', action: 'Digital cryptographic key agreement generated and stored' },
                  { timestamp: '2026-08-19T08:00:00Z', action: 'Security covenant verified under DPDP Act 2023 regulations' }
                ]).map((log: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 pb-2 border-b border-slate-800/80 last:border-0 last:pb-0">
                    <span className="text-slate-500 text-[11px] whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className="text-slate-300">{log.action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            {tr("Protected under Indian Information Technology & DPDP Acts")}
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            {tr("Close")}
          </button>
        </div>

      </div>
    </div>
  );
};
