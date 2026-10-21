import React, { useState, useEffect, useMemo } from 'react';
import { 
  CalendarDays,
  FileCheck,
  Info,
  Printer,
  ChevronRight,
  CalendarCheck,
  Settings
} from 'lucide-react';
import { SchoolEvent, User } from '../types';
import { apiService } from '../services/api';
import { SCHOOL_INFO } from '../data/mockData';
import { InteractiveCalendar } from '../components/events/InteractiveCalendar';
import { OfficialCalendarPrintModal } from '../components/events/OfficialCalendarPrintModal';

interface EventsPageProps {
  onNavigate?: (page: string, subSection?: string) => void;
  currentUser?: User | null;
}

export const EventsPage: React.FC<EventsPageProps> = ({ onNavigate, currentUser }) => {
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('2026-2027');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiService.getEvents().then((data) => {
      setEvents(data);
      setLoading(false);
    });
  }, []);

  // Compute available academic years from data
  const availableAcademicYears = useMemo(() => {
    const set = new Set<string>();
    set.add('2026-2027');
    events.forEach(e => {
      if (e.academicYear) set.add(e.academicYear);
    });
    return Array.from(set).sort().reverse();
  }, [events]);

  // Filter public, published events for the selected academic year
  const publicEvents = useMemo(() => {
    return events
      .filter(e => {
        const year = e.academicYear || '2026-2027';
        if (year !== selectedAcademicYear) return false;
        // Never display DRAFT items as definitive to visitors
        if (e.status === 'DRAFT') return false;
        if (e.isPublic === false) return false;
        return true;
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [events, selectedAcademicYear]);

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'EDITOR';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 font-sans">
      
      {/* Admin quick bar if logged in */}
      {isAdmin && (
        <div className="bg-blue-900/10 border border-blue-900/30 rounded-2xl p-3.5 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-blue-900 text-amber-400 font-bold">
              <Settings className="w-4 h-4" />
            </span>
            <div>
              <span className="font-bold text-blue-950">Espace Administration Détecté :</span>
              <span className="text-slate-600 ml-1.5">
                Vous pouvez ajouter les dates des prochaines années académiques, créer des contrôles ou publier/dépublier des dates sans toucher au code.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate?.('admin', 'events')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Gérer le Calendrier dans l'Admin</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Modern Compact Header */}
      <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 rounded-2xl p-4 sm:p-5 lg:p-6 text-white shadow-lg border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="space-y-1.5 min-w-0">
            {/* Academic Year Badge & Switcher */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-amber-300 text-xs font-mono font-semibold border border-white/15">
                <CalendarDays className="w-3.5 h-3.5 text-amber-400" />
                <span>Année Académique {selectedAcademicYear}</span>
              </div>

              {availableAcademicYears.length > 1 && (
                <div className="inline-flex items-center gap-1 bg-white/10 rounded-full px-2 py-0.5 border border-white/20 text-xs">
                  <span className="text-slate-300 text-[11px]">Changer :</span>
                  <select
                    value={selectedAcademicYear}
                    onChange={(e) => setSelectedAcademicYear(e.target.value)}
                    className="bg-transparent text-amber-300 font-bold focus:outline-none cursor-pointer py-0.5 text-xs"
                  >
                    {availableAcademicYears.map(yr => (
                      <option key={yr} value={yr} className="bg-slate-900 text-white">
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Title & Short Concise Description */}
            <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Calendrier Scolaire & Agenda Officiel
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-light">
              Dates des contrôles, examens, vacances et événements de l’année scolaire.
            </p>
          </div>

          {/* Quick Action Buttons (Discreet, Professional Hierarchy) */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
            <button
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-950" />
              <span>Version Imprimable</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate?.('admissions', 'conditions')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm transition-colors border border-white/20 cursor-pointer"
            >
              <FileCheck className="w-4 h-4 text-amber-300" />
              <span>Conditions d’Admission</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. Composant de Calendrier Interactif (Grille mensuelle, recherche & vue agenda) */}
      <section aria-label="Calendrier scolaire interactif et agenda">
        <InteractiveCalendar 
          events={publicEvents}
          onNavigateToResources={() => onNavigate?.('resources', 'calendrier')}
          onOpenPrintModal={() => setIsPrintModalOpen(true)}
        />
      </section>

      {/* 5. Important Administrative Information & Useful Tips */}
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

      {/* Official Certified Print & Vector PDF Modal */}
      <OfficialCalendarPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        events={events}
        academicYear={selectedAcademicYear}
      />

    </div>
  );
};
