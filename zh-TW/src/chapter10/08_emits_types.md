# `defineEmits` 的型別

## 本集目標

用型別說明元件會發出哪些事件、每個事件帶什麼資料，順便幫 `defineModel` 加上型別。

## 正文

### 把事件寫成型別

建立 `src/components/TodoItem.vue`：

```vue
<script setup lang="ts">
const { id, text } = defineProps<{
  id: number;
  text: string;
}>();

const emit = defineEmits<{
  remove: [id: number];
  rename: [id: number, text: string];
}>();
</script>

<template>
  <li>
    {{ text }}
    <button @click="emit('rename', id, text + '！')">加驚嘆號</button>
    <button @click="emit('remove', id)">刪除</button>
  </li>
</template>
```

`defineEmits` 和上一集的 `defineProps` 一樣，把型別放在角括號裡。裡面每一行是一個事件：

- 冒號左邊是事件名稱：`remove`、`rename`。
- 冒號右邊的中括號，列出 `emit` 這個事件時要帶的資料，依序是第一個、第二個……每一項寫成「名稱: 型別」。

所以 `remove: [id: number]` 的意思是：「`remove` 事件帶一個數字，叫 `id`」；`rename` 帶兩個，一個數字、一個字串。中括號裡的名稱只是說明用，讓你和編輯器知道每個位置代表什麼。

### 發錯事件會被抓到

`emit` 的事件名稱打錯、或資料型別不對，都會被擋下。建立 `src/components/DeleteButton.vue` 試試：

```vue
<script setup lang="ts">
const { id } = defineProps<{ id: number }>();

const emit = defineEmits<{
  remove: [id: number];
}>();

function handleClick() {
  emit("remove", String(id));
  emit("delete", id);
}
</script>

<template>
  <button @click="handleClick">刪除</button>
</template>
```

```text
src/components/DeleteButton.vue:9:18 - error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.

9   emit("remove", String(id));
                   ~~~~~~~~~~

src/components/DeleteButton.vue:10:8 - error TS2345: Argument of type '"delete"' is not assignable to parameter of type '"remove"'.

10   emit("delete", id);
          ~~~~~~~~
```

- 第一個：`remove` 要帶數字，你給了字串。
- 第二個：這個元件根本沒有 `delete` 事件，只有 `remove`。

看完就把 `DeleteButton.vue` 刪掉。

輸入 `emit("` 的時候，編輯器會把所有事件名稱列出來。

### 父元件也會被檢查

把 `src/App.vue` 換成：

```vue
<script setup lang="ts">
import TodoItem from "./components/TodoItem.vue";

function removeTodo(id: string) {
  console.log("刪除", id);
}
</script>

<template>
  <ul>
    <TodoItem :id="1" text="買牛奶" @remove="removeTodo" />
  </ul>
</template>
```

```text
src/App.vue:11:35 - error TS2322: Type '(id: string) => void' is not assignable to type '(id: number) => any'.
  Types of parameters 'id' and 'id' are incompatible.
    Type 'number' is not assignable to type 'string'.

11     <TodoItem :id="1" text="買牛奶" @remove="removeTodo" />
                                     ~~~~~~


Found 1 error.
```

`TodoItem` 說 `remove` 會帶一個數字，但 `removeTodo` 要的是字串，兩邊對不上。把 `removeTodo(id: string)` 改成 `removeTodo(id: number)`，錯誤就消失了。

完整的父元件長這樣：

```vue
<script setup lang="ts">
import { ref } from "vue";
import TodoItem from "./components/TodoItem.vue";

const todos = ref([
  { id: 1, text: "買牛奶" },
  { id: 2, text: "寫作業" },
]);

function removeTodo(id: number) {
  todos.value = todos.value.filter((todo) => todo.id !== id);
}

function renameTodo(id: number, text: string) {
  const todo = todos.value.find((todo) => todo.id === id);
  if (todo) {
    todo.text = text;
  }
}
</script>

<template>
  <ul>
    <TodoItem
      v-for="todo in todos"
      :key="todo.id"
      :id="todo.id"
      :text="todo.text"
      @remove="removeTodo"
      @rename="renameTodo"
    />
  </ul>
</template>
```

注意 `renameTodo` 裡的 `if (todo)`：`find` 可能找不到，這是第 6 集講的 `| undefined`。

如果你直接在模板裡寫箭頭函式，例如 `@remove="(id) => removeTodo(id)"`，這裡的 `id` 不用標型別，TypeScript 會從 `TodoItem` 的事件型別推論出它是數字。

### `defineModel` 的型別

第 5 章學過用 `defineModel` 做元件的 `v-model`。它的型別一樣放在角括號裡。建立 `src/components/NameInput.vue`：

```vue
<script setup lang="ts">
const name = defineModel<string>();
</script>

<template>
  <input v-model="name" />
  <p>{{ name.length }} 個字</p>
</template>
```

```text
src/components/NameInput.vue:7:9 - error TS18048: 'name.value' is possibly 'undefined'.

7   <p>{{ name.length }} 個字</p>
          ~~~~


Found 1 error.
```

為什麼可能是 `undefined`？因為父元件可以不寫 `v-model`，這時候就沒有值。有兩種處理方式：

- 要求父元件一定要傳：`defineModel<string>({ required: true })`。
- 給預設值：`defineModel<string>({ default: "" })`。

用哪一種都可以，這裡用第一種：

```vue
<script setup lang="ts">
const name = defineModel<string>({ required: true });
</script>

<template>
  <input v-model="name" />
  <p>{{ name.length }} 個字</p>
</template>
```

父元件照常用 `<NameInput v-model="userName" />`，`userName` 是字串的 `ref` 就好。

## 重點整理

- `defineEmits<{ 事件名稱: [參數: 型別] }>()` 描述元件會發出的事件和資料。
- 事件名稱打錯、資料型別不對，在子元件的 `emit` 就會被擋下。
- 父元件接事件的函式，參數型別也要和子元件說的一樣。
- `defineModel<string>()` 加上型別；加 `required: true` 或 `default`，值就不會是 `undefined`。
