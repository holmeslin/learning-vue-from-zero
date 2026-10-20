# `app.vue` 與 `pages/`

## 本集目標

知道 `app.vue` 和 `pages/` 各自負責什麼，用 `<NuxtPage />` 把頁面放進網站裡。

## 正文

### 只有 `app.vue` 的網站

現在你的網站只有一個 `app.vue`。不管打開 <http://localhost:3000/>、<http://localhost:3000/abc> 還是任何網址，看到的都是同一個畫面。這種只有一頁的網站，Nuxt 甚至不會把 Vue Router 載進來，因為用不到。

要做出多個頁面，就要用 `pages/` 資料夾。

### 第一個頁面

建立 `app/pages/index.vue`：

```vue
<template>
  <main>
    <h1>歡迎來到小書店</h1>
    <p>這是首頁，來自 pages/index.vue。</p>
  </main>
</template>
```

存檔，回到瀏覽器。畫面沒有變，還是顯示 `app.vue` 寫的「這是用 Nuxt 做的第一個網站。」而執行 `npm run dev` 的終端機多了一段警告：

```text
WARN  [NUXT_E4011] Your project has pages but the <NuxtPage /> component
has not been used. You might be using the <RouterView /> component
instead, which will not work correctly in Nuxt. If <NuxtPage> is rendered
conditionally, this warning can be triggered before it is mounted.
```

意思是：「你的專案有頁面了，但是你沒有用 `<NuxtPage />`。」Nuxt 偵測到 `pages/` 資料夾，已經幫你把 Vue Router 準備好，但是 `app.vue` 沒有留位置給頁面，所以頁面顯示不出來。

### `<NuxtPage />`

把 `app/app.vue` 改成：

```vue
<template>
  <div>
    <NuxtRouteAnnouncer />
    <header>
      <strong>小書店</strong>
    </header>
    <NuxtPage />
  </div>
</template>
```

存檔後，畫面上方是「小書店」，下面是 `pages/index.vue` 的內容。

`<NuxtPage />` 就是 Nuxt 版的 `<RouterView />`：第 9 章你在 `App.vue` 放 `<RouterView />`，目前網址對應的元件就會顯示在那個位置。`<NuxtPage />` 做的是一樣的事，只是它多處理了一些 Nuxt 需要的東西（例如第 8 集的 layout、第 13 章的資料抓取），所以在 Nuxt 裡一律用 `<NuxtPage />`，不要用 `<RouterView />`。剛剛那段警告也特別提醒了這件事。

### `app.vue` 和 `pages/` 的分工

現在你的網站分成兩層：

- **`app.vue`** 是整個網站最外層的元件，每一頁都會經過它。適合放每一頁都要有的東西，例如 `<NuxtRouteAnnouncer />`。
- **`pages/` 裡的檔案**是一個一個的頁面，`<NuxtPage />` 會依照網址，把對應的頁面放進來。

`pages/index.vue` 對應的網址是 `/`，也就是首頁。檔名一定要是 `index.vue`，這是規定。下一集會看到其他檔名對應到什麼網址。

你可能會想：那 `<header>` 放在 `app.vue` 好嗎？目前可以。但是如果某些頁面不想要這個 header，`app.vue` 就不夠用了。第 8 集會學 layout，到時候會把 header 搬過去。

### 和 `index.html` 的關係

第一部的 `index.html` 裡有 `<html>`、`<head>`、`<body>`，Vue 的畫面掛載在 `<body>` 裡的 `<div id="app">`。

Nuxt 沒有 `index.html`，那 `<html>` 和 `<body>` 去哪了？它們是 Nuxt 每次產生 HTML 時自動加的。用 `view-source:http://localhost:3000/` 看原始碼，會找到這一段：

```html
<div id="__nuxt"><div><div></div><header><strong>小書店</strong></header>
<main><h1>歡迎來到小書店</h1><p>這是首頁，來自 pages/index.vue。</p></main>
</div></div>
```

（實際上是一整行，這裡為了好讀換了行。）

`<div id="__nuxt">` 就是 Nuxt 版的 `<div id="app">`，`app.vue` 的內容就渲染在它裡面。差別在於它不是空的：伺服器已經把首頁的內容放進去了。最前面那個空的 `<div></div>` 是 `<NuxtRouteAnnouncer />` 在伺服器上留的位置，它要等到瀏覽器裡才會真正出現。

`<head>` 裡的東西，例如分頁標題，第 11 集會學怎麼設定。

## 重點整理

- 只有 `app.vue` 時，Nuxt 不會載入 Vue Router；建立 `pages/` 資料夾後才會。
- `<NuxtPage />` 是 Nuxt 版的 `<RouterView />`，在 Nuxt 裡一律用它。
- `app.vue` 是每一頁都會經過的最外層，`pages/` 裡放一個一個的頁面。
- `pages/index.vue` 對應網址 `/`。
- 伺服器送出的 HTML 裡，`<div id="__nuxt">` 已經有頁面內容了。
