# `null` 與 `undefined`

## 本集目標

認識 JavaScript 裡表示「沒有東西」的兩個值，並且看懂它們造成的最常見錯誤。

## 正文

### `undefined`：還沒有值

宣告了變數但沒給值，或是讀取物件裡不存在的屬性，得到的是 `undefined`：

```js
let name;
console.log(name);

const user = { age: 20 };
console.log(user.email);
```

```text
undefined
undefined
```

`undefined` 的意思是「這裡沒有被設定過任何東西」。它通常不是你主動放的，而是 JavaScript 在「找不到」的時候給你的。

### `null`：刻意放的「沒有」

`null` 則是你主動放進去的「沒有」，用來表示「這裡本來可以有東西，但現在沒有」：

```js
const user = {
  name: "小明",
  nickname: null,
};

console.log(user.nickname);
```

```text
null
```

這個使用者「有」暱稱這個欄位，只是目前是空的。這和 `undefined` 的「根本沒這個欄位」意思不一樣。

兩者的分工大致是：`undefined` 是 JavaScript 給的，`null` 是你給的。實務上這條線沒有那麼絕對，但知道這個分別就夠了。

### 怎麼檢查

用 `===` 比較：

```js
const user = {
  name: "小明",
  nickname: null,
};

if (user.nickname === null) {
  console.log("沒有暱稱");
}

if (user.email === undefined) {
  console.log("沒有信箱欄位");
}
```

```text
沒有暱稱
沒有信箱欄位
```

### 最常見的錯誤

接下來這個錯誤，你寫 JavaScript 的每一年都會遇到：

```js,ignore
const user = { name: "小明" };
console.log(user.address.city);
```

```text
TypeError: Cannot read properties of undefined (reading 'city')
```

發生了什麼事：`user.address` 不存在，所以是 `undefined`。接著程式試著從 `undefined` 裡面讀 `city`，但 `undefined` 裡面什麼都沒有，於是當場出錯。

錯誤訊息的讀法是：「無法從 `undefined` 讀取屬性，當時正在讀 `city`」。看到這個訊息，就往前找：是誰在 `.city` 前面？那個東西為什麼會是 `undefined`？

對 `null` 做同樣的事，錯誤訊息會是 `Cannot read properties of null`。

### 先檢查再使用

避免的方法就是先確認東西存在：

```js
const user = { name: "小明" };

if (user.address !== undefined) {
  console.log(user.address.city);
} else {
  console.log("沒有地址");
}
```

```text
沒有地址
```

第 2 章會教一個更簡潔的寫法 `?.`，專門處理這種情況。

## 重點整理

- `undefined` 是「沒有被設定過」，通常是 JavaScript 在找不到時給你的。
- `null` 是你主動放的「目前沒有」。
- 用 `=== null` 或 `=== undefined` 檢查。
- `Cannot read properties of undefined` 的意思是：你對一個 `undefined` 的東西用了點。往前找是誰變成 `undefined`。
