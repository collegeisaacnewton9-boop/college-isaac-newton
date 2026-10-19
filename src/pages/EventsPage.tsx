import React, { useState, useEffect, useMemo } from 'react';
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
  CheckCircle2,
  CalendarDays,
  Info,
  Printer,
  ChevronRight,
  BookOpen,
  CalendarCheck,
  RotateCcw,
  Sliders,
  Settings,
  X
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

      {/* 3. Repères Officiels de l'Année Académique 2026–2027 (Synthèse structurée sans redondances) */}
      {selectedAcademicYear === '2026-2027' && (
        <section aria-label="Repères Officiels de l'Année 2026-2027" className="space-y-6 pt-2">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-blue-900 font-bold text-xs uppercase tracking-wider mb-0.5">
                <CalendarCheck className="w-4 h-4 text-amber-500" />
                <span>Repères Institutionnels · Session 2026–2027</span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
                Structure des 4 Contrôles Académiques & Calendrier Officiel
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Dates officielles du Collège Isaac Newton
            </span>
          </div>

          {/* Bloc A : Les 4 Périodes de Contrôles Académiques */}
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-900" />
              <span>Les 4 Périodes de Contrôles & Évaluations</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* 1er Contrôle */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:border-blue-900/40 transition-all flex flex-col justify-between space-y-3">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-900 font-bold text-xs border border-blue-200">
                      1er Contrôle
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono text-[11px] font-bold">
                      49 jours
                    </span>
                  </div>

                  <div>
                    <h4 className="font-serif font-bold text-base text-slate-900">
                      Période Initiale
                    </h4>
                    <p className="text-xs font-semibold text-blue-900 mt-0.5">
                      Du 7 septembre au 13 novembre 2026
                    </p>
                  </div>

                  <div className="space-y-2 text-xs border-t border-slate-100 pt-2.5">
                    <div className="flex items-start gap-2 text-slate-700">
                      <GraduationCap className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <span><strong>Examens :</strong> 9 au 13 nov. 2026</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Remise des carnets :</strong> 27 nov. 2026</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-slate-400 font-mono border-t border-slate-100 flex items-center justify-between">
                  <span>Cycle fondamental & secondaire</span>
                  <span className="text-emerald-700 font-bold">Validé</span>
                </div>
              </div>

              {/* 2e Contrôle */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:border-blue-900/40 transition-all flex flex-col justify-between space-y-3">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-900 font-bold text-xs border border-blue-200">
                      2e Contrôle
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono text-[11px] font-bold">
                      44 jours
                    </span>
                  </div>

                  <div>
                    <h4 className="font-serif font-bold text-base text-slate-900">
                      Période d’Hiver
                    </h4>
                    <p className="text-xs font-semibold text-blue-900 mt-0.5">
                      Du 16 novembre 2026 au 29 janvier 2027
                    </p>
                  </div>

                  <div className="space-y-2 text-xs border-t border-slate-100 pt-2.5">
                    <div className="flex items-start gap-2 text-slate-700">
                      <GraduationCap className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <span><strong>Examens :</strong> 25 au 29 janv. 2027</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Remise des carnets :</strong> 19 février 2027</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-slate-400 font-mono border-t border-slate-100 flex items-center justify-between">
                  <span>Tous les niveaux</span>
                  <span className="text-emerald-700 font-bold">Validé</span>
                </div>
              </div>

              {/* 3e Contrôle */}
              <div className="bg-gradient-to-b from-blue-50/40 to-white rounded-2xl p-4 sm:p-5 border-2 border-blue-900/30 shadow-xs hover:border-blue-900 transition-all flex flex-col justify-between space-y-3 relative">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-900 text-white font-bold text-xs">
                      3e Contrôle (Validé)
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-mono text-[11px] font-bold">
                      51 jours
                    </span>
                  </div>

                  <div>
                    <h4 className="font-serif font-bold text-base text-slate-900">
                      Période de Printemps
                    </h4>
                    <p className="text-xs font-semibold text-blue-900 mt-0.5">
                      Du 2 mars au 30 avril 2027
                    </p>
                  </div>

                  <div className="space-y-2 text-xs border-t border-slate-100 pt-2.5">
                    <div className="flex items-start gap-2 text-slate-700">
                      <GraduationCap className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <span><strong>Examens :</strong> 12 au 16 avril 2027</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Remise des carnets :</strong> 30 avril 2027</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-slate-500 font-mono border-t border-slate-200 flex items-center justify-between">
                  <span>Période Officielle Confirmée</span>
                  <span className="text-blue-900 font-bold">51 Jours</span>
                </div>
              </div>

              {/* 4e Contrôle */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:border-blue-900/40 transition-all flex flex-col justify-between space-y-3">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-900 font-bold text-xs border border-blue-200">
                      4e Contrôle
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono text-[11px] font-bold">
                      35 jours
                    </span>
                  </div>

                  <div>
                    <h4 className="font-serif font-bold text-base text-slate-900">
                      Période Finale & Clôture
                    </h4>
                    <p className="text-xs font-semibold text-blue-900 mt-0.5">
                      Du 19 avril au 4 juin 2027
                    </p>
                  </div>

                  <div className="space-y-2 text-xs border-t border-slate-100 pt-2.5">
                    <div className="flex items-start gap-2 text-slate-700">
                      <GraduationCap className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <span><strong>Examens :</strong> 31 mai au 4 juin 2027</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Remise des notes :</strong> 11 juin 2027</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-slate-400 font-mono border-t border-slate-100 flex items-center justify-between">
                  <span>Grandes vacances</span>
                  <span className="text-emerald-700 font-bold">Dès le 11 juin</span>
                </div>
              </div>

            </div>
          </div>

          {/* Grille 2 colonnes : Bloc B (Vacances & Congés) & Bloc C (Examens d'État & Célébrations) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Bloc B : Vacances Scolaires & Jours Fériés */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
                  <Palmtree className="w-4 h-4 text-amber-500" />
                  <span>Vacances Scolaires & Jours Fériés</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-400">Calendrier MENFP</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>Vacances de Noël</span>
                    <span className="text-[10px] font-mono text-amber-800 font-semibold">14 jours</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">Du 21 déc. 2026 au 3 janv. 2027</p>
                  <p className="text-blue-900 font-semibold text-[10.5px]">Reprise des cours : 4 janvier 2027</p>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>Vacances de Carnaval</span>
                    <span className="text-[10px] font-mono text-amber-800 font-semibold">3 jours</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">Du 8 au 10 février 2027</p>
                  <p className="text-blue-900 font-semibold text-[10.5px]">Partage des dédicaces : 12 fév. 2027</p>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>Vacances de Pâques</span>
                    <span className="text-[10px] font-mono text-amber-800 font-semibold">5 jours</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">Du 25 au 29 mars 2027</p>
                  <p className="text-blue-900 font-semibold text-[10.5px]">Reprise : 30 mars 2027</p>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>Grandes Vacances d’Été</span>
                    <span className="text-[10px] font-mono text-amber-800 font-semibold">Clôture</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">À partir du 25 juin 2027</p>
                  <p className="text-emerald-700 font-semibold text-[10.5px]">Fin officielle de l’année académique</p>
                </div>
              </div>
            </div>

            {/* Bloc C : Examens d'État (MENFP) & Solennités du Collège */}
            <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <h3 className="font-serif font-bold text-base text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Examens d'État & Célébrations Phares</span>
                </h3>
                <span className="text-[11px] font-mono text-amber-300">Officielles</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
                  <div className="text-[10px] font-mono text-amber-300 font-bold">22 Janvier 2027</div>
                  <div className="font-bold text-white">Fête des philosophes</div>
                  <div className="text-[11px] text-slate-300">Joutes oratoires & pensée critique.</div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
                  <div className="text-[10px] font-mono text-amber-300 font-bold">12 Février 2027</div>
                  <div className="font-bold text-white">Partage des dédicaces</div>
                  <div className="text-[11px] text-slate-300">Tradition fraternelle du campus.</div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
                  <div className="text-[10px] font-mono text-amber-300 font-bold">14 Mai 2027</div>
                  <div className="font-bold text-white">Fête des professeurs & exposition des projets</div>
                  <div className="text-[11px] text-slate-300">Hommage pédagogique & sciences.</div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
                  <div className="text-[10px] font-mono text-amber-300 font-bold">28 Mai 2027</div>
                  <div className="font-bold text-white">Fête du Collège</div>
                  <div className="text-[11px] text-slate-300">Grande fête de la communauté éducative.</div>
                </div>

                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-400/30 space-y-0.5">
                  <div className="text-[10px] font-mono text-rose-300 font-bold">14 au 17 Juin 2027</div>
                  <div className="font-bold text-white">Examens officiels de 9e A.F.</div>
                  <div className="text-[11px] text-slate-300">Épreuves nationales certifiantes MENFP.</div>
                </div>

                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-400/30 space-y-0.5">
                  <div className="text-[10px] font-mono text-rose-300 font-bold">28 Juin au 1er Juillet 2027</div>
                  <div className="font-bold text-white">Examens officiels de NS4</div>
                  <div className="text-[11px] text-slate-300">Baccalauréat Unique MENFP.</div>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/40 space-y-0.5 sm:col-span-2">
                  <div className="text-[10px] font-mono text-amber-300 font-bold">10 Juillet 2027</div>
                  <div className="font-bold text-white">Graduation & Collation des Diplômes</div>
                  <div className="text-[11px] text-slate-300">Cérémonie solennelle & toges des finissants.</div>
                </div>
              </div>
            </div>

          </div>

        </section>
      )}

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
