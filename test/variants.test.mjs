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
  // same variant stack conflicts
  ['hover:p-2 hover:p-4', 'hover:p-4'],
  ['focus:text-sm focus:text-lg', 'focus:text-lg'],
  ['md:block md:hidden', 'md:hidden'],
  ['dark:bg-white dark:bg-black', 'dark:bg-black'],

  // different variant stacks do NOT conflict
  ['p-2 hover:p-4', 'p-2 hover:p-4'],
  ['hover:p-2 focus:p-4', 'hover:p-2 focus:p-4'],
  ['md:p-2 lg:p-4', 'md:p-2 lg:p-4'],
  ['dark:text-white text-black', 'dark:text-white text-black'],

  // stacked variants
  ['md:hover:p-2 md:hover:p-4', 'md:hover:p-4'],
  ['md:hover:p-2 md:focus:p-4', 'md:hover:p-2 md:focus:p-4'],

  // group / peer variants
  ['group-hover:p-2 group-hover:p-4', 'group-hover:p-4'],
  ['peer-checked:block peer-checked:hidden', 'peer-checked:hidden'],

  // important modifier is its own context (v3 prefix and v4 suffix)
  ['!p-1 p-2', '!p-1 p-2'],
  ['p-1! p-2', 'p-1! p-2'],
  ['!p-1 !p-2', '!p-2'],
  ['hover:!p-1 hover:!p-2', 'hover:!p-2'],
]);

test('arbitrary variants with colons inside brackets are preserved', () => {
  assert.equal(cw('[&:focus]:p-2 [&:focus]:p-4'), '[&:focus]:p-4');
  assert.equal(cw('[@media(hover:hover)]:block [@media(hover:hover)]:hidden'), '[@media(hover:hover)]:hidden');
});

test('container query variants', () => {
  assert.equal(cw('@container @md:p-2 @md:p-4'), '@container @md:p-4');
});
