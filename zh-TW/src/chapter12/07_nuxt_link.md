# `NuxtLink`

## 本集目標

用 `<NuxtLink>` 在頁面之間跳轉，做出會標示「目前在哪一頁」的導覽列，並用 `navigateTo` 在程式裡換頁。

## 正文

### Nuxt 版的 `RouterLink`

你現在只能靠手動輸入網址，才能看到 `/books/1`。網站當然要有連結。

第 9 章你用 `RouterLink` 做連結：它渲染出來是一個 `<a>`，但點下去不會整個網頁重新載入，只換掉 `<RouterView />` 裡的頁面。Nuxt 的 `<NuxtLink>` 做的是一樣的事，而且多了兩樣本事：

- **預先載入**（prefetch）：連結出現在畫面上時，Nuxt 會在背景先把那一頁需要的程式碼下載好。等使用者真的點下去，畫面幾乎立刻出現。
- **外部網址也能用**：`to` 填別的網站的網址也可以，它會自動變成一般的 `<a>`。

用法和 `RouterLink` 幾乎一樣，用 `to` 指定網址，而且不用 import。

### 在書籍列表加上連結

把 `app/pages/books/index.vue` 改成每一本書都是一個連結：

```vue
<script setup lang="ts">
import { books } from "~/utils/books";
</script>

<template>
  <main>
    <h1>所有書籍</h1>
    <ul>
      <li v-for="book in books" :key="book.id">
        <NuxtLink :to="`/books/${book.id}`">{{ book.title }}</NuxtLink>
        <span>（{{ book.author }}）</span>
      </li>
    </ul>
  </main>
</template>
```

`:to` 用你第 1 章學的樣板字面值，把 `book.id` 放進網址。現在打開 `/books`，點任何一本書，就會跳到它的頁面。

### 導覽列

導覽列每一頁都要有，所以放在 `app.vue`，取代原本的 `<header>`。把 `app/app.vue` 改成：

```vue
<template>
  <div>
    <NuxtRouteAnnouncer />
    <nav>
      <NuxtLink to="/">首頁</NuxtLink>
      <NuxtLink to="/books">書籍</NuxtLink>
      <NuxtLink to="/about">關於</NuxtLink>
    </nav>
    <NuxtPage />
  </div>
</template>
```

再到 `app/assets/css/main.css` 的最後面加上：

```css
nav {
  display: flex;
  gap: 1rem;
  padding: 1rem;
}

.router-link-active {
  font-weight: bold;
}
```

`nav` 那一段是第 3 章的 Flexbox，讓三個連結排成一排、中間留空隙。`.router-link-active` 是什麼，下面說明。

### 標示目前在哪一頁

打開 <http://localhost:3000/books>，用 `view-source:` 看原始碼，導覽列是這樣（為了好讀換了行）：

```html
<nav>
  <a href="/" class="">首頁</a>
  <a aria-current="page" href="/books"
    class="router-link-active router-link-exact-active">書籍</a>
  <a href="/about" class="">關於</a>
</nav>
```

和第 9 章的 `RouterLink` 一模一樣，`<NuxtLink>` 會自動替符合目前網址的連結加上 class：

- `router-link-active`：目前網址「符合」這個連結。
- `router-link-exact-active`：目前網址和這個連結「完全一樣」。

完全一樣的那個連結還會加上 `aria-current="page"`，這也和 `RouterLink` 一樣，是給螢幕閱讀器看的標記，表示「這是目前所在的頁面」。

剛剛的 CSS 讓 `router-link-active` 變粗體，所以在 `/books` 時「書籍」是粗的。

接著點進一本書，例如 `/books/2`，再看一次導覽列：

```html
<a href="/books" class="router-link-active">書籍</a>
```

「書籍」還是粗體，但只剩 `router-link-active`。原因是上一集的 `books.vue`：`/books/2` 是 `books.vue` 這個外層路由的孩子，所以 Vue Router 認為 `/books` 這個連結也算「符合」，只是不是「完全一樣」。這正是導覽列想要的效果：逛到任何一本書，「書籍」都會亮著。

