# `state`、`getters` 與 `actions`

## 本集目標

知道 setup store 裡的 `ref`、`computed`、函式分別對應 Pinia 的 `state`、`getters`、`actions`，並且在元件裡正確地讀取和修改它們。

## 正文

### 一個待辦清單 store

`src/stores/todos.js`：

```js
import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const useTodoStore = defineStore("todos", () => {
  // state
  const todos = ref([
    { id: 1, text: "買牛奶", done: true },
    { id: 2, text: "寫作業", done: false },
  ]);

  // getters
  const doneCount = computed(() => {
    return todos.value.filter((todo) => todo.done).length;
  });

  // actions
  function addTodo(text) {
    // 這個範例不能刪除項目，所以用長度加一當 id 不會重複
    todos.value.push({ id: todos.value.length + 1, text, done: false });
  }

  function toggleTodo(id) {
    const todo = todos.value.find((todo) => todo.id === id);
    todo.done = !todo.done;
  }

  return { todos, doneCount, addTodo, toggleTodo };
});
```

`src/App.vue`：

```vue
<script setup>
import { ref } from "vue";
import { useTodoStore } from "./stores/todos.js";

const todoStore = useTodoStore();
const newText = ref("");

function submit() {
  if (newText.value === "") return;
  todoStore.addTodo(newText.value);
  newText.value = "";
}
</script>

<template>
  <input v-model="newText" />
  <button @click="submit">新增</button>
  <ul>
    <li v-for="todo in todoStore.todos" :key="todo.id">
      <label>
        <input
          type="checkbox"
          :checked="todo.done"
          @change="todoStore.toggleTodo(todo.id)"
        />
        {{ todo.text }}
      </label>
    </li>
  </ul>
  <p>完成 {{ todoStore.doneCount }} / {{ todoStore.todos.length }}</p>
</template>
```

執行起來，一開始顯示「完成 1 / 2」。勾掉「寫作業」變成「完成 2 / 2」；輸入「倒垃圾」按新增，變成「完成 2 / 3」。

### 三種東西，三個名字

store 裡的東西分成三種，Pinia 給它們各取了名字：

| 在 setup store 裡寫 | Pinia 叫它 | 用途 |
| --- | --- | --- |
| `ref()` | `state` | 存資料 |
| `computed()` | `getters` | 從 `state` 算出來的值 |
| 函式 | `actions` | 修改 `state` 的操作 |

所以 `todos` 是 state，`doneCount` 是 getter，`addTodo` 和 `toggleTodo` 是 actions。你不用學任何新語法，寫法就是第 5 章的 `ref`、`computed` 和普通函式；這三個名字是為了方便溝通，看文件、看 Vue DevTools 時會一直遇到。

getter 和 `computed` 一樣是唯讀的。在元件裡寫 `todoStore.doneCount = 5` 不會有效果，主控台只會多一行 `target is readonly` 的警告。要改，就去改它依賴的 state。

### 一定要 `return`

Pinia 只認得函式最後 `return` 出去的東西。沒有放進 `return` 的 `ref`，元件拿不到，Pinia 也不會把它當成 state 管理。寫完 store，記得回頭檢查每個 state 都有放進 `return`。

### 為什麼在元件裡不用 `.value`

在 `todos.js` 裡面，`todos` 是一個 `ref`，所以要寫 `todos.value`。但到了元件裡，寫的是 `todoStore.todos`，沒有 `.value`。

原因是：`useTodoStore()` 回傳的 store 是一個用 `reactive` 包起來的物件。第 5 章學過，`ref` 放進 `reactive` 物件之後，讀取時會自動解包，不用寫 `.value`。所以：

- 在 store 檔案裡面：照 `ref` 的規矩，寫 `.value`。
- 在 store 外面（元件的 `<script setup>` 和模板）：寫 `store.屬性`，不寫 `.value`。

### 元件可以直接改 state 嗎

可以。在元件裡寫 `todoStore.todos.push(...)` 或 `counter.count++`，畫面一樣會更新。

不過比較好的習慣是：**改 state 的事交給 action**。範例裡新增待辦是呼叫 `todoStore.addTodo()`，而不是在元件裡自己 `push`。這樣「待辦清單會怎麼被修改」全部集中在 `todos.js` 一個檔案，哪天要加規則（例如不能新增重複的項目），只改 action 一個地方就好，所有用到它的元件都跟著生效。

### 什麼該放進 store

注意 `newText`（輸入框正在打的字）留在元件裡，沒有放進 store。只有這個元件在乎它，放進 store 反而讓別人以為它是共用的。

判斷原則很簡單：**好幾個元件都要用的資料放 store，只有一個元件用的資料留在元件裡。**

## 重點整理

- `ref` 是 state、`computed` 是 getters、函式是 actions，寫法和第 5 章完全一樣。
- 所有 state 都要放進 `return`，Pinia 只認得回傳出去的東西。
- store 是 `reactive` 物件，在元件裡讀 `store.屬性` 不用 `.value`；store 檔案裡面照樣要寫 `.value`。
- 元件可以直接改 state，但把修改集中在 action 比較好維護。
- 多個元件共用的資料才放 store，只有一個元件用的留在元件裡。
