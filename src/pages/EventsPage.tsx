import React, { useState, useEffect, useMemo } from 'react';
import { 
  CalendarDays,
  FileCheck,
  Info,
  Printer,
  ChevronRight,
  CalendarCheck,
  Settings,
  Search,
  Filter,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  GraduationCap,
  CheckCircle2,
  Palmtree,
  UserCheck,
  Download,
  CalendarPlus,
  AlertCircle
} from 'lucide-react';
import { SchoolEvent, EventCategory, User } from '../types';
import { apiService } from '../services/api';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

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

  // Filtered list for the Chronological Agenda
  const filteredEvents = useMemo(() => {
    return publicEvents.filter(e => {
      if (selectedCategory !== 'ALL') {
        if (selectedCategory === 'EXAMS' && !['Examen', 'Contrôle'].includes(e.category)) return false;
        if (selectedCategory === 'HOLIDAYS' && !['Vacances', 'Férié'].includes(e.category)) return false;
        if (selectedCategory === 'ACTIVITIES' && !['Vie Scolaire', 'Culturel', 'Sportif', 'Pédagogique', 'Réunion Parents'].includes(e.category)) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = e.title.toLowerCase().includes(q);
        const matchDesc = e.description?.toLowerCase().includes(q);
        const matchLoc = e.location?.toLowerCase().includes(q);
        const matchCat = e.category.toLowerCase().includes(q);
        return matchTitle || matchDesc || matchLoc || matchCat;
      }
      return true;
    });
  }, [publicEvents, selectedCategory, searchQuery]);

  // Export event as .ics
  const handleExportIcs = (event: SchoolEvent) => {
    const start = new Date(event.startDate).toISOString().replace(/-|:|\.\d+/g, '');
    const end = event.endDate 
      ? new Date(event.endDate).toISOString().replace(/-|:|\.\d+/g, '') 
      : start;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//College Isaac Newton//Calendrier Scolaire//FR',
      'BEGIN:VEVENT',
      `UID:${event.id || Date.now()}@collegeisaacnewton.com`,
      `DTSTAMP:${new Date().toISOString().replace(/-|:|\.\d+/g, '')}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${(event.description || '').replace(/\n/g, ' ')}`,
      `LOCATION:${event.location || 'Campus Delmas 50, rue Dominique #2 bis, Port-au-Prince'}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `evenement-${event.id || 'cin'}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'EDITOR';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-7 sm:space-y-9 font-sans">
      
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
      <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 rounded-2xl p-5 sm:p-6 lg:p-7 text-white shadow-lg border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="space-y-2 min-w-0">
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

          {/* Quick Action Buttons */}
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

      {/* 2. Structured Overview of the 4 Academic Controls 2026-2027 */}
      {selectedAcademicYear === '2026-2027' && (
        <section aria-label="Périodes des 4 Contrôles Académiques 2026-2027" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-blue-900 font-bold text-xs uppercase tracking-wider mb-0.5">
                <CalendarCheck className="w-4 h-4 text-amber-500" />
                <span>Périodes Officielles des Évaluations · 2026–2027</span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
                Structure des 4 Contrôles Académiques & Congés
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Dates officielles Collège Isaac Newton
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Premier contrôle */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-blue-900/40 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 font-bold text-xs border border-blue-200">
                    1er Contrôle
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono text-[11px] font-bold">
                    49 jours
                  </span>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-slate-900">
                    Période d'Automne
                  </h3>
                  <p className="text-xs font-semibold text-blue-900 mt-0.5">
                    Du 7 septembre au 13 novembre 2026
                  </p>
                </div>
                <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                  <div className="flex items-start gap-2 text-slate-700">
                    <GraduationCap className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <span><strong>Examens :</strong> 9 au 13 nov. 2026</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Remise des carnets :</strong> 27 nov. 2026</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-700">
                    <Palmtree className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span><strong>Vacances Noël :</strong> 21 déc. - 3 janv. (Reprise : 4 janv. 2027)</span>
                  </div>
                </div>
              </div>
              <div className="pt-2 text-[10px] text-slate-400 font-mono border-t border-slate-100 flex items-center justify-between">
                <span>Cycle fondamental & secondaire</span>
                <span className="text-emerald-700 font-bold">Validé</span>
              </div>
            </div>

            {/* Deuxième contrôle */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-blue-900/40 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 font-bold text-xs border border-blue-200">
                    2e Contrôle
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono text-[11px] font-bold">
                    44 jours
                  </span>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-slate-900">
                    Période d'Hiver
                  </h3>
                  <p className="text-xs font-semibold text-blue-900 mt-0.5">
                    Du 16 novembre 2026 au 29 janvier 2027
                  </p>
                </div>
                <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                  <div className="flex items-start gap-2 text-slate-700">
                    <GraduationCap className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <span><strong>Examens :</strong> 25 au 29 janv. 2027</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Remise des carnets :</strong> 19 février 2027</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-700">
                    <Palmtree className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span><strong>Vacances Carnaval :</strong> 8 au 10 fév. 2027</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-700">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                    <span><strong>Partage des dédicaces :</strong> 12 fév. 2027</span>
                  </div>
                </div>
              </div>
              <div className="pt-2 text-[10px] text-slate-400 font-mono border-t border-slate-100 flex items-center justify-between">
                <span>Tous les niveaux</span>
                <span className="text-emerald-700 font-bold">Validé</span>
              </div>
            </div>

            {/* Troisième contrôle — PÉRIODE VALIDÉE */}
            <div className="bg-gradient-to-b from-blue-50/50 to-white rounded-2xl p-5 border-2 border-blue-900/30 shadow-xs hover:border-blue-900 transition-all flex flex-col justify-between space-y-4 relative">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-blue-900 text-white font-bold text-xs">
                    3e Contrôle (Validé)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-mono text-[11px] font-bold">
                    51 jours
                  </span>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-slate-900">
                    Période de Printemps
                  </h3>
                  <p className="text-xs font-semibold text-blue-900 mt-0.5">
                    Du 2 mars au 30 avril 2027
                  </p>
                </div>
                <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                  <div className="flex items-start gap-2 text-slate-700">
                    <GraduationCap className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <span><strong>Examens :</strong> 12 au 16 avril 2027</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-700">
                    <Palmtree className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span><strong>Vacances de Pâques :</strong> 25 au 29 mars 2027</span>
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

            {/* Quatrième contrôle */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-blue-900/40 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 font-bold text-xs border border-blue-200">
                    4e Contrôle
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono text-[11px] font-bold">
                    35 jours
                  </span>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-slate-900">
                    Période Finale & Clôture
                  </h3>
                  <p className="text-xs font-semibold text-blue-900 mt-0.5">
                    Du 19 avril au 4 juin 2027
                  </p>
                </div>
                <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                  <div className="flex items-start gap-2 text-slate-700">
                    <GraduationCap className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <span><strong>Examens :</strong> 31 mai au 4 juin 2027</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Remise des notes :</strong> 11 juin 2027</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-700">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                    <span><strong>Fête des professeurs :</strong> 14 mai 2027</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-700">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>Fête du collège :</strong> 18 juin 2027</span>
                  </div>
                </div>
              </div>
              <div className="pt-2 text-[10px] text-slate-400 font-mono border-t border-slate-100 flex items-center justify-between">
                <span>Passage & Décisions de fin d'année</span>
                <span className="text-emerald-700 font-bold">Validé</span>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* 3. Official State Exams & Major Celebrations 2026-2027 */}
      {selectedAcademicYear === '2026-2027' && (
        <section aria-label="Dates Importantes et Examens d'État" className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 sm:p-7 border border-slate-800 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <div className="text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
                Épreuves Officielles & Célébrations Phares 2026–2027
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-white mt-0.5">
                Examens d'État (MENFP) et Solennités du Campus
              </h3>
            </div>
            <span className="text-xs text-slate-300 font-light">
              Présence obligatoire pour les promotions concernées
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-amber-300 font-bold text-xs uppercase tracking-wider">Événement Campus</span>
                <span className="text-[11px] font-mono text-slate-300">22 Janvier 2027</span>
              </div>
              <h4 className="font-bold text-white text-sm">Fête des philosophes</h4>
              <p className="text-xs text-slate-300">Joutes oratoires, pensée critique et débats académiques au Collège.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-amber-300 font-bold text-xs uppercase tracking-wider">Hommage Pédagogique</span>
                <span className="text-[11px] font-mono text-slate-300">14 Mai 2027</span>
              </div>
              <h4 className="font-bold text-white text-sm">Fête des professeurs</h4>
              <p className="text-xs text-slate-300">Journée d'hommage et célébration fraternelle du corps professoral.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-amber-300 font-bold text-xs uppercase tracking-wider">Célébration Institutionnelle</span>
                <span className="text-[11px] font-mono text-slate-300">18 Juin 2027</span>
              </div>
              <h4 className="font-bold text-white text-sm">Fête du collège</h4>
              <p className="text-xs text-slate-300">Grande fête de la communauté éducative du Collège Isaac Newton.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-400/30 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-rose-300 font-bold text-xs uppercase tracking-wider">Examen d'État MENFP</span>
                <span className="text-[11px] font-mono text-rose-200">14 au 17 Juin 2027</span>
              </div>
              <h4 className="font-bold text-white text-sm">Examens officiels de 9e A.F.</h4>
              <p className="text-xs text-slate-300">Épreuves nationales certifiantes du cycle fondamental.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-400/30 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-rose-300 font-bold text-xs uppercase tracking-wider">Examen d'État MENFP</span>
                <span className="text-[11px] font-mono text-rose-200">28 Juin au 1er Juillet 2027</span>
              </div>
              <h4 className="font-bold text-white text-sm">Examens officiels de NS4</h4>
              <p className="text-xs text-slate-300">Épreuves nationales du Baccalauréat Unique MENFP.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-400/40 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-amber-300 font-bold text-xs uppercase tracking-wider">Collation des Diplômes</span>
                <span className="text-[11px] font-mono text-amber-200">10 Juillet 2027</span>
              </div>
              <h4 className="font-bold text-white text-sm">Graduations de la Promotion</h4>
              <p className="text-xs text-slate-300">Cérémonie solennelle de sortie et remise des toges et diplômes.</p>
            </div>
          </div>
        </section>
      )}

      {/* 4. Chronological Agenda List (Élégant, structuré, sans le gros bloc calendrier mensuel) */}
      <section aria-label="Agenda et liste chronologique des événements" className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/90 shadow-xs space-y-5">
        
        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-900" />
            <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900">
              Agenda des Activités & Événements Scolaires
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono text-xs font-semibold">
              {filteredEvents.length} {filteredEvents.length > 1 ? 'événements' : 'événement'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par mot-clé..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-900 bg-slate-50 focus:bg-white transition-colors"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'ALL', label: 'Toutes les Dates' },
                { id: 'EXAMS', label: 'Examens & Contrôles' },
                { id: 'HOLIDAYS', label: 'Vacances & Jours Fériés' },
                { id: 'ACTIVITIES', label: 'Activités & Vie Scolaire' },
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Events List */}
        {loading ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            Chargement de l'agenda officiel...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            Aucun événement ne correspond à vos critères de recherche.
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredEvents.map((evt) => {
              const startDate = new Date(evt.startDate);
              const dayNumber = startDate.getDate();
              const monthName = startDate.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase();
              const fullDateStr = startDate.toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              });

              const isExam = ['Examen', 'Contrôle'].includes(evt.category);
              const isHoliday = ['Vacances', 'Férié'].includes(evt.category);

              return (
                <div 
                  key={evt.id}
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isExam 
                      ? 'bg-rose-50/40 border-rose-200/80 hover:border-rose-300' 
                      : isHoliday 
                        ? 'bg-amber-50/40 border-amber-200/80 hover:border-amber-300' 
                        : 'bg-slate-50/50 border-slate-200/80 hover:border-blue-900/40'
                  }`}
                >
                  <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                    {/* Date Block */}
                    <div className="flex flex-col items-center justify-center w-12 sm:w-14 h-12 sm:h-14 rounded-xl bg-white border border-slate-200 shadow-xs shrink-0 text-center">
                      <span className="text-[10px] font-bold font-mono text-blue-900 tracking-wider">
                        {monthName}
                      </span>
                      <span className="text-lg sm:text-xl font-extrabold text-slate-900 leading-none">
                        {dayNumber}
                      </span>
                    </div>

                    {/* Event Details */}
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isExam 
                            ? 'bg-rose-100 text-rose-800' 
                            : isHoliday 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-blue-100 text-blue-800'
                        }`}>
                          {evt.category}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {fullDateStr}
                        </span>
                      </div>
                      
                      <h4 className="font-serif font-bold text-sm sm:text-base text-slate-900 truncate">
                        {evt.title}
                      </h4>

                      {evt.description && (
                        <p className="text-xs text-slate-600 line-clamp-2">
                          {evt.description}
                        </p>
                      )}

                      {evt.location && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="truncate">{evt.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions (.ics download) */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleExportIcs(evt)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 shadow-xs transition-colors cursor-pointer"
                      title="Ajouter au calendrier (.ics)"
                    >
                      <CalendarPlus className="w-3.5 h-3.5 text-blue-900" />
                      <span>Ajouter à mon agenda</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
