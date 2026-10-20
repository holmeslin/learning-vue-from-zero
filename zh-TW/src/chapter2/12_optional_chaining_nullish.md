# `?.` 與 `??`

## 本集目標

用 `?.` 安全地讀取可能不存在的屬性，用 `??` 在值是「沒有」的時候提供預設值。

## 正文

### 回顧那個常見的錯誤

第 1 章第 15 集你看過這個錯誤：

```js,ignore
const user = { name: "小明" };
console.log(user.address.city);
```

```text
TypeError: Cannot read properties of undefined (reading 'city')
```

`user.address` 是 `undefined`，再對它讀 `city` 就爆了。當時的解法是先用 `if` 檢查。現在有更短的寫法。

### `?.`：安全地往下讀

在點的前面加一個問號，變成 `?.`：

```js
const user = { name: "小明" };

console.log(user.address?.city);
```

```text
undefined
```

`?.` 的意思是：「如果左邊是 `undefined` 或 `null`，就別往下讀了，整個結果直接是 `undefined`；不然才繼續讀」。這個語法叫**可選串連**（optional chaining）。

有地址時照常運作：

```js
const user = { name: "小明", address: { city: "台北" } };

console.log(user.address?.city);
```

```text
台北
```

可以串很多層：

```js
const user = { name: "小明" };

console.log(user.profile?.address?.city);
```

```text
undefined
```

### 其他位置也能用

陣列的索引：

```js
const list = undefined;

console.log(list?.[0]);
```

```text
undefined
```

呼叫函式：

```js
const obj = {};

console.log(obj.sayHello?.());
```

```text
undefined
```

`obj.sayHello?.()` 的意思是「`sayHello` 如果存在才呼叫它」。

### `??`：只有「沒有」才用預設值

`??` 讀作「空值合併」（nullish coalescing）。左邊如果是 `null` 或 `undefined`，結果就是右邊；否則就是左邊：

```js
const nickname = undefined;

console.log(nickname ?? "沒有暱稱");
console.log("小明" ?? "沒有暱稱");
```

```text
沒有暱稱
小明
```

最常和 `?.` 一起用：

```js
const user = { name: "小明" };

const city = user.address?.city ?? "未填寫";

console.log(city);
```

```text
未填寫
```

讀法：「讀 `user.address.city`，如果沒有，就用 `"未填寫"`」。

### 為什麼不用 `||`

第 1 章學過 `||` 是「或者」。它也能拿來給預設值，但有個陷阱：

```js
const count = 0;

console.log(count || 10);
console.log(count ?? 10);
```

```text
10
0
```

`||` 會把 `0`、空字串 `""`、`false` 都當成「假」，所以 `0 || 10` 變成了 10。但很多時候 `0` 是個正常的值（購物車裡有 0 件，不代表沒有資料）。

`??` 只在 `null` 和 `undefined` 時才用預設值，`0`、`""`、`false` 都會被保留。

**要給預設值，用 `??`。**

### 假值表

剛才提到的「假」，在 JavaScript 裡有一份固定的名單。條件判斷（`if`、`&&`、`||`、三元運算子）遇到下面這些值，會把它們當成 `false`，叫做**假值**（falsy）：

| 假值 | |
| --- | --- |
| `false` | 布林值 false |
| `0` | 數字零 |
| `""` | 空字串 |
| `null` | 沒有 |
| `undefined` | 未定義 |
| `NaN` | 算不出數字時得到的值，很少主動碰到 |

其他所有值，包括空陣列 `[]` 和空物件 `{}`，都是真值（truthy）。

```js
console.log(Boolean(0));
console.log(Boolean(""));
console.log(Boolean("0"));
console.log(Boolean([]));
```

```text
false
false
true
true
```

`"0"` 是一個有一個字元的字串，所以是真值。`[]` 雖然空，但它是一個存在的陣列，也是真值。

## 重點整理

- `a?.b`：`a` 是 `null` 或 `undefined` 就整個得到 `undefined`，不會出錯。也能寫 `a?.[0]` 和 `a?.()`。
- `a ?? b`：`a` 是 `null` 或 `undefined` 才用 `b`。
- 給預設值用 `??`，不要用 `||`，因為 `||` 會誤判 `0` 和空字串。
- 假值有六個：`false`、`0`、`""`、`null`、`undefined`、`NaN`；其他都是真值，包括 `[]` 和 `{}`。
