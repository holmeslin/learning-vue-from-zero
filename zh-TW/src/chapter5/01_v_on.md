# `v-on` 事件

## 本集目標

用 `v-on`（簡寫 `@`）讓元件回應使用者的操作，例如點按鈕、送出表單、按 Enter。

## 正文

### 第一個事件

使用者做出的動作，例如點按鈕、打字、送出表單，瀏覽器稱為**事件**（event）。第 3 章最後一集用過 `addEventListener` 去「聽」按鈕有沒有被點；在 Vue 裡，改成直接在模板的標籤上寫。

把 `src/App.vue` 換成：

```vue
<script setup>
function handleClick() {
  console.log("按鈕被點了！");
}
</script>

<template>
  <button v-on:click="handleClick">點我</button>
</template>
```

存檔後，打開瀏覽器的開發者工具，切到 Console 分頁，然後點按鈕。每點一次，Console 就多一行：

```text
按鈕被點了！
```

拆開來看：

- `handleClick` 是一個**事件處理函式**（event handler），寫在 `<script setup>` 裡。習慣上名稱用 `handle` 開頭，看到就知道它是處理事件用的。
- `v-on:click="handleClick"` 的意思是：「這個按鈕發生 `click` 事件的時候，呼叫 `handleClick`」。`v-on` 是 Vue 的**指令**（directive），和第 4 章的 `v-if`、`v-for` 一樣是 `v-` 開頭。
- 冒號後面的 `click` 是事件名稱，和 `addEventListener("click", ...)` 的第一個參數是同一個東西。

注意 `handleClick` 後面沒有小括號。這就是第 2 章「函式也是值」講的：你是把 `handleClick` 這個函式**交給** Vue，什麼時候呼叫由 Vue 決定，也就是按鈕被點的時候。

### 簡寫 `@`

`v-on` 太常用了，所以有簡寫：把 `v-on:` 換成 `@`。下面兩行完全一樣：

```vue,ignore
<button v-on:click="handleClick">點我</button>
<button @click="handleClick">點我</button>
```

就像 `v-bind:` 可以簡寫成 `:` 一樣。實務上幾乎都寫 `@click`，這本書之後也一律用簡寫。

### 直接寫一行程式

處理的事情很短時，可以不另外寫函式，直接把程式寫在引號裡。把 `src/App.vue` 換成：

```vue
<template>
  <button @click="console.log('點了')">點我</button>
</template>
```

注意引號：屬性外面已經用了雙引號，裡面的字串就要改用單引號，不然 Vue 會分不清屬性在哪裡結束。

### 傳參數給事件處理函式

兩個按鈕共用一個函式，但要知道是哪一個被點了，就在呼叫時傳參數。把 `src/App.vue` 換成：

```vue
<script setup>
function handleBuy(name) {
  console.log("買了", name);
}
</script>

<template>
  <button @click="handleBuy('鍵盤')">買鍵盤</button>
  <button @click="handleBuy('滑鼠')">買滑鼠</button>
</template>
```

依序點兩個按鈕，Console 會印出：

```text
買了 鍵盤
買了 滑鼠
```

你可能會擔心：第 2 章說過「要傳函式，名稱後面不要加小括號」，`handleBuy('鍵盤')` 有括號，不是「現在就呼叫」嗎？在一般的 JavaScript 裡是這樣沒錯，但 `@click` 的引號裡不是一般的 JavaScript。Vue 會看引號裡寫的是什麼：

- 只寫一個函式名稱，例如 `@click="handleClick"`：被點的時候，Vue 呼叫這個函式。
- 寫的是一段程式，例如 `@click="handleBuy('鍵盤')"`：Vue 會自動把這段程式包成一個函式，類似 `() => handleBuy('鍵盤')`，**被點的時候**才執行。

所以兩種寫法都不會提前執行，放心用。

### 事件物件

用「只寫函式名稱」的寫法時，事件處理函式會自動收到一個參數，裡面是這次事件的詳細資訊，通常取名為 `event`。把 `src/App.vue` 換成：

