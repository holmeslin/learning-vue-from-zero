# 各種表單輸入

## 本集目標

把 `v-model` 用在多行文字、勾選框、單選按鈕和下拉選單上，知道每一種會得到什麼樣的值。

## 正文

第 3 章認識過各種表單元素。`v-model` 每一種都能用，寫法都一樣，差別只在**存進 `ref` 的是什麼值**。

### 多行文字：`<textarea>`

```vue
<script setup>
import { ref } from "vue";

const message = ref("");
</script>

<template>
  <label for="message">留言：</label>
  <textarea id="message" v-model="message" rows="4"></textarea>
  <p>你打了 {{ message.length }} 個字</p>
</template>
```

和 `<input>` 一樣，拿到的是字串。注意不要寫成 `<textarea>{{ message }}</textarea>`，Vue 官方文件說明，`<textarea>` 裡面的 `{{ }}` 不會有作用，一律用 `v-model`。

### 一個勾選框：布林值

```vue
<script setup>
import { ref } from "vue";

const agreed = ref(false);
</script>

<template>
  <label>
    <input type="checkbox" v-model="agreed" />
    我同意使用條款
  </label>
  <button :disabled="!agreed">下一步</button>
</template>
```

單獨一個勾選框，`v-model` 拿到的是布林值：打勾是 `true`，沒打勾是 `false`。這裡用它控制按鈕的 `disabled`，沒打勾就不能按「下一步」。

`<input>` 包在 `<label>` 裡，點「我同意使用條款」這幾個字也能打勾，這是第 3 章學過的寫法。

### 一組勾選框：陣列

好幾個勾選框綁到**同一個陣列**，就變成「可以複選」：

```vue
<script setup>
import { ref } from "vue";

const toppings = ref([]);
</script>

<template>
  <p>要加什麼配料？</p>
  <label>
    <input type="checkbox" value="珍珠" v-model="toppings" /> 珍珠
  </label>
  <label>
    <input type="checkbox" value="椰果" v-model="toppings" /> 椰果
  </label>
  <label>
    <input type="checkbox" value="仙草" v-model="toppings" /> 仙草
  </label>
  <p>已選：{{ toppings }}</p>
</template>
```

依序勾「仙草」和「珍珠」，畫面顯示：

```text
已選：[ "仙草", "珍珠" ]
```

`v-model` 綁的是陣列時，每個勾選框的 `value` 就是它代表的值：打勾就把這個值加進陣列，取消就拿掉。陣列裡的順序是勾選的順序。模板直接顯示陣列時，Vue 會把它轉成上面這樣的文字，平常用 `join` 排成比較好看的格式就好，例如 `{{ toppings.join("、") }}`。

### 單選按鈕：被選的那個值

```vue
<script setup>
import { ref } from "vue";

const size = ref("M");
</script>

<template>
  <p>尺寸：</p>
  <label><input type="radio" value="S" v-model="size" /> 小</label>
  <label><input type="radio" value="M" v-model="size" /> 中</label>
  <label><input type="radio" value="L" v-model="size" /> 大</label>
  <p>你選了 {{ size }}</p>
</template>
```

一組單選按鈕綁到同一個 `ref`，拿到的是被選取那一個的 `value`。`size` 的初始值是 `"M"`，所以一打開「中」就已經被選了。

第 3 章說過，同一組單選按鈕要有一樣的 `name`。用了 `v-model` 之後，Vue 會幫你處理「同一組只能選一個」，可以不寫 `name`。

### 下拉選單

```vue
<script setup>
import { ref } from "vue";

const city = ref("");
</script>

<template>
  <label for="city">城市：</label>
  <select id="city" v-model="city">
    <option disabled value="">請選擇</option>
    <option value="taipei">台北</option>
    <option value="taichung">台中</option>
    <option value="kaohsiung">高雄</option>
  </select>
  <p v-if="city">你選了 {{ city }}</p>
</template>
```

`v-model` 寫在 `<select>` 上，拿到的是被選取的 `<option>` 的 `value`。選「台中」，`city` 就是 `"taichung"`。

第一個選項 `<option disabled value="">請選擇</option>` 是常見的寫法：`city` 一開始是空字串，剛好對到這個選項，畫面上就顯示「請選擇」；加上 `disabled`，使用者選了別的之後就不能再選回它。

### 用 `v-for` 產生選項

選項多的時候，不要一個一個手寫，把它們放進陣列，用第 4 章的 `v-for` 產生：

```vue
<script setup>
import { ref } from "vue";

const cities = [
  { value: "taipei", label: "台北" },
  { value: "taichung", label: "台中" },
  { value: "kaohsiung", label: "高雄" },
];

const city = ref("taipei");
</script>

<template>
  <select v-model="city">
    <option v-for="item in cities" :key="item.value" :value="item.value">
      {{ item.label }}
    </option>
  </select>
  <p>你選了 {{ city }}</p>
</template>
```

`cities` 不會改變，所以用普通的 `const` 陣列就好，不用 `ref`。只有會變的東西才需要響應式。`:value="item.value"` 是用 `v-bind` 綁定每個選項的值，單選按鈕和勾選框也可以用同樣的方式產生。

### 整理一下

| 表單元素 | `v-model` 拿到的值 |
| --- | --- |
| `<input>`、`<textarea>` | 字串（`type="number"` 或加 `.number` 是數字） |
| 一個勾選框 | 布林值 |
| 一組勾選框（綁陣列） | 有打勾的 `value` 組成的陣列 |
| 一組單選按鈕 | 被選取的 `value` |
| `<select>` | 被選取的 `<option>` 的 `value` |

## 重點整理

- 每一種表單元素都用 `v-model`，差別在於拿到的值。
- 一個勾選框拿到布林值；一組勾選框綁到同一個陣列，拿到有打勾的值。
- 單選按鈕和下拉選單，拿到的是被選取那一項的 `value`。
- 選項很多時，把它們放進陣列，用 `v-for` 產生；不會變的資料不需要 `ref`。
