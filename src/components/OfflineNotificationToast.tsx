import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { t as translateText } from '../utils/translate';
import { 
  WifiOff, 
  Wifi, 
  HardDrive, 
  ShieldCheck, 
  X, 
  RefreshCw, 
  Volume2, 
  ArrowRight,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

interface OfflineNotificationToastProps {
  currentLanguage: Language;
  onOpenStorage?: () => void;
}

export const OfflineNotificationToast: React.FC<OfflineNotificationToastProps> = ({
  currentLanguage,
  onOpenStorage
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastType, setToastType] = useState<'offline' | 'online_restored'>('offline');
  const tr = (str: string) => translateText(str, currentLanguage);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setToastType('online_restored');
      setShowToast(true);
      // Auto dismiss restored banner after 6 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 6000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setToastType('offline');
      setShowToast(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check if opened offline
    if (!navigator.onLine) {
      setIsOnline(false);
      setToastType('offline');
      setShowToast(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const speakNotification = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!showToast) return null;

  return (
    <div className="fixed top-20 right-4 left-4 sm:left-auto sm:w-[440px] z-50 animate-bounce-in">
      {toastType === 'offline' ? (
        <div className="bg-slate-900/95 backdrop-blur-xl border-2 border-amber-500/50 rounded-2xl p-4 shadow-2xl text-slate-100 ring-4 ring-amber-500/10 space-y-3">
          
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                <WifiOff className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{tr("Offline Mode Active")}</span>
                </h4>
                <p className="text-[11px] text-slate-300 font-medium">
                  {tr("No internet connection detected.")}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowToast(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body description */}
          <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800/80 space-y-1.5 text-xs text-slate-200 leading-relaxed">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{tr("Local Vault Protection Active")}</span>
            </div>
            <p className="text-[11px] text-slate-300">
              {currentLanguage === 'HI'
                ? 'आप ऑफ़लाइन हैं। आपके सभी पारिवारिक आंकड़े और गणनाएं आपके फोन के सुरक्षित वॉल्ट में सेव हो रही हैं। इंटरनेट आते ही यह अपने आप क्लाउड पर सिंक हो जाएगा।'
                : 'All changes and calculations are securely cached in your offline vault. Data will automatically sync once connectivity is restored.'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              onClick={() => {
                const speechMsg = currentLanguage === 'HI'
                  ? 'आप ऑफ़लाइन हैं। आपका डाटा सुरक्षित है और इंटरनेट आने पर सिंक हो जाएगा।'
                  : 'You are offline. Your data is safely stored locally and will sync when connected.';
                speakNotification(speechMsg);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold flex items-center gap-1.5 transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>{tr("Listen")}</span>
            </button>

            {onOpenStorage && (
              <button
                onClick={() => {
                  onOpenStorage();
                  setShowToast(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-md transition-colors"
              >
                <span>{tr("View Vault")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Online Restored Toast */
        <div className="bg-slate-900/95 backdrop-blur-xl border-2 border-emerald-500/50 rounded-2xl p-4 shadow-2xl text-slate-100 ring-4 ring-emerald-500/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>{tr("Connection Restored")}</span>
              </h4>
              <p className="text-[11px] text-slate-300">
                {tr("Synchronizing offline records with cloud vault...")}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowToast(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
