/* 評分：填充題可部分得分；英文大小寫、標點、簡體與常見同義詞會先正規化。 */
(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.ExamGrade = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const S2T = {
    图: "圖",
    网: "網",
    标: "標",
    岛: "島",
    龙: "龍",
    体: "體",
    疗: "療",
    粮: "糧",
    资: "資",
    气: "氣",
    极: "極",
    灾: "災",
    调: "調",
    东: "東",
    湾: "灣",
    陆: "陸",
    国: "國",
    门: "門",
    开: "開",
    为: "為",
    对: "對",
    与: "和",
    广: "廣",
    书: "書",
    学: "學",
    点: "點",
    线: "線",
    电: "電",
    车: "車",
    机: "機",
    场: "場",
    经: "經",
    过: "過",
    发: "發",
    现: "現",
    进: "進",
    运: "運",
    环: "環",
    质: "質",
    产: "產",
    矿: "礦",
    洁: "潔",
    节: "節",
    约: "約",
    阳: "陽",
    后: "後",
    云: "雲",
    台: "臺",
    里: "裡",
    卫: "衛",
    红: "紅",
    黄: "黃",
    温: "溫",
    带: "帶",
    热: "熱",
    湿: "濕",
    干: "乾",
  };

  function normalizeAnswer(value) {
    let text = String(value ?? "").trim().toLowerCase();
    text = text.replace(/[\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
    );
    text = text.replace(/[₂²₂]/g, "2");
    let mapped = "";
    for (const ch of text) mapped += S2T[ch] || ch;
    mapped = mapped.replace(/[\s\u3000]+/g, "");
    mapped = mapped.replace(/[，。、「」『』,.!！?？:：;；()（）【】[\]—\-－.．·・]/g, "");
    mapped = mapped.replace(/與/g, "和").replace(/及/g, "和");
    mapped = mapped.replace(/的$/g, "");
    return mapped;
  }

  function matches(input, blank) {
    const base = normalizeAnswer(input);
    if (!base) return false;
    const variants = [base];
    if (blank.strip && blank.strip.length) {
      let stripped = base;
      blank.strip.forEach((suffix) => {
        const token = normalizeAnswer(suffix);
        if (token && stripped.endsWith(token)) stripped = stripped.slice(0, -token.length);
      });
      variants.push(stripped);
    }
    const accepted = blank.accept.map(normalizeAnswer);
    return variants.some((item) => item && accepted.includes(item));
  }

  function permutations(list) {
    if (list.length <= 1) return [list.slice()];
    const output = [];
    list.forEach((item, index) => {
      const rest = list.slice(0, index).concat(list.slice(index + 1));
      permutations(rest).forEach((path) => output.push([item].concat(path)));
    });
    return output;
  }

  function gradeGroup(groupBlanks, given) {
    const sources = groupBlanks.map((blank) => ({
      id: blank.id,
      value: given[blank.id] ?? "",
    }));
    let best = null;
    permutations(sources).forEach((perm) => {
      let score = 0;
      const assign = perm.map((source, index) => {
        const slot = groupBlanks[index];
        const ok = matches(source.value, slot);
        if (ok) score += slot.points;
        return {
          sourceId: source.id,
          ok,
          model: slot.accept[0],
          points: slot.points,
        };
      });
      if (!best || score > best.score) best = { score, assign };
    });
    const bySource = {};
    best.assign.forEach((item) => {
      bySource[item.sourceId] = item;
    });
    return bySource;
  }

  function gradeQuestion(question, answer) {
    const response = answer || {};
    if (question.type === "mcq") {
      const correct = question.choices.find((choice) => choice.correct);
      const selected = question.choices.find((choice) => choice.id === response.choice);
      const ok = Boolean(selected && selected.correct);
      return {
        earned: ok ? question.points : 0,
        max: question.points,
        ok,
        partial: false,
        givenText: selected ? `${selected.id}. ${selected.text}` : "（未作答）",
        correctText: `${correct.id}. ${correct.text}`,
        blanks: [],
      };
    }

    const given = response.blanks || {};
    const groups = new Map();
    question.blanks.forEach((blank) => {
      const key = blank.group || `solo:${blank.id}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(blank);
    });
    const judged = {};
    groups.forEach((groupBlanks) => {
      Object.assign(judged, gradeGroup(groupBlanks, given));
    });

    const blanks = question.blanks.map((blank) => {
      const result = judged[blank.id];
      const earned = result && result.ok ? result.points : 0;
      const raw = String(given[blank.id] ?? "").trim();
      return {
        id: blank.id,
        given: raw || "（未作答）",
        ok: Boolean(result && result.ok),
        model: blank.accept[0],
        matchedModel: result ? result.model : blank.accept[0],
        points: blank.points,
        earned,
      };
    });
    const earned = blanks.reduce((sum, blank) => sum + blank.earned, 0);
    const max = blanks.reduce((sum, blank) => sum + blank.points, 0);
    return {
      earned,
      max,
      ok: earned === max,
      partial: earned > 0 && earned < max,
      givenText: blanks.map((blank) => blank.given).join("、"),
      correctText: blanks.map((blank) => blank.model).join("、"),
      blanks,
    };
  }

  function gradeExam(questions, answers) {
    const items = questions.map((question) => ({
      id: question.id,
      lesson: question.lesson,
      ...gradeQuestion(question, answers[question.id]),
    }));
    const earned = items.reduce((sum, item) => sum + item.earned, 0);
    const max = items.reduce((sum, item) => sum + item.max, 0);
    return { earned, max, items };
  }

  function maxPoints(question) {
    if (question.type === "fill") {
      return question.blanks.reduce((sum, blank) => sum + blank.points, 0);
    }
    return question.points;
  }

  return { normalizeAnswer, gradeQuestion, gradeExam, maxPoints };
});
