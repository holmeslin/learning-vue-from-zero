# Nuxt Layers 與模組簡介

## 本集目標

知道 Nuxt 的模組是什麼、去哪裡找、怎麼安裝；並且用 `extends` 做出一個 Layer，讓專案共用另一個資料夾裡的設定與元件。

## 正文

### 模組：幫 Nuxt 加功能

你已經裝過好幾個模組了：第 12 章的 `@nuxt/image`、`@nuxt/fonts`，上一集的 `@pinia/nuxt`。

**模組**（module）是專門寫給 Nuxt 用的套件。一般的套件，例如 Pinia 本身，只提供函式讓你呼叫；模組則會在 Nuxt 啟動和建置的時候執行，直接改 Nuxt 的行為。以上一集的 `@pinia/nuxt` 為例，它的程式碼裡做了這幾件事：

- 註冊一個外掛（plugin），在每個請求開始時呼叫 `createPinia()`。
- 把 `defineStore`、`storeToRefs` 加進自動匯入的清單。
- 把 `app/stores/` 資料夾也加進自動匯入。

這些本來要你自己在設定檔裡一行一行寫，模組幫你包好了。所以裝模組通常只要一行指令，裝完就能用。

### 去哪裡找模組

官方的模組清單在 [nuxt.com/modules](https://nuxt.com/modules)，可以用關鍵字搜尋，也可以按分類瀏覽。模組頁面上看得到它支援哪些 Nuxt 版本、下載數與最近的更新。挑模組時先看這幾項：支援 Nuxt 4、最近還有在更新的，比較不會踩雷。

幾個常見的例子：

| 模組 | 用途 |
| --- | --- |
| `@nuxt/image` | 圖片最佳化（第 12 章） |
| `@nuxt/fonts` | 字型載入（第 12 章） |
| `@pinia/nuxt` | Pinia（上一集） |
| `@nuxt/content` | 用 Markdown 寫網站內容 |
| `@nuxt/eslint` | ESLint 設定（附錄一） |
| `@nuxt/test-utils` | 在 Vitest 裡測試 Nuxt 元件 |

### 用 `nuxt module add` 安裝

模組頁面上會寫安裝指令，格式都一樣：

```bash
npx nuxt module add <模組名稱>
```

模組名稱是 nuxt.com/modules 上那個簡短的名字，例如 `pinia`、`image`、`content`。這個指令會做兩件事：用 npm 安裝套件，然後把它加進 `nuxt.config.ts` 的 `modules` 陣列。

如果你比較想自己動手，也可以先 `npm install`，再手動把套件名稱加進 `modules`，效果一樣。只是有些模組需要額外的設定或另一個套件（像上一集的 `@pinia/nuxt` 還要裝 `pinia`），用 `nuxt module add` 比較不會漏。

### Layers：共用一整套東西

模組加的是「功能」。如果你想共用的是**你自己寫的東西**呢？例如公司有三個網站，都要用同一個頁尾、同一個價格格式化函式、同樣的 `<html lang>` 設定。複製貼上三份，之後改一個地方就要改三次。

Nuxt 的解法是 **Layer**：把共用的東西放在一個資料夾，結構和一般 Nuxt 專案一樣，其他專案用 `extends` 把它「疊」上來。

動手做一個。先建立一個新專案：

```bash
npm create nuxt@latest my-site
```

範本選 minimal，其他問題的回答和第 12 章一樣。然後在 `my-site` **旁邊**（不是裡面）建立一個 `base-layer` 資料夾，放這三個檔案：

```text
base-layer/
├── nuxt.config.ts
└── app/
    ├── components/
    │   └── SiteFooter.vue
    └── composables/
        └── useFormatPrice.ts
```

`base-layer/nuxt.config.ts`：

```ts
export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: { lang: "zh-Hant-TW" },
    },
  },
});
```

`base-layer/app/components/SiteFooter.vue`：

```vue
<template>
  <footer>© 2026 小明的工作室</footer>
</template>
```

`base-layer/app/composables/useFormatPrice.ts`：

```ts
export function useFormatPrice(price: number) {
  return `NT$ ${price.toLocaleString("zh-TW")}`;
}
```

一個 Layer 至少要有 `nuxt.config.ts`，其他資料夾的規則和第 12 章的專案結構完全一樣：`app/components/` 放元件、`app/composables/` 放 composable。

接著在 `my-site/nuxt.config.ts` 加上 `extends` 這一行，指向那個資料夾（其他幾行是建立專案時產生的，照原本的樣子留著）：

```ts
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: ['../base-layer'],
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true }
})
```

把 `my-site/app/app.vue` 改成：

```vue
<template>
  <main>
    <p>鍵盤：{{ useFormatPrice(1200) }}</p>
    <SiteFooter />
  </main>
</template>
```

`my-site` 裡面根本沒有 `SiteFooter.vue` 和 `useFormatPrice.ts`，但在 `my-site` 執行 `npm run dev`，打開 <http://localhost:3000>，畫面會出現：

```text
鍵盤：NT$ 1,200
© 2026 小明的工作室
```

檢視網頁原始碼，最上面的 `<html>` 也帶著 Layer 裡設定的語言：

```text
<html  lang="zh-Hant-TW">
```

元件、composable、設定，全部從 Layer 來，而且一樣是自動匯入。

### 專案自己的檔案優先

如果 `my-site` 也有一個 `app/components/SiteFooter.vue` 呢？用的會是 `my-site` 自己那個。規則是：**越靠近專案的越優先**，Layer 只是提供預設值。所以你可以先 `extends` 一整套共用的東西，再挑幾個檔案在專案裡覆蓋掉。

### 其他放 Layer 的方式

上面用的是相對路徑。`extends` 也可以寫 npm 套件名稱，或是 `github:帳號/儲存庫` 這種 GitHub 網址，讓不同儲存庫的專案共用同一個 Layer。

另外，Nuxt 4 會自動把專案根目錄 `layers/` 資料夾裡的每個子資料夾都當成 Layer，不用寫 `extends`。例如把 `base-layer` 搬到 `my-site/layers/base/`，效果一樣。適合把一個大專案依功能切成幾塊。

Layer 能做的事還很多，例如共用頁面、layouts、server API。等你真的有「好幾個專案要共用」的需求時，再去看官方文件的 Layers 章節就好。

## 重點整理

- 模組是寫給 Nuxt 的套件，會在啟動與建置時改變 Nuxt 的行為，例如註冊外掛、加自動匯入。
- 到 nuxt.com/modules 找模組，挑支援 Nuxt 4、最近有更新的。
- `npx nuxt module add <名稱>` 會安裝套件並加進 `nuxt.config.ts` 的 `modules`。
- Layer 是一個結構和 Nuxt 專案一樣的資料夾，用 `extends` 疊上來，就能共用設定、元件和 composable。
- 專案自己的檔案會覆蓋 Layer 裡同名的檔案；`layers/` 資料夾裡的 Layer 會自動載入。
