# 用 `mount` 渲染元件

## 本集目標

在測試裡把元件掛載起來，檢查它渲染出來的文字。

## 正文

### 要測的元件

建立 `src/components/ProductCard.vue`，一張商品卡片：

```vue
<!-- src/components/ProductCard.vue -->
<script setup lang="ts">
import { formatPrice } from "../utils/price";

defineProps<{
  name: string;
  price: number;
  soldOut?: boolean;
}>();
</script>

<template>
  <article class="card">
    <h2>{{ name }}</h2>
    <p class="price">{{ formatPrice(price) }}</p>
    <p v-if="soldOut" class="sold-out">已售完</p>
  </article>
</template>
```

它接收三個 props：商品名稱、價格、是否售完。價格用上一集的 `formatPrice` 加上千分位。

### 用 `mount` 掛載

建立 `src/components/__tests__/ProductCard.spec.ts`：

```ts
// src/components/__tests__/ProductCard.spec.ts
import { expect, test } from "vitest";
import { mount } from "@vue/test-utils";
import ProductCard from "../ProductCard.vue";

test("顯示商品名稱與價格", () => {
  const wrapper = mount(ProductCard, {
    props: { name: "機械鍵盤", price: 2490 },
  });

  console.log(wrapper.html());

  expect(wrapper.text()).toContain("機械鍵盤");
  expect(wrapper.text()).toContain("NT$ 2,490");
});
```

- `import { mount } from "@vue/test-utils"`：`mount` 來自 Vue Test Utils。
- `mount(ProductCard, { props: { ... } })`：把 `ProductCard` 掛載起來。第 4 章看過 `main.js` 用 `createApp(App).mount("#app")` 把整個網站掛到網頁上（TypeScript 專案裡這個檔案叫 `main.ts`），`mount` 做的是類似的事，只是掛在 jsdom 的假網頁裡，而且只掛這一個元件。第二個參數的 `props` 就是你在模板裡寫 `<ProductCard name="機械鍵盤" :price="2490" />` 時傳的東西。
- `mount` 回傳一個 **wrapper**（包裝物件），它把掛載好的元件包起來，提供一堆方便測試的方法。習慣上變數就叫 `wrapper`。
- `wrapper.text()`：元件渲染出來的所有文字，HTML 標籤都去掉。
- `wrapper.html()`：元件渲染出來的 HTML，用來看「畫面到底長什麼樣子」。

`toContain` 上一集用在陣列上，用在字串上就是「有沒有包含這段文字」。

### 執行

```bash
npx vitest run src/components/__tests__/ProductCard.spec.ts
```

```text
 RUN  v4.1.11 /你的路徑/vue-testing

stdout | src/components/__tests__/ProductCard.spec.ts > 顯示商品名稱與價格
<article class="card">
  <h2>機械鍵盤</h2>
  <p class="price">NT$ 2,490</p>
  <!--v-if-->
</article>

 ✓ src/components/__tests__/ProductCard.spec.ts (1 test) 18ms
   ✓ 顯示商品名稱與價格 18ms

 Test Files  1 passed (1)
      Tests  1 passed (1)
```

`stdout` 那一段就是 `console.log` 印出來的東西，前面會標出是哪個測試印的。可以看到：

- `name` 和 `price` 都正確渲染了，價格也有千分位。
- 沒有傳 `soldOut`，所以「已售完」那一行沒有出現，原本的位置留下一個 `<!--v-if-->`。這是 HTML 的註解，Vue 用它記住「`v-if` 的東西之後可能會出現在這裡」，畫面上看不到。

測試寫不出來、或是失敗了看不懂時，先 `console.log(wrapper.html())` 看一下畫面，通常就知道問題在哪。看完記得把這一行刪掉，不然每次跑測試都會印一大段。

### 為什麼檢查文字

這個測試檢查的是「畫面上看得到的文字」，而不是去讀元件內部的變數。這就是這一章開頭說的：**測使用者看得到的結果**。

假設之後你把 `formatPrice` 換成別的寫法，或是把 `<h2>` 改成 `<h3>`，只要畫面上還是「機械鍵盤」和「NT$ 2,490」，這個測試就不用改。測試只在「使用者看到的東西真的變了」的時候失敗，這才是你想知道的。

## 重點整理

- `mount(元件, { props: { ... } })` 在 jsdom 裡掛載一個元件，回傳 wrapper。
- `wrapper.text()` 拿到渲染出來的文字，`wrapper.html()` 拿到 HTML。
- 看不懂測試結果時，先 `console.log(wrapper.html())` 看畫面。
- 測試檢查畫面上的結果，不要去讀元件內部的變數。
