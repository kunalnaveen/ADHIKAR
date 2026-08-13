import { jsPDF } from 'jspdf';
import { HealthScoreCategory, FamilyTreeData, LegalProcessStep } from '../types';

export interface ChecklistReportItem {
  id: string;
  title: string;
  description: string;
  category: string;
  completed: boolean;
  actionText: string;
}

/**
 * Generates a branded, professional PDF for the Legal Share Summary Report (Calculator).
 */
export function generateLegalSummaryPDF(
  tree: FamilyTreeData,
  score: number,
  steps: LegalProcessStep[]
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const docId = `ADHK-CALC-${Math.floor(100000 + Math.random() * 900000)}`;

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('ADHIKAR', 14, 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Statutory Share Calculator & Prevention Score Report', 14, 23);

  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240);
  doc.text(`Ref ID: ${docId}`, 196, 14, { align: 'right' });
  doc.text(`Date: ${currentDate}`, 196, 19, { align: 'right' });

  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(1);
  doc.line(0, 32, 210, 32);

  let y = 44;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('STATUTORY SHARE & ESTATE ALLOCATION', 14, y);

  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Propositus: ${tree.propositusName} • Dispute Prevention Clarity: ${score}/100`, 14, y);

  y += 10;
  doc.setFillColor(238, 242, 255);
  doc.setDrawColor(199, 210, 254);
  doc.roundedRect(14, y, 182, 22, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(67, 56, 202);
  doc.text(`Calculated Heir Distribution under HSA 2005 Rules:`, 20, y + 8);

  const activeHeirs = tree.members.filter((m) => !m.isPropositus);
  const heirSummaryText = activeHeirs.map((h) => `${h.name} (${h.relationship}): ${h.estimatedSharePercent}%`).join(' | ');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  const splitHeirs = doc.splitTextToSize(heirSummaryText, 170);
  doc.text(splitHeirs, 20, y + 15);

  y += 30;
  doc.setFillColor(30, 41, 59);
  doc.rect(14, y, 182, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('HEIR NAME', 18, y + 5.5);
  doc.text('RELATIONSHIP', 75, y + 5.5);
  doc.text('HEIR CLASS', 125, y + 5.5);
  doc.text('STATUTORY SHARE', 160, y + 5.5);

  y += 8;

  activeHeirs.forEach((heir, idx) => {
    const rowBg = idx % 2 === 0 ? 255 : 248;
    doc.setFillColor(rowBg, rowBg, rowBg);
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, y, 182, 10, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(heir.name, 18, y + 6.5);

    doc.setFont('helvetica', 'normal');
    doc.text(heir.relationship.toUpperCase(), 75, y + 6.5);
    doc.text(heir.heirClass || 'Class I', 125, y + 6.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text(`${heir.estimatedSharePercent}%`, 160, y + 6.5);

    y += 10;
  });

  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('REQUIRED LEGAL PROCEDURE TIMELINE', 14, y);

  y += 6;
  steps.forEach((st) => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(67, 56, 202);
    doc.text(`[Step ${st.id}] ${st.title}`, 14, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(st.description, 14, y + 4);

    y += 10;
  });

  doc.save(`ADHIKAR_Legal_Share_Report_${docId}.pdf`);
}

/**
 * Generates a branded, professional PDF for the Inheritance Health Score Audit.
 */
export function generateHealthScorePDF(
  categories: HealthScoreCategory[],
  overallScore: number,
  overallTier: string
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const docId = `ADHK-HS-${Math.floor(100000 + Math.random() * 900000)}`;

  // Header Banner
  doc.setFillColor(15, 23, 42); // Slate-900
  doc.rect(0, 0, 210, 32, 'F');

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('ADHIKAR', 14, 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text('National Legal Literacy & Inheritance Vault • HSA 2005 Compliant', 14, 23);

  // Document Metadata right aligned
  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240);
  doc.text(`Doc Ref: ${docId}`, 196, 14, { align: 'right' });
  doc.text(`Date: ${currentDate}`, 196, 19, { align: 'right' });
  doc.text(`Status: Official Audit`, 196, 24, { align: 'right' });

  // Accent line
  doc.setDrawColor(99, 102, 241); // Indigo-500
  doc.setLineWidth(1);
  doc.line(0, 32, 210, 32);

  // Main Report Title
  let y = 44;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('INHERITANCE HEALTH SCORE REPORT', 14, y);

  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Comprehensive legal audit of Will availability, document vault records, title clarity, and lineage alignment.', 14, y);

  // Executive Summary Box
  y += 10;
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.roundedRect(14, y, 182, 26, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Overall Estate Preparedness Index:', 20, y + 10);

  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  if (overallScore >= 80) doc.setTextColor(16, 185, 129); // Emerald
  else if (overallScore >= 60) doc.setTextColor(79, 70, 229); // Indigo
  else doc.setTextColor(217, 119, 6); // Amber
  doc.text(`${overallScore}/100`, 20, y + 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Rating: ${overallTier.toUpperCase()}`, 75, y + 20);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Evaluated under Hindu Succession Act 1956, Amendment 2005 & Vineeta Sharma precedent.', 75, y + 10);

  // Table Header
  y += 34;
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(14, y, 182, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('AUDIT DIMENSION', 18, y + 5.5);
  doc.text('WEIGHT', 105, y + 5.5);
  doc.text('SCORE', 135, y + 5.5);
  doc.text('LEGAL STATUS', 165, y + 5.5);

  y += 8;

  // Categories Rows
  categories.forEach((cat, idx) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    const rowBg = idx % 2 === 0 ? 255 : 248;
    doc.setFillColor(rowBg, rowBg, rowBg);
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, y, 182, 22, 'FD');

    // Dimension Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(cat.name, 18, y + 6);

    // Weight & Score
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`${cat.weight}%`, 105, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.text(`${cat.score}/100`, 135, y + 6);

    // Status Pill
    if (cat.score >= 80) doc.setTextColor(16, 185, 129);
    else if (cat.score >= 60) doc.setTextColor(79, 70, 229);
    else doc.setTextColor(217, 119, 6);
    doc.text(cat.status, 165, y + 6);

    // Description line
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    const splitDesc = doc.splitTextToSize(cat.description, 170);
    doc.text(splitDesc, 18, y + 11);

    // Action item summary
    if (cat.recommendations.length > 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(67, 56, 202); // Indigo-700
      doc.text(`Action: ${cat.recommendations[0]}`, 18, y + 18);
    }

    y += 24;
  });

  // Footer & Statutory Disclaimer
  y = Math.max(y + 6, 255);
  doc.setDrawColor(226, 232, 240);
  doc.line(14, y, 196, y);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('STATUTORY NOTICE & DISCLAIMER', 14, y + 4);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(
    'This report is generated by the ADHIKAR Legal AI Core for informational and estate planning purposes. It does not replace formal legal counsel by an advocate.',
    14,
    y + 8
  );

  // Save the PDF
  doc.save(`ADHIKAR_Inheritance_Health_Score_${docId}.pdf`);
}

