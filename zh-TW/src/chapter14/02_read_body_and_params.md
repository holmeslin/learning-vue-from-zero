# `readBody` 與路由參數

## 本集目標

讓 API 收到瀏覽器送來的資料：用 `readBody` 讀請求內容，用 `getRouterParam` 讀網址裡的參數。

## 正文

### 請求有不同的「方法」

瀏覽器跟伺服器要東西的時候，每個請求都會帶一個**方法**（method），說明它想做什麼。最常用的有三種：

| 方法 | 意思 | 例子 |
| --- | --- | --- |
| `GET` | 我要拿資料 | 打開網頁、讀留言列表 |
| `POST` | 我要送資料過去 | 送出一則新留言 |
| `DELETE` | 我要刪掉某個東西 | 刪除一則留言 |

你在瀏覽器網址列打網址，送出的一律是 `GET`。上一集的 `hello.ts` 沒有指定方法，所以什麼方法都接受。

### 檔名指定方法：`.post.ts`

新增 `server/api/echo.post.ts`。檔名中間的 `.post` 表示「這支 API 只接受 `POST`」：

```ts
// server/api/echo.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return { youSent: body };
});
```

這次 `defineEventHandler` 裡的函式多了一個參數 `event`，它代表「這一次的請求」，請求的內容、網址、cookie 都可以從它拿到。

`readBody(event)` 會讀出請求帶來的資料。讀資料需要一點時間，所以它回傳 Promise，要加 `await`，外面的函式也因此要加 `async`（第 2 章學過）。

這支 API 會把收到的東西原封不動地送回去，所以叫 echo（回聲）。

### 用 `curl` 送出 `POST`

瀏覽器網址列沒辦法送 `POST`，用 `curl`：

```bash
curl -X POST localhost:3000/api/echo \
  -H "Content-Type: application/json" \
  -d '{"name":"小明","age":20}'
```

一行太長，所以用 `\` 換行，三行其實是同一個指令。拆開來看：

- `-X POST`：用 `POST` 方法。
- `-H "Content-Type: application/json"`：告訴伺服器「我送的是 JSON」。
- `-d '...'`：要送出的資料（d 是 data）。

```text
{
  "youSent": {
    "name": "小明",
    "age": 20
  }
}
```

伺服器收到了，而且 `readBody` 已經幫你把 JSON 轉回物件。

如果用 `GET` 去要這支 API 會怎樣？在瀏覽器打開 <http://localhost:3000/api/echo>：

```text
{
  "error": true,
  "url": "http://localhost:3000/api/echo",
  "statusCode": 404,
  "statusMessage": "Page not found: /api/echo",
  "message": "Page not found: /api/echo",
  "data": {
    "path": "/api/echo"
  },
  "stack": [ ... ]
}
```

`statusCode` 是 404，意思是「找不到」。對 `GET` 來說，這個網址不存在。（開發模式下還會多一個 `stack` 欄位，列出出錯的位置，內容很長，書上用 `...` 省略。）

檔名可以用的方法還有 `.get.ts`、`.delete.ts` 等等。同一個網址的不同方法，可以寫在不同檔案：例如 `messages.get.ts` 負責列出留言，`messages.post.ts` 負責新增留言，兩個的網址都是 `/api/messages`。下一集就會這樣做。

### 路由參數：`[name]`

在 `app/pages/` 裡，你用過 `[id].vue` 這種方括號檔名來做動態路由。`server/api/` 也一樣。新增 `server/api/greet/[name].get.ts`：

```ts
// server/api/greet/[name].get.ts
export default defineEventHandler((event) => {
  const name = getRouterParam(event, "name");
  return { greeting: `你好，${name}！` };
});
```

`getRouterParam(event, "name")` 會拿到網址裡 `[name]` 那個位置的值。試試看：

```bash
curl localhost:3000/api/greet/小明
```

```text
{
  "greeting": "你好，小明！"
}
```

把網址換成 `/api/greet/小華`，回應就變成「你好，小華！」。

`getRouterParam` 回傳值的型別是 `string | undefined`。網址裡的東西一定是字串，就算網址是 `/api/greet/123`，拿到的也是字串 `"123"`，不是數字。

## 重點整理

- 請求有方法：`GET` 拿資料、`POST` 送資料、`DELETE` 刪資料。
- 檔名加上 `.get`、`.post`、`.delete`，這支 API 就只接受那個方法。
- `defineEventHandler` 的函式參數 `event` 代表這次的請求。
- `await readBody(event)` 讀出請求帶來的資料，JSON 會自動轉成物件。
- 檔名用 `[name]` 做路由參數，用 `getRouterParam(event, "name")` 讀出來，拿到的一定是字串。
