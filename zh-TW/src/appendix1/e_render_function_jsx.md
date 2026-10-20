# render function 與 JSX

## 本集目標

知道模板背後其實是 render function，看得懂用 `h()` 或 JSX 寫的 Vue 元件。

## 正文

### 模板會被翻譯成什麼

你寫的 `<template>`，瀏覽器其實看不懂。建置的時候，Vue 會把模板翻譯成一個 JavaScript 函式，這個函式每次執行都會回傳「畫面應該長什麼樣子」的描述。這個函式叫做 **render function**（渲染函式）。

模板是給人寫的，render function 是給 Vue 執行的。平常你只要寫模板，Vue 會幫你翻譯。但你也可以跳過模板，自己直接寫 render function。

大部分時候你不需要這麼做。這一集的目的是讓你在函式庫的原始碼或別人的專案裡看到它時，知道那是什麼。

這一集用 JavaScript，沿用「看懂 Options API」那一集建立的 `appendix-js` 專案。如果還沒建：

```bash
npm create vue@latest -- appendix-js --jsx
cd appendix-js
npm install
```

### `h()`：用函式描述一個元素

新增 `src/components/HCounter.js`，注意副檔名是 `.js`，不是 `.vue`：

```js
import { defineComponent, h, ref } from "vue";

export default defineComponent(() => {
  const count = ref(0);

  return () =>
    h("button", { onClick: () => count.value++ }, `點了 ${count.value} 次`);
});
```

在 `src/App.vue` 裡匯入、使用它，和一般元件一樣：

```vue
<script setup>
import HCounter from "./components/HCounter.js";
</script>

<template>
  <HCounter />
</template>
```

執行 `npm run dev`，會看到一個「點了 0 次」的按鈕，點兩下變成「點了 2 次」。

它和下面這個 `.vue` 元件做的事完全一樣：

```vue
<script setup>
import { ref } from "vue";

const count = ref(0);
</script>

<template>
  <button @click="count++">點了 {{ count }} 次</button>
</template>
```

逐行對照：

- `defineComponent(() => { ... })`：傳一個函式進去，這個函式就相當於 `<script setup>` 的內容，在裡面宣告 `ref`。
- 它最後 `return` 的**又是一個函式**，那就是 render function。每次 `count` 變了，Vue 會重新呼叫它，拿到新的畫面描述。
- `h(標籤, 屬性, 內容)` 描述一個元素。`h` 是 hyperscript 的縮寫，意思是「產生 HTML 的函式」。

`h()` 的三個參數：

1. 第一個是標籤名稱（`"button"`），或是一個元件。
2. 第二個是屬性物件。事件寫成 `on` 加上大寫開頭的事件名稱，所以 `@click` 變成 `onClick`。
3. 第三個是內容：一段文字，或是由 `h()` 組成的陣列（代表多個子元素）。

第 11 章測試 composable 時寫的 `withSetup`，裡面的 `setup()` 最後 `return () => {}`，就是同一種寫法：回傳一個什麼都不畫的 render function，所以那個元件不需要模板。

### 什麼時候 render function 比模板方便

模板的標籤名稱是寫死的。假設你想做一個 `<Heading>` 元件，依照 `level` 決定要渲染 `<h1>` 到 `<h6>` 的哪一個，用模板就得寫六個 `v-if`。用 `h()` 只要一行。新增 `src/components/Heading.js`：

```js
import { h } from "vue";

export default function Heading(props, { slots }) {
  return h(`h${props.level}`, { class: "heading" }, slots.default?.());
}

Heading.props = ["level"];
```

使用：

```vue
<script setup>
import Heading from "./components/Heading.js";
</script>

<template>
  <Heading :level="2">二級標題</Heading>
</template>
```

畫面上會出現 `<h2 class="heading">二級標題</h2>`。

這個元件連 `defineComponent` 都沒用，就是一個普通的函式，叫做**函式元件**（functional component）。它沒有自己的狀態，收到 props 就直接回傳畫面：

