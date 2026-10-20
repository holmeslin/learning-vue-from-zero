# `useFetch`

## 本集目標

用 Nuxt 內建的 `useFetch` 抓資料，讓資料在伺服器上就填進 HTML。

## 正文

### 抓一份文章列表

建立 `app/pages/posts/index.vue`：

```vue
<script setup lang="ts">
type Post = {
  id: number;
  title: string;
};

const { data: posts, error } = await useFetch<Post[]>(
  "https://jsonplaceholder.typicode.com/posts?_limit=5",
);
</script>

<template>
  <h1>文章列表</h1>
  <p v-if="error">載入失敗：{{ error.message }}</p>
  <ul v-else>
    <li v-for="post in posts" :key="post.id">
      <NuxtLink :to="`/posts/${post.id}`">{{ post.title }}</NuxtLink>
    </li>
  </ul>
</template>
```

打開 <http://localhost:3000/posts>，會看到五篇文章的標題（JSONPlaceholder 的假文章是拉丁文，看不懂沒關係）。網址後面的 `?_limit=5` 是叫它只給五篇。

### 名字好眼熟

第 6 章你自己寫過一個叫 `useFetch` 的 composable，回傳 `data`、`error`、`loading`。Nuxt 內建的 `useFetch` 名字一樣、想法也一樣：給它一個網址，它幫你抓資料，回傳裝著結果的 `ref`。

差別在於 Nuxt 的版本知道「同一份程式碼會在伺服器和瀏覽器各跑一次」，所以能做到幾件你自己寫的版本做不到的事：

- 在伺服器上抓好資料，填進 HTML 裡。
- 把抓到的資料一起送到瀏覽器，瀏覽器 hydration 時直接拿來用，**不會再抓一次**。
- 用一個 key 記住抓過的資料，下一集和第 5 集會再講。

它是自動匯入的，不用 `import`。也因為這樣，**在 Nuxt 專案裡不要再自己定義一個叫 `useFetch` 的函式**。如果你把第 6 章的 `useFetch` 搬進 `app/composables/`，終端機會一直出現這個警告（原本是一整行，這裡折成兩行）：

```text
 WARN  [NUXT_B6002] useFetch is already auto-imported by Nuxt as a
 built-in, and overriding it will likely cause issues.
```

意思是「`useFetch` 已經是 Nuxt 內建、自動匯入的函式，蓋掉它很可能會出問題」。要保留自己的版本，就換個名字。

### 一行一行看

```ts,ignore
const { data: posts, error } = await useFetch<Post[]>(
  "https://jsonplaceholder.typicode.com/posts?_limit=5",
);
```

- `useFetch(網址)`：去這個網址抓資料，自動把回應的 JSON 轉成物件。
- `<Post[]>`：告訴 TypeScript 抓回來的是 `Post` 陣列。外部 API 回傳什麼，TypeScript 不可能知道，所以要自己講。這是第 10 章泛型的寫法。
- `await`：等資料抓完再往下走。伺服器會等到資料回來才產生 HTML。
- `{ data: posts, error }`：物件解構，順便把 `data` 改名成 `posts`，比較好讀。

`useFetch` 回傳的東西裡，常用的有這幾個：

| 名稱 | 是什麼 |
| --- | --- |
| `data` | 抓到的資料，是一個 `ref`。還沒抓到或失敗時是 `undefined` |
| `error` | 出錯時的錯誤物件，沒出錯是 `undefined` |
| `status` | 目前狀態：`"idle"`、`"pending"`、`"success"`、`"error"` |
| `refresh` | 呼叫它可以重新抓一次，第 14 章會用到 |

它們都是 `ref`，在 `<script setup>` 裡要用 `.value`，在模板裡會自動解包。第 6 章的 `loading` 在這裡對應的是 `status === "pending"`。

### 資料在 HTML 裡

打開這一頁的「檢視網頁原始碼」，搜尋 `qui est esse`（第二篇的標題），會找到：

```text
<li><a href="/posts/2" class="">qui est esse</a></li>
```

文章標題已經在伺服器送來的 HTML 裡了。第 6 章的版本是在瀏覽器裡才開始抓，原始碼裡只會有空的 `<ul>`；Nuxt 的 `useFetch` 在伺服器上就抓好、填好了。

### 搭配動態路由

再做一個文章內頁。建立 `app/pages/posts/[id].vue`：

```vue
<script setup lang="ts">
type Post = {
  id: number;
  title: string;
  body: string;
};

const route = useRoute();
const { data: post } = await useFetch<Post>(
  `https://jsonplaceholder.typicode.com/posts/${route.params.id}`,
);

if (!post.value) {
  throw createError({
    status: 404,
    statusText: "Not Found",
    message: "找不到這篇文章",
    fatal: true,
  });
}
</script>

<template>
  <article v-if="post">
    <h1>{{ post.title }}</h1>
    <p>{{ post.body }}</p>
    <NuxtLink to="/posts">回列表</NuxtLink>
  </article>
</template>
```

這裡用到第 12 章學過的兩件事：

- `[id].vue` 是動態路由，`route.params.id` 拿到網址裡的編號。
- `createError` 丟出錯誤，Nuxt 會顯示錯誤頁面。欄位的意思和第 12 章一樣。

在列表點任一篇，會進到內頁。手動打 <http://localhost:3000/posts/999>，JSONPlaceholder 沒有這篇，`useFetch` 抓失敗，`post.value` 是 `undefined`，就會顯示 404 錯誤頁和「找不到這篇文章」。

模板裡的 `v-if="post"` 是寫給 TypeScript 看的：它不知道上面已經擋掉 `undefined` 的情況，加了 `v-if` 它才確定 `post` 有值。

## 重點整理

- `useFetch(網址)` 抓資料，回傳 `data`、`error`、`status` 等 `ref`。
- 抓外部 API 時用 `useFetch<型別>(...)` 告訴 TypeScript 資料的形狀。
- Nuxt 的 `useFetch` 在伺服器上就抓好資料，資料會直接出現在 HTML 裡。
- 它和第 6 章自己寫的 `useFetch` 概念相同，但多了 SSR 相關的功能；Nuxt 專案裡不要再定義同名的函式。
