import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

const root = process.cwd();
const readDir = (p) => fs.readdir(path.join(root, p));
const read = (p) => fs.readFile(path.join(root, p), "utf8");
const write = async (p, content) => {
  const full = path.join(root, p);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, content);
};

const contact = {
  lineId: "0911252302",
  phone: "0911252302",
  whatsapp: "+886 911252302",
  email: "crownchief@gmail.com",
  facebook: "https://facebook.com/benson.tw",
  instagram: "https://instagram.com/travel.photo.tw"
};

const nav = `
<header><div class="container nav"><a class="brand" href="/">小巴老師商業攝影</a>
<button class="mobile-toggle" data-mobile-toggle>選單</button>
<nav class="menu">
<a href="/">首頁</a>
<a href="/services/commercial-photography/">商業攝影總覽</a>
<a href="/services/hotel-photography/">飯店民宿攝影</a>
<a href="/services/event-photography/">活動會議攝影</a>
<a href="/services/travel-promotion-photography/">旅遊宣傳攝影</a>
<a href="/services/food-commercial-video/">餐飲廣告微電影</a>
<a href="/services/aerial-photography/">空拍攝影</a>
<a href="/works/">作品案例</a>
<a href="/about/">攝影團隊</a>
<a href="/clients/">客戶專區</a>
<a href="/articles/">商業攝影文章</a>
<a class="cta" href="https://line.me/ti/p/~${contact.lineId}">加 Line 詢價</a>
</nav></div></header>`;

const footer = `
<footer><div class="container footer-grid">
<div><h3>商業攝影文章</h3><p><a href="/articles/?category=hotel">飯店攝影文章</a><br><a href="/articles/?category=event">活動會議攝影文章</a><br><a href="/articles/?category=food">餐飲攝影文章</a><br><a href="/articles/commercial-photography-pricing-guide/">商業攝影報價指南</a></p></div>
<div><h3>作品案例</h3><p><a href="/works/">商業攝影作品</a><br><a href="/works/?category=hotel">飯店民宿作品</a><br><a href="/works/?category=event">活動會議作品</a><br><a href="/works/?category=aerial">空拍作品</a></p></div>
<div><h3>客戶專區</h3><p><a href="/clients/">客戶專區首頁</a><br><a href="/contact/">聯絡我們</a><br><a href="/sitemap/">網站地圖</a></p></div>
<div><h3>聯絡方式</h3><p>Line ID：${contact.lineId}<br>電話：${contact.phone}<br>WhatsApp：${contact.whatsapp}<br>Email：${contact.email}<br>八威創意有限公司<br>小巴老師攝影團隊</p></div>
</div></footer>`;

const shell = ({ title, description, canonical, ogImage = "/assets/placeholders/cover.svg", body, bodyClass = "", schema = "" }) => `<!doctype html><html lang="zh-Hant"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><meta name="description" content="${description}"><link rel="canonical" href="${canonical}"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:image" content="${ogImage}"><meta property="og:url" content="${canonical}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${ogImage}"><link rel="stylesheet" href="/public/css/site.css"></head><body${bodyClass ? ` class="${bodyClass}"` : ""}>${nav}<main>${body}</main>${footer}<div class="lightbox"><img src="" alt=""></div><script src="/public/js/site.js"></script>${schema}</body></html>`;

const toHtml = (md) => marked.parse(md);

const loadCollection = async (dir) => {
  const files = (await readDir(dir)).filter((f) => f.endsWith(".md"));
  const items = [];
  for (const file of files) {
    const raw = await read(`${dir}/${file}`);
    const parsed = matter(raw);
    items.push({ ...parsed.data, content: parsed.content });
  }
  return items;
};

const works = await loadCollection("src/content/works");
const articles = await loadCollection("src/content/articles");
const clients = await loadCollection("src/content/clients");
let media = [];
let videos = [];
try { media = JSON.parse(await read("src/data/legacy-commercial-media.json")); } catch {}
try { videos = JSON.parse(await read("src/data/legacy-commercial-videos.json")); } catch {}

