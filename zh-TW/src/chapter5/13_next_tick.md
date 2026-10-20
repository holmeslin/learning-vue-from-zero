# `nextTick`

## 本集目標

知道改了響應式資料之後，畫面不是「立刻」更新的，需要時用 `nextTick` 等畫面更新完再做事。

## 正文

### 改了資料，畫面還沒變

大部分時候，你只管改資料，畫面交給 Vue，不用管它什麼時候更新。但偶爾你需要在資料改完之後，去讀或操作畫面上的元素，這時就會碰到一個怪現象。把 `src/App.vue` 換成：

```vue
<script setup>
import { ref } from "vue";

const count = ref(0);

function handleClick() {
  count.value++;
  const text = document.getElementById("count").textContent;
  console.log("畫面上：", text);
}
</script>

<template>
  <p id="count">{{ count }}</p>
  <button @click="handleClick">加一</button>
</template>
```

`document.getElementById("count")` 是用 id 從 DOM 裡找到元素，`textContent` 是它的文字，第 3 章學過類似的 `querySelector`。

點一下按鈕，畫面上的數字變成 1，可是 Console 印出：

```text
畫面上： 0
```

`count.value` 已經是 1 了，但在 `handleClick` 裡讀到的畫面還是 0。

### Vue 會把更新集中起來做

原因是 Vue 不會在你每改一次資料時就馬上去改 DOM，而是先記下來「這些畫面要更新」，等你這段程式全部跑完，再**一次**更新。

這樣做是為了效率。想像一個事件處理函式裡連續改了十個資料，如果每改一個就更新一次畫面，就要改十次 DOM；集中起來，只要一次。

所以在 `handleClick` 執行的當下，DOM 還沒被更新。

### 用 `nextTick` 等畫面更新完

`nextTick` 讓你「等到下一次畫面更新完成」再繼續。把 `src/App.vue` 換成：

```vue
<script setup>
import { ref, nextTick } from "vue";

const count = ref(0);

async function handleClick() {
  count.value++;
  console.log("畫面上：", document.getElementById("count").textContent);

  await nextTick();
  console.log("畫面上：", document.getElementById("count").textContent);
}
</script>

<template>
  <p id="count">{{ count }}</p>
  <button @click="handleClick">加一</button>
</template>
```

點一下按鈕，Console 印出：

```text
畫面上： 0
畫面上： 1
```

`nextTick()` 回傳一個 Promise，在畫面更新完成時完成。用第 2 章學的 `await` 等它，下一行執行時，DOM 就已經是新的了。因為用了 `await`，函式前面要加上 `async`。

### 實際用途：捲到最下面

最常見的用途，是「加了一筆資料之後，對新出現的元素做點什麼」。例如聊天室：送出一則訊息後，要把訊息列表捲到最下面，讓使用者看到最新的那則。把 `src/App.vue` 換成：

```vue
<script setup>
import { ref, nextTick } from "vue";

const messages = ref(["哈囉", "你好"]);
let nextId = 3;

async function handleSend() {
  messages.value.push(`第 ${nextId} 則訊息`);
  nextId++;

  await nextTick();
  const box = document.getElementById("messages");
  box.scrollTop = box.scrollHeight;
}
</script>

<template>
  <ul id="messages">
    <li v-for="(message, index) in messages" :key="index">{{ message }}</li>
  </ul>
  <button @click="handleSend">送出一則</button>
</template>

<style scoped>
#messages {
  height: 120px;
  overflow-y: auto;
  border: 1px solid #ccc;
}
</style>
```

連續點「送出一則」，訊息超過框框的高度之後，列表會自動捲到最下面，永遠看得到最新那則。

- `overflow-y: auto` 讓內容超出高度時出現捲軸。
- `scrollTop` 是「目前捲到哪裡」，`scrollHeight` 是「內容的總高度」。把前者設成後者，就是捲到最底。

把 `await nextTick();` 那一行拿掉試試看：每次都會差一則，最新的那則總是藏在下面。因為捲動的時候，新的 `<li>` 還沒被放進 DOM，捲到的「最底」是加入之前的最底。

`nextId` 只用來產生訊息的文字，不用顯示在畫面上，所以用普通的 `let` 就好，不需要 `ref`。

### 不要到處用

`nextTick` 只在「改完資料後，要直接讀或操作 DOM」時才需要。如果只是要顯示資料，交給模板就好，完全不需要它。

另外，用 `document.getElementById` 找元素，在一個畫面裡有好幾個相同元件時，id 會重複，就找不準了。第 6 章會教 Vue 專門用來拿到元素的方法 `useTemplateRef`，到時候就不用自己找。

## 重點整理

- 改了響應式資料後，Vue 不會馬上改 DOM，而是等這段程式跑完再一次更新。
- 在同一個函式裡，改完資料立刻去讀 DOM，讀到的是舊的畫面。
- `await nextTick()` 等畫面更新完成，之後再讀或操作 DOM。
- 只有需要直接碰 DOM 時才用 `nextTick`；單純顯示資料交給模板就好。
