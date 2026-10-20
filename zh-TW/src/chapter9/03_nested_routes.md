# 巢狀路由與共用版面

## 本集目標

用巢狀路由讓多個頁面共用同一個版面，例如同一個導覽列。

## 正文

### 每一頁都要放導覽列嗎

上一集把導覽列放在 `App.vue`，剛好每一頁都有。但真實的網站不只有導覽列，還有頁尾、側邊欄，而且有些頁面（例如第 8 集的登入頁）不想要這些東西。全部塞進 `App.vue` 很快就不夠用。

Vue Router 的解法是**巢狀路由**（nested routes）：讓一條路由當外層，裡面包著其他路由。外層負責共用的版面，內層負責各自的內容。

### 版面元件

建立 `src/components/AppLayout.vue`：

```vue
<script setup>
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <nav>
    <RouterLink to="/">首頁</RouterLink>
    <RouterLink to="/products">商品</RouterLink>
    <RouterLink to="/about">關於</RouterLink>
  </nav>
  <main>
    <RouterView />
  </main>
</template>

<style scoped>
nav {
  display: flex;
  gap: 1rem;
}

.router-link-active {
  font-weight: bold;
}
</style>
```

注意這裡**又有一個** `<RouterView />`。`App.vue` 裡的 `RouterView` 會顯示外層的 `AppLayout`，`AppLayout` 裡的這個 `RouterView` 再顯示內層的頁面。一層路由對應一個 `RouterView`。

`App.vue` 現在只剩一件事，改回第 1 集的樣子：

```vue
<script setup>
import { RouterView } from "vue-router";
</script>

<template>
  <RouterView />
</template>
```

### 商品資料與商品頁

為了接下來幾集，先準備一點資料。建立 `src/products.js`：

```js
export const products = [
  { id: 1, name: "機械鍵盤", price: 2400, category: "keyboard" },
  { id: 2, name: "無線滑鼠", price: 890, category: "mouse" },
  { id: 3, name: "人體工學滑鼠", price: 1990, category: "mouse" },
  { id: 4, name: "60% 小鍵盤", price: 1800, category: "keyboard" },
];
```

再建立 `src/views/ProductsView.vue`，先簡單列出名字：

```vue
<script setup>
import { products } from "../products.js";
</script>

<template>
  <h1>商品</h1>
  <ul>
    <li v-for="product in products" :key="product.id">
      {{ product.name }}
    </li>
  </ul>
</template>
```

### 用 `children` 把內層路由包起來

把 `src/router/index.js` 改成：

```js
import { createRouter, createWebHistory } from "vue-router";
import AppLayout from "../components/AppLayout.vue";
import HomeView from "../views/HomeView.vue";
import AboutView from "../views/AboutView.vue";
import ProductsView from "../views/ProductsView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: AppLayout,
      children: [
        { path: "", component: HomeView },
        { path: "about", component: AboutView },
        { path: "products", component: ProductsView },
      ],
    },
  ],
});

export default router;
```

外層路由多了一個 `children` 陣列，裡面放內層路由，寫法和外層一模一樣。要注意兩件事：

- 內層的 `path` **開頭不加斜線**。它會接在外層的 `path` 後面：`"about"` 接在 `"/"` 後面，就是 `/about`。如果寫成 `"/about"`，開頭的斜線代表「從網站的根開始算」，就不會接在外層後面了。
- `path: ""` 是空字串，代表「外層的網址剛好符合、後面沒有更多東西」的時候顯示它。所以網址是 `/` 時，顯示的是 `AppLayout` 裡面包著 `HomeView`。

網址是 `/about` 時，Vue Router 先在 `App.vue` 的 `RouterView` 放進 `AppLayout`，再把 `AboutView` 放進 `AppLayout` 裡的 `RouterView`。換頁時，`AppLayout` 本身不會重新建立，只有裡面那一塊換掉。

### 首頁連結永遠是粗體

打開網頁點來點去，你會發現怪事：不管在哪一頁，「首頁」都是粗體。

用開發者工具看一下，在 `/about` 時，首頁連結是 `class="router-link-active"`。原因是現在**所有頁面都是 `/` 那條路由的孩子**，`/about` 也在 `/` 底下，所以 Vue Router 認為「首頁」這個連結也算符合。

這時候就要用另一個 class。把 `AppLayout.vue` 的樣式改成：

```css
.router-link-exact-active {
  font-weight: bold;
}
```

`router-link-exact-active` 要網址完全一樣才會加上，首頁連結就只會在 `/` 時變粗體。create-vue 的範例專案也是用這個 class。

## 重點整理

- 巢狀路由用 `children` 陣列：外層路由提供版面，內層路由提供內容。
- 外層元件裡也要放 `<RouterView />`，標出內層頁面顯示的位置。
- 內層的 `path` 開頭不加斜線，會接在外層的 `path` 後面。
- `path: ""` 在外層網址剛好符合時顯示。
- 首頁是所有頁面的外層時，導覽列用 `router-link-exact-active` 比較不會出錯。
