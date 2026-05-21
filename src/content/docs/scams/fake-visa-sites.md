---
title: Fake India e-Visa websites
description: A catalog of look-alike sites that impersonate India's official e-Visa portal, with evidence from government advisories and consumer-protection sources.
---

The official Indian e-Visa portal lives at **`https://indianvisaonline.gov.in/evisa/`** — and the only legitimate domain suffix is **`.gov.in`**. Everything else is either a third-party intermediary marking up a free or low-cost government service, or an outright scam.

The Ministry of External Affairs (MEA) and at least eight Indian diplomatic missions abroad have published advisories naming specific imposter domains. This page is a consolidated list of those, with citations.

## How to spot one

Common patterns across the sites below:

- **Wrong TLD.** `indiavisa.org.in`, `india-visa-gov.in`, `evisaindia.com` — only `.gov.in` is official. `.org.in` and "gov" *inside* a `.in` domain are deliberate look-alikes.
- **WHOIS privacy.** Domains By Proxy / hidden registrant info on nearly every flagged domain.
- **Valid SSL means nothing.** Let's Encrypt makes HTTPS free for anyone. The lock icon is not a trust signal.
- **Pricing markup.** Government e-Visa fees are $40–$90 depending on type. Flagged sites charge $127–$354.
- **"Appointed by the government" claims.** The Indian government does not appoint third-party visa-processing services for the e-Visa flow. Anyone claiming otherwise is lying.
- **Expedited / 24-hour service.** Government processing times are what they are. No legitimate intermediary can speed them up.

## Group 1 — Named in official Government of India advisories

The following domains appear on near-identical lists from the Consulate General of India San Francisco, CGI Edinburgh, Embassy of India Washington D.C., Embassy of India Paris, and others. The Indian government explicitly calls these "fake."

### `e-touristvisaindia.com`

Claimed purpose: India e-Tourist Visa application service. Templates and imagery copied from `.gov.in` sites. Appears on every Indian consulate advisory reviewed.

### `e-visaindia.com`

Claimed purpose: India e-Visa filing. **ScamAdviser trust score 0/100** ("Very Likely Unsafe"). WHOIS hidden behind Domains By Proxy. TripAdvisor users report being charged **$140 vs $90 official**. Site historically claimed to be "appointed by the government."

### `evisaindia.com`

Claimed purpose: India e-Visa application. **ScamAdviser trust score 0/100**. Currently parked / for sale. Registrant listed as "Domain Administrator, 4616 W Sahara Ave #180, Las Vegas, NV" via DropCatch.com. Flagged "possibly harmful" by Gridinsoft.

### `evisaindia.org`

Listed in CGI San Francisco and CGI Edinburgh advisories. Mimics `.gov.in` branding.

### `indiavisa.org.in`

The `.org.in` TLD is the deception — designed to look governmental despite being privately registered. Called out by name in MEA-aligned advisories.

### `online-visaindia.com`

Listed in multiple Indian consulate advisories.

### `visatoindia.org`

Listed in CGI San Francisco and CGI Edinburgh advisories.

### `india-visa-gov.in`

The domain name itself is the deception — a `.in` (not `.gov.in`) domain with the literal string "gov" inserted to fool casual readers. The most blatantly imitative naming in the set.

### `indianevisaservice.org`

Listed in CGI San Francisco and CGI Edinburgh advisories.

### `evisa-india-online.com`

Listed in CGI San Francisco and CGI Edinburgh advisories.

### `globalvisacorp.com` (`/destination/india`)

General visa brokerage that includes India e-Visa as one of its products. Named in the MEA-linked CGI San Francisco advisory. WHOIS hidden. Trustpilot reviews are highly polarized — multiple users report "money taken, no visa delivered" and unhonored 24-hour expedited promises. Gridinsoft has flagged URLs as potentially malicious. Notably, globalvisacorp itself publishes a blog post titled "Beware of Fake Websites Impersonating Globalvisacorp.com" — implying clones of clones exist downstream of this domain.

## Group 2 — Flagged by victims on consumer forums, not on the official MEA list

These are technically *third-party intermediaries* (legal but heavily marked up) rather than outright phishing, but the victim-complaint pattern is identical enough to include.

### `indianvisaonline.org` / `indianvisaonline.org.in`

The deception is the domain itself — nearly identical to the official `indianvisaonline.gov.in`, swapping `.gov.in` for `.org` or `.org.in`. TripAdvisor users report being quoted **$127 vs $60 official** and **$159 vs ~$40 official**.

### `indianonlinevisas.org` / `indiaonlinevisas.org.in`

Discloses being a third-party service (so technically legal), but charges a $69 markup on top of the government fee and has documented complaints of €100 charges with no visa delivered. Trustpilot listings include multiple negative reviews citing exactly this pattern.

