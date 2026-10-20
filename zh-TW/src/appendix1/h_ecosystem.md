# 生態系簡介

## 本集目標

認識幾個 Vue 專案裡很常見的函式庫：VueUse、TanStack Query，以及 Element Plus、Vuetify、PrimeVue 這幾套 UI 元件庫，知道它們解決什麼問題、什麼時候該考慮。

## 正文

Vue 本身管的是畫面和響應式，加上官方的 Vue Router 和 Pinia，已經能做出完整的網站。但專案變大之後，有些事情一再重複出現，社群就把它們做成了函式庫。這一集每個只示範最基本的用法，讓你知道它們長什麼樣子。

範例用 TypeScript，可以沿用「自訂指令」那一集的 `appendix-ts` 專案，或另外建一個：

```bash
npm create vue@latest -- appendix-ts --ts
cd appendix-ts
npm install
```

### VueUse：現成的 composable

第 6 章你學過自己寫 composable。**VueUse** 是一個收集了兩百多個 composable 的函式庫，滑鼠位置、視窗大小、網路狀態、剪貼簿、深色模式、存到瀏覽器的資料……常見的需求幾乎都有人寫好了。

安裝：

```bash
npm install @vueuse/core
```

新增 `src/components/MouseNote.vue`：

```vue
<script setup lang="ts">
import { useLocalStorage, useMouse } from "@vueuse/core";

const { x, y } = useMouse();
const note = useLocalStorage("note", "");
</script>

<template>
  <p>滑鼠在 ({{ x }}, {{ y }})</p>
  <textarea v-model="note" placeholder="重新整理也不會不見" />
</template>
```

放進 `App.vue` 執行，移動滑鼠，座標會跟著變。在文字框裡打幾個字，重新整理頁面，字還在。

- `useMouse()` 回傳 `x` 和 `y` 兩個 `ref`，滑鼠一動就更新。它在元件卸載時也會自動移除事件監聽，就像第 6 章自己寫的 `useMouse` 用 `onUnmounted` 做的事。
- `useLocalStorage("note", "")` 回傳一個 `ref`，它的值會自動存進瀏覽器的 localStorage（瀏覽器提供的一個小型儲存空間，關掉網頁也不會消失）。第二個參數是一開始的預設值。改它的值就會存檔，下次打開會讀回來。

**什麼時候考慮**：當你準備自己寫一個「跟瀏覽器打交道」的 composable 之前，先去 VueUse 的網站搜尋一下，很可能已經有了，而且處理好了你沒想到的細節。

### TanStack Query：管理從伺服器來的資料

第 6 章你用 `watch` 搭配 `fetch` 抓資料，要自己處理「載入中」、「出錯了」、「參數變了要重新抓」。專案一大，還會遇到更多問題：好幾個元件要同一份資料，要不要各抓一次？使用者切回這個分頁時，資料是不是舊了？**TanStack Query** 就是專門處理這些事的。

安裝：

```bash
npm install @tanstack/vue-query
```

在 `src/main.ts` 裡安裝它的外掛，和 Pinia、Vue Router 一樣用 `app.use`：

```ts
import { createApp } from "vue";
import { VueQueryPlugin } from "@tanstack/vue-query";
import App from "./App.vue";

createApp(App).use(VueQueryPlugin).mount("#app");
```

準備一個假資料檔 `public/books.json`。`public` 資料夾裡的檔案可以直接用網址讀到：

```json
[
  { "id": 1, "title": "貓咪的程式課" },
  { "id": 2, "title": "河馬的資料結構" }
]
```

新增 `src/components/BookList.vue`：

```vue
<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";

type Book = { id: number; title: string };

const { data, isPending, error } = useQuery({
  queryKey: ["books"],
  queryFn: async (): Promise<Book[]> => {
    const res = await fetch("/books.json");
    if (!res.ok) throw new Error("抓取失敗");
    return res.json();
  },
});
</script>

<template>
  <p v-if="isPending">載入中……</p>
  <p v-else-if="error">出錯了：{{ error.message }}</p>
  <ul v-else>
    <li v-for="book in data" :key="book.id">{{ book.title }}</li>
  </ul>
</template>
```

