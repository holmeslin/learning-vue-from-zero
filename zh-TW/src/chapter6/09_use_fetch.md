# 把抓資料抽成 composable

## 本集目標

把第 6 集抓資料的邏輯做成 `useFetch`，並學會讓 composable 接收會變動的參數。

## 正文

### 抓資料的程式碼太長了

回頭看第 6 集，光是抓一位使用者，`<script setup>` 就有三十幾行。如果另一個元件要抓文章清單，同樣的載入中、錯誤、競態處理又要再寫一次。這正是上一集說的「抽成 composable 的好時機」。

### 第一個版本：直接傳網址

建立 `src/composables/useFetch.js`：

```js
import { onWatcherCleanup, ref, toValue, watch } from "vue";

export function useFetch(url) {
  const data = ref(null);
  const loading = ref(false);
  const error = ref("");

  watch(
    () => toValue(url),
    async (currentUrl) => {
      let stale = false;
      onWatcherCleanup(() => {
        stale = true;
      });

      loading.value = true;
      error.value = "";
      data.value = null;

      try {
        const response = await fetch(currentUrl);
        if (!response.ok) {
          throw new Error(`伺服器回應失敗：${response.status}`);
        }
        const json = await response.json();
        if (stale) return;
        data.value = json;
      } catch (e) {
        if (stale) return;
        error.value = e.message;
      }

      loading.value = false;
    },
    { immediate: true },
  );

  return { data, loading, error };
}
```

和第 6 集比起來，只是把 `user` 改名成比較通用的 `data`、拿掉 `delay`，再把監聽的來源換成 `() => toValue(url)`。`toValue` 等一下解釋，先看怎麼用。

把 `src/App.vue` 換成：

```vue
<script setup>
import { useFetch } from "./composables/useFetch.js";

const { data, loading, error } = useFetch(
  "https://jsonplaceholder.typicode.com/users/1",
);
</script>

<template>
  <p v-if="loading">載入中……</p>
  <p v-else-if="error">出錯了：{{ error }}</p>
  <p v-else-if="data">{{ data.name }}（{{ data.email }}）</p>
</template>
```

畫面先顯示「載入中……」，接著出現「Leanne Graham（Sincere@april.biz）」。整個抓資料的流程，在元件裡只剩一行呼叫。

### 網址會變的時候

如果像第 6 集一樣，要按按鈕切換使用者呢？直覺的寫法是這樣：

```js,ignore
const userId = ref(1);
const { data, loading, error } = useFetch(
  `https://jsonplaceholder.typicode.com/users/${userId.value}`,
);
```

這樣**不會動**。按按鈕改了 `userId`，畫面還是停在 1 號。

問題在於傳進去的是什麼。`userId.value` 在呼叫 `useFetch` 的那一刻被讀出來，組成一個普通的字串 `".../users/1"` 交給 `useFetch`。字串就是字串，它不會因為 `userId` 後來變了就跟著變，`useFetch` 也就無從得知。

解法是傳一個 **getter**，也就是第 1 集學的「呼叫了就回傳某個值」的函式：

```vue
<script setup>
import { ref } from "vue";
import { useFetch } from "./composables/useFetch.js";

const userId = ref(1);
const { data, loading, error } = useFetch(
  () => `https://jsonplaceholder.typicode.com/users/${userId.value}`,
);
</script>

<template>
  <button v-for="id in [1, 2, 999]" :key="id" @click="userId = id">
    {{ id }} 號
  </button>

  <p v-if="loading">載入中……</p>
  <p v-else-if="error">出錯了：{{ error }}</p>
  <p v-else-if="data">{{ data.name }}（{{ data.email }}）</p>
</template>
```

現在按「2 號」會顯示 Ervin Howell，按「999 號」會顯示「出錯了：伺服器回應失敗：404」。

傳進去的是函式，`useFetch` 可以在需要的時候**呼叫它**，每次都拿到最新的網址。`watch` 監聽的 `() => toValue(url)` 會呼叫這個 getter，順便讀到 `userId.value`，所以 `userId` 一變，監聽就重新執行。

### `toValue` 做了什麼

`toValue` 是 Vue 提供的小工具，把各種「可能是值」的東西統一轉成值：

- 給它 `ref`，回傳 `.value`。
- 給它函式，呼叫一次，回傳結果。
- 給它普通的值，原樣回傳。

所以 `useFetch` 不管收到普通字串、`ref` 還是 getter，都能用 `toValue(url)` 拿到網址。收到普通字串時，監聽只會在一開始執行一次；收到 `ref` 或 getter 時，它會跟著變。這讓同一個 composable 兩種情況都能用。

## 重點整理

- 抓資料的載入中、錯誤、競態處理可以整包抽成 `useFetch`，元件只要一行呼叫。
- 傳 `userId.value` 組成的字串進去，只是當下的值，之後不會跟著變。
- 要讓 composable 跟著變，就傳 `ref` 或 getter 函式進去。
- composable 裡用 `toValue` 把參數轉成值，普通值、`ref`、getter 都能接受。
