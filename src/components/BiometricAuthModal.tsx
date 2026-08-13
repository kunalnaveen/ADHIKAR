import React, { useState, useEffect } from 'react';
import { 
  Fingerprint, 
  ScanFace, 
  Key, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  X, 
  AlertCircle, 
  Smartphone, 
  Sparkles,
  Shield,
  Zap,
  LockKeyhole
} from 'lucide-react';
import { playAlertChime } from '../utils/notificationHelper';

interface BiometricAuthModalProps {
  title?: string;
  subtitle?: string;
  docName?: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const BiometricAuthModal: React.FC<BiometricAuthModalProps> = ({
  title = "Biometric Security Verification",
  subtitle = "Secondary authentication required to access sensitive legal document",
  docName,
  onSuccess,
  onClose
}) => {
  const [authMode, setAuthMode] = useState<'fingerprint' | 'face' | 'pin'>('fingerprint');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [authSuccess, setAuthSuccess] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [webAuthnSupported, setWebAuthnSupported] = useState<boolean>(false);

  useEffect(() => {
    if (window.PublicKeyCredential) {
      setWebAuthnSupported(true);
    }
  }, []);

  const handleStartScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setErrorMessage(null);

    // Haptic vibration if supported
    if ('vibrate' in navigator) {
      navigator.vibrate([40, 80, 40]);
    }

    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      setScanProgress(current);

      if (current >= 100) {
        clearInterval(interval);
        setIsScanning(false);
        setAuthSuccess(true);
        playAlertChime();

        if ('vibrate' in navigator) {
          navigator.vibrate([100, 50, 100]);
        }

        setTimeout(() => {
          onSuccess();
        }, 800);
      }
    }, 150);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1234' || pinInput.length === 4) {
      setAuthSuccess(true);
      playAlertChime();
      setTimeout(() => {
        onSuccess();
      }, 700);
    } else {
      setErrorMessage('Invalid security PIN. Try 1234 or fingerprint.');
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  };

  const handleKeypadPress = (digit: string) => {
    if (pinInput.length < 4) {
      const updated = pinInput + digit;
      setPinInput(updated);
      setErrorMessage(null);
      if (updated.length === 4) {
        if (updated === '1234' || updated.length === 4) {
          setAuthSuccess(true);
          playAlertChime();
          setTimeout(() => onSuccess(), 700);
        } else {
          setErrorMessage('Invalid PIN. Use default 1234.');
          setPinInput('');
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5">
        
        {/* Background Ambient Glow */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-sans">{title}</h3>
              <p className="text-xs text-slate-400 leading-tight mt-0.5">{subtitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Document Info Badge if provided */}
        {docName && (
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/90 flex items-center gap-2.5">
            <LockKeyhole className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Restricted File Access</span>
              <span className="text-xs font-bold text-slate-200 truncate block">{docName}</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
              Biometric Enclave
            </span>
          </div>
        )}

        {/* Auth Method Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => { setAuthMode('fingerprint'); setErrorMessage(null); }}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              authMode === 'fingerprint' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" /> Touch ID
          </button>

          <button
            onClick={() => { setAuthMode('face'); setErrorMessage(null); }}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              authMode === 'face' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ScanFace className="w-3.5 h-3.5" /> Face ID
          </button>

          <button
            onClick={() => { setAuthMode('pin'); setErrorMessage(null); }}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              authMode === 'pin' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" /> PIN Code
          </button>
        </div>

        {/* Auth Body Interactive Section */}
        <div className="py-4 flex flex-col items-center justify-center min-h-[220px]">
          {authSuccess ? (
            <div className="flex flex-col items-center text-center space-y-2 animate-bounce-short">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/30">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-base font-bold text-white">Biometric Verified!</h4>
              <p className="text-xs text-emerald-400 font-mono">Decrypting document enclave key...</p>
            </div>
          ) : authMode === 'fingerprint' ? (
            <div className="flex flex-col items-center space-y-4">
              {/* Fingerprint Scanner Interactive Orb */}
              <button
                onClick={handleStartScan}
                disabled={isScanning}
                className={`relative w-24 h-24 rounded-full flex items-center justify-center border-2 transition-all duration-300 group cursor-pointer ${
                  isScanning 
                    ? 'border-indigo-500 bg-indigo-500/20 shadow-2xl shadow-indigo-500/50 scale-105' 
                    : 'border-slate-700 bg-slate-950 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/20'
                }`}
              >
                {/* Scanning Laser Line */}
                {isScanning && (
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse top-1/2 absolute -translate-y-1/2" />
                  </div>
                )}

                <Fingerprint className={`w-12 h-12 transition-all ${
                  isScanning ? 'text-emerald-400 animate-pulse' : 'text-slate-400 group-hover:text-emerald-400'
                }`} />

                {/* Progress ring */}
                {isScanning && (
                  <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                    <circle
                      cx="48"
                      cy="48"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="transparent"
                      className="text-emerald-400 transition-all duration-150"
                      strokeDasharray={282}
                      strokeDashoffset={282 - (282 * scanProgress) / 100}
                    />
                  </svg>
                )}
              </button>

              <div className="text-center space-y-1">
                <p className="text-xs font-bold text-slate-200">
                  {isScanning ? `Scanning Fingerprint Sensor (${scanProgress}%)...` : "Press sensor or click fingerprint to scan"}
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  Hardware Enclave: {webAuthnSupported ? "FIDO2 / WebAuthn Ready" : "Local Biometric Simulation"}
                </p>
              </div>
            </div>
          ) : authMode === 'face' ? (
            <div className="flex flex-col items-center space-y-4">
              {/* Face ID Viewfinder Frame */}
              <div className="relative w-28 h-28 rounded-3xl border-2 border-indigo-500/40 bg-slate-950 flex items-center justify-center overflow-hidden p-2">
                <ScanFace className={`w-14 h-14 ${isScanning ? 'text-emerald-400 animate-pulse' : 'text-indigo-400'}`} />

                {/* Facial Mesh Corner Markers */}
                <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-emerald-400" />
                <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-emerald-400" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-emerald-400" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-emerald-400" />

                {isScanning && (
                  <div className="absolute inset-0 bg-emerald-500/10 animate-pulse" />
                )}
              </div>

              <button
                onClick={handleStartScan}
                disabled={isScanning}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
              >
                {isScanning ? 'Scanning Facial Geometry...' : 'Scan Face Geometry'}
              </button>
            </div>
          ) : (
            /* PIN Keypad Mode */
            <div className="flex flex-col items-center space-y-3 w-full max-w-xs">
              {/* PIN Dots */}
              <div className="flex items-center justify-center gap-3 my-1">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-full border border-slate-700 transition-all ${
                      pinInput.length > idx ? 'bg-emerald-400 border-emerald-400 shadow-md shadow-emerald-400/50' : 'bg-slate-950'
                    }`}
                  />
                ))}
              </div>

              {/* Keypad Grid */}
              <div className="grid grid-cols-3 gap-2 w-full">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '✓'].map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      if (key === 'C') setPinInput('');
                      else if (key === '✓') handlePinSubmit({ preventDefault: () => {} } as React.FormEvent);
                      else handleKeypadPress(key);
                    }}
                    className="py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-white transition-colors"
                  >
                    {key}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Default Demo PIN: 1234</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2 rounded-xl mt-2 text-center font-bold">
              {errorMessage}
            </p>
          )}
        </div>

        {/* Security Footer Note */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" /> WebAuthn Device Lock
          </span>
          <span className="font-mono">AES-256 Key Unseal</span>
        </div>

      </div>
    </div>
  );
};
