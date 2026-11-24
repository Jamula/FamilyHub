# Coding-agent provider: pre-dispatch go/no-go matrix (November 2026)

**Scope:** [#38](https://github.com/cyrusjamula/family-hub/issues/38), prerequisite of [#40](https://github.com/cyrusjamula/family-hub/issues/40) and [#42](https://github.com/cyrusjamula/family-hub/issues/42). **No provider activation or approval is implied.** This document accompanies existing [provider analysis](FACTORY-PROVIDER.md) without replacing historical evidence.

## Current external facts (verify again before activation)
1. GitHub documents [Copilot cloud-agent REST task creation, listing and inspection](https://docs.github.com/en/rest/agent-tasks/agent-tasks?apiVersion=2026-03-10). GitHub App **installation** tokens are not supported for its task API; the exact delegated-user token, scope, consumer billing identity and endpoint support require a private credential and entitlement check. A GitHub repository app grant alone is not an agent-task credential.
2. The currently documented task REST reference does **not** establish a dedicated API to cancel an agent task. The [GitHub Actions cancellation API](https://docs.github.com/en/rest/actions/workflow-runs#cancel-a-workflow-run) operates on workflow-run IDs. Cancelling an Actions job is **not evidence** that the correlated agent session stopped. A UI Stop control may exist for manual intervention; it is not a verified automatic kill switch. Keep unknown/timeout states locked and paused.
3. GitHub moved Copilot to [usage-based GitHub AI Credits starting June 1, 2026](https://github.blog/news-insights/company-news/github-copilot-is-moving-to-usage-based-billing/). [Current individual usage limits](https://docs.github.com/en/copilot/concepts/billing-and-usage/individuals/usage-limits) and [billing](https://docs.github.com/en/copilot/concepts/billing-and-usage/individuals/billing) distinguish included entitlements from Additional usage. Legacy premium-request advice is not enough for a current account. Usage can consume both AI credits and Actions compute, and disabling additional usage cannot reverse already incurred charges.
4. Actual hard-cap behavior must be checked for the owner's specific billing entity, plan, org and repository. Do not infer that a warning email, dashboard chart, self-reported model price, soft budget or API-client time limit is a hard no-overage policy. No credentials, billing records or usage amounts belong in this public document.

## Provider decision table

| Candidate | Dispatch API | Read/identity | Stop path | Zero-overage proof | Decision |
| --- | --- | --- | --- | --- | --- |
| GitHub Copilot cloud agent | Documented, gated on user-token entitlement | Task and sessions API documented, authenticated account/correlation still unverified | Dedicated task-stop API not established; Actions cancellation insufficient | Must verify AI Credits Additional-usage policy **and** Actions spend limits for the actual account | **No-go for unattended live dispatch** |
| Existing local synthetic simulation | No real provider calls | Deterministic fictional identities only | Deterministic simulation pause/recovery | No agent billing in fixtures | **Go for offline tests only** |
| Another supported cloud coding agent | Provider-specific research required | Not selected | Not proven | Not proven | **No-go pending separately approved assessment** |

## Owner-authorized preflight, with independent evidence

| Gate | Pass condition | At present |
| --- | --- | --- |
| BILL-1 | Confirm correct personal/org billing entity, available included AI Credits, and explicitly disabled (or capped at owner-approved value) **Additional usage** | Not verified |
| BILL-2 | Confirm Actions compute/runtime can neither incur unapproved overages nor consume unexpected other repositories' budget | Not verified |
| AUTH-1 | Prove least-privilege **user** token and exact task API entitlement; no broad credential or new secret in GitHub issue | Not verified |
| TASK-1 | Verify full task and session identity, repository, state, PR and workflow-run correlation with authoritative data | Unverified for start→run→PR |
| STOP-1 | Prove a supported provider stop request, bounded result and both task/session termination without guessed ID mapping | Not verified |
| STOP-2 | On missing cancellation, ambiguous result, timeout, wrong-repo mapping or 403, controller pauses and retains its one-task global lock | Synthetic tests are groundwork only |
| CTRL-1 | One approved frozen public/synthetic scope, exact allowed files, authorizations rechecked on dispatch and after recovery | Gate code is unmounted |
| PR-1 | Protected current-head CI, mandatory independent review and no automatic production merge or source exposure | Blocked by #81 |
| ACCEPT-1 | One live bounded trial and separately authorized rollout + real reporting-user acceptance | Not run |

**Policy: ANY failed or unknown gate means zero new dispatch.** If the owner explicitly approves a narrowly bounded live trial in a later turn, still perform a fresh preflight and launch at most one job. Never infer authorization from issue labels or this document.

## Non-execution test matrix
Use the existing mock tests under `test/factory-*.test.js` to simulate no entitlement, stale quota, revoked consent, cross-repository identity, duplicate event, ambiguous start, wrong workflow mapping, cancellation accepted but agent still running, expiration, and restart recovery. Successful synthetic tests demonstrate controller logic, **not** the vendor's real cancellation or overage behavior.

## Minimal owner-only information for an eventual decision
Check the GitHub Billing page privately for the active personal or organization billing entity; show whether Additional usage is disabled, budgets are enforced, Actions overage allowed or disallowed, and any required Copilot plan entitlement. Review official API and session-stop mechanics without copying tokens, personal invoices or screenshots to public source. Record only `pass / fail / unverified` and non-sensitive method evidence in #38.

**Current decision: NO-GO for live autonomous agents.** Unblocked work: read-only provider evaluation, synthetic controller tests, independent review and documentation. Blocked work: tokens, paid trials, agent dispatch, cancellation actions, protected settings, merges and deployments.
