# 404 頁面

## 本集目標

網址對不到任何頁面時，顯示一個「找不到這個頁面」，而不是一片空白。

## 正文

### 現在的問題

第 1 集試過，網址打 `/abc` 會看到一片空白，Console 出現 `No match found` 的警告。使用者不會開 Console，他只會覺得網站壞了。

網站上找不到頁面時，習慣上會顯示「404」頁面。404 是伺服器回應「找不到」時用的代碼，所以大家都把這種頁面叫 404 頁面。

### 404 頁面元件

建立 `src/views/NotFoundView.vue`：

```vue
<script setup>
import { RouterLink, useRoute } from "vue-router";

const route = useRoute();
</script>

<template>
  <h1>找不到這個頁面</h1>
  <p>網址 {{ route.fullPath }} 不存在。</p>
  <RouterLink to="/">回首頁</RouterLink>
</template>
```

`route.fullPath` 是完整的網址路徑，包含查詢參數，上一集的守衛也用過。

### 符合所有網址的路由

打開 `src/router/index.js`，在開頭加上匯入：

```js,ignore
import NotFoundView from "../views/NotFoundView.vue";
```

然後在 `routes` 陣列的最後，`/login` 那一條下面加一條：

```js,ignore
    { path: "/login", component: LoginView },
    { path: "/:pathMatch(.*)*", component: NotFoundView },
  ],
```

`"/:pathMatch(.*)*"` 看起來很嚇人，拆開來看：

- `:pathMatch` 是第 4 集的路由參數，名字叫 `pathMatch`。名字可以自己取，但大家都用這個，官方文件也是。
- `(.*)` 指定這個參數可以符合「任何字元，包括斜線」。一般的參數像 `:id` 不能包含斜線，所以 `/products/:id` 對不到 `/products/2/abc`。
- 最後的 `*` 讓它可以符合好幾段，也可以一段都沒有。

合起來的意思就是：**什麼網址都符合**。你不用記住它，要用的時候回來這裡抄就好。

現在打開 `/abc/def`，畫面會顯示「找不到這個頁面」和「網址 /abc/def 不存在。」，Console 也不再出現警告。

### 它不會搶走其他頁面嗎

既然什麼網址都符合，那 `/about` 會不會也跑去 404？不會。Vue Router 不是由上往下找第一個符合的，而是比較哪一條路由**寫得比較明確**。`/about` 是一個寫死的路徑，比「什麼都符合」明確得多，所以會選 `/about`。

習慣上還是把它放在 `routes` 的最後一條，讀程式的人一看就知道「前面都對不到的，就來這裡」。

### 動態路由的「找不到」

注意，`/products/99` 不會顯示 404 頁面。這個網址符合 `products/:id`，Vue Router 認為有這一頁，只是商品不存在。這種情況要在頁面元件裡自己處理，就像第 4 集用 `v-if` 顯示「找不到這個商品」那樣。

## 重點整理

- 網址對不到任何路由時，畫面會一片空白，要自己做 404 頁面。
- 路徑寫 `"/:pathMatch(.*)*"` 可以符合任何網址，把 404 頁面元件放在這條路由。
- Vue Router 會優先選比較明確的路由，所以 404 路由不會搶走其他頁面，但習慣上放在最後。
- `/products/99` 這種「路由對得到、資料找不到」的情況，要在頁面元件裡處理。
