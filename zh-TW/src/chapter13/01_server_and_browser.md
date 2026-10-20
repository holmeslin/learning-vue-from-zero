# 伺服器與瀏覽器

## 本集目標

知道 Nuxt 的同一份元件程式碼會在伺服器和瀏覽器各跑一次，並且會分辨一段程式在哪裡執行。

## 正文

### 先跑跑看

建立 `app/pages/where.vue`：

```vue
<script setup lang="ts">
console.log("setup 執行了");

if (import.meta.server) {
  console.log("我在伺服器上");
}
if (import.meta.client) {
  console.log("我在瀏覽器裡");
}

onMounted(() => {
  console.log("onMounted 執行了");
});
</script>

<template>
  <h1>這段程式在哪裡跑？</h1>
</template>
```

存檔，打開 <http://localhost:3000/where>。

先看**終端機**，也就是你執行 `npm run dev` 的那個視窗，會多出兩行：

```text
setup 執行了
我在伺服器上
```

再看**瀏覽器的 Console**。在頁面上按 F12（Mac 按 Option+Command+I）打開開發者工具，切到 Console 分頁，會看到：

```text
setup 執行了
我在瀏覽器裡
onMounted 執行了
```

Console 裡還會有幾行 Nuxt 和 Vite 自己的訊息，不用理它。

同一個檔案、同一段 `<script setup>`，印出來的東西卻出現在兩個地方。而且 `setup 執行了` 兩邊都有，代表這段程式**跑了兩次**：一次在伺服器，一次在瀏覽器。

### 兩個執行的地方

第一部用 Vite 做的專案，程式全部在**瀏覽器**裡執行：使用者的電腦下載你的 JavaScript，在自己的機器上跑。

Nuxt 多了另一個地方：**伺服器**。伺服器是一台一直開著、等別人來要網頁的電腦。開發的時候，伺服器就是你自己的電腦，`npm run dev` 啟動的就是它，所以它的 `console.log` 會印在終端機。

有人打開網頁時，事情是這樣發生的：

1. 瀏覽器向伺服器要 `/where` 這一頁。
2. 伺服器執行 `where.vue` 的 setup，算出畫面，做成 HTML 送回去。
3. 瀏覽器收到 HTML，先顯示出來。
4. 瀏覽器下載 JavaScript，再執行一次 `where.vue` 的 setup，讓畫面可以互動。

第 2 步和第 4 步跑的是**同一份程式碼**。這是 Nuxt 最重要的特性，下一集會詳細講為什麼要這樣做。

### 分辨在哪裡跑

範例裡用了兩個 Nuxt 提供的值：

- `import.meta.server`：在伺服器上是 `true`，在瀏覽器裡是 `false`。
- `import.meta.client`：反過來，在瀏覽器裡才是 `true`。

另外，`onMounted` 只會在瀏覽器裡執行。第 6 章學過，`onMounted` 是元件「掛載到畫面上」之後才跑；伺服器只負責產生 HTML，沒有真的掛載這一步，所以伺服器不會跑 `onMounted`。

整理一下：

| 寫在哪裡 | 伺服器 | 瀏覽器 |
| --- | --- | --- |
| `<script setup>` 裡直接寫 | 會跑 | 會跑 |
| `if (import.meta.server)` 裡 | 會跑 | 不會 |
| `if (import.meta.client)` 裡 | 不會 | 會跑 |
| `onMounted` 裡 | 不會 | 會跑 |

### 伺服器上沒有的東西

兩個地方能用的東西不一樣。最常踩到的是：**伺服器上沒有 `window`、`document`、`localStorage`**，這些是瀏覽器才有的。

試試看，建立 `app/pages/window.vue`：

```vue
<script setup lang="ts">
const width = window.innerWidth;
</script>

<template>
  <p>視窗寬度：{{ width }}</p>
</template>
```

打開 <http://localhost:3000/window>，頁面會變成 500 錯誤，終端機會出現（太長了，這裡折成兩行）：

```text
[request error] [GET] /window

  ✖ TypeError (500): Cannot read properties of undefined
  (reading 'innerWidth')
```

意思是「`window` 是 `undefined`，讀不到它的 `innerWidth`」。伺服器先執行了這段 setup，可是伺服器上根本沒有視窗。

在第一部這樣寫完全沒問題，因為程式只在瀏覽器裡跑。到了 Nuxt，寫在 setup 裡的程式碼都要先過伺服器這一關。

最簡單的修法是把用到 `window` 的程式搬進 `onMounted`：

```vue
<script setup lang="ts">
const width = ref(0);

onMounted(() => {
  width.value = window.innerWidth;
});
</script>

<template>
  <p>視窗寬度：{{ width }}</p>
</template>
```

伺服器不跑 `onMounted`，所以不會出錯；伺服器產生的 HTML 先顯示 `0`，到了瀏覽器再換成真正的寬度。第 7 集還會教另一種做法。

### 養成習慣

寫 Nuxt 時，看到一段程式先問自己：「這段會在伺服器跑嗎？」

- 讀 `window`、`localStorage`、`document`：只能在瀏覽器，放進 `onMounted`。
- 抓資料：兩邊都會跑，要用特別的工具才不會抓兩次，第 3、4 集會講。
- 一般的計算、`ref`、`computed`：兩邊都能跑，不用特別處理。

做完這一集，可以把 `window.vue` 刪掉，後面不會再用到。

## 重點整理

- Nuxt 元件的 `<script setup>` 會跑兩次：先在伺服器，再在瀏覽器。
- 伺服器上的 `console.log` 會印在終端機，瀏覽器裡的則印在開發者工具的 Console。
- `import.meta.server` 和 `import.meta.client` 可以分辨現在在哪裡執行。
- `onMounted` 只在瀏覽器執行。
- 伺服器上沒有 `window`、`document`、`localStorage`，用到它們的程式要放進 `onMounted`。
