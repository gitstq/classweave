/**
 * ClassWeave public API factory.
 *
 * `cw` combines conditional joining (clsx-style) with Tailwind conflict
 * resolution. `createCw` builds an instance with a custom prefix, theme
 * extensions, group rules or cache size.
 */
import type { ClassValue, WeaveConfig, WeaveFn, GroupRule } from './types.js';
import { toTokens } from './cx.js';
import { createRules } from './groups.js';
import { mergeTokens } from './merge.js';

/** Tiny LRU cache built on Map insertion order. */
class LruCache {
  private readonly map = new Map<string, string>();
  constructor(private capacity: number) {}

  get(key: string): string | undefined {
    if (this.capacity <= 0) return undefined;
    const value = this.map.get(key);
    if (value !== undefined) {
      this.map.delete(key);
      this.map.set(key, value);
    }
    return value;
  }

  set(key: string, value: string): void {
    if (this.capacity <= 0) return;
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    while (this.map.size > this.capacity) {
      const oldest = this.map.keys().next().value;
      if (oldest === undefined) break;
      this.map.delete(oldest);
    }
  }
}

/** Create a configured weave function. */
export function createCw(config: WeaveConfig = {}): WeaveFn {
  const prefix = config.prefix ?? '';
  const cacheSize = config.cacheSize ?? 500;
  const rules: GroupRule[] = config.groups ?? createRules(config.theme);
  const cache = new LruCache(cacheSize);

  return (...inputs: ClassValue[]): string => {
    const raw: string[] = [];
    for (const input of inputs) toTokens(input, raw);

    // Strings may contain several space-separated utilities; split them so
    // each utility is merged independently (mirrors tailwind-merge).
    const tokens: string[] = [];
    for (const t of raw) {
      for (const part of t.split(/\s+/)) {
        if (part) tokens.push(part);
      }
    }

    // Cache on the normalised token stream so equivalent nested inputs
    // (arrays/objects) share an entry.
    const cacheKey = tokens.join(' ');
    const hit = cache.get(cacheKey);
    if (hit !== undefined) return hit;

    const result = mergeTokens(tokens, rules, prefix);
    cache.set(cacheKey, result);
    return result;
  };
}
