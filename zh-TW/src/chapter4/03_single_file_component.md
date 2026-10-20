# 單一檔案元件

## 本集目標

清掉範例的內容，寫出自己的 `App.vue`，看懂 `.vue` 檔的三個區塊。

## 正文

### 先把範例清乾淨

歡迎頁的內容很多，這本書用不到，先清掉。請**照順序**做下面四件事，順序反過來的話，中途瀏覽器會出現找不到檔案的錯誤（照著做完就會消失，不用緊張）。

第一，把 `src/App.vue` 整個換成：

```vue
<template>
  <h1>哈囉，Vue！</h1>
</template>
```

第二，把 `src/assets/main.css` 整個換成下面這段簡單的樣式：

```css
body {
  font-family: system-ui, "Noto Sans TC", sans-serif;
  max-width: 40rem;
  margin: 2rem auto;
  padding: 0 1rem;
  line-height: 1.6;
}
```

第三，刪掉 `src/components/` **裡面**的所有東西（`icons` 資料夾和三個 `.vue` 檔），但保留 `components` 這個資料夾本身，之後還要用。在 VS Code 左邊的檔案清單裡，對檔案按右鍵選「刪除」就可以。

第四，刪掉 `src/assets/` 裡的 `base.css` 和 `logo.svg`，只留下 `main.css`。

存檔後看瀏覽器，畫面上只剩一行「哈囉，Vue！」。清完之後，`src` 資料夾長這樣：

```text
src/
├── assets/
│   └── main.css
├── components/
├── App.vue
└── main.js
```

### 一個 `.vue` 檔，三個區塊

剛才的 `App.vue` 只有一個區塊。完整的 `.vue` 檔通常有三個，把 `src/App.vue` 換成：

```vue
<script setup>
const message = "這是我的第一個 Vue 元件。";
console.log("App 元件的程式執行了");
</script>

<template>
  <h1>哈囉，Vue！</h1>
  <p>{{ message }}</p>
</template>

<style>
h1 {
  color: #42b883;
}
</style>
```

存檔後，畫面上多了一段文字，標題也變成 Vue 的綠色。

這種把 JavaScript、HTML、CSS 放在同一個檔案裡的寫法，叫做**單一檔案元件**（Single-File Component，簡稱 **SFC**）。一個 `.vue` 檔就是一個元件，三個區塊各管一件事：

| 區塊 | 放什麼 | 對應第幾章學的 |
| --- | --- | --- |
| `<script setup>` | 這個元件的 JavaScript | 第 1、2 章 |
| `<template>` | 這個元件要顯示的內容，也就是**模板** | 第 3 章的 HTML |
| `<style>` | 這個元件的樣式 | 第 3 章的 CSS |

### `<template>`：畫面長什麼樣子

`<template>` 裡寫的幾乎就是 HTML。Vue 會根據它，把內容畫到畫面上。這個「根據模板產生畫面」的過程叫**渲染**（render），之後會常常看到這個詞。

`<template>` 裡可以並排放好幾個元素，像上面的 `<h1>` 和 `<p>`，不用外面再包一層。

`<p>` 裡的 `{{ message }}` 是 Vue 的寫法，意思是「在這裡顯示 `message` 的值」。下一集會詳細介紹。

### `<script setup>`：元件的 JavaScript

`<script setup>` 裡寫的是一般的 JavaScript。在這裡宣告的變數，`<template>` 裡可以直接拿來用，`message` 就是這樣被顯示出來的。

`setup` 這個字不能省略。Vue 有好幾種寫元件的方式，這本書一律用 `<script setup>`，它是目前官方推薦、也最簡潔的寫法。

這裡的程式碼是在**瀏覽器**裡執行的，不是在終端機。所以 `console.log` 印出的文字，要到瀏覽器的開發者工具裡看：按 F12（Mac 是 Option+Command+I），切到「Console」（主控台）分頁，會看到：

```text
App 元件的程式執行了
```

Console 裡可能還有幾行 `[vite]` 開頭的訊息，那是 Vite 自己印的，不用管它。之後畫面出問題時，第一件事就是打開 Console 看有沒有紅色或黃色的訊息。

### `<style>`：元件的樣式

`<style>` 裡寫的就是 CSS。不過現在這樣寫，`h1 { color: ... }` 會套用到**整個網站**的所有 `<h1>`，不只這個元件。第 13 集會教你怎麼讓樣式只影響自己的元件。

### 三個區塊的規則

- 三個區塊都不是必要的。只有畫面、沒有程式和樣式的元件，只寫 `<template>` 也可以，就像這一集一開始那樣。
- 每個 `.vue` 檔最多只能有一個 `<template>` 和一個 `<script setup>`。
- 區塊的順序 Vue 不在意。這本書照官方的慣例，依序寫 `<script setup>`、`<template>`、`<style>`。

### 元件的名字就是檔名

`App.vue` 這個元件的名字就是 `App`。Vue 的元件名稱習慣**每個英文字的開頭大寫**，例如 `App`、`ProductCard`、`UserProfile`，這種寫法叫 PascalCase。檔名也照這個規則取。第 6 集建立新元件時會用到。

## 重點整理

- 範例清掉後，`src` 裡只剩 `main.js`、`App.vue`、`assets/main.css` 和空的 `components/`。
- `.vue` 檔叫單一檔案元件（SFC），一個檔案就是一個元件。
- `<script setup>` 放 JavaScript，`<template>` 放模板，`<style>` 放 CSS。
- `<script setup>` 裡宣告的變數，可以直接在 `<template>` 裡用。
- 元件的程式在瀏覽器執行，`console.log` 要到瀏覽器的 Console 看。
