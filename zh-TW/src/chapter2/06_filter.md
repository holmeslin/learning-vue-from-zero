# `filter`

## 本集目標

用 `filter` 從陣列裡挑出符合條件的東西，得到一個新陣列。

## 正文

### 挑出需要的

有一串分數，想挑出及格的：

```js
const scores = [90, 55, 72, 48, 85];
const passed = [];

for (const score of scores) {
  if (score >= 60) {
    passed.push(score);
  }
}

console.log(passed);
```

```text
[ 90, 72, 85 ]
```

和 `map` 一樣，這種寫法可以改成一行。

### `filter`

```js
const scores = [90, 55, 72, 48, 85];
const passed = scores.filter((score) => score >= 60);

console.log(passed);
```

```text
[ 90, 72, 85 ]
```

`filter` 對每個東西呼叫 callback，callback 要回傳 `true` 或 `false`：回傳 `true` 的東西會被留下，`false` 的丟掉。留下來的組成一個新陣列，原陣列不變。

`(score) => score >= 60` 就是一個「回傳布林值」的函式，這種回傳布林值、用來判斷要不要留下的函式叫 predicate，中文常叫**判斷函式**。

### 結果可以比原本短，甚至是空的

```js
const scores = [10, 20, 30];
const passed = scores.filter((score) => score >= 60);

console.log(passed);
console.log(passed.length);
```

```text
[]
0
```

沒有任何一個符合，得到的就是空陣列，不是 `undefined`，也不會出錯。

### 處理物件陣列

```js
const products = [
  { name: "鍵盤", price: 1200, inStock: true },
  { name: "滑鼠", price: 600, inStock: false },
  { name: "螢幕", price: 5000, inStock: true },
];

const available = products.filter((product) => product.inStock);
const cheap = products.filter((product) => product.price < 2000);

console.log(available.map((product) => product.name));
console.log(cheap.map((product) => product.name));
```

```text
[ '鍵盤', '螢幕' ]
[ '鍵盤', '滑鼠' ]
```

`product.inStock` 本身就是布林值，所以 callback 直接回傳它就行，不用寫 `=== true`。

### 串在一起

`filter` 回傳的是陣列，所以後面可以直接再接 `map`。這叫**串接**（chaining）：

```js
const products = [
  { name: "鍵盤", price: 1200, inStock: true },
  { name: "滑鼠", price: 600, inStock: false },
  { name: "螢幕", price: 5000, inStock: true },
];

const labels = products
  .filter((product) => product.inStock)
  .map((product) => `${product.name}：${product.price} 元`);

console.log(labels);
```

```text
[ '鍵盤：1200 元', '螢幕：5000 元' ]
```

讀法是由上往下：「從 `products` 裡，挑出有庫存的，再把每個轉成一段文字」。先篩選、再轉換，是處理資料最典型的順序。

### 用 `filter` 刪除東西

要「刪除清單中的某一項」，做法就是「留下不是那一項的所有東西」：

```js
const todos = [
  { id: 1, text: "洗衣服" },
  { id: 2, text: "寫程式" },
  { id: 3, text: "買晚餐" },
];

const afterDelete = todos.filter((todo) => todo.id !== 2);

console.log(afterDelete);
```

```text
[ { id: 1, text: '洗衣服' }, { id: 3, text: '買晚餐' } ]
```

## 重點整理

- `陣列.filter(callback)` 留下 callback 回傳 `true` 的東西，得到新陣列。
- 沒有任何東西符合時，得到的是空陣列 `[]`。
- `filter` 和 `map` 都回傳陣列，所以可以串接，通常先 `filter` 再 `map`。
- 「刪除某一項」的做法是 `filter` 掉它。
