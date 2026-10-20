# props 解構與預設值

## 本集目標

用解構的寫法讀 props、順便設定預設值，並且知道把解構出來的 prop 交給 `watch` 或 composable 時要包成 getter。

## 正文

### 先看範例

做一個按鈕元件，可以指定大小 `sm`、`md`、`lg`；沒指定的話就用 `md`。

建立 `src/components/SizeButton.vue`：

```vue
<script setup>
const { label, size = "md" } = defineProps({
  label: String,
  size: String,
});
</script>

<template>
  <button :class="size">{{ label }}（{{ size }}）</button>
</template>

<style scoped>
.sm {
  font-size: 12px;
}
.md {
  font-size: 16px;
}
.lg {
  font-size: 24px;
}
</style>
```

把 `src/App.vue` 換成：

```vue
<script setup>
import { ref } from "vue";
import SizeButton from "./components/SizeButton.vue";

const sizes = ["sm", "md", "lg"];
const index = ref(0);

function next() {
  index.value = (index.value + 1) % sizes.length;
}
</script>

<template>
  <SizeButton label="小" size="sm" />
  <SizeButton label="沒給 size" />
  <SizeButton label="會變的" :size="sizes[index]" />
  <button @click="next">換尺寸</button>
</template>
```

畫面上會出現三個按鈕：「小（sm）」、「沒給 size（md）」、「會變的（sm）」。按一下「換尺寸」，第三個按鈕變成「會變的（md）」，字也跟著變大。

### 這是第 2 章的物件解構

第 4 章寫 props 時，`defineProps` 的回傳值要嘛沒用到（只在模板裡用），要嘛存在一個 `props` 變數裡，在 `<script setup>` 裡寫 `props.size` 讀取。

`defineProps` 回傳的是一個物件，裡面裝著所有 props。既然是物件，就可以用第 2 章學的**解構**一次拿出好幾個。第 2 章預告過的寫法就是這個：

```vue
<script setup>
const { title } = defineProps(["title"]);
console.log(title);
</script>

<template>
  <h1>{{ title }}</h1>
</template>
```

用陣列寫法 `defineProps(["title"])` 或物件寫法 `defineProps({ title: String })` 都可以解構。解構之後，在 `<script setup>` 裡直接寫 `title`，不用再寫 `props.title`。

### 預設值直接寫在解構裡

解構可以用 `=` 給預設值，屬性是 `undefined` 時才會用上：

```js
const { size = "md" } = {};
console.log(size);
```

```text
md
```

props 也一樣。父元件沒有傳 `size`，`size` 就是 `"md"`；有傳，就用傳進來的值。這就是第二個按鈕顯示「md」的原因。陣列寫法也能這樣給預設值：

```vue
<script setup>
const { size = "md" } = defineProps(["size"]);
</script>

<template>
  <span>{{ size }}</span>
</template>
```

你可能在別的教學看過另一種寫法，把預設值寫在 `default` 裡：

```vue
<script setup>
const props = defineProps({
  size: { type: String, default: "md" },
});
</script>

<template>
  <span>{{ props.size }}</span>
</template>
```

效果一樣。這一章之後都用解構的寫法，比較短。

### 等等，解構出來的東西不是不會變嗎？

第 5 章講 `reactive` 時踩過一個陷阱：從響應式物件解構出來的值，只是當下的複製品，之後就不會跟著變了。那第三個按鈕為什麼會變？

這是 Vue 3.5 加上的功能，叫**響應式 props 解構**（reactive props destructure）。只有 `defineProps` 有這個待遇：Vue 在編譯 `<script setup>` 時，會偷偷把你寫的 `size` 改回 `props.size`。所以表面上是普通變數，實際上每次讀到的都是最新的 prop，模板、`computed`、普通函式裡都可以放心用。

### 陷阱：直接交給 `watch`

這個「偷偷改寫」有個例外。假設你建立 `src/components/CountWatcher.vue`，把解構出來的 prop 直接交給 `watch`：

