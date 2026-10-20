# 測試 composable

## 本集目標

測試第 6 章學的 composable：只用 `ref`、`computed` 的可以直接呼叫；用到生命週期 Hook 的，要先放進一個元件裡才能測。

## 正文

### 只用響應式 API 的 composable

建立 `src/composables/useCounter.ts`：

```ts
// src/composables/useCounter.ts
import { computed, ref } from "vue";

export function useCounter(initial = 0) {
  const count = ref(initial);
  const isZero = computed(() => count.value === 0);

  function increment() {
    count.value++;
  }

  function reset() {
    count.value = initial;
  }

  return { count, isZero, increment, reset };
}
```

`initial = 0` 是參數的預設值：呼叫時沒給，就是 0。

這個 composable 只用了 `ref` 和 `computed`，和元件沒有任何關係。所以測試它，就像測普通的函式一樣，直接呼叫。建立 `src/composables/__tests__/useCounter.spec.ts`：

```ts
// src/composables/__tests__/useCounter.spec.ts
import { expect, test } from "vitest";
import { useCounter } from "../useCounter";

test("increment 會加一，reset 回到初始值", () => {
  const { count, isZero, increment, reset } = useCounter(5);
  expect(count.value).toBe(5);
  expect(isZero.value).toBe(false);

  increment();
  expect(count.value).toBe(6);

  reset();
  expect(count.value).toBe(5);
});

test("初始值預設是 0", () => {
  const { count, isZero } = useCounter();
  expect(count.value).toBe(0);
  expect(isZero.value).toBe(true);
});
```

在 `.ts` 檔裡沒有模板幫你自動解包，所以讀 `ref` 和 `computed` 都要加 `.value`。

這裡不用 `await`：改了 `ref` 之後，`.value` 和 `computed` 是馬上就變的。要等的只有「畫面更新」，這個測試完全沒有畫面。

### 用到生命週期 Hook 的 composable

建立 `src/composables/useWindowWidth.ts`，追蹤視窗的寬度：

```ts
// src/composables/useWindowWidth.ts
import { onMounted, onUnmounted, ref } from "vue";

export function useWindowWidth() {
  const width = ref(0);

  function update() {
    width.value = window.innerWidth;
  }

  onMounted(() => {
    update();
    window.addEventListener("resize", update);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", update);
  });

  return width;
}
```

元件掛載時讀一次視窗寬度，並開始監聽 `resize`（視窗大小改變）事件；元件卸載時把監聽拿掉，這是第 6 章學的寫法。

照剛才的方式直接呼叫看看。建立 `src/composables/__tests__/useWindowWidth.spec.ts`：

```ts
// src/composables/__tests__/useWindowWidth.spec.ts
import { expect, test } from "vitest";
import { useWindowWidth } from "../useWindowWidth";

test("一開始是視窗的寬度", () => {
  const width = useWindowWidth();
  expect(width.value).toBe(1024);
});
```

jsdom 的假視窗預設寬度是 1024，所以預期是 1024。執行：

```text
stderr | src/composables/__tests__/useWindowWidth.spec.ts > 一開始是視窗的寬度
[Vue warn]: onMounted is called when there is no active component instance …
[Vue warn]: onUnmounted is called when there is no active component instance …

 FAIL  src/composables/__tests__/useWindowWidth.spec.ts > 一開始是視窗的寬度
AssertionError: expected +0 to be 1024 // Object.is equality
```

先是兩個 Vue 的警告（訊息很長，書上把後半段截掉了，用 `…` 表示）：「`onMounted` 被呼叫的時候，沒有正在設定中的元件」。第 6 章講 composable 的規則時說過，生命週期 Hook 一定要在元件的 `<script setup>` 裡（或是被它呼叫的 composable 裡）同步呼叫，Vue 才知道這個 Hook 屬於哪個元件。測試裡直接呼叫，沒有元件，`onMounted` 就不知道要掛在誰身上，裡面的 `update()` 永遠不會執行，所以 `width` 一直是 0。

### `withSetup`：借一個元件來用

解法是做一個什麼都不顯示的小元件，在它的 setup 裡呼叫 composable。Vue 官方文件提供了一個小幫手，把它改寫成 TypeScript，存成 `src/__tests__/withSetup.ts`：

