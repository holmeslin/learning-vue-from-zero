# CSS 選擇器

## 本集目標

用 CSS 替網頁上的元素設定顏色、字體等外觀，並且學會用選擇器指定要套用在誰身上。

## 正文

HTML 負責「有什麼」，**CSS**（Cascading Style Sheets，階層式樣式表）負責「長什麼樣子」。

### CSS 長什麼樣子

CSS 由一條一條**規則**組成，每條規則長這樣：

```css
p {
  color: blue;
  font-size: 20px;
}
```

- `p` 是**選擇器**（selector），指定「這條規則要套用在哪些元素上」。這裡是所有的 `<p>`。
- 大括號裡是**宣告**（declaration），每一行是「屬性: 值;」，用冒號分隔，結尾要加分號。
- 這條規則的意思是：所有段落，文字顏色是藍色、大小是 20 像素。

### 把 CSS 放進網頁

CSS 最常見的放法，是寫在獨立的 `.css` 檔，再從 HTML 引入。在 `chapter3` 資料夾建立兩個檔案。

`index.html`：

```html
<!DOCTYPE html>
<html lang="zh-TW">
  <head>
    <meta charset="UTF-8" />
    <title>CSS 練習</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <h1>水果介紹</h1>
    <p>蘋果很甜。</p>
    <p class="warning">注意：蘋果籽有微量毒性。</p>
    <p id="footer">製作：我自己</p>
  </body>
</html>
```

`style.css`：

```css
h1 {
  color: darkgreen;
}

p {
  color: #333333;
  font-size: 18px;
}
```

`<link rel="stylesheet" href="style.css" />` 這一行放在 `<head>` 裡，意思是「這個網頁要套用 `style.css` 的樣式」。兩個檔案必須在同一個資料夾。

存檔後開啟 `index.html`，標題變成深綠色，段落變大。

### 三種最常用的選擇器

**標籤選擇器**：直接寫標籤名，套用在所有同名元素上。

```css
p {
  color: gray;
}
```

**class 選擇器**：在 class 名稱前面加一個點 `.`，套用在有這個 class 的元素上。

```css
.warning {
  color: red;
  font-weight: bold;
}
```

對應 HTML 的 `<p class="warning">`。上一集學過，class 可以用在很多元素上，所以這是**最常用**的選擇器。

**id 選擇器**：在 id 名稱前面加井字 `#`。

```css
#footer {
  font-size: 12px;
}
```

對應 `<p id="footer">`。實務上很少用 id 來套樣式，主要用 class。

### 常用的屬性

| 屬性 | 作用 | 範例 |
| --- | --- | --- |
| `color` | 文字顏色 | `color: red;` |
| `background-color` | 背景顏色 | `background-color: #f0f0f0;` |
| `font-size` | 文字大小 | `font-size: 18px;` |
| `font-weight` | 粗細 | `font-weight: bold;` |
| `text-align` | 對齊 | `text-align: center;` |

顏色可以用英文名稱（`red`、`blue`），也可以用十六進位色碼（`#ff0000` 是紅色，`#333333` 是深灰色）。要查色碼，搜尋「color picker」就有很多工具。

### 後代選擇器和多個選擇器

兩個選擇器中間放一個空格，表示「在前者裡面的後者」：

```css
nav a {
  color: white;
}
```

這是「`<nav>` 裡面的所有 `<a>`」，不在 `<nav>` 裡的連結不受影響。

用逗號隔開，表示「兩邊都套用同一組樣式」：

```css
h1, h2 {
  color: navy;
}
```

### 滑鼠移上去的樣式

選擇器後面加 `:hover`，表示「滑鼠停在上面時」：

```css
button {
  background-color: lightblue;
}

button:hover {
  background-color: steelblue;
}
```

這種冒號開頭的東西叫**偽類別**（pseudo-class）。

### 衝突時誰贏？

兩條規則都想改同一個東西，會怎麼樣？

```css
p {
  color: gray;
}

.warning {
  color: red;
}
```

對 `<p class="warning">` 來說，兩條規則都符合。規則是：

1. **比較具體的贏**：class 選擇器比標籤選擇器具體，所以文字是紅色。
2. **一樣具體的話，寫在後面的贏。**

這個「誰贏」的規則叫**層疊**（cascade），也是 CSS 名字裡 Cascading 的由來。遇到「我明明寫了樣式卻沒有生效」，多半是被別條規則蓋掉了。

### 用瀏覽器檢查

在網頁上按右鍵，選「檢查」（Inspect），可以打開瀏覽器的開發者工具。點選任何一個元素，右邊會列出所有套用在它身上的 CSS 規則，被蓋掉的會畫上刪除線。這是除錯 CSS 的好朋友。

## 重點整理

- CSS 規則的格式是「選擇器 { 屬性: 值; }」。
- 用 `<link rel="stylesheet" href="檔名.css" />` 把樣式表引入網頁。
- 三種選擇器：標籤 `p`、class `.warning`、id `#footer`；class 最常用。
- 空格表示後代（`nav a`），逗號表示多個選擇器（`h1, h2`），`:hover` 表示滑鼠停在上面。
- 衝突時，比較具體的贏；一樣具體則寫在後面的贏。
