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
  KeyRound
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
      toast.success('Paramètres du site enregistrés avec succès !', {
        description: 'Le bandeau d’alerte et les coordonnées ont été mis à jour.',
      });
    } catch {
      toast.error('Erreur lors de l’enregistrement des paramètres du site.');
    } finally {
      setIsSavingCms(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* -------------------------------------------------------------
          SECTION 1 : GITHUB REST API SYNCHRONIZATION (OCTOKIT)
      ------------------------------------------------------------- */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md shrink-0">
              <Github className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-slate-900 text-lg sm:text-xl">
                  Synchronisation GitHub REST API
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono font-bold uppercase tracking-wider">
                  @octokit/rest
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Poussez automatiquement l’ensemble des fichiers sources, styles et configurations vers le dépôt configuré.
              </p>
            </div>
          </div>

          {/* Direct Link to Repo */}
          <div className="flex items-center gap-2">
            <a
              href={`https://github.com/${config.owner}/${config.repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-950 text-xs font-semibold border border-slate-200 transition-colors"
            >
              <span>Accéder au Dépôt</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            <button
              type="button"
              onClick={() => checkGitHubStatus(config)}
              disabled={isVerifying || isSyncing}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              title="Tester la connexion GitHub"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin text-amber-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Live Repository Status Card */}
        <div className={`p-4 rounded-2xl border transition-all ${
          repoDetails?.valid
            ? 'bg-emerald-50/50 border-emerald-200/80 text-emerald-950'
            : repoDetails && !repoDetails.valid
            ? 'bg-rose-50/50 border-rose-200/80 text-rose-950'
            : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {isVerifying ? (
                <Loader2 className="w-5 h-5 text-amber-600 animate-spin shrink-0" />
              ) : repoDetails?.valid ? (
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <XCircle className="w-5 h-5" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-slate-900">
                    {repoDetails?.valid ? 'Dépôt GitHub Connecté & Opérationnel' : 'Connexion en attente de validation'}
                  </span>
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800">
                    {config.owner}/{config.repo}
                  </span>
                </div>
                
                {repoDetails?.valid && repoDetails.lastCommit ? (
                  <p className="text-[11px] text-slate-600 flex items-center gap-2 mt-0.5">
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
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {repoDetails?.error || 'Cliquez sur « Tester la connexion » ou lancez la synchronisation.'}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-mono font-bold">
                <GitBranch className="w-3.5 h-3.5 text-amber-500" />
                <span>{config.branch}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Configuration Form & Sync Action Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Repository Credentials Form (7 cols) */}
          <form onSubmit={handleSaveConfig} className="lg:col-span-7 space-y-4">
            <h3 className="font-serif font-bold text-slate-900 text-sm flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-500" />
              <span>Paramètres du Dépôt & Authentification</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Propriétaire (Owner / Organisation)</label>
                <input
                  type="text"
                  value={config.owner}
                  onChange={(e) => setConfig({ ...config, owner: e.target.value })}
                  placeholder="ex: collegeisaacnewton9-boop"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-hidden font-mono text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom du Dépôt (Repository)</label>
                <input
                  type="text"
                  value={config.repo}
                  onChange={(e) => setConfig({ ...config, repo: e.target.value })}
                  placeholder="ex: college-isaac-newton"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-hidden font-mono text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Branche cible</label>
                <div className="relative">
                  <GitBranch className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={config.branch}
                    onChange={(e) => setConfig({ ...config, branch: e.target.value })}
                    placeholder="main"
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-hidden font-mono text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Personal Access Token (PAT)</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={config.token}
                    onChange={(e) => setConfig({ ...config, token: e.target.value })}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    className="w-full pl-8 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-hidden font-mono text-xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Custom Commit Message */}
            <div className="text-xs">
              <label className="block font-semibold text-slate-700 mb-1">Message du commit d’exportation</label>
              <input
                type="text"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="Description des modifications apportées..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-hidden text-xs"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-[11px] text-slate-400">
                Token stocké de façon sécurisée localement pour les synchronisations.
              </p>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Enregistrer la Configuration</span>
              </button>
            </div>
          </form>

          {/* Right Column: SYNC ACTION PANEL WITH VISUAL LOADER (5 cols) */}
          <div className="lg:col-span-5 bg-linear-to-b from-blue-900/5 to-amber-500/5 rounded-2xl p-5 border border-blue-100 flex flex-col justify-between space-y-4">
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-900 flex items-center gap-1.5">
                  <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
                  <span>Export & Déploiement GitHub</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium">REST API</span>
              </div>

              <h4 className="font-serif font-bold text-slate-900 text-base">
                Pousser les Fichiers Sources
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cliquez pour compiler l'état actuel de votre application et envoyer les fichiers sources (composants, pages, styles, serveur Express) directement vers votre dépôt GitHub.
              </p>
            </div>

            {/* Visual Progress Loader (Displays live when syncing) */}
            {isSyncing && (
              <div className="bg-white rounded-xl p-3.5 border border-blue-200 shadow-2xs space-y-2 animate-fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                    <span>{syncStage || 'Traitement en cours...'}</span>
                  </span>
                  <span className="font-mono font-bold text-blue-900 text-[11px]">{syncProgress}%</span>
                </div>

                {/* Animated Progress Bar */}
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-full bg-linear-to-r from-blue-600 via-indigo-600 to-amber-500 transition-all duration-300 rounded-full"
                    style={{ width: `${syncProgress}%` }}
                  />
                </div>
                
                <p className="text-[10px] text-slate-400 italic">
                  Veuillez patienter pendant l'authentification et l'envoi des sources...
                </p>
              </div>
            )}

            {/* MAIN BUTTON: 'Synchroniser avec GitHub' WITH DEDICATED LOADER */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleSyncToGitHub}
                disabled={isSyncing}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
                  isSyncing
                    ? 'bg-blue-950 text-white cursor-not-allowed opacity-90'
                    : 'bg-blue-900 hover:bg-blue-950 text-white hover:shadow-lg active:scale-98'
                }`}
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                    <span>Synchronisation en cours ({syncProgress}%)</span>
                  </>
                ) : (
                  <>
                    <Github className="w-4 h-4 text-amber-400" />
                    <span>Synchroniser avec GitHub</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSyncToGitHub}
                disabled={isSyncing}
                className="w-full py-2 px-3 rounded-lg border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSyncing ? (
                  <Loader2 className="w-3.5 h-3.5 text-slate-500 animate-spin" />
                ) : (
                  <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
                )}
                <span>Exporter les sources vers le dépôt</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* -------------------------------------------------------------
          SECTION 2 : PARAMÈTRES GÉNÉRAUX DU SITE (CMS & ALERTES)
      ------------------------------------------------------------- */}
      {cmsSettings && (
        <form onSubmit={handleSaveCmsSettings} className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-700 flex items-center justify-center shrink-0">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-slate-900 text-base sm:text-lg">
                  Paramètres Généraux du Collège & Alertes Publiques
                </h3>
                <p className="text-xs text-slate-500">
                  Configurez le bandeau d'alerte, les coordonnées officielles et le mot d'accueil du Directeur.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingCms}
              className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm self-start sm:self-auto"
            >
              {isSavingCms ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
              ) : (
                <Check className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>Enregistrer les Paramètres</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            
            {/* Banner Alert Config */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-amber-600" />
                  <span>Bandeau d'Information / Alerte Site</span>
                </span>
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
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Message affiché aux visiteurs</label>
                <input
                  type="text"
                  value={cmsSettings.announcement.text}
                  onChange={(e) => setCmsSettings({
                    ...cmsSettings,
                    announcement: { ...cmsSettings.announcement, text: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:outline-hidden text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 mb-1">Type de bandeau</label>
                  <select
                    value={cmsSettings.announcement.type}
                    onChange={(e) => setCmsSettings({
                      ...cmsSettings,
                      announcement: { ...cmsSettings.announcement, type: e.target.value as any }
                    })}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:outline-hidden text-xs"
                  >
                    <option value="info">Information (Bleu Institutionnel)</option>
                    <option value="warning">Important (Ambre Attention)</option>
                    <option value="urgent">Urgent (Rouge Alerte)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Libellé du bouton</label>
                  <input
                    type="text"
                    value={cmsSettings.announcement.linkText || ''}
                    onChange={(e) => setCmsSettings({
                      ...cmsSettings,
                      announcement: { ...cmsSettings.announcement, linkText: e.target.value }
                    })}
                    placeholder="ex: Formulaire"
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:outline-hidden text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Campaign Status Config */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Statut de la Campagne d'Admissions</span>
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
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600" />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 mb-1">Année Scolaire</label>
                  <input
                    type="text"
                    value={cmsSettings.admissionsStatus.currentSchoolYear}
                    onChange={(e) => setCmsSettings({
                      ...cmsSettings,
                      admissionsStatus: { ...cmsSettings.admissionsStatus, currentSchoolYear: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:outline-hidden text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Date limite / Consigne</label>
                  <input
                    type="text"
                    value={cmsSettings.admissionsStatus.deadlineNotice}
                    onChange={(e) => setCmsSettings({
                      ...cmsSettings,
                      admissionsStatus: { ...cmsSettings.admissionsStatus, deadlineNotice: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:outline-hidden text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Devise de l'Établissement</label>
                <input
                  type="text"
                  value={cmsSettings.schoolMotto}
                  onChange={(e) => setCmsSettings({
                    ...cmsSettings,
                    schoolMotto: e.target.value
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:outline-hidden text-xs font-serif italic"
                />
              </div>
            </div>

            {/* Official Contact Coordinates */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 md:col-span-2">
              <span className="font-semibold text-slate-900 block">
                Coordonnées Officielles du Secrétariat (Affichage Global)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Téléphone Principal</label>
                  <input
                    type="text"
                    value={cmsSettings.contactInfo.phone}
                    onChange={(e) => setCmsSettings({
                      ...cmsSettings,
                      contactInfo: { ...cmsSettings.contactInfo, phone: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:outline-hidden font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">E-mail Institutionnel</label>
                  <input
                    type="email"
                    value={cmsSettings.contactInfo.email}
                    onChange={(e) => setCmsSettings({
                      ...cmsSettings,
                      contactInfo: { ...cmsSettings.contactInfo, email: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:outline-hidden text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Adresse Officielle</label>
                  <input
                    type="text"
                    value={cmsSettings.contactInfo.address}
                    onChange={(e) => setCmsSettings({
                      ...cmsSettings,
                      contactInfo: { ...cmsSettings.contactInfo, address: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:outline-hidden text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Mot d'Accueil de la Direction</label>
                <textarea
                  rows={2}
                  value={cmsSettings.directorWelcome}
                  onChange={(e) => setCmsSettings({
                    ...cmsSettings,
                    directorWelcome: e.target.value
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:outline-hidden text-xs leading-relaxed"
                />
              </div>
            </div>

          </div>

        </form>
      )}

    </div>
  );
};
