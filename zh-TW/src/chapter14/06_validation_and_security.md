# 輸入驗證與安全

## 本集目標

知道 API 是對外公開的入口，學會在伺服器上檢查每一筆收到的資料，並避免把使用者的輸入當成 HTML 顯示。

## 正文

這一集是整章最重要的一集，請慢慢讀。

### API 是公開的

直覺上你會覺得：這支 API 只有我的表單會呼叫，表單怎麼設計，使用者就怎麼用。

這個想法是**錯的**。`/api/messages` 就是網路上的一個網址，任何人都可以不經過你的網頁，直接對它發請求。你這一章一直在用的 `curl` 就是最好的證明。你的表單，只是呼叫它的其中一種方式。

上一集的檢查只有 `if (!body.name || !body.text)`，來試試它擋得住什麼。

名字不是字串，而是數字：

```bash
curl -X POST localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{"name":123,"text":"嗨"}'
```

存進去了，名字是數字 `123`。

名字只有幾個空白：

```bash
curl -X POST localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{"name":"   ","text":"嗨"}'
```

也存進去了。`"   "` 不是空字串，所以 `!body.name` 是 `false`，檢查就放行了。

留言長達 5000 字也沒人攔，因為根本沒有檢查長度。

最後，什麼資料都不帶：

```bash
curl -X POST localhost:3000/api/messages
```

```text
{
  "error": true,
  "url": "http://localhost:3000/api/messages",
  "statusCode": 500,
  "statusMessage": "Server Error",
  "message": "Cannot read properties of undefined (reading 'name')",
  "stack": [ ... ]
}
```

沒有資料的時候，`readBody` 回傳 `undefined`，讀 `body.name` 就出錯了，變成伺服器自己的 500 錯誤。上一集說過，這種訊息只有開發時看得到，正式環境只會回「Server Error」。

試完記得把這幾筆奇怪的留言刪掉。

**所以每支 API 都要把收到的資料當成不可信的，在伺服器上自己檢查。永遠不要相信前端。**

### 寫一個驗證函式

新增 `server/utils/validate.ts`：

```ts
// server/utils/validate.ts
const maxNameLength = 20;
const maxTextLength = 200;

export function validateMessage(rawName: unknown, rawText: unknown) {
  const name = typeof rawName === "string" ? rawName.trim() : "";
  const text = typeof rawText === "string" ? rawText.trim() : "";

  if (name === "") {
    throw createError({ status: 400, message: "請輸入名字" });
  }
  if (name.length > maxNameLength) {
    throw createError({
      status: 400,
      message: `名字最多 ${maxNameLength} 個字`,
    });
  }
  if (text === "") {
    throw createError({ status: 400, message: "請輸入留言內容" });
  }
  if (text.length > maxTextLength) {
    throw createError({
      status: 400,
      message: `留言最多 ${maxTextLength} 個字`,
    });
  }

  return { name, text };
}
```

重點在前面幾行：

- 參數的型別是 `unknown`，意思是「我不知道它是什麼」，這正是實際的情況（第 10 章學過）。
- `typeof rawName === "string"` 先確認它**真的是字串**。是的話用 `trim()` 去掉頭尾的空白；不是的話（數字、`undefined`、陣列……）一律當成空字串。
- 接著檢查：去掉空白後是不是空的、有沒有超過長度上限。
- 都通過了，才回傳乾淨的 `name` 和 `text`。

任何一關不通過，就 `throw createError(...)`，函式直接停下來。它是在 API 裡呼叫的，所以丟出的錯誤會一路傳出去，變成 400 回應。

### 在 API 裡使用

把 `server/api/messages/index.post.ts` 改成：

```ts
// server/api/messages/index.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { name, text } = validateMessage(body?.name, body?.text);

  const message: Message = {
    id: crypto.randomUUID(),
    name,
    text,
    createdAt: new Date().toISOString(),
  };

  const messages = await getMessages();
  messages.push(message);
  await saveMessages(messages);
  return message;
});
```

`body?.name` 用了第 2 章的 `?.`：`body` 是 `undefined` 時不會出錯，直接得到 `undefined`，再交給 `validateMessage` 判斷。存檔用的是驗證過、去掉空白的 `name` 和 `text`，不是 `body` 裡的原始資料。

