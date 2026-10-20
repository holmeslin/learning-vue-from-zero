# `ref`、`reactive`、`computed` 的型別

## 本集目標

知道 `ref`、`reactive`、`computed` 什麼時候會自己推論型別，什麼時候要自己標。

## 正文

### 大部分時候不用標

把 `src/App.vue` 換成：

```vue
<script setup lang="ts">
import { computed, ref } from "vue";

const count = ref(0);
const double = computed(() => count.value * 2);

count.value = "1";
double.value = 10;
</script>

<template>
  <p>{{ count }}，兩倍是 {{ double }}</p>
</template>
```

```text
src/App.vue:7:1 - error TS2322: Type 'string' is not assignable to type 'number'.

7 count.value = "1";
  ~~~~~~~~~~~

src/App.vue:8:8 - error TS2540: Cannot assign to 'value' because it is a read-only property.

8 double.value = 10;
         ~~~~~


Found 2 errors.
```

你一個型別都沒寫，但 TypeScript 已經知道很多事：

- `ref(0)` 的初始值是數字，所以 `count.value` 是 `number`，不能放字串。這就是第 4 集的型別推論。
- `computed` 的型別從函式的回傳值推論出來：`count.value * 2` 是數字，所以 `double.value` 也是 `number`。
- `computed` 是算出來的，不能直接改，所以 `double.value` 是唯讀的（`read-only`）。

這和第 4 集的原則一樣：**看得出型別的初始值，就不用標**。

### 初始值看不出型別時：`ref<型別>()`

第 4 集說過，空陣列要自己標。在 Vue 裡最常見的就是這個：

```vue
<script setup lang="ts">
import { ref } from "vue";

const todos = ref([]);
todos.value.push({ id: 1, text: "買牛奶", done: false });
</script>

<template>
  <p>{{ todos.length }} 件</p>
</template>
```

```text
src/App.vue:5:18 - error TS2345: Argument of type '{ id: number; text: string; done: boolean; }' is not assignable to parameter of type 'never'.

5 todos.value.push({ id: 1, text: "買牛奶", done: false });
                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


Found 1 error.
```

`never` 的意思是「什麼都不能放」。`ref([])` 只看到一個空陣列，推論不出裡面要放什麼，結果就變成「什麼都不能放的陣列」。

解法是在 `ref` 後面用角括號告訴它型別，和 `defineProps<...>()` 是同一種寫法：

```vue
<script setup lang="ts">
import { computed, ref } from "vue";

type Todo = {
  id: number;
  text: string;
  done: boolean;
};

const todos = ref<Todo[]>([]);
const selectedId = ref<number | null>(null);

const remaining = computed(() => {
  return todos.value.filter((todo) => !todo.done).length;
});

function addTodo(text: string) {
  todos.value.push({ id: Date.now(), text, done: false });
}
</script>

<template>
  <button @click="addTodo('買牛奶')">新增</button>
  <p>還有 {{ remaining }} 件沒做</p>
  <ul>
    <li
      v-for="todo in todos"
      :key="todo.id"
      @click="selectedId = todo.id"
    >
      {{ todo.text }}
    </li>
  </ul>
  <p v-if="selectedId !== null">選了第 {{ selectedId }} 號</p>
</template>
```

- `ref<Todo[]>([])`：一個 `Todo` 陣列，現在是空的。
- `ref<number | null>(null)`：現在是 `null`，之後會放數字。只寫 `ref(null)` 的話，TypeScript 會以為它永遠是 `null`。

標了型別之後，放進去的東西就會被檢查。例如 `push` 時少了 `done`（下面的錯誤訊息省略了開頭的檔案位置）：

```ts
todos.value.push({ id: 1, text: "買牛奶" });
```

```text
error TS2345: Argument of type '{ id: number; text: string; }' is not assignable to parameter of type '{ id: number; text: string; done: boolean; }'.
  Property 'done' is missing in type '{ id: number; text: string; }' but required in type '{ id: number; text: string; done: boolean; }'.
（後面省略）
```

### `reactive`：標在變數上

`reactive` 有一樣的問題。初始值是 `null` 的屬性，會被推論成只能是 `null`：

```vue
<script setup lang="ts">
import { reactive } from "vue";

const form = reactive({
  email: "",
  age: null,
});

form.age = 20;
</script>

<template>
  <input v-model="form.email" />
</template>
```

```text
src/App.vue:9:1 - error TS2322: Type '20' is not assignable to type 'null'.

9 form.age = 20;
  ~~~~~~~~


Found 1 error.
```

`reactive` 的型別習慣寫在**變數**上，就像第 3 集的 `const age: number = 20`：

```vue
<script setup lang="ts">
import { reactive } from "vue";

type SignupForm = {
  email: string;
  age: number | null;
  agree: boolean;
};

const form: SignupForm = reactive({
  email: "",
  age: null,
  agree: false,
});
</script>

<template>
  <input v-model="form.email" type="email" />
  <input v-model.number="form.age" type="number" />
  <label><input v-model="form.agree" type="checkbox" /> 同意</label>
  <p>{{ form }}</p>
</template>
```

為什麼 `ref` 用角括號、`reactive` 卻標在變數上？Vue 官方文件建議 `reactive` 這樣寫，因為它的角括號寫法在一些情況下會讓型別不準。記住這個習慣就好。

### `computed` 通常不用標

`computed` 幾乎都能從回傳值推論出來，很少需要自己標。真的想確定回傳的型別時，可以寫 `computed<string>(() => ...)`。這時候如果函式有某條路徑回傳了數字，錯誤訊息會很長，找這一句就好：

```text
      Type 'number | "高價"' is not assignable to type 'string'.
```

意思是「函式可能回傳數字或 `"高價"`，但你說它是字串」。

## 重點整理

- `ref(0)`、`computed(() => ...)` 會自己推論型別，不用標。
- 空陣列或 `null` 這種看不出型別的初始值，用 `ref<Todo[]>([])`、`ref<number | null>(null)`。
- `ref([])` 沒標時會變成 `never[]`，什麼都放不進去。
- `reactive` 的型別標在變數上：`const form: SignupForm = reactive({ ... })`。
- `computed` 的值是唯讀的，改它會出現 `read-only property` 的錯誤。
