# 用 `vi.fn` 做出假函式

## 本集目標

用 `vi.fn` 做出一個會記住被呼叫情形的假函式，檢查「它有沒有被呼叫、用什麼參數呼叫」。

## 正文

### 為什麼要用假的

上一集的 `loadUsers` 是自己寫的一個小函式，只能決定它回傳什麼，沒辦法知道「元件到底呼叫了它幾次」。如果元件不小心呼叫了兩次，就會連兩次網路，測試卻抓不到。

這時候用**模擬**（mock）：做一個假的東西頂替真的，測試可以控制它回傳什麼，還能查它被呼叫的紀錄。Vitest 的模擬工具都放在 `vi` 這個物件裡。

### `vi.fn()` 的基本用法

建立 `src/components/__tests__/mockFunctions.spec.ts`，先單純試試 `vi.fn`：

```ts
// src/components/__tests__/mockFunctions.spec.ts
import { expect, test, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import SearchBox from "../SearchBox.vue";
import UserList from "../UserList.vue";

test("vi.fn 會記住每次被呼叫的情形", () => {
  const greet = vi.fn();

  greet("小明");
  greet("小華", 18);

  expect(greet).toHaveBeenCalledTimes(2);
  expect(greet).toHaveBeenCalledWith("小明");
  expect(greet).toHaveBeenLastCalledWith("小華", 18);
});
```

`vi.fn()` 做出一個什麼都不做的假函式（回傳 `undefined`），但它會**記住每次被呼叫的情形**。之後可以用這些比較方式檢查：

| 比較方式 | 意思 |
| --- | --- |
| `toHaveBeenCalled()` | 被呼叫過 |
| `toHaveBeenCalledTimes(n)` | 被呼叫了 `n` 次 |
| `toHaveBeenCalledWith(...)` | 曾經用這些參數呼叫過（任何一次都算） |
| `toHaveBeenLastCalledWith(...)` | 最後一次是用這些參數呼叫 |

最上面先把這一集會用到的 `SearchBox` 和 `UserList` 都匯入了，等一下會用到。

### 讓假函式回傳東西

接著用假函式取代上一集的 `loadUsers`：

```ts
test("掛載時呼叫一次 loadUsers", async () => {
  const loadUsers = vi.fn().mockResolvedValue(["小明", "小華"]);

  const wrapper = mount(UserList, { props: { loadUsers } });
  await flushPromises();

  expect(loadUsers).toHaveBeenCalledTimes(1);
  expect(wrapper.findAll("li")).toHaveLength(2);
});
```

`.mockResolvedValue(資料)` 的意思是：這個假函式被呼叫時，回傳一個成功、結果是這份資料的 Promise。效果和上一集的 `() => Promise.resolve(["小明", "小華"])` 一樣，但多了呼叫紀錄，可以檢查「只呼叫了一次」。

想讓它失敗，就用 `.mockRejectedValue(new Error("網路斷線"))`。只想回傳普通的值（不是 Promise），用 `.mockReturnValue(值)`。

### 用假函式接住 emit

上一集用 `emitted()` 檢查事件，另一個做法是：像父元件一樣「監聽」那個事件，交給一個假函式。

```ts
test("用 onSearch 接住 search 事件", async () => {
  const onSearch = vi.fn();
  const wrapper = mount(SearchBox, {
    props: { placeholder: "找商品", onSearch },
  });

  await wrapper.get("input").setValue("滑鼠");
  await wrapper.get("form").trigger("submit");

  expect(onSearch).toHaveBeenCalledWith("滑鼠");
});
```

父元件寫 `<SearchBox @search="handleSearch" />` 時，Vue 實際上是把 `@search` 變成一個叫 `onSearch` 的 prop 傳進去，`on` 加上事件名稱、第一個字母大寫。所以測試裡在 `props` 給 `onSearch`，就等於監聽了 `search` 事件。元件 `emit("search", "滑鼠")` 時，`onSearch` 就會被用 `"滑鼠"` 呼叫。

`emitted()` 和這個寫法檢查的是同一件事，選一個你覺得好讀的就好。

### 參數不對時的訊息

把最後一行的 `"滑鼠"` 改成 `"鍵盤"`，看看失敗的樣子：

```text
 FAIL  src/components/__tests__/mockFunctions.spec.ts > 用 onSearch 接住 search 事件
AssertionError: expected "vi.fn()" to be called with arguments: [ '鍵盤' ]

Received:

  1st vi.fn() call:

  [
-   "鍵盤",
+   "滑鼠",
  ]


Number of calls: 1
```

訊息列出了實際的每一次呼叫：第 1 次（`1st`）呼叫的參數是 `"滑鼠"`，`-` 是預期的、`+` 是實際的，總共被呼叫了 1 次。改回 `"滑鼠"` 就會通過：

```text
 ✓ src/components/__tests__/mockFunctions.spec.ts (3 tests) 16ms
   ✓ vi.fn 會記住每次被呼叫的情形 2ms
   ✓ 掛載時呼叫一次 loadUsers 10ms
   ✓ 用 onSearch 接住 search 事件 4ms

 Test Files  1 passed (1)
      Tests  3 passed (3)
```

## 重點整理

- `vi.fn()` 做出假函式，它會記住每次被呼叫的參數和次數。
- 用 `toHaveBeenCalledTimes`、`toHaveBeenCalledWith` 檢查呼叫紀錄。
- `.mockResolvedValue(資料)` 讓假函式回傳成功的 Promise，`.mockRejectedValue(錯誤)` 回傳失敗的。
- 在 `mount` 的 `props` 給 `on事件名`（例如 `onSearch`），就能用假函式接住元件發出的事件。
