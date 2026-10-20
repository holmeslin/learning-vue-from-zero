# 函式也是值

## 本集目標

理解函式可以像數字、字串一樣被存起來、傳來傳去，並且學會 callback。

## 正文

### 函式就是一種值

在 JavaScript 裡，函式和數字、字串、陣列一樣，是一種「值」。你可以把它存進變數，也可以放進陣列或物件裡：

```js
const shout = (text) => text + "！";

const actions = [shout, (text) => text + "……"];

console.log(actions[0]("哈囉"));
console.log(actions[1]("哈囉"));
```

```text
哈囉！
哈囉……
```

`actions` 是一個陣列，裡面放了兩個函式。`actions[0]` 是第一個函式，後面加上小括號 `("哈囉")` 就是呼叫它。

### 把函式傳給另一個函式

既然函式是值，就能當作**引數**傳給另一個函式：

```js
function repeat(times, action) {
  for (let i = 0; i < times; i++) {
    action();
  }
}

repeat(3, () => console.log("加油！"));
```

```text
加油！
加油！
加油！
```

`repeat` 接收兩個參數：次數，和一個函式 `action`。它不知道 `action` 要做什麼，只負責「照次數呼叫它」。做什麼事，由呼叫的人決定。

換一個動作，`repeat` 完全不用改：

```js
function repeat(times, action) {
  for (let i = 0; i < times; i++) {
    action();
  }
}

repeat(2, () => console.log("喝水"));
repeat(2, () => console.log("伸展"));
```

```text
喝水
喝水
伸展
伸展
```

### 這就是 callback

像 `action` 這種「被傳給別的函式、等著被呼叫」的函式，叫做 **callback**（回呼函式）。意思是「我先留給你，你需要的時候再叫我」。

callback 可以接收參數，由接收它的函式決定傳什麼進來：

```js
function repeat(times, action) {
  for (let i = 0; i < times; i++) {
    action(i);
  }
}

repeat(3, (n) => console.log(`第 ${n + 1} 次`));
```

```text
第 1 次
第 2 次
第 3 次
```

`repeat` 每次呼叫 `action` 時，把目前是第幾輪（`i`）傳進去，callback 用 `n` 接住。

### 為什麼這很重要

下一集開始的 `map`、`filter`，全都是「接收一個 callback 的函式」。Vue 裡也到處是 callback：

- 第 5 章的事件處理：告訴 Vue「按鈕被按下時，呼叫這個函式」。
- 第 6 章的 `watch`：告訴 Vue「這個值變了的時候，呼叫這個函式」。
- 第 6 章的 `onMounted`：告訴 Vue「元件出現在畫面上之後，呼叫這個函式」。

它們的共同點是：你先把函式交出去，什麼時候呼叫由 Vue 決定。

整個 JavaScript 的寫法，就是不停地把函式傳來傳去。現在把這個觀念弄熟，之後會輕鬆很多。

### 小心：傳函式 vs. 呼叫函式

```js
const sayHello = () => console.log("你好！");

function runLater(callback) {
  console.log("準備執行……");
  callback();
}

runLater(sayHello);
```

```text
準備執行……
你好！
```

注意是 `runLater(sayHello)`，不是 `runLater(sayHello())`。後者會在傳進去之前就先呼叫 `sayHello`，傳進去的會是它的回傳值（`undefined`），而不是函式本身。**要「傳」函式，名稱後面不要加小括號。**

之後在 Vue 裡寫 `onMounted(loadData)` 時也是一樣：傳的是 `loadData` 這個函式，Vue 會在適當的時機呼叫它。

## 重點整理

- 函式是一種值，可以存進變數、放進陣列或物件。
- 可以把函式當引數傳給另一個函式，這種被傳進去的函式叫 callback。
- 接收 callback 的函式決定什麼時候呼叫它、傳什麼進去。
- 傳函式時不加小括號，加了就變成呼叫。
