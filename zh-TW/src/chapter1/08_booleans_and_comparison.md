# 布林值與比較

## 本集目標

認識「對」和「錯」這種資料，並且用比較運算子算出它們。

## 正文

### 只有兩種值的資料

**布林值**（boolean）只有兩個可能：`true`（真）和 `false`（假）。它不加引號，`"true"` 是字串，`true` 才是布林值。

```js
const isLoggedIn = true;
const isAdmin = false;
console.log(isLoggedIn);
console.log(isAdmin);
```

```text
true
false
```

布林值的變數習慣用 `is`、`has`、`can` 開頭，讀起來像一個問句：「是否登入了？」

### 比較會得到布林值

比較兩個東西，結果就是布林值：

```js
const age = 20;
console.log(age >= 18);
console.log(age < 18);
```

```text
true
false
```

全部的比較運算子：

| 運算子 | 意思 |
| --- | --- |
| `===` | 相等 |
| `!==` | 不相等 |
| `>` | 大於 |
| `<` | 小於 |
| `>=` | 大於等於 |
| `<=` | 小於等於 |

比較的結果可以存進變數：

```js
const age = 20;
const isAdult = age >= 18;
console.log(isAdult);
```

### 相等要用三個等號

注意相等是 `===`，三個等號。一個等號 `=` 是「把右邊放進左邊的變數」，意思完全不同。

```js
const answer = 42;
console.log(answer === 42);
console.log(answer === 43);
console.log(answer !== 43);
```

```text
true
false
true
```

字串也能比較：

```js
const color = "red";
console.log(color === "red");
console.log(color === "Red");
```

```text
true
false
```

大小寫不同就是不相等。

### 為什麼不是兩個等號

JavaScript 也有 `==`，但它會在比較前偷偷轉換型別：

```js
console.log("1" == 1);
console.log("1" === 1);
```

```text
true
false
```

`"1" == 1` 竟然是 `true`，因為 `==` 把字串 `"1"` 轉成數字再比。這種「貼心」是 bug 的溫床。**永遠用 `===` 和 `!==`**，看到 `==` 就當它不存在。

### 用 `typeof` 看型別

到目前為止你認識了三種資料：數字、字串、布林值。這些叫做資料的**型別**（type）。`typeof` 可以告訴你一個值是什麼型別：

```js
console.log(typeof 42);
console.log(typeof "哈囉");
console.log(typeof true);
```

```text
number
string
boolean
```

搞不清楚一個變數裡裝的是數字還是字串時，`typeof` 很好用。

## 重點整理

- 布林值只有 `true` 和 `false`，不加引號。
- 比較運算子 `===`、`!==`、`>`、`<`、`>=`、`<=` 的結果是布林值。
- 相等用三個等號 `===`，不要用 `==`。
- `typeof` 可以查一個值的型別。
