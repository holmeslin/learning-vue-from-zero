# 用 `watch` 抓資料

## 本集目標

用 `watch` 從網路上抓資料，並處理「載入中」「出錯了」和「請求順序錯亂」三種狀況。

## 正文

### 要用的 API

這一集用一個公開的測試 API：[JSONPlaceholder](https://jsonplaceholder.typicode.com)。它提供假的使用者資料，不用註冊、不用金鑰，很適合練習。

把這個網址貼到瀏覽器網址列看看：

```text
https://jsonplaceholder.typicode.com/users/1
```

會看到一段 JSON，開頭是這樣（後面還有地址、公司等資料）：

```text
{
  "id": 1,
  "name": "Leanne Graham",
  "username": "Bret",
  "email": "Sincere@april.biz",
```

把網址最後的 `1` 換成 `2` 到 `10`，就是其他使用者。換成不存在的 `999`，伺服器會回應 404（找不到）。

### 第一版

需求是：畫面上有幾個按鈕，按哪一個，就抓那位使用者的資料來顯示。抓的過程中顯示「載入中」，失敗了顯示錯誤訊息。

```vue
<script setup>
import { ref, watch } from "vue";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const userId = ref(1);
const user = ref(null);
const loading = ref(false);
const error = ref("");

watch(
  userId,
  async (id) => {
    loading.value = true;
    error.value = "";
    user.value = null;

    try {
      // 刻意讓 1 號比較慢，模擬網路速度不穩
      await delay(id === 1 ? 2000 : 300);
      const url = `https://jsonplaceholder.typicode.com/users/${id}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`伺服器回應失敗：${response.status}`);
      }
      user.value = await response.json();
    } catch (e) {
      error.value = e.message;
    }

    loading.value = false;
  },
  { immediate: true },
);
</script>

<template>
  <button v-for="id in [1, 2, 999]" :key="id" @click="userId = id">
    {{ id }} 號
  </button>
  <p>你選的是 {{ userId }} 號</p>

  <p v-if="loading">載入中……</p>
  <p v-else-if="error">出錯了：{{ error }}</p>
  <p v-else-if="user">{{ user.name }}（{{ user.email }}）</p>
</template>
```

拆開來看：

- **三個 `ref` 對應三種狀況**：`user` 放抓到的資料，`loading` 表示正在抓，`error` 放錯誤訊息。模板用 `v-if` / `v-else-if` 決定顯示哪一種。
- **監聽 `userId`**：使用者按按鈕改了 `userId`，callback 就重新抓一次。加上 `{ immediate: true }`，頁面一打開就會先抓 1 號。
- **callback 是 `async` 函式**：裡面用第 2 章學的樣板：`fetch`、檢查 `response.ok`、`json()`，整段用 `try...catch` 包起來。
- **`delay`**：JSONPlaceholder 回應很快，為了看清楚接下來的問題，刻意讓 1 號等兩秒、其他等 0.3 秒。真實的網路速度本來就忽快忽慢，這只是把它放大。

這裡用 `watch` 而不是 `watchEffect`，是因為第 2 集說過的陷阱：`async` 函式在 `await` 之後讀到的值不會被追蹤。用 `watch` 明確寫出「監聽 `userId`」，就不用擔心這件事。

試試看：

- 頁面打開，顯示「載入中……」，兩秒後出現「Leanne Graham（Sincere@april.biz）」。
- 按「2 號」，一下子就出現「Ervin Howell（Shanna@melissa.tv）」。
- 按「999 號」，出現「出錯了：伺服器回應失敗：404」。

看起來都沒問題。

### 發現 bug：先發出的請求後回來

重新整理頁面，然後**在兩秒內**按「2 號」：

1. 一開始抓 1 號，要等 2 秒。
2. 你改選 2 號，又發出一個請求，只要 0.3 秒。
3. 0.3 秒後 2 號的結果先回來，顯示 Ervin Howell，正確。
4. 再過一會兒，**1 號的結果才回來**，把畫面蓋成 Leanne Graham。

最後畫面上寫著「你選的是 2 號」，下面卻是 1 號的資料。這種「先發出的請求反而比較晚回來，用舊資料蓋掉新資料」的問題，叫做**競態**（race condition）。網路速度本來就不穩定，真實世界很容易遇到。

### 修正：用 `onWatcherCleanup` 丟掉過期的結果

回想第 3 集：`userId` 改變、callback 要重新執行之前，Vue 會先呼叫上一次登記的清除函式。可以在清除函式裡，把上一次的請求標記成「過期」：

```vue
<script setup>
import { onWatcherCleanup, ref, watch } from "vue";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const userId = ref(1);
const user = ref(null);
const loading = ref(false);
const error = ref("");

