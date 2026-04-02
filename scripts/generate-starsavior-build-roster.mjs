import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const TODAY = new Date().toISOString().slice(0, 10);

const SHEET_ID = process.env.STARSAVIOR_SHEET_ID || "1W1nl3zfBdrgNCjLCVt7lBn0UzuwPLVnF2JkC4iamRic";
const BUILD_GID = process.env.STARSAVIOR_BUILD_GID || "292150066";
const BUILD_TAB_URL =
  process.env.STARSAVIOR_BUILD_URL ||
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/htmlview/sheet?headers=true&gid=${BUILD_GID}`;

const ROSTER_PATH = path.resolve("src", "content", "saviors", "roster.json");
const BUILD_OVERRIDE_DIR = path.resolve("src", "content", "builds");
const OUTPUT_BUILD_ROSTER = path.resolve("src", "content", "build-roster.json");
const OUTPUT_TYCHARA_SNAPSHOT = path.resolve("src", "content", "sources", "tychara-build-fallbacks.json");

const SHEET_ASSET_DIR = path.resolve("public", "assets", "starsavior", "sheet");
const SHEET_ASSET_PREFIX = "/assets/starsavior/sheet";
const TYCHARA_ASSET_DIR = path.resolve("public", "assets", "starsavior", "tychara");
const TYCHARA_ASSET_PREFIX = "/assets/starsavior/tychara";

const sheetNameAliases = {
  "Asherah Waltz": "Asherah Waltz of Starlight",
  "Noble Princess Frey": "Frey Noble Princess"
};

const existingSlugOverrides = {
  "Bunnygirl Claire": "bunnygirl-claire",
  "Frey Noble Princess": "noble-princess-frey"
};

const fallbackMissingNames = [
  "Annah",
  "Besta",
  "Claire",
  "Clarissa",
  "Marcille",
  "Naru",
  "Rosaria",
  "Scarlet",
  "Vera"
];

const fallbackTemplates = {
  annah: {
    role: "Self-sustain Tank",
    recommendedSets: [
      { label: "Core", sets: ["HP (4pc)", "Barrier (2pc)"], neckMain: "SPD", ringMain: "HP%" },
      { label: "Durability", sets: ["HP (4pc)", "DEF (2pc)"], neckMain: "SPD", ringMain: "HP%" },
      { label: "Fast utility", sets: ["Speed (4pc)", "Barrier (2pc)"], neckMain: "SPD", ringMain: "HP%" }
    ],
    subStats: ["SPD", "HP%", "DEF%", "Effect Res", "Flat HP"],
    skillLevels: {
      budget: "3 / 3 / 3",
      endgame: "4 / 7 / 7",
      progression: ["3 / 3 / 3", "4 / 6 / 6", "4 / 7 / 7"]
    },
    arcana: ["A Knight's Oath", "Under the Glass Moon"],
    notes: [
      "Annah does not have a published build section on Tychara yet, so this page uses her Tychara stat line and kit details as a fallback build profile.",
      "Her self-healing special and Max HP scaling point cleanly toward a speed-first HP tank shell.",
      "ATK Down on the ultimate makes faster cycling more valuable than forcing extra damage stats."
    ]
  },
  besta: {
    role: "HP-scaling Tank",
    recommendedSets: [
      { label: "Core", sets: ["HP (4pc)", "Barrier (2pc)"], neckMain: "SPD", ringMain: "HP%" },
      { label: "Bruiser tank", sets: ["HP (4pc)", "DEF (2pc)"], neckMain: "SPD", ringMain: "HP%" },
      { label: "Fast utility", sets: ["Speed (4pc)", "Barrier (2pc)"], neckMain: "SPD", ringMain: "HP%" }
    ],
    subStats: ["SPD", "HP%", "DEF%", "Effect Res", "Flat HP"],
    skillLevels: {
      budget: "3 / 3 / 3",
      endgame: "4 / 7 / 7",
      progression: ["3 / 3 / 3", "4 / 6 / 6", "4 / 7 / 7"]
    },
    arcana: ["A Knight's Oath", "Under the Glass Moon"],
    notes: [
      "Besta does not have a published build section on Tychara yet, so this page uses her Tychara stat line and kit details as a fallback build profile.",
      "Both the basic and special scale from Max HP, which keeps HP sets ahead of pure defense stacking.",
      "DEF Up on the ultimate and ATK Down on the special make her a straightforward frontline lane anchor."
    ]
  },
  claire: {
    role: "Single-target DPS",
    recommendedSets: [
      { label: "Core", sets: ["Destruction (4pc)", "Valor (2pc)"], neckMain: "SPD", ringMain: "ATK%" },
      { label: "Tempo", sets: ["Speed (4pc)", "Valor (2pc)"], neckMain: "SPD", ringMain: "ATK%" },
      { label: "Budget", sets: ["ATK (4pc)", "Valor (2pc)"], neckMain: "SPD", ringMain: "ATK%" }
    ],
    subStats: ["SPD", "Crit Rate", "Crit DMG", "ATK%", "Flat ATK"],
    skillLevels: {
      budget: "3 / 3 / 3",
      endgame: "7 / 7 / 8",
      progression: ["3 / 3 / 3", "3 / 6 / 6", "7 / 7 / 8"]
    },
    arcana: ["No Pain, No Gain", "The Indomitable Masterpiece", "A Knight's Oath"],
    notes: [
      "Claire does not have a published build section on Tychara yet, so this page uses her Tychara stat line and kit details as a fallback build profile.",
      "Her passive and ultimate both lean into self-crit scaling, so standard crit damage shells fit naturally.",
      "Action Gauge gain on the special keeps SPD valuable even on a pure single-target setup."
    ]
  },
  clarissa: {
    role: "Control DPS",
    recommendedSets: [
      { label: "Core", sets: ["Insight (4pc)", "Hit (2pc)"], neckMain: "SPD", ringMain: "ATK%" },
      { label: "Damage", sets: ["Destruction (4pc)", "Valor (2pc)"], neckMain: "SPD", ringMain: "ATK%" },
      { label: "Tempo", sets: ["Speed (4pc)", "Hit (2pc)"], neckMain: "SPD", ringMain: "ATK%" }
    ],
    subStats: ["SPD", "Effect Hit%", "Crit Rate", "Crit DMG", "ATK%"],
    skillLevels: {
      budget: "3 / 3 / 3",
      endgame: "7 / 8 / 8",
      progression: ["3 / 3 / 3", "3 / 6 / 6", "7 / 8 / 8"]
    },
    arcana: ["No Pain, No Gain", "The Indomitable Masterpiece", "Made by Petra♡"],
    notes: [
      "Clarissa does not have a published build section on Tychara yet, so this page uses her Tychara stat line and kit details as a fallback build profile.",
      "Her special already brings SPD Down and Action Gauge control, which makes Effect Hit the cleanest flex stat after speed.",
      "The kit is still primarily single-target damage, so crit stats stay relevant even on the control route."
    ]
  },
  marcille: {
    role: "Single-target Debuff DPS",
    recommendedSets: [
      { label: "Core", sets: ["Insight (4pc)", "Hit (2pc)"], neckMain: "SPD", ringMain: "ATK%" },
      { label: "Damage", sets: ["Destruction (4pc)", "Valor (2pc)"], neckMain: "SPD", ringMain: "ATK%" },
      { label: "Tempo", sets: ["Speed (4pc)", "Hit (2pc)"], neckMain: "SPD", ringMain: "ATK%" }
    ],
    subStats: ["SPD", "Crit Rate", "Crit DMG", "ATK%", "Effect Hit%"],
    skillLevels: {
      budget: "3 / 3 / 3",
      endgame: "7 / 8 / 8",
      progression: ["3 / 3 / 3", "3 / 6 / 6", "7 / 8 / 8"]
    },
    arcana: ["No Pain, No Gain", "The Indomitable Masterpiece", "Made by Petra♡"],
    notes: [
      "Marcille does not have a published build section on Tychara yet, so this page uses her Tychara stat line and kit details as a fallback build profile.",
      "Burn and Recovery Down are both attached to her damage buttons, so she benefits from a mixed crit-plus-hit stat line.",
      "Her high base crit rate lets her reach a stable damage shell earlier than most SR casters."
    ]
  },
  naru: {
    role: "Debuff DPS",
    recommendedSets: [
      { label: "Core", sets: ["Insight (4pc)", "Hit (2pc)"], neckMain: "SPD", ringMain: "ATK%" },
      { label: "Tempo", sets: ["Speed (4pc)", "Hit (2pc)"], neckMain: "SPD", ringMain: "ATK%" },
      { label: "Damage", sets: ["Destruction (4pc)", "Hit (2pc)"], neckMain: "SPD", ringMain: "ATK%" }
    ],
    subStats: ["SPD", "Effect Hit%", "ATK%", "Crit Rate", "Crit DMG"],
    skillLevels: {
      budget: "3 / 3 / 3",
      endgame: "7 / 8 / 8",
      progression: ["3 / 3 / 3", "3 / 6 / 6", "7 / 8 / 8"]
    },
    arcana: ["No Pain, No Gain", "The Indomitable Masterpiece", "Made by Petra♡"],
    notes: [
      "Naru does not have a published build section on Tychara yet, so this page uses her Tychara stat line and kit details as a fallback build profile.",
      "Her ultimate adds both SPD Down and Effect RES Down, so Hit-focused sets give her the clearest team value.",
      "She still carries attack-scaling single-target skills, so ATK% and crit remain worthwhile once speed and hit are covered."
    ]
  },
  rosaria: {
    role: "Burst Debuff DPS",
    recommendedSets: [
      { label: "Core", sets: ["Insight (4pc)", "Hit (2pc)"], neckMain: "SPD", ringMain: "ATK%" },
      { label: "Damage", sets: ["Destruction (4pc)", "Valor (2pc)"], neckMain: "SPD", ringMain: "ATK%" },
      { label: "Tempo", sets: ["Speed (4pc)", "Hit (2pc)"], neckMain: "SPD", ringMain: "ATK%" }
    ],
    subStats: ["SPD", "Crit Rate", "Crit DMG", "ATK%", "Effect Hit%"],
    skillLevels: {
      budget: "3 / 3 / 3",
      endgame: "7 / 8 / 10",
      progression: ["3 / 3 / 3", "3 / 6 / 6", "7 / 8 / 10"]
    },
    arcana: ["No Pain, No Gain", "The Indomitable Masterpiece", "A Knight's Oath"],
    notes: [
      "Rosaria does not have a published build section on Tychara yet, so this page uses her Tychara stat line and kit details as a fallback build profile.",
      "Her kit mixes personal damage ramping with teamwide DEF Down, which makes an Insight shell the safest first route.",
      "Once crit quality is stable, a Destruction swap gives her much stronger payoff on the inferno burst loop."
    ]
  },
  scarlet: {
    role: "Speed-cycle DPS",
    recommendedSets: [
      { label: "Core", sets: ["Speed (4pc)", "Hit (2pc)"], neckMain: "SPD", ringMain: "ATK%" },
      { label: "Control", sets: ["Insight (4pc)", "Hit (2pc)"], neckMain: "SPD", ringMain: "ATK%" },
      { label: "Damage", sets: ["Destruction (4pc)", "Hit (2pc)"], neckMain: "SPD", ringMain: "ATK%" }
    ],
    subStats: ["SPD", "Effect Hit%", "Crit Rate", "Crit DMG", "ATK%"],
    skillLevels: {
      budget: "3 / 3 / 3",
      endgame: "7 / 8 / 8",
      progression: ["3 / 3 / 3", "3 / 6 / 6", "7 / 8 / 8"]
    },
    arcana: ["No Pain, No Gain", "The Indomitable Masterpiece", "Made by Petra♡"],
    notes: [
      "Scarlet does not have a published build section on Tychara yet, so this page uses her Tychara stat line and kit details as a fallback build profile.",
      "Extra turns on the special and speed ramping in the passive reward a true SPD-first setup.",
      "Her AoE ultimate carries SPD Down, so Hit remains a high-value secondary stat instead of a throwaway roll."
    ]
  },
  vera: {
    role: "Healer Support",
    recommendedSets: [
      { label: "Core", sets: ["HP (4pc)", "Barrier (2pc)"], neckMain: "SPD", ringMain: "HP%" },
      { label: "Fast healer", sets: ["Speed (4pc)", "Barrier (2pc)"], neckMain: "SPD", ringMain: "HP%" },
      { label: "Safe lane", sets: ["HP (4pc)", "Res (2pc)"], neckMain: "SPD", ringMain: "HP%" }
    ],
    subStats: ["SPD", "HP%", "Effect Res", "DEF%", "Flat HP"],
    skillLevels: {
      budget: "3 / 3 / 3",
      endgame: "4 / 8 / 8",
      progression: ["3 / 3 / 3", "4 / 6 / 6", "4 / 8 / 8"]
    },
    arcana: ["A Knight's Oath", "Under the Glass Moon", "Made by Petra♡"],
    notes: [
      "Vera does not have a published build section on Tychara yet, so this page uses her Tychara stat line and kit details as a fallback build profile.",
      "Both of her healing buttons scale from Max HP, so HP sets stay ahead of attack-oriented support shells.",
      "Her special removes debuffs and the ultimate is full-team recovery, which makes speed and effect resistance the cleanest supporting rolls."
    ]
  }
};

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

function htmlToLines(html) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "\n")
  )
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
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

function parseGrid(html) {
  const tableHtml = (html.match(/<table class="waffle[\s\S]*?<\/table>/) || [])[0];
  if (!tableHtml) {
    throw new Error("Could not find the build table in the published sheet HTML.");
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
        if (spans[col].rowsLeft <= 0) spans[col] = undefined;
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
      if (spans[col].rowsLeft <= 0) spans[col] = undefined;
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
      const name = normalizeText(getText(detailRow, column));
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

function normalizeMainStat(value) {
  const text = normalizeText(value).toLowerCase();
  if (!text) return "";
  if (text.includes("speed")) return "SPD";
  if (text.includes("crit dmg")) return "Crit DMG";
  if (text.includes("crit rate")) return "Crit Rate";
  if (text.includes("effect hit")) return "Effect Hit%";
  if (text.includes("effect res")) return "Effect Res";
  if (text.includes("atk")) return "ATK%";
  if (text.includes("hp")) return "HP%";
  if (text.includes("def")) return "DEF%";
  return value.trim();
}

function normalizeSetName(value) {
  return normalizeText(value)
    .replace(/\s+\(2pc\)$/i, " (2pc)")
    .replace(/\s+\(4pc\)$/i, " (4pc)")
    .replace(/^Atk /i, "ATK ")
    .replace(/^Res$/i, "Res (2pc)");
}

function normalizeSkillStep(value) {
  return normalizeText(value)
    .replace(/\s*\/\s*/g, " / ")
    .replace(/\s+or\s+/gi, " or ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function parseProgression(value) {
  const normalized = normalizeText(value);
  const rawSteps = normalized.split("➔").map((step) => normalizeSkillStep(step)).filter(Boolean);
  const progression = rawSteps.length ? rawSteps : ["3 / 3 / 3", "7 / 7 / 7"];
  return {
    budget: progression[0],
    endgame: progression[progression.length - 1],
    progression
  };
}

function uniqueList(values) {
  return [...new Set(values.filter(Boolean))];
}

function parseRankedList(lines, skip = []) {
  const blocked = new Set(skip);
  return uniqueList(
    lines.filter((line) => {
      if (!line) return false;
      if (blocked.has(line)) return false;
      if (/^\d+\.?$/.test(line)) return false;
      if (/^(TOP|Priority:|End game:|4-Piece|2-Piece)$/.test(line)) return false;
      if (/^Image$/i.test(line)) return false;
      return /[A-Za-z]/.test(line);
    })
  );
}

function getSection(lines, title, nextTitles) {
  const start = lines.indexOf(title);
  if (start === -1) return [];
  let end = lines.length;
  for (let index = start + 1; index < lines.length; index += 1) {
    if (nextTitles.includes(lines[index])) {
      end = index;
      break;
    }
  }
  return lines.slice(start + 1, end);
}

function parseTycharaSkillLevels(lines) {
  if (!lines.length) return null;

  const skills = ["Basic", "Special", "Ultimate"];
  const priority = {};
  const endgame = {};

  for (let index = 0; index < lines.length; index += 1) {
    const label = lines[index];
    if (!skills.includes(label)) continue;

    const priorityLine = lines[index + 1] || "";
    const endgameLine = lines[index + 2] || "";
    const priorityValue = (priorityLine.match(/Priority:\s*(.+)$/i) || [])[1];
    const endgameValue = (endgameLine.match(/End game:\s*(.+)$/i) || [])[1];

    if (priorityValue) priority[label] = priorityValue.trim();
    if (endgameValue) endgame[label] = endgameValue.trim();
  }

  if (!skills.every((skill) => priority[skill] && endgame[skill])) {
    return null;
  }

  const budget = `${priority.Basic} / ${priority.Special} / ${priority.Ultimate}`;
  const endgameString = `${endgame.Basic} / ${endgame.Special} / ${endgame.Ultimate}`;

  return {
    budget,
    endgame: endgameString,
    progression: [budget, endgameString]
  };
}

function parseTycharaJourneyArcana(lines) {
  const normalStart = lines.indexOf("Normal");
  const hardStart = lines.indexOf("Hard");
  if (normalStart === -1 && hardStart === -1) return [];

  const normal = normalStart >= 0 ? parseRankedList(lines.slice(normalStart + 1, hardStart >= 0 ? hardStart : lines.length)) : [];
  const hard = hardStart >= 0 ? parseRankedList(lines.slice(hardStart + 1)) : [];
  return uniqueList([...hard, ...normal]).slice(0, 5);
}

function parseTycharaCharacter(html, entry) {
  const lines = htmlToLines(html);
  const hasBuildSection = lines.includes("Recommended gear");

  const build = hasBuildSection
    ? {
        subStats: parseRankedList(
          getSection(lines, "Recommended roll substats", ["Skill leveling"]),
          ["Recommended roll substats"]
        ),
        skillLevels: parseTycharaSkillLevels(getSection(lines, "Skill leveling", ["Journey arcana"])),
        arcana: parseTycharaJourneyArcana(getSection(lines, "Journey arcana", ["Journey training stats", "© 2026 Tychara. All rights reserved."]))
      }
    : null;

  return {
    name: entry.name,
    slug: entry.slug,
    url: `https://tychara.com/StarSavior/characters/${entry.slug}`,
    hasBuildSection,
    lastUpdated: (() => {
      const index = lines.indexOf("Last updated:");
      return index >= 0 ? lines[index + 1] || null : null;
    })(),
    build
  };
}

