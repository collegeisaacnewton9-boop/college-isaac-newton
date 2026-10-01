import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  FileText, 
  Download, 
  GraduationCap, 
  Palmtree, 
  UserCheck, 
  Sparkles, 
  Trophy, 
  AlertCircle,
  CheckCircle2,
  CalendarDays,
  ListFilter,
  X
} from 'lucide-react';
import { SchoolEvent, EventCategory } from '../../types';

interface InteractiveCalendarProps {
  events: SchoolEvent[];
  onNavigateToResources?: () => void;
}

// Category visual configuration (domain-tailored colors, icons and labels)
const CATEGORY_CONFIG: Record<EventCategory, { 
  label: string; 
  badgeClass: string; 
  dotColor: string; 
  bgLight: string;
  icon: React.ElementType;
}> = {
  Examen: {
    label: 'Examens & Évaluations',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
    dotColor: 'bg-rose-500',
    bgLight: 'bg-rose-50/70 border-rose-200',
    icon: GraduationCap,
  },
  Férié: {
    label: 'Jours Fériés & Congés',
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-200',
    dotColor: 'bg-amber-500',
    bgLight: 'bg-amber-50/70 border-amber-200',
    icon: Palmtree,
  },
  Réunion: {
    label: 'Réunions Parents-Profs',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dotColor: 'bg-emerald-500',
    bgLight: 'bg-emerald-50/70 border-emerald-200',
    icon: UserCheck,
  },
  Pédagogique: {
    label: 'Pédagogique & Sciences',
    badgeClass: 'bg-blue-50 text-blue-900 border-blue-200',
    dotColor: 'bg-blue-600',
    bgLight: 'bg-blue-50/70 border-blue-200',
    icon: Sparkles,
  },
  Culturel: {
    label: 'Culturel & Festivités',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
    dotColor: 'bg-purple-500',
    bgLight: 'bg-purple-50/70 border-purple-200',
    icon: Sparkles,
  },
  Sportif: {
    label: 'Sportif & Championnats',
    badgeClass: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    dotColor: 'bg-cyan-500',
    bgLight: 'bg-cyan-50/70 border-cyan-200',
    icon: Trophy,
  },
};

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export const InteractiveCalendar: React.FC<InteractiveCalendarProps> = ({ 
  events,
  onNavigateToResources 
}) => {
  // Current active date view (Defaults to October 2026 for the school year start or current date)
  const [currentDate, setCurrentDate] = useState(() => {
    return new Date(2026, 9, 1); // Octobre 2026
  });

  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    return new Date(2026, 9, 24); // Defaults to first exam date (Oct 24)
  });

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('Tous');
  const [viewMode, setViewMode] = useState<'calendar' | 'agenda'>('calendar');

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Helper: Month name in French
  const monthName = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleJumpToToday = () => {
    const today = new Date();
    // If today is within 2026-2027, jump to today, else jump to current academic month
    if (today.getFullYear() === 2026 || today.getFullYear() === 2027) {
      setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
      setSelectedDate(today);
    } else {
      setCurrentDate(new Date(2026, 9, 1));
      setSelectedDate(new Date(2026, 9, 24));
    }
  };

  // Filtered events based on active category
  const filteredEvents = useMemo(() => {
    if (activeCategoryFilter === 'Tous') return events;
    return events.filter(e => e.category === activeCategoryFilter);
  }, [events, activeCategoryFilter]);

  // Map events to date strings YYYY-MM-DD for fast lookup
  const eventsByDate = useMemo(() => {
    const map = new Map<string, SchoolEvent[]>();
    filteredEvents.forEach(evt => {
      const d = new Date(evt.startDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(evt);
    });
    return map;
  }, [filteredEvents]);

  // Calendar day calculation (Monday as first day of week)
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    // Day of week: 0 is Sunday, 1 is Monday... convert to Monday=0, Sunday=6
    let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startingDayOfWeek === -1) startingDayOfWeek = 6;

    const days: { date: Date; isCurrentMonth: boolean; key: string }[] = [];

    // Previous month padding days
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1, prevMonthLastDay - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      days.push({ date: d, isCurrentMonth: false, key });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(currentYear, currentMonth, i);
      const key = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ date: d, isCurrentMonth: true, key });
    }

    // Next month padding days to complete full grid (multiple of 7)
    const totalCells = Math.ceil(days.length / 7) * 7;
    const remainingDays = totalCells - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const d = new Date(currentYear, currentMonth + 1, i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ date: d, isCurrentMonth: false, key });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Key for selected date
  const selectedDateKey = useMemo(() => {
    return `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  }, [selectedDate]);

  // Events for selected date
  const selectedDateEvents = useMemo(() => {
    return eventsByDate.get(selectedDateKey) || [];
  }, [eventsByDate, selectedDateKey]);

  // Categories count
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { Tous: events.length };
    events.forEach(e => {
      counts[e.category] = (counts[e.category] || 0) + 1;
    });
    return counts;
  }, [events]);

  // Helper to export an event as an .ics calendar file
  const handleExportIcs = (event: SchoolEvent) => {
    const start = new Date(event.startDate).toISOString().replace(/-|:|\.\d+/g, '');
    const end = event.endDate 
      ? new Date(event.endDate).toISOString().replace(/-|:|\.\d+/g, '')
      : start;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Collège Isaac Newton//Calendrier Scolaire//FR',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `UID:${event.id}@collegeisaacnewton.com`,
      `DTSTAMP:${new Date().toISOString().replace(/-|:|\.\d+/g, '')}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${event.title} - Collège Isaac Newton`,
      `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
      `LOCATION:${event.location}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cin-evenement-${event.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">

      {/* 1. TOP CONTROLS & VIEWS TOOLBAR */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-4">
        
        {/* Row 1: Month navigation, View switch & Download CTA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Month Stepper */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
                title="Mois précédent"
                aria-label="Mois précédent"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <button
                type="button"
                onClick={handleJumpToToday}
                className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-blue-900 hover:bg-white rounded-lg transition-colors cursor-pointer"
                title="Revenir à la période actuelle"
              >
                Période
              </button>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
                title="Mois suivant"
                aria-label="Mois suivant"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 capitalize tracking-tight">
              {monthName}
            </h2>
          </div>

          {/* View Mode Switcher (Calendrier vs Liste) */}
          <div className="flex items-center gap-2">
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'calendar'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                <span>Grille Mensuelle</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('agenda')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'agenda'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                <ListFilter className="w-4 h-4" />
                <span>Vue Agenda ({filteredEvents.length})</span>
              </button>
            </div>

            {/* Official PDF Calendar Button */}
            <a
              href="#telecharger-calendrier"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigateToResources) onNavigateToResources();
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:text-blue-900 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
              title="Télécharger la version PDF officielle"
            >
              <Download className="w-3.5 h-3.5 text-blue-900" />
              <span>PDF Officiel</span>
            </a>
          </div>

        </div>

        {/* Row 2: Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1.5">
            Filtrer par :
          </span>

          {['Tous', 'Examen', 'Férié', 'Réunion', 'Pédagogique', 'Culturel', 'Sportif'].map((catKey) => {
            const isAll = catKey === 'Tous';
            const config = !isAll ? CATEGORY_CONFIG[catKey as EventCategory] : null;
            const isSelected = activeCategoryFilter === catKey;
            const count = categoryCounts[catKey] || 0;

            if (count === 0 && !isAll) return null;

            return (
              <button
                key={catKey}
                type="button"
                onClick={() => setActiveCategoryFilter(catKey)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                }`}
              >
                {!isAll && config && (
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-400' : config.dotColor}`} />
                )}
                <span>{isAll ? 'Tous' : config?.label.split('&')[0]}</span>
                <span className={`text-[10px] font-mono px-1 rounded ${
                  isSelected ? 'bg-blue-800 text-amber-300' : 'bg-slate-200/80 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* 2. CALENDAR MONTHLY GRID VIEW */}
      {viewMode === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Month Grid (8 columns on desktop) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            
            {/* Days of week header */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 text-center py-2.5 text-xs font-bold text-slate-700">
              {WEEKDAYS.map((day, idx) => (
                <div key={day} className={idx >= 5 ? 'text-amber-800' : ''}>
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days Matrix */}
            <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
              {calendarDays.map(({ date, isCurrentMonth, key }) => {
                const dayEvents = eventsByDate.get(key) || [];
                const hasEvents = dayEvents.length > 0;
                const isSelected = selectedDateKey === key;
                const isToday = 
                  date.getDate() === new Date().getDate() &&
                  date.getMonth() === new Date().getMonth() &&
                  date.getFullYear() === new Date().getFullYear();

                const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSelectedDate(date);
                      if (!isCurrentMonth) {
                        setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1));
                      }
                    }}
                    className={`min-h-[75px] sm:min-h-[92px] p-1 sm:p-2 text-left transition-colors relative flex flex-col justify-between group cursor-pointer focus:outline-none ${
                      !isCurrentMonth ? 'bg-slate-50/50 text-slate-400' : 'bg-white'
                    } ${isWeekend && isCurrentMonth ? 'bg-amber-50/20' : ''} ${
                      isSelected 
                        ? 'ring-2 ring-blue-900 ring-inset bg-blue-50/40 z-10' 
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Day number & indicators */}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold rounded-md px-1.5 py-0.5 ${
                        isToday 
                          ? 'bg-blue-900 text-white font-bold' 
                          : isSelected 
                          ? 'text-blue-900 font-bold bg-blue-100' 
                          : isCurrentMonth 
                          ? 'text-slate-800' 
                          : 'text-slate-400'
                      }`}>
                        {date.getDate()}
                      </span>

                      {/* Event count chip on mobile */}
                      {hasEvents && (
                        <div className="flex sm:hidden items-center gap-0.5">
                          {dayEvents.slice(0, 3).map((evt, eIdx) => {
                            const catConf = CATEGORY_CONFIG[evt.category];
                            return (
                              <span 
                                key={eIdx} 
                                className={`w-1.5 h-1.5 rounded-full ${catConf?.dotColor || 'bg-blue-900'}`} 
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Event badges on desktop (up to 2 visible) */}
                    <div className="hidden sm:flex flex-col gap-1 mt-1">
                      {dayEvents.slice(0, 2).map((evt) => {
                        const catConf = CATEGORY_CONFIG[evt.category];
                        return (
                          <div
                            key={evt.id}
                            className={`text-[10px] font-medium leading-tight px-1.5 py-0.5 rounded truncate border ${
                              catConf?.badgeClass || 'bg-blue-50 text-blue-900 border-blue-200'
                            }`}
                            title={`${evt.title} (${evt.category})`}
                          >
                            {evt.title}
                          </div>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <span className="text-[9px] font-mono text-slate-500 font-bold pl-1">
                          +{dayEvents.length - 2} autre{dayEvents.length - 2 > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Calendar Legend Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-semibold text-slate-800">Légende :</span>
                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${config.dotColor}`} />
                    <span className="text-[11px] text-slate-700">{config.label.split('&')[0]}</span>
                  </div>
                ))}
              </div>

              <span className="text-[11px] text-slate-400 font-mono">
                Campus de Delmas 50 · Port-au-Prince
              </span>
            </div>

          </div>

          {/* Side Panel: Selected Day Inspector (4 columns on desktop) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
            
            {/* Selected Date Header */}
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-900 font-bold">
                  Détail du jour sélectionné
                </span>
                <h3 className="font-serif text-lg font-bold text-slate-900 capitalize mt-0.5">
                  {selectedDate.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </h3>
              </div>

              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-900 font-bold flex items-center justify-center font-mono text-sm border border-blue-100">
                {selectedDate.getDate()}
              </div>
            </div>

            {/* List of events on this day */}
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedDateEvents.map((evt) => {
                  const catConf = CATEGORY_CONFIG[evt.category];
                  const Icon = catConf?.icon || CalendarIcon;
                  const timeStr = new Date(evt.startDate).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <motion.div
                      key={evt.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3.5 rounded-xl border ${catConf?.bgLight || 'bg-slate-50 border-slate-200'} space-y-2`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${catConf?.badgeClass}`}>
                          <Icon className="w-3 h-3" />
                          <span>{evt.category}</span>
                        </span>

                        <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{timeStr}</span>
                        </span>
                      </div>

                      <h4 className="font-serif font-bold text-sm sm:text-base text-slate-900 leading-snug">
                        {evt.title}
                      </h4>

                      <p className="text-xs text-slate-600 leading-relaxed font-light">
                        {evt.description}
                      </p>

                      <div className="pt-2 border-t border-slate-200/50 flex flex-col gap-1 text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{evt.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>Public : {evt.audience === 'PARENTS' ? 'Parents d’élèves' : evt.audience === 'STUDENTS' ? 'Élèves' : 'Toute la communauté'}</span>
                        </div>
                      </div>

                      {/* Export action */}
                      <div className="pt-1 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => handleExportIcs(evt)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-900 hover:text-blue-950 hover:underline cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          <span>Ajouter à mon agenda (.ics)</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center space-y-2 text-slate-400">
                <CalendarIcon className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
                <p className="text-xs text-slate-500 font-medium">
                  Aucun événement particulier ce jour.
                </p>
                <p className="text-[11px] text-slate-400 font-light">
                  Journée de cours régulière selon l’emploi du temps officiel.
                </p>
              </div>
            )}

            {/* Quick reminder box */}
            <div className="pt-3 border-t border-slate-100 flex items-start gap-2.5 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="leading-snug text-[11px]">
                Pour toute convocation d’urgence ou justification d’absence, contactez le secrétariat au <strong className="text-slate-800 font-mono">+509 3721-1818</strong>.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* 3. AGENDA / LIST VIEW (Chronological Cards) */}
      {viewMode === 'agenda' && (
        <div className="space-y-3">
          {filteredEvents.map((evt) => {
            const catConf = CATEGORY_CONFIG[evt.category];
            const Icon = catConf?.icon || CalendarIcon;
            const dateObj = new Date(evt.startDate);
            const day = dateObj.getDate();
            const month = dateObj.toLocaleDateString('fr-FR', { month: 'short' });
            const year = dateObj.getFullYear();
            const time = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={evt.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:border-blue-900/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  {/* Date badge */}
                  <div className="w-14 sm:w-16 h-16 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center shrink-0 shadow-sm">
                    <span className="text-xl sm:text-2xl font-bold font-mono leading-none">{day}</span>
                    <span className="text-[10px] sm:text-xs uppercase font-semibold text-amber-400 mt-1">{month}</span>
                    <span className="text-[9px] text-slate-400 font-mono">{year}</span>
                  </div>

                  {/* Event content */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${catConf?.badgeClass}`}>
                        <Icon className="w-3 h-3" />
                        <span>{evt.category}</span>
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{time}</span>
                      </span>
                    </div>

                    <h4 className="font-serif font-bold text-base sm:text-lg text-slate-900">
                      {evt.title}
                    </h4>

                    <p className="text-xs text-slate-600 max-w-2xl font-light leading-relaxed">
                      {evt.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{evt.location}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{evt.audience === 'ALL' ? 'Toute la communauté' : evt.audience === 'PARENTS' ? 'Parents d’élèves' : 'Élèves'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right action button */}
                <div className="shrink-0 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => handleExportIcs(evt)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Ajouter (.ics)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
