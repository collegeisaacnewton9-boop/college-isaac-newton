import React, { useState } from 'react';
import { Download, Smartphone, X, Check, Apple, Sparkles } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'compact' | 'footer' | 'floating';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'compact'
}) => {
  const { isInstallable, isInstalled, isIOS, installApp } = usePWA();
  const [showIOSModal, setShowIOSModal] = useState<boolean>(false);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);

  // Si l'application tourne déjà en mode installé autonome, on masque le bouton
  if (isInstalled) {
    return null;
  }

  // Ne rien afficher si ni installable automatiquement ni sur iOS
  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (isInstallable) {
      setIsInstalling(true);
      try {
        await installApp();
      } finally {
        setIsInstalling(false);
      }
    }
  };

  return (
    <>
      {variant === 'header' && (
        <button
          onClick={handleInstallClick}
          disabled={isInstalling}
          title="Installer l'application sur votre écran d'accueil pour un accès rapide hors-ligne"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-full shadow-md transition-all transform hover:scale-105 active:scale-95 ${className}`}
        >
          {isIOS ? <Apple className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
          <span>Installer l'App</span>
        </button>
      )}

      {variant === 'compact' && (
        <button
          onClick={handleInstallClick}
          disabled={isInstalling}
          title="Installer l'application sur votre écran d'accueil (accès hors-ligne rapide)"
          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-700/50 hover:border-blue-500 transition-colors shadow-xs ${className}`}
        >
          {isIOS ? <Apple className="w-3 h-3 text-amber-400" /> : <Smartphone className="w-3 h-3 text-amber-400" />}
          <span>{isIOS ? 'App iOS' : 'Installer l\'App'}</span>
        </button>
      )}

      {variant === 'footer' && (
        <button
          onClick={handleInstallClick}
          disabled={isInstalling}
          className={`flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition ${className}`}
        >
          <Smartphone className="w-4 h-4 text-amber-400" />
          <div className="text-left">
            <p className="font-semibold text-white">Installer l'application PWA</p>
            <p className="text-[10px] text-slate-400">Accès rapide & consultation hors-ligne</p>
          </div>
        </button>
      )}

      {/* Guide modal d'installation pour les utilisateurs iPhone & iPad */}
      {showIOSModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
          onClick={() => setShowIOSModal(false)}
        >
          <div 
            className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 text-white shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
                <Apple className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Installer sur iPhone / iPad</h3>
                <p className="text-xs text-amber-400">Collège Isaac Newton · PWA</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5 p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold shrink-0 text-[11px]">1</span>
                <span>Dans Safari, appuyez sur le bouton <strong>Partager</strong> <span className="inline-block px-1.5 py-0.5 bg-slate-700 rounded text-[10px]">⎋</span> en bas de l'écran.</span>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold shrink-0 text-[11px]">2</span>
                <span>Faites défiler le menu vers le bas et sélectionnez <strong>Sur l'écran d'accueil</strong>.</span>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold shrink-0 text-[11px]">3</span>
                <span>Appuyez sur <strong>Ajouter</strong> en haut à droite. L'icône de l'école apparaîtra sur votre écran d'accueil avec cache hors-ligne !</span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-5 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md"
            >
              <Check className="w-4 h-4" />
              Compris
            </button>
          </div>
        </div>
      )}
    </>
  );
};
