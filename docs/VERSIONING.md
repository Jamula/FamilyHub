# Family Hub versioning and release policy

## Source of truth
This project adopts the FamilyTree-style pre-MVP Semantic Versioning convention.
**0.1.0 is the product baseline, not a published release.** Runtime Node versions, migrations, Cloudflare Worker IDs and commit SHAs are independent from product version.

| File | Meaning |
| --- | --- |
| `VERSION` | Canonical stable SemVer `MAJOR.MINOR.PATCH` |
| `package.json` / `package-lock.json` | Mirror the baseline in package and root lock metadata |
| `changelog.md` | Unreleased changes versus owner-approved releases |
| `vMAJOR.MINOR.PATCH` tag | Approved immutable GitHub release, not automatic deployment |

## Pre-MVP freeze
Hold all product metadata at **0.1.0 until the owner accepts the MVP and separately approves the version decision**. Do not bump after a normal PR, milestone completion, CI pass or Cloudflare deployment. The guard `scripts/check-version.mjs` intentionally rejects other versions until updated in a separately approved release PR. The live family and factory acceptance gates are in [#12](https://github.com/cyrusjamula/family-hub/issues/12).

## Release process
1. Reconcile accepted features, exceptions, data/privacy controls, current-head reviews and required checks; record exact tested SHA and user acceptance.
2. In a dedicated reviewed PR, update `VERSION`, package manifest, root lockfile, changelog, version guard and tests together after approval for the next product version.
3. Merge under existing branch protections. Never independently merge, self-approve or bypass security checks.
4. Only after **separate release approval**, create and publish an immutable `vX.Y.Z` tag on the approved main SHA and a matching GitHub Release. This policy creates no tag or release.
5. Production rollout is separately authorized and verified; see [CI/CD](CICD.md). A source release is not deployment and rollback cannot reverse D1 migrations or external messages.

## Validation
Run `node scripts/check-version.mjs` or `npm run ci`. In addition to the freeze, tests reject version mismatches and prerelease strings. No paid usage, credentials, schema migrations, release tags or production activation are authorized by this document.
