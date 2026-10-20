# 快取、渲染與部署

到目前為止，你都是用 `npm run dev` 看網站。開發模式很方便，改了程式碼畫面馬上更新，可是它不是網站真正上線時的樣子。這一章要把網站「做成成品」，然後放到網路上。

做成品之前，有一個問題要先想清楚：**每一頁的 HTML，應該什麼時候產生？**

- 建置的時候先做好，每個人拿到的都一樣，最快，但內容不會變。
- 每次有人打開才現做，內容永遠最新，但伺服器每次都要花力氣。
- 做好之後先記起來一陣子，過期再重做，介於兩者之間。
- 乾脆不在伺服器做，交給瀏覽器自己畫。

第 13 章你學到 Nuxt 預設是第二種：每次請求都在伺服器渲染。這一章會學怎麼用 `routeRules` 替每一頁挑不同的做法，這叫**混合渲染**。接著學怎麼把密碼、金鑰這類設定放在程式碼外面（`runtimeConfig` 與環境變數），最後是建置、產生靜態網站和部署。

開發模式不是網站上線時的樣子，有些效果（例如預先渲染）在 `npm run dev` 根本看不到。所以這一章每一集都會要你先 `npm run build`，再啟動正式模式的伺服器來觀察。

## 準備環境

這一章的範例要比較各種渲染方式，頁面越單純越好看出差別，所以另外建一個新的 Nuxt 專案。在你放練習專案的資料夾執行：

```bash
npm create nuxt@latest nuxt-site
```

和第 14 章一樣，範本選 **minimal**，其他問題的回答和第 12 章一樣。建好之後進到專案裡：

```bash
cd nuxt-site
```

把 `app/app.vue` 改成只顯示頁面：

```vue
<!-- app/app.vue -->
<template>
  <NuxtPage />
</template>
```

這一章的每一頁都會顯示「這個 HTML 是什麼時候產生的」，靠的是一支回傳現在時間的 API。在專案根目錄新增 `server/api/now.ts`：

```ts
// server/api/now.ts
export default defineEventHandler(() => {
  return { now: new Date().toLocaleTimeString("zh-TW", { hour12: false }) };
});
```

`toLocaleTimeString("zh-TW", { hour12: false })` 會把時間轉成 `14:05:09` 這種 24 小時制的格式。

最後新增首頁 `app/pages/index.vue`：

```vue
<!-- app/pages/index.vue -->
<script setup lang="ts">
const { data } = await useFetch("/api/now");
</script>

<template>
  <main>
    <h1>首頁</h1>
    <p>產生時間：{{ data?.now }}</p>
  </main>
</template>
```

執行 `npm run dev`，打開 <http://localhost:3000> 確認畫面上有時間，就可以開始了。

第 14 章的留言板專案 `nuxt-guestbook` 也請留著：第 6 集會回到那個專案，把管理者的暗號改成用環境變數設定。

這一章會常常用 `curl` 看伺服器的回應，用法和第 14 章一樣。Windows 的 PowerShell 要打成 `curl.exe`；有些指令後面接了 `| grep`，PowerShell 沒有 `grep`，改用瀏覽器打開網址、重新整理來觀察就好。
