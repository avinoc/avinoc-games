import buildRoster from "../../content/starsavior/build-roster.json";

import saviorRoster from "../../content/starsavior/saviors/roster.json";

import aKnightsOath from "../../content/starsavior/arcana/a-knights-oath.json";
import asCuteAsKyra from "../../content/starsavior/arcana/as-cute-as-kyra.json";
import divineJudgement from "../../content/starsavior/arcana/divine-judgement.json";
import indomitableMasterpiece from "../../content/starsavior/arcana/indomitable-masterpiece.json";
import madeByPetra from "../../content/starsavior/arcana/made-by-petra.json";
import noGainNoPain from "../../content/starsavior/arcana/no-gain-no-pain.json";
import nostalgiaStrikesBack from "../../content/starsavior/arcana/nostalgia-strikes-back.json";
import perfectBunnyGirl from "../../content/starsavior/arcana/perfect-bunny-girl.json";
import underTheGlassMoon from "../../content/starsavior/arcana/under-the-glass-moon.json";

export interface GuideMeta {
  title: string;
  slug: string;
  summary: string;
  updatedAt: string;
  status: ContentStatus;
  category: "starter" | "progression" | "combat" | "systems" | "journey";
  routeGroup: "guides" | "journey";
  sourceTabs: string[];
  sections: { id: string; title: string }[];
}



export type ContentStatus = "draft" | "published" | "needs-review";

export interface SourceContext {
  url: string;
  lead: string;
  citationText: string;
  reviewedAgainst?: string[];
  attributionNote?: string;
  permissionNote?: string;
}

export interface PremiumBuildAction {
  href: string;
  label: string;
  tone?: "primary" | "secondary";
}

export interface PremiumBuildGuide {
  slug: string;
  updatedAt: string;
  status: ContentStatus;
  sourceTabs: string[];
  sourceContext?: SourceContext | null;
  hero: {
    title: string;
    subhead?: string;
    summary: string;
    image?: string;
    ratings: { label: string; value: string }[];
    actions: PremiumBuildAction[];
  };
  combatIdentity: {
    title: string;
    summary: string;
    bullets: string[];
  };
  skillRotation: {
    title: string;
    summary: string;
    steps: { step: string; title: string; detail: string }[];
  };
  buildPlanner: {
    id: string;
    title: string;
    summary: string;
    tag?: string;
    sets: { label: string; value: string; note: string }[];
    priorities: string[];
  };
  teamDrafts?: {
    id: string;
    title: string;
    summary: string;
    label: string;
    team: string;
    note: string;
    members: { name: string; image: string }[];
  };
  targetStats?: {
    id: string;
    kicker: string;
    summary: string;
    stats: { label: string; value: string }[];
  };
  upgradePath?: {
    kicker: string;
    title: string;
    items: string[];
  };
  journeyHard?: {
    id: string;
    kicker: string;
    title: string;
    summary: string;
    cards: { name: string; slot: string; image: string }[];
  };
  skillCards?: {
    id: string;
    kicker: string;
    defaultTabId?: string;
    items: { id: string; label: string; title: string; summary: string }[];
  };
}

export interface BuildEntry {
  name: string;
  slug: string;
  role: string;
  modes: string[];
  image?: string;
  setIcons?: {
    budget: string[];
    endgame: string[];
    alternate?: string[];
  };
  updatedAt: string;
  sourceTabs: string[];
  recommendedSets: { label: string; sets: string[]; neckMain: string; ringMain: string; notes?: string }[];
  subStats: string[];
  skillLevels: { budget: string; endgame: string; progression: string[] };
  arcana: string[];
  journeyNormal?: {
    cards: { name: string; image?: string }[];
    training?: { name: string; image?: string } | null;
  };
  journeyHard?: {
    talisman?: {
      label: string;
      owner?: string;
      guideIcon?: string;
      pieces: { name: string; image?: string }[];
    } | null;
    cards: { name: string; image?: string }[];
    alternate?: {
      label: string;
      cards: { name: string; image?: string }[];
    } | null;
  };
  talismans?: { journeyNormal?: string; journeyHard?: string };
  sourceContext?: SourceContext | null;
  notes: string[];
  status: ContentStatus;
}

