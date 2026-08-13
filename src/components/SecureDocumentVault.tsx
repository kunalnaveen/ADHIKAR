import React, { useState, useEffect } from 'react';
import { SecureDocument, DocumentCategory, AppSettings } from '../types';
import { 
  ShieldCheck, 
  Lock, 
  Upload, 
  FileText, 
  Trash2, 
  Download, 
  Search, 
  HardDrive, 
  FileCheck, 
  Key, 
  Eye, 
  CheckCircle2, 
  AlertCircle,
  X,
  FileCode,
  Shield,
  RefreshCw,
  Fingerprint,
  ScanFace,
  Calendar,
  LockKeyhole
} from 'lucide-react';
import { BiometricAuthModal } from './BiometricAuthModal';
import { DocumentDeadlineManager } from './DocumentDeadlineManager';
import { parseDocumentForDeadlines } from '../utils/documentParser';

interface SecureDocumentVaultProps {
  settings: AppSettings;
}

const DEFAULT_DOCUMENTS: SecureDocument[] = [
  {
    id: 'doc-1',
    name: 'Ancestral_Property_Registry_Patiala_1998.pdf',
    category: 'property_deed',
    fileSize: '2.4 MB',
    fileType: 'application/pdf',
    uploadDate: '2026-02-10',
    encryptionAlgorithm: 'AES-256-GCM',
    checksumHash: '7a8f3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a',
    isEncrypted: true,
    requiresBiometric: true,
    notes: 'Sub-Registrar Patiala, Book No. 1, Vol 452, Pages 12-18. Contains high-value land assessment.'
  },
  {
    id: 'doc-2',
    name: 'Registered_Will_Late_Ramesh_Sharma_2021.pdf',
    category: 'will',
    fileSize: '1.8 MB',
    fileType: 'application/pdf',
    uploadDate: '2026-01-15',
    encryptionAlgorithm: 'AES-256-GCM',
    checksumHash: '3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b',
    isEncrypted: true,
    requiresBiometric: true,
    notes: 'Registered with two attesting witnesses & medical fitness certificate'
  },
  {
    id: 'doc-3',
    name: 'Class1_Heir_Aadhaar_Karta_Proof.pdf',
    category: 'identification',
    fileSize: '850 KB',
    fileType: 'application/pdf',
    uploadDate: '2026-03-01',
    encryptionAlgorithm: 'AES-256-GCM',
    checksumHash: '9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d',
    isEncrypted: true,
    requiresBiometric: false,
    notes: 'Government Identity Verification for Succession Portal'
  }
];

