# 物件基礎

## 本集目標

把一組「有名字的資料」裝在一起，並且能讀取、修改、新增其中的欄位。

## 正文

### 陣列不夠用的時候

描述一個使用者，有名字、年齡、信箱。用陣列可以寫成 `["小明", 20, "ming@example.com"]`，但 `user[1]` 是什麼？你得記住 1 號是年齡。三天後就忘了。

這種「每個欄位有名字」的資料，用**物件**（object）：

```js
const user = {
  name: "小明",
  age: 20,
  email: "ming@example.com",
};

console.log(user);
```

```text
{ name: '小明', age: 20, email: 'ming@example.com' }
```

物件用大括號 `{}` 包起來，裡面是一組一組的「名稱: 值」，用逗號隔開。每一組叫做一個**屬性**（property）；`name`、`age`、`email` 是屬性的名稱，冒號後面是值。

最後一個屬性後面的逗號可加可不加。這本書習慣加，這樣之後新增一行時不用回頭改上一行。

### 用點讀取

`物件.屬性名稱` 就能拿到值：

```js
const user = {
  name: "小明",
  age: 20,
};

console.log(user.name);
console.log(`${user.name} 今年 ${user.age} 歲`);
```

```text
小明
小明 今年 20 歲
```

### 修改與新增

用點也可以改值，或是加上原本沒有的屬性：

```js
const user = {
  name: "小明",
  age: 20,
};

user.age = 21;
user.city = "台北";

console.log(user);
```

```text
{ name: '小明', age: 21, city: '台北' }
```

和陣列一樣，`const` 物件裡的屬性可以改，只是不能把整個物件換成另一個。物件還有一個容易踩到的地方：把物件指定給另一個變數時，兩個變數其實指向同一個物件，改其中一個，另一個也會變。第 2 章會專門講這件事。

### 物件裡放物件、陣列裡放物件

屬性的值可以是任何東西，包括另一個物件或陣列：

```js
const user = {
  name: "小明",
  address: {
    city: "台北",
    zip: "100",
  },
  hobbies: ["爬山", "看電影"],
};

console.log(user.address.city);
console.log(user.hobbies[0]);
```

```text
台北
爬山
```

`user.address.city` 就是一層一層點進去。

反過來，陣列裡放物件更是家常便飯。這幾乎是 Vue 裡最常見的資料形狀：

```js
const products = [
  { name: "鍵盤", price: 1200 },
  { name: "滑鼠", price: 600 },
  { name: "螢幕", price: 5000 },
];

for (const product of products) {
  console.log(`${product.name}：${product.price} 元`);
}
```

```text
鍵盤：1200 元
滑鼠：600 元
螢幕：5000 元
```

請把這個範例多看幾眼，之後的 Vue 範例會一直出現這種「一個陣列裝很多物件，然後走訪它畫出清單」的結構。

### 用中括號讀取

除了點，也可以用中括號加字串：

```js
const user = { name: "小明" };
console.log(user["name"]);
```

效果和 `user.name` 一樣。中括號的用處是屬性名稱放在變數裡的時候：

```js
const user = { name: "小明", age: 20 };
const key = "age";
console.log(user[key]);
```

```text
20
```

平常用點就好，中括號知道有這種寫法即可。

## 重點整理

- 物件用 `{}` 裝一組「名稱: 值」，每一組是一個屬性。
- `物件.屬性` 可以讀取、修改、新增屬性。
- 屬性的值可以是另一個物件或陣列，用點一層一層進去。
- 「陣列裡放物件」是 Vue 最常見的資料形狀。
