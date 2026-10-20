# `<style scoped>`

## 本集目標

用 `<style scoped>` 讓元件的樣式只影響自己，不會不小心改到別的元件。

## 正文

### 樣式會互相打架

第 3 集說過，`<style>` 裡寫的 CSS 會套用到整個網站。這在元件一多的時候會出問題。

建立 `src/components/SaleBanner.vue`：

```vue
<template>
  <p class="title">限時特價</p>
</template>

<style>
.title {
  color: red;
}
</style>
```

再建立 `src/components/NewsBanner.vue`：

```vue
<template>
  <p class="title">最新消息</p>
</template>

<style>
.title {
  color: blue;
}
</style>
```

兩個元件各自把 `.title` 設成自己要的顏色。把 `src/App.vue` 換成：

```vue
<script setup>
import SaleBanner from "./components/SaleBanner.vue";
import NewsBanner from "./components/NewsBanner.vue";
</script>

<template>
  <SaleBanner />
  <NewsBanner />
</template>
```

你預期「限時特價」是紅色、「最新消息」是藍色，結果**兩個都是藍色**。

原因是兩段 CSS 最後都被放進同一個網頁裡，變成兩條一模一樣的選擇器 `.title`。第 3 章學過，選擇器一樣具體時，後面的贏，所以藍色蓋過了紅色。寫 `SaleBanner` 的時候，你根本不會知道另一個檔案也用了 `.title` 這個名字。元件越多，這種意外越多。

### 加上 `scoped`

把兩個元件的 `<style>` 都改成 `<style scoped>`。`src/components/SaleBanner.vue` 換成：

```vue
<template>
  <p class="title">限時特價</p>
</template>

<style scoped>
.title {
  color: red;
}
</style>
```

`src/components/NewsBanner.vue` 換成：

```vue
<template>
  <p class="title">最新消息</p>
</template>

<style scoped>
.title {
  color: blue;
}
</style>
```

存檔後，「限時特價」變回紅色，「最新消息」是藍色。各管各的，互不干擾。

`scoped` 的意思是「有範圍的」：這段樣式**只套用在這個元件自己的模板上**。

### Vue 是怎麼做到的

在畫面上按右鍵選「檢查」，看產生的 HTML：

```html
<p data-v-02a1a2fa="" class="title">限時特價</p>
<p data-v-e0ed3bcc="" class="title">最新消息</p>
```

每個元素多了一個 `data-v-` 開頭的屬性，後面那串英數字是 Vue 幫每個元件產生的代號，你看到的會不一樣。同一個元件裡的元素，代號都相同；不同元件，代號不同。

再看右邊套用的 CSS，選擇器也被改寫了：

```css
.title[data-v-02a1a2fa] {
  color: red;
}
```

`[data-v-02a1a2fa]` 是 CSS 的「屬性選擇器」，意思是「而且要有這個屬性」。所以這條規則變成「class 是 `title`，**而且**是 `SaleBanner` 裡的元素」，自然就碰不到 `NewsBanner` 的 `.title`。

這些都是 Vue 自動做的，你只要寫 `scoped`。

### 一個小例外：子元件的最外層元素

加了 `scoped` 的樣式，原則上只影響自己的模板。但有一個例外：**子元件模板裡最外層的元素**，也會被父元件的 scoped 樣式套到。

以剛才的例子來說，如果 `App.vue` 也寫了 `<style scoped>`，裡面有 `.title` 的規則，它會套到 `SaleBanner` 和 `NewsBanner` 的 `<p class="title">`，因為那兩個 `<p>` 剛好是子元件的最外層元素。Vue 這樣設計，是為了讓父元件可以調整子元件的外框，例如位置和間距。

遇到「明明加了 `scoped`，怎麼還是被別人的樣式影響」，先檢查是不是這個原因。

### 全網站共用的樣式放哪裡

不是所有樣式都該 scoped。字型、背景色、行距這種整個網站共用的設定，放在第 3 集整理過的 `src/assets/main.css`，它在 `main.js` 裡被載入，會套用到整個網站。

所以規則是：

- **全網站共用的樣式**：寫在 `src/assets/main.css`。
- **元件自己的樣式**：寫在元件的 `<style scoped>` 裡。

從現在開始，元件的 `<style>` 一律加上 `scoped`。前面幾集的 `NoticeBox.vue` 等元件用的是沒有 `scoped` 的 `<style>`，你可以自己幫它們加上，畫面不會有變化，但之後就不怕撞名了。

## 重點整理

- 沒加 `scoped` 的 `<style>` 會套用到整個網站，不同元件用了同樣的 class 名稱就會互相打架。
- `<style scoped>` 讓樣式只套用在這個元件自己的模板上。
- Vue 靠 `data-v-` 開頭的屬性和改寫過的選擇器做到這件事，全部自動處理。
- 子元件最外層的元素，也會被父元件的 scoped 樣式套到。
- 全網站共用的樣式放 `src/assets/main.css`，元件自己的樣式用 `<style scoped>`。
