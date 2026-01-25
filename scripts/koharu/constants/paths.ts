import path from 'node:path';

/** Project root directory */
export const PROJECT_ROOT = path.resolve(import.meta.dirname, '../../..');

/** Backup storage directory */
export const BACKUP_DIR = path.join(PROJECT_ROOT, 'backups');
