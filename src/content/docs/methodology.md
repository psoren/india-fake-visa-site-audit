---
title: Methodology
description: How each audit on this site is conducted.
---

Every audit on this site follows the same pattern. The goal is to be reproducible — anyone with a terminal and a browser should be able to re-derive the findings.

## What gets inspected

- **The HTML shell** served at the site's root and at notable sub-routes
- **Shipped JS and CSS bundles** (dumped via `curl`, inspected via `grep`, never executed locally except in a sandboxed headless browser)
- **Build artifacts** that the framework's default config leaves published — `asset-manifest.json`, `manifest.json`, source maps if present
- **Response headers** from each distinct hostname the site uses
- **Common-path probes** — `robots.txt`, `sitemap.xml`, well-known dotfiles
- **Sibling origins** referenced by the bundle (API hosts, CDN hosts, embedded sub-apps)

## What does *not* get inspected

- Anything behind a login
- Anything that would require submitting personal information, money, or otherwise interacting with the application as a real user
- Server-side code, internal infrastructure, or anything beyond what the site itself volunteers

## What is reported

Per audit, a section-by-section walkthrough covering:

1. The HTML shell and SSR posture
2. Build artifacts left published
3. Framework inventory and versions
4. JS bundle: hard-coded URLs, console statements, browser sniffing, validation patterns, leaked secrets
5. Route table sanity (duplicates, casing, typos, dead routes)
6. CSS bundle health (size, specificity wars, dead frameworks)
7. Sub-applications and the frameworks they use
8. Server / WAF / CDN behavior
9. Security headers and CSP analysis
10. A "what would help most" punch list

## What is *not* reported as-is

If an exploitable secret is found in a bundle (an unrestricted API key, a credential, a token), it is **described** but not **reproduced**. A key may appear in the audit as `AIzaSyDa9og…` — enough to identify the finding for the maintainer, not enough to enable abuse by a reader.

This is for two reasons:

1. The leak is already public on the live site; we should not amplify it.
2. Automated secret-scanners (GitGuardian, TruffleHog, etc.) will fire on the verbatim string in our public repo and create noise for everyone involved.

## Tone

The writeups aim to be precise and unsparing without being mocking. The intended reader is a future maintainer of the site, not a Twitter audience. The "what would help most" list at the end of each audit is the actual point — every section before it exists to justify those items.
