# `@nuxt/image` 與 `@nuxt/fonts`

## 本集目標

安裝 Nuxt 的官方模組，用 `<NuxtImg>` 放最佳化過的圖片，用 `@nuxt/fonts` 載入中文字型。

## 正文

### 模組

第 2 集建立專案時，有一題問你要不要安裝**模組**（module），你選了 No。模組是替 Nuxt 加功能的套件。它比一般的 npm 套件多做一步，會直接改變 Nuxt 的行為，例如加上新的元件、新的自動匯入、在建置時多做一些事。

這一集要裝兩個 Nuxt 官方的模組：

- **`@nuxt/image`**：圖片最佳化。
- **`@nuxt/fonts`**：字型。

### 安裝 `@nuxt/image`

在專案資料夾執行（開發伺服器開著也沒關係，可以開另一個終端機分頁）：

```bash
npx nuxt module add image
```

```text
● Resolved @nuxt/image, adding module...
● Installing @nuxt/image@2.2.0 as a dependency
● Installing with npm...
◆ Dependencies installed
● Adding @nuxt/image to the modules
● A dev server (PID 74718) is using .nuxt; refreshing templates in place
without clearing it.
◆ Types generated in .nuxt.
```

（`A dev server` 那一行太長，這裡換了行。它只有開發伺服器開著時才會出現，PID 的數字每次都不同。網路上也常看到 `npx nuxi module add image` 的寫法，第 2 集說過，`nuxi` 是舊名字，效果一樣。）

它做了兩件事：用 npm 安裝 `@nuxt/image`，並且把它加進 `nuxt.config.ts` 的 `modules` 陣列。打開 `nuxt.config.ts` 看看：

```ts
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/image"],
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
});
```

Nuxt 只會載入列在 `modules` 裡的模組。如果你是自己用 `npm install` 裝的，記得要手動加上這一行。

### `<NuxtImg>`

網頁上放圖片，最容易遇到兩個問題：圖片太大，載入很慢；圖片載入前沒有預留位置，載入完成時整個版面被推擠。

先準備一張圖片。隨便找一張橫的照片，改名叫 `cover.png`，放進專案的 `public/` 資料夾。第 3 集說過，`public/` 裡的檔案，網址直接從 `/` 開始，所以它的網址是 `/cover.png`。

把首頁 `app/pages/index.vue` 改成：

```vue
<template>
  <main>
    <h1>歡迎來到小書店</h1>
    <p>這是首頁，來自 pages/index.vue。</p>
    <NuxtImg
      src="/cover.png"
      alt="書店的招牌"
      width="600"
      height="400"
      format="webp"
      preload
    />
  </main>
</template>
```

`<NuxtImg>` 是 `@nuxt/image` 提供的元件，用法和 `<img>` 很像，一樣不用 import：

- `src` 是圖片網址，`alt` 是圖片的文字說明，給螢幕閱讀器和圖片載入失敗時使用。有意義的圖片都要寫。
- `width` 和 `height` 是要顯示的寬和高（單位是像素）。瀏覽器拿到之後就知道要預留多大的位置，版面不會跳動。
- `format="webp"` 把圖片轉成 WebP 格式。WebP 是比 PNG、JPEG 更小的圖片格式，現在的瀏覽器都支援。
- `preload` 告訴瀏覽器：「這張圖一進頁面就看得到，請提早載入。」首頁最上方的大圖適合加；放在頁面下方的圖片不要加。

用 `view-source:` 看首頁，`<img>` 變成了這樣（為了好讀換了行並省略部分屬性）：

```html
<img width="600" height="400"
  srcset="/_ipx/f_webp&amp;s_600x400/cover.png 1x,
    /_ipx/f_webp&amp;s_1200x800/cover.png 2x"
  alt="書店的招牌" src="/_ipx/f_webp&amp;s_600x400/cover.png">
```

`src` 不再直接指向 `/cover.png`，而是 `/_ipx/f_webp&s_600x400/cover.png`。`_ipx` 是 `@nuxt/image` 內建的圖片服務，網址中間那一段是處理方式：`f_webp` 是轉成 WebP，`s_600x400` 是縮成 600×400。`&amp;` 是 `&` 在 HTML 裡的寫法。

