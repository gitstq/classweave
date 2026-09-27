// Writes package.json files into each build output so Node resolves
// the correct module format regardless of the root "type" field.
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const targets = [
  { dir: join(root, 'dist', 'esm'), type: 'module' },
  { dir: join(root, 'dist', 'cjs'), type: 'commonjs' },
];

for (const t of targets) {
  mkdirSync(t.dir, { recursive: true });
  writeFileSync(join(t.dir, 'package.json'), JSON.stringify({ type: t.type }, null, 2) + '\n');
  console.log(`wrote ${join('dist', t.type === 'module' ? 'esm' : 'cjs', 'package.json')}`);
}
