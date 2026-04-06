export interface GuideMeta {
  title: string;
  slug: string;
  summary: string;
  updatedAt: string;
  category: string;
  routeGroup: string;
  sourceTabs: string[];
  sections: { id: string; title: string }[];
  status: "published" | "needs-review" | "draft";
}

function filterPublished<T extends { status: string }>(entries: T[]): T[] {
  return entries.filter((entry) => entry.status === "published");
}

const guideEntries: GuideMeta[] = [
  {
    title: "Ancient Inheritance Primer",
    slug: "ancient-inheritance-primer",
    summary:
      "A first-day guide for Ancient Inheritance in Epic Seven — what units to pick, what relics to look for, team building strategy, and guild coordination tips for Season 16.",
    updatedAt: "2026-04-06",
    status: "published",
    category: "starter",
    routeGroup: "guides",
    sourceTabs: ["TristenWulf YouTube — Ancient Inheritance Primer"],
    sections: [
      { id: "overview", title: "Overview" },
      { id: "element-strategy", title: "Element strategy" },
      { id: "unit-priorities", title: "Unit priorities" },
      { id: "solo-column-units", title: "Solo column units" },
      { id: "team-comps", title: "Team comps for bosses" },
      { id: "guild-coordination", title: "Guild coordination" }
    ]
  },
];

export const guides: GuideMeta[] = filterPublished(guideEntries);

export function getGuideBySlug(slug: string): GuideMeta | undefined {
  return guides.find((g) => g.slug === slug);
}

export function getRelatedBuildsForGuide(_slug: string): any[] {
  return [];
}
