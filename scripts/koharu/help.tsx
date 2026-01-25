import { Box, Text } from 'ink';
import { useEffect } from 'react';
import { AUTO_EXIT_DELAY, usePressAnyKey, useRetimer } from './shared';

interface HelpAppProps {
  showReturnHint?: boolean;
  onComplete?: () => void;
}

export function HelpApp({ showReturnHint = false, onComplete }: HelpAppProps) {
  const retimer = useRetimer();

  // Listen for key press to return to main menu
  usePressAnyKey(showReturnHint, () => {
    onComplete?.();
  });

  // If not showing return hint, exit directly
  useEffect(() => {
    if (!showReturnHint) {
      retimer(setTimeout(() => onComplete?.(), AUTO_EXIT_DELAY));
    }
    return () => retimer();
  }, [showReturnHint, onComplete, retimer]);

  return (
    <Box flexDirection="column">
      <Box flexDirection="column" marginBottom={1}>
        <Text bold>Usage:</Text>
        <Text> pnpm koharu Interactive main menu</Text>
        <Text> pnpm koharu backup Backup blog content and configuration</Text>
        <Text> pnpm koharu restore Restore from backup</Text>
        <Text> pnpm koharu generate Generate content assets</Text>
        <Text> pnpm koharu clean Clean old backups</Text>
        <Text> pnpm koharu list View all backups</Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text bold>Backup options:</Text>
        <Text> --full Full backup (includes all images and assets)</Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text bold>Restore options:</Text>
        <Text> --latest Restore latest backup</Text>
        <Text> --dry-run Preview files to be restored</Text>
        <Text> --force Skip confirmation prompts</Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text bold>Clean options:</Text>
        <Text> --keep N Keep latest N backups, delete the rest</Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text bold>Generate options:</Text>
        <Text> pnpm koharu generate lqips Generate LQIP placeholders</Text>
        <Text> pnpm koharu generate similarities Generate similarity vectors</Text>
        <Text> pnpm koharu generate summaries Generate AI summaries</Text>
        <Text> pnpm koharu generate all Generate all</Text>
        <Text> --model {'<name>'} Specify LLM model</Text>
        <Text> --force Force regeneration</Text>
      </Box>

      <Box flexDirection="column">
        <Text bold>General options:</Text>
        <Text> --help, -h Display help information</Text>
      </Box>

      {showReturnHint && (
        <Box marginTop={1}>
          <Text dimColor>Press any key to return to main menu...</Text>
        </Box>
      )}
    </Box>
  );
}
