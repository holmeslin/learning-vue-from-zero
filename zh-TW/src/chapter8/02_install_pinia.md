# 安裝 Pinia

## 本集目標

在既有的 Vue 專案裡安裝 Pinia，並在 `main.js` 裡啟用它。

## 正文

### 用 npm 安裝

在專案的根目錄（有 `package.json` 的那個資料夾）打開終端機，執行：

```bash
npm install pinia
```

跑完會看到類似這樣的結果（數字和你的不一定一樣）：

```text
added 4 packages, and audited 125 packages in 732ms

35 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

明明只裝了一個 `pinia`，為什麼是 4 個套件？因為 Pinia 自己也用到別的套件，例如讓 Vue DevTools 看得到 store 的 `@vue/devtools-api`。npm 會自動把這些一起裝好，你不用另外安裝。

打開 `package.json`，`dependencies` 裡多了一行 `pinia`：

```text
  "dependencies": {
    "pinia": "^4.1.0",
    "vue": "^3.5.42"
  },
```

`^4.1.0` 表示「4.x 版、至少 4.1.0」。你看到的小版本號碼可能更新一點，只要開頭是 4 就和這本書一致。

### 在 `main.js` 裡啟用

裝好只是把檔案下載下來，還要告訴 Vue「這個 App 要用 Pinia」。打開 `src/main.js`，create-vue 產生的內容大致是：

```js
import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

改成這樣：

`src/main.js`：

```js
import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";

const app = createApp(App);

app.use(createPinia());

app.mount("#app");
```

（create-vue 產生的檔案用單引號、行尾沒有分號；這本書的範例習慣用雙引號加分號，兩種寫法效果一樣。）

改了三個地方：

1. `import { createPinia } from "pinia";`：從 Pinia 拿出 `createPinia` 這個函式。
2. 原本一行寫完的 `createApp(App).mount("#app")` 拆成兩步，先把建立好的 App 存進 `app` 變數，中間才有地方插入其他設定。
3. `app.use(createPinia())`：`createPinia()` 建立一個 Pinia，`app.use()` 把它裝進這個 App。像 Pinia 這種「裝進 App 後，整個 App 都能用」的東西叫做**外掛**（plugin），之後第 9 章的 Vue Router 也是用 `app.use()` 裝進來的。

順序很重要：`app.use()` 一定要寫在 `app.mount()` 前面。

如果你在第 7 章已經把這個檔案拆成兩步、加了 `app.provide` 或 `app.config.errorHandler`，那些留著就好，只要補上 `import { createPinia }` 和 `app.use(createPinia())` 這兩行。

### 忘了 `app.use()` 會怎樣

如果忘了加 `app.use(createPinia())`，下一集開始用 store 時，畫面會一片空白，瀏覽器的 Console 會出現紅字。錯誤訊息的開頭是這段（太長的地方換了行）：

```text
[🍍]: "getActivePinia()" was called but there was no active Pinia.
Are you trying to use a store before calling "app.use(pinia)"?
```

🍍 是 Pinia 的標誌（Pinia 的名字來自西班牙文的鳳梨 piña）。看到這個錯誤，第一件事就是回來檢查 `main.js`。

### 準備放 store 的資料夾

在 `src` 底下建立一個 `stores` 資料夾。之後每個 store 都是這個資料夾裡的一個 `.js` 檔，例如 `src/stores/counter.js`、`src/stores/cart.js`。這是 Vue 社群通用的習慣，create-vue 也是這樣安排的。

### 新專案可以直接勾選

以後開新專案時，執行 `npm create vue@latest`，在「請選擇要包含的功能」那一步，用方向鍵移到「Pinia（狀態管理）」、按空白鍵勾起來，create-vue 就會幫你把上面這些事做好：`package.json` 裡已經有 `pinia`，`main.js` 已經有 `app.use(createPinia())`，`src/stores/` 裡還附了一個範例 store `counter.js`。

## 重點整理

- 在專案根目錄執行 `npm install pinia`，它需要的其他套件 npm 會自動裝好。
- 在 `src/main.js` 裡 `import { createPinia } from "pinia"`，再用 `app.use(createPinia())` 啟用。
- `app.use()` 要寫在 `app.mount()` 前面。
- 看到「no active Pinia」的錯誤，先檢查 `main.js` 有沒有 `app.use(createPinia())`。
- store 檔案放在 `src/stores/` 資料夾。
