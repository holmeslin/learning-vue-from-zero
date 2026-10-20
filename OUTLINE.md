# 全書大綱

這是規劃用的大綱。實際集數以 `zh-TW/src/SUMMARY.md` 為準。

鎖定版本：Vue 3.5、Vite 8、Vue Router 5、Pinia 4、Vitest 4、Nuxt 4、Node.js 24 LTS、npm。專案一律用 `npm create vue@latest`（create-vue）與 `npm create nuxt@latest` 建立，版本以它們產生的為準。Vue 3.6 與 Vapor Mode 在本書撰寫時（2026 年 10 月）還是 RC，正文不用，只在附錄一預覽。

寫法：正文只教 Composition API 搭配 `<script setup>`，Options API 放附錄一。第一部用 JavaScript，第 10 章教 TypeScript，第二部全部用 TypeScript。

## 第一部

### 第 1 章 JavaScript 第一步

網頁是怎麼組成的、安裝 Node.js 與 VS Code、第一個程式、`const` 與 `let`、註解、數字與算術、字串與樣板字面值、布林值與比較、`if` 與 `else`、邏輯運算子、三元運算子、陣列基礎、`for...of`、物件基礎、`null` 與 `undefined`、綜合練習

### 第 2 章 函式與現代 JavaScript

函式宣告、參數與回傳值、箭頭函式、函式也是值（callback）、`map`、`filter`、其他陣列方法（`find`、`some`、`includes`、`reduce`）、物件解構、陣列解構、展開語法、物件與陣列是參考、`?.` 與 `??`、`import` / `export`、Promise 與 `async` / `await`、`fetch` 與 JSON、綜合練習

### 第 3 章 HTML 與 CSS

HTML 結構、常用標籤、屬性、表單元素、CSS 選擇器、盒模型、Flexbox、DOM 是什麼以及為什麼需要 Vue

### 第 4 章 第一個 Vue 程式

用 create-vue 建立專案、專案結構、單一檔案元件（SFC）、模板與 `{{ }}`、`v-bind`、元件組合與拆檔、props（`defineProps`）、預設 slot、`v-if` / `v-else` / `v-show`、`v-for` 與 `key`、class 與 style 綁定、`<style scoped>`、Vue DevTools

### 第 5 章 響應式與互動

`v-on` 事件、為什麼普通變數不行、`ref`、`.value` 與模板自動解包、`reactive`、`computed`、`v-model`、各種表單輸入、多欄位表單、`defineEmits`、`defineModel`、`nextTick`、綜合練習：待辦清單

### 第 6 章 監聽與生命週期

`watch`、`watchEffect`、`onWatcherCleanup`、生命週期 Hook（`onMounted` / `onUnmounted`）、`useTemplateRef` 操作 DOM、用 `watch` 抓資料、你可能不需要 `watch`、composable、composable 的規則

### 第 7 章 元件進階

props 解構與預設值、透傳屬性（`$attrs`）、具名 slot、作用域 slot、`provide` / `inject`、`<Teleport>`、`<Transition>`、`<KeepAlive>`、非同步元件、錯誤處理（`onErrorCaptured`）

### 第 8 章 Pinia

為什麼需要 store、安裝 Pinia、`defineStore`（setup store）、`state` / `getters` / `actions` 的對應、`storeToRefs`、多個 store 互相使用、綜合練習：購物車

### 第 9 章 Vue Router

安裝與第一個路由、`RouterLink`、`RouterView` 與巢狀路由、動態路由與 `useRoute`、query 參數、`useRouter` 換頁、導覽守衛、404 頁面、延遲載入路由

路由一律手寫 `routes` 陣列；檔案路由在第二部的 Nuxt 學，Vue Router 5 內建的檔案路由放附錄一。

### 第 10 章 TypeScript

為什麼要用 TypeScript、基本型別、型別推論、物件型別、聯集型別、用 `--ts` 建立專案與 `vue-tsc`、`defineProps` 的型別、`defineEmits` 的型別、`ref` / `reactive` / `computed` 的型別、模板 ref 與事件的型別、`provide` / `inject` 與 `InjectionKey`、泛型入門與泛型元件、Pinia 的型別

### 第 11 章 測試

為什麼要寫測試、Vitest、第一個測試、`describe` / `test` / `expect`、用 `mount` 渲染元件、`find` / `get` 找元素、`trigger` 與 `setValue` 模擬操作、測試 props 與 emit、非同步測試（`flushPromises`）、`vi.fn` 與 `vi.mock`、測試 composable、測試 Pinia store

測試函式庫用 Vue Test Utils（create-vue 預設），不用 `@testing-library/vue`。

### 附錄一

Tailwind CSS、ESLint / Oxlint 與 Prettier、看懂 Options API、自訂指令、render function 與 JSX、Vue Router 的檔案路由、Vapor Mode 預覽、生態系簡介（VueUse、TanStack Query、Element Plus / Vuetify / PrimeVue）

## 第二部（全部用 TypeScript）

### 第 12 章 Nuxt 入門

為什麼需要框架、`npm create nuxt@latest`、專案結構（`app/` 資料夾）、`app.vue` 與 `pages/`、檔案路由、動態路由 `[id]`、`NuxtLink`、`layouts/`、自動匯入、`error.vue` 與 `createError`、`useHead` / `useSeoMeta`、`@nuxt/image` 與 `@nuxt/fonts`

### 第 13 章 渲染與資料抓取

伺服器與瀏覽器、SSR 與 hydration、`useFetch`、`useAsyncData`、`$fetch` 與 `useFetch` 的差別、`useState` 跨元件共享、`<ClientOnly>`、hydration mismatch、延遲載入元件與 lazy hydration

### 第 14 章 Server API

`server/api` 第一支 API、`defineEventHandler`、`readBody` 與路由參數、用 `useStorage` 讀寫資料、表單送出後 `refresh`、`createError` 回傳錯誤、輸入驗證與安全、route middleware、綜合練習：留言板

資料用 Nitro 的 `useStorage` 存放；輸入驗證手寫，不另外安裝 zod，只提一句實務上常用 `readValidatedBody` 搭配 zod。

### 第 15 章 快取、渲染與部署

`routeRules`（prerender、SWR、ISR）、混合渲染、`runtimeConfig` 與環境變數、`nuxt build` 與 `nuxt preview`、`nuxt generate` 產生靜態網站、部署簡介（Vercel、Netlify、Node 伺服器）

### 附錄二

在 Nuxt 裡用 Pinia、Nuxt Layers 與模組簡介、VitePress 簡介

## 其他檔案

- `foreword.md`、`afterword.md`
- 第 1 章與第 2、3 章大部分內容改寫自《從零開始學 React》，React 相關的預告與說明要改成 Vue 的對應內容
- `GUIDE.md`（AI 助教操作規格）與 `EXERCISES.md`（固定題庫）：尚未撰寫。要放在 `zh-TW/src/`，才會被打包進 `vue-book-src.zip`
