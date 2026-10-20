# lazy hydration

## 本集目標

用 `hydrate-on-visible` 這類設定，讓元件先在伺服器渲染好，等需要時才 hydration。

## 正文

### 看得到，但還不用能按

上一集的 `Lazy` 搭配 `v-if`，元件一開始根本不在畫面上。可是有些元件**一開始就要顯示**，只是不急著能互動。

例如一篇很長的文章，最底下有個「讚」按鈕。使用者剛打開頁面時在讀最上面，按鈕遠在畫面外。這個按鈕應該要在 HTML 裡（搜尋引擎看得到、捲下去馬上看得到），但它的 JavaScript 可以等使用者捲到那裡再處理。

第 2 集說過，hydration 就是瀏覽器下載 JavaScript、讓 HTML 可以互動的過程。Nuxt 可以讓你決定**每個元件什麼時候 hydration**，這叫 **lazy hydration**（延遲 hydration）。

### 捲到才 hydration

建立 `app/components/LikeButton.vue`：

```vue
<script setup lang="ts">
const likes = ref(0);

onMounted(() => {
  console.log("LikeButton 可以按了");
});
</script>

<template>
  <button @click="likes++">讚 {{ likes }}</button>
</template>
```

`onMounted` 會在 hydration 完成時執行，用來觀察它什麼時候 hydration。

建立 `app/pages/long.vue`，用一個很高的段落模擬長文章：

```vue
<template>
  <h1>很長的文章</h1>
  <p style="height: 2000px">（往下捲……）</p>
  <LazyLikeButton hydrate-on-visible />
</template>
```

重點是最後一行：元件名稱加上 `Lazy` 前綴，再加上 `hydrate-on-visible` 屬性。

打開 `http://localhost:3000/long`，打開主控台和「網路」分頁（篩選 `LikeButton`）：

- 剛打開時，主控台沒有「LikeButton 可以按了」，網路分頁也沒有 `LikeButton.vue`。
- 往下捲到按鈕出現，主控台印出 `LikeButton 可以按了`，網路分頁出現 `LikeButton.vue`。

再看「檢視網頁原始碼」，搜尋「讚」：

```text
<p style="height:2000px;">（往下捲……）</p><button>讚 0</button>
```

按鈕**已經在 HTML 裡**了。這是和上一集、和 `<ClientOnly>` 最大的不同：

| | 伺服器渲染 | 瀏覽器什麼時候接手 |
| --- | --- | --- |
| 一般元件 | 有 | 頁面載入就 hydration |
| `<LazyXxx v-if>` | 看 `v-if` | 要顯示時才下載、渲染 |
| `<ClientOnly>` | 沒有，只有 fallback | 掛載後才渲染 |
| `<LazyXxx hydrate-on-visible>` | 有 | 出現在畫面上才 hydration |

使用者一打開就看得到按鈕，只是頁面一開始不用花時間處理它的 JavaScript，可以先把力氣花在畫面最上面的內容。

### 其他時機

`hydrate-on-visible` 只是其中一種。Nuxt 4 內建這幾種，一個元件只能選一種：

| 寫法 | 什麼時候 hydration |
| --- | --- |
| `hydrate-on-visible` | 元件出現在畫面上時 |
| `hydrate-on-idle` | 瀏覽器忙完、有空的時候 |
| `hydrate-on-interaction` | 使用者和它互動時，預設是滑鼠移上去、點、或用鍵盤移到它上面 |
| `hydrate-on-media-query="(max-width: 768px)"` | 符合指定的 CSS 媒體查詢時，例如螢幕寬度小於 768px |
| `:hydrate-after="2000"` | 過了指定的毫秒數之後，這裡是 2 秒 |
| `:hydrate-when="isReady"` | 綁定的值變成 `true` 時 |
| `hydrate-never` | 永遠不 hydration，只保留伺服器的 HTML |

`hydrate-after` 和 `hydrate-when` 前面有冒號，因為給的是數字和變數，不是字串（第 4 章的 `v-bind` 簡寫）。

### 知道它什麼時候 hydration

用了 lazy hydration 的元件，hydration 完成時會發出 `hydrated` 事件，可以用 `@hydrated` 接收。建立 `app/pages/long-events.vue`：

```vue
<script setup lang="ts">
function onHydrated() {
  console.log("hydration 完成");
}
</script>

<template>
  <LazyLikeButton hydrate-on-interaction @hydrated="onHydrated" />
</template>
```

打開 `http://localhost:3000/long-events`，把滑鼠移到按鈕上，主控台會印出：

```text
LikeButton 可以按了
hydration 完成
```

要注意的是：如果滑鼠一移過去就馬上點，那一下可能在 hydration 完成之前就發生了，數字不會加。實際測試時，直接點第一下只會觸發 hydration，第二下數字才變成 1。所以會被馬上點的按鈕，不適合用 `hydrate-on-interaction`。

### 使用時要注意

- **一定要加 `Lazy` 前綴**。寫成 `<LikeButton hydrate-on-visible />` 不會有效果。
- **屬性要直接寫在模板上**，不能用 `v-bind="物件"` 的方式一次展開進去。
- **畫面最上面、一打開就看得到的元件，不要延遲**。使用者一進來就可能要用，延遲反而讓它慢下來。
- **需要互動的元件，不要用 `hydrate-never`**。它的按鈕永遠不會有反應。
- 傳給元件的 props 一改變，元件就會立刻 hydration，不管你選的是哪一種時機。

lazy hydration 是最佳化的工具，不是每個元件都要加。頁面上元件很多、載入明顯變慢時，再挑那些「看得到但不急著互動」的元件來用。

## 重點整理

- lazy hydration 讓元件先在伺服器渲染，等到指定的時機才在瀏覽器 hydration。
- 寫法是 `Lazy` 前綴加上 `hydrate-on-visible` 這類屬性。
- 元件照樣出現在伺服器的 HTML 裡，這是和 `<ClientOnly>` 的差別。
- `@hydrated` 事件可以知道元件什麼時候完成 hydration。
- 畫面最上面的重要元件不要延遲，需要互動的元件不要用 `hydrate-never`。
