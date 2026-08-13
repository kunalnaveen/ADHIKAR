import React, { useState } from 'react';
import { AppSettings } from '../types';
import { translations } from '../data/translations';
import { womenCaseStudies } from '../data/mockData';
import { UserCheck, ShieldCheck, ChevronDown, ChevronUp, ArrowRight, HeartHandshake, BookOpen, CalendarCheck, Sparkles, PhoneCall, X } from 'lucide-react';
import { LegalConsultationScheduler } from './LegalConsultationScheduler';
import { MyConsultationsTimeline } from './MyConsultationsTimeline';

interface WomensRightsViewProps {
  onNavigate: (view: string) => void;
  settings: AppSettings;
}

export const WomensRightsView: React.FC<WomensRightsViewProps> = ({ onNavigate, settings }) => {
  const t = translations[settings.language] || translations.EN;

  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [showScheduler, setShowScheduler] = useState<boolean>(false);
  const [selectedTopicForBooking, setSelectedTopicForBooking] = useState<string | undefined>(undefined);

  const faqs = [
    {
      q: "Does marriage end a daughter's right in ancestral property?",
      a: "No! Following the 2005 Amendment to Section 6 of the Hindu Succession Act and the historic Supreme Court Vineeta Sharma judgment (2020), a daughter becomes a coparcener by birth with equal rights as a son, regardless of whether she was married before or after 2005.",
    },
    {
      q: "What rights does a Widow have over her husband's estate?",
      a: "Under Section 14 of the Hindu Succession Act 1956, property possessed by a Hindu female is held by her as absolute owner (full owner), not a limited estate. She is a Class I heir entitled to an equal share alongside children and mother.",
    },
    {
      q: "Can a father exclude his daughter completely in a Will?",
      a: "A father can freely dispose of his self-acquired property through a Will. However, he CANNOT exclude his daughter from her birthright share in ancestral coparcenary property.",
    },
    {
      q: "What is Stridhan and who owns it?",
      a: "Stridhan includes all gifts, jewelry, and property given to a woman before, during, or after marriage. She has absolute, exclusive ownership over her Stridhan.",
    },
  ];

  const handleOpenScheduler = (topic?: string) => {
    setSelectedTopicForBooking(topic);
    setShowScheduler(true);
  };

  return (
    <div className="flex flex-col w-full px-4 md:px-8 max-w-7xl mx-auto pt-6 pb-28 text-slate-100 gap-6">
      {/* Header Badge Card */}
      <div className="relative p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold w-fit">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Empowerment Center</span>
          </div>
          <h2 className="text-2xl font-bold font-sans text-white">{t.womensRightsCenter}</h2>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Complete legal clarity on daughters' equal coparcenary rights, widow's absolute ownership, and protection against coercion.
          </p>
        </div>

        <button
          onClick={() => handleOpenScheduler()}
          className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-indigo-500/20 shrink-0 transition-all active:scale-95"
        >
          <CalendarCheck className="w-4 h-4 text-emerald-400" />
          <span>Book Legal Consultation</span>
        </button>
      </div>

      {/* Embedded Meeting Scheduler View if active */}
      {showScheduler && (
        <div className="p-1 rounded-2xl bg-slate-900 border border-indigo-500/40 shadow-2xl relative animate-fade-in">
          <div className="p-4 bg-slate-950/80 rounded-xl flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Direct Consultation Booking</span>
            </div>
            <button
              onClick={() => setShowScheduler(false)}
              className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <LegalConsultationScheduler
            settings={settings}
            defaultTopic={selectedTopicForBooking}
            onClose={() => setShowScheduler(false)}
          />
        </div>
      )}

      {/* My Consultations & Case Timeline Panel */}
      <MyConsultationsTimeline onBookNew={handleOpenScheduler} />

      {/* 3 Core Rights Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between gap-3 shadow-md hover:border-indigo-500/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Daughter's Coparcenary</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Equal birthright share in ancestral coparcenary property equivalent to a son under the 2005 HSA Amendment.
            </p>
          </div>
          <button
            onClick={() => handleOpenScheduler('Daughter\'s Equal Coparcenary Right (Section 6 HSA)')}
            className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1 hover:underline text-left"
          >
            <span>Book Consultation for Daughter Rights</span> →
          </button>
        </div>

        {/* Card 2 */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between gap-3 shadow-md hover:border-indigo-500/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Widow's Absolute Ownership</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Full, unencumbered ownership rights over inherited property and guaranteed right of residence.
            </p>
          </div>
          <button
            onClick={() => handleOpenScheduler('Widow\'s Absolute Inheritance & Residence Right')}
            className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1 hover:underline text-left"
          >
            <span>Consult Widow Legal Expert</span> →
          </button>
        </div>

        {/* Card 3 */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between gap-3 shadow-md hover:border-indigo-500/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Mother's Right to Maintenance</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Guaranteed Class I share and maintenance protection under the Senior Citizens Welfare Act.
            </p>
          </div>
          <button
            onClick={() => handleOpenScheduler('Senior Mother Maintenance & Protection')}
            className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1 hover:underline text-left"
          >
            <span>Consult Senior Welfare Advocate</span> →
          </button>
        </div>
      </div>

      {/* Real Case Studies Scroll */}
      <div>
        <h3 className="text-lg font-bold text-white mb-3 font-sans">Know Your Power - Real Case Studies</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {womenCaseStudies.map((cs) => (
            <div key={cs.id} className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 p-6 flex flex-col justify-end min-h-[180px] shadow-lg">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity"
                style={{ backgroundImage: `url('${cs.bgImage}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />

              <div className="relative z-10">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider bg-indigo-600/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-xl">
                  {cs.tag}
                </span>
                <h4 className="text-base font-bold text-white mt-2 mb-1 font-sans">{cs.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{cs.summary}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 shadow-lg flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold text-white font-sans">Frequently Asked Questions</h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
              <button
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                className="w-full text-left p-4 flex items-center justify-between text-xs font-bold text-white hover:bg-slate-900 transition-colors"
              >
                <span>{faq.q}</span>
                {expandedFaq === i ? <ChevronUp className="w-4 h-4 text-indigo-400" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>

              {expandedFaq === i && (
                <div className="p-4 pt-0 text-xs text-slate-400 leading-relaxed border-t border-slate-800/80 bg-slate-900/30">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={() => handleOpenScheduler()}
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
      >
        <CalendarCheck className="w-4 h-4 text-emerald-400" />
        <span>Book Free Consultation With Legal Advocate</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
