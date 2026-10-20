# `ref`

## 本集目標

用 `ref` 建立響應式資料，做出一個真的會動的計數器。

## 正文

### 用 `ref` 改寫計數器

把上一集的計數器改成這樣，`src/App.vue` 換成：

```vue
<script setup>
import { ref } from "vue";

const count = ref(0);

function handleClick() {
  count.value = count.value + 1;
}
</script>

<template>
  <p>已點 {{ count }} 次</p>
  <button @click="handleClick">加一</button>
</template>
```

存檔後點按鈕，數字跟著變了：`已點 1 次`、`已點 2 次`……

和上一集比，只改了三個地方：

1. `import { ref } from "vue";`：從 `vue` 這個套件拿出 `ref` 這個函式（第 2 章學過 `import`）。
2. `const count = ref(0);`：用 `ref` 建立一份響應式資料，初始值是 `0`。
3. `count.value = count.value + 1;`：要讀或改裡面的值，都要透過 `.value`。

模板裡還是寫 `{{ count }}`，不用加 `.value`。為什麼兩邊寫法不一樣，下一集會專門講。

### `ref` 是一個盒子

`ref(0)` 回傳的不是數字 `0`，而是一個**物件**，數字裝在它的 `value` 屬性裡。你可以把它想成一個盒子：

```text
count ──▶ ┌────────────┐
          │ value: 0   │
          └────────────┘
```

為什麼要多包一層？因為 Vue 需要「知道有人讀它、有人改它」。普通的數字被讀、被改的時候，Vue 完全沒辦法察覺；包成盒子之後，所有的讀寫都要經過 `.value`，Vue 就在 `.value` 這個入口守著：

- 渲染時讀了 `count.value`：Vue 記下「這段畫面用到了 `count`」。
- 之後有人改了 `count.value`：Vue 知道「`count` 變了」，把用到它的畫面重新渲染。

這就是上一集說的響應式資料要做到的兩件事。

想親眼看看這個盒子，可以打開第 4 章介紹的 Vue DevTools，點元件樹上的 `App`，`setup` 底下會列出 `count`。點「加一」時，那裡的數字也會即時跟著變。

### 為什麼可以用 `const`

`count` 是 `const`，可是值一直在變，這不衝突嗎？不衝突。第 1 章學陣列時說過：`const` 鎖的是「變數指向哪個盒子」，不是盒子裡的內容。你改的一直是盒子裡的 `value`，`count` 本身從頭到尾都指向同一個盒子。

所以 `ref` 一律用 `const` 宣告。真正不能做的是把盒子整個換掉：

```js,ignore
const count = ref(0);
count = 5; // TypeError: Assignment to constant variable.
```

要改值，永遠是改 `count.value`。

### 在模板裡直接改

改一個值這種小事，也可以直接寫在 `@click` 的引號裡：

```vue
<script setup>
import { ref } from "vue";

const count = ref(0);
</script>

<template>
  <p>已點 {{ count }} 次</p>
  <button @click="count++">加一</button>
  <button @click="count = 0">歸零</button>
</template>
```

在模板裡同樣不用寫 `.value`。`count++` 是 `count = count + 1` 的簡寫，第 1 章講 `for` 迴圈時看過。

### 回頭看看普通變數

把普通變數和 `ref` 放在同一個畫面，做個實驗。`src/App.vue` 換成：

```vue
<script setup>
import { ref } from "vue";

let plain = 0;
const count = ref(0);
</script>

<template>
  <p>普通變數：{{ plain }}</p>
  <button @click="plain++">普通變數加一</button>
  <p>ref：{{ count }}</p>
  <button @click="count++">ref 加一</button>
</template>
```

照這個順序做：

1. 點「普通變數加一」三次。畫面上還是 `普通變數：0`，和上一集一樣。
2. 點「ref 加一」一次。

第二步之後，**兩個數字一起變了**：`ref：1`，而且 `普通變數：3`。

原因是：`count` 變了，Vue 重新渲染這個元件，渲染時順便讀到了 `plain` 現在的值 3。這證明了上一集的說法：普通變數其實有在變，只是它變的時候沒有通知 Vue。要靠別人「順便」才更新的畫面，當然不能用，所以要顯示在畫面上、又會改變的資料，一律用 `ref`。

### 每個元件有自己的 `ref`

把計數器拆成獨立的元件，用兩次看看。

建立 `src/components/ClickCounter.vue`：

```vue
<script setup>
import { ref } from "vue";

const count = ref(0);
</script>

<template>
  <button @click="count++">已點 {{ count }} 次</button>
</template>
```

把 `src/App.vue` 換成：

```vue
<script setup>
import ClickCounter from "./components/ClickCounter.vue";
</script>

<template>
  <ClickCounter />
  <ClickCounter />
</template>
```

點第一個按鈕幾次，第二個按鈕的數字不會動。每用一次 `<ClickCounter />`，Vue 就會建立一個新的元件，`<script setup>` 也會各自執行一次，所以兩個元件有各自的 `count`，互不干擾。

這種「元件自己記住、會隨操作改變的資料」，通常叫做元件的**狀態**（state）。

## 重點整理

- 從 `vue` 匯入 `ref`，用 `const count = ref(初始值)` 建立響應式資料。
- `ref` 是一個盒子，值放在 `.value` 裡；在 `<script setup>` 裡讀寫都要加 `.value`。
- 模板裡直接寫 `count`，不用 `.value`。
- `ref` 用 `const` 宣告，改的是 `.value`，不是把整個盒子換掉。
- 每個元件實例都有自己的 `ref`，互不影響。
