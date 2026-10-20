# `nuxt build` 與 `nuxt preview`

## 本集目標

把網站建置成正式版本，用 `node .output/server/index.mjs` 或 `npm run preview` 啟動它。

## 正文

### 四個指令

打開專案的 `package.json`，`scripts` 裡有這幾個指令：

```json
{
  "scripts": {
    "build": "nuxt build",
    "dev": "nuxt dev",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare"
  }
}
```

`dev` 你已經用了三章。這一章會用到另外三個：

| 指令 | 用途 |
| --- | --- |
| `npm run build` | 建置。把整個網站編譯成可以上線的版本 |
| `npm run preview` | 在自己電腦上啟動建置好的版本，上線前先看看 |
| `npm run generate` | 產生純靜態網站，第 7 集會講 |

`postinstall` 是 `npm install` 之後自動執行的，不用管它。

### 建置

先把 `npm run dev` 停掉（在那個終端機按 Ctrl+C），然後執行：

```bash
npm run build
```

終端機會跑出一長串訊息，最後幾行是這樣（中間省略）：

```text
● Nitro preset: node-server
...
[nitro] ✔ Generated public .output/public
...
[nitro] ✔ Nuxt Nitro server built
...
[nitro] ✔ You can preview this build using node .output/server/index.mjs
◆ ✨ Build complete in 2.08s!
```

**Nitro** 是 Nuxt 裡負責伺服器的那一層。你第 14 章寫的 `server/api`、`defineEventHandler`、`useStorage`，其實都是 Nitro 提供的。`preset: node-server` 的意思是「這次建置出來的成品，是一個用 Node.js 執行的伺服器」，第 8 集會再回來講 preset。

### `.output` 資料夾

建置的成品全部放在專案根目錄的 `.output` 資料夾：

```text
.output
├── nitro.json
├── public
│   ├── _nuxt
│   ├── favicon.ico
│   └── robots.txt
└── server
    ├── chunks
    ├── index.mjs
    ├── index.mjs.map
    ├── node_modules
    └── package.json
```

- `public/`：要直接送給瀏覽器的檔案，像是打包好的 JavaScript（在 `_nuxt/` 裡）和你放在專案 `public/` 資料夾的圖片。
- `server/`：伺服器的程式。`index.mjs` 是入口，執行它就會啟動網站。

注意 `server/` 裡面有自己的 `node_modules`。建置時，Nuxt 已經把伺服器需要的套件挑出來放進去了，所以 `.output` 是一個**自己就能跑**的資料夾：把它整個複製到另一台裝了 Node.js 的電腦，不用 `npm install` 就能執行（有一個要注意的例外，第 8 集會講）。

`.output` 已經寫在 `.gitignore` 裡，不會被放進版本控制。它每次建置都會整個重新產生。

### 啟動正式版本

```bash
node .output/server/index.mjs
```

```text
Listening on http://[::]:3000
```

`[::]` 的意思是「這台電腦的所有網路位址」，你用 <http://localhost:3000> 打開就可以。畫面看起來和開發模式一樣，但這已經是正式版本了：沒有開發模式的工具列，程式碼都經過壓縮，速度也快很多。

開另一個終端機，用 `curl` 抓兩次首頁，中間隔幾秒：

```bash
curl -s localhost:3000 | grep 產生時間
```

我兩次分別印出：

```text
產生時間：08:54:46
產生時間：08:54:48
```

時間不一樣，代表伺服器每次都重新渲染。這就是第 13 章講的 SSR：每次有人打開網頁，伺服器就執行一次你的頁面，把結果做成 HTML 送出去。

要停掉伺服器，回到它的終端機按 Ctrl+C。

### 換連接埠

伺服器預設用 3000，想換一個，就在前面設定 `PORT` 這個環境變數（環境變數第 6 集會詳細講）：

```bash
PORT=3015 node .output/server/index.mjs
```

```text
Listening on http://[::]:3015
```

Windows 的 PowerShell 寫法不一樣，要先執行 `$env:PORT=3015`，再執行 `node .output/server/index.mjs`。

### `npm run preview`

另一個啟動方式是：

```bash
npm run preview
```

終端機會先跳出一個框框提醒你，最後兩行是：

```text
◆ Running node server/index.mjs in .output
Listening on http://[::]:3000
```

框框裡寫著「In production, do not use this CLI. Instead, run node server/index.mjs directly.」：`preview` 只是讓你在自己電腦上**預覽**成品，真正上線時要直接用 `node` 執行。它和直接執行 `node` 主要有兩個差別：

1. `preview` 會讀專案根目錄的 `.env` 檔，直接執行 `node` 不會。第 6 集會用到這個差別。
2. `preview` 是在 `.output` 資料夾裡面啟動伺服器的。第 14 章的留言板用 `useStorage("data")` 存資料，資料會存到「啟動伺服器的那個資料夾」底下的 `.data/`。所以用 `preview` 跑留言板，留言會存在 `.output/.data/`，和開發模式的 `.data/` 是兩份不同的資料；而且下次 `npm run build` 會把整個 `.output` 清掉，這份資料也跟著不見。

### 上線前一定要建置一次

開發模式只會在你打開某一頁時才處理那一頁，有些錯誤要到建置時才會發現。所以每次要上線之前，先在自己電腦上跑一次 `npm run build`，再用 `npm run preview` 把每一頁點過一遍。

## 重點整理

- `npm run build` 把網站建置成正式版本，成品放在 `.output` 資料夾。
- `.output/server/index.mjs` 是伺服器的入口，用 `node .output/server/index.mjs` 啟動，預設連接埠是 3000，可以用 `PORT` 改。
- `.output` 自己就能跑，不需要再 `npm install`。
- `npm run preview` 用來在自己電腦上預覽成品，會讀 `.env`；正式上線要直接用 `node` 執行。
