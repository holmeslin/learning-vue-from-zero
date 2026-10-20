# 用 create-vue 建立專案

## 本集目標

用 create-vue 建立一個 Vue 專案，在瀏覽器裡看到它跑起來，並且在 VS Code 裝好 Vue 的擴充功能。

## 正文

### 為什麼需要「專案」

第 3 章你寫過 HTML 檔，用瀏覽器直接打開就能看。但 Vue 的程式碼有兩件事瀏覽器自己做不到：

- 瀏覽器看不懂 `.vue` 檔。第 3 章最後看到的那種「上面 `<script setup>`、下面 `<template>`」的檔案，要先經過工具翻譯成一般的 JavaScript。
- 一個 Vue 程式通常會拆成很多檔案，還會用到別人寫好的套件，需要有工具把它們整理在一起。

這些整理工作交給 **Vite**（唸作「vit」，法文的「快」）。它是一個開發工具，做兩件事：

1. 開發的時候，幫你架一個本機的小伺服器，你存檔後瀏覽器會馬上更新。
2. 要發布的時候，把所有檔案打包成瀏覽器看得懂、而且體積小的版本，這個動作叫**建置**（build）。

你不需要懂它的內部運作，只要會用幾個指令就好。

而 **create-vue** 是 Vue 官方的專案產生器：你回答幾個問題，它就幫你產生一個已經設定好 Vite 的 Vue 專案。

### 建立專案

打開 VS Code，確認開啟的是 `learning-vue` 資料夾，打開終端機（「檢視」→「終端機」），輸入：

```bash
npm create vue@latest
```

意思是「用最新版的 create-vue 建立一個 Vue 專案」。

第一次執行時，npm 可能會先問你要不要下載 create-vue：

```text
Need to install the following packages:
create-vue@3.24.0
Ok to proceed? (y)
```

版本號碼可能和這裡不同。直接按 Enter 同意。

接著 create-vue 會一題一題問你。它會依照你電腦的語言顯示中文或英文，問題的順序是一樣的。下面用中文版說明，括號裡附上英文版的文字。

**第一題：專案名稱**（Project name）

```text
◆  請輸入專案名稱：
│  vue-project
```

輸入 `hello-vue`，按 Enter。create-vue 會在 `learning-vue` 裡建立一個同名的資料夾，專案的檔案都放在裡面。

**第二題：要不要用 TypeScript**（Use TypeScript?）

```text
◆  是否使用 TypeScript？
│  ● Yes / ○ No
```

注意，預設選的是 **Yes**。按鍵盤的右方向鍵把圓點移到 **No**，再按 Enter。TypeScript 是 JavaScript 加上型別的版本，第 10 章才會教，第一部都用 JavaScript。

**第三題：要包含哪些功能**（Select features to include in your project）

```text
◆  請選擇要包含的功能： (↑/↓ 切換，空格選擇，a 全選，enter 確認)
│  ◻ JSX 支援
│  ◻ Router（單頁應用程式開發）
│  ◻ Pinia（狀態管理）
│  ◻ Vitest（單元測試）
│  ◻ 端對端測試
│  ◻ Linter（錯誤預防）
│  ◻ Prettier（程式碼格式化）
```

這一題可以複選：上下方向鍵移動，空白鍵打勾。**這裡全部都不要勾**，直接按 Enter。Router、Pinia、Vitest 都是後面章節的主角，到時候會另外說明怎麼加進來；現在先保持專案單純。

**第四題：試驗性的功能**（Select experimental features to include in your project）

```text
◆  請選擇要包含的試驗特性： (↑/↓ 切換，空格選擇，a 全選，enter 確認)
│  ◻ 使用 Oxfmt 替代 Prettier
│  ◻ Vue 3.6（發行候選版本）
```

一樣全部不勾，直接按 Enter。這本書用的是正式版的 Vue 3.5。

**第五題：要不要跳過範例程式碼**（Skip all example code and start with a blank Vue project?）

```text
◆  跳過所有範例程式碼，建立一個空白的 Vue 專案？
│  ○ Yes / ● No
```

預設是 No，直接按 Enter。保留範例，等一下才有東西可以看；第 3 集會教你自己把它清乾淨。

回答完，create-vue 會告訴你接下來要做什麼：

```text
└  專案建置完成，可執行以下命令：

   cd hello-vue
   npm install
   npm run dev
```

