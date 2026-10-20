# `defineStore`

## 本集目標

用 `defineStore` 寫出第一個 store，讓兩個沒有父子關係的元件共用同一個計數器。

## 正文

### 第一個 store

在 `src/stores/` 裡建立 `counter.js`：

`src/stores/counter.js`：

```js
import { ref } from "vue";
import { defineStore } from "pinia";

export const useCounterStore = defineStore("counter", () => {
  const count = ref(0);

  function increment() {
    count.value++;
  }

  return { count, increment };
});
```

再做兩個元件，一個負責按，一個負責顯示。

`src/components/CounterButton.vue`：

```vue
<script setup>
import { useCounterStore } from "../stores/counter.js";

const counter = useCounterStore();
</script>

<template>
  <button @click="counter.increment">加一</button>
</template>
```

`src/components/CounterDisplay.vue`：

```vue
<script setup>
import { useCounterStore } from "../stores/counter.js";

const counter = useCounterStore();
</script>

<template>
  <p>目前是 {{ counter.count }}</p>
</template>
```

最後把 `App.vue` 整個換成：

`src/App.vue`：

```vue
<script setup>
import CounterButton from "./components/CounterButton.vue";
import CounterDisplay from "./components/CounterDisplay.vue";
</script>

<template>
  <CounterDisplay />
  <CounterButton />
  <CounterButton />
</template>
```

執行 `npm run dev`，畫面上有「目前是 0」和兩個「加一」按鈕。不管按哪一個，數字都會加一。

注意 `App.vue` 裡完全沒有 `count`，也沒有 `provide`。`CounterButton` 和 `CounterDisplay` 各自 `import` 同一個 store，就共用了同一份資料。

### 拆開來看 `defineStore`

```js
export const useCounterStore = defineStore("counter", () => {
  // ...
});
```

`defineStore` 接兩個引數：

1. **store 的名字**：`"counter"`。每個 store 的名字都不能重複，Pinia 用它來分辨不同的 store，在 Vue DevTools 裡看到的也是這個名字。
2. **一個函式**：裡面用 `ref` 建立資料、寫修改資料的函式，最後把要給外面用的東西放進物件 `return` 出去。這種寫法叫做 **setup store**，因為它和 `<script setup>` 裡的寫法幾乎一樣。

`defineStore` 回傳的不是 store 本身，而是一個「取得 store 的函式」，範例把它存在 `useCounterStore` 裡。元件要用的時候呼叫 `useCounterStore()`，才拿到真正的 store。

在網路上的其他教學，你可能會看到 `defineStore` 的第二個引數是一個寫著 `state`、`getters`、`actions` 的物件。那是另一種叫 option store 的寫法，功能差不多，這本書只用 setup store。

### 命名習慣

- 檔案放在 `src/stores/`，用 store 的名字當檔名：`counter.js`。
- 取得 store 的函式取名為 `use` + 名字 + `Store`：`useCounterStore`。看到 `useXxxStore` 就知道是 Pinia 的 store。
- 在元件裡，把拿到的 store 存進一個好懂的變數，例如 `const counter = useCounterStore()`。

### 跟 composable 有什麼不一樣

這個 store 看起來和第 6 章的 composable 很像：一個 `use` 開頭的函式，裡面有 `ref` 和函式。差別在於呼叫幾次會得到什麼：

- composable 每呼叫一次，就建立一份**新的** `ref`。兩個元件各自呼叫 `useXxx()`，資料互不相干。
- store 不管在幾個元件、呼叫幾次 `useCounterStore()`，拿到的都是**同一個** store。第一次呼叫時 Pinia 才執行你寫的那個函式、建立 store，之後的呼叫都直接回傳已經建好的那一個。

所以上面兩個 `CounterButton` 和一個 `CounterDisplay` 操作的，是同一個 `count`。

### 在模板裡不用 `.value`

`counter.js` 裡面寫的是 `count.value++`，但元件模板裡寫的是 `counter.count`，沒有 `.value`。在元件的 `<script setup>` 裡也一樣，用 `counter.count` 就能讀到數字。下一集會說明為什麼。

## 重點整理

- `defineStore("名字", () => { ... })` 定義一個 store，名字不能重複。
- 函式裡用 `ref` 和普通函式寫邏輯，最後 `return` 給外面用的東西，這叫 setup store。
- `defineStore` 回傳 `useXxxStore` 函式，在元件裡呼叫它才拿到 store。
- 不管在哪裡、呼叫幾次，拿到的都是同一個 store，所以資料會共用。
- store 檔案放 `src/stores/`，函式命名為 `useXxxStore`。
