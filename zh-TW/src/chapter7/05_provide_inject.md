# `provide` / `inject`

## 本集目標

用 `provide` 和 `inject` 讓上層元件直接把資料交給深處的元件，不用一層一層傳 props。

## 正文

### 問題：props 要穿過很多層

假設 `App.vue` 知道目前登入的使用者叫「小明」，而畫面最深處的 `Greeting` 元件要顯示「你好，小明」。中間隔了一個 `PageLayout`，它自己根本用不到使用者名稱，卻得幫忙宣告 props、再傳下去。

層數一多，每一層都要做這種「路過」的工作，很煩，也很容易漏。這種情形叫做 **prop drilling**（props 層層傳遞）。

### 先看範例

建立 `src/components/Greeting.vue`：

```vue
<script setup>
import { inject } from "vue";

const userName = inject("userName", "訪客");
</script>

<template>
  <p>你好，{{ userName }}</p>
</template>
```

建立 `src/components/PageLayout.vue`，它只是把 `Greeting` 包起來：

```vue
<script setup>
import Greeting from "./Greeting.vue";
</script>

<template>
  <main>
    <Greeting />
  </main>
</template>
```

把 `src/App.vue` 換成：

```vue
<script setup>
import { provide } from "vue";
import PageLayout from "./components/PageLayout.vue";

provide("userName", "小明");
</script>

<template>
  <PageLayout />
</template>
```

畫面顯示「你好，小明」。`PageLayout` 完全沒碰到 `userName`。

### 兩個函式

- `provide(名稱, 值)`：**提供**。上層元件說「我這裡有一份叫 `userName` 的資料」。
- `inject(名稱)`：**注入**。下層元件說「幫我往上找一份叫 `userName` 的資料」。

`inject` 會從自己的父元件開始往上找，找到最近一個 `provide` 了這個名稱的元件，就拿它的值。不管中間隔了幾層都找得到。

反過來不行：`provide` 的資料只有**底下**的元件拿得到，旁邊或上面的元件拿不到。

### 找不到的時候：預設值

`inject` 的第二個引數是預設值。往上找都找不到時，就用它。

把 `Greeting` 直接放在一個沒有 `provide` 的地方試試看，`src/App.vue` 換成：

```vue
<script setup>
import Greeting from "./components/Greeting.vue";
</script>

<template>
  <Greeting />
</template>
```

畫面顯示「你好，訪客」。

沒給預設值又找不到的話，`inject` 會回傳 `undefined`，開發模式下還會在 Console 出現警告。所以如果元件有可能被放在沒有 `provide` 的地方，記得給預設值。

### 會變的資料：提供 `ref`

上面的「小明」是寫死的字串。真實的情況通常是會變的資料，例如網頁的淺色、深色主題。這時候要 `provide` 一個 `ref`，而不是 `.value`。

建立 `src/components/ThemeButton.vue`：

```vue
<script setup>
import { inject } from "vue";

const { theme, toggleTheme } = inject("theme");
</script>

<template>
  <button :class="theme" @click="toggleTheme">
    切換主題（現在是 {{ theme }}）
  </button>
</template>

<style scoped>
.light {
  background: #eee;
  color: #000;
}
.dark {
  background: #222;
  color: #fff;
}
</style>
```

建立 `src/components/ToolBar.vue`，同樣只是路過：

```vue
<script setup>
import ThemeButton from "./ThemeButton.vue";
</script>

<template>
  <div class="toolbar">
    <ThemeButton />
  </div>
</template>
```

把 `src/App.vue` 換成：

```vue
<script setup>
import { ref, provide } from "vue";
import ToolBar from "./components/ToolBar.vue";

const theme = ref("light");

function toggleTheme() {
  theme.value = theme.value === "light" ? "dark" : "light";
}

provide("theme", { theme, toggleTheme });
</script>

<template>
  <p>目前主題：{{ theme }}</p>
  <ToolBar />
</template>
```

按一下按鈕，按鈕變成深色，上面的「目前主題」也變成 dark。

這個範例有三個重點：

1. **提供的是 `theme` 這個 `ref` 本身**，不是 `theme.value`。如果寫 `provide("theme", theme.value)`，交出去的只是當下的字串 `"light"`，之後就不會變了。這和第 1 集「解構出來的 prop 要包成 getter」是同一個道理：要交出「會變的東西」，不是「當下的值」。
2. **連同修改的函式一起提供。** 資料放在 `App.vue`，修改它的 `toggleTheme` 也寫在 `App.vue`，下層元件只負責呼叫。之後想知道主題是在哪裡被改的，只要看 `App.vue` 就好。
3. **一次提供一個物件**，裡面放 `theme` 和 `toggleTheme`，下層用解構拿出來。物件裡的 `theme` 是 `ref`，解構出來還是同一個 `ref`，所以模板裡的 `{{ theme }}` 會自動解包、也會跟著更新。

### 什麼時候用

`provide` / `inject` 很方便，但資料從哪裡來會變得比較不明顯：看 `ThemeButton.vue`，你只知道它要了一份叫 `theme` 的東西，得往上翻才知道是誰給的。

所以：

- 只隔一兩層，用 props 就好，最直接、最容易追。
- 很多元件、很深的地方都需要同一份資料，例如主題、目前登入的使用者、語言設定，才是 `provide` / `inject` 的好時機。
- 如果是整個網站到處都要用、而且會被很多地方修改的資料，第 8 章的 Pinia 是更好的選擇。

### 兩個小規則

`inject` 和第 6 章的 composable 一樣，要在 `<script setup>` 的最上層直接呼叫，不能放在 `setTimeout` 或按鈕的事件處理函式裡。

名稱用字串很方便，但專案一大，兩個元件可能剛好取了一樣的名稱而互相蓋掉。第 10 章學 TypeScript 時，會介紹用 `InjectionKey` 當名稱的做法，同時也能讓編輯器知道 `inject` 拿到的是什麼型別。

整個 app 都要用的資料，也可以在 `src/main.js` 用 `app.provide` 提供，效果等於在最上層元件 `provide`。原本檔案最上面的其他 `import`（例如 CSS）照樣留著，只要把建立 app 的部分改成這樣：

```js
import { createApp } from "vue";
import App from "./App.vue";

const app = createApp(App);
app.provide("siteName", "我的商店");
app.mount("#app");
```

原本一行寫完的 `createApp(App).mount("#app")` 拆成了兩步：先把建立好的應用程式存進 `app` 變數，在 `app.mount()` 之前呼叫 `app.provide()`。任何元件都可以用 `inject("siteName")` 拿到「我的商店」。

## 重點整理

- `provide(名稱, 值)` 讓底下所有元件都能用 `inject(名稱)` 拿到資料，中間的元件不用經手。
- `inject` 往上找最近的 `provide`；找不到時用第二個引數當預設值。
- 要讓資料會變，`provide` 的是 `ref` 本身，不是 `.value`。
- 把修改資料的函式一起提供，讓資料只在提供它的元件裡被改。
- 只隔一兩層時用 props 就好，不必急著用 `provide` / `inject`。
