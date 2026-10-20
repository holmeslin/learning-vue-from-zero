# 綜合練習：待辦清單

## 本集目標

把這一章學到的 `ref`、`computed`、`v-model`、事件、`defineEmits` 和 `defineModel`，組合成一個完整的待辦清單。

## 正文

這一集沒有新東西，只有一個題目。它會用到這一章大部分的觀念，也是你第一個「像樣的」Vue 應用程式。請先自己做，卡住再看提示，最後再對照參考解答。**自己做得出來，才算真的學會。**

### 題目

在 `hello-vue` 專案裡，做一個待辦清單，要有這些功能：

1. **新增**：上面有一個輸入框和「新增」按鈕。輸入文字後按按鈕（或按 Enter），新增一個待辦事項，並清空輸入框。如果輸入框是空的、或只有空白，不要新增。
2. **勾選**：每個待辦事項前面有勾選框，勾選表示完成，完成的事項文字要畫上刪除線。再勾一次可以取消。
3. **刪除**：每個事項有一個「刪除」按鈕。
4. **計數**：顯示「還有 N 項未完成」。
5. **篩選**：有「全部」、「未完成」、「已完成」三個按鈕，點了之後只顯示對應的事項。目前選取的篩選按鈕不能再點（`disabled`）。
6. **清除已完成**：有一個「清除已完成」按鈕，一次刪掉所有已完成的事項。如果沒有已完成的事項，這個按鈕不要出現。
7. **空狀態**：完全沒有事項的時候，顯示「還沒有待辦事項，新增一個吧！」；有事項、但目前篩選的分類裡沒有東西時，顯示「這個分類沒有項目。」
8. **拆元件**：每個待辦事項做成獨立的元件 `src/components/TodoItem.vue`，勾選要用 `v-model`，刪除要用事件通知父元件。

### 提示

先想資料長什麼樣子，再想畫面。

- 每個待辦事項是一個物件：`{ id, title, done }`。整份清單是這種物件的陣列，放在 `ref` 裡。
- 需要三個 `ref`：待辦事項陣列、輸入框的文字、目前的篩選（`"all"`、`"active"`、`"done"` 三種值之一）。
- **「還有 N 項未完成」和「篩選後要顯示的清單」都是算得出來的**，用 `computed`，不要另外存。（第 7 集）
- 新增用 `push`（第 5 集）；清除已完成用 `filter` 做一個新陣列放回 `.value`。
- 每個事項的 `id` 要不一樣，可以用一個普通的 `let nextId = 1`，每新增一筆就加一。（第 13 集也這樣做過）
- 輸入框用 `v-model.trim`，就不用自己去掉頭尾空白。（第 8 集）
- 新增的輸入框和按鈕包在 `<form>` 裡，用 `@submit.prevent`，按 Enter 也能送出。（第 1 集）
- `TodoItem` 用 `defineModel("done")` 接勾選狀態，父元件寫 `v-model:done="todo.done"`；刪除用 `defineEmits(["remove"])`。（第 11、12 集）
- 刪除線用第 4 章的 class 綁定，例如 `:class="{ done: done }"`，再用 `<style scoped>` 寫 `text-decoration: line-through`。
- 建議分階段做，每完成一個功能就存檔測試：先做新增和顯示，再做勾選和刪除，再做計數，最後做篩選和清除。拆元件可以等全部功能都在 `App.vue` 裡做好之後再拆。

### 參考解答

寫完再看。

<details>
<summary>展開參考解答</summary>

`src/components/TodoItem.vue`：

```vue
<script setup>
defineProps(["title"]);
const done = defineModel("done");
const emit = defineEmits(["remove"]);
</script>

<template>
  <li>
    <label>
      <input type="checkbox" v-model="done" />
      <span :class="{ done: done }">{{ title }}</span>
    </label>
    <button @click="emit('remove')" :aria-label="`刪除 ${title}`">
      刪除
    </button>
  </li>
</template>

<style scoped>
.done {
  text-decoration: line-through;
  color: #888;
}
</style>
```

`src/App.vue`：

