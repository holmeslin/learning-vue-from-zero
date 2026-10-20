# 用 `useRouter` 換頁

## 本集目標

用 `useRouter` 在程式碼裡換頁，例如送出表單之後跳到別的頁面。

## 正文

### 不是每次換頁都是點連結

`RouterLink` 適合「使用者點了就去某一頁」。但有些時候，換頁是程式決定的：

- 使用者在表單輸入商品編號，按「前往」才跳過去。
- 登入成功之後，自動回到原本要去的頁面（下一集會做）。
- 「回上一頁」按鈕。

這些時候要用 `useRouter`。

### `router.push`

把 `src/views/HomeView.vue` 改成：

```vue
<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const productId = ref("");

function goToProduct() {
  if (productId.value === "") return;
  router.push(`/products/${productId.value}`);
}
</script>

<template>
  <h1>首頁</h1>
  <form @submit.prevent="goToProduct">
    <input v-model="productId" placeholder="輸入商品編號" />
    <button>前往</button>
  </form>
</template>
```

在首頁輸入 `3` 按「前往」，就會跳到 `/products/3`。

`useRouter()` 回傳的是第 1 集用 `createRouter` 建立的那個 router，`router.push(網址)` 就是「換到這個網址」，效果和點一個 `RouterLink` 一樣。表單的 `@submit.prevent` 是第 5 章教過的寫法，`.prevent` 擋掉瀏覽器預設的「送出表單就重新載入」。

注意名字很像，別搞混：

- `useRoute()`（沒有 r）：**目前的路由**，用來讀網址上的資訊，例如 `route.params`、`route.query`。
- `useRouter()`（有 r）：**router 本身**，用來換頁。

### `push` 也可以傳物件

和 `RouterLink` 的 `to` 一樣，`push` 也可以傳物件：

```js,ignore
router.push({ path: "/products", query: { category: "mouse" } });
```

### 幫路由取名字

網址寫死在程式碼裡，有一天要把 `/products/3` 改成 `/items/3`，就得到處找、到處改。Vue Router 讓你幫路由取個名字。打開 `src/router/index.js`，把商品頁那一條改成：

```js,ignore
        {
          path: "products/:id",
          name: "product",
          component: ProductDetailView,
        },
```

之後就可以用名字換頁，參數放在 `params`：

```js,ignore
router.push({ name: "product", params: { id: productId.value } });
```

Vue Router 會幫你組出 `/products/3`。以後路徑改了，只要改 `router/index.js` 那一處。`RouterLink` 也可以這樣寫：`:to="{ name: 'product', params: { id: 3 } }"`。

這一章的範例不多，直接寫路徑比較好讀，所以接下來還是用路徑。專案變大之後，用名字會比較好維護。

### `router.replace`

`push` 會在瀏覽器的歷史紀錄裡**新增**一筆，所以按瀏覽器的「上一頁」可以回來。`replace` 則是把目前這一筆**換掉**：

```js,ignore
router.replace("/");
```

用 `replace` 換頁之後，按上一頁不會回到原本那一頁，而是再前一頁。什麼時候用它？像登入頁：登入成功跳走之後，使用者按上一頁不應該又看到登入表單。下一集會用到。

### `router.back`

`router.back()` 等於按瀏覽器的「上一頁」。在 `src/views/ProductDetailView.vue` 加一個按鈕試試。先在 `<script setup>` 裡把匯入改成：

```js,ignore
import { RouterLink, useRoute, useRouter } from "vue-router";
```

在 `const route = useRoute();` 下面加一行：

```js,ignore
const router = useRouter();
```

然後在模板最後加上：

```vue,ignore
  <button @click="router.back()">回上一頁</button>
```

從列表點進商品，再點「下一個商品」幾次，然後按「回上一頁」，會一個一個退回去。

## 重點整理

- `useRouter()` 回傳 router 本身，用來在程式碼裡換頁；`useRoute()` 是目前的路由，用來讀網址。
- `router.push(網址)` 換頁，並在歷史紀錄新增一筆。
- `router.replace(網址)` 換頁，但取代目前這一筆，按上一頁回不來。
- `router.back()` 等於按瀏覽器的上一頁。
- 路由可以用 `name` 取名，換頁時用 `{ name, params }`，路徑改了只要改一處。
