# 為什麼要用 TypeScript

## 本集目標

看懂 TypeScript 解決了什麼問題，以及它在 Vue 專案裡的位置。

## 正文

### 一個沉默的錯誤

先看一段 JavaScript：

```js
const user = { name: "小明", age: 20 };
console.log(user.nmae);
```

你一眼就看出來了：`name` 被打成 `nmae`。但電腦不覺得這是錯，它只會印出：

```text
undefined
```

沒有錯誤訊息，程式繼續往下跑。這個 `undefined` 可能流到畫面上，顯示成一片空白；也可能被拿去做別的事，在三個函式之後才出錯。等你發現的時候，已經很難找出源頭了。

在 Vue 裡也一樣。假設父元件傳了一個 prop：

```vue
<template>
  <UserCard nmae="小明" />
</template>
```

`UserCard` 要的是 `name`，你傳的是 `nmae`。畫面上名字的位置變成空的，程式照樣跑，建置也照樣成功。

小程式還能一眼看出來。但專案有幾百個檔案、好幾個人一起寫的時候，這種錯字、型別搞混、漏傳參數的錯誤，就是 bug 的大宗。

### TypeScript 怎麼處理

同樣那兩行，放進 TypeScript 檔案（副檔名從 `.js` 換成 `.ts`），**內容完全不用改**，編輯器就會在 `nmae` 底下畫紅線，錯誤訊息是：

```text
Property 'nmae' does not exist on type '{ name: string; age: number; }'.
```

意思是「`{ name: string; age: number; }` 這種物件裡，沒有叫 `nmae` 的屬性」。程式還沒執行，錯字就被抓到了。前面那個 `<UserCard nmae="小明" />` 也逃不掉：TypeScript 會告訴你 `UserCard` 要的 `name` 沒有傳，第 7 集會看到。

注意一件事：你沒有寫任何型別，TypeScript 是自己從 `{ name: "小明", age: 20 }` 看出 `user` 有一個字串的 `name` 和一個數字的 `age`。這叫**型別推論**（type inference），第 4 集會詳細講。

### TypeScript 是什麼

- TypeScript = JavaScript + 型別。所有 JavaScript 都是合法的 TypeScript。
- 純 TypeScript 檔案的副檔名是 `.ts`。在 `.vue` 檔裡，把 `<script setup>` 改成 `<script setup lang="ts">`，裡面就能寫 TypeScript。
- 瀏覽器**看不懂** TypeScript。Vite 建置專案時，會把型別整個拿掉，變成普通的 JavaScript 才送給瀏覽器。所以型別只在你寫程式的時候有用，不會讓網頁變慢，也不會多佔空間。
- 型別不會在執行時保護你。它是「寫程式時的檢查」。如果資料是從網路抓來的，TypeScript 沒辦法保證它真的長得像你說的那樣，這一點要記著。

### 檢查是誰在做

既然 Vite 只負責「拿掉型別」，那檢查是誰做的？有兩個地方：

1. **編輯器**：VS Code 一邊打字一邊檢查，有問題就畫紅線。這是你最常看到錯誤的地方。
2. **指令**：`vue-tsc` 這個工具會把整個專案檢查一遍，把所有錯誤列在終端機裡。下一集會用到。

### 為什麼現在學

Vue 本身就是用 TypeScript 寫的，官方文件的範例都有 TypeScript 版本，Pinia、Vue Router、Nuxt 也都對 TypeScript 支援得很好。網路上找到的 Vue 範例，現在大多是 `<script setup lang="ts">`。就算你自己不寫，也要看得懂。

好消息是，你前面學的 Vue 寫法完全不用改。這一章只是在你已經會的東西上，補上「這是什麼型別」的說明。

## 重點整理

- JavaScript 的錯字和型別錯誤，常常不會報錯，要到執行時才出問題。
- TypeScript 在 JavaScript 上加了型別，編輯器在你寫的時候就會標出錯誤。
- `.ts` 檔和 `<script setup lang="ts">` 最後都會被轉成 JavaScript，型別在執行時不存在。
- 檢查型別的是編輯器和 `vue-tsc`，不是 Vite。
