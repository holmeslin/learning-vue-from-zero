# 在 Nuxt 裡用 Pinia

## 本集目標

在 Nuxt 專案裡裝好 Pinia，知道為什麼伺服器端渲染時每個請求要有自己的一份 `state`，並且能判斷什麼時候用 Pinia、什麼時候用第 13 章的 `useState` 就夠了。

## 正文

### 先建一個專案

```bash
npm create nuxt@latest pinia-demo
```

選項和第 12 章一樣，範本選 `minimal`。建好之後進到資料夾：

```bash
cd pinia-demo
```

### 用一行指令安裝

第 8 章在 Vue 專案裡用 Pinia，要先 `npm install pinia`，再到 `main.js` 寫 `app.use(createPinia())`。Nuxt 專案沒有 `main.js`，這些事交給一個叫 `@pinia/nuxt` 的**模組**（module）來做。第 12 章裝 `@nuxt/image` 時看過，模組是「幫 Nuxt 加功能的套件」，下一集會再多講一點。

安裝只要一行：

```bash
npx nuxt module add pinia
```

```text
● Resolved @pinia/nuxt, adding module...
● Installing @pinia/nuxt@1.0.3 as a dependency
● Also installing required peer dependency pinia@^4.1.0
● Installing with npm...
◆ Dependencies installed
● Adding @pinia/nuxt to the modules
◆ Types generated in .nuxt.
```

它做了兩件事：

1. 安裝 `@pinia/nuxt` 和 `pinia` 兩個套件。注意第三行，它裝的是 Pinia 4，和第 8 章用的是同一個版本。
2. 把模組加進 `nuxt.config.ts`：

```ts
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@pinia/nuxt'],
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true }
})
```

這是指令自動產生的檔案，所以用的是單引號、沒有分號，和本書其他範例的習慣不同，不影響執行。

就這樣，不用自己呼叫 `createPinia()`。

### store 放在 `app/stores/`

在 `app/` 底下建立 `stores` 資料夾，新增 `app/stores/cart.ts`：

```ts
export const useCartStore = defineStore("cart", () => {
  const items = ref<string[]>([]);
  const count = computed(() => items.value.length);

  function add(name: string) {
    items.value.push(name);
  }

  return { items, count, add };
});
```

這就是第 8 章的 setup store，加上第 10 章教的型別，只少了最上面的 `import`。第 12 章說過 Nuxt 會自動匯入（auto-import）`ref`、`computed`；裝了 `@pinia/nuxt` 之後，`defineStore` 和 `storeToRefs` 也會自動匯入。

store 本身也一樣：**`app/stores/` 裡的檔案會被自動匯入**，用的時候直接呼叫 `useCartStore()` 就好。只有 `app/stores/` 這一層會被掃描，放在 `app/stores/shop/cart.ts` 這種子資料夾裡的不會（子資料夾裡的 `index.ts` 例外）。

新增 `app/components/CartBadge.vue`：

```vue
<script setup lang="ts">
const cart = useCartStore();
</script>

<template>
  <p>購物車：{{ cart.count }} 件</p>
</template>
```

新增 `app/pages/index.vue`：

```vue
<script setup lang="ts">
const cart = useCartStore();
</script>

<template>
  <main>
    <CartBadge />
    <button @click="cart.add('鍵盤')">加入鍵盤</button>
    <ul>
      <li v-for="(item, index) in cart.items" :key="index">
        {{ item }}
      </li>
    </ul>
  </main>
</template>
```

最後把 `app/app.vue` 改成顯示頁面：

```vue
<template>
  <NuxtPage />
</template>
```

執行 `npm run dev`，打開 <http://localhost:3000>，點幾下按鈕，上面的「購物車：N 件」會跟著變。兩個元件拿到的是同一個 store，和第 8 章一樣。

### 為什麼每個請求要有自己的一份 state

第 8 章的 Vue 專案只在瀏覽器裡跑：每個使用者開自己的分頁，各自有一份 store，互不相干。

