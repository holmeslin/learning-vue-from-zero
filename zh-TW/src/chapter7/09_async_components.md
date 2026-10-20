# 非同步元件

## 本集目標

用 `defineAsyncComponent` 把用不到的元件先不載入，等真的要顯示時才去下載它。

## 正文

### 問題：一開始就全部下載

`npm run build`（或 `npx vite build`）會把你寫的所有元件打包成 JavaScript 檔案。使用者打開網頁時，瀏覽器要先把這些檔案下載完，畫面才會出來。

可是有些元件，大部分使用者根本不會看到：按了按鈕才出現的圖表、很少人打開的設定頁。把它們也塞進一開始的下載裡，網頁就白白變慢了。

### 先看範例

建立 `src/components/HeavyChart.vue`，假裝它是一個很大的圖表元件：

```vue
<script setup>
const data = [30, 80, 45, 60, 20];
</script>

<template>
  <div class="chart">
    <div
      v-for="(value, index) in data"
      :key="index"
      class="bar"
      :style="{ height: value + 'px' }"
    ></div>
  </div>
</template>

<style scoped>
.chart {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 100px;
}
.bar {
  width: 20px;
  background: steelblue;
}
</style>
```

把 `src/App.vue` 換成：

```vue
<script setup>
import { ref, defineAsyncComponent } from "vue";

const HeavyChart = defineAsyncComponent(
  () => import("./components/HeavyChart.vue"),
);

const show = ref(false);
</script>

<template>
  <button @click="show = true">顯示圖表</button>
  <HeavyChart v-if="show" />
</template>
```

按「顯示圖表」，畫面出現五根藍色長條。用起來和普通元件沒有兩樣。

差別要建置後才看得出來。在終端機執行：

```bash
npx vite build
```

```text
dist/index.html                       0.42 kB │ gzip:  0.28 kB
dist/assets/HeavyChart-DoxMUBfx.css   0.13 kB │ gzip:  0.12 kB
dist/assets/index-CCP7eAtf.css        1.87 kB │ gzip:  0.74 kB
dist/assets/HeavyChart-CnkkYApi.js    0.39 kB │ gzip:  0.30 kB
dist/assets/index-lE3B6v9D.js        66.43 kB │ gzip: 26.22 kB
```

（只列出檔案清單那幾行；檔名中間的亂碼和大小，每個人跑出來都不一樣。）

`HeavyChart` 被拆成獨立的 `HeavyChart-….js` 和 `HeavyChart-….css`，不在主要的 `index-….js` 裡。網頁打開時只下載 `index`，等你按下按鈕、`HeavyChart` 第一次要出現時，瀏覽器才去下載它那兩個檔案。如果改回一般的 `import HeavyChart from ...`，它就會被打包進 `index-….js`，清單裡不會有 `HeavyChart` 那兩行。

### `import()`：需要時才載入

第 2 章學的 `import` 寫在檔案最上面，程式一開始就會載入。這裡的 `import("./components/HeavyChart.vue")` 長得很像，但有括號，是一個**函式呼叫**，叫做動態 `import`（dynamic import）：

- 它在被呼叫的那一刻才去載入檔案。
- 它回傳一個 Promise（第 2 章學過），載入完成時 Promise 才會有結果。

Vite 看到 `import()`，就知道這個檔案可以拆出去，自動把它打包成獨立的檔案。

`defineAsyncComponent` 接受一個「呼叫了就會回傳 Promise」的函式，包裝成一個元件。這個元件第一次要畫出來時，Vue 才呼叫那個函式、等 Promise 完成，再把真正的 `HeavyChart` 畫上去。之後再出現就直接用，不會重複下載。

注意 `() => import(...)` 外面那層箭頭函式不能省。`defineAsyncComponent` 要的是一個「之後再呼叫」的函式；如果直接寫 `import(...)`，這一行一執行就會開始下載，失去「需要時才載入」的意義，`defineAsyncComponent` 也不認得這種寫法。

### 載入中、載入失敗

下載需要時間，網路也可能出問題。`defineAsyncComponent` 也可以傳一個物件，設定這些情況要顯示什麼。

建立 `src/components/LoadingBox.vue`：

```vue
<template>
  <p>圖表載入中…</p>
</template>
```

建立 `src/components/ErrorBox.vue`：

```vue
<template>
  <p>圖表載入失敗，請重新整理頁面。</p>
</template>
```

把 `src/App.vue` 換成：

```vue
<script setup>
import { ref, defineAsyncComponent } from "vue";
import LoadingBox from "./components/LoadingBox.vue";
import ErrorBox from "./components/ErrorBox.vue";

const HeavyChart = defineAsyncComponent({
  loader: () => import("./components/HeavyChart.vue"),
  loadingComponent: LoadingBox,
  delay: 200,
  errorComponent: ErrorBox,
  timeout: 10000,
});

const show = ref(false);
</script>

<template>
  <button @click="show = true">顯示圖表</button>
  <HeavyChart v-if="show" />
</template>
```

- `loader`：原本那個 `() => import(...)`。
- `loadingComponent`：下載中顯示的元件。
- `delay`：過了幾毫秒還沒載完，才顯示 `loadingComponent`，預設是 200。網路快的時候，載入中的畫面一閃而過反而難看，所以先等一下。
- `errorComponent`：下載失敗時顯示的元件。
- `timeout`：超過幾毫秒還沒載完，就當作失敗，改顯示 `errorComponent`。這裡是 10 秒；不設的話會一直等下去。

在自己的電腦上幾乎是瞬間載完，看不太到載入中的畫面。想看的話，可以打開開發者工具的 Network 分頁，把網路速度調成「Slow 4G」之類的慢速模擬，再按按鈕。

### 什麼時候用

拆得太細，反而會多出很多小檔案、很多次下載。適合拆出去的是：

- 很大的元件，例如圖表、文字編輯器、地圖。
- 一開始看不到、要使用者操作才出現的元件，例如對話框裡的內容。

最常見的用法其實是「每一頁拆成一個檔案」，使用者去哪一頁才下載哪一頁。第 9 章學 Vue Router 時，延遲載入路由用的就是這一集的 `import()`。

Vue 另外有一個 `<Suspense>` 元件，可以統一處理一整塊區域裡所有非同步元件的載入狀態，但它到 Vue 3.5 都還標示為實驗性功能，這本書不使用。

## 重點整理

- `defineAsyncComponent(() => import("./X.vue"))` 讓元件在第一次要顯示時才下載。
- `import()` 是動態 `import`，呼叫時才載入，回傳 Promise；Vite 會把它拆成獨立的檔案。
- 外面那層 `() =>` 不能省，`defineAsyncComponent` 要的是函式。
- 傳物件可以設定 `loadingComponent`、`delay`、`errorComponent`、`timeout`。
- 適合拆出去的是大型、一開始看不到的元件；每一頁拆一個檔案是最常見的用法。
