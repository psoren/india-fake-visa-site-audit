---
title: Indian Visa Online — indianvisaonline.gov.in
description: A section-by-section technical teardown of India's official visa portal — a NIC-built server-rendered site with a different stack and a different set of problems from the TCS-built passport portal.
---

This audit covers `https://indianvisaonline.gov.in/` and its main application sub-path `/evisa/`. The site is operated by the Bureau of Immigration (Ministry of Home Affairs) and, per the footer, "Designed & Developed by NIC" — the National Informatics Centre. This is a different stack and a different team from the [passport portal](/indian-gov-tech-audit/audits/passport-seva/), which is React-on-CRA built by TCS.

The findings are different in shape but not in scale: where passportindia is a 2022-era SPA fighting its WAF, indianvisaonline is a multi-page server-rendered jQuery/Bootstrap site that runs JavaScript at the browser to try to disable the browser's own developer tools.

## Methodology

Same methodology as the [passport audit](/indian-gov-tech-audit/audits/passport-seva/) — public-page `curl`, header inspection, JS/CSS bundle diff, no authenticated flow.

## TL;DR

The site is a multi-page Bootstrap 5 / jQuery 3.7 site with **IE9 conditional comments**, **devtools-blocking JavaScript**, **two HSTS headers with conflicting values**, **two CSP definitions that disagree** (the HTTP-header version contains a wildcard `*` in `script-src` that nullifies most of it), **a hard-coded IP address whitelisted in CSP**, and a `Set-Cookie: cookies=null` header that appears to be a literal coding mistake. The home page also shows a subscription modal on every load and opens *another* modal on the next click anywhere on the page.

## 1. Stack

From the home page (`/`) and the application page (`/evisa/`):

| Library | Version | Notes |
|---|---|---|
| Bootstrap | 5.2.3 | Loaded **twice** on the home page (`bootstrap.bundle.min.js` + `bootstrap.js`) |
| jQuery | 3.7.0 | Loaded **after** Bootstrap on the home page, but Bootstrap 5 callbacks below use `$` |
| Owl Carousel | unspecified | jQuery-dependent carousel library |
| Font Awesome | 5 | Two-major versions behind v7 |

Also still loaded in 2026:

- **`<!--[if gt IE 9]>` IE conditional comments** with `htmlshiv5.js` and `respond.js` — shims for IE9, a browser Microsoft retired in 2022 and which never supported HTML5 properly in the first place. These tags are ignored by every browser shipped after 2012.
- **`<meta http-equiv="X-UA-Compatible" content="IE=edge">`** — IE rendering-mode hint, also dead.
- **Manual cache-busting** via `?rev=5`, `?rev=3` query-string suffixes on CSS links.

## 2. The home page disables your browser's developer tools

This inline script is shipped on `/`:

```javascript
$(document).on({
    "contextmenu": function (e) {
        console.log("ctx menu button:", e.which);
        e.preventDefault();
    },
    "mousedown": function(e) { console.log("normal mouse down:", e.which); },
    "mouseup":   function(e) { console.log("normal mouse up:", e.which); }
});

document.onkeydown = function(e) {
    if(event.keyCode == 123) { return false; }                                          // F12
    if(e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) { return false; }     // Ctrl+Shift+I
    if(e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) { return false; }     // Ctrl+Shift+C
    if(e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) { return false; }     // Ctrl+Shift+J
    if(e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) { return false; }                   // Ctrl+U (view source)
};
```

This is "security theatre" at its most literal — it doesn't actually prevent anyone from inspecting the site (a single `curl` returns the full source, and any user can disable JavaScript or use a different browser), but it actively breaks the right-click menu, F12, view-source, and devtools shortcuts for legitimate visitors trying to use their own browser normally.

A reasonable user who wants to copy a phone number off the page can't. A blind user whose screen reader maps to right-click context menus has features taken away. A developer trying to understand a form-validation error can't open the console.

The supreme irony: the `contextmenu`/`mousedown`/`mouseup` handlers all `console.log(...)` the events they're suppressing. They're sending debug output to a console the user has been prevented from opening.

## 3. The subscribe-modal-on-every-click pattern

```javascript
var isOpen = false;
function showbanner() {
    if (!isOpen) {
        $("#subscribe").modal('hide');
        $("#subscribe_new").modal('show');
        isOpen = true;
    }
}
$(document).ready(function () {
    $("#subscribe").modal('show');
});
document.body.addEventListener('click', showbanner, true);
```

What this does on a fresh visit:

1. Page loads — modal `#subscribe` is shown immediately (`modal('show')`).
2. User clicks *anywhere* on the page to dismiss it — the global `click` listener fires `showbanner()`, which immediately shows a *second* modal (`#subscribe_new`).
3. The `isOpen` flag prevents it from triggering again, but the user has now been interrupted twice by overlays before they can read the page.

