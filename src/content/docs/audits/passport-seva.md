---
title: Passport Seva — passportindia.gov.in
description: A section-by-section technical teardown of India's official passport-services portal.
---

This is a dissection of the publicly accessible parts of India's official passport-services portal at `https://www.passportindia.gov.in/psp`. Everything below was gathered by `curl`-ing the public site — no authenticated flow, no scraping behind a login.

The motivation: getting through a passport application on this site took multiple days across multiple browsers. This is an attempt to understand, from the outside, why that experience is so bad.

## Methodology

What we looked at:

- The HTML shell served at `/psp`
- The shipped JS bundle `main.f4a6f0f0.js` (811 KB minified)
- The shipped CSS bundle `main.a2d34569.css` (415 KB minified)
- The `asset-manifest.json` and PWA `manifest.json` left published by CRA
- The `*.LICENSE.txt` companion file produced by webpack
- Headers from `www.passportindia.gov.in`, `services1.passportindia.gov.in`, `api1.passportindia.gov.in`, and `pspcdn.passportindia.gov.in`
- The Angular-based chatbot served from `services1.passportindia.gov.in/chatbot/`
- `robots.txt`, `sitemap.xml`, common dotfiles

What we did **not** look at: anything behind login. No applicant accounts, no PII, no fee-paid endpoints.

## TL;DR

The portal is a 2022-era Create React App that was thrown over a fence in front of a 2010-era nginx/WAF stack, an Angular sub-app, and a CSP that whitelists jQuery for a codebase that doesn't use jQuery. The build artifacts leak a default-template asset manifest, two duplicated routes (one of them misspelled twice), and a Google Analytics tag that ships citizen pageviews to a third party. The CSS uses `!important` 2,069 times. None of this is exotically broken — it's the cumulative drag of a hundred small unfinished decisions.

## 1. The HTML shell

The entire response body of `https://www.passportindia.gov.in/psp` is **849 bytes**:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <link rel="icon" href="/psp/favicon.ico"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="theme-color" content="#000000"/>
  <meta name="description" content="Passport Seva Online Portal has been designed to deliver Passport and related services to citizens in a timely, transparent, more accessible, reliable manner and in a comfortable environment through streamlined processes and committed, trained and motivated workforce."/>
  <link rel="apple-touch-icon" href="/psp/favicon.ico"/>
  <title>Passport Seva</title>
  <script defer="defer" src="/psp/static/js/main.f4a6f0f0.js"></script>
  <link href="/psp/static/css/main.a2d34569.css" rel="stylesheet"></head>
<body>
  <noscript>You need to enable JavaScript to run this app.</noscript>
  <div id="root"></div>
</body>
</html>
```

Findings:

- **Zero SSR.** The first paint shows whatever the loading state of the React tree happens to be after `main.js` parses and runs. For a citizen on a slow Indian mobile connection, the entire site is a flash of nothing for as long as the bundle takes to download, parse, and hydrate.
- **`<noscript>` fallback.** The fallback for a national government service serving citizens with limited bandwidth or accessibility tooling is "turn on JavaScript."
- **No semantic HTML at all in the document.** Search-engine indexers and accessibility crawlers see one `<div id="root">`.
- **Empty `<body>` until JS executes.** This means the `/screenReaderAccess` route, which exists in the React Router config, only becomes accessible *after* the screen reader's user has waited for hydration.
- **One unhashed `theme-color` meta but no `manifest.json` link in `<head>`** — there is a PWA manifest at `/psp/manifest.json` but the HTML doesn't reference it, so it's effectively orphaned.

## 2. Build artifacts left published

CRA's defaults are still in place:

- **`/psp/asset-manifest.json` is publicly fetchable** and enumerates every chunk filename. Not a vulnerability, but it's the equivalent of leaving the inventory list outside the warehouse.
- **`/psp/manifest.json`** (the PWA manifest) has the entire 280-character elevator pitch stuffed into the `name` field:
  > "Passport Seva Online Portal has been designed to deliver Passport and related services to citizens in a timely, transparent, more accessible, reliable manner and in a comfortable environment through streamlined processes and committed, trained and motivated workforce."

  PWA install prompts use this string as the app label. On someone's home screen this would display as the truncated first ten words.
- **The PWA manifest declares two icons** — one 192×192 and one labelled 512×512 that points at *the same 192×192 PNG*.
- **The `main.f4a6f0f0.js.LICENSE.txt`** webpack companion is also published, which is fine, but it reveals the dependency surface.

## 3. Framework inventory

From the LICENSE file and grepping the bundle:

| Package | Version | Notes |
|---|---|---|
| React | 18.2.0 | Two majors behind (React 19 has been GA since Dec 2024) |
| React DOM | 18.2.0 | same |
| React Router DOM | 6.10.0 | Apr 2023 release; v7 is current |
| `@remix-run/router` | 1.5.0 | matches the above |
| `qrcode.react` | unspecified | |
| `classnames`, `escape-html`, `tslib`, `regenerator-runtime` | — | |

What's interesting is what's **not** in the bundle but is still whitelisted in the production CSP:

```
script-src 'self' https://platform.twitter.com https://code.jquery.com/
           https://www.googletagmanager.com/ https://platform.google.com/
           https://maps.googleapis.com/ https://www.google.com
           https://www.gstatic.com/;
