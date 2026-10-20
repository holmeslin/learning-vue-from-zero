# ESLint、Oxlint 與 Prettier

## 本集目標

看懂 create-vue 幫你裝好的檢查工具，會用 `npm run lint` 找出程式碼的問題、用 `npm run format` 整理排版。

## 正文

### 兩類工具各管一件事

- **檢查工具**（linter）：找出「可能出錯」的寫法，例如宣告了沒用到的變數、`v-for` 忘了加 `key`。它管的是**對不對**。
- **排版工具**（formatter）：自動整理縮排、換行、引號。它管的是**好不好看**。

這兩類工具不衝突，通常一起用。

### 建立練習專案

create-vue 問你要不要加 ESLint 和 Prettier 的時候選「要」，或是直接用旗標：

```bash
npm create vue@latest -- appendix-lint --ts --eslint --prettier
cd appendix-lint
npm install
```

打開 `package.json`，`scripts` 裡多了這幾行：

```text
"lint": "run-s \"lint:*\"",
"lint:oxlint": "oxlint . --fix",
"lint:eslint": "eslint . --fix --cache",
"format": "prettier --write --experimental-cli src/"
```

你會發現檢查工具不只一個：選了 ESLint，create-vue 會**同時**幫你裝 **Oxlint**。

- **ESLint**：歷史最久、最多人用的 JavaScript 檢查工具，有大量外掛，Vue 官方的規則（`eslint-plugin-vue`）就是 ESLint 外掛。
- **Oxlint**：比較新的檢查工具，用 Rust 寫成，速度非常快，涵蓋了 ESLint 很多常用的基本規則。

`npm run lint` 會照順序先跑 Oxlint、再跑 ESLint（`run-s` 就是「一個接一個跑」）。快的先把常見問題掃一遍，ESLint 再補上 Vue 專屬和 TypeScript 的規則。

### 設定檔在哪裡

專案根目錄多了幾個檔案：

- `.oxlintrc.json`：Oxlint 的設定。
- `eslint.config.ts`：ESLint 的設定。
- `.prettierrc.json`：Prettier 的設定。
- `.editorconfig`：告訴編輯器縮排用幾個空格之類的基本規則。

`eslint.config.ts` 長這樣：

```ts
import { globalIgnores } from 'eslint/config'
import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginOxlint from 'eslint-plugin-oxlint'
import skipFormatting from 'eslint-config-prettier/flat'

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  ...pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),

  skipFormatting,
)
```

為了不超出版面，這裡把第二行的匯入拆成多行，也省略了匯入後面的英文註解，你的檔案內容是一樣的。不用每一行都懂，知道每一段在做什麼就好：

- `files`：檢查 `.vue` 和 `.ts` 檔。
- `globalIgnores`：不要檢查 `dist`（建置的輸出）之類的資料夾。
- `pluginVue.configs['flat/essential']`：Vue 官方的基本規則。
- `vueTsConfigs.recommended`：TypeScript 的建議規則。
- `pluginOxlint...`：Oxlint 已經檢查過的規則，ESLint 就關掉，不要重複報同一個問題。
- `skipFormatting`：關掉所有跟排版有關的規則，排版交給 Prettier 管。

### 看看它會抓到什麼

新增一個故意寫錯的檔案 `src/components/BadList.vue`：

```vue
<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{ items: string[] }>();
const count = ref(0);
const unused = 1;

if (count.value = 1) {
  console.log("永遠會進來");
}
</script>

<template>
  <ul>
    <li v-for="item in props.items">{{ item }}</li>
  </ul>
</template>
```

執行：

```bash
npm run lint
```

```text
> appendix-lint@0.0.0 lint
> run-s "lint:*"


> appendix-lint@0.0.0 lint:oxlint
> oxlint . --fix


  × eslint(no-cond-assign): Expected a conditional expression and instead saw an assignment
   ╭─[src/components/BadList.vue:8:17]
 7 │
 8 │ if (count.value = 1) {
   ·                 ─
 9 │   console.log("永遠會進來");
   ╰────
  help: Consider wrapping the assignment in additional parentheses

  × eslint(no-constant-condition): Unexpected constant condition
   ╭─[src/components/BadList.vue:8:5]
 7 │
 8 │ if (count.value = 1) {
   ·     ───────┬───────
   ·            ╰── this expression will always evaluate to the same value
 9 │   console.log("永遠會進來");
   ╰────
  help: Update the condition to not be constant, or remove the condition entirely

Found 0 warnings and 2 errors.
Finished in 4ms on 14 files with 127 rules using 14 threads.
ERROR: "lint:oxlint" exited with 1.
```

Oxlint 在第 8 行抓到兩個問題，而且還畫出了是哪一段：

1. `no-cond-assign`：`if` 的條件裡寫了 `=`（指定），不是 `===`（比較）。第 1 章學過，比較要用 `===`。
2. `no-constant-condition`：因為 `count.value = 1` 的結果永遠是 `1`，這個 `if` 永遠成立。

括號裡的 `no-cond-assign` 是規則的名字。看不懂訊息的時候，拿這個名字去搜尋，就能找到說明和範例。

