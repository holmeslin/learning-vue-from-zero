# `RouterLink`

## 本集目標

用 `RouterLink` 換頁而不重新載入網頁，並且把目前所在的頁面標示出來。

## 正文

### 為什麼不能用 `<a>`

HTML 的 `<a href="/about">` 會讓瀏覽器重新載入整個網頁，Vue 裡的狀態全部消失。來做個實驗。把 `src/App.vue` 改成：

```vue
<script setup>
import { ref } from "vue";
import { RouterLink, RouterView } from "vue-router";

const clicks = ref(0);
</script>

<template>
  <nav>
    <button @click="clicks++">按了 {{ clicks }} 次</button>
    <a href="/about">普通連結</a>
    <RouterLink to="/about">RouterLink</RouterLink>
  </nav>
  <RouterView />
</template>
```

打開首頁，先按幾下按鈕讓次數變大，再點「RouterLink」：網址變成 `/about`，畫面換成「關於我們」，按鈕上的次數**還在**。

把網址改回 `/`（這會重新載入，次數歸零），再按幾下按鈕，這次點「普通連結」：整個網頁重新載入，次數又歸零了。

`RouterLink` 的用法就像 `<a>`，只是屬性叫 `to`，不是 `href`。它會攔下使用者的點選，只改網址和畫面，不重新載入。**站內的連結一律用 `RouterLink`**；連到別人的網站才用普通的 `<a>`。

打開開發者工具的 Elements（元素）分頁看一下，`RouterLink` 最後渲染出來的其實就是一個 `<a href="/about">`。所以它長得和普通連結一樣，按右鍵「在新分頁開啟」也照樣能用。

### 標示目前在哪一頁

導覽列常常需要把目前所在的頁面標出來。`RouterLink` 會自動幫你做：在 `/about` 頁面時，再看一次 Elements 分頁，指向 `/about` 的那個連結變成：

```text
<a href="/about" class="router-link-active router-link-exact-active"
  aria-current="page">RouterLink</a>
```

它多了兩個 class：

- `router-link-active`：目前網址「符合」這個連結。
- `router-link-exact-active`：目前網址和這個連結「完全一樣」。

`aria-current="page"` 是給螢幕報讀軟體看的，告訴視障使用者「這是目前這一頁」，你不用管它。

現在把實驗用的按鈕拿掉，做一個像樣的導覽列。把 `src/App.vue` 改成：

```vue
<script setup>
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <nav>
    <RouterLink to="/">首頁</RouterLink>
    <RouterLink to="/about">關於</RouterLink>
  </nav>
  <RouterView />
</template>

<style>
nav {
  display: flex;
  gap: 1rem;
}

.router-link-active {
  font-weight: bold;
}
</style>
```

在哪一頁，那一頁的連結就是粗體。這兩個 class 什麼時候會不一樣，下一集就會遇到。

## 重點整理

- 站內連結用 `RouterLink`，屬性是 `to`；`<a>` 會讓網頁重新載入，狀態全部消失。
- `RouterLink` 渲染出來就是一個 `<a>`，右鍵開新分頁照樣能用。
- 目前網址符合連結時，`RouterLink` 會自動加上 `router-link-active`。
- 完全一樣時，還會再加上 `router-link-exact-active`。
