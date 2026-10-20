# 基本型別

## 本集目標

幫變數和函式參數標上 `string`、`number`、`boolean` 等基本型別。

## 正文

### 型別標註

在變數名稱後面加冒號和型別，就是**型別標註**（type annotation）：

```ts
const userName: string = "小明";
const age: number = 20;
const isStudent: boolean = true;
console.log(userName, age, isStudent);
```

`string`、`number`、`boolean` 對應第 1 章學的三種基本資料：字串、數字、布林值。**注意全部是小寫**。

標了型別之後，放錯東西就會被擋下。建立 `src/practice/wrong.ts`：

```ts
let age: number = 20;
age = "二十";
console.log(age);
```

執行 `npm run type-check`：

```text
src/practice/wrong.ts:2:1 - error TS2322: Type 'string' is not assignable to type 'number'.

2 age = "二十";
  ~~~


Found 1 error.
```

意思是「字串不能放進數字型別的變數」。`is not assignable to` 是最常見的一句錯誤訊息，讀作「不能指定給」，意思就是「型別對不上」。

### 陣列

陣列的型別是「裡面東西的型別」加上 `[]`：

```ts
const scores: number[] = [90, 85, 77];
const names: string[] = ["小明", "小華"];
console.log(scores, names);
```

`number[]` 讀作「數字陣列」。把字串放進 `scores`，一樣會被擋下來。

### 函式的參數與回傳值

型別標註最重要的位置是函式的**參數**：

```ts
function total(price: number, quantity: number): number {
  return price * quantity;
}

console.log(total(120, 3));
```

- `price: number`、`quantity: number`：兩個參數都必須是數字。
- 小括號後面的 `: number`：函式**回傳**的東西是數字。

呼叫時傳錯型別會被擋下。建立 `src/practice/total.ts`：

```ts
function total(price: number, quantity: number): number {
  return price * quantity;
}

console.log(total("120", 3));
```

```text
src/practice/total.ts:5:19 - error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.

5 console.log(total("120", 3));
                    ~~~~~


Found 1 error.
```

意思是「引數是字串，但參數要的是數字」。在純 JavaScript 裡，`"120" * 3` 剛好會算出 360，這個錯誤就被悄悄吞掉了；但換成 `+` 就會變成接字串 `"1203"`。有了 TypeScript，你不必靠運氣。

### 沒有回傳值：`void`

函式什麼都不回傳時，回傳型別是 `void`：

```ts
function logTotal(price: number, quantity: number): void {
  console.log(`總共 ${price * quantity} 元`);
}

logTotal(120, 3);
```

### 箭頭函式也一樣

```ts
const double = (n: number): number => n * 2;
console.log(double(4));
```

### 其他你會遇到的基本型別

| 型別 | 意思 |
| --- | --- |
| `null` | 第 1 章的 `null` |
| `undefined` | 第 1 章的 `undefined` |
| `any` | 什麼都可以，等於關掉檢查 |
| `unknown` | 什麼都可以放進來，但用之前一定要先檢查 |

`any` 看起來很方便，但它會讓 TypeScript 對那個值完全放棄檢查，錯誤又會悄悄跑回來。**能不用就不用**。

### 不需要全部都標

你可能覺得每個變數都要標型別很累。好消息是：不用。下一集會說明，大部分的變數 TypeScript 自己看得出來，你只需要標在「它看不出來」的地方，主要就是函式的參數。

## 重點整理

- 型別標註的寫法是 `名稱: 型別`，基本型別是 `string`、`number`、`boolean`，全部小寫。
- 陣列型別寫成 `number[]`、`string[]`。
- 函式的參數要標型別，回傳型別寫在小括號後面；沒有回傳值用 `void`。
- 型別對不上時，錯誤訊息常會出現 `is not assignable to`。
- 不要用 `any`。
