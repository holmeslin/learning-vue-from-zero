# 寫作慣例與術語表

這份文件給所有寫內容的人看，包括作者、貢獻者，以及協助產生內容的 AI。

## 讀者

完全沒寫過程式的人。不要假設讀者知道任何術語；第一次出現的術語都要解釋。

## 每一集的結構

每一集是 `zh-TW/src/chapterN/##_topic.md` 一個檔案，固定三段：

```markdown
# 標題

## 本集目標

一句話說明這一集學完會做到什麼。

## 正文

口語化的說明，搭配可以直接執行的小範例。

## 重點整理

- 三到五條，每條一句話。
```

- 一集只講一個觀念。講不完就拆成兩集，不要塞。
- 範例要小，要能單獨執行。讀者應該能把範例整段複製到自己的檔案裡跑起來。
- 新觀念先給範例、再解釋，不要先講定義。
- 盡量只用讀者已經學過的東西。真的需要用到後面才教的語法，就明講「這個後面會教，現在先照抄」。
- 章節開頭的 `README.md` 說明這一章要學什麼、為什麼要學。

## 程式碼區塊

- JavaScript 用 `js`，TypeScript 用 `ts`，`.vue` 單一檔案元件（不論 `<script setup>` 有沒有加 `lang="ts"`）用 `vue`。附錄講 JSX 時才用 `jsx`。
- 終端機指令用 `bash`，執行結果用 `text`。
- 這些語言的區塊會在 CI 檢查語法：`js` / `ts` / `jsx` 用 esbuild，`vue` 用 `@vue/compiler-sfc`。語法不完整的片段、或故意寫錯來示範錯誤訊息的區塊，在語言後面加 `,ignore`，例如 ` ```js,ignore `。語法正確、只是執行或建置時才會出錯的示範可以不加。
- 範例裡的變數名稱用英文，字串內容和註解用繁體中文。
- 自己寫的 JS / TS 用雙引號加分號；模板（`<template>` 裡的屬性值與 `{{ }}`）裡的字串用單引號。照抄 create-vue / create-nuxt 產生的檔案時保留原樣（單引號、無分號）。
- 每行不超過 80 個字元，避免網頁上出現橫向捲軸。
- 語法檢查抓不到執行時的錯。新寫的範例要放進用 `npm create vue@latest`（第二部用 `npm create nuxt@latest`）建立的真專案跑過，確認畫面和書上說的一樣。
- 版本以 `OUTLINE.md` 鎖定的為準，不要用還沒正式發布的 API。

## 用詞

- 全部用台灣慣用的繁體中文。標點用全形，但程式碼和英文術語之間用半形空格隔開，例如「用 `const` 宣告」。
- 專有名詞保留英文：Vue、Nuxt、Pinia、SFC、Hook（生命週期 Hook）、Promise、DOM、API。
- Vue 的 API 名稱與特有概念保留英文：`ref`、`reactive`、`computed`、`watch`、props、emit、slot、composable、store。寫成 API 名稱時用程式碼格式（`ref`），當概念講時不用（props、slot）。
- 其他術語用下表的中文；第一次出現時在括號裡附英文原文，例如「元件（component）」。
- 口氣：像朋友在旁邊講解，用「你」稱呼讀者。不要用「我們來看看」這種空話開頭，直接講。

### 術語表

| 英文 | 用這個 | 不要用 |
| --- | --- | --- |
| component | 元件 | 組件 |
| render | 渲染 | |
| state | 狀態（Pinia 的 `state` 保留英文） | 狀態值 |
| function | 函式 | 函數、方法（method 才叫方法） |
| variable | 變數 | 變量 |
| constant | 常數 | |
| string | 字串 | 字符串 |
| number | 數字 | 數值 |
| boolean | 布林值 | 布爾值 |
| array | 陣列 | 數組 |
| object | 物件 | 對象 |
| property | 屬性 | |
| parameter / argument | 參數 / 引數 | |
| return | 回傳 | 返回 |
| call | 呼叫 | 調用 |
| loop | 迴圈 | 循環 |
| print（console.log） | 印出 | 打印、輸出 |
| file | 檔案 | 文件 |
| folder / directory | 資料夾（「根目錄」「專案根目錄」是台灣慣用語，可以用） | 文件夾、目錄 |
| code | 程式碼 | 代碼 |
| program | 程式 | 程序 |
| software | 軟體 | 軟件 |
| data | 資料 | 數據 |
| default | 預設 | 默認、缺省 |
| terminal | 終端機 | 終端、命令行 |
| run / execute | 執行 | 運行 |
| install | 安裝 | |
| package | 套件 | 包 |
| module | 模組 | 模塊 |
| library | 函式庫 | 庫 |
| framework | 框架 | |
| build | 建置 | 構建 |
| create | 建立 | 創建 |
| configure / settings | 設定 | 配置 |
| user | 使用者 | 用戶 |
| interface（UI） | 介面 | 界面 |
| network | 網路 | 網絡 |
| information | 資訊 | 信息 |
| screen | 螢幕 | 屏幕 |
| mouse / click | 滑鼠 / 點 | 鼠標 / 點擊 |
| memory | 記憶體 | 內存 |
| support | 支援 | 支持 |
| optimize | 最佳化 | 優化 |
| implement | 實作 | 實現 |
| quality | 品質 | 質量 |
| video | 影片 | 視頻 |
| template literal | 樣板字面值 | 模板字串 |
| strict equality | 嚴格相等 | |
| callback | 回呼函式、callback | 回調 |
| event | 事件 | |
| browser | 瀏覽器 | |
| tag（HTML） | 標籤 | |
| attribute（HTML） | 屬性 | |
| reactivity / reactive | 響應式 | 反應式 |
| directive | 指令 | |
| template（Vue 的模板） | 模板 | 範本（避免和「樣板字面值」混淆） |
| template（專案範本，例如 create-nuxt 的 minimal） | 範本 | 模板 |
| lifecycle | 生命週期 | 生命周期 |
| watch（動作） | 監聽 | 偵聽、侦听 |
| mount | 掛載 | |
| two-way binding | 雙向綁定 | 雙向繫結 |
| route / router | 路由 | |
| navigation guard | 導覽守衛 | 導航守衛 |
| server-side rendering | 伺服器端渲染（SSR） | 服務端渲染 |
| hydration | hydration（保留英文，第一次出現時解釋） | 水合、注水 |
| auto-import | 自動匯入 | 自動導入 |
| shortcut（keyboard） | 快速鍵 | 快捷鍵 |
| console（瀏覽器開發者工具的分頁） | Console（第一次出現註明「主控台」） | 控制台 |

寫完可以用 zhtw 之類的工具再掃一次，抓漏網的中國大陸用語。zhtw 會建議把「模板」改成「範本」，本書刻意用「模板」（見術語表），這個警告可以忽略。