下面還有一段關於 Git 的建議，這本書用不到，不用理它。

### 安裝套件、啟動開發伺服器

照著它說的，依序輸入這三行，每輸入一行按一次 Enter，等它跑完再輸入下一行：

```bash
cd hello-vue
npm install
npm run dev
```

- `cd hello-vue`：讓終端機「走進」`hello-vue` 資料夾。之後的指令都要在專案資料夾裡下。
- `npm install`：把專案需要的套件（Vue、Vite 等等）下載到 `node_modules` 資料夾。create-vue 只產生了專案的檔案，套件要靠這一步才會裝好。跑完會看到類似 `added 120 packages` 的訊息，數字不同沒關係。
- `npm run dev`：啟動開發伺服器。

最後終端機會印出類似這樣的訊息：

```text
  VITE v8.3.4  ready in 441 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  Vue DevTools: Open http://localhost:5173/__devtools__/ as a separate window
  ➜  Vue DevTools: Press Option(⌥)+Shift(⇧)+D in App to toggle the Vue DevTools
```

版本號碼和毫秒數可能和你的不同。後面兩行 Vue DevTools 是除錯工具，第 14 集會用到。

### 在瀏覽器看看

用瀏覽器打開 <http://localhost:5173/>，你會看到範例的歡迎頁：上面有 Vue 的綠色標誌和一行大字「You did it!」，下面是幾段介紹文件和工具的文字。

恭喜，你的第一個 Vue 程式已經在跑了。這個網址只有你自己的電腦連得到，所以不用擔心別人看到。

### 用 VS Code 打開專案

現在改成直接打開專案資料夾：選單「檔案」→「開啟資料夾」，選 `learning-vue` 裡面的 `hello-vue`。這樣 VS Code 左邊會直接列出專案的檔案，之後開的終端機也會自動站在專案資料夾裡。

剛才的開發伺服器是在舊的視窗裡跑的，換資料夾之後就停了。在新視窗打開終端機，再輸入一次：

```bash
npm run dev
```

### 安裝 Vue (Official) 擴充功能

VS Code 本身不認得 `.vue` 檔，打開會是一片沒有顏色的文字，也不會提醒你哪裡寫錯。Vue 官方做了一個擴充功能來補上這件事，名字叫 **Vue (Official)**。

打開 `hello-vue` 資料夾時，VS Code 右下角通常會跳出一個提示，問你要不要安裝這個專案建議的擴充功能。這是 create-vue 在專案裡放了一份推薦清單的關係。按「安裝」就好。

如果沒看到提示，或是不小心關掉了，可以手動安裝：

1. 點 VS Code 左邊工具列的「擴充功能」圖示（四個方塊的那個），或按 Ctrl+Shift+X（Mac 是 Command+Shift+X）。
2. 在搜尋框輸入 `Vue (Official)`。
3. 找到發行者是 **Vue** 的那一個，按「安裝」。

裝好之後打開 `src/App.vue`，程式碼會有顏色，滑鼠移到程式碼上也會出現說明。

### 改一個字試試看

歡迎頁那行「You did it!」寫在 `src/App.vue` 裡。打開它，找到 `You did it!`，改成 `我做到了！`，存檔。瀏覽器的畫面會馬上變，不用重新整理。

### 停止與重新啟動

開發伺服器會一直跑著。要停止的話，在終端機按 Ctrl+C。

之後要再開始練習時，用 VS Code 打開 `hello-vue` 資料夾，在終端機輸入：

```bash
npm run dev
```

就會重新啟動，網址一樣是 <http://localhost:5173/>。`npm install` 只有第一次需要，之後不用再跑。

## 重點整理

- Vite 是開發工具，負責架開發伺服器、建置專案；create-vue 是 Vue 官方的專案產生器。
- 在 `learning-vue` 裡執行 `npm create vue@latest`，專案名稱填 `hello-vue`，TypeScript 選 No，其他功能全部不選。
- `cd hello-vue`、`npm install` 安裝套件，`npm run dev` 啟動開發伺服器，在 <http://localhost:5173/> 看結果，按 Ctrl+C 停止。
- 在 VS Code 安裝 Vue (Official) 擴充功能，`.vue` 檔才會有顏色和錯誤提示。
- 存檔後瀏覽器會自動更新，不用重新整理。
