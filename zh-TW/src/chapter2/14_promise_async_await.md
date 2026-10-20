# Promise 與 `async` / `await`

## 本集目標

理解「要等一段時間才有結果」的事情，在 JavaScript 裡是怎麼處理的。

## 正文

### 有些事情要等

到目前為止，程式都是一行接一行，上一行做完才做下一行。但現實中有些事情要等：向伺服器要資料、讀取檔案、等計時器。這些事情要花的時間不確定，如果程式傻傻站著等，整個網頁就會卡住。

所以 JavaScript 的做法是：**先交代「等好了要做什麼」，然後繼續往下跑，不要在那邊乾等。**

先用 `setTimeout` 感受一下。它的意思是「等一段時間之後，執行這個 callback」，時間單位是毫秒（1000 毫秒是 1 秒）：

```js
console.log("開始");

setTimeout(() => {
  console.log("1 秒後");
}, 1000);

console.log("結束");
```

```text
開始
結束
1 秒後
```

注意順序：「結束」比「1 秒後」先印出來。`setTimeout` 只是登記「1 秒後請呼叫這個 callback」，然後程式馬上繼續往下跑，沒有等。

### Promise：一張「等一下會有結果」的取貨單

用 callback 處理等待的事，一旦有好幾件事要依序做，就會層層疊疊很難讀。所以有了 **Promise**。

Promise 是一個物件，代表「一個**未來**才會有的結果」。你可以把它想成餐廳的取餐單：你先拿到單子，餐點還沒好，但保證好了會通知你，不是做好就是做砸。

Promise 有三種狀態：

- **等待中**（pending）：還沒好。
- **成功**（fulfilled）：好了，帶著結果。
- **失敗**（rejected）：出事了，帶著錯誤。

自己建立 Promise 的機會很少，更常見的是「某個函式回傳一個 Promise，你來處理它」。先寫一個會回傳 Promise 的小函式，模擬「等一下才會有資料」：

```js
function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

wait(500).then(() => {
  console.log("等了 0.5 秒");
});
```

```text
等了 0.5 秒
```

`.then(callback)` 的意思是「等這個 Promise 成功之後，呼叫這個 callback」。

這個 `wait` 的內部寫法，你現在不用懂，把它當成現成的工具就好。重點是怎麼**使用** Promise。

### `async` 與 `await`：讓等待看起來像一般程式

`.then` 還是有點繞。現代 JavaScript 提供了更自然的寫法：`async` 和 `await`。

```js
function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function main() {
  console.log("開始");
  await wait(500);
  console.log("等了 0.5 秒");
  await wait(500);
  console.log("又等了 0.5 秒");
}

main();
```

```text
開始
等了 0.5 秒
又等了 0.5 秒
```

- `async function`：宣告這是一個「裡面會等東西」的函式。
- `await 某個 Promise`：**在這個函式裡**，停在這一行，等 Promise 成功再往下。程式碼看起來就像一般的由上到下，但等待期間不會卡住整個程式。
- `await` 只能寫在 `async` 函式裡面。

### 拿到結果

Promise 成功時會帶一個結果，`await` 會把它取出來：

```js
function getUser() {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ name: "小明", age: 20 }), 300);
  });
}

async function main() {
  const user = await getUser();
  console.log(user.name);
}

main();
```

```text
小明
```

`await getUser()` 等 0.3 秒之後，得到 `{ name: "小明", age: 20 }`，存進 `user`。

### `async` 函式本身也回傳 Promise

這點要記得：`async` 函式永遠回傳 Promise，就算你只是 `return 42`。所以呼叫端要用 `await`（或 `.then`）才拿得到值：

```js
async function getNumber() {
  return 42;
}

async function main() {
  console.log(getNumber());
  console.log(await getNumber());
}

main();
```

```text
Promise { 42 }
42
```

忘了 `await`，你拿到的會是 `Promise { ... }` 這種奇怪的東西，而不是你要的值。這是新手最常見的錯誤之一。

### 錯誤處理：`try` / `catch`

等待的事情可能失敗。Promise 失敗時，`await` 那一行會丟出錯誤，用 `try...catch` 接住：

```js
function failAfter(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error("出事了")), ms);
  });
}

async function main() {
  try {
    await failAfter(300);
    console.log("成功");
  } catch (error) {
    console.log("失敗：" + error.message);
  }
}

main();
```

```text
失敗：出事了
```

`try` 裡面的程式碼如果出錯，就會跳到 `catch`，`error` 是錯誤物件，`error.message` 是錯誤訊息。沒有 `try...catch` 的話，錯誤會讓程式整個停下來。

### 同時等好幾件事

如果幾件事互不相干，不需要一件做完才做下一件。`Promise.all` 可以一起開始、一起等：

```js
function wait(ms, value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

async function main() {
  const [a, b] = await Promise.all([wait(300, "A"), wait(300, "B")]);
  console.log(a, b);
}

main();
```

```text
A B
```

兩個各要 0.3 秒，一起等，總共只要 0.3 秒，而不是 0.6 秒。`Promise.all` 回傳的結果陣列，順序和你放進去的順序一樣，這裡用了第 9 集學的陣列解構接住。

## 重點整理

- 要等一段時間的事，JavaScript 不會停下來等，而是先登記「好了再做」，程式繼續往下跑。
- Promise 代表「未來才會有的結果」，有等待中、成功、失敗三種狀態。
- `await` 只能用在 `async` 函式裡，會等 Promise 成功並取出結果。
- `async` 函式永遠回傳 Promise，忘了 `await` 就會拿到 `Promise { ... }`。
- 用 `try...catch` 處理失敗；互不相干的事用 `Promise.all` 一起等。
