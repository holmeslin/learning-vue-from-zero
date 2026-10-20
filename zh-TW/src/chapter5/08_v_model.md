# `v-model`

## 本集目標

用 `v-model` 把輸入框和 `ref` 綁在一起，並且學會把輸入的字串變成數字。

## 正文

### 輸入什麼，就顯示什麼

把 `src/App.vue` 換成：

```vue
<script setup>
import { ref } from "vue";

const name = ref("");
</script>

<template>
  <label>
    名字：
    <input v-model="name" />
  </label>
  <p>哈囉，{{ name }}</p>
  <button @click="name = ''">清空</button>
</template>
```

在輸入框打字，下面的「哈囉，」後面會一個字一個字跟著出現。按「清空」，輸入框和下面的文字一起變空。

`v-model="name"` 讓輸入框和 `name` 兩邊互相同步：

- 你在輸入框打字 → `name` 跟著變。
- 程式改了 `name` → 輸入框裡的字跟著變。

這種兩個方向都會同步的綁定，叫做**雙向綁定**（two-way binding）。

### `v-model` 其實是兩件事

`v-model` 不是什麼魔法，它是兩件你已經會的事情合在一起。上面的輸入框，等於這樣寫：

```vue
<script setup>
import { ref } from "vue";

const name = ref("");
</script>

<template>
  <input :value="name" @input="name = $event.target.value" />
  <p>哈囉，{{ name }}</p>
</template>
```

- `:value="name"`：用第 4 章的 `v-bind`，把 `name` 放進輸入框。這是「資料 → 畫面」的方向。
- `@input="name = $event.target.value"`：每打一個字就觸發 `input` 事件，把輸入框目前的內容存回 `name`。這是「畫面 → 資料」的方向。

兩種寫法效果一樣，平常用 `v-model` 就好。知道它背後是這兩件事，之後學到第 12 集「讓自己的元件也能用 `v-model`」時，會比較好懂。

### 輸入框拿到的都是字串

做一個簡單的加法器。把 `src/App.vue` 換成：

```vue
<script setup>
import { ref } from "vue";

const a = ref(0);
const b = ref(0);
</script>

<template>
  <input v-model="a" /> +
  <input v-model="b" />
  = {{ a + b }}
</template>
```

一開始畫面顯示 `0 + 0 = 0`，看起來沒問題。先把兩個輸入框裡的 `0` 刪掉，再分別輸入 `1` 和 `2`，結果卻是：

```text
12
```

第 1 章講字串時提醒過這個陷阱：**從輸入框拿到的東西都是字串**。你打的 `1` 是字串 `"1"`，`"1" + "2"` 是把兩段字串接起來，得到 `"12"`。

### 把字串變成數字：`.number`

第 1 章說過，這一章會教怎麼把字串變成數字。在 Vue 裡最簡單的做法，是在 `v-model` 後面加上 `.number` 修飾符：

```vue
<script setup>
import { ref } from "vue";

const a = ref(0);
const b = ref(0);
</script>

<template>
  <input v-model.number="a" /> +
  <input v-model.number="b" />
  = {{ a + b }}
</template>
```

再輸入 `1` 和 `2`，這次得到 `3`。`.number` 會在把輸入框的內容存回 `a` 之前，先試著把它轉成數字。

有兩種情況它轉不了，會保持原本的字串：

- 輸入框是空的：存進去的是空字串 `""`。
- 輸入的東西不是數字開頭，例如 `abc`：存進去的就是 `"abc"`。

所以輸入框清空、或打了不是數字的東西時，`a` 又會變回字串，算出來的結果就不可靠。要避免使用者打錯，可以用 `type="number"` 的輸入框，第 3 章學過，它只能輸入數字，旁邊還有上下箭頭。`type="number"` 的輸入框搭配 `v-model` 時，Vue 會自動幫你轉成數字，效果和加上 `.number` 一樣：

```vue,ignore
<input type="number" v-model="a" />
```

### 另一種做法：`Number()`

有時候你拿到的字串不是從 `v-model` 來的，就用 JavaScript 內建的 `Number()` 轉換：

```js
console.log(Number("42"));
console.log(Number("3.5"));
console.log(Number(""));
console.log(Number("abc"));
```

```text
42
3.5
0
NaN
```

`NaN` 是「Not a Number」，表示「這不是一個數字」。注意空字串會變成 `0`，和 `.number` 的行為不一樣。

用在剛才的加法器上，可以不加 `.number`，改成在算的時候轉換：

```vue
<script setup>
import { ref, computed } from "vue";

const a = ref("");
const b = ref("");

const sum = computed(() => Number(a.value) + Number(b.value));
</script>

<template>
  <input v-model="a" /> +
  <input v-model="b" />
  = {{ sum }}
</template>
```

兩種做法都可以。資料本來就該是數字的（例如數量、年齡），用 `.number` 或 `type="number"` 在輸入時就轉好；只有某個計算需要數字時，用 `Number()` 在算的時候轉。

### 另外兩個修飾符

- `.trim`：自動去掉頭尾的空白。使用者常常不小心多打一個空白，名字、帳號這類欄位很適合加上：`v-model.trim="name"`。
- `.lazy`：不要每打一個字就更新，等到輸入框失去焦點（點到別的地方）或按 Enter 時才更新：`v-model.lazy="name"`。

修飾符可以一起用，例如 `v-model.lazy.trim="name"`。

## 重點整理

- `v-model` 讓輸入框和 `ref` 雙向綁定：打字會改資料，改資料也會改輸入框。
- `v-model` 等於 `:value` 加上 `@input` 兩件事。
- 輸入框拿到的都是字串；加上 `.number`，或用 `type="number"`，Vue 會幫你轉成數字。
- 不是從 `v-model` 來的字串，用 `Number()` 轉換；轉不了會得到 `NaN`。
- `.trim` 去掉頭尾空白，`.lazy` 改成離開輸入框才更新。
