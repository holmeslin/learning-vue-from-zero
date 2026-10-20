# `v-for` 與 `key`

## 本集目標

用 `v-for` 把一個陣列畫成一串畫面，並且知道為什麼要加 `key`。

## 正文

### 一個陣列，一串畫面

網站上到處都是清單：商品、留言、搜尋結果。資料是一個陣列，畫面就要把陣列裡的每一筆，各畫成一塊。

把 `src/App.vue` 換成：

```vue
<script setup>
const fruits = ["蘋果", "香蕉", "芭樂"];
</script>

<template>
  <ul>
    <li v-for="fruit in fruits" :key="fruit">{{ fruit }}</li>
  </ul>
</template>
```

畫面上是三個項目的清單：蘋果、香蕉、芭樂。

`v-for="fruit in fruits"` 的意思是：「走過 `fruits` 陣列，每一項取名叫 `fruit`，各畫出一個 `<li>`」。寫了 `v-for` 的元素，陣列有幾項就會重複幾次；在這個元素裡面（包括它自己的屬性），都可以用 `fruit` 讀到這一次輪到的那一項。

這就是第 1 章的 `for...of`，只是寫在模板裡：`for (const fruit of fruits)` 對應 `v-for="fruit in fruits"`。注意模板裡習慣用的是 `in`。

`:key="fruit"` 是什麼，等一下解釋。

### 物件陣列

實際的資料通常是物件組成的陣列。把 `src/App.vue` 換成：

```vue
<script setup>
const products = [
  { id: 1, name: "機械鍵盤", price: 1200 },
  { id: 2, name: "無線滑鼠", price: 600 },
  { id: 3, name: "螢幕", price: 5000 },
];
</script>

<template>
  <ul>
    <li v-for="product in products" :key="product.id">
      {{ product.name }}：{{ product.price }} 元
    </li>
  </ul>
</template>
```

```text
機械鍵盤：1200 元
無線滑鼠：600 元
螢幕：5000 元
```

`v-for` 可以直接走訪原本的陣列，不需要先用第 2 章的 `map` 轉換。只有資料的形狀和畫面需要的不一樣時，才需要先整理。資料多一筆，畫面就自動多一行，模板一個字都不用改。

### 搭配元件

`v-for` 也可以用在元件上，每一項畫成一個元件。用第 8 集最後的 `ProductCard`，把 `src/App.vue` 換成：

```vue
<script setup>
import ProductCard from "./components/ProductCard.vue";

const products = [
  { id: 1, name: "機械鍵盤", price: 1200, isNew: true },
  { id: 2, name: "無線滑鼠", price: 600, isNew: false },
  { id: 3, name: "螢幕", price: 5000, isNew: false },
];
</script>

<template>
  <ProductCard
    v-for="product in products"
    :key="product.id"
    :name="product.name"
    :price="product.price"
    :isNew="product.isNew"
  />
</template>
```

三張卡片，第一張標著「（新品）」。

### 同時拿到索引

如果需要知道「這是第幾項」，寫成 `(項目, 索引) in 陣列`。把 `src/App.vue` 換成：

```vue
<script setup>
const ranking = ["機械鍵盤", "無線滑鼠", "螢幕"];
</script>

<template>
  <h2>本週熱銷</h2>
  <p v-for="(name, index) in ranking" :key="name">
    第 {{ index + 1 }} 名：{{ name }}
  </p>
</template>
```

```text
本週熱銷
第 1 名：機械鍵盤
第 2 名：無線滑鼠
第 3 名：螢幕
```

索引和陣列一樣從 `0` 開始，所以顯示時要加 1。

### 為什麼需要 `key`

每個範例的 `v-for` 旁邊都有一個 `:key`。第 3 章最後預覽的待辦清單沒有寫它，那是為了讓你先看形狀而省略的；從現在開始，**每個 `v-for` 都要加 `key`**。

`key` 的功用是讓 Vue **認得每一個項目是誰**。想像一個班級點名：如果名單的順序變了，老師靠名字還是知道誰是誰；如果只靠座位號碼，有新同學插進來之後，所有人的號碼都錯位了。

Vue 也一樣。到了第 5 章，清單會開始變動：新增一項、刪除一項、換順序。Vue 不會整個清單砍掉重畫，而是想辦法只更新有變的部分，這時它就靠 `key` 判斷「哪一項是原本的哪一項」。沒有正確的 `key`，有時會出現怪現象，例如在某一項的輸入框打的字，刪掉別的項目之後跑到隔壁那項去了。

