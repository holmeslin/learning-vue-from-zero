# 其他陣列方法

## 本集目標

學會 `find`、`some`、`every`、`includes`、`reduce`，並且知道遇到什麼需求該用哪個。

## 正文

`map` 和 `filter` 之外，陣列還有幾個很常用的方法。這一集用同一份資料來示範：

```js
const products = [
  { id: 1, name: "鍵盤", price: 1200 },
  { id: 2, name: "滑鼠", price: 600 },
  { id: 3, name: "螢幕", price: 5000 },
];
```

### `find`：找到第一個符合的

`find` 和 `filter` 很像，但它只回傳**第一個**符合條件的東西本身，不是陣列：

```js
const products = [
  { id: 1, name: "鍵盤", price: 1200 },
  { id: 2, name: "滑鼠", price: 600 },
  { id: 3, name: "螢幕", price: 5000 },
];

const product = products.find((item) => item.id === 2);
console.log(product);

const missing = products.find((item) => item.id === 99);
console.log(missing);
```

```text
{ id: 2, name: '滑鼠', price: 600 }
undefined
```

找不到的時候回傳 `undefined`。所以用 `find` 的結果之前，要想到它可能是 `undefined`，第 1 章第 15 集學過的那個常見錯誤就是這樣來的。

### `some`：有沒有任何一個符合

```js
const prices = [1200, 600, 5000];

console.log(prices.some((price) => price > 3000));
console.log(prices.some((price) => price > 9000));
```

```text
true
false
```

`some` 回傳一個布林值：只要有一個東西讓 callback 回傳 `true`，結果就是 `true`。

### `every`：是不是每一個都符合

```js
const prices = [1200, 600, 5000];

console.log(prices.every((price) => price > 500));
console.log(prices.every((price) => price > 1000));
```

```text
true
false
```

`every` 要全部都 `true`，結果才是 `true`。

兩個空陣列的小冷知識：`[].some(...)` 一定是 `false`，`[].every(...)` 一定是 `true`。因為「沒有任何一個」符合，「沒有任何一個」不符合。

### `includes`：有沒有這個值

當你要找的是一個**確切的值**，而不是「符合某個條件」，用 `includes`：

```js
const fruits = ["蘋果", "香蕉", "芭樂"];

console.log(fruits.includes("香蕉"));
console.log(fruits.includes("西瓜"));
```

```text
true
false
```

它比的是 `===`，所以適合放數字、字串這種簡單的值。字串也有同名的 `includes`，用法在第 1 章第 7 集看過。

### `reduce`：把整個陣列濃縮成一個值

有時候你想把整個陣列「算成」一個東西，最典型的是加總：

```js
const prices = [1200, 600, 5000];

const total = prices.reduce((sum, price) => sum + price, 0);

console.log(total);
```

```text
6800
```

`reduce` 接收兩個東西：一個 callback，和一個**起始值**（這裡是 `0`）。callback 有兩個參數：

- `sum`：目前累積的結果，第一輪是起始值 `0`。
- `price`：目前走到的這個東西。

callback 回傳的值，會變成下一輪的 `sum`。一步一步看：

| 輪次 | `sum` | `price` | 回傳值 |
| --- | --- | --- | --- |
| 1 | 0 | 1200 | 1200 |
| 2 | 1200 | 600 | 1800 |
| 3 | 1800 | 5000 | 6800 |

最後一輪回傳的 6800，就是 `reduce` 的結果。

這和第 1 章用 `for...of` 加 `let total` 做的事一樣。`reduce` 較短，但也比較難讀。**看不懂 `reduce` 很正常**，不確定的時候，用 `for...of` 寫也完全沒問題。

物件陣列的加總：

```js
const cart = [
  { name: "鍵盤", price: 1200, quantity: 1 },
  { name: "滑鼠", price: 600, quantity: 2 },
];

const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

console.log(total);
```

```text
2400
```

### 該用哪一個？

| 想做的事 | 用這個 | 得到 |
| --- | --- | --- |
| 每個都轉換 | `map` | 新陣列 |
| 挑出符合的全部 | `filter` | 新陣列 |
| 找第一個符合的 | `find` | 一個東西或 `undefined` |
| 有沒有任何一個符合 | `some` | 布林值 |
| 是不是全部都符合 | `every` | 布林值 |
| 有沒有這個確切的值 | `includes` | 布林值 |
| 算成一個值 | `reduce` | 任何型別 |

## 重點整理

- `find` 回傳第一個符合的東西，找不到是 `undefined`。
- `some` 問「有沒有任何一個」，`every` 問「是不是全部」，兩者都回傳布林值。
- `includes` 判斷陣列裡有沒有某個確切的值。
- `reduce` 把陣列濃縮成一個值，需要給起始值；看不懂時用 `for...of` 代替也可以。
