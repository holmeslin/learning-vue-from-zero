# composable

## 本集目標

把用到 `ref`、生命週期 Hook 的邏輯，抽成可以重複使用的 composable。

## 正文

### 追蹤滑鼠位置

先寫一個顯示滑鼠位置的元件，用的全是這一章學過的東西：

```vue
<script setup>
import { onMounted, onUnmounted, ref } from "vue";

const x = ref(0);
const y = ref(0);

function update(event) {
  x.value = event.pageX;
  y.value = event.pageY;
}

onMounted(() => window.addEventListener("mousemove", update));
onUnmounted(() => window.removeEventListener("mousemove", update));
</script>

<template>
  <p>滑鼠位置：{{ x }}, {{ y }}</p>
</template>
```

在頁面上移動滑鼠，數字會跟著變。`mousemove` 是滑鼠移動時瀏覽器發出的事件，`event.pageX`、`event.pageY` 是滑鼠在頁面上的座標。

這段程式碼本身沒問題。但如果另一個元件也需要滑鼠位置，你就得把這十幾行整段複製過去。

### 抽成函式

把這段邏輯搬進一個函式，回傳 `x` 和 `y`。建立 `src/composables` 資料夾，在裡面建立 `src/composables/useMouse.js`：

```js
import { onMounted, onUnmounted, ref } from "vue";

export function useMouse() {
  const x = ref(0);
  const y = ref(0);

  function update(event) {
    x.value = event.pageX;
    y.value = event.pageY;
  }

  onMounted(() => window.addEventListener("mousemove", update));
  onUnmounted(() => window.removeEventListener("mousemove", update));

  return { x, y };
}
```

把 `src/App.vue` 換成：

```vue
<script setup>
import { useMouse } from "./composables/useMouse.js";

const { x, y } = useMouse();
</script>

<template>
  <p>滑鼠位置：{{ x }}, {{ y }}</p>
</template>
```

效果和剛剛完全一樣，但 `App.vue` 只剩兩行。任何元件需要滑鼠位置，只要一行 `const { x, y } = useMouse()`，監聽和清除的細節全藏在 `useMouse` 裡。

這種**用 Vue 的響應式和生命週期 API，把有狀態的邏輯包起來重複使用的函式**，叫做 **composable**。名稱習慣用 `use` 開頭，放在 `src/composables/` 資料夾。

composable 和普通函式的差別在於：它裡面可以用 `ref`、`computed`、`watch`、`onMounted` 這些東西，而且 `onMounted`、`onUnmounted` 會掛在**呼叫它的那個元件**身上。`App.vue` 掛載時開始監聽滑鼠，卸載時停止。

### 共用的是邏輯，不是資料

兩個元件呼叫同一個 composable，會不會共用同一份 `x`、`y`？用一個更簡單的例子試試看。

建立 `src/composables/useCounter.js`：

```js
import { ref } from "vue";

export function useCounter() {
  const count = ref(0);

  function increase() {
    count.value++;
  }

  return { count, increase };
}
```

建立 `src/components/CounterButton.vue`：

```vue
<script setup>
import { useCounter } from "../composables/useCounter.js";

defineProps({ label: String });

const { count, increase } = useCounter();
</script>

<template>
  <button @click="increase">{{ label }}：{{ count }}</button>
</template>
```

把 `src/App.vue` 換成：

```vue
<script setup>
import CounterButton from "./components/CounterButton.vue";
</script>

<template>
  <CounterButton label="甲" />
  <CounterButton label="乙" />
</template>
```

按「甲」兩下、「乙」一下，畫面是「甲：2」和「乙：1」。兩個按鈕各算各的。

原因很單純：`useCounter` 是一個函式，每呼叫一次，就執行一次 `ref(0)`，建立一個新的 `count`。兩個 `CounterButton` 各呼叫一次，就有兩個互不相干的 `count`。composable 共用的是「怎麼做」的邏輯，不是資料本身。

想讓好幾個元件共用同一份資料，要用 props 往下傳，或是第 8 章會教的 Pinia。

### 什麼時候該抽成 composable

發現兩個以上的元件寫了同樣的 `ref` 加 `onMounted`、`watch` 組合，就是抽出來的好時機。有時候就算只有一個元件用，把一大段邏輯抽出去、取個好名字，元件也會變得好讀很多。

反過來，如果只是一個普通的計算，例如把價格加上千分位，完全沒用到 `ref` 或生命週期，那寫成普通函式就好，不必取名 `useXxx`。

## 重點整理

- composable 是用 Vue 的響應式與生命週期 API，把有狀態的邏輯包起來重複使用的函式。
- 名稱用 `use` 開頭，放在 `src/composables/` 資料夾，用 `export` 匯出。
- composable 裡的 `onMounted`、`onUnmounted` 會掛在呼叫它的元件身上。
- 每次呼叫都會建立一份新的狀態，共用的是邏輯，不是資料。
- 沒用到響應式或生命週期的邏輯，寫成普通函式就好。
