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
  category: "starter" | "progression" | "combat" | "systems" | "journey";
  routeGroup: "guides" | "journey";
  sourceTabs: string[];
  sections: { id: string; title: string }[];
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
  sourceContext?: {
    url: string;
    lead: string;
    citationText: string;
    permissionNote?: string;
  } | null;
  notes: string[];
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
}

export const sourceMeta = {
  name: "Bullet StarSavior Complete Guide",
  sheetUrl: "https://docs.google.com/spreadsheets/d/1W1nl3zfBdrgNCjLCVt7lBn0UzuwPLVnF2JkC4iamRic/htmlview",
  lastReviewed: "2026-03-30",
  citationText: "Source sheet: [Bullet] StarSavior Complete Guide by Bullet (published Google Sheet).",
  permissionNote:
    "If you plan to include content from this Google Sheet in another guide, you must obtain permission through Discord and clearly cite the source."
} as const;

export const guides: GuideMeta[] = [
  {
    title: "Reroll Guide",
    slug: "reroll",
    summary:
      "A cleaner English reroll route built from the published guide sheet, focused on realistic targets and what actually matters on a fresh global account.",
    updatedAt: "2026-03-30",
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

export const builds: BuildEntry[] = buildRoster;

export const saviors: TierEntry[] = saviorRoster;

export const arcana: ArcanaEntry[] = [
  aKnightsOath,
  asCuteAsKyra,
  divineJudgement,
  indomitableMasterpiece,
  madeByPetra,
  noGainNoPain,
  nostalgiaStrikesBack,
  perfectBunnyGirl,
  underTheGlassMoon
];
