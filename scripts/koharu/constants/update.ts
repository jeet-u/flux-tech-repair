/** Upstream remote repository name */
export const UPSTREAM_REMOTE = 'upstream';

/** Upstream repository URL */
export const UPSTREAM_URL = 'https://github.com/cosZone/astro-koharu.git';

/** Main branch name */
export const MAIN_BRANCH = 'main';

/** Commit 信息 */
export interface CommitInfo {
  hash: string;
  message: string;
  date: string;
  author: string;
}

/** Git status information */
export interface GitStatusInfo {
  /** Current branch */
  currentBranch: string;
  /** Whether working directory is clean */
  isClean: boolean;
  /** Number of uncommitted files */
  uncommittedCount: number;
  /** List of unstaged files */
  uncommittedFiles: string[];
}

/** Update status information */
export interface UpdateInfo {
  /** Whether upstream is configured */
  hasUpstream: boolean;
  /** Number of commits local is behind upstream */
  behindCount: number;
  /** Number of commits local is ahead of upstream */
  aheadCount: number;
  /** List of new commits */
  commits: CommitInfo[];
  /** Current version */
  currentVersion: string;
  /** Latest version */
  latestVersion: string;
}

/** Merge result */
export interface MergeResult {
  success: boolean;
  /** Whether there are conflicts */
  hasConflict: boolean;
  /** List of conflicted files */
  conflictFiles: string[];
  /** Error message */
  error?: string;
}

// ============ State machine types ============

/** Update process status */
export type UpdateStatus =
  | 'checking' // Check Git status
  | 'dirty-warning' // Working directory has uncommitted changes
  | 'backup-confirm' // Confirm backup
  | 'backing-up' // Backing up
  | 'fetching' // Fetching updates
  | 'preview' // Show update preview
  | 'merging' // Merging
  | 'installing' // Installing dependencies
  | 'done' // Done
  | 'conflict' // Has conflicts
  | 'up-to-date' // Already up-to-date
  | 'error'; // Error

/** Update process configuration options */
export interface UpdateOptions {
  checkOnly: boolean;
  skipBackup: boolean;
  force: boolean;
}

/** State machine State */
export interface UpdateState {
  status: UpdateStatus;
  gitStatus: GitStatusInfo | null;
  updateInfo: UpdateInfo | null;
  mergeResult: MergeResult | null;
  backupFile: string;
  error: string;
  options: UpdateOptions;
}

/** State machine Action */
export type UpdateAction =
  | { type: 'GIT_CHECKED'; payload: GitStatusInfo }
  | { type: 'FETCHED'; payload: UpdateInfo }
  | { type: 'BACKUP_CONFIRM' }
  | { type: 'BACKUP_SKIP' }
  | { type: 'BACKUP_DONE'; backupFile: string }
  | { type: 'UPDATE_CONFIRM' }
  | { type: 'MERGED'; payload: MergeResult }
  | { type: 'INSTALLED' }
  | { type: 'ERROR'; error: string };