export interface TierEntry {
  name: string;
  slug: string;
  tier: string;
  mode: string;
  tags: string[];
  summary: string;
  image?: string;
  updatedAt: string;
  sourceTabs: string[];
  status: ContentStatus;
}

export interface ArcanaEntry {
  name: string;
  slug: string;
  tier: string;
  class: string;
  specialPotential?: string;
  summary: string;
  image?: string;
  tags: string[];
  updatedAt: string;
  sourceTabs: string[];
  status: ContentStatus;
}

function filterPublished<T extends { status: ContentStatus }>(entries: T[]): T[] {
  return import.meta.env.PROD ? entries.filter((entry) => entry.status === "published") : entries;
}

export const sourceMeta = {
  name: "Bullet Star Savior Complete Guide",
  sheetUrl: "https://docs.google.com/spreadsheets/d/1W1nl3zfBdrgNCjLCVt7lBn0UzuwPLVnF2JkC4iamRic/htmlview",
  lastReviewed: "2026-03-30",
  citationText: "Source sheet: [Bullet] Star Savior Complete Guide by Bullet (published Google Sheet).",
  permissionNote:
    "If you plan to include content from this Google Sheet in another guide, you must obtain permission through Discord and clearly cite the source."
} as const;

const guideEntries: GuideMeta[] = [
  {
    title: "Reroll Guide",
    slug: "reroll",
    summary:
      "A cleaner English reroll route built from the published guide sheet, focused on realistic targets and what actually matters on a fresh global account.",
    updatedAt: "2026-03-30",
    status: "needs-review",
    category: "starter",
    routeGroup: "guides",
    sourceTabs: ["Reroll Guide"],
    sections: [
      { id: "is-rerolling-worth-it", title: "Is rerolling worth it?" },
      { id: "character-reroll-targets", title: "Character reroll targets" },
      { id: "arcana-reroll-targets", title: "Arcana reroll targets" },
      { id: "quick-summary", title: "Quick summary" }
    ]
  },
  {
    title: "Starter Guide",
    slug: "starter-guide",
    summary:
      "A clean first-week route through the starter tab, covering mileage, selectors, early task order, and the account decisions that are easiest to get wrong.",
    updatedAt: "2026-03-30",
    status: "needs-review",
    category: "starter",
    routeGroup: "guides",
    sourceTabs: ["Starter's Guide"],
    sections: [
      { id: "first-things-to-do", title: "First things to do" },
      { id: "mileage-and-gacha-strategy", title: "Mileage and gacha strategy" },
      { id: "selector-priorities", title: "Selector priorities" },
      { id: "quasar-core-guidance", title: "Quasar Core guidance" },
      { id: "first-week-checklist", title: "First-week checklist" }
    ]
  },
  {
    title: "Team Building",
    slug: "team-building",
    summary:
      "The launch translation of the team-building tab, cleaned into role rules, attribute shells, and early-game roster limits that are easier to act on.",
    updatedAt: "2026-03-30",
    status: "needs-review",
    category: "combat",
    routeGroup: "guides",
    sourceTabs: ["Team Building"],
    sections: [
      { id: "formation-rules", title: "Formation rules" },
      { id: "roster-width", title: "How many units to build" },
      { id: "early-pve-shells", title: "Early PvE shells" },
      { id: "attribute-teams", title: "Attribute-based teams" },
      { id: "cosmo-gate-notes", title: "Cosmo Gate notes" }
    ]
  },
  {
    title: "Gear Guide",
    slug: "gear",
    summary:
      "A cleaned English version of the gear tab, focused on what to farm, what to enhance, and which set families matter for early and mid-game accounts.",
    updatedAt: "2026-03-30",
    status: "needs-review",
    category: "systems",
    routeGroup: "guides",
    sourceTabs: ["Gear Guide (ENG)"],
    sections: [
      { id: "how-to-obtain-gear", title: "How to obtain gear" },
      { id: "early-enhancement-rules", title: "Early enhancement rules" },
      { id: "neck-and-ring-main-stats", title: "Neck and ring main stats" },
      { id: "hunt-quest-set-priority", title: "Hunt quest set priority" },
      { id: "tier-two-transition", title: "Transitioning into Tier 2" }
    ]
  },
  {
    title: "Increase Combat Power",
    slug: "increase-cp",
    summary:
      "A cleaned progression page based on the CP tab, focused on which upgrades give the biggest returns and which ones are mostly marginal.",
    updatedAt: "2026-03-30",
    status: "needs-review",
    category: "progression",
    routeGroup: "guides",
    sourceTabs: ["How to increase CP (ENG)"],
    sections: [
      { id: "highest-impact-cp-sources", title: "Highest-impact CP sources" },
      { id: "medium-impact-upgrades", title: "Medium-impact upgrades" },
      { id: "low-impact-upgrades", title: "Low-impact upgrades" },
      { id: "recommended-order", title: "Recommended order" }
    ]
  },
  {
    title: "Journey: Hard Guide",
    slug: "hard-guide",
    summary:
      "The main English Journey: Hard tab, rewritten into practical checkpoints for resonance, training, shop routing, hunt execution, and condition management.",
    updatedAt: "2026-03-30",
    status: "needs-review",
    category: "journey",
    routeGroup: "journey",
    sourceTabs: ["Journey(Hard) Guide"],
    sections: [
      { id: "resonance-and-entry-check", title: "Resonance and entry check" },
      { id: "best-starter-saviors", title: "Best starter Saviors" },
      { id: "arcana-and-training", title: "Arcana and training" },
      { id: "shop-and-hunt-rules", title: "Shop and hunt rules" },
      { id: "condition-management", title: "Condition management" }
    ]
  },
  {
    title: "Journey: Hard Strategy Guide",
    slug: "hard-strategy",
    summary:
      "The dense strategy tab translated into a cleaner reference for special potential crafting, charm reward choices, and character-specific Journey planning.",
    updatedAt: "2026-03-30",
    status: "needs-review",
    category: "journey",
    routeGroup: "journey",
    sourceTabs: ["Journey(Hard) Strategy Guide"],
    sections: [
      { id: "what-this-page-is-for", title: "What this page is for" },
      { id: "special-potential-basics", title: "Special potential basics" },
      { id: "hunt-reward-selection", title: "Hunt reward selection" },
      { id: "role-based-talisman-logic", title: "Role-based talisman logic" },
      { id: "how-to-use-this-reference", title: "How to use this reference" }
    ]
  }
];

export const guides: GuideMeta[] = filterPublished(guideEntries);


export const builds: BuildEntry[] = filterPublished(buildRoster as BuildEntry[]);

const premiumBuildModules = import.meta.glob("../../content/starsavior/premium-builds/*.json", {
  eager: true,
  import: "default"
});

const premiumBuildEntries = Object.values(premiumBuildModules) as PremiumBuildGuide[];

export const premiumBuilds: PremiumBuildGuide[] = filterPublished(premiumBuildEntries);

const premiumBuildsBySlug = new Map(premiumBuilds.map((entry) => [entry.slug, entry]));

export function getPremiumBuildGuide(slug: string): PremiumBuildGuide | undefined {
  return premiumBuildsBySlug.get(slug);
}

export const saviors: TierEntry[] = filterPublished(saviorRoster as TierEntry[]);

const arcanaEntries = [
  aKnightsOath,
  asCuteAsKyra,
  divineJudgement,
  indomitableMasterpiece,
  madeByPetra,
  noGainNoPain,
  nostalgiaStrikesBack,
  perfectBunnyGirl,
  underTheGlassMoon
] as ArcanaEntry[];

export const arcana: ArcanaEntry[] = filterPublished(arcanaEntries);
