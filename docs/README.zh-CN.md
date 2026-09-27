# 🧵 ClassWeave（类名织手）

**选择其他语言：** [English](../README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md)

[![版本](https://img.shields.io/badge/版本-1.0.0-blue.svg)](https://github.com/gitstq/classweave)
[![License: MIT](https://img.shields.io/badge/许可证-MIT-green.svg)](../LICENSE)
[![运行时依赖](https://img.shields.io/badge/依赖-0-success.svg)](#-核心特性)
[![测试](https://img.shields.io/badge/测试-158%20通过-brightgreen.svg)](#-快速开始)
[![欢迎 PR](https://img.shields.io/badge/PR-欢迎-orange.svg)](../CONTRIBUTING.md)

> 把杂乱的 Tailwind 类名编织成一条干净、无冲突的字符串 ——
> **`clsx` 与 `tailwind-merge` 合二为一的零依赖工具。**

---

## 🎉 项目介绍

**ClassWeave（类名织手）** 是一个小巧、快速、类型完备的工具。无论你丢给它
字符串、数组还是条件对象，它都会返回一条整洁的字符串，并以智能方式解决
Tailwind 类名冲突。

**它解决的痛点：** 开发组件时，类名往往来自多个来源（基础样式、变体、用户
覆盖）。简单拼接会产生自相矛盾的工具类，例如 `p-2 p-4`、`block flex`；同时
维护两个辅助函数（用 `clsx` 处理条件、用 `tailwind-merge` 处理冲突）又很繁琐。
ClassWeave 用**一个函数同时完成这两件事**。

**自研差异化亮点：**

- 🪄 **一个函数，两件事** —— 条件拼接 + 冲突合并一步到位。
- 🧭 **变体感知** —— 响应式、状态、`dark`、`group/peer`、`data/aria`、堆叠与
  任意变体都作为独立命名空间处理。
- 🧮 **方向感知** —— margin、padding、border、inset、圆角、gap 基于边的覆盖范围
  判定，让不重叠的工具类（如 `mx-2 mt-4`）正确共存。
- 🧩 **任意值支持** —— `w-[10px]`、`bg-[#bada55]`、`text-[length:13px]`，具备
  类型提示与启发式识别。
- 🔌 **可配置** —— 通过 `createCw` 设置 Tailwind `prefix`、扩展颜色/间距刻度、
  自定义分组以及可调的 LRU 缓存。
- 🛡️ **安全设计** —— 自定义/未知类始终原样保留；**零运行时依赖**、无遥测。

产品逻辑灵感来自 `clsx`、`tailwind-merge` 生态以及热门的 `shadcn-ui/cn`；
ClassWeave 的每一行代码均独立编写，并拥有自研的声明式规则引擎。

---

## ✨ 核心特性

- 🪢 **冲突合并** —— 同一属性内，后出现的工具类胜出（`"p-2 p-4"` → `"p-4"`）。
- 🔀 **条件输入** —— 数组递归展平，对象按键的真假决定是否采用，体验与 `clsx` 一致。
- 📱 **响应式与状态变体** —— `hover:`、`focus:`、`md:`、`dark:`、`group-hover:`、
  `peer-checked:` 与任意变体，跨变体栈绝不互相误删。
- ⭐ **重要与负前缀** —— 支持 v3 前缀（`!p-4`）与 v4 后缀（`p-4!`）的 important
  标记，以及负向工具类（`-mt-2`）。
- 🎨 **歧义前缀精准区分** —— `text-`（对齐 / 字号 / 颜色 / 换行）、`font-`（字体族 /
  字重）、`ring-`、`outline-`、`shadow-`、`decoration-`、`divide-`、`stroke-`、`bg-`。
- 🧱 **方向边逻辑** —— `border`、`border-x`、`border-t`、`inset`、`rounded-*`、
  `gap`、`space-x/y`。
- 🔣 **任意值与类型提示** —— `[length:…]`、`[color:…]`、`[url:…]`，以及透明度修饰
  （`bg-red-500/50`）。
- 📦 **ESM + CJS + `.d.ts`** —— 通用于 Node、浏览器、打包器与 TypeScript，并附带
  一个轻量 CLI。
- ⚡ **LRU 结果缓存** —— 重复调用更快，缓存大小可配置。
- 0️⃣ **零运行时依赖。**

---

## 🚀 快速开始

### 环境要求

- **Node.js ≥ 16**（使用包或 CLI），或任意现代打包器 / 浏览器。
- Tailwind CSS **v3 或 v4**（ClassWeave 只处理类名字符串）。

### 安装

```bash
npm install classweave
# 或
pnpm add classweave
yarn add classweave
```

### 基本用法

```js
import { cw } from 'classweave';

cw('p-2', 'p-4');
// => 'p-4'

cw('text-sm', 'text-red-500');
// => 'text-sm text-red-500'  （不同属性共存）

cw('block', 'flex');
// => 'flex'
```

> 习惯用约定俗成的名字？`cn` 与 `twMerge` 都作为 `cw` 的别名导出。

```js
import { cn } from 'classweave';
cn('px-2 py-1', condition && 'bg-blue-500');
```

### 条件输入（clsx 风格）

```js
cw('btn', {
  'btn-active': isActive,
  'btn-disabled': isDisabled,
}, ['rounded', maybeFull && 'w-full']);
// => 'btn btn-active rounded w-full'
```

假值（`false`、`null`、`undefined`、`''`）会被忽略；数字 `0` 会作为字面类保留。

---

## 📖 详细使用指南

### React / JSX

```jsx
function Button({ primary, className, ...props }) {
  return (
    <button
      className={cw(
        'inline-flex items-center rounded-md px-4 py-2 font-medium',
        primary ? 'bg-blue-600 text-white' : 'bg-white text-gray-900',
        className, // 用户覆盖放在最后，因此会生效
      )}
      {...props}
    />
  );
}
```

由于后出现的工具类胜出，传入 `className="px-8"` 会正确覆盖基础内边距。

### Vue

```vue
<script setup>
import { cw } from 'classweave';
const props = defineProps({ active: Boolean });
</script>

<template>
  <span :class="cw('text-sm', props.active && 'text-green-500')">标签</span>
</template>
```

### 变体

```js
cw('hover:p-2', 'hover:p-4');
// => 'hover:p-4'

cw('p-2', 'hover:p-4');
// => 'p-2 hover:p-4'  （变体栈不同）

cw('md:hover:p-2', 'md:focus:p-4');
// => 'md:hover:p-2 md:focus:p-4'
```

### 方向工具类

```js
cw('m-2', 'mx-4');
// => 'mx-4'  （简写覆盖所有边）

cw('mx-2', 'mt-4');
// => 'mx-2 mt-4'  （水平边与上边不重叠）

cw('border', 'border-t-2');
// => 'border-t-2'

cw('border-x-2', 'border-t-2');
// => 'border-x-2 border-t-2'  （没有共享边）
```

### 任意值

```js
cw('w-4', 'w-[10px]');
// => 'w-[10px]'

cw('text-sm', 'text-[length:13px]');
// => 'text-[length:13px]'

cw('bg-red-500', 'bg-[url(/hero.png)]');
// => 'bg-red-500 bg-[url(/hero.png)]'  （颜色 vs 图片）
```

### 命令行

```bash
npx classweave "p-2 p-4"
# => p-4

echo "text-sm text-lg" | npx classweave
# => text-lg

npx classweave --prefix tw- "tw-p-2 tw-p-4"
# => tw-p-4
```

运行 `npx classweave --help` 查看全部选项。

---

## 💡 设计思路与迭代规划

### 设计理念

1. **声明式而非硬编码。** 每个工具类组都由一条规则描述其覆盖的边；合并引擎
   通用且精简。
2. **首个命中即采用。** 歧义前缀通过规则顺序与刻度检查来区分，让 `text-sm`
   （字号）与 `text-red-500`（颜色）互不混淆。
3. **绝不破坏未知类。** 任何不是已识别 Tailwind 工具类的内容都原样透传，自定义
   CSS 与哈希模块类都安全。
4. **零运行时依赖。** 发布包可在任何地方运行，无需引入依赖树。

### 为什么选择 TypeScript

严格的 TypeScript 提供精确且宽松的输入类型（接受任意字符串，自定义类不会报错），
同时附带完整的 `.d.ts` 文件。

### 迭代规划

- 🗺️ 进一步增强官方插件的一等支持（排版 `prose`、表单、容器查询）。
- 🧪 持续扩充属性矩阵与边界情况。
- 🧰 可选的严格模式：对不支持 / 有歧义的任意值给出提示。
- 🌐 补充更多文档语言。

非常欢迎社区围绕这些方向贡献 —— 详见 [CONTRIBUTING.md](../CONTRIBUTING.md)。

---

## 📦 打包与部署指南

ClassWeave 属于**库 / 工具**，并非桌面应用，因此无需原生可执行文件。

### 从源码构建

```bash
npm install
npm run build      # 产出 dist/esm、dist/cjs 与 dist/types
npm test           # 先构建，再运行 node:test 测试套件
```

### 模块产物

| 格式 | 路径                | 适用场景                      |
| ---- | ------------------- | ----------------------------- |
| ESM  | `dist/esm/index.js` | 打包器、新版 Node、`import`   |
| CJS  | `dist/cjs/index.js` | `require`、旧工具链           |
| 类型 | `dist/types/`       | TypeScript 编辑器             |

### 通过 CDN 在浏览器使用

```html
<script type="module">
  import { cw } from 'https://cdn.jsdelivr.net/gh/gitstq/classweave/dist/esm/index.js';
  console.log(cw('p-2 p-4')); // 'p-4'
</script>
```

---

## 🤝 贡献指南

热烈欢迎 Issue 与 Pull Request。请：

- 遵循**约定式提交**（`feat:`、`fix:`、`docs:`、`refactor:`、`test:`）。
- 为新行为补充测试，并确保 `npm run build` 与 `npm test` 通过。
- 保持 ClassWeave 无运行时依赖。

完整说明见 [CONTRIBUTING.md](../CONTRIBUTING.md)。

---

## 📄 开源协议说明

基于 **[MIT 许可证](../LICENSE)** 发布。© 2026 gitstq。
