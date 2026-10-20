# 字串與樣板字面值

## 本集目標

處理文字資料：把文字接起來、把變數塞進文字裡、查文字的長度。

## 正文

### 什麼是字串

用引號包起來的文字叫**字串**（string）。雙引號和單引號都可以，但同一段要頭尾一致：

```js
const a = "雙引號";
const b = '單引號';
console.log(a);
console.log(b);
```

這本書統一用雙引號。

### 用 `+` 把字串接起來

`+` 用在字串上是「接起來」：

```js
const firstName = "小明";
const greeting = "你好，" + firstName + "！";
console.log(greeting);
```

```text
你好，小明！
```

### 樣板字面值：更好的接法

用 `+` 接很多段的時候又醜又容易漏空格。JavaScript 有更好的寫法，叫**樣板字面值**（template literal）：用反引號 `` ` `` 包起來，裡面用 `${}` 放變數。

```js
const firstName = "小明";
const age = 20;
console.log(`你好，${firstName}！你今年 ${age} 歲。`);
```

```text
你好，小明！你今年 20 歲。
```

反引號在鍵盤左上角、數字 1 左邊那個鍵，和波浪號 `~` 同一個鍵。

`${}` 裡面不只能放變數，任何會算出一個值的東西都可以：

```js
const price = 120;
const quantity = 3;
console.log(`總共 ${price * quantity} 元`);
```

```text
總共 360 元
```

樣板字面值還可以直接換行：

```js
const poem = `床前明月光，
疑是地上霜。`;
console.log(poem);
```

```text
床前明月光，
疑是地上霜。
```

寫 Vue 的時候，樣板字面值也會常常用到。

### 字串的長度與常用操作

字串後面加 `.length` 可以得到字數：

```js
const word = "JavaScript";
console.log(word.length);
```

```text
10
```

字串還有很多內建的操作，寫法都是「字串、點、名稱、小括號」：

```js
const word = "JavaScript";
console.log(word.toUpperCase());
console.log(word.toLowerCase());
console.log(word.includes("Script"));
```

```text
JAVASCRIPT
javascript
true
```

這種「點後面接名稱加小括號」的東西叫**方法**（method）。之後會常常用到，現在先知道怎麼用就好。

### 數字和字串相加的陷阱

```js
console.log(1 + 1);
console.log("1" + 1);
```

```text
2
11
```

第二行的 `"1"` 是字串，`+` 碰到字串就變成「接起來」，所以結果是 `"11"`。之後從網頁的輸入框拿到的東西都是字串，這個陷阱會常常遇到，第 5 章會教怎麼把字串變成數字。

## 重點整理

- 字串用引號包起來，這本書統一用雙引號。
- 樣板字面值用反引號，`${}` 裡可以放變數或運算。
- `.length` 是字串長度，`.toUpperCase()`、`.includes()` 是常用的方法。
- `+` 碰到字串就變成接字串，`"1" + 1` 是 `"11"`。
