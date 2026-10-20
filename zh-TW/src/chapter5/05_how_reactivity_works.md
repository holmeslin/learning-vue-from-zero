# 響應式是怎麼運作的

## 本集目標

用 `ref` 裝陣列和物件，直接改裡面的東西讓畫面更新，並且大致知道 Vue 是怎麼辦到的。

## 正文

### 直接改陣列，畫面就會變

第 1 章學陣列時預告過：到了 Vue，直接改陣列，畫面就會自動更新。現在來兌現。把 `src/App.vue` 換成：

```vue
<script setup>
import { ref } from "vue";

const fruits = ref(["蘋果", "香蕉"]);

function handleAdd() {
  fruits.value.push("芭樂");
}

function handleReplace() {
  fruits.value[1] = "葡萄";
}
</script>

<template>
  <ul>
    <li v-for="(fruit, index) in fruits" :key="index">{{ fruit }}</li>
  </ul>
  <p>共 {{ fruits.length }} 種水果</p>
  <button @click="handleAdd">加入芭樂</button>
  <button @click="handleReplace">把第二個換成葡萄</button>
</template>
```

點「加入芭樂」，清單多一項，下面的「共 N 種水果」也跟著變。點「把第二個換成葡萄」，香蕉就變成葡萄。

`push` 和 `fruits.value[1] = ...` 都是第 1 章學的普通陣列操作，你沒有通知任何人，Vue 卻知道陣列變了。第 4 章說過不要用索引當 `key`，這裡是例外：水果名稱可能重複，不能拿來當 `key`，而這個範例只會在尾端加項目、不會刪除或換順序，索引不會錯位。實際的資料通常會有自己的 `id`，最後一集的待辦清單就會用到。

物件也一樣：

```vue
<script setup>
import { ref } from "vue";

const user = ref({ name: "小明", age: 20 });
</script>

<template>
  <p>{{ user.name }} 今年 {{ user.age }} 歲</p>
  <button @click="user.age++">過生日</button>
</template>
```

點「過生日」，年齡加一。在 `<script setup>` 裡要寫成 `user.value.age++`，模板裡就像上一集說的，直接寫 `user.age++`。

### Vue 怎麼知道的：代理人

祕密在於：當你把陣列或物件交給 `ref`，`fruits.value` 拿到的**不是你原本那個陣列**，而是 Vue 幫它安排的一個**代理人**。

想像一個明星和他的經紀人。外面的人想找明星，一律要透過經紀人；經紀人會把每一次聯絡都記下來。你以為你在直接操作陣列，其實每一次讀和寫，都先經過這個代理人：

```text
渲染時讀 fruits.length
  └▶ 代理人記下：「這段畫面用到了 length」

點按鈕，fruits.value.push("芭樂")
  └▶ 代理人發現 length 和內容變了
  └▶ 通知 Vue：「用到它們的畫面請重新渲染」
```

JavaScript 本身就有做出這種代理人的功能，叫做 **Proxy**（英文的「代理」）。你不需要自己寫 Proxy，`ref` 會幫你處理好。你只要知道：

- 透過 `.value` 拿到的陣列、物件，都是代理人，讀和寫都會被記錄。
- 代理人是**一路往下**的：物件裡的物件、陣列裡的物件，也都會有自己的代理人。所以 `todos.value[0].done = true` 這種改深層屬性的寫法，畫面一樣會更新。

### 看看代理人

代理人和原本的陣列，不是同一個東西。把 `src/App.vue` 換成：

```vue
<script setup>
import { ref } from "vue";

const original = ["蘋果", "香蕉"];
const fruits = ref(original);

console.log(fruits.value === original);

function handleAddOriginal() {
  original.push("芭樂");
}
</script>

<template>
  <p>{{ fruits.join('、') }}</p>
  <button @click="handleAddOriginal">直接改原本的陣列</button>
</template>
```

存檔後 Console 印出：

```text
false
```

`fruits.value` 是代理人，`original` 是原本的陣列，兩者不是同一個。

點按鈕，`original.push` 確實把芭樂加進去了（代理人背後代表的就是這個陣列），但它**繞過了代理人**，沒有人通知 Vue，所以畫面不會變。這和第 2 集的普通變數是同樣的道理。

結論很簡單：交給 `ref` 之後，就只透過 `fruits.value` 去改它，不要再碰原本的變數。

### 換一個新陣列也可以

第 2 章第 11 集學過另一種更新方式：不改原本的陣列，而是做一份新的。在 Vue 裡，這樣也可以，只要把新的陣列放進盒子：

```vue
<script setup>
import { ref } from "vue";

const fruits = ref(["蘋果", "香蕉", "芭樂"]);

function handleRemoveBanana() {
  fruits.value = fruits.value.filter((fruit) => fruit !== "香蕉");
}
</script>

<template>
  <p>{{ fruits.join('、') }}</p>
  <button @click="handleRemoveBanana">拿掉香蕉</button>
</template>
```

`fruits.value = 新陣列` 是在改盒子的 `value`，Vue 一樣收得到通知，新的陣列也會被換上新的代理人。

所以在 Vue 裡，兩種方式都能用：

- 直接改：`push`、`splice`、`arr[i] = x`、`obj.age++`。
- 做一份新的放回去：`fruits.value = fruits.value.filter(...)`。

挑讀起來比較清楚的那種就好。加一項用 `push` 很直覺；刪掉符合條件的項目，用 `filter` 通常比較好寫。

## 重點整理

- `ref` 裡的陣列和物件可以直接改，例如 `push`、`arr[i] = x`、`obj.age++`，畫面會自動更新。
- 原理是 Vue 用 Proxy 幫資料安排一個代理人，記下誰讀了它、在被改時通知 Vue。
- 代理人是一路往下的，深層的屬性改了也會更新畫面。
- 要透過 `.value` 去改；繞過代理人直接改原本的變數，畫面不會更新。
- 把新的陣列或物件指定給 `.value` 也可以，兩種寫法挑清楚的用。
