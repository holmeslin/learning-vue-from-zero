# 參數變了，畫面卻沒變

## 本集目標

知道同一條路由換參數時元件不會重建，並用 `computed` 和 `watch` 讓畫面跟著網址走。

## 正文

### 加一個「下一個商品」

在商品頁加一個連結，直接跳到下一個商品。把 `src/views/ProductDetailView.vue` 改成：

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
  <RouterLink :to="`/products/${Number(route.params.id) + 1}`">
    下一個商品
  </RouterLink>
</template>
```

打開 `/products/1`，畫面是「機械鍵盤」。點「下一個商品」：

- 網址變成 `/products/2`。
- 「網址上的 id」變成 2。
- 但標題**還是「機械鍵盤」**，價格也還是 2400 元。

重新整理一下，就變成正確的「無線滑鼠」了。這是怎麼回事？

### 元件沒有重建

從 `/products/1` 換到 `/products/2`，兩個網址對到的是**同一條路由、同一個元件**。Vue Router 為了效率，不會把 `ProductDetailView` 拆掉再重建一個，而是直接沿用原本那一個，只把 `route.params.id` 換掉。

`<script setup>` 裡的程式碼只在元件建立時執行一次。所以：

- `const product = products.find(...)` 只在一開始算了一次，算出「機械鍵盤」之後就不會再變。
- 模板裡的 `{{ route.params.id }}` 會更新，因為 `useRoute()` 回傳的 `route` 是響應式的，模板用到它，它變了模板就會重新渲染。

同樣的道理，`onMounted` 也只會在第一次執行，換參數時不會再跑一次。

### 用 `computed` 跟著參數算

第 5 章講過：「從別的資料算出來的值」用 `computed`。`product` 正是從 `route.params.id` 算出來的，把它改成 `computed`，`route.params.id` 一變它就會重算：

```js,ignore
const product = computed(() =>
  products.find((item) => item.id === Number(route.params.id)),
);
```

別忘了在檔案開頭從 `vue` 匯入 `computed`。模板不用改，`computed` 在模板裡會自動解包，`product.name` 照樣能用。

### 參數一變就要做事：用 `watch`

有時候參數變了，你要的不是「算出新的值」，而是「去做一件事」。最常見的是第 6 章的「用 `watch` 抓資料」：真實的網站，商品資料通常要拿 id 去伺服器抓，id 一變就要重新抓一次。

這種情況用 `watch` 監聽 `route.params.id`。這裡用「把瀏覽器分頁的標題改成商品編號」當例子，因為它看得到效果。完整的 `ProductDetailView.vue`：

```vue
<script setup>
import { computed, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { products } from "../products.js";

const route = useRoute();
const product = computed(() =>
  products.find((item) => item.id === Number(route.params.id)),
);

watch(
  () => route.params.id,
  (id) => {
    document.title = `商品 ${id}`;
  },
  { immediate: true },
);
</script>

<template>
  <p>網址上的 id：{{ route.params.id }}</p>
  <div v-if="product">
    <h1>{{ product.name }}</h1>
    <p>售價 {{ product.price }} 元</p>
  </div>
  <p v-else>找不到這個商品</p>
  <RouterLink :to="`/products/${Number(route.params.id) + 1}`">
    下一個商品
  </RouterLink>
</template>
```

- `watch` 的第一個引數要寫成函式 `() => route.params.id`，不能直接寫 `route.params.id`。直接寫的話，傳進去的只是當下的字串 `"1"`，`watch` 沒辦法知道它之後有沒有變。這是第 6 章學過的規則：要監聽物件裡的某個屬性，就把它包成函式。
- `{ immediate: true }` 讓它一開始就先執行一次。沒有它的話，第一次打開頁面時不會執行，要等 id 變了才會。

現在再點「下一個商品」，標題、價格、瀏覽器分頁上的文字都會跟著換。抓資料的寫法也一樣，把 `document.title = ...` 那行換成第 6 章抓資料的程式碼就好。

## 重點整理

- 同一條路由只換參數時，元件會被沿用，不會重建。
- `<script setup>` 和 `onMounted` 只在元件建立時執行一次，換參數時不會再跑。
- 從參數算出來的值用 `computed`，參數變了會自動重算。
- 參數變了要做事（例如抓資料），用 `watch(() => route.params.id, ...)`。
- 加上 `{ immediate: true }`，第一次進頁面時也會執行。
