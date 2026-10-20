# hydration mismatch

## 本集目標

看懂 hydration mismatch 的警告，知道它為什麼會發生，以及常見的修法。

## 正文

### 做一個會出問題的頁面

建立 `app/pages/lucky.vue`，每次打開都給一個隨機的幸運數字：

```vue
<script setup lang="ts">
const lucky = Math.floor(Math.random() * 100);
</script>

<template>
  <p>今天的幸運數字：{{ lucky }}</p>
</template>
```

`Math.random()` 會給一個 0 到 1 之間的隨機小數，乘以 100 再用 `Math.floor` 去掉小數，就是 0 到 99 的整數。

打開 `http://localhost:3000/lucky`，畫面看起來正常。但打開主控台，會看到一段黃色的警告（節錄）和一行紅色的錯誤，數字每次都不一樣：

```text
[Vue warn]: Hydration text content mismatch on [node HTMLParagraphElement]
  - rendered on server: 今天的幸運數字：3
  - expected on client: 今天的幸運數字：6
  at <Lucky ... >
```

```text
Hydration completed but contains mismatches.
```

開發模式下，Nuxt 也會把這段警告轉印到終端機，前面標著 `WARN  [console.warn]`。

### 讀懂這段警告

- `Hydration text content mismatch`：hydration 的時候，文字內容對不上。
- `on [node HTMLParagraphElement]`：出事的是一個 `<p>` 標籤。
- `rendered on server`：伺服器送來的 HTML 裡寫的是「3」。
- `expected on client`：瀏覽器自己算出來應該是「6」。
- `at <Lucky ... >`：發生在 `lucky.vue` 這個元件裡。

第 2 集說過，hydration 的前提是「伺服器和瀏覽器算出來的畫面要一樣」。這個頁面的 setup 跑了兩次，`Math.random()` 也跑了兩次，兩次的結果當然不同，這種情況就叫 **hydration mismatch**（不一致）。

Vue 發現對不上之後，會用瀏覽器算出來的值蓋掉，所以你最後看到的是 6。如果你眼睛夠快，或網路夠慢，可能會看到數字閃一下。

### 為什麼不能放著不管

畫面最後是對的，看起來好像沒關係，但 mismatch 會帶來幾個問題：

- **畫面閃動**：使用者先看到 3，再突然變成 6。如果不一致的是一大塊版面，整個頁面會跳一下。
- **比較慢**：Vue 要額外修補對不上的地方，嚴重時會重新渲染一大片。
- **可能壞掉**：對不上的地方，事件有時候綁不上去，按鈕會按了沒反應。
- **搜尋引擎看到的不一樣**：搜尋引擎讀的是伺服器的 HTML，和使用者實際看到的不同。

正式上線的版本只會印出 `Hydration completed but contains mismatches.` 這一行，看不到是哪裡出錯，所以要在開發時就修好。

### 修法一：用 useState 讓兩邊一致

幸運數字的問題在於「兩邊各算了一次」。只要讓伺服器算一次，再把結果帶到瀏覽器就好，這正是第 6 集學的 `useState` 會做的事。建立 `app/pages/lucky-fixed.vue`：

```vue
<script setup lang="ts">
const lucky = useState("lucky", () => Math.floor(Math.random() * 100));
</script>

<template>
  <p>今天的幸運數字：{{ lucky }}</p>
</template>
```

`useState` 的初始值函式只在伺服器上執行一次，結果放進 payload。瀏覽器 hydration 時看到 payload 裡已經有 `"lucky"`，就直接拿來用，不會再呼叫 `Math.random()`。打開 `/lucky-fixed`，主控台不會再有警告。

`useFetch`、`useAsyncData` 也是同樣的道理，所以第 4 集說直接 `$fetch` 抓兩次可能會造成 mismatch，而用它們就不會。

### 修法二：等到瀏覽器再算

另一種常見的情況是時間。建立 `app/pages/clock.vue`：

```vue
<script setup lang="ts">
const now = new Date().toLocaleTimeString("zh-TW");
</script>

<template>
  <p>現在時間：{{ now }}</p>
</template>
```

`toLocaleTimeString("zh-TW")` 會把時間轉成像「上午8:46:18」這樣的文字。伺服器和瀏覽器各算一次，大部分時候剛好落在同一秒，不會出事；可是只要跨過一秒，或伺服器放在別的時區，兩邊的時間就不同，又是 mismatch。

這種「本來就該顯示使用者那邊的值」的東西，用 `useState` 帶伺服器的時間過去也不對。正確的做法是：伺服器先顯示一個固定的佔位文字，等到瀏覽器再填上真正的值。第 1 集學過，`onMounted` 只在瀏覽器執行，而且是在 hydration 之後。建立 `app/pages/clock-fixed.vue`：

```vue
<script setup lang="ts">
const now = ref("");

onMounted(() => {
  now.value = new Date().toLocaleTimeString("zh-TW");
});
</script>

<template>
  <p>現在時間：{{ now || "--:--:--" }}</p>
</template>
```

- 伺服器：`now` 是空字串，畫面顯示「--:--:--」。
- 瀏覽器 hydration：`now` 也是空字串，畫面也是「--:--:--」，兩邊一致。
- hydration 完成後 `onMounted` 執行，`now` 變成目前時間，Vue 正常更新畫面。

上一集的 `<ClientOnly>` 也是同一個思路，只是範圍是整個元件。

### 常見的原因

看到 hydration mismatch 時，先檢查 setup 和模板裡有沒有這些東西：

| 原因 | 修法 |
| --- | --- |
| `Math.random()` 之類的隨機值 | 用 `useState` 包起來 |
| 目前時間、`Date.now()` | 放進 `onMounted`，或用 `<ClientOnly>` |
| `window`、`localStorage` 的值 | 放進 `onMounted`，或用 `<ClientOnly>` |
| 在 setup 裡直接 `$fetch` | 改用 `useFetch` 或 `useAsyncData` |
| 寫在函式外面的 `ref` | 改用 `useState` |

共同點都是：**伺服器和瀏覽器各自算了一次，而且算出不同的結果**。修法也只有兩種方向：讓伺服器算一次再帶過去，或是乾脆等到瀏覽器再算。

## 重點整理

- 伺服器的 HTML 和瀏覽器算出的畫面不同，就會發生 hydration mismatch。
- 警告裡的 `rendered on server` 和 `expected on client` 分別是兩邊的結果。
- mismatch 會造成畫面閃動、變慢，甚至事件綁不上，要在開發時修好。
- 隨機值用 `useState` 讓伺服器算一次再帶到瀏覽器。
- 時間、瀏覽器才有的值放進 `onMounted` 或 `<ClientOnly>`，伺服器先顯示佔位內容。
