/**
 * Utilitaires de détection d'environnement :
 * - Poste de développement (Google AI Studio : ais-dev-*.run.app, ais-pre-*.run.app, localhost)
 * - Poste de Production réelle (site officiel : collegeisaacnewton.com, serveur de prod scolaire)
 */

export const isAIStudioOrDev = (): boolean => {
  if (typeof window === 'undefined') {
    return Boolean(import.meta.env.DEV);
  }
  const hostname = window.location.hostname.toLowerCase();

  // Environnement de développement Google AI Studio ou localhost
  if (
    hostname.includes('run.app') ||
    hostname.includes('aistudio') ||
    hostname.includes('localhost') ||
    hostname.includes('127.0.0.1') ||
    Boolean(import.meta.env.DEV)
  ) {
    return true;
  }

  return false;
};

export const isProductionEnvironment = (): boolean => {
  // Si on est dans Google AI Studio ou en local, nous sommes sur le poste de développement
  if (isAIStudioOrDev()) {
    return false;
  }

  if (typeof window === 'undefined') {
    return Boolean(import.meta.env.PROD);
  }

  const hostname = window.location.hostname.toLowerCase();
  if (
    hostname === 'collegeisaacnewton.com' ||
    hostname.endsWith('.collegeisaacnewton.com') ||
    hostname === 'www.collegeisaacnewton.com'
  ) {
    return true;
  }

  return Boolean(import.meta.env.PROD);
};

export const isDevEnvironment = (): boolean => {
  return isAIStudioOrDev();
};

/**
 * Règle essentielle : Depuis l'interface Google AI Studio en développement, le bouton
 * pour uploader les modifications sur le serveur (dépôt GitHub officiel) DOIT TOUJOURS
 * être proposé et accessible à l'administrateur.
 * Sur le poste en production réelle (collegeisaacnewton.com), il est masqué.
 */
export const shouldProposeGitHubOption = (): boolean => {
  // Toujours disponible dans Google AI Studio et en développement
  if (isAIStudioOrDev()) {
    return true;
  }
  // Masqué sur le poste en production réelle
  return false;
};

