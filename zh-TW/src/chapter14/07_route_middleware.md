# route middleware

## 本集目標

用 route middleware 在進入頁面之前做檢查，替留言板加一個管理頁，並且搞清楚：真正擋住壞人的，是 API 裡的檢查。

## 正文

現在任何人都能刪除任何留言，這不太對。這一集要改成：一般人只能看和留言，刪除要到管理頁 `/admin` 做，而且只有知道暗號的管理者能刪。

這個留言板沒有登入系統，所以用最簡單的方式示範原理：管理者的瀏覽器裡存一個暗號，伺服器收到刪除請求時，檢查暗號對不對。真實的網站會用正式的登入機制，但「在伺服器上檢查身分」這個觀念完全一樣。

**先說清楚：這一集的做法只是示範，不要直接拿去保護真正的網站。**

### cookie 與 `useCookie`

暗號存在 **cookie** 裡。cookie 是瀏覽器替某個網站記住的一小段文字，之後瀏覽器每次對這個網站發請求，都會自動把它帶上。所以伺服器在 API 裡讀得到它。

Nuxt 的 `useCookie("名字")` 會回傳一個 ref，讀 `.value` 就是 cookie 目前的值，改 `.value` 就會寫進瀏覽器的 cookie。

### 登入頁

新增 `app/pages/login.vue`：

```vue
<!-- app/pages/login.vue -->
<script setup lang="ts">
const token = useCookie("admin_token");
const password = ref("");

async function login() {
  token.value = password.value;
  await navigateTo("/admin");
}
</script>

<template>
  <main>
    <h1>管理者登入</h1>
    <form @submit.prevent="login">
      <input v-model="password" type="password" placeholder="暗號" />
      <button type="submit">登入</button>
    </form>
  </main>
</template>
```

它只做一件事：把你輸入的東西存進叫 `admin_token` 的 cookie，然後用 `navigateTo` 換到 `/admin`。注意，這裡**完全沒有檢查**暗號對不對，你輸入什麼都會存進去。

### 管理頁

新增 `app/pages/admin.vue`，把刪除功能搬過來：

```vue
<!-- app/pages/admin.vue -->
<script setup lang="ts">
definePageMeta({ middleware: "admin" });

const { data: messages, refresh } = await useFetch("/api/messages");
const errorMessage = ref("");

async function remove(id: string) {
  errorMessage.value = "";
  try {
    await $fetch(`/api/messages/${id}`, { method: "DELETE" });
  } catch (err) {
    const data = (err as { data?: { message?: string } }).data;
    errorMessage.value = data?.message ?? "刪除失敗，請稍後再試";
  }
  await refresh();
}
</script>

<template>
  <main>
    <h1>管理留言</h1>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <ul>
      <li v-for="message in messages" :key="message.id">
        <strong>{{ message.name }}</strong>：{{ message.text }}
        <button type="button" @click="remove(message.id)">刪除</button>
      </li>
    </ul>
  </main>
</template>

<style scoped>
.error {
  color: crimson;
}
</style>
```

`remove` 和上一集首頁的寫法一樣。新東西只有第一行的 `definePageMeta({ middleware: "admin" })`，意思是「進入這一頁之前，先執行叫 `admin` 的 middleware」。

接著把首頁 `app/pages/index.vue` 的 `remove` 函式和每則留言旁的「刪除」按鈕拿掉，首頁就只剩下送出留言的表單和留言列表。

### route middleware

新增 `app/middleware/admin.ts`：

```ts
// app/middleware/admin.ts
export default defineNuxtRouteMiddleware(() => {
  const token = useCookie("admin_token");
  if (!token.value) {
    return navigateTo("/login");
  }
});
```

**route middleware** 是「換頁之前先執行的函式」。放在 `app/middleware/` 裡，檔名就是它的名字，所以這個叫 `admin`，頁面用 `definePageMeta({ middleware: "admin" })` 指定要不要用它。

它的回傳值決定接下來怎麼走：

- 什麼都不回傳：照常進入頁面。
- 回傳 `navigateTo("/login")`：不進去了，改去 `/login`。

這個 middleware 只檢查「有沒有 `admin_token` 這個 cookie」，沒有就送去登入頁。

和第 9 章 Vue Router 的導覽守衛很像。差別是在 Nuxt 裡，middleware 在兩個地方都會執行：直接在網址列打 `/admin` 時，它在伺服器上執行；在網站裡點連結換頁時，它在瀏覽器裡執行。

