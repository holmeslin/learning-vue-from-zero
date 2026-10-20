# `v-if`、`v-else` 與 `v-show`

## 本集目標

讓畫面依照條件，決定要顯示什麼、不顯示什麼。

## 正文

### `v-if`：條件成立才顯示

把 `src/App.vue` 換成：

```vue
<script setup>
const unread = 3;
</script>

<template>
  <h1>信箱</h1>
  <p v-if="unread > 0">你有 {{ unread }} 封未讀信件</p>
</template>
```

畫面上有「你有 3 封未讀信件」。把 `unread` 改成 `0` 存檔，那一行就消失了。

`v-if` 是一個指令，和 `v-bind` 一樣，引號裡是 JavaScript 運算式。**運算式的結果是 `true`，這個元素就會出現；是 `false`，這個元素就不會出現在畫面上。**

這就是第 1 章的 `if`，只是寫在模板裡。

### `v-else`：不然就顯示這個

第 1 章學過 `if` 搭配 `else`，模板裡也有對應的 `v-else`。第 1 章預告過的登入範例，把 `src/App.vue` 換成：

```vue
<script setup>
const isLoggedIn = false;
</script>

<template>
  <p v-if="isLoggedIn">歡迎回來！</p>
  <p v-else>請先登入。</p>
  <button>{{ isLoggedIn ? '登出' : '登入' }}</button>
</template>
```

畫面上是「請先登入。」和一個「登入」按鈕。把 `isLoggedIn` 改成 `true` 存檔，就變成「歡迎回來！」和「登出」按鈕。

這裡同時用了兩種做法：

- 兩段 `<p>` 用 `v-if` / `v-else`：條件決定**整個元素**要顯示哪一個。
- 按鈕的文字用第 4 集的三元運算子：元素一樣，只有**一小段文字**不同。

兩種都對。差異比較大、是整塊畫面不同時用 `v-if`；只差幾個字時，三元運算子比較簡潔。

`v-else` 不用寫值，它自動就是「上一個 `v-if` 不成立的時候」。

### `v-else-if`：好幾種情況

有三種以上的情況，用 `v-else-if`，對應第 1 章的 `else if`。把 `src/App.vue` 換成：

```vue
<script setup>
const stock = 3;
</script>

<template>
  <p v-if="stock === 0">已售完</p>
  <p v-else-if="stock < 5">剩最後 {{ stock }} 件！</p>
  <p v-else>現貨供應中</p>
</template>
```

Vue 會從上往下檢查，第一個成立的才會顯示。`stock` 是 `3`，畫面上是「剩最後 3 件！」。試著改成 `0` 或 `10` 看看。

### `&&`、`||`、`!` 派上用場

第 1 章說過，到了 Vue 會常用 `&&`、`||`、`!` 組合條件，就是在這裡。把 `src/App.vue` 換成：

```vue
<script setup>
const age = 20;
const hasTicket = true;
const isMember = false;
const hasCoupon = true;
const isLoggedIn = false;
</script>

<template>
  <p v-if="age >= 18 && hasTicket">可以入場</p>
  <p v-if="isMember || hasCoupon">可以打折</p>
  <p v-if="!isLoggedIn">請先登入</p>
</template>
```

三行都會出現，意思和第 1 章一模一樣：

- `age >= 18 && hasTicket`：成年**而且**有票。
- `isMember || hasCoupon`：是會員**或者**有折價券。
- `!isLoggedIn`：**沒有**登入。

條件太長時，第 1 章的建議一樣適用：先在 `<script setup>` 裡把中間結果存成有意義的變數，模板裡只寫 `v-if="canEnter"`，讀起來清楚很多。

### `v-else` 要緊跟在後面

`v-else` 和 `v-else-if` 必須**緊接在** `v-if` 的元素後面，中間不能夾別的元素：

```vue,ignore
<template>
  <p v-if="isLoggedIn">歡迎回來！</p>
  <hr />
  <p v-else>請先登入。</p>
</template>
```

這樣寫，瀏覽器會蓋上一層錯誤訊息，裡面有這一行：

```text
v-else/v-else-if has no adjacent v-if or v-else-if.
```

意思是「`v-else` 旁邊找不到 `v-if`」。把 `<hr />` 移到別的地方就好了。

### 一次控制好幾個元素：`<template v-if>`

想讓好幾個元素一起出現、一起消失，可以用 `<template>` 把它們包起來，把 `v-if` 寫在 `<template>` 上。把 `src/App.vue` 換成：

```vue
<script setup>
const isLoggedIn = true;
</script>

<template>
  <h1>我的帳號</h1>
  <template v-if="isLoggedIn">
    <p>會員等級：金卡</p>
    <p>點數：1200 點</p>
  </template>
  <p v-else>請先登入。</p>
</template>
```

這個 `<template>` 只是用來分組的，它本身不會出現在畫面上，產生的 HTML 裡只有兩個 `<p>`，不會多一層。如果改用 `<div>` 包起來也能動，但 HTML 裡就會多一個 `<div>`。

`v-if` 也可以用在元件上，例如 `<ProductCard v-if="showCard" ... />`，條件不成立時整個元件都不會出現。

### `v-show`：藏起來，但還在

另一個控制顯示的指令是 `v-show`。把 `src/App.vue` 換成：

```vue
<script setup>
const showHint = false;
</script>

<template>
  <p v-if="showHint">這是 v-if</p>
  <p v-show="showHint">這是 v-show</p>
</template>
```

兩段文字都看不到。但用瀏覽器的「檢查」看產生的 HTML，會發現它們不一樣：

```html
<!--v-if-->
<p style="display: none;">這是 v-show</p>
```

- `v-if` 的元素**完全不存在**，只留下一行註解，那是 Vue 用來記住「這裡原本有東西」的記號。
- `v-show` 的元素**還在**，只是被加上了 CSS 的 `display: none`，藏起來而已。

把 `showHint` 改成 `true`，兩段都會出現，`v-show` 那段的 `style` 也會消失。

### 什麼時候用哪一個

| | `v-if` | `v-show` |
| --- | --- | --- |
| 條件不成立時 | 元素不存在 | 元素在，但藏起來 |
| 可以搭配 `v-else` | 可以 | 不行 |
| 可以用在 `<template>` | 可以 | 不行 |
| 適合 | 大部分情況 | 很常切換顯示、隱藏的東西 |

先用 `v-if` 就對了。`v-show` 的好處是切換時不用重新產生元素，所以如果某個東西會被使用者頻繁地打開、關上（例如一個常常展開收合的選單），用 `v-show` 比較省事。現在這一章的畫面還不會變動，等第 5 章學會讓畫面跟著操作改變之後，這個差別才會比較有感覺。

## 重點整理

- `v-if="條件"`：條件成立才顯示這個元素。
- `v-else-if`、`v-else` 要緊接在 `v-if` 的元素後面。
- 條件可以用 `&&`、`||`、`!` 組合；只差幾個字時，用三元運算子更簡潔。
- `<template v-if>` 可以一次控制好幾個元素，而且不會多產生一層標籤。
- `v-show` 只是用 `display: none` 藏起來，元素還在；一般情況先用 `v-if`。