const firstImagesBySlug = media.reduce((acc, m) => { if (!acc[m.sourcePageSlug]) acc[m.sourcePageSlug] = []; acc[m.sourcePageSlug].push(m.localPath); return acc; }, {});

const eventPricingSection = (lineId) => `<section class="section container pricing-section"><h2>方案與價格</h2>
<p class="pricing-intro">以下方案皆以 3 小時活動為基準，另含活動前進場準備約 1 小時，總共保留 4 小時服務時間。可依活動內容單選，也可以搭配拍照＋錄影／拍照＋精華短片製作。</p>
<div class="grid pricing-cards">
<article class="card plan-card-compact"><div class="plan-card-head"><h3 class="plan-name">全程活動拍照</h3><p class="plan-price">NT$8,800 未稅</p></div>
<p class="plan-meta"><span class="plan-label">內容</span>3 小時活動拍攝｜至少 200 張｜基礎調色｜雲端交件</p>
<p class="plan-meta"><span class="plan-label">適合</span>活動紀錄、新聞稿、結案報告、社群照片</p></article>
<article class="card plan-card-compact"><div class="plan-card-head"><h3 class="plan-name">舞台全程錄影｜多機固定拍攝</h3><p class="plan-price">NT$8,800 未稅</p></div>
<p class="plan-meta"><span class="plan-label">內容</span>3 機同步拍攝｜固定對準舞台｜完整記錄流程與聲音</p>
<p class="plan-meta"><span class="plan-label">適合</span>講座、致詞、表演、頒獎、內部存檔</p></article>
<article class="card plan-card-compact"><div class="plan-card-head"><h3 class="plan-name">精華短片製作｜社群宣傳影片</h3><p class="plan-price">NT$8,800 未稅</p></div>
<p class="plan-meta"><span class="plan-label">內容</span>攝影師手持移動拍攝｜剪輯成約 2–5 分鐘影片</p>
<p class="plan-meta"><span class="plan-label">適合</span>品牌曝光、活動回顧、社群分享、形象宣傳</p></article>
</div>
<div class="compare-section"><h3 class="compare-title">全程錄影與精華短片差在哪？</h3>
<p class="compare-lead">簡單來說：全程錄影重點是「完整度」，適合完整保存活動內容；精華短片重點是「精彩度」，適合社群分享與品牌曝光。</p>
<div class="compare-cards">
<article class="card compare-card"><h4>舞台全程錄影</h4>
<p><span class="plan-label">重點</span>完整記錄</p>
<p><span class="plan-label">拍法</span>3 機固定拍攝，主要對準舞台</p>
<p><span class="plan-label">內容</span>致詞、講座、表演、頒獎完整保留</p>
<p><span class="plan-label">適合</span>內部存檔、會後回看、完整紀錄</p></article>
<article class="card compare-card"><h4>精華短片製作</h4>
<p><span class="plan-label">重點</span>精彩呈現</p>
<p><span class="plan-label">拍法</span>攝影師手持移動，捕捉不同角度</p>
<p><span class="plan-label">內容</span>台上台下、互動、佈置、活動氛圍</p>
<p><span class="plan-label">適合</span>社群分享、品牌曝光、活動回顧</p></article>
</div>
<p class="compare-note">精華短片不是全程錄影的剪短版，而是用不同拍攝方式製作的活動形象影片。</p></div>
<div class="pricing-cta"><p>不知道該選拍照、全程錄影還是精華短片？告訴我們活動類型、時間、地點與用途，我們可以協助建議最適合的拍攝組合。</p><a class="btn primary" href="https://line.me/ti/p/~${lineId}">加 Line 詢問適合方案</a></div>
</section>`;

