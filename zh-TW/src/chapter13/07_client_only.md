# `<ClientOnly>`

## 本集目標

用 `<ClientOnly>` 把只能在瀏覽器執行的元件包起來，伺服器先顯示替代內容。

## 正文

### 整個元件都只能在瀏覽器跑

第 1 集看過，setup 裡直接讀 `window` 會讓伺服器出錯，當時的修法是把它搬進 `onMounted`。只有一兩行的時候這樣很方便，但有時候是**整個元件**都離不開瀏覽器，例如：

- 元件裡到處都在讀 `window`、`localStorage`。
- 用了別人寫的套件（地圖、圖表、編輯器），那個套件一載入就去找 `document`，你沒辦法改它的程式碼。

這時候與其一行一行搬進 `onMounted`，不如直接告訴 Nuxt：「這個元件不要在伺服器上渲染」。

### 用 ClientOnly 包起來

建立 `app/components/WindowWidth.vue`，故意在 setup 裡直接讀 `window`：

```vue
<script setup lang="ts">
const width = window.innerWidth;
</script>

<template>
  <p>視窗寬度：{{ width }}px</p>
</template>
```

建立 `app/pages/width.vue`，用 `<ClientOnly>` 把它包起來：

```vue
<template>
  <h1>你的螢幕</h1>
  <ClientOnly>
    <WindowWidth />
    <template #fallback>
      <p>量測中……</p>
    </template>
  </ClientOnly>
</template>
```

打開 `http://localhost:3000/width`，會看到「視窗寬度：」加上你的瀏覽器寬度。終端機沒有任何錯誤。

再看「檢視網頁原始碼」，搜尋「量測中」：

```text
<h1>你的螢幕</h1><!--[--><p>量測中……</p><!--]-->
```

伺服器送來的 HTML 裡只有「量測中……」，沒有 `WindowWidth` 的內容。

### 它做了什麼

`<ClientOnly>` 是 Nuxt 內建的元件，不用匯入：

- **在伺服器上**：完全不執行裡面的元件，改成渲染 `#fallback` slot 的內容（第 7 章學過具名 slot）。
- **在瀏覽器裡**：hydration 完成、掛載之後，才把 fallback 換成裡面真正的元件。

所以 `WindowWidth` 的 setup 只會在瀏覽器裡跑，讀 `window` 也不會有問題。

`#fallback` 可以不寫，那伺服器就什麼都不顯示。但最好放點東西佔位，例如「載入中」的文字，或和元件差不多大小的空白區塊，不然元件出現時，下面的內容會突然被往下推。

### onMounted 還是 ClientOnly

兩種做法都能避開伺服器，差別在範圍：

| | `onMounted` | `<ClientOnly>` |
| --- | --- | --- |
| 範圍 | 元件裡的一小段程式 | 整個元件 |
| 伺服器上的 HTML | 元件照樣渲染，只是那個值先用預設值 | 只有 fallback |
| 適合 | 一兩個值要等到瀏覽器才知道 | 整個元件或它用的套件只能在瀏覽器跑 |

能用 `onMounted` 解決的，就用 `onMounted`，因為伺服器還是會渲染元件的其他部分，畫面出來得比較完整。真的整個元件都不行，再用 `<ClientOnly>`。

### 不要什麼都包

`<ClientOnly>` 裡的東西不會出現在伺服器送來的 HTML 裡，等於這一塊放棄了 SSR 的好處：使用者要等 JavaScript 跑完才看得到，搜尋引擎也看不到。

文章內容、商品資訊這種重要的東西，不要放進 `<ClientOnly>`。它適合用在「晚一點出現也沒關係」的小區塊。

## 重點整理

- `<ClientOnly>` 裡的元件只在瀏覽器渲染，伺服器上完全不執行。
- `#fallback` slot 的內容會在伺服器上渲染，瀏覽器掛載完之後被換掉。
- 只有一兩個值要等瀏覽器時，用 `onMounted`；整個元件都只能在瀏覽器跑時，用 `<ClientOnly>`。
- 放進 `<ClientOnly>` 的內容沒有 SSR 的好處，重要內容不要放進去。
