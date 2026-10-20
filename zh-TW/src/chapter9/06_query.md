# 查詢參數

## 本集目標

用網址問號後面的**查詢參數**記住篩選條件，例如 `/products?category=mouse`。

## 正文

### 什麼是查詢參數

網址 `/products?category=mouse` 中，問號後面的 `category=mouse` 叫**查詢參數**（query）。可以用 `&` 接好幾組，例如 `?category=mouse&sort=price`。

它和上一集的路由參數不一樣：路由參數決定「是哪一頁」，查詢參數是「這一頁的附加條件」，例如篩選、排序、頁碼，有沒有都可以。`/products` 和 `/products?category=mouse` 對到的是同一條路由。

為什麼要把篩選條件放在網址，而不是放進 `ref`？因為網址可以複製貼上給別人，重新整理也不會消失，上一頁、下一頁也會正確運作。

### 讀取

查詢參數和路由參數一樣在 `useRoute()` 回傳的物件裡，放在 `route.query`：

```vue
<script setup>
import { useRoute } from "vue-router";

const route = useRoute();
</script>

<template>
  <p>目前分類：{{ route.query.category ?? "all" }}</p>
</template>
```

網址是 `/products?category=mouse` 時，`route.query.category` 是 `"mouse"`。網址上沒有這個參數時，它是 `undefined`；只寫了名字沒寫值（`/products?category`）時，它是 `null`。兩種情況都用第 2 章的 `??` 給預設值 `"all"` 就好。

和路由參數一樣，查詢參數的值一律是字串。

### 修改：連結到帶參數的網址

改查詢參數，其實就是「換到另一個網址」。`RouterLink` 的 `to` 除了字串，也可以傳一個物件，把路徑和查詢參數分開寫：

```vue
<script setup>
import { RouterLink } from "vue-router";
</script>

<template>
  <RouterLink :to="{ path: '/products', query: { category: 'mouse' } }">
    只看滑鼠
  </RouterLink>
</template>
```

它會連到 `/products?category=mouse`。用物件寫的好處是不用自己拼問號和 `&`，特殊字元也會自動處理好。

### 完整範例：分類篩選

把 `src/views/ProductsView.vue` 改成：

```vue
<script setup>
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { products } from "../products.js";

const categories = ["all", "keyboard", "mouse"];

const route = useRoute();
const category = computed(() => route.query.category ?? "all");
const visible = computed(() =>
  category.value === "all"
    ? products
    : products.filter((product) => product.category === category.value),
);
</script>

<template>
  <h1>商品</h1>
  <p>目前分類：{{ category }}</p>
  <p>
    <RouterLink
      v-for="name in categories"
      :key="name"
      :to="{ path: '/products', query: { ...route.query, category: name } }"
    >
      {{ name }}
    </RouterLink>
  </p>
  <ul>
    <li v-for="product in visible" :key="product.id">
      <RouterLink :to="`/products/${product.id}`">
        {{ product.name }}
      </RouterLink>
    </li>
  </ul>
</template>
```

點「mouse」，網址變成 `/products?category=mouse`，列表只剩兩支滑鼠。複製這個網址貼到新分頁，一樣是滑鼠的列表。

幾個重點：

- `category` 和 `visible` 都是從網址算出來的 `computed`，沒有另外用 `ref` 存。網址就是唯一的資料來源，網址一變，列表自動跟著變。上一集講過元件不會重建，用 `computed` 就不怕這個問題。
- `query` 裡寫的是 `{ ...route.query, category: name }`。`...` 是第 2 章的展開語法：先把目前所有的查詢參數複製過來，再把 `category` 換掉。如果網址原本是 `?sort=price`，點完會變成 `?sort=price&category=mouse`，`sort` 不會不見。只寫 `{ category: name }` 的話，其他查詢參數就全部被換掉了。

### active class 不看查詢參數

用開發者工具看一下這三個分類連結，你會發現它們**全部**都有 `router-link-exact-active`。這是因為 `RouterLink` 判斷「是不是目前這一頁」時只看路徑，不看查詢參數，三個連結的路徑都是 `/products`。

所以這裡用「目前分類：mouse」這行字來顯示選了哪一個，而不是靠 active class。

## 重點整理

- 查詢參數是網址問號後面的 `名稱=值`，適合放篩選、排序、頁碼。
- 用 `route.query.名稱` 讀取，沒有的時候是 `undefined` 或 `null`，可以用 `??` 給預設值。
- `RouterLink` 的 `to` 可以傳 `{ path, query }` 物件，不用自己拼網址。
- 要保留其他查詢參數，用 `{ ...route.query, 名稱: 新值 }`。
- 從查詢參數算出來的值用 `computed`，不要另外存一份。
