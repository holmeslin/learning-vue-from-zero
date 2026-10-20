# `provide` / `inject` 與 `InjectionKey`

## 本集目標

用 `InjectionKey` 讓 `inject` 拿到的值有正確的型別，並學會 `export type` 與 `import type`。

## 正文

### 用字串當 key，型別就不見了

第 7 章用 `provide` 和 `inject` 讓外層元件把資料交給深層的元件。先用第 7 章的寫法，拿字串當 key。建立 `src/components/ThemeLabel.vue`：

```vue
<script setup lang="ts">
import { inject } from "vue";

const theme = inject("theme");
console.log(theme.value);
</script>
```

```text
src/components/ThemeLabel.vue:5:13 - error TS18046: 'theme' is of type 'unknown'.

5 console.log(theme.value);
              ~~~~~


Found 1 error.
```

`unknown` 是第 3 集表格裡的那個「什麼都可能是」。問題在於 `provide` 和 `inject` 寫在不同的檔案裡，只靠 `"theme"` 這個字串連起來，TypeScript 沒辦法知道外層放了什麼進去。

### `InjectionKey`：帶著型別的 key

解法是做一把「帶著型別的 key」，外層和內層都用這把 key。建立 `src/keys.ts`：

```ts
import type { InjectionKey, Ref } from "vue";

export type Theme = "light" | "dark";

export const themeKey = Symbol() as InjectionKey<Ref<Theme>>;
```

一行一行看：

- `Theme` 是第 6 集的字面型別聯集，主題只能是淺色或深色。前面加了 `export`，其他檔案就能匯入這個型別，和第 2 章匯出變數、函式一樣。
- `Symbol()` 會產生一個獨一無二的值，拿來當 key，就不會和別人的 key 撞名。
- `as InjectionKey<Ref<Theme>>` 是上一集學的 `as`：告訴 TypeScript「這把 key 對應的值，是一個裝著 `Theme` 的 `ref`」。`Ref<Theme>` 就是 `ref<Theme>(...)` 的型別。

### `import type`

第一行是 `import type`，不是 `import`。`InjectionKey` 和 `Ref` 都只是型別，不是執行時會用到的東西。create-vue 的設定要求只匯入型別時，要寫 `import type`，這樣建置時 Vite 才知道整行都可以拿掉。忘了寫的話會看到：

```text
src/keys.ts:1:10 - error TS1484: 'InjectionKey' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
```

同一行裡又有型別、又有一般的值時，可以只在型別前面加 `type`，等一下的 `App.vue` 就會看到：

```ts
import { themeKey, type Theme } from "./keys";
```

### 外層 `provide`

把 `src/App.vue` 換成：

```vue
<script setup lang="ts">
import { provide, ref } from "vue";
import { themeKey, type Theme } from "./keys";
import ThemeLabel from "./components/ThemeLabel.vue";

const theme = ref<Theme>("light");
provide(themeKey, theme);

function toggle() {
  theme.value = theme.value === "light" ? "dark" : "light";
}
</script>

<template>
  <button @click="toggle">切換</button>
  <ThemeLabel />
</template>
```

用了 `themeKey` 之後，`provide` 也會被檢查。把 `ref<Theme>("light")` 改成 `ref("blue")` 試試：

```text
src/App.vue:7:19 - error TS2345: Argument of type 'Ref<string, string>' is not assignable to parameter of type 'Ref<Theme, Theme>'.
  Type 'string' is not assignable to type 'Theme'.

7 provide(themeKey, theme);
                    ~~~~~


Found 1 error.
```

key 說要放 `Ref<Theme>`，你放的是可以裝任何字串的 `ref`，對不上。（`Ref<string, string>` 裡的第二個 `string` 可以先不管。）改回 `ref<Theme>("light")`。

### 內層 `inject`

把 `ThemeLabel.vue` 改成用 `themeKey`：

```vue
<script setup lang="ts">
import { inject } from "vue";
import { themeKey } from "../keys";

const theme = inject(themeKey);
console.log(theme.value);
</script>

<template>
  <p>目前是 {{ theme }}</p>
</template>
```

```text
src/components/ThemeLabel.vue:6:13 - error TS18048: 'theme' is possibly 'undefined'.

6 console.log(theme.value);
              ~~~~~


Found 1 error.
```

型別回來了，但多了一個 `undefined`。因為 TypeScript 不知道這個元件是不是真的放在某個 `provide` 過的元件裡面。如果有人把 `ThemeLabel` 拿到別的地方用，`inject` 就拿不到東西。

最簡單的處理方式是給預設值，也就是 `inject` 的第二個引數：

```vue
<script setup lang="ts">
import { inject, ref } from "vue";
import { themeKey } from "../keys";

const theme = inject(themeKey, ref("light"));
</script>

<template>
  <p>目前是 {{ theme === 'light' ? '淺色' : '深色' }}</p>
</template>
```

有了預設值，`theme` 就一定是 `Ref<Theme>`，不會是 `undefined`。在模板裡輸入 `theme === '` 時，編輯器還會列出 `'light'`、`'dark'` 兩個選項。

## 重點整理

- 用字串當 key 時，`inject` 拿到的是 `unknown`。
- 在獨立的檔案裡建立 `Symbol() as InjectionKey<型別>`，`provide` 和 `inject` 都用這把 key。
- `export type` 匯出型別；只匯入型別時寫 `import type`，或在名稱前加 `type`。
- `inject` 可能拿不到值，型別會多一個 `undefined`，給預設值就能解決。
