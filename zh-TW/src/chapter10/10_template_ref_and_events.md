# 模板 ref 與事件的型別

## 本集目標

幫 `useTemplateRef` 和事件處理函式加上型別，並學會用 `as` 告訴 TypeScript 一個值的型別。

## 正文

### `useTemplateRef<HTMLInputElement>`

第 6 章用 `useTemplateRef` 拿到畫面上的 `<input>`，讓它自動取得焦點。改成 TypeScript，把 `src/App.vue` 換成：

```vue
<script setup lang="ts">
import { onMounted, useTemplateRef } from "vue";

const input = useTemplateRef<HTMLInputElement>("name-input");

onMounted(() => {
  input.value.focus();
});
</script>

<template>
  <input ref="name-input" />
</template>
```

```text
src/App.vue:7:3 - error TS18047: 'input.value' is possibly 'null'.

7   input.value.focus();
    ~~~~~~~~~~~


Found 1 error.
```

先看角括號裡的 `HTMLInputElement`。瀏覽器裡每一種 HTML 標籤，都有一個對應的型別：

| 標籤 | 型別 |
| --- | --- |
| `<input>` | `HTMLInputElement` |
| `<button>` | `HTMLButtonElement` |
| `<div>` | `HTMLDivElement` |
| `<canvas>` | `HTMLCanvasElement` |

規則是 `HTML` + 標籤名稱 + `Element`。有了這個型別，輸入 `input.value.` 時，編輯器就會列出 `focus`、`select`、`value` 這些 `<input>` 才有的東西。

再看錯誤：`input.value` 可能是 `null`。這是對的。元件還沒掛載、或那個 `<input>` 被 `v-if` 拿掉的時候，`input.value` 就是 `null`。雖然在 `onMounted` 裡它一定已經有值了，但 TypeScript 沒辦法知道這件事，所以要你處理。用第 2 章的 `?.` 就好：

```vue
<script setup lang="ts">
import { onMounted, useTemplateRef } from "vue";

const input = useTemplateRef<HTMLInputElement>("name-input");

onMounted(() => {
  input.value?.focus();
});
</script>

<template>
  <input ref="name-input" />
</template>
```

其實就算不寫 `<HTMLInputElement>`，Vue 的編輯器擴充功能和 `vue-tsc` 也會從模板裡的 `ref="name-input"` 看出它是 `<input>`，自動推論出型別。不過明確寫出來比較好讀，這本書會寫。

### 事件處理函式的參數

第 5 章在模板裡直接寫過 `@input="name = $event.target.value"`。如果把這段搬進 `<script setup>`，寫成一個收到 `event` 參數的處理函式，在 TypeScript 裡，參數一定要標型別（第 4 集），不標會看到熟悉的錯誤：

```text
src/App.vue:2:22 - error TS7006: Parameter 'event' implicitly has an 'any' type.
```

事件物件也有對應的型別。最通用的是 `Event`，試試看：

```vue
<script setup lang="ts">
function handleInput(event: Event) {
  console.log(event.target.value);
}
</script>

<template>
  <input @input="handleInput" />
</template>
```

```text
src/App.vue:3:15 - error TS18047: 'event.target' is possibly 'null'.

3   console.log(event.target.value);
                ~~~~~~~~~~~~

src/App.vue:3:28 - error TS2339: Property 'value' does not exist on type 'EventTarget'.

3   console.log(event.target.value);
                             ~~~~~


Found 2 errors.
```

`event.target` 是「觸發事件的那個東西」。TypeScript 只知道它是某個 `EventTarget`，不知道是 `<input>`，所以不讓你拿 `value`。可是你知道：這個函式只接在 `<input>` 上。

### 用 `as` 告訴 TypeScript

這種「你比 TypeScript 更清楚」的時候，用 `as`：

```vue
<script setup lang="ts">
import { ref } from "vue";

const text = ref("");

function handleInput(event: Event) {
  const input = event.target as HTMLInputElement;
  text.value = input.value;
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Enter") {
    console.log("送出：", text.value);
  }
}

function handleClick(event: MouseEvent) {
  console.log("點在", event.clientX, event.clientY);
}
</script>

<template>
  <input @input="handleInput" @keydown="handleKeydown" />
  <button @click="handleClick">點我</button>
  <p>{{ text }}</p>
</template>
```

`event.target as HTMLInputElement` 的意思是：「相信我，這是一個 `<input>`。」TypeScript 就照你說的當它是 `HTMLInputElement`，`input.value` 也就能用了。

`as` 很好用，但要小心：TypeScript 不會檢查你說得對不對。如果你把這個函式接到 `<button>` 上，TypeScript 不會報錯，執行時才出問題。所以 `as` 只用在你真的確定的地方，這種事件的 `target` 是最常見的情況。

其實這個例子用 `v-model` 就好，不需要自己處理事件。這裡只是示範型別怎麼寫。

### 常用的事件型別

| 事件 | 型別 | 常用的東西 |
| --- | --- | --- |
| `@input`、`@change`、`@submit` | `Event` | `target` |
| `@keydown`、`@keyup` | `KeyboardEvent` | `key` |
| `@click`、`@mousemove` | `MouseEvent` | `clientX`、`clientY` |

不確定的時候，在模板裡把滑鼠移到 `@click` 這種事件名稱上，編輯器會告訴你它的型別。`@click` 其實會顯示 `PointerEvent`，它是 `MouseEvent` 的一種，寫 `MouseEvent` 也可以。

另外，直接寫在模板裡的處理方式，例如 `@click="count++"` 或 `@keydown="(event) => console.log(event.key)"`，都不用標型別，Vue 會自動推論。只有寫在 `<script setup>` 裡的函式才需要標。

## 重點整理

- `useTemplateRef<HTMLInputElement>("名稱")`，標籤的型別是 `HTML` + 標籤名稱 + `Element`。
- 模板 ref 的值可能是 `null`，用 `?.` 處理。
- 事件處理函式的參數要標型別：`Event`、`KeyboardEvent`、`MouseEvent`。
- `event.target as HTMLInputElement` 用 `as` 告訴 TypeScript 型別，但它不會幫你檢查對不對。
- 直接寫在模板裡的事件處理，不用標型別。
