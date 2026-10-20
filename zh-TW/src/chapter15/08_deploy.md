# 部署簡介

## 本集目標

知道 Nitro preset 是什麼，以及 Nuxt 網站可以部署到哪些地方、部署前要注意什麼。

## 正文

### 同一份程式碼，不同的成品

第 1 集建置時，輸出裡有一行 `Nitro preset: node-server`。**preset**（預設組合）決定建置出來的成品長什麼樣子。預設的 `node-server` 做出一個用 `node` 執行的伺服器，但網站不一定要放在自己的 Node.js 伺服器上。

換一個 preset 建置看看。在建置指令前面設定 `NITRO_PRESET` 這個環境變數：

```bash
NITRO_PRESET=vercel npm run build
```

這次的輸出變成：

```text
● Nitro preset: vercel
...
[nitro] ✔ Generated public .vercel/output/static
...
[nitro] ✔ You can deploy this build using npx vercel deploy --prebuilt
```

成品不在 `.output` 了，而是放在 `.vercel/output`，格式是 Vercel 這個平台規定的。同樣地，`NITRO_PRESET=netlify` 會把成品放在 `dist` 和 `.netlify` 資料夾。你的程式碼一行都沒改，只是換了 preset，Nitro 就幫你轉成各平台要的格式。

還記得第 3 集說 `isr` 在自己的伺服器上沒有作用嗎？用 `vercel` preset 建置之後，`.vercel/output/functions/blog-isr.prerender-config.json` 這個檔案裡寫著：

```json
{
  "expiration": 60
}
```

`isr: 60` 變成了 Vercel 的設定：讓 Vercel 的 CDN 把 `/blog` 記 60 秒。這就是 `isr` 真正發揮作用的地方。

同一次建置還會印出一個警告：

```text
[nitro]  WARN  Nitro now uses isr option to configure ISR behavior on Vercel.
```

（實際的訊息比較長，這裡只留第一句。）意思是在 Vercel 上請改用 `isr`，`swr` 的寫法以後不再支援。這也是第 3 集說「Vercel、Netlify 用 `isr`」的原因。

### 三種常見的部署方式

**1. 自己的 Node.js 伺服器**

租一台雲端主機，裝好 Node.js，然後：

1. 把程式碼放上去，執行 `npm install` 和 `npm run build`（或在自己電腦建置好，只把 `.output` 資料夾複製上去）。
2. 用環境變數設定好 `NUXT_` 開頭的設定和 `PORT`。
3. 執行 `node .output/server/index.mjs`。

這是你這一章一直在做的事，所有功能都能用：`server/api`、`swr`、`useStorage` 存檔案都沒問題。缺點是主機要自己照顧：當機了要重開、要更新系統、要處理 HTTPS。官方文件建議在 Nitro 伺服器前面再放一個**反向代理**（reverse proxy，替你接收請求再轉交給 Nitro 的伺服器軟體）來處理 HTTPS。

**2. Vercel、Netlify 這類平台**

這類平台幫你把主機的事都處理好。流程大致是：

1. 把程式碼放到 GitHub。
2. 在平台上匯入這個專案。
3. 平台自己偵測到這是 Nuxt 專案，自動用對應的 preset 建置、部署。之後每次推送新的程式碼，就會自動重新部署。

Nuxt 官方把這種叫做「零設定」（zero-config）部署：在這些平台上，你連 `NITRO_PRESET` 都不用設。實際的操作畫面常常改版，請以 [Nuxt 官方的部署頁面](https://nuxt.com/deploy)和各平台的文件為準。

**3. 靜態主機**

如果你的網站可以用 `npm run generate` 做出來（上一集），把 `.output/public` 放到 GitHub Pages、Cloudflare Pages 這類靜態主機就好。最便宜也最簡單，但只有靜態網站能用。

第 9 章說過，第一部用 create-vue 做的 SPA 放到靜態主機時，要打開主機的「SPA」選項，讓所有網址都回傳同一份 `index.html`，否則直接打開 `/about` 會找不到頁面。`npm run generate` 做出來的網站不太一樣：每一頁都有自己的 `index.html`（例如 `about/index.html`），直接打開任何一頁都找得到。只有沒被產生出來的網址，才會用到 Nuxt 另外產生的 `200.html`、`404.html` 這兩個備用頁面，官方文件提醒，有些主機需要另外設定才會用它們。至於用 `npm run build` 加伺服器的網站，每個網址都由伺服器處理，不需要這個選項。

| 方式 | `server/api` | `swr` | `isr` | 要顧主機 |
| --- | --- | --- | --- | --- |
| 自己的 Node.js 伺服器 | 可以 | 可以 | 沒作用 | 要 |
| Vercel、Netlify | 可以 | 改用 `isr` | 可以 | 不用 |
| 靜態主機（`generate`） | 不行 | 不行 | 不行 | 不用 |

### 環境變數要在平台上設定

第 6 集說過，正式環境不會讀 `.env`，而且 `.env` 不能放進版本控制。那平台怎麼知道你的金鑰？

每個部署平台都有一個設定環境變數的地方，把 `NUXT_API_SECRET` 之類的名稱和值填進去就好。自己的 Node.js 伺服器，就是在啟動 `node` 的時候給環境變數。

### 留言板還不能直接上線

部署第 14 章的留言板之前，要先想清楚：留言是用 `useStorage("data")` 存的，它在 Node.js 伺服器上會寫成 `.data/` 資料夾裡的檔案。

- 放在自己的 Node.js 伺服器上：可以用，但要記得 `.data/` 是在**啟動伺服器的那個資料夾**底下。第 14 章說過，換一個資料夾啟動，就會長出一個新的、空的 `.data/kv/`，看起來像是留言全不見了。所以每次都要在同一個資料夾（通常是專案根目錄）啟動；搬家或重灌主機時，也要把 `.data/` 一起帶走。
- 放在 Vercel、Netlify 這類平台：它們每次處理請求的環境是臨時的，寫進去的檔案隨時可能消失，留言會不見。

所以要認真上線，留言要改存在真正的資料庫，或平台提供的儲存服務。好消息是 `useStorage` 可以換「驅動程式」（driver），把同樣的 `getItem`、`setItem` 接到 Redis 或各平台的儲存服務上，你寫的 API 幾乎不用改。這部分已經超出這本書的範圍，需要的時候查 Nitro 文件的 Storage 章節就好。

### 回頭看第二部

走完這一章，Nuxt 的主要概念你都碰過了：

- 檔案路由、`layouts/`、自動匯入（第 12 章）
- SSR、hydration、`useFetch`、`useState`（第 13 章）
- 用 `server/api` 寫自己的 API（第 14 章）
- 混合渲染、`runtimeConfig`、建置與部署（這一章）

## 重點整理

- Nitro preset 決定建置成品的格式，預設 `node-server`，可以用 `NITRO_PRESET` 環境變數換。
- 常見的部署方式有三種：自己的 Node.js 伺服器、Vercel／Netlify 這類平台、靜態主機。
- 在 Vercel、Netlify 上，Nuxt 會自動選對 preset，`isr` 也在這些平台才有作用。
- 正式環境的環境變數要在平台或啟動指令上設定，不要上傳 `.env`。
- 用 `useStorage` 存檔案的留言板，在雲端平台上資料會消失，正式上線要換成資料庫或平台的儲存服務。
