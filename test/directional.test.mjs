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
  // margin: all covers every edge
  ['m-2 m-4', 'm-4'],
  ['m-2 mx-4', 'mx-4'],
  ['mx-2 ml-4', 'ml-4'],
  // horizontal vs top do not overlap
  ['mx-2 mt-4', 'mx-2 mt-4'],
  ['my-2 mr-4', 'my-2 mr-4'],

  // padding same semantics
  ['p-2 px-4', 'px-4'],
  ['px-2 pl-4', 'pl-4'],
  ['px-2 pt-4', 'px-2 pt-4'],

  // logical start/end
  ['ms-2 ms-4', 'ms-4'],
  ['p-2 ps-4', 'ps-4'],

  // border width directional
  ['border border-4', 'border-4'],
  ['border border-t-2', 'border-t-2'],
  ['border-x-2 border-t-2', 'border-x-2 border-t-2'],
  ['border-x-2 border-l-4', 'border-l-4'],
  ['border-t-2 border-b-4', 'border-t-2 border-b-4'],

  // border color directional (same property, overlapping scopes -> evict)
  ['border-red-500 border-t-blue-300', 'border-t-blue-300'],
  ['border-red-500 border-blue-300', 'border-blue-300'],
  ['border-t-red-500 border-t-blue-300', 'border-t-blue-300'],
  // non-overlapping directional colors coexist
  ['border-t-red-500 border-b-blue-300', 'border-t-red-500 border-b-blue-300'],

  // inset directional
  ['inset-0 inset-x-2', 'inset-x-2'],
  ['inset-x-2 left-4', 'left-4'],
  ['inset-x-2 top-4', 'inset-x-2 top-4'],
  ['top-2 bottom-4', 'top-2 bottom-4'],

  // rounded corners
  ['rounded rounded-t-lg', 'rounded-t-lg'],
  ['rounded-tl-md rounded-tr-lg', 'rounded-tl-md rounded-tr-lg'],
  ['rounded-t-md rounded-t-lg', 'rounded-t-lg'],

  // gap / space axes
  ['gap-2 gap-x-4', 'gap-x-4'],
  ['gap-x-2 gap-y-4', 'gap-x-2 gap-y-4'],
  ['space-x-2 space-y-4', 'space-x-2 space-y-4'],
  ['space-x-2 space-x-4', 'space-x-4'],

  // overflow axes
  ['overflow-auto overflow-x-hidden', 'overflow-x-hidden'],
  ['overflow-x-auto overflow-y-hidden', 'overflow-x-auto overflow-y-hidden'],
]);
