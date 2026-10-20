# 陣列解構

## 本集目標

用一行把陣列裡的東西依序拆成變數。

## 正文

### 依照位置拆

物件解構是依照**名稱**拆，陣列解構則是依照**位置**拆，用中括號：

```js
const colors = ["紅", "綠", "藍"];

const [first, second, third] = colors;

console.log(first, second, third);
```

```text
紅 綠 藍
```

`first` 對應第 0 個，`second` 對應第 1 個，以此類推。變數的名字可以隨便取，因為陣列的東西沒有名字，只有順序。

和 `const first = colors[0]` 比起來，一行就拿到好幾個，而且讀起來更直接。

### 只拿前面幾個

後面的東西不想要，就不寫：

```js
const colors = ["紅", "綠", "藍"];

const [first, second] = colors;

console.log(first, second);
```

```text
紅 綠
```

### 跳過中間的

想跳過某一個，留一個空位（只放逗號）：

```js
const colors = ["紅", "綠", "藍"];

const [first, , third] = colors;

console.log(first, third);
```

```text
紅 藍
```

### 預設值

位置上沒東西的時候，用預設值：

```js
const colors = ["紅"];

const [first, second = "預設色"] = colors;

console.log(first, second);
```

```text
紅 預設色
```

### 交換兩個變數的值

陣列解構有個漂亮的用法：不需要暫存變數，就能交換兩個變數：

```js
let a = 1;
let b = 2;

[a, b] = [b, a];

console.log(a, b);
```

```text
2 1
```

### 在 Vue 裡的用途

陣列解構在 Vue 裡沒有物件解構那麼常見，但有幾個地方會碰到。例如第 6 章的 `watch` 可以同時監聽好幾個值，這時 callback 收到的是一個陣列，通常直接解構：

```js,ignore
watch([firstName, lastName], ([newFirst, newLast]) => {
  console.log(newFirst, newLast);
});
```

現在你不需要懂 `watch`，只要看得出 `([newFirst, newLast]) => ...` 是「參數位置的陣列解構」就好。第 14 集的 `Promise.all` 也會用到陣列解構。

### 函式回傳多個值

你也可以讓自己的函式回傳陣列，呼叫端用解構接：

```js
function minMax(numbers) {
  return [Math.min(...numbers), Math.max(...numbers)];
}

const [min, max] = minMax([3, 1, 4, 1, 5]);

console.log(min, max);
```

```text
1 5
```

`Math.min(...numbers)` 裡的三個點是**展開語法**，下一集就會教。

## 重點整理

- `const [a, b] = array` 依照位置把陣列的東西拆成變數，名字可以自己取。
- 不想要的後面不寫，要跳過中間的就留空位。
- 可以設預設值，也可以用 `[a, b] = [b, a]` 交換變數。
- 函式回傳陣列時，呼叫端常用陣列解構把結果接住。
