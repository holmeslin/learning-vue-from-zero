# 用 `find` 與 `get` 找元素

## 本集目標

在掛載好的元件裡找到特定的元素，檢查它的文字、存不存在，以及一次找出好幾個元素。

## 正文

上一集用 `wrapper.text()` 檢查整個元件的文字。但元件一大，「整段文字裡有沒有這幾個字」就不夠精確了：價格到底是顯示在價格的位置，還是不小心顯示在標題裡？這時要先找到那個元素，再檢查它。

### `get`：一定要找到

在 `ProductCard.spec.ts` 底下加一個測試（上一集的 `console.log` 可以刪掉了）：

```ts
test("用 get 找到標題與價格", () => {
  const wrapper = mount(ProductCard, {
    props: { name: "機械鍵盤", price: 2490 },
  });

  expect(wrapper.get("h2").text()).toBe("機械鍵盤");
  expect(wrapper.get(".price").text()).toBe("NT$ 2,490");
});
```

`wrapper.get(選擇器)` 用第 3 章學的 CSS 選擇器找元素：`"h2"` 找 `<h2>` 標籤，`".price"` 找 class 是 `price` 的元素。找到的東西一樣有 `.text()` 可以用。有好幾個符合時，回傳第一個。

這裡的程式碼區塊只列出新加的測試，`import` 那幾行用的還是檔案最上面那些，不用再寫一次。

**找不到的話，`get` 會直接讓測試失敗。** 例如沒傳 `soldOut`，卻去 `get(".sold-out")`：

```text
Error: Unable to get .sold-out within: <article class="card">
  <h2>機械鍵盤</h2>
  <p class="price">NT$ 2,490</p>
  <!--v-if-->
</article>
```

錯誤訊息還會附上當下的 HTML，讓你看到底畫面上有什麼。

### `find`：可能找不到

如果你要檢查的就是「這個元素**不應該**出現」，就要用 `find`：

```ts
test("沒有售完時，不顯示「已售完」", () => {
  const wrapper = mount(ProductCard, {
    props: { name: "機械鍵盤", price: 2490 },
  });

  expect(wrapper.find(".sold-out").exists()).toBe(false);
});

test("售完時顯示「已售完」", () => {
  const wrapper = mount(ProductCard, {
    props: { name: "機械鍵盤", price: 2490, soldOut: true },
  });

  expect(wrapper.find(".sold-out").exists()).toBe(true);
  expect(wrapper.get("article").classes()).toContain("card");
});
```

`find` 找不到時不會失敗，而是回傳一個「空的」結果，`.exists()` 會是 `false`。所以「確認某個東西不在畫面上」一定要用 `find(...).exists()`。

`classes()` 回傳元素所有 class 組成的陣列，用 `toContain` 檢查有沒有某個 class。

但要注意，空的 `find` 結果不能拿來做別的事，例如對它呼叫 `.text()`：

```text
Error: Cannot call text on an empty DOMWrapper.
```

所以規則很簡單：

| 方法 | 找不到時 | 用在 |
| --- | --- | --- |
| `get(選擇器)` | 測試直接失敗，並印出 HTML | 元素應該要在，接著要讀它的內容 |
| `find(選擇器)` | 回傳空結果，`.exists()` 是 `false` | 檢查元素在不在 |

大部分時候用 `get`，只有檢查「不存在」時用 `find`。

### `findAll`：找好幾個

列表會有好幾個一樣的元素。建立 `src/components/ShoppingList.vue`：

```vue
<!-- src/components/ShoppingList.vue -->
<script setup lang="ts">
defineProps<{ items: string[] }>();
</script>

<template>
  <ul v-if="items.length > 0">
    <li v-for="item in items" :key="item" data-test="item">{{ item }}</li>
  </ul>
  <p v-else data-test="empty">清單是空的</p>
</template>
```

`data-test="item"` 是一個自訂的 HTML 屬性，對畫面沒有任何影響，專門給測試用來找元素。HTML 允許你自己發明以 `data-` 開頭的屬性。

建立 `src/components/__tests__/ShoppingList.spec.ts`：

```ts
// src/components/__tests__/ShoppingList.spec.ts
import { expect, test } from "vitest";
import { mount } from "@vue/test-utils";
import ShoppingList from "../ShoppingList.vue";

test("每個項目各顯示一行", () => {
  const wrapper = mount(ShoppingList, {
    props: { items: ["牛奶", "雞蛋", "吐司"] },
  });

  const rows = wrapper.findAll('[data-test="item"]');
  expect(rows).toHaveLength(3);
  expect(rows.map((row) => row.text())).toEqual(["牛奶", "雞蛋", "吐司"]);
  expect(wrapper.find('[data-test="empty"]').exists()).toBe(false);
});

test("沒有項目時顯示提示", () => {
  const wrapper = mount(ShoppingList, { props: { items: [] } });

  expect(wrapper.get('[data-test="empty"]').text()).toBe("清單是空的");
  expect(wrapper.findAll('[data-test="item"]')).toHaveLength(0);
});
```

- `'[data-test="item"]'` 是 CSS 的「屬性選擇器」：找 `data-test` 屬性等於 `item` 的元素。選擇器裡面有雙引號，所以外面改用單引號包。
- `findAll` 回傳一個陣列，裡面是所有找到的元素。找不到就是空陣列，不會失敗。
- `rows.map((row) => row.text())` 是第 2 章學的 `map`：把每個元素換成它的文字，再和預期的陣列比。

### 為什麼用 `data-test`

`get("li")` 也找得到，為什麼要多加一個屬性？因為 class 和標籤常常會為了外觀而改：設計師把 `<li>` 換成 `<div>`、把 class 改名，測試就壞了，可是使用者看到的東西其實沒變。`data-test` 只給測試用，沒有人會為了改外觀去動它，測試就比較不容易因為無關的修改而失敗。

小元件直接用標籤或 class 就夠了，像 `ProductCard` 那樣；元素一多、容易搞混時，再加 `data-test`。

### 執行

```bash
npx vitest run src/components/__tests__/ShoppingList.spec.ts
```

```text
 ✓ src/components/__tests__/ShoppingList.spec.ts (2 tests) 13ms
   ✓ 每個項目各顯示一行 11ms
   ✓ 沒有項目時顯示提示 1ms

 Test Files  1 passed (1)
      Tests  2 passed (2)
```

開頭的 `RUN` 那一行每次都一樣，之後的輸出都會省略。

## 重點整理

- `get(選擇器)` 找一個元素，找不到就讓測試失敗，並印出當下的 HTML。
- `find(選擇器).exists()` 用來檢查元素在不在；空的 `find` 結果不能呼叫 `.text()`。
- `findAll(選擇器)` 回傳所有符合的元素組成的陣列。
- `data-test` 屬性專門給測試找元素用，不容易因為改外觀而壞掉。
