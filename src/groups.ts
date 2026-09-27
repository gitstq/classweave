/**
 * Declarative Tailwind utility groups and their conflict relationships.
 *
 * Each rule knows how to recognise a *core* utility (variants/important and
 * negative markers are stripped beforehand) and reports coverage bits. Rules
 * are evaluated in order and the first match wins, which is how ambiguous
 * prefixes such as `text-` (alignment vs size vs color) are disambiguated.
 */
import type { GroupRule, MatchResult, ThemeOverrides } from './types.js';
import {
  isSpacing, isFraction, isNumericScale, parseColor, parseArbitrary, inferArbitraryType,
  isFontSize, isFontWeight, isFontFamily, isLineHeight, isLetterSpacing,
  isRadius, isShadow, isBlur, isEase, isOpacity, isTime, isZIndex, isCount, isLengthValue,
} from './scales.js';

/* Coverage bits (re-used per property family; only compared within a group). */
const T = 1, R = 2, B = 4, L = 8;
const ALL = T | R | B | L;   // 15
const X = L | R;             // 10
const Y = T | B;             // 5
const AX = 1, AY = 2;        // generic axes

/** Return the substring after `prefix-`, '' for an exact match, else null. */
function restAfter(core: string, prefix: string): string | null {
  if (core === prefix) return '';
  if (core.startsWith(prefix + '-')) return core.slice(prefix.length + 1);
  return null;
}

type RestTest = (rest: string) => boolean;

/** Build a group from several (prefix -> bits) entries. */
function dirGroup(
  id: string,
  prefixes: Record<string, number>,
  test: RestTest,
  opts: { bare?: boolean; conflicts?: string[] } = {},
): GroupRule {
  const entries = Object.entries(prefixes).sort((a, b) => b[0].length - a[0].length);
  return {
    id,
    conflicts: opts.conflicts,
    match(core): MatchResult | null {
      for (const [pfx, bits] of entries) {
        const rest = restAfter(core, pfx);
        if (rest === null) continue;
        if (rest === '') {
          if (opts.bare) return { bits };
          continue;
        }
        if (test(rest)) return { bits };
      }
      return null;
    },
  };
}

/** A group of mutually exclusive literal utilities. */
function literalGroup(id: string, values: readonly string[], conflicts?: string[]): GroupRule {
  const set = new Set(values);
  return { id, conflicts, match(core) { return set.has(core) ? { bits: ALL } : null; } };
}

/** A single-prefix group (optionally allowing the bare form). */
function simple(id: string, prefix: string, test: RestTest, bare = false, conflicts?: string[]): GroupRule {
  return {
    id,
    conflicts,
    match(core) {
      const rest = restAfter(core, prefix);
      if (rest === null) return null;
      if (rest === '') return bare ? { bits: ALL } : null;
      return test(rest) ? { bits: ALL } : null;
    },
  };
}

const arbitraryNumber: RestTest = (t) => {
  const a = parseArbitrary(t);
  return a ? ['number', 'var', 'unknown'].includes(inferArbitraryType(a)) : false;
};
const isPercent: RestTest = (t) => /^\d+$/.test(t) || arbitraryNumber(t);
const isDegrees: RestTest = (t) => /^-?\d+$/.test(t) || (() => {
  const a = parseArbitrary(t);
  return a ? ['length', 'number', 'var', 'unknown'].includes(inferArbitraryType(a)) : false;
})();