```vue
<script setup>
function handleClick(event) {
  console.log(event.type);
  console.log(event.target.tagName);
}
</script>

<template>
  <button @click="handleClick">點我</button>
</template>
```

點了之後 Console 會印出：

```text
click
BUTTON
```

第一行是事件的種類，第二行是被點的元素是什麼標籤。`event.target` 就是「事件發生在哪個元素上」，它是第 3 章講的 DOM 元素。

如果你用的是「寫一段程式」的寫法，又同時需要事件物件，Vue 提供一個特別的名字 `$event` 代表它：

```vue
<script setup>
function handleBuy(name, event) {
  console.log("買了", name);
  console.log(event.target.tagName);
}
</script>

<template>
  <button @click="handleBuy('鍵盤', $event)">買鍵盤</button>
</template>
```

```text
買了 鍵盤
BUTTON
```

### 接手表單：`.prevent`

第 3 章說過，按下表單的送出按鈕，瀏覽器預設會重新載入整個頁面，輸入的東西全部消失。要阻止這個預設行為，JavaScript 的做法是呼叫 `event.preventDefault()`。Vue 讓你直接寫在事件名稱後面。把 `src/App.vue` 換成：

```vue
<script setup>
function handleSubmit() {
  console.log("表單送出了，但頁面沒有重新整理");
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input placeholder="隨便打點什麼" />
    <button type="submit">送出</button>
  </form>
</template>
```

在輸入框打幾個字再按「送出」（或直接按 Enter），Console 會印出訊息，而且輸入框裡的字還在，頁面沒有重新整理。

`@submit` 聽的是表單的送出事件。後面的 `.prevent` 叫**修飾符**（modifier），意思是「先幫我呼叫 `event.preventDefault()`，再執行後面的程式」。

把 `.prevent` 拿掉試試看：一按送出，頁面就閃一下重新整理，Console 的訊息也跟著被清掉，輸入框變回空的。之後只要用到 `<form>`，都記得寫 `@submit.prevent`。

### 按鍵修飾符

鍵盤事件也有修飾符，用來指定「按下哪個鍵」。把 `src/App.vue` 換成：

```vue
<script setup>
function handleEnter(event) {
  console.log("你按了 Enter，輸入框裡是：", event.target.value);
}
</script>

<template>
  <input @keyup.enter="handleEnter" placeholder="打字後按 Enter" />
</template>
```

`keyup` 是「放開某個鍵」的事件。加上 `.enter` 之後，只有放開的是 Enter 鍵才會呼叫 `handleEnter`，打其他字都不會。`event.target.value` 是輸入框目前的內容。

常用的還有 `.esc`（Esc 鍵）、`.space`（空白鍵）、`.up` / `.down`（上下方向鍵）。

### 常見的事件

| 事件 | 什麼時候發生 |
| --- | --- |
| `click` | 點一下 |
| `input` | 輸入框的內容改變（每打一個字就一次） |
| `change` | 勾選框、下拉選單的選擇改變 |
| `submit` | 表單送出 |
| `keyup` / `keydown` | 放開 / 按下鍵盤的某個鍵 |
| `mouseenter` / `mouseleave` | 滑鼠移進 / 移出元素 |

在 Vue 裡一律寫成 `@事件名稱`，例如 `@input`、`@mouseenter`。

### 事件處理函式能做什麼

到目前為止，事件處理函式只會 `console.log`。你一定會想：能不能在裡面改一個變數，讓畫面上的數字跟著變？下一集就來試，結果可能會讓你意外。

## 重點整理

- 用 `v-on:事件名稱`，簡寫 `@事件名稱`，指定事件發生時要執行什麼，例如 `@click="handleClick"`。
- 引號裡可以只寫函式名稱，也可以寫一段程式，例如 `@click="handleBuy('鍵盤')"`，都是事件發生時才執行。
- 只寫函式名稱時，函式會收到事件物件；寫一段程式時，用 `$event` 拿到它。
- 表單用 `@submit.prevent`，阻止瀏覽器重新載入頁面。
- 按鍵修飾符讓你只處理特定的鍵，例如 `@keyup.enter`。
