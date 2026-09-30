import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileCheck, 
  Calendar, 
  Newspaper, 
  Settings, 
  Shield, 
  Plus, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Trash2, 
  AlertTriangle,
  Download,
  LogOut,
  ChevronRight,
  BookOpen,
  Mail,
  Phone,
  Printer,
  Sparkles,
  ExternalLink,
  RefreshCw,
  MessageSquare,
  Award,
  Globe,
  Check,
  Send,
  Sliders,
  Bell,
  Building,
  GraduationCap,
  Github,
  KeyRound,
  UserCheck
} from 'lucide-react';
import { 
  User, 
  Role,
  AdmissionApplication, 
  AdmissionStatus, 
  NewsArticle, 
  SchoolEvent,
  ContactMessage,
  SiteSettings
} from '../types';
import { apiService } from '../services/api';
import { INITIAL_USERS } from '../data/mockData';
import { SettingsView } from '../components/admin/SettingsView';
import { AccessControlView } from '../components/admin/AccessControlView';
import { ROLE_PERMISSIONS } from '../data/rolePermissions';

interface AdminDashboardPageProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onNavigate?: (page: string, subSection?: string) => void;
  onUserChange?: (user: User) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  currentUser,
  onOpenAuth,
  onLogout,
  onNavigate,
  onUserChange,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'admissions' | 'news' | 'events' | 'messages' | 'cms' | 'users'>('overview');
  
  // Data states
  const [admissions, setAdmissions] = useState<AdmissionApplication[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Admissions Filtering & Selection
  const [selectedAdmission, setSelectedAdmission] = useState<AdmissionApplication | null>(null);
  const [searchAdm, setSearchAdm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterCycle, setFilterCycle] = useState<string>('ALL');
  const [reviewNoteInput, setReviewNoteInput] = useState('');

  // News Modal & Editing
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [articleForm, setArticleForm] = useState({
    title: '',
    slug: '',
    category: 'Admissions',
    excerpt: '',
    content: '',
    status: 'PUBLISHED' as 'PUBLISHED' | 'DRAFT',
    featured: false,
    coverImage: '/src/assets/images/campus_facade_real_1790679454540.jpg',
  });

  // Events Modal & Editing
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState<{
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    category: any;
    audience: 'ALL' | 'PARENTS' | 'STUDENTS';
    isPublic: boolean;
  }>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: 'Campus Collège Isaac Newton, Delmas 50',
    category: 'Pédagogique',
    audience: 'ALL',
    isPublic: true,
  });

  // CMS Settings Form state
  const [cmsSettings, setCmsSettings] = useState<SiteSettings | null>(null);

  // Selected Contact Message for Reading
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [admList, newsList, evts, msgList, setts] = await Promise.all([
        apiService.getAdmissions(),
        apiService.getNews(),
        apiService.getEvents(),
        apiService.getContactMessages(),
        apiService.getSettings(),
      ]);
      setAdmissions(admList);
      setNews(newsList);
      setEvents(evts);
      setMessages(msgList);
      setSettings(setts);
      setCmsSettings(setts);

      // fetch audit logs from backend if available
      try {
        const auditRes = await fetch('/api/audit');
        if (auditRes.ok) {
          const logs = await auditRes.json();
          setAuditLogs(logs);
        }
      } catch {
        // fallback
      }
    } catch (e) {
      console.error('Erreur chargement données admin', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Access Control Guard - Allow all delegated staff roles: ADMIN, EDITOR, TEACHER, MODERATOR
  const isAuthorizedStaff = currentUser && ['ADMIN', 'EDITOR', 'TEACHER', 'MODERATOR'].includes(currentUser.role);
  if (!currentUser || !isAuthorizedStaff) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-blue-900 text-white flex items-center justify-center mx-auto shadow-xl">
          <Shield className="w-8 h-8 text-amber-400" />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-bold text-slate-900">
            Accès Espace Direction & Personnel Habilité
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Cet espace de gestion est réservé au Directeur Général, aux Éditeurs de communication, aux Enseignants et aux Modérateurs du Collège Isaac Newton.
          </p>
        </div>
        <button
          onClick={onOpenAuth}
          className="w-full py-3 px-4 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <Shield className="w-4 h-4 text-amber-400" />
          <span>Connexion Espace Direction & Personnel</span>
        </button>
      </div>
    );
  }

  // Handle delegated role testing / simulation
  const handleRoleSwitch = async (targetRole: Role) => {
    try {
      const switched = await apiService.switchRole(targetRole);
      onUserChange?.(switched);
      showToast(`Simulation activée : Mode « ${ROLE_PERMISSIONS[targetRole]?.badgeLabel || targetRole} »`);
    } catch {
      // Ignore
    }
  };

  // --- ADMISSIONS ACTIONS ---
  const handleStatusChange = async (id: string, newStatus: AdmissionStatus, note?: string) => {
    const updated = await apiService.updateAdmissionStatus(id, newStatus, note);
    if (updated) {
      setAdmissions(prev => prev.map(a => a.id === id ? updated : a));
      if (selectedAdmission && selectedAdmission.id === id) {
        setSelectedAdmission(updated);
      }
      showToast(`Statut du dossier ${updated.applicationNumber} mis à jour : ${newStatus}`);
    }
  };

  const handleDeleteAdmission = async (id: string) => {
    if (!window.confirm('Confirmez-vous la suppression définitive de ce dossier de préinscription ?')) return;
    await apiService.deleteAdmission(id);
    setAdmissions(prev => prev.filter(a => a.id !== id));
    if (selectedAdmission && selectedAdmission.id === id) setSelectedAdmission(null);
    showToast('Dossier supprimé.');
  };

  // --- NEWS CRUD ---
  const handleOpenNewArticle = () => {
    setEditingArticleId(null);
    setArticleForm({
      title: '',
      slug: '',
      category: 'Admissions',
      excerpt: '',
      content: '',
      status: 'PUBLISHED',
      featured: false,
      coverImage: '/src/assets/images/campus_facade_real_1790679454540.jpg',
    });
    setShowArticleModal(true);
  };

  const handleEditArticle = (art: NewsArticle) => {
    setEditingArticleId(art.id);
    setArticleForm({
      title: art.title,
      slug: art.slug,
      category: art.category,
      excerpt: art.excerpt,
      content: art.content,
      status: art.status as 'PUBLISHED' | 'DRAFT',
      featured: !!art.featured,
      coverImage: art.coverImage,
    });
    setShowArticleModal(true);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleForm.title.trim()) return;

    const slug = articleForm.slug.trim() || articleForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (editingArticleId) {
      const updated = await apiService.updateNews(editingArticleId, {
        ...articleForm,
        slug,
      });
      if (updated) {
        setNews(prev => prev.map(n => n.id === editingArticleId ? updated : n));
        showToast('Article mis à jour avec succès.');
      }
    } else {
      const created = await apiService.createNews({
        ...articleForm,
        slug,
        publishedAt: new Date().toISOString().split('T')[0],
        authorName: currentUser.fullName,
      });
      setNews(prev => [created, ...prev]);
      showToast('Nouvel article publié avec succès sur le site.');
    }
    setShowArticleModal(false);
  };

  const handleDeleteArticle = async (id: string) => {
    if (!window.confirm('Voulez-vous supprimer cet article ?')) return;
    await apiService.deleteNews(id);
    setNews(prev => prev.filter(n => n.id !== id));
    showToast('Article supprimé.');
  };

  // --- EVENTS CRUD ---
  const handleOpenNewEvent = () => {
    setEditingEventId(null);
    setEventForm({
      title: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      location: 'Campus Collège Isaac Newton, Delmas 50',
      category: 'Pédagogique',
      audience: 'ALL',
      isPublic: true,
    });
    setShowEventModal(true);
  };

  const handleEditEvent = (evt: SchoolEvent) => {
    setEditingEventId(evt.id);
    setEventForm({
      title: evt.title,
      description: evt.description,
      startDate: evt.startDate ? evt.startDate.split('T')[0] : '',
      endDate: evt.endDate ? evt.endDate.split('T')[0] : '',
      location: evt.location,
      category: evt.category as any,
      audience: evt.audience,
      isPublic: evt.isPublic,
    });
    setShowEventModal(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title.trim()) return;

    if (editingEventId) {
      const updated = await apiService.updateEvent(editingEventId, eventForm);
      if (updated) {
        setEvents(prev => prev.map(e => e.id === editingEventId ? updated : e));
        showToast('Événement mis à jour.');
      }
    } else {
      const created = await apiService.createEvent(eventForm);
      setEvents(prev => [created, ...prev]);
      showToast('Nouvel événement ajouté au calendrier officiel.');
    }
    setShowEventModal(false);
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm('Supprimer cet événement du calendrier officiel ?')) return;
    await apiService.deleteEvent(id);
    setEvents(prev => prev.filter(e => e.id !== id));
    showToast('Événement supprimé.');
  };

  // --- CONTACT MESSAGES ---
  const handleToggleMessageStatus = async (id: string, newStatus: 'NEW' | 'TREATED' | 'ARCHIVED') => {
    await apiService.updateContactStatus(id, newStatus);
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
    if (selectedMessage && selectedMessage.id === id) {
      setSelectedMessage(prev => prev ? { ...prev, status: newStatus } : null);
    }
    showToast(`Message marqué comme ${newStatus === 'TREATED' ? 'Traité' : newStatus === 'ARCHIVED' ? 'Archivé' : 'Nouveau'}`);
  };

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm('Supprimer ce message de la boîte de réception ?')) return;
    await apiService.deleteContactMessage(id);
    setMessages(prev => prev.filter(m => m.id !== id));
    if (selectedMessage && selectedMessage.id === id) setSelectedMessage(null);
    showToast('Message supprimé.');
  };

  // --- CMS SETTINGS SAVE ---
  const handleSaveCmsSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmsSettings) return;
    const updated = await apiService.updateSettings(cmsSettings);
    setSettings(updated);
    showToast('Paramètres généraux et alertes du site enregistrés avec succès !');
  };

  // --- FILTERED ADMISSIONS ---
  const filteredAdmissions = admissions.filter(app => {
    const matchesSearch = 
      app.applicationNumber.toLowerCase().includes(searchAdm.toLowerCase()) ||
      app.studentLastName.toLowerCase().includes(searchAdm.toLowerCase()) ||
      app.studentFirstName.toLowerCase().includes(searchAdm.toLowerCase()) ||
      app.parentFullName.toLowerCase().includes(searchAdm.toLowerCase()) ||
      app.targetLevel.toLowerCase().includes(searchAdm.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || app.status === filterStatus;
    const matchesCycle = filterCycle === 'ALL' || app.cycle === filterCycle;

    return matchesSearch && matchesStatus && matchesCycle;
  });

  // KPI Calculations
  const totalAdmissions = admissions.length;
  const pendingCount = admissions.filter(a => a.status === 'PENDING').length;
  const interviewCount = admissions.filter(a => a.status === 'INTERVIEW_SCHEDULED').length;
  const acceptedCount = admissions.filter(a => a.status === 'ACCEPTED').length;
  const underReviewCount = admissions.filter(a => a.status === 'UNDER_REVIEW').length;
  const unreadMessagesCount = messages.filter(m => m.status === 'NEW').length;

  return (
    <div className="min-h-screen bg-slate-100/70 pb-20">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-amber-400/40 flex items-center gap-3 animate-fade-in text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP EXECUTIVE COMMAND BAR */}
      <header className="bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between py-3 sm:py-3.5 gap-3">
            
            {/* School Title & System Identity */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-amber-300 font-serif font-black text-lg shadow-sm border border-blue-400/30">
                IN
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-base sm:text-lg text-white">Collège Isaac Newton</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-900/80 border border-blue-400/30 text-[10px] text-blue-200 font-semibold uppercase tracking-wider">
                    Direction
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Session 2026-2027 Active</span>
                  </span>
                  <span>·</span>
                  <span>Delmas 50, Haïti</span>
                </div>
              </div>
            </div>

            {/* Quick Actions & User Profile */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              
              {/* Back to Public Site */}
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium transition-colors border border-slate-700 cursor-pointer"
                  title="Voir le site en mode visiteur"
                >
                  <Globe className="w-3.5 h-3.5 text-amber-400" />
                  <span>Voir le Site Public</span>
                </button>
              )}

              {/* Refresh Data */}
              <button
                type="button"
                onClick={loadData}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium transition-colors border border-slate-700 cursor-pointer"
                title="Actualiser les données"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : 'text-slate-300'}`} />
                <span>Actualiser</span>
              </button>

              {/* Profile Card */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-950/70 border border-blue-800/60 text-xs">
                <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <div className="text-left">
                  <span className="font-semibold text-white block leading-tight">{currentUser.fullName}</span>
                  <span className="text-[10px] text-amber-300 font-semibold">
                    {ROLE_PERMISSIONS[currentUser.role]?.name || currentUser.role}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={onLogout}
                className="p-2 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs transition-colors cursor-pointer"
                title="Déconnexion"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* NAVIGATION TABS WITH LIVE BADGES */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar border-t border-slate-800/90 pt-2 pb-2">
            
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Tableau de Bord</span>
            </button>

            <button
              onClick={() => setActiveTab('admissions')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                activeTab === 'admissions'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Admissions & Inscriptions</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('news')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                activeTab === 'news'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>Publications & Actualités</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold">
                {news.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('events')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                activeTab === 'events'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendrier & Agenda</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold">
                {events.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                activeTab === 'messages'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Secrétariat & Messages</span>
              {unreadMessagesCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold animate-pulse">
                  {unreadMessagesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('cms')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                activeTab === 'cms'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Github className="w-3.5 h-3.5 text-amber-400" />
              <span>Paramètres & Synchronisation GitHub</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Contrôle d'Accès & Équipe</span>
            </button>

          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        
        {/* =========================================================================
            TAB 1: EXECUTIVE OVERVIEW (TABLEAU DE BORD EXÉCUTIF)
        ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Quick Action Alert Banner if pending admissions or unread messages */}
            {(pendingCount > 0 || unreadMessagesCount > 0) && (
              <div className="bg-linear-to-r from-amber-500/15 via-blue-900/10 to-amber-500/10 border border-amber-400/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-bold">
                    <Bell className="w-5 h-5 text-slate-950 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-slate-900 text-sm sm:text-base">
                      Actions Pédagogiques & Administratives Requises
                    </h3>
                    <p className="text-xs text-slate-600">
                      Vous avez <strong className="text-amber-800">{pendingCount} dossier(s) de préinscription</strong> en attente d'examen et <strong className="text-blue-900">{unreadMessagesCount} message(s) de familles</strong> non lu(s).
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {pendingCount > 0 && (
                    <button
                      onClick={() => setActiveTab('admissions')}
                      className="px-3.5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs shadow-sm cursor-pointer transition-colors"
                    >
                      Traiter les dossiers
                    </button>
                  )}
                  {unreadMessagesCount > 0 && (
                    <button
                      onClick={() => setActiveTab('messages')}
                      className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-sm cursor-pointer transition-colors"
                    >
                      Voir les messages
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Top 4 KPI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs">
                  <span className="font-semibold uppercase tracking-wider">Total Préinscriptions</span>
                  <FileCheck className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-3xl font-black text-slate-900">{totalAdmissions}</span>
                  <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                    2026-2027
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 flex justify-between pt-1 border-t border-slate-100">
                  <span>Admis : <strong className="text-emerald-700">{acceptedCount}</strong></span>
                  <span>En attente : <strong className="text-amber-600">{pendingCount}</strong></span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs">
                  <span className="font-semibold uppercase tracking-wider">Entretiens Prévus</span>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-3xl font-black text-slate-900">{interviewCount}</span>
                  <span className="text-[11px] text-slate-500">convoqués</span>
                </div>
                <div className="text-[11px] text-slate-500 flex justify-between pt-1 border-t border-slate-100">
                  <span>Sous examen : <strong>{underReviewCount}</strong></span>
                  <span>Taux validation : <strong>{totalAdmissions > 0 ? Math.round((acceptedCount / totalAdmissions) * 100) : 0}%</strong></span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs">
                  <span className="font-semibold uppercase tracking-wider">Articles & Actualités</span>
                  <Newspaper className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-3xl font-black text-slate-900">{news.length}</span>
                  <span className="text-[11px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-full">
                    En ligne
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 flex justify-between pt-1 border-t border-slate-100">
                  <span>Événements agenda : <strong>{events.length}</strong></span>
                  <span>À la une : <strong>{news.filter(n => n.featured).length}</strong></span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs">
                  <span className="font-semibold uppercase tracking-wider">Secrétariat & Contact</span>
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-3xl font-black text-slate-900">{messages.length}</span>
                  {unreadMessagesCount > 0 ? (
                    <span className="text-[11px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-full">
                      {unreadMessagesCount} non lus
                    </span>
                  ) : (
                    <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                      Tous traités
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 flex justify-between pt-1 border-t border-slate-100">
                  <span>Heures : <strong>7h30 - 15h30</strong></span>
                  <span>Delmas 50</span>
                </div>
              </div>

            </div>

            {/* Quick Actions Shortcuts for Director */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
              <h2 className="font-serif font-bold text-slate-900 text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Raccourcis de Gestion Rapide</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                
                <button
                  type="button"
                  onClick={handleOpenNewArticle}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-600/40 bg-slate-50/50 hover:bg-blue-50/50 text-left transition-all group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <Plus className="w-4 h-4" />
                  </div>
                  <h4 className="font-semibold text-slate-900 text-xs">Publier une Annonce</h4>
                  <p className="text-[11px] text-slate-500">Ajouter un article d'actualité visible sur le site</p>
                </button>

                <button
                  type="button"
                  onClick={handleOpenNewEvent}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-purple-600/40 bg-slate-50/50 hover:bg-purple-50/50 text-left transition-all group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <h4 className="font-semibold text-slate-900 text-xs">Planifier un Événement</h4>
                  <p className="text-[11px] text-slate-500">Ajouter une date officielle au calendrier public</p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('admissions')}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-amber-600/40 bg-slate-50/50 hover:bg-amber-50/50 text-left transition-all group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <h4 className="font-semibold text-slate-900 text-xs">Examiner les Dossiers</h4>
                  <p className="text-[11px] text-slate-500">Consulter, valider ou convoquer pour entretien</p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('users')}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-600/40 bg-slate-50/50 hover:bg-blue-50/50 text-left transition-all group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <KeyRound className="w-4 h-4 text-amber-500" />
                  </div>
                  <h4 className="font-semibold text-slate-900 text-xs">Contrôle d'Accès</h4>
                  <p className="text-[11px] text-slate-500">Attribuer des rôles délégués (Éditeur, Prof, Modérateur)</p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('cms')}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-600/40 bg-slate-50/50 hover:bg-emerald-50/50 text-left transition-all group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <h4 className="font-semibold text-slate-900 text-xs">Paramètres & GitHub</h4>
                  <p className="text-[11px] text-slate-500">Alerte du site et export REST</p>
                </button>

              </div>
            </div>

            {/* Split Section: Candidatures récentes & Derniers messages */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Recent Admissions */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-slate-900 text-sm flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-blue-600" />
                    <span>Derniers Dossiers de Préinscription</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('admissions')}
                    className="text-xs text-blue-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Voir tout ({admissions.length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {admissions.slice(0, 4).map(app => (
                    <div 
                      key={app.id} 
                      className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedAdmission(app);
                        setActiveTab('admissions');
                      }}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{app.studentLastName} {app.studentFirstName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">({app.applicationNumber})</span>
                        </div>
                        <p className="text-[11px] text-slate-500">{app.targetLevel} · Parent : {app.parentFullName}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          app.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' :
                          app.status === 'INTERVIEW_SCHEDULED' ? 'bg-amber-100 text-amber-800' :
                          app.status === 'UNDER_REVIEW' ? 'bg-blue-100 text-blue-800' :
                          app.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {app.status === 'ACCEPTED' ? 'Admis' :
                           app.status === 'INTERVIEW_SCHEDULED' ? 'Entretien' :
                           app.status === 'UNDER_REVIEW' ? 'En étude' :
                           app.status === 'REJECTED' ? 'Refusé' : 'En attente'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Messages */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-600" />
                    <span>Derniers Messages Secrétariat</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('messages')}
                    className="text-xs text-blue-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Boîte de réception ({messages.length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {messages.slice(0, 4).map(msg => (
                    <div 
                      key={msg.id} 
                      className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedMessage(msg);
                        setActiveTab('messages');
                      }}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs truncate">{msg.fullName}</span>
                          {msg.status === 'NEW' && (
                            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-bold">
                              Nouveau
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 truncate">{msg.subject}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{msg.email}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400">
                          {new Date(msg.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* =========================================================================
            TAB 2: ADMISSIONS & PRÉINSCRIPTIONS (DOSSIERS ÉLÈVES)
        ========================================================================= */}
        {activeTab === 'admissions' && (
          <div className="space-y-6">
            
            {/* Header with Search and Filters */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif font-bold text-slate-900 text-lg">
                    Gestion des Dossiers de Préinscription 2026-2027
                  </h2>
                  <p className="text-xs text-slate-500">
                    Examen pédagogique des candidatures, convocation aux entretiens et validation des admissions.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">
                    Total : <strong>{filteredAdmissions.length}</strong> dossier(s)
                  </span>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                
                {/* Search Input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Nom, prénom, N° dossier, parent..."
                    value={searchAdm}
                    onChange={(e) => setSearchAdm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-hidden transition-colors"
                  />
                </div>

                {/* Filter by Status */}
                <div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-hidden transition-colors"
                  >
                    <option value="ALL">Tous les statuts</option>
                    <option value="PENDING">En attente d'examen</option>
                    <option value="UNDER_REVIEW">Sous examen pédagogique</option>
                    <option value="INTERVIEW_SCHEDULED">Convoqué pour entretien</option>
                    <option value="ACCEPTED">Admis officiellement</option>
                    <option value="WAITLISTED">Sur liste d'attente</option>
                    <option value="REJECTED">Dossier refusé</option>
                  </select>
                </div>

                {/* Filter by Cycle */}
                <div>
                  <select
                    value={filterCycle}
                    onChange={(e) => setFilterCycle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-hidden transition-colors"
                  >
                    <option value="ALL">Tous les cycles académiques</option>
                    <option value="PRESCOLAIRE">Cycle Préscolaire (TPS - GS)</option>
                    <option value="FONDAMENTAL_CYCLE_1">Fondamental 1er Cycle (1e - 4e AF)</option>
                    <option value="FONDAMENTAL_CYCLE_2">Fondamental 2e Cycle (5e - 6e AF)</option>
                    <option value="FONDAMENTAL_CYCLE_3">Fondamental 3e Cycle (7e - 9e AF)</option>
                    <option value="SECONDAIRE">Nouveau Secondaire (NS1 - NS4)</option>
                  </select>
                </div>

              </div>
            </div>

            {/* Admissions Table & Review Split View */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Table Column (7 or 12 cols depending on selection) */}
              <div className={`${selectedAdmission ? 'lg:col-span-7' : 'lg:col-span-12'} bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3.5">N° Dossier</th>
                        <th className="p-3.5">Élève</th>
                        <th className="p-3.5">Niveau Visé</th>
                        <th className="p-3.5">Responsable</th>
                        <th className="p-3.5">Statut</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAdmissions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-10 text-slate-400">
                            Aucun dossier trouvé pour ces critères de recherche.
                          </td>
                        </tr>
                      ) : (
                        filteredAdmissions.map((app) => (
                          <tr 
                            key={app.id}
                            className={`hover:bg-blue-50/50 transition-colors cursor-pointer ${
                              selectedAdmission?.id === app.id ? 'bg-blue-50/90 font-medium' : ''
                            }`}
                            onClick={() => {
                              setSelectedAdmission(app);
                              setReviewNoteInput(app.reviewNotes || '');
                            }}
                          >
                            <td className="p-3.5 font-mono text-[11px] font-bold text-blue-900">
                              {app.applicationNumber}
                            </td>
                            <td className="p-3.5">
                              <span className="font-bold text-slate-900 block">{app.studentLastName} {app.studentFirstName}</span>
                              <span className="text-[10px] text-slate-400">{app.studentGender === 'M' ? 'Garçon' : 'Fille'} · {app.studentBirthDate}</span>
                            </td>
                            <td className="p-3.5 font-medium text-slate-700">
                              {app.targetLevel}
                            </td>
                            <td className="p-3.5">
                              <span className="text-slate-900 block">{app.parentFullName}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{app.parentPhone}</span>
                            </td>
                            <td className="p-3.5">
                              <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                app.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' :
                                app.status === 'INTERVIEW_SCHEDULED' ? 'bg-amber-100 text-amber-800' :
                                app.status === 'UNDER_REVIEW' ? 'bg-blue-100 text-blue-800' :
                                app.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                                app.status === 'WAITLISTED' ? 'bg-purple-100 text-purple-800' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {app.status === 'ACCEPTED' ? 'Admis' :
                                 app.status === 'INTERVIEW_SCHEDULED' ? 'Entretien fixé' :
                                 app.status === 'UNDER_REVIEW' ? 'Sous examen' :
                                 app.status === 'WAITLISTED' ? 'Liste d\'attente' :
                                 app.status === 'REJECTED' ? 'Refusé' : 'En attente'}
                              </span>
                            </td>
                            <td className="p-3.5 text-right">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAdmission(app);
                                  setReviewNoteInput(app.reviewNotes || '');
                                }}
                                className="p-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-900 transition-colors mr-1 cursor-pointer"
                                title="Voir le dossier complet"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAdmission(app.id);
                                }}
                                className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 transition-colors cursor-pointer"
                                title="Supprimer ce dossier"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Dossier Detail Review Panel (5 cols) */}
              {selectedAdmission && (
                <div className="lg:col-span-5 bg-white rounded-2xl border border-blue-200 shadow-lg p-5 space-y-5 animate-fade-in">
                  
                  {/* Top Bar of Review */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 font-mono">
                        Dossier N° {selectedAdmission.applicationNumber}
                      </span>
                      <h3 className="font-serif font-bold text-slate-900 text-base">
                        {selectedAdmission.studentLastName} {selectedAdmission.studentFirstName}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Imprimer la fiche officielle"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedAdmission(null)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Fermer ce panneau"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Student Details */}
                  <div className="space-y-2 text-xs">
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] text-blue-950">
                      1. Identité de l'Élève
                    </h4>
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Classe sollicitée</span>
                        <span className="font-bold text-slate-900">{selectedAdmission.targetLevel}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Date de naissance</span>
                        <span className="font-medium text-slate-900">{selectedAdmission.studentBirthDate} ({selectedAdmission.studentGender === 'M' ? 'Masculin' : 'Féminin'})</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 block text-[10px]">Établissement précédent</span>
                        <span className="font-medium text-slate-900">{selectedAdmission.previousSchool || 'Non renseigné'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Parent Details */}
                  <div className="space-y-2 text-xs">
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] text-blue-950">
                      2. Responsable Légal
                    </h4>
                    <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Nom & Parenté :</span>
                        <span className="font-bold text-slate-900">{selectedAdmission.parentFullName} ({selectedAdmission.parentRelationship})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Téléphone :</span>
                        <a href={`tel:${selectedAdmission.parentPhone}`} className="font-mono font-bold text-blue-700 hover:underline">
                          {selectedAdmission.parentPhone}
                        </a>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">E-mail :</span>
                        <span className="font-mono text-slate-800">{selectedAdmission.parentEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Adresse :</span>
                        <span className="text-slate-800">{selectedAdmission.parentAddress}</span>
                      </div>
                    </div>
                  </div>

                  {/* Documents Checklist */}
                  <div className="space-y-2 text-xs">
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] text-blue-950">
                      3. Pièces Justificatives Déclarées
                    </h4>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      <span className={`flex items-center gap-1.5 p-2 rounded-lg ${selectedAdmission.hasBirthCert ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                        {selectedAdmission.hasBirthCert ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                        <span>Acte de naissance</span>
                      </span>
                      <span className={`flex items-center gap-1.5 p-2 rounded-lg ${selectedAdmission.hasReportCards ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                        {selectedAdmission.hasReportCards ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                        <span>Bulletins scolaires</span>
                      </span>
                      <span className={`flex items-center gap-1.5 p-2 rounded-lg ${selectedAdmission.hasPassCert ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                        {selectedAdmission.hasPassCert ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                        <span>Certificat passage</span>
                      </span>
                      <span className={`flex items-center gap-1.5 p-2 rounded-lg ${selectedAdmission.hasIdPhotos ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                        {selectedAdmission.hasIdPhotos ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                        <span>Photos d'identité</span>
                      </span>
                    </div>
                  </div>

                  {/* Notes & Décision Direction */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] text-blue-950">
                      4. Avis & Décision de la Direction
                    </h4>

                    {/* Note input */}
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">
                        Notes d'entretien / Observations pédagogiques internes :
                      </label>
                      <textarea
                        rows={2}
                        value={reviewNoteInput}
                        onChange={(e) => setReviewNoteInput(e.target.value)}
                        placeholder="Ex : Convoqué pour test de niveau en mathématiques..."
                        className="w-full p-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                      />
                    </div>

                    {/* Action Decision Buttons */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(selectedAdmission.id, 'ACCEPTED', reviewNoteInput)}
                        className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Valider Admission</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(selectedAdmission.id, 'INTERVIEW_SCHEDULED', reviewNoteInput)}
                        className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Fixer Entretien</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(selectedAdmission.id, 'UNDER_REVIEW', reviewNoteInput)}
                        className="p-2 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-900 font-semibold transition-colors cursor-pointer"
                      >
                        Mettre sous examen
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(selectedAdmission.id, 'REJECTED', reviewNoteInput)}
                        className="p-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-semibold transition-colors cursor-pointer"
                      >
                        Refuser le dossier
                      </button>
                    </div>

                  </div>

                </div>
              )}

            </div>

          </div>
        )}

        {/* =========================================================================
            TAB 3: PUBLICATIONS & ACTUALITÉS (CMS BLOG & ANNONCES)
        ========================================================================= */}
        {activeTab === 'news' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs">
              <div>
                <h2 className="font-serif font-bold text-slate-900 text-lg">
                  Gestion des Publications & Actualités
                </h2>
                <p className="text-xs text-slate-500">
                  Rédigez, modifiez ou dépubliez les annonces officielles, palmarès et articles du Collège Isaac Newton.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenNewArticle}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs shadow-md transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Rédiger un Nouvel Article</span>
              </button>
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {news.map(art => (
                <div key={art.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between group">
                  <div>
                    {/* Cover image preview */}
                    <div className="h-44 w-full overflow-hidden bg-slate-900 relative">
                      <img
                        src={art.coverImage}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-blue-950/80 backdrop-blur-md text-amber-300 text-[10px] font-bold border border-white/10">
                          {art.category}
                        </span>
                        {art.featured && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold">
                            À la une
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-slate-950/80 text-[10px] text-slate-300 font-mono">
                        {art.publishedAt}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <h3 className="font-serif font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                        {art.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {art.excerpt}
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                      art.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {art.status === 'PUBLISHED' ? 'Publié' : 'Brouillon'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleEditArticle(art)}
                        className="p-1.5 rounded-lg hover:bg-white text-blue-900 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                        title="Modifier l'article"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteArticle(art.id)}
                        className="p-1.5 rounded-lg hover:bg-white text-rose-700 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* =========================================================================
            TAB 4: CALENDRIER & AGENDA SCOLAIRE
        ========================================================================= */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs">
              <div>
                <h2 className="font-serif font-bold text-slate-900 text-lg">
                  Calendrier & Agenda Officiel du Collège
                </h2>
                <p className="text-xs text-slate-500">
                  Rentrée, examens d'État, rencontres parents-professeurs et cérémonies officielles à Delmas 50.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenNewEvent}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs shadow-md transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Ajouter un Événement</span>
              </button>
            </div>

            {/* Events List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
              {events.map(evt => (
                <div key={evt.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex flex-col items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-blue-700 mb-0.5" />
                      <span className="text-[10px] font-bold uppercase font-mono">
                        {evt.startDate ? new Date(evt.startDate).toLocaleDateString('fr-FR', { month: 'short' }) : 'Date'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-sm">{evt.title}</h3>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                          {evt.category}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-semibold">
                          Public : {evt.audience === 'ALL' ? 'Tous' : evt.audience === 'PARENTS' ? 'Parents' : 'Élèves'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{evt.description}</p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                        <span>Lieu : {evt.location}</span>
                        <span>·</span>
                        <span>Date : {evt.startDate ? new Date(evt.startDate).toLocaleDateString('fr-FR') : 'À déterminer'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleEditEvent(evt)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(evt.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* =========================================================================
            TAB 5: MESSAGES SECRÉTARIAT (BOÎTE DE RÉCEPTION PARENTS)
        ========================================================================= */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs">
              <h2 className="font-serif font-bold text-slate-900 text-lg">
                Boîte de Réception & Secrétariat du Collège
              </h2>
              <p className="text-xs text-slate-500">
                Demandes d'informations, visites et messages transmis par les familles via la page Contact du site web.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Messages list */}
              <div className={`${selectedMessage ? 'lg:col-span-6' : 'lg:col-span-12'} bg-white rounded-2xl border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden`}>
                {messages.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    Aucun message reçu pour le moment.
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      onClick={() => setSelectedMessage(msg)}
                      className={`p-4 hover:bg-blue-50/50 transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                        selectedMessage?.id === msg.id ? 'bg-blue-50/80' : ''
                      } ${msg.status === 'NEW' ? 'bg-blue-50/30' : ''}`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-900 text-xs truncate">{msg.fullName}</span>
                          {msg.status === 'NEW' && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-bold">
                              Nouveau
                            </span>
                          )}
                          {msg.status === 'TREATED' && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-semibold">
                              Traité
                            </span>
                          )}
                        </div>
                        <h4 className="font-semibold text-slate-800 text-xs truncate">{msg.subject}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{msg.message}</p>
                      </div>

                      <div className="text-right shrink-0 text-[10px] text-slate-400">
                        {new Date(msg.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message reading & reply panel */}
              {selectedMessage && (
                <div className="lg:col-span-6 bg-white rounded-2xl border border-blue-200 shadow-lg p-5 space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-serif font-bold text-slate-900 text-base">{selectedMessage.subject}</h3>
                      <p className="text-xs text-slate-500">
                        De : <strong className="text-slate-800">{selectedMessage.fullName}</strong>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedMessage(null)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Metadata */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Adresse E-mail :</span>
                      <a href={`mailto:${selectedMessage.email}`} className="font-mono text-blue-700 hover:underline">
                        {selectedMessage.email}
                      </a>
                    </div>
                    {selectedMessage.phone && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Téléphone :</span>
                        <a href={`tel:${selectedMessage.phone}`} className="font-mono font-bold text-slate-800">
                          {selectedMessage.phone}
                        </a>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500">Reçu le :</span>
                      <span className="text-slate-700 font-mono">
                        {new Date(selectedMessage.createdAt).toLocaleString('fr-FR')}
                      </span>
                    </div>
                  </div>

                  {/* Body Message */}
                  <div className="p-4 rounded-xl bg-blue-50/30 border border-blue-100 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {selectedMessage.message}
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                    <a
                      href={`mailto:${selectedMessage.email}?subject=Collège Isaac Newton - Réponse à votre message : ${encodeURIComponent(selectedMessage.subject)}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5 text-amber-400" />
                      <span>Répondre par e-mail</span>
                    </a>

                    {selectedMessage.phone && (
                      <a
                        href={`https://wa.me/${selectedMessage.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Contacter sur WhatsApp</span>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => handleToggleMessageStatus(selectedMessage.id, selectedMessage.status === 'TREATED' ? 'NEW' : 'TREATED')}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-medium cursor-pointer"
                    >
                      {selectedMessage.status === 'TREATED' ? 'Marquer non-traité' : 'Marquer comme traité'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteMessage(selectedMessage.id)}
                      className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors ml-auto cursor-pointer"
                      title="Supprimer ce message"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              )}

            </div>

          </div>
        )}

        {/* =========================================================================
            TAB 6: PARAMÈTRES & SYNCHRONISATION GITHUB (SETTINGSVIEW)
        ========================================================================= */}
        {activeTab === 'cms' && (
          <SettingsView
            initialSettings={cmsSettings}
            onSettingsUpdated={(updated) => {
              setCmsSettings(updated);
              setSettings(updated);
            }}
          />
        )}

        {/* =========================================================================
            TAB 7: CONTRÔLE D'ACCÈS (ACCESS CONTROL) & GOUVERNANCE RBAC
        ========================================================================= */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            
            {/* Granular Access Control Interface */}
            <AccessControlView
              currentUser={currentUser}
              onRoleSwitched={handleRoleSwitch}
            />

            {/* Audit Logs */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-serif font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Journal d'Audit Système & Traçabilité des Actions</span>
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  {auditLogs.length} opération(s) enregistrée(s)
                </span>
              </div>

              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {auditLogs.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    Aucun journal enregistré.
                  </div>
                ) : (
                  auditLogs.map((log, idx) => (
                    <div key={log.id || idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-mono font-bold text-blue-900 text-[11px] mr-2">[{log.action}]</span>
                        <span className="text-slate-800">{log.details || log.action}</span>
                        <span className="text-slate-400 text-[10px] ml-2">par {log.user || 'Admin'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString('fr-FR') : ''}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* =========================================================================
          MODAL: CRÉATION & ÉDITION D'ARTICLE (CMS NEWS)
      ========================================================================= */}
      {showArticleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-serif font-bold text-slate-900 text-lg">
                  {editingArticleId ? 'Modifier la Publication' : 'Rédiger une Nouvelle Publication'}
                </h3>
                <p className="text-xs text-slate-500">
                  L'article apparaîtra directement sur la page Actualités et en page d'accueil.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowArticleModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Titre de la publication : *</label>
                <input
                  type="text"
                  required
                  value={articleForm.title}
                  onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                  placeholder="Ex : Réunion d’orientation avec les Parents de 9ème AF"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Catégorie :</label>
                  <select
                    value={articleForm.category}
                    onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600"
                  >
                    <option value="Admissions">Admissions</option>
                    <option value="Académique">Académique</option>
                    <option value="Technologie">Technologie & Informatique</option>
                    <option value="Vie Scolaire">Vie Scolaire</option>
                    <option value="Direction">Direction Générale</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Statut :</label>
                  <select
                    value={articleForm.status}
                    onChange={(e) => setArticleForm({ ...articleForm, status: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600"
                  >
                    <option value="PUBLISHED">Publié immédiatement</option>
                    <option value="DRAFT">Brouillon interne</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Image de Couverture (URL ou asset) :</label>
                <input
                  type="text"
                  value={articleForm.coverImage}
                  onChange={(e) => setArticleForm({ ...articleForm, coverImage: e.target.value })}
                  placeholder="/src/assets/images/campus_facade_real_1790679454540.jpg"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Résumé / Extrait d'introduction : *</label>
                <textarea
                  rows={2}
                  required
                  value={articleForm.excerpt}
                  onChange={(e) => setArticleForm({ ...articleForm, excerpt: e.target.value })}
                  placeholder="Bref résumé accrocheur visible sur les cartes d'accueil..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Contenu Détaillé : *</label>
                <textarea
                  rows={6}
                  required
                  value={articleForm.content}
                  onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                  placeholder="Texte complet de l'annonce officielle pour les élèves et parents..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={articleForm.featured}
                    onChange={(e) => setArticleForm({ ...articleForm, featured: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded-sm"
                  />
                  <span className="font-semibold text-slate-800">Mettre à la une sur la page d'accueil</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowArticleModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold cursor-pointer shadow-md"
                  >
                    {editingArticleId ? 'Mettre à jour' : 'Publier'}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: PLANIFIER UN ÉVÉNEMENT (AGENDA)
      ========================================================================= */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-serif font-bold text-slate-900 text-lg">
                  {editingEventId ? 'Modifier l’Événement' : 'Ajouter une Échéance Officielle'}
                </h3>
                <p className="text-xs text-slate-500">
                  Visible par les familles et élèves sur le calendrier public.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEventModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Titre de l'événement : *</label>
                <input
                  type="text"
                  required
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="Ex : Réunion d’orientation avec les Parents de 9ème AF"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Date de début : *</label>
                  <input
                    type="date"
                    required
                    value={eventForm.startDate}
                    onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Catégorie :</label>
                  <select
                    value={eventForm.category}
                    onChange={(e) => setEventForm({ ...eventForm, category: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600"
                  >
                    <option value="Pédagogique">Pédagogique</option>
                    <option value="Réunion">Réunion des Parents</option>
                    <option value="Examen">Examens & Épreuves d'État</option>
                    <option value="Culturel">Culturel & Graduations</option>
                    <option value="Sportif">Sportif</option>
                    <option value="Férié">Jour Férié / Congé</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Lieu :</label>
                <input
                  type="text"
                  value={eventForm.location}
                  onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  placeholder="Auditorium du Collège, Delmas 50"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Public Ciblé :</label>
                <select
                  value={eventForm.audience}
                  onChange={(e) => setEventForm({ ...eventForm, audience: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600"
                >
                  <option value="ALL">Tout le collège (Élèves, Parents, Professeurs)</option>
                  <option value="PARENTS">Exclusivement les Parents d'Élèves</option>
                  <option value="STUDENTS">Exclusivement les Élèves</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description / Précisions :</label>
                <textarea
                  rows={3}
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder="Ordre du jour, consignes pour les participants..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold cursor-pointer shadow-md"
                >
                  {editingEventId ? 'Mettre à jour' : 'Enregistrer'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
