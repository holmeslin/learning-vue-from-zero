# `describe`、`test` 與 `expect`

## 本集目標

把相關的測試分組，並學會最常用的幾種 `expect` 比較方式。

## 正文

### 要測的函式

建立 `src/utils/cart.ts`，放幾個購物車會用到的函式：

```ts
// src/utils/cart.ts
export type CartItem = { name: string; price: number; quantity: number };

export function cartTotal(items: CartItem[]): number {
  let total = 0;
  for (const item of items) {
    total += item.price * item.quantity;
  }
  return total;
}

export function applyDiscount(total: number): number {
  return total >= 3000 ? total * 0.9 : total;
}

export function findItem(items: CartItem[], name: string): CartItem | null {
  return items.find((item) => item.name === name) ?? null;
}

export function parseQuantity(text: string): number {
  const quantity = Number(text);
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("數量必須是正整數");
  }
  return quantity;
}
```

`parseQuantity` 裡的 `throw new Error("...")` 是「丟出錯誤」：程式在這裡停下來，告訴呼叫的人「出事了」，訊息就是括號裡的字串。數量是 0 或是根本不是數字時，就丟出錯誤。

四個函式，各自有一些該測的行為：一般的情況、邊界、找不到、輸入錯誤。

### 用 `describe` 分組

一個檔案裡有很多測試時，用 `describe` 把同一個函式的測試放在一起。建立 `src/utils/__tests__/cart.spec.ts`：

```ts
// src/utils/__tests__/cart.spec.ts
import { describe, expect, test } from "vitest";
import { applyDiscount, cartTotal, findItem, parseQuantity } from "../cart";
import type { CartItem } from "../cart";

const items: CartItem[] = [
  { name: "鍵盤", price: 1200, quantity: 1 },
  { name: "滑鼠", price: 600, quantity: 2 },
];

describe("cartTotal", () => {
  test("把每一項的小計加起來", () => {
    expect(cartTotal(items)).toBe(2400);
  });

  test("空的購物車是 0", () => {
    expect(cartTotal([])).toBe(0);
  });
});

describe("applyDiscount", () => {
  test("滿 3000 元打九折", () => {
    expect(applyDiscount(3000)).toBe(2700);
  });

  test("未滿 3000 元不打折", () => {
    expect(applyDiscount(2999)).toBe(2999);
  });
});

describe("findItem", () => {
  test("找得到就回傳那一項", () => {
    expect(findItem(items, "滑鼠")).toEqual({
      name: "滑鼠",
      price: 600,
      quantity: 2,
    });
  });

  test("找不到就回傳 null", () => {
    expect(findItem(items, "螢幕")).toBeNull();
  });
});

describe("parseQuantity", () => {
  test("把字串轉成數字", () => {
    expect(parseQuantity("3")).toBe(3);
  });

  test("不是正整數就丟出錯誤", () => {
    expect(() => parseQuantity("0")).toThrow("數量必須是正整數");
    expect(() => parseQuantity("abc")).toThrow();
  });
});
```

`describe("名稱", () => { ... })` 把裡面的測試歸成一組。`import type` 是第 10 章學過的「只匯入型別」。

注意 `applyDiscount` 的兩個測試：3000 和 2999，正好卡在邊界的兩側。第 1 集提到的 `>` 和 `>=` 的錯誤，就是靠這種邊界測試抓出來的。**測邊界，比多測幾個普通的值有用得多。**

另外，`test` 也可以寫成 `it`，兩個完全一樣。create-vue 的範例測試用的是 `it`，讀起來像英文句子「it renders properly」；這本書統一用 `test`，讀起來是「測試：某某事」。

### 常用的比較方式

建立 `src/utils/__tests__/matchers.spec.ts` 試試看常見的 `expect` 寫法：

