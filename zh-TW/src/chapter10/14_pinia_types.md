# Pinia 的型別

## 本集目標

用 TypeScript 寫 Pinia 的 setup store，並讓 store 的型別一路傳到元件裡。

## 正文

### 先看 create-vue 給你的 store

第 2 集建立專案時加了 `--pinia`，所以 `src/stores/counter.ts` 已經有一個 store：

```ts
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})
```

這就是第 8 章的 setup store，副檔名換成 `.ts` 而已，一個型別都沒寫。因為 setup store 裡面就是 `ref`、`computed` 和函式，第 9 集學的推論規則全部適用：`count` 是數字、`doubleCount` 是數字。

所以 Pinia 加上 TypeScript，要做的事和元件裡一樣：**看不出型別的地方才標**。

### 一個待辦清單的 store

建立 `src/stores/todos.ts`：

```ts
import { computed, ref } from "vue";
import { defineStore } from "pinia";

export type Todo = {
  id: number;
  text: string;
  done: boolean;
};

export const useTodoStore = defineStore("todos", () => {
  const todos = ref<Todo[]>([]);

  const remaining = computed(() => {
    return todos.value.filter((todo) => !todo.done).length;
  });

  function addTodo(text: string) {
    todos.value.push({ id: Date.now(), text, done: false });
  }

  function toggleTodo(id: number) {
    const todo = todos.value.find((todo) => todo.id === id);
    if (todo) {
      todo.done = !todo.done;
    }
  }

  return { todos, remaining, addTodo, toggleTodo };
});
```

需要標型別的只有三個地方，都是前面學過的：

- `ref<Todo[]>([])`：空陣列要標（第 9 集）。
- `addTodo(text: string)`、`toggleTodo(id: number)`：函式參數要標（第 4 集）。
- `export type Todo`：把 `Todo` 匯出，元件也能用（第 11 集）。

`remaining` 和函式的回傳值都交給推論。

### 在元件裡用錯會被抓到

把 `src/App.vue` 換成：

```vue
<script setup lang="ts">
import { useTodoStore } from "./stores/todos";

const store = useTodoStore();
store.addTodo(123);
store.remaining = 0;
</script>

<template>
  <p>還有 {{ store.remaining }} 件沒做</p>
</template>
```

```text
src/App.vue:5:15 - error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.

5 store.addTodo(123);
                ~~~

src/App.vue:6:7 - error TS2540: Cannot assign to 'remaining' because it is a read-only property.

6 store.remaining = 0;
        ~~~~~~~~~


Found 2 errors.
```

你在元件裡沒寫任何型別，但 `useTodoStore()` 回傳的 store 帶著完整的型別：`addTodo` 要字串、`remaining` 是 `computed` 所以不能改。輸入 `store.` 時，編輯器也會列出 store 裡的所有東西。

### `storeToRefs` 也保留型別

第 8 章學過，要從 store 解構出 `ref` 和 `computed` 時，要用 `storeToRefs`；函式則直接解構。把 `src/App.vue` 換成：

```vue
<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useTodoStore } from "./stores/todos";
import TodoRow from "./components/TodoRow.vue";

const store = useTodoStore();
const { todos, remaining } = storeToRefs(store);
const { addTodo } = store;

const text = ref("");

function submit() {
  addTodo(text.value);
  text.value = "";
}
</script>

<template>
  <input v-model="text" @keydown.enter="submit" />
  <p>還有 {{ remaining }} 件沒做</p>
  <ul>
    <TodoRow v-for="todo in todos" :key="todo.id" :todo="todo" />
  </ul>
</template>
```

`TodoRow` 是下一段才要建立的元件，在那之前編輯器會說找不到它，先不用管。

解構出來的 `todos` 是 `Ref<Todo[]>`，`remaining` 是 `number` 的 `computed`，型別都沒有遺失。

### 在 props 裡用 store 的型別

每一列交給 `TodoRow` 元件顯示。它的 props 需要 `Todo` 型別，直接從 store 的檔案匯入。建立 `src/components/TodoRow.vue`：

```vue
<script setup lang="ts">
import { useTodoStore, type Todo } from "../stores/todos";

const { todo } = defineProps<{ todo: Todo }>();
const store = useTodoStore();
</script>

<template>
  <li @click="store.toggleTodo(todo.id)">
    {{ todo.done ? '✔' : '　' }} {{ todo.text }}
  </li>
</template>
```

`Todo` 只在 store 的檔案裡定義一次，store、`App.vue`、`TodoRow.vue` 都用同一個。哪天 `Todo` 多了一個屬性，或某個屬性改了名字，所有用到它的地方都會跟著被檢查，有漏改的就會出現紅線。這是 TypeScript 在大一點的專案裡最有價值的地方。

執行 `npm run dev`，輸入待辦事項按 Enter，點一下可以切換完成狀態。

## 重點整理

- setup store 就是 `ref`、`computed` 和函式，型別規則和元件裡完全一樣。
- store 裡要標的通常只有：空陣列或 `null` 的 `ref`、函式的參數。
- `useXxxStore()` 回傳的 store 帶著完整的型別，元件裡用錯會被抓到。
- `storeToRefs` 解構出來的值也保留型別。
- 共用的型別（例如 `Todo`）寫在一個地方並 `export`，其他檔案用 `type` 匯入。
