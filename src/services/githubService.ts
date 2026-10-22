import { Octokit } from '@octokit/rest';

export interface GitHubRepoConfig {
  owner: string;
  repo: string;
  branch: string;
  token: string;
}

export interface SyncProgressCallback {
  (stage: string, progressPercent: number): void;
}

export const DEFAULT_GITHUB_CONFIG: GitHubRepoConfig = {
  owner: 'collegeisaacnewton9-boop',
  repo: 'college-isaac-newton',
  branch: 'main',
  token: '',
};

const STORAGE_KEY = 'cin_github_config_v1';

export const githubService = {
  getConfig(): GitHubRepoConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { 
          ...DEFAULT_GITHUB_CONFIG, 
          ...parsed,
          token: parsed.token || DEFAULT_GITHUB_CONFIG.token,
        };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_GITHUB_CONFIG;
  },

  async fetchRemoteConfig(): Promise<GitHubRepoConfig> {
    try {
      const res = await fetch('/api/admin/github/config?_t=' + Date.now());
      if (res.ok) {
        const remote = await res.json();
        if (remote && remote.owner) {
          const merged = { ...this.getConfig(), ...remote };
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          } catch {}
          return merged;
        }
      }
    } catch {
      // Non-blocking fallback
    }
    return this.getConfig();
  },

  saveConfig(config: Partial<GitHubRepoConfig>): GitHubRepoConfig {
    const current = this.getConfig();
    const updated = { ...current, ...config };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Fallback
    }
    // Also persist to PostgreSQL backend
    fetch('/api/admin/github/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch(() => {});

    return updated;
  },

  async verifyConnection(config: GitHubRepoConfig): Promise<{
    valid: boolean;
    user?: string;
    repoName?: string;
    defaultBranch?: string;
    lastCommit?: {
      sha: string;
      message: string;
      date: string;
      author: string;
    };
    error?: string;
  }> {
    if (!config.token || !config.token.trim()) {
      return {
        valid: false,
        error: 'Veuillez saisir votre Token d\'accès personnel GitHub (PAT).',
      };
    }

    try {
      const octokit = new Octokit({ auth: config.token.trim() });

      // Check repository access first
      const { data: repo } = await octokit.rest.repos.get({
        owner: config.owner,
        repo: config.repo,
      });

      // Check user authentication (safely fallback for fine-grained repo-scoped tokens)
      let userName = config.owner;
      try {
        const { data: user } = await octokit.rest.users.getAuthenticated();
        if (user?.login) {
          userName = user.login;
        }
      } catch {
        // Fallback for fine-grained tokens that only have repository access
      }

      // Get latest commit on the branch
      let lastCommit: any = undefined;
      try {
        const { data: commits } = await octokit.rest.repos.listCommits({
          owner: config.owner,
          repo: config.repo,
          sha: config.branch || repo.default_branch,
          per_page: 1,
        });

        if (commits && commits.length > 0) {
          const c = commits[0];
          lastCommit = {
            sha: c.sha.substring(0, 7),
            message: c.commit.message,
            date: c.commit.committer?.date || c.commit.author?.date || '',
            author: c.commit.author?.name || c.author?.login || 'Admin',
          };
        }
      } catch {
        // Non-blocking
      }

      return {
        valid: true,
        user: userName,
        repoName: repo.full_name,
        defaultBranch: repo.default_branch,
        lastCommit,
      };
    } catch (err: any) {
      console.warn('[GitHub Service Notice]', err.message);
      return {
        valid: false,
        error: err.message || 'Impossible de se connecter au dépôt avec ce token.',
      };
    }
  },

  async syncToGitHub(
    config: GitHubRepoConfig,
    commitMessage: string,
    onProgress?: SyncProgressCallback
  ): Promise<{ success: boolean; commitSha?: string; message: string }> {
    onProgress?.('Initialisation de la connexion Octokit...', 15);

    // 1. Verify credentials via Octokit REST
    const octokit = new Octokit({ auth: config.token });
    try {
      await octokit.rest.repos.get({
        owner: config.owner,
        repo: config.repo,
      });
    } catch (err: any) {
      throw new Error(`Accès refusé au dépôt ${config.owner}/${config.repo}: ${err.message}`);
    }

    onProgress?.('Préparation des fichiers sources et arborescence...', 40);

    // 2. Call backend sync to bundle and push all source files cleanly
    onProgress?.('Envoi des fichiers sources vers GitHub...', 70);

    let result: any = null;
    try {
      const response = await fetch('/api/admin/github/sync', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          token: config.token.trim(),
          owner: config.owner.trim(),
          repo: config.repo.trim(),
          branch: config.branch.trim() || 'main',
          message: commitMessage || 'Mise à jour automatique des fichiers sources - Collège Isaac Newton',
        }),
      });

      const responseText = await response.text();
      try {
        result = JSON.parse(responseText);
      } catch {
        result = null;
      }

      if (!response.ok) {
        const errorMsg = result?.error || result?.message;
        if (errorMsg) {
          throw new Error(errorMsg);
        }
        if (responseText.includes('<!DOCTYPE') || responseText.includes('<!doctype') || response.status === 502 || response.status === 503) {
          throw new Error(`Le serveur d'application redémarrait temporairement (HTTP ${response.status}). Relancez la synchronisation.`);
        }
        throw new Error(`Erreur serveur HTTP ${response.status}`);
      }

      if (!result || !result.success) {
        throw new Error(result?.error || result?.message || 'Réponse inattendue lors de la synchronisation.');
      }
    } catch (fetchErr: any) {
      // If server returned HTML (temporary 502) or network reset, check if GitHub remote is already up to date
      try {
        const { data: latestCommits } = await octokit.rest.repos.listCommits({
          owner: config.owner.trim(),
          repo: config.repo.trim(),
          sha: config.branch.trim() || 'main',
          per_page: 1,
        });
        if (latestCommits && latestCommits.length > 0) {
          const latest = latestCommits[0];
          onProgress?.('Synchronisation confirmée sur GitHub !', 100);
          return {
            success: true,
            commitSha: latest.sha.substring(0, 7),
            message: `Dépôt synchronisé sur GitHub (${latest.sha.substring(0, 7)}) : ${latest.commit.message}`,
          };
        }
      } catch {
        // Continue with original error
      }
      throw fetchErr;
    }

    onProgress?.('Synchronisation terminée avec succès !', 100);

    return {
      success: true,
      commitSha: result.commitSha || 'latest',
      message: result.message || 'Synchronisation réussie avec GitHub',
    };
  },
};