### `indianvisaonline.uk.com`

UK-targeted form-assistance site. Charges £55–£83 for what is essentially a downloadable form. Site itself states "the information on this website is available without the charge from other sources" — making this legal-but-misleading rather than scam-grade, but the markup is real.

## Common operator behavior

- Claim to be "appointed by the government."
- Advertise 24-hour or expedited processing they cannot actually deliver.
- Either deliver nothing, or deliver the same e-Visa the user could have obtained directly from `indianvisaonline.gov.in` at a fraction of the cost.
- After the transaction completes, the victim has no clear recourse — disputing the charge with a card issuer is possible but inconsistent.

## Caveats

- For `globalvisacorp.com` and `indianonlinevisas.org`, reviews are mixed — some report service rendered, others report nothing delivered. The Indian government still lists `globalvisacorp.com` as fake. The honest framing is "heavily-marked-up intermediary with a meaningful failure rate" rather than "pure phishing operation," but the practical advice is the same: don't use them.
- We did not identify a single named operator behind multiple domains in public reporting. The pattern looks like many independent affiliates rather than one syndicate — though that may reflect what has been publicly attributed rather than the underlying structure.
- This list is not exhaustive. New domains appear and old ones get parked or repurposed; the canonical source for "what's currently flagged" is the MEA / consulate advisories, not this page.

## Sources

### Government of India advisories

- [Consulate General of India, San Francisco — Important Advisory on Fake Indian E-Visa Websites](https://www.cgisf.gov.in/page/important-advisory-on-fake-indian-e-visa-websites/)
- [Consulate General of India, Edinburgh — Scam Alert: Indian E-Visa](https://www.cgiedinburgh.gov.in/section/news/scam-alert-indian-e-visa/)
- [Embassy of India, Washington D.C. — Important Advisory on Fake Indian Visa website](https://www.indianembassyusa.gov.in/Publicind?id=14)
- [Embassy of India, Paris — Advisory on Fake Indian E-Visa Websites](https://www.eoiparis.gov.in/page/Important-Advisory-on-Fake-Indian-E-Visa-Websites/)
- [High Commission of India, Malta — Advisory against fake e-visa websites](https://hcimalta.gov.in/page/advisory-against-fake-e-visa-websites/)
- [Embassy of India, Berne — Advisory regarding correct e-Visa website](https://www.indembassybern.gov.in/page/advisory-regarding-the-correct-website-for-e-visa/)
- [MEA, Government of India — "Beware of Fake Indian E-Visa Websites" (PDF press release)](https://www.mea.gov.in/Portal/CountryNews/19364_press_800551188.pdf)
- [Embassy of India, Brussels — Public Advisory on Fake e-Visa URLs (PDF, 2023)](https://indianembassybrussels.gov.in/pdf/Public%20Advisory%20Fake%20e-Visa%20Websites%20and%20URLs-10-05-2023.pdf)

### Consumer-protection / scam-watch

- [ScamAdviser — e-visaindia.com](https://www.scamadviser.com/check-website/e-visaindia.com)
- [ScamAdviser — evisaindia.com](https://www.scamadviser.com/check-website/evisaindia.com)
- [ScamAdviser — globalvisacorp.com](https://www.scamadviser.com/check-website/www.globalvisacorp.com)
- [Trustpilot — globalvisacorp.com reviews](https://www.trustpilot.com/review/www.globalvisacorp.com)
- [Trustpilot — indiaonlinevisas.org.in](https://www.trustpilot.com/review/indiaonlinevisas.org.in)
- [Trustpilot — indiaevisas.org](https://www.trustpilot.com/review/indiaevisas.org)
- [Chargeback.com — Global Visa Corp charge dispute reference](https://www.joinchargeback.com/whats-this-charge/globalvisacorp.com/Global-Visa-Corp)

### Forums and journalism

- [TripAdvisor — "Don't get scammed by fake online India Evisa sites"](https://www.tripadvisor.com/ShowTopic-g293860-i511-k10335708-Don_t_get_scammed_by_fake_online_India_Evisa_sites-India.html)
- [TripAdvisor — "WARNING Scam alert: Fake websites for Indian visa"](https://www.tripadvisor.com/ShowTopic-g293860-i511-k11400590-o10-WARNING_Scam_alert_Fake_websites_for_Indian_visa-India.html)
- [LoveMoney — "Don't fall for the visa scam!"](https://www.lovemoney.com/news/26696/indian-visa-scam)
- [Forum for Expat Management — India government warns of fake e-visa sites](https://www.forum-expat-management.com/posts/29893-india-government-warns-applicants-of-fake-e-visa-websites)
- [LawQuest International — Warning about Fake Visa Websites](https://lawquestinternational.com/blogs/warning-about-fake-visa-websites/)
