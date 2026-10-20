# 安裝與第一個路由

## 本集目標

安裝 Vue Router，讓 `/` 和 `/about` 兩個網址顯示不同的元件。

## 正文

### 安裝

在專案的終端機執行：

```bash
npm install vue-router
```

裝完打開 `package.json`，`dependencies` 裡會多一行 `"vue-router": "^5.4.0"`（數字可能更新，開頭是 5 就對了）。

### 寫兩個頁面元件

頁面也只是元件，沒有什麼特別的。習慣上，「整頁」的元件放在 `src/views/` 資料夾，用 `View` 結尾命名，和 `src/components/` 裡那些小零件分開。

建立 `src/views/HomeView.vue`：

```vue
<template>
  <h1>首頁</h1>
</template>
```

再建立 `src/views/AboutView.vue`：

```vue
<template>
  <h1>關於我們</h1>
</template>
```

### 寫路由設定

建立 `src/router/index.js`（`router` 資料夾要自己建）：

```js
import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import AboutView from "../views/AboutView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: HomeView },
    { path: "/about", component: AboutView },
  ],
});

export default router;
```

一段一段看：

- `routes` 是一個陣列，每一個物件是一條**路由**：`path` 是網址的路徑，`component` 是這個網址要顯示的元件。`"/"` 是網站的根，也就是首頁。
- `createRouter` 用這份清單建立一個 router，最後 `export default` 匯出去給別的檔案用。
- `history: createWebHistory()` 決定網址長什麼樣子。用它的話，網址就是普通的 `/about`。先照抄就好，下面會再講一點。

### 把 router 裝進 app

打開 `src/main.js`，加上兩行：匯入 router，然後 `app.use(router)`。改完大概是這樣：

```js
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount("#app");
```

你的檔案開頭可能還有 `import "./assets/main.css";` 之類的樣式匯入，留著沒關係。

`import router from "./router";` 只寫到資料夾名稱，Vite 會自動去找裡面的 `index.js`，所以這樣寫和 `"./router/index.js"` 是一樣的。

`app.use(router)` 的意思是「這個 app 要用這個 router」，和第 8 章的 `app.use(createPinia())` 是同一種寫法。

### 告訴 Vue 頁面要顯示在哪裡

最後一步。把 `src/App.vue` 整個換成：

```vue
<script setup>
import { RouterView } from "vue-router";
</script>

<template>
  <RouterView />
</template>
```

`RouterView` 是 Vue Router 提供的元件，意思是「目前網址對應的那個元件，顯示在這裡」。網址是 `/` 時，這裡就是 `HomeView`；網址是 `/about` 時，就換成 `AboutView`。

執行 `npm run dev`，在瀏覽器打開開發伺服器的網址（通常是 `http://localhost:5173`），你會看到「首頁」。把網址改成 `http://localhost:5173/about`，畫面就變成「關於我們」。

### 網址對不到任何路由

把網址改成 `/abc` 試試看。畫面會是一片空白，打開瀏覽器的開發者工具（F12），在 Console 會看到一段警告，第一行是：

```text
[VUE_ROUTER_R0004] No match found for location with path "/abc"
```

意思是「`/abc` 找不到對應的路由」。`RouterView` 不知道要顯示什麼，所以什麼都不顯示。第 9 集會做一個 404 頁面來處理這種情況。

### 重新整理會怎樣

在 `/about` 按重新整理，網頁還在。這是因為 Vite 的開發伺服器不管你要哪個網址，都回傳同一份 `index.html`，再由 Vue Router 看網址決定要顯示什麼。

之後要把網站放到正式的主機上時，主機也要做同樣的設定，否則直接打開 `/about` 會出現主機的「找不到頁面」。託管服務通常有「單頁應用程式」或「SPA」的選項，把它打開就好。

### 讓 create-vue 幫你做

上面這些步驟，`npm create vue@latest` 也可以幫你做好。建立專案時的問題清單裡有一項「Router (SPA development)」（中文介面顯示「Router（單頁應用程式開發）」），勾起來，或是加上 `--router` 旗標：

```bash
npm create vue@latest -- my-site --router
```

產生的專案裡已經有 `src/router/index.js`、`src/views/` 和 `app.use(router)`，結構和你剛剛手動做的一樣。你會看到它寫的是 `createWebHistory(import.meta.env.BASE_URL)`，括號裡那個值是「網站放在主機的哪個子路徑底下」，網站放在網域根目錄時用不到，所以這一章省略它。

## 重點整理

- 單頁應用程式只載入一次網頁，換頁由 JavaScript 完成。
- 用 `npm install vue-router` 安裝，在 `src/router/index.js` 用 `createRouter` 和 `routes` 陣列寫路由設定。
- 每條路由是一個物件：`path` 是網址路徑，`component` 是要顯示的元件。
- 在 `main.js` 用 `app.use(router)` 把 router 裝進 app。
- `<RouterView />` 標出「目前網址對應的元件」要顯示在哪裡。
