# 測試 Pinia store

## 本集目標

不掛載任何元件，直接測試一個 Pinia store 的 state、getters 和 actions。

## 正文

### 要測的 store

建立 `src/stores/cart.ts`，一個購物車 store。它用第 8 章學的 setup store 寫法，總價直接用第 4 集寫的 `cartTotal`：

```ts
// src/stores/cart.ts
import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { cartTotal } from "../utils/cart";
import type { CartItem } from "../utils/cart";

export const useCartStore = defineStore("cart", () => {
  const items = ref<CartItem[]>([]);
  const total = computed(() => cartTotal(items.value));
  const count = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0),
  );

  function addItem(name: string, price: number) {
    const found = items.value.find((item) => item.name === name);
    if (found) {
      found.quantity++;
    } else {
      items.value.push({ name, price, quantity: 1 });
    }
  }

  function clear() {
    items.value = [];
  }

  return { items, total, count, addItem, clear };
});
```

- state：`items`，購物車裡的商品。
- getters：`total` 是總價，`count` 是總件數（用第 2 章的 `reduce` 把每一項的數量加起來）。
- actions：`addItem` 加入商品，同一個商品再加一次就數量加一；`clear` 清空。

### 直接呼叫看看

store 本身就是一個函式，看起來可以像 composable 一樣直接呼叫。建立 `src/stores/__tests__/cart.spec.ts`，先這樣寫：

```ts
// src/stores/__tests__/cart.spec.ts
import { describe, expect, test } from "vitest";
import { useCartStore } from "../cart";

describe("購物車 store", () => {
  test("一開始是空的", () => {
    const cart = useCartStore();
    expect(cart.items).toEqual([]);
    expect(cart.count).toBe(0);
    expect(cart.total).toBe(0);
  });
});
```

```text
 FAIL  src/stores/__tests__/cart.spec.ts > 購物車 store > 一開始是空的
Error: [🍍]: "getActivePinia()" was called but there was no active Pinia.
Are you trying to use a store before calling "app.use(pinia)"?
See https://pinia.vuejs.org/core-concepts/outside-component-usage.html for help.
This will fail in production.
```

🍍 是 Pinia 的標誌。第一行原本很長，書上把它折成兩行。訊息說：「沒有正在使用中的 Pinia，你是不是在 `app.use(pinia)` 之前就用了 store？」

在真正的網站裡，`main.ts` 有一行 `app.use(createPinia())`，store 都存在那個 Pinia 裡面。測試裡沒有 `main.ts`，也沒有 app，store 不知道要存在哪裡。

### `setActivePinia(createPinia())`

把測試檔改成這樣：

```ts
// src/stores/__tests__/cart.spec.ts
import { beforeEach, describe, expect, test } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useCartStore } from "../cart";

describe("購物車 store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("一開始是空的", () => {
    const cart = useCartStore();
    expect(cart.items).toEqual([]);
    expect(cart.count).toBe(0);
    expect(cart.total).toBe(0);
  });

  test("加入同一個商品兩次，數量變成 2", () => {
    const cart = useCartStore();

    cart.addItem("鍵盤", 1200);
    cart.addItem("鍵盤", 1200);
    cart.addItem("滑鼠", 600);

    expect(cart.items).toEqual([
      { name: "鍵盤", price: 1200, quantity: 2 },
      { name: "滑鼠", price: 600, quantity: 1 },
    ]);
    expect(cart.count).toBe(3);
    expect(cart.total).toBe(3000);
  });

  test("clear 會清空購物車", () => {
    const cart = useCartStore();
    cart.addItem("鍵盤", 1200);

    cart.clear();

    expect(cart.items).toEqual([]);
  });
});
```

- `createPinia()` 建立一個新的 Pinia，和 `main.ts` 裡用的是同一個函式。
- `setActivePinia(...)` 告訴 Pinia：「接下來呼叫的 store，都存在這一個裡面」。它做的事和 `app.use(pinia)` 類似，只是不需要 app。
- 放在 `beforeEach` 裡，**每個測試都會拿到一個全新、空的 Pinia**。

最後一點很重要。store 在同一個 Pinia 裡只會有一份：第二個測試加了三件商品，如果大家共用同一個 Pinia，第三個測試一開始購物車裡就已經有東西了，測試結果會跟著執行順序改變。每個測試用新的 Pinia，就不會互相影響。

`beforeEach` 寫在 `describe` 裡面，只會套用在這個 `describe` 裡的測試。

測試裡讀 store 的方式和元件裡一樣：`cart.items`、`cart.count` 直接讀，不用 `.value`；actions 直接呼叫。

```text
 ✓ src/stores/__tests__/cart.spec.ts (3 tests) 3ms
   ✓ 購物車 store (3)
     ✓ 一開始是空的 2ms
     ✓ 加入同一個商品兩次，數量變成 2 1ms
     ✓ clear 會清空購物車 0ms

 Test Files  1 passed (1)
      Tests  3 passed (3)
```

有用 `describe` 時，輸出會多一層，顯示這一組裡有幾個測試。

## 重點整理

- 測試裡沒有 `app.use(pinia)`，直接用 store 會出現「no active Pinia」的錯誤。
- 在 `beforeEach` 裡呼叫 `setActivePinia(createPinia())`，每個測試都有一個全新的 Pinia。
- 每個測試用新的 Pinia，store 的 state 才不會被上一個測試影響。
- 測試裡讀 state、getters 和呼叫 actions 的方式，和在元件裡一樣。
