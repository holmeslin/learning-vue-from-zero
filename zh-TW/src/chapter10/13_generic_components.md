# 泛型元件

## 本集目標

用 `<script setup lang="ts" generic="T">` 寫一個什麼資料都能顯示、型別又不會走丟的清單元件。

## 正文

### 一個什麼都能裝的清單

假設你要寫一個清單元件 `ItemList`：父元件傳一個陣列進來，它負責用 `v-for` 列出來，每一項要怎麼顯示，交給父元件用第 7 章的作用域 slot 決定。這個元件要能顯示商品、使用者、待辦事項……什麼都行。

問題是 `items` 的型別要寫什麼？寫成 `Product[]`，就只能顯示商品；寫成 `any[]`，型別檢查就沒了。這正是上一集泛型要解決的問題：讓使用的人決定型別。

### `generic="T"`

在 `<script setup>` 上加一個 `generic` 屬性，就能宣告型別參數，和上一集的 `function first<T>` 是同一件事。建立 `src/components/ItemList.vue`：

```vue
<script setup lang="ts" generic="T">
const { items } = defineProps<{
  items: T[];
}>();
</script>

<template>
  <ul>
    <li v-for="item in items" :key="item.id">
      <slot :item="item" />
    </li>
  </ul>
</template>
```

```text
src/components/ItemList.vue:9:42 - error TS2339: Property 'id' does not exist on type 'T'.

9     <li v-for="item in items" :key="item.id">
                                           ~~


Found 1 error.
```

`T` 可以是任何型別，可能是字串、可能是數字，不一定有 `id`。可是 `v-for` 需要 `key`，我們希望每一項都有 `id`。

### 用 `extends` 加上條件

`T extends { id: number }` 的意思是：「`T` 可以是任何型別，但一定要有一個數字的 `id`。」把 `ItemList.vue` 改成：

```vue
<script setup lang="ts" generic="T extends { id: number }">
const { items } = defineProps<{
  items: T[];
}>();

const emit = defineEmits<{
  select: [item: T];
}>();
</script>

<template>
  <ul>
    <li v-for="item in items" :key="item.id" @click="emit('select', item)">
      <slot :item="item" />
    </li>
  </ul>
</template>
```

順便加了一個 `select` 事件：點了哪一項，就把那一項傳出去。它的型別也是 `T`。

### 使用的時候，`T` 會自己推論出來

把 `src/App.vue` 換成：

```vue
<script setup lang="ts">
import ItemList from "./components/ItemList.vue";

type Product = {
  id: number;
  name: string;
  price: number;
};

const products: Product[] = [
  { id: 1, name: "鍵盤", price: 1200 },
  { id: 2, name: "滑鼠", price: 600 },
];

function handleSelect(product: Product) {
  console.log(`選了 ${product.name}`);
}
</script>

<template>
  <ItemList :items="products" @select="handleSelect">
    <template #default="{ item }">
      {{ item.name }}：{{ item.prise }} 元
    </template>
  </ItemList>
</template>
```

和泛型函式一樣，用的時候不用寫 `<Product>`。Vue 看到 `:items="products"`，就推論出 `T` 是 `Product`。所以：

- slot 裡的 `item` 是 `Product`，輸入 `item.` 會列出 `id`、`name`、`price`。
- `select` 事件傳出來的也是 `Product`，`handleSelect(product: Product)` 剛好對得上。

上面故意把 `price` 打成 `prise`：

```text
src/App.vue:23:31 - error TS2551: Property 'prise' does not exist on type 'Product'. Did you mean 'price'?

23       {{ item.name }}：{{ item.prise }} 元
                                 ~~~~~

  src/App.vue:7:3
    7   price: number;
        ~~~~~
    'price' is declared here.


Found 1 error.
```

TypeScript 不只抓到錯字，還問你「是不是要打 `price`」。改成 `item.price` 就好。

如果 `ItemList` 用 `any[]` 來寫，這個錯字就會一路漏到畫面上，變成「鍵盤： 元」。

### 不符合條件的會被擋下

傳一個沒有 `id` 的陣列，例如 `["小明", "小華"]`：

```vue
<script setup lang="ts">
import ItemList from "./components/ItemList.vue";

const names = ["小明", "小華"];
</script>

<template>
  <ItemList :items="names" />
</template>
```

```text
src/App.vue:8:14 - error TS2322: Type 'string[]' is not assignable to type '{ id: number; }[]'.
  Type 'string' is not assignable to type '{ id: number; }'.
（後面省略）
```

字串沒有 `id`，不符合 `T extends { id: number }` 的條件。

### 什麼時候需要泛型元件

大部分元件不需要。只有在「這個元件不在乎資料是什麼，只負責排版或流程」的時候才用得到，例如清單、表格、下拉選單、分頁。這些元件通常在大一點的專案或元件函式庫裡才會自己寫，但你會在別人的程式碼裡看到 `generic="T"`，現在你看得懂它了。

## 重點整理

- `<script setup lang="ts" generic="T">` 宣告元件的型別參數。
- `T extends { id: number }` 限制 `T` 一定要有某些屬性，元件裡才能用它們。
- props、emit、作用域 slot 都能用 `T`，型別會一路傳到父元件。
- 使用泛型元件時不用寫型別，Vue 會從傳進去的 props 推論 `T`。