執行之後，先閃過「載入中……」，接著出現兩本書的清單。

- `queryKey`：這筆資料的名字。名字相同的查詢共用同一份快取，三個元件都要書單，也只會抓一次。
- `queryFn`：真正抓資料的函式，回傳 Promise。
- `useQuery` 回傳的 `data`、`isPending`、`error` 都是 `ref`，不用自己宣告三個狀態。

除此之外，它還會自動做這些事：失敗時重試、使用者切回分頁時檢查資料有沒有更新。你送出表單改了資料之後，也可以一行程式碼讓相關的快取作廢、重新抓取。這些用 `watch` 自己寫，會很辛苦。

**什麼時候考慮**：資料主要來自伺服器 API，而且很多頁面、很多元件都要用。只抓一兩次資料的小專案，第 6 章的寫法就夠了。另外，第二部的 Nuxt 內建了 `useFetch`（第 13 章），解決的是類似的問題，用 Nuxt 時通常先用它。

順帶一提：TanStack Query 管的是「伺服器上的資料在瀏覽器裡的副本」，Pinia 管的是「瀏覽器自己的狀態」（例如購物車、目前登入的使用者）。兩者分工不同，可以一起用。

### UI 元件庫

按鈕、表單、對話框、表格、日期選擇器、通知訊息……每個網站都需要，自己從頭做又費時。**UI 元件庫**把這些做成現成的 Vue 元件，你匯入就能用，外觀也一致。

Vue 生態系有好幾套，三套常見的：

**Element Plus**：Vue 2 時代 Element UI 的 Vue 3 版本。元件齊全，特別擅長表格、表單這類資料密集的畫面，很多公司的後台管理系統用它。在中文社群特別流行，中文文件和網路上的討論都很多。

**Vuetify**：照著 Google 的 Material Design 設計規範做的元件庫。如果你希望網站看起來像 Google 的產品（Android、Gmail 那種風格），或是團隊已經採用 Material Design，它是很自然的選擇。

**PrimeVue**：元件數量非常多，從基本的按鈕到圖表、樹狀選單都有。它的特色是可以切換成「無樣式模式」，只提供功能和結構，外觀由你自己決定，所以能和這個附錄「Tailwind CSS」那一集介紹的 Tailwind 搭配。

安裝方式各有不同，照各自官方文件的「Getting Started」做就好，通常是 `npm install` 一個套件，再在 `main.ts` 裡 `app.use()` 一下。

**什麼時候考慮**：

- 後台、管理介面、內部工具，功能比外觀重要：用元件庫可以省下大量時間。
- 對外的產品網站、外觀需要很有特色：元件庫的預設樣式反而會綁手綁腳，自己寫元件或用 Tailwind 可能更合適。
- 一個專案只選一套，不要混用，不然外觀會不一致，網站也會變大。

### 選函式庫的原則

Vue 生態系裡還有很多好用的東西，你不需要全部學會。遇到問題時，知道「應該有人做過這個」，去查一查就好。

選的時候看幾件事：最近有沒有在更新、有沒有支援你用的 Vue 版本、文件寫得清不清楚。比起追最新、最熱門的，維護穩定的函式庫更可靠。也別忘了先問自己：Vue 內建的功能是不是已經夠用了？

## 重點整理

- VueUse 收集了兩百多個現成的 composable，自己寫跟瀏覽器有關的功能之前先查查它。
- TanStack Query 管理從伺服器來的資料，自動處理載入狀態、錯誤、快取和重新抓取。
- Element Plus、Vuetify、PrimeVue 提供現成的 UI 元件，適合後台和內部工具，一個專案只選一套。
- 先用 Vue 內建的功能，遇到真正的痛點再加函式庫。
