import fs from 'node:fs';
import path from 'node:path';
import { Select } from '@inkjs/ui';
import { Box, render, Text, useApp } from 'ink';
import { useState } from 'react';
import { BackupApp } from './koharu/backup.js';
import { CleanApp } from './koharu/clean.js';
import { GenerateApp } from './koharu/generate.js';
import { HelpApp } from './koharu/help.js';
import { ListApp } from './koharu/list.js';
import { RestoreApp } from './koharu/restore.js';
import { BACKUP_DIR, getBackupList, parseArgs } from './koharu/shared.js';
import { UpdateApp } from './koharu/update.js';

const args = parseArgs();

// Display help
if (args.help) {
  console.log(`
koharu - jeet-u CLI

Usage:
  pnpm koharu              Interactive main menu
  pnpm koharu backup       Backup blog content and configuration
  pnpm koharu restore      Restore from backup
  pnpm koharu update       Update theme
  pnpm koharu clean        Clean old backups
  pnpm koharu list         View all backups
  pnpm koharu generate     Generate content assets

Backup options:
  --full                   Full backup (includes all images and assets)

Restore options:
  --latest                 Restore latest backup
  --dry-run                Preview files to be restored
  --force                  Skip confirmation prompts

Update options:
  --check                  Check for updates only (don't execute)
  --skip-backup            Skip backup step
  --force                  Skip confirmation prompts

Clean options:
  --keep N                 Keep latest N backups, delete the rest

Generate options:
  pnpm koharu generate lqips        Generate LQIP image placeholders
  pnpm koharu generate similarities Generate similarity vectors
  pnpm koharu generate summaries    Generate AI summaries
  pnpm koharu generate all          Generate all
  --model <name>                    Specify LLM model (for summaries)
  --force                           Force regeneration (for summaries)

General options:
  --help, -h               Display help information
`);
  process.exit(0);
}

type AppMode = 'menu' | 'backup' | 'restore' | 'update' | 'clean' | 'list' | 'help' | 'generate';

function KoharuApp() {
  const { exit } = useApp();
  // Determine whether entering from main menu (no command line arguments)
  const [fromMenu] = useState(() => !args.command);
  const [mode, setMode] = useState<AppMode>(() => {
    // Determine initial mode based on command line arguments
    if (args.command === 'backup') return 'backup';
    if (args.command === 'restore') return 'restore';
    if (args.command === 'update') return 'update';
    if (args.command === 'clean') return 'clean';
    if (args.command === 'list') return 'list';
    if (args.command === 'help') return 'help';
    if (args.command === 'generate') return 'generate';
    return 'menu';
  });

  const handleComplete = () => {
    if (fromMenu) {
      // Entered from main menu, return to main menu
      setMode('menu');
    } else {
      // Entered directly from command line, exit after complete
      setTimeout(() => exit(), 100);
    }
  };

  const handleMenuSelect = (value: string) => {
    if (value === 'exit') {
      exit();
      return;
    }
    setMode(value as AppMode);
  };

  // Get backup file for restore
  const getRestoreBackupFile = (): string | undefined => {
    if (args.latest) {
      const backups = getBackupList();
      if (backups.length > 0) {
        return backups[0].path;
      }
    } else if (args.backupFile) {
      if (fs.existsSync(args.backupFile)) {
        return args.backupFile;
      }
      const inBackupDir = path.join(BACKUP_DIR, args.backupFile);
      if (fs.existsSync(inBackupDir)) {
        return inBackupDir;
      }
    }
    return undefined;
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="magenta">
          koharu
        </Text>
        <Text dimColor> - jeet-u CLI</Text>
      </Box>

      {mode === 'menu' && (
        <Box flexDirection="column">
          <Text>Please select an operation:</Text>
          <Select
            visibleOptionCount={8}
            options={[
              { label: 'Backup - Backup blog content and configuration', value: 'backup' },
              { label: 'Restore - Restore from backup', value: 'restore' },
              { label: 'Update - Update theme', value: 'update' },
              { label: 'Generate - Generate content assets (LQIP, similarity, summaries)', value: 'generate' },
              { label: 'Clean - Clean old backups', value: 'clean' },
              { label: 'List - View all backups', value: 'list' },
              { label: 'Help - View command usage', value: 'help' },
              { label: 'Exit', value: 'exit' },
            ]}
            onChange={handleMenuSelect}
          />
        </Box>
      )}

      {mode === 'backup' && <BackupApp initialFull={args.full} showReturnHint={fromMenu} onComplete={handleComplete} />}

      {mode === 'restore' && (
        <RestoreApp
          initialBackupFile={getRestoreBackupFile()}
          dryRun={args.dryRun}
          force={args.force}
          showReturnHint={fromMenu}
          onComplete={handleComplete}
        />
      )}

      {mode === 'update' && (
        <UpdateApp
          checkOnly={args.check}
          skipBackup={args.skipBackup}
          force={args.force}
          showReturnHint={fromMenu}
          onComplete={handleComplete}
        />
      )}

      {mode === 'clean' && <CleanApp keepCount={args.keep} showReturnHint={fromMenu} onComplete={handleComplete} />}

      {mode === 'list' && <ListApp showReturnHint={fromMenu} onComplete={handleComplete} />}

      {mode === 'help' && <HelpApp showReturnHint={fromMenu} onComplete={handleComplete} />}

      {mode === 'generate' && (
        <GenerateApp
          initialType={args.generateType || undefined}
          initialModel={args.model || undefined}
          force={args.force}
          showReturnHint={fromMenu}
          onComplete={handleComplete}
        />
      )}
    </Box>
  );
}

render(<KoharuApp />);
