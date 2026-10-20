# 測試 props 與 emit

## 本集目標

測試元件「接收什麼」和「發出什麼」：傳不同的 props 看畫面怎麼變，用 `emitted()` 檢查元件發出的事件。

## 正文

元件和外界溝通只有兩條路：父元件用 props 傳東西進來，元件用 emit 把事件丟出去（第 5 章學的 `defineEmits`）。測試一個元件，就是站在父元件的位置：給它 props，看它畫出什麼、丟出什麼事件。

### 要測的元件

建立 `src/components/SearchBox.vue`，一個搜尋框：

```vue
<!-- src/components/SearchBox.vue -->
<script setup lang="ts">
import { ref } from "vue";

defineProps<{ placeholder: string }>();
const emit = defineEmits<{ search: [keyword: string] }>();

const keyword = ref("");

function submit() {
  const text = keyword.value.trim();
  if (text === "") {
    return;
  }
  emit("search", text);
}
</script>

<template>
  <form @submit.prevent="submit">
    <input v-model="keyword" :placeholder="placeholder" />
    <button>搜尋</button>
  </form>
</template>
```

- `placeholder` 從 props 傳進來，顯示在輸入框裡當提示文字。
- 送出表單時，把關鍵字前後的空白去掉（`trim()`），如果還有字，就發出 `search` 事件，把關鍵字帶出去；沒有字就什麼都不做。
- `defineEmits<{ search: [keyword: string] }>()` 是第 10 章學的寫法：`search` 事件會帶一個字串。

### 測試 props：`setProps`

建立 `src/components/__tests__/SearchBox.spec.ts`，先測 props：

```ts
// src/components/__tests__/SearchBox.spec.ts
import { expect, test } from "vitest";
import { mount } from "@vue/test-utils";
import SearchBox from "../SearchBox.vue";

test("props 的 placeholder 會顯示在輸入框上", async () => {
  const wrapper = mount(SearchBox, {
    props: { placeholder: "找商品" },
  });
  const input = wrapper.get("input");
  expect(input.attributes("placeholder")).toBe("找商品");

  await wrapper.setProps({ placeholder: "找文章" });
  expect(input.attributes("placeholder")).toBe("找文章");
});
```

`mount` 時用 `props` 給初始值，之後想模擬「父元件把 props 換掉了」，用 `wrapper.setProps({ ... })`。它和 `trigger` 一樣會讓畫面更新，所以也要 `await`。

### 測試 emit：`emitted()`

在同一個檔案加上：

```ts
test("送出時發出 search 事件，帶著去掉空白的關鍵字", async () => {
  const wrapper = mount(SearchBox, {
    props: { placeholder: "找商品" },
  });

  await wrapper.get("input").setValue("  滑鼠 ");
  await wrapper.get("form").trigger("submit");

  expect(wrapper.emitted("search")).toEqual([["滑鼠"]]);
});

test("沒輸入就送出，不會發出 search 事件", async () => {
  const wrapper = mount(SearchBox, {
    props: { placeholder: "找商品" },
  });

  await wrapper.get("form").trigger("submit");

  expect(wrapper.emitted("search")).toBeUndefined();
});
```

wrapper 會把元件發出的每一個事件都記下來，`wrapper.emitted("search")` 就是 `search` 事件的紀錄。為什麼預期值是 `[["滑鼠"]]` 這種兩層的陣列？在第一個測試的 `expect` 前面暫時加一行 `console.log(wrapper.emitted());`，跑跑看：

```text
stdout | src/components/__tests__/SearchBox.spec.ts > 送出時發出 search 事件，帶著去掉空白的關鍵字
{
  input: [ [ [Event] ] ],
  change: [ [ [Event] ] ],
  search: [ [ '滑鼠' ] ],
  submit: [ [ [Event] ] ]
}
```

`emitted()` 不給名字時，會回傳一個物件，每個屬性是一種事件的紀錄：

