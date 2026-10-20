# 建立有 Vitest 的專案

## 本集目標

用 create-vue 建立一個內建 Vitest 的專案，看懂它幫你產生的設定檔和範例測試，並把測試跑起來。

## 正文

### 建立專案

在你放練習專案的資料夾打開終端機，執行：

```bash
npm create vue@latest -- vue-testing --ts --vitest --pinia
```

不加任何選項的話，create-vue 會一題一題問你要不要加什麼功能。這次直接把答案寫在指令後面：

- `vue-testing`：專案資料夾的名字。
- `--ts`：使用 TypeScript（第 10 章學過）。
- `--vitest`：加上 Vitest 和 Vue Test Utils。
- `--pinia`：加上 Pinia，最後兩集測 store 時會用到。

指令前面那個單獨的 `--`，意思是「後面的東西不是給 npm 的，請原封不動交給 create-vue」。

選項都給了，create-vue 就不會再問問題，直接建好專案：

```text
┌  Vue.js - The Progressive JavaScript Framework

正在建置專案 /你的路徑/vue-testing...
│
└  專案建置完成，可執行以下命令：

   cd vue-testing
   npm install
   npm run dev
```

提示文字的語言跟著你電腦的系統語言，系統是英文的話這段會是英文，內容一樣。照著提示進入資料夾、安裝套件：

```bash
cd vue-testing
npm install
```

### 多了哪些套件

打開 `package.json`，和沒有加 `--vitest` 的專案比，`devDependencies` 裡多了這幾個跟測試有關的套件（版本號碼以你實際裝到的為準）：

```json
"@types/jsdom": "^30.0.0",
"@vue/test-utils": "^2.5.0",
"jsdom": "^30.0.1",
"vitest": "^4.1.11",
```

| 套件 | 用途 |
| --- | --- |
| `vitest` | 執行測試 |
| `@vue/test-utils` | 在測試裡掛載元件、找元素、模擬操作 |
| `jsdom` | 在 Node.js 裡模擬瀏覽器的 DOM |
| `@types/jsdom` | 讓 TypeScript 認得 jsdom 的型別 |

`devDependencies` 是「只在開發時用」的套件。測試工具不會被打包進最後給使用者的網頁裡。

**為什麼需要 jsdom？** 測試是在 Node.js 裡執行，不是在瀏覽器裡。Node.js 沒有網頁，沒有 `document`，也沒有 DOM。jsdom 用 JavaScript 做了一個「假的瀏覽器環境」，讓元件可以真的渲染出 DOM 元素，而不用打開真的瀏覽器。

`scripts` 也多了一行：

```json
"test:unit": "vitest",
```

### `vitest.config.ts`

專案根目錄多了一個 `vitest.config.ts`，內容是這樣：

```ts
import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config.ts'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
    },
  }),
)
```

這是 create-vue 產生的原樣，所以用的是單引號、沒有分號，和本書的寫法不同，兩種都可以。看重點就好：

- `mergeConfig(viteConfig, ...)`：先拿 `vite.config.ts` 的設定，再疊上測試專用的設定。所以 Vite 認得的東西（例如 `.vue` 檔、路徑別名 `@`），測試裡也都認得，不用設定兩次。
- `environment: 'jsdom'`：測試跑在剛才說的假瀏覽器環境裡。少了這行，測試裡就沒有 `document`，元件掛載不起來。
- `exclude`：哪些檔案不要當成測試。`configDefaults.exclude` 是 Vitest 預設排除的清單（例如 `node_modules`），再加上 `e2e` 資料夾。那個資料夾放的是另一種測試，會開真的瀏覽器來跑，這本書不會用到。
- `root`：測試從哪個資料夾開始找檔案，這裡就是專案根目錄。

這個檔案你不用改，這一章所有範例都用它的預設值。

### 測試檔放哪裡

