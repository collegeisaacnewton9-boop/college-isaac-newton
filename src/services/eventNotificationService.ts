import { SchoolEvent } from '../types';
import { toast } from 'sonner';

export interface ImminentEventAlert {
  event: SchoolEvent;
  hoursRemaining: number;
  timeRemainingFormatted: string;
  urgency: 'CRITICAL' | 'HIGH' | 'MODERATE';
  isOngoing: boolean;
}

const STORAGE_KEY_DISMISSED = 'cin_imminent_event_dismissed';
const inMemoryDismissed = new Set<string>();

function parseEventTimestamp(dateStr: string, isEnd = false): number {
  if (!dateStr) return 0;
  if (!dateStr.includes('T')) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const y = Number(parts[0]);
      const m = Number(parts[1]) - 1;
      const d = Number(parts[2]);
      if (isEnd) {
        return new Date(y, m, d, 23, 59, 59, 999).getTime();
      }
      return new Date(y, m, d, 0, 0, 0, 0).getTime();
    }
  }
  return new Date(dateStr).getTime();
}

export const eventNotificationService = {
  /**
   * Calcule les événements survenant ou expirant dans les prochaines 48 heures.
   * Exclut strictement les événements passés/écoulés.
   * Pour les périodes académiques longues (> 3 jours), alerte uniquement à l'ouverture (< 48h)
   * ou à la clôture imminente (< 48h), évitant les alertes d'urgence résiduelles sur 2 mois.
   */
  getImminentEvents(
    events: SchoolEvent[], 
    now = new Date(),
    options?: { filterDismissed?: boolean }
  ): ImminentEventAlert[] {
    const nowTime = now.getTime();
    const threshold48h = 48 * 60 * 60 * 1000;
    const maxShortEventDuration = 3 * 24 * 60 * 60 * 1000; // 3 jours

    return events
      .filter((evt) => {
        if (!evt.startDate) return false;
        if (options?.filterDismissed && this.isAlertDismissed(evt.id)) return false;

        const startTime = parseEventTimestamp(evt.startDate, false);
        const endTime = evt.endDate 
          ? parseEventTimestamp(evt.endDate, true) 
          : (evt.startDate.includes('T') ? startTime + 4 * 60 * 60 * 1000 : parseEventTimestamp(evt.startDate, true));

        // RÈGLE ABSOLUE : Un événement terminé/écoulé dans le passé ne déclenche JAMAIS d'alerte imminente
        if (endTime <= nowTime) {
          return false;
        }

        const diffStart = startTime - nowTime;
        const totalDuration = endTime - startTime;

        // Périodes académiques longues (> 3 jours, ex: 1er contrôle du 7 sept au 13 nov = 67 jours)
        // Ne doivent PAS alerter 24h/24 pendant 2 mois continus !
        // Elles alertent uniquement dans les 48h avant leur début OU les 48h avant leur clôture.
        if (totalDuration > maxShortEventDuration) {
          const isStartingSoon = diffStart > 0 && diffStart <= threshold48h;
          const diffEnd = endTime - nowTime;
          const isEndingSoon = diffEnd > 0 && diffEnd <= threshold48h;
          return isStartingSoon || isEndingSoon;
        }

        // Événements ponctuels ou courts (<= 3 jours) :
        // Événement dans moins de 48 heures OU actuellement en cours
        const isUpcomingWithin48h = diffStart > 0 && diffStart <= threshold48h;
        const isOngoing = diffStart <= 0 && endTime > nowTime;

        return isUpcomingWithin48h || isOngoing;
      })
      .map((evt) => {
        const startTime = parseEventTimestamp(evt.startDate, false);
        const endTime = evt.endDate 
          ? parseEventTimestamp(evt.endDate, true) 
          : (evt.startDate.includes('T') ? startTime + 4 * 60 * 60 * 1000 : parseEventTimestamp(evt.startDate, true));
        
        const diffStart = startTime - nowTime;
        const isOngoing = diffStart <= 0 && endTime > nowTime;
        const totalDuration = endTime - startTime;
        const isLongPeriod = totalDuration > maxShortEventDuration;

        const hoursRemaining = isOngoing 
          ? Math.max(0, Math.round((endTime - nowTime) / (1000 * 60 * 60)))
          : Math.max(0, Math.round(diffStart / (1000 * 60 * 60)));

        let timeRemainingFormatted = '';
        if (isOngoing) {
          if (isLongPeriod) {
            timeRemainingFormatted = hoursRemaining <= 24 
              ? `Clôture dans ${hoursRemaining}h` 
              : `Clôture dans ${Math.floor(hoursRemaining / 24)}j`;
          } else {
            timeRemainingFormatted = 'En cours aujourd’hui';
          }
        } else if (hoursRemaining < 1) {
          timeRemainingFormatted = 'Dans moins d’une heure';
        } else if (hoursRemaining === 1) {
          timeRemainingFormatted = 'Dans 1 heure';
        } else if (hoursRemaining < 24) {
          timeRemainingFormatted = `Dans ${hoursRemaining} heures`;
        } else {
          const days = Math.floor(hoursRemaining / 24);
          const remHours = hoursRemaining % 24;
          timeRemainingFormatted = remHours > 0 ? `Dans ${days}j ${remHours}h` : `Dans ${days}j`;
        }

        let urgency: 'CRITICAL' | 'HIGH' | 'MODERATE' = 'MODERATE';
        if (isOngoing || hoursRemaining <= 12) {
          urgency = 'CRITICAL';
        } else if (hoursRemaining <= 24) {
          urgency = 'HIGH';
        }

        return {
          event: evt,
          hoursRemaining,
          timeRemainingFormatted,
          urgency,
          isOngoing,
        };
      })
      .sort((a, b) => a.hoursRemaining - b.hoursRemaining);
  },

  /**
   * Détermine le statut temporel précis d'un événement (Passé, En cours, À venir).
   */
  getEventTemporalStatus(
    event: SchoolEvent, 
    now = new Date()
  ): 'UPCOMING' | 'ONGOING' | 'PAST' {
    if (!event.startDate) return 'UPCOMING';
    const nowTime = now.getTime();
    const startTime = parseEventTimestamp(event.startDate, false);
    const endTime = event.endDate 
      ? parseEventTimestamp(event.endDate, true) 
      : (event.startDate.includes('T') ? startTime + 4 * 3600 * 1000 : parseEventTimestamp(event.startDate, true));

    if (endTime <= nowTime) return 'PAST';
    if (startTime <= nowTime && endTime > nowTime) return 'ONGOING';
    return 'UPCOMING';
  },

  /**
   * Retourne les détails de présentation visuelle et les libellés de délai pour le badge temporel.
   */
  getEventTemporalDetails(
    event: SchoolEvent, 
    now = new Date()
  ): {
    status: 'UPCOMING' | 'ONGOING' | 'PAST';
    label: string;
    badgeClass: string;
    isPast: boolean;
    isOngoing: boolean;
    isUpcoming: boolean;
    daysDiff: number;
  } {
    const status = this.getEventTemporalStatus(event, now);
    const nowTime = now.getTime();
    const startTime = parseEventTimestamp(event.startDate, false);
    const endTime = event.endDate 
      ? parseEventTimestamp(event.endDate, true) 
      : (event.startDate.includes('T') ? startTime + 4 * 3600 * 1000 : parseEventTimestamp(event.startDate, true));

    if (status === 'PAST') {
      const daysAgo = Math.max(1, Math.floor((nowTime - endTime) / (1000 * 60 * 60 * 24)));
      const label = daysAgo === 1 ? 'Terminé hier' : `Écoulé il y a ${daysAgo} jours`;
      return {
        status: 'PAST',
        label,
        badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
        isPast: true,
        isOngoing: false,
        isUpcoming: false,
        daysDiff: daysAgo,
      };
    }

    if (status === 'ONGOING') {
      return {
        status: 'ONGOING',
        label: 'En cours aujourd’hui',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
        isPast: false,
        isOngoing: true,
        isUpcoming: false,
        daysDiff: 0,
      };
    }

    // UPCOMING
    const hoursDiff = Math.max(1, Math.round((startTime - nowTime) / (1000 * 60 * 60)));
    const daysDiff = Math.ceil((startTime - nowTime) / (1000 * 60 * 60 * 24));
    let label = '';
    if (hoursDiff <= 12) {
      label = `Imminent (< ${hoursDiff}h)`;
    } else if (hoursDiff <= 24) {
      label = 'Demain';
    } else if (daysDiff <= 2) {
      label = 'Dans 2 jours';
    } else {
      label = `À venir (dans ${daysDiff}j)`;
    }

    const badgeClass = hoursDiff <= 48
      ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
      : 'bg-blue-50 text-blue-800 border-blue-200 font-medium';

    return {
      status: 'UPCOMING',
      label,
      badgeClass,
      isPast: false,
      isOngoing: false,
      isUpcoming: true,
      daysDiff,
    };
  },

  /**
   * Vérifie si l'alerte a déjà été fermée ou notifiée durant la session courante.
   */
  isAlertDismissed(eventId: string): boolean {
    if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
      return inMemoryDismissed.has(eventId);
    }
    try {
      const raw = sessionStorage.getItem(`${STORAGE_KEY_DISMISSED}_${eventId}`);
      return Boolean(raw) || inMemoryDismissed.has(eventId);
    } catch {
      return inMemoryDismissed.has(eventId);
    }
  },

  dismissAlert(eventId: string): void {
    inMemoryDismissed.add(eventId);
    if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') return;
    try {
      sessionStorage.setItem(`${STORAGE_KEY_DISMISSED}_${eventId}`, Date.now().toString());
    } catch {}
  },

  clearDismissedAlerts(): void {
    inMemoryDismissed.clear();
    if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') return;
    try {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith(STORAGE_KEY_DISMISSED)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch {}
  },

  /**
   * Ouvre la modale de dernière minute / rappel depuis n'importe quel point de l'application.
   */
  openLastMinuteModal(event: SchoolEvent, tab: 'reminder' | 'edit' = 'reminder'): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cin:open-event-last-minute', {
        detail: { event, tab }
      }));
    }
  },

  /**
   * Déclenche une notification Sonner automatisée et interactive pour les événements < 48h.
   */
  checkAndNotifyImminentEvents(
    events: SchoolEvent[],
    options?: {
      isAdmin?: boolean;
      onQuickUpdate?: (event: SchoolEvent) => void;
      onSendReminder?: (event: SchoolEvent) => void;
      force?: boolean;
    }
  ): ImminentEventAlert[] {
    const alerts = this.getImminentEvents(events);
    if (alerts.length === 0) return [];

    alerts.forEach((alert) => {
      const { event, timeRemainingFormatted, hoursRemaining, isOngoing } = alert;
      const isDismissed = this.isAlertDismissed(event.id);

      if (!options?.force && isDismissed) {
        return;
      }

      this.dismissAlert(event.id);

      if (options?.isAdmin) {
        toast.warning(`⚡ Événement imminent (< 48h) : ${event.title}`, {
          description: `${isOngoing ? 'L’événement est actuellement en cours sur le campus' : `Échéance : ${timeRemainingFormatted} (${hoursRemaining}h)`}. Cliquez ci-dessous pour une mise à jour rapide ou envoyer un rappel.`,
          duration: 14000,
          action: {
            label: 'Mise à jour rapide',
            onClick: () => {
              if (options?.onQuickUpdate) {
                options.onQuickUpdate(event);
              } else {
                this.openLastMinuteModal(event, 'edit');
              }
            },
          },
        });
      } else {
        toast.info(`⏰ Événement à venir : ${event.title}`, {
          description: `${isOngoing ? 'En cours aujourd’hui sur le campus' : `Début prévu : ${timeRemainingFormatted}`}. Retrouvez tous les détails et consignes.`,
          duration: 10000,
          action: {
            label: 'Consulter l’événement',
            onClick: () => {
              if (options?.onSendReminder) {
                options.onSendReminder(event);
              } else if (options?.onQuickUpdate) {
                options.onQuickUpdate(event);
              } else {
                this.openLastMinuteModal(event, 'reminder');
              }
            },
          },
        });
      }
    });

    return alerts;
  },
};
