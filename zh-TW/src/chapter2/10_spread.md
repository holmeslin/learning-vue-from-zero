# 展開語法

## 本集目標

用三個點 `...` 把陣列或物件「攤開」，用來複製、合併和新增東西。

## 正文

### 陣列的展開

在陣列裡放 `...` 加上另一個陣列，會把那個陣列的東西一個一個攤開放進來：

```js
const a = [1, 2];
const b = [3, 4];

const merged = [...a, ...b];

console.log(merged);
```

```text
[ 1, 2, 3, 4 ]
```

這叫**展開語法**（spread syntax）。可以混著普通的值一起放：

```js
const numbers = [2, 3];

const withMore = [1, ...numbers, 4];

console.log(withMore);
```

```text
[ 1, 2, 3, 4 ]
```

### 複製陣列

```js
const original = [1, 2, 3];
const copy = [...original];

copy.push(4);

console.log(original);
console.log(copy);
```

```text
[ 1, 2, 3 ]
[ 1, 2, 3, 4 ]
```

`copy` 是一個全新的陣列，改它不會影響 `original`。

對照一下「直接指派」會怎樣：

```js
const original = [1, 2, 3];
const same = original;

same.push(4);

console.log(original);
```

```text
[ 1, 2, 3, 4 ]
```

`same = original` 沒有複製任何東西，只是讓 `same` 和 `original` 指向**同一個**陣列。所以改 `same`，`original` 也跟著變了。這個行為叫做**參考**（reference），下一集會詳細談。

### 物件的展開

物件也能展開，把屬性一個一個攤開：

```js
const user = { name: "小明", age: 20 };

const copy = { ...user };

console.log(copy);
```

```text
{ name: '小明', age: 20 }
```

### 複製的同時修改

展開物件後面再寫屬性，會**覆蓋**前面同名的：

```js
const user = { name: "小明", age: 20, city: "台北" };

const updated = { ...user, age: 21 };

console.log(updated);
console.log(user);
```

```text
{ name: '小明', age: 21, city: '台北' }
{ name: '小明', age: 20, city: '台北' }
```

這一行的意思是：「複製 `user` 的所有屬性，但 `age` 換成 21」。原本的 `user` 完全沒動。

順序有差。如果把展開放在最後，就會蓋掉前面的：

```js
const user = { name: "小明", age: 20 };

console.log({ age: 21, ...user });
console.log({ ...user, age: 21 });
```

```text
{ age: 20, name: '小明' }
{ name: '小明', age: 21 }
```

第一行的 `age: 21` 被後面展開的 `user.age`（20）蓋掉了。**後面的贏。**

### 新增屬性

```js
const user = { name: "小明" };

const withEmail = { ...user, email: "ming@example.com" };

console.log(withEmail);
```

```text
{ name: '小明', email: 'ming@example.com' }
```

### 在函式呼叫裡展開

展開也能用在呼叫函式的時候，把陣列變成一個一個的引數：

```js
const numbers = [3, 1, 4];

console.log(Math.max(...numbers));
```

```text
4
```

`Math.max(...numbers)` 等於 `Math.max(3, 1, 4)`。

### 淺複製

展開只複製「最外面一層」。如果裡面還有物件或陣列，那些內層的東西還是共用的：

```js
const user = { name: "小明", hobbies: ["爬山"] };
const copy = { ...user };

copy.hobbies.push("游泳");

console.log(user.hobbies);
```

```text
[ '爬山', '游泳' ]
```

`copy.hobbies` 和 `user.hobbies` 指向同一個陣列，所以改一邊，兩邊都變。這叫**淺複製**（shallow copy）。下一集會說明為什麼會這樣，以及要改內層時該怎麼做。

## 重點整理

- `[...a, ...b]` 合併陣列，`[...a]` 複製陣列。
- `{ ...obj }` 複製物件，後面再寫屬性可以覆蓋或新增。
- 展開時後面的贏，所以 `{ ...user, age: 21 }` 是「複製並改 `age`」。
- 展開只複製最外層，內層的物件和陣列還是共用同一份。
