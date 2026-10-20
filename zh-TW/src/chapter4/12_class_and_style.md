# class 與 style 綁定

## 本集目標

依照資料，決定元素要套用哪些 class 和行內樣式。

## 正文

### 依條件加上 class

第 3 章學過，CSS 主要靠 class 套用樣式。畫面常常需要「依照資料決定要不要套某個 class」，例如售完的商品變灰。把 `src/App.vue` 換成：

```vue
<script setup>
const inStock = false;
</script>

<template>
  <p :class="{ 'sold-out': !inStock }">無線滑鼠</p>
</template>

<style>
.sold-out {
  color: gray;
  text-decoration: line-through;
}
</style>
```

「無線滑鼠」變成灰色，還加上一條刪除線。產生的 HTML 是：

```html
<p class="sold-out">無線滑鼠</p>
```

把 `inStock` 改成 `true` 存檔，產生的 HTML 會變成 `<p class="">無線滑鼠</p>`，class 被拿掉，文字恢復正常。

`:class` 就是第 5 集的 `v-bind`，只是 Vue 對 `class` 特別多做了一點：你可以給它一個**物件**。物件的每個屬性名稱是一個 class，值是條件：

- 條件是 `true`，就加上這個 class。
- 條件是 `false`，就不加。

`'sold-out'` 用了引號，因為名稱裡有連字號 `-`。物件的屬性名稱平常不用加引號，像 `name`、`price` 那樣；但名稱裡有連字號時，JavaScript 會把 `-` 當成減號，所以一定要加引號。這裡外層已經是雙引號，所以用單引號。

### 好幾個 class

物件裡可以放好幾個 class，各自有各自的條件。也可以和一般的 `class` 同時寫，Vue 會把它們合在一起。把 `src/App.vue` 換成：

```vue
<script setup>
const product = { name: "機械鍵盤", inStock: true, isNew: true };
</script>

<template>
  <div
    class="product"
    :class="{ 'sold-out': !product.inStock, new: product.isNew }"
  >
    {{ product.name }}
  </div>
</template>

<style>
.product {
  padding: 0.5rem;
  border: 1px solid #ccc;
}

.sold-out {
  color: gray;
  text-decoration: line-through;
}

.new {
  border-color: #42b883;
  font-weight: bold;
}
</style>
```

產生的 HTML 是：

```html
<div class="product new">機械鍵盤</div>
```

`class="product"` 一定會有；`:class` 裡只有 `new` 的條件成立，所以加上 `new`，沒有 `sold-out`。

### 二選一：三元運算子

如果不是「加或不加」，而是「兩個 class 選一個」，在 `:class` 裡用三元運算子最直接。把 `src/App.vue` 換成：

```vue
<script setup>
const stock = 0;
</script>

<template>
  <p :class="stock > 0 ? 'in-stock' : 'sold-out'">
    {{ stock > 0 ? '有現貨' : '已售完' }}
  </p>
</template>

<style>
.in-stock {
  color: green;
}

.sold-out {
  color: gray;
}
</style>
```

三元運算子算出來的是一個字串，`:class` 收到字串就把它當成 class 名稱。

`:class` 也可以收一個**陣列**，陣列裡每一項都是一個 class，例如 `:class="['product', sizeClass]"`。物件、字串、陣列三種寫法可以依情況挑順手的。

### 綁定行內樣式：`:style`

有時候樣式的值本身就是資料，例如進度條的寬度、使用者選的顏色。這時用 `:style`，給它一個物件，屬性名稱是 CSS 屬性，值是 CSS 的值。把 `src/App.vue` 換成：

```vue
<script setup>
const brandColor = "#42b883";
const progress = 70;
</script>

<template>
  <h2 :style="{ color: brandColor, fontSize: '2rem' }">本月目標</h2>
  <div class="bar">
    <div class="bar-fill" :style="{ width: progress + '%' }"></div>
  </div>
  <p>已完成 {{ progress }}%</p>
</template>

<style>
.bar {
  height: 1rem;
  background: #eee;
}

.bar-fill {
  height: 100%;
  background: #42b883;
}
</style>
```

標題是綠色、比較大的字；下面的進度條填滿了七成。

幾個要注意的地方：

- CSS 屬性 `font-size` 在物件裡寫成 camelCase 的 `fontSize`，原因和上面的 `'sold-out'` 一樣：不加引號的屬性名稱不能有連字號。你也可以加引號寫成 `'font-size'`，結果一樣。
- **單位要自己加**。`progress` 是數字 `70`，`width` 需要的是 `70%`，所以寫成 `progress + '%'`，算出字串 `"70%"`。忘了加單位，樣式就不會生效。
- 固定的值（例如 `'2rem'`）是字串，要加引號。

### class 還是 style？

**優先用 class。** 樣式寫在 `<style>` 裡比較好整理，也比較好重複使用。`:style` 留給「值本身就是資料、沒辦法事先寫好 class」的情況，像上面的進度條寬度。

## 重點整理

- `:class="{ 名稱: 條件 }"`：條件成立就加上那個 class，可以一次寫好幾個。
- 一般的 `class` 和 `:class` 可以同時寫，Vue 會把它們合在一起。
- 二選一時，在 `:class` 裡用三元運算子算出 class 名稱。
- `:style` 收一個物件，CSS 屬性用 camelCase，數字要自己加上單位。
- 優先用 class；`:style` 留給值本身就是資料的情況。
