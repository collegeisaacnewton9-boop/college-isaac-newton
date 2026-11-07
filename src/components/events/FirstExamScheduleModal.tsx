import React, { useState } from 'react';
import { 
  X, 
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
  Maximize2
} from 'lucide-react';
import { SCHOOL_INFO } from '../../data/mockData';

export interface FirstExamScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCycle?: 'fundamental' | 'secondary123' | 'secondary4' | 'all';
  onOpenFullPage?: () => void;
}

interface ExamSlot {
  time: string;
  subject: string;
  notes?: string;
}

interface DaySchedule {
  dayName: string;
  dateStr: string;
  fundamental: ExamSlot[];   // 7e, 8e, 9e AF (3e cycle)
  secondary123: ExamSlot[];  // NS1, NS2, NS3
  secondary4: ExamSlot[];    // NS4
}

export const FIRST_EXAM_DAYS: DaySchedule[] = [
  {
    dayName: 'Lundi',
    dateStr: '9 Novembre 2026',
    fundamental: [
      { time: '08h00 – 11h00', subject: 'Français' },
      { time: '12h00 – 14h00', subject: 'Anglais' },
    ],
    secondary123: [
      { time: '08h00 – 11h00', subject: 'Français' },
      { time: '12h00 – 14h00', subject: 'Anglais' },
      { time: '14h00 – 15h00', subject: 'Musique' },
    ],
    secondary4: [
      { time: '08h00 – 11h00', subject: 'Philosophie' },
      { time: '12h00 – 14h00', subject: 'Anglais' },
    ],
  },
  {
    dayName: 'Mardi',
    dateStr: '10 Novembre 2026',
    fundamental: [
      { time: '08h00 – 11h00', subject: 'Créole' },
      { time: '12h00 – 14h00', subject: 'Espagnol / Éducation Civique (EC)' },
    ],
    secondary123: [
      { time: '08h00 – 11h00', subject: 'Chimie / Éducation Civique (EC)' },
      { time: '12h00 – 14h00', subject: 'Espagnol' },
      { time: '14h00 – 15h00', subject: 'Éducation Civique / Économie' },
    ],
    secondary4: [
      { time: '08h00 – 11h00', subject: 'Économie' },
      { time: '12h00 – 14h00', subject: 'Chimie' },
    ],
  },
  {
    dayName: 'Mercredi',
    dateStr: '11 Novembre 2026',
    fundamental: [
      { time: '08h00 – 11h00', subject: 'Sciences Sociales' },
      { time: '12h00 – 14h00', subject: 'ETAP / Musique' },
    ],
    secondary123: [
      { time: '08h00 – 11h00', subject: 'Sciences Sociales' },
      { time: '12h00 – 14h00', subject: 'Biologie' },
      { time: '14h00 – 15h00', subject: 'Géologie' },
    ],
    secondary4: [
      { time: '08h00 – 11h00', subject: 'Histoire / Géographie' },
      { time: '12h00 – 14h00', subject: 'Créole' },
    ],
  },
  {
    dayName: 'Jeudi',
    dateStr: '12 Novembre 2026',
    fundamental: [
      { time: '08h00 – 11h00', subject: 'Sciences Expérimentales (Biologie & Physiques)' },
      { time: '12h00 – 14h00', subject: 'EPS / Informatique' },
    ],
    secondary123: [
      { time: '08h00 – 11h00', subject: 'Physique' },
      { time: '12h00 – 14h00', subject: 'Créole' },
      { time: '14h00 – 15h00', subject: 'Informatique' },
    ],
    secondary4: [
      { time: '08h00 – 11h00', subject: 'Physique' },
      { time: '12h00 – 14h00', subject: 'Biologie / Géologie' },
    ],
  },
  {
    dayName: 'Vendredi',
    dateStr: '13 Novembre 2026',
    fundamental: [
      { time: '08h00 – 11h00', subject: 'Mathématiques' },
      { time: '12h00 – 13h00', subject: 'EEA (Économie & Gestion)' },
      { time: '13h00 – 14h00', subject: 'Géologie' },
    ],
    secondary123: [
      { time: '08h00 – 11h00', subject: 'Mathématiques' },
      { time: '12h00 – 13h00', subject: 'Arts Plastiques (ART)' },
      { time: '13h00 – 15h00', subject: 'Statistique & Suites' },
    ],
    secondary4: [
      { time: '08h00 – 11h00', subject: 'Mathématiques' },
      { time: '12h00 – 14h00', subject: 'Espagnol' },
    ],
  },
];

