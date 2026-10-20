# `for...of`

## 本集目標

對陣列裡的每一個東西做同一件事。

## 正文

### 一個一個印太累了

有一個陣列，想把每個東西都印出來。目前你會的寫法是：

```js
const fruits = ["蘋果", "香蕉", "芭樂"];
console.log(fruits[0]);
console.log(fruits[1]);
console.log(fruits[2]);
```

三個還行，一百個呢？而且陣列裡有幾個東西，常常要程式跑起來才知道。

### `for...of`

**迴圈**（loop）就是「重複做某件事」。`for...of` 是專門用來走過陣列每一個東西的迴圈：

```js
const fruits = ["蘋果", "香蕉", "芭樂"];

for (const fruit of fruits) {
  console.log(fruit);
}
```

```text
蘋果
香蕉
芭樂
```

讀法是：「對 `fruits` 裡的每一個 `fruit`，做大括號裡的事」。

- `fruits` 是你要走過的陣列。
- `fruit` 是你取的名字，每一輪它會輪流變成陣列裡的下一個東西。第一輪是「蘋果」，第二輪是「香蕉」，以此類推。
- 大括號裡的程式碼會執行三次，因為陣列裡有三個東西。

`fruit` 用 `const` 宣告沒問題，因為每一輪都是一個全新的 `fruit`，不是同一個變數被改值。習慣上陣列用複數（`fruits`），每一個用單數（`fruit`），讀起來最順。

### 搭配其他東西

迴圈裡面可以放任何程式碼，包括 `if`：

```js
const scores = [90, 55, 72, 48];

for (const score of scores) {
  if (score >= 60) {
    console.log(`${score} 分：及格`);
  } else {
    console.log(`${score} 分：不及格`);
  }
}
```

```text
90 分：及格
55 分：不及格
72 分：及格
48 分：不及格
```

### 累加

很常見的用法是把所有數字加起來：

```js
const prices = [120, 80, 300];
let total = 0;

for (const price of prices) {
  total += price;
}

console.log(total);
```

```text
500
```

`total` 必須用 `let`，因為它在迴圈裡會一直被改。而且它要宣告在迴圈**外面**，不然每一輪都會從 0 重新開始。

### 看得懂就好的舊寫法

別人的程式碼裡常看到這種迴圈：

```js
const fruits = ["蘋果", "香蕉", "芭樂"];

for (let i = 0; i < fruits.length; i++) {
  console.log(fruits[i]);
}
```

它用索引 `i` 從 0 數到 `length - 1`，`i++` 是 `i += 1` 的縮寫。效果和 `for...of` 一樣，但要自己管索引，比較容易出錯。看得懂就好，自己寫時用 `for...of`。

到了第 2 章你會學到更常用的走訪方式，`for...of` 是它們的基礎。

## 重點整理

- `for (const item of array) { ... }` 會對陣列裡每一個東西執行一次大括號裡的程式碼。
- 每一輪 `item` 都是陣列裡的下一個東西。
- 要在迴圈裡累加的變數，用 `let` 宣告在迴圈外面。
- `for (let i = 0; ...)` 是舊寫法，看得懂就好。
