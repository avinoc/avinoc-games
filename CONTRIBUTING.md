# Contributing

## Structure

The site is an Astro app with per-game sections layered on top of shared layouts and chrome.

- `src/pages/` contains routes.
- `src/layouts/` contains shared Astro layouts.
- `src/components/` contains shared components and game-specific UI.
- `src/content/<game-slug>/` contains content files such as JSON and MDX.
- `src/data/<game-slug>/` contains data loaders, transforms, and relations.
- `public/assets/<game-slug>/` contains static images and icons for that game.

Interactive tools that need client-side state should stay in React islands. Static guide and hub pages should stay in Astro unless there is a real interaction requirement.

## Adding A Game

Run:

```bash
npm run new-game -- --slug=<game-slug> --name="<Game Name>" --accent=<color>
```

The generator:

- copies the files from `src/_template/`
- creates `src/pages/<slug>/index.astro`
- creates matching `components`, `data`, `content`, and `styles` files
- creates `public/assets/<slug>/`
- registers the new game in `src/data/games.ts`

After generation:

1. Replace all placeholder copy.
2. Add real assets and a real icon.
3. Confirm the route labels in `src/data/games.ts`.
4. Preview the section locally.

## Content Workflow

Every content item should carry a `status` field:

- `draft`
- `needs-review`
- `published`

Rules:

- Default new content to `needs-review`.
- Only mark content `published` after a human has verified it.
- Production builds should render only `published` items.
- Local development may show all items, but non-published content should display a draft/review badge.

Track review progress in [CONTENT_AUDIT.md](/C:/Users/marks/Documents/ProjectAvinoc.com/avinoc-games/CONTENT_AUDIT.md).

## Adding Content

- JSON content belongs under `src/content/<game-slug>/`.
- MDX guides should include frontmatter with `title`, `description`, and `status`.
- Keep route slugs, filenames, and exported identifiers aligned.
- Do not invent factual game guidance without marking it `needs-review`.

## Adding A Tool Page

Use a React island when the page needs:

- persistent client state
- filtering/sorting controls
- saved user data
- charts or complex interactions

Use a static Astro page when the page is mostly:

- narrative copy
- link hubs
- image/text cards
- data already resolved at build time

## Naming Conventions

- Routes: kebab-case, one clear noun phrase per page
- Content files: kebab-case filenames
- CSS classes: game-prefixed blocks such as `.starsavior-landing__hero`
- Data helpers: named exports, no default export unless the file is a component entry

## Previewing Drafts

- Run `npm run dev` for local preview.
- Draft/review badges should only appear outside production.
- Before publishing, confirm that non-published content is filtered out.

## Deployment

Use the normal Astro build flow:

```bash
npm run build
```

The build also runs Pagefind indexing through `postbuild`. If build output changes significantly, review search coverage and shared navigation before deploying.
