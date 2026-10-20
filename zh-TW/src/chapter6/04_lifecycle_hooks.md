# 生命週期 Hook

## 本集目標

用 `onMounted` 和 `onUnmounted`，在元件出現在畫面上、從畫面上消失的時候執行程式碼。

## 正文

### 元件的一生

每個元件都會經歷幾個階段：

1. **建立**：執行 `<script setup>` 裡的程式碼，準備好 `ref`、`computed` 這些東西。
2. **掛載**（mount）：Vue 根據模板產生真正的 DOM 元素，放到網頁上。到這一步，使用者才看得到它。
3. **更新**：狀態改變，畫面跟著重新渲染，這可能發生很多次。
4. **卸載**（unmount）：元件從畫面上移除，例如 `v-if` 變成 `false` 的時候。

這整個過程叫做元件的**生命週期**（lifecycle）。Vue 讓你在特定階段「掛上」一段程式碼，到了那個時間點就自動執行，這些函式叫做**生命週期 Hook**。最常用的是這兩個：

- `onMounted`：掛載完成之後執行。
- `onUnmounted`：卸載完成之後執行。

### 看看執行順序

```vue
<script setup>
import { onMounted } from "vue";

console.log("1. 執行 script setup");

onMounted(() => {
  console.log("2. 掛載完成");
});
</script>

<template>
  <p>看看 Console</p>
</template>
```

重新整理頁面，Console 印出：

```text
1. 執行 script setup
2. 掛載完成
```

`<script setup>` 裡直接寫的程式碼，在元件建立時就執行了，那時候畫面上還沒有任何東西。交給 `onMounted` 的函式，要等元件真的放上網頁之後才執行。

### 交出函式，不是呼叫它

`onMounted` 收的是一個 callback，跟第 2 章學的一樣，你是把函式「交給」它，讓它到時候再呼叫。所以如果函式已經有名字，直接寫名字就好，**不要加括號**：

```vue
<script setup>
import { onMounted } from "vue";

function loadData() {
  console.log("開始載入資料");
}

onMounted(loadData);
</script>

<template>
  <p>看看 Console</p>
</template>
```

寫成 `onMounted(loadData())` 就錯了：`loadData()` 會在 `<script setup>` 執行的當下馬上被呼叫，然後把它的回傳值（`undefined`）交給 `onMounted`，等於沒有交出任何函式。

### 開了就要關：時鐘

做一個每秒更新的時鐘。這次需要兩個檔案：一個時鐘元件，一個用 `v-if` 控制它顯示或隱藏的 `App.vue`。

建立 `src/components/LiveClock.vue`：

```vue
<script setup>
import { onMounted, onUnmounted, ref } from "vue";

const now = ref(new Date());
let timer;

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  clearInterval(timer);
  console.log("時鐘停了");
});
</script>

<template>
  <p>現在是 {{ now.toLocaleTimeString("zh-TW") }}</p>
</template>
```

把 `src/App.vue` 換成：

```vue
<script setup>
import { ref } from "vue";
import LiveClock from "./components/LiveClock.vue";

const show = ref(true);
</script>

<template>
  <button @click="show = !show">
    {{ show ? "隱藏" : "顯示" }}時鐘
  </button>
  <LiveClock v-if="show" />
</template>
```

畫面上的時鐘每秒跳一次。按「隱藏時鐘」，時鐘從畫面上消失，Console 印出：

```text
時鐘停了
```

`setInterval` 和 `setTimeout` 很像，差別是它會**每隔一段時間就執行一次**，一直重複下去；用 `clearInterval` 加上它回傳的號碼才能停下來。`toLocaleTimeString("zh-TW")` 會把時間轉成「下午3:05:09」這種台灣習慣的格式。

重點在 `onUnmounted`。如果沒有它，時鐘元件都不在畫面上了，計時器還是會每秒執行一次，白白浪費資源。每按一次「顯示」又會多開一個計時器，越積越多。

所以規則跟上一集一樣：**在 `onMounted` 開了什麼，就在 `onUnmounted` 關掉什麼**。計時器配 `clearInterval`，在 `window` 上用 `addEventListener` 加的事件監聽，就配 `removeEventListener`。

### 監聽會自己停

你在 `<script setup>` 裡寫的 `watch` 和 `watchEffect`，Vue 知道它們屬於這個元件，元件卸載時會自動停止，不用你手動處理。

計時器和 `window` 上的事件監聽就不一樣了，它們是瀏覽器的東西，Vue 不知道它們存在，所以要自己收拾。

### 其他生命週期 Hook

Vue 還有 `onBeforeMount`、`onBeforeUnmount`、`onUpdated` 等等。它們的名字已經說明了執行時機，例如 `onBeforeUnmount` 是「卸載之前」。實際寫程式時，絕大多數情況用 `onMounted` 和 `onUnmounted` 就夠了，其他的等真的需要時再查官方文件。

## 重點整理

- 元件會經歷建立、掛載、更新、卸載這些階段，叫做生命週期。
- `<script setup>` 直接寫的程式碼在建立時執行，那時畫面上還沒有東西。
- `onMounted` 在元件放上網頁之後執行，`onUnmounted` 在元件被移除之後執行。
- 在 `onMounted` 開啟的計時器、事件監聽，要在 `onUnmounted` 關掉。
- `watch` 和 `watchEffect` 會在元件卸載時自動停止。
