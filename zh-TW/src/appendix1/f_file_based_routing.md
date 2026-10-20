# Vue Router 的檔案路由

## 本集目標

不再手寫 `routes` 陣列，改成「在 `src/pages` 放一個檔案，就多一個路由」，並且讓 TypeScript 幫你檢查路由名稱。

## 正文

### 手寫 `routes` 的麻煩

第 9 章的每個路由，都要在 `src/router/index.js`（TypeScript 專案是 `index.ts`）的 `routes` 陣列裡加一筆：路徑、元件、名字。頁面一多，這個陣列就變得很長，而且「檔案放在哪」和「網址是什麼」要在兩個地方各寫一次，改了一邊很容易忘了另一邊。

**檔案路由**（file-based routing）的想法是：讓檔案的位置直接決定網址。`src/pages/about.vue` 就是 `/about`，不用再登記。

Vue Router 5 把這個功能內建進來了（以前要另外裝 `unplugin-vue-router` 這個套件，現在已經併入 Vue Router）。第 12 章的 Nuxt 也是用幾乎一樣的規則，這一集學的命名方式到時候可以直接沿用。

### 建立練習專案

```bash
npm create vue@latest -- appendix-router --ts --router
cd appendix-router
npm install
```

這是一個用 TypeScript、已經裝好 Vue Router 的專案。

### 第一步：加上 Vite 外掛

打開 `vite.config.ts`，匯入 `vue-router/vite`，把 `VueRouter()` 加到 `plugins` 陣列的**最前面**：

```ts
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import VueRouter from 'vue-router/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    VueRouter(),
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
```

順序很重要：`VueRouter()` 一定要在 `vue()` 前面。這是官方文件特別標註的規定，因為它要先處理頁面檔案，再交給 `vue()` 編譯。

### 第二步：用自動產生的 `routes`

把 `src/router/index.ts` 換成：

```ts
import { createRouter, createWebHistory } from 'vue-router'
import { routes, handleHotUpdate } from 'vue-router/auto-routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

if (import.meta.hot) {
  handleHotUpdate(router)
}

export default router
```

和原本比，只有兩個地方不同：

- `routes` 不是自己寫的陣列，而是從 `vue-router/auto-routes` 匯入。外掛會掃描 `src/pages` 資料夾，自動產生這個陣列。
- 最後的 `if (import.meta.hot)` 讓你在開發時新增或刪除頁面檔案，路由會馬上更新，不用重新整理。照抄就好。

`src/main.ts` 不用改，它本來就是 `import router from './router'` 再 `app.use(router)`。

### 第三步：建立頁面

原本的 `src/views` 資料夾可以整個刪掉，改建 `src/pages`。放進這幾個檔案：

```text
src/pages/
├── index.vue
├── about.vue
├── books/
│   └── [id].vue
└── [...path].vue
```

`src/pages/index.vue`：

```vue
<template>
  <h1>首頁</h1>
</template>
```

`src/pages/about.vue`：

```vue
<template>
  <h1>關於我們</h1>
</template>
```

`src/pages/books/[id].vue`，檔名真的就是中括號包著 `id`：

```vue
<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute("/books/[id]");
</script>

<template>
  <h1>第 {{ route.params.id }} 本書</h1>
</template>
```

`src/pages/[...path].vue`：

```vue
<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();
</script>

<template>
  <h1>找不到 {{ route.path }}</h1>
</template>
```

最後把 `src/App.vue` 換成簡單的導覽列：

```vue
<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <nav>
    <RouterLink to="/">首頁</RouterLink> |
    <RouterLink to="/about">關於</RouterLink> |
    <RouterLink to="/books/1">第 1 本書</RouterLink>
  </nav>
  <RouterView />
</template>
```

執行 `npm run dev`：

- `/` 顯示「首頁」。
- `/about` 顯示「關於我們」。
- `/books/42` 顯示「第 42 本書」。
- `/nope/x` 這種不存在的網址，顯示「找不到 /nope/x」。

完全沒有寫 `routes` 陣列。

### 命名規則

| 檔案 | 網址 | 說明 |
| --- | --- | --- |
| `index.vue` | `/` | `index` 代表資料夾本身，必須全小寫 |
| `about.vue` | `/about` | 檔名就是路徑 |
| `books/[id].vue` | `/books/:id` | 中括號是動態參數，第 9 章的 `:id` |
| `[...path].vue` | `/:path(.*)` | 三個點代表「剩下全部」，用來做 404 |

資料夾就是網址的一層。`books/[id].vue` 在 `books` 資料夾裡，所以網址是 `/books/` 開頭。

另外，每個頁面都會自動變成延遲載入。執行 `npx vite build`，你會看到每個頁面各自建置成一個小檔案，這就是第 9 章用 `() => import(...)` 手動做的事，現在外掛自動幫你做了。

### 巢狀路由：同名的檔案和資料夾

第 9 章的巢狀路由要寫 `children`。檔案路由的做法是：**放一個和資料夾同名的 `.vue` 檔**，它就成為資料夾裡所有頁面的外框。

