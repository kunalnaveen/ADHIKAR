import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Square, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  Upload, 
  X, 
  Loader2, 
  Volume2, 
  FileText,
  Tag,
  ListCheck
} from 'lucide-react';
import { AppSettings } from '../types';
import { t as translateText } from '../utils/translate';

interface LiveAudioTranscriberModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
}

interface AudioTranscriptionResult {
  transcript: string;
  languageDetected: string;
  speakerCount: number;
  legalTermsDetected: string[];
  keyTakeaways: string[];
}

export const LiveAudioTranscriberModal: React.FC<LiveAudioTranscriberModalProps> = ({
  isOpen,
  onClose,
  settings
}) => {
  const tr = (str: string) => translateText(str, settings.language);

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [liveStreamText, setLiveStreamText] = useState<string>('');
  const [result, setResult] = useState<AudioTranscriptionResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const speechRecognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Start Live Audio Recording & Speech Recognition
  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      setLiveStreamText('');
      setResult(null);
      setRecordingSeconds(0);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudioBlob(audioBlob);
        setAudioUrl(URL.createObjectURL(audioBlob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(250);
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);

      // Setup browser SpeechRecognition for live instant streaming text feedback
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = settings.language === 'HI' ? 'hi-IN' : settings.language === 'TA' ? 'ta-IN' : 'en-IN';

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            interimTranscript += event.results[i][0].transcript;
          }
          setLiveStreamText(interimTranscript);
        };

        recognition.start();
        speechRecognitionRef.current = recognition;
      }
    } catch (err: any) {
      console.warn('Microphone stream error:', err);
    }
  };

  // Stop Live Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleTranscribeWithGemini = async () => {
    setIsTranscribing(true);
    try {
      let audioBase64 = '';
      if (recordedAudioBlob) {
        const reader = new FileReader();
        audioBase64 = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(recordedAudioBlob);
        });
      }

      const res = await fetch('/api/gemini/transcribe-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: audioBase64 || '',
          language: settings.language
        })
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Audio transcription error:', err);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRecordedAudioBlob(file);
    setAudioUrl(URL.createObjectURL(file));
  };

  const handleCopyTranscript = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 md:p-8 shadow-2xl relative text-slate-100 space-y-6 my-auto max-h-[92vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={() => {
            stopRecording();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-bold uppercase tracking-wider">
            <Mic className="w-3.5 h-3.5 text-blue-400" />
            <span>{tr("Transcribe Audio")}</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold font-serif text-white">
            {tr("Live Legal Audio Transcription & Dictation")}
          </h3>
          <p className="text-xs text-slate-400">
            {tr("Record live oral testimony, legal heir statements, or family settlement meetings to generate formatted transcripts with legal terminology recognition.")}
          </p>
        </div>

        {/* Live Microphone Recording Console */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Record / Stop Button & Timer */}
            <div className="flex items-center gap-3">
              {isRecording ? (
                <button
                  onClick={stopRecording}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-rose-500/20 animate-pulse transition-all"
                >
                  <Square className="w-4 h-4" />
                  <span>{tr("Stop Recording")}</span>
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                >
                  <Mic className="w-4 h-4" />
                  <span>{tr("Start Live Audio Feed")}</span>
                </button>
              )}

              {isRecording && (
                <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span>{formatSeconds(recordingSeconds)}</span>
                </div>
              )}
            </div>

            {/* Audio File Upload Alternative */}
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="audio/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{tr("Upload Audio File")}</span>
              </button>
            </div>
          </div>

          {/* Live Streaming Words Visualizer */}
          {isRecording && (
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-blue-200 font-mono italic">
              <span className="text-slate-500 font-bold uppercase text-[10px] block mb-1 not-italic">
                {tr("Live Speech Stream")}:
              </span>
              {liveStreamText || tr("Listening to live audio feed...")}
            </div>
          )}

          {/* Audio Player & Trigger Transcription */}
          {audioUrl && !isRecording && (
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <audio src={audioUrl} controls className="w-full h-10 rounded-lg" />
              <div className="flex justify-end">
                <button
                  onClick={handleTranscribeWithGemini}
                  disabled={isTranscribing}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {isTranscribing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{tr("Transcribing Audio with Gemini...")}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{tr("Generate Full Legal Transcript")}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Console */}
        {result && (
          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            
            {/* Metadata Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <span className="font-mono text-blue-400">
                  {tr("Detected")}: <strong className="text-white">{result.languageDetected}</strong>
                </span>
                <span className="font-mono text-emerald-400">
                  {tr("Speakers")}: <strong className="text-white">{result.speakerCount}</strong>
                </span>
              </div>
              <button
                onClick={handleCopyTranscript}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? tr("Copied!") : tr("Copy Text")}</span>
              </button>
            </div>

            {/* Verbatim Transcript */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-300 uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5" />
                <span>{tr("Verbatim Transcribed Statement")}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line font-serif">
                {result.transcript}
              </p>
            </div>

            {/* Legal Terms Detected */}
            {result.legalTermsDetected?.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Tag className="w-3 h-3 text-blue-400" />
                  {tr("Legal Terminology Recognized")}:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.legalTermsDetected.map((term, i) => (
                    <span key={i} className="px-2.5 py-0.5 rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-300 text-[11px] font-semibold">
                      {term}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Key Takeaways */}
            {result.keyTakeaways?.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  <ListCheck className="w-3.5 h-3.5" />
                  <span>{tr("Key Legal Takeaways & Action Items")}</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {result.keyTakeaways.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
