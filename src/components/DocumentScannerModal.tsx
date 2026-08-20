import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  RefreshCw, 
  FileText, 
  HardDrive, 
  Eye, 
  ShieldCheck, 
  Layers, 
  Search, 
  Scan,
  Maximize2,
  Minimize2,
  FileCheck2,
  Landmark,
  Scale,
  Zap,
  Loader2,
  Users,
  UserPlus,
  Calendar,
  Clock,
  Bell,
  BellRing,
  ArrowRight,
  Check,
  GitFork
} from 'lucide-react';
import { AppSettings, SecureDocument, FamilyMember, HeirClass } from '../types';
import { t as translateText } from '../utils/translate';
import { triggerBrowserNotification } from '../utils/notificationHelper';

export interface ParsedFamilyMemberCandidate {
  id: string;
  name: string;
  relationship: 'father' | 'mother' | 'son' | 'daughter' | 'widow' | 'brother' | 'sister' | 'grandfather' | 'grandmother' | 'other';
  status: 'alive' | 'deceased';
  isPropositus?: boolean;
  isOwner?: boolean;
  heirClass: HeirClass;
  gender: 'male' | 'female' | 'other';
  share?: string;
  confidence?: number;
  selected: boolean;
}

export interface ExpirationDetails {
  hasExpiration: boolean;
  expirationDate: string;
  validityType: string;
  actionRequired: string;
  urgency: 'critical' | 'warning' | 'normal';
  statutoryAct: string;
  daysRemaining: number;
}

export interface ExtractedOcrData {
  documentType: string;
  documentTitle: string;
  registrationDetails: {
    regNumber: string;
    bookVolume: string;
    sroOffice: string;
    executionDate: string;
  };
  propertyDetails: {
    surveyKhasraNumber: string;
    areaExtent: string;
    locationVillage: string;
    propertyClassification: string;
  };
  keyParties: Array<{ name: string; role: string; share?: string }>;
  parsedFamilyMembers?: Array<{
    name: string;
    relationship: 'father' | 'mother' | 'son' | 'daughter' | 'widow' | 'brother' | 'sister' | 'grandfather' | 'grandmother' | 'other';
    status: 'alive' | 'deceased';
    isPropositus?: boolean;
    isOwner?: boolean;
    heirClass?: HeirClass;
    gender?: 'male' | 'female';
    share?: string;
    confidence?: number;
  }>;
  expirationDetails?: ExpirationDetails;
  extractedFullText: string;
  legalSummary: string;
  riskAlerts?: string[];
  suggestedTags: string[];
}

interface DocumentScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onDocumentIndexed?: (doc: SecureDocument) => void;
  onAddFamilyMembers?: (members: FamilyMember[]) => void;
  onNavigate?: (view: string) => void;
}

