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
| TASK-0 (before trial) | Verify an authorized read/start mechanism, exact repository binding, durable operation ID and a reliable task/session inspection path; unknown start must retain the global lock | Not verified |
| STOP-0 (before trial) | Establish a supported, authenticated provider task/session stop path and fail-closed pause/cancellation logic **before any real start**; an Actions-run cancel alone is insufficient | Not verified |
| CTRL-1 (before trial) | One approved frozen public/synthetic scope, exact allowed files, authorizations rechecked at dispatch, at most one claim and no automatic merge | Gate code is unmounted |
| PR-1 (before merge) | Protected current-head CI and mandatory independent review, with a disabled automatic production merge path until #81 is verified | Blocked by #81 |
| TRIAL-START (separate approval) | Owner explicitly authorizes **one** narrowly scoped trial after BILL-1/2, AUTH-1, TASK-0, STOP-0, CTRL-1 and applicable release-safety controls pass | Not approved |
| TASK-1 (during/after trial) | Correlate the actual task, session, repository, PR and workflow run using authoritative returned IDs, not timing or names | Not run |
| STOP-1 (during/after trial) | Demonstrate stop request, bounded response and both task/session terminal states; do not release an uncertain claim or allow another dispatch until proven | Not run |
| STOP-2 (during/after trial) | Missing cancellation, 403, ambiguous result, timeout or wrong-repo mapping leaves controller paused with its one-task lock until authoritative recovery | Synthetic tests are groundwork only |
| ACCEPT-1 (after trial) | Record reviewed trial results, obtain separate merge/rollout authorization, independently verify deployed source, and obtain reporting-user acceptance | Not run |

**Two distinct gates, no circular dependency:** Any failed or unknown **pre-trial** gate (BILL-1/2, AUTH-1, TASK-0, STOP-0, CTRL-1 or applicable release safety) means **zero live dispatch**, even if an issue asks to start. Only after those are verified and the owner separately authorizes TRIAL-START may exactly one bounded run begin. **Post-trial** gates (TASK-1, STOP-1/2 and ACCEPT-1) are evidence from that run and must pass before recovery can release the lock, any second run, rollout or production acceptance. A successful trial alone never grants merge or deploy approval. An unavailable provider task/session stop path remains a hard NO-GO; this clarification does not waive that prerequisite.

## Non-execution test matrix
Use the existing mock tests under `test/factory-*.test.js` to simulate no entitlement, stale quota, revoked consent, cross-repository identity, duplicate event, ambiguous start, wrong workflow mapping, cancellation accepted but agent still running, expiration, and restart recovery. Successful synthetic tests demonstrate controller logic, **not** the vendor's real cancellation or overage behavior.

## Minimal owner-only information for an eventual decision
Check the GitHub Billing page privately for the active personal or organization billing entity; show whether Additional usage is disabled, budgets are enforced, Actions overage allowed or disallowed, and any required Copilot plan entitlement. Review official API and session-stop mechanics without copying tokens, personal invoices or screenshots to public source. Record only `pass / fail / unverified` and non-sensitive method evidence in #38.

**Current decision: NO-GO for live autonomous agents.** Unblocked work: read-only provider evaluation, synthetic controller tests, independent review and documentation. Blocked work: tokens, paid trials, agent dispatch, cancellation actions, protected settings, merges and deployments.
