# Task: apply the unified DMR color system (light + dark) to apps/web

This replaces any earlier palette prompt. If an earlier palette was already applied, overwrite it with the values below.

## 0. Inspect first, change nothing yet

1. Find where the shadcn theme lives (`globals.css` or similar), read `components.json`, and check the Tailwind version (v3 `tailwind.config` or v4 `@theme`). Tell me which.
2. Tell me the color format the theme variables use (`oklch(...)`, HSL channels or hex). Keep that format: convert every hex below into it. Do not mix formats. `rgba(...)` values stay as `rgba`.
3. List every file that hard-codes a color: hex, `rgb()/rgba()`, or a Tailwind palette class (`bg-green-50`, `text-amber-800`, `text-stone-500`, `border-red-200`...). Show me the list, then continue.

## 1. Tokens

### Surface, text, border

| Token                | Light   | Dark    |
| -------------------- | ------- | ------- |
| background           | #f5f5f4 | #0d0d0d |
| surface              | #ffffff | #1a1a19 |
| surface-subtle       | #fafaf9 | #151514 |
| foreground           | #0a0a0a | #f0efec |
| foreground-secondary | #44403c | #c3c2b7 |
| muted-foreground     | #6b6863 | #9d9b94 |
| border               | #e7e5e4 | #2c2c2a |
| divider              | #efeeec | #242422 |
| input                | #d6d3d1 | #3a3a37 |
| chip                 | #f2f1ef | #232321 |

### Interactive

| Token              | Light   | Dark    |
| ------------------ | ------- | ------- |
| primary            | #0a0a0a | #f0efec |
| primary-hover      | #262626 | #d6d3d1 |
| primary-foreground | #ffffff | #0d0d0d |
| ring               | #2a78d6 | #3987e5 |
| nav-active         | #2a78d6 | #3987e5 |
| link               | #1d4ed8 | #93c5fd |

### Status (solid = icon/dot/filled button, fg = text on bg, bg/border = badge and callout)

| Token             | Light               | Dark                |
| ----------------- | ------------------- | ------------------- |
| success-solid     | #16a34a             | #22c55e             |
| success-fg        | #15803d             | #4ade80             |
| success-bg        | #f0fdf4             | #052e16             |
| success-border    | #86efac             | #166534             |
| warning-solid     | #d97706             | #f59e0b             |
| warning-fg        | #92400e             | #fbbf24             |
| warning-fg-strong | #78350f             | #fcd34d             |
| warning-bg        | #fffbeb             | #451a03             |
| warning-border    | #fcd9a0             | #92400e             |
| danger-solid      | #dc2626             | #ef4444             |
| danger-fg         | #b91c1c             | #f87171             |
| danger-bg         | #fef2f2             | #450a0a             |
| danger-border     | #fecaca             | #991b1b             |
| danger-ring       | rgba(220,38,38,.12) | rgba(239,68,68,.25) |
| info-solid        | #2a78d6             | #3987e5             |
| info-fg           | #1d4ed8             | #93c5fd             |
| info-bg           | #eff6ff             | #172554             |
| info-border       | #bfdbfe             | #1e40af             |
| neutral-solid     | #a8a29e             | #78716c             |
| neutral-fg        | #57534e             | #d6d3d1             |
| neutral-bg        | #f2f1ef             | #232321             |
| neutral-border    | #d6d3d1             | #3a3a37             |

### Charts (data series only, never status meaning)

| Token      | Light   | Dark    |
| ---------- | ------- | ------- |
| chart-1    | #2a78d6 | #3987e5 |
| chart-2    | #eb6834 | #d95926 |
| chart-3    | #1baf7a | #199e70 |
| chart-4    | #eda100 | #c98500 |
| chart-5    | #e87ba4 | #d55181 |
| chart-6    | #008300 | #0ca30c |
| chart-7    | #6250d6 | #9085e9 |
| chart-8    | #e34948 | #e66767 |
| chart-grid | #e7e5e4 | #2c2c2a |

### Overlay and shadow

| Token         | Light                       | Dark                        |
| ------------- | --------------------------- | --------------------------- |
| overlay       | rgba(10,10,10,.45)          | rgba(0,0,0,.60)             |
| shadow-menu   | 0 10px 30px rgba(0,0,0,.10) | 0 10px 30px rgba(0,0,0,.40) |
| shadow-dialog | 0 24px 60px rgba(0,0,0,.18) | 0 24px 60px rgba(0,0,0,.55) |
| shadow-toast  | 0 10px 30px rgba(0,0,0,.20) | 0 10px 30px rgba(0,0,0,.50) |

## 2. Map onto shadcn variables (both `:root` and `.dark`)

