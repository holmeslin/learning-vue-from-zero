# 你可能不需要 `watch`

## 本集目標

分辨哪些情況不該用 `watch`，改用 `computed` 或事件處理函式。

## 正文

學會 `watch` 之後，很容易什麼都想用它：「這個值變了，就去改那個值」。但很多時候這是繞遠路，程式碼變長，還容易出錯。

### 從別的值算出來的，用 `computed`

```vue
<script setup>
import { ref, watch } from "vue";

const firstName = ref("王");
const lastName = ref("小明");
const fullName = ref("");

// 不好的寫法
watch(
  [firstName, lastName],
  ([newFirst, newLast]) => {
    fullName.value = newFirst + newLast;
  },
  { immediate: true },
);
</script>

<template>
  <input v-model="firstName" />
  <input v-model="lastName" />
  <p>全名：{{ fullName }}</p>
</template>
```

這段能跑，但多了一個 `fullName` 要維護，忘了加 `immediate` 一開始還會是空的。`fullName` 完全是從 `firstName` 和 `lastName` 算出來的，這正是第 5 章學的 `computed` 的工作：

```vue
<script setup>
import { computed, ref } from "vue";

const firstName = ref("王");
const lastName = ref("小明");
const fullName = computed(() => firstName.value + lastName.value);
</script>

<template>
  <input v-model="firstName" />
  <input v-model="lastName" />
  <p>全名：{{ fullName }}</p>
</template>
```

更短，一開始就有值，而且不可能和來源對不上。

篩選清單也是一樣。「只顯示還沒完成的待辦事項」不需要用 `watch` 去更新另一個陣列，寫一個 `computed` 回傳 `todos.value.filter(...)` 就好。

判斷方法：**如果你在 `watch` 裡做的事，只是「設定另一個 `ref`」，而且那個值完全能從其他值算出來，就改用 `computed`。**

### 使用者做了某件事，就在事件裡處理

第二種常見的誤用，是拿 `watch` 來回應使用者的動作：

```vue
<script setup>
import { ref, watch } from "vue";

const cart = ref([]);
const message = ref("");

function add(item) {
  cart.value.push(item);
}

function clearCart() {
  cart.value = [];
}

// 不好的寫法
watch(
  () => cart.value.length,
  (newLength, oldLength) => {
    if (newLength > oldLength) {
      message.value = "已加入購物車";
    }
  },
);
</script>

<template>
  <button @click="add('蘋果')">買蘋果</button>
  <button @click="clearCart">清空</button>
  <p>購物車有 {{ cart.length }} 樣東西</p>
  <p>{{ message }}</p>
</template>
```

`watch` 只知道「數量變多了」，不知道**為什麼**變多。今天只有一個按鈕會加東西還好；以後如果多了「從上次的訂單還原購物車」的功能，數量一樣會變多，就會莫名其妙跳出「已加入購物車」。為了分辨，你得在 callback 裡加越來越多的判斷。

「已加入購物車」是因為使用者**按了按鈕**，那就直接寫在按鈕對應的函式裡：

```vue
<script setup>
import { ref } from "vue";

const cart = ref([]);
const message = ref("");

function add(item) {
  cart.value.push(item);
  message.value = "已加入購物車";
}

function clearCart() {
  cart.value = [];
  message.value = "";
}
</script>

<template>
  <button @click="add('蘋果')">買蘋果</button>
  <button @click="clearCart">清空</button>
  <p>購物車有 {{ cart.length }} 樣東西</p>
  <p>{{ message }}</p>
</template>
```

原因和結果寫在一起，讀程式的人一眼就看得懂。

### 那 `watch` 什麼時候該用

回想這一章前面的例子：改分頁標題、搜尋框的計時器、抓資料。它們的共通點是：**要讓 Vue 以外的東西跟著狀態走**。分頁標題是瀏覽器的、計時器是瀏覽器的、伺服器更是在遠方。這些事 `computed` 做不到，也不屬於某一個按鈕，用 `watch` 就對了。

整理成三個問題，寫 `watch` 之前先問自己：

1. 這個值能不能從其他值算出來？能，就用 `computed`。
2. 這件事是不是因為使用者做了某個動作才發生？是，就寫在那個事件的處理函式裡。
3. 都不是，而且是要和 Vue 以外的東西同步？那才用 `watch` 或 `watchEffect`。

## 重點整理

- 能從其他值算出來的，用 `computed`，不要用 `watch` 去設定另一個 `ref`。
- 因為使用者的動作才發生的事，寫在事件處理函式裡。
- `watch` 只知道值變了，不知道為什麼變。
- `watch` 適合用來讓 Vue 以外的東西（分頁標題、計時器、伺服器）跟著狀態走。
