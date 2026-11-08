/**
 * Service Worker Registration & Lifecycle Management
 * Optimisé pour la consultation hors-ligne à Port-au-Prince (Haïti)
 */

export interface SWRegistrationInfo {
  isRegistered: boolean;
  registration: ServiceWorkerRegistration | null;
  hasUpdate: boolean;
}

let registrationInstance: ServiceWorkerRegistration | null = null;

export function registerServiceWorker(onUpdateFound?: () => void): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.info('[Service Worker] Non supporté par ce navigateur.');
    return;
  }

  // Enregistrer le Service Worker après le chargement complet de la page pour ne pas bloquer le premier rendu critique
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      registrationInstance = registration;

      console.info('[Service Worker] Enregistré avec succès pour le Collège Isaac Newton (Scope: /)');

      // Vérifier si un nouveau Service Worker est en attente
      if (registration.waiting) {
        console.info('[Service Worker] Une nouvelle version est disponible.');
        onUpdateFound?.();
      }

      // Écouter les mises à jour détectées
      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.info('[Service Worker] Nouveau contenu disponible (mise à jour du cache).');
              onUpdateFound?.();
            } else {
              console.info('[Service Worker] Contenu mis en cache pour la première fois. Consultation hors-ligne active.');
            }
          }
        });
      });

      // Écouter les changements de contrôleur (mise à jour appliquée)
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          // Optionnel : ne pas forcer le rechargement brutal pour laisser l'utilisateur terminer sa lecture
        }
      });

    } catch (error: any) {
      console.warn('[Service Worker] Échec de l\'enregistrement :', error?.message || error);
    }
  });
}

/**
 * Déclenche l'activation immédiate du nouveau Service Worker en attente
 */
export function applyServiceWorkerUpdate(): void {
  if (registrationInstance && registrationInstance.waiting) {
    registrationInstance.waiting.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  }
}

/**
 * Vide complètement les caches du Service Worker (utile en cas de réinitialisation)
 */
export async function clearAppCaches(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  if ('caches' in window) {
    try {
      const keys = await window.caches.keys();
      await Promise.all(keys.map(k => window.caches.delete(k)));
      console.info('[Service Worker] Tous les caches locaux ont été réinitialisés.');
      return true;
    } catch (err) {
      console.warn('[Service Worker] Erreur lors du nettoyage des caches :', err);
      return false;
    }
  }
  return false;
}