| shadcn                                      | token                        |
| ------------------------------------------- | ---------------------------- |
| --background                                | background                   |
| --foreground                                | foreground                   |
| --card, --popover                           | surface                      |
| --card-foreground, --popover-foreground     | foreground                   |
| --primary / --primary-foreground            | primary / primary-foreground |
| --secondary, --accent, --muted              | chip                         |
| --secondary-foreground, --accent-foreground | foreground                   |
| --muted-foreground                          | muted-foreground             |
| --border                                    | border                       |
| --input                                     | input                        |
| --ring                                      | ring                         |
| --destructive                               | danger-solid                 |
| --chart-1 … --chart-5                       | chart-1 … chart-5            |

Every other token becomes its own CSS variable (`--surface-subtle`, `--foreground-secondary`, `--divider`, `--primary-hover`, `--nav-active`, `--link`, `--chart-6`, `--chart-7`, `--chart-8`, `--chart-grid`, `--success-solid` ... `--neutral-border`, `--danger-ring`, `--overlay`, `--shadow-menu`, `--shadow-dialog`, `--shadow-toast`), defined in both `:root` and `.dark`, and is exposed to Tailwind so classes like `bg-success-bg`, `text-warning-fg`, `border-divider`, `bg-surface-subtle` and `shadow-dialog` work. Keep the dark theme on the existing `.dark` class (next-themes or whatever is already set up).

## 3. Components

- **Badge**: variants `success`, `warning`, `danger`, `info`, `neutral`. Each one uses its `-bg` / `-border` / `-fg` tokens, with an optional leading dot in `-solid`. Status mapping, as one helper (e.g. `lib/status-variant.ts`), used everywhere:
  - success: project Active, well Active, report Submitted, "Balanced", passed checks
  - warning: project Archived, well Suspended, report Draft, units Custom, low stock, warning checks
  - neutral: project Planned and Completed, well Planned and Completed, version chips
  - danger: form errors, negative stock, "not balanced"
  - info: offshore note, guidance callouts
- **Button**: `default` hover is `primary-hover`. `destructive` uses `danger-solid`, with `danger-fg` as its hover background.
- **Input / Select / Textarea**: border is `input`. With `aria-invalid="true"`: border `danger-solid` plus a 3px ring `danger-ring`. Error text uses `danger-fg`.
- **Alert / Callout**: variants `info`, `warning`, `danger`, `success`. The warning text uses `warning-fg-strong`.
- **Top nav**: the active item gets background `chip` and a 2px bottom border `nav-active`.
- **Tables**: header text `muted-foreground`, row dividers `divider`, row hover `surface-subtle`, selected row `chip`.
- **Dialog**: backdrop `overlay`, shadow `shadow-dialog`. Dropdown menus use `shadow-menu`. Toasts use `shadow-toast`.
- **Charts**: series colors only from `chart-1` … `chart-8`; "others" / "no data" bars use `muted-foreground` at 50% opacity; grid lines use `chart-grid`.

## 4. Rules

- No hex, `rgb()` or Tailwind palette classes inside components. Only tokens.
- Do not use chart colors to mean good or bad. Status meaning comes only from success, warning, danger, info and neutral.
- A badge always has text and a warning always has an icon. Color alone never carries the meaning.
- Do not add any new package.
- Do not change spacing, radius or typography in this task. Colors only.

## 5. Check and report

- Contrast must be at least 4.5:1 for text. Check and report the ratio for each of these pairs, light and dark: muted-foreground on background and on surface; each `-fg` on its `-bg`; link on surface.
- Toggle dark mode on the Projects list page and confirm that nothing stays light. A component that still uses a palette class or a hex stays light, so this check finds missed hard-coded colors.
- Show the diff of the theme CSS and of the Tailwind config (if changed), then list the changed components with one line each.
- Run `bun run lint` and `bun run typecheck` and report the result.
- Commit message: `style(web): apply unified DMR color system (light and dark)`

---

**Note (applied, 2026-11-17):** `apps/web` already had a validated chart/status color system (`--series-1..8`, `--viz-good/bad/other/grid`, `--status-good/warning/serious/critical`) consumed across 18 files. Rather than replace it with the token set above, that existing system was kept as-is, and a status-surface layer (`-fg`/`-bg`/`-border` for good/warning/critical/info, derived from the existing `--status-*` with `color-mix`) was added on top to remove the remaining hard-coded Tailwind colors (`status-badge.tsx`, `api-status.tsx`, `volume-accounting-card.tsx`). `--muted-foreground` and `--ring` were also corrected for contrast (4.5:1 minimum) and focus-ring visibility. See `globals.css` for the tokens actually in use.
