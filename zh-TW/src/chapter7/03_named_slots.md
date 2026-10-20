# 具名 slot

## 本集目標

讓一個元件開好幾個 slot，用名字分辨要把內容塞到哪一個，並且在沒給內容時顯示預設的東西。

## 正文

### 先看範例

建立 `src/components/BaseCard.vue`，一張分成標題、內容、頁尾三塊的卡片：

```vue
<template>
  <section class="card">
    <header>
      <slot name="header">（沒有標題）</slot>
    </header>
    <div class="body">
      <slot />
    </div>
    <footer v-if="$slots.footer">
      <slot name="footer" />
    </footer>
  </section>
</template>

<style scoped>
.card {
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 12px;
}
header {
  font-weight: bold;
  padding: 8px;
  background: #f3f3f3;
}
.body,
footer {
  padding: 8px;
}
footer {
  border-top: 1px solid #ccc;
}
</style>
```

把 `src/App.vue` 換成下面這樣，用了兩次卡片：

```vue
<script setup>
import BaseCard from "./components/BaseCard.vue";
</script>

<template>
  <BaseCard>
    <template #header>今日待辦</template>

    <ul>
      <li>買牛奶</li>
      <li>繳電話費</li>
    </ul>

    <template #footer>
      <button>全部完成</button>
    </template>
  </BaseCard>

  <BaseCard>
    <p>這張卡片只給了內容。</p>
  </BaseCard>
</template>
```

第一張卡片有標題「今日待辦」、一個清單、頁尾一個按鈕。第二張卡片的標題顯示「（沒有標題）」，而且沒有頁尾那一條線。

### 一個 slot 不夠用

第 4 章的預設 slot，是在元件裡放一個 `<slot />`，用的人把內容寫在元件標籤中間，內容就會出現在 `<slot />` 的位置。

可是卡片有三個地方要讓別人填。只有一個 `<slot />`，Vue 不知道哪段內容要放哪裡。解法是幫 slot 取名字：

- 在元件裡：`<slot name="header" />`，這個 slot 叫 `header`。
- 在用的地方：`<template #header>...</template>`，這段內容要放進叫 `header` 的 slot。

沒取名字的 `<slot />` 還是在，它的名字其實是 `default`。沒有包在任何 `<template #...>` 裡的內容，像範例裡的 `<ul>`，都會進到 `default`。

### `#header` 是 `v-slot:header` 的簡寫

`#header` 的完整寫法是 `v-slot:header`：

```vue,ignore
<template v-slot:header>今日待辦</template>
```

就像 `@click` 是 `v-on:click` 的簡寫、`:title` 是 `v-bind:title` 的簡寫。平常都用 `#`。

`#header` 一定要寫在 `<template>` 上。`<template>` 本身不會出現在畫面上，它只是用來把一段內容包起來、標上名字。

預設 slot 的內容也可以明確寫出來，效果一樣：

```vue,ignore
<BaseCard>
  <template #header>今日待辦</template>
  <template #default>
    <p>這是內容。</p>
  </template>
</BaseCard>
```

### 預設內容

`<slot name="header">（沒有標題）</slot>` 中間的文字是**預設內容**（fallback content）。用的人沒有給 `header` 的內容時，就顯示它；有給，就換成用的人給的。第二張卡片沒寫 `#header`，所以標題是「（沒有標題）」。

### 沒給內容就整塊不要：`$slots`

頁尾的寫法不太一樣：

```vue,ignore
<footer v-if="$slots.footer">
  <slot name="footer" />
</footer>
```

`$slots` 是模板裡可以直接用的物件，用的人有給哪些 slot，裡面就有哪些名字。沒給 `#footer`，`$slots.footer` 就是 `undefined`，`v-if` 不成立，整個 `<footer>` 連同上面那條線都不會出現。

如果不加 `v-if`，第二張卡片底下會多一個空的 `<footer>`，留下一條孤零零的線。

## 重點整理

- `<slot name="header" />` 開一個有名字的 slot，用的時候寫 `<template #header>`。
- `#header` 是 `v-slot:header` 的簡寫，要寫在 `<template>` 上。
- 沒包在 `<template #...>` 裡的內容會進到預設 slot，它的名字是 `default`。
- `<slot>` 中間寫的東西是預設內容，用的人沒給時才顯示。
- `$slots.名字` 可以檢查用的人有沒有給某個 slot。