新增 `src/pages/books.vue`：

```vue
<template>
  <section>
    <h2>書架</h2>
    <RouterView />
  </section>
</template>
```

再新增 `src/pages/books/index.vue`：

```vue
<template>
  <p>請選一本書</p>
</template>
```

現在 `src/pages` 長這樣：

```text
src/pages/
├── index.vue
├── about.vue
├── books.vue
├── books/
│   ├── index.vue
│   └── [id].vue
└── [...path].vue
```

打開 `/books`，會看到「書架」標題，底下是「請選一本書」；打開 `/books/42`，「書架」標題還在，底下換成「第 42 本書」。`books.vue` 裡的 `<RouterView />` 就是子頁面出現的位置，和第 9 章的巢狀路由一樣。

### 型別：`typed-router.d.ts`

執行過一次 `npm run dev` 或 `npx vite build` 之後，專案根目錄會多出一個 `typed-router.d.ts`。這是外掛根據 `src/pages` 自動產生的型別檔，記錄了所有路由的名字和參數。不要手動修改它，但要把它 commit 進 Git。

要讓 TypeScript 讀到它，打開 `tsconfig.app.json`，在 `include` 陣列最後加上 `"typed-router.d.ts"`：

```json
{
  "include": [
    "env.d.ts",
    "src/**/*",
    "src/**/*.vue",
    "typed-router.d.ts"
  ]
}
```

這裡只列出 `include`，檔案裡其他的設定不用動。

加了之後，`useRoute("/books/[id]")` 就有了型別。括號裡的字串是這個路由的**名字**，外掛用檔案路徑當名字。TypeScript 因此知道 `route.params` 裡有 `id`。

故意打錯，把它改成 `useRoute("/book/[id]")`（少了一個 s），再執行 `npm run type-check`：

```text
src/pages/books/[id].vue(4,24): error TS2345: Argument of type '"/book/[id]"' is not assignable to parameter of type 'keyof RouteNamedMap | undefined'.
src/pages/books/[id].vue(8,25): error TS2339: Property 'id' does not exist on type 'Record<never, never> | { path: string; } | { id: string; }'.
  Property 'id' does not exist on type 'Record<never, never>'.
```

第一個錯誤說：`"/book/[id]"` 不是任何一個路由的名字。第二個錯誤是連帶的：名字錯了，TypeScript 就不確定 `params` 裡有沒有 `id`。改回 `"/books/[id]"` 就好了。

手寫 `routes` 時，路由名字打錯要到執行時才會發現；檔案路由在你寫程式的時候就會被抓出來。

官方文件還建議在 `tsconfig.app.json` 加上兩個 Volar 外掛（Volar 是 VS Code 的 Vue (Official) 擴充功能背後的工具）（`vueCompilerOptions.plugins`），讓 `useRoute()` 不用傳名字也能自動推論型別。這是選用的，上面的寫法已經夠用。

### 在頁面裡設定路由：`definePage`

第 9 章的導覽守衛會用 `meta` 標記「這頁需要登入」。手寫 `routes` 時，`meta` 寫在陣列裡；檔案路由沒有陣列，改在頁面檔案裡用 `definePage` 寫。把 `src/pages/about.vue` 改成：

```vue
<script setup lang="ts">
definePage({
  meta: { requiresAuth: true },
});
</script>

<template>
  <h1>關於我們</h1>
</template>
```

`definePage` 和 `defineProps` 一樣是編譯時處理的特殊函式，不用匯入。導覽守衛裡的 `to.meta.requiresAuth` 就讀得到它，第 9 章的守衛寫法不用改。

`definePage` 裡面**不能用變數**，只能寫固定的值。因為它在建置時就被抽出來放進路由設定，那時候你的變數還不存在。

如果你的專案有裝 ESLint（附錄這個練習專案沒有），ESLint 會說 `definePage` 沒有定義。官方文件的 ESLint 章節有說明怎麼把它加成全域變數。

### 要不要用

- 頁面不多、路由設定很特別：手寫 `routes`，一目了然。
- 頁面很多、想讓網址跟著資料夾結構走：檔案路由省事，還多了型別檢查。

兩種做法產生的都是同一個 `routes` 陣列，Vue Router 的其他功能（`RouterLink`、`useRouter`、導覽守衛）用法完全一樣。

## 重點整理

- Vue Router 5 內建檔案路由：`vite.config.ts` 加 `VueRouter()`（從 `vue-router/vite` 匯入，放在 `vue()` 前面），`routes` 改從 `vue-router/auto-routes` 匯入。
- `src/pages` 裡的檔案決定網址：`index.vue` 是 `/`，`[id].vue` 是動態參數，`[...path].vue` 接住所有找不到的網址。
- 和資料夾同名的 `.vue` 檔是巢狀路由的外框，裡面放 `<RouterView />`。
- 把 `typed-router.d.ts` 加進 `tsconfig.app.json`，`useRoute("/books/[id]")` 的名字和參數就有型別檢查。
- 用 `definePage` 在頁面裡設定 `meta`，裡面不能用變數。
