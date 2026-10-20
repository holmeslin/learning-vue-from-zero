# 表單送出後 `refresh`

## 本集目標

做出留言板的頁面：用 `$fetch` 送出新增和刪除，再用 `useFetch` 的 `refresh` 重新抓列表，讓畫面跟上最新的資料。

## 正文

### 留言板頁面

新增 `app/pages/index.vue`：

```vue
<!-- app/pages/index.vue -->
<script setup lang="ts">
const { data: messages, refresh } = await useFetch("/api/messages");

const name = ref("");
const text = ref("");

async function submit() {
  await $fetch("/api/messages", {
    method: "POST",
    body: { name: name.value, text: text.value },
  });
  text.value = "";
  await refresh();
}

async function remove(id: string) {
  await $fetch(`/api/messages/${id}`, { method: "DELETE" });
  await refresh();
}
</script>

<template>
  <main>
    <h1>留言板</h1>

    <form @submit.prevent="submit">
      <input v-model="name" placeholder="你的名字" />
      <textarea v-model="text" placeholder="想說的話" />
      <button type="submit">送出</button>
    </form>

    <ul>
      <li v-for="message in messages" :key="message.id">
        <strong>{{ message.name }}</strong>：{{ message.text }}
        <button type="button" @click="remove(message.id)">刪除</button>
      </li>
    </ul>
  </main>
</template>
```

打開 <http://localhost:3000>，填名字和留言按「送出」，留言馬上出現在下面；按「刪除」，它馬上消失。重新整理頁面，資料都還在，因為它們存在伺服器上。

### 讀用 `useFetch`，改用 `$fetch`

這個頁面同時用了上一章學過的兩種方式，分工很清楚：

- **讀**列表用 `useFetch`。頁面一打開就要有資料，而且在伺服器端渲染（SSR）時就要抓好，這正是 `useFetch` 擅長的。
- **改**資料用 `$fetch`。新增、刪除都是使用者按了按鈕才發生，不需要在 SSR 時執行，直接呼叫 `$fetch` 就好。

`$fetch` 的第二個參數可以指定方法和要送的資料：

- `method: "POST"`：用 `POST` 方法，對應到 `index.post.ts`。
- `body: { ... }`：要送出的資料。直接放物件就好，`$fetch` 會自動轉成 JSON，也會自動加上上一集 `curl` 裡手動寫的 `Content-Type`。

刪除的網址用樣板字面值把 `id` 接上去，例如 `/api/messages/000a85e6-…`，對應到 `[id].delete.ts`。

### 為什麼需要 `refresh`

試試看把 `submit` 裡的 `await refresh();` 刪掉，再送出一則留言：畫面上什麼都沒變。重新整理頁面，那則留言才出現。

原因是 `useFetch` 只在頁面載入時抓一次資料。之後伺服器上的資料變了，它不會知道，`messages` 還是舊的那份。

`useFetch` 回傳的 `refresh` 就是「再去抓一次」。呼叫它之後，`useFetch` 重新請求 `/api/messages`，拿到新資料後更新 `messages`，畫面就跟著更新了。

所以留言板的流程是：

1. `$fetch` 送出新增或刪除，等伺服器存好。
2. `refresh()` 重新抓列表。
3. `messages` 變成新的，Vue 自動更新畫面。

第 1 步要加 `await`，等伺服器真的存好了才去抓。不加的話，可能會抓到還沒更新的舊列表。

### 送出之後清空欄位

送出成功後，`text.value = ""` 把留言欄位清空，方便寫下一則；名字通常不會變，就留著。

`@submit.prevent` 是第 5 章學過的寫法：`.prevent` 阻止表單預設的「整頁重新載入」，改成執行 `submit` 函式。

## 重點整理

- 頁面載入就要的資料用 `useFetch`，使用者操作才發生的新增、刪除用 `$fetch`。
- `$fetch` 用 `method` 指定方法，用 `body` 放資料，物件會自動轉成 JSON。
- `useFetch` 只在載入時抓一次，伺服器資料改了它不會知道。
- 改完資料後呼叫 `useFetch` 回傳的 `refresh()`，重新抓一次，畫面就會更新。
