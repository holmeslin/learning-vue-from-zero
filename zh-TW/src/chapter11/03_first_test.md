# 第一個測試

## 本集目標

替一個純函式寫第一個測試，並看懂測試通過和失敗時的輸出。

## 正文

### 先有要測的東西

最好測的東西是**純函式**：同樣的輸入永遠得到同樣的輸出，不碰畫面、不連網路。建立 `src/utils/price.ts`，寫一個把數字變成價格字串的函式：

```ts
// src/utils/price.ts
export function formatPrice(price: number): string {
  return `NT$ ${price.toLocaleString("zh-TW")}`;
}
```

`toLocaleString("zh-TW")` 會把 `1200` 變成有千分位的 `"1,200"`。

### 寫測試

在 `src/utils` 裡建立 `__tests__` 資料夾，再在裡面建立 `price.spec.ts`：

```ts
// src/utils/__tests__/price.spec.ts
import { expect, test } from "vitest";
import { formatPrice } from "../price";

test("formatPrice 會加上千分位與 NT$", () => {
  expect(formatPrice(1200)).toBe("NT$ 1,200");
});
```

逐行看：

- `import { expect, test } from "vitest"`：從 Vitest 匯入兩個函式。
- `import { formatPrice } from "../price"`：測試檔在 `__tests__` 裡，要用 `..` 往上一層，才找得到旁邊的 `price.ts`。Vite 專案裡匯入 `.ts` 檔可以省略副檔名。
- `test("說明", () => { ... })`：定義**一個測試**。第一個參數用中文描述這個測試在檢查什麼，第二個參數是一個函式，裡面放測試內容。
- `expect(formatPrice(1200))`：「我預期這個值……」。
- `.toBe("NT$ 1,200")`：「……會是 `"NT$ 1,200"`」。

合起來讀就是：**預期 `formatPrice(1200)` 的結果是 `"NT$ 1,200"`**。

一個測試通常做三件事：準備資料、執行要測的東西、檢查結果。這個測試很短，三件事擠在一行裡；之後的測試會把它們分開寫。

### 執行

```bash
npx vitest run src/utils
```

```text
 RUN  v4.1.11 /你的路徑/vue-testing

 ✓ src/utils/__tests__/price.spec.ts (1 test) 9ms
   ✓ formatPrice 會加上千分位與 NT$ 9ms

 Test Files  1 passed (1)
      Tests  1 passed (1)
```

`npx vitest run src/utils` 只跑 `src/utils` 底下的測試。打勾 `✓` 就是通過，第二行是測試的說明，也就是你寫在 `test` 第一個參數的那段文字。

### 讓它失敗

測試最重要的能力，是「該失敗的時候會失敗」。把預期的值故意改錯，把 `"NT$ 1,200"` 改成 `"NT$ 1200"`，再執行一次：

```text
 FAIL  src/utils/__tests__/price.spec.ts > formatPrice 會加上千分位與 NT$
AssertionError: expected 'NT$ 1,200' to be 'NT$ 1200' // Object.is equality

Expected: "NT$ 1200"
Received: "NT$ 1,200"

 ❯ src/utils/__tests__/price.spec.ts:6:29
      4|
      5| test("formatPrice 會加上千分位與 NT$", () => {
      6|   expect(formatPrice(1200)).toBe("NT$ 1200");
       |                             ^
      7| });
      8|

 Test Files  1 failed (1)
      Tests  1 failed (1)
```

輸出清楚地告訴你：

- **哪個測試失敗**：`price.spec.ts` 裡的「formatPrice 會加上千分位與 NT$」。
- **預期值（Expected）和實際值（Received）**：預期 `"NT$ 1200"`，實際得到 `"NT$ 1,200"`。
- **哪一行**：第 6 行，並附上那一行前後的程式碼，`^` 指著出問題的位置。

改回正確的值，測試又會通過。養成一個習慣：**新寫的測試，先確認它真的會失敗一次**，不然你不知道它到底有沒有在檢查東西。

### 在監看模式下寫測試

一邊寫一邊測，最順手的方式是開著 `npm run test:unit`。存檔的瞬間測試就重跑，終端機一直亮著綠燈或紅燈，你不用每次都自己下指令。

## 重點整理

- 測試檔放在 `__tests__` 資料夾，檔名是原檔名加 `.spec.ts`。
- `test("說明", () => { ... })` 定義一個測試，`expect(實際值).toBe(預期值)` 檢查結果。
- `✓` 是通過；失敗時會顯示預期值、實際值和出錯的那一行。
- 新寫的測試先讓它失敗一次，確認它真的在檢查東西。
