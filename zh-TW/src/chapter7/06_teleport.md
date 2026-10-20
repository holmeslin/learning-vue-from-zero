# `<Teleport>`

## 本集目標

用 `<Teleport>` 把元件裡的一段畫面搬到 HTML 的其他位置，讓對話框不會被父元素的 CSS 影響。

## 正文

### 問題：對話框被切掉了

對話框（modal）通常是某個按鈕元件的一部分：按鈕和它要打開的對話框寫在同一個元件裡，最好管理。可是這樣一來，對話框在 HTML 裡就埋在很深的地方，會被祖先元素的 CSS 影響。

最常見的狀況是祖先元素有 `overflow: hidden`（超出範圍的部分切掉）加上 `transform`（很多動畫效果會用到它）。對話框本來用 `position: fixed` 想固定在整個視窗的正中間，但只要某個祖先有 `transform`，`fixed` 就會改成以那個祖先為準，結果對話框被塞在一個小框框裡，還被切掉一大半。

### 先看範例

建立 `src/components/ModalButton.vue`：

```vue
<script setup>
import { ref } from "vue";

const open = ref(false);
</script>

<template>
  <button @click="open = true">打開對話框</button>

  <Teleport to="body">
    <div v-if="open" class="modal">
      <p>我是對話框，出現在整個畫面正中間。</p>
      <button @click="open = false">關閉</button>
    </div>
  </Teleport>
</template>

<style scoped>
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  padding: 24px;
  color: black;
  background: white;
  border: 1px solid #999;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}
</style>
```

把 `src/App.vue` 換成：

```vue
<script setup>
import ModalButton from "./components/ModalButton.vue";
</script>

<template>
  <div class="box">
    <p>這個框框有 transform 和 overflow: hidden。</p>
    <ModalButton />
  </div>
</template>

<style>
.box {
  height: 100px;
  overflow: hidden;
  border: 1px solid #ccc;
  transform: translateY(0);
}
</style>
```

按「打開對話框」，對話框出現在整個視窗的正中間，沒有被框框切掉。

打開開發者工具的 Elements 分頁看 HTML，會發現對話框不在 `.box` 裡面，而是在 `<body>` 的最後面（省略了 `data-v-` 標記）：

```text
<body>
  <div id="app">
    <div class="box">
      <p>這個框框有 transform 和 overflow: hidden。</p>
      <button>打開對話框</button>
      <!--teleport start--><!--teleport end-->
    </div>
  </div>
  <div class="modal">
    <p>我是對話框，出現在整個畫面正中間。</p>
    <button>關閉</button>
  </div>
</body>
```

把 `<Teleport to="body">` 拿掉再試一次，就會看到對話框被困在框框裡的樣子。

### `<Teleport>` 做了什麼

`<Teleport>` 是 Vue 內建的元件，不用 `import`。它把裡面的內容「傳送」到 `to` 指定的位置：

- `to` 的值是一個 CSS 選擇器，和第 3 章學的一樣。`"body"` 是 `<body>` 標籤，`"#modals"` 是 `id="modals"` 的元素。
- 原本的位置只留下兩行註解當記號，內容本身搬到了目標的最後面。

搬走的只有 HTML 的位置，**元件之間的關係完全沒變**：

- 對話框還是 `ModalButton` 的一部分，可以直接用 `open`，按「關閉」也能改到它。
- `<style scoped>` 照樣有效。
- props、emit、上一集的 `provide` / `inject`，全部照常運作。

所以你可以照「邏輯上屬於誰」來安排程式碼，再用 `<Teleport>` 決定「畫在哪裡」。

### 傳送到自己準備的位置

`to="body"` 最簡單。如果你想把所有對話框集中放在某個地方，可以在專案根目錄的 `index.html` 裡，`<div id="app">` 的旁邊多放一個空的元素：

```html
<div id="app"></div>
<div id="modals"></div>
```

然後寫 `<Teleport to="#modals">`。要注意，目標元素必須在 `<Teleport>` 出現之前就已經在畫面上，所以放在 `index.html` 裡最保險。

### 有時候不想傳送：`disabled`

`disabled` 為 `true` 時，內容就留在原地，不傳送：

```vue,ignore
<Teleport to="body" :disabled="isMobile">
```

例如在手機上，你可能想讓它直接出現在原本的位置。

### 真正的對話框還要更多

這一集的範例只示範位置。正式網站的對話框還要處理：按 Esc 關閉、打開時把鍵盤焦點移進去、關閉後焦點回到原本的按鈕，讓只用鍵盤或螢幕閱讀器的使用者也能操作。附錄一介紹的 UI 元件庫都有現成的對話框元件，它們內部用的也是 `<Teleport>`。

## 重點整理

- `<Teleport to="body">` 把裡面的內容搬到 `<body>` 的最後面。
- 用來避開祖先元素的 `overflow`、`transform`、`z-index` 等 CSS 影響，常用在對話框、提示訊息。
- 只搬 HTML 的位置，資料、事件、scoped style、`provide` / `inject` 都照常運作。
- `to` 是 CSS 選擇器，目標元素必須先存在；`disabled` 可以暫時不傳送。
