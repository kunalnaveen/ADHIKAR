import React, { useState } from 'react';
import { AppSettings } from '../types';
import { 
  Sparkles, 
  ShieldCheck, 
  Bot, 
  AlertTriangle, 
  Scale, 
  FolderLock, 
  Mic, 
  Globe, 
  X, 
  CheckCircle2, 
  ArrowRight,
  Zap
} from 'lucide-react';

interface OnboardingModalProps {
  onClose: () => void;
  onNavigate: (view: string) => void;
  settings: AppSettings;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onClose, onNavigate, settings }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const tourSteps = [
    {
      title: "Welcome to ADHIKAR 2.0",
      subtitle: "AI-Powered Succession & Legal Inheritance Platform for India",
      icon: Sparkles,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      description: "ADHIKAR demystifies complex Indian inheritance laws (Hindu Succession Act, Muslim Personal Law, Indian Succession Act) with instant clarity, risk radar, and voice co-pilot.",
      badge: "HSA 2005 Compliant"
    },
    {
      title: "Dispute Risk Radar & Health Score",
      subtitle: "Predictive AI Legal Analytics Engine",
      icon: AlertTriangle,
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      description: "Analyze family complexity, ancestral land coparcenary rights, and missing Wills to predict legal dispute risk probability (0-100) with explainable reasoning.",
      badge: "Predictive AI"
    },
    {
      title: "\"What Happens If?\" Simulator",
      subtitle: "Interactive Real-Time Share Recalculator",
      icon: Scale,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
      description: "Simulate life events—births, marriages, remarriages, adoptions, and property sales—and watch statutory inheritance shares recalculate dynamically.",
      badge: "Digital Twin"
    },
    {
      title: "Biometric AES-256 Document Vault",
      subtitle: "Hardware Enclave Touch ID & Face ID Protection",
      icon: FolderLock,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      description: "Store Wills, Jamabandi revenue cards, and partition deeds with AES-256 client encryption guarded by biometric authentication and legal deadlines tracking.",
      badge: "Hardware Security"
    },
    {
      title: "Vernacular Voice AI Co-Pilot",
      subtitle: "15 Indian Languages with Natural Speech",
      icon: Mic,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      description: "Speak in Hindi, Tamil, Telugu, Bengali, Marathi, or Gujarati. Our legal co-pilot answers follow-ups with plain-language rules engine precision.",
      badge: "15 Native Languages"
    }
  ];

  const step = tourSteps[currentStep];
  const Icon = step.icon;

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fade-in">
      
      {/* Modal Content Box */}
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Controls */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              A
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
              ADHIKAR Tour ({currentStep + 1}/{tourSteps.length})
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Icon & Title */}
        <div className="relative z-10 space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Icon className="w-4 h-4" />
            <span>{step.badge}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            {step.title}
          </h2>

          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
            {step.subtitle}
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-2">
            {step.description}
          </p>
        </div>

        {/* Step Indicators Dots */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {tourSteps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentStep ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-800 hover:bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Action Buttons Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-400 hover:text-white transition-colors px-3 py-2"
          >
            Skip Intro
          </button>

          <button
            onClick={handleNext}
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-indigo-500/25 active:scale-95 transition-all"
          >
            <span>{currentStep === tourSteps.length - 1 ? 'Explore ADHIKAR' : 'Next Feature'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
