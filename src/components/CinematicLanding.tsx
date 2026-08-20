import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { 
  Scale, 
  ArrowUpRight, 
  ShieldCheck, 
  AlertTriangle, 
  GitFork, 
  Sparkles, 
  CheckCircle2, 
  Search,
  Award,
  Globe,
  Gavel,
  Users,
  Mail,
  Phone,
  MapPin,
  Send,
  ExternalLink,
  Twitter,
  Linkedin,
  Instagram,
  Github,
  Youtube,
  Clock,
  Check
} from 'lucide-react';
import { LegalModal } from './LegalModals';

interface CinematicLandingProps {
  onGetStarted: () => void;
  onViewArchitecture: () => void;
  onNavigateSection?: (section: 'dashboard' | 'tree' | 'calculator' | 'interview' | 'courtroom' | 'womens-rights') => void;
}

// Static dataset extracted outside component to prevent re-allocation
const STATIC_FAQ_ITEMS = [
  {
    q: 'Do daughters have equal inheritance rights in ancestral property in India?',
    a: 'Yes. Under the landmark Supreme Court judgment Vineeta Sharma v. Rakesh Sharma (2020) 9 SCC 1, daughters are coparceners by birth with identical rights and liabilities as sons. This applies retroactively under Section 6 of the Hindu Succession (Amendment) Act 2005, irrespective of whether the father was alive on September 9, 2005.',
    tag: 'Section 6 HSA'
  },
  {
    q: 'What is the distinction between Ancestral and Self-Acquired Property?',
    a: 'Ancestral property is inherited up to four generations of male lineage without prior partition. Any coparcener acquires rights at birth. Self-acquired property is purchased through personal income or received via gift/will; the owner has complete autonomy to dispose of it during their lifetime.',
    tag: 'Property Law'
  },
  {
    q: 'Can a father bequeath all property to one son via a Will?',
    a: 'A person can only bequeath their undivided share or self-acquired property through a testamentary will. They CANNOT disinherit other coparceners (such as daughters or other sons) from their independent birthright shares in ancestral coparcenary property.',
    tag: 'Testamentary Rights'
  },
  {
    q: 'What legal documents are required for mutation (Pahani / RTC / Khata) in revenue records?',
    a: 'Standard mutation requires a registered Partition Deed or Family Settlement, Death Certificate of the propositus, Legal Heir Certificate / Surviving Member Certificate, title deeds, and no-objection affidavits from all Class I legal heirs.',
    tag: 'Revenue & Khata'
  },
  {
    q: 'How does ADHIKAR guarantee statutory accuracy in share calculations?',
    a: 'ADHIKAR executes rigorous algorithmic simulations grounded in codified statutes (Hindu Succession Act 1956 & 2005, Indian Succession Act 1925) and verified ratios from over 500+ Supreme Court and High Court precedents.',
    tag: 'Legal Engine'
  }
];

