# Content Audit Checklist

Default rule: every descriptive string on the site is treated as `needs-review` until a human maintainer verifies it against the actual game.

| Area | Path / Source | Content To Review | Status | Notes |
| --- | --- | --- | --- | --- |
| Hub | `src/pages/index.astro` | Hero tagline, homepage search placeholder, all homepage game-card descriptions | `needs-review` | Homepage copy looks plausible but is not verified. |
| Shared chrome | `src/components/shared/SiteHeader.astro` | Nav labels, shared utility labels | `needs-review` | Shared UI labels should be reviewed once globally. |
| Shared chrome | `src/components/shared/SiteFooter.astro` | Footer descriptions, game-column labels, legal/support copy | `needs-review` | Footer now covers all game sections. |
| StarSavior landing | `src/pages/starsavior/index.astro` | Hero summary, resource-card copy, sidebar descriptions, quick-jump labels | `needs-review` | Review all descriptive blurbs even if they resemble real guide topics. |
| StarSavior start-here | `src/pages/starsavior/start-here/index.astro` | Route descriptions, card summaries, onboarding copy | `needs-review` | Confirm sequence and wording against the intended guide path. |
| StarSavior guides | `src/content/starsavior/guides/*.mdx` | Frontmatter titles/descriptions, intros, guide body copy | `needs-review` | All guide MDX now has `status`; publication should wait for human review. |
| StarSavior builds | `src/content/starsavior/builds/*.json` | Build summaries, notes, role labels, recommended-set descriptions | `needs-review` | Validate against the cited sheet/source. |
| StarSavior saviors | `src/content/starsavior/saviors/*.json` | Summary text, tags, tier notes, roster descriptions | `needs-review` | Includes tier-board side-panel text. |
| StarSavior arcana | `src/content/starsavior/arcana/*.json` | Arcana names, descriptions, ranking notes | `needs-review` | Confirm each item and recommendation. |
| StarSavior tier lists | `src/pages/starsavior/tier-lists/saviors.astro` | Tier descriptions, sidebar explanatory copy, roster-pairing copy | `needs-review` | Current wording is likely AI-authored. |
| StarSavior tier lists | `src/pages/starsavior/tier-lists/arcana.astro` | Arcana descriptions, helper copy, filter text | `needs-review` | Keep aligned with source sheet terminology. |
| Infinite Lagrange landing | `src/pages/lagrange/index.astro` | Dashboard summary, capability-card descriptions, planner module copy | `needs-review` | Only live-tool copy should stay public. |
| Infinite Lagrange fleet builder | `src/components/lagrange/FleetBuilder.tsx` | UI helper copy, button labels, empty states, stat labels | `needs-review` | Ship names/data also need separate review. |
| Infinite Lagrange ships | `src/data/lagrange/ships.ts` | Ship names, classes, tiers, CP values | `needs-review` | Treat the whole registry as unverified until checked against the game. |
| Chaos Zero landing | `src/pages/chaoszero/index.astro` | Hero summary, panel headings, strategy notes, sidebar labels | `needs-review` | Event framing is data-backed, descriptive text is not yet verified. |
| Chaos Zero event scores | `src/pages/chaoszero/event-scores/index.astro` | Viewer intro copy, sheet summaries, section notes | `needs-review` | Screenshot data is real, narrative copy still needs review. |
| Chaos Zero event data | `src/data/chaoszero/event-scores.ts` | Build summaries, team summaries, focus labels | `needs-review` | Scores/images are structured; the descriptive prose still needs validation. |

## Review Workflow

1. Confirm the page or source file against the actual game, spreadsheet, or maintainer-owned notes.
2. Change the relevant content status from `needs-review` to `published` only after verification.
3. Update this checklist row to `reviewed` once the full area is complete.
4. If anything is placeholder or uncertain, mark it `draft` and keep it out of production.
