export type Language = 
  | 'EN' | 'HI' | 'TA' | 'TE' | 'ML' 
  | 'KN' | 'BN' | 'MR' | 'GU' | 'PA' 
  | 'UR' | 'OR' | 'AS' | 'BHO' | 'MAI';

export type HeirClass = 'Class I' | 'Class II' | 'Agnate' | 'Cognate' | 'Sharer (Muslim)' | 'Residuary';

export interface RiskFactor {
  id: string;
  factor: string;
  category: 'documentation' | 'family_structure' | 'property_ownership' | 'legal_clarity' | 'property_ambiguity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  impactPoints: number;
  description: string;
  preventionTip: string;
}

export interface DisputeRiskAnalysis {
  riskScore: number; // 0-100
  riskTier: 'Low' | 'Medium' | 'High' | 'Critical';
  factors: RiskFactor[];
  explainableReasoning: string[];
  recommendations: string[];
}

export interface SimulatorEvent {
  id: string;
  type: 'add_child' | 'remove_heir' | 'marriage' | 'divorce' | 'remarriage' | 'adoption' | 'birth' | 'death' | 'property_add' | 'property_sale';
  title: string;
  details: string;
  impactNote: string;
}

export interface HealthScoreCategory {
  name: string;
  score: number; // 0-100
  status: 'Excellent' | 'Good' | 'Needs Attention' | 'High Risk';
  weight: number;
  description: string;
  recommendations: string[];
}

export interface LegacyTimelineEvent {
  id: string;
  generation: 'Grandparents' | 'Parents' | 'Children' | 'Future Generations';
  year: string;
  title: string;
  ownerName: string;
  eventType: 'acquisition' | 'partition' | 'willed_transfer' | 'succession' | 'projected_transfer';
  assetSummary: string;
  legalStatus: string;
  taxNote?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: 'father' | 'mother' | 'son' | 'daughter' | 'widow' | 'brother' | 'sister' | 'grandfather' | 'grandmother' | 'other';
  status: 'alive' | 'deceased';
  isOwner?: boolean;
  isPropositus?: boolean;
  heirClass: HeirClass;
  gender: 'male' | 'female' | 'other';
  estimatedSharePercent: number;
  initials: string;
  notes?: string;
}

export interface PropertyAsset {
  id: string;
  title: string;
  type: 'real_estate' | 'bank_deposit' | 'gold' | 'business' | 'vehicle' | 'other';
  location: string;
  sharePercentage: number;
  valueInINR?: string;
  statusBadge: 'Clear Title' | 'Verified' | 'Under Dispute' | 'In Progress';
  imageUrI?: string;
  notes?: string;
}

export interface FamilyTreeData {
  id: string;
  title: string;
  subtitle: string;
  propositusName: string;
  religionLaw: 'hindu' | 'muslim' | 'christian' | 'secular';
  propertyType: 'ancestral' | 'self_acquired';
  members: FamilyMember[];
  assets: PropertyAsset[];
  lastUpdated: string;
}

export interface LegalProcessStep {
  id: number;
  title: string;
  description: string;
  office: string;
  status: 'completed' | 'in_progress' | 'pending';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  translation?: string;
  timestamp: string;
  options?: string[];
  isThinking?: boolean;
}

export interface AppSettings {
  darkMode: boolean;
  seniorMode: boolean;
  language: Language;
  autoSync: boolean;
  offlineVoiceAssistant: boolean;
  textOnlyMode: boolean;
  compressAssets: boolean;
  voiceSpeaker: 'Kore' | 'Zephyr' | 'Puck';
  lowBandwidth: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  state: string;
  savedTreesCount: number;
  completedDocsCount: number;
  upcomingAppointments: number;
  photoURL?: string;
  riskAssessmentsCount?: number;
  peaceScoresCount?: number;
}

export type DocumentCategory = 'will' | 'property_deed' | 'identification' | 'succession_cert' | 'settlement' | 'other';

export interface DocumentDeadline {
  id: string;
  docId?: string;
  docName: string;
  title: string;
  category: 'property_tax' | 'doc_expiration' | 'court_hearing' | 'lease_renewal' | 'will_probate' | 'other';
  dueDate: string; // YYYY-MM-DD
  amountINR?: string;
  urgency: 'critical' | 'warning' | 'normal';
  summary: string;
  status: 'suggested' | 'added' | 'dismissed';
  reminderMinutes?: number;
  createdAt: string;
}

export interface SecureDocument {
  id: string;
  name: string;
  category: DocumentCategory;
  fileSize: string;
  fileType: string;
  uploadDate: string;
  encryptionAlgorithm: 'AES-256-GCM';
  checksumHash: string;
  isEncrypted: boolean;
  requiresBiometric?: boolean;
  notes?: string;
  fileDataUrl?: string;
  parsedDeadlines?: DocumentDeadline[];
}

export interface LegalExpert {
  id: string;
  name: string;
  title: string;
  specialty: string;
  experienceYears: number;
  rating: number;
  totalConsultations: number;
  languages: string[];
  location: string;
  availableModes: ('video' | 'phone' | 'in_person')[];
  avatarBg: string;
}

export interface ConsultationAppointment {
  id: string;
  expertId: string;
  expertName: string;
  expertTitle: string;
  date: string; // YYYY-MM-DD
  timeSlot: string;
  mode: 'video' | 'phone' | 'in_person';
  topic: string;
  notes?: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  meetLink?: string;
  createdAt: string;
  reminderMinutes?: number; // e.g. 15, 30, 60 minutes before
  reminderSet?: boolean;
}

