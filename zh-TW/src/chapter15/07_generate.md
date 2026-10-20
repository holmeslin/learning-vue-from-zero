# `nuxt generate`：產生靜態網站

## 本集目標

用 `npm run generate` 把整個網站預先渲染成純檔案，並且知道哪些功能在純靜態網站上不能用。

## 正文

### 整個網站都預先渲染

第 2 集用 `prerender: true` 讓一頁在建置時做好。如果把**每一頁**都這樣做呢？那就完全不需要伺服器了，只要把一堆 HTML、JavaScript 檔案放到網路上就好。這種網站叫**靜態網站**（static site），把網站做成靜態檔案的過程叫**靜態網站產生**（static site generation，簡稱 SSG）。

放靜態檔案的地方很多，而且常常是免費的，例如 GitHub Pages、Cloudflare Pages、Netlify。不用顧伺服器，也不怕流量大的時候伺服器撐不住。

### 讓首頁連到文章

先把首頁改成有一個連結，連到第 1 篇文章：

```vue
<!-- app/pages/index.vue -->
<script setup lang="ts">
const { data } = await useFetch("/api/now");
</script>

<template>
  <main>
    <h1>首頁</h1>
    <p>產生時間：{{ data?.now }}</p>
    <ul>
      <li><NuxtLink to="/posts/1">第 1 篇文章</NuxtLink></li>
    </ul>
  </main>
</template>
```

為什麼要加這個連結，等一下就知道。

### `npm run generate`

```bash
npm run generate
```

輸出裡有一大段預先渲染的紀錄（我省略了 `_payload.json` 那幾行）：

```text
[nitro] ℹ Prerendering 4 initial routes with crawler
[nitro]   ├─ /404.html (24ms)
[nitro]   ├─ /200.html (24ms)
[nitro]   ├─ / (29ms)
[nitro]   ├─ /about (28ms)
[nitro]   ├─ /dashboard (6ms)
[nitro]   ├─ /settings (12ms)
[nitro]   ├─ /blog (13ms)
[nitro]   ├─ /news (13ms)
[nitro]   ├─ /posts/1 (13ms)
...
[nitro] ✔ You can preview this build using npx serve .output/public
◆ ✨ You can now deploy .output/public to any static hosting! (1.37s)
```

最後一行說：「現在可以把 `.output/public` 部署到任何靜態主機了！」這次 `.output` 裡只有 `public` 有東西，沒有 `server`：

```text
.output/public
├── 200.html
├── 404.html
├── _nuxt
├── _payload.json
├── about
├── blog
├── dashboard
├── favicon.ico
├── index.html
├── news
├── posts
├── robots.txt
└── settings
```

`about`、`blog` 這些資料夾裡，各有一個 `index.html`。

### Nuxt 怎麼知道有哪些頁面

`/about`、`/news` 這些網址是固定的，Nuxt 看 `app/pages/` 的檔案就知道它們存在，全部會被預先渲染。

但 `/posts/[id].vue` 是動態路由，`id` 可以是任何東西，Nuxt 不可能把無限多種都做出來。它的做法是**爬**（crawl）：從首頁開始，順著頁面上的連結一路找下去。輸出第一行的 `with crawler` 就是這個意思。首頁有一個連到 `/posts/1` 的 `NuxtLink`，所以 `/posts/1` 被找到、被做出來了；沒有任何地方連到 `/posts/2`，它就不存在。

如果有些頁面沒有被連結到，卻也要產生出來，可以用 `routeRules` 個別指定，例如 `"/posts/2": { prerender: true }`。

### 預覽靜態網站

要注意：`npm run generate` 之後，**`npm run preview` 不能用**。我實際執行，它還是去找 `.output/server/index.mjs` 來啟動伺服器，找不到就出錯：

```text
Error: Cannot find module '.../.output/server/index.mjs'
```

照 `generate` 最後的提示，用 `serve` 這個小工具來看：

```bash
npx serve .output/public
```

`npx` 會先問你要不要安裝 `serve`，按 Enter 同意。終端機印出 `Accepting connections at` 和一個網址之後，就可以打開網站了。網址預設是 <http://localhost:3000>，如果 3000 被別的程式占用，`serve` 會自己換一個，照它印出來的網址打開就好。

### 哪些東西變了

把幾個網址都試一遍（`-w "%{http_code}"` 讓 `curl` 只印出狀態碼）：

```bash
curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/posts/1
```

| 網址 | 狀態碼 | 說明 |
| --- | --- | --- |
| `/` | 200 | |
| `/about` | 200 | |
| `/news` | 200 | |
| `/posts/1` | 200 | 有被爬到 |
| `/posts/2` | 404 | 沒被爬到，不存在 |
| `/api/now` | 404 | **API 不見了** |

最重要的是最後一行：**靜態網站沒有伺服器，`server/api` 裡的 API 全部不能用。** 你可能會好奇，那頁面上的 `useFetch("/api/now")` 怎麼辦？分成兩種情況：

1. **會被預先渲染的頁面**：產生的時候，Nuxt 在你的電腦上執行了 API，把結果寫進 HTML 和 `_payload.json`。所以 `/news` 上的時間，永遠是你執行 `generate` 的那一刻，`swr` 之類的 `routeRules` 都沒有作用了。
2. **`ssr: false` 的頁面**：它在產生的時候本來就不渲染，要等到瀏覽器裡才呼叫 API。我用瀏覽器打開 `/dashboard`，畫面上只有「產生時間：」，後面是空的，因為 `/api/now` 回應 404。

`/posts/2` 也有一點特別：伺服器回 404，但 Nuxt 產生的 `404.html` 其實是一個空殼網頁，瀏覽器載入之後會自己把頁面畫出來，我用瀏覽器打開還是看得到「第 2 篇文章」。可是這只是瀏覽器畫的，搜尋引擎拿到的是 404，而且如果頁面需要 API，一樣拿不到資料。

### 什麼網站適合 `generate`

適合：

- 內容只有改程式碼或重新產生時才會變的網站：個人網站、作品集、文件、部落格。
- 資料來自外部 API，而且在產生的那一刻抓一次就夠了。

不適合：

- **用到自己的 `server/api` 的網站。** 第 14 章的留言板，送出留言要呼叫 `POST /api/messages`，靜態網站上根本沒有這支 API，留言板就完全不能用。
- 內容需要即時更新、或每個人看到不一樣的網站。

這一章前面學的 `routeRules`，在 `generate` 之下也大多失去作用：`prerender` 變成所有頁面的預設，`swr`、`isr` 需要伺服器，都不會生效。官方文件也說明了，混合渲染不能和 `nuxt generate` 一起用。

所以選擇很清楚：要混合渲染、要自己的 API，就 `npm run build` 加上一台伺服器；整個網站都能在產生時做好，才用 `npm run generate`。

## 重點整理

- `npm run generate` 把每一頁都預先渲染，成品是 `.output/public`，可以放到任何靜態主機。
- 動態路由的頁面靠爬連結找到，沒被連結到的不會產生。
- `generate` 之後用 `npx serve .output/public` 預覽，`npm run preview` 不能用。
- 靜態網站沒有伺服器：`server/api` 不能用，`useFetch` 的資料停在產生的那一刻，`swr`、`isr` 也沒有作用。
- 有自己 API 的網站（例如留言板）要用 `npm run build` 加伺服器，不能用 `generate`。
