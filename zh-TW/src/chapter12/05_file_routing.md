# 檔案路由

## 本集目標

用檔案和資料夾做出新的網址，不用寫任何 `routes` 陣列；再用一個同名的 `.vue` 檔做出巢狀路由。

## 正文

### 檔案就是網址

第 9 章你要新增一個頁面，得做兩件事：寫一個元件，再到 `router/index.js` 的 `routes` 陣列裡加一筆 `{ path: "/about", component: AboutView }`。

Nuxt 只要做第一件事。規則只有一條：**`app/pages/` 底下的檔案路徑，就是網址。**

| 檔案 | 網址 |
| --- | --- |
| `pages/index.vue` | `/` |
| `pages/about.vue` | `/about` |
| `pages/books/index.vue` | `/books` |
| `pages/books/hot.vue` | `/books/hot` |

- 檔名就是網址的那一段，`.vue` 不算。
- 資料夾會變成網址中間的一段。
- `index.vue` 代表「這個資料夾本身」，所以 `pages/books/index.vue` 是 `/books`，不是 `/books/index`。

來做一個新頁面。建立 `app/pages/about.vue`：

```vue
<template>
  <main>
    <h1>關於我們</h1>
    <p>我們是一間很小的書店。</p>
  </main>
</template>
```

打開 <http://localhost:3000/about>，就看到這一頁了。你沒有設定任何路由，只是建了一個檔案。上面的「小書店」header 也在，因為它寫在 `app.vue`，每一頁都會經過。

回頭看第 1 集：用 `view-source:http://localhost:3000/about` 檢視原始碼，你會在裡面找到：

```html
<main><h1>關於我們</h1><p>我們是一間很小的書店。</p></main>
```

文字已經在伺服器送來的 HTML 裡了，這就是 Nuxt 和 create-vue 專案最大的差別。

### 準備一些書

接下來要做書籍列表。先準備資料：建立 `app/utils/books.ts`。這就是小書店的「資料庫」，目前先用一個陣列代替：

```ts
export type Book = {
  id: string;
  title: string;
  author: string;
  price: number;
  summary: string;
};

export const books: Book[] = [
  {
    id: "1",
    title: "貓咪的程式課",
    author: "陳小橘",
    price: 380,
    summary: "從一隻貓學寫第一行程式，適合完全沒有基礎的人。",
  },
  {
    id: "2",
    title: "河馬的資料結構",
    author: "林阿河",
    price: 520,
    summary: "用河馬的日常生活，解釋陣列、佇列和堆疊。",
  },
  {
    id: "3",
    title: "企鵝的網路世界",
    author: "王小企",
    price: 450,
    summary: "從一封信怎麼寄到企鵝家，講到網頁怎麼送到你的瀏覽器。",
  },
];

export function getBook(id: string) {
  return books.find((book) => book.id === id);
}
```

`Book` 是第 10 章學的物件型別。`getBook` 是用書號找書的函式，下一集會用到。注意 `id` 用的是字串 `"1"`，不是數字 `1`，下一集會說明原因。

`utils/` 不在 `pages/` 裡，所以它不會變成任何網址。為什麼叫 `utils`、為什麼放在這裡，第 9 集會揭曉，現在先照著放。

### 書籍列表

建立 `app/pages/books/index.vue`：

```vue
<script setup lang="ts">
import { books } from "~/utils/books";
</script>

<template>
  <main>
    <h1>所有書籍</h1>
    <ul>
      <li v-for="book in books" :key="book.id">
        {{ book.title }}（{{ book.author }}）
      </li>
    </ul>
  </main>
</template>
```

`~` 你在第 3 集看過，代表 `app/`。其他都是你熟悉的 Vue：`v-for` 把陣列變成列表，每一項要有 `key`。

打開 <http://localhost:3000/books>，你就能看到三本書。

### 巢狀路由

假設書籍區的每一頁，都想在上面放一行共同的提示。第 9 章你是這樣做的：在 `routes` 裡寫一個外層路由，內層路由放進它的 `children` 陣列，外層元件裡放一個 `<RouterView />` 留位置給內層。

Nuxt 的做法是：**在 `books/` 資料夾旁邊，放一個同名的 `books.vue`。**

建立 `app/pages/books.vue`（注意它在 `pages/` 底下，和 `books/` 資料夾並排，不是放在 `books/` 裡面）：

```vue
<template>
  <section>
    <p>📚 你正在逛書籍區</p>
    <NuxtPage />
  </section>
</template>
```

現在你的 `pages/` 長這樣：

```text
app/pages/
├── about.vue
├── books/
│   └── index.vue
├── books.vue
└── index.vue
```

存檔之後，打開 `/books`，書籍列表上面多了提示；打開 `/about`，沒有。

`books.vue` 就是外層路由，`books/` 資料夾裡的檔案就是它的 `children`。外層元件裡的 `<NuxtPage />`，和 `app.vue` 裡的那個一樣，是留給內層頁面的位置，相當於第 9 章外層元件裡的 `<RouterView />`。之後在 `books/` 裡新增的任何頁面，包括下一集的 `/books/1`，都會自動被 `books.vue` 包住。

整理一下現在的網址和它們經過的元件：

| 網址 | 一層一層包起來的元件 |
| --- | --- |
| `/` | `app.vue` → `pages/index.vue` |
| `/about` | `app.vue` → `pages/about.vue` |
| `/books` | `app.vue` → `pages/books.vue` → `pages/books/index.vue` |

### 和第 9 章的 `routes` 比一比

如果用第 9 章的寫法，上面這些頁面要寫成：

```ts
const routes = [
  { path: "/", component: IndexPage },
  { path: "/about", component: AboutPage },
  {
    path: "/books",
    component: BooksPage,
    children: [{ path: "", component: BooksIndexPage }],
  },
];
```

Nuxt 每次你新增、刪除 `pages/` 裡的檔案，都會自動重新產生一份這樣的設定。你只要管檔案放在哪裡就好。

## 重點整理

- `app/pages/` 底下的檔案路徑就是網址，不用寫 `routes` 陣列。
- `index.vue` 代表資料夾本身，`pages/books/index.vue` 對應 `/books`。
- 和資料夾同名的 `.vue` 檔（例如 `books.vue`）是外層路由，資料夾裡的頁面是它的 `children`。
- 外層路由用 `<NuxtPage />` 留位置給內層，就像第 9 章的 `<RouterView />`。
- 不在 `pages/` 裡的檔案（例如 `utils/books.ts`）不會變成網址。