`srcset` 多列了一個 `s_1200x800` 的版本，後面標著 `2x`。手機和很多筆電的螢幕是「高解析度」的，一個 CSS 像素實際上用兩個螢幕像素來畫，這種螢幕上瀏覽器會自動挑 `2x` 那張，圖片才不會糊。

你的原始圖片可能有好幾 MB，但使用者實際下載的是縮小、轉檔過的版本，通常只有幾十 KB。

### 安裝 `@nuxt/fonts`

網頁預設用使用者電腦裡的字型，每個人看到的樣子都不一樣。想要統一，就要自己載入字型。傳統的做法是在網頁裡連到 Google Fonts，缺點是使用者每次載入網頁，還要多連一次別人的伺服器。

`@nuxt/fonts` 的做法不一樣：**建置的時候**就把字型檔下載下來，跟你的網站放在一起。

```bash
npx nuxt module add fonts
```

輸出和剛剛差不多，最後 `nuxt.config.ts` 的 `modules` 變成：

```ts
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/image", "@nuxt/fonts"],
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
});
```

接下來要做的事少到你可能不相信：**照平常的寫法，在 CSS 裡寫字型的名字就好。** 幫小書店換成 Noto Sans TC（思源黑體），打開 `app/assets/css/main.css`，把 `body` 的 `font-family` 改成：

```css
body {
  margin: 0;
  font-family: "Noto Sans TC", sans-serif;
  line-height: 1.6;
}
```

存檔，畫面上的中文字就換成思源黑體了。

`@nuxt/fonts` 會掃過你的 CSS，看到 `"Noto Sans TC"` 這個名字，就去 Google Fonts 等字型網站找到它，自動幫你加上載入字型需要的 `@font-face` 設定。不用 import、不用寫設定。

### 建置看看

執行 `npm run build`，在一長串輸出裡，會看到 `@nuxt/fonts` 正在下載字型：

```text
[@nuxt/fonts] ℹ Downloading fonts...
[@nuxt/fonts]   ├─ https://fonts.gstatic.com/s/notosanstc/v40/-nF7OG8……0.woff2
[@nuxt/fonts]   ├─ https://fonts.gstatic.com/s/notosanstc/v40/-nF7OG8……1.woff2
```

（網址很長，這裡把中間省略了。）總共有一百多個 `.woff2` 檔。中文字很多，所以字型被切成很多小塊，每塊負責一部分的字。瀏覽器只會下載頁面上用得到的那幾塊。

建置完成後，打開 `.output/public/_nuxt/fonts/`，下載下來的字型檔都在這裡，會和網站一起上線。用 `npm run preview` 啟動，在首頁的原始碼裡搜尋 `@font-face`，會看到類似這樣的設定：

```text
@font-face{font-family:Noto Sans TC;src:local(Noto Sans TC Variable),
url(/_nuxt/fonts/DO1I_TrQRuX……woff2)format("woff2");font-display:swap;
unicode-range:U+3401,U+3441,……
```

字型網址是 `/_nuxt/fonts/` 開頭，也就是你自己的網站，不是 Google。使用者的瀏覽器只需要跟你的網站要資料。`unicode-range` 就是「這一塊負責哪些字」。

另外你也會在建置輸出裡看到這一行：

```text
[@nuxt/image] ℹ sharp binaries have been included in your build for
darwin-arm64. Make sure you deploy to the same architecture.
```

`sharp` 是 `@nuxt/image` 用來縮圖、轉檔的工具，它和電腦的種類有關（這裡的 `darwin-arm64` 指的是 Apple 晶片的 Mac）。意思是「部署的機器要和建置的機器是同一種」，第 15 章講部署時會再提到。

## 重點整理

- 模組用 `npx nuxt module add 名字` 安裝，它會順便加進 `nuxt.config.ts` 的 `modules` 陣列。
- `<NuxtImg>` 會自動縮圖、轉檔，並且產生高解析度螢幕用的版本；記得寫 `alt`、`width`、`height`。
- 首頁最上方看得到的大圖加 `preload`。
- 裝了 `@nuxt/fonts` 之後，只要在 CSS 寫字型名稱，它就會自動處理 `@font-face`。
- 字型在建置時下載，跟網站放在一起，使用者不用再連到 Google。
