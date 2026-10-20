# 看懂 Options API

## 本集目標

看到網路上用 `data`、`methods`、`this` 寫的 Vue 程式碼時，知道它在做什麼，並且能把它對應回 `<script setup>` 的寫法。

## 正文

### 為什麼要學一個不用的寫法

這本書只教 `<script setup>`，這是 Vue 3 官方推薦的寫法。但 Vue 已經有十幾年歷史，Vue 2 時代（2016 到 2023 年左右）的教學文章、Stack Overflow 的回答、公司裡的舊專案，大量使用另一種寫法：**Options API**。

Options API 在 Vue 3 裡還是完全可以用，官方也沒有要移除它。你不需要學會「用它寫」，但最好能「看得懂」，這樣網路上的範例和舊專案就不會讓你卡住。

這一集用 JavaScript，因為網路上的舊程式碼幾乎都是 JavaScript。建一個練習專案：

```bash
npm create vue@latest -- appendix-js --jsx
cd appendix-js
npm install
```

`--jsx` 是「render function 與 JSX」那一集才會用到的功能，先一起加上，兩集可以共用這個專案。沒有加 `--ts`，所以這是 JavaScript 專案。

### 同一個元件，兩種寫法

一個計數器：每按一次加上 `step`，旁邊顯示兩倍的值，底下記錄每次的變化，到 10 以上就通知父元件。

先看你熟悉的 `<script setup>` 版本，存成 `src/components/SetupCounter.vue`：

```vue
<script setup>
import { computed, onMounted, ref, watch } from "vue";

const props = defineProps({
  step: { type: Number, default: 1 },
});
const emit = defineEmits(["reached"]);

const count = ref(0);
const history = ref([]);

const doubled = computed(() => count.value * 2);

watch(count, (newValue, oldValue) => {
  history.value.push(`${oldValue}→${newValue}`);
  if (newValue >= 10) {
    emit("reached", newValue);
  }
});

function increment() {
  count.value += props.step;
}

onMounted(() => {
  console.log("掛載完成，count 是", count.value);
});
</script>

<template>
  <button @click="increment">{{ count }}（兩倍是 {{ doubled }}）</button>
  <p>{{ history.join('、') }}</p>
</template>
```

再看 Options API 版本，存成 `src/components/OptionsCounter.vue`：

```vue
<script>
export default {
  props: {
    step: { type: Number, default: 1 },
  },
  emits: ["reached"],
  data() {
    return {
      count: 0,
      history: [],
    };
  },
  computed: {
    doubled() {
      return this.count * 2;
    },
  },
  watch: {
    count(newValue, oldValue) {
      this.history.push(`${oldValue}→${newValue}`);
      if (newValue >= 10) {
        this.$emit("reached", newValue);
      }
    },
  },
  methods: {
    increment() {
      this.count += this.step;
    },
  },
  mounted() {
    console.log("掛載完成，count 是", this.count);
  },
};
</script>

<template>
  <button @click="increment">{{ count }}（兩倍是 {{ doubled }}）</button>
  <p>{{ history.join('、') }}</p>
</template>
```

把兩個都放進 `src/App.vue`：

```vue
<script setup>
import { ref } from "vue";
import OptionsCounter from "./components/OptionsCounter.vue";
import SetupCounter from "./components/SetupCounter.vue";

const message = ref("");
</script>

<template>
  <OptionsCounter :step="3" @reached="(n) => (message = `到 ${n} 了`)" />
  <SetupCounter :step="3" @reached="(n) => (message = `到 ${n} 了`)" />
  <p>{{ message }}</p>
</template>
```

執行 `npm run dev`，兩個按鈕的行為一模一樣。各按四次，兩邊都會顯示「12（兩倍是 24）」，底下記錄「0→3、3→6、6→9、9→12」，最下面出現「到 12 了」。打開瀏覽器的 Console，會看到「掛載完成，count 是 0」印了兩次，一個元件一次。

注意：`<template>` 的部分**完全一樣**。兩種寫法的差別只在 `<script>`。

### 一個大物件，分成幾格

Options API 的 `<script>` 沒有 `setup`，而是 `export default` 一個物件。這個物件有幾個固定名字的「格子」（option），每種東西放進對應的格子：

| Options API | 放什麼 | `<script setup>` 的對應 |
| --- | --- | --- |
| `props` | 接收的 props | `defineProps()` |
| `emits` | 會發出的事件 | `defineEmits()` |
| `data()` | 狀態，回傳一個物件 | `ref()` / `reactive()` |
| `computed` | 算出來的值 | `computed()` |
| `watch` | 監聽某個值的變化 | `watch()` |
| `methods` | 函式 | 一般的 `function` |
| `mounted()` | 掛載後執行 | `onMounted()` |

名稱幾乎都對得起來，因為 Composition API 就是照著這些概念設計的。

幾個細節：

