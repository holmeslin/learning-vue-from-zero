# 多個 store 互相使用

## 本集目標

把不同主題的資料拆成不同的 store，並且讓一個 store 讀取另一個 store 的資料。

## 正文

### 一個主題一個 store

專案裡的共用資料通常不只一種：使用者、購物車、網站設定……全部塞進同一個 store，很快就會變得和第 1 集的 `App.vue` 一樣肥。Pinia 的習慣是**一個主題一個 store**，每個 store 一個檔案。

這一集用兩個 store：一個管使用者，一個管電影票。會員買票打八折，所以電影票的 store 要知道使用者是不是會員。

`src/stores/user.js`：

```js
import { ref } from "vue";
import { defineStore } from "pinia";

export const useUserStore = defineStore("user", () => {
  const name = ref("小明");
  const isMember = ref(false);

  function toggleMember() {
    isMember.value = !isMember.value;
  }

  return { name, isMember, toggleMember };
});
```

`src/stores/ticket.js`：

```js
import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { useUserStore } from "./user.js";

const ticketPrice = 300;

export const useTicketStore = defineStore("ticket", () => {
  const user = useUserStore();

  const quantity = ref(1);

  const total = computed(() => {
    const subtotal = ticketPrice * quantity.value;
    return user.isMember ? subtotal * 0.8 : subtotal;
  });

  function addOne() {
    quantity.value++;
  }

  return { quantity, total, addOne };
});
```

`src/App.vue`：

```vue
<script setup>
import { useUserStore } from "./stores/user.js";
import { useTicketStore } from "./stores/ticket.js";

const user = useUserStore();
const ticket = useTicketStore();
</script>

<template>
  <p>
    {{ user.name }}：{{ user.isMember ? '會員' : '非會員' }}
    <button @click="user.toggleMember">切換會員</button>
  </p>
  <p>
    電影票 {{ ticket.quantity }} 張，共 {{ ticket.total }} 元
    <button @click="ticket.addOne">多買一張</button>
  </p>
</template>
```

一開始顯示「電影票 1 張，共 300 元」。按「多買一張」變成 600 元；再按「切換會員」，變成 480 元。

### 在 store 裡使用另一個 store

關鍵在 `ticket.js` 的這兩行：

```js
import { useUserStore } from "./user.js";
// ...
  const user = useUserStore();
```

和在元件裡用 store 的方法一模一樣：`import` 進來，呼叫 `useUserStore()` 拿到 store。之後在 getter 裡讀 `user.isMember`，它是響應式的：使用者一切換會員，`total` 就重新計算。

action 也一樣，ticket 的 action 裡可以讀 `user` 的 state，也可以呼叫 `user` 的 action，例如 `user.toggleMember()`。

元件同時用好幾個 store 也沒問題，像 `App.vue` 那樣各自呼叫、存進不同的變數就好。

### `useUserStore()` 要寫在函式裡面

注意 `const user = useUserStore()` 寫在 `defineStore` 的函式**裡面**。如果把它移到外面：

```js
import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { useUserStore } from "./user.js";

// 錯誤示範：寫在 defineStore 外面
const user = useUserStore();

export const useTicketStore = defineStore("ticket", () => {
  const quantity = ref(1);
  const total = computed(() => {
    const subtotal = 300 * quantity.value;
    return user.isMember ? subtotal * 0.8 : subtotal;
  });
  return { quantity, total };
});
```

畫面會一片空白，Console 出現第 2 集看過的錯誤，開頭是：

```text
[🍍]: "getActivePinia()" was called but there was no active Pinia.
Are you trying to use a store before calling "app.use(pinia)"?
```

明明 `main.js` 有 `app.use(createPinia())`，為什麼還是說沒有 Pinia？因為**執行順序**。`main.js` 一開始 `import App from "./App.vue"`，`App.vue` 又 `import` 了 `ticket.js`。`import` 的時候，`ticket.js` 最外層的程式碼就會立刻執行，這時 `main.js` 根本還沒跑到 `app.use(createPinia())` 那一行。

寫在 `defineStore` 函式裡面就沒有這個問題：那個函式要等到第一次有人呼叫 `useTicketStore()` 時才執行，那時候 App 早就裝好 Pinia 了。

規則很簡單：**`useXxxStore()` 只在 `<script setup>`、store 的函式或 action 裡面呼叫，不要寫在檔案最外層。** 第 9 章在 Vue Router 的導覽守衛裡用 store 時，也會遇到同樣的規則。

## 重點整理

- 一個主題一個 store，每個 store 一個檔案。
- 在 store 裡用另一個 store，和在元件裡一樣：`import` 之後呼叫 `useXxxStore()`。
- 從別的 store 讀到的資料是響應式的，getter 會跟著重新計算。
- `useXxxStore()` 要寫在 `defineStore` 的函式裡，寫在檔案最外層會出現「no active Pinia」錯誤。
