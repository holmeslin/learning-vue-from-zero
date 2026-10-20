# `map`

## 本集目標

用 `map` 把一個陣列裡的每個東西轉換成另一個東西，得到一個新陣列。

## 正文

### 要做的事

有一個價格陣列，想得到每個價格加上 5% 稅之後的陣列。用第 1 章學過的方法，會這樣寫：

```js
const prices = [100, 200, 300];
const withTax = [];

for (const price of prices) {
  withTax.push(price * 1.05);
}

console.log(withTax);
```

```text
[ 105, 210, 315 ]
```

能用，但要先建一個空陣列，再一個一個 `push` 進去。這種「把每個東西轉換一下」的需求太常見了，所以陣列有一個內建的方法專門做這件事。

### `map`

```js
const prices = [100, 200, 300];
const withTax = prices.map((price) => price * 1.05);

console.log(withTax);
```

```text
[ 105, 210, 315 ]
```

`prices.map(...)` 的意思是：對 `prices` 裡的**每一個**東西，呼叫括號裡的 callback，把 callback **回傳的值**收集起來，組成一個**新的陣列**。

這裡 callback 是 `(price) => price * 1.05`：每一輪 `price` 會輪流是 100、200、300，回傳的值是 105、210、315，收集起來就是結果。

### 原本的陣列不會變

`map` 不會動到原本的陣列，它只是造一個新的：

```js
const numbers = [1, 2, 3];
const doubled = numbers.map((n) => n * 2);

console.log(numbers);
console.log(doubled);
```

```text
[ 1, 2, 3 ]
[ 2, 4, 6 ]
```

這個「不動原本的，造一個新的」性質要記住。第 11 集會談「改原本的」和「造一個新的」差在哪裡。

### 轉換成別的型別

新陣列裡的東西不一定要和原本同型別：

```js
const names = ["小明", "小華", "小美"];
const greetings = names.map((name) => `你好，${name}！`);

console.log(greetings);
```

```text
[ '你好，小明！', '你好，小華！', '你好，小美！' ]
```

### 處理物件陣列

第 1 章說過，「陣列裡放物件」是最常見的資料形狀。`map` 在這種資料上特別好用：

```js
const products = [
  { name: "鍵盤", price: 1200 },
  { name: "滑鼠", price: 600 },
];

const names = products.map((product) => product.name);
const labels = products.map((product) => `${product.name}：${product.price} 元`);

console.log(names);
console.log(labels);
```

```text
[ '鍵盤', '滑鼠' ]
[ '鍵盤：1200 元', '滑鼠：600 元' ]
```

### 在 Vue 裡的用途

第 4 章你會學到 Vue 的 `v-for`，它會走過一個陣列，把每一項畫成畫面上的一列。`v-for` 可以直接走訪原本的陣列，不一定要先 `map`。

如果資料的形狀和畫面要的不同，就輪到 `map` 上場。例如伺服器給你的是價格，畫面要顯示含稅價，就先用 `map` 算好，再交給 `v-for` 畫出來。這種「先整理資料、再畫畫面」的分工，之後會一直看到。

### 第二個參數：索引

callback 可以多接一個參數，是目前這個東西的索引：

```js
const fruits = ["蘋果", "香蕉", "芭樂"];
const numbered = fruits.map((fruit, index) => `${index + 1}. ${fruit}`);

console.log(numbered);
```

```text
[ '1. 蘋果', '2. 香蕉', '3. 芭樂' ]
```

### 別拿 `map` 當迴圈用

`map` 的用途是**得到一個新陣列**。如果你只是想「對每個東西做一件事」（例如印出來），不需要新陣列，用 `for...of` 就好：

```js
const fruits = ["蘋果", "香蕉"];

for (const fruit of fruits) {
  console.log(fruit);
}
```

```text
蘋果
香蕉
```

## 重點整理

- `陣列.map(callback)` 對每個東西呼叫 callback，把回傳的值收集成新陣列。
- 新陣列的長度和原陣列一樣，原陣列不會被改動。
- callback 的第二個參數是索引。
- 需要新陣列時用 `map`，只是要對每個東西做事時用 `for...of`。
