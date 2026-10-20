# 綜合練習：購物車

## 本集目標

用兩個 store 和三個元件做出一個能加減商品、會算總金額的購物車。

## 正文

這一集沒有新東西，只有一個題目。請先自己寫，卡住再看提示，最後再對照參考解答。

### 題目

把第 1 集用 `provide` / `inject` 做的小商店，改用 Pinia 重寫，並且把購物車做完整。畫面分成三塊：

- **標題列**（`AppHeader.vue`）：顯示「購物車（件數）」，件數是所有商品數量的加總。
- **商品清單**（`ProductList.vue`）：列出三樣商品和價格，每一樣都有「加入購物車」按鈕。
- **購物車**（`CartPanel.vue`）：列出已加入的商品和數量，每一項有「-」「+」按鈕可以減少、增加數量，數量減到 0 就從購物車移除。下面顯示總金額和「清空購物車」按鈕。購物車沒東西時，只顯示「購物車是空的」。

商品資料用這三樣：

```js
[
  { id: 1, name: "鍵盤", price: 1200 },
  { id: 2, name: "滑鼠", price: 600 },
  { id: 3, name: "螢幕", price: 5000 },
];
```

規定：

1. 商品資料放在 `src/stores/products.js` 的 `useProductStore`。
2. 購物車放在 `src/stores/cart.js` 的 `useCartStore`。購物車裡**只記商品的 `id` 和數量**，名稱和價格要去 `useProductStore` 查。
3. `App.vue` 只負責把三個元件排出來，裡面不能有任何資料。

做好之後試試看：加入一個鍵盤、兩個滑鼠，標題列應該顯示「購物車（3）」，總金額 2400 元。

### 提示

- `useProductStore` 很簡單，只有一個 `products` state，沒有 getters 和 actions。
- `useCartStore` 的 state 是一個陣列 `items`，裝 `{ id, quantity }` 這樣的物件。
- 購物車需要的 getters：
  - `detailedItems`：用 `map` 把每個 `{ id, quantity }` 變成帶有名稱和價格的物件。用 `find` 去 `productStore.products` 找出對應的商品，再用展開語法 `{ ...product, quantity }` 合在一起。
  - `totalCount`、`totalPrice`：用 `reduce` 加總。
- 購物車需要的 actions：
  - `addItem(id)`：先 `find` 看看購物車裡有沒有這個商品，有就數量加一，沒有就 `push` 一個新的。
  - `removeItem(id)`：數量減一，減到 0 就用 `filter` 把它濾掉。
  - `clear()`：把 `items` 設回空陣列。
- `useProductStore()` 要在 `defineStore` 的函式**裡面**呼叫（第 6 集）。
- 在元件裡解構 state 或 getters，記得先用 `storeToRefs`（第 5 集）。

### 參考解答

寫完再看。

<details>
<summary>展開參考解答</summary>

`src/stores/products.js`：

```js
import { ref } from "vue";
import { defineStore } from "pinia";

export const useProductStore = defineStore("products", () => {
  const products = ref([
    { id: 1, name: "鍵盤", price: 1200 },
    { id: 2, name: "滑鼠", price: 600 },
    { id: 3, name: "螢幕", price: 5000 },
  ]);

  return { products };
});
```

`src/stores/cart.js`：

```js
import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { useProductStore } from "./products.js";

export const useCartStore = defineStore("cart", () => {
  const productStore = useProductStore();

  // 只記商品的 id 和數量，名稱和價格去商品 store 查
  const items = ref([]);

  const detailedItems = computed(() => {
    return items.value.map((item) => {
      const product = productStore.products.find(
        (product) => product.id === item.id
      );
      return { ...product, quantity: item.quantity };
    });
  });

  const totalCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0);
  });

  const totalPrice = computed(() => {
    return detailedItems.value.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  });

  function addItem(id) {
    const item = items.value.find((item) => item.id === id);
    if (item) {
      item.quantity++;
    } else {
      items.value.push({ id, quantity: 1 });
    }
  }

  function removeItem(id) {
    const item = items.value.find((item) => item.id === id);
    item.quantity--;
    if (item.quantity === 0) {
      items.value = items.value.filter((item) => item.id !== id);
    }
  }

  function clear() {
    items.value = [];
  }

  return {
    items,
    detailedItems,
    totalCount,
    totalPrice,
    addItem,
    removeItem,
    clear,
  };
});
```