watch(
  userId,
  async (id) => {
    let stale = false;
    onWatcherCleanup(() => {
      stale = true;
    });

    loading.value = true;
    error.value = "";
    user.value = null;

    try {
      // 刻意讓 1 號比較慢，模擬網路速度不穩
      await delay(id === 1 ? 2000 : 300);
      const url = `https://jsonplaceholder.typicode.com/users/${id}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`伺服器回應失敗：${response.status}`);
      }
      const data = await response.json();
      if (stale) return;
      user.value = data;
    } catch (e) {
      if (stale) return;
      error.value = e.message;
    }

    loading.value = false;
  },
  { immediate: true },
);
</script>

<template>
  <button v-for="id in [1, 2, 999]" :key="id" @click="userId = id">
    {{ id }} 號
  </button>
  <p>你選的是 {{ userId }} 號</p>

  <p v-if="loading">載入中……</p>
  <p v-else-if="error">出錯了：{{ error }}</p>
  <p v-else-if="user">{{ user.name }}（{{ user.email }}）</p>
</template>
```

改了三個地方：

1. **每次執行都有自己的 `stale`**（過期的意思），一開始是 `false`。
2. **`onWatcherCleanup` 寫在最前面**，在第一個 `await` 之前。改選 2 號時，Vue 先呼叫 1 號那次的清除函式，把**1 號那次**的 `stale` 設成 `true`。
3. **結果回來時先檢查 `stale`**。1 號的結果就算晚回來，看到自己已經過期，就直接 `return`，不去動畫面。錯誤也一樣處理，過期請求的錯誤不該顯示出來。

再試一次「重新整理後兩秒內按 2 號」，畫面會停在 Ervin Howell，不會再被蓋掉。

注意 `loading.value = false` 也被 `return` 跳過了。這是對的：過期的請求不該宣布「載入完成」，因為新的請求可能還在路上，`loading` 交給新的那次去關。

### 更進一步：真的取消請求

上面的寫法是「請求照樣送出，只是結果不要了」。瀏覽器還提供一個工具 `AbortController`，可以把還沒完成的 `fetch` 直接取消，連網路流量都省下來。

要改的地方有三個。第一，把 `let stale` 和它的清除函式換成：

```js,ignore
const controller = new AbortController();
onWatcherCleanup(() => {
  controller.abort();
});
```

`new AbortController()` 建立一個「取消器」。第二，把它的 `signal` 交給 `fetch`：

```js,ignore
const response = await fetch(url, { signal: controller.signal });
```

之後呼叫 `controller.abort()`，這個 `fetch` 就會中止。

第三，把兩個 `if (stale) return;` 都換成：

```js,ignore
if (controller.signal.aborted) return;
```

被中止的 `fetch` 會丟出錯誤，跳進 `catch`。這不是真的出錯，不該顯示給使用者看，所以 `catch` 裡的檢查一定要留著。`try` 裡那一個也要留，因為取消可能發生在資料已經抓完、還沒放進 `user` 的那一瞬間。

兩種寫法都能解決競態，初學時用 `stale` 旗標就很夠了。

### 實務上的建議

自己抓資料要處理載入中、錯誤、競態，之後還會想要快取、重新整理……事情很多。真實專案常用現成的工具，例如附錄一介紹的 VueUse 和 TanStack Query，第二部的 Nuxt 也內建了抓資料的功能。先懂這一集的原理，你才看得懂那些工具幫你做了什麼。

## 重點整理

- 用 `watch` 監聽會影響請求的值（例如 `userId`），加上 `{ immediate: true }` 讓頁面一打開就抓。
- 用三個 `ref` 分別記錄資料、載入中、錯誤，模板用 `v-if` / `v-else-if` 決定顯示哪一個。
- 先發出的請求可能比較晚回來，用舊資料蓋掉新資料，這叫競態。
- 在 `await` 之前用 `onWatcherCleanup` 把上一次的請求標成過期，結果回來時先檢查，過期就丟掉。
- `AbortController` 可以直接取消 `fetch`，但被取消時會跳進 `catch`，要記得分辨。
