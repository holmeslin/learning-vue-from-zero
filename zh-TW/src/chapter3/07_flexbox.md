# Flexbox

## 本集目標

用 Flexbox 把元素排成一列或一欄，並且控制它們的對齊與間距。

## 正文

### 預設的排法

區塊元素（`<div>`、`<p>`）預設是由上往下一個疊一個。想讓幾個盒子**並排**，過去要用很多古怪的技巧，現在有了 **Flexbox**，簡單很多。

### 開啟 Flexbox

Flexbox 要設定在**父元素**上。建立 `index.html`：

```html
<!DOCTYPE html>
<html lang="zh-TW">
  <head>
    <meta charset="UTF-8" />
    <title>Flexbox</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <div class="container">
      <div class="item">一</div>
      <div class="item">二</div>
      <div class="item">三</div>
    </div>
  </body>
</html>
```

`style.css`：

```css
* {
  box-sizing: border-box;
}

.container {
  display: flex;
  background-color: #eeeeee;
}

.item {
  background-color: lightblue;
  border: 2px solid steelblue;
  padding: 20px;
}
```

只加了 `display: flex;` 這一行，三個子元素就從上下疊放變成左右並排了。

兩個名詞要記得：套了 `display: flex` 的叫 **flex 容器**（container），裡面的子元素叫 **flex 項目**（item）。

### 方向：`flex-direction`

```css
.container {
  display: flex;
  flex-direction: column;
}
```

- `row`：由左到右排（預設）。
- `column`：由上到下排。

這個方向叫**主軸**。接下來的對齊，都分成「沿著主軸」和「垂直於主軸」兩個方向來看。

### 沿主軸對齊：`justify-content`

```css
.container {
  display: flex;
  justify-content: space-between;
}
```

| 值 | 效果 |
| --- | --- |
| `flex-start` | 靠起點（預設，靠左） |
| `center` | 置中 |
| `flex-end` | 靠終點（靠右） |
| `space-between` | 兩端貼邊，中間平均分配 |
| `space-around` | 每個項目左右的空間一樣 |

最常用的是 `center` 和 `space-between`。

### 垂直於主軸對齊：`align-items`

```css
.container {
  display: flex;
  align-items: center;
  height: 200px;
}
```

當方向是 `row` 時，`align-items` 控制的是上下對齊。常用值：

- `stretch`：拉伸到和容器一樣高（預設）。
- `center`：垂直置中。
- `flex-start` / `flex-end`：靠上 / 靠下。

### 完美置中

最經典的用法，讓一個東西水平、垂直都置中：

```css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}
```

以前這是 CSS 最惡名昭彰的難題之一，現在三行就解決。

### 間距：`gap`

項目之間的間距，用 `gap`，比一個一個設 `margin` 乾淨：

```css
.container {
  display: flex;
  gap: 16px;
}
```

### 換行：`flex-wrap`

項目太多、一行放不下時，預設會硬擠成一行。加上 `flex-wrap: wrap;`，放不下就換到下一行：

```css
.container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
```

### 項目的伸縮：`flex`

子項目上可以設定 `flex: 1`，意思是「平均分掉剩下的空間」：

```css
.item {
  flex: 1;
}
```

三個項目都是 `flex: 1`，就會各佔三分之一寬。如果其中一個是 `flex: 2`，它會佔兩份、其他各佔一份。

### 一個常見版面：導覽列

```html
<nav class="navbar">
  <span class="logo">我的網站</span>
  <div class="links">
    <a href="#">首頁</a>
    <a href="#">關於</a>
    <a href="#">聯絡</a>
  </div>
</nav>
```

```css
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: #1f3a5f;
}

.logo {
  color: white;
  font-weight: bold;
}

.links {
  display: flex;
  gap: 16px;
}

.links a {
  color: white;
  text-decoration: none;
}
```

這裡用了兩層 Flexbox：外層的 `.navbar` 把 logo 推到左邊、連結推到右邊，內層的 `.links` 把三個連結排成一列。Flexbox 可以一層疊一層，這是做版面的基本手法。

試著把它放進一個完整的 HTML 檔案，再改改數值，看看每個屬性造成什麼變化。

## 重點整理

- 在父元素設 `display: flex`，子元素就會並排；`flex-direction` 決定橫排或直排。
- `justify-content` 控制沿主軸的對齊，`align-items` 控制垂直方向的對齊。
- 水平垂直置中：`justify-content: center` 加上 `align-items: center`。
- `gap` 設定項目間距，`flex-wrap: wrap` 允許換行，子項目的 `flex: 1` 平均分配剩餘空間。