function inferRole({ rosterEntry, ringMain, primarySubStat, recommendedSets, templateRole }) {
  if (templateRole) return templateRole;

  const className = (rosterEntry.class || "").toLowerCase();
  const setNames = recommendedSets.flatMap((entry) => entry.sets).join(" ");
  const hitFocused = /effect hit/i.test(primarySubStat) || /Hit|Insight|Precision/.test(setNames);

  if (className === "defender") return "Tank";
  if (className === "supporter") {
    if (/HP|DEF/.test(ringMain)) return "Support";
    return hitFocused ? "Support Debuffer" : "Support DPS";
  }
  if (className === "assassin" || className === "striker") {
    return hitFocused ? "Debuff DPS" : "Single-target DPS";
  }
  if (className === "ranger" || className === "caster") {
    return hitFocused ? "Debuff DPS" : "DPS";
  }

  return "Build Guide";
}

function inferSubStats({ rosterEntry, primarySubStat, ringMain, templateSubStats }) {
  if (templateSubStats?.length) return templateSubStats;

  const className = (rosterEntry.class || "").toLowerCase();
  const offensive = !/HP|DEF/.test(ringMain) && className !== "defender";
  const primary = normalizeMainStat(primarySubStat);

  if (!offensive || className === "supporter") {
    if (/DEF/.test(ringMain)) {
      return ["SPD", "DEF%", "HP%", "Effect Res", "Flat DEF"];
    }
    return ["SPD", "HP%", "DEF%", "Effect Res", "Flat HP"];
  }

  if (/Effect Hit/.test(primary)) {
    return ["SPD", "Effect Hit%", "Crit Rate", "Crit DMG", "ATK%"];
  }

  return ["SPD", "Crit Rate", "Crit DMG", "ATK%", "Effect Hit%"];
}

