const fs = require("fs");
const path = require("path");
const exam = require("../js/questions.js");
const grade = require("../js/grade.js");
const figures = require("../js/figures.js");

const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

assert(exam.questions.length === 40, `題數是 ${exam.questions.length}，應為 40`);

const points = exam.questions.reduce((sum, question) => sum + grade.maxPoints(question), 0);
assert(points === 100, `總分是 ${points}，應為 100`);

exam.lessons.forEach((lesson) => {
  const items = exam.questions.filter((question) => question.lesson === lesson.id);
  const lessonPoints = items.reduce((sum, question) => sum + grade.maxPoints(question), 0);
  assert(items.length === 8, `第${lesson.id}課有 ${items.length} 題`);
  assert(lessonPoints === 20, `第${lesson.id}課有 ${lessonPoints} 分`);
});

const ids = new Set();
exam.questions.forEach((question, index) => {
  assert(!ids.has(question.id), `重複題號 ${question.id}`);
  ids.add(question.id);
  assert(question.explanation && question.explanation.length > 12, `${question.id} 缺少解釋`);
  assert(question.badges && question.badges.length > 0, `${question.id} 缺少題型標籤`);
  assert(question.points === grade.maxPoints(question), `${question.id} 分數不一致`);
  if (question.figure) {
    const src = figures[question.figure];
    assert(typeof src === "string" && src.endsWith(".png"), `${question.id} 插圖應指向 PNG`);
    assert(!String(src).includes(".svg"), `${question.id} 不應使用 SVG`);
    assert(fs.existsSync(path.join(__dirname, "..", src)), `${question.id} 找不到 ${src}`);
    assert(question.figureAlt, `${question.id} 缺少圖像說明`);
  }
  if (question.type === "mcq") {
    const joined = question.choices.map((choice) => choice.text).join(" ");
    ["午餐菜單", "借書紀錄", "歐洲中部", "座位表"].forEach((banned) => {
      assert(!joined.includes(banned), `${question.id} 仍有過易干擾項：${banned}`);
    });
  }
  if (question.type === "mcq") {
    const correct = question.choices.filter((choice) => choice.correct);
    assert(correct.length === 1, `${question.id} 應有一個正確選項`);
  } else {
    assert(question.type === "fill", `${question.id} 題型不明`);
    question.blanks.forEach((blank) => {
      assert(blank.accept && blank.accept.length > 0, `${question.id} 空格 ${blank.id} 沒有接受答案`);
      assert(blank.points > 0, `${question.id} 空格沒有分數`);
      assert(question.parts.some((part) => part.blank === blank.id), `${question.id} 空格 ${blank.id} 沒有出現在句子`);
    });
  }
  assert(exam.questions[index].id === `q${String(index + 1).padStart(2, "0")}`, `${question.id} 次序不對`);
});

function answerAllCorrect() {
  const answers = {};
  exam.questions.forEach((question) => {
    if (question.type === "mcq") {
      answers[question.id] = { choice: question.choices.find((choice) => choice.correct).id };
    } else {
      const blanks = {};
      question.blanks.forEach((blank) => {
        blanks[blank.id] = blank.accept[0];
      });
      answers[question.id] = { blanks };
    }
  });
  return answers;
}

const perfect = grade.gradeExam(exam.questions, answerAllCorrect());
assert(perfect.earned === 100, `全對只得 ${perfect.earned}`);
assert(perfect.items.length === 40, "覆核題數應為 40");
assert(perfect.items.every((item) => item.ok), "全對仍有題目未判對");
assert(perfect.items.every((item) => item.max > 0 && item.correctText && item.correctText.trim()), "每題都要有分數和正確答案");
assert(exam.questions.every((question) => question.explanation && question.explanation.trim().length > 12), "每題都要有解釋");

const blank = grade.gradeExam(exam.questions, {});
assert(blank.earned === 0, "空白試卷不應得分");

const synonyms = grade.gradeQuestion(exam.questions[2], { blanks: { region: "港島" } });
assert(synonyms.earned === 2, "港島應接受");

const simplified = grade.gradeQuestion(exam.questions[3], {
  blanks: { legend: "图例", grid: "格网坐标" },
});
assert(simplified.earned === 4, `簡體圖例／格網應滿分，實際 ${simplified.earned}`);

const partial = grade.gradeQuestion(exam.questions[3], { blanks: { legend: "圖例", grid: "比例尺" } });
assert(partial.earned === 2 && partial.partial, `部分得分應為 2，實際 ${partial.earned}`);

const climateGoals = grade.gradeQuestion(exam.questions[16], { blanks: { peak: "碳達峰", neutral: "碳中和" } });
assert(climateGoals.earned === 2, "碳達峰、碳中和應接受");
const climateLoose = grade.gradeQuestion(exam.questions[16], { blanks: { peak: "減排", neutral: "綠色生活" } });
assert(climateLoose.earned === 0, "減排不應當作碳達峰");

