# `createError` 回傳錯誤

## 本集目標

在 API 裡用 `createError` 回傳有意義的錯誤，並在頁面上接住它、顯示給使用者看。

## 正文

### 狀態碼

每個回應都帶一個三位數的**狀態碼**（status code），告訴對方結果如何。你已經看過 404 了。常見的有：

| 狀態碼 | 意思 |
| --- | --- |
| 200 | 成功 |
| 400 | 你送來的資料有問題（Bad Request） |
| 401 | 你沒有權限（Unauthorized） |
| 404 | 找不到 |
| 500 | 伺服器自己出錯了 |

開頭是 4 的，是「請求的人」的問題；開頭是 5 的，是伺服器的問題。

### 在伺服器丟出錯誤

第 12 章你在頁面上用過 `createError`。在 `server/` 裡也是用它，寫法幾乎一樣。

把 `server/api/messages/index.post.ts` 改成先檢查再存：

```ts
// server/api/messages/index.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body.name || !body.text) {
    throw createError({ status: 400, message: "名字和留言都要填" });
  }

  const message: Message = {
    id: crypto.randomUUID(),
    name: body.name,
    text: body.text,
    createdAt: new Date().toISOString(),
  };

  const messages = await getMessages();
  messages.push(message);
  await saveMessages(messages);
  return message;
});
```

`throw` 是「丟出錯誤」：執行到這一行，函式就停了，後面存檔的程式碼不會執行。Nuxt 接住這個錯誤，把它變成一個狀態碼 400 的回應。

`server/api/messages/[id].delete.ts` 也加上檢查，找不到這則留言就回 404：

```ts
// server/api/messages/[id].delete.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const messages = await getMessages();

  if (!messages.some((message) => message.id === id)) {
    throw createError({ status: 404, message: "找不到這則留言" });
  }

  await saveMessages(messages.filter((message) => message.id !== id));
  return { ok: true };
});
```

`some` 是第 2 章學過的陣列方法：只要有一個元素符合條件就回傳 `true`。

用 `curl` 試試看：

```bash
curl -X DELETE localhost:3000/api/messages/abc
```

```text
{
  "error": true,
  "url": "http://localhost:3000/api/messages/abc",
  "statusCode": 404,
  "statusMessage": "Server Error",
  "message": "找不到這則留言",
  "stack": [ ... ]
}
```

你的錯誤訊息放在 `message` 裡。你傳進去的是 `status`（第 12 章教過的名字），回應裡的欄位卻叫 `statusCode` 和 `statusMessage`，這是伺服器回傳錯誤的固定格式，兩邊指的是同一件事。`statusMessage` 那一欄寫著 `Server Error`，看起來有點怪，那只是你沒有指定 `statusText` 時填上的預設文字，可以不用理它。真正要給使用者看的是 `message`。

> 為什麼不把中文寫在 `statusText`？它會被放進回應最前面的狀態列，那裡只適合放很短的英文。如果你這樣寫，終端機也會印出提醒：較長的錯誤訊息請用 `message`。

### 為什麼不直接 `throw new Error`

你可能會想：丟一個普通的 `Error` 不行嗎？可以丟，但結果不一樣。假設某支 API 這樣寫：

```ts
throw new Error("資料庫密碼錯誤");
```

開發時（`npm run dev`），回應是：

```text
{
  "error": true,
  "url": "http://localhost:3000/api/oops",
  "statusCode": 500,
  "statusMessage": "Server Error",
  "message": "資料庫密碼錯誤",
  "stack": [ ... ]
}
```

但建置後正式執行時，同一個錯誤變成：

```text
{
  "error": true,
  "url": "http://localhost:3000/api/oops",
  "statusCode": 500,
  "statusMessage": "Server Error",
  "message": "Server Error"
}
```

正式環境把訊息藏起來了。這是保護你：普通的 `Error` 可能是程式出了意外，訊息裡也許有不該讓外人看到的東西，像上面的「資料庫密碼錯誤」。所以 Nuxt 一律回 500，只說「伺服器出錯了」。

