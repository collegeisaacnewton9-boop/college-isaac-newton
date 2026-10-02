import React, { useState, useEffect } from 'react';
import { 
  Github, 
  GitBranch, 
  GitCommit, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Loader2, 
  Lock, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  Save, 
  ShieldCheck, 
  Terminal, 
  Sliders, 
  Sparkles, 
  UploadCloud, 
  Check, 
  FileCode, 
  Globe,
  Bell,
  Clock,
  KeyRound,
  ChevronUp,
  ChevronDown,
  Info,
  CheckCheck
} from 'lucide-react';
import { Octokit } from '@octokit/rest';
import { toast } from 'sonner';
import { githubService, GitHubRepoConfig, DEFAULT_GITHUB_CONFIG } from '../../services/githubService';
import { SiteSettings } from '../../types';
import { apiService } from '../../services/api';

interface SettingsViewProps {
  initialSettings?: SiteSettings | null;
  onSettingsUpdated?: (settings: SiteSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  initialSettings,
  onSettingsUpdated,
}) => {
  // GitHub Configuration State
  const [config, setConfig] = useState<GitHubRepoConfig>(DEFAULT_GITHUB_CONFIG);
  const [showToken, setShowToken] = useState(false);
  const [commitMessage, setCommitMessage] = useState('Mise à jour des fichiers sources - Collège Isaac Newton');
  
  // Sync State & Visual Loader
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStage, setSyncStage] = useState<string>('');
  const [syncProgress, setSyncProgress] = useState<number>(0);
  
  // Verification State
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

  // General CMS School Settings State
  const [cmsSettings, setCmsSettings] = useState<SiteSettings | null>(initialSettings || null);
  const [isSavingCms, setIsSavingCms] = useState(false);
  const [isCoolifyGuideCollapsed, setIsCoolifyGuideCollapsed] = useState(() => {
    return typeof window !== 'undefined' && localStorage.getItem('cin_coolify_guide_collapsed') === 'true';
  });

  // Load config on mount
  useEffect(() => {
    const loadedConfig = githubService.getConfig();
    setConfig(loadedConfig);

    // Initial check of repository connection via Octokit
    checkGitHubStatus(loadedConfig);

    // Load CMS settings if not provided
    if (!initialSettings) {
      apiService.getSettings().then(setCmsSettings).catch(() => {});
    }
  }, [initialSettings]);

  // Check connection using Octokit REST
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

  // Save GitHub configuration
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    githubService.saveConfig(config);
    toast.success('Configuration GitHub enregistrée avec succès', {
      description: `Dépôt configuré : ${config.owner}/${config.repo} (${config.branch})`,
    });
    checkGitHubStatus(config);
  };

  // Perform GitHub Synchronization via Octokit REST API
  const handleSyncToGitHub = async () => {
    if (!config.token.trim()) {
      toast.error('Token manquant', {
        description: 'Veuillez saisir un Personal Access Token (PAT) GitHub valide.',
      });
      return;
    }

    setIsSyncing(true);
    setSyncProgress(10);
    setSyncStage('Connexion à l’API GitHub REST...');

    const toastId = toast.loading('Synchronisation des fichiers sources en cours...', {
      description: `Dépôt cible : ${config.owner}/${config.repo} (${config.branch})`,
    });

    try {
      // 1. Client-side Octokit verification
      setSyncProgress(25);
      setSyncStage('Vérification des droits d’écriture sur le dépôt...');
      const octokit = new Octokit({ auth: config.token });

      try {
        await octokit.rest.repos.get({
          owner: config.owner,
          repo: config.repo,
        });
      } catch (authErr: any) {
        throw new Error(`Échec d'authentification Octokit: ${authErr.message}`);
      }

      // 2. Perform sync with progress updates
      const result = await githubService.syncToGitHub(
        config,
        commitMessage,
        (stage, progress) => {
          setSyncStage(stage);
          setSyncProgress(progress);
        }
      );

      // 3. Update repo details after push
      await checkGitHubStatus(config);

      toast.success('Synchronisation GitHub réussie !', {
        id: toastId,
        description: `Tous les fichiers sources ont été poussés avec succès vers ${config.owner}/${config.repo} (Commit ${result.commitSha}).`,
        action: {
          label: 'Voir sur GitHub',
          onClick: () => window.open(`https://github.com/${config.owner}/${config.repo}`, '_blank'),
        },
        duration: 6000,
      });

    } catch (err: any) {
      console.error('Erreur synchronisation GitHub', err);
      toast.error('Échec de la synchronisation', {
        id: toastId,
        description: err.message || 'Une erreur est survenue lors de l’envoi des fichiers sources.',
        duration: 7000,
      });
    } finally {
      setIsSyncing(false);
      setTimeout(() => {
        setSyncProgress(0);
        setSyncStage('');
      }, 2500);
    }
  };

  // Save General CMS Settings
  const handleSaveCmsSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmsSettings) return;

    setIsSavingCms(true);
    try {
      const updated = await apiService.updateSettings(cmsSettings);
      setCmsSettings(updated);
      onSettingsUpdated?.(updated);
      toast.success('Paramètres enregistrés en Base de Données !', {
        description: updated.announcement.enabled
          ? 'Le bandeau d’information est maintenant activé sur le site.'
          : 'Le bandeau d’information a été désactivé et masqué de l’entête.',
      });
    } catch {
      toast.error('Erreur lors de l’enregistrement des paramètres du site.');
    } finally {
      setIsSavingCms(false);
    }
  };

  return (
    <div className="space-y-2 sm:space-y-2.5 animate-fade-in">
      
      {/* -------------------------------------------------------------
          SECTION 1 : GITHUB REST API SYNCHRONIZATION (OCTOKIT)
      ------------------------------------------------------------- */}
      <div className="bg-white rounded-xl p-2.5 sm:px-3 sm:py-2 border border-slate-200/90 shadow-2xs space-y-2">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs shrink-0">
              <Github className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-sans font-bold text-slate-900 text-xs sm:text-sm tracking-tight">
                  Synchronisation GitHub REST API
                </h2>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 text-[9px] font-mono font-bold uppercase tracking-wider">
                  @octokit/rest
                </span>
              </div>
              <p className="font-sans text-[10.5px] text-slate-500">
                Poussez automatiquement l’ensemble des fichiers sources, styles et configurations vers le dépôt configuré.
              </p>
            </div>
          </div>

          {/* Direct Link to Repo */}
          <div className="flex items-center gap-1.5">
            <a
              href={`https://github.com/${config.owner}/${config.repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-950 text-[10.5px] font-semibold border border-slate-200 transition-colors"
            >
              <span>Accéder au Dépôt</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            <button
              type="button"
              onClick={() => checkGitHubStatus(config)}
              disabled={isVerifying || isSyncing}
              className="p-1.2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              title="Tester la connexion GitHub"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin text-amber-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Live Repository Status Card */}
        <div className={`p-2 sm:px-2.5 sm:py-2 rounded-xl border transition-all ${
          repoDetails?.valid
            ? 'bg-emerald-50/50 border-emerald-200/80 text-emerald-950'
            : repoDetails && !repoDetails.valid
            ? 'bg-rose-50/50 border-rose-200/80 text-rose-950'
            : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {isVerifying ? (
                <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin shrink-0" />
              ) : repoDetails?.valid ? (
                <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <XCircle className="w-3.5 h-3.5" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-xs text-slate-900">
                    {repoDetails?.valid ? 'Dépôt GitHub Connecté & Opérationnel' : 'Connexion en attente de validation'}
                  </span>
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-white border border-slate-200 text-slate-800">
                    {config.owner}/{config.repo}
                  </span>
                </div>
                
                {repoDetails?.valid && repoDetails.lastCommit ? (
                  <p className="text-[10px] text-slate-600 flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="font-mono font-bold text-blue-900 flex items-center gap-1">
                      <GitCommit className="w-3 h-3 text-slate-400" />
                      {repoDetails.lastCommit.sha}
                    </span>
                    <span>·</span>
                    <span className="truncate max-w-xs sm:max-w-md">{repoDetails.lastCommit.message}</span>
                    <span>·</span>
                    <span className="text-slate-400">par {repoDetails.lastCommit.author}</span>
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {repoDetails?.error || 'Cliquez sur « Tester la connexion » ou lancez la synchronisation.'}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-mono text-[10.5px] font-bold">
                <GitBranch className="w-3 h-3 text-amber-500" />
                <span>{config.branch}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Configuration Form & Sync Action Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-2.5">
          
          {/* Left Column: Repository Credentials Form (7 cols) */}
          <form onSubmit={handleSaveConfig} className="lg:col-span-7 space-y-2">
            <h3 className="font-sans font-bold text-slate-900 text-xs sm:text-sm tracking-tight flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-500" />
              <span>Paramètres du Dépôt & Authentification</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[10.5px]">Propriétaire (Owner)</label>
                <input
                  type="text"
                  value={config.owner}
                  onChange={(e) => setConfig({ ...config, owner: e.target.value })}
                  placeholder="ex: collegeisaacnewton9-boop"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-hidden font-mono text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[10.5px]">Nom du Dépôt (Repository)</label>
                <input
                  type="text"
                  value={config.repo}
                  onChange={(e) => setConfig({ ...config, repo: e.target.value })}
                  placeholder="ex: college-isaac-newton"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-hidden font-mono text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">Branche cible</label>
                <div className="relative">
                  <GitBranch className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    value={config.branch}
                    onChange={(e) => setConfig({ ...config, branch: e.target.value })}
                    placeholder="main"
                    className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-hidden font-mono text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">Personal Access Token (PAT)</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={config.token}
                    onChange={(e) => setConfig({ ...config, token: e.target.value })}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    className="w-full pl-8 pr-8 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-hidden font-mono text-xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Custom Commit Message */}
            <div className="text-xs">
              <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">Message du commit d’exportation</label>
              <input
                type="text"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="Description des modifications apportées..."
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-hidden text-xs"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <p className="text-[10.5px] text-slate-400">
                Token stocké de façon sécurisée localement pour les synchronisations.
              </p>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Enregistrer</span>
              </button>
            </div>
          </form>

          {/* Right Column: SYNC ACTION PANEL WITH VISUAL LOADER (5 cols) */}
          <div className="lg:col-span-5 bg-linear-to-b from-blue-900/5 to-amber-500/5 rounded-xl p-2.5 sm:px-3 sm:py-2 border border-blue-100 flex flex-col justify-between space-y-2">
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] uppercase font-bold tracking-wider text-blue-900 flex items-center gap-1">
                  <UploadCloud className="w-3 h-3 text-blue-600" />
                  <span>Export & Déploiement GitHub</span>
                </span>
                <span className="text-[9px] text-slate-500 font-medium font-sans">REST API</span>
              </div>

              <h4 className="font-sans font-bold text-slate-900 text-xs sm:text-sm tracking-tight">
                Pousser les Fichiers Sources
              </h4>
              <p className="font-sans text-[10.5px] text-slate-600 leading-relaxed">
                Cliquez pour compiler l'état actuel de votre application et envoyer les fichiers sources directement vers votre dépôt GitHub.
              </p>
            </div>

            {/* Visual Progress Loader (Displays live when syncing) */}
            {isSyncing && (
              <div className="bg-white rounded-lg p-2 border border-blue-200 shadow-2xs space-y-1 animate-fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 flex items-center gap-1 text-[10.5px]">
                    <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />
                    <span>{syncStage || 'Traitement en cours...'}</span>
                  </span>
                  <span className="font-mono font-bold text-blue-900 text-[10px]">{syncProgress}%</span>
                </div>

                {/* Animated Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-full bg-linear-to-r from-blue-600 via-indigo-600 to-amber-500 transition-all duration-300 rounded-full"
                    style={{ width: `${syncProgress}%` }}
                  />
                </div>
                
                <p className="text-[9px] text-slate-400 italic">
                  Veuillez patienter pendant l'authentification et l'envoi des sources...
                </p>
              </div>
            )}

            {/* MAIN BUTTON: 'Synchroniser avec GitHub' WITH DEDICATED LOADER */}
            <div className="space-y-1 pt-0.5">
              <button
                type="button"
                onClick={handleSyncToGitHub}
                disabled={isSyncing}
                className={`w-full py-2 px-3 rounded-lg font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isSyncing
                    ? 'bg-blue-950 text-white cursor-not-allowed opacity-90'
                    : 'bg-linear-to-r from-blue-900 to-blue-800 hover:from-blue-950 hover:to-blue-900 text-white hover:shadow-sm active:scale-98'
                }`}
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                    <span>Synchronisation en cours ({syncProgress}%)</span>
                  </>
                ) : (
                  <>
                    <Github className="w-3.5 h-3.5 text-amber-400" />
                    <span>Synchroniser avec GitHub</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSyncToGitHub}
                disabled={isSyncing}
                className="w-full py-1.5 px-2.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSyncing ? (
                  <Loader2 className="w-3 h-3 text-slate-500 animate-spin" />
                ) : (
                  <UploadCloud className="w-3 h-3 text-blue-600" />
                )}
                <span>Exporter les sources vers le dépôt</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* -------------------------------------------------------------
          SECTION 1.B : GUIDE D'INTÉGRATION COOLIFY & WEBHOOKS GITHUB
      ------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-xl p-3 sm:p-3.5 border border-slate-800 shadow-md space-y-2.5">
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600/30 border border-blue-400/40 text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-white text-xs sm:text-sm tracking-tight flex items-center gap-1.5">
                <span>Guide Déploiement Coolify : Liaison GitHub & Conteneur Docker</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono font-bold">
                  Dockerfile Prêt
                </span>
              </h3>
              <p className="font-sans text-[10.5px] text-slate-300">
                Pourquoi "Deployment lifecycle" ou "Webhooks" n'apparaît pas dans la section <em>Servers &gt; localhost &gt; Proxy</em> :
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsCoolifyGuideCollapsed(prev => {
                const next = !prev;
                if (typeof window !== 'undefined') {
                  localStorage.setItem('cin_coolify_guide_collapsed', String(next));
                }
                return next;
              });
            }}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            title={isCoolifyGuideCollapsed ? "Déplier le guide" : "Réduire le guide"}
          >
            {isCoolifyGuideCollapsed ? (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                <span>Afficher le guide</span>
              </>
            ) : (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Réduire</span>
              </>
            )}
          </button>
        </div>

        {!isCoolifyGuideCollapsed && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs font-sans">
              
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                  <span className="w-4 h-4 rounded-full bg-amber-400/20 flex items-center justify-center text-[10px]">1</span>
                  <span>Où trouver l'Application ?</span>
                </div>
                <p className="text-[10.5px] text-slate-300 leading-relaxed">
                  Dans le menu de gauche Coolify, cliquez sur <strong>Projects</strong> (icône 4 carrés sous Workspace), puis ouvrez votre projet et l'environnement <strong>production</strong>.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[11px]">
                  <span className="w-4 h-4 rounded-full bg-blue-400/20 flex items-center justify-center text-[10px]">2</span>
                  <span>Webhooks & Déploiement Auto</span>
                </div>
                <p className="text-[10.5px] text-slate-300 leading-relaxed">
                  Dans la page de l'Application, cliquez sur l'onglet <strong>Webhooks</strong>. Copiez l'URL fournie par Coolify et ajoutez-la sur GitHub dans <em>Settings &gt; Webhooks</em>.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                  <span className="w-4 h-4 rounded-full bg-emerald-400/20 flex items-center justify-center text-[10px]">3</span>
                  <span>Conteneur Dockerfile</span>
                </div>
                <p className="text-[10.5px] text-slate-300 leading-relaxed">
                  Le fichier <strong>Dockerfile</strong> (Node 22, port 3000) et <strong>server-db.ts</strong> (PostgreSQL) sont synchronisés à la racine du dépôt GitHub officiel.
                </p>
              </div>

            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/10 text-[10.5px] text-slate-400 font-sans">
              <span>Dépôt officiel connecté : <strong className="text-white font-mono">{config.owner}/{config.repo}</strong></span>
              <a
                href={`https://github.com/${config.owner}/${config.repo}/settings/hooks`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2"
              >
                <span>Configurer les Webhooks sur GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </>
        )}
      </div>

      {/* -------------------------------------------------------------
          SECTION 2 : PARAMÈTRES GÉNÉRAUX DU SITE (CMS & ALERTES)
      ------------------------------------------------------------- */}
      {cmsSettings && (
        <form onSubmit={handleSaveCmsSettings} className="bg-white rounded-xl p-2.5 sm:px-3 sm:py-2 border border-slate-200/90 shadow-2xs space-y-2">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-700 flex items-center justify-center shrink-0">
                <Sliders className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="font-sans font-bold text-slate-900 text-xs sm:text-sm tracking-tight">
                  Paramètres Généraux du Collège & Alertes Publiques
                </h3>
                <p className="font-sans text-[10.5px] text-slate-500">
                  Configurez le bandeau d'alerte, les coordonnées officielles et le mot d'accueil du Directeur.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingCms}
              className="px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
            >
              {isSavingCms ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
              ) : (
                <Check className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>Enregistrer les Paramètres</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            
            {/* Banner Alert Config */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-amber-600" />
                  <span className="font-semibold text-slate-900 text-xs">
                    Bandeau d'Information / Alerte Site
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    cmsSettings.announcement.enabled 
                      ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' 
                      : 'text-slate-500 bg-slate-100 border border-slate-200'
                  }`}>
                    {cmsSettings.announcement.enabled ? 'Actif (Visible)' : 'Désactivé (Masqué)'}
                  </span>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cmsSettings.announcement.enabled}
                      onChange={(e) => {
                        const nextEnabled = e.target.checked;
                        setCmsSettings({
                          ...cmsSettings,
                          announcement: { ...cmsSettings.announcement, enabled: nextEnabled }
                        });
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                  </label>
                </div>
              </div>

              {!cmsSettings.announcement.enabled && (
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    Bandeau désactivé : Cliquez sur <strong>« Enregistrer les Paramètres »</strong> pour masquer immédiatement le bandeau de l'entête du site public.
                  </span>
                </div>
              )}

              <div>
                <label className="block text-slate-600 mb-0.5 text-[11px]">Message affiché aux visiteurs</label>
                <input
                  type="text"
                  value={cmsSettings.announcement.text}
                  onChange={(e) => setCmsSettings({
                    ...cmsSettings,
                    announcement: { ...cmsSettings.announcement, text: e.target.value }
                  })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 focus:border-blue-600 focus:outline-hidden text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 mb-0.5 text-[11px]">Type de bandeau</label>
                  <select
                    value={cmsSettings.announcement.type}
                    onChange={(e) => setCmsSettings({
                      ...cmsSettings,
                      announcement: { ...cmsSettings.announcement, type: e.target.value as any }
                    })}
                    className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-200 focus:border-blue-600 focus:outline-hidden text-xs"
                  >
                    <option value="info">Information (Bleu)</option>
                    <option value="warning">Important (Ambre)</option>
                    <option value="urgent">Urgent (Rouge)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 mb-0.5 text-[11px]">Libellé du bouton</label>
                  <input
                    type="text"
                    value={cmsSettings.announcement.linkText || ''}
                    onChange={(e) => setCmsSettings({
                      ...cmsSettings,
                      announcement: { ...cmsSettings.announcement, linkText: e.target.value }
                    })}
                    placeholder="ex: Formulaire"
                    className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-200 focus:border-blue-600 focus:outline-hidden text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Campaign Status Config */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Statut Campagne d'Admissions</span>
                </span>
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
                  <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-600" />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 mb-0.5 text-[11px]">Année Scolaire</label>
                  <input
                    type="text"
                    value={cmsSettings.admissionsStatus.currentSchoolYear}
                    onChange={(e) => setCmsSettings({
                      ...cmsSettings,
                      admissionsStatus: { ...cmsSettings.admissionsStatus, currentSchoolYear: e.target.value }
                    })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 focus:border-blue-600 focus:outline-hidden text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-0.5 text-[11px]">Date limite / Consigne</label>
                  <input
                    type="text"
                    value={cmsSettings.admissionsStatus.deadlineNotice}
                    onChange={(e) => setCmsSettings({
                      ...cmsSettings,
                      admissionsStatus: { ...cmsSettings.admissionsStatus, deadlineNotice: e.target.value }
                    })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 focus:border-blue-600 focus:outline-hidden text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-0.5 text-[11px]">Devise de l'Établissement</label>
                <input
                  type="text"
                  value={cmsSettings.schoolMotto}
                  onChange={(e) => setCmsSettings({
                    ...cmsSettings,
                    schoolMotto: e.target.value
                  })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 focus:border-blue-600 focus:outline-hidden text-xs font-serif italic"
                />
              </div>
            </div>

            {/* Official Contact Coordinates */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2 md:col-span-2">
              <span className="font-semibold text-slate-900 block text-xs">
                Coordonnées Officielles du Secrétariat (Affichage Global)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-slate-600 mb-0.5 text-[11px]">Téléphone 1 (Principal)</label>
                  <input
                    type="text"
                    value={cmsSettings.contactInfo.phone}
                    onChange={(e) => setCmsSettings({
                      ...cmsSettings,
                      contactInfo: { ...cmsSettings.contactInfo, phone: e.target.value }
                    })}
                    placeholder="+509 3316-0934"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 focus:border-blue-600 focus:outline-hidden font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-0.5 text-[11px]">Téléphone 2 (Secondaire)</label>
                  <input
                    type="text"
                    value={cmsSettings.contactInfo.phoneAlt || ''}
                    onChange={(e) => setCmsSettings({
                      ...cmsSettings,
                      contactInfo: { ...cmsSettings.contactInfo, phoneAlt: e.target.value }
                    })}
                    placeholder="+509 3721-1818"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 focus:border-blue-600 focus:outline-hidden font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-0.5 text-[11px]">E-mail Institutionnel</label>
                  <input
                    type="email"
                    value={cmsSettings.contactInfo.email}
                    onChange={(e) => setCmsSettings({
                      ...cmsSettings,
                      contactInfo: { ...cmsSettings.contactInfo, email: e.target.value }
                    })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 focus:border-blue-600 focus:outline-hidden text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-0.5 text-[11px]">Adresse Officielle</label>
                  <input
                    type="text"
                    value={cmsSettings.contactInfo.address}
                    onChange={(e) => setCmsSettings({
                      ...cmsSettings,
                      contactInfo: { ...cmsSettings.contactInfo, address: e.target.value }
                    })}
                    placeholder="Delmas 50, rue Dominique #2 bis, Port-au-Prince, Haïti"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 focus:border-blue-600 focus:outline-hidden text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-600 mb-0.5 text-[11px]">Directeur Fondateur</label>
                  <input
                    type="text"
                    value={cmsSettings.directorInfo?.name || 'Orphe Jean Marie'}
                    onChange={(e) => setCmsSettings({
                      ...cmsSettings,
                      directorInfo: {
                        name: e.target.value,
                        title: cmsSettings.directorInfo?.title || 'Directeur fondateur',
                        role: cmsSettings.directorInfo?.role || 'Professeur de Mathématiques & Sciences Physiques',
                      }
                    })}
                    placeholder="Orphe Jean Marie"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 focus:border-blue-600 focus:outline-hidden text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-0.5 text-[11px]">Titre & Spécialité Pédagogique</label>
                  <input
                    type="text"
                    value={cmsSettings.directorInfo?.role || 'Professeur de Mathématiques & Sciences Physiques'}
                    onChange={(e) => setCmsSettings({
                      ...cmsSettings,
                      directorInfo: {
                        name: cmsSettings.directorInfo?.name || 'Orphe Jean Marie',
                        title: cmsSettings.directorInfo?.title || 'Directeur fondateur',
                        role: e.target.value,
                      }
                    })}
                    placeholder="Professeur de Mathématiques & Sciences Physiques"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 focus:border-blue-600 focus:outline-hidden text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-0.5 text-[11px]">Mot d'Accueil de la Direction</label>
                <textarea
                  rows={2}
                  value={cmsSettings.directorWelcome}
                  onChange={(e) => setCmsSettings({
                    ...cmsSettings,
                    directorWelcome: e.target.value
                  })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 focus:border-blue-600 focus:outline-hidden text-xs leading-relaxed"
                />
              </div>
            </div>

          </div>

        </form>
      )}

    </div>
  );
};
