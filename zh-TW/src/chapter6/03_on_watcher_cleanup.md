# `onWatcherCleanup`

## 本集目標

用 `onWatcherCleanup` 在監聽重新執行之前，把上一次做的事收拾乾淨。

## 正文

### 打字打到一半就送出

做一個搜尋框：使用者停止打字半秒之後，才真的去搜尋。第 2 章學過 `setTimeout`，先用它寫寫看：

```vue
<script setup>
import { ref, watch } from "vue";

const keyword = ref("");
const searched = ref("");

watch(keyword, (newKeyword) => {
  setTimeout(() => {
    searched.value = newKeyword;
    console.log(`搜尋：${newKeyword}`);
  }, 500);
});
</script>

<template>
  <input v-model="keyword" placeholder="輸入關鍵字" />
  <p>正在搜尋：{{ searched }}</p>
</template>
```

在輸入框快速打 `vue` 三個字母，等半秒，Console 印出：

```text
搜尋：v
搜尋：vu
搜尋：vue
```

每打一個字就排了一個計時器，三個計時器一個都沒取消，最後還是全部執行了。如果「搜尋」是向伺服器送請求，這就送了三次，其中兩次是白費的。

### 先把上一次的取消掉

真正要的是：打下一個字的時候，**把上一個計時器取消掉**。

`setTimeout` 其實會回傳一個號碼，代表這個計時器。把號碼交給 `clearTimeout`，就能在它執行之前取消它。

問題是：「取消」要在**下一次** callback 執行之前做，那時候的程式碼要怎麼拿到這一次的號碼？這就是 `onWatcherCleanup` 的用途：

```vue
<script setup>
import { onWatcherCleanup, ref, watch } from "vue";

const keyword = ref("");
const searched = ref("");

watch(keyword, (newKeyword) => {
  const timer = setTimeout(() => {
    searched.value = newKeyword;
    console.log(`搜尋：${newKeyword}`);
  }, 500);

  onWatcherCleanup(() => {
    clearTimeout(timer);
  });
});
</script>

<template>
  <input v-model="keyword" placeholder="輸入關鍵字" />
  <p>正在搜尋：{{ searched }}</p>
</template>
```

再快速打一次 `vue`，這次 Console 只印出一行：

```text
搜尋：vue
```

`onWatcherCleanup` 登記一個**清除函式**（cleanup function）。Vue 會在這兩個時機呼叫它：

1. **這個監聽下一次要執行之前**：打下一個字時，先呼叫上一次登記的清除函式，把上一個計時器取消，再執行新的 callback。
2. **監聽停止的時候**：例如元件從畫面上消失（第 4 集會講），監聽跟著停止，最後一次登記的清除函式也會被呼叫。

所以整個過程是「設定 → 清除 → 設定 → 清除……」，每一次設定都有對應的清除。清除函式在 callback 裡面定義，所以它拿得到這一次的 `timer`。

`watchEffect` 裡也可以用 `onWatcherCleanup`，用法一樣。

### 只能在 `await` 之前呼叫

`onWatcherCleanup` 一定要在 callback **同步執行的部分**呼叫，也就是在第一個 `await` 之前。寫在 `await` 後面，Vue 已經不知道它屬於哪個監聽了，清除函式不會被登記，Console 會出現這樣的警告（太長，這裡分成兩行）：

```text
[Vue warn] onWatcherCleanup() was called when there was
no active watcher to associate with.
```

第 6 集抓資料時就會用到這個規則。

### 網路上的另一種寫法

`onWatcherCleanup` 是 Vue 3.5 才加入的。你在網路上可能會看到 callback 多收一個參數 `onCleanup` 的寫法，例如 `watch(keyword, (newKeyword, oldKeyword, onCleanup) => { ... })`，效果相同。

## 重點整理

- 監聽裡開啟的東西（計時器、請求），要在下一次執行前收拾掉，不然會越積越多。
- `onWatcherCleanup(函式)` 登記清除函式，在監聽下一次執行前、以及監聽停止時被呼叫。
- 設定和清除成對寫：`setTimeout` 配 `clearTimeout`。
- `onWatcherCleanup` 要在第一個 `await` 之前呼叫。
