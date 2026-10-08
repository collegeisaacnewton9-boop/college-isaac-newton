import React, { useState, useEffect } from 'react';
import { 
  Building2,
  Calendar,
  KeyRound,
  Shield,
  RefreshCw,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
  ExternalLink,
  Save,
  Send,
  Sparkles,
  Check,
  Mail,
  Copy,
  Github,
  GitBranch,
  GitCommit,
  UploadCloud,
  CheckCheck,
  X,
  Users,
  Newspaper,
  Edit3,
  Plus,
  Trash2,
  Clock,
  ShieldCheck,
  GraduationCap,
  Menu,
  Database,
  Download,
  Upload,
  FileJson,
  HardDrive,
  FolderSync,
  FileText,
  Layers,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { githubService, GitHubRepoConfig, DEFAULT_GITHUB_CONFIG } from '../../services/githubService';
import { SiteSettings, NewsArticle, User, AcademicCycleInfo, AcademicCyclesRecord } from '../../types';
import { apiService } from '../../services/api';
import { DEFAULT_EDUCATIONAL_CYCLES } from '../../data/mockData';
import { AccessControlView } from './AccessControlView';
import { ImageUploadCompressor } from '../common/ImageUploadCompressor';
import { GitHubSyncModal } from './GitHubSyncModal';
import { MenuEditorView } from './MenuEditorView';
import { shouldProposeGitHubOption } from '../../utils/environment';

interface SettingsViewProps {
  initialSettings?: SiteSettings | null;
  onSettingsUpdated?: (settings: SiteSettings) => void;
  currentUser?: User | null;
  initialTab?: SettingsTab;
}

export type SettingsTab = 'profile' | 'menus' | 'academic' | 'cycles' | 'news' | 'gateways' | 'users' | 'security' | 'backup';

export const SettingsView: React.FC<SettingsViewProps> = ({
  initialSettings,
  onSettingsUpdated,
  currentUser,
  initialTab,
}) => {
  const isSuperAdmin = currentUser?.role === 'ADMIN';

  // Navigation State
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab || 'profile');

  useEffect(() => {
    if (!isSuperAdmin && activeTab === 'backup') {
      setActiveTab('profile');
    }
  }, [isSuperAdmin, activeTab]);

  // CMS Settings State
  const [cmsSettings, setCmsSettings] = useState<SiteSettings | null>(initialSettings || null);
  const [isSaving, setIsSaving] = useState(false);

  // Latency Diagnostic
  const [isTestingLatency, setIsTestingLatency] = useState(false);
  const [dbLatency, setDbLatency] = useState<number | null>(null);

  // SMTP Settings State
  const [showPassword, setShowPassword] = useState(false);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailTarget, setTestEmailTarget] = useState('collegeisaacnewton9@gmail.com');

  // News Articles (Home Page) State
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [isNewsFormOpen, setIsNewsFormOpen] = useState(false);
  const [isSavingNews, setIsSavingNews] = useState(false);
  const [newsForm, setNewsForm] = useState({
    title: '',
    category: 'Admissions',
    excerpt: '',
    content: '',
    coverImage: '/images/campus_facade_real_1790679454540.jpg',
    status: 'PUBLISHED' as 'PUBLISHED' | 'DRAFT',
    featured: true,
  });

  // GitHub Modal & Sync State
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [config, setConfig] = useState<GitHubRepoConfig>(DEFAULT_GITHUB_CONFIG);
  const [showToken, setShowToken] = useState(false);
  const [commitMessage, setCommitMessage] = useState('Mise à jour des fichiers sources - Collège Isaac Newton');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStage, setSyncStage] = useState<string>('');
  const [syncProgress, setSyncProgress] = useState<number>(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [repoDetails, setRepoDetails] = useState<{
    valid: boolean;
    user?: string;
    repoName?: string;
    defaultBranch?: string;
    lastCommit?: {
      sha: string;
      message: string;
      date: string;
      author: string;
    };
    error?: string;
  } | null>(null);

  // Backup / Restauration (Option B) State
  const [isExportingBackup, setIsExportingBackup] = useState(false);
  const [isImportingBackup, setIsImportingBackup] = useState(false);
  const [backupPreview, setBackupPreview] = useState<any | null>(null);
  const [backupFileName, setBackupFileName] = useState<string>('');
  const [rawJsonInput, setRawJsonInput] = useState<string>('');
  const [exportedJsonCache, setExportedJsonCache] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [backupStatsLive, setBackupStatsLive] = useState<{
    admissions: number;
    news: number;
    events: number;
    slides: number;
  }>({ admissions: 0, news: 0, events: 0, slides: 0 });

  // Sécurité Tab State & Handlers (Screenshot 1)
  const connectedEmail = currentUser?.email || 'jackito46@gmail.com';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Inactivity timeout state - synchronized with database (cmsSettings.securityConfig)
  const [inactivityTimeout, setInactivityTimeout] = useState<number>(() => {
    if (initialSettings?.securityConfig?.inactivityTimeoutMinutes) {
      return initialSettings.securityConfig.inactivityTimeoutMinutes;
    }
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cin_inactivity_timeout_mins');
      if (saved) return parseInt(saved, 10) || 5;
    }
    return 5;
  });
  const [isSavingInactivity, setIsSavingInactivity] = useState(false);

  // Sync state if cmsSettings updates
  useEffect(() => {
    if (cmsSettings?.securityConfig?.inactivityTimeoutMinutes) {
      setInactivityTimeout(cmsSettings.securityConfig.inactivityTimeoutMinutes);
    }
  }, [cmsSettings?.securityConfig?.inactivityTimeoutMinutes]);

  // Maintenance & Permissions repair state
  const [isRepairingPermissions, setIsRepairingPermissions] = useState(false);

  // Cycles d'Enseignement CMS State
  const [selectedCycleKey, setSelectedCycleKey] = useState<'prescolaire' | 'fondamental' | 'secondaire' | 'numerique'>('fondamental');
  const [cyclesData, setCyclesData] = useState<AcademicCyclesRecord>(() => {
    return initialSettings?.educationalCycles || DEFAULT_EDUCATIONAL_CYCLES;
  });
  const [isSavingCycles, setIsSavingCycles] = useState(false);

  useEffect(() => {
    if (cmsSettings?.educationalCycles) {
      setCyclesData(cmsSettings.educationalCycles);
    }
  }, [cmsSettings?.educationalCycles]);

  const handleUpdateCycleField = (field: keyof AcademicCycleInfo, value: any) => {
    setCyclesData(prev => ({
      ...prev,
      [selectedCycleKey]: {
        ...prev[selectedCycleKey],
        [field]: value
      }
    }));
  };

  const handleSaveCycles = async () => {
    if (!cmsSettings) return;
    setIsSavingCycles(true);
    try {
      const updated = {
        ...cmsSettings,
        educationalCycles: cyclesData
      };
      const res = await apiService.updateSettings(updated);
      setCmsSettings(res);
      onSettingsUpdated?.(res);
      window.dispatchEvent(new CustomEvent('cin:settings-updated', { detail: res }));
      toast.success("Cycles d'enseignement enregistrés !", {
        description: "Les 4 cycles sont immédiatement synchronisés sur la page d'accueil et persistés en base de données."
      });
    } catch {
      toast.error("Erreur lors de l'enregistrement des cycles");
    } finally {
      setIsSavingCycles(false);
    }
  };

  const handleResetCycles = () => {
    if (!window.confirm("Réinitialiser les 4 cycles aux textes officiels d'origine du collège ?")) return;
    setCyclesData(DEFAULT_EDUCATIONAL_CYCLES);
    toast.info("Valeurs d'origine restaurées dans le formulaire. Cliquez sur Enregistrer pour confirmer.");
  };

  const handleChangePassword = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newPassword) {
      toast.error('Veuillez saisir un nouveau mot de passe');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Mot de passe trop court', {
        description: 'Le mot de passe doit comporter au moins 6 caractères.',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas', {
        description: 'Veuillez saisir deux fois le même mot de passe.',
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const result = await apiService.changePassword(connectedEmail, newPassword);

      if (typeof window !== 'undefined') {
        const storedUsers = localStorage.getItem('cin_registered_users');
        if (storedUsers) {
          try {
            const parsed = JSON.parse(storedUsers);
            const updated = parsed.map((u: any) => 
              u.email === connectedEmail ? { ...u, password: newPassword } : u
            );
            localStorage.setItem('cin_registered_users', JSON.stringify(updated));
          } catch {}
        }
      }

      if (result.success) {
        toast.success('Mot de passe enregistré dans la base de données !', {
          description: `Le mot de passe pour ${connectedEmail} est persisté avec succès.`,
        });
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error('Erreur lors de la modification', {
          description: result.message || 'Impossible de mettre à jour le mot de passe.',
        });
      }
    } catch {
      toast.error('Erreur réseau lors de la modification du mot de passe');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSaveInactivityPolicy = async () => {
    if (!cmsSettings) return;
    setIsSavingInactivity(true);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('cin_inactivity_timeout_mins', inactivityTimeout.toString());
      }

      const updatedPayload: SiteSettings = {
        ...cmsSettings,
        securityConfig: {
          ...cmsSettings.securityConfig,
          inactivityTimeoutMinutes: inactivityTimeout,
          sessionLockEnabled: true,
          updatedAt: new Date().toISOString(),
        }
      };

      const updated = await apiService.updateSettings(updatedPayload);
      setCmsSettings(updated);
      onSettingsUpdated?.(updated);

      toast.success('Politique d\'inactivité enregistrée dans la base de données !', {
        description: `Verrouillage automatique configuré sur ${inactivityTimeout} min et sauvegardé dans PostgreSQL.`,
      });
    } catch {
      toast.error('Erreur lors de l\'enregistrement de la politique de sécurité');
    } finally {
      setIsSavingInactivity(false);
    }
  };

  const handleRepairPermissions = async () => {
    setIsRepairingPermissions(true);
    try {
      const res = await apiService.repairPermissions();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cin:permissions-repaired', {
          detail: { timestamp: new Date().toISOString() }
        }));
      }
      toast.success('Permissions RBAC & Base de données réparées !', {
        description: res.message || 'Intégrité des tables et profils de l\'établissement vérifiée avec succès.',
      });
    } catch {
      toast.error('Erreur lors de la réparation des permissions');
    } finally {
      setIsRepairingPermissions(false);
    }
  };

  // Load config and settings on mount
  useEffect(() => {
    if (shouldProposeGitHubOption()) {
      const loadedConfig = githubService.getConfig();
      setConfig(loadedConfig);
      checkGitHubStatus(loadedConfig);
    }

    if (!initialSettings) {
      loadSettings();
    }
  }, [initialSettings]);

  const loadSettings = async () => {
    try {
      const data = await apiService.getSettings();
      setCmsSettings(data);
      if (data.smtpConfig?.senderEmail) {
        setTestEmailTarget(data.smtpConfig.senderEmail);
      }
    } catch {
      toast.error('Impossible de charger les paramètres.');
    }

    try {
      const newsData = await apiService.getNews();
      setNewsArticles(newsData);
    } catch {
      // Non-blocking
    }

    try {
      const [adm, newsList, evts, slds] = await Promise.allSettled([
        apiService.getAdmissions(),
        apiService.getNews(),
        apiService.getEvents(),
        apiService.getHeroSlides(),
      ]);
      setBackupStatsLive({
        admissions: adm.status === 'fulfilled' && Array.isArray(adm.value) ? adm.value.length : 0,
        news: newsList.status === 'fulfilled' && Array.isArray(newsList.value) ? newsList.value.length : 0,
        events: evts.status === 'fulfilled' && Array.isArray(evts.value) ? evts.value.length : 0,
        slides: slds.status === 'fulfilled' && Array.isArray(slds.value) ? slds.value.length : 4,
      });
    } catch {
      // Non-blocking
    }
  };

  // News CRUD Handlers
  const handleOpenNewArticle = () => {
    setEditingArticleId(null);
    setNewsForm({
      title: '',
      category: 'Admissions',
      excerpt: '',
      content: '',
      coverImage: '/images/campus_facade_real_1790679454540.jpg',
      status: 'PUBLISHED',
      featured: true,
    });
    setIsNewsFormOpen(true);
  };

  const handleEditArticle = (art: NewsArticle) => {
    setEditingArticleId(art.id);
    setNewsForm({
      title: art.title,
      category: art.category,
      excerpt: art.excerpt,
      content: art.content,
      coverImage: art.coverImage,
      status: art.status as 'PUBLISHED' | 'DRAFT',
      featured: !!art.featured,
    });
    setIsNewsFormOpen(true);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsForm.title.trim()) {
      toast.error('Veuillez renseigner le titre de l’article');
      return;
    }

    setIsSavingNews(true);
    const slug = newsForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    try {
      if (editingArticleId) {
        const updated = await apiService.updateNews(editingArticleId, {
          ...newsForm,
          slug,
        });
        if (updated) {
          setNewsArticles(prev => prev.map(n => n.id === editingArticleId ? updated : n));
          toast.success('Actualité mise à jour avec succès !', {
            description: 'Les modifications sont visibles sur la Page Accueil.',
          });
        }
      } else {
        const created = await apiService.createNews({
          ...newsForm,
          slug,
          publishedAt: new Date().toISOString().split('T')[0],
          authorName: 'Direction Générale',
        });
        setNewsArticles(prev => [created, ...prev]);
        toast.success('Nouvelle actualité publiée sur la Page Accueil !');
      }
      setIsNewsFormOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l’enregistrement de l’article');
    } finally {
      setIsSavingNews(false);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!window.confirm('Supprimer cet article d’actualité ?')) return;
    try {
      await apiService.deleteNews(id);
      setNewsArticles(prev => prev.filter(n => n.id !== id));
      toast.success('Article supprimé');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la suppression');
    }
  };

  const checkGitHubStatus = async (cfg: GitHubRepoConfig) => {
    if (!cfg.token || !cfg.token.trim()) {
      setRepoDetails(null);
      return;
    }
    setIsVerifying(true);
    try {
      const details = await githubService.verifyConnection(cfg);
      setRepoDetails(details);
    } catch {
      // Handled in service
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLatencyCheck = async () => {
    setIsTestingLatency(true);
    const start = performance.now();
    try {
      const res = await fetch('/api/health');
      const end = performance.now();
      if (res.ok) {
        const ms = Math.round(end - start);
        setDbLatency(ms);
        toast.success(`Diagnostic Réussi : Latence du serveur de ${ms} ms`);
      } else {
        toast.error('Erreur lors du test de latence');
      }
    } catch {
      toast.error('Serveur inaccessible pour le diagnostic');
    } finally {
      setIsTestingLatency(false);
    }
  };

  // Save full CMS / Site settings
  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!cmsSettings) return;

    setIsSaving(true);
    try {
      const updated = await apiService.updateSettings(cmsSettings);
      setCmsSettings(updated);
      onSettingsUpdated?.(updated);
      toast.success('Paramètres enregistrés avec succès !', {
        description: 'Les modifications sont appliquées sur l’ensemble de la plateforme.',
      });
    } catch {
      toast.error('Erreur lors de l’enregistrement des paramètres.');
    } finally {
      setIsSaving(false);
    }
  };

  // Preconfigure Gmail SMTP presets
  const handlePreconfigureGmail = () => {
    if (!cmsSettings) return;
    setCmsSettings({
      ...cmsSettings,
      smtpConfig: {
        enabled: true,
        senderName: 'Direction Collège Isaac Newton',
        senderEmail: 'collegeisaacnewton9@gmail.com',
        smtpHost: 'smtp.gmail.com',
        smtpPort: 465,
        smtpUser: 'collegeisaacnewton9@gmail.com',
        smtpPass: 'ujwy suyt gjcp fnxf',
        encryption: 'SSL',
      }
    });
    setTestEmailTarget('collegeisaacnewton9@gmail.com');
    toast.info('Paramètres officiels Gmail appliqués dans le formulaire', {
      description: 'N’oubliez pas de cliquer sur « Enregistrer la Passerelle SMTP ».',
    });
  };

  // Test Email
  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailTarget.trim()) {
      toast.error('Veuillez spécifier une adresse email destinataire.');
      return;
    }

    setIsSendingTestEmail(true);
    try {
      const res = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testEmailTarget.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || 'E-mail de test expédié avec succès !', {
          description: `Vérifiez la boîte de réception de ${testEmailTarget}.`,
        });
      } else {
        toast.error(data.error || 'Erreur lors de l’envoi du test');
      }
    } catch (err: any) {
      toast.error('Erreur réseau : ' + err.message);
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  // GitHub actions
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    githubService.saveConfig(config);
    toast.success('Configuration GitHub enregistrée', {
      description: `Dépôt configuré : ${config.owner}/${config.repo} (${config.branch})`,
    });
    checkGitHubStatus(config);
  };

  const handleSyncToGitHub = async () => {
    if (!config.token.trim()) {
      toast.error('Token manquant', {
        description: 'Veuillez saisir un Personal Access Token (PAT) GitHub valide.',
      });
      return;
    }

    setIsSyncing(true);
    setSyncProgress(10);
    setSyncStage('Vérification de l’arbre de travail Git...');

    try {
      setSyncProgress(30);
      setSyncStage('Lecture des sources et des fichiers de configuration...');
      await new Promise(r => setTimeout(r, 400));

      setSyncProgress(50);
      setSyncStage('Synchronisation GitHub REST API en cours...');

      const result = await githubService.syncToGitHub(config, commitMessage, (stage, progress) => {
        setSyncStage(stage);
        setSyncProgress(progress);
      });

      if (result.success) {
        setSyncProgress(100);
        setSyncStage('Synchronisation réussie !');
        toast.success('Synchronisation terminée avec succès !', {
          description: result.commitSha ? `Commit SHA : ${result.commitSha.slice(0, 7)}` : result.message,
        });
        checkGitHubStatus(config);
      } else {
        toast.error('Échec de la synchronisation', {
          description: result.message || 'Erreur inconnue',
        });
      }
    } catch (err: any) {
      toast.error('Erreur inattendue', {
        description: err.message || 'Une exception est survenue lors du push.',
      });
    } finally {
      setIsSyncing(false);
      setTimeout(() => {
        setSyncProgress(0);
        setSyncStage('');
      }, 3000);
    }
  };

  // --- SAUVEGARDE & RESTAURATION JSON (OPTION B) HANDLERS ---
  const handleDownloadBackup = async () => {
    setIsExportingBackup(true);
    try {
      const backupData = await apiService.exportBackup();
      apiService.downloadBackupFile(backupData);
      setExportedJsonCache(JSON.stringify(backupData, null, 2));
      toast.success('Sauvegarde JSON générée et téléchargée avec succès !', {
        description: `${backupData.stats?.admissionsCount || 0} dossiers, ${backupData.stats?.newsCount || 0} articles, ${backupData.stats?.eventsCount || 0} événements inclus.`,
      });
    } catch (err: any) {
      toast.error('Erreur lors du téléchargement de la sauvegarde', { description: err.message });
    } finally {
      setIsExportingBackup(false);
    }
  };

  const handleCopyBackupJson = async () => {
    try {
      let jsonText = exportedJsonCache;
      if (!jsonText) {
        setIsExportingBackup(true);
        const data = await apiService.exportBackup();
        jsonText = JSON.stringify(data, null, 2);
        setExportedJsonCache(jsonText);
        setIsExportingBackup(false);
      }
      await navigator.clipboard.writeText(jsonText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
      toast.success('Contenu JSON copié dans le presse-papiers !');
    } catch (err: any) {
      toast.error('Impossible de copier dans le presse-papiers', { description: err.message });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBackupFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        setBackupPreview(parsed);
        setRawJsonInput(content);
        toast.info(`Fichier JSON analysé avec succès (${file.name})`, {
          description: `${parsed.admissions?.length || 0} admissions, ${parsed.news?.length || 0} articles, ${parsed.events?.length || 0} événements détectés.`,
        });
      } catch {
        toast.error('Le fichier sélectionné n\'est pas un JSON valide.');
        setBackupPreview(null);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = async () => {
    let dataToImport = backupPreview;
    if (!dataToImport && rawJsonInput.trim()) {
      try {
        dataToImport = JSON.parse(rawJsonInput.trim());
      } catch {
        toast.error('Le JSON saisi est invalide.');
        return;
      }
    }

    if (!dataToImport) {
      toast.error('Veuillez sélectionner un fichier JSON ou coller les données à importer.');
      return;
    }

    setIsImportingBackup(true);
    try {
      const res = await apiService.importBackup(dataToImport);
      toast.success('Restauration terminée avec succès !', {
        description: res.message || 'Toutes les tables et configurations ont été synchronisées.',
      });
      await loadSettings();
      if (onSettingsUpdated && dataToImport.siteSettings) {
        onSettingsUpdated(dataToImport.siteSettings);
      }
      setBackupPreview(null);
      setBackupFileName('');
      setRawJsonInput('');
    } catch (err: any) {
      toast.error('Échec de la restauration JSON', { description: err.message });
    } finally {
      setIsImportingBackup(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in font-sans text-slate-800">
      
      {/* =========================================================================
          TOP HEADER : CONFIGURATION SYSTÈME + STATUS PILLS
      ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:px-4 sm:py-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Configuration Système
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Paramètres généraux et préférences de votre établissement
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Option B : Sauvegarde JSON direct button (Super Admin Only) */}
          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab('backup')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs ${
                activeTab === 'backup'
                  ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300'
                  : 'bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900'
              }`}
              title="Accéder à la Sauvegarde JSON (Super Admin)"
            >
              <FileJson className="w-3.5 h-3.5 text-amber-700" />
              <span>Sauvegarde JSON</span>
            </button>
          )}

          {/* Synchro Cloud Automatique badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Synchro Cloud Automatique</span>
          </div>

          {/* Diagnostic Latence BD button */}
          <button
            type="button"
            onClick={handleLatencyCheck}
            disabled={isTestingLatency}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            {isTestingLatency ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Activity className="w-3.5 h-3.5 text-purple-600" />
            )}
            <span>
              {dbLatency !== null ? `Latence : ${dbLatency} ms` : 'Diagnostic Latence BD'}
            </span>
          </button>

          {/* Refresh button */}
          <button
            type="button"
            onClick={loadSettings}
            className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            title="Rafraîchir les paramètres"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          MAIN TWO-COLUMN VERTICAL LAYOUT
      ========================================================================= */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        
        {/* -------------------------------------------------------------
            LEFT SIDEBAR : VERTICAL TABS NAVIGATION + GITHUB MINI CARD
        ------------------------------------------------------------- */}
        <aside className="w-full lg:w-72 shrink-0 space-y-3">
          
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-2 space-y-1">
            
            {/* Profil Établissement */}
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left font-medium text-xs sm:text-[13px] transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100/80'
              }`}
            >
              <Building2 className={`w-4 h-4 ${activeTab === 'profile' ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>Profil Établissement</span>
            </button>

            {/* Menus & Sous-Menus de Navigation */}
            <button
              type="button"
              onClick={() => setActiveTab('menus')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left font-medium text-xs sm:text-[13px] transition-all cursor-pointer ${
                activeTab === 'menus'
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100/80'
              }`}
            >
              <Menu className={`w-4 h-4 ${activeTab === 'menus' ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>Sous-Menus & Navigation</span>
            </button>

            {/* Années Scolaires & Campagnes */}
            <button
              type="button"
              onClick={() => setActiveTab('academic')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left font-medium text-xs sm:text-[13px] transition-all cursor-pointer ${
                activeTab === 'academic'
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100/80'
              }`}
            >
              <Calendar className={`w-4 h-4 ${activeTab === 'academic' ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>Années Scolaires</span>
            </button>

            {/* Cycles d'Enseignement (Accueil) */}
            <button
              type="button"
              onClick={() => setActiveTab('cycles')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left font-medium text-xs sm:text-[13px] transition-all cursor-pointer ${
                activeTab === 'cycles'
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100/80'
              }`}
            >
              <GraduationCap className={`w-4 h-4 ${activeTab === 'cycles' ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>Cycles d'Enseignement</span>
            </button>

            {/* Actualités (Page Accueil) */}
            <button
              type="button"
              onClick={() => setActiveTab('news')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left font-medium text-xs sm:text-[13px] transition-all cursor-pointer ${
                activeTab === 'news'
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100/80'
              }`}
            >
              <Newspaper className={`w-4 h-4 ${activeTab === 'news' ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>Actualités (Accueil)</span>
            </button>

            {/* Passerelles & Clés API / SMTP */}
            <button
              type="button"
              onClick={() => setActiveTab('gateways')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left font-medium text-xs sm:text-[13px] transition-all cursor-pointer ${
                activeTab === 'gateways'
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <KeyRound className={`w-4 h-4 ${activeTab === 'gateways' ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>Passerelles & Clés API</span>
              </div>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                activeTab === 'gateways' ? 'bg-amber-400 text-slate-950' : 'bg-emerald-100 text-emerald-800'
              }`}>
                ACTIF
              </span>
            </button>

            {/* Utilisateurs & Équipe */}
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left font-medium text-xs sm:text-[13px] transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100/80'
              }`}
            >
              <Users className={`w-4 h-4 ${activeTab === 'users' ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>Utilisateurs & Équipe</span>
            </button>

            {/* Sécurité */}
            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left font-medium text-xs sm:text-[13px] transition-all cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100/80'
              }`}
            >
              <Shield className={`w-4 h-4 ${activeTab === 'security' ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>Sécurité</span>
            </button>

            {/* Sauvegarde & Export JSON (Super Admin Only) */}
            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('backup')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left font-medium text-xs sm:text-[13px] transition-all cursor-pointer ${
                  activeTab === 'backup'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md ring-1 ring-amber-300'
                    : 'text-amber-900 bg-amber-50/70 hover:bg-amber-100 border border-amber-200/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileJson className={`w-4 h-4 ${activeTab === 'backup' ? 'text-slate-950' : 'text-amber-600'}`} />
                  <span>Sauvegarde JSON</span>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-mono font-black ${
                  activeTab === 'backup' ? 'bg-slate-950 text-amber-400' : 'bg-amber-200 text-amber-900'
                }`}>
                  ADMIN
                </span>
              </button>
            )}

          </div>

          {/* SAUVEGARDE JSON MINI CARD (Super Admin Only) */}
          {isSuperAdmin && (
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white rounded-2xl p-3 border border-amber-500/30 shadow-md space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">Sauvegarde Système</h4>
                    <p className="text-[10px] text-amber-300/80 font-medium">Export / Import JSON</p>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[9px] font-mono font-bold">
                  ADMIN
                </span>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('backup')}
                className="w-full py-1.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-950" />
                <span>Télécharger le JSON</span>
              </button>
            </div>
          )}

          {/* DÉPÔT GITHUB MINI CARD (STRICTEMENT EXCLU SUR LE POSTE EN PRODUCTION) */}
          {shouldProposeGitHubOption() && (
            <div className="bg-slate-950 text-white rounded-2xl p-3 border border-slate-800 shadow-md space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Github className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">Dépôt GitHub</h4>
                    <p className="text-[10.5px] text-slate-400 font-mono truncate max-w-[140px]">
                      {config.owner} / {config.repo}
                    </p>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 text-[9px] font-mono font-bold">
                  DEV ONLY
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsGitHubModalOpen(true)}
                className="w-full py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-white/10 shadow-xs"
              >
                <UploadCloud className="w-3.5 h-3.5 text-amber-400" />
                <span>Exporter & Synchroniser</span>
              </button>
            </div>
          )}

        </aside>

        {/* -------------------------------------------------------------
            RIGHT CONTENT AREA : DYNAMIC PANEL BY ACTIVE TAB
        ------------------------------------------------------------- */}
        <main className="flex-1 w-full space-y-4">
          
          {/* ===========================================================
              TAB 1 : PROFIL ÉTABLISSEMENT (EXACT MATCH IMAGE 2)
          =========================================================== */}
          {activeTab === 'profile' && cmsSettings && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 space-y-5">
              
              {/* Header section with icon + Site Unique + Enregistrer button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 flex items-center justify-center shrink-0 shadow-2xs">
                    <Building2 className="w-5 h-5 text-blue-900" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                        Identité de l'Établissement
                      </h2>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200">
                        Site Unique
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Configuration des métadonnées officielles et visuelles
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSaveSettings()}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  ) : (
                    <Save className="w-4 h-4 text-amber-400" />
                  )}
                  <span>Enregistrer</span>
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveSettings} className="space-y-6">
                
                {/* 1. INFORMATIONS GÉNÉRALES */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-900 tracking-wider uppercase">
                    <span className="w-1 h-3.5 bg-slate-950 rounded-full" />
                    <span>Informations Générales</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
                        Nom de l'Établissement
                      </label>
                      <input
                        type="text"
                        value={cmsSettings.legalInfo?.schoolName || 'COLLÈGE ISAAC NEWTON'}
                        onChange={(e) => setCmsSettings({
                          ...cmsSettings,
                          legalInfo: {
                            ...(cmsSettings.legalInfo || {}),
                            schoolName: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-slate-900 font-bold focus:border-slate-900 outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
                        Signataire Officiel
                      </label>
                      <input
                        type="text"
                        value={cmsSettings.legalInfo?.officialSigner || cmsSettings.directorInfo?.name || 'ORPHE JEAN MARIE'}
                        onChange={(e) => setCmsSettings({
                          ...cmsSettings,
                          legalInfo: {
                            ...(cmsSettings.legalInfo || {}),
                            officialSigner: e.target.value
                          },
                          directorInfo: {
                            ...(cmsSettings.directorInfo || { name: '', title: '', role: '' }),
                            name: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-slate-900 font-bold focus:border-slate-900 outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
                        Titre du Signataire
                      </label>
                      <input
                        type="text"
                        value={cmsSettings.legalInfo?.signerTitle || cmsSettings.directorInfo?.title || 'Directeur fondateur'}
                        onChange={(e) => setCmsSettings({
                          ...cmsSettings,
                          legalInfo: {
                            ...(cmsSettings.legalInfo || {}),
                            signerTitle: e.target.value
                          },
                          directorInfo: {
                            ...(cmsSettings.directorInfo || { name: '', title: '', role: '' }),
                            title: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-slate-900 font-semibold focus:border-slate-900 outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
                        Langue & Format Date
                      </label>
                      <select
                        value={cmsSettings.legalInfo?.dateFormatLanguage || 'Français (ex: 16 août 2026 - Fait à ...)'}
                        onChange={(e) => setCmsSettings({
                          ...cmsSettings,
                          legalInfo: {
                            ...(cmsSettings.legalInfo || {}),
                            dateFormatLanguage: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-slate-900 font-semibold focus:border-slate-900 outline-none transition-colors"
                      >
                        <option value="Français (ex: 16 août 2026 - Fait à ...)">Français (ex: 16 août 2026 - Fait à ...)</option>
                        <option value="Kreyòl Ayisyen (ex: 16 out 2026)">Kreyòl Ayisyen (ex: 16 out 2026)</option>
                        <option value="English (US) (ex: August 16, 2026)">English (US) (ex: August 16, 2026)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
                        Devise / Slogan
                      </label>
                      <input
                        type="text"
                        value={cmsSettings.schoolMotto}
                        onChange={(e) => setCmsSettings({ ...cmsSettings, schoolMotto: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-slate-900 font-bold focus:border-slate-900 outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. IDENTIFICATION LÉGALE & FONDATION */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-900 tracking-wider uppercase">
                    <span className="w-1 h-3.5 bg-slate-950 rounded-full" />
                    <span>Identification Légale & Fondation</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
                        Année de Fondation
                      </label>
                      <input
                        type="text"
                        value={cmsSettings.legalInfo?.foundationYear || '2020'}
                        onChange={(e) => setCmsSettings({
                          ...cmsSettings,
                          legalInfo: { ...(cmsSettings.legalInfo || {}), foundationYear: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-slate-900 font-bold focus:border-slate-900 outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
                        NIF (Fiscal)
                      </label>
                      <input
                        type="text"
                        value={cmsSettings.legalInfo?.nif || '456-652-985-9'}
                        onChange={(e) => setCmsSettings({
                          ...cmsSettings,
                          legalInfo: { ...(cmsSettings.legalInfo || {}), nif: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-slate-900 font-mono font-bold focus:border-slate-900 outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
                        N° Agrément / Licence
                      </label>
                      <input
                        type="text"
                        value={cmsSettings.legalInfo?.licenseNumber || '548552'}
                        onChange={(e) => setCmsSettings({
                          ...cmsSettings,
                          legalInfo: { ...(cmsSettings.legalInfo || {}), licenseNumber: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-slate-900 font-mono font-bold focus:border-slate-900 outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. COORDONNÉES & CONTACT */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-900 tracking-wider uppercase">
                    <span className="w-1 h-3.5 bg-slate-950 rounded-full" />
                    <span>Coordonnées & Contact</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
                        Adresse Physique
                      </label>
                      <input
                        type="text"
                        value={cmsSettings.contactInfo.address}
                        onChange={(e) => setCmsSettings({
                          ...cmsSettings,
                          contactInfo: { ...cmsSettings.contactInfo, address: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-slate-900 font-medium focus:border-slate-900 outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
                        Téléphone Principal
                      </label>
                      <input
                        type="text"
                        value={cmsSettings.contactInfo.phone}
                        onChange={(e) => setCmsSettings({
                          ...cmsSettings,
                          contactInfo: { ...cmsSettings.contactInfo, phone: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-slate-900 font-medium focus:border-slate-900 outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
                        Téléphone Secondaire / WhatsApp
                      </label>
                      <input
                        type="text"
                        value={cmsSettings.contactInfo.phoneAlt || ''}
                        onChange={(e) => setCmsSettings({
                          ...cmsSettings,
                          contactInfo: { ...cmsSettings.contactInfo, phoneAlt: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-slate-900 font-medium focus:border-slate-900 outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
                        Email Officiel du Site
                      </label>
                      <input
                        type="email"
                        value={cmsSettings.contactInfo.email}
                        onChange={(e) => setCmsSettings({
                          ...cmsSettings,
                          contactInfo: { ...cmsSettings.contactInfo, email: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-slate-900 font-medium focus:border-slate-900 outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
                        Horaires d'Ouverture
                      </label>
                      <input
                        type="text"
                        value={cmsSettings.contactInfo.openingHours}
                        onChange={(e) => setCmsSettings({
                          ...cmsSettings,
                          contactInfo: { ...cmsSettings.contactInfo, openingHours: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-slate-900 font-medium focus:border-slate-900 outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. MESSAGE DU DIRECTEUR */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-900 tracking-wider uppercase">
                    <span className="w-1 h-3.5 bg-slate-950 rounded-full" />
                    <span>Message d'Accueil de la Direction</span>
                  </div>

                  <div>
                    <textarea
                      rows={3}
                      value={cmsSettings.directorWelcome}
                      onChange={(e) => setCmsSettings({ ...cmsSettings, directorWelcome: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-slate-900 font-medium focus:border-slate-900 outline-none transition-colors text-xs leading-relaxed"
                    />
                  </div>
                </div>

                {/* Submit action */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    ) : (
                      <Check className="w-4 h-4 text-amber-400" />
                    )}
                    <span>Enregistrer les Modifications</span>
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* ===========================================================
              TAB 2 : PASSERELLES & CLÉS API / MESSAGERIE SMTP (MATCH IMAGE 3)
          =========================================================== */}
          {activeTab === 'gateways' && cmsSettings && (
            <div className="space-y-4">
              
              {/* TOP DARK BANNER (EXACTLY AS IN IMAGE 3) */}
              <div className="bg-slate-950 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                      <KeyRound className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                          Paramètres de Passerelle & Communication
                        </h2>
                        <span className="px-2 py-0.5 rounded-full bg-blue-600/30 text-blue-300 border border-blue-500/40 text-[10px] font-mono font-bold">
                          STANDARD SMTP & API
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Configuration des protocoles d'envoi pour la messagerie académique, les notifications et le routage
                      </p>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold self-start sm:self-auto">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Chiffrement TLS / SSL</span>
                  </div>
                </div>
              </div>

              {/* SERVEUR DE MESSAGERIE SORTANTE (SMTP) - EDITABLE & DYNAMIC CARD */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 space-y-5">
                
                {/* Header with Preconfigure Gmail button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-blue-900" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                        Serveur de Messagerie Sortante (SMTP)
                      </h3>
                      <p className="text-xs text-slate-500">
                        Routage certifié des reçus, convocations et bulletins scolaires par email
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handlePreconfigureGmail}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                    <span>Préconfigurer Gmail</span>
                  </button>
                </div>

                {/* Form fields (DYNAMIC, NOT HARDCODED!) */}
                <div className="space-y-4 text-xs">
                  
                  {/* Row 1: Nom expéditeur + Adresse email expédition */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
                        Nom de l'Expéditeur Affiché
                      </label>
                      <input
                        type="text"
                        value={cmsSettings.smtpConfig?.senderName || 'Direction Collège Isaac Newton'}
                        onChange={(e) => setCmsSettings({
                          ...cmsSettings,
                          smtpConfig: {
                            ...(cmsSettings.smtpConfig || {
                              enabled: true,
                              senderName: '',
                              senderEmail: '',
                              smtpHost: 'smtp.gmail.com',
                              smtpPort: 465,
                              smtpUser: '',
                              smtpPass: '',
                              encryption: 'SSL'
                            }),
                            senderName: e.target.value
                          }
                        })}
                        placeholder="ex: Direction Collège Isaac Newton"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-slate-900 font-medium focus:border-slate-900 outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
                        Adresse Email d'Expédition
                      </label>
                      <input
                        type="email"
                        value={cmsSettings.smtpConfig?.senderEmail || 'collegeisaacnewton9@gmail.com'}
                        onChange={(e) => setCmsSettings({
                          ...cmsSettings,
                          smtpConfig: {
                            ...(cmsSettings.smtpConfig || {
                              enabled: true,
                              senderName: '',
                              senderEmail: '',
                              smtpHost: 'smtp.gmail.com',
                              smtpPort: 465,
                              smtpUser: '',
                              smtpPass: '',
                              encryption: 'SSL'
                            }),
                            senderEmail: e.target.value
                          }
                        })}
                        placeholder="collegeisaacnewton9@gmail.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-slate-900 font-medium focus:border-slate-900 outline-none transition-colors font-mono"
                      />
                    </div>
                  </div>

                  {/* Row 2: Hôte serveur SMTP + Port réseau */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-slate-700 text-[11px] uppercase tracking-wide">
                          Hôte Serveur SMTP
                        </label>
                        <span className="text-[10px] text-slate-400 font-mono">smtp.domaine.com</span>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={cmsSettings.smtpConfig?.smtpHost || 'smtp.gmail.com'}
                          onChange={(e) => setCmsSettings({
                            ...cmsSettings,
                            smtpConfig: {
                              ...(cmsSettings.smtpConfig || {
                                enabled: true,
                                senderName: '',
                                senderEmail: '',
                                smtpHost: 'smtp.gmail.com',
                                smtpPort: 465,
                                smtpUser: '',
                                smtpPass: '',
                                encryption: 'SSL'
                              }),
                              smtpHost: e.target.value
                            }
                          })}
                          placeholder="smtp.gmail.com"
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-slate-900 font-mono font-medium focus:border-slate-900 outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
                        Port Réseau SMTP
                      </label>
                      <input
                        type="number"
                        value={cmsSettings.smtpConfig?.smtpPort || 465}
                        onChange={(e) => setCmsSettings({
                          ...cmsSettings,
                          smtpConfig: {
                            ...(cmsSettings.smtpConfig || {
                              enabled: true,
                              senderName: '',
                              senderEmail: '',
                              smtpHost: 'smtp.gmail.com',
                              smtpPort: 465,
                              smtpUser: '',
                              smtpPass: '',
                              encryption: 'SSL'
                            }),
                            smtpPort: parseInt(e.target.value, 10) || 465
                          }
                        })}
                        placeholder="465 ou 587"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-slate-900 font-mono font-medium focus:border-slate-900 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Row 3: Identifiant SMTP + Mot de passe SMTP */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
                        Identifiant de Connexion SMTP
                      </label>
                      <input
                        type="text"
                        value={cmsSettings.smtpConfig?.smtpUser || 'collegeisaacnewton9@gmail.com'}
                        onChange={(e) => setCmsSettings({
                          ...cmsSettings,
                          smtpConfig: {
                            ...(cmsSettings.smtpConfig || {
                              enabled: true,
                              senderName: '',
                              senderEmail: '',
                              smtpHost: 'smtp.gmail.com',
                              smtpPort: 465,
                              smtpUser: '',
                              smtpPass: '',
                              encryption: 'SSL'
                            }),
                            smtpUser: e.target.value
                          }
                        })}
                        placeholder="collegeisaacnewton9@gmail.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-slate-900 font-mono font-medium focus:border-slate-900 outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-slate-700 text-[11px] uppercase tracking-wide">
                          Clé d'Accès ou Mot de Passe SMTP
                        </label>
                        <span className="text-[10px] text-blue-700 font-mono font-bold">16 CARACTÈRES POUR GMAIL</span>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={cmsSettings.smtpConfig?.smtpPass || 'ujwy suyt gjcp fnxf'}
                          onChange={(e) => setCmsSettings({
                            ...cmsSettings,
                            smtpConfig: {
                              ...(cmsSettings.smtpConfig || {
                                enabled: true,
                                senderName: '',
                                senderEmail: '',
                                smtpHost: 'smtp.gmail.com',
                                smtpPort: 465,
                                smtpUser: '',
                                smtpPass: '',
                                encryption: 'SSL'
                              }),
                              smtpPass: e.target.value
                            }
                          })}
                          placeholder="ujwy suyt gjcp fnxf"
                          className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-slate-900 font-mono font-medium focus:border-slate-900 outline-none transition-colors tracking-wider"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(p => !p)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                          title={showPassword ? 'Masquer' : 'Afficher'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

                {/* ACTION BUTTONS & TEST EMAIL ROW */}
                <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                  
                  {/* Save button */}
                  <button
                    type="button"
                    onClick={() => handleSaveSettings()}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    ) : (
                      <Save className="w-4 h-4 text-amber-400" />
                    )}
                    <span>Enregistrer la Passerelle SMTP</span>
                  </button>

                  {/* Send test email form */}
                  <form onSubmit={handleSendTestEmail} className="flex items-center gap-2">
                    <input
                      type="email"
                      value={testEmailTarget}
                      onChange={(e) => setTestEmailTarget(e.target.value)}
                      placeholder="destinataire@exemple.com"
                      className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/60 text-xs text-slate-900 font-mono outline-none focus:border-slate-900"
                    />
                    <button
                      type="submit"
                      disabled={isSendingTestEmail}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer shrink-0"
                    >
                      {isSendingTestEmail ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                      ) : (
                        <Send className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span>Tester la Connexion</span>
                    </button>
                  </form>

                </div>

                {/* AUTOMATED NOTIFICATION FLOWS BADGE */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCheck className="w-4 h-4 text-emerald-600" />
                    <span>Flux de notifications automatisés :</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    <li><strong>Nouvelle Préinscription :</strong> Envoi instantané de la fiche complète au secrétariat académique et de l'accusé de réception officiel avec numéro de dossier unique au parent.</li>
                    <li><strong>Formulaire de Contact :</strong> Réception immédiate des demandes et accusé de réception automatique au visiteur.</li>
                  </ul>
                </div>

              </div>

            </div>
          )}

          {/* ===========================================================
              TAB 2 : MENUS & SOUS-MENUS DE NAVIGATION
          =========================================================== */}
          {activeTab === 'menus' && (
            <MenuEditorView />
          )}

          {/* ===========================================================
              TAB 3 : ANNÉES SCOLAIRES & CAMPAGNES
          =========================================================== */}
          {activeTab === 'academic' && cmsSettings && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                      Gestion des Années Scolaires & Campagnes
                    </h2>
                    <p className="text-xs text-slate-500">
                      Dates clés, ouvertures des candidatures et bandeau d'alerte en direct
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSaveSettings()}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
                >
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>Enregistrer</span>
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Admissions campaign status */}
                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">Campagne de Préinscription en Ligne</span>
                      <p className="text-slate-500 text-[11px]">Active ou ferme l'accès aux formulaires de candidature.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cmsSettings.admissionsStatus.isOpen}
                        onChange={(e) => setCmsSettings({
                          ...cmsSettings,
                          admissionsStatus: { ...cmsSettings.admissionsStatus, isOpen: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase">Année Académique</label>
                      <input
                        type="text"
                        value={cmsSettings.admissionsStatus.currentSchoolYear}
                        onChange={(e) => setCmsSettings({
                          ...cmsSettings,
                          admissionsStatus: { ...cmsSettings.admissionsStatus, currentSchoolYear: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase">Notice de Clôture</label>
                      <input
                        type="text"
                        value={cmsSettings.admissionsStatus.deadlineNotice}
                        onChange={(e) => setCmsSettings({
                          ...cmsSettings,
                          admissionsStatus: { ...cmsSettings.admissionsStatus, deadlineNotice: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Announcement Banner CMS */}
                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">Bandeau Public d'Alerte (Entête)</span>
                      <p className="text-slate-500 text-[11px]">Message défilant ou bannière prioritaire affichée sur tout le site.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cmsSettings.announcement.enabled}
                        onChange={(e) => setCmsSettings({
                          ...cmsSettings,
                          announcement: { ...cmsSettings.announcement, enabled: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="block font-bold text-slate-700 text-[11px] uppercase">Texte du Message d'Alerte</label>
                    <input
                      type="text"
                      value={cmsSettings.announcement.text}
                      onChange={(e) => setCmsSettings({
                        ...cmsSettings,
                        announcement: { ...cmsSettings.announcement, text: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===========================================================
              TAB 3.2 : CYCLES D'ENSEIGNEMENT (PAGE D'ACCUEIL)
          =========================================================== */}
          {activeTab === 'cycles' && (
            <div className="space-y-4">
              {/* Header card with action buttons */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-800 flex items-center justify-center shrink-0 shadow-2xs">
                    <GraduationCap className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-slate-900 text-base sm:text-lg">
                      Cycles d’Enseignement (Page d’Accueil)
                    </h3>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Personnalisez les 4 programmes d’études présentés aux familles, leurs objectifs et leurs visuels.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetCycles}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Réinitialiser
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCycles}
                    disabled={isSavingCycles}
                    className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingCycles ? (
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    ) : (
                      <Save className="w-4 h-4 text-amber-400" />
                    )}
                    <span>Enregistrer les cycles</span>
                  </button>
                </div>
              </div>

              {/* Cycle Tab Switcher */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-xs flex flex-wrap gap-1.5">
                {[
                  { key: 'prescolaire', label: '1. Préscolaire', sub: '3-5 ans' },
                  { key: 'fondamental', label: '2. Fondamental', sub: '1ère - 9ème AF' },
                  { key: 'secondaire', label: '3. Secondaire', sub: 'NS1 - NS4' },
                  { key: 'numerique', label: '4. Lab Tech', sub: 'Tous cycles' },
                ].map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setSelectedCycleKey(c.key as any)}
                    className={`flex-1 min-w-[140px] px-3.5 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                      selectedCycleKey === c.key
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs">{c.label}</div>
                    <div className={`text-[10px] mt-0.5 ${selectedCycleKey === c.key ? 'text-amber-300' : 'text-slate-400'}`}>
                      {c.sub}
                    </div>
                  </button>
                ))}
              </div>

              {/* Form & Live Preview Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                
                {/* FORM COLUMN (7 cols) */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4 text-xs">
                  <div className="border-b border-slate-100 pb-2">
                    <h4 className="font-bold text-slate-900 text-sm">
                      Détails pour : {cyclesData[selectedCycleKey]?.title || selectedCycleKey}
                    </h4>
                    <p className="text-slate-500 text-[11px]">
                      Modifiez les textes, caractéristiques pédagogiques et pièces justificatives associées.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase">
                        Titre du Cycle *
                      </label>
                      <input
                        type="text"
                        value={cyclesData[selectedCycleKey]?.title || ''}
                        onChange={(e) => handleUpdateCycleField('title', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900"
                        placeholder="Ex: Cycle Fondamental"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase">
                        Sous-titre / Tranche d'Âge *
                      </label>
                      <input
                        type="text"
                        value={cyclesData[selectedCycleKey]?.subtitle || ''}
                        onChange={(e) => handleUpdateCycleField('subtitle', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-900"
                        placeholder="Ex: De la 1ère à la 9ème AF"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase">
                      Description du Programme *
                    </label>
                    <textarea
                      rows={3}
                      value={cyclesData[selectedCycleKey]?.description || ''}
                      onChange={(e) => handleUpdateCycleField('description', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 leading-relaxed"
                      placeholder="Exposé des objectifs académiques, méthodes et compétences acquises..."
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-slate-700 text-[11px] uppercase">
                        Points Forts & Spécificités (Un point par ligne)
                      </label>
                      <span className="text-[10px] text-slate-400">
                        {cyclesData[selectedCycleKey]?.highlights?.length || 0} points
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      value={cyclesData[selectedCycleKey]?.highlights?.join('\n') || ''}
                      onChange={(e) => {
                        const lines = e.target.value.split('\n').filter(l => l.trim().length > 0);
                        handleUpdateCycleField('highlights', lines);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 leading-relaxed"
                      placeholder="Saisissez un point fort par ligne..."
                    />
                    <p className="text-[10.5px] text-slate-400 mt-1">
                      Chaque ligne apparaîtra avec une puce de validation verte dans la présentation du cycle.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase">
                        Page de Destination (Lien)
                      </label>
                      <select
                        value={cyclesData[selectedCycleKey]?.targetPage || 'programs'}
                        onChange={(e) => handleUpdateCycleField('targetPage', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 cursor-pointer"
                      >
                        <option value="prescolaire">Page Préscolaire</option>
                        <option value="fondamental">Page Fondamental</option>
                        <option value="secondaire">Page Secondaire</option>
                        <option value="numerique">Page Pôle Numérique</option>
                        <option value="programs">Page Tous les Programmes</option>
                        <option value="pre-registration">Formulaire de Préinscription</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase">
                        Couleur d'Accentuation du Badge
                      </label>
                      <select
                        value={cyclesData[selectedCycleKey]?.badgeColor || 'bg-blue-100 text-blue-900 border-blue-200'}
                        onChange={(e) => handleUpdateCycleField('badgeColor', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 cursor-pointer"
                      >
                        <option value="bg-amber-100 text-amber-900 border-amber-200">Ambre / Doré (Préscolaire)</option>
                        <option value="bg-blue-100 text-blue-900 border-blue-200">Bleu Roi (Fondamental)</option>
                        <option value="bg-purple-100 text-purple-900 border-purple-200">Violet Académique (Secondaire)</option>
                        <option value="bg-emerald-100 text-emerald-900 border-emerald-200">Émeraude (Pôle Numérique)</option>
                        <option value="bg-indigo-100 text-indigo-900 border-indigo-200">Indigo Institutionnel</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase">
                      Image d'Illustration du Cycle
                    </label>
                    <input
                      type="text"
                      value={cyclesData[selectedCycleKey]?.image || ''}
                      onChange={(e) => handleUpdateCycleField('image', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-[11px] text-slate-800"
                      placeholder="Ex: /images/campus_courtyard_building_1790531780046.jpg"
                    />

                    {/* Quick photo selector buttons */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-[10px] text-slate-400 self-center mr-1">Visuels officiels :</span>
                      {[
                        { label: 'Cour', path: '/images/campus_courtyard_building_1790531780046.jpg' },
                        { label: 'Façade', path: '/images/campus_facade_real_1790679454540.jpg' },
                        { label: 'Diplômés', path: '/images/graduation_promo_real_1790679465649.jpg' },
                        { label: 'Lab Info', path: '/images/computer_lab_real_1790679476180.jpg' },
                        { label: 'Rassemblement', path: '/images/students_assembly_1790529184364.jpg' },
                      ].map((img) => (
                        <button
                          key={img.path}
                          type="button"
                          onClick={() => handleUpdateCycleField('image', img.path)}
                          className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium transition-colors cursor-pointer"
                        >
                          {img.label}
                        </button>
                      ))}
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <span className="block text-[10.5px] font-semibold text-slate-600 mb-1">
                        Ou téléverser une nouvelle photo pour ce cycle (Compression automatique WebP) :
                      </span>
                      <ImageUploadCompressor
                        currentImageUrl={cyclesData[selectedCycleKey]?.image}
                        onImageReady={(dataUrl: string) => handleUpdateCycleField('image', dataUrl)}
                        label="Choisir une photo locale pour ce cycle"
                        compact
                      />
                    </div>
                  </div>
                </div>

                {/* LIVE PREVIEW COLUMN (5 cols) */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="bg-slate-900 text-white rounded-2xl p-3 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-amber-400 font-mono tracking-wider">
                      Aperçu en Direct sur la Page d’Accueil
                    </span>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="relative h-44 bg-slate-950 overflow-hidden">
                      <img
                        src={cyclesData[selectedCycleKey]?.image}
                        alt={cyclesData[selectedCycleKey]?.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.dataset.triedFallback) {
                            target.dataset.triedFallback = '1';
                            if (target.src.includes('/src/assets/images/')) {
                              target.src = target.src.replace('/src/assets/images/', '/images/');
                            } else {
                              target.src = '/images/campus_courtyard_building_1790531780046.jpg';
                            }
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                        <span className="text-white text-[11px] font-serif italic drop-shadow">
                          Collège Isaac Newton · Delmas 50
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border ${cyclesData[selectedCycleKey]?.badgeColor || 'bg-blue-100 text-blue-900 border-blue-200'}`}>
                        {cyclesData[selectedCycleKey]?.subtitle}
                      </span>

                      <h4 className="font-serif font-bold text-lg text-slate-900 leading-snug">
                        {cyclesData[selectedCycleKey]?.title}
                      </h4>

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {cyclesData[selectedCycleKey]?.description}
                      </p>

                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Points Clés
                        </span>
                        {cyclesData[selectedCycleKey]?.highlights?.slice(0, 3).map((h, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="truncate">{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ===========================================================
              TAB 3.5 : ACTUALITÉS & PUBLICATIONS (PAGE D'ACCUEIL)
          =========================================================== */}
          {activeTab === 'news' && (
            <div className="space-y-4">
              
              {/* Header card with "Nouvel Article" button */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 flex items-center justify-center shrink-0">
                    <Newspaper className="w-5 h-5 text-blue-900" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                      Actualités & Publications (Page d'Accueil)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Modifiez les articles, résumés et images de la vitrine avec compression automatique avant envoi.
                    </p>
                  </div>
                </div>

                {!isNewsFormOpen && (
                  <button
                    type="button"
                    onClick={handleOpenNewArticle}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4 text-amber-400" />
                    <span>Rédiger un Article</span>
                  </button>
                )}
              </div>

              {/* EDITOR FORM WITH IMAGE COMPRESSOR */}
              {isNewsFormOpen && (
                <div className="bg-white rounded-2xl border-2 border-slate-900/10 shadow-md p-4 sm:p-5 space-y-4 animate-scale-in">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-blue-900" />
                      <h3 className="font-black text-slate-900 text-sm sm:text-base">
                        {editingArticleId ? 'Modifier l’Article d’Actualité' : 'Nouvelle Publication pour l’Accueil'}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsNewsFormOpen(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveArticle} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
                        Titre de l'Actualité *
                      </label>
                      <input
                        type="text"
                        required
                        value={newsForm.title}
                        onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                        placeholder="ex: Modernisation continue de notre laboratoire informatique et sciences"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-slate-900 font-bold focus:border-slate-900 outline-none transition-colors text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
                          Catégorie
                        </label>
                        <select
                          value={newsForm.category}
                          onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-slate-900 font-medium focus:border-slate-900 outline-none transition-colors"
                        >
                          <option value="Admissions">Admissions</option>
                          <option value="Technologie">Technologie & Sciences</option>
                          <option value="Académique">Académique & Pédagogie</option>
                          <option value="Vie Scolaire">Vie Scolaire & Campus</option>
                          <option value="Direction">Direction Générale</option>
                        </select>
                      </div>

                      <div className="flex items-center pt-5 sm:pt-6">
                        <label className="flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl w-full">
                          <input
                            type="checkbox"
                            checked={newsForm.featured}
                            onChange={(e) => setNewsForm({ ...newsForm, featured: e.target.checked })}
                            className="w-4 h-4 text-amber-500 rounded-sm"
                          />
                          <span className="font-bold text-slate-900 text-[11px]">
                            ⭐ Mettre à la une sur la Page d'Accueil
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* CLIENT-SIDE IMAGE COMPRESSOR */}
                    <div>
                      <ImageUploadCompressor
                        currentImageUrl={newsForm.coverImage}
                        onImageReady={(compressedUrl) => setNewsForm({ ...newsForm, coverImage: compressedUrl })}
                        label="Image de Couverture (Compression & Allègement Automatique WebP)"
                        recommendedAspect="Format 16:9 recommandé (Résolution max 1280px)"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
                        Extrait / Résumé d'Accroche (Visible sur la carte d'accueil) *
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={newsForm.excerpt}
                        onChange={(e) => setNewsForm({ ...newsForm, excerpt: e.target.value })}
                        placeholder="Court texte percutant décrivant la nouvelle..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-slate-900 font-medium focus:border-slate-900 outline-none transition-colors text-xs leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
                        Contenu Détaillé de l'Article *
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={newsForm.content}
                        onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                        placeholder="Texte complet de l'article accessible lors du clic..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-slate-900 font-medium focus:border-slate-900 outline-none transition-colors text-xs leading-relaxed"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setIsNewsFormOpen(false)}
                        className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingNews}
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-950 text-white font-bold transition-colors cursor-pointer shadow-xs"
                      >
                        {isSavingNews ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-amber-400" />
                        )}
                        <span>Enregistrer la Publication</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* LIST OF PUBLISHED ARTICLES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {newsArticles.map((art) => (
                  <div
                    key={art.id}
                    className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-3.5 flex flex-col justify-between space-y-3 hover:border-slate-300 transition-all"
                  >
                    <div className="space-y-2.5">
                      <div className="relative aspect-[16/9] max-h-40 rounded-xl overflow-hidden bg-slate-950 border border-slate-200/80">
                        <img
                          src={art.coverImage}
                          alt={art.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                          <span className="bg-slate-950/80 text-white font-bold text-[9px] px-2 py-0.5 rounded-full border border-white/20 backdrop-blur-xs">
                            {art.category}
                          </span>
                          {art.featured && (
                            <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full shadow-xs">
                              ⭐ À LA UNE
                            </span>
                          )}
                        </div>
                        <div className="absolute bottom-1.5 right-2 bg-black/60 text-white text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur-xs">
                          {art.publishedAt}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-serif font-bold text-sm text-slate-900 line-clamp-2 leading-snug">
                          {art.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                          {art.excerpt}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {art.authorName || 'Direction'}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEditArticle(art)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors cursor-pointer text-[11px]"
                        >
                          <Edit3 className="w-3 h-3 text-blue-900" />
                          <span>Modifier</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteArticle(art.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Supprimer l'article"
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

          {/* ===========================================================
              TAB 4 : UTILISATEURS & ÉQUIPE
          =========================================================== */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <AccessControlView hideHeader={false} />
            </div>
          )}

          {/* ===========================================================
              TAB 6 : SÉCURITÉ & ACCÈS (SCREENSHOT 1 IMPLEMENTATION)
          =========================================================== */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              
              {/* CARD 1: Sécurité du Compte & Authentification */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
                      <KeyRound className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                        Sécurité du Compte & Authentification
                      </h3>
                      <p className="text-xs text-slate-500 font-mono">
                        Compte connecté : <span className="font-semibold text-slate-700">{connectedEmail}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleChangePassword}
                    disabled={isChangingPassword || !newPassword}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-950 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Enregistrement BDD...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Changer le mot de passe</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Database sync badge */}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/80 text-[11px] font-semibold text-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Enregistrement sécurisé dans la base de données (Table system_users)
                  </span>
                </div>

                {/* Form Fields: Nouveau mot de passe & Confirmer */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Nouveau mot de passe */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-bold text-slate-800">Nouveau mot de passe</label>
                      <span className="text-[11px] text-slate-400 font-medium">6 car. min</span>
                    </div>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Au moins 6 caractères"
                        className="w-full px-3.5 py-2.5 pr-10 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirmer le mot de passe */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-800 text-xs">Confirmer le mot de passe</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Répétez le mot de passe"
                        className="w-full px-3.5 py-2.5 pr-10 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 2: Politique d'Inactivité & Verrouillage */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
                      <Clock className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                        Politique d'Inactivité & Verrouillage
                      </h3>
                      <p className="text-xs text-slate-500">
                        Verrouillage automatique de session après inactivité
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveInactivityPolicy}
                    disabled={isSavingInactivity}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4f46e5] hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
                  >
                    {isSavingInactivity ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Enregistrement...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Enregistrer</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Delay Selector Row */}
                <div className="border border-slate-200/80 rounded-xl p-3 sm:p-3.5 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="font-bold text-xs text-slate-800">
                    Délai d'inactivité avant verrouillage
                  </span>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Preset Pills */}
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                      {[5, 10, 15, 30, 60].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setInactivityTimeout(mins)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            inactivityTimeout === mins
                              ? 'bg-[#4f46e5] text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                        >
                          {mins}m
                        </button>
                      ))}
                    </div>

                    {/* Numeric Input */}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        max="240"
                        value={inactivityTimeout}
                        onChange={(e) => setInactivityTimeout(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-14 text-center font-bold font-mono text-xs py-1.5 px-2 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      />
                      <span className="text-xs font-semibold text-slate-500">min</span>
                    </div>
                  </div>
                </div>

                {/* Database sync status row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px]">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-indigo-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    Persistance BDD : {inactivityTimeout} minutes synchronisées dans la table site_settings (PostgreSQL)
                  </span>
                  {cmsSettings?.securityConfig?.updatedAt && (
                    <span className="text-slate-400 font-mono text-[10px]">
                      Dernière synchro : {new Date(cmsSettings.securityConfig.updatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>

              {/* CARD 3: Maintenance & Droits d'Accès */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
                      <RefreshCw className={`w-5 h-5 text-amber-600 ${isRepairingPermissions ? 'animate-spin' : ''}`} />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                        Maintenance & Droits d'Accès
                      </h3>
                      <p className="text-xs text-slate-500">
                        Resynchronisation des permissions et des profils de l'établissement
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRepairPermissions}
                    disabled={isRepairingPermissions}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#c26100] hover:bg-[#a35200] text-white text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto shrink-0"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isRepairingPermissions ? 'Réparation en cours...' : 'Réparer Permissions'}</span>
                  </button>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-amber-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Vérifie les schémas SQL, l'unicité des comptes administrateurs et réinitialise les accès corrompus.</span>
                </div>
              </div>

              {/* CARD 4: Matrice des Permissions RBAC (Documentation) */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 space-y-3">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                      Matrice & Gouvernance RBAC
                    </h4>
                    <p className="text-xs text-slate-500">
                      Règles de compartimentation et traçabilité des opérations administratives
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Les rôles système (SUPER_ADMIN, ADMIN, DIRECTION, SECRÉTARIAT, PROFESSEUR, PARENT, ÉLÈVE) sont compartimentés et validés à chaque transaction API. Les sessions inactives sont auditées et purgées automatiquement.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* =========================================================================
              PANEL 9 : SAUVEGARDE & RESTAURATION JSON (SUPER ADMIN UNIQUEMENT)
          ========================================================================= */}
          {activeTab === 'backup' && isSuperAdmin && (
            <div className="space-y-4">
              
              {/* COMPACT EXECUTIVE HEADER */}
              <div className="bg-slate-950 text-white p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0">
                    <FileJson className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                        Sauvegarde & Restauration Système
                      </h2>
                      <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-mono font-bold">
                        SUPER ADMIN
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Exportation complète et synchronisation instantanée du SI (JSON autonome)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                  <button
                    type="button"
                    onClick={handleDownloadBackup}
                    disabled={isExportingBackup}
                    className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                  >
                    {isExportingBackup ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
                    ) : (
                      <Download className="w-3.5 h-3.5 text-slate-950" />
                    )}
                    <span>Télécharger (.json)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyBackupJson}
                    className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700/80 transition-colors cursor-pointer"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{isCopied ? 'Copié' : 'Copier'}</span>
                  </button>
                </div>
              </div>

              {/* COMPACT METRIC COUNTERS (4 CARDS) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium block">Admissions</span>
                    <span className="text-base font-extrabold text-slate-900 font-mono">{backupStatsLive.admissions}</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium block">Actualités</span>
                    <span className="text-base font-extrabold text-slate-900 font-mono">{backupStatsLive.news}</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium block">Agenda</span>
                    <span className="text-base font-extrabold text-slate-900 font-mono">{backupStatsLive.events}</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium block">Diaporama</span>
                    <span className="text-base font-extrabold text-slate-900 font-mono">{backupStatsLive.slides || 4}</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                </div>
              </div>

              {/* TWO CLEAN BALANCED ACTION CARDS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* CARD 1: EXPORT */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                          <Download className="w-4 h-4" />
                        </div>
                        <h3 className="font-bold text-sm text-slate-900">Exporter la Sauvegarde</h3>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono font-semibold">
                        .json
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">
                      Téléchargez l’ensemble des données actives (paramètres, articles, agenda, admissions, utilisateurs et textes personnalisés).
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadBackup}
                    disabled={isExportingBackup}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    {isExportingBackup ? (
                      <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                    ) : (
                      <Download className="w-4 h-4 text-amber-400" />
                    )}
                    <span>Télécharger la Sauvegarde JSON</span>
                  </button>
                </div>

                {/* CARD 2: IMPORT */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <Upload className="w-4 h-4" />
                        </div>
                        <h3 className="font-bold text-sm text-slate-900">Restaurer & Synchroniser</h3>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                        Restauration
                      </span>
                    </div>

                    {/* MINIMALIST FILE SELECTOR */}
                    <label className="border-2 border-dashed border-slate-200 hover:border-amber-400 rounded-xl p-3 flex items-center justify-center gap-2.5 bg-slate-50/60 hover:bg-amber-50/30 cursor-pointer transition-colors block text-center">
                      <input
                        type="file"
                        accept=".json,application/json"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <FileJson className="w-5 h-5 text-amber-500 shrink-0" />
                      <span className="text-xs font-semibold text-slate-700 truncate max-w-[240px]">
                        {backupFileName ? backupFileName : 'Sélectionner un fichier JSON'}
                      </span>
                    </label>

                    {/* COMPACT PREVIEW IF FILE LOADED */}
                    {backupPreview && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-[11px] text-emerald-900 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Fichier valide</span>
                        </span>
                        <span className="font-mono text-emerald-700">
                          {backupPreview.admissions?.length || 0} adm · {backupPreview.news?.length || 0} art · {backupPreview.events?.length || 0} evt
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleExecuteImport}
                    disabled={isImportingBackup || (!backupPreview && !rawJsonInput.trim())}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                      !backupPreview && !rawJsonInput.trim()
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                    }`}
                  >
                    {isImportingBackup ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <FolderSync className="w-4 h-4" />
                    )}
                    <span>Restaurer sur ce Serveur</span>
                  </button>
                </div>

              </div>

            </div>
          )}

        </main>

      </div>

      {/* MODAL DE SYNCHRONISATION GITHUB (STRICTEMENT EXCLU SUR LE POSTE EN PRODUCTION) */}
      {shouldProposeGitHubOption() && (
        <GitHubSyncModal
          isOpen={isGitHubModalOpen}
          onClose={() => {
            setIsGitHubModalOpen(false);
            if (shouldProposeGitHubOption()) {
              checkGitHubStatus(config);
            }
          }}
        />
      )}

    </div>
  );
};