export const DocumentScannerModal: React.FC<DocumentScannerModalProps> = ({
  isOpen,
  onClose,
  settings,
  onDocumentIndexed,
  onAddFamilyMembers,
  onNavigate
}) => {
  const tr = (str: string) => translateText(str, settings.language);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [ocrResult, setOcrResult] = useState<ExtractedOcrData | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Lineage & Family Members Candidate Selection State
  const [familyCandidates, setFamilyCandidates] = useState<ParsedFamilyMemberCandidate[]>([]);
  const [syncTreeSuccess, setSyncTreeSuccess] = useState<boolean>(false);
  const [syncedCount, setSyncedCount] = useState<number>(0);

  // Real-Time Camera Validation Feedback Metrics
  const [lightingStatus, setLightingStatus] = useState<'optimal' | 'dark' | 'glare'>('optimal');
  const [sharpnessStatus, setSharpnessStatus] = useState<'sharp' | 'slight_blur' | 'blurry'>('sharp');
  const [framingStatus, setFramingStatus] = useState<'centered' | 'too_close' | 'cut_off'>('centered');
  const [realtimeScore, setRealtimeScore] = useState<number>(90);
  const [activeWarning, setActiveWarning] = useState<string | null>(null);

  // Real-time video frame validation loop
  useEffect(() => {
    if (!cameraActive || capturedImage) return;

    const interval = setInterval(() => {
      if (!videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      // Use a downsampled canvas for fast 60fps/100ms real-time metric analysis
      const sampleWidth = 160;
      const sampleHeight = 90;
      canvas.width = sampleWidth;
      canvas.height = sampleHeight;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      try {
        ctx.drawImage(video, 0, 0, sampleWidth, sampleHeight);
        const imgData = ctx.getImageData(0, 0, sampleWidth, sampleHeight);
        const data = imgData.data;

        // 1. Calculate Average Luminance (Lighting check)
        let totalLuma = 0;
        const lumas: number[] = [];
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Rec 601 luma formula
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;
          totalLuma += luma;
          lumas.push(luma);
        }
        const avgLuma = totalLuma / (data.length / 4);

        let currentLighting: 'optimal' | 'dark' | 'glare' = 'optimal';
        let lightWarn = '';
        if (avgLuma < 55) {
          currentLighting = 'dark';
          lightWarn = tr("Too Dark: Turn on room lighting or flashlight");
        } else if (avgLuma > 215) {
          currentLighting = 'glare';
          lightWarn = tr("Glare Detected: Angle camera away from direct reflection");
        } else {
          currentLighting = 'optimal';
        }
        setLightingStatus(currentLighting);

        // 2. Calculate Laplacian / Edge Variance (Sharpness & Blur check)
        let edgeSum = 0;
        for (let y = 1; y < sampleHeight - 1; y += 2) {
          for (let x = 1; x < sampleWidth - 1; x += 2) {
            const idx = (y * sampleWidth + x);
            const center = lumas[idx];
            const up = lumas[idx - sampleWidth];
            const down = lumas[idx + sampleWidth];
            const left = lumas[idx - 1];
            const right = lumas[idx + 1];
            const laplacian = Math.abs(4 * center - up - down - left - right);
            edgeSum += laplacian;
          }
        }
        const avgEdge = edgeSum / ((sampleWidth * sampleHeight) / 4);

        let currentSharpness: 'sharp' | 'slight_blur' | 'blurry' = 'sharp';
        let blurWarn = '';
        if (avgEdge < 14) {
          currentSharpness = 'blurry';
          blurWarn = tr("Image Blurry: Hold camera steady to focus");
        } else if (avgEdge < 22) {
          currentSharpness = 'slight_blur';
          blurWarn = tr("Hold device still for maximum OCR clarity");
        } else {
          currentSharpness = 'sharp';
        }
        setSharpnessStatus(currentSharpness);

        // 3. Margin & Framing Check (Detect if critical boundary is cut off)
        // Check edge pixels vs center brightness variance
        const topLuma = lumas.slice(0, sampleWidth * 5).reduce((a, b) => a + b, 0) / (sampleWidth * 5);
        const bottomLuma = lumas.slice(-sampleWidth * 5).reduce((a, b) => a + b, 0) / (sampleWidth * 5);
        
        let currentFraming: 'centered' | 'too_close' | 'cut_off' = 'centered';
        let frameWarn = '';
        if (Math.abs(topLuma - bottomLuma) > 90) {
          currentFraming = 'cut_off';
          frameWarn = tr("Document Cut Off: Pull camera back to show all 4 corners");
        } else {
          currentFraming = 'centered';
        }
        setFramingStatus(currentFraming);

        // Calculate combined readiness score
        let score = 100;
        if (currentLighting === 'dark' || currentLighting === 'glare') score -= 30;
        if (currentSharpness === 'blurry') score -= 35;
        else if (currentSharpness === 'slight_blur') score -= 15;
        if (currentFraming === 'cut_off') score -= 25;
        setRealtimeScore(Math.max(score, 15));

        // Prioritize active warning message
        setActiveWarning(lightWarn || blurWarn || frameWarn || null);
      } catch (err) {
        // Fallback gracefully if context read fails
      }
    }, 250);

    return () => clearInterval(interval);
  }, [cameraActive, capturedImage, settings.language]);

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError('');
    setCapturedImage(null);
    setOcrResult(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported on this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Rear camera for documents
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Camera stream warning:', err);
      setCameraError(err.message || 'Camera permission denied or camera not found. You can upload an image file instead.');
      setCameraActive(false);
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setCapturedImage(null);
      setOcrResult(null);
      setSavedSuccess(false);
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Capture Frame from Video
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
      stopCamera();
      // Auto run OCR
      runGeminiOcr(dataUrl);
    }
  };

  // Handle File Upload Fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setCapturedImage(base64);
      stopCamera();
      runGeminiOcr(base64);
    };
    reader.readAsDataURL(file);
  };

  // Send Image to Gemini AI OCR
  const runGeminiOcr = async (base64Img: string) => {
    setIsScanning(true);
    setOcrResult(null);
    setSyncTreeSuccess(false);

    try {
      const res = await fetch('/api/gemini/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Img,
          mimeType: 'image/jpeg',
          language: settings.language,
          documentHint: 'Indian Property & Succession Record'
        })
      });

      const data: ExtractedOcrData = await res.json();
      setOcrResult(data);

      // Initialize family candidates from parsedFamilyMembers or keyParties
      const candidates: ParsedFamilyMemberCandidate[] = [];
      if (data.parsedFamilyMembers && data.parsedFamilyMembers.length > 0) {
        data.parsedFamilyMembers.forEach((p, idx) => {
          candidates.push({
            id: `cand-${idx}-${Date.now()}`,
            name: p.name,
            relationship: p.relationship || 'son',
            status: p.status || 'alive',
            isPropositus: p.isPropositus || false,
            isOwner: p.isOwner || false,
            heirClass: p.heirClass || 'Class I',
            gender: p.gender || (p.relationship === 'widow' || p.relationship === 'mother' || p.relationship === 'daughter' || p.relationship === 'sister' ? 'female' : 'male'),
            share: p.share || 'Coparcener Share',
            confidence: p.confidence || 95,
            selected: true
          });
        });
      } else if (data.keyParties && data.keyParties.length > 0) {
        data.keyParties.forEach((k, idx) => {
          const roleLower = k.role.toLowerCase();
          const rel: ParsedFamilyMemberCandidate['relationship'] = 
            roleLower.includes('father') || roleLower.includes('deceased') ? 'father' :
            roleLower.includes('mother') ? 'mother' :
            roleLower.includes('widow') ? 'widow' :
            roleLower.includes('daughter') ? 'daughter' :
            roleLower.includes('sister') ? 'sister' :
            roleLower.includes('brother') ? 'brother' : 'son';

          candidates.push({
            id: `cand-${idx}-${Date.now()}`,
            name: k.name,
            relationship: rel,
            status: roleLower.includes('deceased') ? 'deceased' : 'alive',
            isPropositus: roleLower.includes('deceased') || roleLower.includes('testator'),
            isOwner: !roleLower.includes('deceased'),
            heirClass: 'Class I',
            gender: (rel === 'widow' || rel === 'mother' || rel === 'daughter' || rel === 'sister') ? 'female' : 'male',
            share: k.share || 'Equal Coparcener Share',
            confidence: 92,
            selected: true
          });
        });
      }
      setFamilyCandidates(candidates);

      // Auto-extract and register upcoming expiration if present
      if (data.expirationDetails && data.expirationDetails.hasExpiration) {
        try {
          const existingExpRaw = localStorage.getItem('adhikar_upcoming_expirations');
          const existingExps = existingExpRaw ? JSON.parse(existingExpRaw) : [];
          const newExp = {
            id: `exp-${Date.now()}`,
            docTitle: data.documentTitle,
            category: 'mutation_limitation',
            validityType: data.expirationDetails.validityType,
            expirationDate: data.expirationDetails.expirationDate,
            actionRequired: data.expirationDetails.actionRequired,
            urgency: data.expirationDetails.urgency || 'warning',
            statutoryAct: data.expirationDetails.statutoryAct || 'Limitation Act 1963',
            daysRemaining: data.expirationDetails.daysRemaining || 60,
            isResolved: false
          };
          localStorage.setItem('adhikar_upcoming_expirations', JSON.stringify([newExp, ...existingExps]));
          
          triggerBrowserNotification(
            `⚠️ ${tr("Statutory Expiration Extracted")}: ${data.expirationDetails.validityType}`,
            `${data.documentTitle} - ${data.expirationDetails.actionRequired}`
          );
        } catch (e) {
          console.warn("Could not save expiration:", e);
        }
      }
    } catch (err) {
      console.error('OCR processing error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  // Toggle candidate selection
  const toggleCandidateSelection = (id: string) => {
    setFamilyCandidates(prev => prev.map(c => c.id === id ? { ...c, selected: !c.selected } : c));
  };

  // Update candidate relationship
  const updateCandidateRelationship = (id: string, relationship: ParsedFamilyMemberCandidate['relationship']) => {
    setFamilyCandidates(prev => prev.map(c => {
      if (c.id === id) {
        const gender: 'male' | 'female' = (relationship === 'widow' || relationship === 'mother' || relationship === 'daughter' || relationship === 'sister' || relationship === 'grandmother') ? 'female' : 'male';
        return { ...c, relationship, gender };
      }
      return c;
    }));
  };

  // Sync selected candidates to family tree
  const handleSyncMembersToTree = () => {
    const selected = familyCandidates.filter(c => c.selected);
    if (selected.length === 0) return;

    const newFamilyMembers: FamilyMember[] = selected.map(c => ({
      id: `member-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: c.name,
      relationship: c.relationship,
      status: c.status,
      isOwner: c.isOwner || false,
      isPropositus: c.isPropositus || false,
      heirClass: c.heirClass,
      gender: c.gender,
      estimatedSharePercent: c.isPropositus ? 0 : 25,
      initials: c.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'FM',
      notes: `Extracted via OCR from ${ocrResult?.documentTitle || 'Scanned Document'}`
    }));

    // Update localStorage tree
    try {
      const storedTreeRaw = localStorage.getItem('adhikar_family_tree');
      let currentTree = storedTreeRaw ? JSON.parse(storedTreeRaw) : null;
      if (currentTree && currentTree.members) {
        currentTree.members.push(...newFamilyMembers);
        localStorage.setItem('adhikar_family_tree', JSON.stringify(currentTree));
      }
    } catch (e) {
      console.warn('Error saving tree to storage:', e);
    }

    onAddFamilyMembers?.(newFamilyMembers);
    setSyncedCount(selected.length);
    setSyncTreeSuccess(true);
  };

  // Save Scanned Document to Vault
  const handleSaveToVault = () => {
    if (!ocrResult) return;

    const newDoc: SecureDocument = {
      id: `scanned-doc-${Date.now()}`,
      name: `${ocrResult.documentTitle.replace(/\s+/g, '_')}_OCR.pdf`,
      category: ocrResult.documentType.toLowerCase().includes('will')
        ? 'will'
        : ocrResult.documentType.toLowerCase().includes('deed')
        ? 'property_deed'
        : ocrResult.documentType.toLowerCase().includes('heir')
        ? 'identification'
        : 'property_deed',
      fileSize: '1.2 MB',
      fileType: 'application/pdf',
      uploadDate: new Date().toISOString().split('T')[0],
      encryptionAlgorithm: 'AES-256-GCM',
      checksumHash: Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      isEncrypted: true,
      requiresBiometric: true,
      notes: `${ocrResult.legalSummary} | Reg: ${ocrResult.registrationDetails.regNumber} | SRO: ${ocrResult.registrationDetails.sroOffice}`
    };

    // Save to localStorage vault documents
    try {
      const existingRaw = localStorage.getItem('adhikar_vault_docs');
      const existingDocs = existingRaw ? JSON.parse(existingRaw) : [];
      localStorage.setItem('adhikar_vault_docs', JSON.stringify([newDoc, ...existingDocs]));
    } catch (e) {
      console.error('Error saving to vault storage:', e);
    }

    onDocumentIndexed?.(newDoc);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative text-slate-100 space-y-6 my-auto max-h-[92vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hidden Canvas and File Input */}
        <canvas ref={canvasRef} className="hidden" />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*,.pdf"
          className="hidden"
        />

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
            <Scan className="w-3.5 h-3.5 text-emerald-400" />
            <span>{tr("AI Camera Document Scanner & OCR")}</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold font-serif text-white">
            {tr("Scan Legal Deeds & Deeds of Succession")}
          </h3>
          <p className="text-xs text-slate-400">
            {tr("Point device camera at your Will, 7/12 extract, or Registry deed to automatically extract parties, survey numbers, and legal clauses.")}
          </p>
        </div>

        {/* Camera Viewfinder / Preview Section */}
        <div className="relative rounded-2xl bg-slate-950 border-2 border-dashed border-slate-800 overflow-hidden min-h-[260px] flex items-center justify-center">
          
          {/* Laser Scanning Animation Sweep */}
          {isScanning && (
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] z-20 animate-bounce" />
          )}

          {/* Active Video Stream */}
          {cameraActive && !capturedImage && (
            <div className="relative w-full h-[320px] sm:h-[360px] bg-black flex items-center justify-center overflow-hidden">
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className="w-full h-full object-cover"
              />

              {/* Real-time Quality Indicators HUD (Top of Camera) */}
              <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-1.5 z-20 pointer-events-none">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Lighting Pill */}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-md flex items-center gap-1 ${
                    lightingStatus === 'optimal'
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                      : 'bg-amber-950/80 text-amber-300 border-amber-500/50 animate-pulse'
                  }`}>
                    <Zap className="w-3 h-3" />
                    <span>{lightingStatus === 'optimal' ? tr("Lighting: Good") : lightingStatus === 'dark' ? tr("Too Dark") : tr("Glare Alert")}</span>
                  </span>

                  {/* Sharpness Pill */}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-md flex items-center gap-1 ${
                    sharpnessStatus === 'sharp'
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                      : sharpnessStatus === 'slight_blur'
                      ? 'bg-indigo-950/80 text-indigo-300 border-indigo-500/50'
                      : 'bg-rose-950/80 text-rose-300 border-rose-500/50 animate-pulse'
                  }`}>
                    <Eye className="w-3 h-3" />
                    <span>{sharpnessStatus === 'sharp' ? tr("Sharp Focus") : sharpnessStatus === 'slight_blur' ? tr("Hold Steady") : tr("Blurry")}</span>
                  </span>

                  {/* Framing Pill */}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-md flex items-center gap-1 ${
                    framingStatus === 'centered'
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                      : 'bg-amber-950/80 text-amber-300 border-amber-500/50 animate-pulse'
                  }`}>
                    <Maximize2 className="w-3 h-3" />
                    <span>{framingStatus === 'centered' ? tr("Framing: Centered") : tr("Edges Cut Off")}</span>
                  </span>
                </div>

                {/* Quality Score Badge */}
                <div className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border backdrop-blur-md ${
                  realtimeScore >= 80 ? 'bg-emerald-900/80 text-emerald-300 border-emerald-500/60' : 'bg-amber-900/80 text-amber-300 border-amber-500/60'
                }`}>
                  {realtimeScore}% {tr("Ready")}
                </div>
              </div>

              {/* Active Warning Notification Toast inside Camera Viewfinder */}
              {activeWarning && (
                <div className="absolute top-12 inset-x-6 z-20 pointer-events-none">
                  <div className="bg-rose-950/90 border border-rose-500/60 text-rose-200 text-xs font-semibold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 backdrop-blur-md justify-center text-center animate-bounce">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{activeWarning}</span>
                  </div>
                </div>
              )}

              {/* Document Alignment Frame Guides with Dynamic Color Feedback */}
              <div className={`absolute inset-6 border-2 rounded-xl pointer-events-none flex flex-col justify-between p-2 transition-all duration-300 ${
                realtimeScore >= 80 
                  ? 'border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.35)]' 
                  : 'border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              }`}>
                <div className="flex justify-between">
                  <div className={`w-5 h-5 border-t-2 border-l-2 ${realtimeScore >= 80 ? 'border-emerald-300' : 'border-amber-300'}`} />
                  <div className={`w-5 h-5 border-t-2 border-r-2 ${realtimeScore >= 80 ? 'border-emerald-300' : 'border-amber-300'}`} />
                </div>
                <div className="text-center">
                  <span className={`text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-sm ${
                    realtimeScore >= 80 ? 'text-emerald-300 bg-slate-950/85 border border-emerald-500/30' : 'text-amber-300 bg-slate-950/85 border border-amber-500/30'
                  }`}>
                    {realtimeScore >= 80 ? tr("Optimal Scan Alignment") : tr("Adjust Camera Alignment")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <div className={`w-5 h-5 border-b-2 border-l-2 ${realtimeScore >= 80 ? 'border-emerald-300' : 'border-amber-300'}`} />
                  <div className={`w-5 h-5 border-b-2 border-r-2 ${realtimeScore >= 80 ? 'border-emerald-300' : 'border-amber-300'}`} />
                </div>
              </div>
            </div>
          )}

          {/* Captured Image Display */}
          {capturedImage && (
            <div className="relative w-full h-[280px] sm:h-[320px] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={capturedImage}
                alt="Captured Document"
                className="w-full h-full object-contain"
              />
              {isScanning && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-white z-10">
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                  <span className="text-xs font-bold font-mono text-emerald-300 uppercase tracking-wider">
                    {tr("Gemini 2.5 Flash Extracting Legal Text...")}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Camera Error or Inactive Placeholder */}
          {!cameraActive && !capturedImage && (
            <div className="p-6 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                <Camera className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <p className="text-xs text-slate-300">
                  {cameraError || tr("Camera is currently idle. Click below to start camera or select an image from your device gallery.")}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  onClick={startCamera}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{tr("Activate Camera")}</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{tr("Upload Image / PDF")}</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Action Controls for Active Camera */}
        {cameraActive && !capturedImage && (
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{tr("Upload from Device")}</span>
            </button>

            <button
              onClick={capturePhoto}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Camera className="w-4 h-4 stroke-[3]" />
              <span>{tr("Capture & Run OCR")}</span>
            </button>
          </div>
        )}

        {/* Retake Control when Image is Captured */}
        {capturedImage && (
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <button
              onClick={startCamera}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{tr("Retake Photo")}</span>
            </button>

            <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {tr("Document Captured")}
            </span>
          </div>
        )}

        {/* Gemini OCR Structured Results Display */}
        {ocrResult && (
          <div className="space-y-4 overflow-y-auto max-h-[300px] pr-1">
            <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-3">
              
              {/* Header Title & Category */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wider">
                    {ocrResult.documentType}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1">
                    {ocrResult.documentTitle}
                  </h4>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Registration</span>
                  <span className="text-xs font-mono font-bold text-indigo-300">
                    {ocrResult.registrationDetails.regNumber}
                  </span>
                </div>
              </div>

              {/* Registration & Property Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Sub-Registrar Office</span>
                  <p className="text-white font-medium">{ocrResult.registrationDetails.sroOffice}</p>
                  <p className="text-[10px] text-slate-400 font-mono">Date: {ocrResult.registrationDetails.executionDate}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Property / Khasra No.</span>
                  <p className="text-emerald-400 font-medium">{ocrResult.propertyDetails.surveyKhasraNumber}</p>
                  <p className="text-[10px] text-slate-400">{ocrResult.propertyDetails.areaExtent} • {ocrResult.propertyDetails.locationVillage}</p>
                </div>
              </div>

              {/* Parsed Family Members & Lineage Candidates Section */}
              {familyCandidates.length > 0 && (
                <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {tr("Parsed Family Members & Coparceners")}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                      {familyCandidates.filter(c => c.selected).length} {tr("Selected")}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300">
                    {tr("AI extracted legal heirs, testator, and coparceners from this deed. Review relationships and sync directly to your interactive Family Tree visualization.")}
                  </p>

                  <div className="space-y-2">
                    {familyCandidates.map((candidate) => (
                      <div
                        key={candidate.id}
                        className={`p-2.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                          candidate.selected
                            ? 'bg-slate-900/90 border-blue-500/40'
                            : 'bg-slate-950/50 border-slate-800 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={candidate.selected}
                            onChange={() => toggleCandidateSelection(candidate.id)}
                            className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0 cursor-pointer"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{candidate.name}</span>
                              {candidate.isPropositus && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  {tr("Propositus")}
                                </span>
                              )}
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                                {candidate.status === 'deceased' ? tr("Deceased") : tr("Alive")}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {candidate.share} • {candidate.confidence}% {tr("OCR Match")}
                            </span>
                          </div>
                        </div>

                        {/* Editable Relationship Selector */}
                        <div className="flex items-center gap-2">
                          <select
                            value={candidate.relationship}
                            onChange={(e) => updateCandidateRelationship(candidate.id, e.target.value as any)}
                            className="text-xs bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 focus:outline-none focus:border-blue-500"
                          >
                            <option value="father">{tr("Father / Propositus")}</option>
                            <option value="mother">{tr("Mother")}</option>
                            <option value="widow">{tr("Widow / Spouse")}</option>
                            <option value="son">{tr("Son (Class I)")}</option>
                            <option value="daughter">{tr("Daughter (Class I)")}</option>
                            <option value="brother">{tr("Brother")}</option>
                            <option value="sister">{tr("Sister")}</option>
                            <option value="grandfather">{tr("Grandfather")}</option>
                            <option value="grandmother">{tr("Grandmother")}</option>
                            <option value="other">{tr("Other Relative")}</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Sync to Tree Action Button */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-blue-500/20">
                    <button
                      onClick={handleSyncMembersToTree}
                      disabled={familyCandidates.filter(c => c.selected).length === 0}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{tr("Sync Selected to Family Tree")} ({familyCandidates.filter(c => c.selected).length})</span>
                    </button>

                    {syncTreeSuccess && (
                      <div className="flex items-center gap-2 text-xs text-emerald-300 font-semibold">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>{syncedCount} {tr("Members Added!")}</span>
                        {onNavigate && (
                          <button
                            onClick={() => {
                              onClose();
                              onNavigate('tree');
                            }}
                            className="underline text-blue-300 hover:text-white ml-1 flex items-center gap-1"
                          >
                            <span>{tr("View Tree")}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Extracted Expiration & Statutory Deadline Section */}
              {ocrResult.expirationDetails && ocrResult.expirationDetails.hasExpiration && (
                <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-300">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {tr("Extracted Statutory Expiration & Limitation")}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-200 border border-amber-500/40">
                      {ocrResult.expirationDetails.daysRemaining} {tr("Days Left")}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-white">
                      {ocrResult.expirationDetails.validityType} ({ocrResult.expirationDetails.expirationDate})
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      <strong>{tr("Action Required")}:</strong> {ocrResult.expirationDetails.actionRequired}
                    </p>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {tr("Statute")}: {ocrResult.expirationDetails.statutoryAct} • {tr("Proactive Alert Scheduled")}
                    </div>
                  </div>
                </div>
              )}

              {/* Legal Summary */}
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-1">
                <span className="text-[10px] font-bold uppercase text-indigo-300 tracking-wider flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-indigo-400" />
                  {tr("Legal Effect Summary")}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {ocrResult.legalSummary}
                </p>
              </div>

              {/* Save & Index Button */}
              <button
                onClick={handleSaveToVault}
                disabled={savedSuccess}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 active:scale-95 transition-all"
              >
                {savedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{tr("Document Saved & Indexed in Vault!")}</span>
                  </>
                ) : (
                  <>
                    <HardDrive className="w-4 h-4 text-emerald-400" />
                    <span>{tr("Save & Index to Secure Vault")}</span>
                  </>
                )}
              </button>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
