# 透傳屬性（`$attrs`）

## 本集目標

知道沒宣告成 props 的屬性會自動加到元件的根元素上，並且能用 `inheritAttrs: false` 和 `$attrs` 決定它們要放在哪裡。

## 正文

### 先看範例

建立 `src/components/MyButton.vue`，一個很普通的按鈕元件，沒有宣告任何 props：

```vue
<template>
  <button class="btn">
    <slot />
  </button>
</template>

<style scoped>
.btn {
  padding: 4px 12px;
  border-radius: 4px;
}
</style>
```

把 `src/App.vue` 換成下面這樣，用它的時候加上 `class`、`title` 和 `@click`：

```vue
<script setup>
import { ref } from "vue";
import MyButton from "./components/MyButton.vue";

const count = ref(0);
</script>

<template>
  <MyButton class="danger" title="小心" @click="count++">
    按了 {{ count }} 次
  </MyButton>
</template>

<style>
.danger {
  color: white;
  background: crimson;
}
</style>
```

打開瀏覽器的開發者工具看 HTML，按鈕長這樣（省略了 `<style scoped>` 加的 `data-v-` 標記）：

```text
<button class="btn danger" title="小心"> 按了 0 次 </button>
```

按鈕變成紅底白字，滑鼠移上去會出現「小心」的提示，點了次數也會增加。`MyButton` 明明沒宣告這些 props，它們卻都跑到 `<button>` 上了。

### 什麼是透傳屬性

你寫在元件標籤上的東西，如果**沒有**被宣告成 props（`defineProps`）或事件（`defineEmits`），Vue 會把它們自動加到元件的**根元素**上。根元素就是模板最外層的那個元素，這裡是 `<button>`。

這些屬性叫做**透傳屬性**（fallthrough attributes），意思是「穿過元件、直接落到裡面的元素上」。常見的有：

- `class` 和 `style`：會和根元素原本的合併，所以是 `class="btn danger"`，不是把 `btn` 蓋掉。
- 一般的 HTML 屬性：`title`、`id`、`type`、`placeholder`、`disabled`……
- 事件監聽：`@click` 變成根元素的 `click` 事件。

這個設計很貼心。寫一個包裝 `<button>` 的元件時，不用把 `title`、`disabled`、`@click` 一個一個宣告成 props，用的人照平常寫 HTML 的習慣寫就好。

### 根元素不是你要的那一個

麻煩的是，根元素不一定是你想放的地方。建立 `src/components/TextField.vue`，一個附帶標籤文字的輸入框：

```vue
<script setup>
const { label } = defineProps({ label: String });
const model = defineModel();
</script>

<template>
  <label class="field">
    {{ label }}
    <input v-model="model" />
  </label>
</template>
```

用的人很自然地會這樣寫（完整的 `src/App.vue` 在下一段，兩個版本的 `TextField` 都用同一個 `App.vue`，你可以先貼上去看看結果）：

```vue,ignore
<TextField
  v-model="email"
  label="信箱"
  type="email"
  placeholder="you@example.com"
/>
```

結果 `type` 和 `placeholder` 加到了根元素 `<label>` 上，`<input>` 什麼都沒拿到：

```text
<label class="field" type="email" placeholder="you@example.com">
  信箱 <input>
</label>
```

`<label>` 拿到 `placeholder` 一點用都沒有。

### `inheritAttrs: false` 加上 `$attrs`

解法分兩步：先叫 Vue 不要自動往根元素放，再自己指定要放在哪裡。

把 `src/components/TextField.vue` 改成：

```vue
<script setup>
defineOptions({ inheritAttrs: false });

const { label } = defineProps({ label: String });
const model = defineModel();
</script>

<template>
  <label class="field">
    {{ label }}
    <input v-model="model" v-bind="$attrs" />
  </label>
</template>
```

把 `src/App.vue` 換成：

```vue
<script setup>
import { ref } from "vue";
import TextField from "./components/TextField.vue";

const email = ref("");
</script>

<template>
  <TextField
    v-model="email"
    label="信箱"
    type="email"
    placeholder="you@example.com"
  />
  <p>你輸入的是：{{ email }}</p>
</template>
```

這次 HTML 變成：

```text
<label class="field">
  信箱 <input type="email" placeholder="you@example.com">
</label>
```

`type` 和 `placeholder` 到了 `<input>` 上，打字時下面的段落也會跟著更新。

逐行看新的東西：

- `defineOptions({ inheritAttrs: false })`：`defineOptions` 和 `defineProps` 一樣是 `<script setup>` 專用的特殊函式，不用 `import`。它用來設定元件的選項，`inheritAttrs: false` 的意思是「不要自動繼承透傳屬性」。
- `$attrs`：模板裡可以直接用的物件，裝著所有透傳屬性。這裡它是 `{ type: "email", placeholder: "you@example.com" }`。
- `v-bind="$attrs"`：第 4 章的 `v-bind` 後面沒有冒號和名稱，直接給一個物件，意思是「把物件裡每個屬性都綁上去」。

`label` 是宣告過的 prop，`v-model` 用到的 `modelValue` 也被 `defineModel` 宣告了，所以它們都不會出現在 `$attrs` 裡。

要注意，加了 `inheritAttrs: false` 之後，連 `class` 和 `style` 都會跟著 `$attrs` 走。用的人寫 `<TextField class="wide" />`，這個 `class` 會加在 `<input>` 上，不是 `<label>`。

### 在 `<script setup>` 裡讀 `$attrs`

`$attrs` 只能在模板裡用。如果要在 `<script setup>` 裡讀，用 `useAttrs()`：

```vue
<script setup>
import { useAttrs } from "vue";

const attrs = useAttrs();
console.log(attrs.placeholder);
</script>

<template>
  <input v-bind="$attrs" />
</template>
```

`useAttrs()` 回傳的物件不是響應式的，不能用 `watch` 監聽它的變化。大部分時候在模板裡用 `$attrs` 就夠了。

### 模板有好幾個根元素的時候

如果模板最外層有兩個以上的元素，Vue 不知道該把透傳屬性放在哪個上面，就乾脆不放，並且在開發模式下在 Console 警告你（訊息太長，這裡折成三行）：

```text
[Vue warn]: Extraneous non-props attributes (class, title) were passed to
component but could not be automatically inherited because component renders
fragment or text or teleport root nodes.
```

這時候用 `v-bind="$attrs"` 自己指定要放在哪一個元素上，警告就會消失。

## 重點整理

- 沒宣告成 props 或事件的屬性叫透傳屬性，會自動加到元件的根元素上。
- `class` 和 `style` 會和根元素原本的合併，不會蓋掉。
- `defineOptions({ inheritAttrs: false })` 關掉自動繼承。
- `v-bind="$attrs"` 把透傳屬性放到你指定的元素上。
- 模板有多個根元素時，Vue 不會自動放，要自己用 `$attrs` 指定。
