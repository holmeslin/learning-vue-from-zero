# 用 `createTestingPinia` 測試用到 store 的元件

## 本集目標

元件裡用了 store 時，用 `@pinia/testing` 的 `createTestingPinia` 先把 store 的資料準備好，並檢查元件有沒有呼叫正確的 action。

## 正文

### 要測的元件

建立 `src/components/CartSummary.vue`，顯示上一集購物車 store 的件數和合計，還有一個「清空」按鈕：

```vue
<!-- src/components/CartSummary.vue -->
<script setup lang="ts">
import { useCartStore } from "../stores/cart";
import { formatPrice } from "../utils/price";

const cart = useCartStore();
</script>

<template>
  <p data-test="count">購物車裡有 {{ cart.count }} 件商品</p>
  <p data-test="total">合計 {{ formatPrice(cart.total) }}</p>
  <button @click="cart.clear()">清空</button>
</template>
```

測這個元件時有兩個麻煩：

1. 要先讓購物車裡有東西，畫面才有東西可以檢查。用真的 store 的話，得先呼叫好幾次 `addItem`。
2. 按「清空」時，你想確認的是「元件有呼叫 `clear`」。`clear` 做得對不對，上一集已經測過了，這裡不用再測一次。

`@pinia/testing` 就是為這兩件事做的。

### 安裝 `@pinia/testing`

這個套件 create-vue 沒有幫你裝，要自己裝。`-D` 表示把它記在第 2 集說的 `devDependencies`，因為它只在測試時用到：

```bash
npm install -D @pinia/testing
```

本書撰寫時裝到的是 `@pinia/testing` 2.0.2，它要求 Pinia 4.1.0 以上。如果安裝時出現跟 `pinia` 版本有關的錯誤（`ERESOLVE`），先執行 `npm install pinia@latest` 把 Pinia 升級，再裝一次。

### `createTestingPinia`

建立 `src/components/__tests__/CartSummary.spec.ts`：

```ts
// src/components/__tests__/CartSummary.spec.ts
import { expect, test, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import CartSummary from "../CartSummary.vue";
import { useCartStore } from "../../stores/cart";

function mountWithCart() {
  return mount(CartSummary, {
    global: {
      plugins: [
        createTestingPinia({
          createSpy: vi.fn,
          initialState: {
            cart: { items: [{ name: "鍵盤", price: 1200, quantity: 2 }] },
          },
        }),
      ],
    },
  });
}

test("顯示 store 裡的件數與合計", () => {
  const wrapper = mountWithCart();

  expect(wrapper.get('[data-test="count"]').text()).toBe(
    "購物車裡有 2 件商品",
  );
  expect(wrapper.get('[data-test="total"]').text()).toBe("合計 NT$ 2,400");
});

test("按「清空」會呼叫 store 的 clear", async () => {
  const wrapper = mountWithCart();
  const cart = useCartStore();

  await wrapper.get("button").trigger("click");

  expect(cart.clear).toHaveBeenCalledTimes(1);
  expect(cart.items).toHaveLength(1);
});
```

一段一段看：

- `mount` 的 `global.plugins`：掛載前先安裝哪些外掛（plugin）。`main.ts` 裡的 `app.use(createPinia())` 就是在安裝 Pinia 這個外掛，`global.plugins` 是測試裡的同一件事。如果想用真的 Pinia，這裡放 `createPinia()` 也可以。
- `createTestingPinia(...)`：建立一個**測試專用**的 Pinia，再放進 `plugins`。
- `initialState`：每個 store 一開始的 state。key 是 `defineStore` 的第一個參數，也就是 store 的名字 `"cart"`，內容會蓋掉 store 原本的初始值。所以一掛載，購物車裡就有兩個鍵盤，不用呼叫 `addItem`。getters（`count`、`total`）會照常從這份 state 算出來。
- `createSpy: vi.fn`：告訴它「用 `vi.fn` 來做假函式」。下面會解釋為什麼需要。
- `mountWithCart` 是一個自己寫的小函式，把一樣的掛載程式碼包起來，兩個測試都可以用。

