# 專案結構

## 本集目標

認得 Nuxt 專案裡每個檔案和資料夾的用途，並且把歡迎頁換成自己的首頁。

## 正文

### 逛一圈

在 VS Code 打開 `hello-nuxt` 資料夾，你會看到這些東西：

| 名稱 | 用途 |
| --- | --- |
| `app/` | 你寫的 Vue 程式碼都放這裡 |
| `public/` | 靜態檔案，網址從 `/` 開始直接對應 |
| `nuxt.config.ts` | Nuxt 的設定檔 |
| `package.json` | 專案的套件與指令，和第一部一樣 |
| `tsconfig.json` | TypeScript 的設定 |
| `.nuxt/` | Nuxt 自動產生的檔案，不要手動改 |
| `node_modules/` | 安裝下來的套件，和第一部一樣 |
| `README.md` | 說明文件，不影響網站 |

`app/` 裡目前只有一個檔案：`app.vue`。`public/` 裡有兩個：`favicon.ico` 是瀏覽器分頁上的小圖示，`robots.txt` 是給搜尋引擎爬蟲看的說明。

### 和 create-vue 專案比一比

第一部的專案，程式碼都放在 `src/`；Nuxt 4 則是放在 `app/`。除了名字不同，還有幾個明顯的差別：

- **沒有 `index.html`**。HTML 是伺服器每次收到請求時才產生的，不需要一個固定的檔案。
- **沒有 `main.ts`**。`createApp`、`app.use(router)`、`mount('#app')` 這些事，Nuxt 都替你做了。
- **沒有 `router/index.ts`**。路由會照 `app/pages/` 裡的檔案自動產生，第 4 集開始用。
- **沒有 `vite.config.ts`**。Vite 的設定也由 Nuxt 管，需要調整的時候寫在 `nuxt.config.ts` 裡。

為什麼要特別分出一個 `app/` 資料夾？因為 Nuxt 專案裡不只有 Vue 的程式碼。之後你還會在專案根目錄建立 `server/` 放伺服器的程式（第 14 章）。把「跑在瀏覽器和渲染畫面的程式」放進 `app/`，和 `public/`、`server/` 分開，比較不會搞混。

### `.nuxt/` 資料夾

`.nuxt/` 是 Nuxt 在你執行 `npm install`、`npm run dev` 或 `npm run build` 時自動產生的。裡面放的是路由、自動匯入的清單、TypeScript 型別等等，每次都會重新產生，所以改了也沒用。

打開 `tsconfig.json` 就看得出它的用途：

```json
{
  // https://nuxt.com/docs/guide/concepts/typescript
  "files": [],
  "references": [
    {
      "path": "./.nuxt/tsconfig.app.json"
    },
    {
      "path": "./.nuxt/tsconfig.server.json"
    },
    {
      "path": "./.nuxt/tsconfig.shared.json"
    },
    {
      "path": "./.nuxt/tsconfig.node.json"
    }
  ]
}
```

真正的 TypeScript 設定都在 `.nuxt/` 裡，`tsconfig.json` 只是指過去而已。如果 VS Code 突然對一堆東西畫紅線，通常是 `.nuxt/` 還沒產生或過期了，執行一次 `npm run dev` 就會好。

你在 `.gitignore` 裡也會看到 `.nuxt` 和 `.output`（`npm run build` 產生的上線版本），它們都是可以隨時重建的檔案，不需要被記錄下來。

### `nuxt.config.ts`

打開 `nuxt.config.ts`：

```ts
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
})
```

- `defineNuxtConfig` 沒有 import 就能用，這是 Nuxt 的自動匯入，第 9 集會細講。
- `compatibilityDate` 是「相容日期」。Nuxt 更新時，有些行為會改變，這個日期告訴 Nuxt「照這一天的規則來」，讓你的網站不會因為升級而突然變樣。不用動它。
- `devtools` 開啟 Nuxt DevTools。開發伺服器開著的時候，在瀏覽器按 Shift+Option+D（Windows 是 Shift+Alt+D）就會出現一個面板，可以看到頁面、元件、模組等資訊。它和第 4 章裝的 Vue DevTools 是不同的東西，但功能有重疊。

### 把範本清乾淨

打開 `app/app.vue`：

```vue
<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtWelcome />
  </div>
</template>
```

`<NuxtWelcome />` 就是你剛剛看到的歡迎頁。`<NuxtRouteAnnouncer />` 則是看不見的元件：換頁的時候，它會告訴螢幕閱讀器「現在換到哪一頁了」，讓看不見螢幕的使用者也知道發生了什麼事。這兩個元件都沒有 import 就能用，一樣是自動匯入。

把 `app/app.vue` 整個換成：

```vue
<template>
  <div>
    <NuxtRouteAnnouncer />
    <main>
      <h1>歡迎來到小書店</h1>
      <p>這是用 Nuxt 做的第一個網站。</p>
    </main>
  </div>
</template>
```

`<NuxtWelcome />` 拿掉了，`<NuxtRouteAnnouncer />` 留著。

### 全站的 CSS

第一部的專案，全站共用的 CSS 是在 `main.ts` 裡 `import './assets/main.css'`。Nuxt 沒有 `main.ts`，改成在 `nuxt.config.ts` 裡設定。

建立 `app/assets/css/main.css`（資料夾要自己建）：

```css
/* app/assets/css/main.css */
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  line-height: 1.6;
}

main {
  max-width: 40rem;
  margin: 0 auto;
  padding: 1rem;
}
```

然後在 `nuxt.config.ts` 加上 `css` 這一行：

```ts
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
});
```

Nuxt 產生的檔案和第 10 章的 create-vue 一樣，習慣用單引號、不加分號。這本書的範例還是照第 1 章的習慣用雙引號加分號，所以上面整個檔案改成了雙引號。兩種寫法執行起來完全一樣。

`css` 是一個陣列，列在裡面的 CSS 檔會套用到每一頁。`~` 代表 `app/` 資料夾，所以 `~/assets/css/main.css` 就是 `app/assets/css/main.css`。這和第一部的 `@/` 代表 `src/` 是一樣的意思，在 Nuxt 裡兩種寫法都可以用，這本書用 `~`。

存檔後，開發伺服器會因為設定檔改了而自動重新啟動。回到瀏覽器，畫面變成你的首頁了。

## 重點整理

- Nuxt 4 把 Vue 的程式碼放在 `app/`，`public/`、`nuxt.config.ts` 和之後的 `server/` 放在專案根目錄。
- Nuxt 專案沒有 `index.html`、`main.ts`、`router/index.ts`，這些事都由 Nuxt 處理。
- `.nuxt/` 是自動產生的，不要手動改；紅線很多時先跑一次 `npm run dev`。
- 全站的 CSS 寫在 `nuxt.config.ts` 的 `css` 陣列裡；`~` 代表 `app/`。
- `<NuxtRouteAnnouncer />` 會在換頁時通知螢幕閱讀器，留著它。
