# `routeRules` 與預先渲染

## 本集目標

用 `routeRules` 的 `prerender`，讓內容不會變的頁面在建置時就先做好。

## 正文

### 每次都重做，有必要嗎？

上一集看到，首頁每次被打開，伺服器都會重新渲染一次。如果頁面內容每次都不一樣（例如顯示現在時間），這是必要的。可是很多頁面的內容幾乎不會變，例如「關於我們」：一年改不到一次，卻要伺服器每次重做，很浪費。

新增 `app/pages/about.vue`：

```vue
<!-- app/pages/about.vue -->
<script setup lang="ts">
const { data } = await useFetch("/api/now");
</script>

<template>
  <main>
    <h1>關於我們</h1>
    <p>產生時間：{{ data?.now }}</p>
  </main>
</template>
```

這一頁也顯示產生時間，方便你看出它是什麼時候做好的。

### 加上 `routeRules`

打開 `nuxt.config.ts`，加上 `routeRules`：

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  routeRules: {
    "/about": { prerender: true },
  },
});
```

`routeRules` 是一個物件：左邊是網址，右邊是這個網址要套用的規則。`{ prerender: true }` 的意思是**預先渲染**（prerender）：在建置的時候，就把這一頁渲染成 HTML 檔案存起來。

`compatibilityDate` 和 `devtools` 是專案建立時就有的設定，照原樣留著就好，之後的範例也一樣。你的檔案裡可能是單引號、沒有分號，這本書統一寫成雙引號加分號，兩種寫法效果完全一樣。

### 建置時就做好了

執行 `npm run build`，這次輸出裡多了幾行：

```text
[nitro] ℹ Initializing prerenderer
[nitro] ℹ Prerendering 1 routes
[nitro]   ├─ /about (25ms)
[nitro]   ├─ /about/_payload.json (1ms)
[nitro] ℹ Prerendered 2 routes in 0.437 seconds
```

建置的過程中，Nuxt 自己去「打開」了一次 `/about`，把結果存成檔案。看看 `.output/public`：

```text
.output/public
├── _nuxt
├── about
│   ├── _payload.json
│   └── index.html
├── favicon.ico
└── robots.txt
```

`about/index.html` 就是做好的頁面。`_payload.json` 是這一頁 `useFetch` 拿到的資料，當使用者從別頁點 `NuxtLink` 換到 `/about` 時，瀏覽器會直接讀這個檔案，不用再呼叫 API。

### 每次拿到的都一樣

用 `node .output/server/index.mjs` 啟動伺服器，隔幾秒抓兩次 `/about`：

```bash
curl -s localhost:3000/about | grep 產生時間
```

兩次都是：

```text
產生時間：08:55:09
```

這個時間是**建置的時間**。不管你什麼時候打開，不管重新啟動伺服器幾次，都是這個時間，直到下一次 `npm run build`。

再看看回應標頭（header）。標頭是伺服器在內容前面附上的說明資訊，`curl` 加上 `-D -` 可以印出來，`-o /dev/null` 是把內容丟掉不印：

```bash
curl -s -D - -o /dev/null localhost:3000/about
```

```text
HTTP/1.1 200 OK
Content-Type: text/html;charset=utf-8
ETag: "6c8-QI+DL1VhZltwfpP/GYvFwxTc/Ac"
Last-Modified: Tue, 20 Oct 2026 00:55:09 GMT
Content-Length: 1736
Date: Tue, 20 Oct 2026 00:55:15 GMT
Connection: keep-alive
Keep-Alive: timeout=5
```

對照首頁的標頭：

```bash
curl -s -D - -o /dev/null localhost:3000/
```

```text
HTTP/1.1 200 OK
content-type: text/html;charset=utf-8
x-powered-by: Nuxt
...
```

首頁有 `x-powered-by: Nuxt`，表示這個回應是 Nuxt 當場渲染出來的；`/about` 沒有，而是多了 `Last-Modified`（檔案最後修改的時間），因為它是直接把 `.output/public/about/index.html` 這個檔案送出去，完全沒有執行你的 Vue 程式碼。送一個現成的檔案，比當場渲染快得多。

### 在開發模式看不出來

如果你用 `npm run dev` 打開 `/about`，會發現時間每次都不一樣。這是正常的：預先渲染是 `npm run build` 的時候才做的事，開發模式沒有建置這一步，所以 `/about` 照樣每次重新渲染。

### 適合預先渲染的頁面

- 內容只有改程式碼時才會變的頁面：關於我們、使用條款、隱私權政策。
- 每個人看到的內容都一樣的頁面。

不適合的：每個人看到的不一樣（例如「我的帳號」），或內容會一直更新（例如留言列表）。預先渲染的頁面要等下次建置才會更新，第 14 章的留言板如果預先渲染，新留言就永遠不會出現在頁面上。

## 重點整理

- `nuxt.config.ts` 的 `routeRules` 可以替不同網址設定不同規則。
- `prerender: true` 讓頁面在 `npm run build` 時就渲染成 HTML 檔案，放在 `.output/public`。
- 預先渲染的頁面直接以檔案送出，速度最快，但內容要等下次建置才會更新。
- 預先渲染要建置之後才看得到，開發模式每次都會重新渲染。
