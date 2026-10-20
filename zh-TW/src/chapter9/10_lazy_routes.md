# 延遲載入路由

## 本集目標

把頁面元件改成「用到才下載」，讓網站第一次打開時下載的東西變少。

## 正文

### 先看看現在的網站有多大

在專案的終端機執行：

```bash
npx vite build
```

這是建置指令，它會把整個網站打包成可以放上主機的檔案，放在 `dist/` 資料夾。輸出大概長這樣（右邊還有一欄 gzip 壓縮後的大小，這裡省略；你的數字和檔名後面那串亂碼會不一樣）：

```text
vite v8.3.4 building client environment for production...
transforming...
✓ 34 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                  0.42 kB
dist/assets/index-Be7NqEIO.css   0.10 kB
dist/assets/index-B52rvN_A.js   99.50 kB

✓ built in 51ms
```

所有的 JavaScript 都在 `index-B52rvN_A.js` 這**一個**檔案裡：Vue、Vue Router、Pinia，還有你寫的每一個頁面。使用者不管打開哪一頁，都要先把整包下載完，畫面才會出來。

現在網站很小，差別感覺不出來。但頁面一多，有些頁面（例如帳號設定）大部分人根本不會點進去，卻每個人都要下載，就很浪費。

### 改成用到才載入

把 `src/router/index.js` 改成：

```js
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth.js";
import AppLayout from "../components/AppLayout.vue";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: AppLayout,
      children: [
        { path: "", component: HomeView },
        { path: "about", component: () => import("../views/AboutView.vue") },
        {
          path: "products",
          component: () => import("../views/ProductsView.vue"),
        },
        {
          path: "products/:id",
          name: "product",
          component: () => import("../views/ProductDetailView.vue"),
        },
        {
          path: "account",
          component: () => import("../views/AccountView.vue"),
          meta: { requiresAuth: true },
        },
      ],
    },
    { path: "/login", component: () => import("../views/LoginView.vue") },
    {
      path: "/:pathMatch(.*)*",
      component: () => import("../views/NotFoundView.vue"),
    },
  ],
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { path: "/login", query: { redirect: to.fullPath } };
  }
});

export default router;
```

差別在 `component` 的寫法。原本是在檔案開頭 `import AboutView from ...`，再寫 `component: AboutView`；現在檔案開頭不匯入了，改成：

```js,ignore
component: () => import("../views/AboutView.vue"),
```

`() => import(...)` 是箭頭函式，呼叫它的時候才去載入那個檔案。這種寫在程式中間、用到才執行的 `import()` 叫**動態匯入**（dynamic import），它回傳的是 Promise（第 2 章學過），檔案下載完才會完成。

Vue Router 看到 `component` 是函式，就知道「等真的要顯示這一頁時，再呼叫它去下載」。下載完之後會記起來，第二次進同一頁就不用再下載。

### 再建置一次

```bash
npx vite build
```

```text
vite v8.3.4 building client environment for production...
transforming...
✓ 35 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                                    0.52 kB
dist/assets/index-Be7NqEIO.css                     0.10 kB
dist/assets/AboutView-CsuYAdZy.js                  0.21 kB
dist/assets/products-BGr7ar2t.js                   0.25 kB
dist/assets/AccountView-CIW7-Sks.js                0.40 kB
dist/assets/NotFoundView-CFhlGgQ2.js               0.44 kB
dist/assets/LoginView-BMhqNns_.js                  0.58 kB
dist/assets/ProductsView-BzdOjehi.js               0.84 kB
dist/assets/ProductDetailView-CES4HRd1.js          0.85 kB
dist/assets/index-DM31hzX-.js                     41.99 kB
dist/assets/runtime-core.esm-bundler-k166ubr7.js  57.98 kB

✓ built in 52ms
```

每個改成延遲載入的頁面，都拆成了自己的檔案，例如 `AboutView-CsuYAdZy.js`。`products-BGr7ar2t.js` 是 `src/products.js` 的商品資料，商品列表和商品頁都會用到，所以單獨拆出來讓兩邊共用。Vue 本身也拆成了 `runtime-core` 那個檔案，每一頁都會用到它。

打開 `/` 時，瀏覽器只下載 `index` 和 `runtime-core` 這兩個 JavaScript 檔案；點進「關於」時，才去下載 `AboutView` 那一小包。想親眼看看的話，可以執行 `npm run preview` 打開建置好的網站，在開發者工具的 Network（網路）分頁點來點去，觀察檔案是什麼時候出現的。

### 哪些頁面要延遲載入

- **首頁和共用版面**：使用者一打開就會看到，延遲載入只是多等一次下載，所以這裡的 `HomeView` 和 `AppLayout` 維持一般的 `import`。
- **其他頁面**：通常都可以改成延遲載入。create-vue 的範例專案就是這樣做的，首頁直接匯入，「About」用 `() => import(...)`。

第 7 章學過的非同步元件（`defineAsyncComponent`）也是「用到才載入」，但路由的 `component` 不需要它，直接寫 `() => import(...)` 就好。

## 重點整理

- 一般的 `import` 會把所有頁面打包成一個檔案，使用者一開始就要全部下載。
- 路由的 `component` 寫成 `() => import("...")`，就會變成用到才下載。
- 建置之後，延遲載入的頁面會各自拆成獨立的檔案。
- 首頁和共用版面維持一般匯入，其他頁面可以延遲載入。
- 路由不需要用 `defineAsyncComponent`，直接寫箭頭函式就好。
