# `defineProps` 的型別

## 本集目標

用 `defineProps<{ ... }>()` 說明元件要收哪些 props，並用解構給選填的 props 預設值。

## 正文

### 把 props 寫成型別

建立 `src/components/UserCard.vue`：

```vue
<script setup lang="ts">
const { name, age = 18 } = defineProps<{
  name: string;
  age?: number;
}>();
</script>

<template>
  <p>{{ name }}，{{ age }} 歲</p>
</template>
```

和 JavaScript 版比起來，`defineProps` 後面多了一對角括號 `<>`，裡面放的就是第 5 集學的物件型別：

- `name: string`：必填，字串。
- `age?: number`：選填（有 `?`），數字。

角括號的寫法叫**泛型**，第 12 集會解釋。現在先記住：「`defineProps` 後面的角括號裡，放 props 的型別」。

小括號裡什麼都不用放，props 的資訊全部寫在型別裡。

### 預設值照第 7 章的寫法

`age = 18` 是第 7 章學過的解構預設值：父元件沒傳 `age` 時，`age` 就是 `18`。TypeScript 也看得懂這個寫法，所以在元件裡，`age` 的型別是 `number`，不會是 `number | undefined`。

你在網路上可能會看到另一種寫法 `withDefaults(defineProps<...>(), { age: 18 })`。那是 Vue 3.5 以前的做法，效果一樣，現在用解構就好。

### 父元件傳錯會被抓到

把 `src/App.vue` 換成：

```vue
<script setup lang="ts">
import UserCard from "./components/UserCard.vue";
</script>

<template>
  <UserCard :age="20" />
  <UserCard name="小華" age="20" />
</template>
```

兩個 `UserCard` 都傳錯了。執行 `npm run type-check`：

```text
src/App.vue:6:4 - error TS2345: Argument of type '{ age: number; }' is not assignable to parameter of type '{ readonly name: string; readonly age?: number | undefined; } & VNodeProps & AllowedComponentProps & ComponentCustomProps & Record<...>'.
  Property 'name' is missing in type '{ age: number; }' but required in type '{ readonly name: string; readonly age?: number | undefined; }'.

6   <UserCard :age="20" />
     ~~~~~~~~

  src/components/UserCard.vue:3:3
    3   name: string;
        ~~~~
    'name' is declared here.

src/App.vue:7:23 - error TS2322: Type 'string' is not assignable to type 'number'.

7   <UserCard name="小華" age="20" />
                        ~~~

（後面省略）

Found 2 errors.
```

錯誤訊息很長，別被嚇到，找關鍵的那一句就好：

- 第一個錯誤：第二行說 `Property 'name' is missing`，必填的 `name` 沒有傳。第一行那串 `VNodeProps & ...` 是 Vue 內部加上去的東西，可以跳過。
- 第二個錯誤：`age="20"` 沒有冒號，傳進去的是字串 `"20"`，不是數字。要寫成 `:age="20"` 才對。

第二個錯誤在 JavaScript 裡很常見：少了冒號，畫面看起來一樣是「20 歲」，但你拿 `age` 去做加法時就會變成接字串。TypeScript 連模板裡的這種小地方都會檢查。

順便看一下 `readonly name: string`：props 是唯讀的，就是第 5 集講的 `readonly`。

把 `App.vue` 改對：

```vue
<script setup lang="ts">
import UserCard from "./components/UserCard.vue";
</script>

<template>
  <UserCard name="小明" :age="20" />
  <UserCard name="小華" />
</template>
```

輸入 `<UserCard ` 的時候，編輯器也會把 `name`、`age` 列出來讓你選。

### props 很多時，先取個名字

props 是物件、或數量比較多的時候，可以先用 `type` 定義好，再放進角括號。建立 `src/components/ProductCard.vue`：

```vue
<script setup lang="ts">
type Product = {
  id: number;
  name: string;
  price: number;
};

type Props = {
  product: Product;
  showPrice?: boolean;
};

const { product, showPrice = true } = defineProps<Props>();
</script>

<template>
  <h2>{{ product.name }}</h2>
  <p v-if="showPrice">{{ product.price }} 元</p>
</template>
```

`type Props` 是習慣的名字，表示「這個元件的 props」。父元件這樣用：

```vue
<script setup lang="ts">
import ProductCard from "./components/ProductCard.vue";
</script>

<template>
  <ProductCard :product="{ id: 1, name: '鍵盤', price: 1200 }" />
</template>
```

`product` 少了 `price`、或是 `price` 寫成字串，都會被擋下來。在模板裡輸入 `product.` 時，也會有自動完成。

### JavaScript 的寫法還能用嗎

能。像 `defineProps({ name: String })` 這種把型別寫在小括號裡的寫法，在 TypeScript 裡一樣有效，Vue 也會從裡面推論出型別。但它能表達的東西比較少（例如很難寫出 `Product` 這種物件的形狀），所以用 TypeScript 時，一律用角括號的寫法。兩種寫法不能混在一起用。

## 重點整理

- `defineProps<{ name: string; age?: number }>()` 用型別描述 props，`?` 表示選填。
- 選填的 props 用解構給預設值：`const { age = 18 } = defineProps<...>()`。
- 父元件少傳、傳錯型別，`vue-tsc` 都會在模板裡抓出來。
- props 很多或有物件時，先寫 `type Props = { ... }`，再用 `defineProps<Props>()`。
- 長長的錯誤訊息，找 `is missing`、`is not assignable to` 這種關鍵句就好。
