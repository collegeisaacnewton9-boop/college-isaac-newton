import React from 'react';
import { WifiOff, Wifi, RefreshCw, X, ShieldCheck, Sparkles } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';

export const OfflineStatusBanner: React.FC = () => {
  const {
    isOnline,
    wasOffline,
    showOfflineNotice,
    dismissOfflineNotice,
    swUpdateAvailable,
    applyUpdate,
  } = usePWA();

  // Bannière de mise à jour du Service Worker si une nouvelle version est disponible
  if (swUpdateAvailable) {
    return (
      <div 
        role="alert"
        className="fixed bottom-4 right-4 z-50 max-w-md bg-gradient-to-r from-blue-900 to-indigo-900 border border-blue-400 text-white rounded-xl shadow-2xl p-4 flex items-center justify-between gap-4 animate-in slide-in-from-bottom duration-300"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg text-blue-300 shrink-0">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-300">Collège Isaac Newton</p>
            <p className="text-sm font-medium text-slate-100">Nouvelle version disponible en cache</p>
          </div>
        </div>
        <button
          onClick={applyUpdate}
          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shrink-0 shadow-md"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Mettre à jour
        </button>
      </div>
    );
  }

  // Ne rien afficher si connecté et aucune notification de reconnexion active
  if (isOnline && !wasOffline && !showOfflineNotice) {
    return null;
  }

  if (isOnline && showOfflineNotice && wasOffline) {
    return (
      <aside 
        aria-label="Notification de reconnexion internet"
        className="fixed top-0 inset-x-0 z-50 bg-emerald-700 text-white text-xs font-semibold py-2 px-4 shadow-md flex items-center justify-between animate-in fade-in duration-300"
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-emerald-800 rounded-full">
              <Wifi className="w-3.5 h-3.5 text-emerald-200" />
            </span>
            <span>
              <strong>Connexion internet rétablie :</strong> Les données du campus sont synchronisées en direct avec le serveur.
            </span>
          </div>
          <button
            onClick={dismissOfflineNotice}
            className="text-emerald-200 hover:text-white p-1 transition-colors"
            title="Masquer"
            aria-label="Fermer la notification de reconnexion"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </aside>
    );
  }

  if (!isOnline && showOfflineNotice) {
    return (
      <aside 
        aria-label="Information de mode hors-ligne"
        className="fixed top-0 inset-x-0 z-50 bg-amber-600 border-b border-amber-700 text-slate-950 text-xs py-2.5 px-4 shadow-lg animate-in slide-in-from-top duration-300"
      >
        <div className="max-w-7xl mx-auto w-full flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-amber-700/40 rounded-lg text-slate-950 shrink-0">
              <WifiOff className="w-4 h-4 animate-pulse" />
            </span>
            <div>
              <p className="font-bold text-slate-950 flex items-center gap-2">
                <span>Réseau instable / Mode Hors Ligne</span>
                <span className="inline-flex items-center gap-1 bg-amber-800/20 text-slate-900 border border-amber-800/30 text-[10px] px-1.5 py-0.5 rounded font-mono uppercase">
                  Port-au-Prince Cache
                </span>
              </p>
              <p className="text-[11px] text-slate-900 font-medium leading-tight">
                Le Service Worker assure la navigation continue : styles, scripts, photos du campus et contenus sont servis depuis votre cache local.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium bg-amber-700/30 px-2 py-0.5 rounded text-slate-950">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
              Navigation préservée
            </span>
            <button
              onClick={() => window.location.reload()}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-amber-300 text-[11px] font-bold rounded flex items-center gap-1 transition-colors shadow-xs"
            >
              <RefreshCw className="w-3 h-3" />
              Tester le réseau
            </button>
            <button
              onClick={dismissOfflineNotice}
              className="text-slate-900 hover:text-slate-950 p-1 transition-colors"
              title="Fermer"
              aria-label="Fermer l'alerte réseau"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    );
  }

  return null;
};
