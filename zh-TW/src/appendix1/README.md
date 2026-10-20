# 附錄一

這個附錄收的是「不屬於主線，但你遲早會碰到」的東西：

- Tailwind CSS：另一種寫樣式的方式，很多現成的專案都在用。
- ESLint、Oxlint 與 Prettier：自動檢查和整理程式碼的工具。
- 看懂 Options API：網路上很多舊文章和舊專案用的寫法。
- 自訂指令：自己做一個像 `v-focus` 這樣的指令。
- render function 與 JSX：不用模板，改用 JavaScript 描述畫面。
- Vue Router 的檔案路由：不用手寫 `routes` 陣列，放檔案就有路由。
- Vapor Mode 預覽：Vue 3.6 正在準備的新編譯模式。
- 生態系簡介：VueUse、TanStack Query，以及幾套 UI 元件庫。

這些內容都是**選讀**，彼此獨立，和主線也沒有先後關係。想到再來查就好，不需要照順序讀，跳著看完全沒問題。

## 怎麼準備

每一集都會在開頭寫出要用哪個指令建立練習專案，例如：

```bash
npm create vue@latest -- appendix-tw --ts
```

建議另外開練習專案來試，不要動到你在主線做的專案。有幾集可以共用同一個練習專案，該集開頭會說明。這些範例大多是把 `src/App.vue` 整個換掉，或是在 `src/components/` 加一個新檔案。

大部分的集數用 TypeScript（`<script setup lang="ts">`），因為你在第 10 章已經學過了。「看懂 Options API」和「render function 與 JSX」兩集用 JavaScript：前者是因為網路上的舊程式碼幾乎都是 JavaScript，後者是因為 JSX 用 JavaScript 寫比較好讀。同一集裡面不會混著用。

## 引號和分號

本書的範例用雙引號、行尾加分號。但是 create-vue 產生的設定檔（例如 `vite.config.ts`）用的是單引號、不加分號，因為它附的 Prettier 設定就是這樣。書上照抄設定檔時會保留它原本的樣子，所以你會看到兩種風格並存。兩種寫法都對，程式跑起來完全一樣，「ESLint、Oxlint 與 Prettier」那一集會說明這是怎麼決定的。

## 撰寫時的版本

這個附錄是 2026 年 10 月寫的，用的是 create-vue 產生的版本：Vue 3.5、Vite 8、Vue Router 5、Tailwind CSS 4。只有「Vapor Mode 預覽」那一集用到 Vue 3.6 的 RC 版本（正式版發布前的候選版），那一集會另外說明。
