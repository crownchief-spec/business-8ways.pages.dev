import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const pages = [
  { slug: "service", url: "https://www.8-ways.com/service", category: "商業攝影總覽" },
  { slug: "works", url: "https://www.8-ways.com/works", category: "作品參考" },
  { slug: "aboutus", url: "https://www.8-ways.com/aboutus", category: "攝影團隊" },
  { slug: "travel", url: "https://www.8-ways.com/travel", category: "旅遊業宣傳攝影" },
  { slug: "event", url: "https://www.8-ways.com/event", category: "活動會議攝影" },
  { slug: "food", url: "https://www.8-ways.com/food", category: "餐飲業廣告" },
  { slug: "hotel", url: "https://www.8-ways.com/hotel", category: "飯店民宿攝影" }
];

const root = process.cwd();
const assetsRoot = path.join(root, "public/assets/legacy-commercial");
const mediaManifestPath = path.join(root, "src/data/legacy-commercial-media.json");
const videoManifestPath = path.join(root, "src/data/legacy-commercial-videos.json");

const SKIP_WORDS = ["facebook", "instagram", "youtube icon", "social", "twitter", "pinterest"];

const normalizeUrl = (u, base) => {
  try {
    return new URL(u, base).href;
  } catch {
    return "";
  }
};

const youtubeId = (url) => {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    if (u.pathname.includes("/embed/")) return u.pathname.split("/embed/")[1].split("/")[0];
    return "";
  } catch {
    return "";
  }
};

const cleanName = (value) =>
  (value || "image")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5\-\s]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40) || "image";

const shouldSkip = (meta) => {
  const text = `${meta.alt || ""} ${meta.title || ""} ${meta.url || ""}`.toLowerCase();
  if (SKIP_WORDS.some((k) => text.includes(k))) return true;
  if (meta.width && meta.height && (meta.width < 120 || meta.height < 120)) return true;
  return false;
};

const scrollToBottom = async (page) => {
  let previous = 0;
  for (let i = 0; i < 20; i += 1) {
    const current = await page.evaluate(() => document.body.scrollHeight);
    if (current === previous) break;
    previous = current;
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
};

const downloadFile = async (url, outPath) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(outPath, buf);
};

const run = async () => {
  await fs.mkdir(assetsRoot, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  const mediaManifest = [];
  const videos = [];

  try {
    for (const source of pages) {
      const pageDir = path.join(assetsRoot, source.slug);
      await fs.mkdir(pageDir, { recursive: true });

      const context = await browser.newContext({ viewport: { width: 1440, height: 2400 } });
      const page = await context.newPage();
      await page.goto(source.url, { waitUntil: "domcontentloaded", timeout: 120000 });
      await page.waitForTimeout(3000);
      await scrollToBottom(page);

      const records = await page.evaluate(() => {
        const output = [];
        const push = (item) => item.url && output.push(item);

        const chooseLargestFromSrcset = (srcset) => {
          if (!srcset) return "";
          const items = srcset.split(",").map((part) => {
            const [url, size = "0w"] = part.trim().split(/\s+/);
            return { url, score: Number(size.replace(/[^0-9]/g, "")) || 0 };
          });
          items.sort((a, b) => b.score - a.score);
          return items[0]?.url || "";
        };

        document.querySelectorAll("img").forEach((img) => {
          const srcsetMax = chooseLargestFromSrcset(img.getAttribute("srcset") || "");
          push({
            type: "image",
            url: srcsetMax || img.currentSrc || img.src,
            alt: img.alt || "",
            title: img.title || "",
            width: img.naturalWidth || img.width || 0,
            height: img.naturalHeight || img.height || 0
          });
        });

        document.querySelectorAll("source").forEach((source) => {
          const srcsetMax = chooseLargestFromSrcset(source.getAttribute("srcset") || "");
          push({ type: "image", url: srcsetMax, alt: "", title: "", width: 0, height: 0 });
        });

        document.querySelectorAll("*").forEach((el) => {
          const bg = getComputedStyle(el).backgroundImage;
          if (bg && bg !== "none") {
            const matches = [...bg.matchAll(/url\(["']?([^"')]+)["']?\)/g)];
            matches.forEach((m) => push({ type: "image", url: m[1], alt: el.getAttribute("aria-label") || "", title: el.getAttribute("title") || "", width: 0, height: 0 }));
          }
        });

        document.querySelectorAll("iframe").forEach((iframe) => {
          push({ type: "video", url: iframe.src, title: iframe.title || "", alt: "" });
        });

        document.querySelectorAll("a[href]").forEach((a) => {
          const href = a.getAttribute("href") || "";
          if (href.includes("youtu.be") || href.includes("youtube.com") || href.includes("drive.google.com")) {
            push({ type: "video", url: href, title: (a.textContent || "").trim(), alt: "" });
          }
        });

        return output;
      });

      const seen = new Set();
      let index = 1;
      for (const item of records) {
        const absolute = normalizeUrl(item.url, source.url);
        if (!absolute || seen.has(absolute)) continue;
        seen.add(absolute);

        if (item.type === "video") {
          if (!(absolute.includes("youtube") || absolute.includes("youtu.be"))) continue;
          videos.push({
            sourcePage: source.url,
            title: item.title || `${source.category} 作品影片`,
            youtubeUrl: absolute,
            youtubeId: youtubeId(absolute),
            category: source.category,
            client: "",
            industry: "",
            sourcePageSlug: source.slug
          });
          continue;
        }

        const meta = { ...item, url: absolute };
        if (shouldSkip(meta)) continue;

        const ext = path.extname(new URL(absolute).pathname).replace(".", "") || "jpg";
        const safeAlt = cleanName(item.alt || item.title || `${source.slug}-image`);
        const filename = `${source.slug}-${String(index).padStart(3, "0")}-${safeAlt}.${ext}`;
        const outputPath = path.join(pageDir, filename);

        try {
          await downloadFile(absolute, outputPath);
          const localPath = `/assets/legacy-commercial/${source.slug}/${filename}`;
          mediaManifest.push({
            sourcePage: source.url,
            sourcePageSlug: source.slug,
            originalUrl: absolute,
            localPath,
            alt: item.alt || "",
            title: item.title || "",
            type: "image",
            usedIn: [source.slug]
          });
          index += 1;
        } catch {
          // Ignore download failures and continue collecting usable assets.
        }
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }

  await fs.writeFile(mediaManifestPath, JSON.stringify(mediaManifest, null, 2));
  await fs.writeFile(videoManifestPath, JSON.stringify(videos, null, 2));

  console.log(`Images downloaded: ${mediaManifest.length}`);
  console.log(`Videos indexed: ${videos.length}`);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
