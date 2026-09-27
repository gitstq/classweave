import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cx, toTokens } from '../dist/esm/index.js';

test('joins simple string arguments', () => {
  assert.equal(cx('foo', 'bar'), 'foo bar');
});

test('ignores falsy primitives', () => {
  assert.equal(cx('foo', false, null, undefined, '', 'bar'), 'foo bar');
});

test('keeps zero as a class token', () => {
  assert.equal(cx(0, 'foo'), '0 foo');
});

test('flattens nested arrays', () => {
  assert.equal(cx(['foo', ['bar', ['baz']]]), 'foo bar baz');
});

test('toggles object keys by truthiness', () => {
  assert.equal(cx({ foo: true, bar: false, baz: 1, qux: 0 }), 'foo baz');
});

test('handles a realistic conditional mix', () => {
  const isActive = true;
  const isDisabled = false;
  assert.equal(
    cx('btn', isActive && 'btn-active', isDisabled && 'btn-disabled', ['rounded']),
    'btn btn-active rounded',
  );
});

test('toTokens returns a flat array', () => {
  const out = [];
  toTokens({ a: true, b: false }, out);
  toTokens(['c', [false, 'd']], out);
  assert.deepEqual(out, ['a', 'c', 'd']);
});

test('bigint is stringified', () => {
  assert.equal(cx(10n), '10');
});

test('empty inputs produce empty string', () => {
  assert.equal(cx(), '');
  assert.equal(cx(false, null), '');
});
