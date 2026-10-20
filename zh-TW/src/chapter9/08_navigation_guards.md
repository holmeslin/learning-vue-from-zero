# 導覽守衛

## 本集目標

用 `router.beforeEach` 在換頁之前檢查，沒登入的人想進會員頁，就把他送去登入頁。

## 正文

### 換頁之前先問一下

有些頁面不是每個人都能看，例如「我的帳號」。使用者可能點導覽列，也可能直接在網址列打 `/account`，不管從哪裡來，都要先檢查他有沒有登入。

要在每一個頁面元件裡檢查太麻煩，Vue Router 提供了一個統一的關卡：**導覽守衛**（navigation guard）。每次換頁之前，它都會先執行你寫的函式，由你決定「放行」還是「改去別的地方」。

### 記住有沒有登入：auth store

「有沒有登入」很多地方都要知道：導覽守衛、登入頁、帳號頁。導覽守衛寫在 `src/router/index.js` 這個普通的 `.js` 檔裡，不在任何元件裡面，所以不能用 `inject`。這就是第 8 章第 1 集預告過的情況，正好用 Pinia store 解決。建立 `src/stores/auth.js`：

```js
import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", () => {
  const userName = ref("");
  const isLoggedIn = computed(() => userName.value !== "");

  function login(name) {
    userName.value = name;
  }

  function logout() {
    userName.value = "";
  }

  return { userName, isLoggedIn, login, logout };
});
```

這裡的「登入」只是把名字存起來，不檢查密碼。真正的登入要和伺服器確認，第二部會碰到伺服器端的做法，現在先用這個簡化版練習守衛。

### 兩個新頁面

建立 `src/views/AccountView.vue`，只有登入的人能看：

```vue
<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth.js";

const router = useRouter();
const auth = useAuthStore();

function logout() {
  auth.logout();
  router.push("/");
}
</script>

<template>
  <h1>我的帳號</h1>
  <p>哈囉，{{ auth.userName }}！</p>
  <button @click="logout">登出</button>
</template>
```

再建立 `src/views/LoginView.vue`：

```vue
<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth.js";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const name = ref("");

function submit() {
  if (name.value === "") return;
  auth.login(name.value);
  router.replace(route.query.redirect ?? "/");
}
</script>

<template>
  <h1>登入</h1>
  <form @submit.prevent="submit">
    <input v-model="name" placeholder="你的名字" />
    <button>登入</button>
  </form>
</template>
```

`route.query.redirect` 是「登入完要回去哪裡」，等一下守衛會把它放進網址。登入成功用 `replace` 而不是 `push`，上一集講過：這樣按上一頁不會又回到登入表單。

在 `src/components/AppLayout.vue` 的導覽列加一個連結：

```vue,ignore
    <RouterLink to="/account">我的帳號</RouterLink>
```

### 路由設定與守衛

把 `src/router/index.js` 改成：

```js
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth.js";
import AppLayout from "../components/AppLayout.vue";
import HomeView from "../views/HomeView.vue";
import AboutView from "../views/AboutView.vue";
import ProductsView from "../views/ProductsView.vue";
import ProductDetailView from "../views/ProductDetailView.vue";
import AccountView from "../views/AccountView.vue";
import LoginView from "../views/LoginView.vue";

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
        {
          path: "products/:id",
          name: "product",
          component: ProductDetailView,
        },
        {
          path: "account",
          component: AccountView,
          meta: { requiresAuth: true },
        },
      ],
    },
    { path: "/login", component: LoginView },
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

新東西有三個。

**`meta`**：每條路由都可以帶一個 `meta` 物件，裡面放什麼由你決定，Vue Router 不會去看它。這裡放 `requiresAuth: true`，當作「這一頁要登入」的記號。

**`/login` 放在外層**：登入頁不在 `AppLayout` 的 `children` 裡，所以它不會有導覽列。這就是第 3 集說的「有些頁面不想要共用版面」。

**`router.beforeEach`**：每次換頁之前，都會呼叫你傳進去的函式。參數 `to` 是「要去的那個路由」，和 `useRoute()` 拿到的東西長得一樣，有 `to.meta`、`to.params`、`to.query`，還有 `to.fullPath`（完整的網址路徑，包含查詢參數）。函式回傳什麼，決定接下來怎麼走：

- 什麼都不回傳（`undefined`）：放行，照原本的計畫換頁。
- 回傳一個網址或 `{ path, query }` 物件：不去原本那頁，改去這裡。
- 回傳 `false`：取消這次換頁，留在原地。

所以這段守衛的意思是：「要去的頁面需要登入，而且還沒登入，就改去 `/login`，並且把原本要去的網址記在 `redirect` 裡。」

### 試試看

1. 沒登入的狀態下點「我的帳號」，網址會變成 `/login?redirect=/account`，畫面是登入表單，沒有導覽列。
2. 輸入「小明」按「登入」，回到 `/account`，看到「哈囉，小明！」。
3. 按「登出」回到首頁，再點「我的帳號」，又被送去登入頁。

直接在網址列打 `/account` 也一樣會被擋下來，因為第一次載入網頁時也算一次換頁，守衛一樣會執行。

注意：Pinia 的資料只存在記憶體裡，重新整理網頁就會回到沒登入的狀態。

### store 要在守衛函式裡面拿

`const auth = useAuthStore();` 寫在守衛函式**裡面**，不是寫在檔案最上面。如果寫在最上面：

```js,ignore
const auth = useAuthStore(); // 不要這樣寫
```

網頁會一片空白，Console 出現一段錯誤，開頭是：

```text
Uncaught Error: [🍍]: "getActivePinia()" was called but there was no
active Pinia. Are you trying to use a store before calling "app.use(pinia)"?
```

（前兩行在 Console 裡其實是同一行，這裡為了排版拆開。）

原因是 `main.js` 一開頭 `import router from "./router";` 的時候，這個檔案最上面的程式碼就執行了，但這時候 `app.use(createPinia())` 還沒執行，store 還不能用。寫在守衛函式裡面，要等到真的換頁時才會執行，那時候 Pinia 已經裝好了。這和第 8 章「多個 store 互相使用」那一集遇到的是同一個問題，規則也一樣：`useXxxStore()` 不要寫在檔案最外層。

### 舊教學裡的 `next`

你在網路上可能會看到這種寫法：

```js,ignore
router.beforeEach((to, from, next) => {
  next();
});
```

這是舊的寫法，用第三個參數 `next` 來決定放行或轉址。Vue Router 5 還能用，但已經不建議使用（deprecated），開發時 Console 會出現這個警告：

```text
[VUE_ROUTER_R0025] The `next()` callback in navigation guards is deprecated.
```

改用上面「回傳值」的寫法就好。

### 守衛不是真正的安全措施

導覽守衛只是在瀏覽器裡擋住畫面。懂一點技術的人可以改掉瀏覽器裡的 JavaScript，繞過守衛。真正不能外流的資料，要在伺服器那一端檢查身分，第二部講 Nuxt 的 Server API 時會碰到。守衛是為了讓正常使用者用起來順手，不是用來防小偷。

## 重點整理

- `router.beforeEach(函式)` 在每次換頁之前執行，參數 `to` 是要去的路由。
- 守衛不回傳就放行，回傳網址就改去那裡，回傳 `false` 就取消。
- 路由的 `meta` 可以放自訂的記號，例如 `requiresAuth: true`，讓守衛判斷。
- 在守衛裡用 Pinia store 時，`useAuthStore()` 要寫在守衛函式裡面。
- 不要用舊的 `next` 寫法；守衛也不能取代伺服器端的檢查。
