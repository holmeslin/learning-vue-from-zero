# Vapor Mode 預覽

## 本集目標

知道 Vue 3.6 的 Vapor Mode 是什麼、為什麼要做它，以及它的寫法長什麼樣子。

## 正文

### 先說清楚：這還不是正式版

寫這一集的時候（2026 年 10 月），Vue 3.6 還是 **RC**（release candidate，正式發布前的候選版本），最新的是 `3.6.0-rc.12`。npm 上的正式版仍然是 3.5，這本書的正文也全部用 3.5。

所以這一集是「預覽」：讓你知道 Vue 接下來的方向，看到別人的文章或專案時不會一頭霧水。**不要拿它來寫正式的專案**，等 3.6 正式發布、Vapor Mode 穩定之後再考慮。

你也不需要動手做。如果想試試看，下面的範例都可以照著跑。

### Virtual DOM 是什麼

要懂 Vapor Mode，得先知道 Vue 現在是怎麼更新畫面的。

第 3 章說過，網頁的內容是一棵 DOM 樹，Vue 幫你操作它。但 Vue 並不是直接改 DOM，而是多做了一步：

1. 每次狀態改變，Vue 執行 render function（「render function 與 JSX」那一集說過，模板會被翻譯成它），在記憶體裡產生一份「畫面應該長什麼樣子」的描述。這份描述叫做 **Virtual DOM**（虛擬 DOM）。
2. Vue 拿新的 Virtual DOM 和上一次的比較，找出哪裡不一樣。
3. 只把不一樣的地方套用到真正的 DOM 上。

這個做法很可靠，Vue 從 2016 年用到現在。代價是第 1、2 步的工作：每次更新都要產生一整份描述、再比較一次，而且負責做這些事的程式碼也要一起下載到瀏覽器。

### Vapor Mode：跳過 Virtual DOM

Vapor 是英文「蒸氣」的意思，你可以想成 Virtual DOM 像蒸氣一樣散掉了。

Vapor Mode 是一種新的**編譯方式**。編譯器在建置時就分析好模板：哪一段文字跟著哪個 `ref` 變、哪個屬性跟著哪個 `computed` 變。執行時，`count` 一變，就直接去改那一個文字節點，不產生描述、也不比較。

結果是：

- 更新畫面更快。官方說它在第三方的效能測試裡，和以速度著稱的 Solid、Svelte 5 同一個等級。
- 如果整個 app 都用 Vapor Mode，就不需要下載 Virtual DOM 的程式碼，網站更小。

最重要的是，**你寫的程式碼幾乎不用改**。`ref`、`computed`、`watch`、模板語法全部一樣，差別只在一個屬性。

### 寫法：加上 `vapor`

在 `<script setup>` 加上 `vapor` 屬性，這個元件就會用 Vapor Mode 編譯：

```vue
<script setup vapor lang="ts">
import { ref } from "vue";

const count = ref(0);
</script>

<template>
  <button @click="count++">點了 {{ count }} 次</button>
</template>
```

除了第一行多了 `vapor`，和你寫過的元件一模一樣。

### 自己試試看

create-vue 有一個 `--vue-rc` 旗標，會建立一個使用 Vue 3.6 RC 的專案：

```bash
npm create vue@latest -- appendix-vapor --ts --vue-rc
cd appendix-vapor
npm install
```

把上面的計數器存成 `src/components/VaporCounter.vue`。`src/App.vue` 也加上 `vapor`：

```vue
<script setup vapor lang="ts">
import VaporCounter from "./components/VaporCounter.vue";
</script>

<template>
  <h1>Vapor Mode 試玩</h1>
  <VaporCounter />
</template>
```

最後把 `src/main.ts` 整個換成：

```ts
import { createVaporApp } from "vue";
import App from "./App.vue";

createVaporApp(App).mount("#app");
```

原本的 `createApp` 換成了 `createVaporApp`。原本第一行載入的 `main.css` 也拿掉了，所以頁面不會有 create-vue 的預設樣式，不影響這個範例。這代表「整個 app 都是 Vapor 元件」，Vue 就不會載入 Virtual DOM 的程式碼。

執行 `npm run dev`，看起來和一般的 Vue app 沒有兩樣：標題底下一個按鈕，點兩下顯示「點了 2 次」。

差別在建置後的大小。撰寫時用 `3.6.0-rc.12` 把這個小 app 用兩種模式各建置一次：

- 一般模式（拿掉兩個 `vapor`、改回 `createApp`）：JavaScript 約 66 kB。
- Vapor Mode：JavaScript 約 47 kB。

少了將近三成，少掉的主要就是 Virtual DOM 的程式碼。實際數字會隨版本變動，看個大概就好。

### 和現有的元件混用

現有的專案不可能一次全部改寫。官方提供了 `vaporInteropPlugin`，讓一般元件和 Vapor 元件可以互相包在一起：

```ts
import { createApp, vaporInteropPlugin } from "vue";
import App from "./App.vue";

createApp(App).use(vaporInteropPlugin).mount("#app");
```

這樣你可以只把一個對效能要求特別高的頁面改成 Vapor Mode，其他地方維持原樣。不過混用時 Virtual DOM 和 Vapor 兩套程式碼都會被載入，網站變小的好處就沒了。拿上面的小 app 試，`App.vue` 拿掉 `vapor`、改用這種寫法，建置出來約 146 kB，反而比兩種單獨的模式都大。官方建議把 app 分成幾個「區域」，同一區用同一種模式，盡量不要一層一般、一層 Vapor 地交錯。

### 不支援的東西

Vapor Mode 只支援現代寫法的一部分功能。官方列出的限制包括：

- **只支援 `<script setup>`**（或只有模板的元件）。Options API 不支援，所以「看懂 Options API」那一集的寫法不能加 `vapor`。
- **render function 和 JSX 寫的元件不會變成 Vapor**，它們一定是 Virtual DOM 元件。
- **自訂指令的寫法不同**。「自訂指令」那一集的 `mounted(el)` 物件寫法，在 Vapor 元件裡要改成另一種函式形式。
- `getCurrentInstance()` 在 Vapor 元件裡回傳 `null`，`v-memo` 也不支援。這兩個本書沒教，知道就好。

這也是這本書一直只教 `<script setup>` 的原因之一：它是 Vue 未來的方向，等 Vapor Mode 正式推出，你的程式碼幾乎不用改就能享受到好處。

## 重點整理

- 撰寫時 Vue 3.6 還是 RC，Vapor Mode 只是預覽，正式專案請繼續用 3.5。
- 一般模式用 Virtual DOM 比較前後差異再更新畫面；Vapor Mode 在編譯時就決定好要改哪裡，跳過這一步。
- 在 `<script setup>` 加上 `vapor` 就能啟用，其他寫法幾乎不變；整個 app 都是 Vapor 時用 `createVaporApp`，可以讓網站更小。
- 和一般元件混用要裝 `vaporInteropPlugin`；Options API、render function 和 JSX 不支援 Vapor Mode。