- `data` 是一個**函式**，回傳一個物件，物件裡的每個屬性都是響應式的狀態。寫成函式是為了讓同一個元件用在好幾個地方時，每一份都拿到自己的狀態，不會共用。
- `watch` 裡的鍵是要監聽的狀態名稱，`count(newValue, oldValue)` 就是「監聽 `count`」。
- 生命週期 Hook 直接寫成物件的方法，名字沒有 `on`：`mounted`、`unmounted`、`beforeUnmount`、`updated`。另外常看到 `created`，它在元件建立、還沒掛載時執行，在 `<script setup>` 裡，直接寫在最外層的程式碼就是在這個時間點執行的，所以不需要對應的 Hook。

### `this` 是什麼

Options API 版本裡到處都是 `this`：`this.count`、`this.step`、`this.$emit`。

`this` 指的是「目前這個元件」。Vue 會把 `data` 回傳的屬性、`props`、`computed`、`methods` 全部掛到同一個 `this` 上，所以不管東西是放在哪一格，都用 `this.名字` 拿。

這帶來兩個你在 `<script setup>` 裡不用煩惱的差異：

1. **沒有 `.value`**。`this.count += 1` 就能更新，因為 `this` 會幫你處理響應式。在 `<script setup>` 裡要寫 `count.value`。
2. **Vue 內建的功能前面加 `$`**。`this.$emit` 發出事件，`this.$refs` 拿模板 ref，`this.$router` 換頁，`this.$route` 讀目前的路由。看到 `$` 開頭的，就是 Vue 或外掛提供的東西。

模板裡不需要寫 `this`，`{{ count }}` 就會自動找到 `this.count`。這也是模板在兩種寫法下可以完全一樣的原因。

### 常見的坑：箭頭函式

在 Options API 裡，`methods`、`computed`、`watch` 裡的函式**不能寫成箭頭函式**：

```js
export default {
  data() {
    return { count: 0 };
  },
  methods: {
    // 錯誤：箭頭函式沒有自己的 this
    increment: () => {
      this.count++;
    },
  },
};
```

第 2 章學過箭頭函式。它有一個特性：沒有自己的 `this`，會沿用外面的 `this`。外面是模組的最上層，那裡的 `this` 是 `undefined`，所以按下按鈕時數字不會變，瀏覽器的 Console 會出現錯誤。看到舊程式碼這樣寫出錯時，改成 `increment() { ... }` 的寫法就好。

`<script setup>` 完全不用 `this`，這個坑也就不存在了。

### 你還可能看到的寫法

**`setup()` 函式**。Vue 3 剛推出時，還沒有 `<script setup>`，Composition API 是寫在一個叫 `setup` 的格子裡：

```vue
<script>
import { ref } from "vue";

export default {
  setup() {
    const count = ref(0);

    function increment() {
      count.value++;
    }

    return { count, increment };
  },
};
</script>

<template>
  <button @click="increment">{{ count }}</button>
</template>
```

裡面的寫法和 `<script setup>` 一樣，差別是最後要把模板用到的東西 `return` 出去。`<script setup>` 就是把這個樣板省掉的簡寫。2020 到 2022 年的文章很常見這種寫法。

**`defineComponent`**。用 TypeScript 的舊專案常把整個物件包起來：`export default defineComponent({ ... })`，裡面的內容和上面一樣，包起來只是為了讓 TypeScript 推論出型別。

**Vuex**。舊專案裡看到 `this.$store`、`mapState`、`mapGetters`，那是 Pinia 之前的官方狀態管理函式庫 Vuex。觀念和第 8 章的 Pinia 很像，Pinia 官方也提供了從 Vuex 遷移的說明。

### 把舊程式碼翻成新寫法

遇到 Options API 的範例，可以照這個順序翻成 `<script setup>`：

1. `data()` 裡的每個屬性 → 一個 `ref`。
2. `computed` 裡的每個函式 → 一個 `computed()`。
3. `methods` 裡的每個函式 → 一個一般的 `function`。
4. `watch` 和生命週期 → `watch()`、`onMounted()` 等等。
5. 把所有的 `this.xxx` 改成 `xxx.value`（狀態和 computed）或 `xxx`（函式）。

上面的 `OptionsCounter` 和 `SetupCounter`，就是照這個順序一對一翻過來的。

## 重點整理

- Options API 用一個大物件，把狀態、computed、函式、生命週期分別放進 `data`、`computed`、`methods`、`mounted` 等格子。
- 所有東西都掛在 `this` 上，不用寫 `.value`；Vue 內建的功能以 `$` 開頭，例如 `this.$emit`。
- Options API 裡的方法不能寫成箭頭函式，否則拿不到 `this`。
- 模板的寫法兩邊完全一樣，差別只在 `<script>`；翻成 `<script setup>` 時，把 `this.xxx` 換成 `ref` 和一般函式即可。
