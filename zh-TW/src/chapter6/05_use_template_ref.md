# `useTemplateRef`

## 本集目標

用 `useTemplateRef` 拿到模板裡真正的 DOM 元素，做到 Vue 模板做不到的事，例如讓輸入框取得游標。

## 正文

### 一打開就能打字

很多搜尋頁面一打開，游標就已經在搜尋框裡，直接打字就好。要做到這件事，得呼叫輸入框這個 DOM 元素的 `focus()` 方法。但到目前為止，你都是透過模板描述畫面，從來沒有直接碰過 DOM 元素。

```vue
<script setup>
import { onMounted, useTemplateRef } from "vue";

const searchInput = useTemplateRef("search");

onMounted(() => {
  searchInput.value.focus();
});
</script>

<template>
  <input ref="search" placeholder="一打開就能直接打字" />
</template>
```

重新整理頁面，游標已經在輸入框裡閃了。

分成兩個部分看：

1. 模板裡的 `ref="search"`：替這個 `<input>` 取一個名字，叫 `search`。
2. `useTemplateRef("search")`：跟 Vue 說「我要名字叫 `search` 的那個元素」。它回傳一個 `ref`，元件掛載之後，`.value` 就是那個真正的 `<input>` 元素。

拿到元素之後，就能使用瀏覽器提供的各種方法，`focus()` 是其中之一，意思是「讓這個元素取得游標」。

### 為什麼要放在 `onMounted` 裡

上一集說過，`<script setup>` 的程式碼執行時，畫面上還什麼都沒有。這時候 `<input>` 還不存在，`searchInput.value` 是 `null`：

```vue
<script setup>
import { onMounted, useTemplateRef } from "vue";

const searchInput = useTemplateRef("search");

console.log(searchInput.value);

onMounted(() => {
  console.log(searchInput.value);
});
</script>

<template>
  <input ref="search" />
</template>
```

Console 印出：

```text
null
<input>
```

第一行是 `null`，因為元素還沒產生；掛載完成後，`.value` 才有東西。（不同瀏覽器印元素的樣子可能不太一樣，有些會印出可以展開的 `<input>`。）所以要操作 DOM，一定要等到 `onMounted` 之後，或是在使用者點了按鈕之類的事件裡，那時元件早就掛載好了。

### 在事件裡使用

```vue
<script setup>
import { ref, useTemplateRef } from "vue";

const message = ref("");
const messageInput = useTemplateRef("message-input");

function clear() {
  message.value = "";
  messageInput.value.focus();
}
</script>

<template>
  <input ref="message-input" v-model="message" placeholder="留言" />
  <button @click="clear">清除</button>
</template>
```

打幾個字，按「清除」，文字被清空，而且游標回到輸入框裡，可以馬上重打。如果沒有 `focus()`，游標會停在剛剛按的按鈕上，使用者得再點一次輸入框。

模板裡的名字可以用 `-` 連接的寫法，例如 `message-input`，和變數名稱不同也沒關係。

### 元素可能不在

如果元素包在 `v-if` 裡，條件是 `false` 時它不在畫面上，`.value` 會變回 `null`。這時呼叫 `.focus()` 會出錯，可以用第 2 章學的 `?.`：

```js,ignore
messageInput.value?.focus();
```

元素不在，就什麼都不做。

### 網路上的舊寫法

`useTemplateRef` 是 Vue 3.5 才加入的。在它之前，寫法是宣告一個和 `ref` 屬性**同名**的 `ref`，例如 `const search = ref(null)` 配上 `<input ref="search" />`。你在網路上和舊專案裡會很常看到，效果一樣。

### 別什麼都直接改 DOM

能用模板做到的事，就用模板做。改文字、切換 class、顯示或隱藏，全部交給 `{{ }}`、`v-bind`、`v-if` 這些語法，Vue 才能幫你保持畫面和資料一致。`useTemplateRef` 留給模板做不到的事：取得游標、捲動到某個位置、量元素的大小，或是把元素交給其他不是用 Vue 寫的函式庫。

## 重點整理

- 在模板元素上加 `ref="名字"`，再用 `useTemplateRef("名字")` 拿到它。
- 回傳的是一個 `ref`，元件掛載之後 `.value` 才是真正的 DOM 元素，之前是 `null`。
- 操作 DOM 要放在 `onMounted` 或事件處理函式裡。
- 元素可能不在畫面上時，用 `?.` 保護。
- 能用模板做到的事就不要直接改 DOM。