`src/components/AppHeader.vue`：

```vue
<script setup>
import { storeToRefs } from "pinia";
import { useCartStore } from "../stores/cart.js";

const { totalCount } = storeToRefs(useCartStore());
</script>

<template>
  <header>
    <h1>小明商店</h1>
    <p>購物車（{{ totalCount }}）</p>
  </header>
</template>
```

`src/components/ProductList.vue`：

```vue
<script setup>
import { useProductStore } from "../stores/products.js";
import { useCartStore } from "../stores/cart.js";

const productStore = useProductStore();
const cart = useCartStore();
</script>

<template>
  <h2>商品</h2>
  <ul>
    <li v-for="product in productStore.products" :key="product.id">
      {{ product.name }}：{{ product.price }} 元
      <button @click="cart.addItem(product.id)">加入購物車</button>
    </li>
  </ul>
</template>
```

`src/components/CartPanel.vue`：

```vue
<script setup>
import { storeToRefs } from "pinia";
import { useCartStore } from "../stores/cart.js";

const cart = useCartStore();
const { detailedItems, totalPrice } = storeToRefs(cart);
const { addItem, removeItem, clear } = cart;
</script>

<template>
  <h2>購物車</h2>
  <p v-if="detailedItems.length === 0">購物車是空的</p>
  <div v-else>
    <ul>
      <li v-for="item in detailedItems" :key="item.id">
        {{ item.name }} × {{ item.quantity }}
        <button @click="removeItem(item.id)">-</button>
        <button @click="addItem(item.id)">+</button>
      </li>
    </ul>
    <p>總金額：{{ totalPrice }} 元</p>
    <button @click="clear">清空購物車</button>
  </div>
</template>
```

`src/App.vue`：

```vue
<script setup>
import AppHeader from "./components/AppHeader.vue";
import ProductList from "./components/ProductList.vue";
import CartPanel from "./components/CartPanel.vue";
</script>

<template>
  <AppHeader />
  <ProductList />
  <CartPanel />
</template>
```

幾個值得注意的地方：

- 和第 1 集比，`App.vue` 裡沒有 `ref`、沒有 `provide`，只剩排版。購物車的一切都在 `cart.js`，要改購物車的規則，打開這一個檔案就好。
- 三個元件彼此不知道對方存在，各自 `import` 需要的 store。`ProductList` 按下「加入購物車」，`AppHeader` 和 `CartPanel` 都會跟著更新。
- `items` 只存 `id` 和數量，名稱和價格用 getter 從 `useProductStore` 查。這樣商品改價錢時，只要改商品 store 一個地方，購物車的總金額自動就是新的價格。
- `AppHeader` 和 `CartPanel` 用 `storeToRefs` 解構 state 和 getters，`CartPanel` 的 actions 直接從 store 解構；`ProductList` 則是不解構，直接寫 `cart.addItem`。兩種寫法都可以。
- `removeItem` 減到 0 時，用第 2 章學過的 `filter` 產生一個不含該商品的新陣列，再指定回 `items.value`。

</details>

### 延伸挑戰

想多練一點的話，試試看：

- 每一項旁邊加一個「移除」按鈕，不管數量多少，一次整項拿掉。
- 把第 6 集的 `useUserStore` 搬過來，讓會員的總金額打八折。提示：在 `cart.js` 裡呼叫 `useUserStore()`，在 `totalPrice` 裡判斷。
- 每樣商品最多只能買 5 個，到了 5 個再按「+」或「加入購物車」都沒有反應。想想看，這個規則該寫在元件裡還是 store 裡？

## 重點整理

- 一個主題一個 store：商品一個、購物車一個，購物車透過 getter 讀取商品 store。
- `App.vue` 只負責排版，共用的資料和規則都在 store 裡。
- 元件彼此不用傳 props，各自 `import` 需要的 store 就能共用資料。
- 解構 state 和 getters 用 `storeToRefs`，actions 直接解構，或者乾脆不解構。