Vitest 會找檔名裡有 `.test.` 或 `.spec.` 的檔案。create-vue 的慣例是：**測試檔放在被測檔案旁邊的 `__tests__` 資料夾裡，檔名用 `.spec.ts` 結尾**。專案已經附了一個範例：

```text
src/
  components/
    HelloWorld.vue
    __tests__/
      HelloWorld.spec.ts
```

`__tests__` 前後各有兩個底線。這不只是習慣，TypeScript 的設定也是照這個規則寫的：

- `tsconfig.app.json` 負責檢查網頁本身的程式碼，裡面寫了 `"exclude": ["src/**/__tests__/*"]`，把測試排除掉。
- `tsconfig.vitest.json` 專門檢查測試，裡面寫了 `"include": ["src/**/__tests__/*", "env.d.ts"]`，只收 `__tests__` 裡的檔案，並且加上 jsdom 的型別。

所以照著放，`npm run type-check` 會用對的設定檢查你的測試檔。如果把測試檔隨便放在別的地方，它會被當成網頁程式碼檢查，可能出現奇怪的型別錯誤。這一章所有的測試都放在 `__tests__` 裡。

### 看看範例測試

打開 `src/components/__tests__/HelloWorld.spec.ts`：

```ts
import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import HelloWorld from '../HelloWorld.vue'

describe('HelloWorld', () => {
  it('renders properly', () => {
    const wrapper = mount(HelloWorld, { props: { msg: 'Hello Vitest' } })
    expect(wrapper.text()).toContain('Hello Vitest')
  })
})
```

現在看不懂沒關係，接下來幾集會一個一個講。大意是：掛載 `HelloWorld` 元件，傳一個 `msg` 給它，然後檢查畫面上的文字有沒有包含 `Hello Vitest`。

這裡用的是 `it`，這本書會用 `test`。兩個是同一個東西，只是名字不同，第 4 集會再提。

### 執行測試

```bash
npm run test:unit
```

```text
 DEV  v4.1.11 /你的路徑/vue-testing

 ✓ src/components/__tests__/HelloWorld.spec.ts (1 test) 7ms
   ✓ HelloWorld (1)
     ✓ renders properly 7ms

 Test Files  1 passed (1)
      Tests  1 passed (1)

 PASS  Waiting for file changes...
       press h to show help, press q to quit
```

打勾 `✓` 就是通過。`v4.1.11` 是 Vitest 的版本；`7ms` 是花了多少時間，每次都不一樣，不用在意。實際的輸出還會多兩行 `Start at`（開始時間）和 `Duration`（總共花的時間），書上省略了。

注意最後兩行：`Waiting for file changes...`。`npm run test:unit` 執行的是 `vitest`，預設是**監看模式**（watch mode）：跑完不會結束，而是一直等著，你一存檔，它就自動重跑相關的測試。一邊寫程式一邊看結果很方便。按 `q` 離開。

只想跑一次就結束，用：

```bash
npx vitest run
```

這一章之後的執行結果，都是用 `npx vitest run` 跑的。後面也可以接檔名或資料夾，只跑其中一部分，例如 `npx vitest run src/utils`。

> 如果你的輸出只有 `Test Files` 和 `Tests` 兩行摘要，沒有打勾的那幾行，是因為有些 AI 輔助工具會設定環境變數，讓 Vitest 切換成精簡模式。在一般的終端機裡，會看到上面的完整輸出。

## 重點整理

- `npm create vue@latest -- 名稱 --ts --vitest --pinia` 會建立一個已經裝好 Vitest、Vue Test Utils 和 jsdom 的專案。
- `vitest.config.ts` 用 `mergeConfig` 沿用 Vite 的設定，並用 `environment: 'jsdom'` 模擬瀏覽器。
- 測試檔放在 `__tests__` 資料夾，檔名用 `.spec.ts` 結尾，TypeScript 的設定也是照這個規則分的。
- `npm run test:unit` 是監看模式，`npx vitest run` 跑一次就結束。
