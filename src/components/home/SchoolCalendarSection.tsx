import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CalendarPlus, 
  Plus, 
  Edit3, 
  Trash2, 
  Download, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  AlertCircle, 
  GraduationCap, 
  Coffee, 
  UserCheck, 
  BookOpen, 
  Sparkles,
  Layers,
  CalendarDays
} from 'lucide-react';
import { SchoolEvent, EventCategory, User } from '../../types';
import { apiService } from '../../services/api';
import { INITIAL_EVENTS } from '../../data/mockData';

interface SchoolCalendarSectionProps {
  onNavigate: (page: string, subSection?: string) => void;
  currentUser?: User | null;
}

export const SchoolCalendarSection: React.FC<SchoolCalendarSectionProps> = ({ 
  onNavigate, 
  currentUser 
}) => {
  const [events, setEvents] = useState<SchoolEvent[]>(INITIAL_EVENTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'list' | 'month'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date(2026, 9, 1)); // Octobre 2026

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<SchoolEvent | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<EventCategory>('Pédagogique');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formLocation, setFormLocation] = useState('Campus Principal · Delmas 50');
  const [formAudience, setFormAudience] = useState<'ALL' | 'PARENTS' | 'STUDENTS'>('ALL');
  const [formDescription, setFormDescription] = useState('');
  const [formIsPublic, setFormIsPublic] = useState(true);

  // User permissions
  const canEdit = Boolean(
    currentUser && ['ADMIN', 'EDITOR', 'TEACHER'].includes(currentUser.role)
  );

  const loadEvents = useCallback(() => {
    apiService.getEvents().then((evts) => {
      if (Array.isArray(evts) && evts.length > 0) {
        setEvents(evts);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    loadEvents();
    const handleUpdate = () => loadEvents();
    window.addEventListener('cin:events-updated', handleUpdate);
    return () => window.removeEventListener('cin:events-updated', handleUpdate);
  }, [loadEvents]);

  // Open Add modal
  const handleOpenAdd = () => {
    setEditingEvent(null);
    setFormTitle('');
    setFormCategory('Pédagogique');
    // Default to upcoming Saturday at 09:00
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 7);
    const dateStr = nextDate.toISOString().slice(0, 16);
    setFormStartDate(dateStr);
    setFormEndDate('');
    setFormLocation('Campus Principal · Delmas 50, rue Dominique #2 bis');
    setFormAudience('ALL');
    setFormDescription('');
    setFormIsPublic(true);
    setIsModalOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (evt: SchoolEvent) => {
    setEditingEvent(evt);
    setFormTitle(evt.title);
    setFormCategory(evt.category);
    // Format to yyyy-MM-ddThh:mm
    const startIso = evt.startDate.length >= 16 ? evt.startDate.slice(0, 16) : evt.startDate;
    setFormStartDate(startIso);
    const endIso = evt.endDate && evt.endDate.length >= 16 ? evt.endDate.slice(0, 16) : (evt.endDate || '');
    setFormEndDate(endIso);
    setFormLocation(evt.location || 'Campus Principal · Delmas 50');
    setFormAudience(evt.audience || 'ALL');
    setFormDescription(evt.description || '');
    setFormIsPublic(evt.isPublic !== false);
    setIsModalOpen(true);
  };

  // Save event (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formStartDate) {
      setStatusMessage({ type: 'error', text: 'Veuillez saisir au minimum un titre et une date de début.' });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingEvent) {
        // UPDATE
        await apiService.updateEvent(editingEvent.id, {
          title: formTitle.trim(),
          category: formCategory,
          startDate: formStartDate,
          endDate: formEndDate || undefined,
          location: formLocation.trim(),
          audience: formAudience,
          description: formDescription.trim(),
          isPublic: formIsPublic,
        });
        setStatusMessage({ type: 'success', text: `Événement « ${formTitle} » mis à jour avec succès en base de données !` });
      } else {
        // CREATE
        await apiService.createEvent({
          title: formTitle.trim(),
          category: formCategory,
          startDate: formStartDate,
          endDate: formEndDate || undefined,
          location: formLocation.trim(),
          audience: formAudience,
          description: formDescription.trim(),
          isPublic: formIsPublic,
        });
        setStatusMessage({ type: 'success', text: `Nouvelle date « ${formTitle} » enregistrée avec succès en base de données !` });
      }

      setIsModalOpen(false);
      loadEvents();
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Erreur lors de l'enregistrement : ${err.message || 'Échec de connexion'}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete event
  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Confirmez-vous la suppression définitive de l'événement « ${title} » dans la base de données ?`)) {
      return;
    }
    try {
      await apiService.deleteEvent(id);
      setStatusMessage({ type: 'success', text: `Événement « ${title} » supprimé de la base de données.` });
      loadEvents();
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Impossible de supprimer cet événement.' });
    }
  };

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events
      .filter((evt) => {
        // Visibility
        if (!canEdit && evt.isPublic === false) return false;

        // Category filter
        if (selectedCategory !== 'ALL') {
          if (selectedCategory === 'EXAM' && evt.category !== 'Examen') return false;
          if (selectedCategory === 'HOLIDAY' && evt.category !== 'Férié') return false;
          if (selectedCategory === 'PARENTS' && evt.category !== 'Réunion' && evt.audience !== 'PARENTS') return false;
          if (selectedCategory === 'PEDAGOGIQUE' && !['Pédagogique', 'Culturel', 'Sportif'].includes(evt.category)) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = evt.title.toLowerCase().includes(q);
          const matchDesc = evt.description?.toLowerCase().includes(q);
          const matchLoc = evt.location?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchLoc) return false;
        }

        return true;
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [events, canEdit, selectedCategory, searchQuery]);

  // Category counts
  const counts = useMemo(() => {
    return {
      all: events.length,
      exam: events.filter(e => e.category === 'Examen').length,
      holiday: events.filter(e => e.category === 'Férié').length,
      parents: events.filter(e => e.category === 'Réunion' || e.audience === 'PARENTS').length,
      pedagogique: events.filter(e => ['Pédagogique', 'Culturel', 'Sportif'].includes(e.category)).length,
    };
  }, [events]);

  // Color & Badge helper per Category
  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'Examen':
        return {
          badge: 'bg-rose-100 text-rose-800 border-rose-200',
          dot: 'bg-rose-500',
          border: 'border-l-rose-500',
          icon: GraduationCap,
          label: 'Examens & Évaluations'
        };
      case 'Férié':
        return {
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
          border: 'border-l-emerald-500',
          icon: Coffee,
          label: 'Jour Férié / Congé'
        };
      case 'Réunion':
        return {
          badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          dot: 'bg-indigo-500',
          border: 'border-l-indigo-500',
          icon: UserCheck,
          label: 'Réunion Parents & APE'
        };
      default:
        return {
          badge: 'bg-amber-100 text-amber-900 border-amber-200',
          dot: 'bg-amber-500',
          border: 'border-l-amber-500',
          icon: BookOpen,
          label: 'Pédagogique & Vie Scolaire'
        };
    }
  };

  // Export full calendar as ICS file
  const handleExportICS = () => {
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//College Isaac Newton//Agenda Scolaire//FR\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\nX-WR-CALNAME:Collège Isaac Newton - Calendrier Scolaire\n";
    
    filteredEvents.forEach(evt => {
      const dtStart = new Date(evt.startDate).toISOString().replace(/-|:|\.\d\d\d/g, '');
      const dtEnd = evt.endDate 
        ? new Date(evt.endDate).toISOString().replace(/-|:|\.\d\d\d/g, '') 
        : dtStart;
      
      icsContent += "BEGIN:VEVENT\n";
      icsContent += `UID:${evt.id}@collegeisaacnewton.com\n`;
      icsContent += `DTSTAMP:${new Date().toISOString().replace(/-|:|\.\d\d\d/g, '')}\n`;
      icsContent += `DTSTART:${dtStart}\n`;
      icsContent += `DTEND:${dtEnd}\n`;
      icsContent += `SUMMARY:${evt.title.replace(/\n/g, ' ')}\n`;
      icsContent += `DESCRIPTION:${(evt.description || '').replace(/\n/g, '\\n')}\n`;
      icsContent += `LOCATION:${(evt.location || 'Collège Isaac Newton, Delmas 50').replace(/\n/g, ' ')}\n`;
      icsContent += "STATUS:CONFIRMED\n";
      icsContent += "END:VEVENT\n";
    });

    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'calendrier-college-isaac-newton-2026-2027.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Google Calendar link for a single event
  const getGoogleCalendarUrl = (evt: SchoolEvent) => {
    const startIso = new Date(evt.startDate).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endIso = evt.endDate 
      ? new Date(evt.endDate).toISOString().replace(/-|:|\.\d\d\d/g, '') 
      : startIso;
    const details = encodeURIComponent(`${evt.description || ''}\n\nLieu: ${evt.location || 'Collège Isaac Newton, Delmas 50'}`);
    const location = encodeURIComponent(evt.location || 'Collège Isaac Newton, Delmas 50, Port-au-Prince, Haïti');
    const title = encodeURIComponent(evt.title);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
  };

  // Calendar Month grid calculations
  const monthName = currentMonthDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  return (
    <section 
      id="calendrier-scolaire"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
      aria-label="Calendrier Scolaire et Dates Officielles"
    >
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 text-blue-950 text-xs font-bold uppercase tracking-wider mb-2">
            <Calendar className="w-3.5 h-3.5 text-blue-900" />
            <span>Calendrier Scolaire Officiel</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
            Agenda & Dates Importantes
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Retrouvez les dates officielles des examens d'État (9e AF & Bac), réunions de parents d'élèves, congés légaux et temps forts du campus. Données synchronisées avec PostgreSQL.
          </p>
        </div>

        {/* TOP CONTROLS & ADD BUTTON (FOR AUTHORIZED ROLES) */}
        <div className="flex items-center flex-wrap gap-2.5 shrink-0">
          
          {/* Export ICS Button */}
          <button
            type="button"
            onClick={handleExportICS}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            title="Exporter l'agenda complet au format iCal / Google Calendar"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Exporter (.ics)</span>
          </button>

          {/* Add Event Button for Admin / Editor / Teacher */}
          {canEdit && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-950/20 transition-all cursor-pointer"
              title="Ajouter une date officielle dans la base de données"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>+ Ajouter un événement</span>
            </button>
          )}

        </div>
      </div>

      {/* FEEDBACK STATUS BANNER */}
      {statusMessage && (
        <div 
          className={`p-3.5 rounded-xl mb-6 text-xs sm:text-sm font-medium flex items-center justify-between gap-3 ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button 
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* FILTER BAR & VIEW TOGGLE */}
      <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-200 mb-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-blue-950 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
            }`}
          >
            Tous ({counts.all})
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('EXAM')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'EXAM'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Examens & Évaluations ({counts.exam})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('HOLIDAY')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'HOLIDAY'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Jours Fériés & Congés ({counts.holiday})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('PARENTS')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'PARENTS'
                ? 'bg-indigo-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>Réunions Parents ({counts.parents})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('PEDAGOGIQUE')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'PEDAGOGIQUE'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Pédagogique ({counts.pedagogique})</span>
          </button>
        </div>

        {/* Right tools: Search & List/Month toggle */}
        <div className="flex items-center gap-2">
          
          {/* Quick Search */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher une date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-900"
            />
          </div>

          {/* Toggle View Mode */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                viewMode === 'list' ? 'bg-blue-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Vue Chronologique"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('month')}
              className={`p-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                viewMode === 'month' ? 'bg-blue-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Vue Calendrier Mensuel"
            >
              <CalendarDays className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* CONTENT: LIST VIEW OR MONTH VIEW */}
      {viewMode === 'list' ? (
        
        /* CHRONOLOGICAL AGENDA LIST VIEW */
        <div className="space-y-3.5">
          {filteredEvents.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-300">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Aucun événement ne correspond à ce filtre.</p>
              <p className="text-xs text-slate-500 mt-1">Sélectionnez « Tous » ou effectuez une autre recherche.</p>
            </div>
          ) : (
            filteredEvents.map((evt) => {
              const theme = getCategoryTheme(evt.category);
              const IconComp = theme.icon;
              const dateObj = new Date(evt.startDate);
              const dayNumber = !isNaN(dateObj.getTime()) ? dateObj.getDate() : '--';
              const monthStr = !isNaN(dateObj.getTime()) 
                ? dateObj.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase()
                : 'DATE';
              const yearStr = !isNaN(dateObj.getTime()) ? dateObj.getFullYear() : '2026';
              const timeStr = !isNaN(dateObj.getTime()) 
                ? dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                : '';

              const isUpcoming = dateObj.getTime() > Date.now();

              return (
                <div
                  key={evt.id}
                  className={`bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-l-4 ${theme.border} relative group`}
                >
                  {/* Left: Date Badge & Details */}
                  <div className="flex items-start gap-4 flex-1">
                    
                    {/* Big Date Box */}
                    <div className="w-14 sm:w-16 h-16 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center shrink-0 shadow-xs">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                        {monthStr}
                      </span>
                      <span className="font-mono text-xl sm:text-2xl font-extrabold leading-none mt-0.5">
                        {dayNumber}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {yearStr}
                      </span>
                    </div>

                    {/* Meta & Title */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${theme.badge}`}>
                          <IconComp className="w-3 h-3" />
                          <span>{theme.label}</span>
                        </span>

                        {evt.audience && evt.audience !== 'ALL' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {evt.audience === 'PARENTS' ? 'Parents d’élèves' : 'Élèves & Candidats'}
                          </span>
                        )}

                        {isUpcoming && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            À venir
                          </span>
                        )}

                        {!evt.isPublic && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">
                            Interne (Non-public)
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                        {evt.title}
                      </h3>

                      {evt.description && (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {evt.description}
                        </p>
                      )}

                      {/* Location & Time pills */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-0.5">
                        {timeStr && (
                          <div className="flex items-center gap-1 text-slate-700 font-medium">
                            <Clock className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                            <span>{timeStr}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{evt.location || 'Campus Principal, Delmas 50'}</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Right Actions: Google Calendar & Admin Buttons */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 w-full md:w-auto justify-end">
                    
                    <a
                      href={getGoogleCalendarUrl(evt)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                      title="Ajouter cet événement à mon Google Calendar"
                    >
                      <CalendarPlus className="w-3.5 h-3.5 text-blue-900" />
                      <span className="hidden sm:inline">Agenda</span>
                    </a>

                    {/* Admin in-place Edit & Delete */}
                    {canEdit && (
                      <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(evt)}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-900 hover:bg-blue-100 text-xs font-medium transition-colors cursor-pointer"
                          title="Modifier cet événement"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(evt.id, evt.title)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-medium transition-colors cursor-pointer"
                          title="Supprimer cet événement"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                  </div>
                </div>
              );
            })
          )}
        </div>

      ) : (

        /* INTERACTIVE MONTHLY CALENDAR GRID VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6">
          
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900 capitalize flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-900" />
              <span>{monthName}</span>
            </h3>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                title="Mois précédent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                title="Mois suivant"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Lun</span>
            <span>Mar</span>
            <span>Mer</span>
            <span>Jeu</span>
            <span>Ven</span>
            <span className="text-amber-600">Sam</span>
            <span className="text-rose-600">Dim</span>
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Empty offset days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[70px] sm:min-h-[85px] bg-slate-50/50 rounded-xl border border-slate-100 p-1.5 opacity-40" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const currentDay = idx + 1;
              const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
              
              // Find events on this day
              const dayEvents = filteredEvents.filter(e => e.startDate.startsWith(dateKey));
              const hasEvents = dayEvents.length > 0;

              return (
                <div
                  key={currentDay}
                  className={`min-h-[70px] sm:min-h-[85px] rounded-xl border p-1.5 transition-all flex flex-col justify-between ${
                    hasEvents 
                      ? 'bg-blue-50/40 border-blue-200 hover:border-blue-400 hover:shadow-xs' 
                      : 'bg-white border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold font-mono ${hasEvents ? 'text-blue-950 font-extrabold' : 'text-slate-600'}`}>
                      {currentDay}
                    </span>
                    {hasEvents && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    )}
                  </div>

                  {/* Day Events preview badges */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev) => {
                      const theme = getCategoryTheme(ev.category);
                      return (
                        <div
                          key={ev.id}
                          onClick={() => {
                            if (canEdit) handleOpenEdit(ev);
                          }}
                          className={`text-[9px] sm:text-[10px] truncate px-1.5 py-0.5 rounded font-medium border ${theme.badge} cursor-pointer`}
                          title={`${ev.title} (${ev.category})`}
                        >
                          {ev.title}
                        </div>
                      );
                    })}
                    {dayEvents.length > 2 && (
                      <span className="text-[8px] text-slate-500 font-bold block text-center">
                        +{dayEvents.length - 2} autre(s)
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Examens</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Congés & Fériés</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span>Réunions Parents</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Pédagogique</span>
              </span>
            </div>
            <span>Cliquez sur une date pour voir ou modifier l'événement</span>
          </div>

        </div>

      )}

      {/* MODAL: AJOUT / MODIFICATION D'UN ÉVÉNEMENT SCOLAIRE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-blue-100 text-blue-900">
                  <Calendar className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900">
                    {editingEvent ? 'Modifier la date de l’événement' : 'Ajouter une date au calendrier officiel'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Enregistrement direct dans la base de données PostgreSQL
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 pt-4">
              
              {/* Titre de l'événement */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Titre officiel de l’événement *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Assemblée Générale des Parents ou Examens d'État 9e AF"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                />
              </div>

              {/* Catégorie & Public */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Catégorie *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as EventCategory)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-900"
                  >
                    <option value="Examen">🎓 Examen & Évaluation</option>
                    <option value="Férié">🏖️ Jour Férié & Congé</option>
                    <option value="Réunion">👨‍👩‍👧‍👦 Réunion Parents & APE</option>
                    <option value="Pédagogique">📖 Pédagogique & Vie Scolaire</option>
                    <option value="Culturel">🎭 Culturel & Artistique</option>
                    <option value="Sportif">⚽ Sportif & Tournoi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Public visé
                  </label>
                  <select
                    value={formAudience}
                    onChange={(e) => setFormAudience(e.target.value as 'ALL' | 'PARENTS' | 'STUDENTS')}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-900"
                  >
                    <option value="ALL">Tout le collège (Élèves, Parents, Équipe)</option>
                    <option value="PARENTS">Parents d’élèves en priorité</option>
                    <option value="STUDENTS">Élèves & Candidats aux examens</option>
                  </select>
                </div>
              </div>

              {/* Dates début et fin */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Date & Heure de début *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:border-blue-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Date & Heure de fin (Optionnel)
                  </label>
                  <input
                    type="datetime-local"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:border-blue-900"
                  />
                </div>
              </div>

              {/* Lieu */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Lieu de l’événement
                </label>
                <input
                  type="text"
                  placeholder="Ex: Auditorium, Campus Delmas 50 ou Centres MENFP"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-900"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Description détaillée & Consignes
                </label>
                <textarea
                  rows={3}
                  placeholder="Précisez le déroulement, l'ordre du jour ou les pièces requises..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-900"
                />
              </div>

              {/* Visibilité */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="formIsPublic"
                  checked={formIsPublic}
                  onChange={(e) => setFormIsPublic(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-900 focus:ring-blue-900 cursor-pointer"
                />
                <label htmlFor="formIsPublic" className="text-xs text-slate-700 cursor-pointer font-medium">
                  Visible publiquement sur la page d'accueil et le calendrier officiel
                </label>
              </div>

              {/* Actions du Modal */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-950/20 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Enregistrement...' : editingEvent ? 'Mettre à jour' : 'Enregistrer la date'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </section>
  );
};