- `search: [ [ '滑鼠' ] ]`：外層陣列是「發出過幾次」，這裡一次；內層陣列是「那一次帶了哪些值」，這裡只有一個 `'滑鼠'`。
- `input`、`change`、`submit` 是 `setValue` 和 `trigger` 觸發的原生 DOM 事件，它們也會被記下來。測試時通常只看你自己 `emit` 的那個事件，不用管它們。

沒發出過的事件，紀錄是 `undefined`，所以第二個測試用 `toBeUndefined()` 確認「沒有發出 `search`」。

看完記得把 `console.log` 刪掉。為了確認兩層陣列的意思，再加一個送出兩次的測試：

```ts
test("每送出一次，就多一筆紀錄", async () => {
  const wrapper = mount(SearchBox, {
    props: { placeholder: "找商品" },
  });

  await wrapper.get("input").setValue("滑鼠");
  await wrapper.get("form").trigger("submit");
  await wrapper.get("input").setValue("鍵盤");
  await wrapper.get("form").trigger("submit");

  expect(wrapper.emitted("search")).toHaveLength(2);
  expect(wrapper.emitted("search")).toEqual([["滑鼠"], ["鍵盤"]]);
});
```

```text
 ✓ src/components/__tests__/SearchBox.spec.ts (4 tests) 27ms
   ✓ props 的 placeholder 會顯示在輸入框上 21ms
   ✓ 送出時發出 search 事件，帶著去掉空白的關鍵字 2ms
   ✓ 沒輸入就送出，不會發出 search 事件 1ms
   ✓ 每送出一次，就多一筆紀錄 2ms

 Test Files  1 passed (1)
      Tests  4 passed (4)
```

### `defineModel` 也是 emit

第 5 章學的 `defineModel`，背後其實就是一個叫 `modelValue` 的 prop，加上一個叫 `update:modelValue` 的事件。所以測試方法一樣。建立 `src/components/StarRating.vue`：

```vue
<!-- src/components/StarRating.vue -->
<script setup lang="ts">
const rating = defineModel<number>({ required: true });
</script>

<template>
  <button v-for="n in 5" :key="n" @click="rating = n">
    {{ n <= rating ? '★' : '☆' }}
  </button>
</template>
```

建立 `src/components/__tests__/StarRating.spec.ts`：

```ts
// src/components/__tests__/StarRating.spec.ts
import { expect, test } from "vitest";
import { mount } from "@vue/test-utils";
import StarRating from "../StarRating.vue";

test("點第 4 顆星，發出 update:modelValue 事件", async () => {
  const wrapper = mount(StarRating, {
    props: { modelValue: 2 },
  });
  expect(wrapper.text()).toBe("★★☆☆☆");

  await wrapper.findAll("button")[3]?.trigger("click");

  expect(wrapper.emitted("update:modelValue")).toEqual([[4]]);
});
```

- 父元件寫 `<StarRating v-model="score" />`，等於傳了 `modelValue` 這個 prop。測試裡直接在 `props` 給 `modelValue`。
- `findAll("button")[3]` 是第 4 個按鈕（陣列從 0 開始數）。create-vue 的 TypeScript 設定比較嚴格，會提醒你「陣列裡不一定有第 4 個」，所以用第 2 章學的 `?.`：有的話才呼叫 `trigger`。
- 點下去之後，元件發出 `update:modelValue`，帶著 4。

測試裡沒有父元件，所以沒有人接住這個事件去更新 `modelValue`，畫面上還是兩顆星。這沒關係，這個元件該做的事是「發出正確的事件」，更新值是父元件的工作。

```text
 ✓ src/components/__tests__/StarRating.spec.ts (1 test) 12ms
   ✓ 點第 4 顆星，發出 update:modelValue 事件 12ms

 Test Files  1 passed (1)
      Tests  1 passed (1)
```

## 重點整理

- 測試元件就是站在父元件的位置：給 props，檢查畫面和發出的事件。
- `mount` 的 `props` 給初始值，`await wrapper.setProps({ ... })` 模擬父元件換掉 props。
- `wrapper.emitted("事件名")` 是兩層陣列：外層是第幾次，內層是那次帶的值；沒發出過是 `undefined`。
- `defineModel` 的元件，測 `modelValue` prop 和 `update:modelValue` 事件。
