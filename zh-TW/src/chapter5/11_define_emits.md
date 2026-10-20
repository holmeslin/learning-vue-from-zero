# `defineEmits`

## 本集目標

讓子元件用 `defineEmits` 發出事件，通知父元件「發生了什麼事」，由父元件去改資料。

## 正文

### 子元件不能改 props

第 4 章學過用 props 把資料從父元件傳給子元件。現在反過來：子元件裡有一個按鈕，按下去要改父元件的資料，該怎麼辦？

直覺的做法是在子元件裡直接改 props。建立 `src/components/LikeButton.vue`：

```vue
<script setup>
const props = defineProps(["count"]);

function handleClick() {
  props.count++;
}
</script>

<template>
  <button @click="handleClick">讚 {{ count }}</button>
</template>
```

把 `src/App.vue` 換成：

```vue
<script setup>
import { ref } from "vue";
import LikeButton from "./components/LikeButton.vue";

const likes = ref(0);
</script>

<template>
  <LikeButton :count="likes" />
  <p>總共 {{ likes }} 個讚</p>
</template>
```

`defineProps` 回傳一個物件，裡面就是收到的所有 props，存進 `props` 之後，在 `<script setup>` 裡就能用 `props.count` 讀到它。

點按鈕，數字不會變，Console 出現一個警告：

```text
[Vue warn] Set operation on key "count" failed: target is readonly.
```

意思是「`count` 是唯讀的（readonly），設定失敗」。**props 是唯讀的**，子元件只能讀，不能改。

為什麼要這樣規定？`likes` 是父元件的資料，如果每個拿到它的子元件都能偷偷改，程式一大，資料出了問題就很難查到是誰改的。所以 Vue 的規則是：**資料是誰的，就由誰來改**。

### 子元件發出事件，父元件去改

子元件不能改，但可以「通知」父元件：「有人按讚了」。父元件收到通知，再自己去改 `likes`。把 `src/components/LikeButton.vue` 換成：

```vue
<script setup>
defineProps(["count"]);
const emit = defineEmits(["like"]);
</script>

<template>
  <button @click="emit('like')">讚 {{ count }}</button>
</template>
```

把 `src/App.vue` 換成：

```vue
<script setup>
import { ref } from "vue";
import LikeButton from "./components/LikeButton.vue";

const likes = ref(0);
</script>

<template>
  <LikeButton :count="likes" @like="likes++" />
  <p>總共 {{ likes }} 個讚</p>
</template>
```

這次點按鈕，按鈕上的數字和下面的總數一起增加，也沒有警告了。

拆開來看：

- `defineEmits(["like"])`：宣告「這個元件會發出一個叫 `like` 的事件」。和 `defineProps` 一樣，不用 `import`，直接用。
- 它回傳一個函式，習慣存成 `emit`。呼叫 `emit("like")`，就是發出 `like` 事件。
- 父元件用 `@like="..."` 聽這個事件，寫法和 `@click` 完全一樣。差別只在 `click` 是瀏覽器發出的，`like` 是你的元件發出的。

整個流程是：

```text
App（擁有 likes）
  │ props：count = likes          ▲ 事件：like
  ▼                               │
LikeButton ── 按鈕被點 ── emit("like")
```

資料用 props **往下**傳，通知用事件**往上**送。這是 Vue 元件之間溝通最基本的方式。

### 事件也可以帶資料

`emit` 的第二個參數開始，可以附上資料。做一個商品清單，按「加入購物車」時告訴父元件是哪一樣商品。建立 `src/components/ProductItem.vue`：

```vue
<script setup>
const props = defineProps(["name", "price"]);
const emit = defineEmits(["add"]);

function handleAdd() {
  emit("add", props.name);
}
</script>

<template>
  <li>
    {{ name }}，{{ price }} 元
    <button @click="handleAdd">加入購物車</button>
  </li>
</template>
```

把 `src/App.vue` 換成：

```vue
<script setup>
import { ref } from "vue";
import ProductItem from "./components/ProductItem.vue";

const products = [
  { id: 1, name: "鍵盤", price: 1200 },
  { id: 2, name: "滑鼠", price: 600 },
];

const cart = ref([]);

function handleAdd(name) {
  cart.value.push(name);
}
</script>

<template>
  <ul>
    <ProductItem
      v-for="product in products"
      :key="product.id"
      :name="product.name"
      :price="product.price"
      @add="handleAdd"
    />
  </ul>
  <p>購物車：{{ cart.join("、") }}</p>
</template>
```

依序點「鍵盤」和「滑鼠」的按鈕，下面顯示 `購物車：鍵盤、滑鼠`。

`emit("add", props.name)` 發出事件時附上商品名稱。父元件寫 `@add="handleAdd"`，只給函式名稱，Vue 就會把 `emit` 附帶的資料當成參數傳給 `handleAdd`，所以 `name` 收到的就是 `"鍵盤"`。這和第 1 集「只寫函式名稱時，會收到事件物件」是同樣的規則，只是這裡收到的是你自己附上的資料。

如果改用「寫一段程式」的寫法，附帶的資料一樣用 `$event` 拿：`@add="cart.push($event)"`。

### 事件的名字

事件名稱用英文動詞，描述「發生了什麼」：`like`、`add`、`remove`、`close`。兩個字以上時，`emit` 裡習慣寫成 camelCase（第二個字開頭大寫），例如 `emit("removeItem")`；父元件可以寫 `@remove-item` 或 `@removeItem`，Vue 都認得。

### 資料要放在誰那裡

這一集的例子裡，`likes` 和 `cart` 都放在父元件 `App`，子元件只負責顯示和通知。判斷的方法是：**找出所有需要這份資料的元件，放在它們共同的父元件裡**。

例如 `LikeButton` 要顯示讚數，`App` 下面的「總共幾個讚」也要顯示，兩邊都要用，所以 `likes` 放在 `App`。如果 `likes` 只放在 `LikeButton` 自己的 `ref` 裡，`App` 就看不到它了。

## 重點整理

- props 是唯讀的，子元件不能改；資料是誰的，就由誰來改。
- 子元件用 `const emit = defineEmits(["事件名稱"])` 宣告事件，用 `emit("事件名稱")` 發出。
- 父元件用 `@事件名稱="..."` 聽子元件的事件，寫法和 `@click` 一樣。
- `emit` 可以附帶資料，父元件的事件處理函式會用參數收到它。
- 資料用 props 往下傳，通知用事件往上送；多個元件共用的資料，放在它們共同的父元件。
