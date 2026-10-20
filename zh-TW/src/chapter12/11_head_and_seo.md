# `useHead` 與 `useSeoMeta`

## 本集目標

設定每個頁面的分頁標題和描述，包括標題要跟著書名變化的動態頁面。

## 正文

### `<head>` 裡的東西

第 3 章你學過，HTML 的 `<head>` 放的是不會直接出現在畫面上的資訊：分頁上的標題 `<title>`、給搜尋引擎看的描述 `<meta name="description">`、分享到社群網站時的預覽文字等等。這些東西對使用者找到你的網站很重要。

第一部的專案要改標題，只能改 `index.html` 裡寫死的 `<title>`，或是在瀏覽器裡用 JavaScript 改 `document.title`。但搜尋引擎和聊天軟體的預覽程式不一定會執行 JavaScript，它們看到的永遠是 `index.html` 寫死的那一個。

Nuxt 是伺服器在產生每一頁的 HTML，所以每一頁的 `<head>` 都可以不一樣，而且一送出就是對的。設定的方法是在元件裡呼叫 `useHead` 或 `useSeoMeta`。

### `useHead`：全站的設定

打開 `app/app.vue`，加上 `<script setup>`：

```vue
<script setup lang="ts">
useHead({
  titleTemplate: (title) => (title ? `${title}｜小書店` : "小書店"),
  htmlAttrs: {
    lang: "zh-TW",
  },
});
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
```

`useHead` 收一個物件，描述 `<head>`（和 `<html>`）裡要有什麼。它不用 import。這裡設定了兩件事：

- **`titleTemplate`**：標題的範本。它是一個函式，參數 `title` 是各頁面自己設定的標題。有設定的話，回傳「頁面標題｜小書店」；沒設定的話，`title` 是 `undefined`，就回傳「小書店」。這樣每一頁只要寫短標題，網站名稱會統一加上去。
- **`htmlAttrs`**：`<html>` 標籤的屬性。`lang: "zh-TW"` 告訴瀏覽器和輔助工具，這個網站的語言是繁體中文，螢幕閱讀器才會用中文唸。

寫在 `app.vue` 裡，每一頁都會套用。打開首頁，分頁標題是「小書店」。

### `useSeoMeta`：每一頁自己的設定

**SEO**（search engine optimization，搜尋引擎最佳化）指的是讓網站更容易被搜尋引擎找到、在搜尋結果裡更好看。`useSeoMeta` 是專門設定這類資訊的函式。

把 `app/pages/about.vue` 改成：

```vue
<script setup lang="ts">
useSeoMeta({
  title: "關於我們",
  description: "小書店是一間專賣程式入門書的小書店。",
});
</script>

<template>
  <main>
    <h1>關於我們</h1>
    <p>我們是一間很小的書店。</p>
    <p>
      這個網站是用
      <NuxtLink to="https://nuxt.com">Nuxt</NuxtLink>
      做的。
    </p>
  </main>
</template>
```

用 `view-source:` 看 `/about`，`<head>` 裡會有：

```html
<title>關於我們｜小書店</title>
<meta name="description" content="小書店是一間專賣程式入門書的小書店。">
```

`title` 經過 `app.vue` 的 `titleTemplate`，變成「關於我們｜小書店」。

`useHead` 其實也做得到一樣的事，但寫法比較囉唆，`description` 要寫成 `meta: [{ name: "description", content: "..." }]`。`useSeoMeta` 把常用的欄位都攤平成一個個屬性，而且有型別檢查：欄位名稱拼錯，`npx nuxt typecheck` 會抓出來。所以頁面的標題和描述用 `useSeoMeta`，`useSeoMeta` 沒有的設定（例如 `htmlAttrs`）才用 `useHead`。

### 動態的標題

每本書的頁面標題，應該是那本書的名字。在 `app/pages/books/[id].vue` 加上 `useSeoMeta`：

```vue
<script setup lang="ts">
const route = useRoute();
const id = route.params.id;
const book = typeof id === "string" ? getBook(id) : undefined;

if (!book) {
  throw createError({
    status: 404,
    statusText: "Not Found",
    message: "找不到這本書",
    fatal: true,
  });
}

useSeoMeta({
  title: book.title,
  description: book.summary,
  ogTitle: book.title,
  ogDescription: book.summary,
});

const { likes, like } = useLikes();
</script>

<template>
  <main>
    <h1>{{ book.title }}</h1>
    <p>{{ book.summary }}</p>
    <button @click="like">讚 {{ likes }}</button>
  </main>
</template>
```

它放在 `if (!book)` 下面，所以 `book` 一定有值，可以直接寫 `book.title`。

打開 `/books/1`，`<head>` 裡會有：

```html
<title>貓咪的程式課｜小書店</title>
<meta name="description" content="從一隻貓學寫第一行程式，適合完全沒有基礎的人。">
<meta property="og:title" content="貓咪的程式課">
<meta property="og:description" content="從一隻貓學寫第一行程式，適合完全沒有基礎的人。">
```

`ogTitle` 和 `ogDescription` 變成了 `og:` 開頭的標籤。**Open Graph**（簡稱 og）是社群網站和聊天軟體讀取的格式：你把網址貼到 LINE 或 Facebook，預覽卡片上的標題和說明就是從這裡來的。`titleTemplate` 只管 `<title>`，所以 `og:title` 就是書名本身。

### 錯誤頁的標題

打開 `/books/999` 看原始碼，你會發現 `<html>` 沒有 `lang`，也沒有 `<title>`。上一集說過，`error.vue` 會取代整個 `app.vue`，所以 `app.vue` 裡的 `useHead` 不會執行。

在 `app/error.vue` 裡自己呼叫 `useHead`：

```vue
<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps<{
  error: NuxtError;
}>();

useHead({
  title: `${props.error.status}｜小書店`,
  htmlAttrs: {
    lang: "zh-TW",
  },
});

function goHome() {
  clearError({ redirect: "/" });
}
</script>

<template>
  <NuxtLayout>
    <main>
      <h1>{{ error.status }}</h1>
      <p>{{ error.message }}</p>
      <button @click="goHome">回首頁</button>
    </main>
  </NuxtLayout>
</template>
```

在 `<script setup>` 裡要用 props，得先把 `defineProps` 的回傳值存起來，這是第 4 章學過的寫法。現在 `/books/999` 的標題是「404｜小書店」。

## 重點整理

- Nuxt 在伺服器上產生每一頁的 `<head>`，搜尋引擎和預覽程式一拿到就是對的標題。
- `app.vue` 裡用 `useHead` 設定全站的 `titleTemplate` 和 `<html lang>`。
- 頁面用 `useSeoMeta` 設定 `title`、`description`，以及社群預覽用的 `ogTitle`、`ogDescription`。
- 標題要看資料決定時，把資料直接傳進 `useSeoMeta` 就好。
- `error.vue` 不經過 `app.vue`，要自己呼叫 `useHead`。
