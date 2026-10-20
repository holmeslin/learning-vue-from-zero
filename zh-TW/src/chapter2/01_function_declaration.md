# 函式宣告

## 本集目標

把一段程式碼包成函式，取個名字，需要的時候呼叫它。

## 正文

### 重複的程式碼

假設你要在好幾個地方打招呼：

```js
console.log("你好，小明！歡迎回來。");
console.log("你好，小華！歡迎回來。");
console.log("你好，小美！歡迎回來。");
```

```text
你好，小明！歡迎回來。
你好，小華！歡迎回來。
你好，小美！歡迎回來。
```

三行幾乎一樣，只有名字不同。如果哪天想把「歡迎回來」改成「好久不見」，你得改三個地方。

### 把它包起來

**函式**（function）就是「一段取了名字的程式碼」。先看最簡單的版本，不帶任何變化：

```js
function sayHello() {
  console.log("你好！歡迎回來。");
}

sayHello();
sayHello();
```

```text
你好！歡迎回來。
你好！歡迎回來。
```

拆開來看：

- `function` 是關鍵字，表示「我要定義一個函式」。
- `sayHello` 是函式的名字，命名規則和變數一樣，習慣用 camelCase，而且通常用動詞開頭。
- `()` 是小括號，現在先留空，下一集會用到。
- 大括號 `{}` 裡面是函式的內容，也就是呼叫它時要執行的程式碼。

**定義函式不會執行它。** 程式跑到 `function sayHello() {...}` 的時候，只是記下「有這麼一個函式」。要等到 `sayHello()` 這一行，大括號裡的程式碼才會真的跑。

名字後面加小括號，就是**呼叫**（call）函式。沒有小括號，就只是在講函式本身，不會執行：

```js
function sayHello() {
  console.log("你好！");
}

console.log(typeof sayHello);
sayHello;
sayHello();
```

```text
function
你好！
```

第三行 `sayHello;` 什麼事也沒發生，因為沒有加小括號。這個差別很重要，要記牢。

### 函式裡的變數出不來

函式裡面宣告的變數，只有函式裡面看得到：

```js,ignore
function makeSecret() {
  const secret = 42;
  console.log(secret);
}

makeSecret();
console.log(secret);
```

```text
42
ReferenceError: secret is not defined
```

`secret` 只活在 `makeSecret` 裡面，函式一結束就消失了。這個「變數看得到的範圍」叫**作用域**（scope）。

反過來，函式可以讀到外面的變數：

```js
const greeting = "你好";

function sayHello() {
  console.log(`${greeting}！歡迎回來。`);
}

sayHello();
```

```text
你好！歡迎回來。
```

### 函式可以先用再定義

JavaScript 有個特別的規則：用 `function` 宣告的函式，可以寫在呼叫它的程式碼後面：

```js
sayHello();

function sayHello() {
  console.log("你好！");
}
```

```text
你好！
```

這能跑，是因為 JavaScript 會先掃過整個檔案，把函式宣告都記下來，才開始一行一行執行。這個特性稱為**提升**（hoisting）。你不需要刻意利用它，但看到別人這樣寫時，不要覺得奇怪。

## 重點整理

- 函式是一段取了名字的程式碼，用 `function 名稱() { ... }` 定義。
- 定義不會執行，名稱後面加小括號 `名稱()` 才是呼叫。
- 函式裡宣告的變數只能在函式裡使用，但函式可以讀外面的變數。
- 用 `function` 宣告的函式可以寫在呼叫它的程式碼後面。
