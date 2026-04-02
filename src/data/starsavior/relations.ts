import { builds, guides, saviors, type BuildEntry, type GuideMeta, type TierEntry } from "./content";

export const buildBySlug = Object.fromEntries(builds.map((entry) => [entry.slug, entry])) as Record<string, BuildEntry>;
export const guideBySlug = Object.fromEntries(guides.map((entry) => [entry.slug, entry])) as Record<string, GuideMeta>;
export const saviorBySlug = Object.fromEntries(saviors.map((entry) => [entry.slug, entry])) as Record<string, TierEntry>;

export const tierOrder = ["T0", "SS", "S", "A", "B", "C", "NR"] as const;
export const arcanaTierOrder = ["SS", "S", "A", "B"] as const;

function canonical(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

const saviorSlugByName = Object.fromEntries(saviors.map((entry) => [canonical(entry.name), entry.slug])) as Record<string, string>;

const buildNameAliases: Record<string, string> = {
  "noble-princess-frey": "Frey Noble Princess",
  "bunnygirl-claire": "Bunnygirl Claire"
};

export const buildToSaviorTierSlug = Object.fromEntries(
  builds
    .map((build) => {
      const mappedName = buildNameAliases[build.slug] || build.name;
      const saviorSlug = saviorSlugByName[canonical(mappedName)];
      return saviorSlug ? ([build.slug, saviorSlug] as const) : null;
    })
    .filter((entry): entry is readonly [string, string] => Boolean(entry))
) as Record<string, string>;

export const buildToTierSearchQuery = Object.fromEntries(
  builds.map((build) => {
    const saviorSlug = buildToSaviorTierSlug[build.slug];
    return [build.slug, saviorSlug ? saviorBySlug[saviorSlug]?.name || build.name : build.name];
  })
) as Record<string, string>;

export const saviorToBuildSlug = Object.fromEntries(
  Object.entries(buildToSaviorTierSlug).map(([buildSlug, saviorSlug]) => [saviorSlug, buildSlug])
) as Record<string, string>;

export const guideToBuildSlugs: Record<string, string[]> = {
  reroll: ["lacy", "bunnygirl-claire", "noble-princess-frey"],
  "starter-guide": ["lacy", "charlotte", "lydia"],
  "team-building": ["charlotte", "muriel", "seira"],
  gear: ["charlotte", "asherah", "muriel", "bunnygirl-claire"],
  "increase-cp": ["lacy", "lydia", "muriel"],
  "hard-guide": ["charlotte", "muriel", "seira"],
  "hard-strategy": ["charlotte", "noble-princess-frey", "muriel"]
};

export const buildToGuideSlugs: Record<string, string[]> = {
  asherah: ["gear", "hard-guide"],
  "bunnygirl-claire": ["reroll", "gear", "hard-guide"],
  charlotte: ["gear", "hard-guide", "hard-strategy"],
  lacy: ["reroll", "starter-guide", "gear"],
  lydia: ["starter-guide", "increase-cp"],
  muriel: ["gear", "team-building", "hard-guide"],
  "noble-princess-frey": ["reroll", "gear", "hard-strategy"],
  roberta: ["team-building", "gear"],
  seira: ["team-building", "hard-guide"],
  tanya: ["team-building", "gear"]
};

export const popularSearches = [
  "Charlotte",
  "Lacy",
  "Muriel",
  "reroll",
  "gear sets",
  "journey hard",
  "Asherah Waltz"
];

export function getGuideUrl(guide: GuideMeta) {
  return guide.routeGroup === "journey" ? `/starsavior/journey/${guide.slug}/` : `/starsavior/guides/${guide.slug}/`;
}

export function getRelatedBuildsForGuide(guideSlug: string) {
  return (guideToBuildSlugs[guideSlug] || []).map((slug) => buildBySlug[slug]).filter(Boolean);
}

export function getRelatedGuidesForBuild(buildSlug: string) {
  return (buildToGuideSlugs[buildSlug] || []).map((slug) => guideBySlug[slug]).filter(Boolean);
}

export function getRelatedTierEntryForBuild(buildSlug: string) {
  const saviorSlug = buildToSaviorTierSlug[buildSlug];
  return saviorSlug ? saviorBySlug[saviorSlug] : undefined;
}

export function getBuildForSavior(saviorSlug: string) {
  const buildSlug = saviorToBuildSlug[saviorSlug];
  return buildSlug ? buildBySlug[buildSlug] : undefined;
}

export function formatDisplayDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export function getTierRank(tier: string, order: readonly string[]) {
  const index = order.indexOf(tier as never);
  return index === -1 ? order.length : index;
}
