# Nuxt 入門

第一部你用 create-vue 做出來的網站，有一個特點：瀏覽器拿到的 HTML 幾乎是空的，所有畫面都是瀏覽器下載 JavaScript 之後才畫出來的。這種做法叫**單頁應用程式**（single-page application，簡稱 SPA）。

第二部要換一種做法：讓伺服器先把畫面算好，再傳給瀏覽器。要做到這件事，你不用自己從頭寫伺服器，因為有現成的框架可以用。Vue 的世界裡最多人用的是 **Nuxt**，這本書第二部就用它。

這一章先把 Nuxt 的基本功學起來：怎麼建立專案、檔案怎麼變成網址、怎麼在頁面之間跳轉、怎麼做共用的版面、出錯的時候顯示什麼、分頁標題怎麼設定。很多東西你在第 9 章 Vue Router 學過類似的，Nuxt 只是換了一種方式做到，而且常常幫你多做了一步。

這一章從頭到尾用同一個專案 `hello-nuxt`，一集一集做出一個「小書店」網站。第二部之後的每一章，都會另外建立一個新的 Nuxt 專案，專心練習那一章的主題：第 13 章是 `render-demo`，第 14 章是留言板 `nuxt-guestbook`，第 15 章是 `nuxt-site`（第 15 章也會回頭修改留言板）。小書店只在這一章出現。

## 和第一部的專案差在哪

| | 第一部（create-vue） | 第二部（Nuxt） |
| --- | --- | --- |
| 建立專案 | `npm create vue@latest` | `npm create nuxt@latest` |
| 畫面在哪裡產生 | 瀏覽器 | 先在伺服器產生，再交給瀏覽器 |
| 路由 | 自己在 `router/index.js` 寫 `routes` 陣列 | 照 `app/pages/` 的檔案自動產生 |
| import | 每個元件、`ref`、`computed` 都要自己 import | 大部分會自動匯入 |
| 設定檔 | `vite.config.ts` | `nuxt.config.ts` |
| 開發伺服器 | <http://localhost:5173> | <http://localhost:3000> |
| 型別檢查 | `npm run type-check` | `npx nuxt typecheck`（第 6 集會裝） |

Nuxt 裡面其實還是 Vue、Vue Router 和 Vite，你第一部學的 `ref`、`computed`、props、`v-for`、`<script setup lang="ts">` 全部照用。差別在於很多原本要自己接起來的東西，Nuxt 已經幫你接好了。

## 開始前你需要

- 第一部讀完，尤其是第 9 章的 Vue Router 和第 10 章的 TypeScript。第二部的程式碼全部用 `<script setup lang="ts">` 寫。
- Node.js 24，也就是你第 1 章裝的那個版本。Nuxt 4 要求 Node.js 22.22.3 以上的 22 版、24.15.0 以上的 24 版，或是 26 版以後，所以如果你的 24 版比較舊，先更新到最新的 24 版。
- VS Code 和終端機，加上第 4 章裝的 Vue (Official) 擴充功能。
- 網路連線。建立專案、安裝模組、下載字型都需要。

專案會在第 2 集用 `npm create nuxt@latest` 建立：範本選 minimal、專案名稱 `hello-nuxt`、套件管理工具選 npm、模組先不裝。
