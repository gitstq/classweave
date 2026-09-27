/**
 * Public type definitions for ClassWeave.
 *
 * The input types are intentionally permissive (any string is accepted) so
 * that custom CSS classes, CSS-module hashes and framework-generated classes
 * never produce type errors.
 */

/** A record whose own enumerable keys are toggled by their truthiness. */
export interface ClassDictionary {
  [id: string]: boolean | null | undefined | unknown;
}

/** Nested arrays are flattened recursively. */
export type ClassArray = ClassValue[];

/** Any value accepted by {@link cw}, {@link cx} and {@link twMerge}. */
export type ClassValue =
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined
  | ClassDictionary
  | ClassArray;

/** A function that weaves arbitrary class values into one string. */
export type WeaveFn = (...inputs: ClassValue[]) => string;

/** Direction / coverage bits shared by directional utilities. */
export type Bits = number;

/**
 * A parsed utility class.
 */
export interface ParsedClass {
  /** Original, untouched token as supplied by the caller. */
  raw: string;
  /** Variant/stack segments before the final colon (e.g. `hover`, `md:focus`). */
  variants: string[];
  /** Body after variant prefixes. */
  body: string;
  /** Whether the important modifier (`!` in v3, trailing `!` in v4) is set. */
  important: boolean;
  /** Whether a leading negative sign was present. */
  negative: boolean;
  /** The core utility without variant, important and negative markers. */
  core: string;
}

/** Result returned by a group rule matcher. */
export interface MatchResult {
  /** Coverage bits used for same-group directional conflict detection. */
  bits: Bits;
}

/** Declarative description of a Tailwind utility group. */
export interface GroupRule {
  /** Unique group identifier. */
  id: string;
  /** Returns match info when `core` belongs to this group, otherwise null. */
  match: (core: string, negative: boolean) => MatchResult | null;
  /** Other group ids that fully conflict with this one (bidirectional). */
  conflicts?: string[];
}

/** Theme scales that can be overridden via {@link WeaveConfig}. */
export interface ThemeOverrides {
  /** Extra color names (e.g. brand, surface). */
  colors?: string[];
  /** Extra spacing tokens (e.g. '18', '72', 'card'). */
  spacing?: string[];
  /** Extra font-size tokens (e.g. '2xs', '11xl'). */
  fontSize?: string[];
  /** Extra font-family tokens (e.g. 'display', 'mono'). */
  fontFamily?: string[];
}

/** Configuration accepted by {@link createCw}. */
export interface WeaveConfig {
  /** Tailwind `prefix` option (classes look like `tw-p-4`). */
  prefix?: string;
  /** Result cache size; set to 0 to disable. Defaults to 500. */
  cacheSize?: number;
  /** Theme scale extensions. */
  theme?: ThemeOverrides;
  /** Fully replace the built-in group rules (advanced). */
  groups?: GroupRule[];
}
