# props 的型別、必填與預設值

## 本集目標

用物件寫法的 `defineProps` 幫 props 加上型別、必填和預設值，讓 Vue 幫你抓出傳錯的資料。

## 正文

### 傳錯了，Vue 也不會說

上一集說過，`:price="1200"` 傳的是數字，`price="1200"` 傳的是字串。試著把 `src/App.vue` 裡第一張卡片的冒號拿掉：

```vue
<script setup>
import ProductCard from "./components/ProductCard.vue";
</script>

<template>
  <ProductCard name="機械鍵盤" price="1200" />
  <ProductCard name="無線滑鼠" :price="600" />
</template>
```

畫面看起來完全一樣，主控台也沒有任何訊息。可是 `price` 現在是字串，如果 `ProductCard` 之後要拿它做計算，例如運費加 100 元寫成 `{{ price + 100 }}`，字串加數字會變成把文字接起來，畫面上出現「1200100」，而且你很難發現問題出在哪裡。

問題在於，`defineProps(["name", "price"])` 只告訴 Vue「我會收這兩個名字」，沒說它們**應該是什麼型別**，所以 Vue 沒辦法幫你檢查。

### 物件寫法：加上型別

把 `src/components/ProductCard.vue` 換成：

```vue
<script setup>
defineProps({
  name: String,
  price: Number,
});
</script>

<template>
  <div>
    <h2>{{ name }}</h2>
    <p>{{ price }} 元</p>
  </div>
</template>
```

這次 `defineProps` 收的不是陣列，而是一個**物件**：屬性名稱是 props 的名字，值是它的**型別**。常用的型別有：

- `String`：字串
- `Number`：數字
- `Boolean`：布林值
- `Array`：陣列
- `Object`：物件

存檔後，主控台出現了警告：

```text
[Vue warn]: Invalid prop: type check failed for prop "price".
Expected Number with value 1200, got String with value "1200".
```

（實際上是同一行，為了排版拆成兩行。）意思是「`price` 的型別檢查沒通過：應該是數字 1200，收到的卻是字串 `"1200"`」。這就是宣告型別的好處：傳錯了，Vue 會提醒你。

把 `App.vue` 裡的冒號加回去，警告就會消失。

陣列寫法比較短，適合快速試做；物件寫法多了檢查，正式的元件建議用物件寫法。之後的章節兩種都會看到。

### 必填的 props

如果忘了傳 `name`，卡片的標題會是空的，而且沒有任何提示。對一張商品卡片來說，沒有名稱是不合理的，可以把它設成**必填**。把 `src/components/ProductCard.vue` 換成：

```vue
<script setup>
defineProps({
  name: { type: String, required: true },
  price: Number,
});
</script>

<template>
  <div>
    <h2>{{ name }}</h2>
    <p>{{ price }} 元</p>
  </div>
</template>
```

`name` 的值從單純的 `String`，變成一個物件：`type` 是型別，`required: true` 表示必填。這時如果寫 `<ProductCard :price="1200" />` 沒傳 `name`，主控台會出現：

```text
[Vue warn]: Missing required prop: "name"
```

這些警告只會出現在開發時的主控台，不會讓畫面壞掉，但它們幾乎都代表你的程式有地方寫錯了，看到就要去修。

### 預設值

有些 props 不一定要傳，沒傳的時候用一個合理的值就好。例如價格沒傳，就當成 0 元。把 `src/components/ProductCard.vue` 換成：

```vue
<script setup>
defineProps({
  name: { type: String, required: true },
  price: { type: Number, default: 0 },
});
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
  <ProductCard name="試用品" />
</template>
```

```text
機械鍵盤
1200 元
試用品
0 元
```

第二張卡片沒有傳 `price`，就用了 `default` 的 `0`。有傳的時候，當然還是用傳進來的值。

一個 props 通常是 `required` 和 `default` 二選一：要嘛一定要傳，要嘛沒傳時有預設值。第 7 章還會介紹另一種寫預設值的方式。

### 布林值的 props

布林值的 props 有一個方便的寫法。把 `src/components/ProductCard.vue` 換成：

```vue
<script setup>
defineProps({
  name: { type: String, required: true },
  price: { type: Number, default: 0 },
  isNew: Boolean,
});
</script>

<template>
  <div>
    <h2>{{ name }}{{ isNew ? '（新品）' : '' }}</h2>
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
  <ProductCard name="機械鍵盤" :price="1200" isNew />
  <ProductCard name="無線滑鼠" :price="600" />
</template>
```

第一張卡片的標題後面多了「（新品）」，第二張沒有。

宣告成 `Boolean` 的 props，只寫名字不寫值（`isNew`），就等於傳了 `true`，就像 HTML 的 `disabled` 一樣；完全沒寫，就是 `false`，不用另外設預設值。當然，你也可以寫完整的 `:isNew="true"`。

### props 名稱的寫法

props 宣告時用 camelCase（`isNew`），這是 JavaScript 變數的命名習慣。在模板裡傳的時候，寫 `isNew` 或 HTML 習慣的 kebab-case `is-new` 都可以，Vue 會自動對應。你在 Vue 官方文件裡會常看到 kebab-case 的寫法；這本書為了讓你一眼看出是同一個 props，傳的時候也寫 camelCase。

這一集最後的 `ProductCard.vue` 後面幾集還會用到，請保留它。

## 重點整理

- `defineProps` 的物件寫法可以替每個 props 宣告型別，傳錯型別時主控台會出現警告。
- `{ type: String, required: true }` 表示必填，漏傳會有警告。
- `{ type: Number, default: 0 }` 表示沒傳時用預設值。
- `Boolean` 型別的 props 只寫名字就是 `true`，沒寫就是 `false`。
- 陣列寫法簡短，物件寫法多了檢查；正式的元件建議用物件寫法。