```

- **`code.jquery.com` is whitelisted but jQuery is not loaded** (zero matches for `jquery`, `jQuery`, or `$.ajax` in the bundle). Either dead policy from a prior incarnation of the site, or a "just in case" allowance, but it expands the attack surface for free.
- **`platform.twitter.com` is whitelisted** — the bundle does reference `https://platform.twitter.com/widgets.js`, so somewhere on the site is an embedded Twitter widget on a passport-services portal in 2026.

## 4. The JS bundle

`main.f4a6f0f0.js` is **811,100 bytes** minified (no code splitting on the entry point — the *whole* route table compiles into one file, with secondary chunks lazy-loaded).

Things found in it:

- **Google Maps API key in cleartext** (prefix `AIzaSyDa9og…`). This would normally be acceptable for a Maps JS API key *if* it were also HTTP-referrer-restricted in Google Cloud Console — but we verified from a headless browser on an unrelated origin that **the key works**. The map object constructs, no `gm_authFailure` callback fires, no auth-error overlay appears. The key is API-scoped (Geocoding and Static Maps both return `REQUEST_DENIED`), so abuse is limited to embedding interactive maps; but the cost of that abuse rolls up to the Indian government's Cloud Platform bill until they rotate the key.
- **GA4 measurement ID** (prefix `G-WS79…`). The official passport portal ships citizen browsing events to a third-party (Google) analytics endpoint.
- **30 `console.*` calls left in production:** 20 `console.warn`, 9 `console.error`, 1 `console.log`. None should be in a production bundle.
- **`navigator.userAgent.indexOf("Trident"`** — Internet Explorer detection in 2026. IE was retired by Microsoft in June 2022.
- **Native `alert()` for form validation.** Two examples lifted directly out of the bundle:
  ```
  alert("Please enter a keyword for search.")
  alert("Please enter only alphanumeric text for the search.")
  ```
  Browser alerts have been considered a UX antipattern for ~15 years. They block the page, are unstyleable, and have terrible accessibility characteristics.
- **`http://localhost` baked into the bundle.** A development URL survived into production. Probably harmless (likely a React internal or dev fallback string) but still a smell.
- **Plain `http://` links to other government sites:**
  - `http://csc.gov.in/index.php`
  - `http://meadashboard.gov.in/`

  A government portal under HSTS preload linking citizens out to non-TLS government sites. In a modern browser these will probably auto-upgrade — but they shouldn't be hard-coded as `http://` in the first place.

## 5. The route table

138 routes are registered in the React Router config. The casing convention is a free-for-all:

```
/aboutUsPsp           camelCase
/AccessInformation    PascalCase
/banks                lowercase
/contactUs            camelCase
/News2018             hard-coded year
/Track1, /Track2      mystery numbered routes
/Web1, /Web2, /Web3   even more mystery routes
/Awards, /Awards1     why is there an Awards1
```

**Two pairs of duplicated routes** survived into production:

- `/trackApplicationservice` and `/trackApplicationService` (only the `s`/`S` differs)
- `/checkAppointmentAvailibility` and `/checkAppointme**t**Availibility`

The second pair is the better story. The duplicate is missing the `n` in "Appointment" — and **both versions misspell "Availability" as "Availibility."** A typo was deployed, someone presumably noticed, and the fix was added as a parallel route rather than a correction.

