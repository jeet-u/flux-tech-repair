/** Backup type */
export type BackupType = 'full' | 'basic';

/** Manifest application name */
export const MANIFEST_NAME = 'jeet-u-backup';

/** Manifest filename */
export const MANIFEST_FILENAME = 'manifest.json';

/** Backup file extension */
export const BACKUP_FILE_EXTENSION = '.tar.gz';

/** Temporary backup directory prefix */
export const TEMP_DIR_PREFIX = '.tmp-backup-';

/** Backup item configuration */
export interface BackupItem {
  /** Source path (relative to project root) */
  src: string;
  /** Target path in backup */
  dest: string;
  /** Display label */
  label: string;
  /** Whether required (included in basic mode) */
  required: boolean;
}

/** Backup item list */
export const BACKUP_ITEMS: BackupItem[] = [
  { src: 'src/content/blog', dest: 'content/blog', label: 'Blog Posts', required: true },
  { src: 'config/site.yaml', dest: 'config/site.yaml', label: 'Site Configuration', required: true },
  { src: 'src/pages/about.md', dest: 'pages/about.md', label: 'About Page', required: true },
  { src: 'public/img', dest: 'img', label: 'User Images', required: true },
  { src: '.env', dest: 'env', label: 'Environment Variables', required: true },
  // Additional items for full backup
  { src: 'public/favicon.ico', dest: 'favicon.ico', label: 'Website Icon', required: false },
  { src: 'src/assets/lqips.json', dest: 'assets/lqips.json', label: 'LQIP Data', required: false },
  { src: 'src/assets/similarities.json', dest: 'assets/similarities.json', label: 'Similarity Data', required: false },
  { src: 'src/assets/summaries.json', dest: 'assets/summaries.json', label: 'AI Summary Data', required: false },
];

/** Restore file mapping (auto-generated from BACKUP_ITEMS: backup path -> project path) */
export const RESTORE_MAP: Record<string, string> = Object.fromEntries(BACKUP_ITEMS.map((item) => [item.dest, item.src]));
