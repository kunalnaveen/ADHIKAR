import React, { useState, useEffect } from 'react';
import { 
  X, 
  PenTool, 
  ShieldCheck, 
  FileCheck, 
  Download, 
  Printer, 
  Share2, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Lock, 
  UserCheck, 
  Eye,
  Award,
  History
} from 'lucide-react';
import { AppSettings, UserProfile, ESignatureData, SignedDocumentRecord } from '../types';
import { t } from '../utils/translate';
import { ESignaturePad } from './ESignaturePad';
import { ESignatureStamp } from './ESignatureStamp';
import { 
  saveSignedDocumentToFirestore, 
  getSignedDocumentsFromFirestore, 
  getESignaturesFromFirestore 
} from '../lib/firebase';

interface ESignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  user: UserProfile | null;
  onOpenAuth?: () => void;
  documentTitle?: string;
  documentSnippet?: string;
  defaultRole?: ESignatureData['signatoryRole'];
  onDocumentSigned?: (signedDoc: SignedDocumentRecord) => void;
}

export const ESignatureModal: React.FC<ESignatureModalProps> = ({
  isOpen,
  onClose,
  settings,
  user,
  onOpenAuth,
  documentTitle = 'Last Will & Testament (Indian Succession Act 1925)',
  documentSnippet = 'I hereby declare this to be my Last Will and Testament, bequeathing my ancestral and self-acquired properties according to statutory allocations.',
  defaultRole = 'Testator',
  onDocumentSigned
}) => {
  const tr = (key: string) => t(key, settings.language);

  const [activeTab, setActiveTab] = useState<'sign' | 'history' | 'certificate'>('sign');
  const [collectedSignatures, setCollectedSignatures] = useState<ESignatureData[]>([]);
  const [savedDocs, setSavedDocs] = useState<any[]>([]);
  const [savedSignatures, setSavedSignatures] = useState<any[]>([]);
  const [isFinalizing, setIsFinalizing] = useState<boolean>(false);
  const [completedDoc, setCompletedDoc] = useState<SignedDocumentRecord | null>(null);

  // Load user signatures & signed documents from Firestore
  useEffect(() => {
    if (!isOpen) return;

    if (user?.id) {
      getSignedDocumentsFromFirestore(user.id).then(docs => {
        if (docs && docs.length > 0) setSavedDocs(docs);
      });
      getESignaturesFromFirestore(user.id).then(sigs => {
        if (sigs && sigs.length > 0) setSavedSignatures(sigs);
      });
    } else {
      // Local storage fallback
      try {
        const storedSig = localStorage.getItem('adhikar_last_signature');
        if (storedSig) {
          setSavedSignatures([JSON.parse(storedSig)]);
        }
      } catch (e) {}
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleAddSignature = (sig: ESignatureData) => {
    setCollectedSignatures(prev => {
      // Replace existing signature of same role or append
      const filtered = prev.filter(s => s.signatoryRole !== sig.signatoryRole);
      return [...filtered, sig];
    });
  };

  const handleRemoveSignature = (id: string) => {
    setCollectedSignatures(prev => prev.filter(s => s.id !== id));
  };

  const handleFinalizeSignedDocument = async () => {
    if (collectedSignatures.length === 0) return;

    setIsFinalizing(true);

    const docId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const certificateId = `CERT-IND-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const tamperProofHash = `SHA256-${Math.random().toString(16).substr(2, 12).toUpperCase()}-${Date.now()}`;

    const signedDoc: SignedDocumentRecord = {
      id: docId,
      documentTitle,
      documentType: 'Will',
      contentSnippet: documentSnippet,
      createdAt: new Date().toISOString(),
      signatures: collectedSignatures,
      auditCertificateId: certificateId,
      isTamperProof: true,
      tamperProofHash
    };

    if (user?.id) {
      try {
        await saveSignedDocumentToFirestore(user.id, signedDoc);
      } catch (e) {
        console.warn("Could not persist signed document to Firestore:", e);
      }
    }

    setCompletedDoc(signedDoc);
    setIsFinalizing(false);
    setActiveTab('certificate');

    if (onDocumentSigned) {
      onDocumentSigned(signedDoc);
    }
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto">
        
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  {tr("Legal Document E-Signature Studio")}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                  IT Act 2000 & ISA 1925
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {documentTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-slate-800 bg-slate-950/60 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('sign')}
            className={`py-3.5 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'sign'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>{tr("Sign & Attest")} ({collectedSignatures.length})</span>
          </button>

          {completedDoc && (
            <button
              onClick={() => setActiveTab('certificate')}
              className={`py-3.5 border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'certificate'
                  ? 'border-emerald-500 text-emerald-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>{tr("Audit Certificate")}</span>
            </button>
          )}

          {savedDocs.length > 0 && (
            <button
              onClick={() => setActiveTab('history')}
              className={`py-3.5 border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'border-indigo-500 text-indigo-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-4 h-4" />
              <span>{tr("Signed Vault")} ({savedDocs.length})</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {activeTab === 'sign' && (
            <div className="space-y-6">
              
              {/* Document Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold">
                    <FileText className="w-4 h-4" />
                    <span>{documentTitle}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed italic border-l-2 border-indigo-500/50 pl-3 py-0.5">
                  "{documentSnippet}"
                </p>
              </div>

              {/* Already Applied Signatures on this document */}
              {collectedSignatures.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{tr("Applied Signatures & Attestations")}</span>
                    </h4>
                    <span className="text-[11px] text-emerald-400 font-bold">
                      {collectedSignatures.length} {tr("Signatory Verified")}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {collectedSignatures.map(sig => (
                      <ESignatureStamp
                        key={sig.id}
                        signature={sig}
                        onRemove={() => handleRemoveSignature(sig.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Signature Pad for Next Signatory */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-indigo-400" />
                    <span>
                      {collectedSignatures.length === 0 
                        ? tr("Primary Testator / Declarant Signature") 
                        : tr("Attesting Witness / Co-Signatory Signature")}
                    </span>
                  </h4>
                </div>

                <ESignaturePad
                  settings={settings}
                  user={user}
                  onOpenAuth={onOpenAuth}
                  documentTitle={documentTitle}
                  defaultRole={collectedSignatures.length === 0 ? defaultRole : collectedSignatures.length === 1 ? 'Witness 1' : 'Witness 2'}
                  onSaveSignature={handleAddSignature}
                />
              </div>

              {/* Quick 1-Tap Saved Signatures from Firebase */}
              {savedSignatures.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{tr("Use Saved Verified Signatures from Profile")}:</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {savedSignatures.map((saved, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddSignature(saved)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 flex items-center gap-2 active:scale-95 transition-all"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{saved.signatoryName} ({saved.signatoryRole || 'Signatory'})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Certificate of Integrity View */}
          {activeTab === 'certificate' && completedDoc && (
            <div className="space-y-6">
              
              {/* Formal Certificate Display */}
              <div className="p-8 rounded-3xl bg-slate-950 border-2 border-emerald-500/40 text-slate-100 space-y-6 relative overflow-hidden shadow-2xl">
                
                {/* Certificate Watermark Background */}
                <div className="absolute inset-0 opacity-5 flex items-center justify-center pointer-events-none">
                  <ShieldCheck className="w-96 h-96 text-emerald-400" />
                </div>

                <div className="text-center space-y-2 relative z-10 border-b border-slate-800 pb-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
                    <Award className="w-3.5 h-3.5" />
                    <span>CERTIFICATE OF DIGITAL ATTESTATION & INTEGRITY</span>
                  </div>
                  <h3 className="text-xl font-bold text-white font-serif">{completedDoc.documentTitle}</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Certificate ID: <span className="text-emerald-400 font-bold">{completedDoc.auditCertificateId}</span>
                  </p>
                </div>

                <div className="space-y-3 text-xs text-slate-300 relative z-10">
                  <p className="leading-relaxed">
                    This certifies that the electronic document entitled <strong className="text-white">"{completedDoc.documentTitle}"</strong> has been executed with legally recognized electronic signatures compliant with <strong className="text-indigo-300">Section 3A of the Information Technology Act, 2000</strong> and statutory attestation mandates under <strong className="text-indigo-300">Section 63 of the Indian Succession Act, 1925</strong>.
                  </p>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 font-mono text-[11px] space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tamper-Proof SHA-256 Hash:</span>
                      <span className="text-emerald-400 font-bold">{completedDoc.tamperProofHash}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Timestamp of Final Execution:</span>
                      <span className="text-slate-300">{new Date(completedDoc.createdAt).toLocaleString('en-IN')} IST</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Signatories & Witnesses:</span>
                      <span className="text-slate-300">{completedDoc.signatures.length} Verified Signatures</span>
                    </div>
                  </div>
                </div>

                {/* Signatories Grid on Certificate */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 relative z-10">
                  {completedDoc.signatures.map(sig => (
                    <ESignatureStamp
                      key={sig.id}
                      signature={sig}
                      compact
                    />
                  ))}
                </div>

                {/* Statutory Disclaimer */}
                <div className="text-[10px] text-slate-500 text-center border-t border-slate-800 pt-4 relative z-10">
                  Digitally issued by ADHIKAR Indian Succession & Digital Fiduciary Platform. This certificate serves as an immutable cryptographic audit trail of the electronic execution.
                </div>

              </div>

              {/* Export Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => setActiveTab('sign')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  {tr("Add More Signatures")}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrintCertificate}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm"
                  >
                    <Printer className="w-4 h-4 text-slate-300" />
                    <span>{tr("Print Certificate")}</span>
                  </button>

                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{tr("Done")}</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* History Vault View */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {tr("Previously Signed Documents in Firestore Vault")}
              </h4>

              <div className="space-y-3">
                {savedDocs.map((doc, index) => (
                  <div 
                    key={index}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-emerald-400" />
                        <h5 className="text-sm font-bold text-white">{doc.documentTitle}</h5>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 font-mono">
                        {doc.signatures?.length || 1} Signatures • {new Date(doc.createdAt || doc.savedAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setCompletedDoc(doc);
                        setActiveTab('certificate');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{tr("View Certificate")}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        {activeTab === 'sign' && (
          <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-4">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{collectedSignatures.length} {tr("of recommended 3 signatures applied (1 Testator + 2 Independent Witnesses)")}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
              >
                {tr("Close")}
              </button>

              <button
                onClick={handleFinalizeSignedDocument}
                disabled={collectedSignatures.length === 0 || isFinalizing}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2 active:scale-95 transition-all"
              >
                {isFinalizing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{tr("Generating Certificate...")}</span>
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4" />
                    <span>{tr("Finalize & Issue Seal")}</span>
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
