# Copilot review enforcement and legacy reconciliation

## Native ruleset (November 24, 2026)

The owner manually disabled the privileged auto-merge workflow and removed all five ruleset bypass actors. The active default-branch ruleset requires one approval, dismisses stale approvals on reviewable pushes, requires resolved conversations, strict up-to-date validation and security/code-quality checks. Draft review requests are enabled; automatic reviews on each push are disabled. Batch changes and obtain an explicit Copilot approval for the exact final head before proposing a merge.

Live test PR #99: previous approval for `3dbbabb` was dismissed after pushing `5fa9176`; with validation and security checks green, the ready PR was blocked until Copilot explicitly approved `5fa9176`, then became clean. No merge was attempted. Native approval rules accept eligible reviewers generally; the exact Copilot reviewer policy still requires checking reviewer identity and commit before autonomous merge. Do not infer approval from a workflow completion or COMMENTED state.

PR #102 removes the disabled privileged workflow. Do not require its orphaned `copilot-review` status context or re-enable its script. Historical unit coverage is retained; the regression test asserts the workflow is absent. Existing owner-authorized native auto-merge registrations are independent and must be monitored against current-head approval and all required gates. Do not enable new auto-merge or merge/release/deploy without applicable authorization.

## Historical implementation (retired; not current operational instructions)

The repository-native workflow preserves its existing policy: a non-dismissed Copilot review of the exact current head enables the `copilot-review` gate, and all remaining rules/checks still apply. It may register squash auto-merge under the owner's configured policy. It never invokes a direct merge operation.

GitHub has rejected `enablePullRequestAutoMerge` for an already clean PR with the exact single `UNPROCESSABLE` message `Pull request Pull request is in clean status`. The reconciliation now rereads the PR state/head, warns that the owner must perform the merge action if it is still the same open non-draft PR, and continues to other PRs. It does not retry that rejection, claim auto-merge was enabled, merge the PR, or weaken any review/check requirement. If the PR changed or closed, it records that observation instead.

Only that exact single-error response is handled this way. Permission failures, multiple/ambiguous errors and unrelated failures remain visible workflow errors. Existing bounded unstable-status retries retain their fresh-head and fresh-review checks. Clean status is not a new approval signal and does not replace checks or user acceptance.

This fixes the per-PR queue failure observed in workflow run 40641765175/job 122661301090. The workflow loads code from its trusted workflow revision; a PR changing this script cannot change the privileged workflow's current behavior before it is reviewed and merged. No workflow rerun, merge, deployment or policy activation is performed by the tests.
