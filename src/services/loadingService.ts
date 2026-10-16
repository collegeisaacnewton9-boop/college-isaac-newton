/**
 * Global Loading Bar Service & Fetch Interceptor
 * Coordinates the animated top loading progress bar for navigation & API requests.
 */

type LoadingListener = (state: { isLoading: boolean; progress: number }) => void;

class LoadingService {
  private isLoading = false;
  private progress = 0;
  private listeners: Set<LoadingListener> = new Set();
  private intervalId: any = null;
  private activeRequests = 0;

  subscribe(listener: LoadingListener): () => void {
    this.listeners.add(listener);
    listener({ isLoading: this.isLoading, progress: this.progress });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      listener({ isLoading: this.isLoading, progress: this.progress });
    });
  }

  start() {
    this.activeRequests++;
    if (this.activeRequests === 1) {
      this.isLoading = true;
      this.progress = 15;
      this.notify();

      if (this.intervalId) clearInterval(this.intervalId);
      this.intervalId = setInterval(() => {
        if (this.progress < 85) {
          const step = Math.max(1, (90 - this.progress) * 0.1);
          this.progress = Math.min(85, this.progress + step);
          this.notify();
        }
      }, 150);
    }
  }

  triggerPageTransition() {
    this.start();
    setTimeout(() => {
      this.stop();
    }, 250);
  }

  stop() {
    if (this.activeRequests > 0) {
      this.activeRequests--;
    }
    if (this.activeRequests === 0) {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
      this.progress = 100;
      this.notify();

      setTimeout(() => {
        if (this.activeRequests === 0) {
          this.isLoading = false;
          this.progress = 0;
          this.notify();
        }
      }, 300);
    }
  }

  reset() {
    this.activeRequests = 0;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isLoading = false;
    this.progress = 0;
    this.notify();
  }
}

export const loadingService = new LoadingService();

/**
 * AppFetch: Wrapper around native fetch that drives the global loading bar
 * and automatically attaches authentication headers for protected endpoints.
 */
export async function appFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  loadingService.start();
  try {
    const options: RequestInit = { ...init };
    const headers = new Headers(options.headers || {});

    // Injection automatique du jeton d'authentification Bearer
    try {
      if (typeof window !== 'undefined') {
        const userRaw = localStorage.getItem('cin_auth_user_v1');
        if (userRaw) {
          const user = JSON.parse(userRaw);
          if (user && user.token && !headers.has('Authorization')) {
            headers.set('Authorization', `Bearer ${user.token}`);
          }
        }
      }
    } catch {}

    options.headers = headers;
    const res = await fetch(input, options);
    return res;
  } finally {
    loadingService.stop();
  }
}
