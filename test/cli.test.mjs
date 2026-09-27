import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const bin = join(here, '..', 'dist', 'cjs', 'bin.js');

test('merges class arguments', () => {
  const out = execFileSync('node', [bin, 'p-2', 'p-4']).toString().trim();
  assert.equal(out, 'p-4');
});

test('reads classes from stdin', () => {
  const out = execFileSync('node', [bin], { input: 'text-sm text-lg' }).toString().trim();
  assert.equal(out, 'text-lg');
});

test('honours the prefix option', () => {
  const out = execFileSync('node', [bin, '--prefix', 'tw-', 'tw-p-2 tw-p-4']).toString().trim();
  assert.equal(out, 'tw-p-4');
});

test('prints help', () => {
  const out = execFileSync('node', [bin, '--help']).toString();
  assert.match(out, /classweave/);
});

test('does not crash on empty stdin', () => {
  const out = execFileSync('node', [bin], { input: '' }).toString();
  assert.equal(typeof out, 'string');
});