const servicePage = (conf) => shell({
  title: conf.title,
  description: conf.description,
  canonical: `https://business-8ways.pages.dev${conf.path}`,
  ogImage: conf.ogImage || "/assets/placeholders/cover.svg",
  bodyClass: conf.bodyClass || "",
  body: `${conf.heroIntro ? `<section class="hero container hero-event"><h1>${conf.h1}</h1><p class="hero-intro">${conf.heroIntro}</p><div class="actions actions-compact"><a class="btn primary" href="https://line.me/ti/p/~${contact.lineId}">加 Line 詢價</a><a class="btn" href="/works/">查看作品案例</a><a class="btn" href="tel:${contact.phone}">撥打電話</a></div></section>` : `<section class="hero container"><h1>${conf.h1}</h1><p>${conf.hero}</p><div class="actions"><a class="btn primary" href="https://line.me/ti/p/~${contact.lineId}">加 Line 詢價</a><a class="btn" href="/works/">查看作品案例</a><a class="btn" href="tel:${contact.phone}">撥打電話</a></div></section>`}
${conf.skipPoints ? "" : `<section class="section container"><h2>服務重點</h2><div class="grid cards">${conf.points.map((p) => `<article class="card">${p}</article>`).join("")}</div></section>`}
${conf.pricingSection ? conf.pricingSection : conf.pricing ? `<section class="section container"><h2>方案與價格</h2><div class="grid cards">${conf.pricing.map((p) => `<article class="card"><h3>${p.name}</h3><p>${p.price}</p><p>${p.detail}</p></article>`).join("")}</div></section>` : ""}
<section class="section container"><h2>代表影片</h2><div class="video-grid">${videos.slice(0, 6).map((v) => `<article class="card video-card"><h3>${v.title || "作品影片"}</h3><iframe src="https://www.youtube.com/embed/${v.youtubeId || "dQw4w9WgXcQ"}" allowfullscreen title="${v.title || "影片"}"></iframe></article>`).join("")}</div></section>
<section class="section container"><h2>作品圖牆</h2><div class="masonry">${(firstImagesBySlug[conf.slug] || ["/assets/placeholders/cover.svg","/assets/placeholders/cover.svg","/assets/placeholders/cover.svg"]).slice(0,12).map((img) => `<img src="${img}" alt="${conf.h1} 作品圖片" data-lightbox-src="${img}">`).join("")}</div></section>
<section class="section container"><h2>需要商業攝影報價嗎？</h2><p>請提供拍攝類型、地點、日期、需要照片或影片、預計用途，我們可以先協助評估拍攝內容與報價。</p><div class="actions"><a class="btn primary" href="https://line.me/ti/p/~${contact.lineId}">加 Line 詢價</a><a class="btn" href="/works/">查看作品案例</a><a class="btn" href="tel:${contact.phone}">撥打電話</a></div></section>`
});

