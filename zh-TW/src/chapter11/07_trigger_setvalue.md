# 用 `trigger` 與 `setValue` 模擬操作

## 本集目標

在測試裡模擬使用者點按鈕、在輸入框打字、勾選核取方塊，並且知道為什麼一定要加 `await`。

## 正文

### 點按鈕：`trigger`

建立 `src/components/Counter.vue`，第 5 章做過的計數器：

```vue
<!-- src/components/Counter.vue -->
<script setup lang="ts">
import { ref } from "vue";

const count = ref(0);
</script>

<template>
  <p data-test="count">按了 {{ count }} 次</p>
  <button @click="count++">+1</button>
</template>
```

建立 `src/components/__tests__/Counter.spec.ts`：

```ts
// src/components/__tests__/Counter.spec.ts
import { expect, test } from "vitest";
import { mount } from "@vue/test-utils";
import Counter from "../Counter.vue";

test("按一下按鈕，次數加一", async () => {
  const wrapper = mount(Counter);
  expect(wrapper.get('[data-test="count"]').text()).toBe("按了 0 次");

  await wrapper.get("button").trigger("click");
  expect(wrapper.get('[data-test="count"]').text()).toBe("按了 1 次");

  await wrapper.get("button").trigger("click");
  await wrapper.get("button").trigger("click");
  expect(wrapper.get('[data-test="count"]').text()).toBe("按了 3 次");
});
```

- `Counter` 沒有 props，`mount` 只要給元件就好。
- `trigger("click")`：對這個元素觸發一個 `click` 事件，就像使用者點了它。`@click` 綁的程式碼會執行，`count` 加一。
- 測試函式前面多了 `async`，每個 `trigger` 前面都加了 `await`。

```text
 ✓ src/components/__tests__/Counter.spec.ts (1 test) 13ms
   ✓ 按一下按鈕，次數加一 12ms

 Test Files  1 passed (1)
      Tests  1 passed (1)
```

### 為什麼要 `await`

把第一個 `trigger` 前面的 `await` 拿掉，再跑一次：

```text
 FAIL  src/components/__tests__/Counter.spec.ts > 按一下按鈕，次數加一
AssertionError: expected '按了 0 次' to be '按了 1 次' // Object.is equality

Expected: "按了 1 次"
Received: "按了 0 次"

 ❯ src/components/__tests__/Counter.spec.ts:11:53
      9|
     10|   wrapper.get("button").trigger("click");
     11|   expect(wrapper.get('[data-test="count"]').text()).toBe("按了 1 次");
       |                                                     ^
     12|
     13|   await wrapper.get("button").trigger("click");
```

按鈕明明按了，畫面卻還是「按了 0 次」。

第 5 章講 `nextTick` 時提過：**Vue 改了狀態之後，不會馬上更新畫面**，而是先把要更新的東西記下來，等手上這段程式碼跑完，再一次更新。這樣同一時間改了很多東西，也只要更新一次畫面。

`count` 確實已經是 1 了，但畫面要等一下才會更新。沒有 `await`，下一行的 `expect` 馬上就去讀畫面，讀到的是還沒更新的舊內容。

`trigger` 回傳的是一個 Promise，它會在 Vue 更新完畫面之後才完成。`await` 它，就是「等畫面更新完再往下」。所以規則是：**`trigger` 前面一定要加 `await`，測試函式前面要加 `async`。**

### 打字：`setValue`

建立 `src/components/NameInput.vue`，有一個文字輸入框和一個核取方塊：

```vue
<!-- src/components/NameInput.vue -->
<script setup lang="ts">
import { ref } from "vue";

const name = ref("");
const agreed = ref(false);
</script>

<template>
  <input v-model="name" type="text" />
  <label><input v-model="agreed" type="checkbox" /> 我同意</label>
  <p v-if="name">哈囉，{{ name }}！</p>
  <button :disabled="!agreed">送出</button>
</template>
```

建立 `src/components/__tests__/NameInput.spec.ts`：

```ts
// src/components/__tests__/NameInput.spec.ts
import { expect, test } from "vitest";
import { mount } from "@vue/test-utils";
import NameInput from "../NameInput.vue";

test("輸入名字後顯示招呼語", async () => {
  const wrapper = mount(NameInput);

  await wrapper.get('input[type="text"]').setValue("小明");

  expect(wrapper.get("p").text()).toBe("哈囉，小明！");
});

test("勾選同意後，送出按鈕才能按", async () => {
  const wrapper = mount(NameInput);
  const button = wrapper.get("button");
  expect(button.attributes("disabled")).toBeDefined();

  await wrapper.get('input[type="checkbox"]').setValue(true);

  expect(button.attributes("disabled")).toBeUndefined();
});
```

- `setValue("小明")`：把輸入框的內容設成「小明」，並觸發 `v-model` 監聽的事件，效果就像使用者打了這兩個字。`name` 會變成 `"小明"`。
- 核取方塊用 `setValue(true)` 勾選、`setValue(false)` 取消勾選。下拉選單 `<select>` 也是用 `setValue`，給它要選的那個 `value`。
- `setValue` 和 `trigger` 一樣要 `await`。
- `'input[type="text"]'` 是「`type` 屬性等於 `text` 的 `<input>`」，用來區分兩個輸入框。
- `attributes("disabled")` 讀元素的 `disabled` 屬性。按鈕被停用時，它是空字串 `""`；沒被停用時，這個屬性根本不存在，讀到 `undefined`。所以用 `toBeDefined()`（不是 `undefined`）和 `toBeUndefined()` 來檢查。

注意 `button` 是在操作之前就找好的。`get` 找到的是畫面上那個真的元素，畫面更新後它的屬性也會跟著變，不用重新找。

```text
 ✓ src/components/__tests__/NameInput.spec.ts (2 tests) 15ms
   ✓ 輸入名字後顯示招呼語 13ms
   ✓ 勾選同意後，送出按鈕才能按 2ms

 Test Files  1 passed (1)
      Tests  2 passed (2)
```

### 其他事件

`trigger` 可以觸發任何事件，名稱和你在模板裡寫的 `@` 後面那個一樣，例如 `trigger("submit")` 送出表單、`trigger("input")`、`trigger("blur")`。下一集就會用到 `trigger("submit")`。

## 重點整理

- `trigger("click")` 模擬點按鈕，`setValue(值)` 模擬打字、勾選或選擇。
- Vue 不會馬上更新畫面，所以 `trigger` 和 `setValue` 前面一定要加 `await`，測試函式要加 `async`。
- 忘了 `await` 的典型症狀：操作了，畫面卻還是舊的。
- `attributes("名稱")` 讀元素的 HTML 屬性，不存在時是 `undefined`。