export const FirstExamScheduleModal: React.FC<FirstExamScheduleModalProps> = ({
  isOpen,
  onClose,
  defaultCycle = 'all',
  onOpenFullPage,
}) => {
  const [selectedCycle, setSelectedCycle] = useState<'all' | 'fundamental' | 'secondary123' | 'secondary4'>(defaultCycle);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | 'all'>('all');

  if (!isOpen) return null;

  const phone1 = SCHOOL_INFO.phone1 || '+509 3316-0934';
  const phone2 = SCHOOL_INFO.phone2 || '+509 3721-1818';

  const handlePrint = () => {
    window.print();
  };

  const filteredDays = selectedDayIndex === 'all' 
    ? FIRST_EXAM_DAYS 
    : [FIRST_EXAM_DAYS[selectedDayIndex]];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Institutional Navy & Amber */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-4 sm:p-6 shrink-0 relative border-b border-slate-800">
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Fermer la fenêtre"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-sans">
              Calendrier Officiel 2026–2027
            </span>
            <span className="text-xs text-slate-300 font-medium">
              4 Contrôles Académiques
            </span>
          </div>

          <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">
            Horaires des Épreuves · 1er Contrôle Académique
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Semaine d'évaluation du <strong className="text-amber-300">Lundi 9 au Vendredi 13 Novembre 2026</strong>. 
            Épreuves organisées pour le 3e Cycle Fondamental et le Nouveau Secondaire.
          </p>

          {/* Quick Contacts inside modal header */}
          <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <span className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" /> Secrétariat :
            </span>
            <a 
              href={`tel:${phone1.replace(/[^0-9+]/g, '')}`} 
              className="font-mono font-bold text-white hover:text-amber-300 transition-colors"
            >
              {phone1}
            </a>
            <span className="text-slate-600">/</span>
            <a 
              href={`tel:${phone2.replace(/[^0-9+]/g, '')}`} 
              className="font-mono font-bold text-white hover:text-amber-300 transition-colors"
            >
              {phone2}
            </a>
            <span className="text-slate-400 text-[11px] hidden sm:inline">
              (Accueil de 07h15 à 15h30)
            </span>
          </div>
        </div>

        {/* Official Directive Banner */}
        <div className="bg-amber-50 border-b border-amber-200/80 px-4 sm:px-6 py-2.5 flex items-start gap-2.5 text-xs text-amber-950 shrink-0">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="leading-snug">
            <span className="font-bold text-amber-900">Note Officielle de la Direction :</span>{' '}
            Les examens se feront <strong>aux heures habituelles des cours par les professeurs</strong> de chaque matière. 
            Toutes autres dispositions pédagogiques jugées nécessaires seront appliquées pour garantir la sérénité et la régularité des épreuves.
          </div>
        </div>

        {/* Filter Controls (Level & Days) */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          {/* Cycle Selector */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mr-1 hidden sm:inline">
              Niveau :
            </span>
            <button
              type="button"
              onClick={() => setSelectedCycle('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCycle === 'all'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Tous les Niveaux
            </button>
            <button
              type="button"
              onClick={() => setSelectedCycle('fundamental')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCycle === 'fundamental'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              3e Cycle (7e, 8e, 9e AF)
            </button>
            <button
              type="button"
              onClick={() => setSelectedCycle('secondary123')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCycle === 'secondary123'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Secondaire 1, 2 et 3
            </button>
            <button
              type="button"
              onClick={() => setSelectedCycle('secondary4')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCycle === 'secondary4'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Secondaire 4 (NS4)
            </button>
          </div>

          {/* Actions: Print & Full Page */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {onOpenFullPage && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFullPage();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-xs transition-colors cursor-pointer"
                title="Consulter sur une page dédiée sans boîte de dialogue"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Ouvrir en Pleine Page</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-colors cursor-pointer"
              title="Imprimer l'horaire d'examen"
            >
              <Printer className="w-3.5 h-3.5 text-blue-900" />
              <span>Imprimer</span>
            </button>
          </div>
        </div>

        {/* Schedule Content Body - Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Day cards */}
          {filteredDays.map((day) => (
            <div 
              key={day.dayName}
              className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
            >
              {/* Day Header */}
              <div className="bg-slate-100/90 border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center font-serif font-bold text-sm">
                    {day.dayName.substring(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-slate-900">
                      {day.dayName}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {day.dateStr}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                  Jour d'évaluation
                </span>
              </div>

              {/* Grid by level according to selectedCycle */}
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. 3e Cycle (7e, 8e, 9e AF) */}
                {(selectedCycle === 'all' || selectedCycle === 'fundamental') && (
                  <div className={`p-3.5 rounded-xl border transition-all ${
                    selectedCycle === 'fundamental' 
                      ? 'md:col-span-3 bg-blue-50/50 border-blue-300' 
                      : 'bg-slate-50/60 border-slate-200/90'
                  }`}>
                    <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-blue-900" />
                        <h4 className="font-serif font-bold text-xs sm:text-sm text-slate-900">
                          3e Cycle (7e, 8e, 9e AF)
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        Fondamental
                      </span>
                    </div>

                    <div className="space-y-2">
                      {day.fundamental.map((slot, idx) => (
                        <div 
                          key={idx}
                          className="p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-slate-900 truncate">
                              {slot.subject}
                            </p>
                            {slot.notes && (
                              <p className="text-[10px] text-slate-500">{slot.notes}</p>
                            )}
                          </div>
                          <span className="shrink-0 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-50 text-blue-900 border border-blue-100">
                            {slot.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Secondaire 1, 2 et 3 */}
                {(selectedCycle === 'all' || selectedCycle === 'secondary123') && (
                  <div className={`p-3.5 rounded-xl border transition-all ${
                    selectedCycle === 'secondary123' 
                      ? 'md:col-span-3 bg-amber-50/50 border-amber-300' 
                      : 'bg-slate-50/60 border-slate-200/90'
                  }`}>
                    <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-amber-700" />
                        <h4 className="font-serif font-bold text-xs sm:text-sm text-slate-900">
                          Secondaire 1, 2 et 3 (NS)
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        Secondaire
                      </span>
                    </div>

                    <div className="space-y-2">
                      {day.secondary123.map((slot, idx) => (
                        <div 
                          key={idx}
                          className="p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-slate-900 truncate">
                              {slot.subject}
                            </p>
                            {slot.notes && (
                              <p className="text-[10px] text-slate-500">{slot.notes}</p>
                            )}
                          </div>
                          <span className="shrink-0 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-100">
                            {slot.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Secondaire 4 (NS4) */}
                {(selectedCycle === 'all' || selectedCycle === 'secondary4') && (
                  <div className={`p-3.5 rounded-xl border transition-all ${
                    selectedCycle === 'secondary4' 
                      ? 'md:col-span-3 bg-purple-50/50 border-purple-300' 
                      : 'bg-slate-50/60 border-slate-200/90'
                  }`}>
                    <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-purple-700" />
                        <h4 className="font-serif font-bold text-xs sm:text-sm text-slate-900">
                          Secondaire 4 (NS4)
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono text-purple-700 font-bold">
                        Terminale
                      </span>
                    </div>

                    <div className="space-y-2">
                      {day.secondary4.map((slot, idx) => (
                        <div 
                          key={idx}
                          className="p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-slate-900 truncate">
                              {slot.subject}
                            </p>
                            {slot.notes && (
                              <p className="text-[10px] text-slate-500">{slot.notes}</p>
                            )}
                          </div>
                          <span className="shrink-0 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-purple-50 text-purple-800 border border-purple-100">
                            {slot.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          ))}

          {/* Useful Instructions for Parents & Students */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
            <h4 className="font-serif font-bold text-sm text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-900" />
              Consignes d'Organisation & Conseils aux Familles
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Ponctualité stricte dès 07h15</strong> : Aucun retard ne sera admis après la distribution des sujets d'examen.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Uniforme complet obligatoire</strong> : Tenue officielle et écusson brodé requis pour accéder aux salles.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Matériel personnel</strong> : Chaque élève doit se munir de ses stylos, instruments géométriques et calculatrices autorisées.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Téléphones strictement interdits</strong> : Tout appareil électronique doit demeurer éteint dans le cartable.
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer with 2 Contact Numbers & Actions */}
        <div className="p-4 bg-slate-100/90 border-t border-slate-200 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700">
            <span className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-blue-900" />
              Assistance Secrétariat :
            </span>
            <a 
              href={`tel:${phone1.replace(/[^0-9+]/g, '')}`}
              className="font-mono font-bold text-blue-900 hover:underline"
            >
              {phone1}
            </a>
            <span className="text-slate-400">/</span>
            <a 
              href={`tel:${phone2.replace(/[^0-9+]/g, '')}`}
              className="font-mono font-bold text-blue-900 hover:underline"
            >
              {phone2}
            </a>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <a
              href={`https://wa.me/${phone1.replace(/[^0-9]/g, '') || '50933160934'}?text=Bonjour,%20je%20souhaite%20une%20information%20concernant%20le%201er%20contrôle%20académique`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-white" />
              <span>WhatsApp Secrétariat</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
