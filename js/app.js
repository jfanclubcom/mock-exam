(function () {
  "use strict";

  const gradeApi = window.ExamGrade;
  const figures = window.ExamFigures;
  const app = document.getElementById("app");
  const live = document.getElementById("live");
  const modal = document.getElementById("modal");
  const activeKey = "hk-p4-humanities-active";

  function bankFor(id) {
    return id === "v2" ? window.EXAM_V2 : window.EXAM;
  }

  function keyFor(id) {
    return id === "v2" ? "hk-p4-humanities-mock-v2" : "hk-p4-humanities-mock-v1";
  }

  let paperId = "v1";
  try {
    const savedPaper = localStorage.getItem(activeKey);
    if (savedPaper === "v1" || savedPaper === "v2") paperId = savedPaper;
  } catch (error) {
    paperId = "v1";
  }
  let exam = bankFor(paperId);

  function storageKey() {
    return keyFor(paperId);
  }

  const state = loadState();

  function blankState() {
    return {
      version: exam.version,
      started: false,
      submitted: false,
      index: 0,
      order: [],
      answers: {},
      filter: "all",
    };
  }

  function loadState() {
    const fresh = {
      version: exam.version,
      started: false,
      submitted: false,
      index: 0,
      order: [],
      answers: {},
      filter: "all",
    };
    try {
      const raw = localStorage.getItem(storageKey());
      if (!raw) return fresh;
      const data = JSON.parse(raw);
      if (!data || data.version !== exam.version || typeof data.answers !== "object") return fresh;
      data.answers = data.answers || {};
      data.index = Number.isInteger(data.index) ? data.index : 0;
      if (data.index < 0 || data.index >= exam.questions.length) data.index = 0;
      data.filter = data.filter || "all";
      data.started = Boolean(data.started);
      data.submitted = Boolean(data.submitted);
      data.order = Array.isArray(data.order) ? data.order : [];
      const known = new Set(exam.questions.map((question) => question.id));
      const orderOk = data.order.length === exam.questions.length && data.order.every((id) => known.has(id));
      if (!orderOk) data.order = [];
      return data;
    } catch (error) {
      return fresh;
    }
  }

  function saveState() {
    try {
      localStorage.setItem(storageKey(), JSON.stringify(state));
      localStorage.setItem(activeKey, paperId);
    } catch (error) {
      /* 私人瀏覽模式可能無法寫入，仍可在本次開啟中作答。 */
    }
  }

  function h(tag, attrs, children) {
    const node = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([key, value]) => {
      if (value == null || value === false) return;
      if (key === "class") node.className = value;
      else if (key === "text") node.textContent = value;
      else node.setAttribute(key, String(value));
    });
    (children || []).flat().forEach((child) => {
      if (child == null || child === false) return;
      node.append(child.nodeType ? child : document.createTextNode(String(child)));
    });
    return node;
  }

  function lessonById(id) {
    return exam.lessons.find((lesson) => lesson.id === id);
  }

  function lessonLabel(id) {
    const lesson = lessonById(id);
    return `${lesson.unit}　${lesson.unitTitle}　·　第${lesson.id}課　${lesson.title}`;
  }

  function isAnswered(question) {
    const answer = state.answers[question.id];
    if (!answer) return false;
    if (question.type === "mcq") return Boolean(answer.choice);
    return question.blanks.some((blank) => String((answer.blanks || {})[blank.id] || "").trim());
  }

  function answeredCount() {
    return exam.questions.filter(isAnswered).length;
  }

  function paper() {
    const byId = new Map(exam.questions.map((question) => [question.id, question]));
    if (!state.order || state.order.length !== exam.questions.length) return exam.questions.slice();
    return state.order.map((id) => byId.get(id));
  }

  function resultNow() {
    return gradeApi.gradeExam(paper(), state.answers);
  }

  function say(message) {
    if (live) live.textContent = message;
  }

  function mascotFor(index) {
    const puppy = index % 2 === 0;
    return {
      src: puppy ? "assets/mascot-puppy.png" : "assets/mascot-squirrel.png",
      name: puppy ? "豆豆" : "栗子",
      alt: puppy ? "原創小幫手豆豆，白色小狗" : "原創小幫手栗子，小飛鼠",
    };
  }

  function speechFor(question) {
    if (question.badges.includes("看圖")) return "加油！先看圖，再看選項。";
    if (question.type === "fill") return "這題不供詞，填上關鍵詞就好。";
    if (question.badges.includes("時事")) return "加油！想想課文怎樣連到生活。";
    const lines = ["加油！看清楚再作答。", "不限時，可以慢慢檢查。", "選好了就按下一題。"];
    return lines[state.index % lines.length];
  }

  function band(score) {
    if (score >= 90) return { title: "答得好！", text: "你對這五課很熟悉。可以再看一看仍失分的句子，把詞語記準。" };
    if (score >= 75) return { title: "做得好", text: "大部分概念已經掌握。針對未滿分的題目，回去看看該課的小結。" };
    if (score >= 60) return { title: "加油！", text: "你已掌握一部分。建議按課次回看錯題，先重溫地圖、季節和資源這幾個大塊。" };
    return { title: "加油！", text: "這次先當作練習。錯題就是溫習清單，一課一課看解釋，再重考一次。" };
  }

  function peek(id) {
    try {
      const raw = localStorage.getItem(keyFor(id));
      if (!raw) return null;
      const data = JSON.parse(raw);
      const bank = bankFor(id);
      if (!data || data.version !== bank.version || typeof data.answers !== "object") return null;
      const count = bank.questions.filter((question) => {
        const answer = data.answers[question.id];
        if (!answer) return false;
        if (question.type === "mcq") return Boolean(answer.choice);
        return question.blanks.some((blank) => String((answer.blanks || {})[blank.id] || "").trim());
      }).length;
      return { started: Boolean(data.started), submitted: Boolean(data.submitted), count };
    } catch (error) {
      return null;
    }
  }

  function versionCard(id, title, blurb) {
    const saved = peek(id);
    let label = `開始${title}`;
    let action = "start";
    if (saved && saved.started && !saved.submitted) {
      label = `繼續${title}（已作答 ${saved.count}／40）`;
      action = "resume";
    } else if (saved && saved.submitted && saved.started) {
      label = `查看${title}成績`;
      action = "review";
    }
    return h("article", { class: "version-card" }, [
      h("h3", { text: title }),
      h("p", { text: blurb }),
      h("button", {
        class: "btn btn-primary",
        type: "button",
        "data-action": action,
        "data-paper": id,
        text: label,
      }),
    ]);
  }

  function beginPaper(nextPaper, action) {
    paperId = nextPaper === "v2" ? "v2" : "v1";
    exam = bankFor(paperId);
    const loaded = loadState();
    Object.keys(state).forEach((key) => delete state[key]);
    if (action === "start") {
      Object.assign(state, blankState());
      state.started = true;
      state.index = 0;
      state.order = gradeApi.shuffleIds(exam.questions.map((question) => question.id));
    } else {
      Object.assign(state, loaded);
      state.started = true;
      if (!state.order || state.order.length !== exam.questions.length) {
        state.order = gradeApi.shuffleIds(exam.questions.map((question) => question.id));
        state.index = 0;
      }
    }
    saveState();
    render();
    window.scrollTo(0, 0);
  }

  function render() {
    app.replaceChildren();
    if (!state.started) renderCover();
    else if (state.submitted) renderResult();
    else renderQuiz();
  }

  function renderCover() {
    const puppy = mascotFor(0);
    const squirrel = mascotFor(1);
    app.append(
      h("main", { class: "wrap cover" }, [
        h("p", { class: "eyebrow", text: "小學四年級上學期　·　人文科" }),
        h("div", { class: "hero" }, [
          h("div", { class: "hero-copy" }, [
            h("h1", { text: "人文科模擬測驗" }),
            h("p", { class: "lede", text: "《奇妙的世界》四上　單元一　環境與氣候　·　單元二　地球是我家" }),
            h("ul", { class: "stats" }, [
              h("li", { text: "40 題" }),
              h("li", { text: "滿分 100" }),
              h("li", { text: "不限時" }),
            ]),
          ]),
          h("div", { class: "mascot-pair" }, [
            figureMascot(puppy, "加油！"),
            figureMascot(squirrel, "我們一起看題。"),
          ]),
        ]),
        h("section", { class: "panel", "aria-labelledby": "scope-title" }, [
          h("h2", { id: "scope-title", text: "考試範圍" }),
          h("div", { class: "lesson-grid" }, exam.lessons.map((lesson) =>
            h("article", { class: "lesson-card" }, [
              h("p", { class: "lesson-unit", text: `${lesson.unit}　${lesson.unitTitle}` }),
              h("h3", { text: `第${lesson.id}課　${lesson.title}` }),
              h("p", { text: `${lesson.count} 題　·　${lesson.points} 分` }),
            ])
          )),
        ]),
        h("section", { class: "panel", "aria-labelledby": "paper-title" }, [
          h("h2", { id: "paper-title", text: "選擇試卷" }),
          h("div", { class: "version-grid" }, [
            versionCard("v1", "第一版", "現有試卷。題目、答案和解釋維持不變。"),
            versionCard("v2", "第二版", "全新題目。範圍相同，問法和情境不同。"),
          ]),
        ]),
        h("section", { class: "panel", "aria-labelledby": "how-title" }, [
          h("h2", { id: "how-title", text: "怎樣作答" }),
          h("ul", { class: "plain-list" }, [
            h("li", { text: "題型包括不供詞填充、選擇、生活情境、看圖辨別和時事。每次重新開始都會打亂題序，不會按課次排列。" }),
            h("li", { text: "填充題每格獨立計分，答對一部分也有分。大小寫、標點和常見同義詞會一併接受。" }),
            h("li", { text: "提交後必定顯示總分。每一題都會列出分數、正確答案和解釋，並註明所屬課次。" }),
            h("li", { text: "答案只儲存在這部裝置的瀏覽器，可以關掉頁面後繼續。按「重新開始」會清除紀錄。" }),
          ]),
        ]),
        h("p", { class: "fine", text: "豆豆（白色小狗）和栗子（小飛鼠）是原創小幫手，不是任何商標角色。插圖亦為原創示意，並非課本掃描或天文台官方標誌。本頁供溫習，不是學校正式試卷。" }),
      ])
    );
  }

  function figureMascot(mascot, line) {
    return h("figure", { class: "mascot" }, [
      h("img", { src: mascot.src, alt: mascot.alt, width: "140", height: "146" }),
      h("figcaption", { class: "bubble", text: line }),
      h("p", { class: "mascot-name", text: `小幫手${mascot.name}` }),
    ]);
  }

  function renderQuiz() {
    const questions = paper();
    const question = questions[state.index];
    const mascot = mascotFor(state.index);
    const progress = ((state.index + 1) / questions.length) * 100;

    app.append(
      h("main", { class: "wrap quiz" }, [
        h("div", { class: "progress-sticky" }, [
          h("div", { class: "progress-row" }, [
            h("p", { class: "progress-title", text: paperId === "v2" ? "人文科模擬測驗　第二版" : "人文科模擬測驗　第一版" }),
            h("p", { class: "progress-count", text: `題 ${state.index + 1}／${questions.length}` }),
          ]),
          h("div", {
            class: "bar",
            role: "progressbar",
            "aria-valuemin": "1",
            "aria-valuemax": String(questions.length),
            "aria-valuenow": String(state.index + 1),
            "aria-valuetext": `第 ${state.index + 1} 題，共 ${questions.length} 題`,
          }, [h("span", { style: `width:${progress}%` })]),
          h("p", { class: "progress-meta" }, [
            h("span", { id: "answered-label", text: `已作答 ${answeredCount()}／${questions.length}` }),
            document.createTextNode("　·　分數於提交後顯示"),
          ]),
        ]),
        h("div", { class: "quiz-layout" }, [
          h("div", { class: "main-col" }, [
            h("article", { class: "card", "aria-labelledby": "question-title" }, [
              h("div", { class: "badge-row" }, question.badges.map((badge) => h("span", { class: `badge badge-${badge}`, text: badge }))),
              h("h1", { id: "question-title", tabindex: "-1", text: question.stem }),
              h("p", { class: "points", text: `本題 ${gradeApi.maxPoints(question)} 分` }),
              question.figure ? renderFigure(question) : null,
              question.type === "fill" ? h("p", { class: "hint", text: "不供詞填充：請自行輸入，無須從詞語表挑選。" }) : null,
              question.type === "mcq" ? renderChoices(question) : renderBlanks(question),
              h("div", { class: "helper" }, [
                h("img", { src: mascot.src, alt: "", width: "72", height: "75" }),
                h("p", { class: "bubble", text: speechFor(question) }),
              ]),
            ]),
            h("nav", { class: "nav-row", "aria-label": "題目導覽" }, [
              h("button", {
                class: "btn btn-ghost",
                type: "button",
                "data-action": "prev",
                disabled: state.index === 0 ? "disabled" : null,
                text: "上一題",
              }),
              h("button", {
                class: "btn btn-ghost",
                type: "button",
                "data-action": "next",
                disabled: state.index === questions.length - 1 ? "disabled" : null,
                text: "下一題",
              }),
              h("button", { class: "btn btn-primary", type: "button", "data-action": "submit", text: "提交試卷" }),
            ]),
          ]),
          renderPalette(),
        ]),
        h("p", { class: "fine", text: "答案暫存在這部裝置。若要清除，可按重新開始。" }),
        h("p", { class: "actions actions-quiet" }, [
          h("button", { class: "btn btn-text", type: "button", "data-action": "home", text: "返回選卷" }),
          h("button", { class: "btn btn-text", type: "button", "data-action": "restart", text: "重新開始" }),
        ]),
      ])
    );
    const title = document.getElementById("question-title");
    if (title) title.focus({ preventScroll: true });
    refreshChrome();
    say(`第 ${state.index + 1} 題，共 ${questions.length} 題。`);
  }

  function renderFigure(question) {
    return h("figure", { class: "figure" }, [
      h("img", { src: figures[question.figure], alt: question.figureAlt || "題目插圖" }),
      h("figcaption", { text: "原創示意，不是課本掃描，也不是官方標誌。" }),
    ]);
  }

  function renderChoices(question) {
    const selected = (state.answers[question.id] || {}).choice;
    return h("div", { class: "choices", role: "radiogroup", "aria-labelledby": "question-title" }, question.choices.map((choice) => {
      const inputId = `${question.id}-${choice.id}`;
      return h("label", { class: "choice", for: inputId }, [
        h("input", {
          id: inputId,
          type: "radio",
          name: `choice-${question.id}`,
          value: choice.id,
          checked: selected === choice.id ? "checked" : null,
        }),
        h("span", { class: "choice-key", text: choice.id }),
        h("span", { class: "choice-text", text: choice.text }),
      ]);
    }));
  }

  function renderBlanks(question) {
    const given = (state.answers[question.id] || {}).blanks || {};
    let blankNumber = 0;
    return h("div", { class: "fill-sentence" }, question.parts.map((part) => {
      if (part.text) return h("span", { class: "fill-text", text: part.text });
      blankNumber += 1;
      const blank = question.blanks.find((item) => item.id === part.blank);
      return h("input", {
        class: "fill-input",
        type: "text",
        maxlength: "24",
        autocomplete: "off",
        autocapitalize: "off",
        spellcheck: "false",
        "aria-label": `第 ${blankNumber} 個空格，${blank.points} 分`,
        "data-qid": question.id,
        "data-blank": part.blank,
        value: given[part.blank] || "",
      });
    }));
  }

  function renderPalette() {
    return h("aside", { class: "palette-card", "aria-label": "題目一覽" }, [
      h("h2", { text: "題目一覽" }),
      h("div", { class: "palette" }, paper().map((question, index) => {
        const classes = ["jump"];
        if (index === state.index) classes.push("is-current");
        if (isAnswered(question)) classes.push("is-done");
        return h("button", {
          class: classes.join(" "),
          type: "button",
          "data-action": "jump",
          "data-jump": question.id,
          "aria-current": index === state.index ? "true" : "false",
          "aria-label": `第 ${index + 1} 題${isAnswered(question) ? "，已作答" : "，未作答"}`,
          text: String(index + 1),
        });
      })),
    ]);
  }

  function renderResult() {
    const graded = resultNow();
    const comment = band(graded.earned);
    const mascot = mascotFor(graded.earned >= 75 ? 0 : 1);
    const fullCorrect = graded.items.filter((item) => item.ok).length;
    const partial = graded.items.filter((item) => item.partial).length;
    const filters = [
      ["all", "全部"],
      ["miss", "未滿分"],
      ["1", "第1課"],
      ["2", "第2課"],
      ["3", "第3課"],
      ["4", "第4課"],
      ["5", "第5課"],
    ];

    app.append(
      h("main", { class: "wrap result" }, [
        h("p", { class: "eyebrow", text: "提交完成　·　可離線重看這份成績" }),
        h("section", { class: "score-hero card" }, [
          h("div", { class: "score-ring", style: `--p:${graded.earned}` }, [
            h("div", { class: "score-core" }, [
              h("p", { class: "score-num", text: String(graded.earned) }),
              h("p", { class: "score-den", text: "／100" }),
            ]),
          ]),
          h("div", { class: "score-copy" }, [
            h("h1", { text: comment.title }),
            h("p", { text: comment.text }),
            h("p", { class: "score-detail", text: `完全答對 ${fullCorrect}／40 題${partial ? `，部分正確 ${partial} 題` : ""}。` }),
            h("div", { class: "helper" }, [
              h("img", { src: mascot.src, alt: mascot.alt, width: "72", height: "75" }),
              h("p", { class: "bubble", text: graded.earned >= 75 ? "答得好！" : "加油！我們看一看錯題。" }),
            ]),
          ]),
        ]),
        h("section", { "aria-labelledby": "lesson-score-title" }, [
          h("h2", { id: "lesson-score-title", text: "各課得分" }),
          h("div", { class: "lesson-grid" }, exam.lessons.map((lesson) => {
            const earned = graded.items.filter((item) => item.lesson === lesson.id).reduce((sum, item) => sum + item.earned, 0);
            return h("article", { class: "lesson-card" }, [
              h("h3", { text: `第${lesson.id}課　${lesson.title}` }),
              h("p", { class: "lesson-score", text: `${earned}／${lesson.points}` }),
            ]);
          })),
        ]),
        h("section", { "aria-labelledby": "review-title" }, [
          h("h2", { id: "review-title", text: "逐題覆核" }),
          h("p", { class: "fine", text: "全部 40 題都會列出分數、正確答案和解釋。下方按鈕只負責跳到相關題目，不會收起任何一題。" }),
        ]),
        h("div", { class: "filter-row", role: "group", "aria-label": "跳到題目" }, filters.map(([id, label]) =>
          h("button", {
            class: state.filter === id ? "chip is-on" : "chip",
            type: "button",
            "data-action": "filter",
            "data-filter": id,
            "aria-pressed": state.filter === id ? "true" : "false",
            text: label,
          })
        )),
        h("div", { class: "review-list" }, graded.items.map((item, index) => renderReview(item, index))),
        h("div", { class: "actions" }, [
          h("button", { class: "btn btn-ghost", type: "button", "data-action": "print", text: "列印／儲存 PDF" }),
          h("button", { class: "btn btn-ghost", type: "button", "data-action": "home", text: "返回選卷" }),
          h("button", { class: "btn btn-primary", type: "button", "data-action": "restart", text: "重新開始" }),
        ]),
        h("p", { class: "fine", text: "解釋依《奇妙的世界》四上第 1 至 5 課的學習重點整理，供溫習對照。原創小幫手與任何商標角色無關。" }),
      ])
    );
    say(`成績 ${graded.earned} 分，滿分 100。全部 ${exam.questions.length} 題已列出分數、正確答案和解釋。`);
  }

  function reviewMatches(item, question) {
    if (state.filter === "all") return true;
    if (state.filter === "miss") return !item.ok;
    return String(question.lesson) === state.filter;
  }

  function gradedTarget(filter) {
    const graded = resultNow();
    const match = graded.items.find((item, index) => {
      const question = paper()[index];
      if (filter === "all") return index === 0;
      if (filter === "miss") return !item.ok;
      return String(question.lesson) === filter;
    });
    return match ? document.getElementById(`review-${match.id}`) : document.getElementById("review-title");
  }

  function renderReview(item, index) {
    const question = paper()[index];
    const lesson = lessonById(question.lesson);
    const status = item.ok ? "正確" : item.partial ? "部分正確" : "不正確";
    const statusClass = item.ok ? "is-ok" : item.partial ? "is-part" : "is-bad";
    const dim = state.filter !== "all" && !reviewMatches(item, question);
    const correctAnswer = question.type === "mcq"
      ? item.correctText
      : item.blanks.map((blank, blankIndex) => {
        const swap = blank.ok && blank.matchedModel !== blank.model ? "（次序可對調，已接受）" : "";
        return `第 ${blankIndex + 1} 格：${blank.model}${swap}`;
      }).join("；");
    return h("article", {
      class: `review card ${statusClass}${dim ? " is-dim" : ""}`,
      id: `review-${question.id}`,
    }, [
      h("div", { class: "review-top" }, [
        h("p", { class: "kicker", text: `題 ${index + 1}　·　${lessonLabel(question.lesson)}` }),
        h("p", { class: `status ${statusClass}`, text: status }),
      ]),
      h("h3", { text: question.stem }),
      h("dl", { class: "review-fields" }, [
        reviewField("分數", `${item.earned}／${item.max}`),
        reviewField("你的答案", item.givenText),
        reviewField("正確答案", correctAnswer),
        reviewField("解釋", `所屬${lesson.unit}第${lesson.id}課「${lesson.title}」。${question.explanation}`),
      ]),
      item.ok ? h("p", { class: "praise", text: "答得好！" }) : null,
    ]);
  }

  function reviewField(label, text) {
    return h("div", {}, [
      h("dt", { text: label }),
      h("dd", { text: text }),
    ]);
  }

  function refreshChrome() {
    const label = document.getElementById("answered-label");
    if (label) label.textContent = `已作答 ${answeredCount()}／${exam.questions.length}`;
    document.querySelectorAll("[data-jump]").forEach((button) => {
      const question = paper().find((item) => item.id === button.dataset.jump);
      button.classList.toggle("is-done", isAnswered(question));
      const index = paper().indexOf(question);
      button.setAttribute("aria-label", `第 ${index + 1} 題${isAnswered(question) ? "，已作答" : "，未作答"}`);
    });
    document.querySelectorAll(".choice").forEach((label) => {
      const input = label.querySelector("input");
      label.classList.toggle("is-selected", Boolean(input && input.checked));
    });
  }

  function goTo(index) {
    state.index = Math.max(0, Math.min(paper().length - 1, index));
    saveState();
    render();
    window.scrollTo(0, 0);
  }

  function ask(options) {
    modal.replaceChildren(
      h("form", { method: "dialog" }, [
        h("h2", { id: "modal-title", text: options.title }),
        h("p", { text: options.message }),
        h("div", { class: "modal-actions" }, [
          h("button", { class: "btn btn-ghost", value: "cancel", text: options.cancel }),
          h("button", { class: "btn btn-primary", value: "ok", text: options.ok }),
        ]),
      ])
    );
    if (modal.open) modal.close();
    modal.showModal();
    return new Promise((resolve) => {
      modal.addEventListener("close", () => resolve(modal.returnValue === "ok"), { once: true });
    });
  }

  async function submitExam() {
    const left = paper().length - answeredCount();
    const yes = await ask({
      title: "確定提交試卷？",
      message: left
        ? `還有 ${left} 題未作答，未答題目以 0 分計算。提交後會顯示總分，並逐題列出分數、正確答案和解釋。`
        : "提交後會顯示總分，並逐題列出分數、正確答案和解釋。不能再改這一次的答案。",
      ok: "提交",
      cancel: "返回檢查",
    });
    if (!yes) return;
    state.submitted = true;
    state.filter = "all";
    saveState();
    render();
    window.scrollTo(0, 0);
  }

  async function restart() {
    const yes = await ask({
      title: "重新開始？",
      message: "這會清除這部裝置上儲存的答案和分數。",
      ok: "清除並重考",
      cancel: "取消",
    });
    if (!yes) return;
    const fresh = blankState();
    Object.keys(state).forEach((key) => delete state[key]);
    Object.assign(state, fresh);
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      /* 忽略無法寫入的情況。 */
    }
    saveState();
    render();
    window.scrollTo(0, 0);
  }

  app.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button || button.hasAttribute("disabled")) return;
    const action = button.dataset.action;
    if (action === "start" || action === "resume" || action === "review") {
      beginPaper(button.dataset.paper || paperId, action);
    } else if (action === "home") {
      state.started = false;
      saveState();
      render();
      window.scrollTo(0, 0);
    } else if (action === "prev") goTo(state.index - 1);
    else if (action === "next") goTo(state.index + 1);
    else if (action === "jump") {
      const index = paper().findIndex((question) => question.id === button.dataset.jump);
      if (state.submitted) {
        const review = document.getElementById(`review-${button.dataset.jump}`);
        if (review) review.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (index >= 0) goTo(index);
    } else if (action === "submit") submitExam();
    else if (action === "restart") restart();
    else if (action === "print") window.print();
    else if (action === "filter") {
      state.filter = button.dataset.filter;
      saveState();
      render();
      const target = gradedTarget(state.filter);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  app.addEventListener("change", (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || !input.name.startsWith("choice-")) return;
    const id = input.name.slice("choice-".length);
    state.answers[id] = { choice: input.value };
    saveState();
    refreshChrome();
  });

  app.addEventListener("input", (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || !input.dataset.blank) return;
    const id = input.dataset.qid;
    const current = state.answers[id] || { blanks: {} };
    current.blanks = current.blanks || {};
    current.blanks[input.dataset.blank] = input.value;
    state.answers[id] = current;
    saveState();
    refreshChrome();
  });

  render();
})();