最後一行的 `ERROR` 表示 Oxlint 回報了錯誤，`run-s` 就停下來，**ESLint 根本還沒跑**。把第 8 行改成 `if (count.value === 1) {`，再執行一次 `npm run lint`：

```text
> appendix-lint@0.0.0 lint:oxlint
> oxlint . --fix

Found 0 warnings and 0 errors.
Finished in 4ms on 14 files with 127 rules using 14 threads.

> appendix-lint@0.0.0 lint:eslint
> eslint . --fix --cache


/Users/you/appendix-lint/src/components/BadList.vue
   6:7  error  'unused' is assigned a value but never used                   @typescript-eslint/no-unused-vars
  15:5  error  Elements in iteration expect to have 'v-bind:key' directives  vue/require-v-for-key

✖ 2 problems (2 errors, 0 warnings)

ERROR: "lint:eslint" exited with 1.
```

開頭幾行和上次一樣，這裡省略了。這次 Oxlint 通過，輪到 ESLint，它又抓到兩個：

1. 第 6 行：`unused` 宣告了卻沒用到。
2. 第 15 行：`v-for` 沒有加 `key`。第 4 章說過 `v-for` 一定要配 `key`，這條規則就是在幫你檢查這件事。

`6:7` 的意思是第 6 行第 7 個字元。刪掉第 6 行、幫 `<li>` 加上 `:key="item"`，再跑一次就全部通過了。

至於規則前面寫的是 `error` 還是 `warning`：`error` 是一定要修的問題，`warning` 是建議。

還有一條新手很常撞到的規則：`vue/multi-word-component-names`。如果你把元件檔案取名為 `Messy.vue` 或 `Counter.vue` 這種單一個英文字，ESLint 會回報「Component name "Messy" should always be multi-word」。原因是 HTML 自己的標籤都是單字（`<button>`、`<header>`），元件名稱用兩個字以上，就不會和現在或未來的 HTML 標籤撞名。改成 `MessyButton.vue`、`TodoCounter.vue` 就好。`App.vue` 是例外，不受這條規則限制。

### `--fix` 會改你的檔案

注意 `scripts` 裡兩個指令都帶著 `--fix`。它的意思是：有些問題的修法很明確（例如多了一個不必要的符號），檢查工具就直接幫你改掉，只把改不了的列出來。剛剛的幾個問題都需要你自己判斷，所以它沒動。

方便，但也代表 `npm run lint` 可能會直接修改你的檔案。如果你有用 Git，執行前先 commit，事後就能看出它改了什麼。

### Prettier

`npm run format` 用 Prettier 整理 `src/` 底下的所有檔案。新增一個排得很亂的 `src/components/MessyButton.vue`：

```vue
<script setup lang="ts">
import { ref } from "vue";
const count=ref(0)
function add(){count.value++}
</script>

<template>
<button   @click="add" >點了 {{count}} 次</button>
</template>
```

先用 `--check` 看看有沒有不符合格式的檔案，這只檢查、不修改：

```bash
npx prettier --check src/
```

```text
Checking formatting...
[warn] src/components/MessyButton.vue
[warn] Code style issues found in the above file. Run Prettier with --write to fix.
```

然後整理它：

```bash
npm run format
```

整理後的檔案變成：

```vue
<script setup lang="ts">
import { ref } from 'vue'
const count = ref(0)
function add() {
  count.value++
}
</script>

<template>
  <button @click="add">點了 {{ count }} 次</button>
</template>
```

空格補上了、縮排對齊了。但你可能會注意到：雙引號變成單引號，分號也不見了。這是因為 create-vue 產生的 `.prettierrc.json` 是這樣設定的：

```json
{
  "$schema": "https://json.schemastore.org/prettierrc",
  "semi": false,
  "singleQuote": true,
  "printWidth": 100
}
```

- `"semi": false`：行尾不加分號。
- `"singleQuote": true`：字串用單引號。
- `"printWidth": 100`：一行超過 100 個字元就換行。

這本書的範例用的是 Prettier 什麼都不設定時的預設風格：雙引號、加分號。兩種都對，重點是**同一個專案裡統一**。決定好之後就交給 Prettier，不要再花時間討論。

### 編輯器整合

create-vue 產生的 `.vscode/extensions.json` 會建議你安裝幾個 VS Code 擴充功能，第一次打開專案時右下角會跳出提示，按「安裝」就好。其中：

- ESLint 和 Oxc（Oxlint 的擴充功能）：寫程式的時候，直接用紅色或黃色底線標出問題，不用等到執行指令。
- Prettier：存檔時自動整理排版。`.vscode/settings.json` 已經幫你打開了「存檔時整理」。

裝好之後，大部分的問題在你打字的當下就會被標出來，`npm run lint` 變成送出前的最後確認。

## 重點整理

- 檢查工具管對不對，排版工具管好不好看；create-vue 選 ESLint 時會同時裝 Oxlint。
- `npm run lint` 先跑 Oxlint、再跑 ESLint，前一個有錯就會停下來；每個問題後面都有規則名稱可以搜尋。
- `--fix` 會直接改你的檔案，能自動修的會修掉，修不了的才列出來。
- `npm run format` 用 Prettier 整理排版，風格由 `.prettierrc.json` 決定，重點是整個專案統一。
