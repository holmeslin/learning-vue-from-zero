# 物件與陣列是參考

## 本集目標

理解兩個變數可以指向同一個物件或陣列，知道什麼時候會「改一個，另一個也變」，以及怎麼避免。

## 正文

### 改一個，另一個也變

第 1 章講物件時提過一個容易踩到的地方，現在把它講清楚。先看這個現象：

```js
const a = { count: 1 };
const b = a;

b.count = 2;

console.log(a.count);
```

```text
2
```

明明改的是 `b`，`a` 也變了。

原因是：`b = a` 沒有複製物件。物件本身放在記憶體的某個地方，變數裡記的只是「它在哪裡」，有點像寫了地址的紙條。`b = a` 是把紙條抄一份，兩張紙條寫的是同一個地址，指向同一個物件。這個「指向」叫**參考**（reference）。

所以 `b.count = 2` 改的就是那個唯一的物件，從 `a` 去看當然也是 2。

數字、字串、布林值不是這樣，它們是直接複製值：

```js
let x = 1;
let y = x;

y = 2;

console.log(x);
```

```text
1
```

`y = x` 是把 1 複製一份給 `y`，之後 `y` 怎麼改都和 `x` 無關。

### 陣列也一樣，傳進函式也一樣

陣列和物件一樣是參考：

```js
const todos = ["洗衣服"];
const sameTodos = todos;

sameTodos.push("寫程式");

console.log(todos);
```

```text
[ '洗衣服', '寫程式' ]
```

把物件或陣列傳進函式，函式拿到的也是同一個參考。函式裡改它，外面的也會變：

```js
function addTodo(list) {
  list.push("買晚餐");
}

const todos = ["洗衣服"];
addTodo(todos);

console.log(todos);
```

```text
[ '洗衣服', '買晚餐' ]
```

`list` 和 `todos` 指向同一個陣列。這不一定是壞事，有時你就是想讓函式幫你改；但你要**知道**它會改到外面的資料。

### `===` 比的是「是不是同一個」

第 1 章學過用 `===` 比較兩個值。用在物件和陣列上時，它比的不是內容，而是「是不是同一個」：

```js
const a = { name: "小明" };
const b = a;
const c = { name: "小明" };

console.log(a === b);
console.log(a === c);
console.log([1, 2] === [1, 2]);
```

```text
true
false
false
```

`a` 和 `c` 內容一模一樣，但它們是兩個各自建立的物件，所以不相等。`[1, 2] === [1, 2]` 也一樣，每寫一次 `[...]` 或 `{...}` 就是造一個新的。

第 7 集說 `includes` 是用 `===` 比的，所以拿它找物件會找不到：

```js
const users = [{ name: "小明" }];

console.log(users.includes({ name: "小明" }));
```

```text
false
```

要找物件，用 `find` 或 `some` 比對屬性，例如 `users.some((user) => user.name === "小明")`。

### 用展開語法複製

想要一份「改了也不影響原本」的資料，就要真的複製一份。上一集的展開語法就是做這件事：

```js
const user = { name: "小明", age: 20 };
const copy = { ...user };

copy.age = 21;

console.log(user.age);
console.log(copy.age);
console.log(user === copy);
```

```text
20
21
false
```

`{ ...user }` 造了一個新物件，把 `user` 的屬性一個一個抄進去。`copy` 和 `user` 不是同一個，改 `copy` 不會影響 `user`。陣列用 `[...arr]`，道理一樣。

### 淺複製：只複製一層

上一集說過，展開只複製最外面一層。現在你可以理解為什麼了：

```js
const user = {
  name: "小明",
  address: { city: "台北", zip: "100" },
};
const copy = { ...user };

console.log(copy.address === user.address);

copy.address.city = "高雄";

console.log(user.address.city);
```

```text
true
高雄
```

展開時，`address` 屬性的值是一個參考，抄過去的也只是這個參考。所以 `copy.address` 和 `user.address` 還是同一個物件，改了一邊，另一邊也變。這叫**淺複製**（shallow copy）。