反過來，「首頁」的 `/` 在 `/books` 和 `/about` 都不會亮。第 9 章你把所有頁面都放進 `/` 的 `children`，所以首頁連結到處都亮；Nuxt 裡 `index.vue` 和 `about.vue`、`books.vue` 是平行的，沒有誰是誰的孩子。

### 外部網址

`<NuxtLink>` 的 `to` 也可以填別的網站。在 `app/pages/about.vue` 加一段：

```vue
<template>
  <main>
    <h1>關於我們</h1>
    <p>我們是一間很小的書店。</p>
    <p>
      這個網站是用
      <NuxtLink to="https://nuxt.com">Nuxt</NuxtLink>
      做的。
    </p>
  </main>
</template>
```

產生的 HTML 是：

```html
<a href="https://nuxt.com" rel="noopener noreferrer">Nuxt</a>
```

`<NuxtLink>` 看出這是外部網址，就變成一般的連結，還自動加上 `rel="noopener noreferrer"`，這是連到別的網站時建議加的安全設定。所以在 Nuxt 裡，不管連到哪裡，都可以統一用 `<NuxtLink>`。

### 用程式換頁：`navigateTo`

第 9 章學過，有時候換頁不是使用者點連結，而是程式判斷完才換，例如表單送出之後。那時你用 `useRouter()` 拿到 router，再呼叫 `router.push`。

Nuxt 裡改用 `navigateTo`，一樣不用 import：

```vue
<script setup lang="ts">
function goShopping() {
  navigateTo("/books");
}
</script>

<template>
  <button @click="goShopping">去逛逛</button>
</template>
```

按下按鈕，就會換到 `/books`，效果和點 `<NuxtLink to="/books">` 一樣。能用連結的地方還是用 `<NuxtLink>`，因為它是真正的 `<a>`，使用者可以按右鍵開新分頁；`navigateTo` 留給「程式決定要不要換頁」的時候。

`navigateTo` 還有一個 `router.push` 做不到的本事：它在伺服器上也能用。假設書籍列表以前的網址是 `/old-books`，現在搬到 `/books` 了，建立 `app/pages/old-books.vue`：

```vue
<script setup lang="ts">
await navigateTo("/books", { redirectCode: 301 });
</script>

<template>
  <p>這一頁已經搬家了。</p>
</template>
```

在 `<script setup>` 裡直接呼叫 `navigateTo`，前面加上 `await`（第 2 章學過，等它做完再往下）。用終端機看看伺服器的回應。`curl` 是一個在終端機裡送出網路請求的工具，Mac 和 Windows 10 以後都有內建，`-i` 表示把回應的開頭也印出來。Windows 的 PowerShell 裡 `curl` 是另一個指令的別名，要改打 `curl.exe -i`：

```bash
curl -i http://localhost:3000/old-books
```

開頭幾行是：

```text
HTTP/1.1 301 Moved Permanently
location: /books
```

伺服器根本沒有把這一頁的內容送出去，而是直接告訴瀏覽器「請改去 `/books`」，瀏覽器會自動跟過去。`301` 表示「永久搬家」，搜尋引擎看到它，就會把舊網址的紀錄轉到新網址。第 14 章的 route middleware 也會用 `navigateTo` 做類似的事。

## 重點整理

- `<NuxtLink to="...">` 是 Nuxt 版的 `RouterLink`，不用 import，換頁時不會整個網頁重新載入。
- 連結出現在畫面上時，Nuxt 會先在背景下載那一頁的程式碼。
- 符合目前網址的連結會自動加上 `router-link-active`，完全一樣時再加上 `router-link-exact-active`；外層路由（例如 `books.vue`）的連結在孩子頁面也算符合。
- `to` 填外部網址時，會變成一般的 `<a>` 並加上 `rel="noopener noreferrer"`。
- 程式裡換頁用 `navigateTo`，等於第 9 章的 `router.push`；在 `<script setup>` 裡呼叫時，伺服器會直接回傳轉址。
