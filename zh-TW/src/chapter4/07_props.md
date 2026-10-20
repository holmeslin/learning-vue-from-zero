# props

## 本集目標

用 `defineProps` 讓元件接收資料，同一個元件就能顯示不同的內容。

## 正文

### 一樣的元件，不一樣的內容

上一集的 `AppHeader` 用兩次，畫面上就是兩個一模一樣的標題。可是實際的網站裡，「商品卡片」這種元件會用很多次，每一張的商品名稱和價格都不同。元件需要一種方式，讓使用它的人把資料**傳進去**。

建立 `src/components/ProductCard.vue`：

```vue
<script setup>
defineProps(["name", "price"]);
</script>

<template>
  <div>
    <h2>{{ name }}</h2>
    <p>{{ price }} 元</p>
  </div>
</template>
```

把 `src/App.vue` 換成：

```vue
<script setup>
import ProductCard from "./components/ProductCard.vue";
</script>

<template>
  <ProductCard name="機械鍵盤" :price="1200" />
  <ProductCard name="無線滑鼠" :price="600" />
</template>
```

畫面上出現兩張卡片，一張是機械鍵盤 1200 元，一張是無線滑鼠 600 元。同一個 `ProductCard`，顯示了不同的內容。

### 拆開來看

**傳的那一邊**（`App.vue`）：在元件標籤上寫屬性，就像 HTML 屬性一樣。`name="機械鍵盤"` 就是把「機械鍵盤」這個字串交給 `ProductCard`。

**收的那一邊**（`ProductCard.vue`）：用 `defineProps` 宣告「我會收哪些資料」。傳進來的資料叫做 **props**（property 的縮寫）。`defineProps(["name", "price"])` 的意思是「我會收兩個 props，名字叫 `name` 和 `price`」。宣告過的 props 在模板裡可以像變數一樣直接用，`{{ name }}` 就會顯示傳進來的名稱。

注意 `defineProps` 不用 `import`。它是 Vue 在處理 `.vue` 檔時才認得的特殊寫法，只能在 `<script setup>` 裡用，直接寫就好。

資料的方向是**由上往下**：父元件（`App`）把資料傳給子元件（`ProductCard`）。子元件只能讀 props，不能改它。如果子元件想改資料怎麼辦？那是第 5 章的內容。

### 字串用一般屬性，其他用 `:`

為什麼 `name` 沒有冒號，`price` 卻有？

回想第 5 集：沒有冒號的屬性，引號裡就是文字；加了冒號，引號裡是 JavaScript 運算式。所以：

- `name="機械鍵盤"` → 傳的是字串「機械鍵盤」。
- `:price="1200"` → 引號裡的 `1200` 是運算式，算出來是**數字** 1200。
- `price="1200"` → 傳的是**字串**「1200」，不是數字。

規則很簡單：**傳字串可以不加冒號，傳數字、布林值、陣列、物件、變數，都要加冒號。**

### 傳變數

資料通常不是直接寫在標籤上，而是放在變數裡。把 `src/App.vue` 換成：

```vue
<script setup>
import ProductCard from "./components/ProductCard.vue";

const keyboard = { name: "機械鍵盤", price: 1200 };
const mouse = { name: "無線滑鼠", price: 600 };
</script>

<template>
  <ProductCard :name="keyboard.name" :price="keyboard.price" />
  <ProductCard :name="mouse.name" :price="mouse.price" />
</template>
```

這次 `name` 也要加冒號，因為傳的是 `keyboard.name` 這個運算式算出來的值，而不是「keyboard.name」這幾個字。

### 在 `<script setup>` 裡讀 props

在模板裡可以直接寫 `name`。如果要在 `<script setup>` 的程式碼裡讀 props，要先把 `defineProps` 的回傳值存起來：

```vue
<script setup>
const props = defineProps(["name", "price"]);

console.log(props.name);
</script>

<template>
  <h2>{{ name }}</h2>
</template>
```

`props` 是一個物件，裡面裝著所有傳進來的 props，用 `props.name` 讀。這一章的範例幾乎都只在模板裡用 props，知道有這個寫法就好。

## 重點整理

- props 是父元件傳給子元件的資料，子元件用 `defineProps` 宣告要收哪些。
- `defineProps(["name", "price"])` 用陣列列出 props 的名字；`defineProps` 不用 `import`。
- 傳字串可以不加冒號；數字、布林值、陣列、物件、變數都要用 `:`。
- 在 `<script setup>` 裡要讀 props，先用 `const props = defineProps(...)` 存起來。
- 子元件只能讀 props，不能改它。
