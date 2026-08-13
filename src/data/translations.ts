import { Language } from '../types';
import { t } from '../utils/translate';

export interface TranslationDictionary {
  appName: string;
  offlineMode: string;
  home: string;
  network: string;
  calc: string;
  assist: string;
  storage: string;
  womenRights: string;
  seniorMode: string;
  knowYourRights: string;
  heroSub: string;
  startInterview: string;
  disputesPrevented: string;
  successionsAnalyzed: string;
  coreTools: string;
  seeAll: string;
  interactiveFamilyTree: string;
  familyTreeSub: string;
  inheritanceTwin: string;
  inheritanceTwinSub: string;
  womensRightsCenter: string;
  womensRightsSub: string;
  howItWorks: string;
  talkToAi: string;
  talkToAiSub: string;
  mapFamily: string;
  mapFamilySub: string;
  getAnalysis: string;
  getAnalysisSub: string;
  legalAlerts: string;
  preventionScore: string;
  highClarity: string;
  propertyAllocation: string;
  equalDistribution: string;
  totalEstate: string;
  legalReasoning: string;
  nextSteps: string;
  downloadReport: string;
  readyForOffline: string;
  coreFunctionsAvailable: string;
  localDatabaseCached: string;
  autoSync: string;
  offlineVoiceAssistant: string;
  clearCache: string;
  smsTitle: string;
  smsDesc: string;
  scanDialer: string;
  whatHappensIf: string;
  ancestral: string;
  selfAcquired: string;
  classIHeir: string;
  widow: string;
  daughter: string;
  son: string;
  mother: string;
  father: string;
  riskRadar: string;
  healthScore: string;
  legacyTimeline: string;
  readinessCheck: string;
}

const enDict: TranslationDictionary = {
  appName: "ADHIKAR",
  offlineMode: "Offline Mode Active",
  home: "HOME",
  network: "NETWORK",
  calc: "CALC",
  assist: "ASSIST",
  storage: "STORAGE",
  womenRights: "WOMEN'S RIGHTS",
  seniorMode: "SENIOR MODE",
  knowYourRights: "Know Your Rights Before a Dispute Begins.",
  heroSub: "Navigate complex inheritance laws with AI-driven clarity and precision.",
  startInterview: "START AI INTERVIEW",
  disputesPrevented: "Disputes Prevented",
  successionsAnalyzed: "Successions Analyzed",
  coreTools: "Core Tools",
  seeAll: "SEE ALL",
  interactiveFamilyTree: "Interactive Family Tree",
  familyTreeSub: "Map lineage and calculate exact legal shares visually.",
  inheritanceTwin: "Inheritance Digital Twin",
  inheritanceTwinSub: "Simulate property division scenarios under law.",
  womensRightsCenter: "Women's Rights Center",
  womensRightsSub: "Specialized guidance on succession coparcenary parity.",
  howItWorks: "How it Works",
  talkToAi: "Talk to AI",
  talkToAiSub: "Describe your family structure in your native language.",
  mapFamily: "Map Family",
  mapFamilySub: "Review the auto-generated legal lineage graph.",
  getAnalysis: "Get Analysis",
  getAnalysisSub: "Receive a precise breakdown of rightful inheritance shares.",
  legalAlerts: "Legal Alerts & Updates",
  preventionScore: "Prevention Score",
  highClarity: "High Clarity",
  propertyAllocation: "Property Allocation",
  equalDistribution: "Equal Distribution",
  totalEstate: "Total Estate",
  legalReasoning: "Legal Reasoning",
  nextSteps: "Next Steps",
  downloadReport: "Download Report",
  readyForOffline: "Ready for Offline Access",
  coreFunctionsAvailable: "Core Functions Available Offline",
  localDatabaseCached: "Local Database Cached",
  autoSync: "Auto-Sync Enabled",
  offlineVoiceAssistant: "Offline Voice Assistant",
  clearCache: "Clear Local Cache",
  smsTitle: "SMS / USSD Dialing",
  smsDesc: "Dial *99# for feature phone legal advice",
  scanDialer: "Scan or Dial",
  whatHappensIf: "What Happens If?",
  ancestral: "Ancestral Property",
  selfAcquired: "Self-Acquired Property",
  classIHeir: "Class I Legal Heir",
  widow: "Widow",
  daughter: "Daughter",
  son: "Son",
  mother: "Mother",
  father: "Father",
  riskRadar: "Dispute Risk Radar",
  healthScore: "Health Score",
  legacyTimeline: "Legacy Timeline",
  readinessCheck: "Readiness Check",
};

function createDict(lang: Language): TranslationDictionary {
  if (lang === 'EN') return enDict;
  const result: any = {};
  for (const key of Object.keys(enDict) as (keyof TranslationDictionary)[]) {
    const orig = enDict[key];
    result[key] = t(orig, lang);
  }
  return result as TranslationDictionary;
}

export const translations: Record<Language, TranslationDictionary> = {
  EN: enDict,
  HI: createDict('HI'),
  TA: createDict('TA'),
  TE: createDict('TE'),
  ML: createDict('ML'),
  KN: createDict('KN'),
  BN: createDict('BN'),
  MR: createDict('MR'),
  GU: createDict('GU'),
  PA: createDict('PA'),
  UR: createDict('UR'),
  OR: createDict('OR'),
  AS: createDict('AS'),
  BHO: createDict('BHO'),
  MAI: createDict('MAI'),
};
