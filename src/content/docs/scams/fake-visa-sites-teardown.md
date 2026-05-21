---
title: Fake India e-Visa websites — technical teardown
description: A section-by-section look at the markup, hosting, trackers, and WHOIS of the look-alike India e-Visa sites named in Government of India advisories, plus the major third-party intermediaries.
---

The [advisories catalog](/india-fake-visa-site-audit/scams/fake-visa-sites/) on this site lists the domains the Indian government, consulates, and consumer-protection sources have flagged. This page is the technical complement: what each of those domains actually serves to a browser, where it is hosted, what trackers fire on the landing page, what payment processor is visible in the markup, and what the WHOIS record says.

Methodology is the [Methodology](/india-fake-visa-site-audit/methodology/) page in short: one `curl` of the public landing, one `whois`, one TLS certificate read, grep for trackers and brand-imitation language. No form submissions, no clicks past the landing, no attempt to bypass cloaking.

## How to read these entries

Sites fall into roughly four states:

- **Live** — the domain serves real fake/intermediary visa content. These get the longer treatment.
- **Parked / for sale** — the domain has been let go and a marketplace listing or registrar holding page is served. One line.
- **Repurposed** — the domain still resolves but now serves something completely different (gambling, ads, an unrelated business). Noted, not dwelled on.
- **Dead** — DNS no longer resolves. The domain is still registered (WHOIS confirms) but the name servers are gone. One line.

Cumulatively: of the 15 domains catalogued below, **6 are live with imitation content**, **1 is parked**, **3 redirect off-topic (gambling, ad-affiliate, an unrelated DAC site)**, **1 has its Cloudflare origin returning 520**, and **4 no longer resolve**. The pattern is what you would expect from an affiliate-driven operation: cheap domains, short lifespans, easy to spin up under a new name.

## Group A — Named in Government of India advisories

### `e-touristvisaindia.com`

![Screenshot of e-touristvisaindia.com landing page](/india-fake-visa-site-audit/screenshots/e-touristvisaindia.com.jpg)

