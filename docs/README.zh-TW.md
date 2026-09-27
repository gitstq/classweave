# 🧵 ClassWeave（類名織手）

**選擇其他語言：** [English](../README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md)

[![版本](https://img.shields.io/badge/版本-1.0.0-blue.svg)](https://github.com/gitstq/classweave)
[![License: MIT](https://img.shields.io/badge/授權-MIT-green.svg)](../LICENSE)
[![執行階段相依](https://img.shields.io/badge/相依-0-success.svg)](#-核心特性)
[![測試](https://img.shields.io/badge/測試-158%20通過-brightgreen.svg)](#-快速開始)
[![歡迎 PR](https://img.shields.io/badge/PR-歡迎-orange.svg)](../CONTRIBUTING.md)

> 把雜亂的 Tailwind 類名編織成一條乾淨、無衝突的字串 ——
> **`clsx` 與 `tailwind-merge` 合而為一的零相依工具。**

---

## 🎉 專案介紹

**ClassWeave（類名織手）** 是一個小巧、快速、型別完備的工具。無論你丟給它
字串、陣列還是條件物件，它都會回傳一條整潔的字串，並以智慧方式解決 Tailwind
類名衝突。

**它解決的痛點：** 開發元件時，類名往往來自多個來源（基礎樣式、變體、使用者
覆寫）。直接拼接會產生自相矛盾的工具類，例如 `p-2 p-4`、`block flex`；同時維護
兩個輔助函式（用 `clsx` 處理條件、用 `tailwind-merge` 處理衝突）又很繁瑣。
ClassWeave 用**一個函式同時完成這兩件事**。

**自研差異化亮點：**

- 🪄 **一個函式，兩件事** —— 條件拼接 + 衝突合併一次到位。
- 🧭 **變體感知** —— 響應式、狀態、`dark`、`group/peer`、`data/aria`、堆疊與
  任意變體都作為獨立命名空間處理。
- 🧮 **方向感知** —— margin、padding、border、inset、圓角、gap 依據邊的涵蓋範圍
  判定，讓不重疊的工具類（如 `mx-2 mt-4`）正確共存。
- 🧩 **任意值支援** —— `w-[10px]`、`bg-[#bada55]`、`text-[length:13px]`，具備
  型別提示與啟發式辨識。
- 🔌 **可設定** —— 透過 `createCw` 設定 Tailwind `prefix`、擴充顏色/間距刻度、
  自訂分組以及可調的 LRU 快取。
- 🛡️ **安全設計** —— 自訂/未知類始終原樣保留；**零執行階段相依**、無遙測。

產品邏輯靈感來自 `clsx`、`tailwind-merge` 生態以及熱門的 `shadcn-ui/cn`；
ClassWeave 的每一行程式碼皆獨立編寫，並擁有自研的宣告式規則引擎。

---

## ✨ 核心特性

- 🪢 **衝突合併** —— 同一屬性內，後出現的工具類勝出（`"p-2 p-4"` → `"p-4"`）。
- 🔀 **條件輸入** —— 陣列遞迴展平，物件依鍵值的真假決定是否採用，體驗與 `clsx` 一致。
- 📱 **響應式與狀態變體** —— `hover:`、`focus:`、`md:`、`dark:`、`group-hover:`、
  `peer-checked:` 與任意變體，跨變體堆疊絕不互相誤刪。
- ⭐ **重要與負前綴** —— 支援 v3 前綴（`!p-4`）與 v4 後綴（`p-4!`）的 important
  標記，以及負向工具類（`-mt-2`）。
- 🎨 **歧義前綴精準區分** —— `text-`（對齊 / 字級 / 顏色 / 換行）、`font-`（字體家族 /
  字重）、`ring-`、`outline-`、`shadow-`、`decoration-`、`divide-`、`stroke-`、`bg-`。
- 🧱 **方向邊邏輯** —— `border`、`border-x`、`border-t`、`inset`、`rounded-*`、
  `gap`、`space-x/y`。
- 🔣 **任意值與型別提示** —— `[length:…]`、`[color:…]`、`[url:…]`，以及透明度修飾
  （`bg-red-500/50`）。
- 📦 **ESM + CJS + `.d.ts`** —— 通用於 Node、瀏覽器、打包器與 TypeScript，並附帶
  一個輕量 CLI。
- ⚡ **LRU 結果快取** —— 重複呼叫更快速，快取大小可設定。
- 0️⃣ **零執行階段相依。**

---

## 🚀 快速開始

### 環境需求

- **Node.js ≥ 16**（使用套件或 CLI），或任何現代打包器 / 瀏覽器。
- Tailwind CSS **v3 或 v4**（ClassWeave 只處理類名字串）。

### 安裝

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
// => 'text-sm text-red-500'  （不同屬性共存）

cw('block', 'flex');
// => 'flex'
```

> 習慣用約定俗成的名稱？`cn` 與 `twMerge` 都作為 `cw` 的別名匯出。

```js
import { cn } from 'classweave';
cn('px-2 py-1', condition && 'bg-blue-500');
```

### 條件輸入（clsx 風格）

```js
cw('btn', {
  'btn-active': isActive,
  'btn-disabled': isDisabled,
}, ['rounded', maybeFull && 'w-full']);
// => 'btn btn-active rounded w-full'
```

假值（`false`、`null`、`undefined`、`''`）會被忽略；數字 `0` 會作為字面類保留。

---

## 📖 詳細使用指南

### React / JSX

```jsx
function Button({ primary, className, ...props }) {
  return (
    <button
      className={cw(
        'inline-flex items-center rounded-md px-4 py-2 font-medium',
        primary ? 'bg-blue-600 text-white' : 'bg-white text-gray-900',
        className, // 使用者覆寫放在最後，因此會生效
      )}
      {...props}
    />
  );
}
```

由於後出現的工具類勝出，傳入 `className="px-8"` 會正確覆寫基礎內邊距。

### Vue

```vue
<script setup>
import { cw } from 'classweave';
const props = defineProps({ active: Boolean });
</script>

<template>
  <span :class="cw('text-sm', props.active && 'text-green-500')">標籤</span>
</template>
```

### 變體

```js
cw('hover:p-2', 'hover:p-4');
// => 'hover:p-4'

cw('p-2', 'hover:p-4');
// => 'p-2 hover:p-4'  （變體堆疊不同）

cw('md:hover:p-2', 'md:focus:p-4');
// => 'md:hover:p-2 md:focus:p-4'
```

### 方向工具類

```js
cw('m-2', 'mx-4');
// => 'mx-4'  （簡寫涵蓋所有邊）

cw('mx-2', 'mt-4');
// => 'mx-2 mt-4'  （水平邊與上邊不重疊）

cw('border', 'border-t-2');
// => 'border-t-2'

cw('border-x-2', 'border-t-2');
// => 'border-x-2 border-t-2'  （沒有共享邊）
```

### 任意值

```js
cw('w-4', 'w-[10px]');
// => 'w-[10px]'

cw('text-sm', 'text-[length:13px]');
// => 'text-[length:13px]'

cw('bg-red-500', 'bg-[url(/hero.png)]');
// => 'bg-red-500 bg-[url(/hero.png)]'  （顏色 vs 圖片）
```

### 命令列

```bash
npx classweave "p-2 p-4"
# => p-4

echo "text-sm text-lg" | npx classweave
# => text-lg

npx classweave --prefix tw- "tw-p-2 tw-p-4"
# => tw-p-4
```

執行 `npx classweave --help` 檢視全部選項。

---

## 💡 設計思路與迭代規劃

### 設計理念

1. **宣告式而非硬編碼。** 每個工具類組都由一條規則描述其涵蓋的邊；合併引擎
   通用且精簡。
2. **首個命中即採用。** 歧義前綴透過規則順序與刻度檢查來區分，讓 `text-sm`
   （字級）與 `text-red-500`（顏色）互不混淆。
3. **絕不破壞未知類。** 任何不是已辨識 Tailwind 工具類的內容都原樣傳遞，自訂
   CSS 與雜湊模組類都安全。
4. **零執行階段相依。** 發布套件可在任何地方執行，無需引入相依樹。

### 為什麼選擇 TypeScript

嚴格的 TypeScript 提供精確且寬鬆的輸入型別（接受任意字串，自訂類不會報錯），
同時附帶完整的 `.d.ts` 檔案。

### 迭代規劃

- 🗺️ 進一步強化官方外掛的一等支援（排版 `prose`、表單、容器查詢）。
- 🧪 持續擴充屬性矩陣與邊界情況。
- 🧰 可選的嚴格模式：對不支援 / 有歧義的任意值提出提示。
- 🌐 補充更多文件語言。

非常歡迎社群圍繞這些方向貢獻 —— 詳見 [CONTRIBUTING.md](../CONTRIBUTING.md)。

---

## 📦 打包與部署指南

ClassWeave 屬於**函式庫 / 工具**，並非桌面應用程式，因此無需原生可執行檔。

### 從原始碼建置

```bash
npm install
npm run build      # 產出 dist/esm、dist/cjs 與 dist/types
npm test           # 先建置，再執行 node:test 測試套件
```

### 模組產物

| 格式 | 路徑                | 適用場景                      |
| ---- | ------------------- | ----------------------------- |
| ESM  | `dist/esm/index.js` | 打包器、新版 Node、`import`   |
| CJS  | `dist/cjs/index.js` | `require`、舊工具鏈           |
| 型別 | `dist/types/`       | TypeScript 編輯器             |

### 透過 CDN 於瀏覽器使用

```html
<script type="module">
  import { cw } from 'https://cdn.jsdelivr.net/gh/gitstq/classweave/dist/esm/index.js';
  console.log(cw('p-2 p-4')); // 'p-4'
</script>
```

---

## 🤝 貢獻指南

熱烈歡迎 Issue 與 Pull Request。請：

- 遵循**約定式提交**（`feat:`、`fix:`、`docs:`、`refactor:`、`test:`）。
- 為新行為補充測試，並確保 `npm run build` 與 `npm test` 通過。
- 保持 ClassWeave 無執行階段相依。

完整說明見 [CONTRIBUTING.md](../CONTRIBUTING.md)。

---

## 📄 開源授權說明

基於 **[MIT 授權](../LICENSE)** 發布。© 2026 gitstq。
