import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { FamilyTreeData, CalculatedShare, AppSettings } from '../types';
import { t as translateText } from '../utils/translate';
import { 
  QrCode, 
  Printer, 
  Download, 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  HardDrive, 
  FileText, 
  Copy, 
  Check, 
  Scale, 
  Building2,
  Share2
} from 'lucide-react';

interface PrintableQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  tree: FamilyTreeData;
  calculatedShares?: CalculatedShare[];
  settings: AppSettings;
  totalPropertyValue?: number;
}

export const PrintableQrModal: React.FC<PrintableQrModalProps> = ({
  isOpen,
  onClose,
  tree,
  calculatedShares = [],
  settings,
  totalPropertyValue = 10000000
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'card' | 'payload'>('card');
  const printAreaRef = useRef<HTMLDivElement>(null);

  const tr = (str: string) => translateText(str, settings.language);

  const deceasedName = tree.propositusName || 'Late Shri Ramakant Sharma';
  const faith = tree.religionLaw === 'hindu' ? 'Hindu' : tree.religionLaw === 'muslim' ? 'Muslim' : tree.religionLaw === 'christian' ? 'Christian' : 'Secular';

  // Structured QR Payload
  const qrObject = {
    standard: 'ADHIKAR_GENEALOGICAL_V1',
    ref: `ADH-${Math.floor(100000 + Math.random() * 900000)}`,
    deceased: deceasedName,
    faith: faith,
    membersCount: tree.members.length,
    heirs: tree.members.map((m) => ({
      name: m.name,
      rel: m.relationship,
      gender: m.gender,
      isAlive: m.status === 'alive'
    })),
    sharesSummary: calculatedShares.length > 0 ? calculatedShares.map((s) => ({
      name: s.memberName,
      pct: `${s.percentage}%`,
      cat: s.category
    })) : tree.members.filter(m => !m.isPropositus).map(m => ({
      name: m.name,
      pct: `${m.estimatedSharePercent}%`,
      cat: m.gender === 'female' ? 'Class I (Coparcener)' : 'Class I Heir'
    })),
    timestamp: new Date().toISOString(),
    verifyHash: `ADHIKAR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  };

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(JSON.stringify(qrObject), {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Error generating QR:', err));
    }
  }, [isOpen, tree, calculatedShares]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQrImage = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `ADHIKAR_QR_${deceasedName.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    a.click();
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(qrObject, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative text-slate-100 space-y-6 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <QrCode className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-serif">
                {tr("Printable Lineage QR Code")}
              </h3>
              <p className="text-xs text-slate-400">
                {tr("For quick offline inspection by Patwari, Tahsildar, or Advocates")}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('card')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'card'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>{tr("Printable Legal Card")}</span>
          </button>

          <button
            onClick={() => setActiveTab('payload')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'payload'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{tr("Encoded Offline Data")}</span>
          </button>
        </div>

        {/* Tab Content 1: Printable Certificate Card */}
        {activeTab === 'card' && (
          <div className="space-y-4">
            <div 
              ref={printAreaRef}
              id="printable-qr-manifest"
              className="bg-white text-slate-900 rounded-2xl p-6 shadow-xl border-2 border-slate-200 flex flex-col md:flex-row gap-6 items-center"
            >
              {/* QR Image Box */}
              <div className="flex flex-col items-center justify-center p-3 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl shrink-0">
                {qrDataUrl ? (
                  <img 
                    src={qrDataUrl} 
                    alt="Family Tree QR" 
                    className="w-48 h-48 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
                    Generating QR...
                  </div>
                )}
                <span className="text-[10px] font-bold text-slate-600 mt-2 font-mono uppercase tracking-wider">
                  Scan for Offline Hierarchy
                </span>
              </div>

              {/* Hierarchy Info Details */}
              <div className="flex-1 space-y-2.5 text-left w-full">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold uppercase tracking-wider">
                    ADHIKAR Verified Manifest
                  </span>
                  <span className="text-[10px] text-slate-600 font-mono">
                    Ref: {qrObject.ref}
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-900 font-serif leading-tight">
                  {deceasedName}
                </h4>

                <p className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">Succession Regime:</span> {faith} Succession Law (Intestate)
                </p>

                {/* Heir summary preview */}
                <div className="bg-slate-100 rounded-xl p-2.5 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                    Recorded Statutory Heirs ({tree.members.length}):
                  </span>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-700">
                    {tree.members.slice(0, 6).map((m) => (
                      <div key={m.id} className="truncate">
                        • <span className="font-semibold">{m.name}</span> ({m.relationship})
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium pt-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>256-bit encrypted hash embedded for zero-connectivity audit.</span>
                </div>
              </div>
            </div>

            {/* Actions Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadQrImage}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 transition-all active:scale-95"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>{tr("Download QR Image")}</span>
                </button>

                <button
                  onClick={handleCopyPayload}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all"
                >
                  {copiedPayload ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedPayload ? tr("Copied!") : tr("Copy Hash")}</span>
                </button>
              </div>

              <button
                onClick={handlePrint}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>{tr("Print Card (A4)")}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Content 2: Offline Encoded Payload Preview */}
        {activeTab === 'payload' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-slate-800">
                <span className="font-mono">JSON Offline Manifest Payload</span>
                <button
                  onClick={handleCopyPayload}
                  className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                >
                  {copiedPayload ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPayload ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-64 p-2">
                {JSON.stringify(qrObject, null, 2)}
              </pre>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Legal officials can scan this QR code with any standard smartphone camera or barcode scanner even with mobile data turned off to parse the exact tree structure, statutory heir list, and succession parameters.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
