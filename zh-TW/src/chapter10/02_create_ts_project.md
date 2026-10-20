# 用 `--ts` 建立專案與 `vue-tsc`

## 本集目標

建立一個 TypeScript 的 Vue 專案，並用 `npm run type-check` 檢查整個專案的型別。

## 正文

### 建立專案

在你放練習專案的資料夾開終端機，執行：

```bash
npm create vue@latest -- hello-ts --ts --pinia
cd hello-ts
npm install
```

後面的兩個旗標是：

- `--ts`：用 TypeScript。
- `--pinia`：順便裝好 Pinia，第 14 集會用到。

中間那個 `--` 表示「後面的東西原封不動交給 create-vue」，照抄就好。裝完執行 `npm run dev`，會看到和 JavaScript 版一樣的歡迎畫面。這一章的練習都在 `hello-ts` 裡進行。

### 和 JavaScript 專案哪裡不一樣

打開資料夾看看，大部分的檔案你都認得，差別在這幾個：

| 檔案 | 說明 |
| --- | --- |
| `src/main.ts` | 原本的 `main.js`，內容幾乎一樣 |
| `vite.config.ts` | 原本的 `vite.config.js` |
| `tsconfig.json` 等三個檔案 | TypeScript 的設定，現在不用動 |
| `env.d.ts` | 告訴 TypeScript Vite 提供了哪些東西，不用動 |

再打開 `src/components/HelloWorld.vue`，開頭是：

```vue
<script setup lang="ts">
defineProps<{
  msg: string
}>()
</script>
```

`lang="ts"` 表示這個 `<script setup>` 裡寫的是 TypeScript。下面那段 `defineProps<{ msg: string }>()` 是 TypeScript 版的 props 寫法，第 7 集會教。另外你會發現 create-vue 產生的程式碼不加分號、用單引號，這只是風格不同，這本書的範例還是照第 1 章的習慣，用雙引號加分號。

`tsconfig.json` 裡有一個設定值得先知道：`"strict": true`（寫在它引用的設定檔裡），也就是打開嚴格檢查。這一章所有的錯誤訊息，都是在這個設定下出現的。

### 編輯器的支援

用 VS Code 打開 `hello-ts` 時，如果右下角跳出「是否要安裝建議的擴充功能」，選安裝。它推薦的就是第 4 章裝過的 **Vue (Official)**，有了它，`.vue` 檔裡的 TypeScript 才會有紅線和自動完成。

### 第一次檢查

在 `src` 裡建立一個 `practice` 資料夾，再建立 `src/practice/typo.ts`，貼上上一集那兩行：

```ts
const user = { name: "小明", age: 20 };
console.log(user.nmae);
```

VS Code 會立刻在 `nmae` 底下畫紅線，把滑鼠移上去就看得到錯誤訊息。編輯器以外，也可以用指令一次檢查整個專案：

```bash
npm run type-check
```

```text
> hello-ts@0.0.0 type-check
> vue-tsc --build

src/practice/typo.ts:2:18 - error TS2339: Property 'nmae' does not exist on type '{ name: string; age: number; }'.

2 console.log(user.nmae);
                   ~~~~


Found 1 error.
```

前兩行是 npm 告訴你它執行了 `vue-tsc --build`。接下來是錯誤本身：

- `src/practice/typo.ts:2:18`：哪個檔案、第 2 行、第 18 個字。
- `error TS2339`：錯誤編號。上網搜尋時很好用。
- 後面是說明，接著把出錯的那一行印出來，用 `~~~~` 標出位置。
- 最後一行是錯誤的總數。

沒有錯誤的時候，只會印出前兩行，其他什麼都沒有。之後的集數列出錯誤訊息時，會省略這兩行。

把 `nmae` 改回 `name`，再跑一次 `npm run type-check`，錯誤就消失了。

### `vue-tsc` 是什麼

TypeScript 本身附了一個檢查工具叫 `tsc`，但它看不懂 `.vue` 檔。`vue-tsc` 是 Vue 官方做的版本，`.ts` 和 `.vue` 都看得懂，連 `<template>` 裡的錯也檢查得到。create-vue 已經幫你裝好，並在 `package.json` 裡設定成 `type-check` 這個指令。

### 建置時也會檢查

還記得 Vite 只會拿掉型別、不會檢查嗎？所以 create-vue 把 `npm run build` 設定成「同時跑型別檢查和 Vite 建置」，型別有錯就算建置失敗。把 `nmae` 改回來之前執行 `npm run build`，最後會看到：

```text
ERROR: "type-check" exited with 2.
```

意思是「`type-check` 失敗了」。如果你直接執行 `npx vite build`，就只有建置、沒有檢查，型別錯了也照樣建置成功。

### 這一章的做法

- 第 3～6 集練習 TypeScript 本身，檔案都放在 `src/practice` 資料夾，副檔名是 `.ts`。
- 第 7 集開始寫 `.vue` 元件，放在 `src/components`，或直接改 `src/App.vue`。
- 寫完用編輯器的紅線，或 `npm run type-check` 檢查。

有些範例是故意寫錯、用來看錯誤訊息的。看完之後把那個檔案改對或刪掉，不然之後每次執行 `npm run type-check`，都會一直看到它的錯誤。

## 重點整理

- `npm create vue@latest -- 名稱 --ts` 建立 TypeScript 的 Vue 專案。
- `.vue` 檔用 `<script setup lang="ts">` 寫 TypeScript，純 TypeScript 檔用 `.ts`。
- `npm run type-check` 用 `vue-tsc` 檢查整個專案，連模板都會檢查。
- 錯誤訊息的格式是「檔案:行:字 - error 編號: 說明」。
- `npm run build` 會先檢查型別；`npx vite build` 不會。
