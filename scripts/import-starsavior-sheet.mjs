import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const SHEET_ID = process.env.STARSAVIOR_SHEET_ID || "1W1nl3zfBdrgNCjLCVt7lBn0UzuwPLVnF2JkC4iamRic";
const BASE_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}`;
const OUTPUT_ROOT = path.resolve("imports", "raw");
const TAB_DIR = path.join(OUTPUT_ROOT, "tabs");
const IMAGE_DIR = path.join(OUTPUT_ROOT, "images");

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/\\x27/g, "'")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function decodeGoogleEscapes(value) {
  return value
    .replace(/\\"/g, '"')
    .replace(/\\x27/g, "'")
    .replace(/\\\//g, "/");
}

function stripHtml(value) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.text();
}

function extractTabs(html) {
  const matches = [...html.matchAll(/items\.push\(\{name: "(.*?)", pageUrl: "(.*?)", gid: "(\d+)"/g)];
  return matches.map((match) => ({
    name: decodeGoogleEscapes(match[1]),
    pageUrl: decodeGoogleEscapes(match[2]),
    gid: match[3]
  }));
}

function extractRows(html) {
  const rowMatches = [...html.matchAll(/<tr[\s\S]*?>([\s\S]*?)<\/tr>/g)];
  const rows = [];

  for (const rowMatch of rowMatches) {
    const cellMatches = [...rowMatch[1].matchAll(/<(td|th)[^>]*>([\s\S]*?)<\/\1>/g)];
    const cells = cellMatches
      .map((cell) => stripHtml(cell[2]))
      .filter((cell, index) => !(index === 0 && /^\d+$/.test(cell)));

    if (cells.some(Boolean)) {
      rows.push(cells);
    }
  }

  return rows;
}

function extractImageUrls(html) {
  return [...new Set([...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map((match) => match[1]))];
}

async function dedupeAndSaveImage(url, gid, index) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image ${url}: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const hash = createHash("sha1").update(buffer).digest("hex");
  const ext = path.extname(new URL(url).pathname) || ".png";
  const finalName = `${hash}${ext}`;
  const finalPath = path.join(IMAGE_DIR, finalName);

  try {
    await stat(finalPath);
  } catch {
    await writeFile(finalPath, buffer);
  }

  return {
    gid,
    originalUrl: url,
    file: `images/${finalName}`,
    order: index
  };
}

async function importSheet() {
  await ensureDir(TAB_DIR);
  await ensureDir(IMAGE_DIR);

  const overviewHtml = await fetchText(`${BASE_URL}/htmlview`);
  const tabs = extractTabs(overviewHtml);

  for (const tab of tabs) {
    const tabHtml = await fetchText(tab.pageUrl);
    const rows = extractRows(tabHtml);
    const imageUrls = extractImageUrls(tabHtml);
    const images = [];

    for (const [index, url] of imageUrls.entries()) {
      try {
        images.push(await dedupeAndSaveImage(url, tab.gid, index));
      } catch (error) {
        images.push({
          gid: tab.gid,
          originalUrl: url,
          file: null,
          order: index,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    const output = {
      gid: tab.gid,
      name: tab.name,
      pageUrl: tab.pageUrl,
      fetchedAt: new Date().toISOString(),
      rowCount: rows.length,
      imageCount: imageUrls.length,
      rows,
      images
    };

    const fileName = `${tab.gid}-${slugify(tab.name) || tab.gid}.json`;
    await writeFile(path.join(TAB_DIR, fileName), JSON.stringify(output, null, 2), "utf8");
    console.log(`Imported ${tab.name} -> ${fileName}`);
  }
}

importSheet().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
