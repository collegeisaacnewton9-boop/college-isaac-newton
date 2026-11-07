import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  ShieldCheck, 
  Phone, 
  MessageSquare, 
  Printer, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  GraduationCap, 
  Sparkles,
  ChevronRight,
  ArrowLeft,
  FileText,
  MapPin,
  CalendarCheck,
  Palmtree,
  UserCheck,
  Info,
  LayoutGrid,
  Table as TableIcon,
  Bell
} from 'lucide-react';
import { SCHOOL_INFO } from '../data/mockData';
import { FIRST_EXAM_DAYS } from '../components/events/FirstExamScheduleModal';
import { ExamReminderSubscribeModal } from '../components/events/ExamReminderSubscribeModal';

interface ExamSchedulePageProps {
  onNavigate: (page: string, subSection?: string) => void;
  initialControlIndex?: number;
}

interface ControlPeriodInfo {
  id: string;
  number: number;
  label: string;
  periodName: string;
  datesRange: string;
  durationDays: number;
  examDates: string;
  reportCardDate: string;
  notesDeliveryDate?: string;
  holidays?: string;
  specialEvents?: string[];
  isPublished: boolean;
  statusBadge: string;
  description: string;
}

const CONTROL_PERIODS: ControlPeriodInfo[] = [
  {
    id: 'control-1',
    number: 1,
    label: '1er Contrôle Académique',
    periodName: "Période d'Automne",
    datesRange: 'Du 7 septembre au 13 novembre 2026',
    durationDays: 49,
    examDates: '9 au 13 novembre 2026',
    reportCardDate: '27 novembre 2026',
    holidays: 'Vacances de Noël : 21 déc. 2026 – 3 janv. 2027 (Reprise le 4 janv.)',
    isPublished: true,
    statusBadge: 'Grille Officielle Publiée',
    description: "Évaluation du premier trimestre pour le 3e Cycle Fondamental et le Nouveau Secondaire.",
  },
  {
    id: 'control-2',
    number: 2,
    label: '2e Contrôle Académique',
    periodName: "Période d'Hiver",
    datesRange: 'Du 16 novembre 2026 au 29 janvier 2027',
    durationDays: 44,
    examDates: '25 au 29 janvier 2027',
    reportCardDate: '19 février 2027',
    holidays: 'Vacances de Carnaval : 8 au 10 février 2027',
    specialEvents: ['Partage des dédicaces : 12 février 2027'],
    isPublished: false,
    statusBadge: 'Calendrier Officiel Validé',
    description: "Examens du deuxième trimestre. La grille détaillée des matières sera diffusée avant les épreuves.",
  },
  {
    id: 'control-3',
    number: 3,
    label: '3e Contrôle Académique',
    periodName: 'Période de Printemps',
    datesRange: 'Du 2 mars au 30 avril 2027',
    durationDays: 51,
    examDates: '12 au 16 avril 2027',
    reportCardDate: '30 avril 2027',
    holidays: 'Vacances de Pâques : 25 au 29 mars 2027',
    isPublished: false,
    statusBadge: 'Période Confirmée (51 Jours)',
    description: "Période de printemps confirmée pour tous les niveaux. Préparation renforcée pour les classes d'examen.",
  },
  {
    id: 'control-4',
    number: 4,
    label: '4e Contrôle Académique',
    periodName: 'Période Finale & Clôture',
    datesRange: 'Du 19 avril au 4 juin 2027',
    durationDays: 35,
    examDates: '31 mai au 4 juin 2027',
    reportCardDate: '11 juin 2027 (Remise des notes)',
    specialEvents: [
      'Fête des professeurs : 14 mai 2027',
      'Fête du collège : 18 juin 2027',
      'Examens d’État 9e AF : 14 au 17 juin 2027',
      'Examens d’État NS4 : 28 juin au 1er juillet 2027',
      'Graduation solennelle : 10 juillet 2027'
    ],
    isPublished: false,
    statusBadge: 'Épreuves Finales & Clôture',
    description: "Clôture de l'année scolaire 2026-2027, passages de classe, décisions du conseil et examens officiels du MENFP.",
  },
];

