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
import { EventLastMinuteModal } from '../components/events/EventLastMinuteModal';
import { eventNotificationService, ImminentEventAlert } from '../services/eventNotificationService';

interface EventsPageProps {
  onNavigate?: (page: string, subSection?: string) => void;
  currentUser?: User | null;
}

export const EventsPage: React.FC<EventsPageProps> = ({ onNavigate, currentUser }) => {
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('2026-2027');
  const [selectedEventForReminder, setSelectedEventForReminder] = useState<SchoolEvent | null>(null);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
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

  const imminentEvents = eventNotificationService.getImminentEvents(publicEvents);
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'EDITOR';

  // Helper to trigger print dialog
  const handlePrint = () => {
    window.print();
  };

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

      {/* 1. Header & Academic Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-mono font-semibold border border-white/15 backdrop-blur-xs">
              <CalendarDays className="w-3.5 h-3.5 text-amber-400" />
              <span>Année Académique {selectedAcademicYear}</span>
            </div>

            {/* Academic Year Switcher */}
            {availableAcademicYears.length > 1 && (
              <div className="inline-flex items-center gap-1 bg-white/10 rounded-full px-2.5 py-0.5 border border-white/20 text-xs">
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

          <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Calendrier Scolaire & Agenda Officiel
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
            Planifiez sereinement votre année académique au <strong>Collège Isaac Newton</strong> : dates officielles des 4 périodes de contrôle, examens trimestriels et épreuves d'État (9e AF & NS4), congés du MENFP, vacances et remises des carnets.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-950" />
              <span>Version Imprimable Propre (PDF / Papier)</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate?.('admissions', 'conditions')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm transition-colors border border-white/20 cursor-pointer"
            >
              <FileCheck className="w-4 h-4 text-amber-300" />
              <span>Conditions d'Admission & Pièces</span>
            </button>
          </div>
        </div>

        {/* Decorative background watermark */}
        <div className="absolute right-6 -bottom-8 text-white/5 pointer-events-none select-none">
          <CalendarIcon className="w-72 h-72 sm:w-96 sm:h-96" />
        </div>
      </div>

      {/* Imminent Events Alert Ribbon (< 48h) */}
      {imminentEvents.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-orange-500/15 border border-amber-300 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-500 text-slate-950 font-bold shadow-xs flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 animate-pulse" />
              </span>
              <div>
                <h2 className="font-serif font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <span>Événements Imminents dans les Prochaines 48 Heures</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-mono text-[10px] font-bold">
                    {imminentEvents.length} en alerte
                  </span>
                </h2>
                <p className="text-xs text-slate-700">
                  Rappels et consignes d'accès pour les événements se déroulant aujourd'hui ou dans moins de 48 heures sur le campus.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {imminentEvents.map(({ event, hoursRemaining, timeRemainingFormatted, isOngoing, urgency }) => (
              <div key={event.id} className="bg-white rounded-xl p-3.5 border border-amber-200/90 shadow-xs flex flex-col justify-between gap-2.5">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                      urgency === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isOngoing ? 'En cours aujourd’hui' : timeRemainingFormatted}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {hoursRemaining > 0 ? `${hoursRemaining}h restantes` : 'Campus ouvert'}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{event.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{event.description}</p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1 truncate max-w-[200px]">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{event.location || 'Campus Delmas 50'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEventForReminder(event);
                      setIsReminderModalOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold transition-colors cursor-pointer text-[11px] shrink-0"
                  >
                    Rappel & Consignes
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Structured Overview of the 4 Academic Controls 2026-2027 */}
      {selectedAcademicYear === '2026-2027' && (
        <section aria-label="Périodes des 4 Contrôles Académiques 2026-2027" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 text-blue-900 font-bold text-xs uppercase tracking-wider mb-1">
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
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-blue-900/40 transition-all flex flex-col justify-between space-y-4 relative overflow-hidden">
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
                    Période Initiale
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
                    <span><strong>Vacances de Noël :</strong> 21 déc. 2026 au 3 janv. 2027</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-700">
                    <RotateCcw className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>Reprise des cours :</strong> 4 janvier 2027</span>
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

                {/* Harmonisation Note */}
                <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 text-[10.5px] text-amber-900 leading-snug">
                  <span className="font-bold">Période validée officielle :</span> La mention alternative du 1er fév. au 9 avr. figurant dans l'en-tête source a été formellement harmonisée pour retenir cette période validée de 51 jours.
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
                    37 jours
                  </span>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-base text-slate-900">
                    Période Finale & Clôture
                  </h3>
                  <p className="text-xs font-semibold text-blue-900 mt-0.5">
                    Du 3 mai au 25 juin 2027
                  </p>
                </div>

                <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                  <div className="flex items-start gap-2 text-slate-700">
                    <GraduationCap className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <span><strong>Examens :</strong> 21 au 25 juin 2027</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Remise des notes :</strong> 2 juillet 2027</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-700">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                    <span><strong>Fête des philosophes :</strong> 14 mai 2027</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-700">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>Fête des professeurs :</strong> 17 mai 2027</span>
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
                <span className="text-[11px] font-mono text-slate-300">14 Mai 2027</span>
              </div>
              <h4 className="font-bold text-white text-sm">Fête des philosophes</h4>
              <p className="text-xs text-slate-300">Joutes oratoires, pensée critique et débats académiques au Collège.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-amber-300 font-bold text-xs uppercase tracking-wider">Hommage Pédagogique</span>
                <span className="text-[11px] font-mono text-slate-300">17 Mai 2027</span>
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
                <span className="text-[11px] font-mono text-rose-200">28 au 30 Juin 2027</span>
              </div>
              <h4 className="font-bold text-white text-sm">Examens officiels de 9e A.F.</h4>
              <p className="text-xs text-slate-300">Épreuves nationales certifiantes du cycle fondamental.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-400/30 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-rose-300 font-bold text-xs uppercase tracking-wider">Examen d'État MENFP</span>
                <span className="text-[11px] font-mono text-rose-200">5 au 8 Juillet 2027</span>
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

      {/* 4. The Interactive Calendar Component (Agenda, Month Grid, Categories) */}
      <section aria-label="Composant de Calendrier Interactif">
        <InteractiveCalendar 
          events={publicEvents}
          onNavigateToResources={() => onNavigate?.('resources', 'calendrier')}
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

      {/* Modal de Rappel & Consignes de Dernière Minute pour les Visiteurs */}
      <EventLastMinuteModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        event={selectedEventForReminder}
        isAdmin={false}
        defaultTab="reminder"
      />

      {/* Printable Modal / View for Clean Printing */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
            
            {/* Modal header with Print / Close action */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-900" />
                <h3 className="font-serif font-bold text-slate-900 text-lg">
                  Aperçu de la Version Imprimable
                </h3>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>Lancer l'impression</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer"
                  title="Fermer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Content to Print */}
            <div className="space-y-6 text-slate-900 print:m-0 print:p-0">
              
              {/* Document Header */}
              <div className="text-center space-y-1.5 pb-4 border-b-2 border-slate-900">
                <h2 className="font-serif font-extrabold text-2xl uppercase tracking-wider text-slate-950">
                  Collège Isaac Newton
                </h2>
                <p className="text-xs font-semibold text-slate-600">
                  Campus : Delmas 50, rue Dominique #2 bis, Port-au-Prince, Haïti · Tél : +509 3316-0934 / 3721-1818
                </p>
                <div className="inline-block mt-1 px-3 py-1 rounded-full bg-slate-100 font-serif font-bold text-sm text-blue-950 border border-slate-300">
                  CALENDRIER ACADÉMIQUE OFFICIEL · ANNÉE {selectedAcademicYear}
                </div>
              </div>

              {/* Table of Controls */}
              <div className="space-y-2">
                <h4 className="font-serif font-bold text-sm text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1">
                  1. Calendrier des 4 Contrôles Académiques
                </h4>
                <table className="w-full text-left text-xs border border-slate-300 divide-y divide-slate-300">
                  <thead className="bg-slate-100 font-bold text-slate-900">
                    <tr>
                      <th className="p-2 border-r border-slate-300">Contrôle</th>
                      <th className="p-2 border-r border-slate-300">Période Officielle</th>
                      <th className="p-2 border-r border-slate-300 text-center">Durée</th>
                      <th className="p-2 border-r border-slate-300">Examens</th>
                      <th className="p-2">Remise Bulletins / Vacances</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-2 font-bold border-r border-slate-300">1er Contrôle</td>
                      <td className="p-2 border-r border-slate-300">Du 7 sept. au 13 nov. 2026</td>
                      <td className="p-2 border-r border-slate-300 text-center font-mono">49 jours</td>
                      <td className="p-2 border-r border-slate-300 font-semibold">9 au 13 nov. 2026</td>
                      <td className="p-2">Carnets : 27 nov. 2026 · Noël : 21 déc. - 3 janv. (Reprise : 4 janv.)</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold border-r border-slate-300">2e Contrôle</td>
                      <td className="p-2 border-r border-slate-300">Du 16 nov. 2026 au 29 janv. 2027</td>
                      <td className="p-2 border-r border-slate-300 text-center font-mono">44 jours</td>
                      <td className="p-2 border-r border-slate-300 font-semibold">25 au 29 janv. 2027</td>
                      <td className="p-2">Carnets : 19 fév. 2027 · Carnaval : 8 au 10 fév. 2027</td>
                    </tr>
                    <tr className="bg-blue-50/40">
                      <td className="p-2 font-bold border-r border-slate-300">3e Contrôle (Validé)</td>
                      <td className="p-2 border-r border-slate-300">Du 2 mars au 30 avril 2027</td>
                      <td className="p-2 border-r border-slate-300 text-center font-mono font-bold">51 jours</td>
                      <td className="p-2 border-r border-slate-300 font-semibold">12 au 16 avril 2027</td>
                      <td className="p-2">Pâques : 25 au 29 mars 2027 · Carnets : 30 avril 2027</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold border-r border-slate-300">4e Contrôle</td>
                      <td className="p-2 border-r border-slate-300">Du 3 mai au 25 juin 2027</td>
                      <td className="p-2 border-r border-slate-300 text-center font-mono">37 jours</td>
                      <td className="p-2 border-r border-slate-300 font-semibold">21 au 25 juin 2027</td>
                      <td className="p-2">Remise des notes : 2 juillet 2027</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Major Celebrations & Official State Exams */}
              <div className="space-y-2">
                <h4 className="font-serif font-bold text-sm text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1">
                  2. Événements Majeurs & Examens d'État 2026–2027
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 border border-slate-200 rounded">
                    <strong>Fête des philosophes :</strong> 14 mai 2027
                  </div>
                  <div className="p-2 border border-slate-200 rounded">
                    <strong>Fête des professeurs :</strong> 17 mai 2027
                  </div>
                  <div className="p-2 border border-slate-200 rounded">
                    <strong>Fête du collège :</strong> 18 juin 2027
                  </div>
                  <div className="p-2 border border-slate-200 rounded">
                    <strong>Graduations :</strong> 10 juillet 2027
                  </div>
                  <div className="p-2 border border-rose-300 bg-rose-50/30 rounded">
                    <strong>Examens officiels de 9e A.F. :</strong> du 28 au 30 juin 2027
                  </div>
                  <div className="p-2 border border-rose-300 bg-rose-50/30 rounded">
                    <strong>Examens officiels de NS4 :</strong> du 5 au 8 juillet 2027
                  </div>
                </div>
              </div>

              {/* Complete Chronological Schedule Table */}
              <div className="space-y-2">
                <h4 className="font-serif font-bold text-sm text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1">
                  3. Calendrier Chronologique Complet ({publicEvents.length} événements)
                </h4>
                <div className="space-y-1.5 divide-y divide-slate-100">
                  {publicEvents.map((evt, idx) => {
                    const start = new Date(evt.startDate);
                    const formattedDate = start.toLocaleDateString('fr-FR', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    });
                    return (
                      <div key={evt.id || idx} className="pt-1.5 flex items-start justify-between gap-4 text-xs">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900">{evt.title}</span>
                          <span className="ml-2 px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">
                            {evt.category}
                          </span>
                          <p className="text-[11px] text-slate-500">{evt.description}</p>
                        </div>
                        <span className="font-mono text-slate-700 whitespace-nowrap text-right shrink-0">
                          {formattedDate}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer Stamp */}
              <div className="pt-4 border-t border-slate-300 text-[10px] text-slate-500 flex items-center justify-between">
                <span>Collège Isaac Newton · Excellence Pédagogique & Rigueur Scientifique</span>
                <span>Document imprimé le {new Date().toLocaleDateString('fr-FR')}</span>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