function fallbackArcanaByClass(rosterEntry) {
  const className = (rosterEntry.class || "").toLowerCase();
  if (className === "defender" || className === "supporter") {
    return ["A Knight's Oath", "Under the Glass Moon"];
  }
  return ["No Pain, No Gain", "The Indomitable Masterpiece", "Made by Petra♡"];
}

function createSheetSummary(entry, primarySubStat, media) {
  const firstSet = entry.recommendedSets[0];
  const notes = [
    `${entry.name} keeps a ${entry.neckMain} necklace and ${entry.ringMain} ring in the published build sheet, with ${firstSet?.sets.join(" + ") || "the core set route"} as the first stop.`
  ];

  if (primarySubStat) {
    notes.push(`The source sheet highlights ${primarySubStat} as the standout roll target on top of the usual ${entry.subStats.slice(0, 2).join(" and ")} shell.`);
  }

  if (media?.journeyHard?.talisman?.label) {
    notes.push(`Journey Hard routing in the sheet points toward ${media.journeyHard.talisman.label}.`);
  }

  return notes;
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

async function createAssetDownloader(dir, prefix) {
  await ensureDir(dir);
  const cache = new Map();

  return async function downloadAsset(url) {
    if (!url) return null;
    if (cache.has(url)) return cache.get(url);

    const promise = (async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download asset ${url}: ${response.status}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const hash = createHash("sha1").update(buffer).digest("hex");
      const ext =
        contentTypeToExtension(response.headers.get("content-type")) ||
        path.extname(new URL(url).pathname) ||
        ".png";
      const fileName = `${hash}${ext}`;
      const filePath = path.join(dir, fileName);

      try {
        await stat(filePath);
      } catch {
        await writeFile(filePath, buffer);
      }

      return `${prefix}/${fileName}`;
    })();

    cache.set(url, promise);
    return promise;
  };
}

