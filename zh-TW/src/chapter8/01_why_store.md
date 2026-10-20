# 為什麼需要 store

## 本集目標

看懂用 `provide` / `inject` 共用資料會遇到哪些麻煩，知道 store 要解決的是什麼問題。

## 正文

### 一個常見的需求

做一個購物網站：最上面的標題列要顯示「購物車（3）」，下面的商品清單每一項都有「加入購物車」按鈕。標題列和商品清單是兩個不同的元件，彼此不是父子關係，卻要用同一份資料。

用第 7 章學過的 `provide` / `inject`，可以這樣寫。

`src/App.vue`：

```vue
<script setup>
import { ref, provide } from "vue";
import AppHeader from "./components/AppHeader.vue";
import ProductList from "./components/ProductList.vue";

const cartCount = ref(0);

function addToCart() {
  cartCount.value++;
}

provide("cartCount", cartCount);
provide("addToCart", addToCart);
</script>

<template>
  <AppHeader />
  <ProductList />
</template>
```

`src/components/AppHeader.vue`：

```vue
<script setup>
import { inject } from "vue";

const cartCount = inject("cartCount");
</script>

<template>
  <header>
    <h1>小明商店</h1>
    <p>購物車（{{ cartCount }}）</p>
  </header>
</template>
```

`src/components/ProductList.vue`：

```vue
<script setup>
import { inject } from "vue";

const addToCart = inject("addToCart");
const products = ["鍵盤", "滑鼠", "螢幕"];
</script>

<template>
  <ul>
    <li v-for="product in products" :key="product">
      {{ product }}
      <button @click="addToCart">加入購物車</button>
    </li>
  </ul>
</template>
```

存檔、執行 `npm run dev`，點幾次「加入購物車」，標題列的數字會跟著變。它能動，而且是響應式的，因為 `provide` 出去的是一個 `ref`。

### 能動，但越來越難維護

這個範例很小，看不出問題。想像網站長大之後：

**資料得放在共同的祖先元件。** `AppHeader` 和 `ProductList` 要共用資料，資料只能放在它們共同的上層，也就是 `App.vue`。`App.vue` 本來只負責排版，現在卻要管購物車的資料和邏輯。之後再加上「登入的使用者」「網站語言」「深色模式」，這些全都得塞進 `App.vue`，它會變成一個什麼都管的大雜燴。

**只有元件拿得到。** `inject` 只能在元件的 `<script setup>` 裡呼叫，而且只有 `provide` 那個元件底下的元件拿得到。如果是一個普通的 `.js` 檔想知道「使用者登入了沒」，就沒辦法用 `inject`。後面第 9 章學 Vue Router 的導覽守衛時，就可能遇到這種情況。

**名字是字串，打錯不會馬上發現。** 把 `inject("cartCount")` 打成 `inject("cartCont")`，程式不會出錯停下來，只是拿到 `undefined`，Console 多一行警告，畫面上的數字變成空白。資料一多，這種字串名字會越來越難管。

### store：把共用的資料搬出元件

這些麻煩的根源是同一件事：**購物車的資料其實不屬於任何一個元件**，卻被迫住在某個元件裡。

**store** 的想法很簡單：把這種共用的資料，連同修改它的函式，搬到元件外面一個獨立的檔案。哪個元件需要，就自己 `import` 進來用，不用管它和其他元件是什麼關係，也不用經過 `App.vue`。

Vue 官方推薦用來做 store 的函式庫叫 **Pinia**。改用 Pinia 之後，`App.vue` 會變回單純的排版，購物車的一切都放在 `src/stores/cart.js` 裡。下一集就來安裝它。

### 為什麼不自己寫一個 `.js` 檔就好

你可能會想：在一個 `.js` 檔的最外層寫 `const cartCount = ref(0)`，然後 `export` 出去，每個元件都 `import` 同一個，不就能共用了？

小專案確實可以這樣做，Vue 官方文件也提過這種寫法。Pinia 多做的事情是：Vue DevTools 看得到 store 裡的資料，寫法有統一的規矩，而且到第二部用 Nuxt 在伺服器上渲染網頁時，不會讓不同使用者共用到同一份資料。專案稍微大一點，直接用 Pinia 比較省事。

## 重點整理

- `provide` / `inject` 可以共用資料，但資料得放在共同的祖先元件裡。
- 共用資料越多，祖先元件（通常是 `App.vue`）就越肥。
- `inject` 只能在元件裡用，用字串當名字也容易打錯。
- store 把共用的資料和操作搬到元件外的獨立檔案，誰需要誰 `import`。
- Pinia 是 Vue 官方推薦的 store 函式庫。