- 第一個參數是 props，用 `Heading.props = ["level"]` 宣告它接收哪些 props。
- 第二個參數裡的 `slots` 就是 slot。`slots.default?.()` 會拿到 `<Heading>` 標籤中間的內容，也就是「二級標題」這幾個字。`?.` 是第 2 章學過的寫法：沒有傳內容時不會出錯。

### JSX：看起來像 HTML 的 render function

`h()` 寫多了很難讀。**JSX** 讓你在 JavaScript 裡直接寫類似 HTML 的標籤，建置時再翻譯成 `h()` 呼叫。React 就是用 JSX 寫畫面的，所以你可能已經在網路上看過它。

Vue 要用 JSX，需要安裝 `@vitejs/plugin-vue-jsx`。用 `--jsx` 建立的專案已經裝好了，`vite.config.js` 的 `plugins` 裡會有 `vueJsx()`：

```js
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
```

如果是已經存在的專案，執行 `npm install -D @vitejs/plugin-vue-jsx`，再照上面加進 `vite.config.js` 就好。

新增 `src/components/TodoList.jsx`，副檔名是 `.jsx`：

```jsx
import { defineComponent, ref } from "vue";

export default defineComponent(() => {
  const todos = ref(["買牛奶", "寫作業"]);
  const done = ref(false);

  return () => (
    <div class="todo">
      <ul>
        {todos.value.map((todo) => (
          <li key={todo}>{todo}</li>
        ))}
      </ul>
      {done.value ? <p>全部完成！</p> : <p>還有 {todos.value.length} 件</p>}
      <button onClick={() => (done.value = true)}>完成</button>
    </div>
  );
});
```

在 `App.vue` 裡用 `import TodoList from "./components/TodoList.jsx";` 匯入，放進模板。畫面上會有兩項待辦和「還有 2 件」，按「完成」之後變成「全部完成！」。

結構和 `HCounter.js` 一樣，只是 render function 回傳的從 `h()` 換成了 JSX。幾個和模板不同的地方：

- **`{ }` 取代 `{{ }}`**：大括號裡放任何 JavaScript 運算式。
- **沒有 `v-for`**：用陣列的 `map`（第 2 章）把資料變成一串元素，`key` 照樣要加。
- **沒有 `v-if`**：用三元運算子（第 1 章）或 `&&` 決定要顯示哪一個。
- **事件寫成 `onClick`**，和 `h()` 一樣。
- **`ref` 要寫 `.value`**：模板會自動解包，JSX 是一般的 JavaScript，不會。

如果你看過 React 的 JSX，要注意 Vue 的 JSX 寫 `class` 就好，不用寫成 React 的 `className`。

### 該用哪一個

**用模板。** Vue 的編譯器能分析模板，知道哪些部分永遠不會變，更新畫面時直接跳過它們。render function 和 JSX 是任意的 JavaScript，編譯器看不懂，這些最佳化就做不到。模板也比較好讀，Vue 生態系的文件和範例幾乎都用模板。

render function 和 JSX 主要出現在：

- UI 元件庫的原始碼，它們需要非常彈性地組合元素。
- 從 React 轉過來、習慣 JSX 的團隊。

知道它們在做什麼、看得懂就夠了。

## 重點整理

- 模板在建置時會被翻譯成 render function，它回傳「畫面應該長什麼樣子」的描述。
- `h(標籤, 屬性, 內容)` 描述一個元素，事件寫成 `onClick` 這種形式。
- 只收 props、回傳畫面的普通函式就是函式元件，適合「標籤名稱要動態決定」這類情況。
- JSX 是看起來像 HTML 的 `h()`，需要 `@vitejs/plugin-vue-jsx`；用 `map` 取代 `v-for`、三元運算子取代 `v-if`，`ref` 要寫 `.value`。
- 平常用模板就好，它比較好讀，也能讓 Vue 做更多最佳化。