async function localizeSheetMedia(entry, downloadAsset) {
  return {
    image: await downloadAsset(entry.image),
    setIcons: {
      budget: await Promise.all(entry.setIcons.budget.map(downloadAsset)),
      endgame: await Promise.all(entry.setIcons.endgame.map(downloadAsset)),
      alternate: await Promise.all(entry.setIcons.alternate.map(downloadAsset))
    },
    journeyNormal: {
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
    },
    journeyHard: {
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
    }
  };
}

async function loadRoster() {
  return JSON.parse(await readFile(ROSTER_PATH, "utf8"));
}

async function loadBuildOverrides() {
  const files = await readdir(BUILD_OVERRIDE_DIR);
  const overrides = new Map();

  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const filePath = path.join(BUILD_OVERRIDE_DIR, file);
    const parsed = JSON.parse(await readFile(filePath, "utf8"));
    if (!parsed || Array.isArray(parsed) || !parsed.slug) continue;
    overrides.set(parsed.slug, parsed);
  }

  return overrides;
}

function buildRosterMaps(roster) {
  const byCanonicalName = new Map();
  const bySlug = new Map();

  for (const entry of roster) {
    byCanonicalName.set(canonical(entry.name), entry);
    bySlug.set(entry.slug, entry);
  }

  byCanonicalName.set(canonical("Asherah Waltz"), bySlug.get("waltz-asherah"));
  byCanonicalName.set(canonical("Noble Princess Frey"), bySlug.get("bg-frey"));

  return { byCanonicalName, bySlug };
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.text();
}

