# 動態路由 `[id]`

## 本集目標

用一個頁面檔案，對應「很多個長得很像的網址」，例如 `/books/1`、`/books/2`、`/books/3`，並且處理好網址參數的型別。

## 正文

### 一本書一個檔案？

書店有三本書，每本書都要有自己的頁面。難道要建 `1.vue`、`2.vue`、`3.vue` 三個檔案嗎？當然不用，如果有一千本書呢？

第 9 章你是在 `routes` 裡寫 `path: "products/:id"`，用冒號標出「這一段是變數」。Nuxt 的寫法是：**把檔名用中括號包起來。**

建立 `app/pages/books/[id].vue`。檔名就叫 `[id].vue`，中括號也是名字的一部分：

```vue
<script setup lang="ts">
import { getBook } from "~/utils/books";

const route = useRoute();
const book = getBook(route.params.id);
</script>

<template>
  <main>
    <h1>{{ book?.title }}</h1>
    <p>{{ book?.summary }}</p>
  </main>
</template>
```

`[id]` 等於第 9 章的 `:id`，網址那一段的值會放進 `route.params.id`。`useRoute` 你在第 9 章用過，不過這裡沒有寫 `import { useRoute } from "vue-router"` 也能用，這是 Nuxt 的自動匯入，第 9 集會講。

存檔，打開 <http://localhost:3000/books/1>，你會看到「貓咪的程式課」，上面還有書籍區的提示，因為 `[id].vue` 在 `books/` 資料夾裡，會被上一集的 `books.vue` 包住。改成 `/books/2`，就換成河馬那本。

畫面是對的，但這段程式碼其實有型別錯誤。

### `nuxt build` 不會檢查型別

第 10 章你用 `npm run type-check` 檢查型別。Nuxt 專案沒有這個指令，`npm run dev` 和 `npm run build` 也都不會檢查型別，它們只負責把網站跑起來。

Nuxt 的型別檢查指令是 `npx nuxt typecheck`，但它需要你先安裝 `vue-tsc` 和 `typescript`：

```bash
npm install -D vue-tsc typescript@~6.0
```

`-D` 表示這兩個是開發時才用的套件。`typescript@~6.0` 指定裝 6.0 版，和第 10 章 create-vue 幫你裝的一樣。不指定版本的話會裝到最新的 TypeScript 7，目前的 `vue-tsc` 還不支援它，執行時會出錯。

裝好之後執行：

```bash
npx nuxt typecheck
```

會看到這個錯誤（實際上是兩行，這裡為了好讀把第一行折開了）：

```text
app/pages/books/[id].vue(5,22): error TS2345: Argument of type
'string | string[] | undefined' is not assignable to parameter of type
'string'.
  Type 'undefined' is not assignable to type 'string'.
```

`(5,22)` 是第 5 行第 22 個字，也就是 `getBook(route.params.id)` 裡的 `route.params.id`。意思是：「這個值的型別是 `string | string[] | undefined`，不能交給只收 `string` 的參數。」

VS Code 裝了 Vue (Official) 擴充功能的話，那一行也會畫紅線，滑鼠移上去就看得到同樣的訊息。

### 為什麼不是 `string`

你知道這一頁的網址一定長得像 `/books/1`，所以 `id` 一定是字串。但 TypeScript 不知道：`useRoute()` 回傳的是「目前的路由」，它可能是任何一頁，所以 `route.params.id` 的型別只能寫得很寬鬆：

- `string`：一般的情況，例如 `/books/1` 的 `"1"`。
- `string[]`：Nuxt 還有一種「一次接很多段網址」的寫法，那時候值會是陣列。這本書不會用到。
- `undefined`：目前這一頁的網址根本沒有 `id` 這個參數。

第 10 章教過，聯集型別要先用 `typeof` 縮小範圍。把 `[id].vue` 改成：

```vue
<script setup lang="ts">
import { getBook } from "~/utils/books";

const route = useRoute();
const id = route.params.id;
const book = typeof id === "string" ? getBook(id) : undefined;
</script>

<template>
  <main>
    <h1>{{ book?.title }}</h1>
    <p>{{ book?.summary }}</p>
  </main>
</template>
```

`typeof id === "string"` 成立的時候，TypeScript 知道 `id` 一定是字串，才讓你交給 `getBook`；不成立就當作找不到書，給 `undefined`。

再跑一次 `npx nuxt typecheck`，這次什麼都沒印出來，代表沒有型別錯誤。之後每一集改完程式，都可以跑一次它確認。

### 網址裡的值永遠是字串

就算網址是 `/books/1`，`route.params.id` 也是字串 `"1"`，不是數字 `1`。這就是為什麼上一集的資料裡，`id` 刻意用字串：兩邊型別一樣，`book.id === id` 才比得起來。

第 9 章的商品資料 `id` 是數字，所以你寫了 `Number(route.params.id)` 先轉成數字。兩種做法都可以，重點是比較的兩邊要是同一種型別。

### 換一本書時

第 9 章講過一個陷阱：從 `/products/1` 換到 `/products/2`，Vue Router 會沿用同一個元件，所以要用 `computed` 或 `watch` 才會跟著更新。

Nuxt 的 `<NuxtPage />` 預設不會這樣：只要網址裡的參數變了，它就把舊的頁面元件拆掉、重新建立一個。所以 `[id].vue` 裡直接在 `<script setup>` 算出 `book` 就可以，換書時 `<script setup>` 會重新執行一次。

### 不存在的書呢？

試試看打開 <http://localhost:3000/books/999>。頁面可以打開，但是標題和內容都是空的，因為 `getBook("999")` 找不到書，回傳 `undefined`，`book?.title` 也是 `undefined`。

這顯然不對：沒有這本書，應該告訴使用者「找不到」才是。第 10 集會處理這個問題。

## 重點整理

- 檔名用中括號包起來，例如 `[id].vue`，就是動態路由，等於第 9 章的 `:id`。
- 網址那一段的值放在 `useRoute().params.id`，而且永遠是字串。
- `route.params.id` 的型別是 `string | string[] | undefined`，要先用 `typeof` 縮小成 `string`。
- `npm run dev` 和 `npm run build` 不檢查型別，要用 `npx nuxt typecheck`，並先安裝 `vue-tsc` 和 `typescript@~6.0`。
- 在 Nuxt 裡換到不同的 `id` 時，頁面元件會重新建立。
