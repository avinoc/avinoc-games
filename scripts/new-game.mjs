import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, ...rest] = arg.split("=");
    return [key.replace(/^--/, ""), rest.join("=")];
  }),
);

const slug = args.slug?.trim();
const name = args.name?.trim();
const accent = args.accent?.trim() || "#4A90D9";

if (!slug || !name) {
  console.error('Usage: npm run new-game -- --slug=<game-slug> --name="<Game Name>" --accent=<color>');
  process.exit(1);
}

const root = process.cwd();
const templateRoot = path.join(root, "src", "_template");

const replacements = new Map([
  ["{{SLUG}}", slug],
  ["{{NAME}}", name],
  ["{{ACCENT}}", accent],
]);

const templateTargets = [
  {
    from: path.join(templateRoot, "pages", "index.astro"),
    to: path.join(root, "src", "pages", slug, "index.astro"),
  },
  {
    from: path.join(templateRoot, "components", "ExampleCard.astro"),
    to: path.join(root, "src", "components", slug, "ExampleCard.astro"),
  },
  {
    from: path.join(templateRoot, "data", "content.ts"),
    to: path.join(root, "src", "data", slug, "content.ts"),
  },
  {
    from: path.join(templateRoot, "content", "example.json"),
    to: path.join(root, "src", "content", slug, "example.json"),
  },
  {
    from: path.join(templateRoot, "styles", "game.css"),
    to: path.join(root, "src", "styles", `${slug}.css`),
  },
];

function applyReplacements(source) {
  let output = source;

  for (const [token, value] of replacements) {
    output = output.replaceAll(token, value);
  }

  return output;
}

async function writeTemplateFile(templatePath, targetPath) {
  const source = await readFile(templatePath, "utf8");
  const content = applyReplacements(source);

  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, content, { flag: "wx" });
}

async function ensureAssetsDirectory() {
  const assetDir = path.join(root, "public", "assets", slug);
  await mkdir(assetDir, { recursive: true });
  await writeFile(path.join(assetDir, ".gitkeep"), "", { flag: "wx" });
}

async function updateGamesRegistry() {
  const gamesPath = path.join(root, "src", "data", "games.ts");
  const current = await readFile(gamesPath, "utf8");

  if (current.includes(`slug: "${slug}"`)) {
    throw new Error(`Game slug "${slug}" already exists in src/data/games.ts`);
  }

  const entry = `  {\n    id: "${slug}",\n    name: "${name}",\n    slug: "${slug}",\n    description: "Replace with reviewed ${name} copy.",\n    status: "active",\n    accentColor: "${accent}",\n    icon: "/assets/${slug}/icon.png",\n    routes: [\n      { label: "Overview", href: "/${slug}/" },\n    ],\n  },\n`;

  const updated = current.replace("export const games: GameEntry[] = [\n", `export const games: GameEntry[] = [\n${entry}`);

  if (updated === current) {
    throw new Error("Failed to update src/data/games.ts");
  }

  await writeFile(gamesPath, updated);
}

async function main() {
  for (const target of templateTargets) {
    await writeTemplateFile(target.from, target.to);
  }

  await ensureAssetsDirectory();
  await updateGamesRegistry();

  console.log(`Created game scaffold for ${name} (${slug}).`);
  console.log("");
  console.log("Next steps:");
  console.log(`- Review src/data/games.ts and set a real description/icon for ${slug}.`);
  console.log(`- Replace placeholder copy in src/pages/${slug}/index.astro.`);
  console.log(`- Add reviewed content under src/content/${slug}/.`);
  console.log(`- Add real assets under public/assets/${slug}/.`);
  console.log(`- Verify the section locally with npm run dev before publishing.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
