# `reactive`

## 本集目標

認識另一種建立響應式資料的方式 `reactive`，知道它的幾個陷阱，以及為什麼平常優先用 `ref`。

## 正文

### 不用 `.value` 的物件

除了 `ref`，Vue 還有一個 `reactive`，專門用來包物件和陣列。把 `src/App.vue` 換成：

```vue
<script setup>
import { reactive } from "vue";

const user = reactive({ name: "小明", age: 20 });

function handleBirthday() {
  user.age++;
}
</script>

<template>
  <p>{{ user.name }} 今年 {{ user.age }} 歲</p>
  <button @click="handleBirthday">過生日</button>
</template>
```

點按鈕，年齡加一。注意 `handleBirthday` 裡寫的是 `user.age++`，**沒有 `.value`**。

`reactive` 回傳的就是上一集講的代理人本身，沒有外面那層盒子，所以直接用就好。其實 `ref` 裝物件的時候，`.value` 裡的代理人就是 Vue 用 `reactive` 做出來的。

### 用它回傳的那一個

第 2 章第 11 集預告過：`reactive` 回傳的不是你交給它的那個物件。把 `src/App.vue` 換成：

```vue
<script setup>
import { reactive } from "vue";

const original = { name: "小明", age: 20 };
const user = reactive(original);

console.log(user === original);

function handleBirthday() {
  original.age++;
}
</script>

<template>
  <p>{{ user.name }} 今年 {{ user.age }} 歲</p>
  <button @click="handleBirthday">過生日</button>
</template>
```

Console 印出：

```text
false
```

`user` 是代理人，`original` 是原本的物件，兩者不是同一個。點「過生日」，改的是 `original`，繞過了代理人，畫面停在 20 歲，和上一集 `ref` 的情況一樣。所以交給 `reactive` 之後，**一律用它回傳的那一個**，原本的變數就別再碰了。實務上通常直接寫成 `reactive({ ... })`，根本不留原本的變數，也就不會用錯。

少寫 `.value` 看起來比較方便，但 `reactive` 有幾個陷阱，前兩個都和第 2 章第 11 集講的「物件是參考」有關。

### 陷阱一：整個換掉，就斷了

假設你想做一個「重設」按鈕，把使用者資料整個換成新的物件。直覺會這樣寫：

```js,ignore
const user = reactive({ name: "小明", age: 20 });

function handleReset() {
  user = reactive({ name: "小明", age: 20 });
  // TypeError: Assignment to constant variable.
}
```

`user` 是 `const`，不能重新指定。就算你改成 `let`，畫面也不會更新。

回想第 2 章的比喻：變數像一張標籤，貼在某個物件上。`user = 新物件` 只是把標籤撕下來，貼到另一個物件上。Vue 的代理人守的是**原本那個物件**，你換的是變數這張標籤，代理人完全不知道，就跟第 2 集的普通變數一樣，沒有人通知 Vue。

`ref` 就沒有這個問題，因為你換的是盒子裡的 `value`，而盒子的 `.value` 是有人守著的：

```js,ignore
const user = ref({ name: "小明", age: 20 });

function handleReset() {
  user.value = { name: "小明", age: 20 }; // 沒問題，畫面會更新
}
```

`reactive` 要重設，只能一個一個屬性改回去，或是用 `Object.assign` 一次把新的屬性值複製進原本的物件：

```js,ignore
Object.assign(user, { name: "小明", age: 20 });
```

`Object.assign(目標, 來源)` 會把「來源」的每個屬性，一個一個設定到「目標」上。目標還是原本那個代理人，所以畫面會更新。

### 陷阱二：解構出來就不會動了

第 2 章學過物件解構，用起來很方便。但用在 `reactive` 上要小心。把 `src/App.vue` 換成：

```vue
<script setup>
import { reactive } from "vue";

const user = reactive({ name: "小明", age: 20 });
const { age } = user;

function handleBirthday() {
  user.age++;
}
</script>

<template>
  <p>user.age：{{ user.age }}</p>
  <p>解構出來的 age：{{ age }}</p>
  <button @click="handleBirthday">過生日</button>
</template>
```

點幾次按鈕：`user.age` 一直增加，但「解構出來的 age」永遠停在 20。

`const { age } = user` 等於 `const age = user.age`。第 2 章說過，數字是直接複製值的，所以 `age` 拿到的只是那一瞬間的 20，一個普通的數字，和 `user` 再也沒有關係。代理人也幫不上忙，因為之後讀 `age` 根本不會經過它。

同樣的事情也會發生在你把 `user.age` 傳給一個函式的時候：函式收到的是數字，不是代理人。要保持響應式，就一直透過 `user.age` 去讀。

### 陷阱三：只能包物件和陣列

`reactive` 只能包物件和陣列。數字、字串、布林值不行：

```js,ignore
const count = reactive(0);
```

瀏覽器的 Console 會出現一個黃色的警告：

```text
[Vue warn] value cannot be made reactive: 0
```

`count` 拿到的就只是普通的 `0`，不會有響應式。

### `reactive` 裡的 `ref` 會自動解包

把 `ref` 放進 `reactive` 物件當屬性時，透過物件去讀，Vue 會自動打開盒子，不用寫 `.value`。把 `src/App.vue` 換成：

```vue
<script setup>
import { ref, reactive } from "vue";

const count = ref(0);
const state = reactive({ count });

function handleClick() {
  state.count++;
  console.log(state.count, count.value);
}
</script>

<template>
  <button @click="handleClick">加一</button>
</template>
```

點兩次按鈕，Console 印出：

```text
1 1
2 2
```

`state.count` 直接就是數字，`state.count++` 也不用 `.value`。而且改的就是 `count` 這個盒子裡的值，所以 `count.value` 跟著變，兩邊是連在一起的。第 4 集說過「包在普通物件裡的 `ref` 不會自動解包」，差別就在這裡：外面包的是 `reactive`，代理人會幫你打開盒子；普通物件沒有代理人，就不會。

這個規則現在用不太到，但第 8 章學 Pinia 時會再遇到，到時候記得「`ref` 放進 `reactive` 裡，讀的時候不用 `.value`」就好。

### 那該用哪一個？

Vue 官方的建議是：**優先用 `ref`**。理由就是上面這幾點：

- `ref` 什麼值都能放，`reactive` 只能放物件和陣列。
- `ref` 可以用 `.value = 新值` 整個換掉，`reactive` 不行。
- 多寫的 `.value` 反而是好事：看到 `.value`，你就知道這是響應式資料，不會不小心把它解構掉。

這本書接下來的範例都以 `ref` 為主。你仍然要看得懂 `reactive`，因為很多現有的程式碼和網路上的範例會用它，特別是表單：一個物件裝好幾個欄位，不用一直寫 `.value`，寫起來很順手，第 10 集會看到。

## 重點整理

- `reactive` 把物件或陣列變成響應式，不需要 `.value`；它回傳的代理人和原本的物件不是同一個，之後一律用它。
- 把 `reactive` 的變數整個換成新物件，畫面不會更新；要重設可以用 `Object.assign`。
- 從 `reactive` 物件解構出來的值，只是當下的複製品，不會跟著變。
- `ref` 放進 `reactive` 物件裡，透過物件讀寫時會自動解包，不用 `.value`。
- `reactive` 不能包數字、字串、布林值；官方建議優先用 `ref`。
