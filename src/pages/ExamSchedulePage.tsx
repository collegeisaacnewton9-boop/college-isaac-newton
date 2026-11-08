import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  ShieldCheck, 
  Phone, 
  MessageSquare, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  GraduationCap, 
  Sparkles, 
  ChevronRight, 
  ArrowLeft, 
  CalendarCheck, 
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
    label: '1er Contrôle',
    periodName: "Période d'Automne",
    datesRange: 'Du 7 sept. au 13 nov. 2026',
    durationDays: 49,
    examDates: '9 au 13 nov. 2026',
    reportCardDate: '27 nov. 2026',
    holidays: 'Vacances de Noël : 21 déc. 2026 – 3 janv. 2027 (Reprise le 4 janv.)',
    isPublished: true,
    statusBadge: 'Grille Publiée',
    description: "Évaluation du premier trimestre pour le 3e Cycle Fondamental et le Nouveau Secondaire.",
  },
  {
    id: 'control-2',
    number: 2,
    label: '2e Contrôle',
    periodName: "Période d'Hiver",
    datesRange: 'Du 16 nov. 2026 au 29 janv. 2027',
    durationDays: 44,
    examDates: '25 au 29 janv. 2027',
    reportCardDate: '19 fév. 2027',
    holidays: 'Vacances de Carnaval : 8 au 10 fév. 2027',
    specialEvents: ['Partage des dédicaces : 12 fév. 2027'],
    isPublished: false,
    statusBadge: 'Calendrier Validé',
    description: "Examens du deuxième trimestre. La grille détaillée des matières sera diffusée avant les épreuves.",
  },
  {
    id: 'control-3',
    number: 3,
    label: '3e Contrôle',
    periodName: 'Période de Printemps',
    datesRange: 'Du 2 mars au 30 avril 2027',
    durationDays: 51,
    examDates: '12 au 16 avril 2027',
    reportCardDate: '30 avril 2027',
    holidays: 'Vacances de Pâques : 25 au 29 mars 2027',
    isPublished: false,
    statusBadge: 'Période Confirmée',
    description: "Période de printemps confirmée pour tous les niveaux. Préparation renforcée pour les classes d'examen.",
  },
  {
    id: 'control-4',
    number: 4,
    label: '4e Contrôle',
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
    statusBadge: 'Épreuves Finales',
    description: `Clôture de l'année scolaire ${SCHOOL_INFO.currentYear}, passages de classe, décisions du conseil des professeurs et épreuves finales de fin d'année.`,
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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-4 lg:py-5 space-y-3 sm:space-y-4 font-sans">
      
      {/* Print Stylesheet */}
      <style>{`
        @media print {
          nav, header, footer, .no-print { display: none !important; }
          body { background: white !important; color: black !important; font-size: 10pt !important; }
          .print-block { break-inside: avoid; }
        }
      `}</style>

      {/* 1. Slim Breadcrumb & Back Bar */}
      <div className="flex items-center justify-between text-xs border-b border-slate-200/70 pb-2 no-print">
        <div className="flex items-center gap-1.5 text-slate-500 overflow-x-auto whitespace-nowrap [scrollbar-width:none]">
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
          className="inline-flex items-center gap-1 text-blue-900 hover:text-blue-950 font-bold transition-colors cursor-pointer shrink-0 text-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Retour à l'Agenda</span>
        </button>
      </div>

      {/* 2. Modern Compact Command Deck (Hero Header) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white p-3.5 sm:p-5 lg:p-6 border border-slate-800/90 shadow-md">
        {/* Glow ambient background */}
        <div className="absolute -right-16 -bottom-16 w-56 h-56 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -top-16 w-56 h-56 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          
          {/* Left Title & Description */}
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold uppercase tracking-wider bg-amber-400 text-slate-950 shadow-xs">
                <Sparkles className="w-3 h-3" />
                2026–2027
              </span>
              <span className="text-[11px] text-slate-300 font-medium">
                4 Contrôles Académiques de l'Établissement
              </span>
              <span className="text-slate-600 hidden sm:inline">·</span>
              <span className="text-slate-300 text-[11px] flex items-center gap-1">
                <Phone className="w-3 h-3 text-amber-400" />
                <a href={`tel:${phone1.replace(/[^0-9+]/g, '')}`} className="font-mono text-white hover:text-amber-300 underline font-bold">
                  {phone1}
                </a>
                <span className="text-slate-500">/</span>
                <a href={`tel:${phone2.replace(/[^0-9+]/g, '')}`} className="font-mono text-white hover:text-amber-300 underline font-bold">
                  {phone2}
                </a>
              </span>
            </div>

            <h1 className="font-serif text-lg sm:text-2xl md:text-3xl font-bold text-white tracking-tight leading-snug">
              Horaires des Épreuves & Contrôles Académiques
            </h1>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-light">
              Grilles officielles des évaluations pour le <strong className="text-amber-300 font-semibold">3e Cycle Fondamental (7e, 8e, 9e AF)</strong> et le <strong className="text-amber-300 font-semibold">Nouveau Secondaire (NS1 à NS4)</strong>.
            </p>
          </div>

          {/* Right Action Buttons - Compact & Direct */}
          <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t border-slate-800/80 lg:border-t-0 no-print">
            <button
              type="button"
              onClick={() => setIsSubscribeModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer whitespace-nowrap"
              title="S'abonner aux rappels d'épreuves"
            >
              <Bell className="w-3.5 h-3.5 text-slate-950" />
              <span>Rappels d'Épreuves</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/15 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
              title="Imprimer l'horaire d'examen"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer</span>
            </button>

            <a
              href={`https://wa.me/${phone1.replace(/[^0-9]/g, '') || '50933160934'}?text=Bonjour,%20je%20souhaite%20une%20information%20concernant%20l'horaire%20des%20contrôles%20académiques`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-xs whitespace-nowrap"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>

        </div>
      </div>

      {/* 3. Sleek Ergonomic 4-Control Period Bar (Dock compact) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
        {CONTROL_PERIODS.map((ctrl, idx) => {
          const isSelected = selectedControl === idx;
          return (
            <button
              key={ctrl.id}
              type="button"
              onClick={() => setSelectedControl(idx)}
              className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-900 text-white border-blue-900 shadow-md ring-2 ring-blue-900/20'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/90 shadow-2xs'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    isSelected 
                      ? 'bg-amber-400 text-slate-950' 
                      : 'bg-blue-50 text-blue-900'
                  }`}>
                    {ctrl.number}e Contrôle
                  </span>
                  <span className={`text-[10px] font-mono ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                    {ctrl.durationDays} j
                  </span>
                </div>

                <div>
                  <h3 className={`font-serif font-bold text-xs sm:text-sm leading-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {ctrl.periodName}
                  </h3>
                  <p className={`text-[11px] font-semibold mt-0.5 ${isSelected ? 'text-amber-300' : 'text-blue-900'}`}>
                    {ctrl.examDates}
                  </p>
                </div>
              </div>

              <div className={`mt-2 pt-1.5 text-[10px] border-t flex items-center justify-between ${
                isSelected ? 'border-white/20 text-slate-200' : 'border-slate-100 text-slate-500'
              }`}>
                <span className="truncate">{ctrl.statusBadge}</span>
                <ChevronRight className={`w-3 h-3 shrink-0 ml-1 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* 4. Unified Compact Notice & Reminder Strip */}
      <div className="bg-amber-50/90 border border-amber-300/80 rounded-xl p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-amber-950 shadow-2xs no-print">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-amber-200/80 text-amber-900 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4 text-amber-800" />
          </div>
          <p className="text-xs leading-snug font-light text-amber-900">
            <strong>Note de la Direction :</strong> Les examens se font <strong>aux heures habituelles des cours par les professeurs</strong> de chaque matière. Ponctualité obligatoire dès 07h15.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={() => setIsSubscribeModalOpen(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <Bell className="w-3 h-3 text-slate-950" />
            <span>Activer mes rappels</span>
          </button>
        </div>
      </div>

      {/* 5. Period Content : 1er Contrôle vs 2e/3e/4e Contrôles */}
      {selectedControl === 0 ? (
        /* ================= 1ER CONTRÔLE : GRILLE OFFICIELLE COMPLÈTE ================= */
        <div className="space-y-3 sm:space-y-3.5">
          
          {/* Compact Unified Toolbar : Cycle + View Mode + Day Switcher */}
          <div className="bg-white rounded-xl p-2.5 sm:p-3 border border-slate-200/90 shadow-2xs space-y-2 no-print">
            
            {/* Row 1: Cycles + View Mode */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex-nowrap sm:flex-wrap">
                <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-400 mr-1 hidden sm:inline">
                  Filière :
                </span>
                {[
                  { id: 'all', label: 'Tous les Niveaux' },
                  { id: 'fundamental', label: '3e Cycle (7e, 8e, 9e AF)' },
                  { id: 'secondary123', label: 'Secondaire 1, 2, 3' },
                  { id: 'secondary4', label: 'Secondaire 4 (Terminale / NS4)' },
                ].map(cycle => (
                  <button
                    key={cycle.id}
                    type="button"
                    onClick={() => setSelectedCycle(cycle.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCycle === cycle.id
                        ? 'bg-blue-900 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {cycle.label}
                  </button>
                ))}
              </div>

              {/* View Switcher */}
              <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === 'cards'
                      ? 'bg-white text-blue-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Vue Cartes</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-white text-blue-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Tableau Hebdo</span>
                </button>
              </div>
            </div>

            {/* Row 2: Day Filter (when in cards view) */}
            {viewMode === 'cards' && (
              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex-nowrap sm:flex-wrap">
                <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-400 mr-1 hidden sm:inline">
                  Jour :
                </span>
                {['all', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedDay.toLowerCase() === day.toLowerCase()
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {day === 'all' ? 'Toute la semaine' : day}
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* VIEW 1 : CARDS LAYOUT (Compact, dense, fluid responsive grid) */}
          {viewMode === 'cards' ? (
            <div className="space-y-3 sm:space-y-3.5">
              {filteredDays.map((day) => (
                <div 
                  key={day.dayName}
                  className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden print-block"
                >
                  {/* Day Header - Compact */}
                  <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-serif font-extrabold text-xs shadow-xs shrink-0">
                        {day.dayName.substring(0, 2)}
                      </div>
                      <div className="flex items-baseline gap-2">
                        <h3 className="font-serif font-bold text-sm sm:text-base text-white">
                          {day.dayName}
                        </h3>
                        <span className="text-xs text-amber-300/90 font-mono">
                          {day.dateStr}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 hidden sm:inline">
                      Évaluations en salle
                    </span>
                  </div>

                  {/* Day Grid by Level : 1 col mobile, 2 cols tablet (md), 3 cols desktop (xl) */}
                  <div className="p-2.5 sm:p-3.5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-3">
                    
                    {/* 1. 3e Cycle Fondamental */}
                    {(selectedCycle === 'all' || selectedCycle === 'fundamental') && (
                      <div className={`rounded-xl border p-2.5 sm:p-3 flex flex-col justify-between ${
                        selectedCycle === 'fundamental'
                          ? 'md:col-span-2 xl:col-span-3 bg-blue-50/50 border-blue-300 shadow-2xs'
                          : 'bg-slate-50/70 border-slate-200/80'
                      }`}>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <GraduationCap className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                              <h4 className="font-serif font-bold text-xs text-slate-900 truncate">
                                3e Cycle (7e, 8e, 9e AF)
                              </h4>
                            </div>
                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 shrink-0">
                              Fondamental
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            {day.fundamental.map((slot, idx) => (
                              <div 
                                key={idx}
                                className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between gap-2 hover:border-blue-300 transition-colors"
                              >
                                <div className="min-w-0 flex-1">
                                  <span className="font-bold text-xs text-slate-900 leading-tight block truncate">
                                    {slot.subject}
                                  </span>
                                  {slot.notes && (
                                    <span className="text-[10.5px] text-slate-500 block leading-tight">{slot.notes}</span>
                                  )}
                                </div>
                                <span className="shrink-0 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-50 text-blue-900 border border-blue-200 tabular-nums">
                                  {slot.time}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-2 pt-1 border-t border-slate-200/60 text-[9.5px] text-slate-500 font-mono flex items-center justify-between">
                          <span>Surveillance continue</span>
                          <span className="text-blue-900 font-semibold">Horaires réguliers</span>
                        </div>
                      </div>
                    )}

                    {/* 2. Nouveau Secondaire 1, 2 et 3 */}
                    {(selectedCycle === 'all' || selectedCycle === 'secondary123') && (
                      <div className={`rounded-xl border p-2.5 sm:p-3 flex flex-col justify-between ${
                        selectedCycle === 'secondary123'
                          ? 'md:col-span-2 xl:col-span-3 bg-amber-50/50 border-amber-300 shadow-2xs'
                          : 'bg-slate-50/70 border-slate-200/80'
                      }`}>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <BookOpen className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                              <h4 className="font-serif font-bold text-xs text-slate-900 truncate">
                                Secondaire 1, 2 et 3 (NS)
                              </h4>
                            </div>
                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 shrink-0">
                              Secondaire
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            {day.secondary123.map((slot, idx) => (
                              <div 
                                key={idx}
                                className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between gap-2 hover:border-amber-300 transition-colors"
                              >
                                <div className="min-w-0 flex-1">
                                  <span className="font-bold text-xs text-slate-900 leading-tight block truncate">
                                    {slot.subject}
                                  </span>
                                  {slot.notes && (
                                    <span className="text-[10.5px] text-slate-500 block leading-tight">{slot.notes}</span>
                                  )}
                                </div>
                                <span className="shrink-0 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 tabular-nums">
                                  {slot.time}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-2 pt-1 border-t border-slate-200/60 text-[9.5px] text-slate-500 font-mono flex items-center justify-between">
                          <span>Surveillance continue</span>
                          <span className="text-amber-800 font-semibold">Horaires réguliers</span>
                        </div>
                      </div>
                    )}

                    {/* 3. Nouveau Secondaire 4 (NS4) */}
                    {(selectedCycle === 'all' || selectedCycle === 'secondary4') && (
                      <div className={`rounded-xl border p-2.5 sm:p-3 flex flex-col justify-between ${
                        selectedCycle === 'secondary4'
                          ? 'md:col-span-2 xl:col-span-3 bg-purple-50/50 border-purple-300 shadow-2xs'
                          : 'bg-slate-50/70 border-slate-200/80'
                      }`}>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Sparkles className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                              <h4 className="font-serif font-bold text-xs text-slate-900 truncate">
                                Secondaire 4 (NS4 / Bac)
                              </h4>
                            </div>
                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 shrink-0">
                              Terminale
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            {day.secondary4.map((slot, idx) => (
                              <div 
                                key={idx}
                                className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between gap-2 hover:border-purple-300 transition-colors"
                              >
                                <div className="min-w-0 flex-1">
                                  <span className="font-bold text-xs text-slate-900 leading-tight block truncate">
                                    {slot.subject}
                                  </span>
                                  {slot.notes && (
                                    <span className="text-[10.5px] text-slate-500 block leading-tight">{slot.notes}</span>
                                  )}
                                </div>
                                <span className="shrink-0 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-purple-50 text-purple-800 border border-purple-200 tabular-nums">
                                  {slot.time}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-2 pt-1 border-t border-slate-200/60 text-[9.5px] text-slate-500 font-mono flex items-center justify-between">
                          <span>Préparation Baccalauréat</span>
                          <span className="text-purple-800 font-semibold">Horaires réguliers</span>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* VIEW 2 : COMPREHENSIVE WEEKLY MATRIX TABLE (Dense & High Legibility) */
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="px-3.5 py-2.5 bg-slate-900 text-white flex items-center justify-between gap-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <TableIcon className="w-4 h-4 text-amber-400" />
                  <h3 className="font-serif font-bold text-xs sm:text-sm text-white">
                    Matrice Hebdomadaire Complète · 1er Contrôle (9 au 13 Nov. 2026)
                  </h3>
                </div>
                <span className="text-[10.5px] text-slate-400 font-mono hidden sm:inline">
                  Fondamental & Secondaire
                </span>
              </div>

              {/* Scrollable table container */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[680px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-2 sm:p-2.5 w-36 border-r border-slate-200 sticky left-0 bg-slate-100 z-10">
                        Niveau / Cycle
                      </th>
                      {FIRST_EXAM_DAYS.map(d => (
                        <th key={d.dayName} className="p-2 sm:p-2.5 min-w-[130px] border-r border-slate-200">
                          <div>{d.dayName}</div>
                          <div className="text-[9px] font-normal text-slate-500 lowercase first-letter:uppercase">{d.dateStr}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    
                    {/* Row 1: 3e Cycle Fondamental */}
                    <tr className="hover:bg-blue-50/20 transition-colors">
                      <td className="p-2 sm:p-2.5 font-serif font-bold text-slate-900 bg-slate-50/80 border-r border-slate-200 sticky left-0 z-10 text-xs">
                        <div className="flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                          <span>3e Cycle Fondamental</span>
                        </div>
                        <span className="text-[9.5px] font-mono text-slate-500 font-normal">7e, 8e, 9e AF</span>
                      </td>
                      {FIRST_EXAM_DAYS.map(d => (
                        <td key={d.dayName} className="p-1.5 sm:p-2 border-r border-slate-100 align-top">
                          <div className="space-y-1">
                            {d.fundamental.map((s, i) => (
                              <div key={i} className="p-1.5 rounded bg-blue-50/70 border border-blue-100 text-xs">
                                <div className="font-bold text-[11px] text-slate-900 leading-tight">{s.subject}</div>
                                <div className="text-[9.5px] font-mono text-blue-900 tabular-nums">{s.time}</div>
                              </div>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Row 2: Nouveau Secondaire 1, 2 et 3 */}
                    <tr className="hover:bg-amber-50/20 transition-colors">
                      <td className="p-2 sm:p-2.5 font-serif font-bold text-slate-900 bg-slate-50/80 border-r border-slate-200 sticky left-0 z-10 text-xs">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                          <span>Secondaire 1, 2, 3</span>
                        </div>
                        <span className="text-[9.5px] font-mono text-slate-500 font-normal">NS1, NS2, NS3</span>
                      </td>
                      {FIRST_EXAM_DAYS.map(d => (
                        <td key={d.dayName} className="p-1.5 sm:p-2 border-r border-slate-100 align-top">
                          <div className="space-y-1">
                            {d.secondary123.map((s, i) => (
                              <div key={i} className="p-1.5 rounded bg-amber-50/70 border border-amber-100 text-xs">
                                <div className="font-bold text-[11px] text-slate-900 leading-tight">{s.subject}</div>
                                <div className="text-[9.5px] font-mono text-amber-800 tabular-nums">{s.time}</div>
                              </div>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Row 3: Secondaire 4 */}
                    <tr className="hover:bg-purple-50/20 transition-colors">
                      <td className="p-2 sm:p-2.5 font-serif font-bold text-slate-900 bg-slate-50/80 border-r border-slate-200 sticky left-0 z-10 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                          <span>Secondaire 4 (NS4)</span>
                        </div>
                        <span className="text-[9.5px] font-mono text-purple-700 font-bold">Terminale</span>
                      </td>
                      {FIRST_EXAM_DAYS.map(d => (
                        <td key={d.dayName} className="p-1.5 sm:p-2 border-r border-slate-100 align-top">
                          <div className="space-y-1">
                            {d.secondary4.map((s, i) => (
                              <div key={i} className="p-1.5 rounded bg-purple-50/70 border border-purple-100 text-xs">
                                <div className="font-bold text-[11px] text-slate-900 leading-tight">{s.subject}</div>
                                <div className="text-[9.5px] font-mono text-purple-800 tabular-nums">{s.time}</div>
                              </div>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>

                  </tbody>
                </table>
              </div>

              <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 text-[10.5px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
                <span>Faites glisser horizontalement pour afficher l'ensemble de la semaine.</span>
                <span className="font-bold text-blue-900">Collège Isaac Newton · SI Pédagogique</span>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* ================= 2E, 3E & 4E CONTRÔLES : VUE SYNTHÉTIQUE COMPACTE ================= */
        <div className="bg-white rounded-xl p-3.5 sm:p-5 border border-slate-200 shadow-2xs space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-blue-900 mb-0.5">
                <CalendarCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>Période Académique Officielle · {currentControl.label}</span>
              </div>
              <h3 className="font-serif text-base sm:text-xl font-bold text-slate-900">
                {currentControl.periodName} ({currentControl.datesRange})
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-900 text-xs font-mono font-bold border border-blue-200 self-start sm:self-auto">
              {currentControl.statusBadge}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-blue-900">
                Dates des Examens
              </span>
              <p className="font-serif font-bold text-sm sm:text-base text-slate-900">
                {currentControl.examDates}
              </p>
              <p className="text-[11px] text-slate-600">
                Épreuves écrites et orales pour tous les niveaux.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-emerald-800">
                Remise des Carnets / Notes
              </span>
              <p className="font-serif font-bold text-sm sm:text-base text-slate-900">
                {currentControl.reportCardDate}
              </p>
              <p className="text-[11px] text-slate-600">
                Rencontre parents-professeurs et bilan trimestriel.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 sm:col-span-2 lg:col-span-1">
              <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-amber-800">
                Congés & Vacances
              </span>
              <p className="font-serif font-bold text-xs sm:text-sm text-slate-900">
                {currentControl.holidays || "Selon le calendrier officiel de l'établissement"}
              </p>
              <p className="text-[11px] text-slate-600">
                Reprise des cours aux horaires réguliers dès 07h30.
              </p>
            </div>
          </div>

          {currentControl.specialEvents && (
            <div className="p-3 sm:p-3.5 rounded-xl bg-blue-950 text-white space-y-2">
              <h4 className="font-serif font-bold text-xs sm:text-sm text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Événements Clés & Examens d'État durant cette période :</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 text-xs text-slate-200">
                {currentControl.specialEvents.map((evt, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 bg-white/10 p-2 rounded-lg border border-white/10">
                    <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="text-[11px]">{evt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-amber-50 p-2.5 sm:p-3 rounded-xl border border-amber-200 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>
                La grille détaillée matière par matière pour le <strong>{currentControl.label}</strong> sera diffusée 2 semaines avant les épreuves.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedControl(0)}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              Voir la Grille du 1er Contrôle
            </button>
          </div>
        </div>
      )}

      {/* 6. Consignes d'Organisation & Conseils aux Familles (Compact 4-grid) */}
      <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-5 border border-slate-200 shadow-2xs space-y-3 print-block">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-900 shrink-0" />
            <h3 className="font-serif font-bold text-xs sm:text-sm text-slate-900">
              Directives Pédagogiques & Consignes aux Candidats
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            Règlement Pédagogique
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 text-xs text-slate-700">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>Ponctualité 07h15</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Arrivée à 07h15, fermeture à 07h45. Aucun retarditaire après distribution des sujets.
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
              <UserCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Uniforme Officiel</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Tenue officielle exigée avec écusson brodé et carte d'élève visible sur la table.
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs">
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>Matériel Personnel</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Stylos et matériel de géométrie personnels. Tout échange est strictement prohibé en salle.
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Téléphones Interdits</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Appareils électroniques impérativement éteints dans le cartable sous peine d’annulation.
            </p>
          </div>
        </div>

        {/* Secretary Contacts & Quick Call */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-amber-400 font-bold flex items-center gap-1 text-[11px] uppercase tracking-wider">
              <Phone className="w-3 h-3" /> Secrétariat :
            </span>
            <a href={`tel:${phone1.replace(/[^0-9+]/g, '')}`} className="font-mono font-bold text-white hover:text-amber-300 underline">
              {phone1}
            </a>
            <span className="text-slate-600">/</span>
            <a href={`tel:${phone2.replace(/[^0-9+]/g, '')}`} className="font-mono font-bold text-white hover:text-amber-300 underline">
              {phone2}
            </a>
            <span className="text-slate-400 text-[11px] hidden md:inline">
              (Signalement d'absence avant 09h00)
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto no-print">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3 h-3" />
              <span>Imprimer</span>
            </button>
          </div>
        </div>

      </div>

      {/* Modal d'abonnement aux rappels d'épreuves */}
      <ExamReminderSubscribeModal
        isOpen={isSubscribeModalOpen}
        onClose={() => setIsSubscribeModalOpen(false)}
        defaultLevel={selectedCycle === 'all' ? 'ALL' : selectedCycle === 'fundamental' ? 'CYCLE_3' : selectedCycle === 'secondary4' ? 'NS4' : 'SECONDAIRE'}
        defaultControlId={selectedControl + 1}
      />

    </div>
  );
};
