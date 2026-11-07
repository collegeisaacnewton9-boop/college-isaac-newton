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
  Info
} from 'lucide-react';
import { SCHOOL_INFO } from '../data/mockData';
import { FIRST_EXAM_DAYS } from '../components/events/FirstExamScheduleModal';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-7 space-y-6 sm:space-y-8 font-sans">
      
      {/* 1. Breadcrumbs & Top Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2 text-slate-500">
          <button 
            type="button" 
            onClick={() => onNavigate('home')}
            className="hover:text-blue-900 transition-colors cursor-pointer"
          >
            Accueil
          </button>
          <span>/</span>
          <button 
            type="button" 
            onClick={() => onNavigate('events')}
            className="hover:text-blue-900 transition-colors cursor-pointer"
          >
            Vie Scolaire & Agenda
          </button>
          <span>/</span>
          <span className="font-semibold text-slate-900">
            Horaires des Contrôles Académiques
          </span>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('events')}
          className="inline-flex items-center gap-1.5 text-blue-900 hover:text-blue-950 font-bold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retour à l'Agenda Général</span>
        </button>
      </div>

      {/* 2. Hero Header - Grand, Spacieux & Institutionnel */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white p-6 sm:p-8 lg:p-10 border border-slate-800 shadow-xl">
        {/* Subtle decorative glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative space-y-4 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-amber-400 text-slate-950 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Année Académique 2026–2027
            </span>
            <span className="text-xs text-slate-300 font-medium px-2.5 py-0.5 rounded-full bg-white/10 border border-white/10">
              4 Contrôles Académiques MENFP
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
            Horaires des Épreuves & Contrôles Académiques
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-slate-200 leading-relaxed font-light">
            Consultez les grilles horaires officielles des évaluations écrites pour le 
            <strong className="text-amber-300 font-semibold"> 3e Cycle Fondamental (7e, 8e, 9e AF)</strong> et le 
            <strong className="text-amber-300 font-semibold"> Nouveau Secondaire (NS1 à NS4)</strong>. 
            Les examens sont organisés en salle de cours aux heures régulières d'enseignement.
          </p>

          {/* Quick Contacts Bar inside Header */}
          <div className="pt-3 border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300">
              <span className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5 text-xs">
                <Phone className="w-4 h-4" /> Secrétariat :
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
              <span className="text-slate-400 text-xs hidden md:inline">
                (Accueil des familles dès 07h15 à Delmas 50)
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer"
                title="Imprimer l'horaire d'examen au format A4"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer la Grille</span>
              </button>

              <a
                href={`https://wa.me/${phone1.replace(/[^0-9]/g, '') || '50933160934'}?text=Bonjour,%20je%20souhaite%20une%20information%20concernant%20l'horaire%20des%20contrôles%20académiques`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">WhatsApp Secrétariat</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Selector Tabs: The 4 Controls */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
            Sélectionnez la période d'évaluation :
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {CONTROL_PERIODS.length} périodes officielles
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CONTROL_PERIODS.map((ctrl, idx) => {
            const isSelected = selectedControl === idx;
            return (
              <button
                key={ctrl.id}
                type="button"
                onClick={() => setSelectedControl(idx)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-900 text-white border-blue-900 shadow-lg scale-[1.01]'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/90 shadow-2xs'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isSelected 
                        ? 'bg-amber-400 text-slate-950' 
                        : 'bg-blue-50 text-blue-900'
                    }`}>
                      {ctrl.number}e Contrôle
                    </span>
                    <span className={`text-[11px] font-mono font-semibold ${
                      isSelected ? 'text-blue-200' : 'text-slate-400'
                    }`}>
                      {ctrl.durationDays} jours
                    </span>
                  </div>

                  <div>
                    <h3 className={`font-serif font-bold text-base ${
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

                <div className={`mt-3 pt-2 text-[11px] border-t flex items-center justify-between ${
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

      {/* 4. Official Directive Banner */}
      <div className="bg-amber-50 border-2 border-amber-300/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-950 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-200/80 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5 text-amber-800" />
          </div>
          <div className="space-y-0.5 text-xs sm:text-sm">
            <h4 className="font-serif font-bold text-amber-950 text-sm sm:text-base">
              Note Officielle de la Direction des Études
            </h4>
            <p className="text-amber-900/90 leading-relaxed font-light">
              Les examens se feront <strong>aux heures habituelles des cours par les professeurs de chaque matière</strong>. 
              Toutes autres dispositions pédagogiques ou consignes jugées nécessaires par la Direction seront appliquées pour garantir la sérénité et la régularité des épreuves.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-800 font-bold bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300">
            Règlement Pédagogique
          </span>
        </div>
      </div>

      {/* 5. Period Content : 1er Contrôle vs 2e/3e/4e Contrôles */}
      {selectedControl === 0 ? (
        /* ================= 1ER CONTRÔLE : GRILLE OFFICIELLE COMPLÈTE ================= */
        <div className="space-y-6">
          
          {/* Controls Bar : Level Filters + Day Selectors + View Mode Switch */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Cycle Selector */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mr-1">
                Filière / Niveau :
              </span>
              {[
                { id: 'all', label: 'Tous les Niveaux (Vue d’ensemble)' },
                { id: 'fundamental', label: '3e Cycle Fondamental (7e, 8e, 9e AF)' },
                { id: 'secondary123', label: 'Nouveau Secondaire 1, 2 et 3' },
                { id: 'secondary4', label: 'Secondaire 4 (NS4 / Terminale)' },
              ].map(cycle => (
                <button
                  key={cycle.id}
                  type="button"
                  onClick={() => setSelectedCycle(cycle.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selectedCycle === cycle.id
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {cycle.label}
                </button>
              ))}
            </div>

            {/* Day Filter */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mr-1">
                Jour :
              </span>
              {['all', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
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

          {/* Schedule Content Cards */}
          <div className="space-y-6">
            {filteredDays.map((day) => (
              <div 
                key={day.dayName}
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Day Header */}
                <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white px-5 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-serif font-extrabold text-base shadow-sm">
                      {day.dayName.substring(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-lg sm:text-xl text-white">
                        {day.dayName}
                      </h3>
                      <p className="text-xs text-slate-300 font-mono">
                        {day.dateStr}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-white/10 text-amber-300 border border-white/15">
                      Journée d'évaluation officielle
                    </span>
                  </div>
                </div>

                {/* Day Grid by Level */}
                <div className="p-5 sm:p-7 grid grid-cols-1 md:grid-cols-3 gap-5">
                  
                  {/* 1. 3e Cycle Fondamental */}
                  {(selectedCycle === 'all' || selectedCycle === 'fundamental') && (
                    <div className={`rounded-2xl border transition-all p-5 flex flex-col justify-between ${
                      selectedCycle === 'fundamental'
                        ? 'md:col-span-3 bg-blue-50/60 border-blue-300 shadow-sm'
                        : 'bg-slate-50/70 border-slate-200/90'
                    }`}>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-blue-900" />
                            <h4 className="font-serif font-bold text-sm sm:text-base text-slate-900">
                              3e Cycle (7e, 8e, 9e AF)
                            </h4>
                          </div>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                            Fondamental
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {day.fundamental.map((slot, idx) => (
                            <div 
                              key={idx}
                              className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-3 hover:border-blue-300 transition-colors"
                            >
                              <div className="min-w-0">
                                <p className="font-bold text-sm text-slate-900 truncate">
                                  {slot.subject}
                                </p>
                                {slot.notes && (
                                  <p className="text-xs text-slate-500 mt-0.5">{slot.notes}</p>
                                )}
                              </div>
                              <span className="shrink-0 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-blue-50 text-blue-900 border border-blue-200">
                                {slot.time}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 pt-2.5 border-t border-slate-200/70 text-[11px] text-slate-500 font-mono flex items-center justify-between">
                        <span>Épreuves en salle</span>
                        <span className="font-bold text-blue-900">Surveillance continue</span>
                      </div>
                    </div>
                  )}

                  {/* 2. Nouveau Secondaire 1, 2 et 3 */}
                  {(selectedCycle === 'all' || selectedCycle === 'secondary123') && (
                    <div className={`rounded-2xl border transition-all p-5 flex flex-col justify-between ${
                      selectedCycle === 'secondary123'
                        ? 'md:col-span-3 bg-amber-50/60 border-amber-300 shadow-sm'
                        : 'bg-slate-50/70 border-slate-200/90'
                    }`}>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-amber-700" />
                            <h4 className="font-serif font-bold text-sm sm:text-base text-slate-900">
                              Secondaire 1, 2 et 3 (NS)
                            </h4>
                          </div>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                            Secondaire
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {day.secondary123.map((slot, idx) => (
                            <div 
                              key={idx}
                              className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-3 hover:border-amber-300 transition-colors"
                            >
                              <div className="min-w-0">
                                <p className="font-bold text-sm text-slate-900 truncate">
                                  {slot.subject}
                                </p>
                                {slot.notes && (
                                  <p className="text-xs text-slate-500 mt-0.5">{slot.notes}</p>
                                )}
                              </div>
                              <span className="shrink-0 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                {slot.time}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 pt-2.5 border-t border-slate-200/70 text-[11px] text-slate-500 font-mono flex items-center justify-between">
                        <span>Épreuves en salle</span>
                        <span className="font-bold text-amber-800">Surveillance continue</span>
                      </div>
                    </div>
                  )}

                  {/* 3. Nouveau Secondaire 4 (NS4) */}
                  {(selectedCycle === 'all' || selectedCycle === 'secondary4') && (
                    <div className={`rounded-2xl border transition-all p-5 flex flex-col justify-between ${
                      selectedCycle === 'secondary4'
                        ? 'md:col-span-3 bg-purple-50/60 border-purple-300 shadow-sm'
                        : 'bg-slate-50/70 border-slate-200/90'
                    }`}>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-700" />
                            <h4 className="font-serif font-bold text-sm sm:text-base text-slate-900">
                              Secondaire 4 (NS4)
                            </h4>
                          </div>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-900">
                            Terminale (Bac)
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {day.secondary4.map((slot, idx) => (
                            <div 
                              key={idx}
                              className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-3 hover:border-purple-300 transition-colors"
                            >
                              <div className="min-w-0">
                                <p className="font-bold text-sm text-slate-900 truncate">
                                  {slot.subject}
                                </p>
                                {slot.notes && (
                                  <p className="text-xs text-slate-500 mt-0.5">{slot.notes}</p>
                                )}
                              </div>
                              <span className="shrink-0 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-purple-50 text-purple-800 border border-purple-200">
                                {slot.time}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 pt-2.5 border-t border-slate-200/70 text-[11px] text-slate-500 font-mono flex items-center justify-between">
                        <span>Épreuves en salle</span>
                        <span className="font-bold text-purple-800">Baccalauréat Prépa</span>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            ))}
          </div>

        </div>
      ) : (
        /* ================= 2E, 3E & 4E CONTRÔLES : VUE SYNTHÉTIQUE & PRÉVISIONNELLE ================= */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-blue-900 mb-1">
                <CalendarCheck className="w-4 h-4 text-amber-500" />
                <span>Période Académique Officielle · {currentControl.label}</span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
                {currentControl.periodName} ({currentControl.datesRange})
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-900 text-xs font-mono font-bold border border-blue-200 self-start sm:self-auto">
              {currentControl.statusBadge}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-900">
                Dates des Examens
              </span>
              <p className="font-serif font-bold text-lg text-slate-900">
                {currentControl.examDates}
              </p>
              <p className="text-xs text-slate-600">
                Épreuves écrites et orales pour l'ensemble des classes.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800">
                Remise des Carnets / Notes
              </span>
              <p className="font-serif font-bold text-lg text-slate-900">
                {currentControl.reportCardDate}
              </p>
              <p className="text-xs text-slate-600">
                Rencontre parents-professeurs et bilan trimestriel.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800">
                Congés & Vacances
              </span>
              <p className="font-serif font-bold text-base text-slate-900">
                {currentControl.holidays || 'Selon le calendrier officiel MENFP'}
              </p>
              <p className="text-xs text-slate-600">
                Reprise des cours aux horaires réguliers dès 07h30.
              </p>
            </div>
          </div>

          {currentControl.specialEvents && (
            <div className="p-5 rounded-2xl bg-blue-950 text-white space-y-3">
              <h4 className="font-serif font-bold text-sm sm:text-base text-amber-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Événements Clés & Examens d'État durant cette période :
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs text-slate-200">
                {currentControl.specialEvents.map((evt, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white/10 p-2.5 rounded-xl border border-white/10">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{evt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                La grille horaire détaillée matière par matière pour le <strong>{currentControl.label}</strong> sera publiée et affichée 2 semaines avant les épreuves.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedControl(0)}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Voir la Grille du 1er Contrôle
            </button>
          </div>
        </div>
      )}

      {/* 6. Consignes d'Organisation & Conseils aux Familles */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-blue-900" />
            <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900">
              Directives Pédagogiques & Consignes aux Candidats
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono hidden sm:inline">
            Discipline & Sérénité
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-slate-700">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center gap-2 text-blue-900 font-bold">
              <Clock className="w-4 h-4" />
              <span>Ponctualité dès 07h15</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Arrivée sur la cour impérative à 07h15. Fermeture de la barrière à 07h45. Aucun retarditaire n'est admis après la distribution des sujets.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-800 font-bold">
              <UserCheck className="w-4 h-4" />
              <span>Uniforme Complet Obligatoire</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Tenue officielle de l’institution exigée avec écusson brodé et chaussures fermées. La carte d'élève doit être visible sur la table.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-800 font-bold">
              <BookOpen className="w-4 h-4" />
              <span>Matériel Personnel</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Stylos (bleu ou noir), crayons et matériel de géométrie personnel. Tout échange de matériel entre élèves est strictement prohibé en salle.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center gap-2 text-rose-800 font-bold">
              <AlertCircle className="w-4 h-4" />
              <span>Téléphones Strictement Interdits</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Tout appareil électronique ou montre connectée doit impérativement rester éteint dans le cartable sous peine d’annulation de l’épreuve.
            </p>
          </div>
        </div>

        {/* Secretary Contacts & Direct assistance */}
        <div className="mt-4 p-5 rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Phone className="w-4 h-4" />
              Assistance & Justification d'Absence Immédiate
            </div>
            <p className="text-xs sm:text-sm text-slate-200">
              Pour signaler un cas de force majeure ou maladie le jour d'un examen, contactez le secrétariat avant 09h00 :
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
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
              <span className="text-slate-500">|</span>
              <a 
                href={`mailto:${SCHOOL_INFO.email}`}
                className="text-amber-300 hover:underline"
              >
                {SCHOOL_INFO.email}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
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

    </div>
  );
};
