# `watchEffect`

## 本集目標

用 `watchEffect` 自動追蹤用到的值，並且知道它和 `watch` 該怎麼選。

## 正文

### 不用說要監聽誰

上一集把輸入框同步到分頁標題的例子，用 `watchEffect` 可以寫得更短：

```vue
<script setup>
import { ref, watchEffect } from "vue";

const title = ref("我的筆記");
const unsaved = ref(false);

watchEffect(() => {
  document.title = unsaved.value ? `* ${title.value}` : title.value;
});
</script>

<template>
  <input v-model="title" />
  <label>
    <input v-model="unsaved" type="checkbox" />
    還沒存檔
  </label>
</template>
```

在輸入框打字，分頁標題會跟著變；勾選「還沒存檔」，標題前面會多一個 `*`。

和 `watch` 比起來，`watchEffect` 只收一個參數：一個函式。Vue 會：

1. **馬上執行一次**這個函式，不用另外寫 `immediate`。
2. 執行的同時，記下函式裡讀了哪些響應式資料。這個例子讀了 `title.value` 和 `unsaved.value`。
3. 之後這些資料只要有一個改變，就再執行一次。

你不用告訴它要監聽誰，用到什麼，它就監聽什麼。這叫做**自動追蹤依賴**，「依賴」指的就是函式用到的那些值。

### 只追蹤「真的讀到」的值

自動追蹤有一個細節：Vue 只記得**這一次執行時真的讀到**的值。

```vue
<script setup>
import { ref, watchEffect } from "vue";

const showName = ref(false);
const name = ref("小明");

watchEffect(() => {
  if (showName.value) {
    console.log(`名字是 ${name.value}`);
  } else {
    console.log("不顯示名字");
  }
});
</script>

<template>
  <label>
    <input v-model="showName" type="checkbox" />
    顯示名字
  </label>
  <input v-model="name" />
</template>
```

一開始 `showName` 是 `false`，函式只讀了 `showName.value`，沒走到讀 `name.value` 那一行，所以這時改名字不會印任何東西。勾選「顯示名字」之後，函式重新執行，這次讀到了 `name.value`，之後改名字就會印出來了。

### `async` 函式要特別小心

如果你把 `async` 函式交給 `watchEffect`，Vue 只會追蹤**第一個 `await` 之前**讀到的值。`await` 之後讀的值，改了也不會重新執行。這是常見的陷阱，所以第 6 集抓資料時，會改用明確寫出來源的 `watch`。

### 該用哪一個

| | `watch` | `watchEffect` |
| --- | --- | --- |
| 監聽誰 | 你明確指定 | 自動追蹤函式裡用到的 |
| 一開始執行 | 不會，除非加 `immediate` | 會 |
| 拿得到舊值 | 可以 | 不行 |

簡單的判斷方法：

- 要用到**舊值**，或是只想在**某個特定的值**改變時才執行，用 `watch`。
- 只是「把這幾個值同步到某個地方」，用到什麼就該跟著更新什麼，用 `watchEffect` 比較省事。

兩個都能用的時候，選讀起來比較清楚的那個。拿不定主意，就用 `watch`，因為它把「監聽誰」寫得清清楚楚。

## 重點整理

- `watchEffect(函式)` 會馬上執行一次，並自動追蹤函式裡讀到的響應式資料。
- 之後被追蹤的資料一改變，函式就重新執行。
- 只有這一次執行時真的讀到的值才會被追蹤；`async` 函式只追蹤第一個 `await` 之前的值。
- 需要舊值或要指定來源時用 `watch`，單純同步好幾個值時用 `watchEffect`。
