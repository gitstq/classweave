/**
 * Tailwind conflict-resolution merge engine.
 *
 * Tokens are parsed in order. Recognised utilities are bucketed by a context
 * key built from the variant stack, important flag and group id. Newer
 * utilities evict older ones that share the same context and coverage bits;
 * unrecognised tokens (custom classes) always survive untouched.
 */
import type { GroupRule } from './types.js';
import { parseClass } from './parser.js';

interface LiveEntry {
  token: string;
  order: number;
  bits: number;
  alive: boolean;
}

interface CompiledRules {
  rules: GroupRule[];
  byId: Map<string, GroupRule>;
}

function compile(rules: GroupRule[]): CompiledRules {
  return { rules, byId: new Map(rules.map((r) => [r.id, r])) };
}

/** Merge already-flattened class tokens using the supplied group rules. */
export function mergeTokens(tokens: string[], rules: GroupRule[], prefix = ''): string {
  const compiled = compile(rules);

  // context key -> live entries, in arrival order
  const buckets = new Map<string, LiveEntry[]>();
  // Every token (custom + utility) tracked for ordered output.
  const all: LiveEntry[] = [];

  let order = 0;

  const stripPrefix = (core: string): string => {
    if (!prefix) return core;
    if (core === prefix) return '';
    if (core.startsWith(prefix + '-')) return core.slice(prefix.length + 1);
    if (core.startsWith(prefix)) return core.slice(prefix.length);
    return core;
  };

  for (const token of tokens) {
    const parsed = parseClass(token);
    const coreForMatch = stripPrefix(parsed.core);

    let matched: { rule: GroupRule; bits: number } | null = null;

    if (coreForMatch !== '') {
      for (const rule of compiled.rules) {
        const m = rule.match(coreForMatch, parsed.negative);
        if (m) {
          matched = { rule, bits: m.bits };
          break;
        }
      }
    }

    if (!matched) {
      // Unknown / custom class: keep verbatim, never participate in conflicts.
      all.push({ token, order: order++, bits: 0, alive: true });
      continue;
    }

    const { rule, bits } = matched;
    const variantKey = parsed.variants.join(':');
    const baseKey = `${variantKey}|${parsed.important ? 'I' : 'N'}|`;
    const key = baseKey + rule.id;

    const entry: LiveEntry = { token, order: order++, bits, alive: true };
    const bucket = buckets.get(key) ?? [];

    // 1) Same-group directional conflicts: evict entries sharing coverage bits.
    for (const old of bucket) {
      if (old.alive && (old.bits & bits) !== 0) old.alive = false;
    }

    // 2) Cross-group conflicts (whole-group eviction, same variant context).
    if (rule.conflicts) {
      for (const otherId of rule.conflicts) {
        if (!compiled.byId.has(otherId)) continue;
        const otherBucket = buckets.get(baseKey + otherId);
        if (otherBucket) for (const old of otherBucket) old.alive = false;
      }
    }

    // Rebuild the bucket keeping only live entries.
    const live = bucket.filter((e) => e.alive);
    live.push(entry);
    buckets.set(key, live);
    all.push(entry);
  }

  return all.filter((e) => e.alive).map((e) => e.token).join(' ');
}
