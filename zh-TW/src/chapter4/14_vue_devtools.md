# Vue DevTools

## 本集目標

打開 Vue DevTools，用它看見元件樹，並且檢查每個元件收到的 props。

## 正文

寫 Vue 一定會遇到「為什麼這個畫面是這樣」的疑問。瀏覽器內建的開發者工具只看得到最後產生的 HTML，看不到元件。**Vue DevTools** 是 Vue 官方的除錯工具，讓你直接看到元件，以及每個元件手上的資料。

### 它已經裝好了

用 create-vue 建立的專案，預設就帶有 Vue DevTools。第 2 集看 `package.json` 時，`devDependencies` 裡的 `vite-plugin-vue-devtools` 就是它；`vite.config.js` 裡的 `vueDevTools()` 則是把它啟用。

它只在開發時（`npm run dev`）出現，`npm run build` 建置出來、要給別人看的網站裡不會有它。

### 打開它

先準備一個有幾個元件可以看的畫面。用第 8 集最後的 `ProductCard`，把 `src/App.vue` 換成：

```vue
<script setup>
import ProductCard from "./components/ProductCard.vue";

const products = [
  { id: 1, name: "機械鍵盤", price: 1200, isNew: true },
  { id: 2, name: "無線滑鼠", price: 600, isNew: false },
  { id: 3, name: "螢幕", price: 5000, isNew: false },
];
</script>

<template>
  <ProductCard
    v-for="product in products"
    :key="product.id"
    :name="product.name"
    :price="product.price"
    :isNew="product.isNew"
  />
</template>
```

確認開發伺服器在跑，打開 <http://localhost:5173/>。仔細看畫面的**下方中間**，有一個小小的膠囊形狀按鈕，左邊是 Vue 的標誌，右邊是一個準星圖示。點 Vue 標誌，下方就會展開 Vue DevTools 的面板；再點一次就收起來。

也可以用鍵盤快速鍵開關。快速鍵寫在你執行 `npm run dev` 時終端機印出的訊息裡，例如在 Mac 上是：

```text
  ➜  Vue DevTools: Press Option(⌥)+Shift(⇧)+D in App to toggle the Vue DevTools
```

意思是「在網頁上按 Option+Shift+D 開關 Vue DevTools」。Windows 的按鍵名稱不一樣，以你自己終端機上顯示的為準。

面板太小的話，終端機的另一行訊息也告訴你，可以在新的瀏覽器分頁打開 <http://localhost:5173/__devtools__/>，用整個視窗來看。

### 看元件樹

面板的左邊有一排圖示，打開時預設選的是 **Components**（元件）這一頁，也就是三個圓圈的那個圖示。

中間是一棵樹，列出畫面上所有的元件：

```text
<App>
  <ProductCard key=1>
  <ProductCard key=2>
  <ProductCard key=3>
```

這和你寫的程式碼結構一樣：`App` 在最外面，裡面有三個 `ProductCard`。後面的 `key=1` 就是第 11 集用 `:key` 給的值，可以看出哪一張卡片對應哪一筆資料。上方的「Find components...」搜尋框可以用名稱找元件，元件多的時候很好用。

滑鼠移到樹上的某個元件，網頁上對應的區塊就會被標示出來，旁邊還會顯示元件名稱。

### 檢查 props

在樹上點第一個 `ProductCard`，右邊會顯示這個元件收到的 props：

```text
props
  name: 機械鍵盤
  price: 1200
  isNew: true
```

這是除錯時最常做的事：畫面不對勁的時候，先點進那個元件，看它收到的 props 是不是你以為的值。很多「畫面怎麼是錯的」的原因，只是資料傳錯了，例如第 8 集那種把數字傳成字串的情況，一看 props 就知道。

點 `App`，右邊的 `setup` 底下會列出 `App` 的 `<script setup>` 裡宣告的東西，例如 `products: Array[3]`，點旁邊的小三角形可以展開來看裡面的每一筆資料。下一章學了響應式資料之後，這裡會顯示更多內容，而且資料變動時會即時更新。

### 從畫面找到元件

反過來，看到畫面上的某一塊，想知道它是哪個元件，可以用膠囊按鈕右邊的**準星圖示**。點它之後，滑鼠移到網頁上的任何地方，都會顯示那一塊屬於哪個元件、對應哪個檔案；在那一塊上點一下，會試著用你的編輯器打開那個元件的 `.vue` 檔。

如果點了之後編輯器沒有反應，也沒關係，至少你已經知道是哪個檔案，自己打開就好。

### 瀏覽器擴充功能

除了專案內建的這一套，Vue DevTools 也有瀏覽器擴充功能的版本，在 Chrome 線上應用程式商店搜尋「Vue.js devtools」就找得到。裝了之後，瀏覽器的開發者工具（F12）裡會多一個 Vue 分頁，功能和這一集介紹的差不多。

之後如果碰到沒有內建 Vue DevTools 的 Vue 專案（例如不是用 create-vue 建立的），就可以改用它。這本書的練習都用 create-vue 建立的專案，已經內建，不需要另外安裝。

## 重點整理

- Vue DevTools 是官方的除錯工具，create-vue 建立的專案預設就帶有它，只在開發時出現。
- 點畫面下方中間的 Vue 標誌，或按終端機上顯示的快速鍵，就能開關面板。
- Components 頁可以看元件樹，點選元件能檢查它收到的 props。
- 準星圖示可以從畫面上的某一塊找到對應的元件和檔案。
- 畫面不對勁時，先檢查元件收到的 props 是不是你預期的值。
