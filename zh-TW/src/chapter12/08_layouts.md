# `layouts/`

## 本集目標

把導覽列搬進 layout，並且讓某個頁面換用另一種 layout。

## 正文

### `app.vue` 不夠用的時候

現在導覽列寫在 `app.vue`，每一頁都有。假設書店要做一個「書展特賣」的活動頁，希望它乾乾淨淨，不要導覽列，只在最下面放一個「回小書店」的連結。

`app.vue` 做不到這件事，因為每一頁都會經過它。你可以在 `app.vue` 裡用 `v-if` 判斷網址，但頁面一多就會變成一大串判斷。

Nuxt 的做法是 **layout**（版面）：把「頁面外面那一圈」做成獨立的元件，每個頁面可以選要套哪一個。

### 預設的 layout

建立 `app/layouts/default.vue`：

```vue
<template>
  <div>
    <nav>
      <NuxtLink to="/">首頁</NuxtLink>
      <NuxtLink to="/books">書籍</NuxtLink>
      <NuxtLink to="/about">關於</NuxtLink>
    </nav>
    <slot />
    <footer>© 小書店</footer>
  </div>
</template>
```

導覽列從 `app.vue` 搬過來了，下面多了一個 footer。中間的 `<slot />` 你在第 4 章學過：使用這個元件的人放進來的內容，會出現在這個位置。對 layout 來說，放進來的就是頁面。

然後把 `app/app.vue` 改成：

```vue
<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
```

`<NuxtLayout>` 會找出這一頁該用哪個 layout，把 `<NuxtPage />` 放進那個 layout 的 `<slot />`。沒有特別指定的話，用的就是 `default.vue`，這個檔名是規定好的。

存檔後，每一頁上面都有導覽列、下面都有「© 小書店」。

如果畫面沒有變化，可能是開發伺服器還沒發現新建的 `layouts/` 資料夾。回到終端機按 Ctrl+C 停掉，再執行一次 `npm run dev` 就好。

### 換一個 layout

建立 `app/layouts/plain.vue`：

```vue
<template>
  <div>
    <slot />
    <NuxtLink to="/">← 回小書店</NuxtLink>
  </div>
</template>
```

再建立活動頁 `app/pages/sale.vue`：

```vue
<script setup lang="ts">
definePageMeta({
  layout: "plain",
});
</script>

<template>
  <main>
    <h1>書展特賣</h1>
    <p>全館七九折，只到這個週末。</p>
  </main>
</template>
```

`definePageMeta` 用來替頁面設定一些給 Nuxt 看的資訊，`layout: "plain"` 的意思是「這一頁用 `layouts/plain.vue`」。layout 的名字就是檔名去掉 `.vue`。它和 `defineProps` 一樣，是寫在 `<script setup>` 裡、不用 import 的特殊函式。

打開 <http://localhost:3000/sale>，這一頁沒有導覽列也沒有 footer，最下面只有「← 回小書店」。其他頁面照舊用 `default.vue`。

### 用 HTML 確認

用 `view-source:` 看 `/about` 和 `/sale`，`<div id="__nuxt">` 裡的內容分別是（為了好讀換了行並省略部分內容）：

```html
<!-- /about -->
<div><div></div><div><nav>……</nav><!--[--><main><h1>關於我們</h1>
……</main><!--]--><footer>© 小書店</footer></div></div>

<!-- /sale -->
<div><div></div><div><!--[--><main><h1>書展特賣</h1>
<p>全館七九折，只到這個週末。</p></main><!--]-->
<a href="/" class="">← 回小書店</a></div></div>
```

`<!--[-->` 和 `<!--]-->` 是 Vue 在伺服器上留的記號，標出 slot 內容的開頭和結尾，讓瀏覽器接手時對得上，你不用理它。

### layout 和巢狀路由有什麼不同

你可能會覺得 layout 和第 5 集的 `books.vue` 很像，它們都是「包在頁面外面的一層」。差別在於：

| | layout | 巢狀路由（`books.vue`） |
| --- | --- | --- |
| 放在哪裡 | `app/layouts/` | `app/pages/` |
| 誰決定要不要套 | 每個頁面用 `definePageMeta` 自己選 | 網址決定，`/books` 底下的頁面一定會套 |
| 留位置的寫法 | `<slot />` | `<NuxtPage />` |
| 適合放什麼 | 整個網站的外框：導覽列、footer | 某一區專屬的東西：書籍區的提示 |

現在 `/books/2` 一層一層包起來的順序是：`app.vue` → `layouts/default.vue` → `pages/books.vue` → `pages/books/[id].vue`。

## 重點整理

- 整個網站的外框，例如導覽列和 footer，放在 `app/layouts/default.vue`。
- layout 用 `<slot />` 留位置給頁面；`app.vue` 用 `<NuxtLayout>` 把 `<NuxtPage />` 包起來。
- 頁面用 `definePageMeta({ layout: "名字" })` 換用其他 layout，名字就是檔名。
- 新增 `layouts/` 後畫面沒變，就重開一次 `npm run dev`。
- layout 由頁面自己選，巢狀路由由網址決定。
