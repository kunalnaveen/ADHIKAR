import React, { useState } from 'react';
import { AppSettings, FamilyMember, FamilyTreeData } from '../types';
import { translations } from '../data/translations';
import { t as translateText } from '../utils/translate';
import { legalAlertsList, initialFamilyTree } from '../data/mockData';
import { 
  GitFork, 
  ArrowRight, 
  Scale, 
  Bell, 
  Clock, 
  ScrollText, 
  Key, 
  Scan, 
  QrCode, 
  Download, 
  Calculator,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { LegacyReadinessCard } from './LegacyReadinessCard';
import { UpcomingExpirationsCard } from './UpcomingExpirationsCard';
import { PrintableQrModal } from './PrintableQrModal';
import { DocumentScannerModal } from './DocumentScannerModal';
import { EmergencyAccessModal } from './EmergencyAccessModal';
import { SmartWillDraftModal } from './SmartWillDraftModal';
import { LegalTermsModal } from './LegalTermsModal';
import { generateInheritancePdf } from '../utils/pdfExport';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
  settings: AppSettings;
  tree?: FamilyTreeData;
  onUpdateTree?: (tree: FamilyTreeData) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  onNavigate, 
  settings,
  tree = initialFamilyTree,
  onUpdateTree
}) => {
  const t = translations[settings.language] || translations.EN;
  const tr = (str: string) => translateText(str, settings.language);

  const [showQrModal, setShowQrModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showWillDraftModal, setShowWillDraftModal] = useState(false);
  const [showLegalTermsModal, setShowLegalTermsModal] = useState(false);
  const [legalTermsTab, setLegalTermsTab] = useState<'terms' | 'privacy'>('terms');
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleAddFamilyMembers = (newMembers: FamilyMember[]) => {
    if (onUpdateTree && tree) {
      const updatedTree = {
        ...tree,
        members: [...tree.members, ...newMembers],
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      onUpdateTree(updatedTree);
    }
  };

  const handleExportPdf = async () => {
    setDownloadingPdf(true);
    try {
      await generateInheritancePdf({
        tree: tree || initialFamilyTree,
        settings,
        totalPropertyValue: 10000000,
        selectedState: 'Karnataka'
      });
    } catch (e) {
      console.error('PDF export error:', e);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const workflowSteps = [
    {
      step: '01',
      title: tr("Family Lineage & Kinship Mapping"),
      badge: `${tree?.members?.length || 0} ${tr("Heirs")}`,
      description: tr("Chart ancestral coparcenary rights, legal survivorship, and Class I/II heirs under Section 6 of HSA 2005."),
      actionText: tr("Open Lineage Tree"),
      icon: <GitFork className="w-4 h-4 text-amber-400" />,
      onClick: () => onNavigate('tree')
    },
    {
      step: '02',
      title: tr("Statutory Share & Partition Calculation"),
      badge: tr("HSA 2005 & ISA 1925"),
      description: tr("Automate fractional estate partitions for agricultural lands, immovable self-acquired assets, and ancestral coparcenary."),
      actionText: tr("Calculate Shares"),
      icon: <Calculator className="w-4 h-4 text-amber-400" />,
      onClick: () => onNavigate('calculator')
    },
    {
      step: '03',
      title: tr("Smart Testament & Attested E-Will"),
      badge: tr("Digital Execution"),
      description: tr("Draft a courtroom-compliant Last Will & Testament with cryptographic timestamps, executor designations, and biometric seals."),
      actionText: tr("Draft Testament"),
      icon: <ScrollText className="w-4 h-4 text-emerald-400" />,
      onClick: () => setShowWillDraftModal(true)
    }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-8 text-slate-100">
      
      {/* ─── 1. Unified Legal Header & Action Hub ─── */}
      <div className="pb-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
            <Scale className="w-4 h-4" />
            <span className="font-serif tracking-wide">{tr("Statutory Succession Framework • HSA 2005 & ISA 1925")}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white font-serif tracking-tight">
            {tr("Secure Your Family's Property & Legal Rights")}
          </h1>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            {tr("Map ancestral lineage, calculate statutory inheritance shares, and draft legally valid testaments with tamper-proof signatures.")}
          </p>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => setShowScannerModal(true)}
            className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <Scan className="w-3.5 h-3.5 text-emerald-400" />
            <span>{tr("Scan Document")}</span>
          </button>

          <button
            onClick={() => setShowQrModal(true)}
            className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-400" />
            <span>{tr("Lineage QR")}</span>
          </button>

          <button
            onClick={handleExportPdf}
            disabled={downloadingPdf}
            className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloadingPdf ? tr("Exporting...") : tr("Export PDF")}</span>
          </button>
        </div>
      </div>

      {/* ─── 2. Seamless Core Succession Workflows (Embedded Rows - NO fragmented boxes) ─── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-serif">
            {tr("Statutory Estate Succession Workflow")}
          </h2>
          <span className="text-[11px] text-slate-400">
            {tr("3-Step Legal Resolution")}
          </span>
        </div>

        <div className="divide-y divide-slate-800">
          {workflowSteps.map((item) => (
            <div
              key={item.step}
              onClick={item.onClick}
              className="py-4 px-2 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-900/40 rounded-xl transition-colors cursor-pointer group"
            >
              <div className="flex items-start md:items-center gap-3.5 min-w-0 flex-1">
                <div className="font-mono text-xs font-bold text-amber-400/80 shrink-0 w-6">
                  {item.step}
                </div>

                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-serif font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                      {item.title}
                    </span>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 group-hover:text-amber-300 shrink-0 self-end md:self-center">
                <span>{item.actionText}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 3. Seamless Estate Readiness & Protection Scorecard ─── */}
      <div className="pt-2">
        <LegacyReadinessCard
          settings={settings}
          onNavigate={onNavigate}
          tree={tree || initialFamilyTree}
        />
      </div>

      {/* ─── 4. Statutory Deadlines & Emergency Fiduciary Controls (Unified Stream) ─── */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white font-serif">
              {tr("Limitation Timelines & Nominee Governance")}
            </h2>
          </div>

          <button
            onClick={() => setShowEmergencyModal(true)}
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{tr("Emergency Fiduciary Protocol")}</span>
          </button>
        </div>

        <UpcomingExpirationsCard 
          settings={settings}
          onNavigate={onNavigate}
        />
      </div>

      {/* ─── 5. Legal Dispatch & Precedents Docket (Seamless Editorial Stream) ─── */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white font-serif">
              {t.legalAlerts}
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">Supreme Court & High Court Precedents</span>
        </div>

        <div className="divide-y divide-slate-800">
          {legalAlertsList.slice(0, 3).map((alert) => (
            <div key={alert.id} className="py-3 px-2 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 hover:bg-slate-900/30 rounded-lg transition-colors">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider font-mono">
                    {alert.tag}
                  </span>
                  <span className="text-slate-600">•</span>
                  <h4 className="text-xs font-bold text-white font-serif truncate">
                    {alert.title}
                  </h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                  {alert.summary}
                </p>
              </div>

              <span className="text-[10px] text-slate-400 font-mono shrink-0 self-start sm:self-baseline">
                {alert.date}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Printable QR Code Modal */}
      {showQrModal && (
        <PrintableQrModal
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
          tree={tree || initialFamilyTree}
          settings={settings}
          totalPropertyValue={10000000}
        />
      )}

      {/* Camera Document Scanner with Gemini OCR */}
      {showScannerModal && (
        <DocumentScannerModal
          isOpen={showScannerModal}
          onClose={() => setShowScannerModal(false)}
          settings={settings}
          onAddFamilyMembers={handleAddFamilyMembers}
          onNavigate={onNavigate}
        />
      )}

      {/* Emergency Access & Trustee Protocol Modal */}
      {showEmergencyModal && (
        <EmergencyAccessModal
          isOpen={showEmergencyModal}
          onClose={() => setShowEmergencyModal(false)}
          settings={settings}
        />
      )}

      {/* Smart Will Draft Generator Modal */}
      {showWillDraftModal && (
        <SmartWillDraftModal
          isOpen={showWillDraftModal}
          onClose={() => setShowWillDraftModal(false)}
          settings={settings}
          treeData={tree}
        />
      )}

      {/* Statutory Terms of Service & Privacy Policy Modal */}
      {showLegalTermsModal && (
        <LegalTermsModal
          isOpen={showLegalTermsModal}
          onClose={() => setShowLegalTermsModal(false)}
          initialTab={legalTermsTab}
          language={settings.language}
        />
      )}

    </div>
  );
};

