import { Language } from '../types';

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

const hiDict: TranslationDictionary = {
  ...enDict,
  appName: "अधिकार",
  offlineMode: "ऑफलाइन मोड सक्रिय",
  home: "मुख्य पृष्ठ",
  network: "वंश वृक्ष",
  calc: "गणना",
  assist: "सहायक",
  storage: "संग्रहण",
  womenRights: "महिला अधिकार",
  seniorMode: "वरिष्ठ मोड",
  knowYourRights: "विवाद शुरू होने से पहले अपने अधिकार जानें।",
  heroSub: "एआई-संचालित स्पष्टता के साथ जटिल उत्तराधिकार कानूनों को समझें।",
  startInterview: "एआई साक्षात्कार शुरू करें",
  disputesPrevented: "विवाद रोके गए",
  successionsAnalyzed: "उत्तराधिकार का विश्लेषण",
  coreTools: "मुख्य उपकरण",
  seeAll: "सभी देखें",
  interactiveFamilyTree: "इंटरएक्टिव परिवार वृक्ष",
  familyTreeSub: "वंश रेखा मानचित्र बनाएं और सटीक कानूनी हिस्से देखें।",
  inheritanceTwin: "उत्तराधिकार डिजिटल ट्विन",
  inheritanceTwinSub: "कानून के तहत संपत्ति विभाजन परिदृश्यों का अनुकरण करें।",
  womensRightsCenter: "महिला अधिकार केंद्र",
  womensRightsSub: "उत्तराधिकार सहदायाद समानता पर विशेष मार्गदर्शन।",
  riskRadar: "विवाद जोखिम रडार",
  healthScore: "स्वास्थ्य स्कोर",
  legacyTimeline: "विरासत समय-रेखा",
  readinessCheck: "कानूनी तैयारी जांच",
};

export const translations: Record<Language, TranslationDictionary> = {
  EN: enDict,
  HI: hiDict,
  TA: { ...enDict, appName: "அதிகார்", home: "முகப்பு", womenRights: "பெண்கள் உரிமை", riskRadar: "சவால்கள் ரேடார்" },
  TE: { ...enDict, appName: "అధికార్", home: "హోమ్", womenRights: "మహిళల హక్కులు", riskRadar: "రిస్క్ రాడార్" },
  ML: { ...enDict, appName: "അധികാർ", home: "ഹോം", womenRights: "സ്ത്രീകളുടെ അവകാശങ്ങൾ" },
  KN: { ...enDict, appName: "ಅಧಿಕಾರ್", home: "ಮುಖಪುಟ", womenRights: "ಮಹಿಳೆಯರ ಹಕ್ಕುಗಳು" },
  BN: { ...enDict, appName: "অধিকার", home: "হোম", womenRights: "নারীর অধিকার" },
  MR: { ...enDict, appName: "अधिकार", home: "मुख्य", womenRights: "महिला हक्क" },
  GU: { ...enDict, appName: "અધિકાર", home: "હોમ", womenRights: "મહિલા અધિકાર" },
  PA: { ...enDict, appName: "ਅਧਿਕਾਰ", home: "ਹੋਮ", womenRights: "ਔਰਤਾਂ ਦੇ ਹੱਕ" },
  UR: { ...enDict, appName: "حقوق (ادھیکار)", home: "ہوم", womenRights: "خواتین کے حقوق" },
  OR: { ...enDict, appName: "ଅଧିକାର", home: "ମୁଖ୍ୟ", womenRights: "ମହିଳା ଅଧିକାର" },
  AS: { ...enDict, appName: "অধিকাৰ", home: "মুখ্য", womenRights: "মহিলাৰ অধিকাৰ" },
  BHO: { ...enDict, appName: "अधिकार", home: "घर", womenRights: "मेहरारू के अधिकार" },
  MAI: { ...enDict, appName: "अधिकार", home: "मुख्य", womenRights: "महिला अधिकार" },
};
