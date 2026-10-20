# `swr` 與 `isr`：做好之後記一陣子

## 本集目標

用 `swr` 讓頁面渲染一次之後先記起來，過期再重做；並且知道 `isr` 和它差在哪。

## 正文

### 介於兩者之間

上一集的兩種做法剛好是兩個極端：

- 每次都重新渲染：永遠最新，但伺服器每次都要做事。
- 預先渲染：最快，但要等下次建置才會更新。

很多頁面需要的是中間的做法。例如「最新消息」，一天更新幾次，晚個幾分鐘才看到新消息沒關係，但總不能每次發消息都重新建置整個網站。

### `swr`

新增 `app/pages/news.vue`：

```vue
<!-- app/pages/news.vue -->
<script setup lang="ts">
const { data } = await useFetch("/api/now");
</script>

<template>
  <main>
    <h1>最新消息</h1>
    <p>產生時間：{{ data?.now }}</p>
  </main>
</template>
```

在 `routeRules` 加一行：

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  routeRules: {
    "/about": { prerender: true },
    "/news": { swr: 10 },
  },
});
```

`swr: 10` 的意思是：這一頁渲染一次之後，**在伺服器上記 10 秒**。真實的網站通常會設幾分鐘到幾小時，這裡設 10 秒是為了方便觀察。

### 實際跑一次

`npm run build`，再用 `node .output/server/index.mjs` 啟動。接著每隔幾秒抓一次 `/news`：

```bash
curl -s localhost:3000/news | grep 產生時間
```

下面是實際跑的結果，左邊是執行指令的時間，右邊是拿到的頁面上寫的產生時間：

```text
08:56:12 拿到 產生時間：08:56:12
08:56:16 拿到 產生時間：08:56:12
08:56:19 拿到 產生時間：08:56:12
08:56:26 拿到 產生時間：08:56:12
08:56:26 拿到 產生時間：08:56:26
08:56:27 拿到 產生時間：08:56:26
```

一行一行看：

1. 第一次請求，伺服器沒有記住任何東西，當場渲染，把結果記起來。
2. 第二、三次都在 10 秒內，伺服器直接把記住的那份送出去，沒有重新渲染。
3. 08:56:26 那次已經超過 10 秒，記住的那份**過期**了。但你拿到的**還是舊的**（08:56:12）。伺服器先把舊的送給你，同時在背後重新渲染一份新的。
4. 緊接著的下一次請求，就拿到背後做好的新版本（08:56:26）。

這種「先給舊的，背後再更新」的做法叫 **stale-while-revalidate**，`swr` 就是它的縮寫。stale 是「不新鮮的」，revalidate 是「重新確認」。它的好處是：使用者永遠不用等渲染，就算快取過期了，也是馬上拿到舊版。代價是過期之後的第一個人會看到稍微舊一點的內容。

### 標頭說了什麼

```bash
curl -s -D - -o /dev/null localhost:3000/news
```

```text
HTTP/1.1 200 OK
last-modified: Tue, 20 Oct 2026 00:56:12 GMT
etag: W/"2svijOPnC9"
cache-control: s-maxage=10, stale-while-revalidate
content-type: text/html;charset=utf-8
x-powered-by: Nuxt
...
```

`cache-control` 這一行是寫給**中間人**看的。網站上線之後，使用者和你的伺服器之間常常隔著一層 **CDN**（內容傳遞網路，content delivery network）：分散在世界各地的快取伺服器，替你把內容送給離它最近的使用者。`s-maxage=10` 告訴 CDN「這份內容可以記 10 秒」，`stale-while-revalidate` 告訴它「過期之後可以先給舊的」。

所以 `swr` 其實做了兩件事：自己的伺服器會記，也告訴 CDN 可以記。

### 記在哪裡

用 `node .output/server/index.mjs` 執行時，這份快取記在伺服器的**記憶體**裡。重新啟動伺服器試試看，第一次請求就拿到新渲染的時間，之前記的全都沒了。這代表：

- 伺服器重新啟動，快取就清空。
- 如果你同時開好幾台伺服器分擔流量，每一台各記各的。

對一般的網站來說，這樣就夠用了。

順帶一提，`swr` 在 `npm run dev` 也會生效，而且開發模式是把快取存在 `.nuxt/cache` 資料夾裡，重新啟動也還在。我在開發模式打開 `/news`，第一次拿到的竟然是好幾分鐘前的時間。開發時如果覺得「改了怎麼沒變」，記得這一頁可能被快取了：等它過期之後再重新整理兩次，就會看到新的內容。

### `swr: true`

`swr` 也可以寫 `true` 而不寫秒數。官方文件的說明是：這時候只加上 `stale-while-revalidate` 標頭，不設定過期時間。這種寫法比較少用，初學先寫秒數，行為最清楚。

### `isr`

`routeRules` 還有一個長得很像的選項：`isr`。新增 `app/pages/blog.vue`（內容和 `news.vue` 一樣，把標題改成「部落格」），再加一條規則：

```ts,ignore
    "/blog": { isr: 60 },
```

建置、啟動，抓兩次 `/blog`：

```text
產生時間：08:56:27
產生時間：08:56:28
```

時間每次都不一樣，標頭也沒有 `cache-control`：

```text
HTTP/1.1 200 OK
content-type: text/html;charset=utf-8
x-powered-by: Nuxt
...
```

**用 Node.js 伺服器執行時，`isr` 什麼事都沒做。** 這不是寫錯，而是 `isr`（incremental static regeneration，增量靜態再生）是專門給 **Vercel、Netlify** 這類部署平台用的：它把頁面記在平台的 CDN 上，而不是你的伺服器。官方文件說 `isr` 的行為和 `swr` 很像，差別是它可以把內容放進 CDN 的快取，寫成 `isr: true` 的話，會一直記到下次部署為止。第 8 集會看到，用 Vercel 的設定建置時，`isr: 60` 確實會變成平台的設定。

### 該用哪一個

| 你的網站放在 | 用這個 |
| --- | --- |
| 自己的 Node.js 伺服器 | `swr` |
| Vercel、Netlify | `isr` |

## 重點整理

- `swr: 秒數` 讓頁面渲染一次之後記住一段時間，期間內直接送出記住的版本。
- 過期之後，下一個人先拿到舊版，伺服器同時在背後重新渲染，這叫 stale-while-revalidate。
- 用 Node.js 伺服器執行時，`swr` 的快取記在記憶體，重新啟動就清空。
- `isr` 是給 Vercel、Netlify 這類平台用的，在自己的 Node.js 伺服器上沒有效果。
