#!/usr/bin/env node
/**
 * ClassWeave command-line interface.
 *
 * Usage:
 *   classweave "p-2" "p-4"
 *   echo "p-2 p-4" | classweave
 *   classweave --prefix tw- "tw-p-2" "tw-p-4"
 */
import { readFileSync } from 'node:fs';
import { createCw } from './cw.js';
import type { WeaveConfig } from './types.js';

function help(): string {
  return [
    'classweave — merge Tailwind class names with conflict resolution',
    '',
    'Usage:',
    '  classweave [options] "<classes>" ["<classes>" ...]',
    '  echo "<classes>" | classweave',
    '',
    'Options:',
    '  -p, --prefix <p>   Tailwind prefix (e.g. tw-)',
    '      --no-cache     Disable the result cache',
    '  -h, --help         Show this help',
    '',
  ].join('\n');
}

function main(argv: string[]): number {
  const config: WeaveConfig = {};
  const args: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--prefix' || a === '-p') {
      config.prefix = argv[++i];
    } else if (a === '--no-cache') {
      config.cacheSize = 0;
    } else if (a === '--help' || a === '-h') {
      process.stdout.write(help());
      return 0;
    } else {
      args.push(a);
    }
  }

  let joined = args.join(' ');
  if (!joined && !process.stdin.isTTY) {
    joined = readFileSync(0, 'utf8');
  } else if (!joined) {
    process.stderr.write('No class arguments provided. See --help.\n');
    return 1;
  }

  const cw = createCw(config);
  process.stdout.write(cw(joined) + '\n');
  return 0;
}

process.exit(main(process.argv.slice(2)));
