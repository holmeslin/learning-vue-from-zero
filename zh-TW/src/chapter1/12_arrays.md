# 陣列基礎

## 本集目標

把一串資料放在同一個變數裡，並且能拿出其中一個、加入新的、查有幾個。

## 正文

### 一個變數放很多東西

目前為止，一個變數只放一個值。但很多時候資料是一串的：購物車裡的商品、班上的同學、待辦清單。這種時候用**陣列**（array）：

```js
const fruits = ["蘋果", "香蕉", "芭樂"];
console.log(fruits);
```

```text
[ '蘋果', '香蕉', '芭樂' ]
```

陣列用中括號 `[]` 包起來，裡面的東西用逗號隔開。印出來的時候，Node.js 會用單引號顯示字串，這只是顯示方式，不用在意。

### 用索引拿出其中一個

陣列裡的每個東西都有一個編號，叫**索引**（index）。**從 0 開始數**，不是 1。

```js
const fruits = ["蘋果", "香蕉", "芭樂"];
console.log(fruits[0]);
console.log(fruits[1]);
console.log(fruits[2]);
```

```text
蘋果
香蕉
芭樂
```

從 0 開始是幾乎所有程式語言的慣例，剛開始會不習慣，多寫幾次就好了。

### 有幾個？

和字串一樣，`.length` 告訴你陣列裡有幾個東西：

```js
const fruits = ["蘋果", "香蕉", "芭樂"];
console.log(fruits.length);
```

```text
3
```

因為索引從 0 開始，最後一個的索引永遠是 `length - 1`：

```js
const fruits = ["蘋果", "香蕉", "芭樂"];
console.log(fruits[fruits.length - 1]);
```

```text
芭樂
```

### 加入新的

`.push()` 把東西加到最後面：

```js
const fruits = ["蘋果", "香蕉"];
fruits.push("芭樂");
console.log(fruits);
console.log(fruits.length);
```

```text
[ '蘋果', '香蕉', '芭樂' ]
3
```

### 等等，`const` 不是不能改嗎？

你可能注意到了：`fruits` 是 `const`，但 `push` 之後它變了。這不矛盾。`const` 保證的是「這個變數指向的是同一個陣列」，不是「陣列裡的內容不變」。

用盒子比喻：`const` 鎖的是標籤，標籤永遠貼在同一個盒子上；但盒子是開著的，你可以往裡面放東西或拿東西。

真的不能做的是換一個盒子：

```js,ignore
const fruits = ["蘋果", "香蕉"];
fruits = ["西瓜"]; // TypeError: Assignment to constant variable.
```

### 換掉其中一個

用索引也可以改值：

```js
const fruits = ["蘋果", "香蕉", "芭樂"];
fruits[1] = "葡萄";
console.log(fruits);
```

```text
[ '蘋果', '葡萄', '芭樂' ]
```

先預告一下：到了 Vue，像這樣直接改陣列，畫面就會自動跟著更新，第 5 章會講它是怎麼做到的。現在先把基本操作學會。

### 陣列裡可以放任何東西

數字、布林值都可以放，甚至可以混著放，不過一般不會這麼做：

```js
const scores = [90, 85, 77];
console.log(scores[0] + scores[1] + scores[2]);
```

```text
252
```

## 重點整理

- 陣列用 `[]` 把一串資料裝在一起，逗號隔開。
- 用索引取值，索引從 0 開始，`fruits[0]` 是第一個。
- `.length` 是有幾個，最後一個的索引是 `length - 1`。
- `.push()` 加到最後面；`fruits[1] = ...` 換掉其中一個。
- `const` 陣列的內容可以改，只是不能整個換掉。
