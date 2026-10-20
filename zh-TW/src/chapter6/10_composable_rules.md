# composable 的規則

## 本集目標

知道 composable 該在哪裡呼叫、該怎麼命名與回傳，避免寫出「看起來對、其實不會動」的程式碼。

## 正文

### 規則一：在 `<script setup>` 頂層同步呼叫

composable 要在 `<script setup>` 的**最外層**直接呼叫，不要放進事件處理函式、`setTimeout` 的 callback，或是 `await` 之後。

錯誤的寫法：

```vue
<script setup>
import { ref } from "vue";
import { useMouse } from "./composables/useMouse.js";

const position = ref(null);

function start() {
  // 錯誤：在事件處理函式裡呼叫 composable
  position.value = useMouse();
}
</script>

<template>
  <button @click="start">開始追蹤滑鼠</button>
  <p v-if="position">滑鼠位置：{{ position.x }}, {{ position.y }}</p>
</template>
```

按下按鈕之後移動滑鼠，數字永遠停在 `0, 0`。Console 還會出現好幾行警告，第一行開頭是：

```text
[Vue warn]: onMounted is called when there is no active component
instance to be associated with.
```

（原文是一整行，這裡分成兩行。）

原因是：`useMouse` 裡的 `onMounted` 要知道「現在是哪個元件在執行」，才能把函式掛到那個元件身上。Vue 只在**執行 `<script setup>` 的那一段時間**記得這件事，執行完就忘了。等到使用者按按鈕，`<script setup>` 早就跑完了，`onMounted` 找不到元件，只好警告你，然後什麼都不做。滑鼠監聽從來沒加上去，數字當然不會動。

`await` 也是一樣的道理：`await` 之後的程式碼要等一段時間才繼續執行，那時 Vue 可能已經在處理別的元件了。

正確的寫法是在最外層呼叫，需要的時候再決定要不要顯示：

```vue
<script setup>
import { ref } from "vue";
import { useMouse } from "./composables/useMouse.js";

const { x, y } = useMouse();
const show = ref(false);
</script>

<template>
  <button @click="show = true">開始追蹤滑鼠</button>
  <p v-if="show">滑鼠位置：{{ x }}, {{ y }}</p>
</template>
```

composable 裡面當然也可以呼叫別的 composable，只要最外層那個是在 `<script setup>` 頂層被呼叫的就好。

### 規則二：名稱用 `use` 開頭

`useMouse`、`useFetch`、`useCounter`，看到 `use` 開頭，讀程式的人就知道「這是 composable，裡面有響應式狀態或生命週期，要照規則一呼叫」。這是整個 Vue 社群的習慣，你在官方文件和各種函式庫裡都會看到。

檔案也用同樣的名字，放在 `src/composables/` 裡，例如 `src/composables/useMouse.js`。

### 規則三：回傳由 `ref` 組成的普通物件

前兩集的 composable 都是這樣回傳的：

```js,ignore
return { x, y };
```

外面是普通的物件，裡面每個屬性都是 `ref`。這樣使用的人可以放心解構：

```js,ignore
const { x, y } = useMouse();
```

解構出來的 `x` 和 `y` 還是原本那兩個 `ref`，所以會跟著更新。

如果你在 composable 裡改用 `reactive` 包成一個物件回傳，使用的人一解構，拿到的就只是當下的數字，之後不會再變。第 5 章學 `reactive` 時遇過同樣的問題。所以 composable 的習慣是：**裡面用 `ref`，回傳一個裝著這些 `ref` 的普通物件**。

### 規則四：參數接受 `ref` 或 getter

上一集學過：要讓 composable 跟著某個值變，就要傳 `ref` 或 getter 進去，composable 裡用 `toValue` 讀取，並在 `watch` 或 `watchEffect` 裡讀它，才會被追蹤。

### 規則五：開了就要關

composable 和元件一樣，在 `onMounted` 開啟的事件監聽、計時器，要在 `onUnmounted` 收掉；在 `watch` 裡開啟的東西，要用 `onWatcherCleanup` 收掉。`useMouse` 和 `useFetch` 都有做到。使用 composable 的人看不到裡面，如果你忘了收拾，他們會很難找出問題在哪。

## 重點整理

- composable 要在 `<script setup>` 頂層同步呼叫，不要放進事件處理函式、callback 或 `await` 之後。
- 名稱用 `use` 開頭，檔案放在 `src/composables/`。
- 回傳一個裝著 `ref` 的普通物件，使用的人才能放心解構。
- 參數接受 `ref` 或 getter，裡面用 `toValue` 讀取。
- composable 開啟的東西，自己負責收拾。
