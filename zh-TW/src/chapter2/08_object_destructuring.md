# 物件解構

## 本集目標

用一行把物件裡的多個屬性拆出來，變成各自獨立的變數。

## 正文

### 一直重複打 `user.`

```js
const user = { name: "小明", age: 20, city: "台北" };

console.log(`${user.name}，${user.age} 歲，住在${user.city}`);
```

```text
小明，20 歲，住在台北
```

每次都要打 `user.`，有點煩。如果想先把屬性拿出來存成變數，原本的寫法是：

```js
const user = { name: "小明", age: 20, city: "台北" };

const name = user.name;
const age = user.age;
const city = user.city;

console.log(name, age, city);
```

```text
小明 20 台北
```

### 解構

**解構**（destructuring）可以把上面三行縮成一行：

```js
const user = { name: "小明", age: 20, city: "台北" };

const { name, age, city } = user;

console.log(name, age, city);
```

```text
小明 20 台北
```

`const { name, age, city } = user;` 的意思是：從 `user` 裡，把 `name`、`age`、`city` 這三個屬性拿出來，各自存成同名的變數。

左邊的大括號看起來像物件，但這不是在建立物件，而是在**描述你想拿哪些屬性**。名字要和物件裡的屬性名稱完全一樣。

不用全拿，只拿需要的：

```js
const user = { name: "小明", age: 20, city: "台北" };

const { name } = user;

console.log(name);
```

```text
小明
```

### 換名字

屬性名稱和你想用的變數名稱不一樣的時候，用冒號改名：

```js
const user = { name: "小明", age: 20 };

const { name: userName } = user;

console.log(userName);
```

```text
小明
```

`name: userName` 的意思是「拿 `name` 屬性，存成叫 `userName` 的變數」。注意方向：冒號左邊是原本的屬性，右邊是新名字。

### 預設值

屬性不存在時，可以給預設值：

```js
const user = { name: "小明" };

const { name, age = 18 } = user;

console.log(name, age);
```

```text
小明 18
```

### 直接在函式參數裡解構

函式如果接收一個物件，可以在參數的位置直接解構：

```js
function introduce(user) {
  return `${user.name}，${user.age} 歲`;
}

function introduceShort({ name, age }) {
  return `${name}，${age} 歲`;
}

const user = { name: "小明", age: 20 };

console.log(introduce(user));
console.log(introduceShort(user));
```

```text
小明，20 歲
小明，20 歲
```

第二個函式的參數是 `{ name, age }`，也就是「接收一個物件，馬上把 `name` 和 `age` 拆出來」。函式裡面就不用再 `user.` 了。

這個寫法在 callback 裡特別常見。例如從商品陣列取出所有名字：

```js
const products = [
  { name: "鍵盤", price: 1200 },
  { name: "滑鼠", price: 600 },
];

console.log(products.map(({ name }) => name));
```

```text
[ '鍵盤', '滑鼠' ]
```

### 在 Vue 裡的用途

Vue 的程式碼裡，解構最常出現在「接住別人交給你的物件」：

- 第 6 章的 composable 會回傳一個物件，常寫成 `const { x, y } = useMouse()`，一次拿出需要的東西。
- 第 7 章會看到，元件收到的資料（props）也能這樣拆：`const { title } = defineProps(["title"])`。

現在不用懂這兩行在做什麼，只要看得出來它們是物件解構就好。

### 巢狀解構

物件裡面還有物件，也可以一層一層拆：

```js
const user = {
  name: "小明",
  address: { city: "台北", zip: "100" },
};

const { address: { city } } = user;

console.log(city);
```

```text
台北
```

這種寫法難讀，建議先拿出 `address`，再從 `address` 拿 `city`，分兩步比較清楚。

## 重點整理

- `const { a, b } = obj` 把物件的屬性拆成同名的變數。
- 用 `{ a: newName }` 改名，用 `{ a = 預設值 }` 設預設值。
- 函式參數可以直接解構：`function f({ name, age }) { ... }`。
- 巢狀解構能用但難讀，通常分兩步寫比較好。
