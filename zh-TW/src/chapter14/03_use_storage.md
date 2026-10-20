# 用 `useStorage` 讀寫資料

## 本集目標

用 Nuxt 內建的 `useStorage` 把留言存起來，寫出留言板的三支 API：列出、新增、刪除。

## 正文

### 資料要存在哪裡

API 收到留言之後，得找個地方存。存在變數裡不行：伺服器一重新啟動，變數就清空了。正式的網站會用資料庫，但這一章先用 Nuxt 內建的儲存功能，它會把資料存成專案裡的檔案，什麼都不用安裝。

這個功能來自 Nitro。Nitro 是 Nuxt 負責伺服器那一半的引擎，`server/` 裡的程式都是它在執行，`defineEventHandler`、`readBody` 也都是它提供的。

### 共用的讀寫函式

列出、新增、刪除三支 API 都要讀寫留言，先把讀寫的部分寫成共用函式。新增 `server/utils/messages.ts`：

```ts
// server/utils/messages.ts
export type Message = {
  id: string;
  name: string;
  text: string;
  createdAt: string;
};

export async function getMessages() {
  const messages = await useStorage("data").getItem<Message[]>("messages");
  return messages ?? [];
}

export async function saveMessages(messages: Message[]) {
  await useStorage("data").setItem("messages", messages);
}
```

一行一行看：

- `useStorage("data")` 拿到一個叫 `data` 的儲存空間。Nitro 預設就準備好這個空間，資料會存進專案根目錄的 `.data/kv/` 資料夾。
- `getItem<Message[]>("messages")` 讀出名字叫 `messages` 的資料。尖括號裡的 `Message[]` 告訴 TypeScript 讀出來的東西長什麼樣子。
- 還沒有人存過的時候，`getItem` 會回傳 `null`，所以用 `?? []` 換成空陣列（第 2 章學過 `??`）。
- `setItem("messages", messages)` 把整個陣列存回去。陣列和物件會自動轉成 JSON，不用自己轉。

`getItem` 和 `setItem` 都要等，所以前面加 `await`。

`server/utils/` 是個特別的資料夾：放在這裡的函式和型別，`server/` 裡的其他檔案可以直接用，不用 `import`，和 `app/` 的自動匯入一樣。

### 三支 API

接下來在 `server/api/messages/` 資料夾裡寫三個檔案。檔名的 `index` 和 `app/pages/index.vue` 一樣，代表「資料夾本身」，所以前兩個的網址都是 `/api/messages`。

列出所有留言：

```ts
// server/api/messages/index.get.ts
export default defineEventHandler(() => {
  return getMessages();
});
```

`getMessages()` 回傳的是 Promise，直接回傳也沒關係，Nuxt 會等它完成再送出結果。

新增一則留言：

```ts
// server/api/messages/index.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event);

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

`crypto.randomUUID()` 會產生一串不會重複的亂碼，當作每則留言的 `id`，之後刪除時就靠它找到是哪一則。

刪除一則留言：

```ts
// server/api/messages/[id].delete.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const messages = await getMessages();
  await saveMessages(messages.filter((message) => message.id !== id));
  return { ok: true };
});
```

用 `filter` 留下 `id` 不一樣的，等於把那一則拿掉，再存回去。

三支 API 都是同一個模式：**讀出全部、改一改、存回去**。

### 試試看

先看看現在有什麼：

```bash
curl localhost:3000/api/messages
```

```text
[]
```

還沒有留言。新增一則：

```bash
curl -X POST localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{"name":"小明","text":"第一則留言"}'
```

```text
{
  "id": "000a85e6-9161-432f-9f92-533824bcbb23",
  "name": "小明",
  "text": "第一則留言",
  "createdAt": "2026-10-20T00:42:56.262Z"
}
```

你的 `id` 和時間會不一樣，這很正常。再列一次，就看得到它了。

現在打開專案根目錄，會多一個 `.data/kv/messages` 檔案，內容就是留言陣列的 JSON，全部擠在一行（下面把太長的部分用 `…` 省略）：

```text
[{"id":"000a85e6-…","name":"小明","text":"第一則留言","createdAt":"2026-…"}]
```

把 `npm run dev` 停掉（Ctrl+C）再重新啟動，留言還在，因為它存在檔案裡了。

刪除時，把網址最後換成剛剛拿到的 `id`：

```bash
curl -X DELETE localhost:3000/api/messages/000a85e6-9161-432f-9f92-533824bcbb23
```

```text
{
  "ok": true
}
```

再列一次，又變回 `[]`。

### 一個問題，先記著

試試看送一個空物件：

```bash
curl -X POST localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{}'
```

```text
{
  "id": "e247746c-d90d-4bbb-9b09-d709e4d548ca",
  "createdAt": "2026-10-20T00:43:02.891Z"
}
```

沒有名字、也沒有內容的留言，竟然存進去了。API 收到什麼就存什麼，完全沒有檢查。第 5、6 集會解決這個問題，現在先把這筆奇怪的留言用 `DELETE` 刪掉。

### `.data` 資料夾與部署

最後要知道 `.data/kv/` 這個位置是怎麼來的，它在不同情況下不太一樣：

- **`npm run dev` 的時候**：存在專案根目錄的 `.data/kv/`。
- **`npm run build` 建置之後，用 Node.js 啟動伺服器**（第 15 章會教）：存在「你在哪個資料夾下啟動指令」的 `.data/kv/`。在專案根目錄啟動，就和開發時是同一個地方；換個資料夾啟動，就會在那個資料夾另外長出一個新的、空的 `.data/kv/`。
- **部署到其他平台**：很多雲端平台的檔案系統沒辦法長期存放資料，`.data/` 可能放不了、或重新部署就消失。這時候要改用別的「driver」。

driver 決定資料實際存在哪裡。`useStorage` 的用法不變，只要在 `nuxt.config.ts` 換掉 `data` 這個空間的 driver，例如換成 Redis 資料庫：

```ts
// nuxt.config.ts（示意，現在不用照做）
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  nitro: {
    storage: {
      data: { driver: "redis", url: "redis://localhost:6379" },
    },
  },
});
```

換了 driver，`getMessages` 和三支 API 一行都不用改。這就是用 `useStorage` 而不是自己讀寫檔案的好處。

另外，`create nuxt` 產生的 `.gitignore` 已經包含 `.data`，所以這些資料不會被 git 記錄下來。

## 重點整理

- `useStorage("data")` 是 Nitro 內建的儲存空間，用 `getItem` 讀、`setItem` 寫，都要 `await`。
- 開發時資料存在專案根目錄的 `.data/kv/`，重新啟動也還在。
- `server/utils/` 裡的函式，`server/` 裡的其他檔案不用 `import` 就能用。
- 換部署環境時，在 `nuxt.config.ts` 的 `nitro.storage` 換 driver，程式碼不用改。
- 現在的 API 收到什麼就存什麼，還沒有任何檢查。
