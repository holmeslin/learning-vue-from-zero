# DOM 是什麼，以及為什麼需要 Vue

## 本集目標

理解 DOM 是什麼，並且親眼看到「只用 JavaScript 做網頁」會遇到什麼麻煩，這就是 Vue 存在的理由。

## 正文

### DOM：瀏覽器腦中的那棵樹

瀏覽器讀到 HTML 之後，不會一直拿著那份文字，而是在記憶體裡建立一個**樹狀結構**，每個元素是樹上的一個節點。這棵樹叫做 **DOM**（Document Object Model，文件物件模型）。

這份 HTML：

```html
<body>
  <h1>標題</h1>
  <ul>
    <li>蘋果</li>
    <li>香蕉</li>
  </ul>
</body>
```

在瀏覽器裡會變成這樣一棵樹：

```text
body
├── h1
│   └── "標題"
└── ul
    ├── li
    │   └── "蘋果"
    └── li
        └── "香蕉"
```

重點是：**畫面是由 DOM 畫出來的。** 只要 DOM 這棵樹有變化，畫面就會跟著變。而 JavaScript 可以隨時修改 DOM，這就是網頁能互動的原因。

### 用 JavaScript 修改 DOM

做一個最簡單的計數器：按一下按鈕，數字加一。在 `chapter3` 資料夾建立兩個檔案。

`index.html`：

```html
<!DOCTYPE html>
<html lang="zh-TW">
  <head>
    <meta charset="UTF-8" />
    <title>計數器</title>
  </head>
  <body>
    <p>你按了 <span id="count">0</span> 次</p>
    <button id="add">按我</button>
    <script src="app.js"></script>
  </body>
</html>
```

`app.js`：

```js
// 檔案：app.js
const countText = document.querySelector("#count");
const button = document.querySelector("#add");

let count = 0;

button.addEventListener("click", () => {
  count += 1;
  countText.textContent = count;
});
```

開啟 `index.html`，按按鈕，數字會增加。逐行看：

- `<script src="app.js"></script>`：在網頁裡載入 JavaScript 檔案。放在 `<body>` 最後面，確保執行時畫面上的元素都已經存在。
- `document.querySelector("#count")`：用 CSS 選擇器（`#count` 是 id 選擇器）在 DOM 裡找到那個元素。
- `button.addEventListener("click", callback)`：註冊一個**事件監聽**，意思是「這個按鈕被按下時，呼叫這個 callback」。你在第 2 章學過 callback，這就是它的實際應用。
- `countText.textContent = count`：直接修改那個元素的文字，畫面立刻更新。

這個程式很簡單，運作得很好。問題是：**當程式變大，會怎麼樣？**

### 資料一多，就開始亂了

想像一個待辦清單。畫面上有三個地方跟資料有關：清單本身、一行「共 N 項」的統計、清單是空的時候顯示的「目前沒有待辦事項」。

把 `index.html` 換成這份：

```html
<!DOCTYPE html>
<html lang="zh-TW">
  <head>
    <meta charset="UTF-8" />
    <title>待辦清單</title>
  </head>
  <body>
    <p id="empty">目前沒有待辦事項</p>
    <ul id="list"></ul>
    <p id="summary">共 0 項</p>
    <button id="add">新增</button>
    <button id="remove">刪除第一項</button>
    <script src="todo.js"></script>
  </body>
</html>
```

再建立 `todo.js`：

```js
// 檔案：todo.js
const list = document.querySelector("#list");
const summary = document.querySelector("#summary");
const emptyMessage = document.querySelector("#empty");
const todos = [];

function addTodo(text) {
  todos.push(text);

  const li = document.createElement("li");
  li.textContent = text;
  list.appendChild(li);

  summary.textContent = `共 ${todos.length} 項`;
  emptyMessage.hidden = true;
}

function removeTodo(index) {
  if (index >= todos.length) {
    return; // 沒有這一項，什麼都不做
  }
  todos.splice(index, 1);

  list.children[index].remove();

  summary.textContent = `共 ${todos.length} 項`;
  if (todos.length === 0) {
    emptyMessage.hidden = false;
  }
}

document.querySelector("#add").addEventListener("click", () => {
  addTodo("寫作業");
});

document.querySelector("#remove").addEventListener("click", () => {
  removeTodo(0);
});
```

開啟 `index.html`，按幾次「新增」再按「刪除第一項」，清單、統計和提示都會跟著變。幾個新東西：