These are not internal identifiers. They are URLs the public is meant to type and bookmark.

## 6. The CSS bundle

`main.a2d34569.css` is **415,349 bytes** minified. For comparison, the entire compiled CSS of github.com fits in roughly the same range — and github.com is a substantially more visually complex application.

What's in there:

- **`!important` is used 2,069 times.** This is what fighting the cascade rather than designing it looks like. Every `!important` is a future maintainer being forced to either nest more `!important` or rewrite the rule entirely.
- **`slick-carousel` classes (85 hits)** — a jQuery-era carousel library. There's a React port (`react-slick`) so this may be legitimately loaded via that, but the CSS surface area is what you'd expect from carrying over a 2014-era library.
- **34 inlined `data:` URIs totalling ~6.5 KB** — negligible.

## 7. The chatbot is an entirely separate Angular app

Embedded into the React site is `https://services1.passportindia.gov.in/chatbot/`, which is a *separate* Angular CLI app:

```html
<app-root></app-root>
<script src="runtime.086530a914b9f568.js" type="module"></script>
<script src="polyfills.92f4504eee550b47.js" type="module"></script>
<script src="scripts.e85ad4435571e151.js" defer></script>
<script src="main.d3f9fad59841b448.js" type="module"></script>
```

So the production stack is:
- React 18.2 (CRA) for the main site
- Angular for the chatbot
- jQuery whitelisted in CSP but unused

Three frontend frameworks for a portal whose visible functionality is "show some forms and a chat widget."

The chatbot also ships **a commented-out frame-busting script** that, if enabled, would prevent the page from being loaded outside an iframe:

```html
<!--<script>
  // Redirect to /psp if chatbot is opened directly (not in iframe)
  if (window.top === window.self) {
    window.location.href = '/psp';
  }
</script>  -->
```

Someone wrote it. Someone disabled it. Nobody removed it.

The chatbot CSS sets `font-family: Calibri, sans-serif` on `body`. Calibri is a proprietary Microsoft font that's not bundled, not loaded as a webfont, and not present on non-Windows systems. On every non-Windows browser this rule silently falls through to `sans-serif`. The declaration also overrides the Bootstrap `--bs-font-sans-serif` system stack the same file just defined.

## 8. Multiple hostnames serve the same SPA

`https://www.passportindia.gov.in/psp` and `https://services1.passportindia.gov.in/` return *byte-identical* HTML, both referencing the same `/psp/static/js/main.f4a6f0f0.js`. The site is duplicated across origins.

This isn't free:

- Every change has to be deployed to both hostnames.
- The CSP and CORS configuration has to be kept in sync.
- Citizens linking deep into one variant get bookmarks that don't reliably map to the other.
- It defeats CDN caching since the same asset URL has different cache states depending on which hostname the request was made through.

## 9. Server-side smells

The headers are mostly reasonable — HSTS is preloaded, `X-Frame-Options: SAMEORIGIN` is set, `Content-Security-Policy` is non-trivial — but there are leaks:

- **`api1.passportindia.gov.in/`** serves the **default "Welcome to nginx!"** page. The root of a backend that the bundle's API calls go to was never configured.
- **`Server_Tokens: off`** appears as a *response header* (line 17 of the response). This is the nginx directive `server_tokens off;` being misinterpreted as a header name — somebody put `Server_Tokens off;` into an `add_header` block instead of a `server_tokens` line. The result is that the response now actively leaks the existence of the directive while attempting to hide the server token. (The `Server:` header is correctly blank.)
- **API requests with the right `Origin`/`Referer` headers** still get a generic *"Response is currently forbidden due to HTTP filter"* page — the F5 BIG-IP ASM WAF default 403 body. The WAF vendor is visible from the response style.
- **`pspcdn.passportindia.gov.in`** is fronted by **Tata Communications CDN**, revealed by `x-tata-request-id` and `server: v/7.0.3/...` headers. Not a problem, just an interesting bit of supply-chain mapping you'd not normally want to volunteer.
- **No `robots.txt`, no `sitemap.xml`.** The 404s for both mean search engines have no canonical view of the site's URL space. For a government portal that citizens need to find via Google, that's costly.

## 10. CSP analysis

The deployed CSP for the main shell:

