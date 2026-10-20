# 參數與回傳值

## 本集目標

讓函式接收資料，並且把算出來的結果交回給呼叫它的人。

## 正文

### 參數：讓函式能接收資料

上一集的 `sayHello` 每次都說一樣的話。想讓它對不同的人打招呼，就要讓它能「接收」名字。放在小括號裡的東西叫**參數**（parameter）：

```js
function sayHello(name) {
  console.log(`你好，${name}！歡迎回來。`);
}

sayHello("小明");
sayHello("小華");
sayHello("小美");
```

```text
你好，小明！歡迎回來。
你好，小華！歡迎回來。
你好，小美！歡迎回來。
```

`name` 就像函式裡的一個變數，每次呼叫時會被放進不同的值。呼叫時放在小括號裡的 `"小明"` 叫**引數**（argument）。平常大家兩個詞混著用，你不用刻意分，知道「參數是定義時的空位，引數是呼叫時放進去的值」就好。

參數可以有很多個，用逗號隔開，呼叫時照順序放：

```js
function introduce(name, age) {
  console.log(`我叫 ${name}，今年 ${age} 歲。`);
}

introduce("小明", 20);
```

```text
我叫 小明，今年 20 歲。
```

### 回傳值：把結果交出來

到目前為止，函式都只是「印出來」。但更常見的是，函式算出一個結果，交給呼叫的人去用。這靠 `return`：

```js
function add(a, b) {
  return a + b;
}

const result = add(3, 4);
console.log(result);
console.log(add(10, 20) * 2);
```

```text
7
60
```

`return` 的意思是「把這個值交出去，函式到此結束」。呼叫 `add(3, 4)` 這個運算式，整個會變成它回傳的值 `7`，所以可以存進變數，也可以直接拿去做別的運算。

「印出來」和「回傳」是兩件完全不同的事：

- `console.log` 只是把東西顯示在終端機上給人看，程式本身拿不到那個值。
- `return` 是把值交回給程式，之後想怎麼用都可以。

```js
function addAndPrint(a, b) {
  console.log(a + b);
}

const result = addAndPrint(3, 4);
console.log(result);
```

```text
7
undefined
```

`addAndPrint` 沒有 `return`，所以呼叫它得到的是 `undefined`。第一行的 `7` 是函式裡的 `console.log` 印的，第二行的 `undefined` 才是 `result` 的值。

### `return` 之後的程式碼不會執行

```js
function check(age) {
  if (age < 18) {
    return "未成年";
  }
  return "成年";
}

console.log(check(10));
console.log(check(30));
```

```text
未成年
成年
```

`age` 是 10 的時候，碰到第一個 `return` 就結束了，後面的 `return "成年"` 根本沒機會跑。這種「條件不符就提早結束」的寫法很常見，比 `if...else` 少一層縮排。

### 預設值

參數可以設定預設值，呼叫時沒給就用預設的：

```js
function greet(name = "朋友") {
  return `你好，${name}！`;
}

console.log(greet("小明"));
console.log(greet());
```

```text
你好，小明！
你好，朋友！
```

## 重點整理

- 參數寫在定義的小括號裡，呼叫時放進去的值叫引數。
- `return` 把值交回給呼叫的人，並且結束函式。
- `console.log` 是印出來給人看，`return` 才是把值交給程式；沒寫 `return` 的函式會得到 `undefined`。
- 參數可以用 `名稱 = 值` 設定預設值。
