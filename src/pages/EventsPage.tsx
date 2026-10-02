import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Download, 
  GraduationCap, 
  Palmtree, 
  Sparkles, 
  FileCheck,
  CalendarDays,
  ArrowRight
} from 'lucide-react';
import { SchoolEvent } from '../types';
import { apiService } from '../services/api';
import { SCHOOL_INFO, INITIAL_EVENTS } from '../data/mockData';
import { InteractiveCalendar, AcademicGroupFilter } from '../components/events/InteractiveCalendar';

interface EventsPageProps {
  onNavigate?: (page: string, subSection?: string) => void;
}

export const EventsPage: React.FC<EventsPageProps> = ({ onNavigate }) => {
  // 1. Initialiser directement avec les données locales complètes (INITIAL_EVENTS)
  const [events, setEvents] = useState<SchoolEvent[]>(INITIAL_EVENTS);
  const [selectedGroup, setSelectedGroup] = useState<AcademicGroupFilter>('ALL');

  useEffect(() => {
    // 2. Synchronisation transparente avec l'API / stockage persistant
    apiService.getEvents().then((data) => {
      if (data && data.length > 0) {
        setEvents(data);
      }
    }).catch(() => {
      // Données locales sécurisées par défaut
      setEvents(INITIAL_EVENTS);
    });
  }, []);

  // Décompte dynamique des catégories clés
  const counts = React.useMemo(() => {
    let examens = 0;
    let vacances = 0;
    let activites = 0;
    events.forEach(e => {
      if (e.category === 'Examen') examens++;
      else if (e.category === 'Férié') vacances++;
      else activites++;
    });
    return { examens, vacances, activites, total: events.length };
  }, [events]);

  const handleSelectGroup = (group: AcademicGroupFilter) => {
    setSelectedGroup(group);
    const element = document.getElementById('calendrier-interactif-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      
      {/* 1. Header & Academic Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-mono font-semibold border border-white/15 backdrop-blur-xs">
            <CalendarDays className="w-3.5 h-3.5 text-amber-400" />
            <span>Calendrier Académique Officiel · Année {SCHOOL_INFO.currentYear}</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Calendrier Scolaire & Événements Clés
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
            Retrouvez l’ensemble des dates maîtresses du <strong>Collège Isaac Newton</strong> à Delmas 50 : <strong>examens officiels (9e AF & NS4 Bac)</strong>, <strong>vacances et jours fériés MENFP</strong>, et <strong>activités pédagogiques, scientifiques et sportives</strong>.
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
              <span>Sessions d'Admission & Préinscriptions</span>
            </button>
          </div>
        </div>

        {/* Decorative background watermark */}
        <div className="absolute right-6 -bottom-8 text-white/5 pointer-events-none select-none">
          <CalendarIcon className="w-72 h-72 sm:w-96 sm:h-96" />
        </div>
      </div>

      {/* 2. Key Academic Milestone Cards cliquables pour filtrer directement le calendrier */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Examens */}
        <div 
          onClick={() => handleSelectGroup('EXAMENS')}
          className={`bg-white rounded-2xl p-5 border shadow-xs transition-all flex flex-col justify-between cursor-pointer group ${
            selectedGroup === 'EXAMENS' 
              ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/20' 
              : 'border-slate-200/90 hover:border-rose-300 hover:shadow-md'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2.5 rounded-xl bg-rose-50 text-rose-700 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </span>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                {counts.examens} dates clés
              </span>
            </div>
            <h3 className="font-serif font-bold text-slate-900 text-base mb-1 group-hover:text-rose-800 transition-colors">
              Examens Blancs & Épreuves d'État
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-light">
              Sessions diagnostiques, examens trimestriels, épreuves blanches 9e AF & NS4 Baccalauréat et épreuves officielles MENFP.
            </p>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="font-mono text-slate-500">22 - 26 Janvier 2027</span>
            <span className="font-bold text-rose-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Voir les dates</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Card 2: Vacances & Jours Fériés MENFP */}
        <div 
          onClick={() => handleSelectGroup('VACANCES')}
          className={`bg-white rounded-2xl p-5 border shadow-xs transition-all flex flex-col justify-between cursor-pointer group ${
            selectedGroup === 'VACANCES' 
              ? 'border-amber-500 ring-2 ring-amber-200 bg-amber-50/20' 
              : 'border-slate-200/90 hover:border-amber-300 hover:shadow-md'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2.5 rounded-xl bg-amber-50 text-amber-700 group-hover:scale-105 transition-transform">
                <Palmtree className="w-5 h-5" />
              </span>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                {counts.vacances} congés officiels
              </span>
            </div>
            <h3 className="font-serif font-bold text-slate-900 text-base mb-1 group-hover:text-amber-800 transition-colors">
              Vacances Scolaires & Jours Fériés
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-light">
              Toussaint, Fête de Vertières, Vacances de Noël, Carnaval national, Semaine Sainte et Fête du Drapeau conformes au MENFP.
            </p>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="font-mono text-slate-500">19 Déc 2026 - 3 Jan 2027</span>
            <span className="font-bold text-amber-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Voir les congés</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Card 3: Activités, Réunions & Célébrations */}
        <div 
          onClick={() => handleSelectGroup('ACTIVITES')}
          className={`bg-white rounded-2xl p-5 border shadow-xs transition-all flex flex-col justify-between cursor-pointer group ${
            selectedGroup === 'ACTIVITES' 
              ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50/20' 
              : 'border-slate-200/90 hover:border-blue-300 hover:shadow-md'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2.5 rounded-xl bg-blue-50 text-blue-900 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </span>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                {counts.activites} événements
              </span>
            </div>
            <h3 className="font-serif font-bold text-slate-900 text-base mb-1 group-hover:text-blue-900 transition-colors">
              Activités, Réunions & Célébrations
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-light">
              Rencontres parents-professeurs trimestrielles, foire des sciences, tournois sportifs interclasses, hackathons et graduation.
            </p>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="font-mono text-slate-500">Samedi 5 Décembre 2026</span>
            <span className="font-bold text-blue-900 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Voir les activités</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

      </div>

      {/* 3. The Interactive Calendar Component */}
      <section id="calendrier-interactif-section" aria-label="Composant de Calendrier Interactif">
        <InteractiveCalendar 
          events={events}
          selectedGroupFilter={selectedGroup}
          onGroupFilterChange={setSelectedGroup}
          onNavigateToResources={() => onNavigate?.('resources', 'calendrier')}
        />
      </section>

    </div>
  );
};