- `document.createElement("li")`：建立一個新的 `<li>` 元素，這時它還不在畫面上。
- `list.appendChild(li)`：把它放進 `<ul>` 裡面，成為最後一個子元素，畫面上才看得到。
- `list.children[index].remove()`：`children` 是一個元素的所有子元素，`.remove()` 把它從 DOM 拿掉。
- `todos.splice(index, 1)`：從陣列的第 `index` 個位置開始，刪掉 1 個東西。
- `emptyMessage.hidden = true`：`hidden` 是布林屬性，設成 `true` 就把元素藏起來，`false` 就顯示。

它能動，但仔細看：`addTodo` 和 `removeTodo` 真正在處理資料的只有一行（`push` 和 `splice`），其他全是在**手動**同步畫面：改清單、改統計文字、顯示或隱藏提示。

這帶來幾個很實際的麻煩：

- **容易漏**：之後加了「全部清除」的功能，卻忘了更新統計文字，畫面就和資料對不起來。
- **牽一髮動全身**：畫面上每多一個顯示資料的地方（例如標題寫「待辦（3）」），所有改資料的函式都要多加一行去更新它。
- **資料和畫面是兩份**：`todos` 陣列是一份，DOM 上的 `<li>` 是另一份。兩邊稍有不一致，就出現「資料明明刪了，畫面還在」這種怪 bug。

功能越多，要同步的地方就越多，而且是互相交錯的：每個改資料的函式，都得知道畫面上所有跟它有關的地方。最後沒有人敢改。

### Vue 的想法：描述畫面，而不是操作畫面

Vue 換了一個思考方式。你不再說「**怎麼**一步一步改 DOM」，而是只說「資料長這樣的時候，**畫面應該長怎樣**」。

同一個待辦清單，用 Vue 寫長這樣。**現在先看就好**，不用動手，也不用看懂每個符號，只要感受一下形狀：

```vue
<script setup>
import { ref } from "vue";

const todos = ref([]);

function addTodo(text) {
  todos.value.push(text);
}

function removeTodo(index) {
  todos.value.splice(index, 1);
}
</script>

<template>
  <p v-if="todos.length === 0">目前沒有待辦事項</p>
  <ul>
    <li v-for="todo in todos">{{ todo }}</li>
  </ul>
  <p>共 {{ todos.length }} 項</p>
  <button @click="addTodo('寫作業')">新增</button>
  <button @click="removeTodo(0)">刪除第一項</button>
</template>
```

上半部是 JavaScript，下半部的 `<template>` 是畫面，幾乎就是你這一章學的 HTML。和 `todo.js` 比一比：

- 沒有 `querySelector`、`createElement`、`textContent`、`hidden`。
- `addTodo` 和 `removeTodo` 只剩改資料的那一行，完全不碰畫面。
- 畫面上三個跟資料有關的地方，直接寫在 `<template>` 裡：`{{ todos.length }}` 會顯示陣列的長度，`v-if` 決定那段提示要不要出現，`v-for` 讓陣列裡每一項都變成一個 `<li>`。正式寫 `v-for` 時還要加上一個 `key`，這裡先省略，第 4 章會講。

這背後是 Vue 的兩個核心：

1. **宣告式模板**（declarative template）：你在模板裡「宣告」畫面和資料的關係，例如「這裡顯示 `todos.length`」，而不是寫一步一步的修改指令。第 4 章會學。
2. **響應式資料**（reactive data）：用 `ref` 包起來的資料，Vue 會一直盯著。資料一變，**Vue 會自己找出畫面上用到它的地方，去改 DOM**。你不用再管同步這件事。第 5 章會學。

可以把它想成一個公式：

```text
畫面 = 模板(資料)
```

資料是唯一的真相，畫面永遠是由資料「算」出來的。資料變了，畫面就跟著重新算，兩邊不可能不一致。之後想在標題加上「待辦（3）」，只要在模板多寫一個 `{{ todos.length }}`，`addTodo`、`removeTodo` 一行都不用改。

這就是 Vue 做的事。它不是讓你寫出更短的程式，而是讓你在程式很大的時候，依然管得住。

### 接下來

下一章你會正式建立第一個 Vue 專案，寫出你的第一個元件。你已經有了需要的所有基礎：

- JavaScript 的變數、陣列、物件、函式、callback、`import` / `export`（第 1、2 章）。
- HTML 的標籤和屬性、CSS 的選擇器和版面（這一章）。

準備好了。

## 重點整理

- DOM 是瀏覽器在記憶體裡建立的樹狀結構，畫面是由它畫出來的；JavaScript 可以修改 DOM 來改變畫面。
- 只用 JavaScript 操作 DOM，資料一變就要手動同步所有相關的畫面，容易漏、難維護。
- Vue 讓你用模板描述「資料長這樣時畫面該長怎樣」，資料變了，由 Vue 負責改 DOM。
- Vue 的兩個核心是宣告式模板（第 4 章）和響應式資料（第 5 章）。
