import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Timer, 
  Calendar, 
  Clock, 
  MapPin, 
  CalendarPlus, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Edit3, 
  Bell, 
  X, 
  Check, 
  Send, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  CalendarDays, 
  Play, 
  Pause,
  GraduationCap,
  History,
  CalendarClock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { SchoolEvent, User, EventCategory } from '../../types';
import { apiService } from '../../services/api';
import { INITIAL_EVENTS } from '../../data/mockData';
import { eventNotificationService } from '../../services/eventNotificationService';

export const isExamEvent = (e: SchoolEvent): boolean => {
  if (['Examen', 'Contrôle'].includes(e.category)) return true;
  const t = ((e.title || '') + ' ' + (e.description || '')).toLowerCase();
  return (
    t.includes('examen') ||
    t.includes('contrôle') ||
    t.includes('controle') ||
    t.includes('baccalauréat') ||
    t.includes('baccalaureat') ||
    t.includes('9e af') ||
    t.includes('9ème af') ||
    t.includes('ns4') ||
    t.includes('ns-4') ||
    t.includes('épreuve') ||
    t.includes('epreuve') ||
    t.includes('test')
  );
};

interface EventCountdownWidgetProps {
  onNavigate: (page: string, subSection?: string) => void;
  currentUser?: User | null;
}

