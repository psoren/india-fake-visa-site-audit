---
title: Methodology
description: How each fake / intermediary visa site on this catalog is inspected.
---

Every entry on this site is derived from the same public-facing inspection. The goal is reproducibility — anyone with a terminal can re-derive the findings from the same `curl`, `whois`, and `openssl` commands.

## What gets inspected

- **The HTML served at the landing page** — full response body, `<title>`, `<meta>`, headings, disclaimers, commented-out content, embedded JSON config
- **Response headers** — `Server`, `Via`, `cf-ray`, `x-powered-by`, `Set-Cookie`, redirect chain
- **WHOIS** — registrar, creation/update dates, registrant organization (or privacy shield), name servers
- **TLS certificate** — issuer, validity dates, SAN list
- **External script and asset URLs** — to identify trackers (GA, GTM, Facebook Pixel, Hotjar, Amplitude, Datadog), payment processor JS, fingerprinting libraries

## What does *not* get inspected

- **No form submissions.** No fake email, no fake name, no upload of any document. The checkout flow on these sites is exactly what we are trying to *not* feed.
- **No clicks past the landing.** "Apply Now" buttons are not clicked in a real browser. If a button's `formaction` is visible in the markup, that is the entirety of what is recorded.
- **No attempt to bypass UA-gating or fingerprint-driven cloaking.** If a page serves different content to a bot vs a browser, that is noted but not circumvented.
- **No authenticated flows, no checkout, no payment.** Same rule as the gov-site audits this catalog originally split off from — even stricter, because these are the sites we are warning about.

## What is reported

Per site, a short structured entry:

- **Status** — live / parked / dead / redirects to off-topic
- **Hosting / CDN** — Cloudflare, AWS, GoDaddy parking, etc., from response headers
- **Stack** — WordPress, Next.js, hand-written PHP, etc., from generator meta, script paths, framework signatures
- **Brand-imitation evidence** — copied language from `indianvisaonline.gov.in`, "Government of India" claims, lifted iconography, commented-out disclaimers
- **Tracking** — GTM / GA IDs, FB Pixel, Hotjar, fingerprinting libraries — described, not republished as fully clickable links
- **Payment processor (if visible)** — Stripe, Razorpay, PayU, etc., from script tags or form `action` attributes
- **Pricing markup visible on the public page** — the service-fee number the site discloses *before* a user begins a checkout
- **WHOIS** — registrar, registration date, privacy shield
- **Notable finding** — one sentence on the most damning thing the markup reveals

## Tone

Precise and unsparing, not mocking. The point is to document what each site actually serves, not to perform indignation. The Indian government has already done the moral framing on the advisories pages — this catalog adds the technical evidence.

## On secrets and redaction

If a publishable secret-shape token (`pk_live_…`, `AIza…`, `AKIA…`, etc.) appears in a bundle, it is *described* but not republished verbatim. Pre-published public Stripe publishable keys are safe to show; anything secret-shape is redacted to the first 8 characters.

This is for two reasons:

1. The leak is already public on the live site; we should not amplify it.
2. Automated secret-scanners (GitGuardian, TruffleHog) will fire on the verbatim string in our public repo and create noise for everyone involved.