function buildSheetSetLabel(row, column, fallbackLabel) {
  const label = normalizeText(getText(row, column));
  return label ? label.replace(/PVE/g, "PvE").replace(/PVP/g, "PvP") : fallbackLabel;
}

function buildSourceContext(url, lead, citationText, permissionNote) {
  return {
    url,
    lead,
    citationText,
    permissionNote
  };
}

async function main() {
  const roster = await loadRoster();
  const overrides = await loadBuildOverrides();
  const rosterMaps = buildRosterMaps(roster);

  const downloadSheetAsset = await createAssetDownloader(SHEET_ASSET_DIR, SHEET_ASSET_PREFIX);
  const downloadTycharaAsset = await createAssetDownloader(TYCHARA_ASSET_DIR, TYCHARA_ASSET_PREFIX);

  const [sheetHtml, ...tycharaHtml] = await Promise.all([
    fetchText(BUILD_TAB_URL),
    ...roster.map((entry) => fetchText(`https://tychara.com/StarSavior/characters/${entry.slug}`))
  ]);

  const tycharaData = roster.map((entry, index) => parseTycharaCharacter(tycharaHtml[index], entry));
  const tycharaBySlug = new Map(tycharaData.map((entry) => [entry.slug, entry]));

  const grid = parseGrid(sheetHtml);
  const sheetLabels = {
    first: buildSheetSetLabel(grid[9], 6, "Core"),
    second: buildSheetSetLabel(grid[9], 9, "High-end"),
    third: buildSheetSetLabel(grid[9], 12, "PvP")
  };

  const sheetEntries = [];

  for (let index = 0; index < grid.length; index += 1) {
    const detailRow = grid[index];
    const rawName = getText(detailRow, 2);
    if (!rawName) continue;
    if (getText(detailRow, 23) !== "Journey (Normal)" || getText(detailRow, 43) !== "Journey (Hard)") continue;

    const mappedName = sheetNameAliases[rawName] || rawName;
    const rosterEntry = rosterMaps.byCanonicalName.get(canonical(mappedName));
    if (!rosterEntry) {
      throw new Error(`Could not map sheet build row "${rawName}" to the Savior roster.`);
    }

    const imageRow = findBestImageRow(grid, index);
    if (!imageRow) {
      throw new Error(`Could not find the media row for ${rawName}.`);
    }

    const media = await localizeSheetMedia(buildMediaEntry(detailRow, imageRow), downloadSheetAsset);
    const primarySubStat = normalizeMainStat(getText(detailRow, 16) || getText(detailRow, 15));
    const recommendedSets = [
      {
        label: sheetLabels.first,
        sets: [normalizeSetName(getText(detailRow, 6)), normalizeSetName(getText(detailRow, 7))].filter(Boolean),
        neckMain: normalizeMainStat(getText(detailRow, 3)),
        ringMain: normalizeMainStat(getText(detailRow, 4))
      },
      {
        label: sheetLabels.second,
        sets: [normalizeSetName(getText(detailRow, 9)), normalizeSetName(getText(detailRow, 10))].filter(Boolean),
        neckMain: normalizeMainStat(getText(detailRow, 3)),
        ringMain: normalizeMainStat(getText(detailRow, 4))
      },
      {
        label: sheetLabels.third,
        sets: [normalizeSetName(getText(detailRow, 12)), normalizeSetName(getText(detailRow, 13))].filter(Boolean),
        neckMain: normalizeMainStat(getText(detailRow, 3)),
        ringMain: normalizeMainStat(getText(detailRow, 4))
      }
    ].filter((entry) => entry.sets.length);

    const tycharaEntry = tycharaBySlug.get(rosterEntry.slug);
    const role = inferRole({
      rosterEntry,
      ringMain: recommendedSets[0]?.ringMain || normalizeMainStat(getText(detailRow, 4)),
      primarySubStat,
      recommendedSets
    });
    const subStats = tycharaEntry?.build?.subStats?.length
      ? tycharaEntry.build.subStats.map((value) => value.replace(/^Attack$/i, "ATK%"))
      : inferSubStats({
          rosterEntry,
          primarySubStat,
          ringMain: recommendedSets[0]?.ringMain || normalizeMainStat(getText(detailRow, 4))
        });
    const skillLevels = parseProgression(getText(detailRow, 19) || getText(detailRow, 20) || getText(detailRow, 21));
    const arcana = uniqueList([
      ...(tycharaEntry?.build?.arcana || []),
      ...media.journeyNormal.cards.map((entry) => entry.name),
      ...media.journeyHard.cards.map((entry) => entry.name)
    ]).slice(0, 5);

    const defaultEntry = {
      name: rosterEntry.name,
      slug: existingSlugOverrides[rosterEntry.name] || rosterEntry.slug,
      role,
      modes: ["PvE", "PvP"],
      image: media.image,
      setIcons: media.setIcons,
      updatedAt: TODAY,
      sourceTabs: tycharaEntry?.build ? ["All Character Build Guide", "Tychara character guide"] : ["All Character Build Guide"],
      sourceContext: null,
      recommendedSets,
      subStats,
      skillLevels,
      arcana: arcana.length ? arcana : fallbackArcanaByClass(rosterEntry),
      journeyNormal: media.journeyNormal,
      journeyHard: media.journeyHard,
      talismans: {
        journeyNormal: media.journeyNormal.training?.name || undefined,
        journeyHard: media.journeyHard.talisman?.label || undefined
      },
      notes: createSheetSummary(
        {
          name: rosterEntry.name,
          neckMain: recommendedSets[0]?.neckMain || normalizeMainStat(getText(detailRow, 3)),
          ringMain: recommendedSets[0]?.ringMain || normalizeMainStat(getText(detailRow, 4)),
          recommendedSets,
          subStats
        },
        primarySubStat,
        media
      )
    };

    const override = overrides.get(defaultEntry.slug);
    sheetEntries.push(
      override
        ? {
            ...defaultEntry,
            ...override,
            image: defaultEntry.image || override.image,
            setIcons: defaultEntry.setIcons || override.setIcons,
            journeyNormal: defaultEntry.journeyNormal || override.journeyNormal,
            journeyHard: defaultEntry.journeyHard || override.journeyHard,
            sourceTabs: uniqueList([...(override.sourceTabs || []), ...defaultEntry.sourceTabs]),
            sourceContext: defaultEntry.sourceContext
          }
        : defaultEntry
    );
  }

  const buildsBySlug = new Map(sheetEntries.map((entry) => [entry.slug, entry]));
  const fallbackSnapshots = [];

  for (const name of fallbackMissingNames) {
    const rosterEntry = roster.find((entry) => entry.name === name);
    if (!rosterEntry) continue;
    if (buildsBySlug.has(existingSlugOverrides[name] || rosterEntry.slug)) continue;

    const tycharaEntry = tycharaBySlug.get(rosterEntry.slug);
    const template = fallbackTemplates[rosterEntry.slug];
    if (!template) {
      throw new Error(`Missing fallback template for ${rosterEntry.name}.`);
    }

    const image = await downloadTycharaAsset(
      `https://tychara.com/StarSavior/characterimg/${path.basename(rosterEntry.image || `${rosterEntry.slug}.webp`)}`
    );

    const buildEntry = {
      name: rosterEntry.name,
      slug: rosterEntry.slug,
      role: template.role,
      modes: ["PvE", "PvP"],
      image,
      updatedAt: TODAY,
      sourceTabs: ["Tychara character guide", "Fallback build profile"],
      sourceContext: buildSourceContext(
        tycharaEntry.url,
        "Fallback build profile based on Tychara's character guide.",
        `Source page: ${rosterEntry.name} Guide - Star Savior | Tychara.`,
        "Tychara does not currently publish a dedicated build section for this unit, so this build uses the Tychara stat line and skill kit as its source."
      ),
      recommendedSets: template.recommendedSets,
      subStats: template.subStats,
      skillLevels: template.skillLevels,
      arcana: template.arcana,
      notes: template.notes
    };

    fallbackSnapshots.push(tycharaEntry);
    buildsBySlug.set(buildEntry.slug, buildEntry);
  }

  const orderedBuilds = roster
    .map((entry) => {
      const slug = existingSlugOverrides[entry.name] || entry.slug;
      return buildsBySlug.get(slug);
    })
    .filter(Boolean);

  if (orderedBuilds.length !== roster.length) {
    const missing = roster
      .filter((entry) => !buildsBySlug.get(existingSlugOverrides[entry.name] || entry.slug))
      .map((entry) => entry.name);
    throw new Error(`Build roster is incomplete. Missing entries: ${missing.join(", ")}`);
  }

  await ensureDir(path.dirname(OUTPUT_BUILD_ROSTER));
  await ensureDir(path.dirname(OUTPUT_TYCHARA_SNAPSHOT));
  await writeFile(OUTPUT_BUILD_ROSTER, `${JSON.stringify(orderedBuilds, null, 2)}\n`, "utf8");
  await writeFile(
    OUTPUT_TYCHARA_SNAPSHOT,
    `${JSON.stringify(
      {
        extractedAt: new Date().toISOString(),
        fallbackCount: fallbackSnapshots.length,
        fallbacks: fallbackSnapshots
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  console.log(`Wrote ${OUTPUT_BUILD_ROSTER}`);
  console.log(`Wrote ${OUTPUT_TYCHARA_SNAPSHOT}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
