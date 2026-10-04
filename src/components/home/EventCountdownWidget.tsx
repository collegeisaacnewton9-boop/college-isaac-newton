import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Timer, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CalendarPlus, 
  ArrowRight, 
  Sparkles, 
  ChevronRight, 
  Bell,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Edit3
} from 'lucide-react';
import { SchoolEvent, User } from '../../types';
import { apiService } from '../../services/api';
import { INITIAL_EVENTS } from '../../data/mockData';

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
  const [now, setNow] = useState<Date>(new Date());

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

  // Filter and sort future events
  const upcomingEvents = useMemo(() => {
    return events
      .filter((e) => {
        if (!e.startDate) return false;
        const eventDate = new Date(e.startDate).getTime();
        // Allow events within the last 2 hours or in the future
        return eventDate > now.getTime() - 2 * 60 * 60 * 1000;
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [events, now]);

  // Active event to display
  const activeEvent = useMemo(() => {
    if (selectedEventId) {
      const found = upcomingEvents.find(e => e.id === selectedEventId);
      if (found) return found;
    }
    return upcomingEvents[0] || events[0] || null;
  }, [upcomingEvents, selectedEventId, events]);

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

  if (!activeEvent) return null;

  // Format date nicely in French
  const eventDateObj = new Date(activeEvent.startDate);
  const formattedDate = !isNaN(eventDateObj.getTime())
    ? eventDateObj.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : activeEvent.startDate;

  const formattedTime = !isNaN(eventDateObj.getTime())
    ? eventDateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : '';

  // Google Calendar Link generator
  const getGoogleCalendarUrl = () => {
    if (!activeEvent.startDate) return '#';
    const startIso = new Date(activeEvent.startDate).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endIso = activeEvent.endDate 
      ? new Date(activeEvent.endDate).toISOString().replace(/-|:|\.\d\d\d/g, '')
      : startIso;
    const details = encodeURIComponent(`${activeEvent.description || ''}\n\nLieu: ${activeEvent.location || 'Collège Isaac Newton, Delmas 50'}`);
    const location = encodeURIComponent(activeEvent.location || 'Collège Isaac Newton, Delmas 50, Port-au-Prince, Haïti');
    const title = encodeURIComponent(activeEvent.title);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
  };

  return (
    <section 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 sm:-mt-4 relative z-10"
      aria-label="Prochains événements et compte à rebours"
    >
      <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-blue-900/40 shadow-xl overflow-hidden text-white">
        
        {/* Glow ambient background elements */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-12 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative p-5 sm:p-7 lg:p-8">
          
          {/* TOP BAR: Badge & Tab Selector for Upcoming Events */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 mb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20">
                <Timer className="w-5 h-5 animate-pulse" />
              </span>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300 font-bold block">
                  Événement Officiel à Venir
                </span>
                <span className="text-xs text-slate-300">
                  Collège Isaac Newton · Année Académique 2026-2027
                </span>
              </div>
            </div>

            {/* UPCOMING EVENTS QUICK SWITCHER */}
            {upcomingEvents.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[11px] text-slate-400 uppercase font-semibold mr-1 shrink-0 hidden sm:inline">
                  Autres dates :
                </span>
                {upcomingEvents.slice(0, 4).map((evt) => (
                  <button
                    key={evt.id}
                    type="button"
                    onClick={() => setSelectedEventId(evt.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                      activeEvent.id === evt.id
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    {evt.title.length > 25 ? evt.title.substring(0, 25) + '…' : evt.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* MAIN GRID: Event Details on Left, 4 Countdown Digit Boxes on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* LEFT DETAILS (7 Cols) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {activeEvent.category || 'Pédagogique'}
                </span>
                {activeEvent.audience && activeEvent.audience !== 'ALL' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-slate-200">
                    Pour : {activeEvent.audience === 'PARENTS' ? 'Parents d’élèves' : 'Élèves & Candidats'}
                  </span>
                )}
              </div>

              <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight leading-snug">
                {activeEvent.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 font-light leading-relaxed">
                {activeEvent.description || 'Retrouvez toutes les informations et consignes officielles relatives à cet événement dans l’agenda de l’établissement.'}
              </p>

              {/* Event Metas */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1 font-medium">
                <div className="flex items-center gap-1.5 text-amber-300">
                  <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="capitalize">{formattedDate}</span>
                </div>
                {formattedTime && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-300 shrink-0" />
                    <span>À {formattedTime}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{activeEvent.location || 'Campus Principal · Delmas 50'}</span>
                </div>
              </div>
            </div>

            {/* RIGHT COUNTDOWN DIGITS (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center">
              
              {timeRemaining.isPast ? (
                <div className="bg-emerald-500/20 border border-emerald-400/40 rounded-2xl p-5 text-center w-full max-w-sm">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-1.5" />
                  <h4 className="font-bold text-base text-white">Événement en cours</h4>
                  <p className="text-xs text-emerald-200 mt-0.5">
                    Bienvenue aux participants sur le campus de Delmas 50 !
                  </p>
                </div>
              ) : (
                <div className="w-full max-w-md">
                  <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
                    
                    {/* Days */}
                    <div className="bg-slate-800/80 backdrop-blur-md rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border border-white/10 shadow-lg">
                      <span className="block font-mono text-2xl sm:text-3xl lg:text-4xl font-extrabold text-amber-400 tabular-nums">
                        {String(timeRemaining.days).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-bold mt-0.5 block">
                        Jours
                      </span>
                    </div>

                    {/* Hours */}
                    <div className="bg-slate-800/80 backdrop-blur-md rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border border-white/10 shadow-lg">
                      <span className="block font-mono text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tabular-nums">
                        {String(timeRemaining.hours).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-bold mt-0.5 block">
                        Heures
                      </span>
                    </div>

                    {/* Minutes */}
                    <div className="bg-slate-800/80 backdrop-blur-md rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border border-white/10 shadow-lg">
                      <span className="block font-mono text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tabular-nums">
                        {String(timeRemaining.minutes).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-bold mt-0.5 block">
                        Minutes
                      </span>
                    </div>

                    {/* Seconds */}
                    <div className="bg-slate-800/80 backdrop-blur-md rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border border-white/10 shadow-lg">
                      <span className="block font-mono text-2xl sm:text-3xl lg:text-4xl font-extrabold text-amber-300 tabular-nums">
                        {String(timeRemaining.seconds).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-bold mt-0.5 block">
                        Secondes
                      </span>
                    </div>

                  </div>

                  <p className="text-[11px] text-center lg:text-right text-slate-400 mt-2 font-mono">
                    Compte à rebours dynamique · Synchronisé avec PostgreSQL
                  </p>
                </div>
              )}

            </div>

          </div>

          {/* FOOTER ACTIONS BAR */}
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <a
                href={getGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors cursor-pointer"
                title="Ajouter cet événement à mon calendrier personnel"
              >
                <CalendarPlus className="w-4 h-4 text-amber-400" />
                <span>Ajouter à mon agenda Google</span>
              </a>

              {canManage && (
                <button
                  type="button"
                  onClick={() => onNavigate('admin', 'events')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-900/60 hover:bg-blue-800 text-blue-200 font-semibold transition-colors cursor-pointer"
                  title="Gérer ou modifier les événements"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Modifier les dates (Admin)</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => onNavigate('calendar')}
              className="inline-flex items-center gap-1.5 text-amber-300 hover:text-amber-200 font-semibold transition-colors cursor-pointer group"
            >
              <span>Consulter le calendrier scolaire complet</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
