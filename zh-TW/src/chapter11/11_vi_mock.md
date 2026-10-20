# 用 `vi.mock` 模擬模組與 `fetch`

## 本集目標

元件自己 `import` 了會連網路的函式時，用 `vi.mock` 把整個模組換成假的；要測那個函式本身時，改成只換掉 `fetch`。

## 正文

### 換不掉的函式

前兩集的 `UserList` 從 props 接收 `loadUsers`，測試時傳假的進去就好。但很多元件是直接 `import` 抓資料的函式來用，沒有從 props 傳進來的地方。

先建立一個抓商品資料的函式 `src/api/products.ts`：

```ts
// src/api/products.ts
export type Product = { id: number; name: string };

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch("/api/products");
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}
```

這是第 2 章學的 `fetch`：向伺服器要資料，`response.ok` 是 `false` 表示伺服器回了錯誤（例如找不到），就丟出錯誤；成功就把 JSON 轉成物件回傳。

再建立用它的元件 `src/components/ProductPage.vue`：

```vue
<!-- src/components/ProductPage.vue -->
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { fetchProducts } from "../api/products";
import type { Product } from "../api/products";

const products = ref<Product[] | null>(null);
const error = ref("");

onMounted(async () => {
  try {
    products.value = await fetchProducts();
  } catch {
    error.value = "商品載入失敗";
  }
});
</script>

<template>
  <p v-if="error">{{ error }}</p>
  <p v-else-if="products === null">載入中…</p>
  <ul v-else>
    <li v-for="product in products" :key="product.id">
      {{ product.name }}
    </li>
  </ul>
</template>
```

測試時不想真的連網路：測試裡沒有那台伺服器，就算有，資料也可能會變，測試結果就不穩定。

### `vi.mock()`：假的模組

建立 `src/components/__tests__/ProductPage.spec.ts`：

```ts
// src/components/__tests__/ProductPage.spec.ts
import { beforeEach, expect, test, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import ProductPage from "../ProductPage.vue";
import { fetchProducts } from "../../api/products";

vi.mock("../../api/products", () => ({
  fetchProducts: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

test("顯示 fetchProducts 回傳的商品", async () => {
  vi.mocked(fetchProducts).mockResolvedValue([
    { id: 1, name: "機械鍵盤" },
    { id: 2, name: "無線滑鼠" },
  ]);

  const wrapper = mount(ProductPage);
  await flushPromises();

  expect(wrapper.findAll("li").map((li) => li.text())).toEqual([
    "機械鍵盤",
    "無線滑鼠",
  ]);
  expect(fetchProducts).toHaveBeenCalledTimes(1);
});

test("fetchProducts 失敗時顯示錯誤訊息", async () => {
  vi.mocked(fetchProducts).mockRejectedValue(new Error("伺服器壞了"));

  const wrapper = mount(ProductPage);
  await flushPromises();

  expect(wrapper.text()).toBe("商品載入失敗");
});
```

重點逐一看：

- `vi.mock("../../api/products", () => ({ ... }))`：告訴 Vitest：「這個測試檔執行時，任何人匯入這個模組，都換成我給的假版本」。第二個參數是一個函式，回傳假模組的內容，這裡只有一個假的 `fetchProducts`。
- 路徑是從**測試檔**的位置算的：測試檔在 `src/components/__tests__/`，往上兩層才到 `src`。元件裡寫的是 `"../api/products"`，寫法不同，但指的是同一個檔案，所以元件匯入的也會被換掉。
- `vi.mock` 寫在 `import` 下面，但 Vitest 會把它**提到檔案最前面先執行**，所以 `ProductPage` 匯入到的已經是假的。順序不用自己操心。
- 測試檔最上面也匯入了 `fetchProducts`，拿到的同樣是假的那一個，所以可以設定它回傳什麼、檢查它的呼叫紀錄。
- `vi.mocked(fetchProducts)`：TypeScript 只知道 `fetchProducts` 是原本那個函式，不知道它已經被換成假的，直接呼叫 `.mockResolvedValue` 會出現型別錯誤。用 `vi.mocked(...)` 包起來，就是告訴 TypeScript「這是假函式」。它不會改變任何執行結果，只影響型別。
- `beforeEach(() => vi.clearAllMocks())`：`beforeEach` 裡的函式會在**每個測試開始前**執行一次。`vi.clearAllMocks()` 清掉所有假函式的呼叫紀錄，不然後面的測試做 `toHaveBeenCalledTimes(1)` 時，會連前面測試的呼叫也算進去。

