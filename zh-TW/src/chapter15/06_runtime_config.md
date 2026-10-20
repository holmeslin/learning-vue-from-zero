# `runtimeConfig` 與環境變數

## 本集目標

用 `runtimeConfig` 和環境變數管理設定，分清楚哪些值會送到瀏覽器、哪些只留在伺服器。

## 正文

### 為什麼不能寫在程式碼裡

假設你的網站要呼叫一個需要金鑰的外部服務。金鑰直接寫在程式碼裡，會有兩個問題：

- 程式碼會放進版本控制，也許還會公開在網路上，寫在裡面的金鑰就等於公開了。
- 你的電腦、測試用的伺服器、正式的伺服器，常常需要不同的設定，不應該為了換設定去改程式碼。

**環境變數**（environment variable）就是放在程式碼外面、程式執行時才讀進來的設定。第 1 集你已經用過一個：`PORT=3015 node .output/server/index.mjs` 裡的 `PORT`。

### 在 `runtimeConfig` 宣告

Nuxt 要你先在 `nuxt.config.ts` 宣告有哪些設定。加上 `runtimeConfig`：

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  routeRules: {
    "/about": { prerender: true },
    "/news": { swr: 10 },
    "/blog": { isr: 60 },
    "/dashboard": { ssr: false },
    "/posts/**": { swr: 60 },
  },
  runtimeConfig: {
    apiSecret: "",
    public: {
      siteName: "我的網站",
    },
  },
});
```

`runtimeConfig` 裡分成兩區：

- 直接寫在 `runtimeConfig` 底下的（`apiSecret`）是**私密的**，只有伺服器拿得到。
- 寫在 `public` 裡面的（`siteName`）是**公開的**，伺服器和瀏覽器都拿得到。

冒號右邊是預設值。金鑰不應該寫在程式碼裡，所以預設值是空字串，等一下用環境變數填進去。

### 在 API 裡讀私密值

新增 `server/api/secret.ts`：

```ts
// server/api/secret.ts
export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);
  if (config.apiSecret === "") {
    return { message: "還沒有設定金鑰" };
  }
  return { message: `金鑰有 ${config.apiSecret.length} 個字` };
});
```

在 `server/` 裡用 `useRuntimeConfig(event)` 讀設定，`event` 就是 `defineEventHandler` 給你的那個參數。這裡故意只回傳金鑰的長度：真實的程式會拿金鑰去呼叫別的服務，絕對不會把金鑰本身回傳給瀏覽器。

### 在頁面讀公開值

新增 `app/pages/settings.vue`：

```vue
<!-- app/pages/settings.vue -->
<script setup lang="ts">
const config = useRuntimeConfig();
const { data } = await useFetch("/api/secret");
</script>

<template>
  <main>
    <h1>{{ config.public.siteName }}</h1>
    <p>伺服器說：{{ data?.message }}</p>
  </main>
</template>
```

在頁面裡用 `useRuntimeConfig()`（不用傳參數），讀 `config.public` 裡的值。

建置、用 `node .output/server/index.mjs` 啟動，打開 `/settings`：

```text
我的網站
伺服器說：還沒有設定金鑰
```

兩個都是預設值。

### 用環境變數覆蓋：`NUXT_` 開頭

停掉伺服器，這次啟動時帶上兩個環境變數：

```bash
NUXT_API_SECRET=prod-key-2026 NUXT_PUBLIC_SITE_NAME=正式網站 \
  node .output/server/index.mjs
```

行尾的 `\` 表示「這個指令還沒結束，下一行接著」，整個指令其實是一行。

（PowerShell 要先分別執行 `$env:NUXT_API_SECRET="prod-key-2026"` 和 `$env:NUXT_PUBLIC_SITE_NAME="正式網站"`，再執行 `node .output/server/index.mjs`。）

再打開 `/settings`：

```text
正式網站
伺服器說：金鑰有 13 個字
```

**沒有重新建置**，只是換了環境變數，設定就變了。名稱的對應規則是：

| 環境變數 | 對應到 |
| --- | --- |
| `NUXT_API_SECRET` | `runtimeConfig.apiSecret` |
| `NUXT_PUBLIC_SITE_NAME` | `runtimeConfig.public.siteName` |

開頭一定是 `NUXT_`；公開的值再加上 `PUBLIC_`；後面把 camelCase 的名稱改成全大寫、單字之間用底線隔開（`apiSecret` → `API_SECRET`）。

要注意：**只有在 `runtimeConfig` 裡宣告過的名稱才會被覆蓋。** 如果設了 `NUXT_ADMIN_TOKEN`，卻沒有在 `runtimeConfig` 裡寫 `adminToken`，`useRuntimeConfig(event)` 裡就找不到它。

### `.env` 檔

每次啟動都打一長串環境變數很麻煩。開發的時候，可以把它們寫在專案根目錄的 `.env` 檔案裡，一行一個：

```text
NUXT_API_SECRET=abc123-super-secret
NUXT_PUBLIC_SITE_NAME=開發中的網站
```

`npm run dev` 和 `npm run preview` 都會讀這個檔案。用 `npm run preview` 啟動，終端機會出現：

```text
● Loaded .env. This will not be loaded when running the server in production.
```

`/settings` 顯示：

```text
開發中的網站
伺服器說：金鑰有 19 個字
```

但是那行訊息的後半句很重要：「正式上線時不會讀這個檔案」。直接用 `node .output/server/index.mjs` 啟動，`.env` 會被忽略，看到的是預設值「我的網站」和「還沒有設定金鑰」。正式環境的設定，要用真正的環境變數給，第 8 集會講在部署平台上怎麼填。

`.env` 裡放的是你自己電腦上的設定和祕密，**絕對不要放進版本控制**。`npm create nuxt` 建立的 `.gitignore` 裡已經有 `.env` 了，不要把它刪掉。

### 私密值真的沒送出去嗎

現在專案裡有 `.env` 了，先再執行一次 `npm run build`，建置時也會讀 `.env`。接著檢查兩件事：

1. 在整個 `.output` 資料夾裡搜尋 `abc123`（`.env` 裡金鑰的開頭），一個結果都沒有。金鑰不會被寫進建置的成品。
2. 打開 `/settings` 的 HTML，Nuxt 會把設定放在一段 `<script>` 裡交給瀏覽器，內容是：

```text
window.__NUXT__.config={public:{siteName:"開發中的網站"},app:{...}}
```

（`app` 後面的內容是 Nuxt 自己用的，這裡省略。）只有 `public` 的部分被送到瀏覽器，`apiSecret` 不在裡面。

所以規則很簡單：**祕密放在 `public` 外面，只在 `server/` 裡讀；放在 `public` 裡的東西，每個使用者都看得到。**

### 把留言板的暗號搬出程式碼

第 14 章的留言板，把管理者的暗號直接寫在 `server/api/messages/[id].delete.ts` 裡，當時說過這一章會把它搬到環境變數。現在就來做。

打開留言板專案（`nuxt-guestbook`），在 `nuxt.config.ts` 宣告一個私密值：

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  runtimeConfig: {
    adminToken: "",
  },
});
```