```vue
<script setup>
import { ref, computed } from "vue";
import TodoItem from "./components/TodoItem.vue";

const FILTERS = [
  { value: "all", label: "全部" },
  { value: "active", label: "未完成" },
  { value: "done", label: "已完成" },
];

const todos = ref([]);
const text = ref("");
const filter = ref("all");
let nextId = 1;

const remaining = computed(() => {
  return todos.value.filter((todo) => !todo.done).length;
});

const hasDone = computed(() => todos.value.some((todo) => todo.done));

const visibleTodos = computed(() => {
  if (filter.value === "active") {
    return todos.value.filter((todo) => !todo.done);
  }
  if (filter.value === "done") {
    return todos.value.filter((todo) => todo.done);
  }
  return todos.value;
});

function handleAdd() {
  if (text.value === "") {
    return;
  }
  todos.value.push({ id: nextId, title: text.value, done: false });
  nextId++;
  text.value = "";
}

function handleRemove(id) {
  const index = todos.value.findIndex((todo) => todo.id === id);
  todos.value.splice(index, 1);
}

function handleClearDone() {
  todos.value = todos.value.filter((todo) => !todo.done);
}
</script>

<template>
  <h1>待辦清單</h1>

  <form @submit.prevent="handleAdd">
    <input v-model.trim="text" placeholder="要做什麼？" />
    <button type="submit">新增</button>
  </form>

  <div>
    <button
      v-for="item in FILTERS"
      :key="item.value"
      :disabled="filter === item.value"
      @click="filter = item.value"
    >
      {{ item.label }}
    </button>
  </div>

  <p v-if="todos.length === 0">還沒有待辦事項，新增一個吧！</p>
  <p v-else-if="visibleTodos.length === 0">這個分類沒有項目。</p>

  <ul>
    <TodoItem
      v-for="todo in visibleTodos"
      :key="todo.id"
      :title="todo.title"
      v-model:done="todo.done"
      @remove="handleRemove(todo.id)"
    />
  </ul>

  <p v-if="todos.length > 0">還有 {{ remaining }} 項未完成</p>
  <button v-if="hasDone" @click="handleClearDone">清除已完成</button>
</template>
```

幾個值得注意的地方：

- 只有三個 `ref`：`todos`、`text`、`filter`。`remaining`、`hasDone`、`visibleTodos` 都是 `computed`，從 `todos` 和 `filter` 算出來，所以永遠不會和資料對不起來。
- `nextId` 只用來產生不重複的 `id`，不會顯示在畫面上，所以是普通的 `let` 變數。
- `FILTERS` 是不會變的常數，用普通的 `const` 陣列就好。篩選按鈕用 `v-for` 從它產生，不用寫三次。
- 新增用 `push`，刪除用 `findIndex` 找到位置再 `splice`，都是直接改 `todos.value` 這個陣列；清除已完成用 `filter` 做一個新陣列放回去。第 5 集說過，兩種方式 Vue 都知道。
- 勾選的資料流：`TodoItem` 裡的勾選框 `v-model` 到 `done`，`done` 是 `defineModel` 給的 `ref`，改它會通知父元件，父元件的 `v-model:done="todo.done"` 再去改那筆待辦事項。`TodoItem` 自己從頭到尾沒有改 props。
- `visibleTodos` 裡的事項，和 `todos` 裡的是同一批物件（第 2 章的參考），所以在「未完成」分類勾選一項，它的 `done` 改了，`remaining` 和 `visibleTodos` 都會重算，它就從畫面上消失了。
- `@remove="handleRemove(todo.id)"`：子元件只說「我要被刪除」，不用知道自己的 `id`；父元件在 `v-for` 裡知道是哪一筆，自己把 `id` 帶上。
- 刪除按鈕有 `aria-label`，螢幕閱讀器會唸出「刪除 買牛奶」，而不是一堆無法分辨的「刪除」。

</details>

### 延伸挑戰

想多練一點的話，試試看：

- 加一個「全部標示為完成」的按鈕。提示：用 `for...of` 走過 `todos.value`，把每一筆的 `done` 設成 `true`。
- 新增之後，讓清單捲到最下面。提示：第 13 集的 `nextTick`。
- 讓使用者可以編輯已經新增的事項標題。提示：`TodoItem` 再多一個 `defineModel("title")`。
- 現在重新整理頁面，所有待辦事項都消失了。要讓它們存下來，需要第 6 章的 `watch`，再搭配瀏覽器內建的 `localStorage`（一個可以把字串存在瀏覽器裡的功能）。學完第 6 章後，可以回來試試看。

## 重點整理

- 這一章的觀念組合起來，已經可以做出完整的互動應用程式。
- 設計時先決定資料的樣子，再決定需要哪些 `ref`；算得出來的用 `computed`，不要另外存。
- 陣列可以直接 `push`、`splice`，也可以用 `filter` 做新陣列放回 `.value`。
- 父元件擁有資料，子元件用 `defineModel` 和事件通知父元件去改。