```text
 ✓ src/components/__tests__/ProductPage.spec.ts (2 tests) 12ms
   ✓ 顯示 fetchProducts 回傳的商品 10ms
   ✓ fetchProducts 失敗時顯示錯誤訊息 1ms

 Test Files  1 passed (1)
      Tests  2 passed (2)
```

這樣測試完全不碰網路，想要什麼資料就給什麼資料，成功、失敗的情況都能輕易做出來。

### 模擬 `fetch` 本身

上面把 `fetchProducts` 整個換掉了，所以 `fetchProducts` 裡面的程式碼根本沒跑到。如果要測的就是 `fetchProducts` 本身，例如「伺服器回 404 時會不會丟出錯誤」，就不能把它換掉，而是要換掉更底層的 `fetch`。

建立 `src/api/__tests__/products.spec.ts`：

```ts
// src/api/__tests__/products.spec.ts
import { afterEach, expect, test, vi } from "vitest";
import { fetchProducts } from "../products";

afterEach(() => {
  vi.restoreAllMocks();
});

test("成功時回傳解析後的 JSON", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    Response.json([{ id: 1, name: "機械鍵盤" }]),
  );

  expect(await fetchProducts()).toEqual([{ id: 1, name: "機械鍵盤" }]);
  expect(fetch).toHaveBeenCalledWith("/api/products");
});

test("伺服器回傳錯誤時丟出例外", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response("找不到", { status: 404 }),
  );

  await expect(fetchProducts()).rejects.toThrow("HTTP 404");
});
```

- `globalThis` 是「全域物件」，`fetch` 這種到處都能直接用的函式，就是掛在它上面。
- `vi.spyOn(globalThis, "fetch")`：把 `globalThis` 上的 `fetch` 換成假函式，一樣可以用 `.mockResolvedValue` 決定它回傳什麼。
- `Response.json(資料)` 和 `new Response("文字", { status: 404 })`：做出假的伺服器回應。`fetch` 本來就是回傳一個 `Response`，所以假的也要給 `Response`。
- `afterEach(() => vi.restoreAllMocks())`：`afterEach` 和 `beforeEach` 相反，在**每個測試結束後**執行。`vi.restoreAllMocks()` 把 `spyOn` 換掉的東西還原成真的，不會影響到其他測試。
- 非同步函式丟出錯誤時，Promise 會失敗。檢查它要寫成 `await expect(Promise).rejects.toThrow(...)`：`.rejects` 是「等這個 Promise 失敗，再檢查錯誤」。

```text
 ✓ src/api/__tests__/products.spec.ts (2 tests) 4ms
   ✓ 成功時回傳解析後的 JSON 3ms
   ✓ 伺服器回傳錯誤時丟出例外 1ms

 Test Files  1 passed (1)
      Tests  2 passed (2)
```

### 模擬的原則

模擬很方便，但不要過度使用。每換掉一個真的東西，測試就離真實情況遠一點。原則是：**只換掉不受你控制或很慢的東西**，例如網路。你自己寫的邏輯，盡量用真的。

## 重點整理

- `vi.mock("模組路徑", () => ({ ... }))` 把整個模組換成假的，路徑從測試檔的位置算。
- `vi.mocked(函式).mockResolvedValue(資料)` 指定假函式回傳什麼，`vi.mocked` 是給 TypeScript 看的。
- `beforeEach(() => vi.clearAllMocks())` 在每個測試前清掉呼叫紀錄。
- 要測抓資料的函式本身，用 `vi.spyOn(globalThis, "fetch")` 只換掉 `fetch`，再用 `vi.restoreAllMocks()` 還原。
- 只模擬不受控制或很慢的東西，其他盡量用真的。
