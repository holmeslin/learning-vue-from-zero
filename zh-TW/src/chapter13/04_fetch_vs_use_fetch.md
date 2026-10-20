# `$fetch` 與 `useFetch` 的差別

## 本集目標

知道為什麼在 setup 裡直接用 `$fetch` 會抓兩次，以及 `$fetch` 應該用在哪裡。

## 正文

### $fetch 是什麼

Nuxt 除了 `useFetch`，還內建了一個 `$fetch` 函式，也是自動匯入的。它就像第 2 章學的 `fetch`，只是更方便：直接回傳轉好的 JSON，不用再呼叫 `.json()`，伺服器回傳錯誤狀態碼時也會直接丟出錯誤。

```ts,ignore
const post = await $fetch<Post>(
  "https://jsonplaceholder.typicode.com/posts/1",
);
```

`useFetch` 內部其實就是用 `$fetch` 去抓的。那直接用 `$fetch` 不是更簡單嗎？來比比看。

### 用 $fetch 抓

建立 `app/pages/twice.vue`：

```vue
<script setup lang="ts">
type Post = {
  id: number;
  title: string;
};

const post = await $fetch<Post>(
  "https://jsonplaceholder.typicode.com/posts/1",
);
console.log("$fetch 抓到了：", post.title);
</script>

<template>
  <h1>{{ post.title }}</h1>
</template>
```

打開 `http://localhost:3000/twice`，畫面正常顯示標題。看起來沒問題，但看一下兩邊的輸出。

終端機：

```text
$fetch 抓到了： sunt aut facere repellat provident occaecati excepturi optio
reprehenderit
```

瀏覽器的主控台：

```text
$fetch 抓到了： sunt aut facere repellat provident occaecati excepturi optio
reprehenderit
```

（標題太長，這裡折成兩行，實際上是一行。）

兩邊都抓了。再打開開發者工具的「網路」（Network）分頁，在上方的篩選欄輸入 `jsonplaceholder`，重新整理頁面，會看到瀏覽器真的又送了一次請求：

```text
GET https://jsonplaceholder.typicode.com/posts/1
```

原因就是第 1 集講的：`<script setup>` 會跑兩次。伺服器跑的時候抓了一次，做出 HTML；瀏覽器 hydration 時又跑了一次 setup，`$fetch` 不知道伺服器已經抓過，就再抓一次。

### 用 useFetch 抓

建立 `app/pages/once.vue`，只把 `$fetch` 換成 `useFetch`：

```vue
<script setup lang="ts">
type Post = {
  id: number;
  title: string;
};

const { data: post } = await useFetch<Post>(
  "https://jsonplaceholder.typicode.com/posts/1",
);
console.log("useFetch 拿到了：", post.value?.title);
</script>

<template>
  <h1>{{ post?.title }}</h1>
</template>
```

打開 `http://localhost:3000/once`。終端機和主控台一樣都會印出「useFetch 拿到了：」，因為 setup 照樣跑了兩次。但是「網路」分頁裡**沒有**任何送到 `jsonplaceholder` 的請求。

（這是直接打開或重新整理頁面的情況。如果是從別的頁面點 `NuxtLink` 換過來，第 2 集說過那時伺服器沒有參與，`useFetch` 就會在瀏覽器裡抓，看到一次請求是正常的。）

瀏覽器沒有去抓，資料是從哪來的？

### 資料跟著 HTML 一起送來

打開 `/once` 的「檢視網頁原始碼」，搜尋 `__NUXT_DATA__`，會找到一段 `<script>`，裡面是一串 JSON（節錄）：

```text
<script type="application/json" data-nuxt-data="nuxt-app"
data-ssr="true" id="__NUXT_DATA__">[ ...
"sunt aut facere repellat provident occaecati excepturi optio
reprehenderit", ...
```

這一段叫 **payload**。`useFetch` 在伺服器上抓到資料之後，Nuxt 除了把它畫進 HTML，還把資料本身放進 payload，跟著 HTML 一起送到瀏覽器。

瀏覽器跑到 `useFetch` 時，會先看 payload 裡有沒有這筆資料。有的話就直接拿來用，不用再發請求。這就是上一集說 `useFetch` 會「記住抓過的資料」的意思：每一次 `useFetch` 都有一個 key（Nuxt 從網址和程式碼位置自動算出來），瀏覽器用這個 key 到 payload 裡找。

`twice.vue` 的原始碼裡就沒有這樣的資料，所以瀏覽器只能自己再抓一次。

### 抓兩次有什麼不好

- **浪費**：同一份資料下載兩次，伺服器和使用者的流量都多花了。
- **比較慢**：瀏覽器要等第二次請求回來，hydration 才能完成，畫面也比較晚能互動。
- **畫面可能對不上**：如果兩次抓到的資料不一樣（例如中間有人發了新文章），伺服器做的 HTML 和瀏覽器算出來的畫面就會不同。上一集說過 hydration 要兩邊一樣才對得上，對不上會發生什麼事，第 8 集會看到。

所以規則很簡單：**元件一載入就要的資料，用 `useFetch`**。

### $fetch 用在哪裡

`$fetch` 不是不能用，而是要用在「使用者做了某件事才去抓」的地方，例如按按鈕。建立 `app/pages/more.vue`：

```vue
<script setup lang="ts">
type Post = {
  id: number;
  title: string;
};

const { data: first } = await useFetch<Post>(
  "https://jsonplaceholder.typicode.com/posts/1",
);
const second = ref<Post>();

async function loadSecond() {
  second.value = await $fetch<Post>(
    "https://jsonplaceholder.typicode.com/posts/2",
  );
}
</script>

<template>
  <h2>{{ first?.title }}</h2>
  <button @click="loadSecond">再載入一篇</button>
  <h2 v-if="second">{{ second.title }}</h2>
</template>
```

- 第一篇是頁面一打開就要的，用 `useFetch`，在伺服器上抓好。
- 第二篇是使用者按了按鈕才要的。按按鈕只會發生在瀏覽器裡，伺服器根本不會跑 `loadSecond`，不會有抓兩次的問題，用 `$fetch` 就好。

打開「網路」分頁看：一開始沒有請求，按下按鈕才出現一次 `GET .../posts/2`。

送出表單、按「重新整理」之類的動作也一樣用 `$fetch`，第 14 章做留言板時會用到。

反過來，`useFetch` 只能寫在 setup 的最上層，不能放在 `loadSecond` 這種事件處理函式裡。它是為「元件一載入就抓」設計的。

## 重點整理

- 在 setup 裡直接 `await $fetch(...)`，伺服器和瀏覽器會各抓一次。
- `useFetch` 在伺服器抓到的資料會放進 payload，跟 HTML 一起送到瀏覽器，瀏覽器不會重抓。
- 頁面一載入就要的資料用 `useFetch`。
- 按按鈕、送出表單這類使用者操作才觸發的請求，用 `$fetch`。