`validateMessage` 放在 `server/utils/`，所以不用 `import` 就能用。

### 再攻擊一次

把前面的 `curl` 再跑一遍。名字是數字，回應：

```text
{
  "error": true,
  "url": "http://localhost:3000/api/messages",
  "statusCode": 400,
  "statusMessage": "Server Error",
  "message": "請輸入名字",
  "stack": [ ... ]
}
```

名字只有空白、什麼都不帶，也都是 400「請輸入名字」。留言 201 個字：

```text
{
  "error": true,
  "url": "http://localhost:3000/api/messages",
  "statusCode": 400,
  "statusMessage": "Server Error",
  "message": "留言最多 200 個字",
  "stack": [ ... ]
}
```

連壞掉的 JSON 都擋得住：

```bash
curl -X POST localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{"name":"小明","text":'
```

```text
{
  "error": true,
  "url": "http://localhost:3000/api/messages",
  "statusCode": 400,
  "statusMessage": "Bad Request",
  "message": "Invalid JSON body",
  "stack": [ ... ]
}
```

這個是 `readBody` 自己丟的，JSON 格式不對它就直接回 400。

最後，前後有空白的正常留言：

```bash
curl -X POST localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{"name":"  小明  ","text":"  哈囉  "}'
```

存進去的是 `"小明"` 和 `"哈囉"`，空白被去掉了。

### 前端也加上限制

頁面的欄位也可以加上 HTML 的 `maxlength`，正常使用者打到上限就打不下去了，不用等送出才看到錯誤。把 `app/pages/index.vue` 的兩個欄位改成：

```vue,ignore
<input v-model="name" placeholder="你的名字" maxlength="20" />
<textarea v-model="text" placeholder="想說的話" maxlength="200" />
```

但要記得，這只是**給使用者的方便**。剛剛的 `curl` 根本不經過這個表單，`maxlength` 擋不住它。

**前端的檢查是給使用者的體貼，伺服器的檢查才是真正的防線。兩個都要有。**

> 這裡的驗證是手寫的 `if`。欄位一多，實務上常用 h3 提供的 `readValidatedBody` 搭配 zod 這類驗證函式庫，用一份「規格」描述資料該長什麼樣子，讀資料和驗證一次完成。原理和這一集完全一樣：在伺服器上檢查。留言板只有兩個欄位，就不多裝一個套件了。

### 顯示時：不要用 `v-html`

驗證管的是「收進來的資料」，還有一件事要注意：**顯示**使用者寫的內容。

你可能聽過 XSS（跨網站指令碼攻擊）：有人在留言裡寫一段 HTML 或 JavaScript，結果別人的瀏覽器執行了它。

試著送出一則內容是 `<script>alert(1)</script>` 的留言。這段文字可以通過驗證（它是字串，也沒超過 200 字），但留言板上看到的是：

```text
小明：<script>alert(1)</script>
```

這串字原封不動地顯示出來，什麼都沒有執行。因為 Vue 的 `{{ }}` 一律把內容當成**文字**，`<`、`>` 這些符號會換成另一種寫法：畫面上看起來一樣，但瀏覽器不會把它當成 HTML 標籤，這叫**跳脫**（escape）。

會出問題的是 `v-html`。它的作用正好相反：把字串當成 HTML 放進頁面。如果你這樣顯示留言：

```vue,ignore
<li v-for="message in messages" :key="message.id" v-html="message.text" />
```

有人留言 `<img src=x onerror="document.title=1234">`，每個打開這一頁的人，瀏覽器都會執行 `onerror` 裡的程式。實際試過，分頁的標題真的變成了 1234。這裡只是改標題，換成壞人寫的程式，就可能偷走使用者的資料。

所以規則很簡單：**使用者輸入的內容，一律用 `{{ }}` 顯示，不要用 `v-html`。**

## 重點整理

- API 是公開的網址，任何人都能不經過你的網頁直接呼叫。
- 收到的資料先當成 `unknown`：確認型別、`trim()` 去空白、檢查是不是空的、檢查長度上限，通過了才使用。
- 驗證失敗就 `throw createError({ status: 400, ... })`。
- 前端的 `maxlength` 只是給使用者的提示，伺服器一定要再檢查一次。
- Vue 的 `{{ }}` 會自動跳脫 HTML；使用者的輸入不要用 `v-html` 顯示。
