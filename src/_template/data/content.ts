// @ts-nocheck
import exampleEntriesRaw from "../../content/{{SLUG}}/example.json";

export type ContentStatus = "draft" | "published" | "needs-review";

export interface ExampleEntry {
  slug: string;
  title: string;
  summary: string;
  status: ContentStatus;
}

function filterPublished<T extends { status: ContentStatus }>(entries: T[]): T[] {
  if (import.meta.env.PROD) {
    return entries.filter((entry) => entry.status === "published");
  }

  return entries;
}

export const exampleEntries = filterPublished(exampleEntriesRaw as ExampleEntry[]);
