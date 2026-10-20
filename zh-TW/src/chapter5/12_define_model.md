# `defineModel`

## 本集目標

用 `defineModel` 讓自己寫的元件也能用 `v-model`，和父元件的資料雙向綁定。

## 正文

### 自己做一個數量選擇器

購物網站常見一種「− 1 +」的數量選擇器。把它做成元件，希望父元件可以像用輸入框一樣，寫 `v-model="qty"` 就和自己的資料綁在一起。

建立 `src/components/QuantityPicker.vue`：

```vue
<script setup>
const count = defineModel();
</script>

<template>
  <button @click="count--">−</button>
  {{ count }}
  <button @click="count++">+</button>
</template>
```

把 `src/App.vue` 換成：

```vue
<script setup>
import { ref } from "vue";
import QuantityPicker from "./components/QuantityPicker.vue";

const qty = ref(1);
</script>

<template>
  <QuantityPicker v-model="qty" />
  <p>你要買 {{ qty }} 個</p>
  <button @click="qty = 1">重設</button>
</template>
```

點「+」，選擇器和下面的「你要買 N 個」一起變；點「重設」，兩邊又一起回到 1。資料在兩個方向都同步了，就像第 8 集輸入框的 `v-model`。

`defineModel()` 和 `defineProps`、`defineEmits` 一樣，不用 `import`。它回傳一個 `ref`，代表「父元件用 `v-model` 交給我的那份資料」：

- 讀它：拿到父元件的 `qty`。
- 改它：父元件的 `qty` 跟著改。

在模板裡寫 `count++` 就好；在 `<script setup>` 裡，它和普通的 `ref` 一樣要寫 `count.value`。

### 它其實是 props 加 emit

上一集才說「子元件不能改 props」，怎麼這裡又可以改了？其實沒有破例。第 8 集說過，輸入框的 `v-model` 是 `:value` 加上 `@input`；用在元件上的 `v-model` 也是兩件事合在一起：

```vue,ignore
<QuantityPicker v-model="qty" />

<!-- 等於 -->
<QuantityPicker
  :modelValue="qty"
  @update:modelValue="(value) => (qty = value)"
/>
```

- 往下：用一個叫 `modelValue` 的 prop，把 `qty` 傳給子元件。
- 往上：子元件發出一個叫 `update:modelValue` 的事件，附上新的值，父元件收到後自己去改 `qty`。

`defineModel` 把子元件這邊的兩件事都包好了：讀 `count.value` 時，讀的是 `modelValue` 這個 prop；改 `count.value` 時，它幫你 `emit("update:modelValue", 新的值)`。真正改 `qty` 的還是父元件，「資料是誰的，就由誰來改」的規則沒有變，只是你不用自己寫。

如果不用 `defineModel`，`src/components/QuantityPicker.vue` 要自己這樣寫，效果完全一樣：

```vue
<script setup>
defineProps(["modelValue"]);
const emit = defineEmits(["update:modelValue"]);
</script>

<template>
  <button @click="emit('update:modelValue', modelValue - 1)">−</button>
  {{ modelValue }}
  <button @click="emit('update:modelValue', modelValue + 1)">+</button>
</template>
```

`defineModel` 是 Vue 3.4 才加入的。網路上比較舊的教學或程式碼，會看到上面這種寫法，看得懂就好，自己寫用 `defineModel`。

### 把 `v-model` 交給裡面的輸入框

元件裡面包著一個輸入框時，可以直接把 `defineModel` 回傳的 `ref` 交給輸入框的 `v-model`。建立 `src/components/SearchBox.vue`：

```vue
<script setup>
const keyword = defineModel();
</script>

<template>
  <label>
    搜尋：
    <input v-model="keyword" placeholder="輸入水果名稱" />
  </label>
  <button @click="keyword = ''">清除</button>
</template>
```

把 `src/App.vue` 換成：

```vue
<script setup>
import { ref, computed } from "vue";
import SearchBox from "./components/SearchBox.vue";

const fruits = ["蘋果", "香蕉", "芭樂", "鳳梨", "蓮霧"];
const keyword = ref("");

const results = computed(() => {
  return fruits.filter((fruit) => fruit.includes(keyword.value));
});
</script>

<template>
  <SearchBox v-model="keyword" />
  <ul>
    <li v-for="fruit in results" :key="fruit">{{ fruit }}</li>
  </ul>
</template>
```

在搜尋框打「蓮」，清單只剩下蓮霧。按「清除」，所有水果又回來了。

資料一路串起來：輸入框 ⇄ `SearchBox` 的 `keyword` ⇄ `App` 的 `keyword`。`App` 拿到關鍵字，用第 7 集的 `computed` 和第 2 章的 `filter` 算出搜尋結果。`SearchBox` 只管輸入，不知道也不用知道外面拿關鍵字去做什麼。

### 不只一個 `v-model`

一個元件需要綁好幾份資料時，可以幫 `v-model` 取名字。在子元件寫 `defineModel("名字")`，父元件寫 `v-model:名字`。例如一個同時編輯姓和名的元件：

```vue,ignore
<!-- 子元件 -->
<script setup>
const firstName = defineModel("firstName");
const lastName = defineModel("lastName");
</script>

<!-- 父元件 -->
<NameEditor v-model:first-name="first" v-model:last-name="last" />
```

沒取名字的 `defineModel()`，就是對應到父元件不帶名字的 `v-model`。

## 重點整理

- 子元件用 `const model = defineModel()`，父元件就能對它寫 `v-model`。
- `defineModel` 回傳一個 `ref`：讀它拿到父元件的值，改它會更新父元件的值。
- 元件上的 `v-model` 等於 `modelValue` 這個 prop 加上 `update:modelValue` 事件，`defineModel` 幫你處理好這兩件事。
- 元件裡的輸入框可以直接 `v-model` 到 `defineModel` 回傳的 `ref`。
- 需要多個 `v-model` 時，用 `defineModel("名字")` 搭配 `v-model:名字`。