/** Build the full rule set, optionally extending theme scales. */
export function createRules(theme: ThemeOverrides = {}): GroupRule[] {
  const extraColors = theme.colors ?? [];
  const extraSpacing = theme.spacing ?? [];
  const extraFontSize = theme.fontSize ?? [];
  const extraFontFamily = theme.fontFamily ?? [];

  const spacing: RestTest = (t) => isSpacing(t, extraSpacing);
  const color: RestTest = (t) => !!parseColor(t, extraColors);
  const fontSize: RestTest = (t) => isFontSize(t, extraFontSize);
  const fontFamily: RestTest = (t) => isFontFamily(t, extraFontFamily);

  const rules: GroupRule[] = [
    /* ============================ Layout ============================ */
    literalGroup('display', [
      'block', 'inline-block', 'inline', 'flex', 'inline-flex', 'grid', 'inline-grid',
      'hidden', 'flow-root', 'contents', 'list-item',
      'table', 'inline-table', 'table-caption', 'table-cell', 'table-column',
      'table-column-group', 'table-footer-group', 'table-header-group', 'table-row-group', 'table-row',
    ]),
    literalGroup('position', ['static', 'fixed', 'absolute', 'relative', 'sticky']),
    literalGroup('isolation', ['isolate', 'isolation-auto']),

    dirGroup('overflow', { overflow: AX | AY, 'overflow-x': AX, 'overflow-y': AY },
      (t) => ['auto', 'hidden', 'clip', 'visible', 'scroll'].includes(t)),
    dirGroup('overscroll', { overscroll: AX | AY, 'overscroll-x': AX, 'overscroll-y': AY },
      (t) => ['auto', 'contain', 'none'].includes(t)),

    dirGroup('inset', {
      inset: ALL, 'inset-x': X, 'inset-y': Y,
      top: T, right: R, bottom: B, left: L, start: L, end: R,
    }, spacing),

    simple('z', 'z', (t) => isZIndex(t)),

    dirGroup('margin', {
      m: ALL, mx: X, my: Y, mt: T, mr: R, mb: B, ml: L, ms: L, me: R,
    }, spacing),
    dirGroup('padding', {
      p: ALL, px: X, py: Y, pt: T, pr: R, pb: B, pl: L, ps: L, pe: R,
    }, spacing),
    simple('indent', 'indent', spacing),

    dirGroup('gap', { gap: AX | AY, 'gap-x': AX, 'gap-y': AY }, spacing, { bare: true }),
    dirGroup('space-between', { 'space-x': AX, 'space-y': AY }, spacing, { bare: true }),

    simple('width', 'w', (t) => isSpacing(t) || isFraction(t)),
    simple('min-width', 'min-w', (t) => isSpacing(t) || isFraction(t)),
    simple('max-width', 'max-w', (t) => isSpacing(t) || isFraction(t) || /^screen-/.test(t) || t === 'prose'),
    simple('height', 'h', (t) => isSpacing(t) || isFraction(t)),
    simple('min-height', 'min-h', (t) => isSpacing(t) || isFraction(t) || ['svh', 'lvh', 'dvh'].includes(t)),
    simple('max-height', 'max-h', (t) => isSpacing(t) || isFraction(t) || /^screen/.test(t)),
    simple('size', 'size', (t) => isSpacing(t) || isFraction(t), false, ['width', 'height']),

    simple('aspect', 'aspect', (t) => ['auto', 'square', 'video'].includes(t) || isFraction(t)),
    simple('order', 'order', (t) => ['none', 'first', 'last'].includes(t) || isCount(t, true)),

    /* ============================= Flex ============================ */
    literalGroup('flex-direction', ['flex-row', 'flex-row-reverse', 'flex-col', 'flex-col-reverse']),
    literalGroup('flex-wrap', ['flex-wrap', 'flex-wrap-reverse', 'flex-nowrap']),
    literalGroup('flex-shorthand', ['flex-1', 'flex-auto', 'flex-initial', 'flex-none']),
    simple('grow', 'grow', (t) => isFraction(t), true),
    simple('shrink', 'shrink', (t) => isFraction(t), true),
    simple('basis', 'basis', (t) => isSpacing(t) || isFraction(t)),

    /* ============================= Grid ============================ */
    simple('grid-cols', 'grid-cols', (t) => isCount(t)),
    simple('grid-rows', 'grid-rows', (t) => isCount(t)),
    simple('grid-flow', 'grid-flow', (t) => ['row', 'col', 'dense', 'row-dense', 'col-dense'].includes(t)),
    simple('auto-cols', 'auto-cols', (t) => ['auto', 'min', 'max', 'fr'].includes(t) || isSpacing(t) || isFraction(t)),
    simple('auto-rows', 'auto-rows', (t) => ['auto', 'min', 'max', 'fr'].includes(t) || isSpacing(t) || isFraction(t)),
    simple('col', 'col', (t) => ['auto', 'full'].includes(t) || t.startsWith('span-') || t.startsWith('start-') || t.startsWith('end-') || isCount(t)),
    simple('row', 'row', (t) => ['auto', 'full'].includes(t) || t.startsWith('span-') || t.startsWith('start-') || t.startsWith('end-') || isCount(t)),

    /* ====================== Box alignment ========================= */
    simple('justify-items', 'justify-items', (t) => ['auto', 'start', 'end', 'center', 'stretch'].includes(t)),
    simple('justify-self', 'justify-self', (t) => ['auto', 'start', 'end', 'center', 'stretch'].includes(t)),
    simple('justify', 'justify', (t) => ['normal', 'start', 'end', 'center', 'between', 'around', 'evenly', 'stretch'].includes(t)),
    simple('items', 'items', (t) => ['start', 'end', 'center', 'baseline', 'stretch'].includes(t)),
    simple('content', 'content', (t) => ['normal', 'center', 'start', 'end', 'between', 'around', 'evenly', 'stretch', 'baseline'].includes(t)),
    simple('self', 'self', (t) => ['auto', 'start', 'end', 'center', 'stretch', 'baseline'].includes(t)),
    simple('place-content', 'place-content', (t) => ['center', 'start', 'end', 'between', 'around', 'evenly', 'stretch'].includes(t)),
    simple('place-items', 'place-items', (t) => ['start', 'end', 'center', 'baseline', 'stretch'].includes(t)),
    simple('place-self', 'place-self', (t) => ['auto', 'start', 'end', 'center', 'stretch'].includes(t)),

    /* ============================ Float =========================== */
    literalGroup('float', ['float-start', 'float-end', 'float-right', 'float-left', 'float-none']),
    literalGroup('clear', ['clear-start', 'clear-end', 'clear-left', 'clear-right', 'clear-both', 'clear-none']),

    /* =========================== Object =========================== */
    literalGroup('object-fit', ['object-contain', 'object-cover', 'object-fill', 'object-none', 'object-scale-down']),
    simple('object-position', 'object', (t) => isSpacing(t) || /^(bottom|center|left|right|top)(-(bottom|left|right|top))?$/.test(t)),

    /* ========================== Overflow ========================== */
    /* (overflow groups above) */

    /* ======================== Border radius ======================= */
    dirGroup('rounded', {
      rounded: ALL, 'rounded-t': T | R, 'rounded-r': R, 'rounded-b': B | R, 'rounded-l': L,
      'rounded-tl': T, 'rounded-tr': R, 'rounded-br': B, 'rounded-bl': L,
      'rounded-s': L, 'rounded-e': R, 'rounded-ss': T, 'rounded-se': R, 'rounded-es': B, 'rounded-ee': B,
    }, (t) => isRadius(t), { bare: true }),

    /* ======================== Border width ======================== */
    dirGroup('border-width', {
      border: ALL, 'border-x': X, 'border-y': Y,
      'border-t': T, 'border-r': R, 'border-b': B, 'border-l': L, 'border-s': L, 'border-e': R,
    }, (t) => t === 'DEFAULT' || isLengthValue(t), { bare: true }),

    literalGroup('border-style', ['border-solid', 'border-dashed', 'border-dotted', 'border-double', 'border-hidden', 'border-none']),
    literalGroup('border-collapse', ['border-collapse', 'border-separate']),
    dirGroup('border-spacing', {
      'border-spacing': AX | AY, 'border-spacing-x': AX, 'border-spacing-y': AY,
    }, spacing, { bare: true }),

    dirGroup('border-color', {
      border: ALL, 'border-x': X, 'border-y': Y,
      'border-t': T, 'border-r': R, 'border-b': B, 'border-l': L, 'border-s': L, 'border-e': R,
    }, color, { bare: true }),

    /* ========================== Divide =========================== */
    literalGroup('divide-style', ['divide-solid', 'divide-dashed', 'divide-dotted', 'divide-double', 'divide-none']),
    dirGroup('divide-width', { 'divide-x': AX, 'divide-y': AY }, (t) => isLengthValue(t), { bare: true }),
    simple('divide-color', 'divide', color),

    /* ===================== Background (v3/v4) ==================== */
    literalGroup('bg-image', ['bg-none', 'bg-gradient-to-t', 'bg-gradient-to-tr', 'bg-gradient-to-r', 'bg-gradient-to-br',
      'bg-gradient-to-b', 'bg-gradient-to-bl', 'bg-gradient-to-l', 'bg-gradient-to-tl',
      'bg-linear-to-t', 'bg-linear-to-tr', 'bg-linear-to-r', 'bg-linear-to-br', 'bg-linear-to-b',
      'bg-linear-to-bl', 'bg-linear-to-l', 'bg-linear-to-tl']),
    simple('bg-size', 'bg', (t) => ['auto', 'cover', 'contain'].includes(t) || (() => {
      const a = parseArbitrary(t); return a ? ['length', 'var', 'unknown'].includes(inferArbitraryType(a)) : false;
    })()),
    literalGroup('bg-position', ['bg-bottom', 'bg-center', 'bg-left', 'bg-left-bottom', 'bg-left-top',
      'bg-right', 'bg-right-bottom', 'bg-right-top', 'bg-top']),
    literalGroup('bg-repeat', ['bg-repeat', 'bg-no-repeat', 'bg-repeat-x', 'bg-repeat-y', 'bg-repeat-round', 'bg-repeat-space']),
    literalGroup('bg-attachment', ['bg-fixed', 'bg-local', 'bg-scroll']),
    literalGroup('bg-origin', ['bg-origin-border', 'bg-origin-padding', 'bg-origin-content']),
    literalGroup('bg-clip', ['bg-clip-border', 'bg-clip-padding', 'bg-clip-content', 'bg-clip-text']),
    simple('bg-blend', 'bg-blend', (t) => t !== ''),
    simple('bg-color', 'bg', (t) => color(t) || (() => {
      const a = parseArbitrary(t); return a ? ['color', 'var', 'unknown'].includes(inferArbitraryType(a)) : false;
    })()),

    /* ========================== Typography ======================= */
    literalGroup('text-wrap', ['text-wrap', 'text-nowrap', 'text-balance', 'text-pretty']),
    literalGroup('text-align', ['text-left', 'text-center', 'text-right', 'text-justify', 'text-start', 'text-end']),
    simple('font-size', 'text', fontSize),
    simple('text-color', 'text', color),

    literalGroup('font-smoothing', ['antialiased', 'subpixel-antialiased']),
    literalGroup('font-style', ['italic', 'not-italic']),
    simple('font-family', 'font', fontFamily),
    simple('font-weight', 'font', (t) => isFontWeight(t)),
    literalGroup('font-numeric', ['normal-nums', 'ordinal', 'slashed-zero', 'lining-nums', 'oldstyle-nums',
      'proportional-nums', 'tabular-nums', 'diagonal-fractions', 'stacked-fractions']),

    simple('leading', 'leading', (t) => isLineHeight(t)),
    simple('tracking', 'tracking', (t) => isLetterSpacing(t)),

    literalGroup('text-decoration-line', ['underline', 'overline', 'line-through', 'no-underline']),
    literalGroup('decoration-style', ['decoration-solid', 'decoration-dashed', 'decoration-dotted', 'decoration-double']),
    simple('decoration-width', 'decoration', (t) => ['0', '1', '2', '4', '8', 'auto', 'from-font'].includes(t) || isLengthValue(t)),
    simple('decoration-color', 'decoration', color),
    simple('underline-offset', 'underline-offset', (t) => isLengthValue(t)),

    simple('line-clamp', 'line-clamp', (t) => t === 'none' || isCount(t, false)),
    literalGroup('text-overflow', ['truncate', 'text-ellipsis', 'text-clip']),
    literalGroup('whitespace', ['whitespace-normal', 'whitespace-nowrap', 'whitespace-pre', 'whitespace-pre-line', 'whitespace-pre-wrap', 'whitespace-break-spaces']),
    literalGroup('word-break', ['break-normal', 'break-words', 'break-all', 'break-keep']),
    simple('break-before', 'break-before', (t) => t !== ''),
    simple('break-after', 'break-after', (t) => t !== ''),
    simple('break-inside', 'break-inside', (t) => t !== ''),
    literalGroup('vertical-align', ['align-baseline', 'align-top', 'align-middle', 'align-bottom', 'align-text-top', 'align-text-bottom', 'align-sub', 'align-super']),
    literalGroup('text-transform', ['uppercase', 'lowercase', 'capitalize', 'normal-case']),
    literalGroup('hyphens', ['hyphens-none', 'hyphens-manual', 'hyphens-auto']),

    /* ============================ Table ========================== */
    literalGroup('table-layout', ['table-auto', 'table-fixed']),
    literalGroup('caption-side', ['caption-top', 'caption-bottom']),
    simple('list-type', 'list', (t) => ['none', 'disc', 'decimal'].includes(t)),
    simple('list-position', 'list', (t) => ['inside', 'outside'].includes(t)),
    simple('list-image', 'list-image', (t) => t === 'none' || (() => {
      const a = parseArbitrary(t); return a ? inferArbitraryType(a) === 'url' : false;
    })()),

    literalGroup('box-sizing', ['box-border', 'box-content-box']),
    literalGroup('box-decoration', ['box-decoration-clone', 'box-decoration-slice']),
    simple('appearance', 'appearance', (t) => ['none', 'auto'].includes(t)),

    simple('columns', 'columns', (t) => isCount(t) || ['auto', '3xs', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl'].includes(t)),

    /* ============================ Color ========================== */
    simple('opacity', 'opacity', (t) => isOpacity(t)),
    simple('bg-opacity', 'bg-opacity', (t) => isOpacity(t)),
    simple('text-opacity', 'text-opacity', (t) => isOpacity(t)),
    simple('border-opacity', 'border-opacity', (t) => isOpacity(t)),
    simple('ring-opacity', 'ring-opacity', (t) => isOpacity(t)),
    simple('divide-opacity', 'divide-opacity', (t) => isOpacity(t)),
    simple('placeholder-opacity', 'placeholder-opacity', (t) => isOpacity(t)),
    simple('placeholder-color', 'placeholder', color),
    simple('caret-color', 'caret', color),
    simple('accent-color', 'accent', color),

    /* ============================ Ring =========================== */
    simple('ring-offset-width', 'ring-offset', (t) => isLengthValue(t), true),
    simple('ring-offset-color', 'ring-offset', color),
    literalGroup('ring-inset', ['ring-inset']),
    simple('ring-width', 'ring', (t) => isLengthValue(t), true),
    simple('ring-color', 'ring', color),

    /* ========================== Shadow =========================== */
    simple('shadow-color', 'shadow', color),
    simple('shadow', 'shadow', (t) => isShadow(t), true),

    /* ========================= Outline =========================== */
    simple('outline-offset', 'outline-offset', (t) => isLengthValue(t)),
    literalGroup('outline-style', ['outline', 'outline-none', 'outline-solid', 'outline-dashed', 'outline-dotted', 'outline-double', 'outline-hidden']),
    simple('outline-width', 'outline', (t) => isNumericScale(t) || (() => {
      const a = parseArbitrary(t); return a ? ['length', 'number', 'var', 'unknown'].includes(inferArbitraryType(a)) : false;
    })()),
    simple('outline-color', 'outline', color),

    /* ======================== Transform ========================== */
    literalGroup('transform', ['transform', 'transform-cpu', 'transform-gpu', 'transform-none']),
    dirGroup('scale', { scale: AX | AY, 'scale-x': AX, 'scale-y': AY }, (t) => isFraction(t), { bare: true }),
    simple('rotate', 'rotate', isDegrees),
    dirGroup('translate', { 'translate-x': AX, 'translate-y': AY }, spacing),
    dirGroup('skew', { 'skew-x': AX, 'skew-y': AY }, isDegrees),
    simple('transform-origin', 'origin', (t) => /^(center|top|top-right|right|bottom-right|bottom|bottom-left|left|top-left)(-(center|top|right|bottom|left))?$/.test(t) || !!parseArbitrary(t)),

    /* ======================== Transition ========================= */
    simple('transition', 'transition', (t) => ['none', 'all', 'colors', 'opacity', 'shadow', 'transform'].includes(t) || !!parseArbitrary(t), true),
    simple('duration', 'duration', (t) => isTime(t)),
    simple('delay', 'delay', (t) => isTime(t)),
    simple('ease', 'ease', (t) => isEase(t)),
    simple('animate', 'animate', (t) => ['none', 'spin', 'ping', 'pulse', 'bounce'].includes(t) || !!parseArbitrary(t)),
    simple('will-change', 'will-change', (t) => ['auto', 'scroll-position', 'contents', 'transform'].includes(t) || !!parseArbitrary(t)),

    /* ========================== Filters ========================== */
    literalGroup('filter', ['filter', 'filter-none']),
    simple('blur', 'blur', (t) => isBlur(t), true),
    simple('brightness', 'brightness', isPercent),
    simple('contrast', 'contrast', isPercent),
    simple('saturate', 'saturate', isPercent),
    simple('hue-rotate', 'hue-rotate', isDegrees),
    literalGroup('grayscale', ['grayscale', 'grayscale-0']),
    literalGroup('invert', ['invert', 'invert-0']),
    literalGroup('sepia', ['sepia', 'sepia-0']),
    simple('drop-shadow', 'drop-shadow', (t) => isShadow(t), true),

    literalGroup('backdrop-filter', ['backdrop-filter', 'backdrop-none']),
    simple('backdrop-blur', 'backdrop-blur', (t) => isBlur(t), true),
    simple('backdrop-brightness', 'backdrop-brightness', isPercent),
    simple('backdrop-contrast', 'backdrop-contrast', isPercent),
    simple('backdrop-saturate', 'backdrop-saturate', isPercent),
    simple('backdrop-hue-rotate', 'backdrop-hue-rotate', isDegrees),
    literalGroup('backdrop-grayscale', ['backdrop-grayscale', 'backdrop-grayscale-0']),
    literalGroup('backdrop-invert', ['backdrop-invert', 'backdrop-invert-0']),
    literalGroup('backdrop-sepia', ['backdrop-sepia', 'backdrop-sepia-0']),
    simple('backdrop-opacity', 'backdrop-opacity', (t) => isOpacity(t)),

    /* =========================== Blend =========================== */
    simple('mix-blend', 'mix-blend', (t) => t !== ''),

    /* ============================ SVG ============================ */
    simple('fill', 'fill', (t) => t === 'none' || color(t), true),
    simple('stroke-width', 'stroke', (t) => isLengthValue(t)),
    simple('stroke-color', 'stroke', color),

    /* ===================== Interactivity ========================= */
    simple('cursor', 'cursor', (t) => t !== ''),
    literalGroup('pointer-events', ['pointer-events-none', 'pointer-events-auto']),
    simple('select', 'select', (t) => ['none', 'text', 'all', 'auto'].includes(t)),
    simple('resize', 'resize', (t) => ['none', 'y', 'x'].includes(t)),
    simple('touch', 'touch', (t) => /^(auto|none|manipulation|pinch-zoom|pan-x|pan-y|pan-left|pan-right|pan-up|pan-down)(-pan-(x|y))?$/.test(t)),

    dirGroup('scroll-margin', {
      'scroll-m': ALL, 'scroll-mx': X, 'scroll-my': Y,
      'scroll-mt': T, 'scroll-mr': R, 'scroll-mb': B, 'scroll-ml': L,
    }, spacing),
    dirGroup('scroll-padding', {
      'scroll-p': ALL, 'scroll-px': X, 'scroll-py': Y,
      'scroll-pt': T, 'scroll-pr': R, 'scroll-pb': B, 'scroll-pl': L,
    }, spacing),
    literalGroup('scroll-behavior', ['scroll-auto', 'scroll-smooth']),
    literalGroup('snap-type', ['snap-none', 'snap-x', 'snap-y', 'snap-both', 'snap-mandatory', 'snap-proximity']),
    literalGroup('snap-align', ['snap-start', 'snap-end', 'snap-center', 'snap-align-none']),
    literalGroup('snap-stop', ['snap-normal', 'snap-always']),

    /* ========================= Content =========================== */
    simple('content', 'content', (t) => t === 'none' || !!parseArbitrary(t), true),

    /* ===================== Typography plugin ===================== */
    simple('prose-size', 'prose', (t) => ['sm', 'base', 'lg', 'xl', '2xl'].includes(t), true),
    simple('prose-color', 'prose', color),
    literalGroup('prose-invert', ['prose-invert']),

    /* ========================== A11y ============================ */
    literalGroup('sr', ['sr-only', 'not-sr-only']),
    literalGroup('visibility', ['visible', 'invisible', 'collapse']),
  ];

  return rules;
}
