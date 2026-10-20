# 第一支 API

## 本集目標

在 `server/api/` 寫出第一支 API，用瀏覽器、終端機和 `useFetch` 呼叫它。

## 正文

### 建立 API

在專案根目錄（和 `app/` 同一層，**不是**放在 `app/` 裡面）新增 `server/api/hello.ts`：

```ts
// server/api/hello.ts
export default defineEventHandler(() => {
  return { message: "哈囉，這是伺服器回傳的資料" };
});
```

存檔後，用瀏覽器打開 <http://localhost:3000/api/hello>，會看到：

```text
{
  "message": "哈囉，這是伺服器回傳的資料"
}
```

這就是一支 API 了。

### 檔名就是網址

和 `app/pages/` 的檔案路由一樣，`server/api/` 也是用檔名決定網址：

| 檔案 | 網址 |
| --- | --- |
| `server/api/hello.ts` | `/api/hello` |
| `server/api/time.ts` | `/api/time` |
| `server/api/books/list.ts` | `/api/books/list` |

網址前面一定有 `/api`，這是 `server/api/` 這個資料夾名稱帶來的。

### `defineEventHandler`

`server/` 裡的每個 API 檔案，都要 `export default` 一個 `defineEventHandler(...)`。小括號裡放一個函式，**每次有人請求這個網址，這個函式就會執行一次**，它回傳的東西就是回應的內容。

回傳物件或陣列的時候，Nuxt 會自動轉成 JSON 送出去，你不用自己呼叫 `JSON.stringify`。

和 `app/` 裡一樣，`defineEventHandler` 是自動匯入的，不用寫 `import`。不過 `server/` 和 `app/` 是兩個世界：`server/` 裡能用的是伺服器專用的函式（這一章會陸續介紹），`ref`、`useFetch` 這些是給頁面用的，在 `server/` 裡不會自動匯入，也不該在那裡用。

### 每次請求都會重新執行

再寫一支看看。新增 `server/api/time.ts`：

```ts
// server/api/time.ts
export default defineEventHandler(() => {
  return { now: new Date().toISOString() };
});
```

打開 <http://localhost:3000/api/time>：

```text
{
  "now": "2026-10-20T00:47:17.811Z"
}
```

重新整理幾次，時間每次都不一樣。這證明了函式是「每次請求執行一次」，不是只在伺服器啟動時跑一次。

`toISOString()` 把時間轉成國際標準格式的字串，結尾的 `Z` 代表這是世界標準時間，所以會比台灣時間少 8 小時。

### 用 `curl` 呼叫 API

除了瀏覽器，也可以用第 12 章看過的 `curl` 在終端機發請求。之後要送資料、測試錯誤情況時，用 `curl` 會比瀏覽器方便。開一個**新的**終端機視窗（原本那個還在跑 `npm run dev`），輸入：

```bash
curl localhost:3000/api/hello
```

```text
{
  "message": "哈囉，這是伺服器回傳的資料"
}
```

> macOS 和 Linux 都內建 `curl`。Windows 的 PowerShell 要打成 `curl.exe`；後面幾集有些指令帶了 JSON 資料，在 PowerShell 裡引號的規則不一樣，照打可能會失敗，看懂結果就好。

### 在頁面上使用

自己寫的 API，在頁面上的用法和上一章完全一樣。新增 `app/pages/hello.vue`：

```vue
<!-- app/pages/hello.vue -->
<script setup lang="ts">
const { data } = await useFetch("/api/hello");
</script>

<template>
  <p>{{ data?.message }}</p>
</template>
```

打開 <http://localhost:3000/hello>，畫面上會出現「哈囉，這是伺服器回傳的資料」。

網址只要寫 `/api/hello`，不用寫 `http://localhost:3000`，因為頁面和 API 在同一個網站上。

還有一個好處：把滑鼠移到 VS Code 裡的 `data` 上，會看到它的型別裡有 `message: string`。你沒有替它標型別，Nuxt 自動從 `server/api/hello.ts` 的回傳值推斷出來。改了 API 回傳的內容，頁面上的型別也會跟著變。

## 重點整理

- API 寫在專案根目錄的 `server/api/` 裡，檔名決定網址，前面一定是 `/api`。
- 每個 API 檔案 `export default` 一個 `defineEventHandler(函式)`，每次請求都會執行這個函式。
- 回傳物件或陣列，Nuxt 會自動轉成 JSON。
- 可以用瀏覽器、`curl` 或頁面上的 `useFetch` 呼叫 API，`useFetch` 還會自動推斷回傳值的型別。
