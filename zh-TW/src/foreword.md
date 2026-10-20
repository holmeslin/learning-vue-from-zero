# 前言

這是一本給完全沒寫過程式的人看的 Vue 教學。

Vue 是很受歡迎的網頁介面工具，以容易上手出名。但是市面上的 Vue 教學幾乎都假設你已經會 JavaScript、HTML 和 CSS，零基礎的人常常第一頁就卡住。這本書不假設你會任何東西：從怎麼安裝工具、怎麼印出第一行字開始，一路教到 Vue、Pinia、Vue Router、TypeScript、測試，最後是 Nuxt。

## 這本書怎麼安排

全書分成兩部：

- **第一部**先用三章把 JavaScript、HTML 和 CSS 補到「剛好夠寫 Vue」的程度，接著從第 4 章開始教 Vue 本身。第一部讀完，你就能用 Vue 做出有互動、有路由、有測試的網頁。
- **第二部**教 Nuxt。它是建立在 Vue 上的框架，讓你的程式碼也能在伺服器上執行。這一部會用到 TypeScript，所以第一部第 10 章的 TypeScript 請不要跳過。

每一集都很短，只講一個觀念，固定分成「本集目標」、「正文」、「重點整理」三段。請照順序讀，因為每一集都建立在前面的基礎上。

## 怎麼讀最有效

**把每個範例自己打一遍，跑起來，再改改看。** 這本書的範例都是可以直接執行的小程式，看懂和做得出來是兩回事，動手是最快的學法。

第 1、2 章的範例用 Node.js 執行；第 3 章直接用瀏覽器開啟 HTML 檔；第 4 章到第 11 章在 create-vue 建立的專案裡執行；第二部則在 Nuxt 專案裡執行。每一章開頭都會說明怎麼準備環境。

## 版本

這本書使用的版本如下。版本不同時，畫面或指令可能會有些微差異。

| 工具 | 版本 |
| --- | --- |
| Node.js | 24.15 以上（LTS） |
| Vue | 3.5 |
| TypeScript | 6.0 |
| Vite | 8 |
| Pinia | 4 |
| Vue Router | 5 |
| Vitest | 4 |
| Nuxt | 4 |

套件管理工具一律用 Node.js 內建的 npm。

## 搭配 AI 一起學

讀的時候遇到不懂的地方，可以問 AI。為了讓 AI 的回答符合你目前的進度、不會一次丟給你一堆還沒學的東西，請先下載這本書的原始檔 [vue-book-src.zip](vue-book-src.zip)，把它連同你的問題一起交給 AI，並告訴它你讀到第幾章第幾集。壓縮檔裡是整本書的原始檔，AI 看了就知道你學到哪裡、還沒學過什麼。

## 授權與回報問題

除非另有標示，本書的文字、圖片與其他非程式碼內容採用 [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/deed.zh-hant) 授權；程式碼範例以 [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/deed.zh-hant) 釋出，可以自由複製、修改與使用。

發現錯字、程式碼跑不起來或哪裡講不清楚，歡迎到 [GitHub](https://github.com/holmeslin/learning-vue-from-zero) 開 issue。每一頁右上角的編輯按鈕可以直接提出修改。