Nuxt 不一樣。第 13 章說過，頁面會先在**伺服器**上渲染。伺服器只有一台，卻要同時服務很多使用者。如果資料放錯地方，小明的購物車就會跑到小華的畫面上。

直接做個實驗。新增 `app/composables/useLeakyCart.ts`，故意把 `ref` 寫在函式外面：

```ts
// 錯誤示範：ref 宣告在函式外面
const items = ref<string[]>([]);

export function useLeakyCart() {
  return items;
}
```

再新增 `app/pages/compare.vue`，同時用它和 Pinia 的 store：

```vue
<script setup lang="ts">
const route = useRoute();
const leaky = useLeakyCart();
const cart = useCartStore();

const item = route.query.add;
if (import.meta.server && typeof item === "string") {
  leaky.value.push(item);
  cart.add(item);
}
</script>

<template>
  <p>模組層級的 ref：{{ leaky.join('、') }}</p>
  <p>Pinia store：{{ cart.items.join('、') }}</p>
</template>
```

網址上的 `?add=...` 代表「這位使用者把什麼加進購物車」。`import.meta.server` 是第 13 章第 1 集學過的值，程式在伺服器上執行時是 `true`，在瀏覽器裡是 `false`；這裡用它讓加入購物車只在伺服器上做，方便觀察。

這個實驗要看的是**伺服器送出來的 HTML**，而且要讓同一個伺服器連續處理好幾個請求，所以用第 15 章的方式先建置再啟動：

```bash
npm run build
npm run preview
```

接著在瀏覽器的網址列依序輸入下面三個網址。網址最前面的 `view-source:` 會直接顯示伺服器送來的原始碼，而且每個網址只發一次請求（Chrome、Edge、Firefox 都支援，Safari 不支援）。在原始碼裡找 `<p>` 那兩行。

小明打開 `view-source:http://localhost:3000/compare?add=小明的鍵盤`：

```text
<p>模組層級的 ref：小明的鍵盤</p>
<p>Pinia store：小明的鍵盤</p>
```

小華打開 `view-source:http://localhost:3000/compare?add=小華的滑鼠`：

```text
<p>模組層級的 ref：小明的鍵盤、小華的滑鼠</p>
<p>Pinia store：小華的滑鼠</p>
```

第三個人什麼都沒加，打開 `view-source:http://localhost:3000/compare`：

```text
<p>模組層級的 ref：小明的鍵盤、小華的滑鼠</p>
<p>Pinia store：</p>
```

模組層級的 `ref` 只有一份，伺服器啟動時建立，之後每個請求都共用它，所以小明的鍵盤一路留到別人的畫面上。如果你看到的清單比上面長，例如同一個東西出現兩次，那是你多重新整理了幾次，那些請求也被記住了，正好證明同一件事。這叫做**跨請求的狀態汙染**（cross-request state pollution），如果裡面放的是個人資料，就是資安問題。

Pinia 那行每次都是乾淨的。原因是 `@pinia/nuxt` 會在每個請求開始時呼叫一次 `createPinia()`，每個請求拿到自己的一份 `state`，用完就丟。

至於畫面：這一頁故意讓伺服器和瀏覽器算出不一樣的東西，所以瀏覽器的 Console 可能會出現第 13 章看過的 hydration mismatch 警告，畫面上的文字也可能被瀏覽器重新算過。這個實驗只看原始碼就好。

記住結論：**在 Nuxt 裡，要跨元件共享的資料，放進 Pinia store 或 `useState`，不要放在函式外面的 `ref`。** 實驗做完，把 `useLeakyCart.ts` 和 `compare.vue` 刪掉。

### 在伺服器上把資料抓進 store

store 的資料常常要從 API 來。新增 `server/api/products.ts`（第 14 章的寫法）：

```ts
export default defineEventHandler(() => {
  return [
    { id: 1, name: "鍵盤", price: 1200 },
    { id: 2, name: "滑鼠", price: 600 },
  ];
});
```

