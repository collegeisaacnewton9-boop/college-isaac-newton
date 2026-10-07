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

export const eventNotificationService = {
  /**
   * Calcule les événements survenant ou expirant dans les prochaines 48 heures.
   */
  getImminentEvents(events: SchoolEvent[], now = new Date()): ImminentEventAlert[] {
    const nowTime = now.getTime();
    const threshold48h = 48 * 60 * 60 * 1000;

    return events
      .filter((evt) => {
        if (!evt.startDate) return false;
        const startTime = new Date(evt.startDate).getTime();
        const endTime = evt.endDate ? new Date(evt.endDate).getTime() : startTime + 4 * 60 * 60 * 1000;

        // Événement dans moins de 48 heures OU actuellement en cours
        const diffStart = startTime - nowTime;
        const isUpcomingWithin48h = diffStart > 0 && diffStart <= threshold48h;
        const isOngoing = diffStart <= 0 && endTime > nowTime;

        return isUpcomingWithin48h || isOngoing;
      })
      .map((evt) => {
        const startTime = new Date(evt.startDate).getTime();
        const endTime = evt.endDate ? new Date(evt.endDate).getTime() : startTime + 4 * 60 * 60 * 1000;
        const diffStart = startTime - nowTime;
        const isOngoing = diffStart <= 0 && endTime > nowTime;

        const hoursRemaining = isOngoing 
          ? Math.max(0, Math.round((endTime - nowTime) / (1000 * 60 * 60)))
          : Math.max(0, Math.round(diffStart / (1000 * 60 * 60)));

        let timeRemainingFormatted = '';
        if (isOngoing) {
          timeRemainingFormatted = 'En cours aujourd’hui';
        } else if (hoursRemaining < 1) {
          timeRemainingFormatted = 'Dans moins d’une heure';
        } else if (hoursRemaining === 1) {
          timeRemainingFormatted = 'Dans 1 heure';
        } else if (hoursRemaining < 24) {
          timeRemainingFormatted = `Dans ${hoursRemaining} heures`;
        } else {
          const days = Math.floor(hoursRemaining / 24);
          const remHours = hoursRemaining % 24;
          timeRemainingFormatted = `Dans ${days}j ${remHours}h`;
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
