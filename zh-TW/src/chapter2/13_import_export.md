# `import` 與 `export`

## 本集目標

把程式碼拆成多個檔案，並且在檔案之間互相使用。

## 正文

### 為什麼要拆檔案

程式一大，全部塞在一個檔案裡根本找不到東西。JavaScript 讓你把程式碼拆成多個檔案，每個檔案叫一個**模組**（module），檔案之間用 `export`（匯出）和 `import`（匯入）互相取用。

Vue 專案裡，每個元件是一個檔案，檔案之間全靠 `import` 串起來，所以這一集的內容你會天天用到。

### 準備：用 `.mjs` 副檔名

這一集的範例有兩個檔案。在 `learning-vue` 資料夾裡，檔名請用 `.mjs`（不是 `.js`）。`.mjs` 是告訴 Node.js「這個檔案是用 `import` / `export` 寫的」。

> 到了第 4 章用 create-vue 建立專案之後，工具會幫你處理好，副檔名就回到 `.js`，元件則是 `.vue`。`.mjs` 只是直接用 Node.js 練習時才需要。

### 具名匯出

先建立 `math.mjs`，在想匯出的東西前面加 `export`：

```js
// 檔案：math.mjs
export const PI = 3.14;

export function add(a, b) {
  return a + b;
}

export const double = (n) => n * 2;
```

再建立 `main.mjs`，用 `import` 把它們拿進來：

```js
// 檔案：main.mjs
import { PI, add, double } from "./math.mjs";

console.log(PI);
console.log(add(3, 4));
console.log(double(5));
```

在終端機執行：

```bash
node main.mjs
```

```text
3.14
7
10
```

說明：

- `import { PI, add, double }`：大括號裡寫你要拿的名字，必須和匯出時的名字一模一樣。
- `from "./math.mjs"`：從哪個檔案拿。`./` 表示「同一個資料夾」，**一定要寫**，而且 Node.js 要求寫完整的副檔名。
- 沒被 `export` 的東西，別的檔案看不到。這讓你可以把檔案內部用的細節藏起來。

### 預設匯出

一個檔案如果「主要就是一個東西」，可以用 `export default`，每個檔案最多一個：

```js
// 檔案：greet.mjs
export default function greet(name) {
  return `你好，${name}！`;
}
```

匯入時**不用大括號**，名字也可以自己取：

```js
// 檔案：main2.mjs
import greet from "./greet.mjs";

console.log(greet("小明"));
```

```bash
node main2.mjs
```

```text
你好，小明！
```

因為名字是匯入的人決定的，`import hello from "./greet.mjs"` 也一樣能運作。這個彈性有時是好事，有時會造成混亂：同一個東西在不同檔案裡被取了不同的名字。

### 兩種混用、改名

一個檔案可以同時有預設匯出和具名匯出：

```js
// 檔案：tools.mjs
export default function main() {
  return "主要功能";
}

export const VERSION = "1.0";
```

```js
// 檔案：main3.mjs
import main, { VERSION } from "./tools.mjs";

console.log(main(), VERSION);
```

匯入時用 `as` 可以改名，避免名字衝突：

```js,ignore
import { add as sum } from "./math.mjs";
```

### 什麼時候用哪一種

業界沒有統一答案，這本書的做法是：

- **Vue 元件**：一個 `.vue` 檔就是一個元件。你不用自己寫 `export`，工具會自動把它變成預設匯出，所以別的檔案直接 `import MyButton from "./MyButton.vue"` 就能用。第 4 章會看到。
- **工具函式、常數**：用具名匯出。名字固定，編輯器可以幫你自動補全。

### 匯入套件

目前匯入的都是自己寫的檔案，路徑以 `./` 開頭。如果匯入的是別人寫好的**套件**，就直接寫套件的名字，不加 `./`：

```js,ignore
import { createApp } from "vue";
```

每個 Vue 專案的入口檔案 `main.js` 裡都有這一行，意思是「從 `vue` 這個套件裡，拿出 `createApp`」。套件要先用 npm 安裝，第 4 章用 create-vue 建專案時會自動裝好。

### 在網頁上也一樣

`import` / `export` 是 JavaScript 語言本身的功能，瀏覽器也看得懂。第 4 章之後的專案，每個檔案都是用這個方式串起來的。

## 重點整理

- 每個檔案是一個模組，用 `export` 匯出，用 `import` 匯入。
- 具名匯出用 `import { 名稱 } from "路徑"`，名稱要一致；預設匯出用 `import 任意名稱 from "路徑"`，每個檔案最多一個。
- 自己的檔案路徑要以 `./` 開頭；套件直接寫名字。
- 用 Node.js 直接練習時，檔案用 `.mjs`，並寫完整副檔名。