新增 `app/stores/products.ts`，在 action 裡用 `$fetch` 抓資料：

```ts
type Product = { id: number; name: string; price: number };

export const useProductsStore = defineStore("products", () => {
  const list = ref<Product[]>([]);

  async function load() {
    list.value = await $fetch<Product[]>("/api/products");
  }

  return { list, load };
});
```

在頁面裡呼叫這個 action，新增 `app/pages/products.vue`：

```vue
<script setup lang="ts">
const products = useProductsStore();
await callOnce("products", () => products.load());
</script>

<template>
  <ul>
    <li v-for="product in products.list" :key="product.id">
      {{ product.name }}：{{ product.price }} 元
    </li>
  </ul>
</template>
```

`callOnce` 是 Nuxt 內建的函式，第 13 章沒教過，這裡先照抄。它的意思是「這段只執行一次」：第一個參數是名字，第二個是要執行的函式。Pinia 官方文件建議在 Nuxt 裡用它來呼叫 store 的 action。

流程是這樣：

1. 請求進來，伺服器執行 `callOnce`，呼叫 `products.load()`，store 裡有了兩筆商品。
2. 伺服器用 store 的資料渲染出 HTML。
3. `@pinia/nuxt` 把整個 store 的 `state` 放進頁面裡的 payload，一起送到瀏覽器。
4. 瀏覽器 hydration 時，Pinia 從 payload 把 `state` 還原回來；`callOnce` 知道伺服器已經做過了，不會再抓一次。

打開 `view-source:http://localhost:3000/products`，可以看到商品已經在 HTML 裡：

```text
<li>鍵盤：1200 元 </li>
<li>滑鼠：600 元 </li>
```

再往下找 `id="__NUXT_DATA__"` 那一段，裡面有 `"pinia"`、`"products"`、`"list"` 這些字，就是第 3 步送過來的 `state`。這和第 13 章 `useFetch` 把資料放進 payload 是同一套機制，所以不會在伺服器抓一次、瀏覽器又抓一次。

### Pinia 還是 `useState`？

第 13 章的 `useState` 也能跨元件共享，而且一樣是每個請求一份、一樣會放進 payload。上面的購物車用 `useState` 寫，大概是這樣：

```ts
export function useCart() {
  const items = useState<string[]>("cart", () => []);

  function add(name: string) {
    items.value.push(name);
  }

  return { items, add };
}
```

兩個都對。怎麼選：

| | `useState` | Pinia |
| --- | --- | --- |
| 裡面裝什麼 | 一個值 | `state`、getters、actions 一整組 |
| 要另外安裝嗎 | 不用，Nuxt 內建 | 要裝 `@pinia/nuxt` |
| Vue DevTools | 沒有專屬面板 | 有 Pinia 面板，看得到每個 store |
| 離開 Nuxt 能用嗎 | 不能 | 能，和第 8 章同一套寫法 |

簡單的判斷方式：

- 只是幾個零散的值，例如目前的主題顏色、側邊欄有沒有打開，用 `useState` 就好，不用多裝東西。
- 資料有一堆相關的操作，例如購物車的加入、移除、算總價，或是好幾個頁面都要用的登入使用者資料，用 Pinia，把資料和操作收在同一個 store 裡比較好管。

同一個專案兩個一起用也完全沒問題。

## 重點整理

- `npx nuxt module add pinia` 會安裝 `@pinia/nuxt` 與 Pinia 4，並加進 `nuxt.config.ts`，不用自己 `createPinia()`。
- `app/stores/` 裡的 store、`defineStore`、`storeToRefs` 都會自動匯入，只掃這一層資料夾。
- 伺服器同時服務很多人，寫在函式外面的 `ref` 會被所有請求共用；Pinia 每個請求一份 `state`，不會互相汙染。
- 在頁面裡用 `callOnce` 呼叫 action，伺服器抓的資料會跟著 payload 送到瀏覽器，不會重抓。
- 幾個簡單的值用 `useState`，有一組相關操作的資料用 Pinia。
