/**
 * ClassWeave — conditionally join and intelligently merge Tailwind class
 * names with conflict resolution. Zero runtime dependencies.
 */
export { cx, toTokens } from './cx.js';
export { createCw } from './cw.js';
export { mergeTokens } from './merge.js';
export { createRules } from './groups.js';
export { parseClass } from './parser.js';

import { createCw } from './cw.js';

/**
 * Weave class values together: conditional joining + Tailwind conflict
 * resolution. Drop-in replacement for both `clsx` and `tailwind-merge`.
 */
export const cw: ReturnType<typeof createCw> = createCw();

/**
 * Alias for {@link cw}. Matches the conventional helper name used in
 * shadcn/ui projects.
 */
export const cn = cw;

/**
 * Tailwind-only merge (no behavioral difference from {@link cw}, which also
 * accepts conditional arrays/objects). Provided for API familiarity.
 */
export const twMerge = cw;

export type {
  ClassValue,
  ClassArray,
  ClassDictionary,
  WeaveFn,
  WeaveConfig,
  ThemeOverrides,
  GroupRule,
  MatchResult,
  ParsedClass,
} from './types.js';
