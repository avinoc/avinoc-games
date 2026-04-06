export interface GameEntry {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: "active" | "coming-soon" | "archived";
  accentColor: string;
  icon: string;
  routes: {
    label: string;
    href: string;
  }[];
}

export const games: GameEntry[] = [
  {
    id: "starsavior",
    name: "Star Savior",
    slug: "starsavior",
    description: "Builds, tier lists, and progression guides sourced from Bullet's strategy sheet",
    status: "active",
    accentColor: "blue",
    icon: "/assets/starsavior/icon.png",
    routes: [
      { label: "Start Here", href: "/starsavior/start-here/" },
      { label: "Builds", href: "/starsavior/builds/" },
      { label: "Tier Lists", href: "/starsavior/tier-lists/saviors" },
      { label: "Guides", href: "/starsavior/guides/" },
    ],
  },
  {
    id: "lagrange",
    name: "Infinite Lagrange",
    slug: "lagrange",
    description: "Fleet composition planner with CP tracking and fleet sharing",
    status: "active",
    accentColor: "cyan",
    icon: "/assets/lagrange/icon.png",
    routes: [
      { label: "Fleet Builder", href: "/lagrange/fleet-builder" },
    ],
  },
  {
    id: "chaoszero",
    name: "Chaos Zero",
    slug: "chaoszero",
    description: "Nightmare mode high scores, character builds, and event archives",
    status: "active",
    accentColor: "pink",
    icon: "/assets/chaoszero/icon.png",
    routes: [
      { label: "Event Scores", href: "/chaoszero/event-scores/" },
      { label: "Full Scale Offensive", href: "/chaoszero/full-scale-offensive/" },
      { label: "Builds", href: "/chaoszero/builds/" },
      { label: "Card Overlap", href: "/chaoszero/card-overlap/" },
    ],
  },
  {
    id: "epicseven",
    name: "Epic Seven",
    slug: "epicseven",
    description: "Tools, guides, and database information for Epic Seven",
    status: "coming-soon",
    accentColor: "orange",
    icon: "/assets/epicseven/icon.png",
    routes: [],
  },
];

export function getGameBySlug(slug: string): GameEntry | undefined {
  return games.find((g) => g.slug === slug);
}

export function getActiveGames(): GameEntry[] {
  return games.filter((g) => g.status === "active");
}

export function getGameFromPath(pathname: string): GameEntry | undefined {
  const segment = pathname.split("/").filter(Boolean)[0];
  return segment ? getGameBySlug(segment) : undefined;
}
