# App Store metadata

Two storefronts, one codebase, two different acquisition pitches. Character counts
verified against Apple's limits (name 30, subtitle 30, keywords 100).

## United States

Current copy and the reasoning for every field are in `ASO_LISTING.md` and
`ASO_LOCALIZATIONS.md` (generated, length-checked). The 1.1 changes: the name stays (it
ranks #3 for "hunting tags" and #33 for "hunting license"); the subtitle becomes
`Hunt Regs & Season Planner` to form "hunting season" (41/45); "journal" moves to the
keyword field; "regulations", "preference" and "fishing" leave it.

The keyword field never repeats a word already in the name or subtitle, and never a
plural of one, because Apple treats those as duplicates. The generator enforces this.

## Canada (English)

| Field | Value | Chars |
|---|---|---|
| Name | `Hunt Journal, Tags, Licences` | 28/30 |
| Subtitle | `Seasons, Regulations & Logs` | 27/30 |
| Keywords | `hunting,license,ontario,fishing,elk,moose,bear,deer,duck,turkey,tracker,permit,draw,calendar,harvest` | 100/100 |

Not the U.S. listing with British spelling. Canadian search behaviour is genuinely
different: the journal and log terms outperform the administrative ones.

- `hunt journal` 25/21/1.19 and `hunting log` 23/18/1.28 are the cleanest terms in the
  market — real hunting-journal SERPs, not games.
- `ontario hunting licence` 21/18/1.17 earns nine characters in the field. Other
  provincial variants sit at traffic 8 and do not.
- `license` appears in the keyword field deliberately. It is the alternative spelling,
  not a plural of the title's `Licences`, and Canadian related searches use both.
  `licence` itself is omitted — the title already covers it.
- Species terms are high volume but contaminated: `elk hunting` 46/21/2.19 and
  `moose hunting` 49/24/2.04 have games and call apps in the SERP. Worth keyword slots,
  never title space. `deer hunting` is worse than both and gets no priority.

### Ontario caveat

The top result for `ontario hunting licence` is an exam-prep app. Screenshots for Canada
should say *already licensed — keep it organized*, or we attract people studying for
their accreditation instead of hunters managing a season.

## Québec

A first French Applyra pass (Nov 2026): `permis de chasse` is 25/25, KEI 1.0, but its top
three are exam-prep apps, the same trap as Ontario. `chasse` alone is 54/59 and mostly
games; autocomplete offers `chasse quebec` and `chasse et peche`. The fr-CA listing in
`ASO_LOCALIZATIONS.md` is built from that and ships in 1.1 without a native review, by
the owner's choice; fix any term a Québécois speaker flags.

## What this means for the product

Nothing. Same app, same features, different doorway:

- U.S. — "Organize all my hunting paperwork and season."
- Canada — "Keep my hunting season organized and preserve my hunt history."

The journal earns acquisition in Canada and retention in the U.S., which is an argument
for building it well, not for building it differently.
