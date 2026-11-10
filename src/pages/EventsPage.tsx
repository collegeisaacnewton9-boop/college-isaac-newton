import React, { useState, useEffect, useMemo } from 'react';
import { 
  CalendarDays,
  FileCheck,
  Printer,
  ChevronRight,
  CalendarCheck,
  Settings,
  Calendar,
  Clock,
  Sparkles,
  GraduationCap,
  CheckCircle2,
  Palmtree,
  UserCheck,
  Phone,
  BookOpen,
  ShieldCheck,
  Bell
} from 'lucide-react';
import { SchoolEvent, User } from '../types';
import { apiService } from '../services/api';
import { SCHOOL_INFO } from '../data/mockData';
import { ExamReminderSubscribeModal } from '../components/events/ExamReminderSubscribeModal';
import { OfficialCalendarPrintModal } from '../components/events/OfficialCalendarPrintModal';
import { FirstExamScheduleModal } from '../components/events/FirstExamScheduleModal';

interface EventsPageProps {
  onNavigate?: (page: string, subSection?: string) => void;
  currentUser?: User | null;
}

export const EventsPage: React.FC<EventsPageProps> = ({ onNavigate, currentUser }) => {
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(SCHOOL_INFO.currentYear || '2026-2027');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isFirstExamModalOpen, setIsFirstExamModalOpen] = useState(false);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);

  const phone1 = SCHOOL_INFO.phone1 || '+509 3316-0934';
  const phone2 = SCHOOL_INFO.phone2 || '+509 3721-1818';

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
    set.add(SCHOOL_INFO.currentYear || '2026-2027');
    set.add('2026-2027');
    events.forEach(e => {
      if (e.academicYear) set.add(e.academicYear);
    });
    return Array.from(set).sort().reverse();
  }, [events]);

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'EDITOR';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-5 sm:space-y-7 font-sans">
      
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
      <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 rounded-2xl p-4 sm:p-6 lg:p-7 text-white shadow-md border border-slate-800">
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
        <section aria-label="Périodes des 4 Contrôles Académiques 2026-2027" className="space-y-3.5 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
            <div>
              <div className="inline-flex items-center gap-1.5 text-blue-900 font-bold text-xs uppercase tracking-wider mb-0.5">
                <CalendarCheck className="w-4 h-4 text-amber-500" />
                <span>Périodes Officielles des Évaluations · 2026–2027</span>
              </div>
              <h2 className="font-serif text-lg sm:text-2xl font-bold text-slate-900">
                Structure des 4 Contrôles Académiques & Congés
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Dates officielles Collège Isaac Newton
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            
            {/* Premier contrôle */}
            <div className="bg-gradient-to-b from-blue-50/50 to-white rounded-2xl p-4 sm:p-5 border-2 border-blue-900/30 shadow-xs hover:border-blue-900 transition-all flex flex-col justify-between space-y-3.5 relative">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-900 text-white font-bold text-xs shadow-xs">
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
                <div className="space-y-2 text-xs border-t border-slate-100 pt-2.5">
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

                {/* Direct Action: Consulter la grille d'examen & S'abonner */}
                <div className="pt-1 flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => onNavigate?.('exam-schedule')}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Page Horaires des Examens (7e-NS4)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsSubscribeModalOpen(true)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 font-semibold text-xs border border-blue-200 transition-colors cursor-pointer"
                  >
                    <Bell className="w-3.5 h-3.5 text-blue-900" />
                    <span>S'abonner aux rappels d'épreuves</span>
                  </button>
                </div>
              </div>
              <div className="pt-2 text-[10px] text-slate-500 font-mono border-t border-slate-200 flex items-center justify-between">
                <span>Cycle fondamental & secondaire</span>
                <span className="text-blue-900 font-bold">Grille publiée</span>
              </div>
            </div>

            {/* Deuxième contrôle */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:border-blue-900/40 transition-all flex flex-col justify-between space-y-3.5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-900 font-bold text-xs border border-blue-200">
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
                <div className="space-y-2 text-xs border-t border-slate-100 pt-2.5">
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
            <div className="bg-gradient-to-b from-blue-50/50 to-white rounded-2xl p-4 sm:p-5 border-2 border-blue-900/30 shadow-xs hover:border-blue-900 transition-all flex flex-col justify-between space-y-3.5 relative">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-900 text-white font-bold text-xs">
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
                <div className="space-y-2 text-xs border-t border-slate-100 pt-2.5">
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
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:border-blue-900/40 transition-all flex flex-col justify-between space-y-3.5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-900 font-bold text-xs border border-blue-200">
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
                <div className="space-y-2 text-xs border-t border-slate-100 pt-2.5">
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
        <section aria-label="Dates Importantes et Examens d'État" className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
            <div>
              <div className="text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
                Épreuves Officielles & Célébrations Phares 2026–2027
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-white mt-0.5">
                Examens d'État & Solennités du Campus
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
                <span className="text-rose-300 font-bold text-xs uppercase tracking-wider">Épreuve Nationale d'État</span>
                <span className="text-[11px] font-mono text-rose-200">14 au 17 Juin 2027</span>
              </div>
              <h4 className="font-bold text-white text-sm">Examens officiels de 9e A.F.</h4>
              <p className="text-xs text-slate-300">Épreuves nationales certifiantes du cycle fondamental.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-400/30 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-rose-300 font-bold text-xs uppercase tracking-wider">Épreuve Nationale d'État</span>
                <span className="text-[11px] font-mono text-rose-200">28 Juin au 1er Juillet 2027</span>
              </div>
              <h4 className="font-bold text-white text-sm">Examens officiels de NS4</h4>
              <p className="text-xs text-slate-300">Épreuves nationales du Baccalauréat Unique.</p>
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

      {/* 4. Modalités Pratiques & Fonctionnement de l’Agenda - Modernisé & Dense */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-5">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-900">
              <ShieldCheck className="w-4 h-4 text-blue-900" />
              <span>Organisation Scolaire & Directives Officielles</span>
            </div>
            <h2 className="font-serif text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
              Modalités Pratiques & Fonctionnement de l’Agenda
            </h2>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Consignes administratives et pédagogiques régissant les cours réguliers, les séances de renforcement et les périodes d'évaluation.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate?.('exam-schedule')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Consulter la Page Horaires</span>
            </button>
          </div>
        </div>

        {/* 3 Modern Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          
          {/* Card 1 : Horaires des Cours */}
          <div className="bg-slate-50/80 hover:bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Du Lundi au Vendredi
                </span>
              </div>
              <div>
                <h3 className="font-serif font-bold text-slate-900 text-sm sm:text-base">
                  Horaires des Cours & Accueil
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Accueil sur la cour dès <strong>07h15</strong>. Les cours débutent impérativement à <strong>07h30</strong> pour tous les cycles (fermeture de la barrière à 07h45).
                </p>
              </div>
            </div>
            <div className="pt-2.5 border-t border-slate-200/70 text-[11px] font-medium text-slate-700 flex items-center justify-between">
              <span>Sortie régulière :</span>
              <span className="font-mono font-bold text-blue-900">15h00 précises</span>
            </div>
          </div>

          {/* Card 2 : Séances Gratuites du Samedi */}
          <div className="bg-slate-50/80 hover:bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Examens d'État (9e AF & NS4)
                </span>
              </div>
              <div>
                <h3 className="font-serif font-bold text-slate-900 text-sm sm:text-base">
                  Séances Gratuites du Samedi
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Des cours de renforcement intensif en <strong>mathématiques</strong>, <strong>sciences expérimentales</strong> et <strong>rédaction</strong> sont organisés <em>sans frais</em> pour les candidats aux examens officiels.
                </p>
              </div>
            </div>
            <div className="pt-2.5 border-t border-slate-200/70 text-[11px] font-medium text-slate-700 flex items-center justify-between">
              <span>Permanence pédagogique :</span>
              <span className="font-mono font-bold text-amber-800">09h00 — 13h00</span>
            </div>
          </div>

          {/* Card 3 : Secrétariat & Justification d'Absence - AVEC LES 2 NUMEROS DE CONTACT */}
          <div className="bg-slate-50/80 hover:bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Lignes Directes
                </span>
              </div>
              <div>
                <h3 className="font-serif font-bold text-slate-900 text-sm sm:text-base">
                  Secrétariat & Justification d'Absence
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Toute absence doit être obligatoirement signalée au secrétariat le jour même <strong>avant 09h00</strong> en contactant nos deux lignes :
                </p>
              </div>

              {/* Les 2 numéros de contact avec click-to-call */}
              <div className="space-y-1.5 pt-1">
                <a
                  href={`tel:${phone1.replace(/[^0-9+]/g, '')}`}
                  className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/90 hover:border-blue-400 hover:bg-blue-50/40 text-xs font-semibold text-slate-900 transition-colors group"
                  title="Appeler la Ligne 1 du secrétariat"
                >
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-900 group-hover:scale-110 transition-transform" />
                    <span>Ligne 1 · Secrétariat</span>
                  </span>
                  <span className="font-mono font-bold text-blue-900">{phone1}</span>
                </a>

                <a
                  href={`tel:${phone2.replace(/[^0-9+]/g, '')}`}
                  className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/90 hover:border-blue-400 hover:bg-blue-50/40 text-xs font-semibold text-slate-900 transition-colors group"
                  title="Appeler la Ligne 2 du secrétariat & admissions"
                >
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-900 group-hover:scale-110 transition-transform" />
                    <span>Ligne 2 · Admissions</span>
                  </span>
                  <span className="font-mono font-bold text-blue-900">{phone2}</span>
                </a>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/70 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Courriel officiel :</span>
              <a href={`mailto:${SCHOOL_INFO.email}`} className="text-blue-900 font-medium hover:underline truncate max-w-[140px]">
                {SCHOOL_INFO.email}
              </a>
            </div>
          </div>

        </div>

        {/* Card 4 : Directive Spéciale sur les 4 Contrôles Académiques */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5 border border-slate-800 shadow-md">
          <div className="space-y-1 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Directives Générales pour les 4 Contrôles Académiques</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-light">
              <strong className="text-white">Note de la Direction :</strong> Les épreuves des 4 contrôles académiques se déroulent <strong>aux heures habituelles des cours par les professeurs de chaque matière</strong>. Toutes autres dispositions pédagogiques ou consignes spécifiques jugées nécessaires par la Direction seront appliquées pour assurer l'excellence et la sérénité des évaluations.
            </p>
          </div>

          <div className="shrink-0 flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={() => onNavigate?.('exam-schedule')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-xs transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Page Horaires (4 Contrôles)</span>
            </button>
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

      {/* Modal officiel de consultation des horaires du 1er Contrôle Académique */}
      <FirstExamScheduleModal
        isOpen={isFirstExamModalOpen}
        onClose={() => setIsFirstExamModalOpen(false)}
        onOpenFullPage={() => onNavigate?.('exam-schedule')}
      />

      {/* Modal d'abonnement aux rappels d'épreuves (E-mail & Push) */}
      <ExamReminderSubscribeModal
        isOpen={isSubscribeModalOpen}
        onClose={() => setIsSubscribeModalOpen(false)}
        defaultLevel="ALL"
        defaultControlId={1}
      />

    </div>
  );
};
