# `<Transition>`

## 本集目標

用 `<Transition>` 讓元素出現和消失時有淡入淡出之類的動畫。

## 正文

### 先看範例

把 `src/App.vue` 換成：

```vue
<script setup>
import { ref } from "vue";

const show = ref(true);
</script>

<template>
  <button @click="show = !show">切換</button>

  <Transition name="fade">
    <p v-if="show">你好，我會淡入淡出。</p>
  </Transition>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

按「切換」，文字花半秒慢慢變透明、然後消失；再按一次，它又慢慢浮現。

沒有 `<Transition>` 的話，`v-if` 一變成 `false`，元素就「啪」一聲不見了。

### `<Transition>` 做了什麼

`<Transition>` 是 Vue 內建的元件，不用 `import`。把要做動畫的元素包在裡面，當它因為 `v-if` 或 `v-show` 出現、消失時，Vue 會在適當的時機幫它加上、拿掉幾個 CSS class。動畫本身是 CSS 的 `transition` 屬性做的，Vue 只負責換 class。

`name="fade"` 決定 class 的開頭。出現（enter）和消失（leave）各有三個：

| class | 什麼時候有 |
| --- | --- |
| `fade-enter-from` | 出現的第一個瞬間，動畫的起點 |
| `fade-enter-active` | 整個出現的過程 |
| `fade-enter-to` | 出現的終點 |
| `fade-leave-from` | 消失的第一個瞬間 |
| `fade-leave-active` | 整個消失的過程 |
| `fade-leave-to` | 消失的終點 |

範例只用了其中四個：

- `fade-enter-active` 和 `fade-leave-active` 寫上 `transition: opacity 0.5s`，意思是「這段期間，透明度的變化要花 0.5 秒」。
- `fade-enter-from` 和 `fade-leave-to` 寫上 `opacity: 0`，也就是「出現的起點」和「消失的終點」都是全透明。

`-enter-to` 和 `-leave-from` 就是元素平常的樣子（不透明），不用另外寫。

整理一下出現的過程：元素一放上畫面就帶著 `fade-enter-from`（全透明），下一瞬間 Vue 拿掉它，元素回到平常的不透明，而 `transition` 讓這個變化花 0.5 秒完成。消失則反過來，最後 Vue 等動畫跑完，才真的把元素從畫面上拿掉。

沒寫 `name` 的話，class 開頭是 `v-`，也就是 `v-enter-from`、`v-leave-to`……。取名字的好處是同一頁可以有好幾種不同的動畫。

### 兩個元素輪流出現：`mode="out-in"`

`<Transition>` 裡面一次只能有一個元素，但可以用 `v-if` / `v-else` 在兩個元素之間切換。把 `src/App.vue` 換成：

```vue
<script setup>
import { ref } from "vue";

const loggedIn = ref(false);
</script>

<template>
  <Transition name="slide" mode="out-in">
    <button v-if="loggedIn" @click="loggedIn = false">登出</button>
    <button v-else @click="loggedIn = true">登入</button>
  </Transition>
</template>

<style>
.slide-enter-active,
.slide-leave-active {
  transition:
    opacity 0.3s,
    transform 0.3s;
}

.slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (prefers-reduced-motion: reduce) {
  .slide-enter-active,
  .slide-leave-active {
    transition: none;
  }
}
</style>
```

按「登入」，按鈕往下滑走、淡出，接著「登出」從上面滑下來、淡入。

`mode="out-in"` 的意思是「舊的先離開（out），新的再進來（in）」。不加的話，兩個動畫會同時進行，有一小段時間兩個按鈕會同時出現在畫面上，擠來擠去。

這次的 `-enter-from` 和 `-leave-to` 寫得不一樣：進來時從上面（`-10px`）滑到原位，離開時從原位滑到下面（`10px`）。`transform: translateY()` 是 CSS 的「往上下移動」。

### 有些人不喜歡動畫

最後那段 `@media (prefers-reduced-motion: reduce)`，是給在作業系統裡開了「減少動態效果」的使用者。有些人看到畫面滑動會頭暈，這段 CSS 讓他們看到的是直接切換、沒有動畫。做動畫時順手加上，是很體貼的習慣。

### 清單用 `<TransitionGroup>`

`<Transition>` 一次只能包一個元素。如果是用 `v-for` 畫出來的清單，要讓新增、刪除的項目也有動畫，用的是另一個內建元件 `<TransitionGroup>`，寫法和 class 名稱幾乎一樣。需要的時候再查官方文件就好。

## 重點整理

- `<Transition>` 包住一個用 `v-if` 或 `v-show` 控制的元素，讓它出現、消失時有動畫。
- 動畫是 CSS 的 `transition` 做的，Vue 只負責在對的時機加上、拿掉 class。
- `name="fade"` 讓 class 變成 `fade-enter-from`、`fade-leave-to` 等；最常用的是 `-active`、`-enter-from`、`-leave-to`。
- 兩個元素輪流出現時，加上 `mode="out-in"` 讓舊的先離開。
- 記得用 `prefers-reduced-motion` 照顧不想看動畫的使用者。
