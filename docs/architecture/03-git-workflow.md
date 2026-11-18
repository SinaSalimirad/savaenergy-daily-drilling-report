# Git workflow

Short-lived branches off `main`, merged back through pull requests. No `develop` branch and no long-lived release branches.

## Branches

- `main` is always in a working state: it passes `lint` and `typecheck` and can be deployed.
- Never commit directly to `main`. Work happens on a branch and is merged through a pull request.
- A branch lives for days, not weeks. If it grows large, split the work into smaller pull requests.

### Naming

`<type>/<short-kebab-description>`

| Type       | Use for                             | Example                         |
| ---------- | ----------------------------------- | ------------------------------- |
| `feat`     | New behavior                        | `feat/daily-report-form`        |
| `fix`      | Bug fix                             | `fix/stock-rollover-on-edit`    |
| `refactor` | Code change with no behavior change | `refactor/split-report-service` |
| `docs`     | Documentation only                  | `docs/git-workflow`             |
| `chore`    | Tooling, dependencies, config, CI   | `chore/add-drizzle-kit`         |
| `test`     | Tests only                          | `test/report-totals`            |

## Commits

- Subject line: imperative mood, capitalized, no trailing period, about 72 characters or fewer.
  Good: `Add env validation with zod`. Bad: `added env stuff.`
- Optionally use a type prefix (`feat:`, `fix:`) if it helps; stay consistent within a pull request.
- Body (optional): explain **why**, not what. The diff already shows what.
- One logical change per commit. Do not mix formatting changes with behavior changes.
- Never commit secrets. `.env` files are git-ignored; only `.env.example` is tracked.

## Pull requests

1. Push the branch and open a pull request against `main`.
2. Title follows the commit subject rules. Description states what changed and why, and how to check it.
3. Before requesting a merge, run locally:

   ```bash
   bun run lint
   bun run typecheck
   ```
4. Wait for CI. All checks in [04-ci-pipeline.md](04-ci-pipeline.md) must pass before the merge.
5. Merge with **squash merge**, so `main` has one commit per pull request and a readable history.
6. Delete the branch after merging. GitHub does this automatically.

## Database migrations

- Schema changes use `drizzle-kit generate` and `migrate`. The generated SQL files in `apps/api/src/db/migrations` are committed.
- A migration ships in the same pull request as the code that needs it.
- Never edit a migration that is already merged to `main`. Add a new one instead.

## Releases and hotfixes

- Production deploys come from `main`. Tag releases as `vMAJOR.MINOR.PATCH` (for example `v0.3.0`).
- A hotfix is a normal `fix/...` branch with a small pull request to `main`, deployed right after merging.

## Things we avoid

- Force-pushing to `main`, or rewriting history that others may have pulled.
- Merge commits from `main` into feature branches. Use `git rebase main` to update a branch.
- Large "misc changes" commits and pull requests.
