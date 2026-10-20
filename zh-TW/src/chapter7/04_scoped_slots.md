# 作用域 slot

## 本集目標

讓子元件透過 slot 把資料交給父元件，由父元件決定這筆資料要長什麼樣子。

## 正文

### 問題：資料在子元件，樣子要父元件決定

建立 `src/components/ProductList.vue`，它收到一個商品陣列，用 `v-for` 一筆一筆畫出來：

```vue
<script setup>
const { items } = defineProps({ items: Array });
</script>

<template>
  <ul>
    <li v-for="item in items" :key="item.id">
      <slot :item="item">{{ item.name }}</slot>
    </li>
  </ul>
</template>
```

把 `src/App.vue` 換成下面這樣，用了兩次，一次什麼都不給，一次自己決定每一筆的樣子：

```vue
<script setup>
import ProductList from "./components/ProductList.vue";

const products = [
  { id: 1, name: "鍵盤", price: 1200 },
  { id: 2, name: "滑鼠", price: 600 },
  { id: 3, name: "螢幕", price: 5000 },
];
</script>

<template>
  <ProductList :items="products" />

  <ProductList :items="products" v-slot="{ item }">
    {{ item.name }}：<strong>{{ item.price }}</strong> 元
  </ProductList>
</template>
```

畫面上會有兩個清單：

```text
・鍵盤
・滑鼠
・螢幕

・鍵盤：1200 元
・滑鼠：600 元
・螢幕：5000 元
```

第一個清單用的是 slot 的預設內容，只顯示名稱。第二個清單的價格是粗體，而這個樣子是 `App.vue` 決定的。

### 為什麼普通的 slot 做不到

上一集的 slot，內容是父元件寫好、塞進子元件的。父元件的模板只看得到父元件自己的變數。

可是這裡的 `item` 是子元件 `v-for` 跑出來的，父元件根本看不到。父元件想寫 `{{ item.price }}`，得先有人把 `item` 交給它。

### 子元件把資料「綁」在 slot 上

在子元件這邊，像綁 props 一樣，把資料綁在 `<slot>` 上：

```vue,ignore
<slot :item="item">{{ item.name }}</slot>
```

綁在 `<slot>` 上的東西叫做 **slot props**。這裡交出去的是一個物件 `{ item: 這一筆商品 }`。

在父元件這邊，用 `v-slot="..."` 接住這個物件。因為它是物件，可以直接用第 2 章的解構拿出 `item`：

```vue,ignore
<ProductList :items="products" v-slot="{ item }">
  {{ item.name }}：<strong>{{ item.price }}</strong> 元
</ProductList>
```

`v-for` 跑三次，slot 就被用了三次，每次拿到的 `item` 都不一樣。

這種會把資料交出來的 slot，叫做**作用域 slot**（scoped slot）。你可以把它想成：子元件呼叫父元件給的一個函式，並且把 `item` 當引數傳進去，函式回傳的東西就畫在 `<slot>` 的位置。

只用到預設 slot 時，`v-slot` 可以直接寫在元件標籤上，像上面那樣。

### 具名的作用域 slot

slot props 和上一集的具名 slot 可以一起用。建立 `src/components/DataList.vue`，它有兩個 slot：`item` 會交出商品和它的索引，`empty` 在沒有資料時顯示：

```vue
<script setup>
const { items } = defineProps({ items: Array });
</script>

<template>
  <ol v-if="items.length > 0">
    <li v-for="(item, index) in items" :key="item.id">
      <slot name="item" :item="item" :index="index" />
    </li>
  </ol>
  <p v-else>
    <slot name="empty">沒有資料</slot>
  </p>
</template>
```

把 `src/App.vue` 換成下面這樣。用的時候，`#item` 後面接 `=`，再接解構：

```vue
<script setup>
import DataList from "./components/DataList.vue";

const products = [
  { id: 1, name: "鍵盤", price: 1200 },
  { id: 2, name: "滑鼠", price: 600 },
];
</script>

<template>
  <DataList :items="products">
    <template #item="{ item, index }">
      {{ index + 1 }}. {{ item.name }}
    </template>
    <template #empty>購物車是空的</template>
  </DataList>

  <DataList :items="[]">
    <template #empty>購物車是空的</template>
  </DataList>
</template>
```

第一個清單顯示「1. 鍵盤」「2. 滑鼠」，第二個因為陣列是空的，顯示「購物車是空的」。

`#item="{ item, index }"` 就是 `v-slot:item="{ item, index }"` 的簡寫。

### 預設 slot 和具名 slot 混著用

如果一個元件同時有預設的作用域 slot 和具名 slot，`v-slot` 就不能寫在元件標籤上，要每一個都用 `<template>` 包起來，預設的那個寫成 `#default`：

```vue,ignore
<MyTable :rows="rows">
  <template #default="{ row }">{{ row.name }}</template>
  <template #footer>共 {{ rows.length }} 筆</template>
</MyTable>
```

## 重點整理

- 子元件在 `<slot>` 上綁資料，例如 `<slot :item="item">`，這些資料叫 slot props。
- 父元件用 `v-slot="{ item }"` 或 `#名字="{ item }"` 接住，再決定怎麼畫。
- 作用域 slot 讓「資料在子元件、樣子由父元件決定」變成可能。
- 只有預設 slot 時，`v-slot` 可以寫在元件標籤上；混用具名 slot 時，每個都要用 `<template>` 包起來。
