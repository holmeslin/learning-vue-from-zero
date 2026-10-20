# 箭頭函式

## 本集目標

學會另一種更短的函式寫法，現代 JavaScript 的程式碼幾乎都用它。

## 正文

### 同一個函式，兩種寫法

上一集的 `add`：

```js
function add(a, b) {
  return a + b;
}

console.log(add(3, 4));
```

```text
7
```

可以改寫成**箭頭函式**（arrow function）：

```js
const add = (a, b) => {
  return a + b;
};

console.log(add(3, 4));
```

```text
7
```

差別在於：不用 `function` 這個字，改成「參數 `=>` 大括號」，然後把整個函式存進一個 `const` 變數裡。`=>` 看起來像箭頭，所以叫箭頭函式。

### 更短：省略 `return`

如果函式只有一行，而且就是要回傳那一行的結果，可以把大括號和 `return` 都拿掉：

```js
const add = (a, b) => a + b;

console.log(add(3, 4));
```

```text
7
```

`=>` 右邊的東西會自動被回傳。這就是為什麼箭頭函式可以寫得這麼短。

### 只有一個參數時

只有一個參數時，小括號也可以省略：

```js
const double = (n) => n * 2;
const triple = n => n * 3;

console.log(double(5));
console.log(triple(5));
```

```text
10
15
```

兩種都合法。這本書統一**保留小括號**，一致比較好讀，Prettier 之類的格式化工具預設也是這樣。

沒有參數時，小括號一定要寫：

```js
const sayHello = () => console.log("你好！");

sayHello();
```

```text
你好！
```

### 回傳物件要加括號

如果要用簡短寫法回傳一個物件，要把物件用小括號包起來：

```js
const makeUser = (name) => ({ name: name, age: 20 });

console.log(makeUser("小明"));
```

```text
{ name: '小明', age: 20 }
```

少了外面那層小括號，JavaScript 會把 `{` 當成函式內容的開頭，而不是物件，結果就錯了。

### 兩種寫法怎麼選

這本書的習慣是：

- **頂層的、有名字的函式**用 `function` 宣告，例如 `function add(a, b) { ... }`。
- **短小的、臨時用一下的函式**用箭頭函式，下一集你會看到大量這種例子。

兩者還有一些細微的差別（例如 `this` 的行為），但目前用不到，可以放心先忽略。

## 重點整理

- 箭頭函式的寫法是 `(參數) => { ... }`，通常存進 `const` 變數。
- 函式內容只有一個運算式時，可以省略大括號和 `return`。
- 回傳物件的簡短寫法要把物件用小括號包起來。
- 臨時用的短函式用箭頭函式，頂層有名字的函式用 `function`。
