# `storeToRefs`

## 本集目標

知道為什麼把 store 解構之後畫面就不會更新，並且用 `storeToRefs` 正確地解構。

## 正文

### 先替計數器加一個 getter

把上上集的 `counter.js` 加上一個 `doubleCount`：

`src/stores/counter.js`：

```js
import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const useCounterStore = defineStore("counter", () => {
  const count = ref(0);
  const doubleCount = computed(() => count.value * 2);

  function increment() {
    count.value++;
  }

  return { count, doubleCount, increment };
});
```

### 想少打幾個字

每次都寫 `counter.count`、`counter.doubleCount` 有點囉嗦。第 2 章學過物件解構，很自然會想這樣寫：

`src/components/CounterDisplay.vue`：

```vue
<script setup>
import { useCounterStore } from "../stores/counter.js";

const { count, doubleCount } = useCounterStore();
</script>

<template>
  <p>目前是 {{ count }}，兩倍是 {{ doubleCount }}</p>
</template>
```

存檔後畫面顯示「目前是 0，兩倍是 0」。按「加一」，數字**不會動**。store 裡的 `count` 其實有在加，只是這個元件看不到。

### 為什麼解構會失去響應性

`const { count, doubleCount } = useCounterStore()` 這一行做的事，等於：

```js
const count = store.count;
const doubleCount = store.doubleCount;
```

第 2 章講「物件與陣列是參考」時提過：數字、字串這種值，指定給另一個變數時是**複製一份**。`store.count` 讀出來是數字 `0`，`count` 拿到的就是一個普通的 `0`，和 store 從此沒有任何關係。之後 store 裡的 `count` 變成 1、2、3，這個 `count` 永遠是 0。

第 5 章講 `reactive` 時也遇過同樣的事：從 `reactive` 物件解構出來的值，會失去響應性。store 就是一個 `reactive` 物件，所以規則一樣。

### 用 `storeToRefs` 解構

Pinia 提供 `storeToRefs` 解決這個問題：

`src/components/CounterDisplay.vue`：

```vue
<script setup>
import { storeToRefs } from "pinia";
import { useCounterStore } from "../stores/counter.js";

const counter = useCounterStore();
const { count, doubleCount } = storeToRefs(counter);
</script>

<template>
  <p>目前是 {{ count }}，兩倍是 {{ doubleCount }}</p>
</template>
```

現在按「加一」，畫面會變成「目前是 1，兩倍是 2」。

`storeToRefs(counter)` 會把 store 裡的每個 state 和 getter 各自包成一個 `ref`，再放進一個新物件。解構出來的 `count` 是 `ref`，它連回 store 裡真正的資料，所以會跟著更新。

既然解構出來的是 `ref`，就照 `ref` 的規矩用：

- 在模板裡自動解包，直接寫 `{{ count }}`。
- 在 `<script setup>` 裡要寫 `count.value`。改 `count.value` 也會改到 store 裡的資料。
- `doubleCount` 是 getter 變成的 `ref`，和 `computed` 一樣只能讀，不能改。

### actions 直接解構就好

`storeToRefs` 只處理 state 和 getters，**不包含 actions**。要拿 action，直接從 store 解構。把 `CounterDisplay.vue` 改成：

`src/components/CounterDisplay.vue`：

```vue
<script setup>
import { storeToRefs } from "pinia";
import { useCounterStore } from "../stores/counter.js";

const counter = useCounterStore();
const { count, doubleCount } = storeToRefs(counter);
const { increment } = counter;
</script>

<template>
  <p>目前是 {{ count }}，兩倍是 {{ doubleCount }}</p>
  <button @click="increment">加一</button>
</template>
```

為什麼 action 可以直接解構？因為 action 是函式，函式本身不會變。解構出來的 `increment` 和 `counter.increment` 是同一個函式，呼叫它照樣會去改 store 裡的 `count`。會變的是資料（state 和 getters），所以只有它們需要 `storeToRefs`。

### 要不要解構

不解構、一律寫 `counter.count` 也完全沒問題，而且一眼就看得出資料來自哪個 store。這本書接下來兩種寫法都會用，只要記住：**要解構 state 和 getters，就一定要先經過 `storeToRefs`。**

## 重點整理

- 直接從 store 解構 state 或 getter，拿到的是當下的值，之後不會更新。
- 原因和第 2 章的「值會被複製」、第 5 章的 `reactive` 解構一樣。
- 用 `storeToRefs(store)` 解構，拿到的是連回 store 的 `ref`，會跟著更新。
- `storeToRefs` 不包含 actions；actions 直接從 store 解構就好。
- 不想煩惱的話，就不要解構，一律寫 `store.屬性`。
