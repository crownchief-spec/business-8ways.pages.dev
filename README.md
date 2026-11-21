# 小巴老師商業攝影

正式網站：https://business.8-ways.com/

建置：`npm run build`。部署目錄只用 `dist/`。檢查：`npm run check`。

作品來源：`content/brand-portfolio/YYYY-MM-DD 中文案件/article.md`，JSON frontmatter 與 Markdown 內文；公開網址取自 slug，維持 `/works/slug/`。每案的 WebP 與縮圖放在該資料夾 `photos/`，不含原始檔。

網站、分類與指南：`content/brand-data/site.json`；影片逐支縮圖及分類：`content/brand-data/videos.json`。影片一律點選才播放、同時一支並可關閉。

不公開：內容來源、腳本、報告、原始素材與 Git。舊資料保留在版本庫作遷移參考，不作公開部署。
