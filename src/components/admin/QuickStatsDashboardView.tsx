import React, { useState } from 'react';
import { 
  Users, 
  FileText, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Download, 
  Upload, 
  Sparkles, 
  GraduationCap, 
  Award, 
  TrendingUp, 
  MapPin, 
  ShieldCheck, 
  Plus,
  BookOpen,
  Filter,
  Layers,
  ChevronRight
} from 'lucide-react';
import { AdmissionApplication, DocumentFile, SchoolEvent } from '../../types';

interface QuickStatsDashboardViewProps {
  admissions: AdmissionApplication[];
  documents: DocumentFile[];
  events: SchoolEvent[];
  onNavigateTab: (tab: 'admissions' | 'media' | 'events' | 'news' | 'messages') => void;
  onOpenUploadDoc?: () => void;
}

export const QuickStatsDashboardView: React.FC<QuickStatsDashboardViewProps> = ({
  admissions,
  documents,
  events,
  onNavigateTab,
  onOpenUploadDoc,
}) => {
  const [studentCountFilter, setStudentCountFilter] = useState<'accepted' | 'all'>('accepted');

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  const currentMonthName = monthNames[currentMonth];

  // 1. STATISTIQUE 1 : Nombre total d'élèves inscrits / admis
  const enrolledStudents = admissions.filter((a) => a.status === 'ACCEPTED');
  const enrolledCount = enrolledStudents.length;
  const totalApplications = admissions.length;
  const pendingApplications = admissions.filter((a) => a.status === 'PENDING' || a.status === 'UNDER_REVIEW').length;
  const interviewScheduledCount = admissions.filter((a) => a.status === 'INTERVIEW_SCHEDULED').length;
  const validationRate = totalApplications > 0 ? Math.round((enrolledCount / totalApplications) * 100) : 0;

  // Répartition des inscrits par cycle
  const datasetForCycles = studentCountFilter === 'accepted' ? enrolledStudents : admissions;

  const prescolaireCount = datasetForCycles.filter((a) => 
    a.cycle === 'PRESCOLAIRE' || 
    a.targetLevel.toLowerCase().includes('maternelle') || 
    a.targetLevel.toLowerCase().includes('préscolaire')
  ).length;

  const fondamentalCount = datasetForCycles.filter((a) => 
    a.cycle?.includes('FONDAMENTAL') || 
    a.targetLevel.toLowerCase().includes('fondamentale') ||
    a.targetLevel.toLowerCase().includes('af')
  ).length;

  const secondaireCount = datasetForCycles.filter((a) => 
    a.cycle === 'SECONDAIRE' || 
    a.targetLevel.toLowerCase().includes('secondaire') ||
    a.targetLevel.toLowerCase().includes('ns')
  ).length;

  // 2. STATISTIQUE 2 : Nouveaux documents uploadés ce mois-ci
  const docsThisMonth = documents.filter((doc) => {
    if (!doc.createdAt) return true;
    const docDate = new Date(doc.createdAt);
    if (isNaN(docDate.getTime())) return true;
    return docDate.getMonth() === currentMonth && docDate.getFullYear() === currentYear;
  });
  const newDocsCount = docsThisMonth.length > 0 ? docsThisMonth.length : documents.length;
  const totalDownloads = documents.reduce((sum, d) => sum + (d.downloadCount || 0), 0);

  const reglementsCount = documents.filter((d) => d.category === 'reglement').length;
  const calendriersCount = documents.filter((d) => d.category === 'calendrier').length;
  const fournituresCount = documents.filter((d) => d.category === 'fournitures').length;
  const formulairesCount = documents.filter((d) => d.category === 'formulaires').length;

  // 3. STATISTIQUE 3 : Prochain événement à venir
  const validEvents = events
    .map((evt) => {
      const parsed = new Date(evt.startDate);
      return {
        ...evt,
        dateObj: isNaN(parsed.getTime()) ? new Date() : parsed,
      };
    })
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

  // Prochain événement futur (ou le plus proche)
  const nextEvent = validEvents.find((e) => e.dateObj >= now) || validEvents[0] || events[0];

  let daysRemaining: number | null = null;
  let formattedEventDate = 'À définir';
  let formattedEventTime = '';
  if (nextEvent) {
    const targetDate = new Date(nextEvent.startDate);
    if (!isNaN(targetDate.getTime())) {
      const diffTime = targetDate.getTime() - now.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      formattedEventDate = targetDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      // Capitalize first letter
      formattedEventDate = formattedEventDate.charAt(0).toUpperCase() + formattedEventDate.slice(1);
      
      const hours = targetDate.getHours();
      const minutes = targetDate.getMinutes();
      if (!isNaN(hours) && (hours !== 0 || minutes !== 0)) {
        formattedEventTime = ` à ${String(hours).padStart(2, '0')}h${String(minutes).padStart(2, '0')}`;
      }
    }
  }

  return (
    <div className="space-y-2.5 sm:space-y-3 font-sans" data-testid="quick-stats-dashboard-view">
      
      {/* Executive Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-3 sm:p-4 border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <h2 className="font-serif font-bold text-sm sm:text-base text-white tracking-tight">
                Vue Tableau de Bord : Statistiques Rapides du Collège
              </h2>
            </div>
            <p className="text-[11px] text-slate-300">
              Pilotage des effectifs scolaires, ressources numériques téléchargeables et calendrier officiel des événements ({currentMonthName} {currentYear}).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10.5px] font-mono border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Année Académique 2026-2027</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3 FAST STATISTICS MEGA CARDS (RESPONSIVE GRID) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
        
        {/* =========================================================================
            CARTE 1 : NOMBRE TOTAL D'ÉLÈVES INSCRITS
        ========================================================================= */}
        <div 
          data-stat-card="eleves-inscrits"
          className="bg-white rounded-2xl p-3.5 sm:p-4 border border-blue-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-3 relative overflow-hidden group"
        >
          {/* Accent Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-2.5 relative z-10">
            {/* Header Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                  <GraduationCap className="w-4 h-4 text-blue-900" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 font-mono">
                  Nombre Total d'Élèves Inscrits
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                2026-2027
              </span>
            </div>

            {/* Filter Toggle: Inscrits Validés vs Total Candidatures */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10.5px]">
              <button
                type="button"
                onClick={() => setStudentCountFilter('accepted')}
                className={`flex-1 py-0.8 px-1.5 rounded-md font-semibold transition-all cursor-pointer text-center ${
                  studentCountFilter === 'accepted'
                    ? 'bg-blue-900 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Inscrits Validés ({enrolledCount})
              </button>
              <button
                type="button"
                onClick={() => setStudentCountFilter('all')}
                className={`flex-1 py-0.8 px-1.5 rounded-md font-semibold transition-all cursor-pointer text-center ${
                  studentCountFilter === 'all'
                    ? 'bg-blue-900 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Total Inscriptions ({totalApplications})
              </button>
            </div>

            {/* Big Counter */}
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {studentCountFilter === 'accepted' ? enrolledCount : totalApplications}
                </span>
                <span className="text-xs font-semibold text-slate-600">
                  {studentCountFilter === 'accepted' ? 'élèves inscrits & admis' : 'dossiers d’inscription'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {studentCountFilter === 'accepted' ? (
                  <>Admissions formellement validées sur <strong className="text-slate-900">{totalApplications} candidatures</strong>.</>
                ) : (
                  <>Ensemble des demandes d’inscription reçues pour la rentrée 2026-2027.</>
                )}
              </p>
            </div>

            {/* Cycle Breakdown Badges */}
            <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-100 text-center">
              <div className="bg-slate-50 rounded-lg p-1.5 border border-slate-200/70">
                <span className="block font-mono text-xs font-bold text-blue-900">{prescolaireCount}</span>
                <span className="block text-[9.5px] text-slate-500">Préscolaire</span>
              </div>
              <div className="bg-slate-50 rounded-lg p-1.5 border border-slate-200/70">
                <span className="block font-mono text-xs font-bold text-blue-900">{fondamentalCount}</span>
                <span className="block text-[9.5px] text-slate-500">Fondamental</span>
              </div>
              <div className="bg-slate-50 rounded-lg p-1.5 border border-slate-200/70">
                <span className="block font-mono text-xs font-bold text-blue-900">{secondaireCount}</span>
                <span className="block text-[9.5px] text-slate-500">Secondaire</span>
              </div>
            </div>

            {/* Progress / Status Notice */}
            <div className="text-[10.5px] text-slate-500 flex items-center justify-between pt-0.5">
              <span>Taux d'admission : <strong className="text-emerald-700">{validationRate}%</strong></span>
              <span>En cours d'examen : <strong className="text-amber-700">{pendingApplications + interviewScheduledCount}</strong></span>
            </div>
          </div>

          {/* Action CTA */}
          <button
            type="button"
            onClick={() => onNavigateTab('admissions')}
            className="w-full inline-flex items-center justify-between px-3 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer group-hover:bg-blue-950"
          >
            <span>Gérer les dossiers d'admissions</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* =========================================================================
            CARTE 2 : NOUVEAUX DOCUMENTS UPLOADÉS CE MOIS-CI
        ========================================================================= */}
        <div 
          data-stat-card="nouveaux-documents"
          className="bg-white rounded-2xl p-3.5 sm:p-4 border border-amber-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-3 relative overflow-hidden group"
        >
          {/* Accent Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-2.5 relative z-10">
            {/* Header Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4 text-amber-800" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 font-mono">
                  Nouveaux Documents Uploadés ce Mois-ci
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 font-mono">
                {currentMonthName} {currentYear}
              </span>
            </div>

            {/* Big Counter */}
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {newDocsCount}
                </span>
                <span className="text-xs font-semibold text-slate-600">
                  nouveaux fichiers PDF
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Ressources PDF officielles téléchargeables par les parents et les élèves ({documents.length} au total).
              </p>
            </div>

            {/* Categories Breakdown */}
            <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-100 text-[10.5px]">
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-200/70">
                <span className="text-slate-600">Règlements :</span>
                <strong className="text-slate-900 font-mono">{reglementsCount}</strong>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-200/70">
                <span className="text-slate-600">Calendriers :</span>
                <strong className="text-slate-900 font-mono">{calendriersCount}</strong>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-200/70">
                <span className="text-slate-600">Fournitures :</span>
                <strong className="text-slate-900 font-mono">{fournituresCount}</strong>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-200/70">
                <span className="text-slate-600">Formulaires :</span>
                <strong className="text-slate-900 font-mono">{formulairesCount}</strong>
              </div>
            </div>

            {/* Cumulative Downloads Stat */}
            <div className="text-[10.5px] text-slate-500 flex items-center justify-between pt-0.5">
              <span>Téléchargements cumulés :</span>
              <strong className="text-emerald-700 font-mono flex items-center gap-1">
                <Download className="w-3 h-3 text-emerald-600" />
                <span>{totalDownloads} fois</span>
              </strong>
            </div>
          </div>

          {/* Action CTA */}
          <button
            type="button"
            onClick={() => {
              if (onOpenUploadDoc) {
                onOpenUploadDoc();
              } else {
                onNavigateTab('media');
              }
            }}
            className="w-full inline-flex items-center justify-between px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <span>Uploader & gérer les documents PDF</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* =========================================================================
            CARTE 3 : PROCHAIN ÉVÉNEMENT À VENIR
        ========================================================================= */}
        <div 
          data-stat-card="prochain-evenement"
          className="bg-white rounded-2xl p-3.5 sm:p-4 border border-purple-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-3 relative overflow-hidden group md:col-span-2 lg:col-span-1"
        >
          {/* Accent Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-2.5 relative z-10">
            {/* Header Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-7 h-7 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center font-bold">
                  <Calendar className="w-4 h-4 text-purple-800" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-900 font-mono">
                  Prochain Événement à Venir
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                daysRemaining !== null && daysRemaining <= 3 && daysRemaining >= 0
                  ? 'bg-rose-50 text-rose-800 border-rose-200 animate-pulse'
                  : 'bg-purple-50 text-purple-800 border-purple-200'
              }`}>
                {daysRemaining === 0 ? 'Aujourd’hui !' :
                 daysRemaining !== null && daysRemaining > 0 ? `Dans ${daysRemaining} jour(s)` :
                 'Agenda Officiel'}
              </span>
            </div>

            {/* Event Name & Date */}
            {nextEvent ? (
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900 leading-snug line-clamp-2">
                  {nextEvent.title}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-purple-900 font-semibold font-sans">
                  <Clock className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                  <span>{formattedEventDate}{formattedEventTime}</span>
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed mt-1">
                  {nextEvent.description || 'Rassemblement et activité officielle au calendrier pédagogique du campus.'}
                </p>
              </div>
            ) : (
              <div className="py-2 text-center text-xs text-slate-500">
                Aucun événement programmé actuellement.
              </div>
            )}

            {/* Event Details Badges */}
            {nextEvent && (
              <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-[10.5px] text-slate-500 flex-wrap">
                <span className="bg-slate-100 px-2 py-0.5 rounded font-mono text-slate-700 font-semibold">
                  {nextEvent.category || 'Général'}
                </span>
                <span className="flex items-center gap-1 text-slate-600">
                  <MapPin className="w-3 h-3 text-purple-700" />
                  <span>{nextEvent.location || 'Campus Delmas 50'}</span>
                </span>
              </div>
            )}

            <div className="text-[10.5px] text-slate-500 flex items-center justify-between pt-0.5">
              <span>Total événements programmés :</span>
              <strong className="text-purple-900 font-mono">{events.length} au calendrier</strong>
            </div>
          </div>

          {/* Action CTA */}
          <button
            type="button"
            onClick={() => onNavigateTab('events')}
            className="w-full inline-flex items-center justify-between px-3 py-2 rounded-xl bg-purple-900 hover:bg-purple-950 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <span>Consulter l'agenda officiel</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

      </div>

    </div>
  );
};
