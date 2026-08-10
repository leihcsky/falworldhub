# Palworld Hub

SEO-focused Palworld Breeding Calculator + Pal Database MVP.

Built with Next.js 15 (App Router), TypeScript, Tailwind CSS, and shadcn/ui.
All content is statically generated from local JSON files — no database in MVP.

## Features

- Breeding Calculator (`/breeding-calculator`)
  - Parents → Child lookup
  - Target Pal reverse lookup
  - Searchable Pal dropdown
- Pal Database (`/pals`, `/pals/[slug]`)
- Breeding SEO pages (`/breeding/[slug]`)
- Dynamic metadata, sitemap, robots.txt, and JSON-LD structured data

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm run start
```

## Project structure

```text
data/                     # JSON data sources (MVP)
src/
  app/                    # App Router pages (SSG)
  components/
    breeding/             # Calculator UI
    layout/               # Header / footer
    pals/                 # Pal cards / search / stats
    seo/                  # JSON-LD helpers
    ui/                   # shadcn/ui primitives
  lib/                    # SEO + breeding helpers
  repositories/           # Data access layer (JSON now, MySQL later)
  types/                  # Shared TypeScript models
public/images/pals/       # Pal image assets
```

## Data layer

MVP repositories read from:

- `data/pals.json` — dex pals (stats, elements, work, combiRank, images)
- `data/breeding.json` — unique recipe overrides + formula metadata
- `data/types.json` — element types
- `data/work-suitability.json` — work suitability enum map
- `data/skills.json` — active skills
- `data/meta.json` — current game version + data updated date (shown site-wide)

Pages and UI only talk to `src/repositories/*`, so a later MySQL migration can
replace repository implementations without rewriting routes/components.

### Import from FModel

After exporting game data with FModel:

```bash
npm run data:import -- --source "E:\1111\FModel\Output\Exports"
```

This regenerates `data/*.json` and copies pal icons into `public/images/pals/`.

Important: English copy must come from `L10N/en/.../Text/`.  
Base `Pal/DataTable/Text/*` is usually Japanese. If EN L10N is missing, descriptions/skill names stay empty unless you pass `--allow-jp-text`.

Breeding uses:
1. unique overrides from `DT_PalCombiUnique`
2. otherwise the CombiRank formula `floor((A + B + 1) / 2)` + nearest breedable pal

## Internationalization (i18n)

The app uses `next-intl` with a `[locale]` App Router segment.

- MVP locale: `en` only (default, no URL prefix)
- English URLs stay clean: `/breeding-calculator`, `/pals/anubis`
- UI copy lives in `messages/en.json`
- Routing config: `src/i18n/routing.ts`
- Locale-aware links: `@/i18n/navigation`

To add a language later (e.g. Japanese):

1. Add `"ja"` to `locales` in `src/i18n/routing.ts`
2. Add `localeNames.ja`
3. Create `messages/ja.json`
4. Rebuild — SSG, sitemap, and hreflang update automatically

## Environment

Copy `.env.example` to `.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=https://palworldhub.best
NEXT_PUBLIC_CONTACT_EMAIL=contact@palworldhub.best
```

## Deploy (Cloudflare Workers via OpenNext)

This app uses `@opennextjs/cloudflare` (not a static `out/` export). Classic Pages
settings that look for an `out` directory will fail.

### Cloudflare dashboard (Git integration)

Use a **Workers** project (not a static Pages site with output `out`).

Set these **exactly** under Build configuration:

| Field | Value |
| --- | --- |
| Node.js version | `22` |
| Build command | `npm run cf-build` |
| Deploy command | `npm run cf-deploy` |
| Non-production branch deploy command | `npm run cf-upload` |
| Build output directory | *(leave empty — do not use `out`)* |

Important:

- `npm run build` only runs `next build` and does **not** create `.open-next/`.
- Deploying with `npx wrangler deploy` often fails with  
  `Could not find compiled Open Next config`.
- `cf-build` must succeed first; `cf-deploy` / `cf-upload` consume that output.

Environment variables:

```bash
NEXT_PUBLIC_SITE_URL=https://palworldhub.best
NEXT_PUBLIC_CONTACT_EMAIL=contact@palworldhub.best
```

### Local deploy

```bash
npm run deploy
```

### Error 1102 (Worker exceeded resource limits)

Workers **Free** allows only ~**10ms CPU** per request. This app is SSG and uses
Workers Static Assets incremental cache + cache interception so prerendered pages
bypass the Next server. After changing `open-next.config.ts`, redeploy with
`npm run cf-build` then `npm run cf-deploy`.

If 1102 still appears on cold hits to heavy routes, upgrade to **Workers Paid**
($5/mo) or host on a VPS (`npm run build && npm run start`).
