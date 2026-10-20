# Tailwind CSS

## 本集目標

知道 Tailwind CSS 是什麼，並且在 create-vue 專案裡裝好它、用它排出一個按鈕。

## 正文

### 它是什麼

第 3 章學的 CSS，是先在 `.css` 檔或 `<style>` 裡寫規則，再用選擇器套到元素上。**Tailwind CSS** 的想法相反：它事先準備好幾千個很小的 CSS 類別，每個類別只做一件事，你直接在 `class` 裡把需要的類別組合起來。

例如：

- `text-white` 是白色文字
- `bg-emerald-600` 是綠色背景
- `px-4` 是左右各 `1rem` 的內距
- `rounded` 是圓角

寫起來像這樣：

```vue
<template>
  <button class="rounded bg-emerald-600 px-4 py-2 text-white">
    加入購物車
  </button>
</template>
```

不用另外取類別名稱，也不用在模板和 `<style>` 之間來回切換。很多人覺得這樣寫比較快，也有人覺得 `class` 會變得很長。兩種看法都合理，是個人和團隊的選擇。

### 建立練習專案並安裝

先建一個新專案：

```bash
npm create vue@latest -- appendix-tw --ts
cd appendix-tw
npm install
```

然後安裝 Tailwind 本體和它的 Vite 外掛：

```bash
npm install tailwindcss @tailwindcss/vite
```

撰寫時裝到的是 Tailwind CSS 4。

接著打開 `vite.config.ts`，加兩行：最上面匯入 `tailwindcss`，`plugins` 陣列裡加上 `tailwindcss()`。

```ts
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
```

最後，把 `src/assets/main.css` 的內容**全部**換成這一行：

```css
@import "tailwindcss";
```

`src/main.ts` 第一行的 `import './assets/main.css'` 不用動，它會把這個檔案載入。

原本的 `main.css` 會載入 create-vue 附的預設樣式（`base.css`），換掉之後那些樣式就不見了，原本的歡迎頁面會變得很陽春，這是正常的。Tailwind 會改用它自己的一套基礎樣式。

如果你看過比較舊的 Tailwind 教學，可能會看到 `tailwind.config.js` 和 `npx tailwindcss init`。那是 Tailwind 3 的做法，Tailwind 4 不需要設定檔，上面這三步就夠了。

### 用用看

把 `src/App.vue` 整個換成：

```vue
<script setup lang="ts">
import { ref } from "vue";

const added = ref(false);
</script>

<template>
  <main class="mx-auto max-w-md p-4">
    <h1 class="text-2xl font-bold text-emerald-700">小書店</h1>
    <button
      class="mt-4 rounded px-4 py-2 text-white"
      :class="added ? 'bg-gray-400' : 'bg-emerald-600 hover:bg-emerald-700'"
      @click="added = !added"
    >
      {{ added ? '已加入' : '加入購物車' }}
    </button>
  </main>
</template>
```

執行 `npm run dev`，會看到綠色的大標題和一個綠底白字的圓角按鈕。點一下，按鈕變成灰色、文字變成「已加入」；再點一下又變回來。

逐個看這些類別：

- `mx-auto`：左右外距自動，讓區塊置中。
- `max-w-md`：最大寬度「中等」。
- `p-4`：四個方向的內距。
- `text-2xl font-bold text-emerald-700`：大字、粗體、深綠色。
- `mt-4`：上方外距。

數字不是 px，是 Tailwind 的間距單位，`4` 是 `1rem`。顏色後面的數字（`600`、`700`）代表深淺，越大越深。

注意按鈕同時有 `class` 和 `:class`。第 4 章學過，Vue 會把兩者合併：固定的樣式寫在 `class`，會變的寫在 `:class`。Tailwind 和 Vue 的 class 綁定搭配得很自然。

### 狀態與響應式

在類別前面加一個標記，就能指定條件：

- `hover:bg-emerald-700`：滑鼠移上去的時候，背景變成 `emerald-700`。
- `md:px-8`：螢幕寬度達到「中等」以上的時候，才使用 `px-8`。

在一般 CSS 裡，這需要 `:hover` 和 `@media` 兩種寫法，Tailwind 把它們變成了類別前面的標記。

### 只會產生用到的類別

Tailwind 有幾千個類別，是不是全部都會放進網站？不會。建置的時候，它會掃描你的程式碼，**只產生你真的用到的類別**。上面的範例建置之後，整份 CSS 只有 6 KB 左右。

這也代表你不能用字串拼接的方式產生類別名稱，例如 `` `bg-${color}-600` ``。Tailwind 只看得到程式碼裡的文字，掃不到完整的類別名稱，就不會產生對應的 CSS。需要依狀態切換時，像上面的範例一樣，把完整的類別名稱寫出來：

```vue
<template>
  <button :class="added ? 'bg-gray-400' : 'bg-emerald-600'">買書</button>
</template>
```

### 在 `<style>` 裡用 Tailwind：要加 `@reference`

有時候你想在元件的 `<style scoped>` 裡沿用 Tailwind 的類別，可以用 `@apply`。新增 `src/components/BookTag.vue`：

```vue
<template>
  <span class="tag"><slot /></span>
</template>

<style scoped>
.tag {
  @apply rounded bg-emerald-100 px-2 text-sm text-emerald-800;
}
</style>
```

在 `App.vue` 裡匯入、放進模板之後執行 `npx vite build`，會建置失敗：

```text
Error: Cannot apply unknown utility class `rounded`. Are you using CSS modules or similar and missing `@reference`? https://tailwindcss.com/docs/functions-and-directives#reference-directive
```

原因是每個元件的 `<style>` 會被分開處理，它不知道 `main.css` 裡載入了 Tailwind，所以不認得 `rounded`。解法就是錯誤訊息說的：在 `<style>` 最上面加一行 `@reference`，告訴它「這些類別是從 Tailwind 來的」：

```vue
<template>
  <span class="tag"><slot /></span>
</template>

<style scoped>
@reference "tailwindcss";

.tag {
  @apply rounded bg-emerald-100 px-2 text-sm text-emerald-800;
}
</style>
```

這樣就能正常建置。`@reference` 只是讓它認得類別，不會把整套 Tailwind 再複製一份進來。

不過一般還是建議直接把類別寫在模板的 `class` 上。如果同一組類別一直重複出現，與其用 `@apply`，不如把它做成一個元件。以 `BookTag` 來說，直接把類別寫在 `<span>` 的 `class` 上就好，`<style>` 整段都可以拿掉，重複的部分一樣只寫一次。

### 要不要用

一個簡單的判斷：

- 如果你的專案已經在用 Tailwind，或是團隊決定用它，就用。
- 如果你還在學 CSS，建議先把 CSS 學好。Tailwind 的類別幾乎都是 CSS 屬性的縮寫，懂 CSS 才看得懂它在做什麼。

## 重點整理

- Tailwind 提供大量單一用途的小類別，直接寫在 `class` 裡組合，會變的部分用 `:class`。
- 安裝 `tailwindcss` 和 `@tailwindcss/vite`，在 `vite.config.ts` 加外掛，`main.css` 寫 `@import "tailwindcss";`，Tailwind 4 不需要設定檔。
- `hover:`、`md:` 這類標記可以指定條件；類別名稱要完整寫出來，不能用字串拼接。
- 在元件的 `<style>` 裡用 `@apply`，要先寫 `@reference "tailwindcss";`。