/**
 * Generates a branded, professional PDF for the Legal Readiness Checklist.
 */
export function generateLegalReadinessPDF(
  items: ChecklistReportItem[],
  completedCount: number,
  completionPercentage: number
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const docId = `ADHK-LR-${Math.floor(100000 + Math.random() * 900000)}`;

  // Header Banner
  doc.setFillColor(15, 23, 42); // Slate-900
  doc.rect(0, 0, 210, 32, 'F');

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('ADHIKAR', 14, 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Estate Compliance & Legal Readiness Certificate', 14, 23);

  // Document Metadata right aligned
  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240);
  doc.text(`Cert ID: ${docId}`, 196, 14, { align: 'right' });
  doc.text(`Date: ${currentDate}`, 196, 19, { align: 'right' });
  doc.text(`Audit Ver: 2026.1`, 196, 24, { align: 'right' });

  // Accent line
  doc.setDrawColor(16, 185, 129); // Emerald-500
  doc.setLineWidth(1);
  doc.line(0, 32, 210, 32);

  // Title
  let y = 44;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('LEGAL READINESS CHECKLIST CERTIFICATE', 14, y);

  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Step-by-step verification of registered Wills, Jamabandi property cards, nominee entries, and legal heir records.', 14, y);

  // Summary Banner
  y += 10;
  doc.setFillColor(236, 253, 245); // Emerald-50
  doc.setDrawColor(167, 243, 208); // Emerald-200
  doc.roundedRect(14, y, 182, 24, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(6, 95, 70); // Emerald-800
  doc.text(`Legal Compliance Level: ${completionPercentage}%`, 20, y + 10);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 118, 110);
  doc.text(`Verified Tasks: ${completedCount} of ${items.length} completed.`, 20, y + 17);

  // Table
  y += 32;
  doc.setFillColor(30, 41, 59);
  doc.rect(14, y, 182, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('CATEGORY', 18, y + 5.5);
  doc.text('VERIFICATION REQUIREMENT', 65, y + 5.5);
  doc.text('STATUS', 160, y + 5.5);

  y += 8;

  items.forEach((item, idx) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    const rowBg = idx % 2 === 0 ? 255 : 248;
    doc.setFillColor(rowBg, rowBg, rowBg);
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, y, 182, 20, 'FD');

    // Category
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(79, 70, 229);
    doc.text(item.category, 18, y + 6);

    // Title & description
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(8.5);
    doc.text(item.title, 65, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    const splitDesc = doc.splitTextToSize(item.description, 90);
    doc.text(splitDesc, 65, y + 11);

    // Status
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    if (item.completed) {
      doc.setTextColor(16, 185, 129);
      doc.text('[ VERIFIED ]', 160, y + 8);
    } else {
      doc.setTextColor(217, 119, 6);
      doc.text('[ PENDING ]', 160, y + 8);
    }

    y += 22;
  });

  // Footer & Statutory Notice
  y = Math.max(y + 6, 255);
  doc.setDrawColor(226, 232, 240);
  doc.line(14, y, 196, y);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('REVENUE RECORD & PROBATE ADVISORY', 14, y + 4);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Keep physical copies of Jamabandi mutation cards, registered Wills, and legal heir affidavits ready for revenue authority filing.',
    14,
    y + 8
  );

  // Save the PDF
  doc.save(`ADHIKAR_Legal_Readiness_Certificate_${docId}.pdf`);
}
