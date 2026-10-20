# 聯集型別

## 本集目標

用 `|` 表示「可能是這個，也可能是那個」，並學會在使用前縮小範圍。

## 正文

### 用 `|` 表示「或」

有時候一個值可能是好幾種型別之一。用 `|` 連接，叫**聯集型別**（union type）：

```ts
let id: string | number = 101;
id = "A-101";
console.log(id);
```

`string | number` 讀作「字串或數字」。兩種都可以放。

### 用之前要先確認是哪一種

麻煩來了：聯集型別的值，在確定是哪一種之前，只能用「兩種型別都有」的功能。建立 `src/practice/show.ts`：

```ts
function show(value: string | number) {
  return value.toFixed(2);
}
console.log(show(3));
```

```text
src/practice/show.ts:2:16 - error TS2339: Property 'toFixed' does not exist on type 'string | number'.
  Property 'toFixed' does not exist on type 'string'.

2   return value.toFixed(2);
                 ~~~~~~~


Found 1 error.
```

`toFixed` 是數字才有的方法，但 `value` 也可能是字串，所以被擋下。解法是先用 `typeof` 檢查（`typeof` 會回傳 `"number"`、`"string"` 這種描述型別的字串）：

```ts
function show(value: string | number) {
  if (typeof value === "number") {
    return value.toFixed(2);
  }
  return value.toUpperCase();
}

console.log(show(3));
console.log(show("abc"));
```

`if` 裡面，TypeScript 知道 `value` 一定是數字，所以可以用 `toFixed`；`if` 後面剩下的情況一定是字串，所以可以用 `toUpperCase`。這種「靠檢查把範圍縮小」的過程，叫**型別縮小**（narrowing）。

### 字面型別的聯集

第 4 集提過字面型別：某一個特定的值本身就是一個型別。把幾個字面型別用 `|` 串起來，就能表示「只能是這幾個值之一」：

```ts
type Status = "loading" | "success" | "error";

let status: Status = "loading";
status = "success";
console.log(status);
```

這很適合用在 Vue 的狀態上，例如資料抓取的進度、按鈕的種類、深色或淺色主題。寫成 `string` 的話，打錯字也不會被發現；寫成這種聯集，打錯字馬上有紅線。建立 `src/practice/status.ts`：

```ts
type Status = "loading" | "success" | "error";
let status: Status = "loading";
status = "done";
console.log(status);
```

```text
src/practice/status.ts:3:1 - error TS2322: Type '"done"' is not assignable to type 'Status'.

3 status = "done";
  ~~~~~~


Found 1 error.
```

而且輸入 `status = "` 的時候，編輯器會把三個選項列出來。

### `| null`：可能沒有值

第 1 章講過 `null` 和 `undefined`，以及最常見的錯誤 `Cannot read properties of null`。TypeScript 在這件事上幫了大忙：把「可能是 `null`」寫進型別裡，它就會盯著你。建立 `src/practice/greet.ts`：

```ts
type User = { name: string };

function greet(user: User | null) {
  return `你好，${user.name}`;
}
console.log(greet(null));
```

```text
src/practice/greet.ts:4:16 - error TS18047: 'user' is possibly 'null'.

4   return `你好，${user.name}`;
                 ~~~~


Found 1 error.
```

程式還沒跑，TypeScript 就指出「這裡可能會因為 `null` 而出錯」。處理方式是先檢查：

```ts
type User = { name: string };

function greet(user: User | null) {
  if (user === null) {
    return "請先登入";
  }
  return `你好，${user.name}`;
}

console.log(greet({ name: "小明" }));
console.log(greet(null));
```

或是用第 2 章學的 `?.` 和 `??`：

```ts
type User = { name: string };

function greet(user: User | null) {
  return `你好，${user?.name ?? "訪客"}`;
}

console.log(greet(null));
```

### `| undefined`：找不到、沒填、超出範圍

`undefined` 也一樣。你會在三個地方一直遇到它。

**選填屬性**。上一集的 `email?: string`，型別其實是 `string | undefined`：

```ts
type User = { name: string; email?: string };

function emailDomain(user: User) {
  return user.email?.split("@")[1];
}

console.log(emailDomain({ name: "小明" }));
```

拿掉 `?.`、直接寫 `user.email.split`，就會看到 `'user.email' is possibly 'undefined'.`。

**`find` 的結果**。第 2 章學過，`find` 找不到時回傳 `undefined`。建立 `src/practice/find.ts`：

```ts
type Product = { id: number; name: string };

const products: Product[] = [
  { id: 1, name: "鍵盤" },
  { id: 2, name: "滑鼠" },
];

const found = products.find((product) => product.id === 3);
console.log(found.name);
```

```text
src/practice/find.ts:9:13 - error TS18048: 'found' is possibly 'undefined'.

9 console.log(found.name);
              ~~~~~


Found 1 error.
```

TypeScript 逼你處理「找不到」的情況，改成 `found?.name` 或先用 `if (found)` 檢查就好。

**用索引取陣列**。create-vue 的設定比 TypeScript 預設更嚴格一點：用 `scores[0]` 取值時，它也當成可能是 `undefined`，因為索引可能超出範圍。建立 `src/practice/scores.ts`：

```ts
const scores = [90, 85, 77];
console.log(scores[0].toFixed(1));
```

```text
src/practice/scores.ts:2:13 - error TS2532: Object is possibly 'undefined'.

2 console.log(scores[0].toFixed(1));
              ~~~~~~~~~


Found 1 error.
```

一樣用 `scores[0]?.toFixed(1)` 處理。這是 `tsconfig.app.json` 裡 `noUncheckedIndexedAccess` 這個設定造成的，很多專案沒開這個設定，所以你可能會看到別人的程式碼直接寫 `scores[0].toFixed(1)` 也沒報錯，不用覺得奇怪。

## 重點整理

- `A | B` 是聯集型別，表示值可能是 A 或 B。
- 聯集型別的值要先用 `typeof`、`=== null` 等檢查縮小範圍，才能用特定型別的功能。
- 字面型別的聯集，例如 `"loading" | "success" | "error"`，限定值只能是幾個特定選項之一。
- 型別裡有 `| null` 或 `| undefined` 時，TypeScript 會逼你先處理沒有值的情況。
- 選填屬性、`find` 的結果、用索引取陣列，都可能是 `undefined`。
