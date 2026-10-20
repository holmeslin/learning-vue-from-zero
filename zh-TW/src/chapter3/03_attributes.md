# 屬性

## 本集目標

理解標籤上的「屬性」是什麼，並且學會最常用的 `class` 和 `id`。

## 正文

### 屬性是標籤的設定值

上一集你已經看過屬性了：

```html
<a href="https://www.wikipedia.org/">維基百科</a>
<img src="cat.jpg" alt="一隻貓" />
```

`href`、`src`、`alt` 都是**屬性**（attribute）。屬性寫在**開始標籤**裡，格式是：

```text
屬性名稱="屬性的值"
```

多個屬性之間用空格隔開，順序不重要：

```html
<img alt="一隻貓" src="cat.jpg" width="200" />
```

值要用雙引號包起來。

### 不同標籤有不同的屬性

每種標籤各有自己認得的屬性：

| 標籤 | 常用屬性 | 作用 |
| --- | --- | --- |
| `<a>` | `href` | 連結的網址 |
| `<a>` | `target="_blank"` | 在新分頁開啟 |
| `<img>` | `src`、`alt`、`width` | 圖片位置、說明、寬度 |
| `<input>` | `type`、`value`、`placeholder` | 下一集會用 |
| `<button>` | `disabled` | 讓按鈕不能按 |

開新分頁的連結：

```html
<a href="https://www.wikipedia.org/" target="_blank">在新分頁開啟維基百科</a>
```

### 沒有值的屬性

有些屬性只要「有寫」就生效，不需要值，叫布林屬性：

```html
<button disabled>不能按的按鈕</button>
```

`disabled` 寫了，按鈕就被停用，變成灰色、按不下去。把它拿掉，按鈕就恢復正常。

### 所有標籤都有的屬性：`class` 和 `id`

有兩個屬性，不管哪個標籤都能用，而且接下來幾集的 CSS 全靠它們：

```html
<p class="note">這是一則提示。</p>
<p class="note">這是另一則提示。</p>
<p id="main-title">這是唯一的標題。</p>
```

- `class`：把元素**分組**。同一個 `class` 可以給很多個元素，一個元素也可以有好幾個 class，用空格隔開：

  ```html
  <p class="note important">既是提示，又很重要。</p>
  ```

- `id`：替元素取一個**獨一無二的名字**。整個頁面裡，同一個 `id` 只能出現一次。

用法的差別：很多元素要共用同一個樣式，用 `class`；要在 JavaScript 裡精準找到某一個元素，用 `id`。

兩者的值都不要用空格（`class` 例外，空格表示多個 class），多個單字用連字號 `-` 串起來，例如 `main-title`。這種寫法叫 kebab-case，CSS 的世界習慣這樣。

### 關於 Vue 的小預告

第 4 章開始寫 Vue 的模板（template）時，你寫的還是這一章學的 HTML。標籤、屬性都一樣，`class` 照樣寫 `class`。Vue 只是在這個基礎上多加了一些寫法。

### 一個完整範例

```html
<!DOCTYPE html>
<html lang="zh-TW">
  <head>
    <meta charset="UTF-8" />
    <title>屬性練習</title>
  </head>
  <body>
    <h1 id="page-title">屬性練習</h1>

    <p class="note">下面的連結會在新分頁開啟。</p>
    <a href="https://www.wikipedia.org/" target="_blank">維基百科</a>

    <p class="note">下面的按鈕被停用了。</p>
    <button disabled>送出</button>
  </body>
</html>
```

試著把 `disabled` 拿掉，重新整理，看按鈕有什麼變化。

## 重點整理

- 屬性寫在開始標籤裡，格式是 `名稱="值"`，多個屬性用空格隔開。
- 不同標籤認得不同的屬性，例如 `<a>` 的 `href`、`<img>` 的 `src` 和 `alt`。
- `disabled` 這類布林屬性，只要有寫就生效。
- `class` 用來分組，可以重複、可以多個；`id` 是獨一無二的名字，整個頁面只能出現一次。