```
frame-src 'self' https://services1.passportindia.gov.in/
          https://services2.passportindia.gov.in/
          https://platform.twitter.com https://www.google.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com/;
base-uri 'self';
img-src 'self' https://maps.gstatic.com/ https://pspcdn.passportindia.gov.in
        https://services1.passportindia.gov.in/psp/
        https://maps.googleapis.com/ data:;
script-src 'self' https://platform.twitter.com https://code.jquery.com/
           https://www.googletagmanager.com/ https://platform.google.com/
           https://maps.googleapis.com/ https://www.google.com
           https://www.gstatic.com/;
connect-src 'self' https://maps.googleapis.com/
            https://www.google-analytics.com
            https://api1.passportindia.gov.in
            https://www.google.com;
default-src 'self';
object-src 'none';
form-action 'self';
report-uri 'self';
frame-ancestors 'self';
font-src 'self' https://services1.passportindia.gov.in/psp/
         https://fonts.gstatic.com/;
```

Issues:

- **`'unsafe-inline'` in `style-src`** — undermines a lot of the CSP's value against XSS-via-style.
- **`report-uri 'self'`** — the value `'self'` is not a valid `report-uri` argument; it expects an absolute or relative URL. The browser will silently ignore the directive, so violation reports go nowhere.
- **No `report-to`** — the modern reporting directive is not configured.
- **`script-src` whitelists `code.jquery.com`** despite no jQuery in the build.
- **`platform.twitter.com` in both `script-src` and `frame-src`** — a passport portal embedding Twitter is an interesting choice.

## 11. The hypothesis for why the experience is hostile

Tying it back to lived experience — multi-day, multi-browser failures — the smells above line up with several plausible failure modes:

1. **SPA fragility.** A single client-side error blanks the page. With zero SSR, any thrown render error gives a blank screen with no recovery path other than "reload."
2. **localStorage caching of API responses.** `vcountAction`, `vcountApiTime`, `welcomeAction`, `welcomeApiTime` are all cache keys for endpoints that return content for the homepage. If the cached payload ever gets corrupted or out of sync with the current bundle's shape, the site will throw on hydration until `localStorage` is manually cleared.
3. **UA-based gating.** The Trident sniffing is presumably benign, but the *presence* of UA sniffing in the bundle is a signal that other paths in the application may discriminate based on UA string and silently degrade on less-common browsers.
4. **Aggressive WAF.** The F5 ASM rules will reject requests that look subtly wrong to the WAF — for example, an unusual `Accept` header, or characters in form fields the rules weren't tuned for. The user sees a generic "Forbidden" page with no actionable signal.
5. **Cross-origin duplication.** A successful step on `services1.passportindia.gov.in/` is not guaranteed to be observed by `www.passportindia.gov.in/psp` because they're treated as separate origins by the browser.

None of these alone explains a multi-day ordeal. All of them together, on a 2.5 MB total payload over a residential Indian mobile link, with no graceful error recovery, exactly does.

## 12. The shortlist of things that would help most

If a maintainer ran a one-week cleanup sprint, the highest-leverage items, in order:

1. **Rotate the Google Maps API key and add an HTTP-referrer restriction** for `*.passportindia.gov.in/*`. Currently the key works from any origin.
2. **Remove the duplicate misspelled routes.** Pick one canonical URL per page, 301 the other.
3. **Replace `alert()`-based form validation with inline errors.** This alone fixes accessibility and removes the "modal blocks page" failure mode on validation errors.
4. **Strip `console.*` calls and `http://localhost` strings from the production bundle.**
5. **Fix the `Server_Tokens: off` header.** Remove the misplaced `add_header` and use the actual nginx directive.
6. **Configure `api1.passportindia.gov.in/`** to not serve the default nginx welcome page.
7. **Trim the CSP** — drop `code.jquery.com`, drop `'unsafe-inline'` from `style-src`, fix `report-uri`.
8. **Either enable the chatbot frame-busting code or delete it.** Don't leave commented-out security logic in production HTML.
9. **Add `robots.txt` and `sitemap.xml`.** This is half a day of work and meaningfully improves discoverability.
10. **Migrate the PWA manifest's `name` to something a human would put on a home screen.** Move the elevator pitch to `description`.
11. **Audit the 2,069 `!important` rules.** Pick the 20 worst offenders, fix their selector specificity properly, and prevent the regression with a stylelint rule.

None of this is exotic engineering. It's the inventory of one full-time frontend engineer's quarter.