刪除留言的 API 改成從設定讀暗號：

```ts
// server/api/messages/[id].delete.ts
export default defineEventHandler(async (event) => {
  const { adminToken } = useRuntimeConfig(event);
  if (adminToken === "" || getCookie(event, "admin_token") !== adminToken) {
    throw createError({ status: 401, message: "需要管理者權限" });
  }

  const id = getRouterParam(event, "id");
  const messages = await getMessages();

  if (!messages.some((message) => message.id === id)) {
    throw createError({ status: 404, message: "找不到這則留言" });
  }

  await saveMessages(messages.filter((message) => message.id !== id));
  return { ok: true };
});
```

改的只有前幾行：原本寫死的 `const adminToken = "demo-secret-token";` 拿掉了，改用 `useRuntimeConfig(event)` 讀出來（`{ adminToken }` 是第 2 章學過的物件解構）。最後在留言板專案的根目錄新增 `.env`：

```text
NUXT_ADMIN_TOKEN=demo-secret-token
```

`npm run dev` 會讀 `.env`，所以開發時一切照舊，用 `demo-secret-token` 登入就能刪除留言。

**`adminToken === ""` 這個檢查非常重要。** 如果忘了設定環境變數，`adminToken` 就是預設的空字串。這時候如果只比對 cookie，有人送一個值是空的 cookie 過來（`curl -b "admin_token="`），空字串等於空字串，檢查就通過了。我把這個檢查拿掉實際試過，真的刪得掉。加上這一行，忘了設定的時候，就變成**誰都不能刪**，而不是**誰都能刪**。

我用建置好的版本實際測試：

| 啟動方式 | 帶的 cookie | 結果 |
| --- | --- | --- |
| 沒有設定 `NUXT_ADMIN_TOKEN` | `admin_token=`（空的） | 401 需要管理者權限 |
| 沒有設定 `NUXT_ADMIN_TOKEN` | `admin_token=demo-secret-token` | 401 需要管理者權限 |
| `NUXT_ADMIN_TOKEN=demo-secret-token` | `admin_token=猜錯` | 401 需要管理者權限 |
| `NUXT_ADMIN_TOKEN=demo-secret-token` | `admin_token=demo-secret-token` | `{ "ok": true }` |

正式上線時，換一個別人猜不到的長暗號，用環境變數給伺服器就好，不用改任何程式碼。

### 預先渲染的頁面不會跟著變

最後有一個陷阱。用 `NUXT_PUBLIC_SITE_NAME=正式網站` 啟動伺服器之後，看看預先渲染的 `/about` 裡寫的設定：

```bash
curl -s localhost:3000/about | grep -o 'siteName:"[^"]*"'
```

```text
siteName:"開發中的網站"
```

`/about` 是建置時就做好的 HTML 檔案，建置時讀到的是 `.env` 裡的值，之後換環境變數也改不到一個已經存好的檔案。用到 `runtimeConfig` 的頁面要預先渲染的話，記得在**建置時**就給好正確的環境變數。

## 重點整理

- 在 `nuxt.config.ts` 的 `runtimeConfig` 宣告設定；`public` 裡的會送到瀏覽器，外面的只有伺服器拿得到。伺服器端用 `useRuntimeConfig(event)` 讀，頁面用 `useRuntimeConfig()`。
- 祕密（例如留言板的管理暗號）放在私密值，預設空字串，並且檢查「沒設定」的情況，讓忘了設定時誰都不能通過。
- 環境變數 `NUXT_名稱` 會覆蓋對應的設定，公開的值是 `NUXT_PUBLIC_名稱`，換了不用重新建置。
- `.env` 只有 `npm run dev` 和 `npm run preview` 會讀，正式環境要用真正的環境變數；`.env` 不要放進版本控制。
- 預先渲染的頁面在建置時就固定了，之後換環境變數不會影響它。
