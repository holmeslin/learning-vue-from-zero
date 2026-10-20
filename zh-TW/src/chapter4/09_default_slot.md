# 預設 slot

## 本集目標

用 `<slot>` 讓元件包住別人放進來的內容，做出可以重複使用的「外框」元件。

## 正文

### props 不好傳的東西

props 很適合傳一個名稱、一個價格這種單純的資料。但有時候你想傳的是「一整塊畫面」。

例如網站上常見的提示框：外面一個有邊框的盒子，裡面的內容每次都不一樣，有時是一行字，有時是一段粗體加連結，有時甚至是一張商品卡片。把這些內容塞進 props 的字串裡，既難寫又不能放 HTML（第 4 集說過，`{{ }}` 只顯示文字）。

這時候要用的是 **slot**。

### 留一個位置給別人填

建立 `src/components/NoticeBox.vue`：

```vue
<template>
  <div class="notice-box">
    <slot />
  </div>
</template>

<style>
.notice-box {
  border: 2px solid #42b883;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  margin: 1rem 0;
}
</style>
```

把 `src/App.vue` 換成：

```vue
<script setup>
import NoticeBox from "./components/NoticeBox.vue";
</script>

<template>
  <NoticeBox>本週六公休一天。</NoticeBox>
  <NoticeBox>
    <strong>滿千免運！</strong>
    <a href="https://vuejs.org/">看活動說明</a>
  </NoticeBox>
</template>
```

畫面上出現兩個綠框，第一個裡面是一行字，第二個裡面是粗體字加一個連結。

注意這次使用 `NoticeBox` 的方式：不是 `<NoticeBox />`，而是 `<NoticeBox>...</NoticeBox>`，有開始標籤和結束標籤，中間放內容，就像 HTML 的 `<div>` 一樣。

在 `NoticeBox.vue` 裡，`<slot />` 的意思是「把使用我的人放在我標籤中間的內容，放在這裡」。slot 是「插槽」的意思：元件留了一個位置，讓使用它的人把內容插進來。

`NoticeBox` 只負責外框的樣子，裡面放什麼由使用它的人決定。這種元件很好重複使用，整個網站的提示框都長得一樣，內容各自不同。

### 什麼都能放進去，包括元件

slot 裡可以放任何模板內容，包括其他元件。把上一集最後的 `ProductCard` 放進去，把 `src/App.vue` 換成：

```vue
<script setup>
import NoticeBox from "./components/NoticeBox.vue";
import ProductCard from "./components/ProductCard.vue";

const productName = "機械鍵盤";
</script>

<template>
  <NoticeBox>
    <p>今日特價：{{ productName }}</p>
    <ProductCard :name="productName" :price="999" isNew />
  </NoticeBox>
</template>
```

注意 `{{ productName }}`：放進 slot 的內容，是在 `App.vue` 裡寫的，所以它讀的是 `App.vue` 的變數。`NoticeBox` 只是把這塊內容擺到自己的 `<slot />` 那個位置，它看不到也不需要知道 `productName`。

### 沒放東西時的預設內容

如果使用的人什麼都沒放，`<slot />` 那裡就是空的。你可以在 `<slot>` 和 `</slot>` 中間寫預設內容。把 `src/components/NoticeBox.vue` 換成：

```vue
<template>
  <div class="notice-box">
    <slot>目前沒有公告。</slot>
  </div>
</template>

<style>
.notice-box {
  border: 2px solid #42b883;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  margin: 1rem 0;
}
</style>
```

把 `src/App.vue` 換成：

```vue
<script setup>
import NoticeBox from "./components/NoticeBox.vue";
</script>

<template>
  <NoticeBox />
  <NoticeBox>本週六公休一天。</NoticeBox>
</template>
```

第一個框裡顯示「目前沒有公告。」，第二個框顯示「本週六公休一天。」。有放內容，就用放進來的；沒放，才顯示預設內容。

### props 和 slot 一起用

props 和 slot 可以同時用。例如提示框加一個標題，標題是單純的文字，用 props；內容是一整塊畫面，用 slot。把 `src/components/NoticeBox.vue` 換成：

```vue
<script setup>
defineProps({
  title: String,
});
</script>

<template>
  <div class="notice-box">
    <h3>{{ title }}</h3>
    <slot>目前沒有公告。</slot>
  </div>
</template>

<style>
.notice-box {
  border: 2px solid #42b883;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  margin: 1rem 0;
}
</style>
```

把 `src/App.vue` 換成：

```vue
<script setup>
import NoticeBox from "./components/NoticeBox.vue";
</script>

<template>
  <NoticeBox title="營業時間異動">
    <p>本週六公休一天，週日照常營業。</p>
  </NoticeBox>
</template>
```

怎麼選？**單純的值（字串、數字、布林值）用 props；一整塊有標籤、有排版的畫面用 slot。**

這一集學的是一個元件只有一個 slot 的情況，叫做**預設 slot**（default slot）。一個元件需要好幾個位置讓人填，例如「標題區」和「內容區」都想讓使用者自己放畫面，要用具名 slot，第 7 章會教。

## 重點整理

- 元件裡的 `<slot />` 是一個位置，使用元件時寫在標籤中間的內容會放到那裡。
- slot 裡可以放文字、HTML 標籤，也可以放其他元件。
- 放進 slot 的內容讀的是使用者那一邊（父元件）的變數。
- `<slot>` 和 `</slot>` 中間可以寫沒放內容時的預設內容。
- 單純的值用 props，一整塊畫面用 slot。