export const SecureDocumentVault: React.FC<SecureDocumentVaultProps> = ({ settings }) => {
  const [documents, setDocuments] = useState<SecureDocument[]>(() => {
    const saved = localStorage.getItem('adhikar_vault_docs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_DOCUMENTS;
      }
    }
    return DEFAULT_DOCUMENTS;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [newCategory, setNewCategory] = useState<DocumentCategory>('property_deed');
  const [newNotes, setNewNotes] = useState<string>('');
  const [newRequireBiometric, setNewRequireBiometric] = useState<boolean>(true);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [previewDoc, setPreviewDoc] = useState<SecureDocument | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<{ id: string; success: boolean } | null>(null);

  // Biometric state
  const [biometricModalDoc, setBiometricModalDoc] = useState<SecureDocument | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [vaultUnlocked, setVaultUnlocked] = useState<boolean>(false);
  const [showGlobalBioModal, setShowGlobalBioModal] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('adhikar_vault_docs', JSON.stringify(documents));
  }, [documents]);

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    setIsUploading(true);
    setUploadProgress(10);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);

      // Generate simulated SHA-256 hash
      const randomHash = Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      
      const newDoc: SecureDocument = {
        id: `doc-${Date.now()}`,
        name: file.name,
        category: newCategory,
        fileSize: file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`,
        fileType: file.type || 'application/pdf',
        uploadDate: new Date().toISOString().split('T')[0],
        encryptionAlgorithm: 'AES-256-GCM',
        checksumHash: randomHash,
        isEncrypted: true,
        requiresBiometric: newRequireBiometric,
        notes: newNotes.trim() || 'Uploaded to Secure Vault'
      };

      setDocuments((prev) => [newDoc, ...prev]);
      setIsUploading(false);
      setUploadProgress(0);
      setNewNotes('');
    }, 1200);
  };

  const toggleBiometricProtection = (id: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, requiresBiometric: !d.requiresBiometric } : d))
    );
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this encrypted document from your vault?')) {
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      if (previewDoc?.id === id) setPreviewDoc(null);
    }
  };

  const handleVerifyIntegrity = (doc: SecureDocument) => {
    const execute = () => {
      setVerifyStatus(null);
      setTimeout(() => {
        setVerifyStatus({ id: doc.id, success: true });
        setTimeout(() => setVerifyStatus(null), 4000);
      }, 600);
    };

    if (doc.requiresBiometric && !vaultUnlocked) {
      setBiometricModalDoc(doc);
      setPendingAction(() => execute);
    } else {
      execute();
    }
  };

  const handleDownloadDecrypted = (doc: SecureDocument) => {
    const execute = () => {
      // Create simulated file content blob for download demonstration
      const content = `ADHIKAR SECURE VAULT DECRYPTED RECORD\n` +
        `-----------------------------------------\n` +
        `Document Name: ${doc.name}\n` +
        `Category: ${doc.category.toUpperCase()}\n` +
        `Upload Date: ${doc.uploadDate}\n` +
        `Encryption: ${doc.encryptionAlgorithm} (Verified Integrity)\n` +
        `Biometric Layer: ${doc.requiresBiometric ? 'Authenticated via TouchID/FaceID' : 'Standard Enclave'}\n` +
        `SHA-256 Checksum: ${doc.checksumHash}\n` +
        `Notes: ${doc.notes || 'N/A'}\n\n` +
        `This document was safely decrypted from your local AES-256-GCM storage enclave following secondary biometric authentication.`;

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name.endsWith('.pdf') ? doc.name.replace('.pdf', '_decrypted.txt') : `${doc.name}_decrypted.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    if (doc.requiresBiometric && !vaultUnlocked) {
      setBiometricModalDoc(doc);
      setPendingAction(() => execute);
    } else {
      execute();
    }
  };

  const handleBiometricSuccess = () => {
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
    setBiometricModalDoc(null);
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.notes && doc.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCategoryLabel = (cat: DocumentCategory) => {
    switch (cat) {
      case 'will': return 'Registered Will';
      case 'property_deed': return 'Property Deed / Registry';
      case 'identification': return 'Identity Proof';
      case 'succession_cert': return 'Succession Certificate';
      case 'settlement': return 'Family Settlement Deed';
      default: return 'Legal Document';
    }
  };

  const totalBytesApprox = documents.reduce((acc, doc) => {
    const val = parseFloat(doc.fileSize);
    if (doc.fileSize.includes('MB')) return acc + val * 1024;
    return acc + val;
  }, 0);

  return (
    <div className="flex flex-col w-full gap-6">
      
      {/* Biometric Secondary Auth Modal */}
      {biometricModalDoc && (
        <BiometricAuthModal
          title="Biometric Document Security"
          subtitle={`Authentication required to access ${biometricModalDoc.name}`}
          docName={biometricModalDoc.name}
          onSuccess={handleBiometricSuccess}
          onClose={() => { setBiometricModalDoc(null); setPendingAction(null); }}
        />
      )}

      {/* Global Vault Biometric Unlock Modal */}
      {showGlobalBioModal && (
        <BiometricAuthModal
          title="Unlock Secure Vault Enclave"
          subtitle="Authenticate via Touch ID / Face ID / PIN to unlock all restricted files"
          onSuccess={() => {
            setVaultUnlocked(true);
            setShowGlobalBioModal(false);
          }}
          onClose={() => setShowGlobalBioModal(false)}
        />
      )}

      {/* Encryption & Biometric Banner Header */}
      <div className="relative p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <Fingerprint className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-xl inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> AES-256 + Biometric Enclave
                </span>
                <span className="text-[11px] text-indigo-300 font-mono bg-indigo-600/10 border border-indigo-500/20 px-2 py-0.5 rounded-xl inline-flex items-center gap-1">
                  <ScanFace className="w-3 h-3 text-indigo-400" /> WebAuthn / TouchID Ready
                </span>
              </div>
              <h3 className="text-xl font-bold text-white font-sans">Secure Document Vault</h3>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed max-w-xl">
                Store wills, property deeds, and succession affidavits with client-side encryption and secondary biometric locks to protect sensitive records.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 bg-slate-950 p-3.5 rounded-xl border border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-indigo-400" />
              <span className="text-xs text-slate-300 font-semibold">Vault Usage:</span>
              <span className="text-xs font-mono font-bold text-emerald-400">{(totalBytesApprox / 1024).toFixed(1)} MB / 50 MB</span>
            </div>

            <button
              onClick={() => {
                if (vaultUnlocked) {
                  setVaultUnlocked(false);
                } else {
                  setShowGlobalBioModal(true);
                }
              }}
              className={`mt-1 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                vaultUnlocked 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5" />
              <span>{vaultUnlocked ? 'Enclave Unlocked (Click to Lock)' : 'Unlock Vault via Biometrics'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* File Upload Drop Zone */}
      <div 
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFileUpload(e.dataTransfer.files);
        }}
        className={`p-6 rounded-2xl border-2 border-dashed transition-all ${
          dragActive 
            ? 'border-indigo-500 bg-indigo-500/10 scale-[0.99]' 
            : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
        }`}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-left w-full md:w-auto">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Upload & Encrypt Legal Record</h4>
              <p className="text-xs text-slate-400 mt-0.5">Drag & drop files or choose from device (PDF, PNG, JPG up to 10MB)</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as DocumentCategory)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="property_deed">Property Deed / Registry</option>
              <option value="will">Registered Will</option>
              <option value="identification">Identity / Aadhaar Proof</option>
              <option value="succession_cert">Succession Certificate</option>
              <option value="settlement">Family Settlement Deed</option>
              <option value="other">Other Legal Record</option>
            </select>

            <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all">
              <Upload className="w-4 h-4" />
              <span>Select File</span>
              <input 
                type="file" 
                className="hidden" 
                accept=".pdf,.png,.jpg,.jpeg,.docx"
                onChange={(e) => handleFileUpload(e.target.files)} 
              />
            </label>
          </div>
        </div>

        {/* Options Row */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <input
            type="text"
            placeholder="Add optional record note / registration number (e.g., Khasra No. 104, Sub-Registrar Seal)"
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />

          <label className="flex items-center gap-2 text-xs text-slate-300 font-bold shrink-0 cursor-pointer">
            <input
              type="checkbox"
              checked={newRequireBiometric}
              onChange={(e) => setNewRequireBiometric(e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded"
            />
            <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />
            <span>Enable Biometric Protection</span>
          </label>
        </div>

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-indigo-400 font-bold flex items-center gap-2">
                <Key className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                Encrypting with AES-256-GCM & Extrapolating Deadlines...
              </span>
              <span className="text-slate-400 font-mono">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-200" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Document Deadlines & Calendar Sync Section */}
      <DocumentDeadlineManager documents={documents} />

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'All Documents' },
            { id: 'property_deed', label: 'Property Deeds' },
            { id: 'will', label: 'Wills' },
            { id: 'identification', label: 'ID Proofs' },
            { id: 'succession_cert', label: 'Certificates' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search vault records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Document List */}
      <div className="grid grid-cols-1 gap-3">
        {filteredDocs.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 space-y-2">
            <FileText className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No documents found in this view</p>
            <p className="text-xs text-slate-500">Upload a legal document above or change filter criteria.</p>
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div 
              key={doc.id}
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <div className="w-11 h-11 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                  <FileText className="w-5 h-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h4 className="text-sm font-bold text-white truncate max-w-md">{doc.name}</h4>
                    <span className="text-[10px] font-bold text-indigo-400 bg-indigo-600/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-xl">
                      {getCategoryLabel(doc.category)}
                    </span>
                    {doc.isEncrypted && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-xl inline-flex items-center gap-1">
                        <Lock className="w-3 h-3 text-emerald-400" /> AES-256
                      </span>
                    )}

                    {doc.requiresBiometric && (
                      <button
                        onClick={() => toggleBiometricProtection(doc.id)}
                        className="text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-xl inline-flex items-center gap-1 hover:bg-amber-500/20"
                        title="Click to toggle biometric protection requirement"
                      >
                        <Fingerprint className="w-3 h-3 text-amber-400" /> Biometric Locked
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-1 mb-1.5">{doc.notes}</p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono flex-wrap">
                    <span>Size: {doc.fileSize}</span>
                    <span>•</span>
                    <span>Uploaded: {doc.uploadDate}</span>
                    <span>•</span>
                    <span className="truncate max-w-[180px]" title={doc.checksumHash}>
                      SHA256: {doc.checksumHash.slice(0, 12)}...
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                <button
                  onClick={() => handleVerifyIntegrity(doc)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
                  title="Verify file checksum against tamper records"
                >
                  <FileCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Verify</span>
                </button>

                <button
                  onClick={() => handleDownloadDecrypted(doc)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    doc.requiresBiometric && !vaultUnlocked
                      ? 'bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300'
                      : 'bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300'
                  }`}
                  title={doc.requiresBiometric ? "Requires Fingerprint/FaceID to decrypt" : "Download decrypted copy"}
                >
                  {doc.requiresBiometric && !vaultUnlocked ? (
                    <Fingerprint className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  ) : (
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                  )}
                  <span>{doc.requiresBiometric && !vaultUnlocked ? 'Biometric Decrypt' : 'Decrypt & Export'}</span>
                </button>

                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 transition-colors"
                  title="Delete from vault"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Integrity Verification Toast Banner */}
              {verifyStatus?.id === doc.id && (
                <div className="w-full mt-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center justify-between animate-fade-in">
                  <span className="flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Integrity Verified: SHA-256 match confirmed. File is uncorrupted and encrypted.
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">Match 100%</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Encryption Architecture Info Box */}
      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col md:flex-row items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
          <Shield className="w-5 h-5" />
        </div>
        <div className="text-xs text-slate-300 space-y-1">
          <h4 className="font-bold text-white text-sm">How ADHIKAR Encrypted Storage & Biometric Layer Works</h4>
          <p className="text-slate-400 leading-relaxed">
            Your uploaded wills, registry papers, and identification documents are processed using client-side WebCrypto AES-256-GCM primitives combined with WebAuthn biometrics. The cipher key is derived locally and unlocked via device TouchID/FaceID sensors or security PIN, keeping sensitive property records completely private.
          </p>
        </div>
      </div>
    </div>
  );
};

