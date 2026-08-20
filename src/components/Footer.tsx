import React, { useState } from 'react';
import { 
  Scale, 
  ExternalLink, 
  CheckCircle2, 
  X,
  Code,
  Lock,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { Language } from '../types';
import { t as translateText } from '../utils/translate';

interface FooterProps {
  onNavigate: (view: string) => void;
  language: Language;
  onOpenSecurityAudit?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  language,
  onOpenSecurityAudit,
}) => {
  const [activeLegalModal, setActiveLegalModal] = useState<'cc' | 'license' | 'privacy' | 'bci' | null>(null);

  const tr = (text: string) => translateText(text, language);

  const socialLinks = [
    {
      name: "Instagram",
      href: "https://instagram.com",
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    },
    {
      name: "X",
      href: "https://x.com",
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    },
    {
      name: "LinkedIn",
      href: "https://linkedin.com",
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
        </svg>
      )
    },
    {
      name: "GitHub",
      href: "https://github.com",
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
        </svg>
      )
    },
    {
      name: "YouTube",
      href: "https://youtube.com",
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    }
  ];

  return (
    <footer className="w-full border-t border-slate-800/80 bg-[#080c14] text-slate-400 text-xs mt-12 pb-24 md:pb-8 transition-colors">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-5">
        
        {/* Sleek, Single-Row Navigation & Social Links */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-[11px]">
          
          {/* Brand & TM / CC Line */}
          <div className="flex items-center gap-2 flex-wrap text-slate-300">
            <span className="font-serif font-bold text-white tracking-tight flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-indigo-400" />
              <span>ADHIKAR™</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="font-mono text-[10px] text-slate-400">Reg. TM #6291410</span>
            <span className="text-slate-600">|</span>
            <button 
              onClick={() => setActiveLegalModal('cc')}
              className="text-indigo-300 hover:text-indigo-200 underline underline-offset-2 transition-colors font-medium"
            >
              CC BY-NC-SA 4.0
            </button>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-slate-400 hidden sm:inline">DPDP 2023 Compliant</span>
          </div>

          {/* Social Channels & Security Badge */}
          <div className="flex items-center gap-3">
            {onOpenSecurityAudit && (
              <button
                onClick={onOpenSecurityAudit}
                className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono transition-colors"
                title="20 Security Checks (100% Passed)"
              >
                <ShieldCheck className="w-3 h-3" />
                <span>20 Checks</span>
              </button>
            )}
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-2 text-slate-400">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-300 transition-colors p-1"
                  title={item.name}
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Minimal Legal Links & Concise Disclaimer */}
        <div className="mt-3 pt-3 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-400">
          <div>
            © {new Date().getFullYear()} ADHIKAR™ Legal Systems India. Educational succession simulator. Not legal representation under BCI Rule 36.
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <button 
              onClick={() => setActiveLegalModal('cc')} 
              className="hover:text-slate-200 transition-colors"
            >
              CC License
            </button>
            <span>•</span>
            <button 
              onClick={() => setActiveLegalModal('license')} 
              className="hover:text-slate-200 transition-colors"
            >
              MIT License
            </button>
            <span>•</span>
            <button 
              onClick={() => setActiveLegalModal('privacy')} 
              className="hover:text-slate-200 transition-colors"
            >
              DPDP Privacy
            </button>
            <span>•</span>
            <button 
              onClick={() => setActiveLegalModal('bci')} 
              className="hover:text-slate-200 transition-colors"
            >
              BCI Disclaimer
            </button>
          </div>
        </div>

      </div>

      {/* ─── Compact Legal Details Modal ─── */}
      {activeLegalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm text-slate-100">
          <div className="bg-[#0b0f19] border border-slate-700 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            
            <div className="p-4 border-b border-slate-800 bg-[#111827] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Scale className="w-4 h-4 text-indigo-400" />
                <h3 className="font-serif font-bold text-white text-sm">
                  {activeLegalModal === 'cc' && "Creative Commons License (CC BY-NC-SA 4.0)"}
                  {activeLegalModal === 'license' && "ADHIKAR Software & Model Licensing"}
                  {activeLegalModal === 'privacy' && "DPDP Act 2023 Privacy Policy"}
                  {activeLegalModal === 'bci' && "Bar Council of India Rule 36 Compliance"}
                </h3>
              </div>
              <button
                onClick={() => setActiveLegalModal(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 text-xs text-slate-300 leading-relaxed">
              {activeLegalModal === 'cc' && (
                <>
                  <p className="text-slate-300">
                    Calculations and legal educational schemas are licensed under <strong>Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International</strong>.
                  </p>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-400 text-[11px]">
                    <li><strong>Attribution (BY):</strong> Credit ADHIKAR™ Legal Systems.</li>
                    <li><strong>NonCommercial (NC):</strong> No unauthorized commercial resale.</li>
                    <li><strong>ShareAlike (SA):</strong> Adaptations must share the same license.</li>
                  </ul>
                  <p className="font-mono text-[10px] text-slate-400 pt-2 border-t border-slate-800">
                    Trademark Reg. TM #6291410. All rights reserved under Copyright Act 1957.
                  </p>
                </>
              )}

              {activeLegalModal === 'license' && (
                <>
                  <p>
                    <strong>Client-Side UI:</strong> MIT License (Permissive open-source code).
                  </p>
                  <p>
                    <strong>Ontology & Math:</strong> CC BY-NC-SA 4.0 International.
                  </p>
                  <p>
                    <strong>AI Judicial Evaluations:</strong> Powered by Google Gemini under standard generative AI terms.
                  </p>
                </>
              )}

              {activeLegalModal === 'privacy' && (
                <>
                  <p>
                    In accordance with the <strong>Digital Personal Data Protection Act, 2023</strong>:
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Data is stored local-first in your encrypted browser vault. Biometric authentication guards confidential testament notes. No personal estate records are sold or transferred to commercial brokers.
                  </p>
                </>
              )}

              {activeLegalModal === 'bci' && (
                <>
                  <p>
                    In compliance with <strong>Rule 36 of the Bar Council of India Rules</strong>:
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    ADHIKAR™ does not solicit legal work or provide advocate representation. It serves purely as an educational simulator, kinship mapper, and digital testament recordkeeper.
                  </p>
                </>
              )}
            </div>

            <div className="p-3 bg-[#111827] border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveLegalModal(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </footer>
  );
};