第二個測試在掛載**之後**呼叫 `useCartStore()`，拿到的就是元件正在用的那個 store。按下「清空」後：

- `expect(cart.clear).toHaveBeenCalledTimes(1)`：`clear` 被呼叫了一次。`createTestingPinia` 把 store 的每個 action 都換成了 `vi.fn` 做的假函式，所以可以用上兩集學的比較方式檢查。
- `expect(cart.items).toHaveLength(1)`：購物車裡**還是有**那一項。因為 action 預設被換成「什麼都不做」的假函式，`clear` 原本的程式碼沒有執行。

這正是你要的：這個測試只檢查元件「有沒有在按下按鈕時呼叫 `clear`」，`clear` 本身的正確性交給上一集的 store 測試。

### 少了 `createSpy` 會怎樣

把 `createSpy: vi.fn,` 那一行刪掉，跑跑看：

```text
 FAIL  src/components/__tests__/CartSummary.spec.ts > 顯示 store 裡的件數與合計
PINIA_TESTING_C0001: You must configure the "createSpy" option.
```

`@pinia/testing` 不知道你用的是哪一套測試工具，所以要你告訴它用哪個函式做假函式。Vitest 有一個設定 `globals: true`，打開之後 `vi`、`test`、`expect` 不用 `import` 就能用，這時 `@pinia/testing` 會自己找到 `vi.fn`。create-vue 的專案沒有打開這個設定，這本書也都是自己 `import`，所以要明確寫 `createSpy: vi.fn`。

### 讓 action 真的執行：`stubActions: false`

有時候你想讓 action 照常執行，一起看畫面的變化。在檔案最後加上：

```ts
test("stubActions: false 時，clear 會真的執行", async () => {
  const wrapper = mount(CartSummary, {
    global: {
      plugins: [
        createTestingPinia({
          createSpy: vi.fn,
          stubActions: false,
          initialState: {
            cart: { items: [{ name: "鍵盤", price: 1200, quantity: 2 }] },
          },
        }),
      ],
    },
  });
  const cart = useCartStore();

  await wrapper.get("button").trigger("click");

  expect(cart.clear).toHaveBeenCalledTimes(1);
  expect(wrapper.get('[data-test="count"]').text()).toBe(
    "購物車裡有 0 件商品",
  );
});
```

`stubActions: false` 是「不要把 action 換成什麼都不做的假函式」。action 會真的執行，但一樣會記錄呼叫，所以 `toHaveBeenCalledTimes` 還是能用。按下「清空」後，購物車真的空了，畫面也跟著變成 0 件。

```text
 ✓ src/components/__tests__/CartSummary.spec.ts (3 tests) 25ms
   ✓ 顯示 store 裡的件數與合計 20ms
   ✓ 按「清空」會呼叫 store 的 clear 2ms
   ✓ stubActions: false 時，clear 會真的執行 2ms

 Test Files  1 passed (1)
      Tests  3 passed (3)
```

### 全部跑一次

這一章寫了不少測試，最後全部跑一次：

```bash
npx vitest run
```

```text
 Test Files  18 passed (18)
      Tests  45 passed (45)
```

上面省略了每個檔案的那一行，只留最後的摘要：18 個測試檔、45 個測試，全部通過。（數字包含 create-vue 附的 `HelloWorld.spec.ts`。）

最後再跑一次型別檢查，確定測試檔也沒有型別錯誤：

```bash
npm run type-check
```

沒有印出任何錯誤，就代表通過了。

之後每次改程式，就跑一次 `npx vitest run`，或是開著 `npm run test:unit` 一邊寫一邊看。全部打勾，你就可以放心地往下改。

## 重點整理

- `@pinia/testing` 要另外用 `npm install -D @pinia/testing` 安裝，它需要 Pinia 4.1.0 以上。
- 在 `mount` 的 `global.plugins` 放 `createTestingPinia(...)`，`initialState` 用 store 名稱設定初始 state。
- 沒有開 Vitest 的 `globals` 時，一定要給 `createSpy: vi.fn`。
- action 預設會被換成什麼都不做的假函式，只檢查有沒有被呼叫；要讓它真的執行，加 `stubActions: false`。
