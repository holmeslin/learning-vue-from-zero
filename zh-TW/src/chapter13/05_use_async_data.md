# `useAsyncData`

## 本集目標

用 `useAsyncData` 包住任何非同步的程式，讓它和 `useFetch` 一樣只在伺服器抓一次。

## 正文

### useFetch 不夠用的時候

`useFetch` 很方便，但它一次只能抓**一個網址**。如果一個頁面要同時抓文章和留言，再組合起來呢？或是資料不是從網址來的，而是要呼叫某個套件提供的函式呢？

這時候用 `useAsyncData`。建立 `app/pages/with-comments.vue`：

```vue
<script setup lang="ts">
type Post = {
  id: number;
  title: string;
};
type Comment = {
  id: number;
  name: string;
};

const base = "https://jsonplaceholder.typicode.com";

const { data } = await useAsyncData("post-1-with-comments", async () => {
  const [post, comments] = await Promise.all([
    $fetch<Post>(`${base}/posts/1`),
    $fetch<Comment[]>(`${base}/posts/1/comments`),
  ]);
  return { post, comments };
});
</script>

<template>
  <article v-if="data">
    <h1>{{ data.post.title }}</h1>
    <p>共有 {{ data.comments.length }} 則留言</p>
    <ul>
      <li v-for="comment in data.comments" :key="comment.id">
        {{ comment.name }}
      </li>
    </ul>
  </article>
</template>
```

打開 `http://localhost:3000/with-comments`，會看到文章標題、「共有 5 則留言」和五則留言的標題。

### 拆開來看

`useAsyncData` 收兩個參數：

```ts,ignore
useAsyncData(key, 函式)
```

- **key**：一個字串，當作這筆資料的名字，這裡是 `"post-1-with-comments"`。上一集說過，Nuxt 用 key 到 payload 裡找資料；`useFetch` 會自動算 key，`useAsyncData` 則由你自己取。
- **函式**：一個 `async` 函式，裡面想做什麼都可以，最後 `return` 的東西就會變成 `data`。

它回傳的東西和 `useFetch` 一樣：`data`、`error`、`status`、`refresh`。

上一集說不要在 setup 裡直接 `await $fetch`，因為會抓兩次。這裡的 `$fetch` 被 `useAsyncData` 包起來了，情況就不同：伺服器執行函式、拿到結果、放進 payload；瀏覽器看到 payload 裡已經有 `"post-1-with-comments"` 這個 key 的資料，就**不會執行這個函式**。打開「網路」分頁確認，不會看到送到 `jsonplaceholder` 的請求。

### Promise.all：同時抓好幾個

函式裡的 `Promise.all` 是 JavaScript 內建的，用來**同時**等好幾個 Promise：

```ts,ignore
const [post, comments] = await Promise.all([
  $fetch<Post>(`${base}/posts/1`),
  $fetch<Comment[]>(`${base}/posts/1/comments`),
]);
```

- 給它一個陣列，裡面放好幾個 Promise。
- 它會等全部都完成，再把結果照原本的順序放進一個陣列回傳。
- 用陣列解構（第 2 章）把結果拆成 `post` 和 `comments`。

如果寫成兩行 `await`，就要等第一個抓完才開始抓第二個；用 `Promise.all`，兩個請求同時出發，總共只要等比較慢的那一個。

### useFetch 其實就是 useAsyncData

`useFetch` 是 `useAsyncData` 的簡寫。這兩行做的事情幾乎一樣：

```ts,ignore
useFetch(url);
useAsyncData(key, () => $fetch(url));
```

`useFetch` 幫你自動產生 key、自動用 `$fetch` 去抓。所以：

- 只抓一個網址：用 `useFetch`，比較短。
- 要抓好幾個再組合、要做額外的處理，或資料不是來自網址：用 `useAsyncData`，自己寫函式。

### key 要取得好

key 有兩個規則：

- **不同的資料要用不同的 key**。如果兩個 `useAsyncData` 用了同一個 key 卻抓不同的東西，Nuxt 會把它們當成同一筆資料，畫面就會錯亂。
- **同一份資料可以故意用同一個 key**。兩個元件用同一個 key 的 `useAsyncData`，會共用同一份 `data`，不會重抓。

如果 key 跟著網址參數變，就把參數放進 key 裡，例如文章內頁可以寫成：

```ts,ignore
const route = useRoute();
const { data } = await useAsyncData(
  `post-${route.params.id}`,
  () => $fetch(`${base}/posts/${route.params.id}`),
);
```

## 重點整理

- `useAsyncData(key, 函式)` 執行任何非同步函式，`return` 的結果就是 `data`。
- 包在 `useAsyncData` 裡的 `$fetch` 只會在伺服器執行一次，結果透過 payload 送到瀏覽器。
- `useFetch(url)` 等於 `useAsyncData(key, () => $fetch(url))` 的簡寫。
- `Promise.all` 可以讓好幾個請求同時出發。
- 不同的資料要用不同的 key。
