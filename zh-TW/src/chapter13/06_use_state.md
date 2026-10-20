# `useState` 跨元件共享

## 本集目標

用 Nuxt 的 `useState` 讓好幾個元件共用同一份狀態，並且知道為什麼不能把 `ref` 放在元件外面。

## 正文

### 想讓兩個元件共用一個值

假設網站要記住「現在的訪客叫什麼名字」，頁面上的標題要用，右上角的小徽章也要用。第 8 章用 Pinia 解決過這種「好幾個元件要共用狀態」的問題。如果不想為了一個值裝 Pinia，你可能會想到更簡單的寫法：把 `ref` 放在函式外面，大家呼叫同一個函式，拿到的就是同一個 `ref`。

先照這個想法寫寫看。建立 `app/composables/useVisitor.ts`：

```ts
// 錯誤示範：ref 放在函式外面
const visitor = ref("");

export function useVisitor() {
  return visitor;
}
```

和 `components/` 一樣，放在 `app/composables/` 的函式會被自動匯入，其他檔案直接呼叫 `useVisitor()` 就好。

建立 `app/components/VisitorBadge.vue`：

```vue
<script setup lang="ts">
const visitor = useVisitor();
</script>

<template>
  <p>右上角：{{ visitor || '未登入' }}</p>
</template>
```

再建立 `app/pages/hello.vue`。網址如果帶了 `?name=...`，就把名字存起來：

```vue
<script setup lang="ts">
const route = useRoute();
const visitor = useVisitor();

if (typeof route.query.name === "string") {
  visitor.value = route.query.name;
}
</script>

<template>
  <VisitorBadge />
  <h1>你好，{{ visitor || '訪客' }}</h1>
  <input v-model="visitor" />
</template>
```

打開 <http://localhost:3000/hello?name=Amy>，標題和徽章都顯示 Amy。在輸入框裡打字，兩邊會一起變。看起來成功了。

### 問題：別人也看到了 Amy

現在假裝你是另一個使用者，打開一個新分頁，在網址列輸入：

```text
view-source:http://localhost:3000/hello
```

第 12 章用過，在網址前面加 `view-source:` 就能看到伺服器送來的原始碼。這次網址沒有帶名字，照理說應該是「訪客」，但原始碼裡卻是：

```text
<p>右上角：Amy</p><h1>你好，Amy</h1><input value="Amy">
```

伺服器把上一個人的名字，送給了下一個人。

原因是：`visitor` 這個 `ref` 寫在函式外面，整個程式只有**一份**。在第一部，程式只在使用者自己的瀏覽器裡跑，一個瀏覽器一份，不會互相影響。可是伺服器只有一台，**所有使用者的請求都在同一個程式裡處理**。Amy 的請求把 `visitor` 改成 Amy 之後，它就一直是 Amy，下一個進來的人也拿到同一個 `ref`。

如果存的是登入資訊或購物車，這就是嚴重的資料外洩。

直接打開 <http://localhost:3000/hello> 也會出怪事：伺服器送來的 HTML 寫著 Amy，瀏覽器自己那份 `visitor` 卻是空的，兩邊對不上，Console 會出現 `Hydration text content mismatch` 的警告，畫面最後變成「訪客」。這種警告第 8 集會詳細講。

### 改用 useState

把 `app/composables/useVisitor.ts` 改成：

```ts
export function useVisitor() {
  return useState("visitor", () => "");
}
```

其他檔案都不用動。重新做一次：先打開 `/hello?name=Amy`，再用新分頁看 `view-source:http://localhost:3000/hello`，這次是：

```text
<p>右上角：未登入</p><h1>你好，訪客</h1><input value="">
```

Amy 的名字不會再跑到別人那裡了。而在 `/hello?name=Amy` 頁面上，標題、徽章、輸入框照樣同步。

### useState 怎麼用

```ts,ignore
useState(key, () => 初始值)
```

- **key**：狀態的名字。在同一次請求裡，用同一個 key 呼叫 `useState` 的地方，拿到的都是同一個 `ref`。所以 `hello.vue` 和 `VisitorBadge.vue` 會共用。
- **初始值函式**：第一次用到這個 key 時，呼叫它得到初始值。注意要寫成函式 `() => ""`，不是直接寫 `""`。

回傳的是一個 `ref`，用法和平常一樣，`.value` 讀寫，模板裡自動解包。

`useState` 解決了兩件事：

1. **每個請求各自一份**：伺服器處理 Amy 的請求和處理下一個人的請求時，`useState("visitor")` 拿到的是不同的 `ref`，不會互相汙染。
2. **伺服器的值會帶到瀏覽器**：和 `useFetch` 一樣，伺服器上的狀態會放進 payload，瀏覽器 hydration 時直接接手。伺服器算出 Amy，瀏覽器拿到的也是 Amy，兩邊畫面一致。

所以在 Nuxt 裡，要跨元件共用的狀態，**不要把 `ref` 寫在函式或元件外面**，要用 `useState` 包起來。習慣的寫法就是像 `useVisitor` 這樣，做一個 composable 回傳 `useState(...)`。

### 兩個限制

- 狀態會被轉成文字放進 payload，所以只能放字串、數字、布林值、陣列、一般物件這類資料，**不能放函式這類沒辦法轉成文字的東西**。
- `useState` 是 Nuxt 內建的名字，不要自己再定義一個叫 `useState` 的函式。

### 和 Pinia 的關係

第 8 章的 Pinia 也是用來跨元件共用狀態的，而且功能多很多：有 `getters`、`actions`，有 Vue DevTools 的支援，適合購物車這種規則比較多的狀態。

`useState` 是 Nuxt 內建、不用安裝的簡單版本，只給你一個共用的 `ref`。怎麼選：

- 只是幾個簡單的值，例如目前的訪客、選的主題色：`useState` 就夠了。
- 狀態有很多欄位，還有一堆修改它的規則：用 Pinia。

Pinia 在 Nuxt 裡要透過 Nuxt 的模組安裝，它也有處理好「每個請求各自一份」和「帶到瀏覽器」這兩件事。安裝方法放在附錄二。

## 重點整理

- 在 Nuxt 裡，寫在函式或元件外面的 `ref` 會被所有使用者共用，可能造成資料外洩。
- `useState(key, () => 初始值)` 回傳一個 `ref`，同一個 key 在同一次請求裡共用。
- `useState` 的值每個請求各自一份，而且會透過 payload 從伺服器帶到瀏覽器。
- 只能放可以轉成 JSON 的資料，不能放函式。
- 簡單的共用值用 `useState`，規則多的狀態用 Pinia（附錄二）。
