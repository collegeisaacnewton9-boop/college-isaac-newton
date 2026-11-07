import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  ArrowRight, 
  Phone, 
  Sparkles, 
  AlertCircle, 
  ChevronRight, 
  X, 
  BookOpen, 
  GraduationCap,
  MessageSquare
} from 'lucide-react';
import { SCHOOL_INFO } from '../../data/mockData';

interface ExamNotificationBannerProps {
  onOpenSchedule: () => void;
  onNavigate: (page: string, subSection?: string) => void;
}

export const ExamNotificationBanner: React.FC<ExamNotificationBannerProps> = ({
  onOpenSchedule,
  onNavigate,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const phone1 = SCHOOL_INFO.phone1 || '+509 3316-0934';
  const phone2 = SCHOOL_INFO.phone2 || '+509 3721-1818';

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 border border-amber-400/60 sm:border-2 shadow-lg text-white">
        {/* Subtle decorative glowing corner */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Dismiss button */}
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 z-10 w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          title="Masquer cet avis"
          aria-label="Fermer la notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="relative p-3.5 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 sm:gap-4 pr-9 lg:pr-5">
          
          {/* Left: Content & Notice */}
          <div className="flex items-start gap-3 sm:gap-4 min-w-0 max-w-3xl">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                  <Sparkles className="w-3 h-3" />
                  1er Contrôle Académique (2026–2027)
                </span>
                <span className="text-[11px] font-mono text-amber-300 font-semibold">
                  Semaine du 9 au 13 Novembre 2026
                </span>
              </div>

              <h3 className="font-serif text-sm sm:text-base lg:text-lg font-bold text-white tracking-tight">
                Avis aux Parents & Élèves : Calendrier des Épreuves Écrites
              </h3>

              <p className="text-xs text-slate-200 leading-relaxed font-light">
                La grille officielle des cours et horaires d'évaluation pour le <strong>3e Cycle Fondamental (7e, 8e, 9e AF)</strong> et le <strong>Nouveau Secondaire (NS1 à NS4)</strong> est disponible. 
                <span className="text-amber-200 font-medium"> À noter : les examens se déroulent aux heures habituelles des cours par les professeurs.</span>
              </p>

              {/* 2 Contact numbers for secretariat - Fully responsive */}
              <div className="pt-1 flex flex-wrap items-center gap-2 sm:gap-2.5 text-[11px] text-slate-300">
                <span className="text-amber-300 font-semibold flex items-center gap-1 shrink-0">
                  <Phone className="w-3 h-3" /> Secrétariat :
                </span>
                <a 
                  href={`tel:${phone1.replace(/[^0-9+]/g, '')}`} 
                  className="font-mono font-bold text-white hover:text-amber-300 underline transition-colors"
                >
                  {phone1}
                </a>
                <span className="text-slate-600">/</span>
                <a 
                  href={`tel:${phone2.replace(/[^0-9+]/g, '')}`} 
                  className="font-mono font-bold text-white hover:text-amber-300 underline transition-colors"
                >
                  {phone2}
                </a>
                <span className="text-slate-400 hidden sm:inline">
                  (Renseignements dès 07h15)
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions - Natural compact sizing on mobile, no oversized full-width stretching */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-auto shrink-0 justify-start sm:justify-end pt-2 lg:pt-0 border-t border-slate-800/80 lg:border-t-0">
            <button
              type="button"
              onClick={onOpenSchedule}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-bold text-xs sm:text-sm shadow-xs hover:shadow transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0 text-slate-950" />
              <span>Voir l'horaire complet</span>
              <ArrowRight className="w-3 h-3 shrink-0 text-slate-950" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('events')}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white font-medium text-xs sm:text-sm border border-white/15 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Calendar className="w-3.5 h-3.5 shrink-0 text-slate-300" />
              <span>Agenda annuel</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