await write("index.html", shell({
  title: "商業攝影服務｜飯店・民宿・活動會議・餐飲・旅遊宣傳・空拍｜小巴老師攝影團隊",
  description: "小巴老師攝影團隊提供飯店、民宿、露營區、企業活動、會議紀錄、餐飲廣告、旅遊業宣傳與空拍攝影服務。",
  canonical: "https://business-8ways.pages.dev/",
  body: `<section class="hero container"><h1>商業攝影服務｜飯店・民宿・活動會議・餐飲・旅遊宣傳・空拍</h1><p>小巴老師攝影團隊提供飯店、民宿、露營區、企業活動、會議紀錄、餐飲廣告、旅遊業宣傳與空拍攝影服務。15 年全職攝影經驗，協助企業把影像直接用在官網、訂房平台、社群與廣告素材。</p><div class="actions"><a class="btn primary" href="/services/commercial-photography/">查看服務方案</a><a class="btn" href="/works/">查看作品案例</a><a class="btn" href="https://line.me/ti/p/~${contact.lineId}">加 Line 詢價</a></div></section>
<section class="section container"><h2>服務分類卡片</h2><div class="grid cards"><a class="card" href="/services/hotel-photography/">飯店・民宿・露營區攝影</a><a class="card" href="/services/event-photography/">活動會議攝影</a><a class="card" href="/services/travel-promotion-photography/">旅遊業宣傳攝影</a><a class="card" href="/services/food-commercial-video/">餐飲業廣告 / 微電影</a><a class="card" href="/services/aerial-photography/">空拍攝影</a><a class="card" href="/works/">商業攝影作品案例</a></div></section>
<section class="section container"><h2>代表作品精選</h2><div class="grid cards">${works.slice(0,9).map((w)=>`<article class="card"><img src="${w.coverImage}" alt="${w.title}" style="width:100%;border-radius:10px"><h3>${w.title}</h3><p>${w.excerpt || ""}</p><a href="/works/${w.slug}/">查看作品</a></article>`).join("")}</div></section>
<section class="section container"><h2>合作品牌與經歷</h2><p>希爾頓、喜來登、日本星野集團、香格里拉、福容飯店、台南老爺、華碩、富邦、劍湖山、新社古堡、那一村、翩翩泰安、水映親子露營區、半島秘境、八方雲集、弘爺漢堡。</p></section>
<section class="section container"><h2>為什麼選擇我們</h2><div class="grid cards"><article class="card">15 年全職商業攝影經驗</article><article class="card">熟悉飯店、旅宿、活動、餐飲與旅遊產業需求</article><article class="card">照片與影片可一次規劃</article><article class="card">可支援空拍、活動多機錄影、精華影片、情境模特拍攝</article></div></section>
<section class="section container"><h2>拍攝流程</h2><ol><li>Line / 電話詢問</li><li>提供需求與用途</li><li>初步建議與報價</li><li>拍攝前溝通腳本與流程</li><li>拍攝執行</li><li>後製調色剪輯</li><li>雲端交件</li></ol></section>
<section class="section container"><h2>最新 SEO 文章</h2><div class="grid cards">${articles.slice(0,3).map((a)=>`<article class="card"><h3>${a.title}</h3><p>${a.description}</p><a href="/articles/${a.slug}/">閱讀文章</a></article>`).join("")}</div></section>
<section class="section container"><h2>需要商業攝影報價嗎？</h2><p>請提供拍攝產業、地點、預計日期、需要照片或影片，我們可以先協助評估拍攝內容與報價。</p><a class="btn primary" href="https://line.me/ti/p/~${contact.lineId}">加 Line 詢價</a></section>`
}));

