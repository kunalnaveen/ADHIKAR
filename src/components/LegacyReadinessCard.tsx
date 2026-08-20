import React, { useState } from 'react';
import { 
  Trophy, 
  ShieldCheck, 
  CheckCircle2, 
  Circle, 
  ChevronRight
} from 'lucide-react';
import { AppSettings, FamilyTreeData } from '../types';
import { t as translateText, translateNumber } from '../utils/translate';

interface MilestoneTask {
  id: string;
  title: string;
  points: number;
  category: string;
  viewTarget: string;
  description: string;
  isCompleted: boolean;
}

interface LegacyReadinessCardProps {
  settings: AppSettings;
  onNavigate: (view: string) => void;
  tree?: FamilyTreeData;
}

const STORAGE_KEY = 'adhikar_readiness_tasks_state';

export const LegacyReadinessCard: React.FC<LegacyReadinessCardProps> = ({
  settings,
  onNavigate,
  tree
}) => {
  const tr = (str: string) => translateText(str, settings.language);
  const trNum = (num: number | string) => translateNumber(num, settings.language);

  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      'tree_mapped': true,
      'shares_calculated': true,
      'property_deed_vault': false,
      'will_drafted': false,
      'sro_identified': true
    };
  });

  const tasks: MilestoneTask[] = [
    {
      id: 'tree_mapped',
      title: tr("Map Family Lineage & Legal Heirs"),
      points: 25,
      category: 'Genealogy',
      viewTarget: 'tree',
      description: tr("Define all Class I surviving heirs, coparceners, and parents."),
      isCompleted: !!completedTasks['tree_mapped']
    },
    {
      id: 'shares_calculated',
      title: tr("Calculate Statutory Succession Shares"),
      points: 20,
      category: 'Succession',
      viewTarget: 'calculator',
      description: tr("Verify equal 2005 HSA coparcenary entitlement for daughters & sons."),
      isCompleted: !!completedTasks['shares_calculated']
    },
    {
      id: 'property_deed_vault',
      title: tr("Upload Property Deeds to Encrypted Vault"),
      points: 20,
      category: 'Security',
      viewTarget: 'vault',
      description: tr("Store Jamabandi / 7-12 extract & Sale Deed with biometric lock."),
      isCompleted: !!completedTasks['property_deed_vault']
    },
    {
      id: 'will_drafted',
      title: tr("Draft / Register Testamentary Intent (Will)"),
      points: 20,
      category: 'Estate Planning',
      viewTarget: 'will',
      description: tr("Clear disposition of self-acquired assets to prevent future litigation."),
      isCompleted: !!completedTasks['will_drafted']
    },
    {
      id: 'sro_identified',
      title: tr("Identify Local SRO & Tehsildar Court"),
      points: 15,
      category: 'Revenue Portal',
      viewTarget: 'offices',
      description: tr("Map nearest Sub-Registrar Office & state mutation portal via GPS."),
      isCompleted: !!completedTasks['sro_identified']
    }
  ];

  const totalPoints = 100;
  const currentPoints = tasks.reduce((sum, task) => sum + (task.isCompleted ? task.points : 0), 0);
  const completionPercentage = Math.round((currentPoints / totalPoints) * 100);

  const toggleTask = (taskId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = {
      ...completedTasks,
      [taskId]: !completedTasks[taskId]
    };
    setCompletedTasks(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {}
  };

  const getReadinessLevel = () => {
    if (completionPercentage >= 80) {
      return {
        levelName: tr("Dispute-Proof Legacy"),
        badgeColor: "text-emerald-400 bg-emerald-950/60 border-emerald-500/30",
        message: tr("Documentation is legally resilient against courtroom partition challenges.")
      };
    } else if (completionPercentage >= 50) {
      return {
        levelName: tr("Coparcenary Protected"),
        badgeColor: "text-indigo-300 bg-indigo-950/60 border-indigo-500/30",
        message: tr("Core heirs mapped. Complete the remaining steps to achieve full dispute immunity.")
      };
    } else {
      return {
        levelName: tr("Inheritance Initiator"),
        badgeColor: "text-slate-300 bg-slate-900 border-slate-700",
        message: tr("Begin your estate verification to protect ancestral rights.")
      };
    }
  };

  const currentLevel = getReadinessLevel();

  return (
    <div className="w-full space-y-4">
      {/* Header Bar with Progress Meter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${currentLevel.badgeColor} flex items-center gap-1 font-serif`}>
              <Trophy className="w-3 h-3 text-indigo-400" />
              <span>{currentLevel.levelName}</span>
            </span>
            <span className="text-xs font-mono font-bold text-white">
              {trNum(completionPercentage)}% {tr("Score")}
            </span>
          </div>
          <h3 className="text-base font-bold font-serif text-white flex items-center gap-2">
            <span>{tr("Legacy Readiness & Protection Checklist")}</span>
          </h3>
        </div>

        {/* Linear Progress Indicator */}
        <div className="w-full sm:w-64 space-y-1.5 shrink-0">
          <div className="flex justify-between text-[11px] font-medium text-slate-400">
            <span>{tr("Immunity Status")}</span>
            <span className={completionPercentage >= 80 ? "text-emerald-400 font-bold" : "text-indigo-300 font-bold"}>
              {completionPercentage >= 80 ? tr("Protected") : tr("In Progress")}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                completionPercentage >= 80 ? 'bg-emerald-500' : 'bg-indigo-500'
              }`}
              style={{ width: `${Math.max(completionPercentage, 5)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Seamless Integrated Tasks List - Flat Rows with subtle dividers, NO nested card boxes */}
      <div className="divide-y divide-slate-800/80">
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => onNavigate(task.viewTarget)}
            className="py-3 px-2 flex items-center justify-between gap-3 hover:bg-slate-900/40 rounded-lg transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button
                type="button"
                onClick={(e) => toggleTask(task.id, e)}
                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all ${
                  task.isCompleted
                    ? 'bg-emerald-500 text-slate-950'
                    : 'border border-slate-700 bg-slate-900 hover:border-indigo-400 text-transparent'
                }`}
                title={task.isCompleted ? "Mark Incomplete" : "Mark Complete"}
              >
                {task.isCompleted ? <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" /> : <Circle className="w-3 h-3" />}
              </button>

              <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <div className="min-w-0">
                  <span className={`text-xs font-semibold ${task.isCompleted ? 'text-emerald-300' : 'text-slate-200 group-hover:text-white'}`}>
                    {task.title}
                  </span>
                  <p className="text-[11px] text-slate-400 truncate max-w-xl">
                    {task.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono text-slate-400">
                    +{trNum(task.points)} pts
                  </span>
                </div>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};

