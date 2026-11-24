# First AI-native family task: synthetic and live acceptance

**Scope:** [#34](https://github.com/cyrusjamula/family-hub/issues/34), [#36](https://github.com/cyrusjamula/family-hub/issues/36), and [#37](https://github.com/cyrusjamula/family-hub/issues/37). The default-disabled OAuth/MCP gateway and separate loopback fixture are NOT a deployed ChatGPT integration.

## Existing synthetic proof and limits
The `test/integrations/mcp-shared-task-pilot.test.js` contract uses ephemeral signed JWTs, current member/client verification, a fictional Family/Parents task store and a mock back end. Tests cover two independently attributed client identities, one versioned proposal and cross-client readback, immutable replay receipts, stale version failures, role/room denial, revoked client/member rejection and inability to invoke external actions. It imports existing gateway/resource boundaries but **is not a live ChatGPT request, a real OAuth consent exchange, a production store, or proof of cross-provider compatibility**. It cannot grant actual Google source permissions.

## Choose the smallest supported client (gated)
- **ChatGPT custom MCP plugin**: Official [MCP server documentation](https://developers.openai.com/api/docs/guides/custom-mcp-server) documents read/write tools. [Plugin authentication](https://developers.openai.com/plugins/build/auth) describes OAuth 2.1 and supported authorization patterns. Prefer a per-member OAuth client and current client/membership grant.
- **Private server transport**: [Secure MCP Tunnel](https://developers.openai.com/api/docs/guides/secure-mcp-tunnels) can keep a compatible server private when eligible, but requires its own Platform configuration, runtime key, approved tunnel use and authorization. Do **not** tunnel the unauthenticated loopback fixture or reuse the owner's general browser session.
- **GPT Actions**: An independently documented REST option, not proof that the existing ChatGPT account or another family member has the required setup. Choose only after comparing reachable identity and authorization, callback, plan and approval behavior.
- **Consumer Copilot or Muse**: Neither is accepted as a Family Hub write-capable client. Keep them on capability-specific feasibility tracks; do not represent a model API as the consumer app.

## Real-world proof sequence (requires separate owner consent)
1. Establish the **exact permitted client** and account feature in the owner's own ChatGPT session. Record only capability, not account secrets, in the issue.
2. Review and activate a **restricted**, authenticated synthetic-only endpoint with OAuth 2.1 discovery/PKCE and current per-member identity. Never expose a local unauthenticated fixture to the public internet. New Worker bindings, OAuth/Access changes, credentials, domains, migrations and deployments require explicit approval.
3. In the client, authenticate as a single real member to a fixed fictional task, then invoke an actual `task_read` and record a safe result/receipt with timestamp, tested commit and client type.
4. Use an explicit action-specific approval for one `task_propose`; verify returned version, receipt and re-read. Send no real messages, bookings, purchases, private files or screenshots.
5. Replay the exact request; expect the original receipt. Submit a stale and mismatched request; expect safe conflict. Revoke the user/client, switch role and verify refusal with no disclosure.
6. With **another member's separately authenticated client**, read the approved Family-only proposal; verify owner-only/Parents visibility remains denied. The second client is not required to be a different vendor if the vendor is unsupported.
7. Record browser/mobile UX and any account, license, pricing or OAuth limitations; request **owner acceptance** of the MVP. Do not mark #34/#36/#37 accepted on CI-only evidence.

## Required evidence ledger

| Acceptance item | Synthetic contract | Real client | Deployment | Owner acceptance |
| --- | --- | --- | --- | --- |
| Current user/client identity | Test fixture only | Not run | Disabled | Pending |
| Task read with room checks | Test fixture only | Not run | Disabled | Pending |
| Versioned proposal and idempotent retry | Test fixture only | Not run | Disabled | Pending |
| Second authorized client readback | Test fixture only | Not run | Disabled | Pending |
| Credential revocation and private-room denial | Test fixture only | Not run | Disabled | Pending |

The only viable next stage after passing CI is **account/transport authorization and a protected synthetic pilot**, not a production rollout.