const servicesConfig = [
  { slug: "commercial-photography", path: "/services/commercial-photography/", title: "商業攝影總覽｜小巴老師攝影團隊", h1: "商業攝影總覽", hero: "15 年全職商業攝影與影片團隊，服務飯店、餐飲、空拍、活動與旅遊宣傳。", description: "商業攝影總覽頁，涵蓋飯店、活動、旅遊、餐飲、空拍等服務。", points:["15 年全職攝影團隊","合作品牌含希爾頓、喜來登、華碩、富邦、劍湖山","50 趟以上海外工作拍攝行程","可整合地面攝影、空拍與影片製作"] },
  { slug: "hotel", path: "/services/hotel-photography/", title: "飯店攝影・民宿攝影・露營區攝影｜房型照・空拍・形象影片｜小巴老師攝影", h1: "飯店・民宿・露營區攝影方案", hero: "專為住宿產業規劃房型照、公共空間、餐飲、情境模特、空拍與形象影片，可一次完成官網、訂房平台與社群素材。", description: "飯店民宿露營區攝影服務，強調訂房轉換與商業用途。", points:["提升訂房率與品牌質感","房型與公共空間完整呈現","照片與影片一次到位","熟悉 Agoda / Booking / 官網 / 社群需求"], pricing:[{name:"全天拍攝方案（8 小時）",price:"NT$18,800 未稅",detail:"適合新開幕、全面更新、度假型飯店與露營區形象重拍"},{name:"半天拍攝方案（4 小時）",price:"NT$10,800 未稅",detail:"適合局部更新、房型補拍、餐點或公共空間補拍"},{name:"影片製作",price:"每支 NT$4,800–8,800 未稅",detail:"可依官網、IG、YouTube、訂房平台用途輸出"}] },
  { slug: "event", path: "/services/event-photography/", bodyClass: "page-event", title: "活動攝影・會議紀錄・企業活動錄影｜照片・精華影片・多機全程錄影", h1: "活動攝影 / 會議紀錄服務", heroIntro: "15 年商業攝影經驗，擅長大型活動、企業論壇、研討會、品牌發表與舞台活動紀錄。合作過百家企業與品牌，提供活動拍照、舞台全程錄影與精華短片製作，協助客戶完成內部紀錄、結案報告與社群曝光。", skipPoints: true, description: "活動會議攝影服務，含拍照、精華影片、多機全程錄影。", points: [], pricingSection: eventPricingSection(contact.lineId) },
  { slug: "travel", path: "/services/travel-promotion-photography/", title: "旅遊業宣傳攝影｜滑雪・遊樂園・遊艇・水上活動・度假村形象影片", h1: "旅遊業宣傳攝影", hero: "拍攝涵蓋滑雪、水下潛水、遊艇空拍、遊樂園、度假村形象，半天至一週可彈性安排。", description: "旅遊業宣傳攝影與影片服務。", points:["滑雪與雪場形象內容","度假村與星野集團場景拍攝","遊艇包船與水上活動紀錄","休閒運動品牌情境攝影"] },
  { slug: "food", path: "/services/food-commercial-video/", title: "餐飲攝影・美食攝影・餐廳形象影片｜廣告照片・微電影・社群短影音", h1: "餐飲業廣告 / 微電影", hero: "以電影手法製作餐飲商業宣傳內容，整合餐點、空間與人物情境，支援社群短影音與品牌形象片。", description: "餐飲業商業攝影與微電影服務。", points:["餐廳空間與品牌氛圍","餐點美食精緻拍攝","人物用餐情境","酒吧、餐酒館、親子餐廳、鍋物、咖啡廳"] },
  { slug: "aerial", path: "/services/aerial-photography/", title: "空拍攝影服務｜飯店空拍・活動空拍・旅遊宣傳空拍｜小巴老師攝影", h1: "空拍攝影服務", hero: "依拍攝需求使用合適空拍機與地面設備，重點放在構圖、安全、運鏡與商業用途。", description: "飯店、活動、旅遊宣傳與露營區空拍服務。", points:["台灣飯店與旅遊業空拍實務","避開雜物與干擾畫面","官網首頁與訂房平台主圖用途","活動規模呈現與品牌開場鏡頭"] }
];

for (const s of servicesConfig) await write(`${s.path.slice(1)}index.html`, servicePage(s));

await write("about/index.html", shell({ title: "關於我們｜小巴老師攝影團隊", description: "15 年商業攝影團隊介紹。", canonical: "https://business-8ways.pages.dev/about/", body: `<section class="hero container"><h1>關於我們 / 攝影團隊</h1><p>小巴老師攝影團隊長期服務商業攝影市場，累積飯店、活動、旅遊、餐飲與空拍實戰，並有多國拍攝經驗。</p></section>` }));

await write("contact/index.html", shell({ title: "聯絡詢價｜小巴老師攝影團隊", description: "商業攝影詢價與需求溝通。", canonical: "https://business-8ways.pages.dev/contact/", body: `<section class="hero container"><h1>聯絡詢價</h1><p>Line / 電話：${contact.phone}<br>WhatsApp：${contact.whatsapp}<br>Email：${contact.email}<br>Facebook：${contact.facebook}<br>IG：${contact.instagram}</p><div class="actions"><a class="btn primary" href="https://line.me/ti/p/~${contact.lineId}">加 Line 詢價</a><a class="btn" href="tel:${contact.phone}">撥打電話</a></div></section>` }));

