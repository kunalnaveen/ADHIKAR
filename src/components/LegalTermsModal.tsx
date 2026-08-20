import React, { useState } from 'react';
import { ShieldCheck, FileText, Lock, X, Check, Scale, BookOpen } from 'lucide-react';
import { t } from '../utils/translate';
import { Language } from '../types';

interface LegalTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'terms' | 'privacy';
  language?: Language;
}

export const LegalTermsModal: React.FC<LegalTermsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'terms',
  language = 'EN'
}) => {
  const tr = (key: string) => t(key, language);
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] my-auto">
        
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {activeTab === 'terms' ? tr("Statutory Terms of Service") : tr("Digital Privacy Policy (DPDP Act 2023)")}
              </h2>
              <p className="text-xs text-slate-400">
                {tr("Compliance with Advocates Act 1961 & Indian Information Technology Rules")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 pb-0 bg-slate-900/60 border-b border-slate-800 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-4 py-2 rounded-t-xl text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'terms'
                ? 'border-indigo-500 text-white bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{tr("Terms of Service")}</span>
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2 rounded-t-xl text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'privacy'
                ? 'border-indigo-500 text-white bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{tr("Privacy Policy & Data Rights")}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-slate-300 leading-relaxed">
          {activeTab === 'terms' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 text-indigo-200">
                <p className="font-bold text-white mb-1">
                  1. Statutory Legal Nature & Bar Council Compliance (Advocates Act, 1961)
                </p>
                <p>
                  ADHIKAR is an educational legal intelligence platform. It is not a law firm and does not provide formal representation in any Court of Law. Use of this platform does not create an advocate-client privilege.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white">2. Testamentary Drafting & Succession Guidance</h4>
                <p>
                  Will drafts generated via ADHIKAR comply with the Indian Succession Act 1925 (Sections 59 and 63) and Hindu Succession Act 1956/2005. Final execution requires signature in the presence of two independent non-beneficiary witnesses under Section 67.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white">3. Emergency Access Protocol & Fiduciary Undertaking</h4>
                <p>
                  By designating emergency trustees, you authorize time-limited cryptographic release of designated documents upon verified medical or sudden incapacitation events. All access attempts are recorded in an immutable ledger.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white">4. Limitation Periods & Statutory Deadlines</h4>
                <p>
                  Revenue mutation appeals, probate filings, and property partition limitation windows are governed by the Limitation Act 1963 and state-specific Land Revenue Codes.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-200">
                <p className="font-bold text-white mb-1">
                  Digital Personal Data Protection Act, 2023 (DPDP Act)
                </p>
                <p>
                  ADHIKAR operates on zero-knowledge encryption principles for personal testamentary data, Aadhaar details, and property ownership deeds.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white">1. Client-Side Vault Encryption</h4>
                <p>
                  Biometric credentials and encrypted vault documents remain client-side or within protected Cloud Firestore nodes with role-based security rules.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white">2. Right to Erasure & Data Portability</h4>
                <p>
                  Users maintain an unconstrained right to export their complete genealogical data in JSON/PDF formats or permanently wipe their local and cloud records at any time.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white">3. Tamper-Evident Watermarking</h4>
                <p>
                  All document exports and emergency trustee access downloads are stamped with cryptographic watermarks to prevent unauthorized distribution.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            Last Updated: August 2026 • Republic of India
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            {tr("Acknowledge & Close")}
          </button>
        </div>

      </div>
    </div>
  );
};
