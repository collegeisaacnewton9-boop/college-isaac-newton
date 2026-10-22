import { useState, useEffect, useCallback } from 'react';
import { applyServiceWorkerUpdate } from '../utils/registerServiceWorker';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export interface UsePWAResult {
  isOnline: boolean;
  wasOffline: boolean;
  isInstalled: boolean;
  isInstallable: boolean;
  isIOS: boolean;
  swUpdateAvailable: boolean;
  installApp: () => Promise<boolean>;
  applyUpdate: () => void;
  dismissOfflineNotice: () => void;
  showOfflineNotice: boolean;
}

export function usePWA(): UsePWAResult {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [wasOffline, setWasOffline] = useState<boolean>(false);
  const [showOfflineNotice, setShowOfflineNotice] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [swUpdateAvailable, setSwUpdateAvailable] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Détection du mode autonome (PWA déjà installée sur l'écran d'accueil)
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    // Détection des appareils iOS (iPhone / iPad / iPod)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Gestion du statut en ligne / hors ligne (crucial pour Port-au-Prince)
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineNotice(true); // Afficher brièvement le bandeau "Connexion rétablie"
      setTimeout(() => {
        setShowOfflineNotice(false);
      }, 5000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      setShowOfflineNotice(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initialiser l'état si déjà hors-ligne au chargement
    if (!navigator.onLine) {
      setIsOnline(false);
      setWasOffline(true);
      setShowOfflineNotice(true);
    }

    // Gestion du prompt d'installation PWA natif (Chrome / Android / Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      console.info('[PWA] Application installée avec succès sur le périphérique.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Écoute des mises à jour du Service Worker
    const handleSWUpdate = () => {
      setSwUpdateAvailable(true);
    };
    window.addEventListener('cin:sw-update-available', handleSWUpdate);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('cin:sw-update-available', handleSWUpdate);
    };
  }, []);

  const installApp = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        return true;
      }
    } catch (err) {
      console.warn('[PWA] Erreur lors de l\'installation :', err);
    }
    return false;
  }, [deferredPrompt]);

  const applyUpdate = useCallback(() => {
    applyServiceWorkerUpdate();
  }, []);

  const dismissOfflineNotice = useCallback(() => {
    setShowOfflineNotice(false);
  }, []);

  return {
    isOnline,
    wasOffline,
    isInstalled,
    isInstallable: !!deferredPrompt && !isInstalled,
    isIOS,
    swUpdateAvailable,
    installApp,
    applyUpdate,
    dismissOfflineNotice,
    showOfflineNotice,
  };
}
