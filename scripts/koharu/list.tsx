import { Box, Text } from 'ink';
import { useEffect, useState } from 'react';
import { AUTO_EXIT_DELAY, BACKUP_DIR, type BackupInfo, getBackupList, usePressAnyKey, useRetimer } from './shared';

interface ListAppProps {
  showReturnHint?: boolean;
  onComplete?: () => void;
}

export function ListApp({ showReturnHint = false, onComplete }: ListAppProps) {
  const [backups] = useState<BackupInfo[]>(() => getBackupList());
  const retimer = useRetimer();

  // Listen for key press to return to main menu
  usePressAnyKey(showReturnHint, () => {
    onComplete?.();
  });

  // Auto exit if return hint is not shown
  useEffect(() => {
    if (!showReturnHint) {
      retimer(setTimeout(() => onComplete?.(), AUTO_EXIT_DELAY));
    }
    return () => retimer();
  }, [showReturnHint, onComplete, retimer]);

  if (backups.length === 0) {
    return (
      <Box flexDirection="column">
        <Text color="yellow">No backups found</Text>
        <Box marginTop={1}>
          <Text dimColor>Backup directory: {BACKUP_DIR}</Text>
        </Box>
        <Text dimColor>Use 'pnpm koharu backup' to create a backup</Text>
        {showReturnHint && (
          <Box marginTop={1}>
            <Text dimColor>Press any key to return to main menu...</Text>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box flexDirection="column">
        {backups.map((backup) => (
          <Box key={backup.name}>
            <Text color="green">{'  '}* </Text>
            <Text>{backup.name}</Text>
            <Text color="yellow"> {backup.sizeFormatted}</Text>
            {backup.type === 'full' && <Text color="cyan"> [Full]</Text>}
            {backup.type === 'basic' && <Text color="green"> [Basic]</Text>}
          </Box>
        ))}
      </Box>
      <Box marginTop={1}>
        <Text dimColor>{backups.length} total backups</Text>
      </Box>
      {showReturnHint && (
        <Box marginTop={1}>
          <Text dimColor>Press any key to return to main menu...</Text>
        </Box>
      )}
    </Box>
  );
}
