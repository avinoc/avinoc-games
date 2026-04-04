import { type SavedFleetMeta } from "@/types/savedFleet";

const STORAGE_KEY = "savedFleets";

export function getSavedFleets(): SavedFleetMeta[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedFleetMeta[];
  } catch {
    return [];
  }
}

export function addSavedFleet(meta: SavedFleetMeta): void {
  const fleets = getSavedFleets().filter((f) => f.id !== meta.id);
  fleets.unshift(meta);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fleets));
}

export function removeSavedFleet(id: string): void {
  const fleets = getSavedFleets().filter((f) => f.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fleets));
}
