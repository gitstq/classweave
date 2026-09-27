# 🧵 ClassWeave

**Read this in another language:** [English](README.en.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md)

[![npm version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/gitstq/classweave)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](../LICENSE)
[![Runtime Dependencies](https://img.shields.io/badge/dependencies-0-success.svg)](#-features)
[![Tests](https://img.shields.io/badge/tests-158%20passing-brightgreen.svg)](#-quick-start)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-orange.svg)](../CONTRIBUTING.md)

> Weave messy Tailwind class names into one clean, conflict-free string —
> **`clsx` and `tailwind-merge` combined into a single zero-dependency toolkit.**

---

## 🎉 Introduction

**ClassWeave** is a tiny, fast and fully typed utility that takes the class
names you throw at it — strings, arrays, conditional objects — and returns a
single tidy string where Tailwind conflicts are resolved the smart way.

**The pain it solves:** when building components you often compose classes
from many sources (base styles, variants, user overrides). Naively joining
them produces contradictory utilities such as `p-2 p-4` or `block flex`, and
keeping two helpers around (`clsx` for conditionals plus `tailwind-merge` for
conflicts) is repetitive. ClassWeave does **both jobs with one function**.

**Differentiation highlights:**

- 🪄 **One function, two jobs** — conditional joining *and* conflict resolution.
- 🧭 **Variant-aware** — responsive, state, `dark`, `group/peer`, `data/aria`,
  stacked and arbitrary variants are handled as separate namespaces.
- 🧮 **Direction-aware** — margin, padding, border, inset, radius and gap use
  edge coverage so non-overlapping utilities (e.g. `mx-2 mt-4`) correctly coexist.
- 🧩 **Arbitrary values** — `w-[10px]`, `bg-[#bada55]`, `text-[length:13px]`
  with type-hint and heuristic detection.
- 🔌 **Configurable** — Tailwind `prefix`, extended color/spacing scales,
  custom groups and an adjustable LRU cache via `createCw`.
- 🛡️ **Safe by design** — custom/unknown classes always survive untouched;
  **zero runtime dependencies**, no telemetry.

The product logic is inspired by the ecosystem around `clsx`,
`tailwind-merge` and the trending `shadcn-ui/cn`; every line of ClassWeave is
independently authored with its own declarative rule engine.

---

## ✨ Features

- 🪢 **Conflict resolution** — within the same property, the last utility wins
  (`"p-2 p-4"` → `"p-4"`).
- 🔀 **Conditional inputs** — arrays are flattened and object keys are toggled
  by truthiness, just like `clsx`.
- 📱 **Responsive & state variants** — `hover:`, `focus:`, `md:`, `dark:`,
  `group-hover:`, `peer-checked:` and arbitrary variants never collide across
  variant stacks.
- ⭐ **Important & negative** — v3 prefix (`!p-4`) and v4 suffix (`p-4!`)
  important markers, plus negative utilities (`-mt-2`).
- 🎨 **Ambiguous prefixes resolved** — `text-` (align / size / color / wrap),
  `font-` (family / weight), `ring-`, `outline-`, `shadow-`, `decoration-`,
  `divide-`, `stroke-`, `bg-`.
- 🧱 **Directional edge logic** — `border`, `border-x`, `border-t`, `inset`,
  `rounded-*`, `gap`, `space-x/y`.
- 🔣 **Arbitrary values & type hints** — `[length:…]`, `[color:…]`,
  `[url:…]`, opacity modifiers (`bg-red-500/50`).
- 📦 **ESM + CJS + `.d.ts`** — works in Node, the browser, bundlers and
  TypeScript; ships a small CLI.
- ⚡ **LRU result cache** — repeat calls are fast and the cache size is configurable.
- 0️⃣ **Zero runtime dependencies.**

---

## 🚀 Quick Start

### Requirements

- **Node.js ≥ 16** (for the package/CLI), or any modern bundler/browser.
- Tailwind CSS **v3 or v4** (ClassWeave only processes class strings).

### Install

```bash
npm install classweave
# or
pnpm add classweave
yarn add classweave
```

### Basic Usage

```js
import { cw } from 'classweave';

cw('p-2', 'p-4');
// => 'p-4'

cw('text-sm', 'text-red-500');
// => 'text-sm text-red-500'  (different properties coexist)

cw('block', 'flex');
// => 'flex'
```

> Prefer the conventional helper name? `cn` and `twMerge` are exported as
> aliases of `cw`.

```js
import { cn } from 'classweave';
cn('px-2 py-1', condition && 'bg-blue-500');
```

### Conditional Inputs (clsx-style)

```js
cw('btn', {
  'btn-active': isActive,
  'btn-disabled': isDisabled,
}, ['rounded', maybeFull && 'w-full']);
// => 'btn btn-active rounded w-full'
```

Falsy primitives (`false`, `null`, `undefined`, `''`) are dropped; `0` is
kept as a literal class.

---

## 📖 Usage Guide

### React / JSX

```jsx
function Button({ primary, className, ...props }) {
  return (
    <button
      className={cw(
        'inline-flex items-center rounded-md px-4 py-2 font-medium',
        primary ? 'bg-blue-600 text-white' : 'bg-white text-gray-900',
        className, // user overrides win because they come last
      )}
      {...props}
    />
  );
}
```

Because later utilities win, passing `className="px-8"` correctly overrides the
base padding.

### Vue

```vue
<script setup>
import { cw } from 'classweave';
const props = defineProps({ active: Boolean });
</script>

<template>
  <span :class="cw('text-sm', props.active && 'text-green-500')">Label</span>
</template>
```

### Variants

```js
cw('hover:p-2', 'hover:p-4');
// => 'hover:p-4'

cw('p-2', 'hover:p-4');
// => 'p-2 hover:p-4'  (different variant stacks)

cw('md:hover:p-2', 'md:focus:p-4');
// => 'md:hover:p-2 md:focus:p-4'
```

### Directional Utilities

```js
cw('m-2', 'mx-4');
// => 'mx-4'  (shorthand covers every edge)

cw('mx-2', 'mt-4');
// => 'mx-2 mt-4'  (horizontal and top edges do not overlap)

cw('border', 'border-t-2');
// => 'border-t-2'

cw('border-x-2', 'border-t-2');
// => 'border-x-2 border-t-2'  (no shared edge)
```

### Arbitrary Values

```js
cw('w-4', 'w-[10px]');
// => 'w-[10px]'

cw('text-sm', 'text-[length:13px]');
// => 'text-[length:13px]'

cw('bg-red-500', 'bg-[url(/hero.png)]');
// => 'bg-red-500 bg-[url(/hero.png)]'  (color vs image)
```

### Command Line

```bash
npx classweave "p-2 p-4"
# => p-4

echo "text-sm text-lg" | npx classweave
# => text-lg

npx classweave --prefix tw- "tw-p-2 tw-p-4"
# => tw-p-4
```

Run `npx classweave --help` for all options.

---

## 💡 Design & Roadmap

### Design Philosophy

1. **Declarative, not hard-coded.** Each utility group is described by a rule
   that reports the edges it covers; the merge engine is generic and small.
2. **First match wins.** Ambiguous prefixes are disambiguated by rule order and
   scale inspection, which keeps `text-sm` (size) apart from `text-red-500`
   (color).
3. **Never destructive to unknown classes.** Anything that is not a recognised
   Tailwind utility is passed through verbatim, so custom CSS and hashed module
   classes are safe.
4. **Zero runtime dependencies.** The published package runs anywhere without
   pulling in a dependency tree.

### Why TypeScript

Strict TypeScript gives precise, permissive input types (any string is
accepted, so custom classes never error) while shipping full `.d.ts` files.

### Roadmap

- 🗺️ Broader first-class coverage for official plugins (typography `prose`,
  forms, container queries).
- 🧪 Continue expanding the property matrix and edge cases.
- 🧰 Optional strict mode that warns about unsupported/ambiguous arbitrary values.
- 🌐 Additional documentation languages.

Community contributions toward these are very welcome — see
[CONTRIBUTING.md](../CONTRIBUTING.md).

---

## 📦 Build & Deployment

ClassWeave is a **library/tool**, not a desktop application, so no native
binaries are required.

### Build from Source

```bash
npm install
npm run build      # emits dist/esm, dist/cjs and dist/types
npm test           # builds, then runs the node:test suite
```

### Module Outputs

| Format | Path                | Used by                       |
| ------ | ------------------- | ----------------------------- |
| ESM    | `dist/esm/index.js` | Bundlers, modern Node, `import` |
| CJS    | `dist/cjs/index.js` | `require`, older tooling      |
| Types  | `dist/types/`       | TypeScript editors            |

### Using from a CDN (browser)

```html
<script type="module">
  import { cw } from 'https://cdn.jsdelivr.net/gh/gitstq/classweave/dist/esm/index.js';
  console.log(cw('p-2 p-4')); // 'p-4'
</script>
```

---

## 🤝 Contributing

Pull requests and issues are warmly welcome. Please:

- Follow **Conventional Commits** (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`).
- Add tests for new behavior and ensure `npm run build` and `npm test` pass.
- Keep ClassWeave free of runtime dependencies.

See [CONTRIBUTING.md](../CONTRIBUTING.md) for full details.

---

## 📄 License

Released under the **[MIT License](../LICENSE)**. © 2026 gitstq.
