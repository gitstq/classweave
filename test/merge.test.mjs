import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cw, cn, twMerge } from '../dist/esm/index.js';

/** data-driven helper */
function table(rows) {
  for (const [input, expected] of rows) {
    test(`${input} -> ${expected}`, () => {
      assert.equal(cw(input), expected);
    });
  }
}

test('default and aliases are functions', () => {
  assert.equal(typeof cw, 'function');
  assert.equal(cn, cw);
  assert.equal(twMerge, cw);
});

table([
  // identical / same group
  ['p-2 p-4', 'p-4'],
  ['p-2 p-4 p-8', 'p-8'],
  ['text-sm text-lg', 'text-lg'],
  ['text-red-500 text-blue-300', 'text-blue-300'],
  ['bg-red-500 bg-green-200', 'bg-green-200'],
  ['block flex', 'flex'],
  ['absolute relative', 'relative'],
  ['font-bold font-medium', 'font-medium'],
  ['font-sans font-mono', 'font-mono'],
  ['leading-tight leading-loose', 'leading-loose'],
  ['tracking-tight tracking-wide', 'tracking-wide'],
  ['opacity-0 opacity-50', 'opacity-50'],
  ['z-10 z-30', 'z-30'],
  ['shadow-md shadow-xl', 'shadow-xl'],
  ['rounded-md rounded-xl', 'rounded-xl'],
  ['border-2 border-4', 'border-4'],
  ['duration-200 duration-500', 'duration-500'],
  ['delay-100 delay-300', 'delay-300'],
  ['ease-in ease-out', 'ease-out'],
  ['animate-spin animate-pulse', 'animate-pulse'],

  // non-conflicting utilities coexist
  ['p-2 m-4', 'p-2 m-4'],
  ['text-sm text-red-500', 'text-sm text-red-500'],
  ['flex items-center justify-between', 'flex items-center justify-between'],
  ['w-4 h-4', 'w-4 h-4'],
  ['bg-red-500 text-white p-2', 'bg-red-500 text-white p-2'],

  // earlier winner can be evicted by later
  ['p-4 m-2 p-8', 'm-2 p-8'],

  // empty / falsy
  ['', ''],
  ['p-2 p-4', 'p-4'],
]);

test('accepts conditional arguments like clsx', () => {
  assert.equal(cw('btn', { 'btn-active': true, 'btn-off': false }, ['p-2', null, 'p-4']), 'btn btn-active p-4');
});

test('preserves order of surviving classes', () => {
  assert.equal(cw('m-2 p-2 p-4'), 'm-2 p-4');
});
