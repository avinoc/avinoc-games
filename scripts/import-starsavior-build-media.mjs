import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const SHEET_ID = process.env.STARSAVIOR_SHEET_ID || "1W1nl3zfBdrgNCjLCVt7lBn0UzuwPLVnF2JkC4iamRic";
const BUILD_GID = process.env.STARSAVIOR_BUILD_GID || "292150066";
const BUILD_TAB_URL =
  process.env.STARSAVIOR_BUILD_URL ||
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/htmlview/sheet?headers=true&gid=${BUILD_GID}`;
const LOCAL_HTML = process.env.STARSAVIOR_BUILD_HTML || "";

const BUILD_DIR = path.resolve("src", "content", "builds");
const OUTPUT_JSON = path.resolve("src", "content", "build-media.json");
const OUTPUT_ASSET_DIR = path.resolve("public", "assets", "starsavior", "sheet");
const OUTPUT_PUBLIC_PREFIX = "/assets/starsavior/sheet";

function decodeEntities(value) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}

function normalizeText(value) {
  return decodeEntities(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s*>\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function canonical(value) {
  return normalizeText(value).toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function contentTypeToExtension(contentType) {
  const normalized = (contentType || "").split(";")[0].trim().toLowerCase();
  if (normalized === "image/jpeg") return ".jpg";
  if (normalized === "image/png") return ".png";
  if (normalized === "image/webp") return ".webp";
  if (normalized === "image/gif") return ".gif";
  return ".png";
}

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

async function loadBuildTargets() {
  const files = await readdir(BUILD_DIR);
  const targets = new Map();

  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const filePath = path.join(BUILD_DIR, file);
    const data = JSON.parse(await readFile(filePath, "utf8"));
    targets.set(canonical(data.name), {
      slug: data.slug,
      name: data.name
    });
  }

  return targets;
}

async function fetchBuildHtml() {
  if (LOCAL_HTML) {
    return readFile(path.resolve(LOCAL_HTML), "utf8");
  }

  const response = await fetch(BUILD_TAB_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch build sheet: ${response.status}`);
  }

  return response.text();
}

function parseGrid(html) {
  const tableHtml = (html.match(/<table class="waffle[\s\S]*?<\/table>/) || [])[0];
  if (!tableHtml) {
    throw new Error("Could not find sheet table in build HTML.");
  }

  const rowMatches = [...tableHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)];
  const spans = [];
  const grid = [];

  for (const rowMatch of rowMatches) {
    const cellMatches = [...rowMatch[1].matchAll(/<(td|th)([^>]*)>([\s\S]*?)<\/\1>/g)];
    const row = [];
    let col = 0;

    for (const cellMatch of cellMatches) {
      while (spans[col]) {
        row[col] = spans[col].cell;
        spans[col].rowsLeft -= 1;
        if (spans[col].rowsLeft <= 0) {
          spans[col] = undefined;
        }
        col += 1;
      }

      const [, tag, attrs, inner] = cellMatch;
      const rowspan = Number((attrs.match(/rowspan="(\d+)"/) || [])[1] || 1);
      const colspan = Number((attrs.match(/colspan="(\d+)"/) || [])[1] || 1);
      const img = (inner.match(/<img[^>]+src="([^"]+)"/i) || [])[1] || null;
      const text = normalizeText(inner);
      const cell = { tag, text, img };

      for (let index = 0; index < colspan; index += 1) {
        row[col + index] = cell;
        if (rowspan > 1) {
          spans[col + index] = { rowsLeft: rowspan - 1, cell };
        }
      }

      col += colspan;
    }

    while (spans[col]) {
      row[col] = spans[col].cell;
      spans[col].rowsLeft -= 1;
      if (spans[col].rowsLeft <= 0) {
        spans[col] = undefined;
      }
      col += 1;
    }

    grid.push(row);
  }

  return grid;
}

function getCell(row, column) {
  return row?.[column - 1] || null;
}

function getText(row, column) {
  return getCell(row, column)?.text || "";
}

function getImage(row, column) {
  return getCell(row, column)?.img || null;
}

function collectNamedImages(detailRow, imageRow, columns) {
  return columns
    .map((column) => {
      const name = getText(detailRow, column);
      if (!name) return null;

      return {
        name,
        url: getImage(imageRow, column)
      };
    })
    .filter(Boolean);
}

function collectIconUrls(imageRow, columns) {
  return columns.map((column) => getImage(imageRow, column)).filter(Boolean);
}

function findBestImageRow(grid, detailIndex) {
  let bestIndex = -1;
  let bestScore = -1;

  for (let index = Math.max(0, detailIndex - 5); index < detailIndex; index += 1) {
    const score = grid[index].filter((cell) => cell?.img).length;
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  }

  return bestIndex >= 0 ? grid[bestIndex] : null;
}

function buildMediaEntry(detailRow, imageRow) {
  const normalCards = collectNamedImages(detailRow, imageRow, [24, 25, 26, 27, 28]);
  const hardCards = collectNamedImages(detailRow, imageRow, [44, 45, 46, 47, 48]);

  const hardAlternateLabel = getText(detailRow, 50);
  const hardAlternateCards =
    hardAlternateLabel && getText(detailRow, 51)
      ? collectNamedImages(detailRow, imageRow, [51, 52, 53, 54, 55])
      : [];

  const hardTalismanPieces = [39, 41]
    .map((column) => {
      const name = getText(detailRow, column);
      if (!name) return null;

      return {
        name,
        url: getImage(imageRow, column)
      };
    })
    .filter(Boolean);

  return {
    image: getImage(imageRow, 2),
    setIcons: {
      budget: collectIconUrls(imageRow, [6, 7]),
      endgame: collectIconUrls(imageRow, [9, 10]),
      alternate: collectIconUrls(imageRow, [12, 13])
    },
    journeyNormal: {
      cards: normalCards,
      training: (() => {
        const name = getText(detailRow, 30);
        if (!name) return null;
        return {
          name,
          url: getImage(imageRow, 30)
        };
      })()
    },
    journeyHard: {
      talisman:
        getText(detailRow, 38) || hardTalismanPieces.length
          ? {
              label: getText(detailRow, 38),
              owner: getText(detailRow, 37),
              guideIcon: getImage(imageRow, 37),
              pieces: hardTalismanPieces
            }
          : null,
      cards: hardCards,
      alternate:
        hardAlternateLabel && hardAlternateCards.length
          ? {
              label: hardAlternateLabel,
              cards: hardAlternateCards
            }
          : null
    }
  };
}

async function createAssetDownloader() {
  await ensureDir(OUTPUT_ASSET_DIR);

  const urlCache = new Map();

  return async function downloadAsset(url) {
    if (!url) return null;
    if (urlCache.has(url)) {
      return urlCache.get(url);
    }

    const promise = (async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download image ${url}: ${response.status}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const hash = createHash("sha1").update(buffer).digest("hex");
      const ext =
        contentTypeToExtension(response.headers.get("content-type")) ||
        path.extname(new URL(url).pathname) ||
        ".png";
      const fileName = `${hash}${ext}`;
      const filePath = path.join(OUTPUT_ASSET_DIR, fileName);

      try {
        await stat(filePath);
      } catch {
        await writeFile(filePath, buffer);
      }

      return `${OUTPUT_PUBLIC_PREFIX}/${fileName}`;
    })();

    urlCache.set(url, promise);
    return promise;
  };
}

