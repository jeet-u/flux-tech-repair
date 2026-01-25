import path from 'node:path';
import { ConfirmInput, Spinner } from '@inkjs/ui';
import { Box, Text } from 'ink';
import { useCallback, useEffect, useReducer } from 'react';
import { AUTO_EXIT_DELAY } from './constants';
import type { UpdateOptions } from './constants/update';
import { usePressAnyKey, useRetimer } from './hooks';
import { runBackup } from './utils/backup-operations';
import { statusEffects } from './utils/update-effects';
import { abortMerge } from './utils/update-operations';
import { createInitialState, updateReducer } from './utils/update-reducer';

interface UpdateAppProps {
  checkOnly?: boolean;
  skipBackup?: boolean;
  force?: boolean;
  showReturnHint?: boolean;
  onComplete?: () => void;
}

export function UpdateApp({
  checkOnly = false,
  skipBackup = false,
  force = false,
  showReturnHint = false,
  onComplete,
}: UpdateAppProps) {
  const options: UpdateOptions = { checkOnly, skipBackup, force };
  const [state, dispatch] = useReducer(updateReducer, options, createInitialState);

  const { status, gitStatus, updateInfo, mergeResult, backupFile, error, options: stateOptions } = state;
  const retimer = useRetimer();

  // Unified completion handling
  const handleComplete = useCallback(() => {
    if (!showReturnHint) {
      retimer(setTimeout(() => onComplete?.(), AUTO_EXIT_DELAY));
    }
  }, [showReturnHint, onComplete, retimer]);

  // Auto-complete on terminal states
  useEffect(() => {
    if (status === 'up-to-date' || status === 'done' || status === 'error') {
      handleComplete();
    }
  }, [status, handleComplete]);

  // checkOnly mode completes on preview state
  useEffect(() => {
    if (status === 'preview' && stateOptions.checkOnly) {
      handleComplete();
    }
  }, [status, stateOptions.checkOnly, handleComplete]);

  // Core: single effect handles all side effects
  useEffect(() => {
    const effect = statusEffects[status];
    if (!effect) return;
    return effect(state, dispatch);
  }, [status, state]);

  // Auto-confirm in force mode
  useEffect(() => {
    if (status === 'preview' && stateOptions.force && !stateOptions.checkOnly) {
      dispatch({ type: 'UPDATE_CONFIRM' });
    }
  }, [status, stateOptions.force, stateOptions.checkOnly]);

  // Interaction handlers
  const handleBackupConfirm = useCallback(() => {
    dispatch({ type: 'BACKUP_CONFIRM' });
    try {
      const result = runBackup(true);
      dispatch({ type: 'BACKUP_DONE', backupFile: path.basename(result.backupFile) });
    } catch (err) {
      dispatch({ type: 'ERROR', error: `Backup failed: ${err instanceof Error ? err.message : String(err)}` });
    }
  }, []);

  const handleBackupSkip = useCallback(() => dispatch({ type: 'BACKUP_SKIP' }), []);
  const handleUpdateConfirm = useCallback(() => dispatch({ type: 'UPDATE_CONFIRM' }), []);
  const handleUpdateCancel = useCallback(() => onComplete?.(), [onComplete]);

  const handleAbortMerge = useCallback(() => {
    const success = abortMerge();
    if (success) {
      onComplete?.();
    } else {
      dispatch({ type: 'ERROR', error: 'Unable to abort merge. Please run git merge --abort manually.' });
    }
  }, [onComplete]);

  // Press any key to return to menu
  usePressAnyKey(
    (status === 'done' ||
      status === 'error' ||
      status === 'up-to-date' ||
      status === 'dirty-warning' ||
      (status === 'preview' && stateOptions.checkOnly)) &&
      showReturnHint,
    () => {
      onComplete?.();
    },
  );

  return (
    <Box flexDirection="column">
      {/* Checking status */}
      {status === 'checking' && (
        <Box>
          <Spinner label="Checking Git status..." />
        </Box>
      )}

      {/* Dirty warning */}
      {status === 'dirty-warning' && gitStatus && (
        <Box flexDirection="column">
          <Text color="yellow" bold>
            Uncommitted changes in the workspace
          </Text>
          <Box marginTop={1} flexDirection="column">
            {gitStatus.uncommittedFiles.slice(0, 5).map((file) => (
              <Text key={file} dimColor>
                {'  '}- {file}
              </Text>
            ))}
            {gitStatus.uncommittedFiles.length > 5 && (
              <Text dimColor>
                {'  '}... {gitStatus.uncommittedFiles.length - 5} more files
              </Text>
            )}
          </Box>
          <Box marginTop={1}>
            <Text>Please commit or stash your changes first:</Text>
          </Box>
          <Box marginTop={1} flexDirection="column">
            <Text dimColor>{'  '}git add . && git commit -m "save changes"</Text>
            <Text dimColor>{'  '}# or</Text>
            <Text dimColor>{'  '}git stash</Text>
          </Box>
          <Box marginTop={1}>
            <Text dimColor>Tip: use --force to skip this check (not recommended)</Text>
          </Box>
          {showReturnHint && (
            <Box marginTop={1}>
              <Text dimColor>Press any key to return to main menu...</Text>
            </Box>
          )}
        </Box>
      )}

      {/* Backup confirmation */}
      {status === 'backup-confirm' && (
        <Box flexDirection="column">
          <Text>Back up current content before updating?</Text>
          <Box marginTop={1}>
            <ConfirmInput onConfirm={handleBackupConfirm} onCancel={handleBackupSkip} />
          </Box>
          <Box marginTop={1}>
            <Text dimColor>Tip: use --skip-backup to skip this prompt</Text>
          </Box>
        </Box>
      )}

      {/* Backing up */}
      {status === 'backing-up' && (
        <Box>
          <Spinner label="Backing up..." />
        </Box>
      )}

      {/* Fetching */}
      {status === 'fetching' && (
        <Box>
          <Spinner label="Fetching updates..." />
        </Box>
      )}

      {/* Preview */}
      {status === 'preview' && updateInfo && (
        <Box flexDirection="column">
          {backupFile && (
            <Box marginBottom={1}>
              <Text color="green">
                {'  '}+ Backup completed: {backupFile}
              </Text>
            </Box>
          )}

          <Text bold>Found {updateInfo.behindCount} new commits:</Text>
          <Box marginTop={1} flexDirection="column">
            {updateInfo.commits.slice(0, 10).map((commit) => (
              <Text key={commit.hash}>
                <Text color="yellow">
                  {'  '}
                  {commit.hash}
                </Text>
                <Text> {commit.message}</Text>
                <Text dimColor> ({commit.date})</Text>
              </Text>
            ))}
            {updateInfo.commits.length > 10 && (
              <Text dimColor>
                {'  '}... {updateInfo.commits.length - 10} more commits
              </Text>
            )}
          </Box>

          {updateInfo.aheadCount > 0 && (
            <Box marginTop={1}>
              <Text color="yellow">Tip: local has {updateInfo.aheadCount} commits more than upstream template</Text>
            </Box>
          )}

          {stateOptions.checkOnly ? (
            <Box marginTop={1}>
              <Text dimColor>This is check-only mode. No updates were applied</Text>
              {showReturnHint && (
                <Box marginTop={1}>
                  <Text dimColor>Press any key to return to main menu...</Text>
                </Box>
              )}
            </Box>
          ) : (
            !stateOptions.force && (
              <Box marginTop={1} flexDirection="column">
                <Text>Confirm update to the latest version?</Text>
                <ConfirmInput onConfirm={handleUpdateConfirm} onCancel={handleUpdateCancel} />
              </Box>
            )
          )}
        </Box>
      )}

      {/* Merging */}
      {status === 'merging' && (
        <Box>
          <Spinner label="Merging updates..." />
        </Box>
      )}

      {/* Installing */}
      {status === 'installing' && (
        <Box>
          <Spinner label="Installing dependencies..." />
        </Box>
      )}

      {/* Done */}
      {status === 'done' && (
        <Box flexDirection="column">
          <Text bold color="green">
            Update completed
          </Text>
          {backupFile && (
            <Text>
              Backup file: <Text color="cyan">{backupFile}</Text>
            </Text>
          )}
          <Box marginTop={1} flexDirection="column">
            <Text dimColor>Next steps:</Text>
            <Text dimColor>{'  '}pnpm dev # start dev server to test</Text>
          </Box>
          {showReturnHint && (
            <Box marginTop={1}>
              <Text dimColor>Press any key to return to main menu...</Text>
            </Box>
          )}
        </Box>
      )}

      {/* Up to date */}
      {status === 'up-to-date' && (
        <Box flexDirection="column">
          <Text bold color="green">
            Already up to date
          </Text>
          <Text>
            Current version: <Text color="cyan">{updateInfo?.currentVersion}</Text>
          </Text>
          {showReturnHint && (
            <Box marginTop={1}>
              <Text dimColor>Press any key to return to main menu...</Text>
            </Box>
          )}
        </Box>
      )}

      {/* Conflict */}
      {status === 'conflict' && mergeResult && (
        <Box flexDirection="column">
          <Text bold color="yellow">
            Merge conflicts found
          </Text>
          <Box marginTop={1} flexDirection="column">
            <Text>Conflicting files:</Text>
            {mergeResult.conflictFiles.map((file) => (
              <Text key={file} color="red">
                {'  '}- {file}
              </Text>
            ))}
          </Box>
          <Box marginTop={1} flexDirection="column">
            <Text>You can:</Text>
            <Text dimColor>{'  '}1. Resolve conflicts and then run: git add . && git commit</Text>
            <Text dimColor>{'  '}2. Abort the merge and restore the pre-update state</Text>
          </Box>
          {backupFile && (
            <Box marginTop={1}>
              <Text>
                Backup file: <Text color="cyan">{backupFile}</Text>
              </Text>
            </Box>
          )}
          <Box marginTop={1} flexDirection="column">
            <Text>Abort the merge?</Text>
            <ConfirmInput onConfirm={handleAbortMerge} onCancel={() => onComplete?.()} />
          </Box>
        </Box>
      )}

      {/* Error */}
      {status === 'error' && (
        <Box flexDirection="column">
          <Text bold color="red">
            Update failed
          </Text>
          <Text color="red">{error}</Text>
          {showReturnHint && (
            <Box marginTop={1}>
              <Text dimColor>Press any key to return to main menu...</Text>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
