# 自訂指令

## 本集目標

自己做一個 `v-focus` 指令，讓輸入框一出現就能打字，並且知道什麼時候該用指令、什麼時候不該用。

## 正文

### 指令你早就在用了

`v-if`、`v-for`、`v-model`、`v-on` 都是**指令**（directive）：寫在 HTML 標籤上、以 `v-` 開頭的特殊屬性。這些是 Vue 內建的，你也可以自己做。

這一集用 TypeScript。建一個練習專案：

```bash
npm create vue@latest -- appendix-ts --ts
cd appendix-ts
npm install
```

### 第一個自訂指令：`v-focus`

新增 `src/components/FocusInput.vue`：

```vue
<script setup lang="ts">
import type { Directive } from "vue";

const vFocus: Directive<HTMLInputElement> = {
  mounted(el) {
    el.focus();
  },
};
</script>

<template>
  <input v-focus placeholder="一打開就能打字" />
</template>
```

把 `src/App.vue` 換成：

```vue
<script setup lang="ts">
import FocusInput from "./components/FocusInput.vue";
</script>

<template>
  <FocusInput />
</template>
```

執行 `npm run dev`，頁面一打開，游標就已經在輸入框裡閃，不用先點它就能直接打字。

拆開來看：

- **命名**：在 `<script setup>` 裡，名字以 `v` 開頭、後面接大寫字母的變數（`vFocus`），Vue 就會把它當成指令，模板裡用 `v-focus` 來寫。`vFocus` 對應 `v-focus`，`vHighlight` 對應 `v-highlight`，和元件名稱的大小寫轉換方式一樣。
- **指令是一個物件**，裡面放「在什麼時間點要做什麼」。`mounted(el)` 的意思是：這個元素放到畫面上之後，執行這個函式。`el` 就是那個 DOM 元素，也就是這裡的 `<input>`。
- **型別**：`Directive<HTMLInputElement>` 告訴 TypeScript 這個指令用在 `<input>` 上，所以 `el.focus()` 有型別檢查。

### 和 `useTemplateRef` 比一比

第 6 章學過，要操作 DOM 可以用 `useTemplateRef` 搭配 `onMounted`：

```vue
<script setup lang="ts">
import { onMounted, useTemplateRef } from "vue";

const input = useTemplateRef("input");

onMounted(() => {
  input.value?.focus();
});
</script>

<template>
  <input ref="input" placeholder="一打開就能打字" />
</template>
```

效果一樣。差別在於重複使用：如果有十個元件都需要「打開就聚焦」，`useTemplateRef` 的寫法要在每個元件裡寫一次；指令只要寫一次，到處加上 `v-focus` 就好。

### 放進獨立檔案，讓別的元件也能用

把指令移到 `src/directives/focus.ts`：

```ts
import type { Directive } from "vue";

export const vFocus: Directive<HTMLInputElement> = {
  mounted(el) {
    el.focus();
  },
};
```

需要的元件匯入它就能用。名字一樣要以 `v` 開頭。下面路徑開頭的 `@` 代表 `src` 資料夾，是 create-vue 在 `vite.config.ts` 預先設定好的路徑別名，不管元件放在哪一層都能這樣寫：

```vue
<script setup lang="ts">
import { vFocus } from "@/directives/focus";
</script>

<template>
  <input v-focus />
</template>
```

### 全域註冊

如果整個專案到處都在用，也可以在 `src/main.ts` 用 `app.directive()` 註冊一次，之後任何元件都不用匯入：

```ts
import { createApp } from "vue";
import App from "./App.vue";
import { vFocus } from "./directives/focus";

const app = createApp(App);

app.directive("focus", vFocus);

app.mount("#app");
```

`app.directive` 的第一個參數是指令的名字，**不含** `v-`。註冊成 `"focus"`，模板裡就寫 `v-focus`。

這和第 8 章的 `app.use(pinia)`、第 9 章的 `app.use(router)` 是同一個地方，都是在 `mount` 之前設定整個 app。

### 傳值給指令：值、參數、修飾符

指令和內建的 `v-on:click.prevent="..."` 一樣，可以帶三種資訊。做一個螢光筆指令，新增 `src/components/HighlightDemo.vue`：

```vue
<script setup lang="ts">
import { ref } from "vue";
import type { Directive } from "vue";

const vHighlight: Directive<HTMLElement, string, "bold"> = (el, binding) => {
  el.style.backgroundColor = binding.value;
  el.style.fontWeight = binding.modifiers.bold ? "bold" : "normal";
};

const color = ref("yellow");
</script>

<template>
  <p v-highlight="color">一般的螢光筆</p>
  <p v-highlight.bold="color">加粗的螢光筆</p>
  <button @click="color = color === 'yellow' ? 'pink' : 'yellow'">
    換顏色
  </button>
</template>
```

把它放進 `App.vue` 執行，兩段文字都有黃色底，第二段是粗體。按「換顏色」，兩段一起變成粉紅色。

這次指令寫成一個**函式**，不是物件。這是簡寫：函式會在元素掛載時執行一次，之後每次元件更新也會再執行一次。所以 `color` 一變，背景色就跟著變。

函式的第二個參數 `binding` 裝著模板傳來的資訊：

- `binding.value`：等號後面的值，這裡是 `color` 的值（`"yellow"`）。
- `binding.modifiers`：點後面的修飾符，`v-highlight.bold` 會得到 `{ bold: true }`。
- `binding.arg`：冒號後面的參數，例如 `v-highlight:background` 的 `"background"`。這個範例沒用到。

`Directive<HTMLElement, string, "bold">` 的三個型別依序是：用在什麼元素上、值的型別、允許哪些修飾符。

### 物件寫法有哪些時間點

用物件寫指令時，可以放這些函式，名字和元件的生命週期很像：

- `created`：元素建立了，但屬性和事件還沒設定好。
- `beforeMount`：快要放到畫面上。
- `mounted`：已經放到畫面上，最常用。
- `beforeUpdate` / `updated`：所在的元件更新前後。
- `beforeUnmount` / `unmounted`：元素要從畫面上移除前後，適合做清理，例如移除自己加上的事件監聽。

每個函式收到的參數都是 `(el, binding)`，和函式簡寫一樣。只需要 `mounted` 和 `updated` 做同一件事時，用函式簡寫就好。

### 什麼時候用指令

自訂指令能做的事，大多也能用元件或 composable 做到。Vue 官方的建議是：**只有在需要直接操作 DOM 元素時才用自訂指令**，例如聚焦、捲動、量尺寸、整合一個需要 DOM 元素的外部函式庫。

如果你想做的是「一塊有自己畫面的東西」，用元件；想重複使用的是「一段邏輯和狀態」，用 composable（第 6 章）。指令是最後才考慮的工具，不是第一個。

另外，指令放在**元件**上（例如 `<MyCard v-focus />`）時，會套用到元件的根元素上。元件如果有多個根元素，指令會被忽略，Vue 會印出警告，所以官方不建議把指令用在元件上。

## 重點整理

- 在 `<script setup>` 裡，以 `v` 加大寫字母開頭的變數（`vFocus`）就是指令，模板裡寫成 `v-focus`。
- 指令可以是物件（`mounted`、`unmounted` 等時間點）或函式簡寫（掛載和更新時都執行）。
- `binding.value` 拿值、`binding.modifiers` 拿修飾符、`binding.arg` 拿參數。
- 全域註冊用 `app.directive("focus", vFocus)`，名字不含 `v-`。
- 只有需要直接操作 DOM 時才用指令，其他情況優先考慮元件或 composable。
