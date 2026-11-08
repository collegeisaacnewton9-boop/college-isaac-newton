/**
 * Utilitaire de gestion dynamique des années académiques (Collège Isaac Newton)
 * 
 * L'année académique s'étend généralement de septembre de l'année N à juillet de l'année N+1.
 * Cette fonction calcule automatiquement l'année scolaire en cours de manière dynamique,
 * tout en offrant la possibilité de configurer une année de référence ou un décalage.
 */

/**
 * Retourne l'année académique actuelle sous format "YYYY-YYYY" (ex: "2026-2027")
 * @param referenceDate Date de référence optionnelle (par défaut la date courante)
 */
export function getCurrentAcademicYear(referenceDate?: Date): string {
  const date = referenceDate || new Date();
  const year = date.getFullYear();
  const month = date.getMonth(); // 0 = Janvier, 7 = Août, 8 = Septembre

  // À partir de septembre (mois 8), on démarre l'année YYYY-(YYYY+1)
  // De janvier à août, on est dans la seconde moitié de l'année scolaire (YYYY-1)-YYYY
  if (month >= 8) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
}

/**
 * Retourne l'année académique suivante (ex: "2027-2028")
 */
export function getNextAcademicYear(referenceDate?: Date): string {
  const current = getCurrentAcademicYear(referenceDate);
  const [startYear] = current.split('-').map(Number);
  return `${startYear + 1}-${startYear + 2}`;
}

/**
 * Retourne une liste ordonnée d'années académiques pour les sélecteurs
 */
export function getAvailableAcademicYears(count = 3): string[] {
  const current = getCurrentAcademicYear();
  const [startYear] = current.split('-').map(Number);
  
  const years: string[] = [];
  // Année précédente, courante, et suivante
  for (let i = -1; i < count - 1; i++) {
    years.push(`${startYear + i}-${startYear + i + 1}`);
  }
  return years;
}
