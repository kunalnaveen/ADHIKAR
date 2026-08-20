import React from 'react';
import { X, ShieldCheck, FileText, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface LegalModalProps {
  type: 'terms' | 'privacy' | 'disclaimer' | 'security' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[85vh] bg-[#0c0c0e] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-white transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content based on type */}
        <div className="pr-2">
          {type === 'terms' && (
            <div>
              <div className="flex items-center gap-3 mb-4 text-blue-400">
                <FileText className="w-6 h-6" />
                <h3 className="text-xl font-bold text-white">Terms of Service & Usage Agreement</h3>
              </div>
              <div className="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                <p>
                  <strong>1. Platform Nature:</strong> ADHIKAR is an artificial intelligence research and computational legal intelligence engine built to assist citizens, legal professionals, and families in understanding statutory rights under Indian succession and property laws.
                </p>
                <p>
                  <strong>2. Research & Educational Scope:</strong> Calculations, notional partition models, and case law citations are generated through statutory algorithms and verified Supreme Court jurisprudence. Users acknowledge that final legal partition or registry mutation requires execution by competent revenue and judicial authorities.
                </p>
                <p>
                  <strong>3. Intellectual Property & Trademarks:</strong> ADHIKAR™, The Next Layer of Intelligence™, and Jurisprudence Engine™ are protected trademarks. All algorithmic architectures and visual lineage engines are proprietary.
                </p>
                <p>
                  <strong>4. User Data Governance:</strong> Family trees and lineage inputs are processed with client-side zero-knowledge architecture. No unencrypted hereditary records are traded or shared with commercial brokers.
                </p>
              </div>
            </div>
          )}

          {type === 'privacy' && (
            <div>
              <div className="flex items-center gap-3 mb-4 text-emerald-400">
                <Lock className="w-6 h-6" />
                <h3 className="text-xl font-bold text-white">Privacy Policy & DPDP Act Compliance</h3>
              </div>
              <div className="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                <p>
                  <strong>1. Compliance with DPDP Act 2023:</strong> In accordance with India's Digital Personal Data Protection Act, 2023, ADHIKAR acts as a data fiduciary adhering strictly to purpose limitation, storage minimization, and explicit consent mechanisms.
                </p>
                <p>
                  <strong>2. Zero-Knowledge Processing:</strong> Family tree lineage nodes, heir identities, property records, and mock courtroom simulations are encrypted at rest using 256-bit AES cryptographic protocols.
                </p>
                <p>
                  <strong>3. Right to Erasure:</strong> Users maintain unhindered rights to permanently delete all simulated cases, family trees, and voice inquiry transcripts from their local session at any point.
                </p>
                <p>
                  <strong>4. No Third-Party Tracking:</strong> We do not sell user telemetry, demographic data, or lineage mappings to advertisers or property developers.
                </p>
              </div>
            </div>
          )}

          {type === 'disclaimer' && (
            <div>
              <div className="flex items-center gap-3 mb-4 text-amber-400">
                <AlertCircle className="w-6 h-6" />
                <h3 className="text-xl font-bold text-white">Bar Council of India Disclaimer</h3>
              </div>
              <div className="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                <p>
                  <strong>1. Non-Solicitation Notice:</strong> As per the Bar Council of India Rules (Rules of Professional Conduct), this platform does not advertise or solicit legal work. 
                </p>
                <p>
                  <strong>2. Information Only:</strong> The information provided on ADHIKAR is solely for informational, computational, and legal literacy purposes. It should not be construed as the creation of an advocate-client relationship.
                </p>
                <p>
                  <strong>3. Independent Legal Counsel:</strong> Users are advised to seek independent legal counsel from qualified advocates for actual filings in District Courts, High Courts, or the Supreme Court of India.
                </p>
              </div>
            </div>
          )}

          {type === 'security' && (
            <div>
              <div className="flex items-center gap-3 mb-4 text-purple-400">
                <ShieldCheck className="w-6 h-6" />
                <h3 className="text-xl font-bold text-white">Security Architecture & Encryption</h3>
              </div>
              <div className="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                <p>
                  <strong>1. End-to-End Cryptography:</strong> All data transmissions utilize TLS 1.3 encryption with Perfect Forward Secrecy.
                </p>
                <p>
                  <strong>2. ISO/IEC 27001 Protocols:</strong> Strict information security management systems govern data integrity, vulnerability scanning, and infrastructure audits.
                </p>
                <p>
                  <strong>3. Sovereign Infrastructure:</strong> Hosted in sovereign Indian data centers ensuring data localization compliance.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-zinc-500 font-mono">ADHIKAR™ Legal Trust Standard</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