const counts = { A: 0, B: 0, C: 0, D: 0 };
exam.questions.filter((question) => question.type === "mcq").forEach((question) => {
  counts[question.choices.find((choice) => choice.correct).id] += 1;
});
const mcqTotal = counts.A + counts.B + counts.C + counts.D;
assert(mcqTotal === 29, `選擇題應有 29 題，實際 ${mcqTotal}`);
assert(counts.C + counts.D > mcqTotal / 2, `C+D 應多於一半，實際 ${JSON.stringify(counts)}`);
assert(counts.A >= 5 && counts.B >= 5 && counts.C >= 6 && counts.D >= 6, `答案分佈不均 ${JSON.stringify(counts)}`);
["A", "B", "C", "D"].forEach((letter) => {
  assert(counts[letter] >= 4, `${letter} 太少：${JSON.stringify(counts)}`);
});

const q06 = exam.questions.find((question) => question.id === "q06");
assert(!q06.stem.includes("虛線") && !q06.stem.includes("出入口"), "第6題題幹不應提示虛線或出入口");
const q11 = exam.questions.find((question) => question.id === "q11");
assert(!q11.choices.some((choice) => /\d/.test(choice.text)), "第11題選項不應附高度數字");
assert(!/\d/.test(q11.stem), "第11題題幹不應附高度數字");
["不要對調", "並不準確", "注意虛線", "不要把"].forEach((hint) => {
  assert(!exam.questions.some((question) => question.stem.includes(hint)), `題幹仍有提示：${hint}`);
});

const shuffled = grade.shuffleIds(["q01", "q02", "q03", "q04"], () => 0);
assert(shuffled.slice().sort().join() === "q01,q02,q03,q04", "亂序必須保留全部題號");
assert(shuffled.join() !== "q01,q02,q03,q04", "亂序不應維持原次序");

const swapped = grade.gradeQuestion(exam.questions[24], {
  blanks: { shape: "球體", water: "陸地", land: "海洋" },
});
assert(swapped.earned === 3, `海陸對調應滿分，實際 ${swapped.earned}`);

const gas = grade.gradeQuestion(exam.questions[33], {
  blanks: { gas: "CO₂", climate: "氣候", extreme: "極端天氣" },
});
assert(gas.earned === 3, `二氧化碳寫法應滿分，實際 ${gas.earned}`);

const park = grade.gradeQuestion(exam.questions[12], {
  blanks: { island: "赤鱲角島", park: "沙洲及龍鼓洲海岸公園" },
});
assert(park.earned === 4, `海岸公園全名應接受，實際 ${park.earned}`);

const wrongPlain = grade.gradeQuestion(exam.questions[9], { blanks: { plain: "新界" } });
assert(wrongPlain.earned === 0, "新界不應取代九龍");

const notIsland = grade.gradeQuestion(exam.questions[2], { blanks: { region: "香港" } });
assert(notIsland.earned === 0, "只寫香港不應當作香港島");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("40 題、100 分、同義詞與部分得分檢查通過。");

const v1Stem = exam.questions[0].stem;
assert(v1Stem.indexOf("美兒要判斷中國在亞洲的位置") === 0, "第一版題幹被改動");
const v2 = require("../js/questions-v2.js");
assert(v2.questions.length === 40, "第二版題數不對");
const v2Points = v2.questions.reduce((sum, question) => sum + grade.maxPoints(question), 0);
assert(v2Points === 100, `第二版總分 ${v2Points}`);
v2.lessons.forEach((lesson) => {
  const items = v2.questions.filter((question) => question.lesson === lesson.id);
  const lessonPoints = items.reduce((sum, question) => sum + grade.maxPoints(question), 0);
  assert(items.length === 8, `第二版第${lesson.id}課題數 ${items.length}`);
  assert(lessonPoints === 20, `第二版第${lesson.id}課分數 ${lessonPoints}`);
});
const v1Stems = new Set(exam.questions.map((question) => question.stem));
v2.questions.forEach((question) => {
  assert(!v1Stems.has(question.stem), `第二版題幹與第一版重複：${question.id}`);
  assert(question.explanation && question.explanation.length > 12, `${question.id} 缺少解釋`);
  if (question.type === "mcq") {
    assert(question.choices.filter((choice) => choice.correct).length === 1, `${question.id} 正確項數目`);
  }
});
const v2Counts = { A: 0, B: 0, C: 0, D: 0 };
v2.questions.filter((question) => question.type === "mcq").forEach((question) => {
  v2Counts[question.choices.find((choice) => choice.correct).id] += 1;
});
const v2Mcq = v2Counts.A + v2Counts.B + v2Counts.C + v2Counts.D;
assert(v2Mcq === 29, `第二版選擇題 ${v2Mcq}`);
assert(v2Counts.C + v2Counts.D >= v2Mcq / 2, `第二版 C+D 不足 ${JSON.stringify(v2Counts)}`);
assert(v2Counts.A <= 8 && v2Counts.B <= 8, `第二版 A/B 過多 ${JSON.stringify(v2Counts)}`);
const v2Perfect = grade.gradeExam(v2.questions, answerAll(v2.questions));
assert(v2Perfect.earned === 100, `第二版全對 ${v2Perfect.earned}`);
console.log("第二版選擇題正確項", JSON.stringify(v2Counts));

function answerAll(list) {
  const answers = {};
  list.forEach((question) => {
    if (question.type === "mcq") {
      answers[question.id] = { choice: question.choices.find((choice) => choice.correct).id };
    } else {
      const blanks = {};
      question.blanks.forEach((blank) => {
        blanks[blank.id] = blank.accept[0];
      });
      answers[question.id] = { blanks };
    }
  });
  return answers;
}
