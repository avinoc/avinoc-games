import { games, type GameEntry } from "./games";

export interface NavItem {
  href: string;
  label: string;
}

export const hubNav: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/search/", label: "Search" },
  { href: "/about/", label: "About" },
];

export function getGameNav(game: GameEntry): NavItem[] {
  return game.routes;
}

export function getAllNavItems(): NavItem[] {
  return [
    ...hubNav,
    ...games.flatMap((game) =>
      game.routes.map((route) => ({
        ...route,
        label: `${game.name}: ${route.label}`,
      }))
    ),
  ];
}