要改內層，就把內層那一層也複製：

```js
const user = {
  name: "小明",
  address: { city: "台北", zip: "100" },
};

const moved = {
  ...user,
  address: { ...user.address, city: "高雄" },
};

console.log(user.address.city);
console.log(moved.address.city);
```

```text
台北
高雄
```

規則是：**從你要改的那一層一路往外，每一層都要複製**。資料嵌得越深，這種寫法越囉嗦。好在到了 Vue，多數時候可以直接改內層的屬性，不一定要這樣一層一層複製，第 5 章會講。

### 哪些方法會改到原本的陣列

陣列的方法分成兩類，用之前要分清楚：

| 會改原本的陣列 | 造一個新陣列、原本的不動 |
| --- | --- |
| `push`、`pop`、`unshift` | `map`、`filter` |
| `splice` | `[...arr, item]` |
| `sort`、`reverse` | `toSorted`、`toReversed` |

`push`、`pop` 分別是從最後面加入、移除；`unshift` 是加到最前面；`splice` 可以從中間刪除或插入。這幾個你先知道它們「會改原陣列」就好。

兩類都有用，看你想不想改原本的資料。排序是最容易出事的例子：

```js
const numbers = [3, 1, 2];

const sorted = numbers.toSorted((a, b) => a - b);
console.log(numbers);
console.log(sorted);

numbers.sort((a, b) => a - b);
console.log(numbers);
```

```text
[ 3, 1, 2 ]
[ 1, 2, 3 ]
[ 1, 2, 3 ]
```

`(a, b) => a - b` 是「由小到大」的比較方式，想由大到小就改成 `b - a`。`toSorted` 回傳排好的新陣列，`numbers` 不動；`sort` 則是直接把 `numbers` 本身排好。如果你只是想「顯示一份排序過的清單」，卻用了 `sort`，原本的資料順序也會被改掉。

### 為什麼 Vue 要你知道這件事

第 5 章會學到 Vue 的**響應式**（reactivity）：你把資料交給 `ref` 或 `reactive`，Vue 就會盯著那一份資料，你改了它，畫面自動跟著更新。例如對待辦清單 `push` 一筆新的，畫面上就多一列。

正因為 Vue 盯的是「那一份」資料，參考的觀念就很重要：

- **改的是哪一份很重要。** 如果你先複製一份、改了複製品，卻沒有把它交回給 Vue，Vue 盯著的那份沒變，畫面也不會變。反過來，有時你就是想先複製：例如編輯表單，先複製一份給使用者改，按「儲存」才寫回去，否則還沒按儲存，清單上的資料就跟著變了。
- **`reactive` 給你的是另一個物件。** 第 5 章會看到，`reactive(原本的物件)` 回傳的不是原本那個物件，用 `===` 比會是 `false`。之後要一律用它回傳的那一個。
- **數字、字串是複製值。** 把響應式物件裡的數字拿出來存成另一個變數，得到的只是一個普通的數字，不會再跟著變。第 5 章講 `reactive` 時會再遇到。
- **排序用 `toSorted`。** 第 5 章用 `computed` 做排序過的清單時，要用 `toSorted`，用 `sort` 會連原本的資料一起排掉。

現在不用懂 `ref`、`reactive`、`computed` 是什麼，只要記得：物件和陣列是參考，改之前先想清楚你改的是哪一份。

## 重點整理

- 物件和陣列是參考：`b = a` 之後兩個變數指向同一個，改一個另一個也變；傳進函式也一樣。數字、字串、布林值則是複製值。
- 物件和陣列的 `===` 比的是「是不是同一個」，內容一樣的兩個物件也不相等。
- 展開語法可以複製，但只複製一層；要改內層，那一層也要複製。
- `push`、`splice`、`sort` 會改原陣列，`map`、`filter`、`toSorted` 會造新陣列。
- Vue 的響應式盯著某一份資料，所以你要清楚自己改的是哪一份。
