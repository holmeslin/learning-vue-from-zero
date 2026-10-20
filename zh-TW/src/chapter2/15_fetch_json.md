# `fetch` 與 JSON

## 本集目標

學會 JSON 這種資料格式，以及用 `fetch` 向伺服器要資料。

## 正文

### JSON 是什麼

網頁和伺服器之間傳資料，需要一種雙方都看得懂的格式。最通用的叫 **JSON**（唸作「傑森」）。它長得很像 JavaScript 的物件：

```text
{"name": "小明", "age": 20, "hobbies": ["爬山", "看電影"]}
```

但有幾點不同：

- JSON 本質上是**一段文字**（字串），不是物件。
- 屬性名稱一定要用**雙引號**包起來。
- 不能有註解，也不能有最後多餘的逗號。
- 值只能是字串、數字、布林值、`null`、陣列、物件。

### 文字和物件互相轉換

JavaScript 內建 `JSON` 工具：

- `JSON.stringify(物件)`：把物件變成 JSON 文字。
- `JSON.parse(文字)`：把 JSON 文字變回物件。

```js
const user = { name: "小明", age: 20 };

const text = JSON.stringify(user);
console.log(text);
console.log(typeof text);

const back = JSON.parse(text);
console.log(back.name);
console.log(typeof back);
```

```text
{"name":"小明","age":20}
string
小明
object
```

`text` 是字串，所以你不能對它寫 `text.name`；要先 `JSON.parse` 才能當物件用。

### `fetch`：向伺服器要資料

`fetch` 是瀏覽器和 Node.js 都內建的工具，用來向某個網址要資料。它回傳一個 Promise，所以要搭配上一集的 `await`。

典型的寫法是這樣的：

```js,ignore
async function loadUsers() {
  const response = await fetch("https://example.com/api/users");
  const users = await response.json();
  console.log(users);
}
```

分兩步：

1. `await fetch(網址)` 等伺服器回應，得到 `response`（回應物件）。
2. `await response.json()` 讀取回應的內容，並且把 JSON 轉成物件。**這一步也要 `await`**，因為讀內容還要再花時間。

最常見的錯誤，就是把第二個 `await` 漏掉，或是忘了 `.json()`。

### 實際跑一次

為了不依賴外部網站，我們用一個特別的網址 `data:`，它把資料直接寫在網址裡。這只是為了讓範例可以離線執行；真實專案裡，這個位置是伺服器的網址。因為這段網址裡面有雙引號，外面改用單引號包起來，這是本書少數用單引號的地方：

```js
async function main() {
  const url = 'data:application/json,{"name":"小明","age":20}';

  const response = await fetch(url);
  const user = await response.json();

  console.log(user.name);
  console.log(response.ok);
}

main();
```

```text
小明
true
```

`response.ok` 是 `true` 表示伺服器回應成功。

### 檢查有沒有成功

`fetch` 有個令人意外的特性：就算伺服器回「找不到」或「出錯了」，`fetch` 本身**不會**丟出錯誤，只有網路真的斷掉才會。所以要自己檢查 `response.ok`：

```js,ignore
async function loadUsers() {
  const response = await fetch("https://example.com/api/users");

  if (!response.ok) {
    throw new Error(`伺服器回應失敗：${response.status}`);
  }

  return await response.json();
}
```

`response.status` 是狀態碼：200 是成功，404 是找不到，500 是伺服器內部錯誤。`throw new Error(...)` 的意思是「主動丟出一個錯誤」，呼叫它的人可以用上一集的 `try...catch` 接住。

### 完整的樣子

把這些放在一起，就是一個典型的抓資料函式：

```js
async function loadUser() {
  try {
    const response = await fetch('data:application/json,{"name":"小明"}');

    if (!response.ok) {
      throw new Error(`伺服器回應失敗：${response.status}`);
    }

    const user = await response.json();
    console.log(`抓到使用者：${user.name}`);
  } catch (error) {
    console.log(`抓資料失敗：${error.message}`);
  }
}

loadUser();
```

```text
抓到使用者：小明
```

這個「`fetch` → 檢查 `ok` → `json()` → 用 `try...catch` 包起來」的樣板，到第 6 章在 Vue 裡抓資料時，會一模一樣再用一次。

### 送資料給伺服器

`fetch` 也能送資料出去。第二個參數放設定：

```js,ignore
await fetch("https://example.com/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "小明" }),
});
```

- `method: "POST"` 表示「我要送資料」，不寫的話預設是 `GET`（要資料）。
- `headers` 告訴伺服器「我送的是 JSON」。
- `body` 是要送的內容，必須是字串，所以要用 `JSON.stringify`。

這本書的範例大多是「讀資料」，所以現在知道有這個寫法就夠了。

## 重點整理

- JSON 是一種文字格式，用 `JSON.stringify` 轉成文字、`JSON.parse` 轉回物件。
- `fetch(網址)` 回傳 Promise，得到回應後再用 `await response.json()` 取出資料，兩步都要 `await`。
- 伺服器回應失敗時 `fetch` 不會自己出錯，要檢查 `response.ok`。
- 抓資料的標準樣板：`try` 裡面 `fetch`、檢查 `ok`、`json()`，`catch` 處理失敗。