await write("works/index.html", shell({
  title: "商業攝影作品案例｜小巴老師攝影團隊",
  description: "飯店、活動、旅遊、餐飲、空拍商業攝影作品。",
  canonical: "https://business-8ways.pages.dev/works/",
  body: `<section class="hero container"><h1>商業攝影作品案例</h1><p>依產業與需求整理作品案例，支援飯店民宿、活動會議、旅遊宣傳、餐飲與空拍。</p><div class="actions"><button class="btn" data-filter="all">全部</button><button class="btn" data-filter="飯店">飯店 / 民宿 / 露營區</button><button class="btn" data-filter="活動">活動會議</button><button class="btn" data-filter="旅遊">旅遊業</button><button class="btn" data-filter="餐飲">餐飲業</button><button class="btn" data-filter="空拍">空拍</button></div></section><section class="section container"><div class="grid cards">${works.map((w)=>`<article class="card" data-item-category="${w.category}"><img src="${w.coverImage}" alt="${w.title}" style="width:100%;border-radius:10px"><h3>${w.title}</h3><p>${w.category}｜${w.client}</p><p>${w.excerpt||""}</p><a href="/works/${w.slug}/">查看作品</a></article>`).join("")}</div></section>`
}));

for (const w of works) {
  await write(`works/${w.slug}/index.html`, shell({
    title: `${w.title}｜商業攝影作品案例`,
    description: w.excerpt || `${w.title} 商業攝影案例。`,
    canonical: `https://business-8ways.pages.dev/works/${w.slug}/`,
    ogImage: w.coverImage,
    body: `<section class="hero container"><h1>${w.title}</h1><p>${w.excerpt || ""}</p><p>${w.category}｜${w.client}｜${w.industry}</p></section>
<section class="section container"><h2>影片區</h2>${(w.youtube||[]).map((v)=>`<article class="card video-card"><h3>${v.title}</h3><iframe src="https://www.youtube.com/embed/${v.id || "dQw4w9WgXcQ"}" title="${v.title}" allowfullscreen></iframe></article>`).join("")}</section>
<section class="section container"><h2>圖片作品</h2><div class="masonry">${(w.gallery||[w.coverImage]).map((img)=>`<img src="${img}" alt="${w.category}｜${w.title}" data-lightbox-src="${img}">`).join("")}</div></section>
<section class="section container">${toHtml(w.content)}</section>
<section class="section container"><h2>相關作品</h2><div class="grid cards">${works.filter((x)=>x.slug!==w.slug).slice(0,3).map((x)=>`<article class="card"><h3>${x.title}</h3><a href="/works/${x.slug}/">查看作品</a></article>`).join("")}</div></section>`
  }));
}

await write("articles/index.html", shell({ title:"商業攝影文章｜SEO 內容中心", description:"飯店、活動、餐飲、旅遊與空拍攝影文章。", canonical:"https://business-8ways.pages.dev/articles/", body:`<section class="hero container"><h1>商業攝影文章</h1><p>整理拍攝規劃、報價與素材策略，作為企業與品牌決策參考。</p></section><section class="section container"><div class="actions"><button class="btn" data-filter="all">全部</button>${[...new Set(articles.map(a=>a.category))].map((c)=>`<button class="btn" data-filter="${c}">${c}</button>`).join("")}</div><div class="grid cards">${articles.map((a)=>`<article class="card" data-item-category="${a.category}"><h3>${a.title}</h3><p>${a.description}</p><a href="/articles/${a.slug}/">閱讀文章</a></article>`).join("")}</div></section>` }));

