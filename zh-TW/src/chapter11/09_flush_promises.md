# 非同步測試與 `flushPromises`

## 本集目標

測試「過一下子才會出現」的畫面，例如資料載入完成後的名單。

## 正文

### 問題：畫面不是馬上就有

第 6 章教過抓資料：元件一開始顯示「載入中」，等資料回來才換成真正的內容。這一集的元件改在第 6 章學的 `onMounted` 裡載入資料。測試要怎麼辦？資料回來之前，畫面是一個樣子；回來之後，又是另一個樣子。

### 要測的元件

為了讓測試單純，這個元件**不自己抓資料**，而是從 props 接收一個「載入資料的函式」。真正使用時傳入會連網路的函式；測試時傳入一個馬上回傳假資料的函式。建立 `src/components/UserList.vue`：

```vue
<!-- src/components/UserList.vue -->
<script setup lang="ts">
import { onMounted, ref } from "vue";

const props = defineProps<{
  loadUsers: () => Promise<string[]>;
}>();

const users = ref<string[] | null>(null);
const error = ref("");

onMounted(async () => {
  try {
    users.value = await props.loadUsers();
  } catch {
    error.value = "載入失敗";
  }
});
</script>

<template>
  <p v-if="error">{{ error }}</p>
  <p v-else-if="users === null">載入中…</p>
  <ul v-else>
    <li v-for="user in users" :key="user">{{ user }}</li>
  </ul>
</template>
```

- `loadUsers: () => Promise<string[]>` 的意思是：「一個不用參數、回傳 Promise 的函式，Promise 完成時會拿到字串陣列」。
- `try { ... } catch { ... }`：`try` 裡面的程式碼如果出錯（例如 Promise 失敗），就跳到 `catch` 執行，不會讓整個程式停掉。這裡用來在載入失敗時顯示錯誤訊息。

這種把「做事的東西」從外面傳進來的作法，讓元件更好測試，也更有彈性。

### 用 `flushPromises` 等它完成

建立 `src/components/__tests__/UserList.spec.ts`：

```ts
// src/components/__tests__/UserList.spec.ts
import { expect, test } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import UserList from "../UserList.vue";

const loadUsers = () => Promise.resolve(["小明", "小華"]);
const loadFail = () => Promise.reject(new Error("網路斷線"));

test("先顯示載入中，載入完成後顯示名單", async () => {
  const wrapper = mount(UserList, { props: { loadUsers } });
  expect(wrapper.text()).toBe("載入中…");

  await flushPromises();

  expect(wrapper.findAll("li")).toHaveLength(2);
  expect(wrapper.text()).toContain("小明");
  expect(wrapper.text()).not.toContain("載入中…");
});

test("載入失敗時顯示錯誤訊息", async () => {
  const wrapper = mount(UserList, { props: { loadUsers: loadFail } });

  await flushPromises();

  expect(wrapper.text()).toBe("載入失敗");
});
```

`Promise.resolve(...)` 是「馬上成功、結果是這個值」的 Promise，`Promise.reject(...)` 是「馬上失敗」的 Promise。第 2 章學的 Promise，在測試裡常這樣用：用最簡單的寫法，做出假的非同步結果。

`props: { loadUsers }` 是物件的簡寫，等於 `props: { loadUsers: loadUsers }`。

重點是 `await flushPromises()`：

- `flushPromises` 也是從 `@vue/test-utils` 匯入的。
- 它的意思是「**等所有還在進行中的 Promise 都完成**」。`loadUsers()` 的 Promise 完成、`users` 被設定、Vue 更新畫面，這些都會在它結束前做完。
- 它回傳 Promise，所以前面要加 `await`，測試函式也要加 `async`。

測試的順序也值得注意：先確認「載入中」在，再 `await flushPromises()`，最後確認名單出現、「載入中」不在了。前後兩個狀態都檢查到了。

```text
 ✓ src/components/__tests__/UserList.spec.ts (2 tests) 11ms
   ✓ 先顯示載入中，載入完成後顯示名單 10ms
   ✓ 載入失敗時顯示錯誤訊息 1ms

 Test Files  1 passed (1)
      Tests  2 passed (2)
```

### 不等的話

把第一個測試裡的 `await flushPromises();` 和它下面的空行刪掉，再跑一次：

```text
 FAIL  src/components/__tests__/UserList.spec.ts > 先顯示載入中，載入完成後顯示名單
AssertionError: expected [] to have a length of 2 but got +0

- Expected
+ Received

- 2
+ 0

 ❯ src/components/__tests__/UserList.spec.ts:13:33
     11|   expect(wrapper.text()).toBe("載入中…");
     12|
     13|   expect(wrapper.findAll("li")).toHaveLength(2);
       |                                 ^
     14|   expect(wrapper.text()).toContain("小明");
     15|   expect(wrapper.text()).not.toContain("載入中…");
```

`findAll("li")` 找到的是空陣列：資料還沒回來，畫面上還是「載入中…」，根本沒有 `<li>`。就算 `loadUsers` 是「馬上」成功的 Promise，它的結果也要等目前這段程式碼跑完才會拿到，`expect` 跑得比它快。

### `await` 什麼？

到目前為止有兩種要等的東西，別搞混：

| 情況 | 要等什麼 |
| --- | --- |
| `trigger`、`setValue`、`setProps` 之後 | `await` 那個方法本身，等畫面更新 |
| 元件裡有 Promise（抓資料、`async` 函式）| `await flushPromises()`，等 Promise 完成 |

兩種情況同時發生也很常見，例如「按下按鈕後才開始抓資料」：先 `await trigger("click")`，再 `await flushPromises()`。不確定的時候，多加一個 `await flushPromises()` 不會有壞處。

## 重點整理

- 元件裡有 Promise 時，用 `await flushPromises()` 等它們全部完成，再檢查畫面。
- 測試用 `Promise.resolve(資料)` 和 `Promise.reject(錯誤)` 做出假的非同步結果。
- 把「載入資料的函式」從 props 傳進元件，元件會更好測試。
- 完整的非同步測試會檢查前後兩個狀態：載入中、載入完成。
