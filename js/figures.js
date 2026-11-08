/* 看圖題使用 assets 內的 PNG，不再內嵌 SVG。 */
(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.ExamFigures = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  return {
    grid: "assets/figure-grid.png",
    compass: "assets/figure-compass.png",
    mountains: "assets/figure-mountains.png",
    seasons: "assets/figure-seasons.png",
    redRain: "assets/figure-red-rain.png",
    globe: "assets/figure-globe.png",
    environments: "assets/figure-environments.png",
    resources: "assets/figure-resources.png",
  };
});
