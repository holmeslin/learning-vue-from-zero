# 模板與 `{{ }}`

## 本集目標

用 `{{ }}` 把 `<script setup>` 裡的資料放進畫面，並且知道 `{{ }}` 裡能寫什麼、不能寫什麼。

## 正文

### 把資料放進畫面

把 `src/App.vue` 換成：

```vue
<script setup>
const shopName = "小明的雜貨店";
const product = { name: "機械鍵盤", price: 1200 };
const quantity = 3;
</script>

<template>
  <h1>{{ shopName }}</h1>
  <p>商品：{{ product.name }}</p>
  <p>單價：{{ product.price }} 元</p>
  <p>數量：{{ quantity }}</p>
  <p>小計：{{ product.price * quantity }} 元</p>
</template>
```

畫面會顯示：

```text
小明的雜貨店
商品：機械鍵盤
單價：1200 元
數量：3
小計：3600 元
```

兩個大括號 `{{ }}` 叫做**文字插值**（text interpolation），因為長得像鬍子，也常被叫作「鬍子語法」。它的意思是：「算出裡面的 JavaScript，把結果當成文字放在這裡」。

`{{ }}` 裡可以讀 `<script setup>` 裡宣告的變數，也可以用 `.` 讀物件的屬性，就像第 1 章在 `console.log` 裡做的一樣。

### `{{ }}` 裡可以放任何「會算出一個值」的東西

小計那行的 `{{ product.price * quantity }}` 不是單純的變數，而是一個算式。只要是會算出一個值的 JavaScript，都可以放進 `{{ }}`。這種「會算出一個值」的程式碼叫**運算式**（expression）。

第 1 章預告過的三元運算子，在模板裡非常常見。把 `src/App.vue` 換成：

```vue
<script setup>
const isLoggedIn = false;
const unread = 3;
</script>

<template>
  <button>{{ isLoggedIn ? '登出' : '登入' }}</button>
  <p>你有 {{ unread }} 則{{ unread > 0 ? '新' : '' }}訊息</p>
</template>
```

按鈕上顯示「登入」。把 `isLoggedIn` 改成 `true` 存檔，按鈕就變成「登出」。

注意引號：模板裡的字串用的是**單引號**。現在這樣寫雙引號也能動，但下一集開始，運算式會放進 HTML 屬性裡，例如 `title="..."`，外層已經用了雙引號，裡面只能用單引號，不然 HTML 會以為屬性在中途就結束了。所以這本書在模板裡一律用單引號，養成習慣比較不會出錯。

### 也可以呼叫函式

`<script setup>` 裡定義的函式，模板裡也能呼叫。把 `src/App.vue` 換成：

```vue
<script setup>
const price = 1200;

function formatPrice(value) {
  return `NT$ ${value.toLocaleString()}`;
}
</script>

<template>
  <p>原價：{{ formatPrice(price) }}</p>
  <p>八折：{{ formatPrice(price * 0.8) }}</p>
</template>
```

```text
原價：NT$ 1,200
八折：NT$ 960
```

`toLocaleString()` 會把數字加上千分位的逗號。當運算式太長、或是好幾個地方都要用同一種格式時，把它寫成函式，模板會清爽很多。

### 不能放「陳述式」

`if`、`for`、宣告變數這些東西不會算出一個值，它們是**陳述式**（statement），不能放進 `{{ }}`：

```vue,ignore
<template>
  <p>{{ if (age >= 18) { '成年' } }}</p>
</template>
```

存檔後，瀏覽器會蓋上一層錯誤訊息，裡面有這一行：

```text
Error parsing JavaScript expression: Unexpected token (1:1)
```

意思是「解讀 JavaScript 運算式時遇到看不懂的東西」。遇到這種情況，改用三元運算子，或是把邏輯搬到 `<script setup>` 的函式裡。第 10 集還會學到專門用來「依條件顯示」的 `v-if`。

改回正確的程式碼存檔，錯誤訊息就會消失。

### `{{ }}` 顯示的永遠是文字

把 `src/App.vue` 換成：

```vue
<script setup>
const note = "<b>重要</b>";
</script>

<template>
  <p>{{ note }}</p>
</template>
```

畫面上看到的是原原本本的 `<b>重要</b>`，不是粗體的「重要」。`{{ }}` 只會把值當成文字放進去，不會把它當成 HTML。這是刻意的設計：如果資料是使用者輸入的，有人故意輸入一段 HTML 或程式碼，也不會被瀏覽器執行，網站比較安全。

### 小技巧：直接看整個物件

把物件或陣列直接放進 `{{ }}`，Vue 會把它轉成 JSON 格式的文字（第 2 章學過 JSON）。放進 `<pre>` 標籤裡（它會照原樣保留文字裡的空白和換行），可以保留縮排，很適合在開發時檢查資料長什麼樣子。把 `src/App.vue` 換成：

```vue
<script setup>
const product = { name: "機械鍵盤", price: 1200, tags: ["新品", "熱賣"] };
</script>

<template>
  <pre>{{ product }}</pre>
</template>
```

```text
{
  "name": "機械鍵盤",
  "price": 1200,
  "tags": [
    "新品",
    "熱賣"
  ]
}
```

另外，如果值是 `null` 或 `undefined`，`{{ }}` 什麼都不會顯示，不會印出 `null` 這幾個字。

## 重點整理

- `{{ }}` 把裡面的 JavaScript 算出來，當成文字放進畫面。
- `{{ }}` 裡可以放變數、物件屬性、算式、三元運算子、函式呼叫，只要是會算出一個值的運算式都行。
- `if`、`for` 這種陳述式不能放進 `{{ }}`。
- 模板裡的字串用單引號。
- `{{ }}` 只會顯示文字，不會把 HTML 當成 HTML。
