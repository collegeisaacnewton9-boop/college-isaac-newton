/**
 * Utilitaires de détection d'environnement :
 * - Poste de développement (Google AI Studio : ais-dev-*.run.app, ais-pre-*.run.app, localhost)
 * - Poste de Production réelle (site officiel : collegeisaacnewton.com, serveur Coolify, VPS, etc.)
 */

export const getEnvironmentOverride = (): 'production' | 'development' | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('cin_force_env');
    if (stored === 'production' || stored === 'development') {
      return stored;
    }
  } catch {}
  return null;
};

export const setEnvironmentOverride = (env: 'production' | 'development' | 'auto'): void => {
  if (typeof window === 'undefined') return;
  try {
    if (env === 'auto') {
      localStorage.removeItem('cin_force_env');
    } else {
      localStorage.setItem('cin_force_env', env);
    }
    window.dispatchEvent(new Event('cin:env-changed'));
  } catch {}
};

export const isProductionEnvironment = (): boolean => {
  const override = getEnvironmentOverride();
  if (override === 'production') return true;
  if (override === 'development') return false;

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname.toLowerCase();
    
    // Domaine officiel de production
    if (
      hostname === 'collegeisaacnewton.com' ||
      hostname.endsWith('.collegeisaacnewton.com') ||
      hostname === 'www.collegeisaacnewton.com'
    ) {
      return true;
    }

    // Si nous sommes dans un build de production (npm run build) et pas dans l'environnement de dev AI Studio
    const isAiStudioBuild = hostname.startsWith('ais-dev-') || hostname.startsWith('ais-pre-') || hostname.includes('aistudio');
    if (Boolean(import.meta.env?.PROD) && !isAiStudioBuild && !hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
      return true;
    }
  }

  // Si on est dans Google AI Studio ou en local dev, nous sommes sur le poste de développement
  if (isAIStudioOrDev()) {
    return false;
  }

  return Boolean(import.meta.env?.PROD);
};

export const isAIStudioOrDev = (): boolean => {
  const override = getEnvironmentOverride();
  if (override === 'production') return false;
  if (override === 'development') return true;

  if (typeof window === 'undefined') {
    return Boolean(import.meta.env?.DEV);
  }
  const hostname = window.location.hostname.toLowerCase();

  // Sur le domaine officiel de production, nous ne sommes JAMAIS en dev
  if (
    hostname === 'collegeisaacnewton.com' ||
    hostname.endsWith('.collegeisaacnewton.com') ||
    hostname === 'www.collegeisaacnewton.com'
  ) {
    return false;
  }

  // Si l'utilisateur est en build de production sur un serveur distant (Coolify, VPS, IP...)
  if (Boolean(import.meta.env?.PROD) && !hostname.startsWith('ais-dev-') && !hostname.startsWith('ais-pre-') && !hostname.includes('aistudio') && !hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
    return false;
  }

  // Environnement de développement spécifique Google AI Studio ou localhost
  if (
    hostname.startsWith('ais-dev-') ||
    hostname.startsWith('ais-pre-') ||
    hostname.includes('aistudio') ||
    hostname.includes('localhost') ||
    hostname.includes('127.0.0.1') ||
    Boolean(import.meta.env?.DEV)
  ) {
    return true;
  }

  return false;
};

export const isDevEnvironment = (): boolean => {
  return isAIStudioOrDev();
};

/**
 * Règle essentielle : Depuis l'interface Google AI Studio en développement, le bouton
 * pour uploader les modifications sur le serveur (dépôt GitHub officiel) DOIT TOUJOURS
 * être proposé et accessible à l'administrateur.
 * Sur le poste en production réelle (collegeisaacnewton.com, serveur de prod), il est strictement masqué.
 */
export const shouldProposeGitHubOption = (): boolean => {
  // Masqué sur tout poste ou environnement en production
  if (isProductionEnvironment()) {
    return false;
  }
  // Disponible en développement Google AI Studio / local
  return isAIStudioOrDev();
};
