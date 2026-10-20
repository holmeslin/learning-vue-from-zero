# 型別推論

## 本集目標

知道 TypeScript 什麼時候能自己看出型別，什麼時候需要你標。

## 正文

### 它自己看得出來

上一集每個變數都標了型別，但其實可以全部省掉：

```ts
const userName = "小明";
let city = "台北";
const scores = [90, 85, 77];
console.log(userName, city, scores);
```

TypeScript 看到 `"台北"` 就知道 `city` 是字串，看到 `[90, 85, 77]` 就知道 `scores` 是數字陣列。這就是**型別推論**。把滑鼠移到變數上，VS Code 會顯示它推出來的型別。

推論出來的型別，和你自己標的一樣有效。建立 `src/practice/infer.ts`：

```ts
const nums = [1, 2, 3];
nums.push("4");
console.log(nums);
```

```text
src/practice/infer.ts:2:11 - error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.

2 nums.push("4");
            ~~~


Found 1 error.
```

你沒有寫任何型別，推論出的 `number[]` 照樣擋住了字串。

### `const` 和 `let` 推論的結果不一樣

```ts
const userName = "小明";
let city = "台北";
console.log(userName, city);
```

把滑鼠移上去看：`userName` 的型別是 `"小明"`，`city` 的型別是 `string`。

為什麼？`const` 永遠不會變，所以 TypeScript 可以推得很精準：它就是 `"小明"` 這個字串，不是別的字串。這種「某個特定值」的型別叫**字面型別**（literal type）。`let` 之後可能被換成別的字串，所以只能推成 `string`。

字面型別第 6 集會派上用場。現在只要知道：推論出來的型別有時候比 `string` 更精準。

### 什麼時候一定要標

**函式的參數**。TypeScript 無法從函式的定義猜出參數是什麼。建立 `src/practice/double.ts`：

```ts
function double(n) {
  return n * 2;
}
console.log(double(4));
```

```text
src/practice/double.ts:1:17 - error TS7006: Parameter 'n' implicitly has an 'any' type.

1 function double(n) {
                  ~


Found 1 error.
```

意思是「參數 `n` 隱含 `any` 型別」，也就是它不知道 `n` 是什麼。補上型別就好：

```ts
function double(n: number) {
  return n * 2;
}

console.log(double(4));
```

注意這次**沒有標回傳型別**，TypeScript 看到 `n * 2`，自己就推出回傳的是 `number`。這是常見的做法：參數一定標，回傳型別大多數時候交給推論。

### 另一個要標的地方：空陣列

```ts
const empty: string[] = [];
empty.push("小明");
console.log(empty);
```

`[]` 裡面沒有東西，TypeScript 無從猜起，所以要自己說明這是字串陣列。這個狀況在 Vue 裡會一直遇到，因為 `ref([])` 的初始值常常就是空陣列，第 9 集會看到。

### 整理成一條原則

| 位置 | 要不要標 |
| --- | --- |
| 變數，初始值看得出型別 | 不用標 |
| 函式參數 | 一定要標 |
| 函式回傳型別 | 通常不用，推論就好 |
| 空陣列、`null` 等看不出型別的初始值 | 標 |

標太多會讓程式碼變得囉嗦，沒標又會讓 TypeScript 猜錯。抓一個平衡：**推論得出來的就不要標**。

## 重點整理

- TypeScript 會從初始值推論出變數的型別，推論出來的型別和手標的一樣有效。
- `const` 推論成精準的字面型別，`let` 推論成寬鬆的型別，例如 `string`。
- 函式的參數一定要標，不然會出現 `implicitly has an 'any' type` 的錯誤。
- 回傳型別通常交給推論；空陣列要自己標。
- 滑鼠移到變數上，就能看到 TypeScript 推出的型別。
