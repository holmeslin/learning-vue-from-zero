# `v-bind`

## 本集目標

用 `v-bind`（簡寫 `:`）把資料放進 HTML 的屬性裡。

## 正文

### `{{ }}` 不能用在屬性上

上一集用 `{{ }}` 把資料放進標籤之間的文字。那如果想把資料放進**屬性**呢？例如連結的網址存在變數裡，直覺會這樣寫。把 `src/App.vue` 換成：

```vue
<script setup>
const docsUrl = "https://vuejs.org/";
</script>

<template>
  <a href="{{ docsUrl }}">Vue 官方網站</a>
</template>
```

畫面上連結是出現了，但點下去會跑到一個奇怪的網址。用第 3 章學過的方式檢查元素（在連結上按右鍵選「檢查」），會看到產生出來的 HTML 是：

```html
<a href="{{ docsUrl }}">Vue 官方網站</a>
```

`{{ }}` 原封不動地留在屬性裡，Vue 沒有幫你換掉。**`{{ }}` 只能用在文字的位置，不能用在屬性裡。**

### `v-bind`：把屬性綁到資料上

正確的寫法是把 `src/App.vue` 換成：

```vue
<script setup>
const docsUrl = "https://vuejs.org/";
</script>

<template>
  <a v-bind:href="docsUrl">Vue 官方網站</a>
</template>
```

這次產生的 HTML 是：

```html
<a href="https://vuejs.org/">Vue 官方網站</a>
```

`v-bind:href="docsUrl"` 的意思是：「`href` 這個屬性的值，用 `docsUrl` 算出來」。這種把屬性和資料連在一起的動作叫**綁定**（bind）。

注意引號裡的東西變了。一般的 HTML 屬性，引號裡是文字；加了 `v-bind:` 之後，引號裡是 **JavaScript 運算式**，和 `{{ }}` 裡能寫的東西一樣。所以 `docsUrl` 會被當成變數名稱，而不是「docsUrl」這幾個字。

`v-` 開頭的特殊屬性，在 Vue 裡叫做**指令**（directive）。`v-bind` 是你學到的第一個指令，接下來還會學 `v-if`、`v-show`、`v-for`。

### 簡寫：只寫一個冒號

`v-bind` 用得太頻繁了，所以 Vue 提供了簡寫：把 `v-bind` 拿掉，只留冒號。

```vue,ignore
<a v-bind:href="docsUrl">Vue 官方網站</a>
<a :href="docsUrl">Vue 官方網站</a>
```

這兩行完全一樣。實務上幾乎都用簡寫，這本書之後也一律寫 `:`。

### 引號裡是運算式

既然引號裡是運算式，就可以做計算、用三元運算子、用樣板字面值。把 `src/App.vue` 換成：

```vue
<script setup>
const product = { id: 7, name: "機械鍵盤", price: 1200 };
const imageSize = 120;
</script>

<template>
  <h2 :title="`售價 ${product.price} 元`">{{ product.name }}</h2>
  <a :href="'/products/' + product.id">看詳細資訊</a>
  <img
    src="/favicon.ico"
    :alt="product.name"
    :width="imageSize"
    :height="imageSize"
  />
</template>
```

- 滑鼠停在標題上，會跳出「售價 1200 元」的提示，這是 `title` 屬性的效果。
- 連結的網址是 `/products/7`。這裡用 `+` 把字串接起來，引號裡面的字串用單引號，原因上一集說過：外層的雙引號是 HTML 屬性的引號。
- `src="/favicon.ico"` 沒有冒號，是一般的屬性，值就是那串文字。只有需要用到資料的屬性才加冒號，兩種可以混著用。
- 屬性多的時候，可以像 `<img>` 這樣一個屬性一行，比較好讀。

### 布林屬性：`false` 的時候整個拿掉

有些 HTML 屬性只看「有沒有」，不看值，例如按鈕的 `disabled`（停用）。第 3 章學屬性時看過它。用 `:` 綁定布林值時，Vue 會幫你處理。把 `src/App.vue` 換成：

```vue
<script setup>
const isSoldOut = true;
</script>

<template>
  <button :disabled="isSoldOut">加入購物車</button>
</template>
```

`isSoldOut` 是 `true`，按鈕會變成灰色、按不下去。產生的 HTML 是：

```html
<button disabled="">加入購物車</button>
```

把 `isSoldOut` 改成 `false` 存檔，產生的 HTML 會變成：

```html
<button>加入購物車</button>
```

`disabled` 屬性整個消失，按鈕恢復正常。

### 同名時可以再省略

如果屬性名稱和變數名稱剛好一樣，例如變數就叫 `href`，`:href="href"` 可以再簡寫成 `:href`：

```vue
<script setup>
const href = "https://vuejs.org/";
</script>

<template>
  <a :href>Vue 官方網站</a>
</template>
```

這是 Vue 3.4 之後才有的寫法，你可能會在別人的程式碼裡看到。這本書為了清楚，還是會把值寫出來。

## 重點整理

- `{{ }}` 不能用在屬性裡；屬性要用資料，得用 `v-bind`。
- `v-bind:屬性="運算式"` 讓屬性的值由 JavaScript 算出來，簡寫是 `:屬性="運算式"`。
- 加了 `:` 之後，引號裡是運算式，字串要用單引號或樣板字面值。
- 綁定到 `disabled` 這類布林屬性時，值是 `false` 就整個拿掉屬性。
- `v-` 開頭的特殊屬性叫指令，`v-bind` 是第一個。
