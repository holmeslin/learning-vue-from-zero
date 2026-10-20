# Pinia

到第 7 章為止，資料都住在元件裡：自己用的放 `ref`，要給子元件就用 props，要給很深的元件就用 `provide` / `inject`。專案一大，你會發現有些資料不屬於任何一個元件，例如購物車、登入的使用者、網站設定。很多元件都要讀它、改它，硬塞進某個元件裡反而彆扭。

**Pinia** 是 Vue 官方推薦的狀態管理函式庫。它讓你把共用的資料和操作搬到元件外面，放進一個叫 **store** 的地方，哪個元件需要，`import` 進來就能用。

這一章會學到：

- 為什麼 `provide` / `inject` 不夠用，什麼時候該改用 store
- 在專案裡安裝 Pinia
- 用 `defineStore` 寫一個 store
- store 裡的 `state`、`getters`、`actions`，以及它們和 `ref`、`computed`、函式的對應
- 從 store 解構時為什麼會失去響應性，以及怎麼用 `storeToRefs` 解決
- 讓一個 store 使用另一個 store
- 綜合練習：做一個購物車

好消息是，Pinia 幾乎沒有新語法。寫 store 用的，就是你已經會的 `ref`、`computed` 和普通函式，寫起來很像第 6 章的 composable。

## 準備環境

這一章需要一個用 create-vue 建立的 JavaScript 專案。沿用第 4～7 章練習用的專案就可以；想要乾淨一點，也可以照第 4 章的步驟再建立一個新專案，功能選單裡什麼都不要勾。

第 2 集會在這個專案裡安裝 Pinia。之後每一集的範例，都是把檔案放進這個專案的 `src/` 底下，再用 `npm run dev` 打開瀏覽器看結果。
