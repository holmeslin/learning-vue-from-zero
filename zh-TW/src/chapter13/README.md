# 渲染與資料抓取

上一章你用 Nuxt 做出了有好幾個頁面的網站。看起來和第一部用 Vite 做的專案差不多，但底下其實有個很大的不同：**Nuxt 的元件會在兩個地方執行**，先在伺服器上跑一次，再到瀏覽器裡跑一次。

這件事平常看不出來，可是一碰到「抓資料」「記住使用者的狀態」「用到瀏覽器才有的東西」，就會冒出各種怪問題：資料抓了兩次、畫面閃一下、終端機噴出看不懂的錯誤。這一章就是要把這兩個執行的地方講清楚，學會在 Nuxt 裡用對的工具做這些事：

- 伺服器和瀏覽器各做了什麼，什麼是 SSR 和 hydration
- 用 `useFetch`、`useAsyncData` 抓資料，以及為什麼不要在 setup 裡直接用 `$fetch`
- 用 `useState` 讓多個元件共用狀態
- 用 `<ClientOnly>` 處理只有瀏覽器才能做的事
- 看懂 hydration mismatch 的警告，知道怎麼修
- 用 `Lazy` 前綴和 lazy hydration 讓網頁載入得更快

## 準備環境

這一章用一個新的 Nuxt 專案練習。照第 12 章的方法執行 `npm create nuxt@latest`，範本選 **minimal**，專案名稱輸入 `render-demo`，其他問題的回答和第 12 章一樣。第 12 章的 `hello-nuxt`（小書店）這一章不會用到，這一章的範例都是獨立的小頁面，放在新專案裡比較不會互相干擾。建好之後進到資料夾：

```bash
cd render-demo
```

然後做三件事：

1. 把 `app/app.vue` 改成只放 `<NuxtPage />`，讓 `app/pages/` 裡的頁面接手：

   ```vue
   <template>
     <NuxtPage />
   </template>
   ```

2. 建立 `app/pages/index.vue`，當作首頁：

   ```vue
   <template>
     <h1>第 13 章範例</h1>
   </template>
   ```

3. 建立 `app/components/` 資料夾，之後每一集的元件都放這裡，頁面則放在 `app/pages/`。

最後啟動開發伺服器：

```bash
npm run dev
```

打開 <http://localhost:3000>，看到「第 13 章範例」就準備好了。這一章的範例會一直開著這個終端機視窗，因為很多東西要在這裡看。

### 要抓的資料

這一章抓資料用 [JSONPlaceholder](https://jsonplaceholder.typicode.com)，一個免費、公開的練習用 API。它會回傳假的文章、留言資料，例如打開 `https://jsonplaceholder.typicode.com/posts/1` 會看到一篇文章的 JSON。

自己寫 API 是第 14 章的事，這一章先抓別人的。
