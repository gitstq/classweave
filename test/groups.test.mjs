import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cw } from '../dist/esm/index.js';

function table(rows) {
  for (const [input, expected] of rows) {
    test(`${input} -> ${expected}`, () => {
      assert.equal(cw(input), expected);
    });
  }
}

table([
  // text- : align vs size vs color vs wrap
  ['text-left text-sm', 'text-left text-sm'],
  ['text-sm text-left', 'text-sm text-left'],
  ['text-sm text-red-500', 'text-sm text-red-500'],
  ['text-red-500 text-sm', 'text-red-500 text-sm'],
  ['text-wrap text-balance', 'text-balance'],
  ['text-nowrap text-wrap', 'text-wrap'],

  // font- : family vs weight
  ['font-sans font-bold', 'font-sans font-bold'],
  ['font-bold font-sans', 'font-bold font-sans'],
  ['font-medium font-semibold', 'font-semibold'],
  ['font-serif font-mono', 'font-mono'],

  // outline- : width vs style vs color vs offset
  ['outline-2 outline-4', 'outline-4'],
  ['outline-none outline-solid', 'outline-solid'],
  ['outline-red-500 outline-blue-300', 'outline-blue-300'],
  ['outline-solid outline-red-500', 'outline-solid outline-red-500'],
  ['outline-offset-2 outline-offset-4', 'outline-offset-4'],

  // ring- : width vs color; ring-offset width vs color
  ['ring-2 ring-4', 'ring-4'],
  ['ring ring-4', 'ring-4'],
  ['ring ring-red-500', 'ring ring-red-500'],
  ['ring-red-500 ring-blue-300', 'ring-blue-300'],
  ['ring-offset-2 ring-offset-red-500', 'ring-offset-2 ring-offset-red-500'],
  ['ring-offset-2 ring-offset-4', 'ring-offset-4'],

  // shadow : size vs color
  ['shadow-md shadow-red-500', 'shadow-md shadow-red-500'],
  ['shadow-red-500 shadow-blue-300', 'shadow-blue-300'],
  ['shadow-md shadow-lg', 'shadow-lg'],

  // decoration : width vs color vs style
  ['decoration-2 decoration-red-500', 'decoration-2 decoration-red-500'],
  ['decoration-solid decoration-dashed', 'decoration-dashed'],
  ['decoration-red-500 decoration-blue-300', 'decoration-blue-300'],

  // divide : width vs color vs style
  ['divide-x divide-red-500', 'divide-x divide-red-500'],
  ['divide-x divide-y', 'divide-x divide-y'],
  ['divide-solid divide-dashed', 'divide-dashed'],

  // stroke : width vs color
  ['stroke-1 stroke-red-500', 'stroke-1 stroke-red-500'],
  ['stroke-red-500 stroke-blue-300', 'stroke-blue-300'],

  // bg sub-properties stay independent of each other
  ['bg-cover bg-center', 'bg-cover bg-center'],
  ['bg-no-repeat bg-fixed', 'bg-no-repeat bg-fixed'],
  ['bg-red-500 bg-cover', 'bg-red-500 bg-cover'],
  ['bg-clip-text bg-origin-content', 'bg-clip-text bg-origin-content'],
]);

test('size conflicts with width and height but w and h coexist', () => {
  assert.equal(cw('w-4 size-8'), 'size-8');
  assert.equal(cw('h-4 size-8'), 'size-8');
  assert.equal(cw('w-4 h-4'), 'w-4 h-4');
});

test('filters vs backdrop filters stay independent', () => {
  assert.equal(cw('blur-sm backdrop-blur-md'), 'blur-sm backdrop-blur-md');
  assert.equal(cw('brightness-50 backdrop-brightness-75'), 'brightness-50 backdrop-brightness-75');
});
