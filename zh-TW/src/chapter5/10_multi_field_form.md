# 多欄位表單

## 本集目標

用一個物件管理整張表單的欄位，做出有檢查、有送出、送出後會清空的報名表。

## 正文

### 一個物件裝所有欄位

表單欄位一多，每個欄位各開一個 `ref` 會很亂。比較好的做法是用一個物件裝起來。把 `src/App.vue` 換成：

```vue
<script setup>
import { ref, computed } from "vue";

function createEmptyForm() {
  return { name: "", email: "", age: 18, plan: "basic", agreed: false };
}

const form = ref(createEmptyForm());
const showErrors = ref(false);
const submitted = ref(null);

const errors = computed(() => {
  const list = [];
  if (form.value.name === "") {
    list.push("請輸入名字");
  }
  if (!form.value.email.includes("@")) {
    list.push("Email 格式不對");
  }
  if (!form.value.agreed) {
    list.push("請同意使用條款");
  }
  return list;
});

function handleSubmit() {
  if (errors.value.length > 0) {
    showErrors.value = true;
    return;
  }
  submitted.value = { ...form.value };
  form.value = createEmptyForm();
  showErrors.value = false;
}
</script>

<template>
  <form novalidate @submit.prevent="handleSubmit">
    <p>
      <label for="name">名字：</label>
      <input id="name" v-model.trim="form.name" />
    </p>
    <p>
      <label for="email">Email：</label>
      <input id="email" type="email" v-model.trim="form.email" />
    </p>
    <p>
      <label for="age">年齡：</label>
      <input id="age" type="number" v-model="form.age" />
    </p>
    <p>
      <label for="plan">方案：</label>
      <select id="plan" v-model="form.plan">
        <option value="basic">基本</option>
        <option value="pro">進階</option>
      </select>
    </p>
    <p>
      <label>
        <input type="checkbox" v-model="form.agreed" />
        我同意使用條款
      </label>
    </p>
    <ul v-if="showErrors && errors.length > 0">
      <li v-for="error in errors" :key="error">{{ error }}</li>
    </ul>
    <button type="submit">報名</button>
  </form>

  <p v-if="submitted">
    {{ submitted.name }}（{{ submitted.age }} 歲）報名成功，方案是
    {{ submitted.plan }}，確認信會寄到 {{ submitted.email }}。
  </p>
</template>
```

什麼都不填直接按「報名」，表單下面會列出三個錯誤。把欄位一個一個填好，錯誤也一條一條消失。全部填好再按「報名」，下面出現報名成功的訊息，表單變回空白。

### 逐段看

**資料**

- `createEmptyForm` 是一個函式，每次呼叫都回傳一個「全新的空白表單」物件。一開始用它當 `form` 的初始值，送出後也用它來清空。
- `form` 是裝著整張表單的 `ref`。模板裡每個欄位用 `v-model="form.name"`、`v-model="form.email"` 這樣綁到物件的某個屬性。第 5 集說過，`ref` 裡的物件是一路往下都有代理人的，所以改 `form.name` 一樣會被 Vue 知道。
- 每個欄位都照上一集的規則選了合適的寫法：名字和 Email 用 `.trim` 去掉不小心多打的空白，年齡用 `type="number"` 讓它直接是數字，方案用 `<select>`，同意條款用勾選框。

**檢查**

- `errors` 是 `computed`，從 `form` 算出「目前有哪些錯誤」，回傳一個字串陣列。欄位一改，它就自動重算，你不用在每個輸入框上掛事件去檢查。
- 但一打開頁面就滿滿的紅字，對使用者不太友善。所以多一個 `showErrors`：按過一次「報名」之後才顯示錯誤。這種「錯誤清單」用 `computed`、「要不要顯示」用 `ref` 的分工很常見。

**送出**

- `@submit.prevent` 是第 1 集學的：交給 `handleSubmit` 處理，不讓頁面重新載入。按「報名」按鈕或在輸入框裡按 Enter 都會送出。
- `novalidate` 是關掉瀏覽器自己的檢查。`type="email"` 的輸入框放在表單裡，瀏覽器會先檢查格式，不對就擋下送出、跳出它自己的提示，`handleSubmit` 根本不會執行。這裡要自己用 `errors` 檢查，所以把它關掉。
- 有錯誤就把 `showErrors` 打開，然後 `return`，不往下做。
- 沒有錯誤，就把表單內容存進 `submitted`。這裡用第 2 章的展開語法 `{ ...form.value }` 複製一份，讓「已送出的資料」和「表單」分開，之後表單怎麼改都不會影響已送出的資料。
- 最後 `form.value = createEmptyForm()` 換上一張全新的空白表單。整個換掉的寫法只有 `ref` 能用，第 6 集說過，`reactive` 不行。

實際的網站，送出時通常會把資料傳到伺服器。那要用到第 2 章學過的 `fetch`，第 6 章抓資料時會再看到；第二部的 Nuxt 會教伺服器那一端。

### 用 `reactive` 寫的話

第 6 集說過，表單是 `reactive` 常見的用途，你在別人的程式碼裡很可能看到這種寫法。只有 `<script setup>` 不一樣，模板完全相同：

```js,ignore
const form = reactive(createEmptyForm());

const errors = computed(() => {
  const list = [];
  if (form.name === "") {
    list.push("請輸入名字");
  }
  // ……其他檢查一樣，只是把 form.value. 換成 form.
  return list;
});

function handleSubmit() {
  // ……
  submitted.value = { ...form };
  Object.assign(form, createEmptyForm());
  showErrors.value = false;
}
```

差別有兩個：

- 讀屬性不用 `.value`，直接寫 `form.name`。
- 清空不能寫 `form = createEmptyForm()`，要用 `Object.assign` 把空白表單的值複製回原本的物件。

兩種都能用。這本書用 `ref`，因為規則比較一致：所有響應式資料都是 `.value`，要整個換掉也沒問題。

## 重點整理

- 欄位多的表單，用一個物件裝所有欄位，`v-model="form.name"` 綁到各個屬性。
- 用函式產生空白表單，初始值和清空都用它，不用寫兩次。
- 檢查結果用 `computed` 從表單算出來；要不要顯示錯誤另外用一個 `ref` 控制。
- `<form>` 用 `@submit.prevent` 處理送出；用 `ref` 時，清空直接 `form.value = 新的空白表單`。
