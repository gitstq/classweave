import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCw, mergeTokens, createRules } from '../dist/esm/index.js';

test('supports a Tailwind prefix', () => {
  const cw = createCw({ prefix: 'tw-', cacheSize: 0 });
  assert.equal(cw('tw-p-2 tw-p-4'), 'tw-p-4');
  assert.equal(cw('tw-text-sm tw-text-lg'), 'tw-text-lg');
});

test('extends color theme', () => {
  const cw = createCw({ theme: { colors: ['brand', 'surface'] }, cacheSize: 0 });
  assert.equal(cw('bg-brand-500 bg-brand-700'), 'bg-brand-700');
  // registered single-token colors conflict like any color utility
  assert.equal(cw('bg-surface bg-brand'), 'bg-brand');
});

test('extends spacing theme', () => {
  const cw = createCw({ theme: { spacing: ['18'] }, cacheSize: 0 });
  assert.equal(cw('p-18 p-4'), 'p-4');
});

test('cache returns stable results and can be disabled', () => {
  const cw = createCw({ cacheSize: 2 });
  assert.equal(cw('p-2 p-4'), 'p-4');
  assert.equal(cw('p-2 p-4'), 'p-4');
  const noCache = createCw({ cacheSize: 0 });
  assert.equal(noCache('m-2 m-4'), 'm-4');
});

test('equivalent nested inputs share a cache entry', () => {
  const cw = createCw({ cacheSize: 10 });
  const a = cw('foo', { bar: true });
  const b = cw(['foo', ['bar']]);
  assert.equal(a, b);
  assert.equal(a, 'foo bar');
});

test('accepts fully custom group rules', () => {
  const groups = [
    { id: 'magic', match: (core) => (core.startsWith('magic-') ? { bits: 15 } : null) },
  ];
  const cw = createCw({ groups, cacheSize: 0 });
  assert.equal(cw('magic-a magic-b keep-me'), 'magic-b keep-me');
});

test('createRules returns an array of rules', () => {
  assert.ok(Array.isArray(createRules()));
  assert.ok(createRules({ colors: ['x'] }).length >= createRules().length);
});

test('mergeTokens is directly callable', () => {
  assert.equal(mergeTokens(['p-2', 'p-4'], createRules()), 'p-4');
});