export const CinematicLanding: React.FC<CinematicLandingProps> = ({
  onGetStarted,
  onViewArchitecture,
  onNavigateSection
}) => {
  // Mobile drawer state
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<'hero' | 'about' | 'calculator' | 'features' | 'precedents' | 'faq' | 'contact'>('hero');

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactCategory, setContactCategory] = useState('Coparcenary & Succession Rights');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Legal Modal State
  const [activeLegalModal, setActiveLegalModal] = useState<'terms' | 'privacy' | 'disclaimer' | 'security' | null>(null);

  // Live Interactive Calculator State inside landing page
  const [calcPropertyType, setCalcPropertyType] = useState<'ancestral' | 'self_acquired'>('ancestral');
  const [numSons, setNumSons] = useState<number>(1);
  const [numDaughters, setNumDaughters] = useState<number>(1);
  const [hasSpouse, setHasSpouse] = useState<boolean>(true);
  const [hasMother, setHasMother] = useState<boolean>(true);

  // FAQ search and accordion state
  const [faqSearch, setFaqSearch] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Throttled and optimized scroll listener with requestAnimationFrame
  const scrollRafRef = useRef<number | null>(null);
  useEffect(() => {
    const handleScroll = () => {
      if (scrollRafRef.current) return;
      scrollRafRef.current = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        setScrolled(scrollY > 40);

        // Lightweight section top threshold check
        const sections: Array<'contact' | 'faq' | 'precedents' | 'features' | 'calculator' | 'about'> = [
          'contact', 'faq', 'precedents', 'features', 'calculator', 'about'
        ];
        let found = false;
        for (const sec of sections) {
          const el = document.getElementById(sec);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= 220) {
              setActiveSection(sec);
              found = true;
              break;
            }
          }
        }
        if (!found) {
          setActiveSection('hero');
        }
        scrollRafRef.current = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
    };
  }, []);

  // Smooth scroll handler
  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, targetId: string) => {
    e.preventDefault();
    setIsOpen(false);
    
    if (targetId === '#home' || targetId === '#hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const cleanId = targetId.replace('#', '');
    const element = document.getElementById(cleanId);
    if (element) {
      const navOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, []);

  // Contact Form Submit Handler
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) return;

    setIsSubmittingContact(true);
    setTimeout(() => {
      setIsSubmittingContact(false);
      setContactSubmitted(true);
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setContactMessage('');
      setTimeout(() => setContactSubmitted(false), 6000);
    }, 800);
  };

  // Dynamic share calculations for landing demo - fully memoized
  const liveShareResult = useMemo(() => {
    const totalClassIHeirs = (hasMother ? 1 : 0) + (hasSpouse ? 1 : 0) + numSons + numDaughters;
    
    if (calcPropertyType === 'ancestral') {
      const coparcenerCount = 1 + numSons + numDaughters;
      const notionalFatherShare = 1 / coparcenerCount;
      const deceasedShare = notionalFatherShare;
      const classIDivisor = Math.max(1, totalClassIHeirs);
      const inheritedFromDeceased = deceasedShare / classIDivisor;
      
      const sonTotal = notionalFatherShare + inheritedFromDeceased;
      const daughterTotal = notionalFatherShare + inheritedFromDeceased;
      const spouseTotal = inheritedFromDeceased;
      const motherTotal = inheritedFromDeceased;

      return {
        breakdown: [
          { role: `Each Daughter (${numDaughters})`, share: `${(daughterTotal * 100).toFixed(1)}%`, highlight: true, tag: 'Birthright Coparcener (2005 Act)' },
          { role: `Each Son (${numSons})`, share: `${(sonTotal * 100).toFixed(1)}%`, highlight: false, tag: 'Birthright Coparcener' },
          ...(hasSpouse ? [{ role: 'Surviving Spouse', share: `${(spouseTotal * 100).toFixed(1)}%`, highlight: false, tag: 'Class I Statutory Heir' }] : []),
          ...(hasMother ? [{ role: 'Surviving Mother', share: `${(motherTotal * 100).toFixed(1)}%`, highlight: false, tag: 'Class I Statutory Heir' }] : []),
        ],
        legalCitation: 'Mitakshara Notional Partition + Section 6 Hindu Succession (Amendment) Act 2005 as affirmed in Vineeta Sharma (2020) 9 SCC 1.'
      };
    } else {
      const divisor = Math.max(1, totalClassIHeirs);
      const equalSharePct = (100 / divisor).toFixed(1) + '%';
      return {
        breakdown: [
          { role: `Each Daughter (${numDaughters})`, share: equalSharePct, highlight: true, tag: 'Class I Equal Devolution' },
          { role: `Each Son (${numSons})`, share: equalSharePct, highlight: false, tag: 'Class I Equal Devolution' },
          ...(hasSpouse ? [{ role: 'Surviving Spouse', share: equalSharePct, highlight: false, tag: 'Class I Equal Devolution' }] : []),
          ...(hasMother ? [{ role: 'Surviving Mother', share: equalSharePct, highlight: false, tag: 'Class I Equal Devolution' }] : []),
        ],
        legalCitation: 'Intestate Succession under Section 8 & 9 of Hindu Succession Act, 1956. Class I heirs inherit simultaneously in equal absolute shares.'
      };
    }
  }, [calcPropertyType, numSons, numDaughters, hasSpouse, hasMother]);

  const filteredFaqs = useMemo(() => {
    if (!faqSearch.trim()) return STATIC_FAQ_ITEMS;
    const query = faqSearch.toLowerCase();
    return STATIC_FAQ_ITEMS.filter(f => f.q.toLowerCase().includes(query) || f.a.toLowerCase().includes(query) || f.tag.toLowerCase().includes(query));
  }, [faqSearch]);

  return (
    <div className="stage relative min-h-screen bg-[#050505] text-white selection:bg-blue-600 selection:text-white font-sans">
      
      {/* ════════════════════════════════════════
          PRIMARY STICKY NAVIGATION BAR (ALL SCREENS)
         ════════════════════════════════════════ */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-[#050505]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl py-3 px-4 sm:px-8' 
            : 'bg-[#050505]/60 backdrop-blur-md border-b border-white/5 py-4 px-4 sm:px-8'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <a
              href="#hero"
              onClick={(e) => handleNavClick(e, '#hero')}
              className="flex items-center gap-2.5 group cursor-pointer"
              aria-label="ADHIKAR Home"
            >
              <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all">
                <Scale className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-extrabold tracking-wider text-white">ADHIKAR<span className="text-blue-400 text-xs ml-0.5">™</span></span>
                <span className="text-[9px] font-mono text-zinc-400 tracking-tight hidden sm:block">Legal Intelligence Engine</span>
              </div>
            </a>
          </div>

          {/* Desktop Interactive Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-300">
            <a
              href="#about"
              onClick={(e) => handleNavClick(e, '#about')}
              className={`px-3 py-1.5 rounded-full transition-colors ${activeSection === 'about' ? 'text-white bg-white/10 font-semibold' : 'hover:text-white hover:bg-white/5'}`}
            >
              About
            </a>
            <a
              href="#calculator"
              onClick={(e) => handleNavClick(e, '#calculator')}
              className={`px-3 py-1.5 rounded-full transition-colors ${activeSection === 'calculator' ? 'text-white bg-white/10 font-semibold' : 'hover:text-white hover:bg-white/5'}`}
            >
              Share Engine
            </a>
            <a
              href="#features"
              onClick={(e) => handleNavClick(e, '#features')}
              className={`px-3 py-1.5 rounded-full transition-colors ${activeSection === 'features' ? 'text-white bg-white/10 font-semibold' : 'hover:text-white hover:bg-white/5'}`}
            >
              Capabilities
            </a>
            <a
              href="#precedents"
              onClick={(e) => handleNavClick(e, '#precedents')}
              className={`px-3 py-1.5 rounded-full transition-colors ${activeSection === 'precedents' ? 'text-white bg-white/10 font-semibold' : 'hover:text-white hover:bg-white/5'}`}
            >
              Precedents
            </a>
            <a
              href="#faq"
              onClick={(e) => handleNavClick(e, '#faq')}
              className={`px-3 py-1.5 rounded-full transition-colors ${activeSection === 'faq' ? 'text-white bg-white/10 font-semibold' : 'hover:text-white hover:bg-white/5'}`}
            >
              FAQ
            </a>
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, '#contact')}
              className={`px-3 py-1.5 rounded-full transition-colors ${activeSection === 'contact' ? 'text-white bg-white/10 font-semibold' : 'hover:text-white hover:bg-white/5'}`}
            >
              Contact
            </a>
          </nav>

          {/* Right Action CTAs */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigateSection ? onNavigateSection('courtroom') : onGetStarted()}
              className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white px-3 py-2 rounded-full border border-white/15 hover:border-white/30 bg-white/5 transition-all"
            >
              <Gavel className="w-3.5 h-3.5 text-blue-400" />
              <span>AI Courtroom</span>
            </button>

            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold bg-white hover:bg-zinc-200 text-[#050505] px-4 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              <span>Launch Workspace</span>
              <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Mobile Hamburger Button */}
            <button
              className="md:hidden p-2 rounded-xl bg-white/10 border border-white/15 text-white hover:bg-white/20 transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle navigation"
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span className={`block h-0.5 bg-white transition-transform duration-300 ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <span className={`block h-0.5 bg-white transition-opacity duration-200 ${isOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 bg-white transition-transform duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════
          MOBILE DRAWER NAVIGATION OVERLAY
         ════════════════════════════════════════ */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-2xl md:hidden pt-24 pb-8 px-6 flex flex-col justify-between animate-in fade-in duration-200">
          <div className="space-y-6">
            <p className="text-[11px] font-mono tracking-widest text-zinc-500 uppercase">Platform Navigation</p>
            <ul className="space-y-4 text-lg font-semibold text-white">
              <li>
                <a 
                  href="#about" 
                  onClick={(e) => handleNavClick(e, '#about')}
                  className="flex items-center justify-between py-2 border-b border-white/10 hover:text-blue-400 transition-colors"
                >
                  <span>About ADHIKAR</span>
                  <ArrowUpRight className="w-4 h-4 text-zinc-500" />
                </a>
              </li>
              <li>
                <a 
                  href="#calculator" 
                  onClick={(e) => handleNavClick(e, '#calculator')}
                  className="flex items-center justify-between py-2 border-b border-white/10 hover:text-blue-400 transition-colors"
                >
                  <span>Live Share Calculator</span>
                  <ArrowUpRight className="w-4 h-4 text-zinc-500" />
                </a>
              </li>
              <li>
                <a 
                  href="#features" 
                  onClick={(e) => handleNavClick(e, '#features')}
                  className="flex items-center justify-between py-2 border-b border-white/10 hover:text-blue-400 transition-colors"
                >
                  <span>Legal Capabilities Suite</span>
                  <ArrowUpRight className="w-4 h-4 text-zinc-500" />
                </a>
              </li>
              <li>
                <a 
                  href="#precedents" 
                  onClick={(e) => handleNavClick(e, '#precedents')}
                  className="flex items-center justify-between py-2 border-b border-white/10 hover:text-blue-400 transition-colors"
                >
                  <span>Supreme Court Precedents</span>
                  <ArrowUpRight className="w-4 h-4 text-zinc-500" />
                </a>
              </li>
              <li>
                <a 
                  href="#faq" 
                  onClick={(e) => handleNavClick(e, '#faq')}
                  className="flex items-center justify-between py-2 border-b border-white/10 hover:text-blue-400 transition-colors"
                >
                  <span>Inheritance FAQ</span>
                  <ArrowUpRight className="w-4 h-4 text-zinc-500" />
                </a>
              </li>
              <li>
                <a 
                  href="#contact" 
                  onClick={(e) => handleNavClick(e, '#contact')}
                  className="flex items-center justify-between py-2 border-b border-white/10 hover:text-blue-400 transition-colors"
                >
                  <span>Contact & Advisory</span>
                  <ArrowUpRight className="w-4 h-4 text-zinc-500" />
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3 pt-6 border-t border-white/10">
            <button
              className="w-full py-3 rounded-full bg-white text-black font-bold text-sm flex items-center justify-center gap-2"
              onClick={() => {
                setIsOpen(false);
                onGetStarted();
              }}
            >
              <span>Launch Workspace</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              className="w-full py-2.5 rounded-full bg-white/5 border border-white/10 text-zinc-300 font-semibold text-xs flex items-center justify-center gap-2"
              onClick={() => {
                setIsOpen(false);
                onViewArchitecture();
              }}
            >
              <span>View Lineage Architecture</span>
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          SECTION 1: HERO CINEMATIC STAGE
         ════════════════════════════════════════ */}
      <div id="hero" className="hero-viewport relative">
        {/* Background Plate with Video */}
        <div className="plate">
          <video
            className="plate-video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          >
            <source
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260808_112712_da9d53df-6d27-4b12-bdf6-aa9dc2622bdf.mp4"
              type="video/mp4"
            />
          </video>
        </div>

        {/* Main Hero Typography */}
        <main className="hero">
          <h1 className="headline">
            <span>The Next Layer</span>
            <span>of Intelligence</span>
          </h1>
          <p className="sub">
            <span>A unified legal infrastructure platform to help citizens,</span>
            <span>lawyers, and families resolve succession with absolute confidence.</span>
          </p>
          <div className="actions">
            <a
              className="pill pill-cta"
              href="#start"
              onClick={(e) => {
                e.preventDefault();
                onGetStarted();
              }}
            >
              <span>Get Started</span>
            </a>
            <a
              className="ghost"
              href="#calculator"
              onClick={(e) => handleNavClick(e, '#calculator')}
            >
              Explore Architecture ↓
            </a>
          </div>
        </main>

        {/* Partner / Trust Logos Strip */}
        <div className="logos">
          <div className="lg lg1">
            <svg className="lg-mark" viewBox="0 0 30 31" fill="currentColor">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0 0 H30 V31 H0 V0 Z M19.5 5.4 A5.1 5.1 0 1 0 19.5 15.6 A5.1 5.1 0 0 0 19.5 5.4 Z"
              />
              <circle cx="19.5" cy="10.5" r="2.5" fill="#050505" />
            </svg>
            <span className="lg-word">JurisEngine</span>
          </div>

          <div className="lg lg2">
            <svg className="lg-mark" viewBox="0 0 25 30" fill="currentColor">
              <rect x="0" y="0" width="7" height="30" rx="3.5" />
              <circle cx="17.5" cy="7.5" r="7.5" />
              <circle cx="17.5" cy="22.5" r="7.5" fillOpacity="0.35" />
            </svg>
            <span className="lg-word">
              LexStatute<span className="dot"></span>
            </span>
          </div>

          <div className="lg lg3">
            <svg className="lg-mark" viewBox="0 0 28 28" fill="none" stroke="currentColor">
              <circle cx="14" cy="14" r="12.35" strokeWidth="3.1" />
              <path d="M7 14 C7 10.134 10.134 7 14 7" strokeWidth="3.1" strokeLinecap="round" />
              <path d="M21 14 C21 17.866 17.866 21 14 21" strokeWidth="3.1" strokeLinecap="round" />
            </svg>
            <span className="lg-word">CourtData</span>
          </div>

          <div className="lg lg4">
            <svg className="lg-mark" viewBox="0 0 28 25.5" fill="none" stroke="currentColor">
              <path
                d="M0 10 C4.67 6.67 9.33 6.67 14 10 C18.67 13.33 23.33 13.33 28 10 V0 H0 V10 Z"
                fill="currentColor"
              />
              <path
                d="M0 17 C4.67 13.67 9.33 13.67 14 17 C18.67 20.33 23.33 20.33 28 17"
                strokeWidth="3.05"
                strokeLinecap="round"
              />
              <path
                d="M0 24 C4.67 20.67 9.33 20.67 14 24 C18.67 27.33 23.33 27.33 28 24"
                strokeWidth="3.05"
                strokeLinecap="round"
              />
            </svg>
            <span className="lg-word">HeritageVault</span>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          SECTION 2: ABOUT & PLATFORM PILLARS
         ════════════════════════════════════════ */}
      <section id="about" className="relative py-24 px-6 sm:px-12 max-w-7xl mx-auto border-t border-white/5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <span className="text-xs font-mono tracking-widest text-zinc-500 uppercase flex items-center gap-2">
              <Scale className="w-3.5 h-3.5 text-blue-400" />
              ADHIKAR™ Legal Infrastructure
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3 tracking-tight">
              Precision Jurisprudence Engine <br className="hidden sm:inline" />
              for Indian Succession & Property Law
            </h2>
          </div>
          <p className="text-sm sm:text-base text-zinc-400 max-w-md leading-relaxed">
            Eliminating decade-long property disputes through automated coparcenary calculations, 
            instant Supreme Court precedent grounding, and zero-knowledge lineage mapping.
          </p>
        </div>

        {/* 4 Key Pillar Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-zinc-950/80 border border-white/10 hover:border-white/20 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">100% Statutory Compliance</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Hindu Succession Act 1956 & 2005, Indian Succession Act 1925, and State Revenue Land Codes.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-950/80 border border-white/10 hover:border-white/20 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Daughter's Coparcenary</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Enforcing equal birthright shares under the landmark Vineeta Sharma v. Rakesh Sharma Supreme Court ruling.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-950/80 border border-white/10 hover:border-white/20 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Dispute Risk Radar</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Multi-variable risk scoring to detect unregistered wills, mutation delays, and partition conflict vectors.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-950/80 border border-white/10 hover:border-white/20 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">10+ Regional Languages</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Native voice consultation in Hindi, Kannada, Tamil, Telugu, Marathi, Bengali, Gujarati & English.
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 3: INTERACTIVE LIVE CALCULATOR DEMO
         ════════════════════════════════════════ */}
      <section id="calculator" className="relative py-20 px-6 sm:px-12 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-mono tracking-widest text-blue-400 uppercase bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            Interactive Testbed
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-4 tracking-tight">
            Live Succession Share Engine
          </h2>
          <p className="text-sm text-zinc-400 mt-2">
            Configure property classification and family members to simulate real-time mathematical division under Indian Law.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-zinc-950/90 rounded-3xl border border-white/10 p-6 sm:p-10 shadow-2xl backdrop-blur-sm">
          {/* Controls Column */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-2">
                1. Property Classification
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCalcPropertyType('ancestral')}
                  className={`px-4 py-3 rounded-xl text-xs font-semibold border transition-all text-left ${
                    calcPropertyType === 'ancestral'
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                      : 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className="font-bold block text-sm">Ancestral Property</span>
                  <span className="text-[11px] text-zinc-400 font-normal">Mitakshara coparcenary</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCalcPropertyType('self_acquired')}
                  className={`px-4 py-3 rounded-xl text-xs font-semibold border transition-all text-left ${
                    calcPropertyType === 'self_acquired'
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                      : 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className="font-bold block text-sm">Self-Acquired</span>
                  <span className="text-[11px] text-zinc-400 font-normal">Intestate equal shares</span>
                </button>
              </div>
            </div>

            {/* Steppers */}
            <div className="space-y-4 pt-2">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                2. Surviving Class I Legal Heirs
              </label>

              {/* Sons */}
              <div className="flex items-center justify-between p-3.5 bg-zinc-900 rounded-xl border border-white/5">
                <div>
                  <span className="text-sm font-semibold text-white block">Number of Sons</span>
                  <span className="text-xs text-zinc-500">Coparceners by birth</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setNumSons(Math.max(0, numSons - 1))}
                    className="w-8 h-8 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 font-bold"
                  >
                    -
                  </button>
                  <span className="text-sm font-bold text-white w-4 text-center">{numSons}</span>
                  <button
                    onClick={() => setNumSons(numSons + 1)}
                    className="w-8 h-8 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Daughters */}
              <div className="flex items-center justify-between p-3.5 bg-zinc-900 rounded-xl border border-white/5">
                <div>
                  <span className="text-sm font-semibold text-white block flex items-center gap-1.5">
                    Number of Daughters
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono">
                      Equal Share
                    </span>
                  </span>
                  <span className="text-xs text-zinc-500">Coparcener post-2005 Act</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setNumDaughters(Math.max(0, numDaughters - 1))}
                    className="w-8 h-8 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 font-bold"
                  >
                    -
                  </button>
                  <span className="text-sm font-bold text-white w-4 text-center">{numDaughters}</span>
                  <button
                    onClick={() => setNumDaughters(numDaughters + 1)}
                    className="w-8 h-8 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Checkboxes for Spouse & Mother */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 p-3 bg-zinc-900 rounded-xl border border-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasSpouse}
                    onChange={(e) => setHasSpouse(e.target.checked)}
                    className="rounded text-blue-500 focus:ring-0"
                  />
                  <span className="text-xs font-semibold text-zinc-200">Surviving Spouse</span>
                </label>

                <label className="flex items-center gap-2 p-3 bg-zinc-900 rounded-xl border border-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasMother}
                    onChange={(e) => setHasMother(e.target.checked)}
                    className="rounded text-blue-500 focus:ring-0"
                  />
                  <span className="text-xs font-semibold text-zinc-200">Surviving Mother</span>
                </label>
              </div>
            </div>

            <button
              onClick={onGetStarted}
              className="w-full py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-98 shadow-md"
            >
              <span>Launch Full Succession Calculator</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Results Display Column */}
          <div className="lg:col-span-7 bg-[#050505] rounded-2xl border border-white/10 p-6 flex flex-col justify-between min-h-[380px]">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div>
                  <h4 className="text-sm font-bold text-white">Calculated Statutory Devolution</h4>
                  <span className="text-xs text-zinc-400">Hindu Succession Act (Amended 2005)</span>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {calcPropertyType === 'ancestral' ? 'Mitakshara Notional' : 'Equal Class I'}
                </span>
              </div>

              {/* Heir Shares List */}
              <div className="space-y-3">
                {liveShareResult.breakdown.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      item.highlight
                        ? 'bg-blue-950/30 border-blue-500/40 text-white'
                        : 'bg-zinc-900/60 border-white/5 text-zinc-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{item.role}</span>
                        {item.highlight && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                            Protected
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-400">{item.tag}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-mono font-bold text-white">{item.share}</span>
                      <span className="text-[10px] text-zinc-500 block">statutory entitlement</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Legal Citation Footnote */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-[11px] text-zinc-400 leading-relaxed flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span>{liveShareResult.legalCitation}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 4: CORE CAPABILITIES MATRIX
         ════════════════════════════════════════ */}
      <section id="features" className="relative py-24 px-6 sm:px-12 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono tracking-widest text-zinc-500 uppercase">
            Comprehensive Suite
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 tracking-tight">
            Six Specialized Modules in One Architecture
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Module 1 */}
          <div 
            onClick={() => onNavigateSection ? onNavigateSection('tree') : onGetStarted()}
            className="group p-6 rounded-3xl bg-zinc-950/80 border border-white/10 hover:border-white/30 transition-all cursor-pointer hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-5 group-hover:scale-110 transition-transform">
              <GitFork className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                Lineage Tree Studio
              </h3>
              <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Visual node editor mapping 4 generations of family lineage with automatic coparcenary classification and branch isolation.
            </p>
          </div>

          {/* Module 2 */}
          <div 
            onClick={() => onNavigateSection ? onNavigateSection('courtroom') : onGetStarted()}
            className="group p-6 rounded-3xl bg-zinc-950/80 border border-white/10 hover:border-white/30 transition-all cursor-pointer hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-110 transition-transform">
              <Gavel className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                AI Mock Courtroom
              </h3>
              <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Simulate courtroom cross-examinations, challenge testamentary capacity, and test partition claims against an AI Judge.
            </p>
          </div>

          {/* Module 3 */}
          <div 
            onClick={() => onNavigateSection ? onNavigateSection('calculator') : onGetStarted()}
            className="group p-6 rounded-3xl bg-zinc-950/80 border border-white/10 hover:border-white/30 transition-all cursor-pointer hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
              <Scale className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                Statutory Share Engine
              </h3>
              <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Mathematical calculation of Mitakshara notional partition shares, Dayabhaga rules, and Indian Succession Act divisions.
            </p>
          </div>

          {/* Module 4 */}
          <div 
            onClick={() => onNavigateSection ? onNavigateSection('dashboard') : onGetStarted()}
            className="group p-6 rounded-3xl bg-zinc-950/80 border border-white/10 hover:border-white/30 transition-all cursor-pointer hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-5 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">
                Dispute Risk Radar
              </h3>
              <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Predict litigation vulnerabilities: undivided coparcenary land, lack of mutation records, unprobated wills, and co-heir disputes.
            </p>
          </div>

          {/* Module 5 */}
          <div 
            onClick={() => onNavigateSection ? onNavigateSection('womens-rights') : onGetStarted()}
            className="group p-6 rounded-3xl bg-zinc-950/80 border border-white/10 hover:border-white/30 transition-all cursor-pointer hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-5 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-white group-hover:text-pink-400 transition-colors">
                Women's Rights Center
              </h3>
              <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Deep dive into Section 6 amendments, Stridhan protections, widow's rights, and matrimonial property legal safeguards.
            </p>
          </div>

          {/* Module 6 */}
          <div 
            onClick={() => onNavigateSection ? onNavigateSection('interview') : onGetStarted()}
            className="group p-6 rounded-3xl bg-zinc-950/80 border border-white/10 hover:border-white/30 transition-all cursor-pointer hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                Fast Legal AI Assistant
              </h3>
              <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Sub-millisecond legal intelligence grounded in Indian case law with voice interaction and instant drafting guidance.
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 5: LANDMARK PRECEDENTS GROUNDING
         ════════════════════════════════════════ */}
      <section id="precedents" className="relative py-24 px-6 sm:px-12 max-w-7xl mx-auto border-t border-white/5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase">
              Judicial Authority
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 tracking-tight">
              Supreme Court Jurisprudence Engine
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md">
            Algorithms strictly aligned with authoritative rulings from the Supreme Court of India.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-zinc-950 border border-white/10">
            <span className="text-xs font-mono text-blue-400 block mb-2">(2020) 9 SCC 1</span>
            <h4 className="text-base font-bold text-white mb-2">Vineeta Sharma v. Rakesh Sharma</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Conferred unobstructed coparcenary rights upon daughters by birth under Section 6. Validated retroactively regardless of whether father was alive on Sept 9, 2005.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-950 border border-white/10">
            <span className="text-xs font-mono text-emerald-400 block mb-2">2022 LiveLaw (SC) 71</span>
            <h4 className="text-base font-bold text-white mb-2">Arunachala Gounder v. Ponnusamy</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Self-acquired property of a Hindu male dying intestate devolves by succession upon his daughters in preference to collateral heirs, even prior to the 1956 enactment.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-950 border border-white/10">
            <span className="text-xs font-mono text-purple-400 block mb-2">(2018) 3 SCC 343</span>
            <h4 className="text-base font-bold text-white mb-2">Danamma @ Suman Surpur v. Amar</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Daughters are entitled to claim partition of coparcenary property and hold equal standing with male coparceners in preliminary decrees.
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 6: INTERACTIVE SEARCHABLE FAQ
         ════════════════════════════════════════ */}
      <section id="faq" className="relative py-24 px-6 sm:px-12 max-w-4xl mx-auto border-t border-white/5">
        <div className="text-center mb-12">
          <span className="text-xs font-mono tracking-widest text-zinc-500 uppercase">
            Legal Clarifications
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 tracking-tight">
            Frequently Answered Questions
          </h2>
          <p className="text-sm text-zinc-400 mt-2">
            Authoritative answers on succession, partition deeds, and land mutation.
          </p>

          {/* FAQ Search input */}
          <div className="relative mt-6 max-w-md mx-auto">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-500" />
            <input
              type="text"
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              placeholder="Search legal topics (e.g. Daughter, Will, Khata)..."
              className="w-full bg-zinc-900 border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-white/30 placeholder-zinc-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredFaqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-zinc-950 border border-white/10 transition-colors"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between text-left gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-zinc-500">0{idx + 1}</span>
                  <span className="text-sm sm:text-base font-semibold text-white">{faq.q}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono bg-white/5 text-zinc-400 px-2 py-0.5 rounded border border-white/5 hidden sm:inline-block">
                    {faq.tag}
                  </span>
                  <span className="text-lg text-zinc-400 font-mono">
                    {expandedFaq === idx ? '−' : '+'}
                  </span>
                </div>
              </button>

              {expandedFaq === idx && (
                <div className="mt-3 pt-3 border-t border-white/5 text-xs sm:text-sm text-zinc-400 leading-relaxed pl-7">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 7: CONTACT & LEGAL ADVISORY SUPPORT
         ════════════════════════════════════════ */}
      <section id="contact" className="relative py-24 px-6 sm:px-12 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono tracking-widest text-blue-400 uppercase bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            Dedicated Advisory
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-4 tracking-tight">
            Connect with ADHIKAR Legal Specialists
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 mt-3 leading-relaxed">
            Have questions on ancestral land mutation, partition deed drafting, or daughter's coparcenary inheritance? Our jurisdictional team is here to assist.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Direct Contact & Office Details */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Direct Cards */}
            <div className="p-6 rounded-3xl bg-zinc-950 border border-white/10 space-y-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-400" />
                Direct Communication Channels
              </h3>

              <div className="space-y-4 text-xs sm:text-sm">
                <a 
                  href="mailto:support@adhikar.legal"
                  className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/80 border border-white/5 hover:border-white/20 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-xs">Official Email Support</span>
                    <span className="text-white font-semibold group-hover:text-blue-400 transition-colors">support@adhikar.legal</span>
                  </div>
                </a>

                <a 
                  href="tel:+911149823200"
                  className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/80 border border-white/5 hover:border-white/20 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-xs">National Legal Helpline (Toll-Free)</span>
                    <span className="text-white font-semibold group-hover:text-emerald-400 transition-colors">+91 (011) 4982-3200</span>
                  </div>
                </a>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/80 border border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-xs">Operational Hours</span>
                    <span className="text-white font-semibold">Monday – Saturday: 9:00 AM – 7:30 PM IST</span>
                    <span className="text-[11px] text-zinc-500 block mt-0.5">Average digital response time: &lt; 45 minutes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Office Locations */}
            <div className="p-6 rounded-3xl bg-zinc-950 border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-400" />
                Institutional Headquarters
              </h3>

              <div className="space-y-3 text-xs text-zinc-300">
                <div className="p-3 bg-zinc-900/60 rounded-xl border border-white/5">
                  <strong className="text-white block text-sm mb-0.5">New Delhi (Litigation & Research Hub)</strong>
                  <p className="text-zinc-400 leading-relaxed">
                    Supreme Court Bar Block, Bhagwan Das Road, Mandi House, New Delhi 110001, India
                  </p>
                </div>

                <div className="p-3 bg-zinc-900/60 rounded-xl border border-white/5">
                  <strong className="text-white block text-sm mb-0.5">Bengaluru (AI & Jurisprudence Labs)</strong>
                  <p className="text-zinc-400 leading-relaxed">
                    JurisTech Center, 4th Block, 80 Feet Road, Koramangala, Bengaluru, Karnataka 560034, India
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Consultation Request Form */}
          <div className="lg:col-span-7 bg-zinc-950 rounded-3xl border border-white/10 p-6 sm:p-10 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-1">Submit Legal Inquiry or Consultation Request</h3>
            <p className="text-xs text-zinc-400 mb-6">
              Our verified legal researchers and algorithmic advocates will review your query within 24 hours.
            </p>

            {contactSubmitted ? (
              <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-3 animate-in fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">Inquiry Received Successfully</h4>
                <p className="text-xs text-zinc-300 max-w-md mx-auto leading-relaxed">
                  Thank you. Your succession case query has been assigned reference ID <strong>#ADH-{Math.floor(100000 + Math.random() * 900000)}</strong>. A legal associate will contact you shortly via email.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Adv. Rajesh Sharma"
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                      Subject / Legal Area
                    </label>
                    <select
                      value={contactCategory}
                      onChange={(e) => setContactCategory(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Coparcenary & Succession Rights">Coparcenary & Succession Rights</option>
                      <option value="Partition Deed Review">Partition Deed Drafting & Review</option>
                      <option value="Daughter Equal Inheritance Claim">Daughter's Equal Inheritance Claim</option>
                      <option value="Will Validity & Probate">Will Validity & Probate Guidance</option>
                      <option value="Land Mutation & RTC / Khata">Land Mutation & Revenue Records</option>
                      <option value="Institutional & Enterprise Inquiry">Institutional & API Integration</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    Case Summary / Inquiry Details <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Describe family relationship, nature of property (ancestral or self-acquired), dispute status, or specific legal questions..."
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingContact}
                    className="w-full py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-98 shadow-xl disabled:opacity-50"
                  >
                    {isSubmittingContact ? (
                      <span>Submitting Inquiry...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Official Legal Inquiry</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 8: PRE-FOOTER INVOCATION
         ════════════════════════════════════════ */}
      <section className="relative py-20 px-6 sm:px-12 max-w-7xl mx-auto border-t border-white/10 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white mx-auto mb-6">
            <Scale className="w-6 h-6" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Map Your Family Legacy in Minutes
          </h2>
          <p className="text-sm text-zinc-400 mt-4 leading-relaxed">
            Protect generational wealth, ensure statutory equality for all heirs, and eliminate dispute risks before stepping into court.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white hover:bg-zinc-200 text-black font-bold text-sm tracking-wide shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              Enter Legal Workspace
            </button>
            <button
              onClick={() => onNavigateSection ? onNavigateSection('courtroom') : onGetStarted()}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/15 font-semibold text-sm transition-all"
            >
              Test Mock Courtroom
            </button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 9: TRUST-FIRST FOOTER WITH COPYRIGHT, TRADEMARK & SOCIALS
         ════════════════════════════════════════ */}
      <footer className="relative bg-[#08080a] border-t border-white/10 pt-16 pb-12 px-6 sm:px-12 text-zinc-400">
        <div className="max-w-7xl mx-auto">
          
          {/* Top Row: Brand & Verification Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
            
            {/* Col 1: Brand & Trademarks */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white">
                  <Scale className="w-4 h-4" />
                </div>
                <span className="text-lg font-bold text-white tracking-wider">ADHIKAR<span className="text-blue-400 text-xs ml-0.5">™</span></span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
                India's foundational AI Jurisprudence Platform. Algorithmic succession calculations, coparcenary share engines, and precedent grounding strictly adhering to Supreme Court authorities.
              </p>

              {/* Social Accounts with verified links */}
              <div className="pt-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block mb-3">Official Verified Channels</span>
                <div className="flex items-center gap-3">
                  {/* Twitter / X */}
                  <a
                    href="https://twitter.com/adhikar_legal"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 flex items-center justify-center text-zinc-300 hover:text-white transition-all hover:scale-110"
                    aria-label="ADHIKAR on X (Twitter)"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>

                  {/* LinkedIn */}
                  <a
                    href="https://linkedin.com/company/adhikar-legal"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 flex items-center justify-center text-zinc-300 hover:text-blue-400 transition-all hover:scale-110"
                    aria-label="ADHIKAR on LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>

                  {/* Instagram */}
                  <a
                    href="https://instagram.com/adhikar.legal"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 flex items-center justify-center text-zinc-300 hover:text-pink-400 transition-all hover:scale-110"
                    aria-label="ADHIKAR on Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>

                  {/* GitHub */}
                  <a
                    href="https://github.com/adhikar-legal"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 flex items-center justify-center text-zinc-300 hover:text-white transition-all hover:scale-110"
                    aria-label="ADHIKAR on GitHub"
                  >
                    <Github className="w-4 h-4" />
                  </a>

                  {/* YouTube */}
                  <a
                    href="https://youtube.com/@adhikar-legal"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 flex items-center justify-center text-zinc-300 hover:text-red-400 transition-all hover:scale-110"
                    aria-label="ADHIKAR on YouTube"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Col 2: Navigation Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Platform Modules</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button 
                    onClick={() => onNavigateSection ? onNavigateSection('calculator') : onGetStarted()}
                    className="hover:text-white transition-colors"
                  >
                    Succession Share Calculator
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigateSection ? onNavigateSection('tree') : onGetStarted()}
                    className="hover:text-white transition-colors"
                  >
                    Lineage Tree Studio
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigateSection ? onNavigateSection('courtroom') : onGetStarted()}
                    className="hover:text-white transition-colors"
                  >
                    AI Mock Courtroom
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigateSection ? onNavigateSection('womens-rights') : onGetStarted()}
                    className="hover:text-white transition-colors"
                  >
                    Women's Rights Center
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigateSection ? onNavigateSection('interview') : onGetStarted()}
                    className="hover:text-white transition-colors"
                  >
                    AI Legal Voice Assistant
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Jurisprudence & Precedents */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Statutory Foundations</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="#precedents" onClick={(e) => handleNavClick(e, '#precedents')} className="hover:text-white transition-colors">
                    Vineeta Sharma (2020) SC
                  </a>
                </li>
                <li>
                  <a href="#precedents" onClick={(e) => handleNavClick(e, '#precedents')} className="hover:text-white transition-colors">
                    Arunachala Gounder (2022) SC
                  </a>
                </li>
                <li>
                  <a href="#precedents" onClick={(e) => handleNavClick(e, '#precedents')} className="hover:text-white transition-colors">
                    Section 6 Coparcenary Rules
                  </a>
                </li>
                <li>
                  <a href="#precedents" onClick={(e) => handleNavClick(e, '#precedents')} className="hover:text-white transition-colors">
                    Hindu Succession Act, 1956
                  </a>
                </li>
                <li>
                  <a href="#precedents" onClick={(e) => handleNavClick(e, '#precedents')} className="hover:text-white transition-colors">
                    Indian Succession Act, 1925
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4: Trust, Security & Compliance */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Trust & Compliance</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button 
                    onClick={() => setActiveLegalModal('terms')} 
                    className="hover:text-white transition-colors text-left flex items-center gap-1.5"
                  >
                    <span>Terms of Service</span>
                    <ExternalLink className="w-3 h-3 text-zinc-500" />
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveLegalModal('privacy')} 
                    className="hover:text-white transition-colors text-left flex items-center gap-1.5"
                  >
                    <span>Privacy & DPDP Act Policy</span>
                    <ExternalLink className="w-3 h-3 text-zinc-500" />
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveLegalModal('disclaimer')} 
                    className="hover:text-white transition-colors text-left flex items-center gap-1.5"
                  >
                    <span>Bar Council Disclaimer</span>
                    <ExternalLink className="w-3 h-3 text-zinc-500" />
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveLegalModal('security')} 
                    className="hover:text-white transition-colors text-left flex items-center gap-1.5"
                  >
                    <span>Security & ISO 27001</span>
                    <ExternalLink className="w-3 h-3 text-zinc-500" />
                  </button>
                </li>
                <li>
                  <a href="#contact" onClick={(e) => handleNavClick(e, '#contact')} className="hover:text-white transition-colors">
                    Advisory Inquiries
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Compliance & Trust Badges Strip */}
          <div className="py-6 border-b border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>DPDP Act 2023 Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-400 shrink-0" />
              <span>ISO 27001 Security Standard</span>
            </div>
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Supreme Court Case-Grounded</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-purple-400 shrink-0" />
              <span>256-Bit AES Cryptography</span>
            </div>
          </div>

          {/* Bottom Legal Claims & Trademarks */}
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500 text-center md:text-left">
            <div className="space-y-1">
              <p>
                <strong>Trademark Notice:</strong> ADHIKAR™, The Next Layer of Intelligence™, and Jurisprudence Engine™ are registered trademarks of ADHIKAR Legal Technologies India Pvt. Ltd.
              </p>
              <p>
                <strong>Copyright Claim:</strong> © {new Date().getFullYear()} ADHIKAR Legal Technologies India Pvt. Ltd. All rights reserved. Registered under the Companies Act, 2013.
              </p>
            </div>
            <div className="text-zinc-500 text-xs shrink-0">
              <span>Engine v4.2.0 • Hosted in India Sovereign Cloud</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Interactive Legal Modals */}
      <LegalModal 
        type={activeLegalModal} 
        onClose={() => setActiveLegalModal(null)} 
      />
    </div>
  );
};
