/**
 * Conditionally joins class values without Tailwind conflict resolution.
 * Equivalent in spirit to `clsx`: arrays are flattened, object keys are
 * toggled by truthiness, and falsy primitives are dropped.
 */
import type { ClassValue } from './types.js';

/** Reduce any nested class values to a flat list of string tokens. */
export function toTokens(input: ClassValue, out: string[] = []): string[] {
  if (!input && input !== 0) return out;

  const type = typeof input;

  if (type === 'string' || type === 'number' || type === 'bigint') {
    const str = String(input);
    if (str) out.push(str);
    return out;
  }

  if (Array.isArray(input)) {
    for (const child of input) toTokens(child, out);
    return out;
  }

  if (type === 'object') {
    const record = input as Record<string, unknown>;
    for (const key of Object.keys(record)) {
      if (record[key]) out.push(key);
    }
    return out;
  }

  return out;
}

/** Join class values with single spaces. No conflict resolution. */
export function cx(...inputs: ClassValue[]): string {
  const out: string[] = [];
  for (const input of inputs) toTokens(input, out);
  return out.join(' ');
}