```ts
// src/utils/__tests__/matchers.spec.ts
import { expect, test } from "vitest";

test("toBe 比較的是同一個東西，toEqual 比較內容", () => {
  const a = { id: 1 };
  const b = { id: 1 };

  expect(a).toEqual(b);
  expect(a).not.toBe(b);
  expect(a).toBe(a);
});

test("其他常用的比較", () => {
  expect([1, 2, 3]).toContain(2);
  expect([1, 2, 3]).toHaveLength(3);
  expect("JavaScript").toMatch(/script/i);
  expect(0.1 + 0.2).toBeCloseTo(0.3);
  expect(undefined).toBeUndefined();
  expect(null).toBeNull();
  expect(5).toBeGreaterThan(3);
});
```

`toBe`、`toEqual` 這些叫做**比較方式**（matcher），整理成表格：

| 比較方式 | 意思 |
| --- | --- |
| `toBe(x)` | 和 `x` 是同一個值（和 `===` 的概念一樣；物件要是同一個物件） |
| `toEqual(x)` | 內容相同就好，物件和陣列用這個比 |
| `toBeNull()` / `toBeUndefined()` | 是 `null` / `undefined` |
| `toContain(x)` | 陣列裡有 `x`，或字串裡包含 `x` |
| `toHaveLength(n)` | 長度是 `n` |
| `toMatch(/正規表達式/)` | 字串符合某個模式，`/script/i` 是「含有 script，不分大小寫」 |
| `toBeCloseTo(x)` | 小數的近似比較 |
| `toBeGreaterThan(x)` | 大於 `x` |
| `toThrow(訊息)` | 呼叫時會丟出錯誤 |
| `.not` | 放在比較方式前面，表示相反 |

幾個要記住的細節：

**`toBe` 和 `toEqual` 的差別。** 第 2 章講過，物件和陣列是參考：兩個內容一樣的物件，用 `===` 比是 `false`，因為它們是兩個不同的物件。`toBe` 的規則和 `===` 一樣，所以比物件和陣列時要用 `toEqual`。用錯的話，錯誤訊息會是：

```text
AssertionError: expected { id: 1 } to be { id: 1 } // Object.is equality

If it should pass with deep equality, replace "toBe" with "toStrictEqual"

Expected: { id: 1 }
Received: serializes to the same string
```

訊息還提醒你改用 `toStrictEqual`。它和 `toEqual` 幾乎一樣，只是更嚴格一點（例如會區分「屬性是 `undefined`」和「沒有這個屬性」）。一般情況兩個都行，這本書用 `toEqual`。

**小數用 `toBeCloseTo`。** 第 1 章說過 `0.1 + 0.2` 不等於 `0.3`，所以比小數時要用「差不多就好」的 `toBeCloseTo`。

**`toThrow` 要包一層函式。** 注意測試裡寫的是 `expect(() => parseQuantity("0")).toThrow(...)`，不是 `expect(parseQuantity("0")).toThrow(...)`。後者會在 `expect` 還沒機會檢查之前，就先執行 `parseQuantity("0")`、丟出錯誤，測試直接失敗：

```text
Error: 數量必須是正整數
 ❯ parseQuantity src/utils/cart.ts:23:11
```

包成函式，Vitest 才能自己呼叫它、接住錯誤、再檢查錯誤訊息對不對。

### 執行

```bash
npx vitest run src/utils
```

```text
 RUN  v4.1.11 /你的路徑/vue-testing

 ✓ src/utils/__tests__/matchers.spec.ts (2 tests) 2ms
 ✓ src/utils/__tests__/cart.spec.ts (8 tests) 2ms
 ✓ src/utils/__tests__/price.spec.ts (1 test) 10ms

 Test Files  3 passed (3)
      Tests  11 passed (11)
```

一次跑好幾個測試檔時，每個檔案只會顯示一行和它有幾個測試，不會把每個測試的說明都列出來。三個檔案的順序每次可能不一樣，因為 Vitest 會同時跑好幾個檔案，誰先跑完誰先印。

## 重點整理

- `describe` 把同一組的測試包在一起；`test` 和 `it` 完全一樣。
- 優先測邊界，例如 3000 和 2999。
- 比物件、陣列用 `toEqual`，比單純的值用 `toBe`，小數用 `toBeCloseTo`。
- 測丟出錯誤要寫 `expect(() => 函式()).toThrow()`，要包一層函式。
- `.not` 可以把任何比較反過來。
