# VitePress 簡介

## 本集目標

用 `npx vitepress init` 建立一個文件網站，在 Markdown 裡寫 Vue，並且知道 VitePress 和 Nuxt 各適合做什麼。

## 正文

### 你其實已經用過它了

你讀過的 Vue、Vue Router、Pinia、Vitest 官方文件，都是用 **VitePress** 做的。左邊一排目錄、右邊一排本頁大綱、上面有搜尋框，那個樣子就是 VitePress 的預設外觀。

VitePress 是 Vue 團隊做的**靜態網站產生器**（static site generator）：你用 Markdown 寫內容，它在建置時把每一頁變成 HTML。它底層用的是 Vite 和 Vue，所以頁面裡還可以直接放 Vue 元件。

### 建立一個文件網站

VitePress 不用 `npm create`，而是先建一個空資料夾、裝好套件，再執行它的 `init` 指令：

```bash
mkdir my-docs
cd my-docs
npm init -y
npm install -D vitepress
npx vitepress init
```

`npm init -y` 會建立一個空的 `package.json`；`-D` 表示這個套件只在開發和建置時用到。最後一行會問你幾個問題。第一題預設是 `./`，在後面打 `docs`，讓文件放在 `docs` 資料夾裡；其他題目都直接按 Enter 用預設值：

```text
┌  Welcome to VitePress!
│
◇  Where should VitePress initialize the config?
│  ./docs
│
◇  Site title:
│  My Awesome Project
│
◇  Site description:
│  A VitePress Site
│
◇  Theme:
│  Default Theme
│
◇  Use TypeScript for config and theme files?
│  Yes
│
◇  Add VitePress npm scripts to package.json?
│  Yes
│
└  Done! Now run npm run docs:dev and start writing.
```

產生的檔案很少：

```text
docs/
├── .vitepress/
│   └── config.mts
├── api-examples.md
├── index.md
└── markdown-examples.md
```

- `docs/.vitepress/config.mts`：網站設定，像是標題、上方導覽列、左邊的目錄。
- `docs/index.md`：首頁。
- 其他 `.md` 檔：範例頁面。**每個 `.md` 檔就是一頁**，`docs/api-examples.md` 對應網址 `/api-examples`，和 Nuxt 的檔案路由是同一個概念。

執行：

```bash
npm run docs:dev
```

打開 `http://localhost:5173`，就會看到一個有首頁、導覽列和深色模式切換的文件網站。

### 在 Markdown 裡寫 Vue

新增 `docs/counter.md`：

```md
<script setup lang="ts">
import { ref } from "vue";

const count = ref(0);
</script>

# 計數器

這一頁是 Markdown，但裡面可以直接寫 Vue。

<button @click="count++">點了 {{ count }} 次</button>
```

VitePress 會把每個 `.md` 檔轉成一個 Vue 元件，所以 `<script setup>`、`ref`、`{{ }}`、`@click` 全部照常運作。注意這裡要自己 `import { ref }`，VitePress 不像 Nuxt 會自動匯入。

接著把它加進左邊的目錄。打開 `docs/.vitepress/config.mts`，在 `sidebar` 的 `items` 裡加一行：

```ts,ignore
sidebar: [
  {
    text: 'Examples',
    items: [
      { text: 'Markdown Examples', link: '/markdown-examples' },
      { text: 'Runtime API Examples', link: '/api-examples' },
      { text: '計數器', link: '/counter' }
    ]
  }
],
```

存檔後回到瀏覽器，左邊多了「計數器」，點進去按按鈕，數字會增加。

### 建置成靜態網站

```bash
npm run docs:build
```

```text
  vitepress v1.6.4

✓ building client + server bundles...
✓ rendering pages...
build complete in 0.95s.
```

秒數每次會不太一樣。產生的檔案在 `docs/.vitepress/dist/`，每一頁都是一個 `.html` 檔，例如 `counter.html`。這整個資料夾可以直接丟到第 15 章介紹的 Netlify、Vercel，或任何能放靜態檔案的地方。`npm run docs:preview` 可以在本機先看看建置後的樣子。

### 和 Nuxt 差在哪

兩個都是用 Vue 做網站，但目標不一樣：

| | VitePress | Nuxt |
| --- | --- | --- |
| 主要內容 | Markdown 文章 | Vue 元件寫的頁面 |
| 產出 | 靜態 HTML，沒有伺服器 | 可以 SSR、有 server API、也能產生靜態網站 |
| 資料 | 寫在 Markdown 裡，建置時就固定 | 可以在每個請求時向 API 或資料庫拿 |
| 預設外觀 | 內建一套文件網站的主題 | 沒有，畫面自己做 |
| 設定量 | 很少，裝好就能寫 | 多，但能做的事也多 |

怎麼選：

- **說明文件、技術部落格、產品手冊**：內容以文字為主，用 VitePress。你幾乎只要寫 Markdown，目錄、深色模式都有了，站內搜尋也只要在設定檔裡打開。
- **有使用者登入、表單、資料庫的網站或應用程式**：用 Nuxt。VitePress 沒有伺服器，做不到第 14 章那種留言板。
- **網站主體是 Nuxt，只是其中一部分想用 Markdown 寫**：不用另外開一個 VitePress，Nuxt 有 `@nuxt/content` 模組，可以在 Nuxt 專案裡直接讀 Markdown。

## 重點整理

- VitePress 是 Vue 團隊做的靜態網站產生器，Vue 生態系的官方文件幾乎都用它。
- 在空資料夾 `npm install -D vitepress` 之後執行 `npx vitepress init`，就有一個可以跑的文件網站。
- 每個 `.md` 檔是一頁，而且裡面可以寫 `<script setup>` 和 Vue 模板。
- `npm run docs:build` 產生純 HTML，放到任何靜態主機都能用。
- 文字為主的文件網站選 VitePress，需要伺服器與資料的網站選 Nuxt。
