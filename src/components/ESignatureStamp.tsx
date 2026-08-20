import React from 'react';
import { ShieldCheck, UserCheck, Clock, Fingerprint, Trash2, CheckCircle2, Award } from 'lucide-react';
import { ESignatureData } from '../types';

interface ESignatureStampProps {
  signature: ESignatureData;
  onRemove?: () => void;
  compact?: boolean;
  showAuditTrail?: boolean;
}

export const ESignatureStamp: React.FC<ESignatureStampProps> = ({
  signature,
  onRemove,
  compact = false,
  showAuditTrail = true
}) => {
  return (
    <div className={`relative bg-slate-950/90 border border-emerald-500/40 rounded-2xl p-4 text-slate-100 shadow-lg group transition-all ${
      compact ? 'max-w-xs' : 'w-full max-w-sm'
    }`}>
      
      {/* Decorative Stamp Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
            {signature.signatoryRole} Signature Seal
          </span>
        </div>

        <span className="text-[9px] bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30 font-mono">
          AUTHENTICATED
        </span>
      </div>

      {/* Signature Graphic Display */}
      <div className="h-20 w-full flex items-center justify-center bg-slate-900/60 rounded-xl p-2 border border-slate-800/80 my-2 overflow-hidden">
        {signature.signatureDataUrl ? (
          <img 
            src={signature.signatureDataUrl} 
            alt={`Signature of ${signature.signatoryName}`} 
            className="max-h-full max-w-full object-contain filter invert brightness-200 contrast-125"
          />
        ) : (
          <span className="font-serif italic text-xl text-indigo-300">
            {signature.signatoryName}
          </span>
        )}
      </div>

      {/* Signatory Particulars */}
      <div className="space-y-1 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white tracking-tight">{signature.signatoryName}</span>
          <span className="text-[10px] text-slate-400 font-mono">{signature.signatoryRole}</span>
        </div>

        {showAuditTrail && (
          <div className="text-[10px] text-slate-400 space-y-0.5 font-mono pt-1.5 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>Signed:</span>
              </span>
              <span className="text-slate-300">{signature.timestampFormatted.split(' at ')[0]}</span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1">
                <Fingerprint className="w-3 h-3 text-slate-500" />
                <span>Hash:</span>
              </span>
              <span className="text-emerald-400 truncate max-w-[150px]">{signature.digitalFingerprintSha256.slice(0, 16)}...</span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span>Auth Source:</span>
              <span className="text-slate-300 truncate max-w-[130px]">{signature.authProvider || 'Firebase Auth'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Remove / Reset Button */}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/80 hover:bg-rose-950 text-slate-400 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Remove Signature"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}

    </div>
  );
};