export const ExamSchedulePage: React.FC<ExamSchedulePageProps> = ({ 
  onNavigate,
  initialControlIndex = 0
}) => {
  const [selectedControl, setSelectedControl] = useState<number>(initialControlIndex);
  const [selectedCycle, setSelectedCycle] = useState<'all' | 'fundamental' | 'secondary123' | 'secondary4'>('all');
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);

  const phone1 = SCHOOL_INFO.phone1 || '+509 3316-0934';
  const phone2 = SCHOOL_INFO.phone2 || '+509 3721-1818';

  const currentControl = CONTROL_PERIODS[selectedControl];

  const handlePrint = () => {
    window.print();
  };

  const filteredDays = selectedDay === 'all' 
    ? FIRST_EXAM_DAYS 
    : FIRST_EXAM_DAYS.filter(d => d.dayName.toLowerCase() === selectedDay.toLowerCase());

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-6 lg:py-8 space-y-5 sm:space-y-7 font-sans">
      
      {/* Print Stylesheet */}
      <style>{`
        @media print {
          nav, header, footer, .no-print { display: none !important; }
          body { background: white !important; color: black !important; font-size: 10pt !important; }
          .print-block { break-inside: avoid; }
        }
      `}</style>

      {/* 1. Breadcrumbs & Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs border-b border-slate-200/80 pb-3 no-print">
        <div className="flex items-center gap-1.5 sm:gap-2 text-slate-500 overflow-x-auto whitespace-nowrap [scrollbar-width:none]">
          <button 
            type="button" 
            onClick={() => onNavigate('home')}
            className="hover:text-blue-900 transition-colors cursor-pointer shrink-0"
          >
            Accueil
          </button>
          <span>/</span>
          <button 
            type="button" 
            onClick={() => onNavigate('events')}
            className="hover:text-blue-900 transition-colors cursor-pointer shrink-0"
          >
            Vie Scolaire & Agenda
          </button>
          <span>/</span>
          <span className="font-semibold text-slate-900 truncate">
            Horaires des Contrôles Académiques
          </span>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('events')}
          className="inline-flex items-center gap-1.5 text-blue-900 hover:text-blue-950 font-bold transition-colors cursor-pointer self-start sm:self-auto shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retour à l'Agenda Général</span>
        </button>
      </div>

      {/* 2. Hero Header - Dynamic Responsive Container */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white p-4 sm:p-7 lg:p-9 border border-slate-800 shadow-xl">
        {/* Glow ambient background */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative space-y-3.5 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider bg-amber-400 text-slate-950 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Année Académique 2026–2027
            </span>
            <span className="text-[11px] sm:text-xs text-slate-300 font-medium px-2.5 py-0.5 rounded-full bg-white/10 border border-white/10">
              4 Contrôles Académiques MENFP
            </span>
          </div>

          <h1 className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
            Horaires des Épreuves & Contrôles Académiques
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-slate-200 leading-relaxed font-light">
            Consultez les grilles horaires officielles des évaluations écrites pour le 
            <strong className="text-amber-300 font-semibold"> 3e Cycle Fondamental (7e, 8e, 9e AF)</strong> et le 
            <strong className="text-amber-300 font-semibold"> Nouveau Secondaire (NS1 à NS4)</strong>. 
            Les examens se déroulent aux heures régulières de classe.
          </p>

          {/* Quick Contacts & Actions inside Header */}
          <div className="pt-3 border-t border-slate-800/90 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 no-print">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-300">
              <span className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5 text-[11px] sm:text-xs">
                <Phone className="w-3.5 h-3.5" /> Secrétariat :
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
              <span className="text-slate-400 text-xs hidden lg:inline">
                (Accueil des familles dès 07h15 à Delmas 50)
              </span>
            </div>

            <div className="flex flex-wrap sm:flex-row items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsSubscribeModalOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs hover:shadow transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                title="S'abonner aux rappels d'épreuves par e-mail ou notification push"
              >
                <Bell className="w-3.5 h-3.5 text-amber-300" />
                <span>Rappels E-mail & Push</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-xs hover:shadow transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                title="Imprimer l'horaire d'examen au format A4"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimer la Grille</span>
              </button>

              <a
                href={`https://wa.me/${phone1.replace(/[^0-9]/g, '') || '50933160934'}?text=Bonjour,%20je%20souhaite%20une%20information%20concernant%20l'horaire%20des%20contrôles%20académiques`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-xs hover:shadow whitespace-nowrap"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Secrétariat</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Selector Tabs: The 4 Controls (Responsive 1/2/4 Grid) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
            Sélectionnez la période d'évaluation :
          </h2>
          <span className="text-[11px] sm:text-xs text-slate-400 font-mono">
            {CONTROL_PERIODS.length} périodes officielles
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          {CONTROL_PERIODS.map((ctrl, idx) => {
            const isSelected = selectedControl === idx;
            return (
              <button
                key={ctrl.id}
                type="button"
                onClick={() => setSelectedControl(idx)}
                className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-900 text-white border-blue-900 shadow-md ring-2 ring-blue-900/20'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/90 shadow-2xs'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isSelected 
                        ? 'bg-amber-400 text-slate-950' 
                        : 'bg-blue-50 text-blue-900'
                    }`}>
                      {ctrl.number}e Contrôle
                    </span>
                    <span className={`text-[10px] sm:text-[11px] font-mono font-semibold ${
                      isSelected ? 'text-blue-200' : 'text-slate-400'
                    }`}>
                      {ctrl.durationDays} jours
                    </span>
                  </div>

                  <div>
                    <h3 className={`font-serif font-bold text-sm sm:text-base ${
                      isSelected ? 'text-white' : 'text-slate-900'
                    }`}>
                      {ctrl.periodName}
                    </h3>
                    <p className={`text-xs mt-0.5 font-medium ${
                      isSelected ? 'text-amber-300' : 'text-blue-900'
                    }`}>
                      {ctrl.examDates}
                    </p>
                  </div>
                </div>

                <div className={`mt-3 pt-2 text-[10.5px] sm:text-[11px] border-t flex items-center justify-between ${
                  isSelected ? 'border-white/20 text-slate-200' : 'border-slate-100 text-slate-500'
                }`}>
                  <span className="truncate">{ctrl.statusBadge}</span>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ml-1 ${
                    isSelected ? 'text-amber-400' : 'text-slate-400'
                  }`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3b. Interactive Reminder Subscription Card for Students & Parents */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-2xl p-4 sm:p-5 border border-amber-400/30 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 no-print">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <Bell className="w-5 h-5 text-slate-950" />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30 font-mono">
                Alerte Automatisée Élèves & Parents
              </span>
              <span className="text-[11px] text-slate-300 font-mono hidden sm:inline">
                48h et 24h avant chaque contrôle
              </span>
            </div>
            <h3 className="font-serif font-bold text-sm sm:text-base text-white tracking-tight">
              Ne manquez aucune épreuve ! Activez vos rappels par e-mail et notification push
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-light max-w-2xl">
              Recevez les horaires détaillés par discipline, les convocations et les consignes officielles directement sur votre boîte courriel et sur votre appareil (PWA).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsSubscribeModalOpen(true)}
          className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer whitespace-nowrap self-start md:self-auto"
        >
          <Bell className="w-3.5 h-3.5" />
          <span>M'abonner aux rappels</span>
        </button>
      </div>

      {/* 4. Official Directive Banner */}
      <div className="bg-amber-50 border-2 border-amber-300/80 rounded-2xl p-3.5 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-950 shadow-xs">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-200/80 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5 text-amber-800" />
          </div>
          <div className="space-y-0.5 text-xs sm:text-sm min-w-0">
            <h4 className="font-serif font-bold text-amber-950 text-sm sm:text-base">
              Note Officielle de la Direction des Études
            </h4>
            <p className="text-amber-900/90 leading-relaxed font-light">
              Les examens se feront <strong>aux heures habituelles des cours par les professeurs de chaque matière</strong>. 
              Toutes autres dispositions pédagogiques ou consignes jugées nécessaires par la Direction seront appliquées pour garantir la sérénité des épreuves.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-amber-800 font-bold bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300 whitespace-nowrap">
            Règlement Pédagogique
          </span>
        </div>
      </div>

      {/* 5. Period Content : 1er Contrôle vs 2e/3e/4e Contrôles */}
      {selectedControl === 0 ? (
        /* ================= 1ER CONTRÔLE : GRILLE OFFICIELLE COMPLÈTE ================= */
        <div className="space-y-5 sm:space-y-6">
          
          {/* Controls Bar : Level Filters + Day Selectors + View Mode Switch (Fully responsive) */}
          <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/90 shadow-xs space-y-3.5 no-print">
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              
              {/* Cycle Selector (Horizontally scrollable on mobile) */}
              <div className="space-y-1.5 min-w-0">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Filtrer par Filière / Cycle :
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex-nowrap sm:flex-wrap">
                  {[
                    { id: 'all', label: 'Tous les Niveaux' },
                    { id: 'fundamental', label: '3e Cycle (7e, 8e, 9e AF)' },
                    { id: 'secondary123', label: 'Nouveau Secondaire 1, 2 et 3' },
                    { id: 'secondary4', label: 'Secondaire 4 (NS4 / Bac)' },
                  ].map(cycle => (
                    <button
                      key={cycle.id}
                      type="button"
                      onClick={() => setSelectedCycle(cycle.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        selectedCycle === cycle.id
                          ? 'bg-blue-900 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {cycle.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* View Switcher (Grille vs Tableau Matrice) */}
              <div className="space-y-1.5 shrink-0 self-start lg:self-auto">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Mode d'Affichage :
                </span>
                <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setViewMode('cards')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      viewMode === 'cards'
                        ? 'bg-white text-blue-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Vue Cartes</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      viewMode === 'table'
                        ? 'bg-white text-blue-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>Tableau Hebdo</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Day Filter (Lundi - Vendredi) */}
            {viewMode === 'cards' && (
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Sélectionner un Jour Spécifique :
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex-nowrap sm:flex-wrap">
                  {['all', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        selectedDay.toLowerCase() === day.toLowerCase()
                          ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {day === 'all' ? 'Toute la semaine' : day}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* VIEW 1 : CARDS LAYOUT (Responsive 1 col mobile, 2 cols tablet, 3 cols desktop) */}
          {viewMode === 'cards' ? (
            <div className="space-y-5 sm:space-y-6">
              {filteredDays.map((day) => (
                <div 
                  key={day.dayName}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden print-block"
                >
                  {/* Day Header */}
                  <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white px-4 sm:px-6 py-3.5 sm:py-4 flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-serif font-extrabold text-sm sm:text-base shadow-sm shrink-0">
                        {day.dayName.substring(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-base sm:text-lg text-white">
                          {day.dayName}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-slate-300 font-mono">
                          {day.dateStr}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/10 text-amber-300 border border-white/15">
                        Journée d'évaluation
                      </span>
                    </div>
                  </div>

                  {/* Day Grid by Level : 1 col mobile, 2 cols tablet (md), 3 cols desktop (xl) */}
                  <div className="p-3.5 sm:p-5 lg:p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-5">
                    
                    {/* 1. 3e Cycle Fondamental */}
                    {(selectedCycle === 'all' || selectedCycle === 'fundamental') && (
                      <div className={`rounded-2xl border transition-all p-3.5 sm:p-4 flex flex-col justify-between ${
                        selectedCycle === 'fundamental'
                          ? 'md:col-span-2 xl:col-span-3 bg-blue-50/60 border-blue-300 shadow-sm'
                          : 'bg-slate-50/70 border-slate-200/90'
                      }`}>
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                            <div className="flex items-center gap-2 min-w-0">
                              <GraduationCap className="w-4 h-4 text-blue-900 shrink-0" />
                              <h4 className="font-serif font-bold text-xs sm:text-sm text-slate-900 truncate">
                                3e Cycle (7e, 8e, 9e AF)
                              </h4>
                            </div>
                            <span className="text-[9.5px] sm:text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-900 shrink-0">
                              Fondamental
                            </span>
                          </div>

                          <div className="space-y-2">
                            {day.fundamental.map((slot, idx) => (
                              <div 
                                key={idx}
                                className="p-2.5 sm:p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col xs:flex-row sm:flex-row xs:items-center sm:items-center justify-between gap-1.5 sm:gap-2.5 hover:border-blue-300 transition-colors"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="font-bold text-xs sm:text-sm text-slate-900 leading-snug break-words">
                                    {slot.subject}
                                  </p>
                                  {slot.notes && (
                                    <p className="text-[11px] text-slate-500 mt-0.5">{slot.notes}</p>
                                  )}
                                </div>
                                <span className="shrink-0 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-mono font-bold bg-blue-50 text-blue-900 border border-blue-200 self-start xs:self-center sm:self-center whitespace-nowrap">
                                  {slot.time}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-200/70 text-[10px] sm:text-[11px] text-slate-500 font-mono flex items-center justify-between">
                          <span>Épreuves en salle</span>
                          <span className="font-bold text-blue-900">Surveillance continue</span>
                        </div>
                      </div>
                    )}

                    {/* 2. Nouveau Secondaire 1, 2 et 3 */}
                    {(selectedCycle === 'all' || selectedCycle === 'secondary123') && (
                      <div className={`rounded-2xl border transition-all p-3.5 sm:p-4 flex flex-col justify-between ${
                        selectedCycle === 'secondary123'
                          ? 'md:col-span-2 xl:col-span-3 bg-amber-50/60 border-amber-300 shadow-sm'
                          : 'bg-slate-50/70 border-slate-200/90'
                      }`}>
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                            <div className="flex items-center gap-2 min-w-0">
                              <BookOpen className="w-4 h-4 text-amber-700 shrink-0" />
                              <h4 className="font-serif font-bold text-xs sm:text-sm text-slate-900 truncate">
                                Secondaire 1, 2 et 3 (NS)
                              </h4>
                            </div>
                            <span className="text-[9.5px] sm:text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900 shrink-0">
                              Secondaire
                            </span>
                          </div>

                          <div className="space-y-2">
                            {day.secondary123.map((slot, idx) => (
                              <div 
                                key={idx}
                                className="p-2.5 sm:p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col xs:flex-row sm:flex-row xs:items-center sm:items-center justify-between gap-1.5 sm:gap-2.5 hover:border-amber-300 transition-colors"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="font-bold text-xs sm:text-sm text-slate-900 leading-snug break-words">
                                    {slot.subject}
                                  </p>
                                  {slot.notes && (
                                    <p className="text-[11px] text-slate-500 mt-0.5">{slot.notes}</p>
                                  )}
                                </div>
                                <span className="shrink-0 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 self-start xs:self-center sm:self-center whitespace-nowrap">
                                  {slot.time}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-200/70 text-[10px] sm:text-[11px] text-slate-500 font-mono flex items-center justify-between">
                          <span>Épreuves en salle</span>
                          <span className="font-bold text-amber-800">Surveillance continue</span>
                        </div>
                      </div>
                    )}

                    {/* 3. Nouveau Secondaire 4 (NS4) */}
                    {(selectedCycle === 'all' || selectedCycle === 'secondary4') && (
                      <div className={`rounded-2xl border transition-all p-3.5 sm:p-4 flex flex-col justify-between ${
                        selectedCycle === 'secondary4'
                          ? 'md:col-span-2 xl:col-span-3 bg-purple-50/60 border-purple-300 shadow-sm'
                          : 'bg-slate-50/70 border-slate-200/90'
                      }`}>
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                            <div className="flex items-center gap-2 min-w-0">
                              <Sparkles className="w-4 h-4 text-purple-700 shrink-0" />
                              <h4 className="font-serif font-bold text-xs sm:text-sm text-slate-900 truncate">
                                Secondaire 4 (NS4)
                              </h4>
                            </div>
                            <span className="text-[9.5px] sm:text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-900 shrink-0">
                              Terminale (Bac)
                            </span>
                          </div>

                          <div className="space-y-2">
                            {day.secondary4.map((slot, idx) => (
                              <div 
                                key={idx}
                                className="p-2.5 sm:p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col xs:flex-row sm:flex-row xs:items-center sm:items-center justify-between gap-1.5 sm:gap-2.5 hover:border-purple-300 transition-colors"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="font-bold text-xs sm:text-sm text-slate-900 leading-snug break-words">
                                    {slot.subject}
                                  </p>
                                  {slot.notes && (
                                    <p className="text-[11px] text-slate-500 mt-0.5">{slot.notes}</p>
                                  )}
                                </div>
                                <span className="shrink-0 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-mono font-bold bg-purple-50 text-purple-800 border border-purple-200 self-start xs:self-center sm:self-center whitespace-nowrap">
                                  {slot.time}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-200/70 text-[10px] sm:text-[11px] text-slate-500 font-mono flex items-center justify-between">
                          <span>Épreuves en salle</span>
                          <span className="font-bold text-purple-800">Baccalauréat Prépa</span>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* VIEW 2 : COMPREHENSIVE WEEKLY MATRIX TABLE (TABLEAU COMPLET) */
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between gap-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <TableIcon className="w-4 h-4 text-amber-400" />
                  <h3 className="font-serif font-bold text-sm sm:text-base text-white">
                    Matrice Hebdomadaire Complète · 1er Contrôle (9 au 13 Nov. 2026)
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                  Filières Fondamental & Secondaire
                </span>
              </div>

              {/* Scrollable table container */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10.5px]">
                      <th className="p-3 w-40 border-r border-slate-200 sticky left-0 bg-slate-100 z-10 shadow-xs">
                        Niveau / Cycle
                      </th>
                      {FIRST_EXAM_DAYS.map(d => (
                        <th key={d.dayName} className="p-3 min-w-[150px] border-r border-slate-200">
                          <div>{d.dayName}</div>
                          <div className="text-[9.5px] font-normal text-slate-500 lowercase first-letter:uppercase">{d.dateStr}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    
                    {/* Row 1: 3e Cycle Fondamental */}
                    <tr className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-3 font-serif font-bold text-slate-900 bg-slate-50/80 border-r border-slate-200 sticky left-0 z-10">
                        <div className="flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                          <span>3e Cycle Fondamental</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 font-normal">7e, 8e, 9e AF</span>
                      </td>
                      {FIRST_EXAM_DAYS.map(d => (
                        <td key={d.dayName} className="p-2.5 border-r border-slate-100 align-top">
                          <div className="space-y-1.5">
                            {d.fundamental.map((s, i) => (
                              <div key={i} className="p-1.5 rounded bg-blue-50/60 border border-blue-100">
                                <div className="font-bold text-[11px] text-slate-900">{s.subject}</div>
                                <div className="text-[9.5px] font-mono text-blue-900">{s.time}</div>
                              </div>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Row 2: Nouveau Secondaire 1, 2 et 3 */}
                    <tr className="hover:bg-amber-50/30 transition-colors">
                      <td className="p-3 font-serif font-bold text-slate-900 bg-slate-50/80 border-r border-slate-200 sticky left-0 z-10">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                          <span>Secondaire 1, 2 et 3</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 font-normal">NS1, NS2, NS3</span>
                      </td>
                      {FIRST_EXAM_DAYS.map(d => (
                        <td key={d.dayName} className="p-2.5 border-r border-slate-100 align-top">
                          <div className="space-y-1.5">
                            {d.secondary123.map((s, i) => (
                              <div key={i} className="p-1.5 rounded bg-amber-50/60 border border-amber-100">
                                <div className="font-bold text-[11px] text-slate-900">{s.subject}</div>
                                <div className="text-[9.5px] font-mono text-amber-800">{s.time}</div>
                              </div>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Row 3: Secondaire 4 */}
                    <tr className="hover:bg-purple-50/30 transition-colors">
                      <td className="p-3 font-serif font-bold text-slate-900 bg-slate-50/80 border-r border-slate-200 sticky left-0 z-10">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                          <span>Secondaire 4 (NS4)</span>
                        </div>
                        <span className="text-[10px] font-mono text-purple-700 font-bold">Terminale (Bac)</span>
                      </td>
                      {FIRST_EXAM_DAYS.map(d => (
                        <td key={d.dayName} className="p-2.5 border-r border-slate-100 align-top">
                          <div className="space-y-1.5">
                            {d.secondary4.map((s, i) => (
                              <div key={i} className="p-1.5 rounded bg-purple-50/60 border border-purple-100">
                                <div className="font-bold text-[11px] text-slate-900">{s.subject}</div>
                                <div className="text-[9.5px] font-mono text-purple-800">{s.time}</div>
                              </div>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>

                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
                <span>Glissez horizontalement pour faire défiler tous les jours de la semaine.</span>
                <span className="font-bold text-blue-900">Collège Isaac Newton · SI Pédagogique</span>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* ================= 2E, 3E & 4E CONTRÔLES : VUE SYNTHÉTIQUE & PRÉVISIONNELLE ================= */
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 lg:p-8 border border-slate-200 shadow-sm space-y-5 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-blue-900 mb-1">
                <CalendarCheck className="w-4 h-4 text-amber-500" />
                <span>Période Académique Officielle · {currentControl.label}</span>
              </div>
              <h3 className="font-serif text-lg sm:text-2xl font-bold text-slate-900">
                {currentControl.periodName} ({currentControl.datesRange})
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-900 text-xs font-mono font-bold border border-blue-200 self-start sm:self-auto">
              {currentControl.statusBadge}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-blue-900">
                Dates des Examens
              </span>
              <p className="font-serif font-bold text-base sm:text-lg text-slate-900">
                {currentControl.examDates}
              </p>
              <p className="text-xs text-slate-600">
                Épreuves écrites et orales pour l'ensemble des classes.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-emerald-800">
                Remise des Carnets / Notes
              </span>
              <p className="font-serif font-bold text-base sm:text-lg text-slate-900">
                {currentControl.reportCardDate}
              </p>
              <p className="text-xs text-slate-600">
                Rencontre parents-professeurs et bilan trimestriel.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 sm:col-span-2 lg:col-span-1">
              <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-amber-800">
                Congés & Vacances
              </span>
              <p className="font-serif font-bold text-sm sm:text-base text-slate-900">
                {currentControl.holidays || 'Selon le calendrier officiel MENFP'}
              </p>
              <p className="text-xs text-slate-600">
                Reprise des cours aux horaires réguliers dès 07h30.
              </p>
            </div>
          </div>

          {currentControl.specialEvents && (
            <div className="p-4 sm:p-5 rounded-2xl bg-blue-950 text-white space-y-3">
              <h4 className="font-serif font-bold text-xs sm:text-sm md:text-base text-amber-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Événements Clés & Examens d'État durant cette période :</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-slate-200">
                {currentControl.specialEvents.map((evt, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white/10 p-2.5 rounded-xl border border-white/10">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{evt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-amber-50 p-3.5 sm:p-4 rounded-2xl border border-amber-200 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                La grille horaire détaillée matière par matière pour le <strong>{currentControl.label}</strong> sera diffusée 2 semaines avant les épreuves.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedControl(0)}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              Voir la Grille du 1er Contrôle
            </button>
          </div>
        </div>
      )}

      {/* 6. Consignes d'Organisation & Conseils aux Familles (Responsive 1/2/4 Grid) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-slate-200 shadow-sm space-y-4 sm:space-y-5 print-block">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-blue-900 shrink-0" />
            <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900">
              Directives Pédagogiques & Consignes aux Candidats
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono hidden sm:inline">
            Discipline & Sérénité
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs text-slate-700">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center gap-2 text-blue-900 font-bold">
              <Clock className="w-4 h-4 shrink-0" />
              <span>Ponctualité dès 07h15</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Arrivée sur la cour impérative à 07h15. Fermeture de la barrière à 07h45. Aucun retarditaire n'est admis après la distribution des sujets.
            </p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-800 font-bold">
              <UserCheck className="w-4 h-4 shrink-0" />
              <span>Uniforme Complet Obligatoire</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Tenue officielle de l’institution exigée avec écusson brodé et chaussures fermées. La carte d'élève doit être visible sur la table.
            </p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-800 font-bold">
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>Matériel Personnel</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Stylos (bleu ou noir), crayons et matériel de géométrie personnel. Tout échange de matériel entre élèves est strictement prohibé en salle.
            </p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center gap-2 text-rose-800 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Téléphones Strictement Interdits</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Tout appareil électronique ou montre connectée doit impérativement rester éteint dans le cartable sous peine d’annulation de l’épreuve.
            </p>
          </div>
        </div>

        {/* Secretary Contacts & Direct Assistance */}
        <div className="mt-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Phone className="w-4 h-4 shrink-0" />
              <span>Assistance & Justification d'Absence Immédiate</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Pour signaler un cas de force majeure ou maladie le jour d'un examen, contactez le secrétariat avant 09h00 :
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1 text-xs">
              <a 
                href={`tel:${phone1.replace(/[^0-9+]/g, '')}`}
                className="font-mono font-bold text-white hover:text-amber-300 underline"
              >
                Ligne 1 : {phone1}
              </a>
              <span className="text-slate-500">|</span>
              <a 
                href={`tel:${phone2.replace(/[^0-9+]/g, '')}`}
                className="font-mono font-bold text-white hover:text-amber-300 underline"
              >
                Ligne 2 : {phone2}
              </a>
              <span className="text-slate-500 hidden sm:inline">|</span>
              <a 
                href={`mailto:${SCHOOL_INFO.email}`}
                className="text-amber-300 hover:underline block sm:inline truncate max-w-[200px]"
              >
                {SCHOOL_INFO.email}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto no-print">
            <button
              type="button"
              onClick={handlePrint}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer l'horaire</span>
            </button>
          </div>
        </div>

      </div>

      {/* Modal d'abonnement aux rappels d'épreuves (E-mail & Push) */}
      <ExamReminderSubscribeModal
        isOpen={isSubscribeModalOpen}
        onClose={() => setIsSubscribeModalOpen(false)}
        defaultLevel={selectedCycle === 'all' ? 'ALL' : selectedCycle === 'fundamental' ? 'CYCLE_3' : selectedCycle === 'secondary4' ? 'NS4' : 'SECONDAIRE'}
        defaultControlId={selectedControl + 1}
      />

    </div>
  );
};