> 檔名加上 `.global`，例如 `app/middleware/log.global.ts`，就會在**每一次**換頁時執行，不用在頁面上指定。這一章用不到。

### 試試看

先打開 <http://localhost:3000/admin>，網址會馬上變成 `/login`，middleware 把你請出去了。

接著在登入頁隨便輸入一個暗號，例如「猜錯的暗號」，按登入。你進到管理頁了，也看得到刪除按鈕。

這就是為什麼一開始說「只是示範」：middleware 只能決定**要不要顯示這一頁**。它沒辦法知道暗號對不對，因為暗號要是寫在 `app/` 裡，就會被打包進送到瀏覽器的程式碼，任何人都看得到。

而且就算 middleware 寫得再嚴格，有人用 `curl` 直接呼叫刪除的 API，根本不會經過任何頁面，middleware 完全管不到。

### 真正的防線：API 裡的檢查

所以真正的檢查要放在 API 裡。把 `server/api/messages/[id].delete.ts` 改成：

```ts
// server/api/messages/[id].delete.ts
// 示範用的暗號，第 15 章會改放到環境變數
const adminToken = "demo-secret-token";

export default defineEventHandler(async (event) => {
  if (getCookie(event, "admin_token") !== adminToken) {
    throw createError({ status: 401, message: "需要管理者權限" });
  }

  const id = getRouterParam(event, "id");
  const messages = await getMessages();

  if (!messages.some((message) => message.id === id)) {
    throw createError({ status: 404, message: "找不到這則留言" });
  }

  await saveMessages(messages.filter((message) => message.id !== id));
  return { ok: true };
});
```

`getCookie(event, "admin_token")` 讀出這次請求帶來的 cookie。和暗號不一樣，就丟出 401，後面什麼都不做。**一開始就檢查身分，不通過就停下來。**

暗號寫在 `server/` 裡，這裡的程式碼只在伺服器上執行，不會被送到瀏覽器。不過直接寫在程式碼裡還是不好，第 15 章會教你把它改放到環境變數。

回到管理頁，按任何一則留言的「刪除」：紅字出現「需要管理者權限」，留言還在。

再用 `curl` 試試。先用 `curl localhost:3000/api/messages` 查一則留言的 `id`，接到網址最後面，不帶 cookie 送出刪除（下面的 `id` 換成你的）：

```bash
curl -X DELETE localhost:3000/api/messages/0c61e147-501c-4ca0-a6a2-a6edf42a7754
```

```text
{
  "error": true,
  "url": "http://localhost:3000/api/messages/0c61e147-…",
  "statusCode": 401,
  "statusMessage": "Server Error",
  "message": "需要管理者權限",
  "stack": [ ... ]
}
```

`curl` 用 `-b` 帶上 cookie。帶錯的暗號，一樣是 401；帶對的才刪得掉：

```bash
curl -X DELETE -b "admin_token=demo-secret-token" \
  localhost:3000/api/messages/0c61e147-501c-4ca0-a6a2-a6edf42a7754
```

```text
{
  "ok": true
}
```

最後回到 `/login`，輸入 `demo-secret-token` 登入，管理頁的刪除按鈕就能用了。

### 兩道檢查，各管各的

| | 在哪裡 | 管什麼 | 擋得住 `curl` 嗎 |
| --- | --- | --- | --- |
| route middleware | `app/middleware/` | 要不要讓你看到這一頁 | 不行 |
| API 裡的檢查 | `server/api/` | 要不要真的執行這個動作 | 可以 |

middleware 讓沒登入的人不會誤闖管理頁，是給使用者的方便；API 裡的檢查才是安全。和上一集的 `maxlength` 一樣：**前端的檢查是體貼，伺服器的檢查才是防線。**

## 重點整理

- route middleware 放在 `app/middleware/`，是換頁之前執行的函式，用 `definePageMeta({ middleware: "名字" })` 套用到頁面上。
- middleware 回傳 `navigateTo(...)` 就會改去別的頁面，什麼都不回傳就照常進入。
- `useCookie` 在頁面上讀寫 cookie，`getCookie` 在 API 裡讀 cookie。
- middleware 只能決定要不要顯示頁面，擋不住直接呼叫 API 的人。
- 需要權限的動作，一定要在 API 一開始就檢查，不通過就 `throw createError({ status: 401, ... })`。
