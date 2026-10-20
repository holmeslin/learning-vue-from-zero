# `<KeepAlive>`

## 本集目標

用 `<component :is>` 切換元件，再用 `<KeepAlive>` 讓切走的元件保留狀態，切回來時不會重來。

## 正文

### 先做一個分頁切換

準備兩個分頁元件。建立 `src/components/TabCounter.vue`：

```vue
<script setup>
import { ref } from "vue";

const count = ref(0);
</script>

<template>
  <button @click="count++">按了 {{ count }} 次</button>
</template>
```

建立 `src/components/TabNotes.vue`：

```vue
<script setup>
import { ref, onActivated, onDeactivated } from "vue";

const text = ref("");

onActivated(() => {
  console.log("筆記分頁：回到畫面上");
});

onDeactivated(() => {
  console.log("筆記分頁：先收起來");
});
</script>

<template>
  <textarea v-model="text" placeholder="寫點什麼…"></textarea>
</template>
```

`onActivated` 和 `onDeactivated` 先不用管，等一下會講。把 `src/App.vue` 換成：

```vue
<script setup>
import { ref } from "vue";
import TabCounter from "./components/TabCounter.vue";
import TabNotes from "./components/TabNotes.vue";

const tabs = {
  counter: TabCounter,
  notes: TabNotes,
};
const current = ref("counter");
</script>

<template>
  <button @click="current = 'counter'">計數器</button>
  <button @click="current = 'notes'">筆記</button>

  <component :is="tabs[current]" />
</template>
```

按「計數器」和「筆記」可以切換下面顯示的元件。

### `<component :is>`：要畫哪個元件，用變數決定

`<component>` 是 Vue 內建的特殊標籤，它本身不是任何元件，而是「`:is` 給它哪個元件，它就變成哪個」。

`tabs` 是一個普通物件，把名稱對應到 `import` 進來的元件。`current` 是 `"counter"` 時，`tabs[current]` 就是 `TabCounter`（第 1 章學過用中括號讀物件屬性），畫面上就是計數器；改成 `"notes"`，就換成筆記。

用第 4 章的 `v-if` / `v-else` 也做得到，但分頁一多，`<component :is>` 寫起來短很多。

### 問題：切回來就重來了

試試看：計數器按到 3，切到筆記打幾個字，再切回計數器。計數器變回「按了 0 次」；再切到筆記，剛剛打的字也不見了。

原因是切換時，舊的元件被**卸載**（第 6 章的 `onUnmounted` 會執行），新的元件重新**掛載**。卸載的元件連同它的 `ref` 都被丟掉了，再出現時是一個全新的元件，狀態從頭開始。

### 用 `<KeepAlive>` 包起來

把 `src/App.vue` 換成：

```vue
<script setup>
import { ref } from "vue";
import TabCounter from "./components/TabCounter.vue";
import TabNotes from "./components/TabNotes.vue";

const tabs = {
  counter: TabCounter,
  notes: TabNotes,
};
const current = ref("counter");
</script>

<template>
  <button @click="current = 'counter'">計數器</button>
  <button @click="current = 'notes'">筆記</button>

  <KeepAlive>
    <component :is="tabs[current]" />
  </KeepAlive>
</template>
```

再做一次同樣的事：計數器按到 3、切到筆記打字、切回來。這次計數器還是 3，筆記裡的字也都還在。

`<KeepAlive>` 是 Vue 內建的元件。被它包住的元件切走時不會被卸載，而是先**收起來**，暫存在記憶體裡；切回來時直接拿出來用，`ref` 的值原封不動。

### 收起來、拿出來的時候：`onActivated` / `onDeactivated`

被 `<KeepAlive>` 收起來的元件不會卸載，所以 `onUnmounted` 不會執行；拿出來時也不是重新掛載，`onMounted` 也不會再執行。

如果你想在這兩個時間點做事，例如分頁拿出來時重新抓一次最新資料，就用 `TabNotes.vue` 裡的這兩個生命週期 Hook：

- `onActivated`：元件出現在畫面上時執行，**包括第一次掛載**。
- `onDeactivated`：元件被收起來時執行。

打開 Console，依序按「筆記」「計數器」「筆記」：

```text
筆記分頁：回到畫面上
筆記分頁：先收起來
筆記分頁：回到畫面上
```

第一行是筆記分頁第一次出現。

### 只保留某些元件：`include`

不是每個分頁都值得留著。`include` 可以指定只保留哪些元件：

```vue,ignore
<KeepAlive include="TabNotes">
  <component :is="tabs[current]" />
</KeepAlive>
```

這樣筆記分頁的內容會保留，計數器每次切回來都歸零。

`include` 比對的是元件的**名字**。用 `<script setup>` 寫的元件，名字就是它的檔名，`TabNotes.vue` 的名字是 `TabNotes`。要保留好幾個，用逗號隔開：`include="TabNotes,TabCounter"`。

另外還有 `max`，限制最多暫存幾個元件，例如 `<KeepAlive :max="5">`。超過時，最久沒用到的那個會被真的卸載。暫存的元件會一直占用記憶體，分頁很多時記得設個上限。

## 重點整理

- `<component :is="元件">` 用變數決定要畫哪個元件，適合做分頁切換。
- 一般切換時，舊元件會被卸載，狀態全部歸零。
- 用 `<KeepAlive>` 包起來，切走的元件會被暫存，切回來時狀態還在。
- 被暫存的元件用 `onActivated` / `onDeactivated` 知道自己被拿出來或收起來。
- `include` 依元件名字（`<script setup>` 是檔名）決定要保留哪些，`max` 限制暫存的數量。
