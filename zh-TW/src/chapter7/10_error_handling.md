# 錯誤處理（`onErrorCaptured`）

## 本集目標

用 `onErrorCaptured` 做一個「錯誤邊界」元件：裡面的元件出錯時，改顯示一段備用畫面，而不是讓錯誤到處擴散。

## 正文

### 問題：一個元件出錯

程式總會出錯。最常見的是資料不是你以為的樣子，例如以為有使用者資料，結果是 `null`。

建立 `src/components/UserCard.vue`，按下按鈕就模擬資料壞掉：

```vue
<script setup>
import { ref } from "vue";

const user = ref({ name: "小明" });
</script>

<template>
  <p>使用者：{{ user.name }}</p>
  <button @click="user = null">模擬資料壞掉</button>
</template>
```

按下按鈕後，模板要讀 `null` 的 `name`，這是第 1 章講過的錯誤，Console 會出現紅字：

```text
TypeError: Cannot read properties of null (reading 'name')
```

這個元件的畫面也沒辦法正常更新了。使用者只看到一個按了沒反應的按鈕，不知道發生什麼事。

### 錯誤邊界

建立 `src/components/ErrorBoundary.vue`：

```vue
<script setup>
import { ref, onErrorCaptured } from "vue";

const error = ref(null);

onErrorCaptured((err) => {
  error.value = err;
  return false;
});
</script>

<template>
  <div v-if="error" class="fallback">
    <p>這一塊出錯了：{{ error.message }}</p>
    <button @click="error = null">再試一次</button>
  </div>
  <slot v-else />
</template>

<style scoped>
.fallback {
  padding: 8px;
  border: 1px solid crimson;
  color: crimson;
}
</style>
```

把 `src/App.vue` 換成：

```vue
<script setup>
import ErrorBoundary from "./components/ErrorBoundary.vue";
import UserCard from "./components/UserCard.vue";
</script>

<template>
  <h1>我的頁面</h1>

  <ErrorBoundary>
    <UserCard />
  </ErrorBoundary>

  <p>這段文字不受影響。</p>
</template>
```

按「模擬資料壞掉」，`UserCard` 那一塊換成紅框：

```text
這一塊出錯了：Cannot read properties of null (reading 'name')
[再試一次]
```

上面的標題和下面的段落都好好的。按「再試一次」，`UserCard` 又回來了，顯示「使用者：小明」。

### `onErrorCaptured` 做了什麼

`onErrorCaptured` 是生命週期 Hook，用法和第 6 章的 `onMounted` 一樣，在 `<script setup>` 裡呼叫，給它一個 callback。

它的意思是：**我底下的任何元件出錯時，通知我。** 不管是子元件、孫元件，還是更深的元件，錯誤都會往上傳，一路經過每一個有 `onErrorCaptured` 的祖先元件。

callback 收到的第一個引數就是錯誤本身，`err.message` 是錯誤訊息。拿到錯誤之後，`ErrorBoundary` 做的事很單純：

1. 把錯誤存進 `error` 這個 `ref`。
2. `error` 有值，`v-if` 成立，模板改畫紅框，`<slot />` 連同裡面出錯的 `UserCard` 一起從畫面上拿掉。
3. 按「再試一次」把 `error` 設回 `null`，`<slot />` 重新出現，`UserCard` 重新掛載，它的 `user` 又是全新的「小明」。

這種「把一塊區域包起來，裡面出錯就顯示備用畫面」的元件，通常叫做**錯誤邊界**（error boundary）。它用的是第 4 章的預設 slot，所以要保護哪一塊，就把它包進 `<ErrorBoundary>`。

### `return false`：到我這裡為止

callback 最後的 `return false` 很重要。它的意思是「這個錯誤我處理好了，不用再往上傳」。

不寫的話，錯誤會繼續往上，交給更上層的 `onErrorCaptured`，最後交給整個 app 的錯誤處理（下面會講），Console 也會照樣出現紅字。

### 它抓得到什麼、抓不到什麼

抓得到底下元件的這些錯誤：

- 模板渲染時的錯誤，像上面的範例。
- `<script setup>` 裡、生命週期 Hook 裡、`watch` 裡的錯誤。
- 事件處理函式裡的錯誤，包括 `async` 函式裡 `await` 失敗的錯誤。

抓不到的：

- **自己這個元件**的錯誤。`onErrorCaptured` 只管底下的元件，所以錯誤邊界要包在別的元件外面才有用。
- Vue 管不到的地方，例如 `setTimeout` 的 callback 裡丟出的錯誤。

### 整個 app 的最後一道防線

所有沒被 `return false` 攔下來的錯誤，最後都會交給 `app.config.errorHandler`。`app.config` 是整個應用程式的設定，`errorHandler` 是其中一項，給它一個函式，有錯誤沒人處理時就會呼叫它。它設定在 `src/main.js`，和第 5 集的 `app.provide` 一樣，要寫在 `app.mount()` 之前。原本檔案最上面的其他 `import`（例如 CSS）照樣留著，第 5 集加過 `app.provide` 的話也可以留著，只要把建立 app 的部分改成這樣：

```js
import { createApp } from "vue";
import App from "./App.vue";

const app = createApp(App);

app.config.errorHandler = (err) => {
  console.error("有錯誤沒被處理：", err);
};

app.mount("#app");
```

`console.error` 和 `console.log` 一樣是印出訊息，只是在 Console 裡會用紅字顯示，表示這是錯誤。正式的網站通常會在這裡把錯誤送到錯誤追蹤服務，讓開發者知道使用者遇到了什麼問題。

## 重點整理

- `onErrorCaptured` 會在底下任何元件出錯時被呼叫，第一個引數是錯誤本身。
- 搭配 `ref`、`v-if` 和 slot，可以做出錯誤邊界：出錯時改顯示備用畫面，其他地方不受影響。
- callback `return false` 會讓錯誤停在這裡，不再往上傳。
- 它抓不到自己這個元件的錯誤，也抓不到 `setTimeout` 這類 Vue 管不到的地方。
- 沒被攔下來的錯誤最後交給 `app.config.errorHandler`。
