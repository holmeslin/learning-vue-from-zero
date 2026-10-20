# 邏輯運算子

## 本集目標

把多個條件組合在一起：「而且」、「或者」、「不是」。

## 正文

### `&&`：而且

兩邊都是 `true`，結果才是 `true`：

```js
const age = 20;
const hasTicket = true;

if (age >= 18 && hasTicket) {
  console.log("可以入場");
}
```

```text
可以入場
```

`&&` 唸作 and。把 `hasTicket` 改成 `false`，就不會印了。

### `||`：或者

兩邊只要有一邊是 `true`，結果就是 `true`：

```js
const isMember = false;
const hasCoupon = true;

if (isMember || hasCoupon) {
  console.log("可以打折");
}
```

```text
可以打折
```

`||` 唸作 or，是兩個直線符號，鍵盤上在 Enter 鍵附近，通常要按 Shift。

### `!`：不是

把 `true` 變 `false`、`false` 變 `true`：

```js
const isLoggedIn = false;

if (!isLoggedIn) {
  console.log("請先登入");
}
```

```text
請先登入
```

`!isLoggedIn` 讀作「不是已登入」，也就是「沒登入」。

### 整理成表格

| 寫法 | 結果 |
| --- | --- |
| `true && true` | `true` |
| `true && false` | `false` |
| `false && false` | `false` |
| `true \|\| false` | `true` |
| `false \|\| false` | `false` |
| `!true` | `false` |
| `!false` | `true` |

### 組合起來

可以把好幾個組合在一起，用括號標清楚順序：

規則是：成年人、或是有家長陪同的人可以進場，但前提是要有票。

```js
const age = 15;
const hasParent = true;
const hasTicket = true;

if ((age >= 18 || hasParent) && hasTicket) {
  console.log("可以進入");
}
```

```text
可以進入
```

這裡的括號很重要。拿掉括號寫成 `age >= 18 || hasParent && hasTicket`，JavaScript 會先算 `&&`，意思就變成「成年人不用票也能進」。`&&` 和 `||` 混在一起時，一定要用括號標清楚你要的順序。

這種時候與其硬塞成一行，不如先把中間結果存成有意義的變數，讀起來清楚很多：

```js
const age = 15;
const hasParent = true;
const hasTicket = true;

const isAllowedAge = age >= 18 || hasParent;
const canEnter = isAllowedAge && hasTicket;

if (canEnter) {
  console.log("可以進入");
}
```

### 先預告一件事

到了 Vue，你會常常用「如果條件成立，就顯示這個東西」來控制畫面，條件裡也很常用 `&&`、`||`、`!` 把幾個條件組起來。第 4 章講到 `v-if` 時會再看到它們，現在先把基本意思記牢就好。

## 重點整理

- `&&` 是「而且」，兩邊都 `true` 才 `true`。
- `||` 是「或者」，一邊 `true` 就 `true`。
- `!` 是「不是」，把布林值反過來。
- 條件太長時，先把中間結果存成變數，再組合。
