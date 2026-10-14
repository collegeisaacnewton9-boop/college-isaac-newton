import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
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
  Search, 
  X, 
  ExternalLink, 
  Printer, 
  Filter, 
  Compass, 
  Bookmark,
  Share2
} from 'lucide-react';
import { SchoolEvent, EventCategory } from '../../types';

export type AcademicGroupFilter = 'ALL' | 'EXAMENS' | 'VACANCES' | 'ACTIVITES';

interface InteractiveCalendarProps {
  events: SchoolEvent[];
  onNavigateToResources?: () => void;
  selectedGroupFilter?: AcademicGroupFilter;
  onGroupFilterChange?: (group: AcademicGroupFilter) => void;
}

// Category visual configuration
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
    label: 'Vacances & Jours Fériés',
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
    label: 'Culturel & Célébrations',
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

// Helper to construct direct Google Calendar URL
function getGoogleCalendarUrl(event: SchoolEvent): string {
  const start = new Date(event.startDate).toISOString().replace(/-|:|\.\d+/g, '');
  const end = event.endDate 
    ? new Date(event.endDate).toISOString().replace(/-|:|\.\d+/g, '')
    : start;
  const title = encodeURIComponent(`${event.title} - Collège Isaac Newton`);
  const details = encodeURIComponent(
    `${event.description}\n\nCampus Collège Isaac Newton (Delmas 50, rue Dominique #2 bis, Port-au-Prince, Haïti)\nTél : +509 3316-0934 / +509 3721-1818`
  );
  const location = encodeURIComponent(`${event.location} - Delmas 50, rue Dominique #2 bis, Port-au-Prince, Haïti`);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
}

