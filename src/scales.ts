/**
 * Tailwind design-token scales and arbitrary-value inspection.
 *
 * Everything here is derived from Tailwind's public utility vocabulary. The
 * data is hand-organised for ClassWeave and used to decide which conflict
 * group a utility belongs to.
 */

/* ------------------------------------------------------------------ */
/* Arbitrary values                                                    */
/* ------------------------------------------------------------------ */

const ARBITRARY_RE = /^\[(?<inner>.*)\]$/s;

export interface Arbitrary {
  /** Explicit type hint, e.g. the `length` in `[length:12px]`. */
  hint?: string;
  /** Raw inner content, possibly with underscores standing in for spaces. */
  value: string;
}

/** Parse `[...]` into hint + value, or null when not an arbitrary value. */
export function parseArbitrary(token: string): Arbitrary | null {
  const m = ARBITRARY_RE.exec(token);
  if (!m) return null;
  let inner = m.groups!.inner as string;
  // Tailwind uses underscores for spaces inside arbitrary values.
  inner = inner.replace(/_/g, ' ');
  const colon = inner.indexOf(':');
  if (colon >= 0) {
    const hint = inner.slice(0, colon).trim();
    // A hint is a bare identifier (length, color, url, number, ...).
    if (/^[a-z-]+$/i.test(hint)) {
      return { hint, value: inner.slice(colon + 1).trim() };
    }
  }
  return { value: inner };
}

function isArbitrary(token: string): boolean {
  return ARBITRARY_RE.test(token);
}

