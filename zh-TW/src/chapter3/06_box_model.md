# 盒模型

## 本集目標

理解每個元素都是一個盒子，並且學會用 `padding`、`border`、`margin` 控制大小與間距。

## 正文

### 每個元素都是一個盒子

在瀏覽器眼中，網頁上的每個元素都是一個長方形的盒子。這個盒子由內往外有四層，叫做**盒模型**（box model）：

1. **內容**（content）：文字或圖片本身。
2. **內距**（padding）：內容和邊框之間的空白。
3. **邊框**（border）：盒子的框線。
4. **外距**（margin）：盒子和旁邊其他盒子之間的空白。

用「相框」比喻：照片是內容，照片到框之間的白邊是 padding，相框本身是 border，相框和牆上其他相框之間的距離是 margin。

### 看得見的盒子

建立 `index.html` 和 `style.css`。`index.html`：

```html
<!DOCTYPE html>
<html lang="zh-TW">
  <head>
    <meta charset="UTF-8" />
    <title>盒模型</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <div class="box">盒子一</div>
    <div class="box">盒子二</div>
  </body>
</html>
```

`style.css`：

```css
.box {
  background-color: lightyellow;
  border: 2px solid orange;
  padding: 20px;
  margin: 30px;
}
```

打開來可以看到兩個黃色盒子：

- `border: 2px solid orange;`：邊框寬 2 像素、實線、橘色。三個值依序是粗細、樣式、顏色。
- `padding: 20px;`：內容四周各留 20 像素。
- `margin: 30px;`：盒子四周各留 30 像素的外距。

### 看清楚每一層

在網頁上按右鍵選「檢查」，點選其中一個盒子，開發者工具的右下角有一個彩色的盒模型圖，直接顯示這個元素的 content、padding、border、margin 各是多少。你可以把滑鼠移到圖上，網頁上對應的區域就會亮起來。

### 四個方向分開設定

每一層都可以分別設定上、右、下、左：

```css
.box {
  padding-top: 10px;
  padding-left: 40px;
  margin-bottom: 0;
}
```

也可以寫成簡寫，用空格隔開多個值：

```css
.box {
  padding: 10px 20px;
}
```

- 一個值：四邊都一樣。
- 兩個值：第一個是上下，第二個是左右。上面的例子是上下 10、左右 20。
- 四個值：依序是上、右、下、左，順時針轉一圈。

### 寬度與 `box-sizing`

想指定盒子寬度，用 `width`：

```css
.box {
  width: 200px;
  padding: 20px;
  border: 2px solid orange;
}
```

預設情況下，`width` 只是**內容**的寬度，padding 和 border 是另外加上去的。所以這個盒子實際佔的寬度是 200 + 20×2 + 2×2 = 244 像素。這很違反直覺，你明明說 200，它卻長出 244。

幾乎所有人都會加上這條規則，讓 `width` 代表**整個盒子**的寬度（包含 padding 和 border）：

```css
* {
  box-sizing: border-box;
}
```

`*` 是萬用選擇器，代表所有元素。加了之後，`width: 200px` 就真的是 200 像素，padding 和 border 往內擠，不會把盒子撐大。**之後的每一個專案，都建議先加上這一條。**

### 長度單位

到目前為止用的都是 `px`（像素）。常見的單位還有：

| 單位 | 意思 |
| --- | --- |
| `px` | 像素，固定大小 |
| `%` | 相對於父元素，`width: 50%` 是父元素寬度的一半 |
| `rem` | 相對於整個網頁的基本字體大小，預設 1rem = 16px |

用 `rem` 的好處是，使用者在瀏覽器調大字體時，整個版面會跟著等比例放大。文字大小和間距常用 `rem`，邊框這類細節用 `px`。

### 讓盒子置中

想讓有寬度的區塊水平置中，左右外距設成 `auto`：

```css
.box {
  width: 300px;
  margin: 0 auto;
}
```

`margin: 0 auto` 的意思是：上下外距 0，左右外距自動分配（也就是兩邊一樣多），盒子就會待在正中央。

## 重點整理

- 每個元素都是盒子，由內往外是 content、padding、border、margin。
- `padding` 是邊框內的空白，`margin` 是邊框外的空白，`border: 粗細 樣式 顏色`。
- 簡寫中，兩個值是「上下 左右」，四個值是「上 右 下 左」。
- 每個專案都先加上 `* { box-sizing: border-box; }`，讓 `width` 包含 padding 和 border。
- 區塊水平置中用 `margin: 0 auto`。
