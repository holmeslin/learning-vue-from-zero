# TypeScript

前面九章你一直在寫 JavaScript。它很自由：變數裡想放數字就放數字，想放字串就放字串，不會有人事先攔你。但這份自由有代價：很多錯誤要等程式跑起來、使用者點到那個按鈕，才會發現。

**TypeScript** 在 JavaScript 上多加了一層**型別**（type）：你可以事先說明「這個變數是數字」、「這個元件要收這些 props」，然後由編輯器在你寫程式的當下，就把對不上的地方標成紅線。它不是另一種語言，所有 JavaScript 的寫法都還能用，只是多了「事先說明」這件事。

這一章分成兩半：

- 前半（第 1～6 集）學 TypeScript 本身：為什麼要用、怎麼建立 TypeScript 的 Vue 專案、基本型別、型別推論、物件型別、聯集型別。
- 後半（第 7～14 集）把型別用在 Vue 上：props、emit、`ref` / `reactive` / `computed`、模板 ref 與事件、`provide` / `inject`、泛型與泛型元件，最後是 Pinia。

這一章不是型別理論課，不會教完 TypeScript 的所有功能。目標很實際：讓你看得懂、寫得出 Vue 專案裡常見的 TypeScript。第 11 章之後的範例，以及整個第二部的 Nuxt，都會用 TypeScript 來寫。

學這一章要有第 4～8 章的基礎（元件、響應式、模板 ref、`provide` / `inject`、Pinia）。第 2 集會用 `npm create vue@latest` 建立一個新的 TypeScript 專案，整章都在這個專案裡練習。
