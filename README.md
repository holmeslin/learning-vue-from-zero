[![CC BY-NC-ND 4.0](https://img.shields.io/badge/%E6%96%87%E5%AD%97-CC%20BY--NC--ND%204.0-blue)](https://creativecommons.org/licenses/by-nc-nd/4.0/deed.zh-hant)
[![CC0 1.0](https://img.shields.io/badge/%E7%A8%8B%E5%BC%8F%E7%A2%BC-CC0%201.0-blue)](https://creativecommons.org/publicdomain/zero/1.0/deed.zh-hant)
[![deployment](https://github.com/holmeslin/learning-vue-from-zero/actions/workflows/deploy.yml/badge.svg)](https://github.com/holmeslin/learning-vue-from-zero/actions/workflows/deploy.yml)

# 從零開始學 Vue

為完全沒寫過程式的人準備的 Vue 教學。從 JavaScript 的第一行程式碼開始，一路教到 Vue 3.5、Pinia、Vue Router、TypeScript、測試，以及 Nuxt。

請到[線上版](https://holmeslin.github.io/learning-vue-from-zero/zh-TW/)閱讀。

## 在本機建置

需要 [mdBook](https://rust-lang.github.io/mdBook/) 0.5.4 與 Node.js 24。

```bash
npm ci                 # 安裝檢查範例用的工具
npm run check          # 檢查所有程式碼範例的語法
npm run serve          # 在瀏覽器預覽，存檔後自動重新整理
npm run build          # 輸出到 zh-TW/book/
```

前言裡的 `vue-book-src.zip` 只在 CI 部署時產生，本機預覽點下去會找不到檔案，這是正常的。

部署流程在 `.github/workflows/deploy.yml`，推上 `main` 就會自動發布到 GitHub Pages。

## 貢獻

歡迎開 issue 回報錯誤或提出建議，也歡迎送 PR。詳見 [CONTRIBUTING.md](CONTRIBUTING.md)。寫作慣例與術語表在 [STYLE.md](STYLE.md)。

## 授權

除非另有標示，本教學的文字、圖片與其他非程式碼內容採用 [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/deed.zh-hant) 授權。

本教學中的程式碼範例以 [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/deed.zh-hant) 釋出，可以自由複製、修改與使用。

本教學的章節架構沿用同作者的[《從零開始學 React》](https://github.com/holmeslin/learning-react-from-zero)，最初參考 Andy Shiue 的[《從零開始學 Rust》](https://github.com/AndyShiue/learning-rust-from-zero)，內容全部重新撰寫。
