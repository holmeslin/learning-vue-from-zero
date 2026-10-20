# 表單元素

## 本集目標

學會做出輸入框、勾選框、下拉選單等表單元素，並且知道為什麼一定要搭配 `<label>`。

## 正文

網頁上讓使用者「輸入東西」的元素，統稱**表單元素**。網頁上大部分的互動都從它們開始，所以先認識它們。

以下範例都放在 `<body>` 裡。

### 文字輸入框

```html
<input type="text" placeholder="請輸入名字" />
```

`<input>` 是最重要的表單元素，它沒有結束標籤。`type` 屬性決定它是哪一種輸入框。`placeholder` 是還沒輸入時顯示的淡淡提示文字。

### 常見的 `type`

```html
<input type="text" />
<input type="email" />
<input type="password" />
<input type="number" />
<input type="checkbox" />
```

| `type` | 效果 |
| --- | --- |
| `text` | 一般文字 |
| `email` | 信箱，手機上會出現有 @ 的鍵盤 |
| `password` | 輸入的字會被遮住 |
| `number` | 只能輸入數字，右邊有上下箭頭 |
| `checkbox` | 勾選框（打勾或不打勾） |

### 用 `label` 說明輸入框

每個輸入框都應該有一個說明文字，這就是 `<label>` 的工作。有兩種寫法把兩者關聯起來。

**寫法一**：把輸入框放在 `<label>` 裡面。

```html
<label>
  名字：
  <input type="text" />
</label>
```

**寫法二**：用 `for` 和 `id` 配對。

```html
<label for="user-name">名字：</label>
<input id="user-name" type="text" />
```

`label` 的 `for` 要和輸入框的 `id` 一樣。

為什麼一定要這樣做？因為關聯之後，**點 label 的文字，就會選取對應的輸入框**。勾選框特別有感：點「同意條款」這幾個字，就能打勾，不用精準點那個小方塊。而且螢幕閱讀器會讀出這個輸入框是做什麼的。這是無障礙（accessibility）的基本功。

### 多行文字

```html
<label for="message">留言：</label>
<textarea id="message" rows="4"></textarea>
```

`<textarea>` 是多行輸入框，`rows` 決定一開始顯示幾行高。它有結束標籤，因為預設內容放在兩個標籤中間。

### 單選：radio

同一組單選按鈕，`name` 要一樣，這樣一組裡只能選一個：

```html
<label><input type="radio" name="fruit" value="apple" /> 蘋果</label>
<label><input type="radio" name="fruit" value="banana" /> 香蕉</label>
```

`value` 是選取這一項時代表的值，使用者看不到，程式會用到。

### 下拉選單

```html
<label for="city">城市：</label>
<select id="city">
  <option value="taipei">台北</option>
  <option value="taichung">台中</option>
  <option value="kaohsiung">高雄</option>
</select>
```

`<select>` 是下拉選單，每個選項是一個 `<option>`。畫面上顯示的是標籤中間的文字，`value` 是程式拿到的值。

### 按鈕與表單

把這些元素用 `<form>` 包起來，再放一個送出的按鈕：

```html
<form>
  <label for="user-name">名字：</label>
  <input id="user-name" type="text" />
  <button type="submit">送出</button>
</form>
```

按鈕的 `type="submit"` 表示按下它就是「送出表單」。

試著在上面的表單輸入文字，按送出：整個頁面會重新整理一次，輸入的東西不見了。這是瀏覽器預設的行為：送出表單 = 跳到另一個網址、重新載入。

現代的網頁大多不想要重新載入整頁，而是用 JavaScript 接手處理，不讓頁面重新載入。第 5 章會教你怎麼用 Vue 接手表單。

### 一個完整範例

```html
<!DOCTYPE html>
<html lang="zh-TW">
  <head>
    <meta charset="UTF-8" />
    <title>報名表</title>
  </head>
  <body>
    <h1>活動報名</h1>
    <form>
      <p>
        <label for="user-name">名字：</label>
        <input id="user-name" type="text" placeholder="請輸入名字" />
      </p>
      <p>
        <label for="user-email">信箱：</label>
        <input id="user-email" type="email" />
      </p>
      <p>
        <label for="city">城市：</label>
        <select id="city">
          <option value="taipei">台北</option>
          <option value="taichung">台中</option>
        </select>
      </p>
      <p>
        <label><input type="checkbox" /> 我同意活動辦法</label>
      </p>
      <button type="submit">送出</button>
    </form>
  </body>
</html>
```

## 重點整理

- `<input>` 靠 `type` 決定種類：`text`、`email`、`password`、`number`、`checkbox`、`radio` 等。
- 每個輸入框都要有 `<label>`，用 `for` 配對 `id`，或是直接把輸入框包在 label 裡。
- 多行文字用 `<textarea>`，下拉選單用 `<select>` 加 `<option>`。
- 單選按鈕要有相同的 `name`，才會變成一組。
- 表單預設送出會重新載入整個頁面，現代網頁通常會用 JavaScript 接手處理。
