import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Clock, 
  MapPin, 
  Users, 
  GraduationCap, 
  Palmtree, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ChevronRight, 
  X, 
  Check, 
  CalendarDays,
  FileCheck,
  Send,
  Download,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  CalendarCheck
} from 'lucide-react';
import { SchoolEvent, EventCategory, AcademicEventType, User } from '../../types';
import { apiService } from '../../services/api';
import { eventNotificationService } from '../../services/eventNotificationService';
import { toast } from 'sonner';

interface CalendarManagerViewProps {
  currentUser: User | null;
}

export const CalendarManagerView: React.FC<CalendarManagerViewProps> = ({ currentUser }) => {
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [temporalFilter, setTemporalFilter] = useState<'ACTIVE_UPCOMING' | 'ALL' | 'PAST'>('ACTIVE_UPCOMING');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('2026-2027');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [visibilityFilter, setVisibilityFilter] = useState<'ALL' | 'VISIBLE' | 'HIDDEN'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [modalTab, setModalTab] = useState<'form' | 'preview'>('form');

  // Deletion Confirmation Modal
  const [eventToDelete, setEventToDelete] = useState<SchoolEvent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // New Academic Year Modal
  const [isNewYearModalOpen, setIsNewYearModalOpen] = useState(false);
  const [newYearInput, setNewYearInput] = useState('');

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    category: EventCategory;
    audience: 'ALL' | 'PARENTS' | 'STUDENTS';
    isPublic: boolean;
    academicYear: string;
    status: 'PUBLISHED' | 'DRAFT';
    indicatedDuration: string;
    displayOrder: number;
    eventType: AcademicEventType;
    controlNumber: string;
    periodLabel: string;
  }>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: 'Campus Collège Isaac Newton, Delmas 50',
    category: 'Contrôle',
    audience: 'ALL',
    isPublic: true,
    academicYear: '2026-2027',
    status: 'PUBLISHED',
    indicatedDuration: '',
    displayOrder: 1,
    eventType: 'CONTROLE_PERIODE',
    controlNumber: '1',
    periodLabel: '',
  });

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      // Include drafts for administrators
      const data = await apiService.getEvents({ includeDrafts: true });
      setEvents(data);
    } catch (e: any) {
      toast.error('Erreur lors du chargement des dates du calendrier : ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    const handleUpdated = () => loadEvents();
    window.addEventListener('cin:events-updated', handleUpdated);
    return () => window.removeEventListener('cin:events-updated', handleUpdated);
  }, []);

  // Distinct academic years list
  const availableAcademicYears = useMemo(() => {
    const set = new Set<string>();
    set.add('2026-2027');
    set.add('2027-2028');
    events.forEach(e => {
      if (e.academicYear) set.add(e.academicYear);
    });
    return Array.from(set).sort();
  }, [events]);

  // Counts of events by temporal state (Active/Upcoming vs Elapsed/Past)
  const temporalCounts = useMemo(() => {
    let activeUpcoming = 0;
    let past = 0;
    events.forEach((e) => {
      const st = eventNotificationService.getEventTemporalStatus(e);
      if (st === 'PAST') {
        past++;
      } else {
        activeUpcoming++;
      }
    });
    return { activeUpcoming, past, total: events.length };
  }, [events]);

  // Filtered & Chronologically Sorted Events
  const filteredEvents = useMemo(() => {
    const list = events.filter(e => {
      // Academic Year Filter
      const evtYear = e.academicYear || '2026-2027';
      if (selectedAcademicYear !== 'ALL' && evtYear !== selectedAcademicYear) {
        return false;
      }

      // Temporal Filter (Active/Upcoming vs Past vs All)
      if (temporalFilter !== 'ALL') {
        const temporalStatus = eventNotificationService.getEventTemporalStatus(e);
        if (temporalFilter === 'ACTIVE_UPCOMING' && temporalStatus === 'PAST') {
          return false;
        }
        if (temporalFilter === 'PAST' && temporalStatus !== 'PAST') {
          return false;
        }
      }

      // Status Filter
      if (statusFilter === 'PUBLISHED' && e.status === 'DRAFT') return false;
      if (statusFilter === 'DRAFT' && e.status !== 'DRAFT') return false;

      // Visibility Filter
      if (visibilityFilter === 'VISIBLE' && e.isPublic === false) return false;
      if (visibilityFilter === 'HIDDEN' && e.isPublic !== false) return false;

      // Category Filter
      if (categoryFilter !== 'ALL' && e.category !== categoryFilter) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = e.title?.toLowerCase().includes(q);
        const matchesDesc = e.description?.toLowerCase().includes(q);
        const matchesLoc = e.location?.toLowerCase().includes(q);
        const matchesDuration = e.indicatedDuration?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesLoc && !matchesDuration) return false;
      }

      return true;
    });

    // Chronological Sort
    return list.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [events, selectedAcademicYear, temporalFilter, statusFilter, visibilityFilter, categoryFilter, searchQuery]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingEventId(null);
    setFormData({
      title: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      location: 'Campus Collège Isaac Newton, Delmas 50',
      category: 'Contrôle',
      audience: 'ALL',
      isPublic: true,
      academicYear: selectedAcademicYear !== 'ALL' ? selectedAcademicYear : '2026-2027',
      status: 'PUBLISHED',
      indicatedDuration: '',
      displayOrder: events.length + 1,
      eventType: 'CONTROLE_PERIODE',
      controlNumber: '1',
      periodLabel: '',
    });
    setModalTab('form');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (e: SchoolEvent) => {
    setEditingEventId(e.id);
    const start = e.startDate ? e.startDate.split('T')[0] : '';
    const end = e.endDate ? e.endDate.split('T')[0] : '';

    setFormData({
      title: e.title || '',
      description: e.description || '',
      startDate: start,
      endDate: end,
      location: e.location || 'Campus Collège Isaac Newton, Delmas 50',
      category: e.category || 'Contrôle',
      audience: e.audience || 'ALL',
      isPublic: e.isPublic !== false,
      academicYear: e.academicYear || '2026-2027',
      status: e.status || 'PUBLISHED',
      indicatedDuration: e.indicatedDuration || '',
      displayOrder: e.displayOrder ?? 1,
      eventType: e.eventType || 'CONTROLE_PERIODE',
      controlNumber: e.controlNumber ? String(e.controlNumber) : '',
      periodLabel: e.periodLabel || '',
    });
    setModalTab('form');
    setIsModalOpen(true);
  };

  // Quick Toggle Status (Publish / Draft)
  const handleToggleStatus = async (e: SchoolEvent) => {
    const newStatus = e.status === 'DRAFT' ? 'PUBLISHED' : 'DRAFT';
    try {
      await apiService.updateEvent(e.id, { status: newStatus });
      setEvents(prev => prev.map(item => item.id === e.id ? { ...item, status: newStatus } : item));
      toast.success(newStatus === 'PUBLISHED' ? `« ${e.title} » a été publié sur le site.` : `« ${e.title} » est maintenant enregistré en brouillon.`);
    } catch (err: any) {
      toast.error('Impossible de modifier le statut : ' + err.message);
    }
  };

  // Quick Toggle Visibility (Public / Hidden)
  const handleToggleVisibility = async (e: SchoolEvent) => {
    const newVis = e.isPublic === false ? true : false;
    try {
      await apiService.updateEvent(e.id, { isPublic: newVis });
      setEvents(prev => prev.map(item => item.id === e.id ? { ...item, isPublic: newVis } : item));
      toast.success(newVis ? `« ${e.title} » est désormais visible publiquement.` : `« ${e.title} » est masqué aux visiteurs.`);
    } catch (err: any) {
      toast.error('Erreur lors du changement de visibilité : ' + err.message);
    }
  };

  // Submit Save Form
  const handleSubmitForm = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Le titre de l’entrée est obligatoire.');
      return;
    }
    if (!formData.startDate) {
      toast.error('La date de début est requise.');
      return;
    }

    setIsSaving(true);
    try {
      const payload: Partial<SchoolEvent> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate.includes('T') ? formData.startDate : `${formData.startDate}T08:00:00Z`,
        endDate: formData.endDate ? (formData.endDate.includes('T') ? formData.endDate : `${formData.endDate}T17:00:00Z`) : undefined,
        location: formData.location.trim() || 'Campus Collège Isaac Newton, Delmas 50',
        category: formData.category,
        audience: formData.audience,
        isPublic: formData.isPublic,
        academicYear: formData.academicYear.trim() || '2026-2027',
        status: formData.status,
        indicatedDuration: formData.indicatedDuration.trim() || undefined,
        displayOrder: Number(formData.displayOrder) || 1,
        eventType: formData.eventType,
        controlNumber: formData.controlNumber ? (Number(formData.controlNumber) as any) : undefined,
        periodLabel: formData.periodLabel.trim() || undefined,
      };

      if (editingEventId) {
        const updated = await apiService.updateEvent(editingEventId, payload);
        if (updated) {
          setEvents(prev => prev.map(item => item.id === editingEventId ? updated : item));
          toast.success(`L’entrée « ${updated.title} » a été modifiée avec succès.`);
        }
      } else {
        const created = await apiService.createEvent(payload as any);
        if (created) {
          setEvents(prev => [created, ...prev]);
          toast.success(`Nouvelle date ajoutée au calendrier (${created.academicYear}).`);
        }
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error('Erreur lors de l’enregistrement : ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    setIsDeleting(true);
    try {
      await apiService.deleteEvent(eventToDelete.id);
      setEvents(prev => prev.filter(e => e.id !== eventToDelete.id));
      toast.success(`L'entrée « ${eventToDelete.title} » a été définitivement supprimée.`);
      setEventToDelete(null);
    } catch (err: any) {
      toast.error('Erreur lors de la suppression : ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Add New Academic Year
  const handleAddNewYear = () => {
    const cleanYear = newYearInput.trim();
    if (!cleanYear || !cleanYear.includes('-')) {
      toast.error('Veuillez renseigner un format d’année valide (ex: 2027-2028).');
      return;
    }
    setSelectedAcademicYear(cleanYear);
    setIsNewYearModalOpen(false);
    setNewYearInput('');
    toast.success(`Année académique ${cleanYear} sélectionnée. Vous pouvez maintenant y planifier les dates.`);
  };

  // Formatter for French Date Range
  const formatFrenchDateRange = (startDateStr: string, endDateStr?: string) => {
    if (!startDateStr) return 'Date à fixer';
    const s = new Date(startDateStr);
    const sStr = s.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    if (!endDateStr) return sStr;
    const e = new Date(endDateStr);
    if (s.toDateString() === e.toDateString()) return sStr;
    const eStr = e.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    return `Du ${s.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} au ${eStr}`;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* 1. Header & Controls Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-900 text-amber-300">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-slate-900 text-base sm:text-lg">
                  Gestion du Calendrier Académique & Agenda
                </h2>
                <p className="text-xs text-slate-500">
                  Planifiez, publiez et modifiez les contrôles, examens, congés et fêtes sans toucher au code.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => setIsNewYearModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
              title="Ajouter une prochaine année académique (ex: 2027-2028)"
            >
              <Plus className="w-3.5 h-3.5 text-blue-900" />
              <span>Prochaine Année</span>
            </button>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Ajouter une Date</span>
            </button>
          </div>
        </div>

        {/* Quick Segmented Filter for Temporal Status (Active/Upcoming vs All vs Past) */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100">
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs">
            <button
              type="button"
              onClick={() => setTemporalFilter('ACTIVE_UPCOMING')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                temporalFilter === 'ACTIVE_UPCOMING'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>En cours & À venir</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                temporalFilter === 'ACTIVE_UPCOMING' ? 'bg-blue-800 text-amber-300' : 'bg-slate-200 text-slate-700'
              }`}>
                {temporalCounts.activeUpcoming}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTemporalFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                temporalFilter === 'ALL'
                  ? 'bg-blue-900 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Toutes les dates</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                temporalFilter === 'ALL' ? 'bg-blue-800 text-amber-300' : 'bg-slate-200 text-slate-700'
              }`}>
                {temporalCounts.total}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTemporalFilter('PAST')}
              className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                temporalFilter === 'PAST'
                  ? 'bg-slate-800 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Événements écoulés / Archivés</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                temporalFilter === 'PAST' ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-700'
              }`}>
                {temporalCounts.past}
              </span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Affichage : <strong className="text-slate-800">{filteredEvents.length}</strong> date(s)
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          
          {/* 1. Selector Academic Year */}
          <div>
            <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Année Académique :
            </label>
            <select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className="w-full py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:bg-white focus:border-blue-900"
            >
              <option value="ALL">Toutes les années ({events.length})</option>
              {availableAcademicYears.map(yr => (
                <option key={yr} value={yr}>
                  Année {yr}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Status Filter (Published / Draft) */}
          <div>
            <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Statut :
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:bg-white focus:border-blue-900"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="PUBLISHED">Publié uniquement</option>
              <option value="DRAFT">Brouillon uniquement</option>
            </select>
          </div>

          {/* 3. Visibility Filter */}
          <div>
            <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Visibilité :
            </label>
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value as any)}
              className="w-full py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:bg-white focus:border-blue-900"
            >
              <option value="ALL">Toutes visibilités</option>
              <option value="VISIBLE">Visible au public</option>
              <option value="HIDDEN">Masqué / Interne</option>
            </select>
          </div>

          {/* 4. Category Filter */}
          <div>
            <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Catégorie :
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:bg-white focus:border-blue-900"
            >
              <option value="ALL">Toutes catégories</option>
              <option value="Contrôle">Contrôles Trimestriels</option>
              <option value="Examen">Examens & Épreuves</option>
              <option value="Vacances">Vacances & Congés</option>
              <option value="Pédagogique">Pédagogique & Remises</option>
              <option value="Culturel">Culturel & Célébrations</option>
              <option value="Réunion">Réunions Parents</option>
              <option value="Sportif">Sportif</option>
            </select>
          </div>

          {/* 5. Search Bar */}
          <div>
            <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Recherche rapide :
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ex : Troisième, 9e AF..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:border-blue-900"
              />
            </div>
          </div>

        </div>

      </div>

      {/* 2. Official Milestones Summary Banner (Highlighting the 4 Controls) */}
      <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-blue-950 text-xs space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="font-bold flex items-center gap-1.5 text-blue-900">
            <CalendarCheck className="w-4 h-4 text-amber-600" />
            <span>Calendrier Officiel Préchargé · 4 Périodes de Contrôles & Durées Validées ({selectedAcademicYear})</span>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-blue-200/80 text-blue-900 font-mono text-[10px] font-bold">
            {filteredEvents.length} date(s) affichée(s)
          </span>
        </div>
        <p className="text-slate-600 leading-relaxed text-[11px]">
          Conformément aux instructions officielles du collège, la période validée du 3e contrôle est strictly fixée du <strong>2 mars au 30 avril 2027 (51 jours)</strong>. Toutes les durées indiquées sont strictement préservées sans recalcul automatique.
        </p>
      </div>

      {/* 3. Chronological Events List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs divide-y divide-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <div className="w-6 h-6 border-2 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Chargement des échéances académiques...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-serif font-bold text-slate-700 text-sm">Aucune date ne correspond aux critères sélectionnés.</p>
            <p className="text-xs">Cliquez sur « Ajouter une Date » pour planifier un nouvel événement pour l'année {selectedAcademicYear}.</p>
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const isDraft = evt.status === 'DRAFT';
            const isHidden = evt.isPublic === false;
            const isControl = evt.category === 'Contrôle' || evt.eventType === 'CONTROLE_PERIODE';
            const temporalDetails = eventNotificationService.getEventTemporalDetails(evt);

            return (
              <div 
                key={evt.id} 
                className={`p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors ${
                  isDraft ? 'bg-amber-50/30 hover:bg-amber-50/50' : temporalDetails.isPast ? 'bg-slate-50/50 hover:bg-slate-50 opacity-90' : 'hover:bg-slate-50/70'
                }`}
              >
                {/* Left: Date details */}
                <div className="flex items-start gap-3 min-w-0">
                  
                  {/* Calendar day badge */}
                  <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 border shadow-2xs ${
                    temporalDetails.isPast
                      ? 'bg-slate-700 text-slate-200 border-slate-800'
                      : isControl
                      ? 'bg-blue-900 text-white border-blue-950'
                      : evt.category === 'Examen'
                      ? 'bg-rose-700 text-white border-rose-800'
                      : evt.category === 'Vacances'
                      ? 'bg-amber-500 text-slate-950 border-amber-600'
                      : 'bg-slate-800 text-white border-slate-900'
                  }`}>
                    <span className="font-mono font-bold text-sm leading-none">
                      {evt.startDate ? new Date(evt.startDate).getDate() : '--'}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-amber-300 font-mono mt-0.5">
                      {evt.startDate ? new Date(evt.startDate).toLocaleDateString('fr-FR', { month: 'short' }) : 'Date'}
                    </span>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className={`font-bold text-xs sm:text-sm truncate ${temporalDetails.isPast ? 'text-slate-700' : 'text-slate-900'}`}>
                        {evt.title}
                      </h3>

                      {/* Temporal Status Badge (Terminé / En cours / Imminent / À venir) */}
                      {temporalDetails.isPast ? (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium text-[9px] flex items-center gap-1" title="Cet événement est terminé et archivé">
                          <Clock className="w-2.5 h-2.5 text-slate-400" />
                          <span>{temporalDetails.label}</span>
                        </span>
                      ) : temporalDetails.isOngoing ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[9px] flex items-center gap-1 animate-pulse" title="Événement actuellement en cours sur le campus">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          <span>{temporalDetails.label}</span>
                        </span>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full border text-[9px] flex items-center gap-1 ${temporalDetails.badgeClass}`}>
                          <Calendar className="w-2.5 h-2.5" />
                          <span>{temporalDetails.label}</span>
                        </span>
                      )}

                      {/* Status Badges */}
                      {isDraft ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[9px] uppercase tracking-wider">
                          Brouillon (Non publié)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" />
                          <span>Publié</span>
                        </span>
                      )}

                      {isHidden && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-bold text-[9px]">
                          Masqué
                        </span>
                      )}

                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[9.5px]">
                        {evt.category}
                      </span>

                      {evt.academicYear && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-900 border border-blue-200 font-mono text-[9px]">
                          {evt.academicYear}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed max-w-3xl line-clamp-2">
                      {evt.description}
                    </p>

                    <div className="flex items-center gap-3 flex-wrap text-[11px] text-slate-500 font-mono pt-0.5">
                      <span className="font-semibold text-slate-800">
                        {formatFrenchDateRange(evt.startDate, evt.endDate)}
                      </span>

                      {evt.indicatedDuration && (
                        <span className="px-2 py-0.2 rounded-md bg-amber-50 text-amber-900 font-sans font-bold border border-amber-200/80 text-[10px]">
                          Durée : {evt.indicatedDuration}
                        </span>
                      )}

                      <span>·</span>
                      <span className="truncate max-w-[200px] text-slate-400">
                        {evt.location}
                      </span>
                    </div>
                  </div>

                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                  
                  {/* Toggle Draft/Published */}
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(evt)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
                      isDraft
                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                    title={isDraft ? "Publier cette date sur le site public" : "Passer en brouillon (ne pas afficher au public)"}
                  >
                    {isDraft ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Publier</span>
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                        <span>Brouillon</span>
                      </>
                    )}
                  </button>

                  {/* Toggle Visibility (Hide/Show) */}
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility(evt)}
                    className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                      isHidden 
                        ? 'bg-amber-50 text-amber-800 border-amber-200' 
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                    title={isHidden ? "Rendre visible aux familles" : "Masquer aux familles"}
                  >
                    {isHidden ? <EyeOff className="w-4 h-4 text-amber-700" /> : <Eye className="w-4 h-4" />}
                  </button>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(evt)}
                    className="p-1.5 rounded-xl bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
                    title="Modifier l'événement"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete with Confirmation */}
                  <button
                    type="button"
                    onClick={() => setEventToDelete(evt)}
                    className="p-1.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
                    title="Supprimer définitivement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. MODAL D'AJOUT / MODIFICATION D'UNE DATE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-hidden">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-scale-in">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/90 flex items-center justify-between shrink-0">
              <div className="space-y-0.5">
                <h3 className="font-serif font-bold text-slate-900 text-base sm:text-lg">
                  {editingEventId ? 'Modifier l’Échéance Calendaire' : 'Planifier une Nouvelle Date'}
                </h3>
                <p className="text-xs text-slate-500">
                  Cette date sera automatiquement stockée par catégorie et année académique.
                </p>
              </div>

              {/* Form / Preview Tabs */}
              <div className="flex items-center gap-2">
                <div className="inline-flex p-1 bg-slate-200/70 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setModalTab('form')}
                    className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                      modalTab === 'form' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Formulaire
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalTab('preview')}
                    className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                      modalTab === 'preview' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Prévisualisation
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            {modalTab === 'form' ? (
              <form onSubmit={handleSubmitForm} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1 text-xs sm:text-sm custom-scrollbar">
                  
                  {/* Row 1: Academic Year & Title */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1 text-xs">
                        Année Académique : *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.academicYear}
                        onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                        placeholder="Ex : 2026-2027"
                        className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:bg-white focus:border-blue-900 font-mono font-bold"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-semibold text-slate-700 block mb-1 text-xs">
                        Titre de l'échéance / événement : *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Ex : Examens du Premier Contrôle, Remise des carnets..."
                        className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:bg-white focus:border-blue-900 font-medium"
                      />
                    </div>
                  </div>

                  {/* Row 2: Category, Event Type & Control Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1 text-xs">
                        Catégorie principale :
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                        className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:bg-white focus:border-blue-900 font-semibold"
                      >
                        <option value="Contrôle">Contrôle Trimestriel</option>
                        <option value="Examen">Examen & Épreuve</option>
                        <option value="Vacances">Vacances Scolaires</option>
                        <option value="Pédagogique">Pédagogique / Remise</option>
                        <option value="Culturel">Culturel & Célébration</option>
                        <option value="Réunion">Réunion des Parents</option>
                        <option value="Sportif">Sportif</option>
                        <option value="Férié">Jour Férié National</option>
                        <option value="Officiel">Échéance Officielle MENFP</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1 text-xs">
                        Type d'échéance :
                      </label>
                      <select
                        value={formData.eventType}
                        onChange={(e) => setFormData({ ...formData, eventType: e.target.value as any })}
                        className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:bg-white focus:border-blue-900"
                      >
                        <option value="CONTROLE_PERIODE">Période de Contrôle</option>
                        <option value="EXAMEN">Semaine d'Examens</option>
                        <option value="REMISE_NOTES">Remise des Carnets / Notes</option>
                        <option value="VACANCES">Vacances / Congés</option>
                        <option value="REPRISE">Reprise des Cours</option>
                        <option value="EVENEMENT_IMPORTANT">Événement Important / Fête</option>
                        <option value="FIN_CYCLE">Examen de Fin de Cycle (9e AF / NS4)</option>
                        <option value="AUTRE">Autre échéance</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1 text-xs">
                        N° du Contrôle (si applicable) :
                      </label>
                      <select
                        value={formData.controlNumber}
                        onChange={(e) => setFormData({ ...formData, controlNumber: e.target.value })}
                        className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:bg-white focus:border-blue-900"
                      >
                        <option value="">Aucun</option>
                        <option value="1">1er Contrôle</option>
                        <option value="2">2e Contrôle</option>
                        <option value="3">3e Contrôle (Période Validée)</option>
                        <option value="4">4e Contrôle</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 3: Dates & Durée Indiquée */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1 text-xs">
                        Date de début : *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:bg-white focus:border-blue-900 font-mono"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1 text-xs">
                        Date de fin (optionnelle) :
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:bg-white focus:border-blue-900 font-mono"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1 text-xs">
                        Durée indiquée (texte exact) :
                      </label>
                      <input
                        type="text"
                        value={formData.indicatedDuration}
                        onChange={(e) => setFormData({ ...formData, indicatedDuration: e.target.value })}
                        placeholder="Ex : 49 jours, 51 jours..."
                        className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:bg-white focus:border-blue-900 font-medium"
                      />
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Conserve la durée exacte du document source.
                      </span>
                    </div>
                  </div>

                  {/* Row 4: Location & Audience */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1 text-xs">
                        Lieu / Campus :
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Campus Collège Isaac Newton, Delmas 50"
                        className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:bg-white focus:border-blue-900"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1 text-xs">
                        Public visé :
                      </label>
                      <select
                        value={formData.audience}
                        onChange={(e) => setFormData({ ...formData, audience: e.target.value as any })}
                        className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:bg-white focus:border-blue-900"
                      >
                        <option value="ALL">Tout le collège (Élèves, Parents, Profs)</option>
                        <option value="STUDENTS">Élèves uniquement</option>
                        <option value="PARENTS">Parents d'élèves</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1 text-xs">
                      Description & Précisions :
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Détails du déroulement, consignes aux familles, matières concernées..."
                      className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:bg-white focus:border-blue-900"
                    />
                  </div>

                  {/* Status & Visibility Switches */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-slate-800 text-xs block">Statut de publication :</span>
                        <span className="text-[11px] text-slate-500">
                          {formData.status === 'PUBLISHED' ? 'Publié (visible dès validation)' : 'Brouillon (masqué au public)'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, status: formData.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          formData.status === 'PUBLISHED'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-500 text-slate-950 font-bold'
                        }`}
                      >
                        {formData.status === 'PUBLISHED' ? 'Publié' : 'Brouillon'}
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-slate-800 text-xs block">Visibilité publique :</span>
                        <span className="text-[11px] text-slate-500">
                          {formData.isPublic ? 'Affiché sur le calendrier' : 'Masqué (interne direction)'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          formData.isPublic
                            ? 'bg-blue-900 text-white'
                            : 'bg-slate-300 text-slate-700'
                        }`}
                      >
                        {formData.isPublic ? 'Visible' : 'Masqué'}
                      </button>
                    </div>
                  </div>

                </div>

                {/* Footer Controls */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/90 flex items-center justify-end gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Enregistrement...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 text-amber-400" />
                        <span>{editingEventId ? 'Mettre à jour la date' : 'Enregistrer la date'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* LIVE PREVIEW TAB */
              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 text-xs">
                  <span className="font-bold block mb-0.5">Aperçu en temps réel :</span>
                  Voici comment cette échéance s’affichera sur la page publique « Calendrier scolaire & Agenda » du collège.
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-300 shadow-md space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold text-xs">
                      {formData.category} · {formData.academicYear}
                    </span>
                    {formData.status === 'DRAFT' && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px]">
                        Brouillon (Non visible aux familles)
                      </span>
                    )}
                  </div>

                  <h4 className="font-serif font-bold text-lg text-slate-900">
                    {formData.title || 'Titre de l’événement'}
                  </h4>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {formData.description || 'Aucune description fournie.'}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-500 font-mono">
                    <span className="font-bold text-slate-900">
                      {formatFrenchDateRange(formData.startDate, formData.endDate)}
                    </span>
                    {formData.indicatedDuration && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 font-bold border border-amber-200">
                        Durée : {formData.indicatedDuration}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setModalTab('form')}
                    className="px-4 py-2 rounded-xl bg-blue-900 text-white text-xs font-bold cursor-pointer"
                  >
                    Revenir au formulaire pour valider
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 5. MODAL DE CONFIRMATION DE SUPPRESSION */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-in">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-slate-900 text-base">
                  Confirmer la suppression
                </h3>
                <p className="text-xs text-slate-500">
                  Cette action retirera la date du calendrier officiel.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-900">{eventToDelete.title}</p>
              <p className="text-slate-500 font-mono">{formatFrenchDateRange(eventToDelete.startDate, eventToDelete.endDate)}</p>
              <p className="text-slate-600 text-[11px]">{eventToDelete.academicYear || '2026-2027'} · {eventToDelete.category}</p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer cette date ? Cette opération est irréversible.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setEventToDelete(null)}
                className="px-4 py-2 rounded-xl text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                Annuler
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Suppression...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Supprimer définitivement</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL CRÉER UNE NOUVELLE ANNÉE ACADÉMIQUE */}
      {isNewYearModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="font-serif font-bold text-slate-900 text-base">
                  Nouvelle Année Académique
                </h3>
                <p className="text-xs text-slate-500">
                  Préparez à l'avance les dates pour les futures promotions du collège.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewYearModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1.5 text-xs">
                Année scolaire (format standard YYYY-YYYY) :
              </label>
              <input
                type="text"
                value={newYearInput}
                onChange={(e) => setNewYearInput(e.target.value)}
                placeholder="Ex : 2027-2028, 2028-2029"
                className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono font-bold focus:bg-white focus:border-blue-900"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Le collège peut ajouter et publier les calendriers des années suivantes sans aucune modification du code source.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsNewYearModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleAddNewYear}
                className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Confirmer l'année
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
