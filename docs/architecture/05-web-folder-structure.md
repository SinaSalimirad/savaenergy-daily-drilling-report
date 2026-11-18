# Web folder structure

How `apps/web/src` is organized. The rule of thumb: **`app/` decides the URL, `features/` holds the logic, `components/` holds what is shared.**

```
apps/web/src/
├── app/                      # Routing only. Thin page.tsx / layout.tsx files.
│   ├── layout.tsx
│   ├── page.tsx
│   └── (panel)/              # Route group: pages with the header, navbar and breadcrumb
│       ├── layout.tsx
│       └── dashboard/        # One folder per menu section, one per menu item
├── features/                 # One folder per domain (created when the first feature is built)
│   └── <domain>/
│       ├── components/       # UI used only by this domain
│       ├── api.ts            # TanStack Query hooks (queries and mutations)
│       ├── query-keys.ts     # Query key factory for this domain
│       └── schemas.ts        # zod schemas for forms and responses
├── components/
│   ├── ui/                   # shadcn components only. Add with `shadcn add`, do not hand-edit
│   └── layout/               # Shared page chrome: navbar, breadcrumb, placeholder
├── lib/                      # utils, API client, env validation
├── hooks/                    # Hooks that are not tied to one domain
├── styles/
├── fonts/
└── assets/
```

## Rules

- **`app/` stays thin.** A `page.tsx` renders a component from `features/<domain>/components` and nothing more. Changing a URL then never means moving logic.
- **Routes come from the menu.** The menu data lives in `components/layout/nav-sections.ts`. Every section and item there needs a matching folder under `app/(panel)/dashboard`. Item hrefs are derived from their labels (`"BHA & bit"` becomes `bha-bit`), so renaming a label also means renaming its folder.
- **Section pages redirect.** A section page (for example `/dashboard/hydraulics`) redirects to its first item. `/dashboard` is the exception: it is the overview page and also the "Overview" item of the Dashboard section.
- **Not-built-yet pages** render `PagePlaceholder`. Replace the body with the feature component when the feature is built.
- **A domain is one folder.** Everything for daily reports (components, queries, schemas) lives in `features/daily-reports`. Do not spread it over `components/`, `hooks/` and `services/`.
- **No business logic in the web app.** Calculations and formulas live in the API. A feature only displays the results.
- **API types are not copied by hand.** Import them from the shared contract (Eden Treaty or a shared package), so an API change breaks the web typecheck instead of production.
- **`components/ui` is generated code.** Keep it formatted with `bunx biome check --write` after `shadcn add`, because CI runs `biome ci .`.

## Why not a type-based layout

A root `components/`, `hooks/` and `services/` is simpler at first. With nine menu domains, the files of one feature end up in four folders, and changing one feature means opening all of them. Feature folders keep a change local.

## Adding a page

1. Add the section or item in `nav-sections.ts`.
2. Create the matching folder and `page.tsx` under `app/(panel)/dashboard`.
3. Build the feature in `features/<domain>` and render it from the page.
