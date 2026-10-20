# `ssr: false`：交給瀏覽器畫

## 本集目標

用 `ssr: false` 讓某些頁面不在伺服器渲染，並且知道它適合用在哪裡。

## 正文

### 不在伺服器做

新增 `app/pages/dashboard.vue`，假裝這是只有管理者會用的後台：

```vue
<!-- app/pages/dashboard.vue -->
<script setup lang="ts">
const { data } = await useFetch("/api/now");
</script>

<template>
  <main>
    <h1>後台</h1>
    <p>產生時間：{{ data?.now }}</p>
  </main>
</template>
```

在 `routeRules` 加一條：

```ts,ignore
    "/dashboard": { ssr: false },
```

建置、啟動之後，用瀏覽器打開 <http://localhost:3000/dashboard>，畫面看起來和其他頁面一樣，有標題也有時間。

但用 `curl` 看伺服器送來的 HTML：

```bash
curl -s localhost:3000/dashboard | grep -o '<body>.\{0,60\}'
```

```text
<body><div id="__nuxt"></div><div id="teleports"></div><script>win
```

`<div id="__nuxt">` 是整個 Nuxt 網站掛載的地方，裡面是**空的**，「後台」這兩個字根本不在 HTML 裡。畫面上的東西，全部是瀏覽器下載 JavaScript 之後才畫出來的。`useFetch` 也是在瀏覽器裡才去呼叫 `/api/now`，所以畫面上的時間是你打開網頁那一刻的時間。

這就是第一部用 create-vue 做的網站的樣子，也是第 12 章說的**單頁應用程式**（SPA）。`ssr: false` 讓你在 Nuxt 裡，把某些頁面退回這種做法。

### 什麼時候用

伺服器渲染的好處，主要是兩個：

1. 使用者馬上看到內容，不用等 JavaScript 下載完。
2. 搜尋引擎抓到的 HTML 裡有完整的內容。

有些頁面這兩個好處都用不到：

- **後台、管理介面**：使用者是自己人，不在乎多等半秒；也不希望被搜尋引擎找到。
- **登入之後才看得到的頁面**：搜尋引擎本來就看不到。
- **大量用到瀏覽器功能的頁面**：例如畫圖、拖拉、讀取攝影機。這類頁面在伺服器上渲染常常會出錯，因為伺服器上沒有 `window`、`document`。

這些頁面設成 `ssr: false`，伺服器少做一點事，你也不用擔心第 13 章的 hydration mismatch，因為根本沒有伺服器渲染的版本可以對不上。

### 和 `<ClientOnly>` 的差別

第 13 章學過 `<ClientOnly>`，它也是「只在瀏覽器渲染」。差別在範圍：

- `<ClientOnly>` 包住頁面裡的**一小塊**，頁面其他部分照樣在伺服器渲染。
- `ssr: false` 是**整頁**都不在伺服器渲染。

只有一小塊需要瀏覽器，用 `<ClientOnly>`；整頁都不需要伺服器渲染，才用 `ssr: false`。

### 不要用在需要被搜尋的頁面

`ssr: false` 的頁面，伺服器送出的只有空殼。第 12 章說過，搜尋引擎和聊天軟體的預覽程式不一定會執行 JavaScript，它們可能只看到這個空殼，把網址貼到聊天軟體時，預覽的標題和圖片也可能是空的。商品頁、文章頁這種希望被找到的頁面，不要設 `ssr: false`。

## 重點整理

- `ssr: false` 讓整頁不在伺服器渲染，伺服器送出的 HTML 只有空的 `<div id="__nuxt">`。
- 畫面和 `useFetch` 都在瀏覽器裡才執行，和第一部的 SPA 一樣。
- 適合後台、登入後才看得到的頁面，以及大量依賴瀏覽器功能的頁面。
- 只有一小塊需要在瀏覽器渲染時，用 `<ClientOnly>` 就好。
- 需要被搜尋引擎找到的頁面，不要用 `ssr: false`。
