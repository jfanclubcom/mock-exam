# 四年級人文科模擬測驗

小學四年級上學期《奇妙的世界》互動溫習頁，範圍只包括：

- 單元一　環境與氣候：第1課小小考察隊、第2課漫遊香港、第3課香港的氣候
- 單元二　地球是我家：第4課發現地球、第5課地球生病了

純靜態網頁（HTML、CSS、JavaScript），無須建置步驟。載入後可離線作答。適合 iPad 的 Safari。

## 網址

https://jfanclubcom.github.io/mock-exam/

## 在 iPad 開啟

1. 用 Safari 輸入上面的網址。
2. 若暫時打不開，先完成下方 GitHub Pages 設定，等一兩分鐘再重新整理。
3. 點分享按鈕，選「加入主畫面」，之後可像 App 一樣開啟。
4. 直向或橫向都可以。按鈕較大，正文不小於 18px，無須靠滑鼠懸停。
5. 答案只儲存在這部 iPad 的瀏覽器，不會上傳。要重考就按「重新開始」。

## 啟用 GitHub Pages

`index.html` 在儲存庫根目錄。

建議做法：

1. 打開本儲存庫的 **Settings → Pages**。
2. **Build and deployment** 的 Source 選 **Deploy from a branch**。
3. Branch 選 `main`，資料夾選 **`/ (root)`**，按 Save。
4. 頁面上方會顯示：https://jfanclubcom.github.io/mock-exam/

另一做法：Source 改選 **GitHub Actions**。儲存庫已附 `.github/workflows/pages.yml`，推送到 `main` 後會發佈同一批檔案。Pages 只會使用你選定的一種來源。

若這個環境的權限不能代為打開 Pages 開關，合併到 `main` 之後仍須在 Settings 按一次 Save。

## 本地預覽

```bash
python3 -m http.server 8080
```

然後用瀏覽器打開 http://localhost:8080 。不要直接以檔案方式打開，否則部分瀏覽器會限制本地腳本。

## 測驗內容

- 40 題，滿分 100，不限時，顯示「題 X／40」。
- 每課 8 題、20 分。
- 題型：不供詞填充、選擇、生活情境、看圖辨別、時事。
- 提交後顯示總分。全部 40 題都會列出分數、正確答案和解釋，並註明所屬課次。覆核不能收起。
- 選擇題的干擾項與正確答案屬於同一課題，不能靠明顯笑話排除。
- 看圖和吉祥物使用 `assets/` 內的 PNG。
- 填充題每格計分；比對時不分大小寫，並接受列出的常見同義詞、簡體和標點差異。
- 小幫手「豆豆」「栗子」和所有插圖都是原創，不是商標角色、課本掃描或官方天氣標誌。

## 檔案

| 檔案 | 用途 |
| --- | --- |
| `index.html` | 頁面 |
| `css/styles.css` | 樣式 |
| `js/questions.js` | 題目與接受答案 |
| `js/grade.js` | 評分 |
| `js/figures.js` | 看圖 PNG 路徑 |
| `js/app.js` | 介面與本地儲存 |
| `assets/` | 吉祥物、圖示和題目 PNG |
| `tests/check-exam.js` | 題數、分數和同義詞檢查 |

檢查題目可以執行 `node tests/check-exam.js`。
