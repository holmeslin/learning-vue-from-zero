# 動態路由與 `useRoute`

## 本集目標

讓一個頁面元件依照網址裡的一段內容，顯示不同的資料。

## 正文

### 一個元件，很多網址

商品有四個：`/products/1`、`/products/2`、`/products/3`、`/products/4`。總不能替每一個商品都寫一條路由。我們要的是「同一個元件，網址最後那段是什麼，就顯示哪一個商品」。

這個做法叫**動態路由**（dynamic route）：路徑裡用冒號開頭的名字代表「這一段可以是任何東西」。

### 設定動態路由

打開 `src/router/index.js`，在檔案開頭加上匯入：

```js,ignore
import ProductDetailView from "../views/ProductDetailView.vue";
```

然後在 `children` 裡、`products` 那一條下面加一條：

```js,ignore
        { path: "products", component: ProductsView },
        { path: "products/:id", component: ProductDetailView },
```

`"products/:id"` 的意思是：`/products/` 後面接一段任何東西，都符合這條路由，而且把那一段記成 `id`。這種冒號開頭的部分叫**路由參數**（route params）。

### 用 `useRoute` 讀出來

建立 `src/views/ProductDetailView.vue`：

```vue
<script setup>
import { RouterLink, useRoute } from "vue-router";
import { products } from "../products.js";

const route = useRoute();
const product = products.find(
  (item) => item.id === Number(route.params.id),
);
</script>

<template>
  <p>網址上的 id：{{ route.params.id }}</p>
  <div v-if="product">
    <h1>{{ product.name }}</h1>
    <p>售價 {{ product.price }} 元</p>
  </div>
  <p v-else>找不到這個商品</p>
  <RouterLink to="/products">回到商品列表</RouterLink>
</template>
```

`useRoute()` 回傳一個物件，代表「目前的路由」，裡面有關於目前網址的各種資訊。路由參數放在 `route.params` 裡，名字就是你在 `path` 裡取的名字。網址是 `/products/2` 時，`route.params.id` 就是 `"2"`。

`useRoute` 和第 6 章的 composable 一樣，要在 `<script setup>` 裡呼叫，不能放在事件處理函式裡面才呼叫。

### 網址上的值一律是字串

注意 `route.params.id` 是**字串** `"2"`，不是數字 2。商品的 `id` 是數字，如果直接寫 `item.id === route.params.id`，永遠是 `false`，因為 `2 === "2"` 不成立（第 1 章講過 `===` 不會偷偷轉型別）。所以上面用 `Number()` 把字串轉成數字再比。

### 網址亂打會怎樣

在網址列打 `/products/99` 按 Enter。這條網址符合 `products/:id`，所以會顯示 `ProductDetailView`，但 `find` 找不到 id 是 99 的商品，回傳 `undefined`。

如果沒有 `v-if="product"`，模板會去讀 `undefined` 的 `name`，畫面就壞了。使用者隨時可以在網址列亂打，所以一定要處理「找不到」的情況。這裡用第 4 章的 `v-if` / `v-else`，找不到時顯示「找不到這個商品」。

### 從列表連過來

最後把列表上每一項改成連結。打開 `src/views/ProductsView.vue`：

```vue
<script setup>
import { RouterLink } from "vue-router";
import { products } from "../products.js";
</script>

<template>
  <h1>商品</h1>
  <ul>
    <li v-for="product in products" :key="product.id">
      <RouterLink :to="`/products/${product.id}`">
        {{ product.name }}
      </RouterLink>
    </li>
  </ul>
</template>
```

`to` 前面加了冒號，變成 `:to`，這是第 4 章的 `v-bind`：引號裡面是 JavaScript，用樣板字面值組出每個商品自己的網址。點一下商品，就會到 `/products/2` 這樣的頁面。

### 多個參數

一條路徑可以有好幾個參數，例如 `path: "users/:userId/posts/:postId"`，用 `route.params.userId` 和 `route.params.postId` 分別讀出來。同一條路徑裡的名字不要重複。

## 重點整理

- 路徑裡以冒號開頭的一段，例如 `:id`，是路由參數，可以符合任何內容。
- 在 `<script setup>` 裡呼叫 `useRoute()`，用 `route.params.id` 讀參數。
- 網址上的值永遠是字串，要和數字比對時先用 `Number()` 轉。
- 網址使用者說了算，一定要處理「找不到資料」的情況。
- `RouterLink` 的 `to` 也可以用 `:to` 綁定組出來的網址。
