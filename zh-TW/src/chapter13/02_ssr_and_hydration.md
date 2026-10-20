# SSR 與 hydration

## 本集目標

知道伺服器端渲染（SSR）送了什麼給瀏覽器，以及 hydration 是怎麼讓那份 HTML 動起來的。

## 正文

### 看看伺服器送來的 HTML

建立 `app/pages/counter.vue`，一個第 5 章就會寫的計數器：

```vue
<script setup lang="ts">
const count = ref(0);
</script>

<template>
  <h1>計數器</h1>
  <p>按了 {{ count }} 次</p>
  <button @click="count++">+1</button>
</template>
```

打開 `http://localhost:3000/counter`，按幾下按鈕，一切正常。

現在用第 12 章學過的方法看原始碼：在網址列輸入 `view-source:http://localhost:3000/counter`（或在頁面上按右鍵，選「檢視網頁原始碼」）。這裡顯示的是**伺服器送來的原始 HTML**，還沒經過任何 JavaScript 處理。

原始碼很長，而且全部擠在同一行。按 Ctrl+F（Mac 按 ⌘F）搜尋「按了」，會找到這一段（下面幫你換行排好了）：

```text
<div id="__nuxt">
  <!--[--><h1>計數器</h1><p>按了 0 次</p><button>+1</button><!--]-->
</div>
```

`<h1>`、`<p>`、`<button>` 都已經在 HTML 裡了。也就是說，瀏覽器還沒執行任何 JavaScript，就已經拿到完整的畫面。

`<!--[-->`、`<!--]-->` 是 Vue 留下的註解記號，給等一下的 hydration 用，不用管它。

### 和第一部比一比

第 12 章第 1 集看過，第一部 Vite 專案的原始碼裡，`<div id="app">` 是空的。那時候的流程是：瀏覽器拿到一個空的 `<div>`，下載 JavaScript，執行 Vue，Vue 再把畫面建出來。在 JavaScript 跑完之前，使用者看到的是一片空白。

Nuxt 則是在伺服器上先把元件跑一次，把結果做成 HTML 送出去。這種做法叫**伺服器端渲染**（server-side rendering，簡稱 **SSR**）。第 12 章已經用過這個詞，這一章要看清楚它到底做了什麼、後面還接著發生什麼事。

SSR 的好處：

- **畫面出來得快**：瀏覽器一拿到 HTML 就能顯示，不用等 JavaScript。網路慢或手機效能差的時候差很多。
- **搜尋引擎看得到內容**：Google 的爬蟲、社群網站的連結預覽，看的都是原始 HTML。第 12 章用 `useHead` 設定的標題和描述能被讀到，也是因為 SSR。

### 光有 HTML 不能動

伺服器送來的 HTML 只是「長得像」計數器。HTML 本身不懂 `@click`，也不知道 `count` 是什麼。

你可以實際看到這件事。在開發者工具裡按 Ctrl+Shift+P（Mac 按 ⌘⇧P），輸入「JavaScript」，選「停用 JavaScript」（Disable JavaScript），然後重新整理頁面：

- 畫面照樣出現「計數器」「按了 0 次」和按鈕，因為這些都在 HTML 裡。
- 按按鈕沒有任何反應，數字一直是 0。

試完記得用同樣的方法選「啟用 JavaScript」（Enable JavaScript）改回來。

### hydration：讓 HTML 活過來

JavaScript 下載完之後，Vue 會在瀏覽器裡**再執行一次同樣的元件**，這就是上一集看到 `setup 執行了` 印兩次的原因。

但這一次 Vue 不會重新建立畫面，因為畫面已經在了。它做的事是：

1. 跑一遍元件，算出「畫面應該長什麼樣子」。
2. 對照頁面上已經存在的 HTML，一個標籤一個標籤對上去。
3. 把 `@click` 這些事件綁到現有的按鈕上，把 `count` 和 `<p>` 連起來。

做完之後，按鈕就能按了，`count` 改變時畫面也會更新。這個「接手伺服器送來的 HTML，讓它變得可以互動」的過程，叫做 **hydration**。

第 12 章提過這個詞，字面意思是「補水」：伺服器送來的 HTML 像一份脫水的乾燥畫面，形狀都在但動不了；瀏覽器的 JavaScript 是水，泡下去之後畫面才活過來。這個詞沒有通用的中文翻譯，大家都直接說 hydration。

### 整個流程

把上一集和這一集合起來：

1. 瀏覽器向伺服器要 `/counter`。
2. 伺服器執行 `counter.vue`，產生 HTML（**SSR**）。
3. 瀏覽器顯示 HTML，使用者已經看得到畫面，但還不能互動。
4. 瀏覽器下載 JavaScript，Vue 再執行一次 `counter.vue`。
5. Vue 把元件對上現有的 HTML，綁好事件（**hydration**）。
6. 畫面可以互動了。

之後點 `NuxtLink` 換到別的頁面時，就不會再跟伺服器要 HTML 了，而是像第一部的 Vue Router 一樣，直接在瀏覽器裡換畫面。SSR 只發生在**第一次打開**或**重新整理**的時候。

### 為什麼這很重要

hydration 有一個前提：**伺服器算出來的畫面，和瀏覽器算出來的畫面要一模一樣**，Vue 才對得上。

計數器沒問題，兩邊算出來都是「按了 0 次」。但如果兩邊算出來不一樣呢？例如資料是隨機的，或是兩邊各抓了一次資料、拿到不同的結果？這就是這一章後面要處理的問題。

## 重點整理

- SSR 是在伺服器上先執行元件，把畫面做成 HTML 送給瀏覽器。
- 用 `view-source:` 可以看到伺服器送來的原始 HTML。
- SSR 讓畫面出來得快，搜尋引擎也看得到內容。
- hydration 是 Vue 在瀏覽器裡再執行一次元件，接手現有的 HTML、綁上事件，讓畫面可以互動。
- hydration 要成功，伺服器和瀏覽器算出來的畫面必須一樣。
