/**
 * Parses a raw Tailwind utility token into variant stack, important flag,
 * negative flag and the core utility.
 */
import type { ParsedClass } from './types.js';

/**
 * Split a string on a delimiter while keeping bracketed groups intact.
 * Brackets handled: [], (), {}. Nested same-kind brackets are tracked.
 */
export function splitRespectingBrackets(input: string, delimiter: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  const pairs: Record<string, string> = { '[': ']', '(': ')', '{': '}' };
  const closers = new Set(Object.values(pairs));
  for (const ch of input) {
    if (ch in pairs) {
      depth++;
    } else if (closers.has(ch)) {
      depth = Math.max(0, depth - 1);
    }
    if (ch === delimiter && depth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  parts.push(current);
  return parts;
}

/** Parse one raw token. Never throws; unknown shapes are returned as-is. */
export function parseClass(raw: string): ParsedClass {
  const segments = splitRespectingBrackets(raw, ':');
  const body = segments.pop() as string;
  const variants = segments;

  let work = body;
  let important = false;

  // v4 trailing important modifier: p-4!
  if (work.endsWith('!')) {
    important = true;
    work = work.slice(0, -1);
  }
  // v3 leading important modifier on the body: !p-4
  if (work.startsWith('!')) {
    important = true;
    work = work.slice(1);
  }

  let negative = false;
  // Negative utilities: -mt-4, -left-[1px]. Arbitrary values like [-1px]
  // are not treated as a negative utility prefix.
  if (work.startsWith('-') && !work.startsWith('[-')) {
    negative = true;
    work = work.slice(1);
  }

  return { raw, variants, body, important, negative, core: work };
}
