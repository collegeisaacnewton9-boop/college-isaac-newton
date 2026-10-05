import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Users, 
  Clock, 
  Filter, 
  Download, 
  GraduationCap, 
  Palmtree, 
  UserCheck, 
  Sparkles, 
  AlertCircle,
  FileCheck,
  Phone,
  CheckCircle2,
  CalendarDays,
  Info
} from 'lucide-react';
import { SchoolEvent } from '../types';
import { apiService } from '../services/api';
import { SCHOOL_INFO } from '../data/mockData';
import { InteractiveCalendar } from '../components/events/InteractiveCalendar';

interface EventsPageProps {
  onNavigate?: (page: string, subSection?: string) => void;
}

export const EventsPage: React.FC<EventsPageProps> = ({ onNavigate }) => {
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiService.getEvents().then((data) => {
      setEvents(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      
      {/* 1. Header & Academic Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-mono font-semibold border border-white/15 backdrop-blur-xs">
            <CalendarDays className="w-3.5 h-3.5 text-amber-400" />
            <span>Calendrier Académique Officiel · {SCHOOL_INFO.currentYear}</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Calendrier Scolaire & Événements
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
            Planifiez sereinement votre année scolaire au <strong>Collège Isaac Newton</strong> : dates officielles des épreuves d'examens (9e AF & NS4), jours fériés selon le MENFP, rencontres trimestrielles parents-professeurs et événements scientifiques du campus.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate?.('resources', 'calendrier')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger le Calendrier PDF Officiel</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate?.('pre-registration')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm transition-colors border border-white/20 cursor-pointer"
            >
              <FileCheck className="w-4 h-4 text-amber-300" />
              <span>Session d'Admission & Tests</span>
            </button>
          </div>
        </div>

        {/* Decorative background watermark */}
        <div className="absolute right-6 -bottom-8 text-white/5 pointer-events-none select-none">
          <CalendarIcon className="w-72 h-72 sm:w-96 sm:h-96" />
        </div>
      </div>

      {/* 2. Key Academic Milestone Cards (Examens, Jours Fériés, Réunions Parents-Profs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Examens */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-rose-300 hover:shadow-sm transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 rounded-xl bg-rose-50 text-rose-700">
                <GraduationCap className="w-5 h-5" />
              </span>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                Épreuves d’État
              </span>
            </div>
            <h3 className="font-serif font-bold text-slate-900 text-base mb-1">
              Examens Blancs & Contrôles
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-light">
              Sessions blanches en conditions réelles d'examen d'État pour les classes de 9e AF et Nouveau Secondaire 4 (NS4).
            </p>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="font-mono text-slate-500">22 - 26 Janvier 2027</span>
            <span className="font-semibold text-rose-700">9e AF & NS4</span>
          </div>
        </div>

        {/* Card 2: Réunions Parents-Profs */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <UserCheck className="w-5 h-5" />
              </span>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Trimestriel
              </span>
            </div>
            <h3 className="font-serif font-bold text-slate-900 text-base mb-1">
              Rencontres Parents-Professeurs
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-light">
              Bilan personnalisé, remise en main propre des bulletins scolaires et entretiens individuels d’orientation.
            </p>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="font-mono text-slate-500">Samedi 5 Décembre 2026</span>
            <span className="font-semibold text-emerald-700">1er Trimestre</span>
          </div>
        </div>

        {/* Card 3: Jours Fériés MENFP */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-amber-300 hover:shadow-sm transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
                <Palmtree className="w-5 h-5" />
              </span>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                Calendrier MENFP
              </span>
            </div>
            <h3 className="font-serif font-bold text-slate-900 text-base mb-1">
              Jours Fériés & Congés Scolaires
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-light">
              Fermetures administratives et congés officiels conformément au calendrier du Ministère de l’Éducation Nationale.
            </p>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="font-mono text-slate-500">18 Novembre 2026</span>
            <span className="font-semibold text-amber-800">Bataille de Vertières</span>
          </div>
        </div>

      </div>

      {/* 3. The Interactive Calendar Component */}
      <section aria-label="Composant de Calendrier Interactif">
        <InteractiveCalendar 
          events={events}
          onNavigateToResources={() => onNavigate?.('resources', 'calendrier')}
        />
      </section>

      {/* 4. Important Administrative Information & Useful Tips */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-900" />
          <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-900">
            Modalités Pratiques & Fonctionnement de l’Agenda
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-slate-600 leading-relaxed">
          <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">
              Horaires des Cours
            </h3>
            <p>
              Les cours débutent impérativement à <strong>07h30</strong> pour tous les cycles (fermeture de la barrière à 07h45). Sortie à <strong>15h00</strong> du lundi au vendredi.
            </p>
          </div>

          <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">
              Séances Gratuites du Samedi
            </h3>
            <p>
              Des cours de renforcement intensif en mathématiques, sciences expérimentales et rédaction sont organisés sans frais pour les candidats aux examens d'État (9e AF et NS4).
            </p>
          </div>

          <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">
              Secrétariat & Justification d'Absence
            </h3>
            <p>
              Toute absence doit être signalée au plus tard le jour même avant 09h00 par téléphone au <strong className="font-mono text-slate-900">+509 3721-1818</strong> ou par e-mail.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
