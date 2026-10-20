# 元件組合與拆檔

## 本集目標

把畫面拆成好幾個元件，各自放在自己的檔案裡，再在 `App.vue` 裡組合起來。

## 正文

### 建立第二個元件

一個 `.vue` 檔就是一個元件，所以要新增元件，就是新增一個 `.vue` 檔。

在 `src/components/` 資料夾按右鍵選「新增檔案」，建立 `src/components/AppHeader.vue`：

```vue
<template>
  <header>
    <h1>小明的雜貨店</h1>
    <p>什麼都賣，什麼都不奇怪。</p>
  </header>
</template>
```

再把 `src/App.vue` 換成：

```vue
<script setup>
import AppHeader from "./components/AppHeader.vue";
</script>

<template>
  <AppHeader />
  <main>
    <p>歡迎光臨！</p>
  </main>
</template>
```

存檔後，畫面上依序出現店名、標語和「歡迎光臨！」。

做了兩件事：

1. **匯入**：`import AppHeader from "./components/AppHeader.vue";`。第 2 章說過，`.vue` 檔會自動變成預設匯出，`AppHeader.vue` 不用寫任何 `export`。路徑的 `./` 是「和 `App.vue` 同一個資料夾」，再往下走進 `components`。
2. **使用**：`<AppHeader />` 就是「在這裡放一個 `AppHeader` 元件」。它長得像 HTML 標籤，名字就是你匯入時取的名字。

在 `<script setup>` 裡匯入的元件，`<template>` 裡就能直接用，不需要其他設定。

`<AppHeader />` 結尾的 `/>` 表示這個標籤自己就完整了，不用再寫 `</AppHeader>`。元件裡面沒有要放東西的時候，都這樣寫。

### 元件名稱要兩個字以上

為什麼叫 `AppHeader`，不直接叫 `Header`？因為 HTML 本身就有 `<header>` 標籤，名字太短容易和 HTML 標籤撞在一起，讀程式碼的人也分不清楚。Vue 官方建議元件名稱**至少由兩個英文單字組成**，例如 `AppHeader`、`ProductCard`、`UserAvatar`。只有 `App` 這個最外層的元件例外。

整個畫面共用、只會出現一次的元件，習慣用 `App` 開頭，例如 `AppHeader`、`AppFooter`；你也可能看到別人用 `The` 開頭，例如 `TheHeader`。

### 元件可以重複使用

元件的好處是可以重複使用。把 `src/App.vue` 裡的 `<AppHeader />` 複製一行：

```vue
<script setup>
import AppHeader from "./components/AppHeader.vue";
</script>

<template>
  <AppHeader />
  <AppHeader />
  <main>
    <p>歡迎光臨！</p>
  </main>
</template>
```

畫面上會出現兩個一模一樣的標題區。同一個元件想用幾次就寫幾次，每一次都會各自畫出一份。現在兩份內容完全一樣，看起來沒什麼用；下一集學了 props，就能讓每一份顯示不同的內容。

試完把多的那一行刪掉。

### 組合成一棵元件樹

再建立 `src/components/AppFooter.vue`：

```vue
<template>
  <footer>
    <p>© 2026 小明的雜貨店</p>
  </footer>
</template>
```

把 `src/App.vue` 換成：

```vue
<script setup>
import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";
</script>

<template>
  <AppHeader />
  <main>
    <p>歡迎光臨！</p>
  </main>
  <AppFooter />
</template>
```

`App.vue` 現在像一份說明書：「先放 `AppHeader`，中間放內容，最後放 `AppFooter`」。每一塊的細節，由各自的元件負責。

元件裡面還可以再放元件。一個完整的網站，會是一棵由元件組成的樹，最外面是 `App`：

```text
App
├── AppHeader
├── main
└── AppFooter
```

被放進去的元件叫**子元件**（child component），放它的那個叫**父元件**（parent component）。這裡 `App` 是父元件，`AppHeader` 和 `AppFooter` 是它的子元件。下一集會用到這兩個詞。

### 為什麼要拆

- **好讀**：`App.vue` 只剩下大結構，一眼就看出畫面由哪幾塊組成。
- **好重複用**：同一個元件可以在很多地方使用。
- **好修改**：要改頁尾，直接打開 `AppFooter.vue`，不用在一大堆程式碼裡翻找。

怎麼決定要不要拆？一個簡單的判斷方式：**如果你能幫這一塊畫面取一個名字，它就可以是一個元件**。「標題區」、「商品卡片」、「搜尋框」都是好名字。

### 常見的錯

**忘了 `import`**：直接寫 `<AppFooter />` 卻沒有匯入，畫面上那一塊不會出現，瀏覽器的主控台會有一行黃色的警告：

```text
[Vue warn]: Failed to resolve component: AppFooter
```

意思是「找不到叫 `AppFooter` 的元件」。看到這個，就去檢查 `<script setup>` 有沒有匯入、名字有沒有拼對。

**路徑寫錯**：例如把檔名打成 `AppHeadr.vue`，瀏覽器會蓋上一層錯誤訊息：

```text
[plugin:vite:import-analysis] Failed to resolve import
"./components/AppHeadr.vue" from "src/App.vue". Does the file exist?
```

意思是「在 `src/App.vue` 裡找不到要匯入的檔案，它真的存在嗎？」（為了排版，這裡把一行拆成兩行顯示。）檔名的大小寫也要和實際的一模一樣，`appheader.vue` 和 `AppHeader.vue` 在某些電腦上會被當成不同的檔案。

## 重點整理

- 一個 `.vue` 檔就是一個元件，放在 `src/components/` 裡，檔名用 PascalCase。
- 在 `<script setup>` 裡 `import` 元件後，`<template>` 裡就能用 `<元件名稱 />`。
- 元件名稱至少兩個英文單字，避免和 HTML 標籤撞名。
- 元件可以重複使用，也可以層層組合成一棵元件樹。
- 能幫一塊畫面取名字，就可以拆成元件。
