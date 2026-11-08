/* 原創示意圖。不是課本掃描，也不是天文台官方標誌。 */
(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.ExamFigures = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function grid() {
    return `
      <svg viewBox="0 0 760 340" role="img" aria-label="簡化街道格網示意">
        <rect width="760" height="340" rx="16" fill="#f4fafc"/>
        <text x="230" y="32" text-anchor="middle" font-size="20" fill="#14384f">尖沙咀附近　格網示意</text>
        <text x="120" y="58" text-anchor="middle" font-size="20" fill="#14384f">A</text>
        <text x="230" y="58" text-anchor="middle" font-size="20" fill="#14384f">B</text>
        <text x="340" y="58" text-anchor="middle" font-size="20" fill="#14384f">C</text>
        <text x="42" y="112" font-size="20" fill="#14384f">1</text>
        <text x="42" y="192" font-size="20" fill="#14384f">2</text>
        <text x="42" y="272" font-size="20" fill="#14384f">3</text>
        <g stroke="#9eb4c4" stroke-width="2" fill="#fff">
          <rect x="70" y="70" width="110" height="70"/>
          <rect x="180" y="70" width="110" height="70"/>
          <rect x="290" y="70" width="110" height="70"/>
          <rect x="70" y="150" width="110" height="70"/>
          <rect x="180" y="150" width="110" height="70"/>
          <rect x="290" y="150" width="110" height="70"/>
          <rect x="70" y="230" width="110" height="70"/>
          <rect x="180" y="230" width="110" height="70"/>
          <rect x="290" y="230" width="110" height="70"/>
        </g>
        <rect x="104" y="84" width="36" height="36" rx="6" fill="#2f6f97"/>
        <polygon points="235,82 255,124 215,124" fill="#3d8b63"/>
        <polygon points="345,82 365,124 325,124" fill="#7a5ea7"/>
        <circle cx="125" cy="185" r="16" fill="#e0923a"/>
        <text x="560" y="78" text-anchor="middle" font-size="20" fill="#14384f">圖例</text>
        <rect x="470" y="108" width="24" height="24" rx="4" fill="#2f6f97"/>
        <text x="508" y="128" font-size="20" fill="#1c2430">海港城</text>
        <circle cx="482" cy="176" r="12" fill="#e0923a"/>
        <text x="508" y="184" font-size="20" fill="#1c2430">中港城</text>
        <polygon points="482,214 496,238 468,238" fill="#3d8b63"/>
        <text x="508" y="236" font-size="20" fill="#1c2430">新港中心</text>
        <polygon points="482,258 496,282 468,282" fill="#7a5ea7"/>
        <text x="508" y="280" font-size="20" fill="#1c2430">國際廣場</text>
      </svg>`;
  }

  function compass() {
    return `
      <svg viewBox="0 0 440 300" role="img" aria-label="九龍公園路線示意">
        <rect width="440" height="300" rx="16" fill="#f3faf4"/>
        <text x="220" y="32" text-anchor="middle" font-size="18" fill="#14384f">九龍公園考察路線示意</text>
        <g transform="translate(360,78)">
          <circle r="34" fill="#fff" stroke="#14384f" stroke-width="2"/>
          <polygon points="0,-26 7,0 0,-6 -7,0" fill="#14384f"/>
          <text y="-40" text-anchor="middle" font-size="16" fill="#14384f">北</text>
          <text y="52" text-anchor="middle" font-size="16" fill="#14384f">南</text>
          <text x="46" y="6" text-anchor="middle" font-size="16" fill="#14384f">東</text>
          <text x="-46" y="6" text-anchor="middle" font-size="16" fill="#14384f">西</text>
        </g>
        <circle cx="300" cy="170" r="28" fill="#fff" stroke="#14384f" stroke-width="2"/>
        <text x="300" y="166" text-anchor="middle" font-size="16" fill="#14384f">起點</text>
        <text x="300" y="186" text-anchor="middle" font-size="14" fill="#3d4a5c">出入口</text>
        <circle cx="120" cy="170" r="34" fill="#d9f0c9" stroke="#2f7d4a" stroke-width="2"/>
        <text x="120" y="166" text-anchor="middle" font-size="16" fill="#14384f">荷花池</text>
        <text x="120" y="186" text-anchor="middle" font-size="14" fill="#3d4a5c">蓮葉</text>
        <rect x="78" y="62" width="88" height="40" rx="10" fill="#fff4d6" stroke="#a97820" stroke-width="2"/>
        <text x="122" y="88" text-anchor="middle" font-size="16" fill="#14384f">樹木研習徑</text>
        <path d="M272 170 H160" fill="none" stroke="#14384f" stroke-width="3" stroke-dasharray="7 6"/>
        <path d="M120 136 V108" fill="none" stroke="#14384f" stroke-width="3" stroke-dasharray="7 6"/>
      </svg>`;
  }

  function mountains() {
    const rows = [
      ["鳳凰山", 934],
      ["大帽山", 957],
      ["獅子山", 495],
      ["飛鵝山", 602],
    ];
    const bars = rows
      .map((row, index) => {
        const width = Math.round((row[1] / 957) * 210);
        const y = 58 + index * 52;
        return `
          <text x="16" y="${y + 22}" font-size="16" fill="#1c2430">${row[0]}</text>
          <rect x="110" y="${y}" width="${width}" height="28" rx="6" fill="#3d7ea6"/>
          <text x="${118 + width}" y="${y + 20}" font-size="16" fill="#14384f">${row[1]}米</text>`;
      })
      .join("");
    return `
      <svg viewBox="0 0 420 290" role="img" aria-label="四座山峯高度棒形圖">
        <rect width="420" height="290" rx="16" fill="#f7fbfe"/>
        <text x="210" y="32" text-anchor="middle" font-size="18" fill="#14384f">課本列出的山峯高度</text>
        ${bars}
        <text x="210" y="270" text-anchor="middle" font-size="16" fill="#3d4a5c">高度（米）</text>
      </svg>`;
  }

  function seasons() {
    return `
      <svg viewBox="0 0 640 250" role="img" aria-label="四幅季節情景">
        <rect width="640" height="250" rx="16" fill="#f7fbfe"/>
        <g>
          <rect x="16" y="16" width="146" height="180" rx="12" fill="#e7f0f8" stroke="#9eb4c4"/>
          <text x="89" y="42" text-anchor="middle" font-size="18" fill="#14384f">圖A</text>
          <circle cx="70" cy="78" r="14" fill="#d9e6f2"/>
          <path d="M48 150c16-28 28-28 44 0" fill="#8fb4d4"/>
          <rect x="78" y="118" width="28" height="36" rx="8" fill="#24557a"/>
          <text x="89" y="214" text-anchor="middle" font-size="15" fill="#3d4a5c">厚衣　寒風</text>
        </g>
        <g>
          <rect x="170" y="16" width="146" height="180" rx="12" fill="#f4fbe9" stroke="#9eb4c4"/>
          <text x="243" y="42" text-anchor="middle" font-size="18" fill="#14384f">圖B</text>
          <circle cx="214" cy="86" r="10" fill="#f2b4c4"/>
          <circle cx="236" cy="74" r="8" fill="#f7d36a"/>
          <path d="M250 70 v28" stroke="#7aa0c4" stroke-width="3"/>
          <path d="M242 98 h20" stroke="#7aa0c4" stroke-width="3"/>
          <path d="M200 150 h70" stroke="#8d7355" stroke-width="4"/>
          <text x="243" y="214" text-anchor="middle" font-size="15" fill="#3d4a5c">細雨　花朵</text>
        </g>
        <g>
          <rect x="324" y="16" width="146" height="180" rx="12" fill="#fff6e8" stroke="#9eb4c4"/>
          <text x="397" y="42" text-anchor="middle" font-size="18" fill="#14384f">圖C</text>
          <path d="M360 150 l20-46 20 46z" fill="#e0a04a"/>
          <path d="M392 150 l16-34 16 34z" fill="#c4783a"/>
          <path d="M430 70 q16 10 8 24" fill="none" stroke="#d4653a" stroke-width="3"/>
          <text x="397" y="214" text-anchor="middle" font-size="15" fill="#3d4a5c">黃葉　風箏</text>
        </g>
        <g>
          <rect x="478" y="16" width="146" height="180" rx="12" fill="#e7f7ff" stroke="#9eb4c4"/>
          <text x="551" y="42" text-anchor="middle" font-size="18" fill="#14384f">圖D</text>
          <circle cx="530" cy="78" r="16" fill="#f2c14b"/>
          <path d="M520 130 q30 20 60 0" fill="none" stroke="#3d8eb5" stroke-width="4"/>
          <path d="M548 118 l16 8-16 8z" fill="#ef7d6b"/>
          <text x="551" y="214" text-anchor="middle" font-size="15" fill="#3d4a5c">烈日　海灘</text>
        </g>
      </svg>`;
  }

  function redRain() {
    return `
      <svg viewBox="0 0 280 220" role="img" aria-label="紅色暴雨示意標誌">
        <rect width="280" height="220" rx="16" fill="#f7fbfe"/>
        <rect x="70" y="28" width="140" height="140" rx="28" fill="#c5363a"/>
        <ellipse cx="140" cy="92" rx="38" ry="22" fill="#fff"/>
        <ellipse cx="116" cy="98" rx="22" ry="16" fill="#fff"/>
        <ellipse cx="164" cy="98" rx="22" ry="16" fill="#fff"/>
        <g stroke="#d7ecff" stroke-width="4" stroke-linecap="round">
          <path d="M112 126 l-8 22"/><path d="M128 126 l-8 22"/>
          <path d="M144 126 l-8 22"/><path d="M160 126 l-8 22"/>
          <path d="M176 126 l-8 22"/>
        </g>
        <text x="140" y="198" text-anchor="middle" font-size="16" fill="#3d4a5c">原創警告標誌</text>
      </svg>`;
  }

  function globe() {
    return `
      <svg viewBox="0 0 280 220" role="img" aria-label="地球表面示意">
        <rect width="280" height="220" rx="16" fill="#f7fbfe"/>
        <circle cx="140" cy="108" r="78" fill="#7eb7d8"/>
        <ellipse cx="118" cy="90" rx="28" ry="16" fill="#8fbf7a"/>
        <ellipse cx="156" cy="124" rx="34" ry="18" fill="#c2b07a"/>
        <ellipse cx="104" cy="128" rx="14" ry="10" fill="#8fbf7a"/>
        <text x="140" y="206" text-anchor="middle" font-size="16" fill="#3d4a5c">藍色部分代表海洋</text>
      </svg>`;
  }

  function environments() {
    return `
      <svg viewBox="0 0 640 230" role="img" aria-label="四種自然環境">
        <rect width="640" height="230" rx="16" fill="#f7fbfe"/>
        <g>
          <rect x="16" y="16" width="146" height="168" rx="12" fill="#e5f6e8" stroke="#9eb4c4"/>
          <text x="89" y="40" text-anchor="middle" font-size="18" fill="#14384f">圖A</text>
          <rect x="40" y="70" width="10" height="70" fill="#3f7d46"/>
          <circle cx="45" cy="64" r="16" fill="#1f6b3a"/>
          <rect x="70" y="84" width="10" height="56" fill="#3f7d46"/>
          <circle cx="75" cy="76" r="18" fill="#2e8a4e"/>
          <rect x="100" y="96" width="8" height="44" fill="#3f7d46"/>
          <circle cx="104" cy="90" r="14" fill="#17693a"/>
          <path d="M36 78 l6 14 M120 70 l6 16" stroke="#7eb7d8" stroke-width="3"/>
        </g>
        <g>
          <rect x="170" y="16" width="146" height="168" rx="12" fill="#eef5fb" stroke="#9eb4c4"/>
          <text x="243" y="40" text-anchor="middle" font-size="18" fill="#14384f">圖B</text>
          <path d="M190 150 l40-36 24 20 28-24 20 40z" fill="#f4f7fb" stroke="#9eb4c4"/>
          <circle cx="214" cy="78" r="10" fill="#d9e8f5"/>
          <rect x="250" y="96" width="26" height="16" rx="4" fill="#c5d7e8"/>
        </g>
        <g>
          <rect x="324" y="16" width="146" height="168" rx="12" fill="#f8f6df" stroke="#9eb4c4"/>
          <text x="397" y="40" text-anchor="middle" font-size="18" fill="#14384f">圖C</text>
          <path d="M344 150 h110" stroke="#8d7355" stroke-width="3"/>
          <path d="M352 150 c10-30 18-30 28 0" fill="#d2c15a"/>
          <path d="M386 150 c12-36 20-36 32 0" fill="#c6b44a"/>
          <path d="M424 150 c8-24 14-24 22 0" fill="#ddd07a"/>
          <circle cx="430" cy="72" r="12" fill="#f2c14b"/>
        </g>
        <g>
          <rect x="478" y="16" width="146" height="168" rx="12" fill="#fbf3df" stroke="#9eb4c4"/>
          <text x="551" y="40" text-anchor="middle" font-size="18" fill="#14384f">圖D</text>
          <circle cx="530" cy="72" r="16" fill="#f2c14b"/>
          <path d="M496 150 q28-28 56 0 q28-20 56 0 v20 h-112z" fill="#e6c98a"/>
          <path d="M508 132 q20-16 40 0" fill="#efd7a4"/>
        </g>
      </svg>`;
  }

  function resources() {
    return `
      <svg viewBox="0 0 640 230" role="img" aria-label="四類天然資源符號">
        <rect width="640" height="230" rx="16" fill="#f7fbfe"/>
        <g>
          <rect x="16" y="16" width="146" height="180" rx="12" fill="#e7f5fb" stroke="#9eb4c4"/>
          <text x="89" y="42" text-anchor="middle" font-size="18" fill="#14384f">圖A</text>
          <path d="M40 120 c20 10 30 10 50-8 c16 20 28 22 48 4" fill="none" stroke="#2f6f97" stroke-width="6" stroke-linecap="round"/>
          <path d="M48 146 c22 8 34 6 58-10" fill="none" stroke="#67a9cf" stroke-width="5" stroke-linecap="round"/>
        </g>
        <g>
          <rect x="170" y="16" width="146" height="180" rx="12" fill="#eef8ef" stroke="#9eb4c4"/>
          <text x="243" y="42" text-anchor="middle" font-size="18" fill="#14384f">圖B</text>
          <rect x="214" y="110" width="12" height="48" fill="#6b4a2b"/>
          <circle cx="220" cy="100" r="26" fill="#2f8a4a"/>
          <rect x="248" y="122" width="10" height="36" fill="#6b4a2b"/>
          <circle cx="253" cy="112" r="18" fill="#3e9a55"/>
        </g>
        <g>
          <rect x="324" y="16" width="146" height="180" rx="12" fill="#fff8ee" stroke="#9eb4c4"/>
          <text x="397" y="42" text-anchor="middle" font-size="18" fill="#14384f">圖C</text>
          <ellipse cx="392" cy="118" rx="36" ry="22" fill="#f4f1ea" stroke="#6d6256" stroke-width="2"/>
          <circle cx="424" cy="104" r="14" fill="#f4f1ea" stroke="#6d6256" stroke-width="2"/>
          <circle cx="429" cy="102" r="2" fill="#333"/>
          <path d="M418 96 l4-10 l6 8" fill="none" stroke="#6d6256" stroke-width="2"/>
          <path d="M368 128 l-10 8" stroke="#6d6256" stroke-width="3" stroke-linecap="round"/>
          <path d="M370 132 v22 M390 136 v22 M408 136 v22 M424 132 v22" stroke="#6d6256" stroke-width="3" stroke-linecap="round"/>
          <ellipse cx="378" cy="116" rx="7" ry="5" fill="#d9d3c7"/>
        </g>
        <g>
          <rect x="478" y="16" width="146" height="180" rx="12" fill="#f8f4ef" stroke="#9eb4c4"/>
          <text x="551" y="42" text-anchor="middle" font-size="18" fill="#14384f">圖D</text>
          <ellipse cx="528" cy="132" rx="14" ry="10" fill="#2b2b2b"/>
          <ellipse cx="548" cy="146" rx="16" ry="11" fill="#3a3a3a"/>
          <ellipse cx="566" cy="128" rx="12" ry="9" fill="#222"/>
          <rect x="584" y="112" width="26" height="40" rx="4" fill="#8a6232" stroke="#5c3e1e" stroke-width="2"/>
          <path d="M584 124h26M584 138h26" stroke="#5c3e1e" stroke-width="2"/>
          <path d="M597 104c4-12 12-12 8 2" fill="#222"/>
        </g>
      </svg>`;
  }

  return { grid, compass, mountains, seasons, redRain, globe, environments, resources };
});
