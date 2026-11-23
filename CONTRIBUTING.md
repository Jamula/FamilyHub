# Contributing to Family Hub

Family Hub has public source and a **restricted family runtime**. Read [README.md](README.md), [AGENTS.md](AGENTS.md), the [approved roadmap](https://github.com/cyrusjamula/family-hub/issues/12) and the current issue's acceptance criteria before any changes.

## Work process
1. Select one explicitly approved issue and exact file scope per branch/PR; record dependencies, expected behavior and failure tests. Serialize overlapping or protected edits.
2. Inspect fresh main and open PRs, current-head review, CI and permissions. Preserve other authors' work. Do not force main or change auto-merge settings.
3. Use the Node version from `.nvmrc`, then `npm ci` and `npm run ci`. Include synthetic regressions for behavior, authorization, conflicts and recovery; documentation-only work requires link/content checks.
4. Open a scoped PR explaining behavior, tests actually run, privacy implications and unverified rollout steps. Address current-head findings and pass required review before merge.
5. Track each status separately: **planned → built → tested → reviewed/merged → deployed source verified → real user accepted**. Do not close a functional issue based on mocked tests or a green build alone.

## Security and provider budgets
Never add real family emails, chat exports, medical/financial records, private folders, screenshots, databases or secrets to public issues, source, workflows or agent sandboxes. Use synthetic fixtures. Preserve Cloudflare Access, per-member restrictions, source permissions and exact external-action approval. No issue/PR/roadmap automatically grants live provider dispatch, paid usage, new credentials, public disclosure, email/calendar actions or production migration/deployment.

The first authorized coding-agent run is limited to one. Two non-overlapping parallel agents are a conditional target **after** one complete user-accepted cycle (#42) and the hard cost/cancellation gates (#38, #40).

## Versions and releases
The baseline product version is `0.1.0` until explicit MVP acceptance and a separate release decision. See [docs/VERSIONING.md](docs/VERSIONING.md) and [changelog.md](changelog.md). Node or Worker versions are different. Ordinary commits never create release tags.

## Operations
For CI, deployment and rollback see [docs/CICD.md](docs/CICD.md); merges and releases do not imply production authorization.
