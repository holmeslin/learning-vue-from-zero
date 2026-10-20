# `computed`

## 本集目標

用 `computed` 從現有的響應式資料算出新的值，並且知道它和普通函式的差別。

## 正文

### 算出來的資料

購物車裡有幾樣商品，想在下面顯示總金額。總金額不需要另外存，因為它可以從商品清單算出來。把 `src/App.vue` 換成：

```vue
<script setup>
import { ref, computed } from "vue";

const items = ref([
  { id: 1, name: "鍵盤", price: 1200, qty: 1 },
  { id: 2, name: "滑鼠", price: 600, qty: 2 },
]);

const total = computed(() => {
  return items.value.reduce((sum, item) => sum + item.price * item.qty, 0);
});
</script>

<template>
  <ul>
    <li v-for="item in items" :key="item.id">
      {{ item.name }}，{{ item.price }} 元 × {{ item.qty }}
      <button @click="item.qty++">再一個</button>
    </li>
  </ul>
  <p>總共 {{ total }} 元</p>
</template>
```

畫面一開始顯示 `總共 2400 元`。點「鍵盤」旁邊的「再一個」，總金額馬上變成 `3600`。

拆開來看：

- `computed` 和 `ref` 一樣從 `vue` 匯入。
- `computed(() => { ... })` 接收一個函式，這個函式**回傳**算出來的值。這裡用第 2 章學的 `reduce` 把每樣商品的小計加起來。
- `computed` 回傳的也是一個盒子：模板裡直接寫 `total`，在 `<script setup>` 裡要寫 `total.value`。

最重要的是：你沒有寫任何「數量改了就重新算總金額」的程式。`computed` 在計算時讀了 `items` 裡每樣商品的 `price` 和 `qty`，Vue 就記下「`total` 是靠這些資料算出來的」。其中任何一個變了，`total` 就會重新計算，畫面也跟著更新。這和上一集代理人的機制是同一套。

### 能算出來的，就不要另外存

你可能會想：另外用一個 `ref` 存總金額，每次改數量時順便更新它，不也可以嗎？可以，但很容易出錯。之後加了「刪除商品」、「改價格」的功能，每個地方都要記得順便更新總金額，漏掉一個，畫面上的總金額就和商品清單對不起來。這正是第 3 章最後一集手動同步 DOM 時遇到的麻煩。

用 `computed` 的話，總金額永遠是從商品清單算出來的，不可能不一致。原則是：**能從現有資料算出來的，就用 `computed`，不要另外存一份。**

### 排序過的清單：用 `toSorted`

`computed` 也很適合做「整理過的清單」，例如依價格排序。把 `src/App.vue` 換成：

```vue
<script setup>
import { ref, computed } from "vue";

const items = ref([
  { id: 1, name: "鍵盤", price: 1200 },
  { id: 2, name: "滑鼠", price: 600 },
  { id: 3, name: "螢幕", price: 4500 },
]);

const sortedItems = computed(() => {
  return items.value.toSorted((a, b) => a.price - b.price);
});
</script>

<template>
  <p>原本的順序：</p>
  <ul>
    <li v-for="item in items" :key="item.id">{{ item.name }}</li>
  </ul>
  <p>依價格由低到高：</p>
  <ul>
    <li v-for="item in sortedItems" :key="item.id">
      {{ item.name }}，{{ item.price }} 元
    </li>
  </ul>
</template>
```

上面的清單維持鍵盤、滑鼠、螢幕；下面的變成滑鼠、鍵盤、螢幕。

這裡一定要用 `toSorted`，不能用 `sort`。第 2 章第 11 集說過，`sort` 會直接改掉原本的陣列。如果寫成 `items.value.sort(...)`，你只是想「顯示」一份排序過的清單，卻連 `items` 本身的順序都被改了，上面那份「原本的順序」也會跟著亂掉。`toSorted` 回傳一個新陣列，`items` 不受影響。`filter`、`map` 也是回傳新陣列，在 `computed` 裡可以放心用。

### 和普通函式有什麼不一樣

在模板裡呼叫一個函式，也能算出一樣的結果。差別在於 `computed` 會**記住**上次算的結果。把 `src/App.vue` 換成：

```vue
<script setup>
import { ref, computed } from "vue";

const count = ref(1);
const other = ref(0);

const doubled = computed(() => {
  console.log("computed 算了一次");
  return count.value * 2;
});

function getDoubled() {
  console.log("函式算了一次");
  return count.value * 2;
}
</script>

<template>
  <p>computed：{{ doubled }}，函式：{{ getDoubled() }}</p>
  <button @click="count++">count 加一</button>
  <p>other：{{ other }}</p>
  <button @click="other++">other 加一</button>
</template>
```

打開 Console，重新整理頁面，會看到：

```text
computed 算了一次
函式算了一次
```

接著點「other 加一」。`other` 變了，整個元件重新渲染，Console 多了一行：

```text
函式算了一次
```

`computed` 沒有重算，因為它只用到 `count`，`count` 沒變，Vue 直接拿上次的結果。函式就不一樣，每次渲染都會再執行一次。

最後點「count 加一」，兩行都會出現，因為 `count` 變了，兩邊都得重算。

在這個小例子裡，多算一次沒什麼。但如果計算很花時間，例如要篩選幾千筆資料，`computed` 能省下很多不必要的工作。所以：**從資料算出另一個值，用 `computed`；要做一件事（例如回應按鈕被點），用函式。**

### `computed` 只負責算

`computed` 裡的函式只做一件事：讀資料、回傳結果。不要在裡面改別的資料，也不要直接改 `computed` 的值：

```js,ignore
total.value = 0;
```

這樣寫不會成功，Console 會出現警告：

```text
[Vue warn] Write operation failed: computed value is readonly
```

想讓總金額變成 0，要去改它的來源：例如把每樣商品的數量改成 0，`total` 自然就會變成 0。

## 重點整理

- `computed(() => 回傳值)` 從現有的響應式資料算出新的值，它用到的資料一變就自動重算。
- `computed` 也是盒子：模板裡直接寫名字，`<script setup>` 裡要加 `.value`。
- 能從現有資料算出來的，用 `computed`，不要另外存一份。
- `computed` 會記住結果，只有用到的資料變了才重算；模板裡呼叫的函式則是每次渲染都執行。
- `computed` 只負責讀資料和回傳結果：排序用 `toSorted` 不用 `sort`，也不要直接改它的值。
