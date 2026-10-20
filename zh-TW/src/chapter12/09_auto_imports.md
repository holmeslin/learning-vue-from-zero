# 自動匯入

## 本集目標

知道哪些東西在 Nuxt 裡不用 import 就能用，並且用 `components/`、`composables/`、`utils/` 三個資料夾讓自己寫的東西也能自動匯入。

## 正文

### 你已經用了好幾次

回頭看這一章寫過的程式碼，有很多東西沒有 import 就直接用了：

- `defineNuxtConfig`（第 3 集的 `nuxt.config.ts`）
- `<NuxtPage />`、`<NuxtLink>`、`<NuxtLayout>`、`<NuxtRouteAnnouncer />`
- `useRoute`（第 6 集）
- `navigateTo`（第 7 集）
- `definePageMeta`（第 8 集）

在第一部的專案裡，這些都要寫 `import`，例如 `import { useRoute } from "vue-router"`。Nuxt 會自動幫你處理，這叫**自動匯入**（auto-import）。

`ref`、`computed`、`watch`、`onMounted` 這些 Vue 的 API 也一樣，在 Nuxt 裡都不用 import。

### 自己寫的元件：`components/`

書籍列表的每一本書，現在只是一行文字。把它做成一個卡片元件。建立 `app/components/BookCard.vue`：

```vue
<script setup lang="ts">
defineProps<{
  book: Book;
}>();
</script>

<template>
  <article>
    <h2>
      <NuxtLink :to="`/books/${book.id}`">{{ book.title }}</NuxtLink>
    </h2>
    <p>{{ book.author }}・{{ book.price }} 元</p>
  </article>
</template>
```

`defineProps` 的型別寫法是第 10 章學的。注意 `Book` 這個型別沒有 import，下面會說明。

然後把 `app/pages/books/index.vue` 整個換成：

```vue
<template>
  <main>
    <h1>所有書籍</h1>
    <BookCard v-for="book in books" :key="book.id" :book="book" />
  </main>
</template>
```

連 `<script setup>` 都不用了。第一部要用一個元件，得先 `import BookCard from "../components/BookCard.vue"`；在 Nuxt 裡，**放在 `app/components/` 的元件，檔名就是元件名稱**，任何地方都能直接用。

元件放在子資料夾裡的話，資料夾名稱會加在元件名稱的前面。例如 `app/components/shop/Banner.vue`，用的時候要寫 `<ShopBanner />`。

### 自己寫的 composable：`composables/`

第 6 章你學過 composable：把一段用到響應式的邏輯包成 `use` 開頭的函式。來幫書籍頁加一個「讚」的按鈕。建立 `app/composables/useLikes.ts`：

```ts
export function useLikes() {
  const likes = ref(0);

  function like() {
    likes.value++;
  }

  return { likes, like };
}
```

`ref` 沒有 import。然後把 `app/pages/books/[id].vue` 改成：

```vue
<script setup lang="ts">
const route = useRoute();
const id = route.params.id;
const book = typeof id === "string" ? getBook(id) : undefined;
const { likes, like } = useLikes();
</script>

<template>
  <main>
    <h1>{{ book?.title }}</h1>
    <p>{{ book?.summary }}</p>
    <button @click="like">讚 {{ likes }}</button>
  </main>
</template>
```

`useLikes` 沒有 import，因為它放在 `app/composables/`。原本第一行的 `import { getBook } from "~/utils/books"` 也刪掉了，下面說明為什麼可以。

打開 `/books/2`，按幾下「讚」，數字會增加。這個數字只存在瀏覽器裡，重新整理就歸零。要讓它存起來，資料得放在伺服器上。第 14 章會學怎麼寫自己的 API 存資料，那一章最後的綜合練習就會做一個重新整理也不會歸零的「讚」。

### 工具函式：`utils/`

第 5 集把書的資料放在 `app/utils/books.ts`，當時說「為什麼叫 `utils` 第 9 集會揭曉」。答案就是：**`app/utils/` 和 `app/composables/` 一樣會自動匯入。** 所以 `books`、`getBook`，連 `Book` 這個型別都可以直接用，`books/index.vue` 的模板裡也是直接用 `books`。

`composables/` 和 `utils/` 的規則一樣：檔案裡 `export` 出來的東西會自動匯入。兩者的差別只是用途：

- `composables/` 放 composable，也就是用到 `ref`、`computed` 等響應式 API 的 `use` 函式。
- `utils/` 放其他工具函式和資料，例如 `getBook`。

預設只有直接放在這兩個資料夾裡的檔案才算。如果放在子資料夾，例如 `composables/sub/useDeep.ts`，就不會自動匯入，要自己寫 import。

### 它是怎麼做到的

你可能會擔心：不寫 import，Nuxt 怎麼知道 `BookCard` 是哪個檔案？TypeScript 又怎麼知道 `Book` 是什麼型別？

Nuxt 掃過 `components/`、`composables/`、`utils/` 之後，就知道每個名字來自哪個檔案。建置的時候，它會在真正用到的地方自動補上 import。同時，它把這份對照表寫成型別檔放進 `.nuxt/`，讓 VS Code 和 `npx nuxt typecheck` 知道每個名字的型別。

打開 `.nuxt/imports.d.ts`，會看到這樣的內容（只節錄三行，第一行還省略了一些名字）：

```ts
export { useRoute, useRouter } from '#app/composables/router';
export { useLikes } from '../app/composables/useLikes';
export { books, getBook, Book } from '../app/utils/books';
```

`.nuxt/components.d.ts` 裡則有這一行（為了好讀換了行）：

```ts,ignore
export const BookCard:
  typeof import("../app/components/BookCard.vue")['default']
```

這些檔案是自動產生的，引號和分號的寫法和這本書的習慣不太一樣，看得懂就好。

所以在 VS Code 裡把滑鼠移到 `useLikes` 上，一樣看得到它的型別；按住 Ctrl（Mac 是 ⌘）點它，也一樣會跳到 `composables/useLikes.ts`。

你也會發現 `useRoute` 來自 `#app/composables/router`，而不是 `vue-router`。這是 Nuxt 自己包過一層的版本，用法和第 9 章完全一樣。

### 還是可以自己 import

自動匯入不是強迫的。你想寫清楚來源的話，第一部的寫法照樣能用，例如第 5 集的 `import { books } from "~/utils/books"`。Nuxt 也提供一個特別的路徑 `#imports`，所有會自動匯入的東西都可以從這裡 import：

```ts
import { ref, useRoute } from "#imports";
```

這本書之後的程式碼都會用自動匯入，不再寫這些 import。

## 重點整理

- Vue 的 API（`ref`、`computed`……）和 Nuxt 的 API（`useRoute`、`definePageMeta`……）都不用 import。
- `app/components/` 裡的元件，檔名就是元件名稱；子資料夾的名稱會加在元件名稱前面。
- `app/composables/` 和 `app/utils/` 裡 `export` 的東西會自動匯入，包括型別；子資料夾裡的不算。
- 自動匯入的清單在 `.nuxt/imports.d.ts` 和 `.nuxt/components.d.ts`，VS Code 和型別檢查都靠它。
- 想寫清楚來源時，還是可以自己 import，或從 `#imports` 匯入。