```vue,ignore
<script setup>
import { watch } from "vue";

const { count } = defineProps({ count: Number });

watch(count, (newCount) => {
  console.log(newCount);
});
</script>

<template>
  <p>{{ count }}</p>
</template>
```

存檔後瀏覽器會跳出紅色的錯誤畫面。用 `npx vite build` 建置也會失敗，訊息是這樣（路徑省略，太長的一行折成兩行）：

```text
[plugin vite:vue] /…/src/components/CountWatcher.vue
Error: [@vue/compiler-sfc] "count" is a destructured prop and should not be
passed directly to watch(). Pass a getter () => count instead.
```

原因是 `watch(count, ...)` 等於 `watch(props.count, ...)`。第 6 章說過，`watch(form.name, ...)` 交出去的只是一個普通的字串；這裡也一樣，交給 `watch` 的是「當下的數字」，例如 `1`，而不是「會變的東西」。

錯誤訊息已經告訴你怎麼修：包成 getter。這和第 6 章監聽 props 時寫的 `watch(() => props.id, ...)` 是同一件事。

建立 `src/components/CountWatcher.vue`：

```vue
<script setup>
import { watch } from "vue";

const { count } = defineProps({ count: Number });

watch(
  () => count,
  (newCount, oldCount) => {
    console.log(`count 從 ${oldCount} 變成 ${newCount}`);
  },
);
</script>

<template>
  <p>目前是 {{ count }}</p>
</template>
```

把 `src/App.vue` 換成：

```vue
<script setup>
import { ref } from "vue";
import CountWatcher from "./components/CountWatcher.vue";

const count = ref(1);
</script>

<template>
  <CountWatcher :count="count" />
  <button @click="count++">加一</button>
</template>
```

按一下「加一」，Console 會印出：

```text
count 從 1 變成 2
```

`() => count` 每次被呼叫時才去讀 `count`（其實是 `props.count`），所以 `watch` 每次都能拿到最新的值。

### 交給 composable 也一樣

第 6 章的 composable 也有同樣的問題，而且更麻煩：Vue 不會報錯，只是安安靜靜不動。

建立 `src/composables/useLogChange.js`，它會在值改變時印出訊息：

```js
import { watch } from "vue";

export function useLogChange(source, name) {
  watch(source, (newValue) => {
    console.log(`${name} 變成 ${newValue}`);
  });
}
```

`watch` 本來就接受 `ref` 或 getter，所以這裡直接把 `source` 交給它，不用像第 6 章的 `useFetch` 那樣先 `toValue`。

在元件裡用它，一樣要包成 getter。把 `src/components/CountWatcher.vue` 改成：

```vue
<script setup>
import { useLogChange } from "../composables/useLogChange.js";

const { count } = defineProps({ count: Number });

useLogChange(() => count, "count");
</script>

<template>
  <p>目前是 {{ count }}</p>
</template>
```

`src/App.vue` 不用改。按一下「加一」：

```text
count 變成 2
```

如果寫成 `useLogChange(count, "count")`，交出去的又是一個固定的數字，就像第 6 章傳 `userId.value` 給 `useFetch` 一樣，父元件怎麼改都不會印出任何東西。

記一條規則就好：**解構出來的 prop 要交給 `watch` 或 composable 時，包成 `() => 名稱`。** 在模板、`computed`、普通的函式裡直接用，不用包。

## 重點整理

- `const { size = "md" } = defineProps(...)` 一次拿出 props，並且設定預設值；陣列寫法和物件寫法都可以。
- 預設值只在父元件沒傳（`undefined`）時才會用上。
- Vue 3.5 起，從 `defineProps` 解構出來的 prop 仍然是響應式的，因為編譯時會被改寫回 `props.size`。
- 交給 `watch` 時要寫 `() => count`，直接寫 `count` 會編譯失敗。
- 交給 composable 時也要包成 getter，否則不會報錯，但也不會更新。
