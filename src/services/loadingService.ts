/**
 * Global Loading Service
 * Coordinates progress feedback across page transitions and asynchronous API calls.
 */

type LoadingListener = (state: { isLoading: boolean; progress: number }) => void;

class LoadingService {
  private activeCount = 0;
  private listeners: Set<LoadingListener> = new Set();
  private progress = 0;
  private progressTimer: ReturnType<typeof setInterval> | null = null;

  subscribe(listener: LoadingListener): () => void {
    this.listeners.add(listener);
    listener({ isLoading: this.activeCount > 0, progress: this.progress });
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const isLoading = this.activeCount > 0;
    this.listeners.forEach((fn) => fn({ isLoading, progress: this.progress }));
  }

  startLoading() {
    this.activeCount++;
    if (this.activeCount === 1) {
      this.beginProgress();
    }
  }

  stopLoading() {
    this.activeCount = Math.max(0, this.activeCount - 1);
    if (this.activeCount === 0) {
      this.finishProgress();
    }
  }

  /**
   * Triggers a smooth top progress animation for client-side page navigation transitions
   */
  triggerPageTransition(durationMs = 400) {
    this.startLoading();
    setTimeout(() => {
      this.stopLoading();
    }, durationMs);
  }

  private beginProgress() {
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
    }
    // Initial start jump
    this.progress = 25;
    this.notify();

    // Natural incremental progress simulation while waiting for responses
    this.progressTimer = setInterval(() => {
      if (this.progress < 70) {
        this.progress += Math.floor(Math.random() * 10) + 5;
      } else if (this.progress < 88) {
        this.progress += Math.floor(Math.random() * 3) + 1;
      }
      this.notify();
    }, 150);
  }

  private finishProgress() {
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
    // Race to 100%
    this.progress = 100;
    this.notify();

    // Reset after fade-out transition completes
    setTimeout(() => {
      if (this.activeCount === 0) {
        this.progress = 0;
        this.notify();
      }
    }, 350);
  }
}

export const loadingService = new LoadingService();

/**
 * Global fetch wrapper that automatically hooks into the global top loading bar
 */
export async function appFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  loadingService.startLoading();
  try {
    return await fetch(input, init);
  } finally {
    loadingService.stopLoading();
  }
}