```ts
// src/__tests__/withSetup.ts
import { createApp } from "vue";
import type { App } from "vue";

export function withSetup<T>(composable: () => T): [T, App] {
  let result: T | undefined;
  const app = createApp({
    setup() {
      result = composable();
      // 不需要畫面，給一個什麼都不渲染的函式，免得 Vue 警告沒有模板
      return () => {};
    },
  });
  app.mount(document.createElement("div"));
  return [result as T, app];
}
```

這段的細節不用完全看懂，知道它在做什麼就好：

- `createApp({ setup() { ... } })` 建立一個 app，它的根元件只有 setup，沒有模板。第 4 章在 `main.ts` 裡看過 `createApp(App)`，這裡只是把 `App` 換成一個當場寫的元件。`setup()` 就是 `<script setup>` 背後真正執行的函式，在這裡面呼叫 composable，生命週期 Hook 就有元件可以掛了。
- `return () => {}` 是這個元件的「畫面」，什麼都不畫。這種寫法叫 render function，附錄一會介紹，現在先照抄。
- `app.mount(document.createElement("div"))`：掛到一個新建的 `<div>` 上，`onMounted` 就會執行。
- 回傳 `[composable 的結果, app]`。`<T>` 是第 10 章學的泛型：composable 回傳什麼型別，`result` 就是什麼型別。`result as T` 告訴 TypeScript「這時候 `result` 一定已經有值了」。

放在 `src/__tests__` 裡，是讓它和測試檔用同一份 TypeScript 設定。檔名沒有 `.spec`，所以 Vitest 不會把它當成測試執行。

把 `useWindowWidth.spec.ts` 改成：

```ts
// src/composables/__tests__/useWindowWidth.spec.ts
import { expect, test } from "vitest";
import { withSetup } from "../../__tests__/withSetup";
import { useWindowWidth } from "../useWindowWidth";

function resizeTo(width: number) {
  window.innerWidth = width;
  window.dispatchEvent(new Event("resize"));
}

test("一開始是視窗的寬度，視窗變寬時跟著更新", () => {
  resizeTo(1024);
  const [width, app] = withSetup(() => useWindowWidth());
  expect(width.value).toBe(1024);

  resizeTo(500);
  expect(width.value).toBe(500);

  app.unmount();
});

test("卸載之後不再更新", () => {
  resizeTo(1024);
  const [width, app] = withSetup(() => useWindowWidth());

  app.unmount();
  resizeTo(500);

  expect(width.value).toBe(1024);
});
```

- `resizeTo` 是測試自己的小工具：把 jsdom 視窗的寬度改掉，再發出一個 `resize` 事件，假裝使用者拉了視窗。`dispatchEvent` 是「發出事件」，`trigger` 背後做的也是這件事。
- `const [width, app] = withSetup(...)` 是第 2 章學的陣列解構。
- `app.unmount()` 卸載 app，`onUnmounted` 會執行。第二個測試就是在檢查「卸載後有沒有把監聽拿掉」：拿掉了，之後再改視窗寬度，`width` 就不會變。
- 每個測試開頭都先 `resizeTo(1024)`，因為 `window` 是所有測試共用的，上一個測試改成 500，不改回來會影響下一個。

```bash
npx vitest run src/composables
```

```text
 ✓ src/composables/__tests__/useCounter.spec.ts (2 tests) 2ms
 ✓ src/composables/__tests__/useWindowWidth.spec.ts (2 tests) 5ms

 Test Files  2 passed (2)
      Tests  4 passed (4)
```

### 另一個選擇：透過元件測

如果 composable 本來就是給某個元件用的，也可以不測 composable，直接用前幾集的方法測那個元件：掛載、操作、檢查畫面。composable 對了，元件的畫面就會對。

`withSetup` 適合測「很多元件共用、自己有完整功能」的 composable。

## 重點整理

- 只用 `ref`、`computed` 的 composable，直接呼叫、檢查 `.value` 就能測。
- 用到 `onMounted` 等生命週期 Hook 的 composable，直接呼叫會出現 `[Vue warn]`，Hook 也不會執行。
- 用 `withSetup` 在一個沒有畫面的 app 裡呼叫 composable，`app.unmount()` 觸發 `onUnmounted`。
- `window` 這種全域的東西是所有測試共用的，每個測試開始前要先設定好。
