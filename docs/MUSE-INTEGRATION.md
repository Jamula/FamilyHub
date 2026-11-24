# Muse → Seven: supported connector feasibility and pilot gates

**Issue:** [#92](https://github.com/cyrusjamula/family-hub/issues/92) · **Status:** documentation-only feasibility, **not** an installed, authorized or tested connector · **Reviewed:** 2026-11-23.

## Outcome and scope

The owner wants to request *Seven* from Meta's **Muse consumer app**, then read and contribute to appropriately shared Family Hub tasks without switching to the Hub website. Preserve separate per-member identity, current audience/source authorization and explicit approvals. **Do not promise access to this user's existing ChatGPT conversation, memory, connected applications or ChatGPT subscription API through Muse.** A future API-based assistant with selected shared context is not the same logged-in ChatGPT conversation.

MVP-A (first real authenticated ChatGPT client) does **not** depend on Muse. This document is a safe parallel feasibility track and may be adopted only after the chosen supported client, authentication and privacy model have a successful synthetic trial.

## What official sources establish

| Fact | Evidence | What it **does not** establish |
| --- | --- | --- |
| Muse users can ask Muse to create a **Custom Connector** for a service not already listed | [Meta: How Muse works with Connectors](https://www.meta.com/en-gb/help/superintelligence/1687253048996149/) | Whether this particular account supports the required Family Hub HTTP transport, auth and writes |
| Muse's developer Connector Terms define APIs, MCP interfaces and servers as possible connector interfaces | [Meta: Muse Connector Terms](https://platform.muse.ai/terms) | A documented consumer-app "install any MCP" screen or a completed/custom-approved connector |
| User-created Custom Connectors are not Meta-reviewed and may handle information under different provider policies | [Meta Connector Help](https://www.meta.com/en-gb/help/superintelligence/1687253048996149/) | Safety, review or compliance of a particular integration |
| Muse's Secure Credentials Store and connector permissions provide an app-level layer | [Meta: Muse privacy and security](https://www.meta.com/ta-in/help/superintelligence/1047255454427887/), [approvals](https://www.meta.com/en-gb/help/superintelligence/1385290430137537/) | Verification of Family Hub membership, room isolation or exact-action consent on the server |
| Disconnecting a connector stops future exchange, but past imported information may remain in Muse memory/history | [Meta Connector Help](https://www.meta.com/en-gb/help/superintelligence/1687253048996149/) | Erasure of previously shared family information or ChatGPT data |
| Muse's model-improvement data-control toggle is enabled initially according to its help page | [Meta: Muse privacy and security](https://www.meta.com/ta-in/help/superintelligence/1047255454427887/) | User-specific settings or consent to transmit private family records |

**Interpretation:** Proceed with a **conditional connector feasibility trial**, not a general API bridge deployment or automatic cross-account chat synchronization. Prefer a user-created private connector over a public catalog submission for the first proof; verify availability and terms before any implementation.

## Architecture: reuse the existing Hub

```text
Muse consumer conversation
  → owner-approved Custom Connector (actual transport TBD)
    → least-privilege, authenticated Family Hub integration boundary (reviewed separately)
      → verified member/client grant + current room/source permission checks
        → existing task/decision service (synthetic/public pilot content only)
```

A supported connector may call a reviewed REST interface or MCP interface. **Do not assume** either one until the live Muse UI and current official setup contract establish it. No anonymous Worker endpoint, browser-cookie forwarding, broad family/Google credential, hosted third-party "Seven bridge", unreviewed reverse-engineered Muse API, or direct database access.

For MVP, prefer *task-read first* and only subsequently versioned draft proposals with per-action approval. A provider's own permission prompt does **not** replace the Hub's per-task grant or specific external-action approval. No email, calendar write, booking, purchase, private-document export or cross-room reveal is included.

## Readiness and exit gates

| Gate | Test | Required evidence | Status |
| --- | --- | --- | --- |
| MUSE-0 | Owner's actual Muse app shows Custom Connector creation or another **officially supported** route | Screenshot-free, sanitized client/capability observation | Unverified |
| MUSE-1 | Confirm precise REST/MCP transport, authentication flow, pricing and provider retention; bind a *single* verified member | Approved connection decision and cost/no-overage check | Unverified |
| MUSE-2 | Invoke one fixed synthetic read-only task with unique nonce, no private family data | Real Muse invocation plus independent backend read receipt | Unverified |
| MUSE-3 | Explicitly approve one idempotent draft write; retry same request, then stale/conflicting request | Durable receipt with author/client/audience/version and no duplicate mutation | Unverified |
| MUSE-4 | Retrieve the exact approved draft from a different authorized supported AI | Real second-client readback and current-audience test | Unverified |
| MUSE-5 | Revoke connector/client access; test wrong audience, unknown member, expired token, provider timeout and changed source access | Server denial and fail-closed recovery without private response leakage | Unverified |
| MUSE-6 | Owner confirms the workflow is useful on actual device | Owner acceptance, interventions, setup effort and limitations | Unverified |

If the Muse app cannot create the required supported connector without an unapproved charge, credential scope or data transfer, record a **blocked** result and stop. Keep #92 open for a later approved alternative; do not silently substitute an email relay or website copy/paste.

## Proposed minimum on-device check (no connection yet)

In Muse, ask:

> I want a private connector to my Family Hub assistant, Seven. First explain which officially supported Custom Connector types you can use for a third-party authenticated REST or MCP service, whether you support OAuth user authorization, what information would be sent to the service and any usage charges. Do not create a connector, retrieve my personal data, ask for credentials or make network calls yet.

Capture only the support/unsupported response class and consent requirements in the private review. Actual credentials, client IDs, approval screens, member identities and personal task content **must not** be pasted into public GitHub.

## Security, operations and no-cost policy

- Before any network test, ensure the target is an owner-reviewed, authenticated, rate-limited endpoint with strict audience and role enforcement. Test outside production with fictional subjects and a non-reusable credential if connection verification requires one. Do not expose the existing unauthenticated loopback fixture.
- Explicitly verify the connector's scopes, data retention, current permissions, ability to disconnect, and whether previously shared data remains in Muse. Do not infer deletion from disconnect.
- Keep owner-only, Parents-only, financial, medical, children's private data and raw chat transcripts **out of Muse by default**. Share only an intentionally approved minimal task summary and source links cleared for that audience.
- Test revoked credential, role change, stale version, duplicate retry, lost acknowledgement, refused write and provider outage separately. Audit without logging contents or credentials.
- No new paid platform, domain, public deployment, build quota, API subscription, production binding or secret is authorized by this document.
- Never claim "Seven is available in Muse" until the real device, user consent, readback and owner acceptance tests above pass.

See also [AI-native participation](AI-PARTICIPATION.md), [coordination contract](COORDINATION-CONTRACT.md), [MCP gateway](MCP-TASK-GATEWAY.md), and [MVP roadmap](https://github.com/cyrusjamula/family-hub/issues/12).
