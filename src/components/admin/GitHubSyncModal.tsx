import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  Info, 
  X, 
  Key, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { githubService, GitHubRepoConfig, DEFAULT_GITHUB_CONFIG } from '../../services/githubService';

interface GitHubSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubSyncModal: React.FC<GitHubSyncModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<GitHubRepoConfig>(DEFAULT_GITHUB_CONFIG);
  const [commitMessage, setCommitMessage] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStage, setSyncStage] = useState('');
  const [syncProgress, setSyncProgress] = useState(0);
  const [statusResult, setStatusResult] = useState<{
    success: boolean;
    message: string;
    commitSha?: string;
  } | null>(null);

  // Load persisted configuration from LocalStorage and Remote PostgreSQL backend
  useEffect(() => {
    if (!isOpen) return;
    setStatusResult(null);

    // 1. Initial immediate load from local storage / defaults
    const local = githubService.getConfig();
    setConfig(local);

    // 2. Fetch remote persisted config from PostgreSQL backend
    githubService.fetchRemoteConfig().then((remote) => {
      if (remote) {
        setConfig((prev) => ({ ...prev, ...remote }));
      }
    }).catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  // Real-time input updates with automatic persistence
  const handleChangeField = (field: keyof GitHubRepoConfig, value: string) => {
    const updated = { ...config, [field]: value };
    setConfig(updated);
    githubService.saveConfig({ [field]: value });
  };

  // Launch synchronization
  const handleLaunchSync = async () => {
    if (!config.token || !config.token.trim()) {
      setStatusResult({
        success: false,
        message: 'Veuillez saisir un Personal Access Token (PAT) GitHub valide avec portée repo.',
      });
      return;
    }

    if (!config.owner.trim() || !config.repo.trim()) {
      setStatusResult({
        success: false,
        message: 'Veuillez préciser le propriétaire et le nom du dépôt GitHub.',
      });
      return;
    }

    setIsSyncing(true);
    setStatusResult(null);
    setSyncProgress(10);
    setSyncStage('Vérification des droits et du dépôt GitHub...');

    // Persist full current form values
    githubService.saveConfig(config);

    const effectiveCommitMessage = commitMessage.trim() || 
      `Mise à jour synchronisée depuis le SI Collège Isaac Newton - ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;

    try {
      const result = await githubService.syncToGitHub(
        config,
        effectiveCommitMessage,
        (stage, progress) => {
          setSyncStage(stage);
          setSyncProgress(progress);
        }
      );

      setStatusResult({
        success: true,
        message: 'Toutes les sources du SI Scolaire ont été synchronisées et poussées vers votre dépôt GitHub avec succès !',
        commitSha: result.commitSha,
      });
      setCommitMessage('');
    } catch (err: any) {
      setStatusResult({
        success: false,
        message: err.message || 'Erreur lors de la synchronisation vers GitHub. Vérifiez les permissions de votre PAT.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="github-modal-title"
    >
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-xl sm:max-w-2xl w-full p-5 sm:p-7 space-y-5 animate-scale-in my-auto">
        
        {/* TOP HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200/70 flex items-center justify-center text-blue-600 shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div className="w-10 h-10 rounded-2xl bg-slate-950 flex items-center justify-center text-emerald-400 shrink-0 shadow-sm">
              <GitBranch className="w-5 h-5" />
            </div>
            <h3 id="github-modal-title" className="font-bold text-slate-900 text-lg sm:text-xl tracking-tight">
              Exporter et Synchroniser vers GitHub
            </h3>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Fermer la fenêtre"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* DARK HERO BANNER */}
        <div className="bg-[#0e131f] rounded-2xl p-4 sm:p-5 text-white border border-slate-800 flex items-start gap-3.5 shadow-inner">
          <div className="w-11 h-11 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-emerald-400 shrink-0">
            <GitBranch className="w-5 h-5" />
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white text-sm sm:text-base">
                Synchronisation des sources du SI Scolaire
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-400 border border-emerald-500/30">
                Delta Express
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950/90 text-indigo-300 border border-indigo-500/30">
                Dev Workstation
              </span>
            </div>
            <p className="text-xs text-slate-400 font-light leading-relaxed">
              Différentiel automatique et commit instantané sur votre dépôt institutionnel sécurisé.
            </p>
          </div>
        </div>

        {/* FORM CONTENT */}
        <div className="space-y-4">
          
          {/* FIELD 1: TOKEN D'ACCÈS PERSONNEL GITHUB (PAT) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700">
                <Key className="w-3.5 h-3.5 text-slate-500" />
                <span>TOKEN D'ACCÈS PERSONNEL GITHUB (PAT)</span>
                <span className="text-rose-500 font-bold">*</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-amber-300 bg-amber-50 text-amber-700">
                Requis
              </span>
            </div>

            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={config.token}
                onChange={(e) => handleChangeField('token', e.target.value)}
                placeholder="ghp_..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 font-mono text-xs sm:text-sm focus:outline-none focus:border-blue-900 focus:bg-white pr-10 transition-colors shadow-xs"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1"
                title={showToken ? 'Masquer le token' : 'Afficher le token'}
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Classic PAT avec portée repo (lecture / écriture). Enregistrement et persistance automatique.
            </p>
          </div>

          {/* ROW 2: PROPRIÉTAIRE / ORGANISATION & NOM DU DÉPÔT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                PROPRIÉTAIRE / ORGANISATION <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={config.owner}
                onChange={(e) => handleChangeField('owner', e.target.value)}
                placeholder="Ex: collegeisaacnewton9-boop ou Jackito46"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-xs sm:text-sm font-semibold focus:outline-none focus:border-blue-900 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                NOM DU DÉPÔT <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={config.repo}
                onChange={(e) => handleChangeField('repo', e.target.value)}
                placeholder="Ex: college-isaac-newton"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-xs sm:text-sm font-semibold focus:outline-none focus:border-blue-900 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* ROW 3: BRANCHE CIBLE & MESSAGE DU COMMIT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                BRANCHE CIBLE
              </label>
              <input
                type="text"
                value={config.branch}
                onChange={(e) => handleChangeField('branch', e.target.value)}
                placeholder="main"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 font-mono text-xs sm:text-sm font-bold focus:outline-none focus:border-blue-900 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                MESSAGE DU COMMIT (OPTIONNEL)
              </label>
              <input
                type="text"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="Mise à jour synchronisée depuis le SI Collège Isaac Newton..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-blue-900 focus:bg-white transition-colors"
              />
            </div>
          </div>

        </div>

        {/* PROGRESS BAR DURING SYNC */}
        {isSyncing && (
          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-900 text-white border border-slate-800 animate-pulse">
            <div className="flex justify-between text-xs font-bold text-slate-200">
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span>{syncStage}</span>
              </span>
              <span className="font-mono text-emerald-400">{syncProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                style={{ width: `${syncProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* STATUS RESULT BANNER */}
        {statusResult && (
          <div className={`p-4 rounded-2xl text-xs sm:text-sm flex items-start gap-3 border ${
            statusResult.success
              ? 'bg-emerald-50 text-emerald-950 border-emerald-200'
              : 'bg-rose-50 text-rose-950 border-rose-200'
          }`}>
            {statusResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className="font-bold">{statusResult.message}</p>
              {statusResult.commitSha && (
                <p className="font-mono text-xs text-slate-600">
                  Dernier Commit SHA : <span className="font-bold text-slate-900">{statusResult.commitSha}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* FOOTER ACTIONS */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            Fermer
          </button>

          <button
            type="button"
            onClick={handleLaunchSync}
            disabled={isSyncing}
            className="px-6 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-slate-900/10 disabled:opacity-50"
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Synchronisation en cours...</span>
              </>
            ) : (
              <>
                <GitBranch className="w-4 h-4 text-emerald-400" />
                <span>Lancer la Synchronisation</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
