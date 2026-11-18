# CI pipeline

Every pull request and every push to `main` runs two GitHub Actions workflows. A pull request can only merge when all five checks pass. Items marked **(planned)** do not exist yet.

## Checks

| Check            | Workflow       | What it runs                                | Covers                                             |
| ---------------- | -------------- | ------------------------------------------- | -------------------------------------------------- |
| Code quality     | `ci.yml`       | `bunx biome ci .` and `bun run typecheck`   | Lint, format, code smell, complexity, static types |
| Build            | `ci.yml`       | `bun run build`                             | The apps still build                               |
| SAST             | `security.yml` | CodeQL on TypeScript and the workflow files | Insecure code patterns                             |
| Dependency audit | `security.yml` | `bun audit --audit-level=high`              | Known vulnerabilities in dependencies              |
| Secret scan      | `security.yml` | gitleaks over the full git history          | Committed passwords, tokens and keys               |

`security.yml` also runs every Monday, because new vulnerabilities are published without any code change.

## Details

- **Complexity.** Biome's `noExcessiveCognitiveComplexity` rule fails a function above 15. Split the function instead of raising the limit.
- **Dependency audit.** Only high and critical vulnerabilities fail the check. Lower ones show up as Dependabot alerts. Dependabot also opens weekly update pull requests (`.github/dependabot.yml`).
- **Secrets.** GitHub secret scanning with push protection is enabled on the repository as a second layer. If a secret is ever committed, rotate it; removing the commit is not enough.
- **Container checks (planned).** Add hadolint and Trivy when the first Dockerfile exists.
- **Deployment (planned).** There is no CD yet.

## Branch protection

The `main` ruleset on GitHub enforces the git workflow:

- Changes reach `main` only through a pull request, merged with squash merge.
- All five checks above must pass, and CodeQL must report no new high-severity alert.
- `main` cannot be deleted or force-pushed.
- Repository admins can bypass these rules. Use this for emergencies only, because a bypass skips every check.

## Run the checks locally

```bash
bunx biome ci .
bun run typecheck
bun run build
bun audit --audit-level=high
```