現在這一章的資料不會變，少寫 `key` 看不出差別，而且 Vue 也不會跳出警告提醒你。正因為沒人提醒，要自己養成習慣。

### 怎麼選 `key`

- **用資料本身的 id**。商品編號、會員編號，都是最好的 `key`：獨一無二，而且不會因為順序改變而改變。
- 如果陣列裡是不會重複的字串，像上面的水果名稱，也可以直接用字串本身。
- **不要用索引**。`:key="index"` 看起來方便，但清單一旦新增、刪除或換順序，同一筆資料的索引就變了，Vue 會認錯人。
- **不要用隨機數**，例如 `:key="Math.random()"`。每次畫面更新都會產生新的 `key`，Vue 會把每一項都當成新的。

`key` 要寫在有 `v-for` 的那個元素上。

### 先過濾，再畫出來

只想顯示一部分的資料時，你可能會想把 `v-if` 和 `v-for` 寫在同一個元素上：

```vue
<script setup>
const products = [
  { id: 1, name: "機械鍵盤", inStock: true },
  { id: 2, name: "無線滑鼠", inStock: false },
];
</script>

<template>
  <ul>
    <li
      v-for="product in products"
      :key="product.id"
      v-if="product.inStock"
    >
      {{ product.name }}
    </li>
  </ul>
</template>
```

這樣寫畫面會整片空白，主控台出現一串警告和一行紅字錯誤：

```text
[Vue warn]: Property "product" was accessed during render but is not defined
on instance.
Cannot read properties of undefined (reading 'inStock')
```

（第一行是同一行，為了排版拆成兩行。）原因是寫在同一個元素上時，Vue 會**先**檢查 `v-if`，那時候 `v-for` 還沒開始，`product` 根本還不存在。

正確的做法是先用第 2 章的 `filter` 把資料過濾好，再交給 `v-for`。把 `src/App.vue` 換成：

```vue
<script setup>
const products = [
  { id: 1, name: "機械鍵盤", inStock: true },
  { id: 2, name: "無線滑鼠", inStock: false },
  { id: 3, name: "螢幕", inStock: true },
];

const available = products.filter((product) => product.inStock);
</script>

<template>
  <h2>現貨商品（{{ available.length }} 項）</h2>
  <ul>
    <li v-for="product in available" :key="product.id">
      {{ product.name }}
    </li>
  </ul>
</template>
```

```text
現貨商品（2 項）
機械鍵盤
螢幕
```

**`v-if` 和 `v-for` 不要寫在同一個元素上。** 要過濾，就在 `<script setup>` 裡先 `filter`。

### 清單是空的時候

資料可能一筆都沒有，這時與其留一片空白，不如給使用者一句說明。搭配上一集的 `v-if`，把 `src/App.vue` 換成：

```vue
<script setup>
const products = [];
</script>

<template>
  <p v-if="products.length === 0">目前沒有商品。</p>
  <ul v-else>
    <li v-for="product in products" :key="product.id">
      {{ product.name }}
    </li>
  </ul>
</template>
```

這次 `v-if` 和 `v-for` 分別在 `<p>`、`<ul>` 和 `<li>` 上，沒有寫在同一個元素，所以沒問題。

### 一項要畫好幾個元素：`<template v-for>`

每一項要畫成好幾個相鄰的元素，又不想多包一層時，和上一集一樣用 `<template>`，這時 `key` 要寫在 `<template>` 上。把 `src/App.vue` 換成：

```vue
<script setup>
const terms = [
  { id: 1, word: "元件", meaning: "畫面上的一塊，一個 .vue 檔" },
  { id: 2, word: "props", meaning: "父元件傳給子元件的資料" },
];
</script>

<template>
  <dl>
    <template v-for="term in terms" :key="term.id">
      <dt>{{ term.word }}</dt>
      <dd>{{ term.meaning }}</dd>
    </template>
  </dl>
</template>
```

`<dl>`、`<dt>`、`<dd>` 是 HTML 裡用來寫「名詞解釋」的標籤：`<dt>` 是名詞，`<dd>` 是說明。

## 重點整理

- `v-for="item in items"` 會走過陣列，每一項畫出一份；`(item, index) in items` 可以同時拿到索引。
- `v-for` 可以直接走訪原本的陣列，也可以用在元件上。
- 每個 `v-for` 都要加 `:key`，用資料本身的 id，不要用索引或隨機數。
- `v-if` 和 `v-for` 不要寫在同一個元素上，要過濾就先在 `<script setup>` 裡 `filter`。
- 一項要畫好幾個元素時用 `<template v-for>`，`key` 寫在 `<template>` 上。
