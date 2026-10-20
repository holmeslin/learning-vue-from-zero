# `watch`

## 本集目標

用 `watch` 在某個值改變的時候，執行一段程式碼。

## 正文

### 值變了就通知我

把 `src/App.vue` 換成：

```vue
<script setup>
import { ref, watch } from "vue";

const count = ref(0);

watch(count, (newValue, oldValue) => {
  console.log(`count 從 ${oldValue} 變成 ${newValue}`);
});
</script>

<template>
  <button @click="count++">按了 {{ count }} 次</button>
</template>
```

打開 Console，按兩下按鈕：

```text
count 從 0 變成 1
count 從 1 變成 2
```

`watch` 的意思是**監聽**：盯著一個值，它一改變，就呼叫你給的 callback。

- 第一個引數是**要監聽的東西**，這裡是 `count` 這個 `ref`。注意傳的是 `count` 本身，不是 `count.value`。
- 第二個引數是 callback，Vue 會把新的值和舊的值傳給它。

頁面剛載入時什麼都沒印，因為 `count` 還沒變過。`watch` 只在「改變」的時候才執行。

### `watch` 是用來做什麼的

你可能會想：畫面本來就會跟著 `count` 更新，為什麼還要監聽？

因為有些事情不是「畫面」。把分頁標題改掉、存資料到瀏覽器、向伺服器送請求，這些都是畫面之外的事，Vue 不會自動幫你做。`watch` 就是讓你在值改變時，順便去做這些事。這種「畫面之外的事」叫做**副作用**（side effect）。

來做一個真的有用的：讓分頁標題跟著輸入框的內容變。

```vue
<script setup>
import { ref, watch } from "vue";

const title = ref("我的筆記");

watch(
  title,
  (newTitle) => {
    document.title = newTitle;
  },
  { immediate: true },
);
</script>

<template>
  <input v-model="title" />
  <p>看看瀏覽器分頁上的標題。</p>
</template>
```

`document.title` 是瀏覽器分頁上顯示的文字，改它，分頁標題就跟著變。在輸入框裡打字，分頁標題會同步更新。

第三個引數 `{ immediate: true }` 是選項，意思是「一開始就先執行一次」。少了它，頁面剛載入時分頁標題不會是「我的筆記」，要等你打了字才會變。

### 監聽 `reactive` 物件裡的屬性

如果資料放在 `reactive` 物件裡，想監聽其中一個屬性，要寫成一個**回傳那個值的函式**：

```vue
<script setup>
import { reactive, watch } from "vue";

const form = reactive({ name: "", age: 18 });

watch(
  () => form.name,
  (newName) => {
    console.log(`名字改成：${newName}`);
  },
);
</script>

<template>
  <input v-model="form.name" placeholder="名字" />
  <input v-model="form.age" type="number" />
</template>
```

在名字欄打字會印出訊息，改年齡則不會，因為你只監聽了 `form.name`。

`() => form.name` 這種「呼叫了就回傳某個值」的函式叫做 **getter**。Vue 會執行它、記下它讀了哪些響應式資料，之後那些資料一變，就重新執行 getter，比較結果有沒有不同。

常見的錯誤是直接寫 `watch(form.name, ...)`。`form.name` 只是一個普通的字串，Vue 沒辦法監聽一個字串，Console 會出現警告：

```text
[Vue warn]: Invalid watch source:  ...
```

監聽 props 也是同樣的道理，要寫成 `watch(() => props.id, ...)`。

### 監聽整個物件

直接把整個 `reactive` 物件交給 `watch`，裡面任何屬性改變都會通知你：

```js,ignore
watch(form, () => {
  console.log("表單有東西改了");
});
```

這叫做**深層監聽**（deep watch）。要注意，如果你的物件是用 `ref` 包起來的（`const form = ref({ ... })`），預設只有整個 `.value` 被換掉才會通知，改裡面的屬性不會。這時要加上 `{ deep: true }` 選項：

```js,ignore
watch(
  form,
  () => {
    console.log("表單有東西改了");
  },
  { deep: true },
);
```

深層監聽要檢查物件裡的每一層，物件很大時會比較慢。只需要某個屬性的話，用上一段的 getter 寫法就好。

第 5 章待辦清單的延伸挑戰，用的就是深層監聽：`watch(todos, ..., { deep: true })`，清單有任何變動，就把它存進 `localStorage`。

### 一次監聽好幾個

把要監聽的東西放進陣列，callback 收到的新值、舊值也會是陣列，可以用第 2 章學的陣列解構拆開：

```js,ignore
watch([firstName, lastName], ([newFirst, newLast]) => {
  console.log(`名字變成 ${newFirst}${newLast}`);
});
```

其中任何一個改變，callback 就會執行。

## 重點整理

- `watch(來源, callback)` 在來源改變時呼叫 callback，callback 會收到新值和舊值。
- 來源可以是 `ref`、`reactive` 物件、getter 函式，或是它們組成的陣列。
- `reactive` 物件的屬性和 props 要用 getter 監聽，例如 `() => form.name`。
- `{ immediate: true }` 讓 callback 一開始就先執行一次；`{ deep: true }` 讓 `ref` 裡的物件也能深層監聽。
- `watch` 是用來做畫面之外的事（副作用），例如改分頁標題、存資料、抓資料。