async function localizeEntry(entry, downloadAsset) {
  const image = await downloadAsset(entry.image);
  const setIcons = {
    budget: await Promise.all(entry.setIcons.budget.map(downloadAsset)),
    endgame: await Promise.all(entry.setIcons.endgame.map(downloadAsset)),
    alternate: await Promise.all(entry.setIcons.alternate.map(downloadAsset))
  };

  const journeyNormal = {
    cards: await Promise.all(
      entry.journeyNormal.cards.map(async (card) => ({
        name: card.name,
        image: await downloadAsset(card.url)
      }))
    ),
    training: entry.journeyNormal.training
      ? {
          name: entry.journeyNormal.training.name,
          image: await downloadAsset(entry.journeyNormal.training.url)
        }
      : null
  };

  const journeyHard = {
    talisman: entry.journeyHard.talisman
      ? {
          label: entry.journeyHard.talisman.label,
          owner: entry.journeyHard.talisman.owner,
          guideIcon: await downloadAsset(entry.journeyHard.talisman.guideIcon),
          pieces: await Promise.all(
            entry.journeyHard.talisman.pieces.map(async (piece) => ({
              name: piece.name,
              image: await downloadAsset(piece.url)
            }))
          )
        }
      : null,
    cards: await Promise.all(
      entry.journeyHard.cards.map(async (card) => ({
        name: card.name,
        image: await downloadAsset(card.url)
      }))
    ),
    alternate: entry.journeyHard.alternate
      ? {
          label: entry.journeyHard.alternate.label,
          cards: await Promise.all(
            entry.journeyHard.alternate.cards.map(async (card) => ({
              name: card.name,
              image: await downloadAsset(card.url)
            }))
          )
        }
      : null
  };

  return {
    image,
    setIcons,
    journeyNormal,
    journeyHard
  };
}

async function main() {
  const targets = await loadBuildTargets();
  const html = await fetchBuildHtml();
  const grid = parseGrid(html);
  const downloadAsset = await createAssetDownloader();
  const output = {};

  for (let index = 0; index < grid.length; index += 1) {
    const detailRow = grid[index];
    const name = getText(detailRow, 2);
    const target = targets.get(canonical(name));
    if (!target) continue;
    if (getText(detailRow, 23) !== "Journey (Normal)" || getText(detailRow, 43) !== "Journey (Hard)") {
      continue;
    }

    const imageRow = findBestImageRow(grid, index);
    if (!imageRow) {
      throw new Error(`Could not find image row for ${name}.`);
    }

    const mediaEntry = buildMediaEntry(detailRow, imageRow);
    output[target.slug] = await localizeEntry(mediaEntry, downloadAsset);
  }

  const missing = [...targets.values()].filter((target) => !output[target.slug]);
  if (missing.length) {
    throw new Error(`Missing build media for: ${missing.map((entry) => entry.name).join(", ")}`);
  }

  await writeFile(OUTPUT_JSON, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`Wrote ${OUTPUT_JSON}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