interface TimeRemaining {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

export const EventCountdownWidget: React.FC<EventCountdownWidgetProps> = ({ 
  onNavigate, 
  currentUser 
}) => {
  const [events, setEvents] = useState<SchoolEvent[]>(INITIAL_EVENTS);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'UPCOMING' | 'PAST'>('UPCOMING');
  const [filterMode, setFilterMode] = useState<'ALL' | 'EXAMS'>('ALL');
  const [now, setNow] = useState<Date>(new Date());
  const [direction, setDirection] = useState<number>(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // Auto-play active by default and continuous (no pause on user hover)
  const [isAutoPlayActive, setIsAutoPlayActive] = useState(true);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Quick Reminder Modal State
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderEmail, setReminderEmail] = useState('');
  const [reminderPhone, setReminderPhone] = useState('');
  const [isSubmittingReminder, setIsSubmittingReminder] = useState(false);

  // Admin In-Place Quick Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editCategory, setEditCategory] = useState<EventCategory>('Pédagogique');
  const [editAudience, setEditAudience] = useState<'ALL' | 'PARENTS' | 'STUDENTS'>('ALL');
  const [editDesc, setEditDesc] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const canManage = Boolean(currentUser && ['ADMIN', 'EDITOR', 'TEACHER'].includes(currentUser.role));

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

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 1. Separate all upcoming/ongoing from all past
  const allUpcomingEvents = useMemo(() => {
    return events
      .filter((e) => {
        if (!e.startDate) return false;
        const status = eventNotificationService.getEventTemporalStatus(e, now);
        return status === 'UPCOMING' || status === 'ONGOING';
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [events, now]);

  const allPastEvents = useMemo(() => {
    return events
      .filter((e) => {
        if (!e.startDate) return false;
        const status = eventNotificationService.getEventTemporalStatus(e, now);
        return status === 'PAST';
      })
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }, [events, now]);

  // Smart Initial ViewMode: If no upcoming events exist but past events do, auto-switch to PAST
  const hasAutoSwitchedMode = useRef(false);
  useEffect(() => {
    if (!hasAutoSwitchedMode.current && events.length > 0) {
      if (allUpcomingEvents.length === 0 && allPastEvents.length > 0) {
        setViewMode('PAST');
      }
      hasAutoSwitchedMode.current = true;
    }
  }, [events, allUpcomingEvents.length, allPastEvents.length]);

  // 2. Active list strictly based on viewMode and filterMode - NEVER fallback to past events in upcoming mode!
  const activeList = useMemo(() => {
    const base = viewMode === 'UPCOMING' ? allUpcomingEvents : allPastEvents;
    if (filterMode === 'EXAMS') {
      return base.filter(isExamEvent);
    }
    return base;
  }, [viewMode, allUpcomingEvents, allPastEvents, filterMode]);

  // Active event to display - strictly from activeList. Never fallback to events[0]
  const activeEvent = useMemo(() => {
    if (activeList.length === 0) return null;
    if (selectedEventId) {
      const found = activeList.find(e => e.id === selectedEventId);
      if (found) return found;
    }
    return activeList[0] || null;
  }, [activeList, selectedEventId]);

  // Precise temporal details from centralized service
  const temporalDetails = useMemo(() => {
    if (!activeEvent) {
      return {
        status: 'UPCOMING' as const,
        label: '',
        badgeClass: '',
        isPast: false,
        isOngoing: false,
        isUpcoming: true,
        daysDiff: 0,
      };
    }
    return eventNotificationService.getEventTemporalDetails(activeEvent, now);
  }, [activeEvent, now]);

  // Active index within activeList
  const activeIndex = useMemo(() => {
    if (!activeEvent) return 0;
    const idx = activeList.findIndex(e => e.id === activeEvent.id);
    return idx >= 0 ? idx : 0;
  }, [activeList, activeEvent]);

  // Sliding window of 4 timeline cards tracking active item
  const timelineBatchStart = useMemo(() => {
    return Math.floor(activeIndex / 4) * 4;
  }, [activeIndex]);

  const timelineEvents = useMemo(() => {
    return activeList.slice(timelineBatchStart, timelineBatchStart + 4);
  }, [activeList, timelineBatchStart]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Auto-play rotation: continuous slide without pause on hover (as requested)
  useEffect(() => {
    if (!isAutoPlayActive || activeList.length <= 1) {
      return;
    }
    const interval = setInterval(() => {
      setDirection(1);
      setSelectedEventId((prevId) => {
        const currentIdx = prevId ? activeList.findIndex(e => e.id === prevId) : 0;
        const nextIdx = (currentIdx + 1) % activeList.length;
        return activeList[nextIdx].id;
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlayActive, activeList]);

  // Handlers for fluid navigation
  const handlePrev = useCallback(() => {
    if (activeList.length <= 1) return;
    setDirection(-1);
    const prevIdx = (activeIndex - 1 + activeList.length) % activeList.length;
    setSelectedEventId(activeList[prevIdx].id);
  }, [activeList, activeIndex]);

  const handleNext = useCallback(() => {
    if (activeList.length <= 1) return;
    setDirection(1);
    const nextIdx = (activeIndex + 1) % activeList.length;
    setSelectedEventId(activeList[nextIdx].id);
  }, [activeList, activeIndex]);

  const handleSelectEvent = useCallback((id: string, targetIdx: number) => {
    setDirection(targetIdx >= activeIndex ? 1 : -1);
    setSelectedEventId(id);
    setIsDropdownOpen(false);
  }, [activeIndex]);

  // Calculate remaining time
  const timeRemaining: TimeRemaining = useMemo(() => {
    if (!activeEvent || !activeEvent.startDate) {
      return { totalMs: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
    }

    const targetTime = new Date(activeEvent.startDate).getTime();
    const diff = targetTime - now.getTime();

    if (diff <= 0) {
      return { totalMs: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
    }

    const seconds = Math.floor((diff / 1000) % 60);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    return { totalMs: diff, days, hours, minutes, seconds, isPast: false };
  }, [activeEvent, now]);

  if (events.length === 0) return null;

  // Format date nicely in French
  const eventDateObj = activeEvent?.startDate ? new Date(activeEvent.startDate) : null;
  const formattedDate = eventDateObj && !isNaN(eventDateObj.getTime())
    ? eventDateObj.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : activeEvent?.startDate || '';

  const formattedTime = eventDateObj && !isNaN(eventDateObj.getTime())
    ? eventDateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : '';

  // Format short date for badges (e.g. "18 nov.")
  const getShortDateLabel = (dateStr: string) => {
    if (!dateStr) return 'Date';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Date';
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  // Google Calendar Link generator
  const getGoogleCalendarUrl = () => {
    if (!activeEvent || !activeEvent.startDate) return '#';
    const startIso = new Date(activeEvent.startDate).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endIso = activeEvent.endDate 
      ? new Date(activeEvent.endDate).toISOString().replace(/-|:|\.\d\d\d/g, '')
      : startIso;
    const details = encodeURIComponent(`${activeEvent.description || ''}\n\nLieu: ${activeEvent.location || 'Collège Isaac Newton, Delmas 50'}`);
    const location = encodeURIComponent(activeEvent.location || 'Collège Isaac Newton, Delmas 50, Port-au-Prince, Haïti');
    const title = encodeURIComponent(activeEvent.title);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
  };

  // Open Quick Edit Modal for Admin
  const handleOpenEditModal = () => {
    if (!activeEvent) return;
    setEditTitle(activeEvent.title || '');
    const d = new Date(activeEvent.startDate);
    const dateStr = !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : '';
    const timeStr = !isNaN(d.getTime()) ? d.toTimeString().substring(0, 5) : '08:00';
    setEditDate(dateStr);
    setEditTime(timeStr);
    setEditLocation(activeEvent.location || 'Campus Principal · Delmas 50');
    setEditCategory(activeEvent.category || 'Pédagogique');
    setEditAudience(activeEvent.audience || 'ALL');
    setEditDesc(activeEvent.description || '');
    setIsEditModalOpen(true);
  };

  // Submit Quick Edit Modal for Admin
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent) return;

    setIsSavingEdit(true);
    try {
      const fullDateStr = `${editDate}T${editTime}:00`;
      const updated: SchoolEvent = {
        ...activeEvent,
        title: editTitle.trim(),
        startDate: fullDateStr,
        location: editLocation.trim(),
        category: editCategory,
        audience: editAudience,
        description: editDesc.trim(),
      };

      await apiService.updateEvent(updated.id, updated);
      setEvents(prev => prev.map(ev => ev.id === updated.id ? updated : ev));
      toast.success('Événement mis à jour avec succès !');
      setIsEditModalOpen(false);
    } catch {
      toast.error('Erreur lors de la mise à jour de l’événement');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Submit Quick Reminder Request
  const handleSubmitReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent) return;
    if (!reminderEmail && !reminderPhone) {
      toast.error('Veuillez renseigner un email ou un numéro WhatsApp.');
      return;
    }

    setIsSubmittingReminder(true);
    try {
      await apiService.sendContactMessage({
        fullName: 'Demande de Rappel Événement',
        email: reminderEmail || 'rappel@collegeisaacnewton.com',
        phone: reminderPhone || '',
        subject: `[Rappel Événement] ${activeEvent.title}`,
        message: `Rappel demandé pour l'événement "${activeEvent.title}" prévu le ${formattedDate} à ${formattedTime}. Contact: ${reminderEmail} / ${reminderPhone}`,
      });

      toast.success('Votre demande de rappel a été enregistrée avec succès !', {
        description: `Un rappel automatique vous sera adressé avant le ${formattedDate}.`,
      });
      setIsReminderModalOpen(false);
      setReminderEmail('');
      setReminderPhone('');
    } catch {
      toast.error('Une erreur est survenue lors de l’enregistrement du rappel.');
    } finally {
      setIsSubmittingReminder(false);
    }
  };

  return (
    <section 
      className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 -mt-3 sm:-mt-5 relative z-20"
      aria-label="Prochains événements et compte à rebours"
    >
      <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 border border-blue-900/40 shadow-xl overflow-hidden text-white transition-all">
        
        {/* Subtle glow ambient lighting */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative p-3.5 sm:p-5 space-y-3.5">
          
          {/* TOP BAR : Clean Header + Mode Toggle + Interactive Navigation */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-white/10">
            
            {/* Title & Mode Switcher (À Venir vs Passés) */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="p-1.5 sm:p-2 rounded-xl bg-amber-400 text-slate-950 font-bold shadow-xs shrink-0 flex items-center justify-center">
                  <Timer className="w-4 h-4 sm:w-4.5 sm:h-4.5 animate-pulse" />
                </span>
                <div className="leading-tight">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300 font-bold">
                      {viewMode === 'UPCOMING'
                        ? temporalDetails.isOngoing 
                          ? 'Événement Scolaire en Cours' 
                          : 'Événement Officiel à Venir'
                        : 'Événement Clôturé · Archives'}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/10 text-slate-300 font-medium">
                      2026–2027
                    </span>
                  </div>
                  <span className="text-xs text-slate-300 block truncate">
                    Collège Isaac Newton · SI Pédagogique
                  </span>
                </div>
              </div>

              {/* View mode toggle: À Venir vs Passés */}
              <div className="inline-flex rounded-xl p-0.5 bg-white/10 border border-white/15 text-xs font-semibold shrink-0">
                <button
                  type="button"
                  onClick={() => { setViewMode('UPCOMING'); setSelectedEventId(null); }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'UPCOMING'
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>À Venir ({allUpcomingEvents.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setViewMode('PAST'); setSelectedEventId(null); }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'PAST'
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <History className="w-3.5 h-3.5 text-slate-400" />
                  <span>Passés ({allPastEvents.length})</span>
                </button>
              </div>
            </div>

            {/* CONTROLS (Exam Filter, Dropdown, Step counter, Prev / Next, Auto-play Indicator) */}
            <div className="flex items-center justify-between lg:justify-end gap-2 flex-wrap relative">
              
              {/* Quick Filter: Tous vs Examens & Contrôles */}
              <div className="inline-flex items-center bg-white/10 p-0.5 rounded-xl border border-white/15 text-xs shadow-2xs">
                <button
                  type="button"
                  onClick={() => { setFilterMode('ALL'); setSelectedEventId(null); }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    filterMode === 'ALL'
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Tous
                </button>
                <button
                  type="button"
                  onClick={() => { setFilterMode('EXAMS'); setSelectedEventId(null); }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    filterMode === 'EXAMS'
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                      : 'text-amber-300 hover:text-white'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Examens</span>
                </button>
              </div>
              
              {/* Event Selector Dropdown Menu */}
              {activeList.length > 1 && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    aria-expanded={isDropdownOpen}
                    aria-label="Sélectionner une date officielle"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/15 transition-all shadow-xs cursor-pointer group"
                  >
                    <CalendarDays className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span className="max-w-[130px] sm:max-w-[180px] truncate text-slate-100 font-medium">
                      {activeEvent ? `${getShortDateLabel(activeEvent.startDate)} · ${activeEvent.title}` : 'Sélectionner un événement'}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-amber-300 transition-transform ${isDropdownOpen ? 'rotate-180 text-amber-300' : ''}`} />
                  </button>

                  {/* Dropdown Floating Panel */}
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.16 }}
                        className="absolute right-0 top-full mt-1.5 w-76 sm:w-88 max-w-[90vw] bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 text-slate-100 space-y-1"
                      >
                        <div className="px-2.5 py-1.5 border-b border-white/10 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <span>{viewMode === 'UPCOMING' ? 'Événements à Venir' : 'Archives & Événements Passés'}</span>
                          <span className="text-amber-400 font-mono">{activeList.length} dates</span>
                        </div>

                        <div className="max-h-64 overflow-y-auto space-y-1 py-1 pr-0.5">
                          {activeList.map((evt, idx) => {
                            const isSelected = activeEvent?.id === evt.id;
                            const shortDate = getShortDateLabel(evt.startDate);
                            return (
                              <button
                                key={evt.id}
                                type="button"
                                onClick={() => handleSelectEvent(evt.id, idx)}
                                className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 cursor-pointer ${
                                  isSelected 
                                    ? 'bg-amber-400/20 border border-amber-400/40 text-white' 
                                    : 'hover:bg-white/10 border border-transparent text-slate-300'
                                }`}
                              >
                                <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md font-bold shrink-0 mt-0.5 ${
                                  isSelected ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-white/10 text-amber-300'
                                }`}>
                                  {shortDate}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <p className="font-semibold text-xs truncate text-white">
                                      {evt.title}
                                    </p>
                                    {isSelected && (
                                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1" />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-[10.5px] text-slate-400 mt-0.5">
                                    <span>{evt.category || 'Pédagogique'}</span>
                                    {evt.location && (
                                      <>
                                        <span>·</span>
                                        <span className="truncate">{evt.location}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Prev / Next & Step Indicator */}
              {activeList.length > 1 && (
                <div className="flex items-center gap-1.5 shrink-0 bg-white/5 border border-white/10 rounded-xl p-1">
                  
                  {/* Step counter formatted cleanly e.g. 01 / 19 */}
                  <span className="text-[11px] font-mono text-slate-300 font-semibold px-2 tabular-nums">
                    {String(activeIndex + 1).padStart(2, '0')}{' '}
                    <span className="text-slate-500">/</span>{' '}
                    {String(activeList.length).padStart(2, '0')}
                  </span>

                  {/* Previous Button */}
                  <button
                    type="button"
                    onClick={handlePrev}
                    title="Événement précédent"
                    aria-label="Événement précédent"
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/20 active:scale-95 text-slate-200 hover:text-white transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Next Button */}
                  <button
                    type="button"
                    onClick={handleNext}
                    title="Événement suivant"
                    aria-label="Événement suivant"
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/20 active:scale-95 text-slate-200 hover:text-white transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Auto-play status button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsAutoPlayActive(!isAutoPlayActive);
                      toast.info(
                        !isAutoPlayActive 
                          ? 'Défilement automatique continu activé (6s)' 
                          : 'Défilement automatique mis en pause'
                      );
                    }}
                    title={isAutoPlayActive ? 'Pause du défilement automatique' : 'Activer le défilement automatique'}
                    aria-label={isAutoPlayActive ? 'Pause auto-play' : 'Play auto-play'}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                      isAutoPlayActive 
                        ? 'bg-amber-400 text-slate-950 font-bold' 
                        : 'bg-white/5 hover:bg-white/20 text-slate-400 hover:text-white'
                    }`}
                  >
                    {isAutoPlayActive ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-mono hidden sm:inline">Auto</span>
                      </>
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}

            </div>

          </div>

          {/* BALANCED 4-CARD INTERACTIVE PROGRESS TRACK (SLIDING WINDOW MATCHING ACTIVE INDEX) */}
          {timelineEvents.length > 1 && activeEvent && (
            <div className="space-y-1">
              <nav 
                aria-label="Sélecteur d'événements officiels"
                className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-0.5"
              >
                {timelineEvents.map((evt, idx) => {
                  const absoluteIndex = timelineBatchStart + idx;
                  const isSelected = activeEvent?.id === evt.id;
                  const shortDate = getShortDateLabel(evt.startDate);
                  return (
                    <button
                      key={evt.id}
                      type="button"
                      onClick={() => handleSelectEvent(evt.id, absoluteIndex)}
                      className={`relative text-left p-2.5 rounded-xl border transition-all cursor-pointer group flex flex-col justify-between overflow-hidden ${
                        isSelected 
                          ? 'bg-gradient-to-br from-amber-400/20 via-amber-400/10 to-transparent border-amber-400 text-white shadow-md' 
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      {/* Top indicator bar for active item */}
                      {isSelected && (
                        <span className="absolute top-0 left-0 right-0 h-0.5 bg-amber-400" />
                      )}

                      <div className="flex items-center justify-between gap-1 w-full mb-1">
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold flex items-center gap-1 ${
                          isSelected 
                            ? 'bg-amber-400 text-slate-950' 
                            : 'bg-white/10 text-amber-300 group-hover:bg-white/20'
                        }`}>
                          {isExamEvent(evt) && <span className="text-[9px]">🎓</span>}
                          <span>{shortDate}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium tabular-nums">
                          N° {String(absoluteIndex + 1).padStart(2, '0')}
                        </span>
                      </div>

                      <p className={`text-xs font-semibold truncate w-full ${isSelected ? 'text-amber-200' : 'text-slate-200'}`}>
                        {evt.title}
                      </p>
                    </button>
                  );
                })}
              </nav>

              {/* Dynamic Auto-Play Visual Progress Bar (6s) */}
              <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  key={`${activeEvent.id}-${viewMode}`}
                  initial={{ width: '0%' }}
                  animate={{ width: isAutoPlayActive ? '100%' : '0%' }}
                  transition={{ duration: 6, ease: 'linear' }}
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-300"
                />
              </div>
            </div>
          )}

          {/* MAIN EVENT SHOWCASE WITH FLUID FRAMER-MOTION TRANSITION */}
          {activeEvent ? (
            <div className="relative min-h-[170px] flex items-center">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={activeEvent.id}
                  custom={direction}
                  initial={{ opacity: 0, x: direction > 0 ? 16 : -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -16 : 16 }}
                  transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 lg:gap-6 items-center"
                >
                  
                  {/* LEFT DETAILS (7 Cols) */}
                  <div className="lg:col-span-7 space-y-2 sm:space-y-2.5">
                    
                    {/* Clean unboxed metadata row */}
                    <div className="flex items-center gap-2 flex-wrap text-xs text-slate-300">
                      {isExamEvent(activeEvent) && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-extrabold text-[10.5px] shadow-xs uppercase tracking-wider">
                          <span>🎓</span>
                          <span>Épreuve / Examen Officiel</span>
                        </span>
                      )}
                      <span className="font-bold text-amber-300 tracking-wide uppercase text-[11px]">
                        {activeEvent.category || 'Pédagogique'}
                      </span>
                      <span className="text-white/30" aria-hidden="true">·</span>
                      <span className="text-slate-300 text-[11px]">
                        {activeEvent.audience === 'PARENTS' 
                          ? 'Pour Parents d’élèves' 
                          : activeEvent.audience === 'STUDENTS' 
                            ? 'Pour Élèves & Candidats' 
                            : 'Tous publics'}
                      </span>
                      {viewMode === 'PAST' && (
                        <>
                          <span className="text-white/30" aria-hidden="true">·</span>
                          <span className="text-[10.5px] font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                            {temporalDetails.label || 'Événement Clôturé'}
                          </span>
                        </>
                      )}
                      {viewMode === 'UPCOMING' && timeRemaining.days <= 1 && !temporalDetails.isPast && !temporalDetails.isOngoing && (
                        <>
                          <span className="text-white/30" aria-hidden="true">·</span>
                          <span className="text-[10.5px] font-bold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1 animate-pulse">
                            <span>⚡</span>
                            <span>{timeRemaining.days === 0 ? 'Aujourd’hui (< 24h)' : 'Échéance Imminente (< 48h)'}</span>
                          </span>
                        </>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-serif text-lg sm:text-xl lg:text-2xl font-bold text-white tracking-tight leading-snug">
                      {activeEvent.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-[13px] text-slate-300 line-clamp-2 font-light leading-relaxed">
                      {activeEvent.description || 'Retrouvez toutes les informations et consignes officielles relatives à cet événement dans l’agenda de l’établissement.'}
                    </p>

                    {/* Event Metas in a compact row */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-300 pt-0.5 font-medium">
                      <div className="flex items-center gap-1.5 text-amber-300">
                        <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="capitalize">{formattedDate}</span>
                      </div>
                      {formattedTime && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                          <span>À {formattedTime}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{activeEvent.location || 'Campus Principal · Delmas 50'}</span>
                      </div>
                    </div>

                  </div>

                  {/* RIGHT COUNTDOWN & RECAP (5 Cols) */}
                  <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center">
                    
                    {viewMode === 'PAST' ? (
                      /* ARCHIVED PAST EVENT RECAP BOX - CLEAN RECAP, NEVER ZERO COUNTDOWN */
                      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 text-center w-full max-w-sm shadow-md space-y-2">
                        <div className="w-9 h-9 rounded-full bg-slate-700/60 text-slate-400 flex items-center justify-center mx-auto border border-slate-600">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-200">
                            Événement scolaire réalisé
                          </h4>
                          <p className="text-xs text-amber-300 font-semibold mt-0.5">
                            Clôturé le {formattedDate}
                          </p>
                        </div>
                        <p className="text-2xs text-slate-400 leading-relaxed font-light">
                          {isExamEvent(activeEvent)
                            ? 'Les évaluations se sont tenues selon le protocole académique et les résultats sont traités par le Conseil.'
                            : 'Cet événement officiel s’est déroulé sur le campus selon le calendrier officiel de l’établissement.'}
                        </p>
                        <div className="pt-1 flex flex-col gap-1.5">
                          {isExamEvent(activeEvent) ? (
                            <button
                              type="button"
                              onClick={() => onNavigate('resources', 'palmares')}
                              className="w-full py-1.5 px-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-2xs font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-1"
                            >
                              <span>Consulter le Tableau d'Honneur</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onNavigate('news')}
                              className="w-full py-1.5 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-2xs font-semibold transition-all cursor-pointer inline-flex items-center justify-center gap-1"
                            >
                              <span>Voir les actualités associées</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ) : temporalDetails.isOngoing ? (
                      /* ONGOING EVENT BANNER */
                      <div className="bg-emerald-500/20 border border-emerald-400/50 rounded-2xl p-4 text-center w-full max-w-sm shadow-lg ring-1 ring-emerald-400/30">
                        <CheckCircle2 className="w-7 h-7 text-emerald-400 mx-auto mb-1.5" />
                        <h4 className="font-bold text-sm text-white flex items-center justify-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-emerald-300">Événement en cours aujourd’hui</span>
                        </h4>
                        <p className="text-xs text-emerald-100 font-medium mt-1">
                          Bienvenue aux participants sur le campus de Delmas 50 !
                        </p>
                      </div>
                    ) : (
                      /* ACTIVE 4-BOX COUNTDOWN STRICTLY FOR UPCOMING EVENTS */
                      <div className="w-full max-w-md">
                        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center">
                          
                          {/* Days */}
                          <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-2 sm:p-2.5 border border-white/10 shadow-md">
                            <span className="block font-mono text-xl sm:text-2xl lg:text-3xl font-extrabold text-amber-400 tabular-nums leading-tight">
                              {String(timeRemaining.days).padStart(2, '0')}
                            </span>
                            <span className="text-[9.5px] sm:text-[10.5px] uppercase tracking-wider text-slate-400 font-bold block mt-0.5">
                              Jours
                            </span>
                          </div>

                          {/* Hours */}
                          <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-2 sm:p-2.5 border border-white/10 shadow-md">
                            <span className="block font-mono text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tabular-nums leading-tight">
                              {String(timeRemaining.hours).padStart(2, '0')}
                            </span>
                            <span className="text-[9.5px] sm:text-[10.5px] uppercase tracking-wider text-slate-400 font-bold block mt-0.5">
                              Heures
                            </span>
                          </div>

                          {/* Minutes */}
                          <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-2 sm:p-2.5 border border-white/10 shadow-md">
                            <span className="block font-mono text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tabular-nums leading-tight">
                              {String(timeRemaining.minutes).padStart(2, '0')}
                            </span>
                            <span className="text-[9.5px] sm:text-[10.5px] uppercase tracking-wider text-slate-400 font-bold block mt-0.5">
                              Minutes
                            </span>
                          </div>

                          {/* Seconds */}
                          <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-2 sm:p-2.5 border border-white/10 shadow-md">
                            <span className="block font-mono text-xl sm:text-2xl lg:text-3xl font-extrabold text-amber-300 tabular-nums leading-tight">
                              {String(timeRemaining.seconds).padStart(2, '0')}
                            </span>
                            <span className="text-[9.5px] sm:text-[10.5px] uppercase tracking-wider text-slate-400 font-bold block mt-0.5">
                              Secondes
                            </span>
                          </div>

                        </div>
                      </div>
                    )}

                  </div>

                </motion.div>
              </AnimatePresence>
            </div>
          ) : (
            /* DYNAMIC ANNOUNCEMENT CARD WHEN NO EVENTS MATCH VIEW/FILTER */
            <div className="w-full py-8 px-4 sm:px-8 text-center bg-white/5 border border-white/10 rounded-2xl space-y-3.5 my-1">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/15 text-amber-300 flex items-center justify-center mx-auto border border-amber-400/30 shadow-xs">
                <CalendarClock className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1 max-w-xl mx-auto">
                <h3 className="font-serif text-base sm:text-lg font-bold text-white tracking-tight">
                  {viewMode === 'UPCOMING'
                    ? (filterMode === 'EXAMS' 
                        ? 'Aucun examen officiel immédiat à afficher' 
                        : 'Prochaines échéances officielles en cours de publication')
                    : 'Aucun événement passé archivé'}
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed font-light">
                  {viewMode === 'UPCOMING'
                    ? (filterMode === 'EXAMS'
                        ? 'Toutes les épreuves antérieures ont été achevées. Les dates des prochains examens officiels seront publiées selon le calendrier du MENFP.'
                        : 'Tous les événements récents ont été menés à terme avec succès sur le campus. La Direction Pédagogique publiera très prochainement les nouvelles dates clés de l’année académique 2026–2027.')
                    : 'Les comptes-rendus et archives des cérémonies et évaluations scolaires seront répertoriés ici.'}
                </p>
              </div>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
                {viewMode === 'UPCOMING' && allPastEvents.length > 0 && (
                  <button
                    type="button"
                    onClick={() => { setViewMode('PAST'); setSelectedEventId(null); }}
                    className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Consulter les {allPastEvents.length} événements récents déjà réalisés</span>
                  </button>
                )}
                {filterMode === 'EXAMS' && (
                  <button
                    type="button"
                    onClick={() => { setFilterMode('ALL'); }}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5 border border-white/10"
                  >
                    <span>Afficher tous les événements</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onNavigate('events')}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5 border border-white/10"
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-300" />
                  <span>Ouvrir l’agenda scolaire complet</span>
                </button>
              </div>
            </div>
          )}

          {/* FOOTER ACTIONS BAR */}
          <div className="pt-2.5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            
            <div className="flex items-center gap-2 flex-wrap">
              {viewMode === 'UPCOMING' && activeEvent && (
                <>
                  {/* Google Calendar Link */}
                  <a
                    href={getGoogleCalendarUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors cursor-pointer"
                    title="Ajouter cet événement à mon calendrier personnel"
                  >
                    <CalendarPlus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ajouter à mon agenda Google</span>
                  </a>

                  {/* Quick Reminder Request Button */}
                  <button
                    type="button"
                    onClick={() => setIsReminderModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-200 font-medium transition-colors cursor-pointer border border-white/10"
                    title="Recevoir un rappel par Email ou WhatsApp"
                  >
                    <Bell className="w-3.5 h-3.5 text-amber-300" />
                    <span>M'envoyer un rappel</span>
                  </button>
                </>
              )}

              {/* Admin Direct Quick Edit */}
              {canManage && activeEvent && (
                <button
                  type="button"
                  onClick={handleOpenEditModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-900/60 hover:bg-blue-800 text-blue-200 font-semibold transition-colors cursor-pointer border border-blue-700/40"
                  title="Modifier directement cet événement"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Modifier (Admin)</span>
                </button>
              )}
            </div>

            {/* Link to Full School Calendar */}
            <button
              type="button"
              onClick={() => onNavigate('events')}
              className="inline-flex items-center gap-1.5 text-amber-300 hover:text-amber-200 font-semibold transition-colors cursor-pointer self-start sm:self-auto group"
            >
              <span>Consulter le calendrier scolaire complet</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>

          </div>

        </div>

      </div>

      {/* QUICK REMINDER FORM MODAL */}
      {isReminderModalOpen && activeEvent && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in text-slate-900">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                <h4 className="font-bold text-sm sm:text-base text-slate-900">
                  Rappel d'Événement Officiel
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsReminderModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs space-y-1">
              <span className="font-bold text-slate-900 block truncate">{activeEvent.title}</span>
              <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                <span>📅 {formattedDate}</span>
                {formattedTime && <span>🕒 À {formattedTime}</span>}
              </div>
            </div>

            <form onSubmit={handleSubmitReminder} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Adresse e-mail pour le rappel
                </label>
                <input
                  type="email"
                  value={reminderEmail}
                  onChange={(e) => setReminderEmail(e.target.value)}
                  placeholder="parent@exemple.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-900 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Ou Numéro WhatsApp (+509 Digicel/Natcom)
                </label>
                <input
                  type="tel"
                  value={reminderPhone}
                  onChange={(e) => setReminderPhone(e.target.value)}
                  placeholder="+509 3700-1234"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-900 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReminderModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReminder}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isSubmittingReminder ? 'Envoi...' : 'Confirmer le Rappel'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ADMIN IN-PLACE QUICK EDIT MODAL */}
      {isEditModalOpen && activeEvent && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in text-slate-900">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-900" />
                <h4 className="font-bold text-sm sm:text-base text-slate-900">
                  Modifier l'Événement Officiel
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Intitulé officiel de l'événement
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Date de début
                  </label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-900 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Heure
                  </label>
                  <input
                    type="time"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Lieu sur le campus
                </label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="Campus Principal · Delmas 50"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Catégorie
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as EventCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-900 outline-none cursor-pointer"
                  >
                    <option value="Pédagogique">Pédagogique</option>
                    <option value="Examen">Examen & Contrôle</option>
                    <option value="Férié">Férié officiel</option>
                    <option value="Réunion">Réunion Parents</option>
                    <option value="Culturel">Culturel & Sciences</option>
                    <option value="Sportif">Sportif</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Public cible
                  </label>
                  <select
                    value={editAudience}
                    onChange={(e) => setEditAudience(e.target.value as 'ALL' | 'PARENTS' | 'STUDENTS')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-900 outline-none cursor-pointer"
                  >
                    <option value="ALL">Tous publics</option>
                    <option value="PARENTS">Parents d'élèves</option>
                    <option value="STUDENTS">Élèves & Candidats</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Description officielle
                </label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-900 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isSavingEdit ? 'Enregistrement...' : 'Sauvegarder'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </section>
  );
};
