# 專案結構

## 本集目標

看懂 create-vue 產生的檔案各自的用途，知道 Vue 是怎麼「接」到網頁上的。

## 正文

### 檔案總覽

在 VS Code 左邊展開 `hello-vue`，你會看到這些東西：

```text
hello-vue/
├── .vscode/
├── node_modules/
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/
│   │   ├── base.css
│   │   ├── logo.svg
│   │   └── main.css
│   ├── components/
│   │   ├── icons/
│   │   ├── HelloWorld.vue
│   │   ├── TheWelcome.vue
│   │   └── WelcomeItem.vue
│   ├── App.vue
│   └── main.js
├── index.html
├── jsconfig.json
├── package.json
├── package-lock.json
├── README.md
└── vite.config.js
```

另外還有一個 `.gitignore`，這本書用不到。

你可能會發現 `package-lock.json` 沒有直接列出來，而是收在 `package.json` 底下，旁邊有一個小箭頭；`jsconfig.json` 也收在 `vite.config.js` 底下。這是 create-vue 幫 VS Code 做的設定，把相關的檔案摺在一起，讓清單短一點。點箭頭就能展開。

其中你會天天碰的是 `src/` 資料夾，**你寫的程式碼幾乎都放在這裡**。其他檔案多半設定好之後就不太會動。

### `index.html`：整個網站只有這一頁

打開 `index.html`，最重要的是 `<body>` 裡這兩行：

```html
<div id="app"></div>
<script type="module" src="/src/main.js"></script>
```

Vue 做出來的網頁，HTML 本身幾乎是空的，只有一個 id 是 `app` 的空 `<div>`。畫面上看到的所有東西，都是 Vue 用 JavaScript 放進這個空盒子裡的。

第二行 `<script>` 告訴瀏覽器：載入 `/src/main.js` 這支程式。`type="module"` 的意思是「這個檔案裡會用到 `import` / `export`」。`main.js` 是整個 Vue 程式的起點。

### `src/main.js`：把 Vue 接上網頁

打開 `src/main.js`：

```js
import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

create-vue 產生的檔案用的是單引號，而且行尾沒有分號。第 1 章說過單引號和雙引號意思一樣；行尾的分號在這些地方也可以省略。這本書自己寫的程式碼會用雙引號、加分號，兩種寫法都對，不用改它。

一行一行看：

- `import './assets/main.css'`：載入整個網站共用的樣式檔。這種 `import` 後面沒有變數名稱，意思是「把這個檔案載進來就好，不用拿什麼東西出來」。
- `import { createApp } from 'vue'`：第 2 章提過這一行。它從 `vue` 這個套件裡拿出 `createApp` 函式。`vue` 是剛才 `npm install` 裝進 `node_modules` 的套件，因為是套件而不是自己的檔案，所以路徑前面沒有 `./`。
- `import App from './App.vue'`：匯入你的第一個元件，名字叫 `App`。第 2 章說過，`.vue` 檔不用自己寫 `export`，工具會自動把整個元件變成預設匯出，所以直接 `import App from` 就拿得到。
- `createApp(App)`：用 `App` 這個元件建立一個 Vue 應用程式。
- `.mount('#app')`：把這個應用程式**掛載**（mount）到 `#app` 上。`'#app'` 是第 3 章學過的 CSS 選擇器，指的就是 `index.html` 裡那個 `<div id="app">`。掛載的意思是「把 `App` 畫進這個盒子，之後這塊區域歸 Vue 管」。

這個檔案你**幾乎不會再改**。之後做的事，都是在 `App` 裡面擴充。

### `src/App.vue`：你的第一個元件

`App.vue` 現在裝的是歡迎頁的內容。它是一個**元件**（component），也就是畫面上的一塊，有自己的內容和樣式。`App` 是最外層的那一塊，整個畫面都從它開始。下一集會把它換成自己寫的內容，並且看懂 `.vue` 檔的結構。

### `src/components/` 與 `src/assets/`

- `components/`：放其他元件的資料夾。現在裡面是歡迎頁用到的 `HelloWorld.vue`、`TheWelcome.vue` 等等，下一集會刪掉。之後你自己寫的元件也放這裡。
- `assets/`：放樣式檔、圖片這類資源。`main.css` 就是 `main.js` 第一行載入的那個樣式檔，`base.css` 被 `main.css` 引用，`logo.svg` 是 Vue 的標誌。

### `package.json`：專案的身分證

打開 `package.json`，有兩段值得看：

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
},
```

這是「指令別名」。你輸入 `npm run dev`，npm 就會去執行 `vite`。三個指令的用途：

| 指令 | 用途 |
| --- | --- |
| `npm run dev` | 啟動開發伺服器，平常寫程式用 |
| `npm run build` | 建置成可以發布的版本，輸出到 `dist/` 資料夾 |
| `npm run preview` | 在本機預覽建置後的結果 |

另一段是專案用到的套件：

```json
"dependencies": {
  "vue": "^3.5.42"
},
"devDependencies": {
  "@vitejs/plugin-vue": "^6.0.8",
  "vite": "^8.2.2",
  "vite-plugin-vue-devtools": "^8.2.1"
},
```

`dependencies` 是網站執行時需要的套件，這裡只有 `vue` 本身。`devDependencies` 是只有開發時才需要的工具：`vite`、讓 Vite 看得懂 `.vue` 檔的 `@vitejs/plugin-vue`，以及第 14 集會用到的除錯工具 `vite-plugin-vue-devtools`。

版本號碼前面的 `^` 表示「這個版本以上、但不跨大版本」，所以實際安裝的可能比這裡寫的新，你看到的數字也可能和這裡不同。想知道實際裝了哪個版本，可以在終端機輸入 `npm ls vue`。

### 其他檔案

- `package-lock.json`：記錄每個套件實際裝了哪個版本，npm 自己維護，不用手動改。
- `vite.config.js`：Vite 的設定。裡面啟用了 Vue 的支援和除錯工具，不用動。
- `jsconfig.json`：給 VS Code 看的設定，讓它更了解你的專案，不用動。
- `.vscode/`：給 VS Code 的設定，上一集推薦你安裝擴充功能的清單就放在這裡。
- `public/`：放不需要處理的靜態檔案，網址直接對應，例如 `public/favicon.ico` 在網站上就是 `/favicon.ico`，也就是瀏覽器分頁上的小圖示。
- `node_modules/`：所有下載來的套件。不要改，也不用擔心它的大小。

## 重點整理

- `index.html` 只有一個空的 `<div id="app">`，畫面都是 Vue 放進去的。
- `src/main.js` 用 `createApp(App).mount('#app')` 把 `App` 元件掛載到 `#app` 上，是整個程式的起點。
- 你寫的程式碼放在 `src/` 裡，元件放 `src/components/`。
- `npm run dev` 開發、`npm run build` 建置。
- `node_modules/` 和 `package-lock.json` 都不要手動修改。