for (const a of articles) {
  await write(`articles/${a.slug}/index.html`, shell({ title: `${a.title}｜商業攝影文章`, description: a.description, canonical:`https://business-8ways.pages.dev/articles/${a.slug}/`, ogImage:a.coverImage, body:`<section class="hero container"><h1>${a.title}</h1><p>${a.description}</p></section><section class="section container">${toHtml(a.content)}</section><section class="section container"><h2>相關服務</h2><div class="actions"><a class="btn primary" href="/contact/">聯絡詢價</a><a class="btn" href="/services/commercial-photography/">查看服務總覽</a></div></section>` }));
}

await write("clients/index.html", shell({ title:"客戶專區｜交件與下載入口", description:"完成拍攝的客戶可由此頁進入專屬交件頁。", canonical:"https://business-8ways.pages.dev/clients/", body:`<section class="hero container"><h1>客戶專區</h1><p>完成拍攝的客戶可從此頁進入專屬交件頁，查看照片、影片與下載連結。</p></section><section class="section container"><div class="grid cards">${clients.map((c)=>`<article class="card"><h3>${c.clientName}</h3><p>${c.projectType}</p><a href="/clients/${c.slug}/">進入交件頁</a></article>`).join("")}</div></section>` }));

for (const c of clients) {
  await write(`clients/${c.slug}/index.html`, shell({ title:`${c.title}｜客戶專區`, description:c.notes || "客戶交件頁", canonical:`https://business-8ways.pages.dev/clients/${c.slug}/`, ogImage:c.coverImage, body:`<section class="hero container"><h1>${c.title}</h1><p>此頁為簡易靜態密碼門面示範，正式保密請改用 Cloudflare Access 或 Workers。</p></section><section class="section container"><div class="card"><label>請輸入密碼：<input id="pwd" type="password"></label><button class="btn" onclick="unlockClient()">查看內容</button><div id="clientBox" style="display:none"><p>客戶：${c.clientName}</p><p>拍攝日期：${c.shootDate}</p>${(c.downloadLinks||[]).map((d)=>`<p><a href="${d.url}">${d.title}</a></p>`).join("")}<p>${c.notes||""}</p></div></div></section><script>function unlockClient(){const v=document.getElementById('pwd').value;if(v==='${c.password}'){document.getElementById('clientBox').style.display='block';}else{alert('密碼錯誤');}}</script>` }));
}

await write("sitemap/index.html", shell({ title:"網站地圖", description:"商業攝影專站網站地圖。", canonical:"https://business-8ways.pages.dev/sitemap/", body:`<section class="hero container"><h1>網站地圖</h1><div class="card"><p><a href="/">首頁</a><br><a href="/services/commercial-photography/">商業攝影服務</a><br><a href="/works/">作品案例</a><br><a href="/articles/">商業攝影文章</a><br><a href="/clients/">客戶專區</a><br><a href="/about/">關於我們</a><br><a href="/contact/">聯絡詢價</a></p></div></section>` }));

await write("llms.txt", `Site: business-8ways.pages.dev\nMain services:\n- /services/commercial-photography/\n- /services/hotel-photography/\n- /services/event-photography/\n- /services/travel-promotion-photography/\n- /services/food-commercial-video/\n- /services/aerial-photography/\nSystems:\n- Works: /works/ and /works/{slug}/\n- Articles: /articles/ and /articles/{slug}/\n- Clients: /clients/ and /clients/{slug}/\nContact:\nLine/Phone 0911252302, WhatsApp +886 911252302, Email crownchief@gmail.com\n`);
await write("ai.txt", `AI discovery for business-8ways commercial photography website.\nPrimary navigation: home, services, works, clients, articles, about, contact.\nUse /works/ for case studies and /articles/ for SEO guidance content.\nFor quotation direct to Line ID 0911252302.\n`);

console.log(`Generated works: ${works.length}`);
console.log(`Generated articles: ${articles.length}`);
console.log(`Generated clients: ${clients.length}`);