- **Status**: live, but the landing page is a **fingerprinting redirector**, not a visa-application page
- **Hosting / CDN**: Apache, no CDN; name servers `*.aboveDomains.com` (a GoDaddy parking infrastructure that operators sometimes leave on live sites)
- **Stack**: 32-line hand-written HTML that loads `FingerprintJS` ([iife.min.js](https://fingerprint.com/) — a commercial visitor-identification library) and a 300-millisecond `setTimeout` that redirects to `http://e-touristvisaindia.com/?tr_uuid=<uuid>&fp=<visitorId>` either way — with the visitor's fingerprint hash appended if FingerprintJS resolved, or with `fp=-7` (`-3` / `-5` for `<noscript>`) if it didn't
- **Brand-imitation evidence**: none on the landing — the only visible content is `<title>e-touristvisaindia.com</title>`. Imitation, if any, lives behind the post-fingerprint redirect
- **Tracking**: FingerprintJS commercial fingerprinting library, with `monitoring: false` (so the user's fingerprint is not also reported back to FingerprintJS the company)
- **WHOIS**: GoDaddy, Domains By Proxy, registered 2015-04-16, last updated 2026-03-01
- **SSL**: Let's Encrypt R13, valid Apr 2026 → Jul 2026 (90-day rotation)
- **Notable finding**: a public-facing visa site's landing page does not need to fingerprint visitors before letting them in. The presence of FingerprintJS at all — and the per-visit `tr_uuid` UUID minted into the query string — is the signature of an affiliate-tracking funnel, not a legitimate informational site.

### `e-visaindia.com`

![Screenshot of e-visaindia.com landing page](/india-fake-visa-site-audit/screenshots/e-visaindia.com.jpg)

- **Status**: live, 55 KB landing page with a full visa-application UI
- **Hosting / CDN**: Apache, no CDN; jQuery 3.4.0 + Bootstrap 3.4.0 loaded from `ajax.googleapis.com` and `maxcdn.bootstrapcdn.com`
- **Stack**: hand-written PHP-style multi-page site, `<meta name="generator" content="https://www.e-visaindia.com">` (so the site lists itself as its own generator). Bootstrap **3** is end-of-life as of mid-2019
- **Brand-imitation evidence**: page text reads "associated with Government of India" in body copy. **The non-affiliation disclaimer is in the HTML but commented out**: `<!--<p class="">*Disclaimer:The website is not affiliated under the Government of India.</p>-->`. The visible disclaimer below is softer ("developed by eVisa Service Company Limited, is the website to provide full services for online Visa to India") and omits the non-affiliation statement
- **Tracking**: Google Analytics 4 — `G-KH9VGMT358` via `googletagmanager`
- **Payment processor**: not visible in landing markup (presumably behind the application flow)
- **Pricing markup visible**: not on the landing page — pricing surfaces inside the application form
- **WHOIS**: GoDaddy, Domains By Proxy, registered 2014-09-16, last updated 2025-10-24
- **SSL**: Let's Encrypt R13, valid Apr 2026 → Jul 2026
- **Notable finding**: the disclaimer that would say "we are not affiliated with the Government of India" exists in the source but is wrapped in HTML comments so it never renders. The visible disclaimer is the softer, friendlier one.

### `evisaindia.com`

![Screenshot of evisaindia.com — domain-marketplace listing](/india-fake-visa-site-audit/screenshots/evisaindia.com.jpg)

- **Status**: parked / for sale
- The domain currently 302-redirects to `https://perfectdomain.com/domain/evisaindia.com`, a domain-marketplace listing. The visible page is a sales pitch ("Evisaindia.com Domain Name"), not a visa site. Registered via GoDaddy and on PerfectDomain's name servers. Registered 2023-01-04 (re-registered after a lapse).

### `evisaindia.org`

![Screenshot of evisaindia.org — currently serving an ad-affiliate redirect target](/india-fake-visa-site-audit/screenshots/evisaindia.org.jpg)

- **Status**: repurposed / ad-affiliate redirect
- 302-redirects through a chain ending at `https://celynnec.com/match-…/feed` — an affiliate-redirect URL on a Cowboy / Erlang-served domain. No visa content. UdomainName.com LLC registrar; registered 2023-09-23 to "Jan Everno".

### `indiavisa.org.in`

- **Status**: dead — DNS no longer resolves (NXDOMAIN)
- WHOIS still lists the domain as registered to **ASIA ETRAVEL LIMITED** via Wild West Domains, with name servers `kara.ns.cloudflare.com` and `anirban.ns.cloudflare.com`. The shared NS pair links this registration to `indianvisaonline.org.in` (also ASIA ETRAVEL LIMITED) and to `globalvisacorp.com` — see notes on that domain below.

### `online-visaindia.com`

![Screenshot of digital-arrival-card.com, the current redirect target of online-visaindia.com](/india-fake-visa-site-audit/screenshots/online-visaindia.com.jpg)

- **Status**: repurposed — the domain itself was registered fresh on 2025-12-29 and now 301-redirects to **`digital-arrival-card.com`**, a French-language "global Digital Arrival Card" portal
- **Hosting / CDN**: nginx 1.24 → Apache 2.4 after the redirect; no CDN
- **WHOIS**: Internet Domain Service BS Corp registrar, Whois Privacy Corp shield (Bahamas), registered 2025-12-29 — same day the redirect target appears to have started accepting traffic
- **Notable finding**: the domain was recently re-acquired and pivoted to a different "official-sounding" travel-document funnel (Digital Arrival Card) instead of being used for India e-Visa imitation directly. The same playbook, a different country's paperwork.

### `visatoindia.org`

![Screenshot of visatoindia.org landing page](/india-fake-visa-site-audit/screenshots/visatoindia.org.jpg)

- **Status**: live, 48 KB landing page with a polished visa-application UI
- **Hosting / CDN**: Cloudflare (`cf-ray` returned), origin nginx
- **Stack**: hand-written with Magento-era artefacts (`<form id="search_mini_form" action="/catalogsearch/result/">` is a Magento 1 marker, and `etafca-kukalayallc1.netdna-ssl.com/skin/frontend/base/default/js/ie6.js` is loaded — a Magento 1 skin path that still references IE 6 compatibility JavaScript)
- **Brand-imitation evidence**: page body reads "**the Ministry of Home Affairs, Government of India will review the application**" inside an informational `<p>`. Two `<p>` elements lower, the disclaimer reads "We are not owned or affiliated with the government of India. You can obtain the e-visa directly from the Government of India" — the same paragraph that quietly tells the user they could have done this for less
- **Tracking**: Google Analytics — `UA-75166715-1`, a legacy **Universal Analytics** property. Universal Analytics stopped processing new hits on 2024-07-01 — this tracker is no longer collecting data, but the tag is still in the page
- **Pricing markup visible**: "$60 service fee per applicant" plus "$25 to $75" government fee — disclosed on the landing page in the same paragraph
- **WHOIS**: NameCheap, "Withheld for Privacy" (Iceland) privacy shield, registered 2014-11-26
- **SSL**: Google Trust Services WE1, valid May 2026 → Aug 2026 (Cloudflare-fronted)
- **Notable finding**: a long-lived (since 2014), Cloudflare-fronted, Magento-era site whose primary deception is referring to "the Ministry of Home Affairs, Government of India" in body copy while disclaiming affiliation in a smaller paragraph below — and quietly admitting in the disclaimer that the user could have applied directly. The dead UA tag is just neglect.

### `india-visa-gov.in`

- **Status**: dead — DNS no longer resolves
- WHOIS lists the domain as registered to **TWELVE DIMENSION PTY LTD** (Australia) via GoDaddy, with name servers at `liquidweb.com` and `sourcedns.com`. Registered 2019-03-23, last updated 2026-05-07. The deception is the domain name itself — a `.in` (not `.gov.in`) registration with the literal string "gov" inserted to fool casual readers. With the name servers gone, the domain currently does not load.

### `evisa-india-online.com`

![Screenshot of evisa-india-online.com — Cloudflare 520 error page](/india-fake-visa-site-audit/screenshots/evisa-india-online.com.jpg)

- **Status**: live registration, but the Cloudflare origin returns **HTTP 520** ("Web server is returning an unknown error") — the proxy is up, the origin behind it is not
- **Hosting / CDN**: Cloudflare (`cf-ray`, `server: cloudflare`)
- **WHOIS**: **Gname 194 Inc** registrar (a low-cost reseller often used for short-lived operations), name servers `hera.ns.cloudflare.com` / `vicky.ns.cloudflare.com`, registered 2025-05-29 — fresh
- **Notable finding**: registered fresh in mid-2025 on a low-cost registrar, behind Cloudflare, with no working origin. This is the shape of a domain that was stood up, served content for a while, and either got pulled or had its origin server retired. The Cloudflare proxy in front means a new origin can be wired up without anyone outside the operator noticing.

### `globalvisacorp.com` (`/destination/india`)

![Screenshot of globalvisacorp.com /destination/india landing page](/india-fake-visa-site-audit/screenshots/globalvisacorp.com.jpg)

- **Status**: live, **461 KB** rendered HTML, the most fully-built site in this catalog
- **Hosting / CDN**: Cloudflare, origin runs Next.js (`x-powered-by: Next.js`, preload links to `/_next/static/media/...woff2`)
- **Stack**: Next.js with server-rendered HTML and a large embedded JSON config blob containing the entire site's content (destinations, prices, contact details, disclaimer copy) inlined into the HTML
- **Brand-imitation evidence**: body text references **`indianvisaonline.gov.in`**, **`Bureau of Immigration`**, and **`Government of India`** as authorities the site relates to. The visible disclaimer states "**This is a privately owned website and is not affiliated with any government authorities**" — clear, but adjacent to language that positions the site as a peer of the official portal
- **Tracking**: Google Tag Manager — `GTM-579GLHT`
- **Payment processor**: not visible in landing markup (the inlined JSON has a `config_des_polular":"$36"` and `config_contact_phone":"+1 928 352 8770"` — a Lake Havasu City, Arizona number; no Stripe/Razorpay/PayU script tags on the landing)
- **Pricing markup visible**: the inlined config lists every destination's "popular" price (India shows up in a wider catalog — popular-tier figures across destinations range $10–$112), but India e-Visa pricing is rendered into the React tree, not exposed as a flat number on the page
- **WHOIS**: Wild West Domains (a GoDaddy subsidiary), Domains By Proxy, registered 2017-05-10; name servers `anirban.ns.cloudflare.com` and `kara.ns.cloudflare.com`
- **SSL**: Google Trust Services WE1 (via Cloudflare), valid May 2026 → Aug 2026
- **Notable finding**: the Cloudflare nameserver pair `anirban.ns.cloudflare.com` + `kara.ns.cloudflare.com` is **shared with `indianvisaonline.org.in` and `indiavisa.org.in`**, both of which WHOIS lists as registered to ASIA ETRAVEL LIMITED. Cloudflare assigns the same nameserver pair to all zones inside a single Cloudflare account — three independently-registered "fake India visa" domains landing on the same NS pair is, by Cloudflare's own design, a same-account signal. The two `.org.in` domains are dead today, but globalvisacorp.com remains the largest live site in this catalog and shares an operator footprint with them.

## Group B — Third-party intermediaries (not on the MEA list, but heavily marked up)

### `indianvisaonline.org`

![Screenshot of indianvisaonline.org — JS redirector page mid-redirect](/india-fake-visa-site-audit/screenshots/indianvisaonline.org.jpg)

- **Status**: live but **the landing is a 481-byte JS redirector**, not a visa page
- The full body is `window.location.replace('http://indianvisaonline.org/?ch=1&js=<JWT>&sid=<uuid>')` — a JWT-signed query string that presumably gates real content behind successful redirect. With JavaScript disabled, the page is empty. Origin nginx, GoDaddy registrar, custom name servers `*.commonmx.com`, registered 2014-10-30. The shape (JWT in query string, per-visit `sid`) is again affiliate-tracking infrastructure — what a marketing funnel looks like, not a visa portal.

### `indianvisaonline.org.in`

- **Status**: dead — DNS no longer resolves
- WHOIS: ASIA ETRAVEL LIMITED via Wild West Domains, same Cloudflare nameserver pair (`kara.ns.cloudflare.com` / `anirban.ns.cloudflare.com`) as `indiavisa.org.in` and `globalvisacorp.com` — the shared-account fingerprint noted above. Registered 2015-03-29.

### `indianonlinevisas.org`

![Screenshot of indianonlinevisas.org landing page](/india-fake-visa-site-audit/screenshots/indianonlinevisas.org.jpg)

- **Status**: live, 92 KB landing page with the most production-grade frontend in this catalog
- **Hosting / CDN**: **AWS CloudFront** in front of nginx (`x-cache: Miss from cloudfront`, `via: 1.1 ...cloudfront.net`); name servers are AWS Route 53 (`*.awsdns-…`)
- **Stack**: hand-rolled but professionally engineered — Amplitude analytics (`cdn.amplitude.com/libs/amplitude-8.18.4-min.gz.js`), Amplitude experiments (`cdn.eu.amplitude.com/script/...experiment.js`), **Datadog RUM** (`datadoghq-browser-agent.com/datadog-rum-v4.js`), and `crypto-js` 3.1.9 loaded from cdnjs
- **Brand-imitation evidence**: body text references **`indianvisaonline.gov.in`** by name; the visible disclaimer reads "An application can also be submitted for a lower cost through the Government's web…site" — same pattern as `visatoindia.org`, where the disclaimer itself admits the markup is unnecessary. **Trustpilot widget embedded** (`trustpilot` / `TRUSTPILOT` in the markup) — used to imply legitimacy
- **Tracking**: Google Tag Manager `GTM-K5T57R2`, plus Amplitude product analytics and Datadog Real User Monitoring — three distinct telemetry pipelines on a visa-broker landing page
- **WHOIS**: **MarkMonitor** registrar — a corporate-brand-protection registrar normally used by Fortune 500s and IP-conscious operators. AWS Route 53 name servers. Registered 2017-03-06, last updated 2025-02-07. No WHOIS privacy shield on the visible record
- **SSL**: Amazon RSA 2048 M04 (AWS Certificate Manager), valid Sep 2025 → Oct 2026 (13-month AWS cert, not the 90-day Let's Encrypt rotation pattern most others use)
- **Notable finding**: the registrar (MarkMonitor) and the operational stack (CloudFront + Datadog RUM + Amplitude + Route 53 + ACM) are what a real company looks like, not what an affiliate spammer looks like. This is the most "real business with budget" entry in the catalog — which makes the disclaimer admitting users could apply directly with the government for less the more revealing finding, not the least.

### `indiaonlinevisas.org.in`

- **Status**: dead — DNS no longer resolves
- WHOIS: **eTourist Services (OPC) Pvt.Ltd** via GoDaddy, name servers `*.rohininfotech.org`. Registered 2017-11-26. Different operator footprint from the ASIA ETRAVEL cluster.

### `indianvisaonline.uk.com`

![Screenshot of indianvisaonline.uk.com — currently redirecting to a Thai gambling site](/india-fake-visa-site-audit/screenshots/indianvisaonline.uk.com.jpg)

- **Status**: repurposed → currently serves **a Thai-language gambling site**
- The domain 301-redirects through `https://789betak.com/` → `https://airductcleaning.us.org/` (a WordPress install with `<meta name="generator" content="WordPress 7.0">`) → final title `789BET - ลิงก์เข้าสู่ระบบอย่างเป็นทางการของ 789bet.com ปี 2026`. The `.uk.com` suffix is a CentralNic public-suffix registration, not an official UK domain. WHOIS for the registry was unavailable; whatever the domain originally hosted, it now serves no India-visa content of any kind.

## Cross-cutting observations

A few patterns repeat across the catalog and are worth naming explicitly:

- **WHOIS privacy is universal among the active operators.** Every live Group A site uses Domains By Proxy, "Withheld for Privacy" (Iceland), or Whois Privacy Corp (Bahamas). The one site with a non-privacy registrar record (`indianonlinevisas.org` on MarkMonitor) is the most operationally professional, not the least.
- **Let's Encrypt is the default TLS issuer on the cheap end** (e-touristvisaindia.com, e-visaindia.com) and Google Trust Services WE1 covers everything fronted by Cloudflare (visatoindia.org, globalvisacorp.com). The only site with a long-lived AWS ACM cert is the production-grade `indianonlinevisas.org`. The lock icon distinguishes the well-engineered intermediary from the storefront in name only.
- **The disclaimer is often more honest than the surrounding marketing.** At least three sites (`visatoindia.org`, `indianonlinevisas.org`, `globalvisacorp.com`) state in their disclaimer that the user could have applied directly through the government for less. The text exists to satisfy a legal requirement, not to actually deter the conversion.
- **The Cloudflare-nameserver-pair fingerprint links three "different" domains to one operator.** `globalvisacorp.com`, `indiavisa.org.in`, and `indianvisaonline.org.in` all use `anirban.ns.cloudflare.com` + `kara.ns.cloudflare.com`. Cloudflare assigns one NS pair per account; three independently-registered "India visa" domains landing on the same pair is the strongest cross-domain operator signal in this catalog.
- **The truly dead domains aren't gone — their name servers are.** Four `.org.in` / `.in` domains in the catalog (`india-visa-gov.in`, `indiavisa.org.in`, `indianvisaonline.org.in`, `indiaonlinevisas.org.in`) still have live WHOIS records but no working DNS. The domains can be re-pointed at a working server any day. "Dead" is not "retired."
- **Fingerprinting and JWT-tracking on the landing page** (`e-touristvisaindia.com`, `indianvisaonline.org`) are the shape of an affiliate-marketing funnel, not a visa portal. The user is identified before they see the content.

## What this catalog is not

This is a snapshot of public landing pages as of 2026-05-20, captured with `curl` + `whois` + `openssl`. It does not include the content these sites serve once a user begins a checkout flow — we deliberately did not start one. The most damning evidence is, by design, likely past the door we did not open.

The advisory catalog at [`/scams/fake-visa-sites/`](/india-fake-visa-site-audit/scams/fake-visa-sites/) covers the consumer-protection and government-advisory sourcing for these domains. This page is the markup evidence that goes alongside it.