/** Infer a coarse type for an arbitrary value when no hint is provided. */
export function inferArbitraryType(arb: Arbitrary): string {
  if (arb.hint) return arb.hint;
  const v = arb.value.trim();
  if (/^var\(--|^env\(/i.test(v)) return 'var';
  if (/(#(?:[0-9a-f]{3,8})\b|rgba?\(|hsla?\(|hwb\(|lab\(|lch\(|oklch\(|oklab\(|color\(|color-mix\(|system-|named-color)/i.test(v))
    return 'color';
  if (/\burl\(/i.test(v) || /^(https?:|data:|image:|linear-gradient|radial-gradient|conic-gradient)/i.test(v))
    return 'url';
  if (/^-?\d+(\.\d+)?(%|rem|em|px|vh|vw|svh|lvh|dvh|svw|ch|ex|pt|pc|in|cm|mm|Q)?$/.test(v) && /[a-z%]/i.test(v))
    return 'length';
  if (/^-?\d+(\.\d+)?$/.test(v)) return 'number';
  if (/\b(top|bottom|left|right|center)\b/i.test(v)) return 'position';
  return 'unknown';
}

/* ------------------------------------------------------------------ */
/* Numeric / token scales                                              */
/* ------------------------------------------------------------------ */

/** Static spacing scale (Tailwind v3), excluding the bare numeric loop. */
const SPACING_NAMED = new Set(['px', 'auto', 'full', 'screen', 'min', 'max', 'fit']);

/**
 * Whether `token` is a spacing value. Numeric scale tokens (0, 0.5, 1 ...),
 * named tokens and arbitrary lengths are accepted.
 */
export function isSpacing(token: string, extra: readonly string[] = []): boolean {
  if (SPACING_NAMED.has(token) || extra.includes(token)) return true;
  if (isNumericScale(token)) return true;
  const arb = parseArbitrary(token);
  if (arb) {
    const t = inferArbitraryType(arb);
    return t === 'length' || t === 'number' || t === 'var' || t === 'unknown';
  }
  return false;
}

/** Matches the fractional spacing scale: 0, 0.5, 1, 1.5, 2, ... */
export function isNumericScale(token: string): boolean {
  return /^\d+(\.5)?$/.test(token);
}

/* ------------------------------------------------------------------ */
/* Colors                                                              */
/* ------------------------------------------------------------------ */

export const COLOR_NAMES = [
  'inherit', 'current', 'transparent', 'black', 'white',
  'slate', 'gray', 'zinc', 'neutral', 'stone',
  'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald',
  'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple',
  'fuchsia', 'pink', 'rose',
  // v3 extended / v4-ish aliases
  'light-blue', 'warm-gray', 'true-gray', 'cool-gray', 'blue-gray',
] as const;

const COLOR_NAME_SET = new Set<string>(COLOR_NAMES);
const COLOR_SHADE = /^\d{2,3}$/;

export interface ColorMatch {
  name: string;
  shade?: string;
  /** Opacity modifier after a slash, e.g. the `50` in `bg-red-500/50`. */
  opacity?: string;
}

/**
 * Parse a color token such as `red-500`, `white`, `red-500/[0.5]` or
 * `[#bada55]`. Returns null when it is not a color.
 */
export function parseColor(token: string, extra: readonly string[] = []): ColorMatch | null {
  // Strip a trailing opacity modifier: /50, /[0.31]
  let opacity: string | undefined;
  const slash = token.indexOf('/');
  let base = token;
  if (slash >= 0) {
    const tail = token.slice(slash + 1);
    // Only treat as modifier when it looks like an opacity value.
    if (/^(\d{1,3}|\[.*\])$/.test(tail)) {
      opacity = tail;
      base = token.slice(0, slash);
    }
  }

  const arb = parseArbitrary(base);
  if (arb) {
    const t = inferArbitraryType(arb);
    if (t === 'color' || t === 'var' || t === 'unknown') return { name: base, opacity };
  }

  const parts = base.split('-');
  if (parts.length === 1) {
    if (COLOR_NAME_SET.has(parts[0]) || extra.includes(parts[0])) {
      return { name: parts[0], opacity };
    }
    return null;
  }
  const name = parts[0];
  const shade = parts.slice(1).join('-');
  const nameOk = COLOR_NAME_SET.has(name) || extra.includes(name);
  if (nameOk && (COLOR_SHADE.test(shade) || isArbitrary('[' + shade + ']') || extra.includes(shade))) {
    return { name, shade, opacity };
  }
  // Single custom color token with no shade (e.g. brand)
  if (nameOk) return { name, opacity };
  return null;
}

/* ------------------------------------------------------------------ */
/* Typography scales                                                   */
/* ------------------------------------------------------------------ */

export const FONT_SIZES = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl'];
export const FONT_WEIGHTS = ['thin', 'extralight', 'light', 'normal', 'medium', 'semibold', 'bold', 'extrabold', 'black'];
export const FONT_FAMILIES = ['sans', 'serif', 'mono'];
export const LINE_HEIGHTS = ['none', 'tight', 'snug', 'normal', 'relaxed', 'loose'];
export const LETTER_SPACINGS = ['tighter', 'tight', 'normal', 'wide', 'wider', 'widest'];

function inScaleOrArbitrary(token: string, scale: readonly string[], arbitraryTypes: string[], extra: readonly string[] = []): boolean {
  if (scale.includes(token) || extra.includes(token)) return true;
  const arb = parseArbitrary(token);
  if (arb) {
    const t = inferArbitraryType(arb);
    return arbitraryTypes.includes(t);
  }
  return false;
}

export const isFontSize = (t: string, x: readonly string[] = []) =>
  inScaleOrArbitrary(t, FONT_SIZES, ['length', 'number', 'var', 'unknown'], x);
export const isFontWeight = (t: string) =>
  inScaleOrArbitrary(t, FONT_WEIGHTS, ['number', 'var', 'unknown']) || /^\d{3}$/.test(t);
export const isFontFamily = (t: string, x: readonly string[] = []) =>
  inScaleOrArbitrary(t, FONT_FAMILIES, ['var', 'unknown'], x);
export const isLineHeight = (t: string) =>
  inScaleOrArbitrary(t, LINE_HEIGHTS, ['length', 'number', 'var', 'unknown']) || /^\d+$/.test(t);
export const isLetterSpacing = (t: string) =>
  inScaleOrArbitrary(t, LETTER_SPACINGS, ['length', 'number', 'var', 'unknown']);

/* ------------------------------------------------------------------ */
/* Other scales                                                        */
/* ------------------------------------------------------------------ */

export const RADIUSES = ['none', 'sm', 'DEFAULT', 'md', 'lg', 'xl', '2xl', '3xl', 'full'];
export const BORDER_WIDTHS = ['', '0', '2', '4', '8', 'DEFAULT'];
export const SHADOWS = ['sm', 'DEFAULT', 'md', 'lg', 'xl', '2xl', 'inner', 'none'];
export const SHADOW_COLORLESS = new Set(SHADOWS);
export const BLURS = ['none', 'sm', 'DEFAULT', 'md', 'lg', 'xl', '2xl', '3xl'];
export const EASES = ['linear', 'in', 'out', 'in-out'];
export const OPACITIES = ['0', '5', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55', '60', '65', '70', '75', '80', '85', '90', '95', '100'];

export const isRadius = (t: string) =>
  inScaleOrArbitrary(t, RADIUSES, ['length', 'number', 'var', 'unknown']);
export const isShadow = (t: string) =>
  inScaleOrArbitrary(t, SHADOWS, ['length', 'var', 'unknown']);
export const isBlur = (t: string) =>
  inScaleOrArbitrary(t, BLURS, ['length', 'number', 'var', 'unknown']);
export const isEase = (t: string) =>
  inScaleOrArbitrary(t, EASES, ['var', 'unknown']);
export const isOpacity = (t: string) =>
  inScaleOrArbitrary(t, OPACITIES, ['number', 'var', 'unknown']) || /^\d{1,3}$/.test(t);

/** Time scale used by duration/delay utilities. */
export function isTime(token: string): boolean {
  if (/^\d+$/.test(token)) return true;
  const arb = parseArbitrary(token);
  if (arb) {
    const t = inferArbitraryType(arb);
    return ['length', 'number', 'var', 'unknown'].includes(t);
  }
  return false;
}

/** z-index scale incl. negative-aware numeric values. */
export function isZIndex(token: string): boolean {
  if (token === 'auto' || /^-?\d+$/.test(token)) return true;
  const arb = parseArbitrary(token);
  return !!arb;
}

/** Integer-count scale (grid columns/rows, columns, line-clamp, order). */
export function isCount(token: string, allowAuto = true): boolean {
  if ((allowAuto && token === 'auto') || /^\d+$/.test(token) || token === 'none') return true;
  const arb = parseArbitrary(token);
  if (arb) {
    const t = inferArbitraryType(arb);
    return ['number', 'var', 'unknown', 'length'].includes(t);
  }
  return false;
}

/** Fraction scale (flex-grow values, percentages). */
export function isFraction(token: string): boolean {
  if (/^\d+\/\d+$/.test(token) || /^\d+(\.\d+)?$/.test(token)) return true;
  return isArbitrary(token);
}

/**
 * Whether a token is a width/length utility value: numeric scale tokens or
 * arbitrary values that resolve to a length or number (NOT colors).
 */
export function isLengthValue(token: string): boolean {
  if (isNumericScale(token)) return true;
  const a = parseArbitrary(token);
  if (!a) return false;
  return ['length', 'number', 'var', 'unknown'].includes(inferArbitraryType(a));
}
