# 綜合練習

## 本集目標

把這一章的函式、陣列方法、解構、展開、`?.` / `??` 和 `async` / `await` 組合起來，處理一份成績資料。

## 正文

請先自己寫，卡住再看提示，最後再對照參考解答。這一題比第 1 章長，沒關係，**一個小題一個小題做**，每做完一題就執行看看。

### 起始程式碼

建立 `students.js`，先貼上這份資料和一個現成的函式：

```js
const students = [
  { id: 1, name: "小明", scores: { math: 90, english: 70 } },
  { id: 2, name: "小華", scores: { math: 55, english: 80 } },
  { id: 3, name: "小美", scores: { math: 100 } },
];

// 模擬向伺服器查詢學生，0.1 秒後回傳，找不到就失敗。已經寫好了，不用改
function fetchStudent(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const student = students.find((item) => item.id === id);
      if (student) {
        resolve(student);
      } else {
        reject(new Error("查無此人"));
      }
    }, 100);
  });
}
```

注意小美沒有 `english`：她缺考英文。

### 題目

1. 寫一個函式 `getTotal(student)`，回傳數學加英文的總分。缺考的科目算 0 分。
2. 用 `map` 做出一個陣列，每個東西是 `{ name, total }`。再用 `for...of` 搭配解構，印出每個人的「名字：總分 分」。
3. 從上一題的陣列中，用 `filter` 挑出總分 150 以上的人，再用 `map` 取出名字，印出名字陣列。
4. 算出全班總分的平均，印出時取到小數點後一位。
5. 寫一個函式 `findName(id)`，用 `find` 找到學生並回傳名字；找不到時回傳 `"查無此人"`，而且不能出錯。
6. 做出一份新的 `updated` 陣列，裡面小華的英文改成 90，但原本的 `students` 不能被改到。印出小華修改前後的英文成績，再用 `===` 檢查兩個陣列裡的小明是不是同一個物件、小華是不是同一個物件。
7. 寫一個 `async` 函式 `showStudent(id)`，用 `fetchStudent` 取得學生，印出「名字 的數學成績：分數」；失敗時印出「錯誤：錯誤訊息」。然後依序對 id 為 1 和 99 各呼叫一次。

預期的輸出：

```text
小明：160 分
小華：135 分
小美：100 分
高分組： [ '小明' ]
全班平均：131.7 分
小華
查無此人
80 90
true false
小明 的數學成績：90
錯誤：查無此人
```

### 提示

- 第 1 題：先用物件解構拿出 `math` 和 `english`，缺考的那個是 `undefined`，用 `??` 換成 0。
- 第 2 題：callback 想回傳物件，記得把物件用小括號包起來。
- 第 4 題：可以用 `reduce` 加總；也可以用 `for...of` 加 `let`，兩種都算對。
- 第 5 題：`find` 找不到會得到 `undefined`，接著用 `?.` 取 `name`，再用 `??` 給預設值。
- 第 6 題：要改的是「小華」的「`scores` 裡面的 `english`」，兩層都要複製。用 `map` 走過每個學生，是小華的那一個換成新物件，其他原樣回傳。
- 第 7 題：`await` 只能寫在 `async` 函式裡。依序呼叫兩次，也要寫在一個 `async` 函式裡，並且用 `await` 等第一個完成。

### 參考解答

寫完再看。

<details>
<summary>展開參考解答</summary>

```js
const students = [
  { id: 1, name: "小明", scores: { math: 90, english: 70 } },
  { id: 2, name: "小華", scores: { math: 55, english: 80 } },
  { id: 3, name: "小美", scores: { math: 100 } },
];

function fetchStudent(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const student = students.find((item) => item.id === id);
      if (student) {
        resolve(student);
      } else {
        reject(new Error("查無此人"));
      }
    }, 100);
  });
}

// 第 1 題
function getTotal(student) {
  const { math, english } = student.scores;
  return math + (english ?? 0);
}

// 第 2 題
const totals = students.map((student) => ({
  name: student.name,
  total: getTotal(student),
}));

for (const { name, total } of totals) {
  console.log(`${name}：${total} 分`);
}

// 第 3 題
const highScorers = totals
  .filter(({ total }) => total >= 150)
  .map(({ name }) => name);
console.log("高分組：", highScorers);

// 第 4 題
const sum = totals.reduce((acc, { total }) => acc + total, 0);
console.log(`全班平均：${(sum / totals.length).toFixed(1)} 分`);

// 第 5 題
function findName(id) {
  return students.find((student) => student.id === id)?.name ?? "查無此人";
}
console.log(findName(2));
console.log(findName(99));

// 第 6 題
const updated = students.map((student) =>
  student.id === 2
    ? { ...student, scores: { ...student.scores, english: 90 } }
    : student
);
console.log(students[1].scores.english, updated[1].scores.english);
console.log(students[0] === updated[0], students[1] === updated[1]);

// 第 7 題
async function showStudent(id) {
  try {
    const { name, scores } = await fetchStudent(id);
    console.log(`${name} 的數學成績：${scores.math}`);
  } catch (error) {
    console.log(`錯誤：${error.message}`);
  }
}

async function main() {
  await showStudent(1);
  await showStudent(99);
}

main();
```

幾個值得注意的地方：

- 第 1 題的 `english ?? 0` 要用 `??`。如果用 `||`，分數剛好是 0 分的人也會被當成缺考，雖然這題算出來一樣，但意思不對。
- 第 5 題 `?.` 和 `??` 搭配，是處理「可能不存在」的標準組合。
- 第 6 題的「兩層都要複製」：只展開外層的話，`updated[1].scores` 還是和原本共用同一個物件，改它就會連 `students` 一起改到。沒改的小明直接原樣回傳，所以兩個陣列裡的小明是同一個物件（`true`），小華則是新造的（`false`）。
- 第 7 題的 `main` 裡用了兩次 `await`，所以 id 99 的查詢會等 id 1 完成才開始。

</details>

### 延伸挑戰

- 把第 7 題的兩個查詢改成同時進行（提示：第 14 集的 `Promise.all`）。
- 加一個函式，回傳「全班每一科的平均」，結果長得像 `{ math: 81.7, english: 75 }`（缺考的人不算進該科）。

## 重點整理

- 一份資料可以搭配 `map`、`filter`、`find`、`reduce` 做出各種加工，它們可以任意組合。
- `?.` 加 `??` 是處理「可能沒有」的資料時最常用的組合。
- 想改資料又不動到原本的，就從要改的那一層一路往外，每一層都複製；沒複製的部分是同一個參考。
- `await` 要在 `async` 函式裡，用 `try...catch` 處理失敗。
