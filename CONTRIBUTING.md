# Contributing to Family Hub

Family Hub has public source and a **restricted family runtime**. Read [README.md](README.md), [AGENTS.md](AGENTS.md), the [approved roadmap](https://github.com/cyrusjamula/family-hub/issues/12) and the current issue's acceptance criteria before any changes.

## Work process
1. Select one explicitly approved issue and exact file scope per branch/PR; record dependencies, expected behavior and failure tests. Serialize overlapping or protected edits.
2. Inspect fresh main and open PRs, current-head review, CI and permissions. Preserve other authors' work. Do not force main or change auto-merge settings.
3. Use the Node version from `.nvmrc`, then `npm ci` and `npm run ci`. Include synthetic regressions for behavior, authorization, conflicts and recovery; documentation-only work requires link/content checks.
4. Open a scoped PR explaining behavior, tests actually run, privacy implications and unverified rollout steps. Address current-head findings and pass required review before merge.
5. Track each status separately: **planned → built → tested → reviewed/merged → deployed source verified → real user accepted**. Do not close a functional issue based on mocked tests or a green build alone.

## Engineering quality and developer experience

- Target at least **95% measured source line coverage and 90% measured branch coverage**, overall and for critical components. Report function coverage as a diagnostic. First establish a reproducible baseline using the pinned Node runtime and repository-owned source; exclude generated/vendor assets and test fixtures only with documented justification. Do not silently exclude uncovered production logic.
- Prefer the smallest maintainable behavior-driven suite: reuse fixtures, table-driven cases and targeted tests; cover success, invalid inputs, denied authorization, exceptions/rejected promises, timeouts, provider and storage failure, retry/idempotency, cancellation, recovery and relevant concurrency. A high coverage number is not a substitute for meaningful assertions. Avoid redundant tests, and do not remove existing regressions without equivalent evidence.
- Run focused tests while iterating and the complete pinned `npm run ci` before proposing merge. Publish actual coverage output with the tested commit, note skips and instrumentation limits, and distinguish coverage targets from measured results. Introduce the coverage gate through reviewed baseline and remediation work; never claim it is enforced until the check is implemented and verified.
- Standardize observability on OpenTelemetry (OTel) with privacy-safe structured logs, traces and metrics where supported by the Worker runtime. Prove runtime compatibility; do not assume Node-only instrumentation works in workerd. No payloads, tokens, personal data or private screenshots in telemetry. Use bounded, fail-safe instrumentation; telemetry failure must not repeat or change an operation. Keep the existing restricted diagnostics boundary.
- Standardize local orchestration on Aspire, using Wrangler/workerd, isolated local D1/KV as needed, synthetic identities and mocked external providers. Validate local startup, health and telemetry before claiming support; never use production secrets, remote databases or paid services in local development.
- Advance independent, non-overlapping implementation scopes concurrently when verified execution capacity exists. Keep protected/shared scopes serialized and integrate in dependency order. Respect the existing one-live-agent gate until the first accepted factory cycle and the subsequent scaling gate. Monitor actual work and stop at included quotas; additional spending is $0 unless separately authorized.

## Security and provider budgets
Never add real family emails, chat exports, medical/financial records, private folders, screenshots, databases or secrets to public issues, source, workflows or agent sandboxes. Use synthetic fixtures. Preserve Cloudflare Access, per-member restrictions, source permissions and exact external-action approval. No issue/PR/roadmap automatically grants live provider dispatch, paid usage, new credentials, public disclosure, email/calendar actions or production migration/deployment.

The first authorized coding-agent run is limited to one. Two non-overlapping parallel agents are a conditional target **after** one complete user-accepted cycle (#42) and the hard cost/cancellation gates (#38, #40).

## Versions and releases
The baseline product version is `0.1.0` until explicit MVP acceptance and a separate release decision. See [docs/VERSIONING.md](docs/VERSIONING.md) and [changelog.md](changelog.md). Node or Worker versions are different. Ordinary commits never create release tags.

## Operations
For CI, deployment and rollback see [docs/CICD.md](docs/CICD.md); merges and releases do not imply production authorization.
