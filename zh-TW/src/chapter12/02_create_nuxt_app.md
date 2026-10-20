# 建立 Nuxt 專案

## 本集目標

用 `npm create nuxt@latest` 建立專案，啟動開發伺服器，在瀏覽器看到第一個 Nuxt 頁面。

## 正文

### 確認 Node.js

先在終端機確認 Node.js 的版本：

```bash
node -v
```

看到 `v24.15.0` 或更新的 24 版就可以。如果比它舊，到 Node.js 官網下載最新的 24 版重新安裝。

### 建立專案

進到你放練習專案的 `learning-vue` 資料夾，執行：

```bash
npm create nuxt@latest
```

這和第 4 章的 `npm create vue@latest` 是同一種指令，只是換成 Nuxt 官方的專案產生器 **create-nuxt**。第一次執行時，npm 可能會先問你要不要下載它：

```text
Need to install the following packages:
create-nuxt@4.0.1
Ok to proceed? (y)
```

版本號碼可能和這裡不同。直接按 Enter 同意。

接著會看到一個綠色的 Nuxt 標誌，然後 create-nuxt 會一題一題問你。用上下鍵移動，按 Enter 確定。

**第一題：用哪一個範本**

```text
◆  Which template would you like to use?
│  ○ content · Starter for a content-driven website.
│  ● minimal · Minimal starter with a single app.vue. (recommended)
│  ○ module · Starter to create your first Nuxt module.
│  ○ ui · Starter with Nuxt UI.
│  ○ v5-nightly · Minimal setup for Nuxt 5 Nightly
```

選預設的 **minimal**，它是最乾淨的起點，只有一個 `app.vue`。其他幾個是做特定用途的：`content` 給寫部落格、文件網站用，`ui` 附了一整套 Nuxt 官方的元件庫，`v5-nightly` 是還在開發中的下一版。

**第二題：專案放在哪裡**

```text
◆  Where would you like to create your project?
│  ./nuxt-app
```

直接輸入 `hello-nuxt`，按 Enter。灰色的 `./nuxt-app` 只是提示，一開始打字就會被取代。create-nuxt 會建立一個 `hello-nuxt` 資料夾，專案的檔案都放在裡面。

**第三題：用哪一個套件管理工具**

```text
◆  Which package manager would you like to use?
│  ● npm (current)
│  ○ pnpm
│  ○ yarn
│  ○ bun
│  ○ deno
│  ○ aube
│  ○ nub
│  ○ upm
```

這本書一直用 npm，選預設的 **npm**。選完之後它會開始安裝套件，大約需要幾十秒，看到 `Dependencies installed` 就表示裝好了。

**第四題：要不要建立 git 儲存庫**

```text
◆  Initialize git repository?
│  ● Yes / ○ No
```

git 是記錄程式碼修改歷史的工具，這本書沒有教它，選哪個都不影響後面的內容。選預設的 **Yes** 就好。

**第五題：要不要安裝模組**

```text
◆  Would you like to browse and install modules?
│  ○ Yes / ● No
```

**模組**（module）是替 Nuxt 加功能的套件，例如圖片最佳化、字型、SEO。這裡選 Yes 會跳出一長串清單讓你挑。我們先選預設的 **No**，第 12 集需要的時候再用指令加。

最後會看到：

```text
◇  Created your project from the minimal template
│
●  to scaffold this project again without prompts:
│  npm create nuxt@latest hello-nuxt -- --template=minimal \
│    --packageManager=npm --gitInit --no-modules
│
│  Next steps:
│  › cd hello-nuxt
│  › npm run dev
│
└  ✨ Happy building!
```

中間那段是在告訴你：下次想跳過問答、用一樣的選項建立專案，可以直接打那一行指令。

### 啟動開發伺服器

照著 Next steps 做：

```bash
cd hello-nuxt
npm run dev
```

終端機會印出類似這樣的訊息：

```text
● Starting Nuxt...
● Nuxt 4.6.2 (with Nitro 2.13.5, Vite 8.3.4 and Vue 3.5.44)

  ➜ Local:    http://localhost:3000/
  ➜ Network:  use --host to expose

● Setting up modules
  ➜ DevTools: press Shift + Option + D in the browser (v3.4.4)

● Preparing app
● Generating types
● Bundling app
✔ Vite client built in 22ms
✔ Vite server built in 12ms
● Building server
[nitro] ✔ Nuxt Nitro server built in 378ms
◆ Ready in 1.00s  → http://localhost:3000/
```

第二行說明了 Nuxt 是由哪些東西組成的：你熟悉的 **Vite** 和 **Vue**，再加上 **Nitro**，它是 Nuxt 用來跑伺服器的部分，第 14 章寫 API 時會再碰到它。

後面可能還會有一段 `Vite discovered new dependencies at runtime` 的提示，那是開發工具自己的事，不用理它。

用瀏覽器打開 <http://localhost:3000>，會看到 Nuxt 的歡迎頁。注意連接埠是 `3000`，不是第一部 Vite 的 `5173`。

開發伺服器開著的時候，你每次存檔，瀏覽器就會自動更新畫面。要關掉它，回到終端機按 Ctrl+C。

### `package.json` 裡的指令

打開專案裡的 `package.json`：

```json
{
  "name": "hello-nuxt",
  "type": "module",
  "private": true,
  "scripts": {
    "build": "nuxt build",
    "dev": "nuxt dev",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare"
  },
  "dependencies": {
    "nuxt": "^4.6.2",
    "vue": "^3.5.44",
    "vue-router": "^5.4.0"
  }
}
```

- `npm run dev`：開發用。存檔就更新，方便寫程式。
- `npm run build`：把網站建置成可以上線的版本。
- `npm run preview`：用 `build` 的結果啟動伺服器，看看「正式上線的樣子」。要先 `build` 才能 `preview`。
- `npm run generate`：把網站產生成一堆靜態檔案，第 15 章會講。
- `postinstall`：不用你自己執行。每次 `npm install` 完，npm 會自動跑它，讓 Nuxt 準備好型別等檔案。

`dependencies` 裡除了 `nuxt`，還有 `vue` 和 `vue-router`。你第 9 章學的 Vue Router 已經在裡面了，只是接下來你不會自己寫 `createRouter`，Nuxt 會幫你做。

這些指令其實都是在呼叫 `nuxt` 這個指令列工具。之後你也會直接用 `npx nuxt 某個指令` 做事，例如安裝模組、檢查型別。網路上的舊文章常寫成 `npx nuxi`，那是它以前的名字，效果一樣。

## 重點整理

- 用 `npm create nuxt@latest` 建立專案，範本選 minimal、套件管理工具選 npm，模組先不裝。
- `npm run dev` 啟動開發伺服器，網址是 <http://localhost:3000>。
- `npm run build` 建置上線版本，`npm run preview` 在本機預覽上線版本。
- Nuxt 由 Vue、Vue Router、Vite 和負責伺服器的 Nitro 組成。
- 指令列工具叫 `nuxt`，舊名 `nuxi`。
