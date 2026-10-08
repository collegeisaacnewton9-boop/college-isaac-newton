/**
 * Utilitaires de détection d'environnement et de configuration.
 * Sur les postes et environnements de Production (site officiel, serveurs de déploiement,
 * espace administratif de l'établissement scolaire), les options de développement
 * telles que la synchronisation GitHub de code source sont strictement désactivées et non proposées.
 */

export const isProductionEnvironment = (): boolean => {
  if (typeof window === 'undefined') {
    return Boolean(import.meta.env.PROD);
  }
  const hostname = window.location.hostname.toLowerCase();
  
  // Noms d'hôtes officiels de production
  if (
    hostname === 'collegeisaacnewton.com' ||
    hostname.endsWith('.collegeisaacnewton.com') ||
    hostname === 'www.collegeisaacnewton.com'
  ) {
    return true;
  }

  // Tout environnement compilé pour la production
  if (import.meta.env.PROD) {
    return true;
  }

  // Tout hôte distant non-local (postes et serveurs déployés)
  if (!hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
    return true;
  }

  return false;
};

export const isDevEnvironment = (): boolean => {
  return !isProductionEnvironment() && Boolean(import.meta.env.DEV);
};

/**
 * Règle de gouvernance : L'option de synchronisation GitHub ne doit JAMAIS
 * être proposée sur les postes en Production ni dans l'interface de gestion scolaire.
 */
export const shouldProposeGitHubOption = (): boolean => {
  // Strictement interdit et masqué en Production
  if (isProductionEnvironment()) {
    return false;
  }
  // Désactivé par défaut afin de ne jamais encombrer l'interface utilisateur
  return Boolean(import.meta.env.VITE_ENABLE_DEV_GITHUB_TOOLING === 'true');
};
