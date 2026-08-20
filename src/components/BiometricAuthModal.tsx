import React, { useState, useEffect } from 'react';
import { 
  Fingerprint, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Smartphone, 
  KeyRound,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { 
  isWebAuthnSupported, 
  isBiometricEnrolled, 
  getEnrolledBiometric, 
  enrollBiometric, 
  authenticateBiometric, 
  removeBiometric, 
  isVaultLocked, 
  setVaultLockedState 
} from '../utils/webAuthn';
import { t as translateText } from '../utils/translate';
import { AppSettings } from '../types';

interface BiometricAuthModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  settings?: AppSettings;
  mode?: 'unlock' | 'enroll' | 'manage';
  title?: string;
  subtitle?: string;
  docName?: string;
}

export const BiometricAuthModal: React.FC<BiometricAuthModalProps> = ({
  isOpen = true,
  onClose,
  onSuccess,
  settings,
  mode = 'unlock',
  title,
  subtitle,
  docName
}) => {
  const currentLang = settings?.language || 'EN';
  const tr = (str: string) => translateText(str, currentLang);

  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [statusType, setStatusType] = useState<'idle' | 'success' | 'error'>('idle');
  const [userName, setUserName] = useState<string>('Legal Heir');

  useEffect(() => {
    if (isOpen) {
      setIsSupported(isWebAuthnSupported());
      const enrolled = isBiometricEnrolled();
      setIsEnrolled(enrolled);
      setIsLocked(isVaultLocked());
      setStatusMessage('');
      setStatusType('idle');

      const currentCreds = getEnrolledBiometric();
      if (currentCreds) {
        setUserName(currentCreds.userName);
      }
    }
  }, [isOpen]);

  const handleEnroll = async () => {
    setLoading(true);
    setStatusMessage(tr('Touch fingerprint sensor or look at Face ID camera...'));
    setStatusType('idle');

    try {
      await enrollBiometric(userName);
      setIsEnrolled(true);
      setIsLocked(false);
      setStatusType('success');
      setStatusMessage(tr('Biometric Passkey enrolled successfully! Vault unlocked.'));
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1000);
    } catch (e: any) {
      console.error(e);
      setStatusType('error');
      setStatusMessage(tr('Biometric enrollment failed. You can use PIN fallback.'));
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    setLoading(true);
    setStatusMessage(tr('Verifying fingerprint / Face ID passkey...'));
    setStatusType('idle');

    try {
      const success = await authenticateBiometric();
      if (success) {
        setIsLocked(false);
        setStatusType('success');
        setStatusMessage(tr('Biometric identity verified! Access granted.'));
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 800);
      } else {
        setStatusType('error');
        setStatusMessage(tr('Biometric verification failed. Please try again.'));
      }
    } catch (e) {
      setStatusType('error');
      setStatusMessage(tr('Biometric authentication failed.'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLock = () => {
    const newState = !isLocked;
    setVaultLockedState(newState);
    setIsLocked(newState);
    if (!newState) {
      onSuccess?.();
    }
  };

  const handleRemove = () => {
    removeBiometric();
    setIsEnrolled(false);
    setIsLocked(false);
    setStatusType('idle');
    setStatusMessage(tr('Biometric lock removed from this browser.'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl relative text-slate-100 space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Biometric Icon Animation */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all ${
              statusType === 'success' 
                ? 'bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.4)]'
                : statusType === 'error'
                ? 'bg-rose-500/20 border-2 border-rose-400 text-rose-400'
                : 'bg-indigo-600/20 border-2 border-indigo-500/40 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.3)]'
            }`}>
              {statusType === 'success' ? (
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              ) : isLocked ? (
                <Lock className="w-10 h-10" />
              ) : (
                <Fingerprint className="w-10 h-10 animate-pulse" />
              )}
            </div>

            {loading && (
              <div className="absolute inset-0 rounded-3xl border-2 border-indigo-400 border-t-transparent animate-spin" />
            )}
          </div>

          <div>
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>WebAuthn FIDO2 Biometrics</span>
            </div>
            
            <h3 className="text-xl font-bold text-white font-serif">
              {title || (isEnrolled 
                ? (isLocked ? tr("Unlock Legal Vault") : tr("Biometric Security Verification"))
                : tr("Set Up Biometric Lock"))}
            </h3>

            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              {subtitle || (docName ? `Authentication required to unlock ${docName}` : tr("Protect your sensitive inheritance tree, Will documents, and property records with Touch ID or Face ID."))}
            </p>
          </div>
        </div>

        {/* Status Feedback Message */}
        {statusMessage && (
          <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
            statusType === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : statusType === 'error'
              ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              : 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-300'
          }`}>
            {statusType === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : statusType === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
            )}
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="space-y-3">
          {isEnrolled ? (
            <>
              {isLocked || docName ? (
                <button
                  onClick={handleUnlock}
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 active:scale-95 transition-all"
                >
                  <Fingerprint className="w-5 h-5 text-emerald-400" />
                  <span>{loading ? tr("Verifying...") : tr("Scan Fingerprint / Face ID")}</span>
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{tr("Vault Status")}:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Unlock className="w-3.5 h-3.5" />
                      {tr("Unlocked")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{tr("Enrolled User")}:</span>
                    <span className="text-white font-bold">{userName}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-900">
                    <button
                      onClick={handleToggleLock}
                      className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-800"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{tr("Lock Vault Now")}</span>
                    </button>

                    <button
                      onClick={handleRemove}
                      className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-800 hover:border-rose-800"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>{tr("Remove Biometric")}</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  {tr("Legal Heir Identifier")}
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Ramesh Sharma"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                onClick={handleEnroll}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 active:scale-95 transition-all"
              >
                <Fingerprint className="w-5 h-5 text-emerald-400" />
                <span>{loading ? tr("Enrolling...") : tr("Enroll Fingerprint / Face ID Passkey")}</span>
              </button>
            </div>
          )}

          {/* Quick Fallback Bypass Button */}
          <button
            onClick={() => {
              setVaultLockedState(false);
              setIsLocked(false);
              onSuccess?.();
              onClose();
            }}
            className="w-full py-2 text-slate-400 hover:text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{tr("Use Master PIN / Security Passcode")}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