export const InteractiveCalendar: React.FC<InteractiveCalendarProps> = ({ 
  events,
  onNavigateToResources,
  selectedGroupFilter,
  onGroupFilterChange,
}) => {
  // Current active date view (Defaults to October 2026 for the first trimester)
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 9, 1));
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date(2026, 9, 24));
  
  // Filtering states
  const [internalGroupFilter, setInternalGroupFilter] = useState<AcademicGroupFilter>('ALL');
  const activeGroup = selectedGroupFilter !== undefined ? selectedGroupFilter : internalGroupFilter;

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('Tous');
  const [viewMode, setViewMode] = useState<'calendar' | 'agenda'>('calendar');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modal state for detailed event inspection
  const [inspectEvent, setInspectEvent] = useState<SchoolEvent | null>(null);

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
    if (today.getFullYear() === 2026 || today.getFullYear() === 2027) {
      setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
      setSelectedDate(today);
    } else {
      setCurrentDate(new Date(2026, 9, 1));
      setSelectedDate(new Date(2026, 9, 24));
    }
  };

  const handleSetGroup = (group: AcademicGroupFilter) => {
    if (onGroupFilterChange) {
      onGroupFilterChange(group);
    } else {
      setInternalGroupFilter(group);
    }
    setActiveCategoryFilter('Tous');
  };

  // Jump to specific trimester
  const handleJumpToTrimester = (trimester: 1 | 2 | 3) => {
    if (trimester === 1) {
      setCurrentDate(new Date(2026, 9, 1)); // Octobre 2026
      setSelectedDate(new Date(2026, 9, 24));
    } else if (trimester === 2) {
      setCurrentDate(new Date(2027, 0, 1)); // Janvier 2027
      setSelectedDate(new Date(2027, 0, 22));
    } else {
      setCurrentDate(new Date(2027, 3, 1)); // Avril 2027
      setSelectedDate(new Date(2027, 5, 7));
    }
  };

  // Group counting for main academic tabs
  const groupCounts = useMemo(() => {
    let examens = 0;
    let vacances = 0;
    let activites = 0;

    events.forEach(e => {
      if (e.category === 'Examen') {
        examens++;
      } else if (e.category === 'Férié') {
        vacances++;
      } else {
        activites++;
      }
    });

    return {
      ALL: events.length,
      EXAMENS: examens,
      VACANCES: vacances,
      ACTIVITES: activites,
    };
  }, [events]);

  // Filtered events based on Group, Sub-category, and Search query
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      // 1. Group filter (Examens, Vacances, Activités)
      if (activeGroup === 'EXAMENS' && e.category !== 'Examen') return false;
      if (activeGroup === 'VACANCES' && e.category !== 'Férié') return false;
      if (activeGroup === 'ACTIVITES' && (e.category === 'Examen' || e.category === 'Férié')) return false;

      // 2. Specific Category filter
      if (activeCategoryFilter !== 'Tous' && e.category !== activeCategoryFilter) return false;

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = e.title.toLowerCase().includes(q);
        const matchesDesc = e.description.toLowerCase().includes(q);
        const matchesLoc = e.location.toLowerCase().includes(q);
        const matchesCat = e.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesLoc && !matchesCat) return false;
      }

      return true;
    });
  }, [events, activeGroup, activeCategoryFilter, searchQuery]);

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

      {/* 1. TOP CONTROLS & ACADEMIC FILTER TABS */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
        
        {/* Row 1: The 3 Main Category Groups Requested (Examens, Vacances, Activités) + All */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 hidden sm:inline">
              Vue :
            </span>

            {/* Tous */}
            <button
              type="button"
              onClick={() => handleSetGroup('ALL')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeGroup === 'ALL'
                  ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/10'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Toutes les Dates</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                activeGroup === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {groupCounts.ALL}
              </span>
            </button>

            {/* Examens */}
            <button
              type="button"
              onClick={() => handleSetGroup('EXAMENS')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeGroup === 'EXAMENS'
                  ? 'bg-rose-700 text-white shadow-sm ring-2 ring-rose-500/20'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200/80'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-rose-500 group-hover:text-rose-700" />
              <span>Examens & Contrôles</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                activeGroup === 'EXAMENS' ? 'bg-white/20 text-white' : 'bg-rose-200 text-rose-900'
              }`}>
                {groupCounts.EXAMENS}
              </span>
            </button>

            {/* Vacances */}
            <button
              type="button"
              onClick={() => handleSetGroup('VACANCES')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeGroup === 'VACANCES'
                  ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-500/20'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80'
              }`}
            >
              <Palmtree className="w-4 h-4 text-amber-500" />
              <span>Vacances & Jours Fériés</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                activeGroup === 'VACANCES' ? 'bg-white/20 text-white' : 'bg-amber-200 text-amber-950'
              }`}>
                {groupCounts.VACANCES}
              </span>
            </button>

            {/* Activités */}
            <button
              type="button"
              onClick={() => handleSetGroup('ACTIVITES')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeGroup === 'ACTIVITES'
                  ? 'bg-blue-900 text-white shadow-sm ring-2 ring-blue-500/20'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200/80'
              }`}
            >
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span>Activités & Vie Scolaire</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                activeGroup === 'ACTIVITES' ? 'bg-white/20 text-white' : 'bg-blue-200 text-blue-950'
              }`}>
                {groupCounts.ACTIVITES}
              </span>
            </button>
          </div>

          {/* View Switcher: Calendar vs Agenda */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold self-start sm:self-auto">
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
        </div>

        {/* Row 2: Month Navigation & Trimesters Quick Jump */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Stepper + Month Name */}
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

            <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 capitalize tracking-tight flex items-center gap-2">
              <span>{monthName}</span>
              {currentMonth >= 8 && currentMonth <= 11 && (
                <span className="text-[11px] font-sans font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  1er Trimestre
                </span>
              )}
              {currentMonth >= 0 && currentMonth <= 2 && (
                <span className="text-[11px] font-sans font-semibold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  2e Trimestre
                </span>
              )}
              {currentMonth >= 3 && currentMonth <= 6 && (
                <span className="text-[11px] font-sans font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  3e Trimestre
                </span>
              )}
            </h2>
          </div>

          {/* Quick Trimesters Jumper */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mr-1">
              Trimestres :
            </span>
            <button
              type="button"
              onClick={() => handleJumpToTrimester(1)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-900 text-slate-700 font-medium transition-colors border border-slate-200 cursor-pointer"
              title="Aller au 1er Trimestre (Sept - Déc 2026)"
            >
              1er Trim (Automne)
            </button>
            <button
              type="button"
              onClick={() => handleJumpToTrimester(2)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 text-slate-700 font-medium transition-colors border border-slate-200 cursor-pointer"
              title="Aller au 2e Trimestre (Jan - Mars 2027)"
            >
              2e Trim (Hiver)
            </button>
            <button
              type="button"
              onClick={() => handleJumpToTrimester(3)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-50 hover:text-amber-900 text-slate-700 font-medium transition-colors border border-slate-200 cursor-pointer"
              title="Aller au 3e Trimestre (Avr - Juil 2027)"
            >
              3e Trim (Printemps-Été)
            </button>
          </div>

        </div>

        {/* Row 3: Instant Keyword Search Filter */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par mot-clé (ex : 9e AF, Bac, Noël, Carnaval, Réunion, Test)..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs transition-all outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                title="Effacer la recherche"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToResources && (
              <button
                type="button"
                onClick={onNavigateToResources}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:text-blue-900 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
                title="Télécharger la version imprimable PDF"
              >
                <Download className="w-3.5 h-3.5 text-blue-900" />
                <span>Calendrier PDF Officiel</span>
              </button>
            )}
          </div>
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
                    className={`min-h-[82px] sm:min-h-[96px] p-1.5 sm:p-2 text-left transition-colors relative flex flex-col justify-between group cursor-pointer focus:outline-none ${
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

                      {/* Event count dots on mobile */}
                      {hasEvents && (
                        <div className="flex items-center gap-1">
                          {dayEvents.slice(0, 3).map((evt, eIdx) => {
                            const catConf = CATEGORY_CONFIG[evt.category];
                            return (
                              <span 
                                key={eIdx} 
                                className={`w-2 h-2 rounded-full ${catConf?.dotColor || 'bg-blue-900'}`} 
                                title={`${evt.title} (${evt.category})`}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDate(date);
                              setInspectEvent(evt);
                            }}
                            className={`text-[9.5px] font-medium leading-tight px-1.5 py-0.5 rounded truncate border transition-transform hover:scale-[1.02] ${
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
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-semibold text-slate-800">Légende des dates :</span>
                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${config.dotColor}`} />
                    <span className="text-[11px] text-slate-700">{config.label.split('&')[0]}</span>
                  </div>
                ))}
              </div>

              <span className="text-[11px] text-slate-400 font-mono">
                Campus Delmas 50, rue Dominique #2 bis
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

              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 font-bold flex items-center justify-center font-mono text-base border border-blue-100 shadow-xs">
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
                      className={`p-4 rounded-xl border ${catConf?.bgLight || 'bg-slate-50 border-slate-200'} space-y-2.5 transition-all shadow-xs`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${catConf?.badgeClass}`}>
                          <Icon className="w-3 h-3" />
                          <span>{evt.category}</span>
                        </span>

                        <span className="text-[11px] font-mono text-slate-600 font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{timeStr}</span>
                        </span>
                      </div>

                      <h4 className="font-serif font-bold text-sm sm:text-base text-slate-900 leading-snug">
                        {evt.title}
                      </h4>

                      <p className="text-xs text-slate-600 leading-relaxed font-light">
                        {evt.description}
                      </p>

                      <div className="pt-2 border-t border-slate-200/50 flex flex-col gap-1 text-[11px] text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                          <span className="truncate">{evt.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3 h-3 text-blue-900 shrink-0" />
                          <span>Public : {evt.audience === 'PARENTS' ? 'Parents d’élèves' : evt.audience === 'STUDENTS' ? 'Élèves concernés' : 'Toute la communauté'}</span>
                        </div>
                      </div>

                      {/* Action buttons (Google Calendar, ICS, Modal) */}
                      <div className="pt-2 border-t border-slate-200/50 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setInspectEvent(evt)}
                          className="text-[11px] font-semibold text-blue-900 hover:text-blue-950 underline cursor-pointer"
                        >
                          Fiche détaillée & Impression
                        </button>

                        <div className="flex items-center gap-2">
                          <a
                            href={getGoogleCalendarUrl(evt)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white hover:bg-slate-100 text-[10px] font-semibold text-slate-700 border border-slate-200 transition-colors shadow-2xs"
                            title="Ajouter directement à Google Calendar"
                          >
                            <ExternalLink className="w-3 h-3 text-blue-900" />
                            <span>Google</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => handleExportIcs(evt)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white hover:bg-slate-100 text-[10px] font-semibold text-slate-700 border border-slate-200 transition-colors shadow-2xs cursor-pointer"
                            title="Télécharger le fichier .ics (Apple / Outlook)"
                          >
                            <Download className="w-3 h-3 text-emerald-700" />
                            <span>.ics</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 text-center space-y-2 text-slate-400">
                <CalendarIcon className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
                <p className="text-xs text-slate-600 font-semibold">
                  Aucun événement particulier ce jour.
                </p>
                <p className="text-[11px] text-slate-400 font-light">
                  Journée de cours régulière selon l’emploi du temps officiel.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 3. AGENDA / LIST VIEW (Chronological Cards) */}
      {viewMode === 'agenda' && (
        <div className="space-y-3">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((evt) => {
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

                  {/* Right action buttons */}
                  <div className="shrink-0 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setInspectEvent(evt)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      <span>Détails</span>
                    </button>

                    <a
                      href={getGoogleCalendarUrl(evt)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 transition-colors"
                      title="Ajouter à Google Agenda"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Google</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleExportIcs(evt)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
                      title="Télécharger (.ics)"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>.ics</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-2xl p-10 text-center space-y-3 border border-slate-200">
              <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="font-serif font-bold text-slate-700 text-base">Aucun événement ne correspond à ce filtre.</p>
              <p className="text-xs text-slate-500">Essayez de modifier votre mot-clé de recherche ou de sélectionner "Toutes les Dates".</p>
              <button
                type="button"
                onClick={() => {
                  handleSetGroup('ALL');
                  setSearchQuery('');
                }}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-900 text-white text-xs font-bold hover:bg-blue-950 transition-colors"
              >
                <span>Réinitialiser les filtres</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. MODAL DIALOG FOR INSPECTING AN EVENT */}
      <AnimatePresence>
        {inspectEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 sm:p-6 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-amber-300 font-mono text-[11px] font-semibold border border-white/15">
                    {React.createElement(CATEGORY_CONFIG[inspectEvent.category]?.icon || CalendarIcon, { className: 'w-3 h-3' })}
                    <span>{inspectEvent.category}</span>
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-white leading-snug">
                    {inspectEvent.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setInspectEvent(null)}
                  className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm text-slate-700">
                <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-600">Date officielle :</span>
                    <span className="font-bold text-slate-900">
                      {new Date(inspectEvent.startDate).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-600">Horaires :</span>
                    <span className="font-mono text-slate-900">
                      {new Date(inspectEvent.startDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      {inspectEvent.endDate && ` - ${new Date(inspectEvent.endDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-600">Lieu :</span>
                    <span className="font-medium text-slate-900 text-right">
                      {inspectEvent.location}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-600">Public concerné :</span>
                    <span className="font-medium text-slate-900">
                      {inspectEvent.audience === 'ALL' ? 'Toute la communauté scolaire' : inspectEvent.audience === 'PARENTS' ? 'Parents d’élèves' : 'Élèves concernés'}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-serif font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">
                    Description & Consignes Administratives :
                  </h4>
                  <p className="text-slate-600 text-xs leading-relaxed font-light">
                    {inspectEvent.description}
                  </p>
                </div>

                {/* Campus reminder */}
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-blue-900 leading-snug">
                  <strong>Collège Isaac Newton</strong> · Delmas 50, rue Dominique #2 bis, Port-au-Prince, Haïti.
                  <span className="block text-slate-600 mt-0.5">Assistance téléphonique secrétariat : +509 3316-0934 / +509 3721-1818.</span>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer</span>
                </button>

                <a
                  href={getGoogleCalendarUrl(inspectEvent)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-semibold transition-colors shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ajouter à Google Agenda</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleExportIcs(inspectEvent)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger .ics</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