The fact that the secondary modal HTML is commented out (`<!-- <div id="subscribe_new"...` doesn't exist in the rendered DOM) means clicking anywhere actually does nothing visible — but the JavaScript still runs on every click for the lifetime of the page session.

## 4. Two HSTS headers with different values

The response to `/evisa/` ends with:

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
...
Strict-Transport-Security:  max-age=31536000
```

Two `Strict-Transport-Security` headers are returned, with different `max-age` values and only the first declaring `includeSubDomains; preload`. This is the signature of two distinct layers of the stack — almost certainly the Citrix NetScaler load balancer and the application server behind it — both injecting HSTS independently without anyone noticing.

Browsers handle duplicate HSTS headers by picking the first one (per RFC 6797), so the preload-eligible policy wins. But the configuration is ambiguous and the next person to touch either layer could silently change the effective policy.

## 5. Two CSP definitions that disagree

The `/evisa/` page returns CSP via an HTTP header **and** via an HTML `<meta http-equiv>` tag. They are not the same:

**HTTP header:**
```
script-src 'self' 'unsafe-inline' 'unsafe-eval' *;
style-src 'self' 'unsafe-inline' *;
```

**Meta tag:**
```
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline';
```

The HTTP-header version contains `*` in `script-src` and `style-src`, which **allows any origin to load scripts/styles**. With both `*` and `'unsafe-inline'` and `'unsafe-eval'`, the script-src directive becomes equivalent to no CSP at all for script execution.

The meta-tag version is slightly more restrictive (no wildcard). Browsers union multiple CSP sources by *intersection* — they apply the most restrictive policy from each — so the meta tag rescues the wildcard. But the existence of two diverging policies means whoever maintains either layer can break the other, and the HTTP header on its own is broken.

## 6. The hard-coded IP in CSP

Both CSP definitions whitelist a literal IP address in `frame-src` and `object-src`:

```
frame-src 'self' 14.97.234.227 https://evisabot.in/;
object-src 'self' 14.97.234.227;
```

A `whois` of `14.97.234.227` returns:

> netname: TATAINDICOM-IN
> descr: TATA TELESERVICES LTD - TATA INDICOM - CDMA DIVISION
> country: IN

The visa portal is whitelisting a specific Tata Teleservices Mumbai IP address in its security policy. Two failure modes:

- **IP reassignment.** Tata could reassign that IP to a different customer at any time. The visa portal would silently start allowing iframes/objects from whoever now owns it.
- **CSP rot.** If that IP changes (their own backend migrates, or Tata renumbers), nobody knows to update the CSP — the relevant page silently breaks for the affected sub-feature.

CSP source lists should use hostnames, not IPs.

## 7. Security headers via `<meta http-equiv>`

The `/evisa/` HTML duplicates several security-header declarations as meta tags:

```html
<meta http-equiv="X-Frame-Options" content="DENY">
<meta http-equiv="X-XSS-Protection" content="1; mode=block">
<meta http-equiv="X-Content-Type-Options" content="nosniff">
```

`X-Frame-Options` is **not honored as a meta tag** by any browser — it must be an HTTP header to work. The same applies to `X-Content-Type-Options`. The actual HTTP headers do set `X-Frame-Options` and `X-Content-Type-Options`, so the page is protected, but the meta tags are useless filler that suggest the author believed they did something.

`X-XSS-Protection: 1; mode=block` is deprecated and actively recommended *against* by Chrome and other modern guidance — Chrome removed support, Firefox never implemented it, and historically it has been usable to *introduce* vulnerabilities. The modern recommendation is `X-XSS-Protection: 0` (or omitting it entirely). This site sets it via both meta and HTTP header.

## 8. `Set-Cookie: cookies=null`

Among the cookies returned on `/evisa/`:

```
Set-Cookie: cookies=null; Secure; HttpOnly; SameSite=Strict
```

A cookie literally named `cookies` with the literal string value `null`. Almost certainly a server-side coding mistake — some piece of code was probably trying to *not* set a cookie when a variable was `null` and ended up serializing `cookies=null` into the response instead. The cookie is harmless on its own but persists in every visitor's cookie jar for the session.

The encrypted NetScaler counterpart `BNES_cookies=...` is also returned, confirming the load balancer also doesn't know what to do with the malformed source cookie.

## 9. Citrix NetScaler cookie leaks the backend server IP

Among the cookies:

```
Set-Cookie: IVFRT_Cookie=rd7o00000000000000000000ffff0af8a888o80
```

The `rd7o` prefix and 32-hex-character payload are Citrix NetScaler's load-balancer persistence cookie format. The payload decodes as an IPv4-mapped IPv6 address:

```
00000000000000000000ffff 0af8a888
                          0a.f8.a8.88  →  10.248.168.136
```

So this cookie leaks the internal IP `10.248.168.136` of the backend application server. NetScaler has had an "obfuscate persistence cookie" option for years; it isn't enabled here. This is on the CIS NetScaler hardening checklist.

The `BNES_IVFRT_Cookie` is the encrypted version of the same cookie — but the *unencrypted* `IVFRT_Cookie` is the one whose value the browser sends back on subsequent requests, so it's the one that matters from a leak perspective.

## 10. The Bootstrap-loaded-twice problem

The home page (`/`) script loading order:

```html
<script src="js/bootstrap.bundle.min.js"></script>   <!-- includes Popper + Bootstrap -->
<script>...inline JS using $...</script>             <!-- uses jQuery before it's loaded -->
<script src="js/jquery.js"></script>                 <!-- jQuery loaded here -->
<script src="js/bootstrap.js"></script>              <!-- Bootstrap loaded again -->
<script src="js/owl.carousel.js"></script>
<script src="js/custom.js"></script>
```

Three issues in one script section:

1. **Bootstrap is loaded twice.** `bootstrap.bundle.min.js` and `bootstrap.js` initialize the same library at two different points, double-binding event handlers on Bootstrap-managed components like modals and carousels.
2. **jQuery is loaded after the first script that uses `$`.** The inline `$("#subscribe").modal('show')` and `$(document).on(...)` blocks earlier in the page rely on `$`, which is `undefined` until `jquery.js` parses. These calls fail silently the first time and only work because they're inside `$(document).ready(...)` — which doesn't exist until jQuery has loaded.
3. **`custom.js` is two pages' worth of `Read More` toggles.** The file ships globally even though only a single page on the site uses any of these buttons.

## 11. The other gov links are still on `http://`

Two of the outbound links from the home page:

- `http://davp.nic.in/ebook100days/index.html`
- `http://swachhbharatmission.gov.in/sbmcms/index.htm`

Both are non-HTTPS, both are stale (`100days` refers to the 2014 government's first-100-days commemorative material), and both are linked from the official Indian visa portal in 2026. Browsers under HSTS context will silently upgrade these when possible, but the source-of-truth HTML still says `http://`.

## 12. The third-party chatbot `evisabot.in`

The visa portal embeds an iframe from `https://evisabot.in/` (whitelisted in both CSP definitions). That site returns its own security headers, including this:

```
Content-Security-Policy: 14.97.234.226 *
```

This is **not valid CSP syntax**. The CSP grammar requires directive names (`script-src`, `default-src`, etc.). What's there is just an IP and a wildcard, with no directive. Browsers ignore the entire header.

`evisabot.in` is registered as a `.in` second-level domain rather than living under `.gov.in` — meaning the chatbot, which the official visa portal trusts enough to whitelist in CSP, is not on a government TLD at all.

## 13. The `/evisa/` page is 162 KB of HTML

The single rendered HTML for `/evisa/` is **162,845 bytes** — without any framework's JS or CSS. That's most of a megabit of HTML, mostly because the entire application surface — forms, country lists, embedded help text, modal contents — is concatenated into one page and toggled with CSS/jQuery rather than navigated to.

Combined with:
- `bootstrap.css` (199 KB unminified)
- `jquery.js` (89 KB unminified)
- `owl.carousel.js` (93 KB)
- `evisa.css` (21 KB)

…the initial page weight before any application JavaScript runs is around 564 KB.

## 14. The shortlist

If someone ran a one-week cleanup sprint, in order:

1. **Delete the right-click/devtools-blocking script entirely.** It does nothing for security and degrades the experience for legitimate users.
2. **Fix the CSP wildcard.** Drop `*` from `script-src` and `style-src` in the HTTP-header CSP. Make HTTP-header CSP and meta-tag CSP identical, or remove the meta tag.
3. **Hostname-not-IP in CSP.** Replace `14.97.234.227` with whatever hostname Tata resolves it from.
4. **Pick one HSTS source.** Either the load balancer or the app server should send HSTS, not both.
5. **Enable Citrix NetScaler persistence-cookie obfuscation.** Stops leaking the `10.248.168.136` backend IP.
6. **Find and remove the `Set-Cookie: cookies=null`.** Trace which handler is misbehaving.
7. **Delete the IE9 conditional comments**, `htmlshiv5.js`, `respond.js`, and `X-UA-Compatible` meta. All dead weight.
8. **Stop loading Bootstrap twice on the home page** and load jQuery before any script that uses `$`.
9. **Drop `X-XSS-Protection: 1; mode=block`.** Modern guidance is `0` or omit.
10. **Either fix `evisabot.in`'s CSP** to be valid syntax or remove the header — it's currently lying about being protected.
11. **Remove the modal-on-every-click handler.** Or at minimum, gate it to a button.
12. **Switch the `http://` outbound gov links to `https://`** and prune the ones that point at 12-year-old commemorative pages.

The pattern: each fix is small, none requires architecture-level rework, and the cumulative effect is a site that loads faster, is less hostile to users, and actually does what its security headers claim to do.
