import { Language } from '../types';

const langMap: Record<Language, string> = {
  EN: 'en-IN',
  HI: 'hi-IN',
  TA: 'ta-IN',
  TE: 'te-IN',
  ML: 'ml-IN',
  KN: 'kn-IN',
  BN: 'bn-IN',
  MR: 'mr-IN',
  GU: 'gu-IN',
  PA: 'pa-IN',
  UR: 'ur-IN',
  OR: 'or-IN',
  AS: 'as-IN',
  BHO: 'hi-IN',
  MAI: 'hi-IN',
};

export function speakText(text: string, lang: Language = 'EN') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const cleanText = text.replace(/[*_#`~]/g, '');
  const utterance = new SpeechSynthesisUtterance(cleanText);

  utterance.lang = langMap[lang] || 'en-IN';
  utterance.rate = 0.95; // Slightly slower for clarity
  utterance.pitch = 1.0;

  window.speechSynthesis.speak(utterance);
}

export function stopSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function createSpeechRecognition(
  lang: Language = 'EN',
  onResult: (transcript: string) => void,
  onError?: (err: any) => void
) {
  if (typeof window === 'undefined') return null;

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    console.warn('SpeechRecognition API not available in browser.');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.lang = langMap[lang] || 'en-IN';

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onerror = (event: any) => {
    if (onError) onError(event.error);
  };

  return recognition;
}
