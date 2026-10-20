# 綜合練習

## 本集目標

把這一章學到的東西組合起來，寫出一個小程式。

## 正文

這一集沒有新東西，只有一個題目。請先自己寫，卡住再看提示，最後再對照參考解答。**自己寫得出來，才算真的學會。**

### 題目：購物車結帳

建立 `cart.js`，裡面有這個購物車：

```js
const cart = [
  { name: "鍵盤", price: 1200, quantity: 1 },
  { name: "滑鼠", price: 600, quantity: 2 },
  { name: "滑鼠墊", price: 250, quantity: 3 },
];
```

請完成下面的事：

1. 印出每一項商品，格式是「商品名稱 × 數量 = 小計 元」，小計是單價乘以數量。
2. 算出全部商品的總金額並印出。
3. 總金額滿 3000 元打九折。印出有沒有打折，以及最後要付的金額。
4. 找出單價最高的商品，印出它的名稱。

預期的輸出：

```text
鍵盤 × 1 = 1200 元
滑鼠 × 2 = 1200 元
滑鼠墊 × 3 = 750 元
總金額：3150 元
滿 3000 元，打九折
應付金額：2835 元
最貴的商品：鍵盤
```

### 提示

- 第 1 和第 2 題用一個 `for...of` 就能一起做：迴圈裡印小計，同時把小計加進一個 `let total`。
- 第 3 題用 `if` 和 `else`。九折是乘以 0.9。
- 第 4 題需要兩個 `let` 變數：目前找到的最高單價，和那個商品的名稱。走訪的時候，碰到單價比目前最高還高的，就把兩個變數都更新。最高單價一開始可以設成 0。

### 參考解答

寫完再看。

<details>
<summary>展開參考解答</summary>

```js
const cart = [
  { name: "鍵盤", price: 1200, quantity: 1 },
  { name: "滑鼠", price: 600, quantity: 2 },
  { name: "滑鼠墊", price: 250, quantity: 3 },
];

let total = 0;
let highestPrice = 0;
let mostExpensiveName = "";

for (const item of cart) {
  const subtotal = item.price * item.quantity;
  console.log(`${item.name} × ${item.quantity} = ${subtotal} 元`);
  total += subtotal;

  if (item.price > highestPrice) {
    highestPrice = item.price;
    mostExpensiveName = item.name;
  }
}

console.log(`總金額：${total} 元`);

let finalAmount = total;
if (total >= 3000) {
  console.log("滿 3000 元，打九折");
  finalAmount = total * 0.9;
} else {
  console.log("未滿 3000 元，不打折");
}

console.log(`應付金額：${finalAmount} 元`);
console.log(`最貴的商品：${mostExpensiveName}`);
```

幾個值得注意的地方：

- 四件事都在同一個迴圈裡完成，不需要走訪四次。
- `finalAmount` 先設成 `total`，只有打折時才改，這樣 `else` 那邊就不用再指定一次。
- 用 `const` 宣告 `subtotal`，因為它在每一輪裡都不會變；`total`、`highestPrice`、`mostExpensiveName` 會一直被改，所以用 `let`。

</details>

### 延伸挑戰

想多練一點的話，試試看：

- 把購物車裡每一項的數量加總，印出「共 6 件商品」。
- 如果購物車是空的（`const cart = []`），程式應該印出「購物車是空的」，而不是印出總金額 0 元。

## 重點整理

- 這一章學的東西，組合起來已經可以處理真實的資料了。
- 一個迴圈裡可以同時做好幾件事。
- 會變的用 `let`，不會變的用 `const`，這個習慣從現在開始養成。
