# `.value` 與模板自動解包

## 本集目標

搞清楚什麼時候要寫 `.value`、什麼時候不用，避開新手最常踩的坑。

## 正文

### 規則只有一條

- **在 `<script setup>` 裡**：`ref` 是盒子，要讀要改都寫 `.value`。
- **在 `<template>` 裡**：Vue 會自動打開盒子，直接寫名字就好。

模板裡「自動打開盒子」這件事，叫做**自動解包**（unwrap）。Vue 這樣設計，是因為模板裡用到資料的地方非常多，每個都寫 `.value` 太囉嗦。

### 忘了寫 `.value` 會怎樣

在 `<script setup>` 裡忘了 `.value`，是最常見的錯。把 `src/App.vue` 換成：

```vue
<script setup>
import { ref } from "vue";

const count = ref(0);

function handleClick() {
  console.log(count + 1);
  console.log(count.value + 1);
}
</script>

<template>
  <button @click="handleClick">試試看</button>
</template>
```

點按鈕，Console 印出：

```text
[object Object]1
1
```

第一行是錯的：`count` 是盒子，也就是一個物件，物件和數字用 `+` 相加時，JavaScript 會把物件轉成字串 `"[object Object]"`，再和 `1` 接起來。第二行才是你要的。

如果你直接 `console.log(count)`，瀏覽器會印出一個名字叫 `RefImpl` 的物件，裡面有一堆你看不懂的屬性。看到 `RefImpl`，就知道自己印的是盒子，忘了 `.value`。

另一種常見錯誤是想直接改它：

```js,ignore
count = count + 1; // TypeError: Assignment to constant variable.
```

`count` 是 `const`，不能重新指定。要改的是盒子裡的值：`count.value = count.value + 1`。

### 什麼值都能放進 `ref`

`ref` 不只能放數字。字串、布林值、陣列、物件都可以。把 `src/App.vue` 換成：

```vue
<script setup>
import { ref } from "vue";

const name = ref("小明");
const isOpen = ref(false);

function handleRename() {
  name.value = "小華";
}
</script>

<template>
  <p>哈囉，{{ name }}</p>
  <button @click="handleRename">改名</button>
  <button @click="isOpen = !isOpen">
    {{ isOpen ? '收起' : '展開' }}
  </button>
  <p v-if="isOpen">這是展開後才看得到的內容。</p>
</template>
```

`isOpen = !isOpen` 是「把布林值反過來」：`true` 變 `false`，`false` 變 `true`。這種「開關」的寫法很常用。像這樣會被一直打開、關上的內容，正是第 4 章說的適合改用 `v-show` 的情況，把 `v-if` 換成 `v-show`，畫面看起來一樣。

`ref` 放陣列和物件的情況，下一集會詳細講。

### 傳給子元件也不用 `.value`

在模板裡把 `ref` 傳給子元件的 props 時，一樣會自動解包。建立 `src/components/ShowCount.vue`：

```vue
<script setup>
defineProps(["count"]);
</script>

<template>
  <p>子元件收到：{{ count }}</p>
</template>
```

把 `src/App.vue` 換成：

```vue
<script setup>
import { ref } from "vue";
import ShowCount from "./components/ShowCount.vue";

const count = ref(0);
</script>

<template>
  <ShowCount :count="count" />
  <button @click="count++">加一</button>
</template>
```

`ShowCount` 收到的是數字本身，不是盒子。而且 `count` 一變，`ShowCount` 顯示的數字也跟著變：父元件重新渲染時，會把新的值傳下去。

### 只有最外層會自動解包

自動解包有一個限制：只有直接寫在 `<script setup>` 最外層的 `ref` 才會被打開。如果 `ref` 被包在一個普通物件裡面，模板裡算式就會出錯。把 `src/App.vue` 換成：

```vue
<script setup>
import { ref } from "vue";

const counter = { count: ref(1) };
</script>

<template>
  <p>{{ counter.count + 1 }}</p>
</template>
```

畫面上顯示的是：

```text
[object Object]1
```

`counter` 是普通物件，Vue 只打開最外層的盒子，不會鑽進普通物件裡面幫你打開 `counter.count`，所以又變成「物件加數字」。

解法是把它拿到最外層，用第 2 章學的解構就可以：

```vue
<script setup>
import { ref } from "vue";

const counter = { count: ref(1) };
const { count } = counter;
</script>

<template>
  <p>{{ count + 1 }}</p>
</template>
```

畫面變成 `2`。實務上很少故意把 `ref` 放進普通物件，但之後學到 composable（第 6 章）時會遇到類似的情況，到時候記得這個規則。

## 重點整理

- 在 `<script setup>` 裡，`ref` 要讀要改都寫 `.value`；模板裡直接寫名字，Vue 會自動解包。
- 印出 `[object Object]` 或 `RefImpl`，通常就是在 script 裡忘了 `.value`。
- `ref` 可以放任何值：數字、字串、布林值、陣列、物件。
- 用 props 把 `ref` 傳給子元件時，子元件收到的是裡面的值。
- 只有最外層的 `ref` 會自動解包，包在普通物件裡的不會。
