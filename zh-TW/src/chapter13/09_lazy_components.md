# 延遲載入元件

## 本集目標

在元件名稱前面加 `Lazy`，讓用不到的元件等到真的要顯示時才下載。

## 正文

### 不是每個元件一開始都要

一個頁面上常有些元件，使用者不一定會用到：按了才展開的留言區、點了才跳出來的對話視窗、藏在分頁後面的圖表。

這些元件的程式碼如果跟著頁面一起下載，就算使用者從頭到尾沒點開，瀏覽器也得先下載、先處理它們，頁面就慢了一點。第 7 章學過非同步元件，第 9 章學過延遲載入路由，都是在解決這個問題。Nuxt 讓這件事更簡單：**在元件名稱前面加上 `Lazy` 就好**。

### 加個 Lazy

建立 `app/components/PostComments.vue`，顯示一篇文章的留言：

```vue
<script setup lang="ts">
type Comment = {
  id: number;
  name: string;
};

const { data: comments } = await useFetch<Comment[]>(
  "https://jsonplaceholder.typicode.com/posts/1/comments",
);
</script>

<template>
  <ul>
    <li v-for="comment in comments" :key="comment.id">
      {{ comment.name }}
    </li>
  </ul>
</template>
```

建立 `app/pages/lazy.vue`，按了按鈕才顯示留言：

```vue
<script setup lang="ts">
const show = ref(false);
</script>

<template>
  <h1>文章內容</h1>
  <button v-if="!show" @click="show = true">顯示留言</button>
  <LazyPostComments v-if="show" />
</template>
```

元件檔案叫 `PostComments.vue`，使用時寫成 `<LazyPostComments>`。不用另外匯入、不用改元件本身，Nuxt 看到 `Lazy` 開頭就知道要延遲載入。

### 看看什麼時候下載

打開 <http://localhost:3000/lazy>，打開開發者工具的「網路」分頁，篩選欄輸入 `PostComments`，重新整理：

- 剛載入時，列表是空的，`PostComments.vue` 還沒下載。
- 按下「顯示留言」，列表出現一行 `PostComments.vue`，緊接著是抓留言的 `jsonplaceholder` 請求。

把 `<LazyPostComments>` 改成 `<PostComments>`（拿掉 `Lazy`）再試一次，`PostComments.vue` 在頁面一載入時就下載了，即使你還沒按按鈕。

開發模式下每個元件是一個檔案，所以看得到 `PostComments.vue` 這個名字。執行 `npm run build` 建置成正式版之後，元件會被打包成一個名字像 `EfzsBrA6.js` 這樣的亂碼檔案，但道理一樣：它和頁面主要的程式碼是分開的。Nuxt 甚至會在瀏覽器有空的時候先偷偷下載（叫做 prefetch），等你真的按下按鈕時，元件就能馬上出現。

### 要搭配 v-if

`Lazy` 前綴的意思是「把這個元件的程式碼拆成獨立的檔案，需要時才載入」。關鍵在「需要時」：如果元件一開始就在畫面上，它當然一開始就需要，加了 `Lazy` 也一樣會馬上載入。

所以 `Lazy` 通常搭配 `v-if` 使用，讓元件一開始不在畫面上：

- 按了才出現的區塊：`<LazyXxx v-if="show" />`
- 對話視窗、側邊選單：`<LazyXxx v-if="isOpen" />`

一開始就要顯示的元件，不用加 `Lazy`。

### 和第 7 章的非同步元件

第 7 章用 `defineAsyncComponent` 做過一樣的事：

```ts,ignore
const PostComments = defineAsyncComponent(
  () => import("./components/PostComments.vue"),
);
```

在 Nuxt 裡，`Lazy` 前綴就是這段程式的簡寫，Nuxt 會幫你產生。所以在 Nuxt 專案裡，加個 `Lazy` 就好，不用自己寫 `defineAsyncComponent`。

## 重點整理

- 元件名稱前面加 `Lazy`，例如 `<LazyPostComments>`，就會變成需要時才下載。
- `Lazy` 要搭配 `v-if` 這類讓元件一開始不顯示的寫法，才有延遲的效果。
- 可以在「網路」分頁確認元件是在什麼時候下載的。
- `Lazy` 前綴是 Nuxt 版的 `defineAsyncComponent`，不用自己寫。
