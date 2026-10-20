# `error.vue` 與 `createError`

## 本集目標

找不到書的時候顯示 404 錯誤頁，並且用 `error.vue` 把錯誤頁換成自己設計的樣子。

## 正文

### 兩種找不到

「找不到」有兩種情況：

1. **整個網址根本不存在**，例如 `/nowhere`。`pages/` 裡沒有任何檔案對得上，Nuxt 會自動顯示 404 錯誤頁，你什麼都不用做。
2. **網址對得上，但是資料不存在**，例如 `/books/999`。`[id].vue` 確實存在，但是沒有編號 999 的書。Nuxt 不知道這該算 404，要你自己告訴它。

第 9 章你是在頁面裡用 `v-if` / `v-else`，找不到時顯示「找不到這個商品」。這樣使用者看得懂，但對伺服器來說，這一頁還是「成功」的，回傳的 HTTP 狀態碼是 `200`。搜尋引擎看到 `200`，會以為這是一個正常的頁面而收錄它。

**HTTP 狀態碼**是伺服器回應時附上的一個數字，告訴瀏覽器和搜尋引擎這次請求的結果。`200` 是成功，`404` 是找不到，`500` 是伺服器出錯。在 SPA 裡，伺服器永遠只送同一個 `index.html`，所以狀態碼一律是 `200`；Nuxt 是伺服器在產生每一頁，所以可以回傳正確的狀態碼。

### `createError`

把 `app/pages/books/[id].vue` 改成：

```vue
<script setup lang="ts">
const route = useRoute();
const id = route.params.id;
const book = typeof id === "string" ? getBook(id) : undefined;

if (!book) {
  throw createError({
    status: 404,
    statusText: "Not Found",
    message: "找不到這本書",
    fatal: true,
  });
}

const { likes, like } = useLikes();
</script>

<template>
  <main>
    <h1>{{ book.title }}</h1>
    <p>{{ book.summary }}</p>
    <button @click="like">讚 {{ likes }}</button>
  </main>
</template>
```

`createError` 建立一個 Nuxt 認得的錯誤物件，`throw` 把它丟出去，這一頁就不會繼續渲染，改成顯示錯誤頁。它不用 import。

`createError` 的幾個欄位：

- `status`：HTTP 狀態碼，找不到用 `404`。
- `statusText`：跟著狀態碼一起送出的簡短說明，它會放進 HTTP 回應的第一行，只能用英文。`404` 的標準說法是 `Not Found`。
- `message`：給人看的錯誤訊息，可以寫中文。
- `fatal: true`：「這是嚴重的錯誤，要顯示整頁的錯誤畫面」。在伺服器上產生頁面時，不寫也會顯示錯誤頁；但使用者在瀏覽器裡點 `<NuxtLink>` 換頁時，沒有 `fatal: true` 的錯誤不會換成錯誤頁。為了兩邊行為一致，找不到資料的時候都加上它。

舊的文章和教學常寫成 `statusCode` 和 `statusMessage`，那是以前的名字，現在建議用 `status` 和 `statusText`。

仔細看 TypeScript 的部分：`if (!book)` 裡丟出了錯誤，之後的程式碼就不會執行。所以 TypeScript 知道，走到 `if` 下面的時候 `book` 一定有值。模板裡也就可以直接寫 `book.title`，不用再寫 `book?.title`。

打開 <http://localhost:3000/books/999>，會看到 Nuxt 預設的錯誤頁：大大的 `404`，下面是 `Not Found` 和「找不到這本書」，還有一個「Go back home」連結。

用第 7 集學過的 `curl -i` 確認狀態碼：

```bash
curl -i http://localhost:3000/books/999
```

第一行是：

```text
HTTP/1.1 404 Not Found
```

狀態碼是 `404`，後面就是你寫的 `statusText`。

### 自訂錯誤頁：`error.vue`

預設的錯誤頁是英文的，而且沒有你的導覽列。想要自己設計，就建立 `app/error.vue`。注意它放在 `app/` 裡，和 `app.vue` 並排，不是放在 `pages/` 裡：

```vue
<script setup lang="ts">
import type { NuxtError } from "#app";

defineProps<{
  error: NuxtError;
}>();

function goHome() {
  clearError({ redirect: "/" });
}
</script>

<template>
  <NuxtLayout>
    <main>
      <h1>{{ error.status }}</h1>
      <p>{{ error.message }}</p>
      <button @click="goHome">回首頁</button>
    </main>
  </NuxtLayout>
</template>
```

幾個重點：

- **Nuxt 會把錯誤物件當成 props 傳進來**，名字叫 `error`，型別是 `NuxtError`。`import type` 表示「只匯入型別」，`NuxtError` 只用在型別上，所以這樣寫。`#app` 是 Nuxt 內部的路徑，照抄就好。
- **`error.vue` 不會經過 `app.vue`**。出錯的時候，Nuxt 是用 `error.vue` 取代整個 `app.vue`，所以 layout 不會自動套上。這裡自己用 `<NuxtLayout>` 包起來，錯誤頁才有導覽列和 footer。
- **`clearError` 清掉錯誤**。錯誤發生之後，Nuxt 會一直顯示錯誤頁，直到錯誤被清掉。`clearError({ redirect: "/" })` 會清掉錯誤，再換到首頁。導覽列上的 `<NuxtLink>` 也能離開錯誤頁，因為 Nuxt 在換頁時會自動清掉錯誤。

存檔後，再打開 `/books/999`，就是你設計的錯誤頁了：

```html
<main><h1>404</h1><p>找不到這本書</p><button>回首頁</button></main>
```

`/nowhere` 也會用同一個 `error.vue`，畫面上的訊息是 Nuxt 自動產生的 `Page not found: /nowhere`。一個 `error.vue` 就接住了整個網站所有的錯誤。

### 不只是找不到

`error.vue` 不只處理 404。程式在渲染頁面時出了任何沒處理的錯誤，例如讀取了 `undefined` 的屬性，也都會顯示它，這時 `error.status` 會是 `500`。所以 `error.vue` 不要寫死「找不到」這種字眼，而是像上面這樣顯示 `error.status` 和 `error.message`。

## 重點整理

- 網址完全不存在時，Nuxt 會自動顯示 404；網址對得上但資料不存在時，要自己 `throw createError({ status: 404, ... })`。
- `status` 決定 HTTP 狀態碼，`statusText` 用英文，給人看的中文寫在 `message`。
- 加上 `fatal: true`，在瀏覽器裡換頁時也會顯示錯誤頁。
- `app/error.vue` 自訂錯誤頁，錯誤物件從 props 的 `error` 拿到；它不經過 `app.vue`，要 layout 就自己包 `<NuxtLayout>`。
- `clearError({ redirect: "/" })` 清掉錯誤並換到首頁。
