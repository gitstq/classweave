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
  // arbitrary lengths
  ['w-4 w-[10px]', 'w-[10px]'],
  ['h-2 h-[var(--h)]', 'h-[var(--h)]'],
  ['p-2 p-[7px]', 'p-[7px]'],
  ['mt-2 mt-[13px]', 'mt-[13px]'],

  // arbitrary colors
  ['bg-red-500 bg-[#bada55]', 'bg-[#bada55]'],
  ['text-red-500 text-[rgb(1,2,3)]', 'text-[rgb(1,2,3)]'],
  ['border-red-500 border-[oklch(0.6_0.2_230)]', 'border-[oklch(0.6_0.2_230)]'],

  // explicit type hints
  ['text-sm text-[length:13px]', 'text-[length:13px]'],
  ['text-red-500 text-[color:var(--c)]', 'text-[color:var(--c)]'],

  // arbitrary url -> background image, does not collide with color
  ['bg-red-500 bg-[url(/img.png)]', 'bg-red-500 bg-[url(/img.png)]'],

  // opacity modifier on colors
  ['bg-red-500 bg-red-500/50', 'bg-red-500/50'],
  ['text-black/50 text-black/75', 'text-black/75'],

  // arbitrary counts
  ['grid-cols-2 grid-cols-[1fr_2fr]', 'grid-cols-[1fr_2fr]'],
  ['columns-2 columns-[13rem]', 'columns-[13rem]'],

  // negative arbitrary
  ['-left-2 -left-[1px]', '-left-[1px]'],

  // underscores become spaces but output keeps raw token
  ['grid-cols-[repeat(2,1fr)] grid-cols-2', 'grid-cols-2'],
]);

test('arbitrary flex/grid values', () => {
  assert.equal(cw('grow grow-[2]'), 'grow-[2]');
  assert.equal(cw('basis-auto basis-[42%]'), 'basis-[42%]');
});
