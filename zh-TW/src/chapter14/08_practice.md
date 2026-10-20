# 綜合練習：留言板

## 本集目標

確認留言板的列出、新增、刪除都正常運作，再自己加上「按讚」，把這一章的觀念組合起來。

## 正文

這一集分成兩個部分：先用清單驗收你的留言板，再挑戰一個新功能。請先自己寫，卡住了再看提示，最後再對照參考解答。

### 第一部分：驗收清單

先整理一下，你的專案現在應該有這些檔案：

```text
app/
  app.vue
  middleware/admin.ts
  pages/
    index.vue        留言板（列出、新增）
    login.vue        管理者登入
    admin.vue        管理頁（刪除）
server/
  utils/
    messages.ts      讀寫留言
    validate.ts      驗證留言
  api/messages/
    index.get.ts     列出
    index.post.ts    新增
    [id].delete.ts   刪除
```

（第 1、2 集的 `hello`、`time`、`echo`、`greet` 是練習用的，留著或刪掉都可以。）

對著你的留言板，一項一項試過去：

1. 在 `/` 填名字和留言送出，留言立刻出現在列表上；重新整理後還在。
2. 送出後，留言欄位清空，名字留著。
3. 只填名字或只填留言，表單下方出現紅字，剛剛填的內容沒有被清空。
4. 用 `curl` 送出名字是數字、只有空白、留言超過 200 字的資料，伺服器都回 400，`.data/kv/messages` 裡沒有多出東西。
5. 送出內容是 `<script>alert(1)</script>` 的留言，畫面上原封不動地顯示這串字。
6. 沒有 `admin_token` cookie 時打開 `/admin`，會被送到 `/login`。
7. 用錯的暗號登入，按刪除會出現「需要管理者權限」，留言還在。
8. 用 `curl` 不帶 cookie 呼叫刪除，回 401。
9. 用 `demo-secret-token` 登入後，可以刪除留言。
10. `npm run build` 可以成功。

如果有哪一項沒通過，回到對應的那一集檢查。

### 第二部分：挑戰：按讚

替每則留言加上「按讚」按鈕：

- 首頁每則留言旁邊有一個「讚 N」按鈕，N 是目前的讚數。
- 任何人都能按，按下去之後數字加一。
- 重新整理後，讚數還在。
- 舊的留言（`.data/kv/messages` 裡已經存在、沒有讚數的那些）要當成 0 個讚，不能出錯。
- 網址裡的 `id` 找不到這則留言時，伺服器回 404。

### 提示

- `Message` 型別要多一個 `likes: number`。舊資料沒有這個欄位，在 `getMessages` 讀出來的時候補成 0。
- 新增留言時，`likes` 從 0 開始。
- 你需要一支新的 API，例如 `server/api/messages/[id]/like.post.ts`，網址是 `/api/messages/某個id/like`。它找到這則留言，把 `likes` 加一，存回去。
- 首頁的按鈕用 `$fetch` 送出 `POST`，再 `refresh()`，和第 4 集的做法一樣。

### 參考解答

寫完再看。

<details>
<summary>展開參考解答</summary>

首先是 `server/utils/messages.ts`。`Message` 多了 `likes`，讀出來時補上預設值：

```ts
// server/utils/messages.ts
export type Message = {
  id: string;
  name: string;
  text: string;
  createdAt: string;
  likes: number;
};

export async function getMessages() {
  const messages = await useStorage("data").getItem<Message[]>("messages");
  // 舊留言沒有 likes 欄位，補成 0
  return (messages ?? []).map((message) => ({
    ...message,
    likes: message.likes ?? 0,
  }));
}

export async function saveMessages(messages: Message[]) {
  await useStorage("data").setItem("messages", messages);
}
```

`...message` 是第 2 章的展開語法：先複製原本所有的屬性，再用 `likes` 蓋過去。

`server/api/messages/index.post.ts` 建立留言的地方，多加一行 `likes: 0`：

```ts
  const message: Message = {
    id: crypto.randomUUID(),
    name,
    text,
    createdAt: new Date().toISOString(),
    likes: 0,
  };
```

新增 `server/api/messages/[id]/like.post.ts`：

```ts
// server/api/messages/[id]/like.post.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const messages = await getMessages();
  const message = messages.find((message) => message.id === id);

  if (!message) {
    throw createError({ statusCode: 404, message: "找不到這則留言" });
  }

  message.likes += 1;
  await saveMessages(messages);
  return { likes: message.likes };
});
```

資料夾名稱 `[id]` 也是路由參數，所以 `getRouterParam(event, "id")` 一樣拿得到。

`find` 找到的 `message` 是陣列裡那個物件本身（第 2 章「物件與陣列是參考」），所以直接改它的 `likes`，再存整個陣列就好。

最後是 `app/pages/index.vue`。在 `<script setup>` 裡加上 `like` 函式：

```ts
async function like(id: string) {
  errorMessage.value = "";
  try {
    await $fetch(`/api/messages/${id}/like`, { method: "POST" });
  } catch (err) {
    showError(err);
  }
  await refresh();
}
```

模板裡每則留言的 `<li>` 加上按鈕：

```vue,ignore
<li v-for="message in messages" :key="message.id">
  <strong>{{ message.name }}</strong>：{{ message.text }}
  <button type="button" @click="like(message.id)">
    讚 {{ message.likes }}
  </button>
</li>
```

完成後我實際試過：`.data/kv/messages` 裡先放一則沒有 `likes` 的舊留言，首頁顯示「讚 0」；用 `curl` 對它按兩次讚：

```bash
curl -X POST localhost:3000/api/messages/old-1/like
```

```text
{
  "likes": 1
}
```

第二次回傳 `"likes": 2`。對不存在的 `id` 按讚，回 404「找不到這則留言」。在首頁按新留言的讚，數字從 0 變成 1，重新整理後仍然是 1。

</details>

### 如果你想繼續挑戰

- 同一個人可以按無限多次讚，這不太合理。你能想到怎麼限制嗎？提示：伺服器得要「認得」是誰，想想這一章用過的 cookie。
- 兩個人在同一瞬間按讚，兩次請求都先讀到「2 個讚」，各自加一變成 3，再存回去，結果少算了一個。這是「讀出全部、改一改、存回去」的限制，真正的資料庫會替你處理這個問題。

## 重點整理

- 這一章的 API 有固定的流程：檢查權限、驗證輸入、讀資料、改資料、存回去、回傳結果。
- 頁面讀資料用 `useFetch`，改資料用 `$fetch`，改完呼叫 `refresh()`。
- 每支 API 都是公開的入口，收到的資料一個都不能信。
- 改資料的格式時，要記得舊資料怎麼辦，讀出來時補上預設值是最簡單的做法。
