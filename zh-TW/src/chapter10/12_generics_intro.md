# 泛型入門

## 本集目標

看懂 `ref<Todo[]>` 裡那對角括號是什麼意思，並能寫出最簡單的泛型函式。

## 正文

### 你已經用過泛型了

這一章到現在，角括號出現過好幾次：

- `defineProps<{ name: string }>()`
- `ref<Todo[]>([])`
- `useTemplateRef<HTMLInputElement>("name-input")`
- `InjectionKey<Ref<Theme>>`

還有一個你可能沒注意到的：

```ts
const names: Array<string> = ["小明", "小華"];
console.log(names);
```

`Array<string>` 和 `string[]` 是同一件事，都是「字串陣列」。這種角括號 `<>` 的語法叫**泛型**（generics）。

### 泛型是「型別的參數」

函式有參數：呼叫時傳不同的值進去，函式就做不同的事。泛型是**型別的參數**：使用時傳不同的型別進去，得到不同的結果。

`Array<string>` 是「裝字串的陣列」，`Array<number>` 是「裝數字的陣列」，同一套陣列的功能，適用於各種型別的東西。`ref` 也一樣：`ref<number>` 裝數字，`ref<Todo[]>` 裝 `Todo` 陣列。Vue 不用為每一種型別各寫一個 `ref`，型別由使用的人決定。

### 寫一個泛型函式

假設要寫一個「取出陣列第一個東西」的函式。如果寫死型別，只能服務一種陣列：

```ts
function firstNumber(items: number[]): number | undefined {
  return items[0];
}

console.log(firstNumber([1, 2, 3]));
```

要支援字串陣列，又得再寫一個。有了泛型，一個函式就夠了：

```ts
function first<T>(items: T[]): T | undefined {
  return items[0];
}

const firstName = first(["小明", "小華"]);
const firstScore = first([90, 80]);
console.log(firstName, firstScore);
```

- `function first<T>`：宣告這個函式有一個型別參數，叫 `T`。名字可以隨便取，習慣用大寫字母 `T`（type 的第一個字母）。
- `items: T[]`：參數是「`T` 的陣列」。
- `: T | undefined`：回傳的東西是 `T`；空陣列時是 `undefined`。第 6 集說過，用索引取陣列可能拿到 `undefined`，所以這裡不能只寫 `T`。

呼叫的時候不用特別寫 `<>`，TypeScript 會從你傳進去的陣列推論 `T`：傳字串陣列，`T` 就是 `string`，`firstName` 的型別就是 `string | undefined`；傳數字陣列，`firstScore` 就是 `number | undefined`。

因為型別是對的，之後的檢查也就是對的。建立 `src/practice/first.ts`：

```ts
function first<T>(items: T[]): T | undefined {
  return items[0];
}

const firstName = first(["小明"]);
console.log(firstName.length);
```

```text
src/practice/first.ts:6:13 - error TS18048: 'firstName' is possibly 'undefined'.

6 console.log(firstName.length);
              ~~~~~~~~~


Found 1 error.
```

TypeScript 知道 `first` 可能回傳 `undefined`，所以不讓你直接用 `.length`。改成 `firstName?.length` 就好。

### 自己定義的泛型型別

`type` 也可以有型別參數。常見的例子是「抓資料的結果」：

```ts
type ApiResult<T> = {
  data: T | null;
  error: string | null;
};

const result: ApiResult<string[]> = {
  data: ["小明", "小華"],
  error: null,
};

console.log(result);
```

`ApiResult<string[]>` 把 `T` 換成 `string[]`，所以 `data` 的型別是 `string[] | null`。換成 `ApiResult<Product>`，`data` 就是 `Product | null`。外層的結構只寫一次，裡面裝什麼，由使用的人決定。

### 這一集就夠了

泛型是 TypeScript 最深的部分之一，可以寫得很複雜。但寫 Vue 時，你需要的只有三件事：

1. 看到 `<T>` 知道它是「型別的參數」。
2. 會用 `ref<Todo[]>([])` 這種寫法，把型別傳進去。
3. 需要時能照著上面的 `first` 寫一個簡單的泛型函式。

下一集會把同樣的觀念用在元件上。遇到更複雜的寫法，查文件就好。

## 重點整理

- 角括號 `<>` 的語法叫泛型，是「型別的參數」。
- `Array<string>` 就是 `string[]`；`ref<Todo[]>` 是把 `Todo[]` 這個型別傳給 `ref`。
- 泛型函式：`function first<T>(items: T[]): T | undefined`，呼叫時 TypeScript 會從引數推論 `T`。
- `type` 也可以有型別參數，例如 `ApiResult<T>`。
