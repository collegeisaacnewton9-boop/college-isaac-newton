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
        return { ...DEFAULT_GITHUB_CONFIG, ...JSON.parse(stored) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_GITHUB_CONFIG;
  },

  saveConfig(config: Partial<GitHubRepoConfig>): GitHubRepoConfig {
    const current = this.getConfig();
    const updated = { ...current, ...config };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Fallback
    }
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
    try {
      const octokit = new Octokit({ auth: config.token });

      // Check user authentication
      const { data: user } = await octokit.rest.users.getAuthenticated();

      // Check repository access
      const { data: repo } = await octokit.rest.repos.get({
        owner: config.owner,
        repo: config.repo,
      });

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
        user: user.login,
        repoName: repo.full_name,
        defaultBranch: repo.default_branch,
        lastCommit,
      };
    } catch (err: any) {
      console.error('[GitHub Service Error]', err);
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

    const response = await fetch('/api/admin/github/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: config.token,
        owner: config.owner,
        repo: config.repo,
        branch: config.branch || 'main',
        message: commitMessage || 'Mise à jour automatique des fichiers sources - Collège Isaac Newton',
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || errData.message || 'Erreur lors de la synchronisation');
    }

    const result = await response.json();
    onProgress?.('Synchronisation terminée avec succès !', 100);

    return {
      success: true,
      commitSha: result.commitSha || 'latest',
      message: result.message || 'Synchronisation réussie avec GitHub',
    };
  },
};
