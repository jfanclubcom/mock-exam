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
    assert(typeof figures[question.figure] === "function", `${question.id} 找不到插圖 ${question.figure}`);
    assert(question.figureAlt, `${question.id} 缺少圖像說明`);
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

const seasons = grade.gradeQuestion(exam.questions[16], { blanks: { seasons: "春、夏、秋、冬" } });
assert(seasons.earned === 2, "春、夏、秋、冬應接受");

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