`createError` 則是你**刻意**要告訴使用者的錯誤，所以 `message` 會照樣送出去，狀態碼也是你指定的。要給使用者看的錯誤，一定要用 `createError`。

### 在頁面上接住錯誤

`$fetch` 收到 4 開頭或 5 開頭的狀態碼時，會丟出錯誤。如果沒接住，按下按鈕就什麼反應都沒有，只有瀏覽器的開發者工具裡有一行紅字。

用第 2 章學過的 `try` / `catch` 接住它。把 `app/pages/index.vue` 的 `<script setup>` 改成：

```vue
<!-- app/pages/index.vue -->
<script setup lang="ts">
const { data: messages, error, refresh } = await useFetch("/api/messages");

const name = ref("");
const text = ref("");
const errorMessage = ref("");

function showError(err: unknown) {
  // $fetch 丟出的錯誤，伺服器回傳的 JSON 放在 data 裡
  const data = (err as { data?: { message?: string } }).data;
  errorMessage.value = data?.message ?? "發生錯誤，請稍後再試";
}

async function submit() {
  errorMessage.value = "";
  try {
    await $fetch("/api/messages", {
      method: "POST",
      body: { name: name.value, text: text.value },
    });
    text.value = "";
    await refresh();
  } catch (err) {
    showError(err);
  }
}

async function remove(id: string) {
  errorMessage.value = "";
  try {
    await $fetch(`/api/messages/${id}`, { method: "DELETE" });
  } catch (err) {
    showError(err);
  }
  await refresh();
}
</script>
```

`$fetch` 丟出的錯誤物件，有一個 `data` 屬性，裡面就是伺服器回傳的那份 JSON，所以 `data.message` 就是你在 `createError` 寫的訊息。

不過 `catch` 拿到的 `err`，TypeScript 只知道它是 `unknown`。第 10 章學過 `as`：這裡用 `as` 告訴 TypeScript「它有一個 `data`，裡面可能有 `message`」。萬一錯誤不是伺服器回的（例如網路斷了），`data` 會是 `undefined`，就用 `??` 換成一句通用的訊息。

`remove` 裡的 `refresh()` 放在 `try` / `catch` 外面：不管刪除成功或失敗，都重新抓一次列表。失敗通常代表這則留言已經被別人刪掉了，重新抓一次，畫面上的它也會消失。

模板裡，表單下面加一行顯示錯誤，列表那裡也處理讀取失敗的情況：

```vue
<!-- app/pages/index.vue -->
<template>
  <main>
    <h1>留言板</h1>

    <form @submit.prevent="submit">
      <input v-model="name" placeholder="你的名字" />
      <textarea v-model="text" placeholder="想說的話" />
      <button type="submit">送出</button>
    </form>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <p v-if="error">讀取留言失敗：{{ error.message }}</p>
    <ul v-else>
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

`useFetch` 不會丟出錯誤，而是把錯誤放進它回傳的 `error`，所以讀取列表失敗時，用 `v-if="error"` 顯示就好。

現在只填名字就按「送出」，表單下方會出現紅字「名字和留言都要填」，而且名字欄位還留著，不用重打。補上留言再送出，紅字消失，留言出現在列表上。

> 如果整個頁面都沒辦法顯示，例如網址裡的 `id` 找不到對應的資料，就用第 12 章的做法：在頁面裡 `throw createError(...)`，讓 Nuxt 顯示 `error.vue`。這一集的錯誤只影響一個按鈕，頁面其他部分還能用，所以在原地顯示訊息比較適合。

## 重點整理

- 狀態碼 4 開頭是請求的問題，5 開頭是伺服器的問題。
- 在 API 裡用 `throw createError({ status, message })` 回傳錯誤，訊息寫在 `message`。
- 普通的 `throw new Error` 在正式環境只會回「Server Error」；要給使用者看的錯誤要用 `createError`。
- `$fetch` 遇到錯誤會丟出來，用 `try` / `catch` 接住，伺服器的 JSON 在錯誤物件的 `data` 裡。
- `useFetch` 不丟錯誤，而是放在回傳的 `error` 裡。
