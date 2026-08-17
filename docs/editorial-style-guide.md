# DeliciousDuck editorial and source style guide

This is the permanent standard for **every** public page, reusable component copy,
newsletter text, and tool caption on DeliciousDuck — not just one guide. Automated
guardrails live in `src/lib/__tests__/editorial-voice.test.ts`.

## Voice

Write like a confident food editor helping a home cook make one good decision.

- Lead with the useful answer. The reader's decision comes before background.
- Warm, direct, practical. Never academic, regulatory, or legalistic.
- Short paragraphs, varied sentence rhythm, plain language.
- Cut caveats that do not change what the reader does next.
- Never pad to sound authoritative.

## Sourcing and attribution

Facts stay exact. Attribution gets quiet.

- **State the fact naturally**, then attribute compactly: `165°F (73.9°C) internal,
  measured with a food thermometer.<SourceMark to="sources" />`
- **Avoid institutional throat-clearing** in body copy: "USDA recommends",
  "USDA guidance is", "according to USDA", "per USDA", "USDA says".
- Full attribution belongs in `<SourceNotes />`, source-registry notes
  (`src/data/sources.ts`), or an `<ArticleBasis />` block.
- Inline attribution is allowed **only where the source's identity helps the reader
  interpret the claim** — chiefly where a culinary convention sits below an official
  safe minimum (doneness pages, `SafetyNote`, `USDA_SAFETY_LINE`, the turkey figures
  on the Thanksgiving guide, which are USDA's rather than ours). Keep those; do not
  multiply them.
- Never change a temperature, time, weight, storage window, or yield to improve prose.
- Primary sources (USDA/FSIS, FDA) support safety and quantitative claims. Chefs and
  culinary publications may inform flavour, technique, and menu planning only, and
  must be labelled as culinary reading rather than safety guidance.
- Keep `checked` dates in `src/data/sources.ts` accurate.

## Preferred vocabulary

- Say **"official safe minimum"** (or "the official minimum" / "the official safety
  minimum" in headings) when contrasting the 165°F (73.9°C) poultry minimum with
  culinary convention. Do not label the number "the USDA number" or the heading
  "USDA safety minimum" — the attribution lives in the notes.
- Attribution stays **quiet**: the fact in body copy, the source in `<SourceMark />`,
  `<SourceNotes />`, or the registry.
- For products we have researched but not cooked with, say **"hands-on review
  pending"** — never "not because we have tested it" or any phrasing that implies
  testing either way.

## Claims we do not make

- No "we tested", "reader-approved", "foolproof", or "kitchen verified" unless a
  recorded kitchen test exists (see `/editorial-standards`).
- No invented yields, serving counts, timings, ratings, or consensus.
- No editorial pairing opinion presented as a food-safety or measurement fact. Label
  it: "editorial pairing guidance from our kitchen".
- No calculator assumption restated as an established fact.


## Structure

- Every section earns its place: it answers a question, removes doubt, or helps the
  reader act.
- Comparison and commercial pages must show real tradeoffs, say who each option
  suits, and give one clear next step.
- Visible FAQs stay exactly in sync with FAQ schema (same array, same order).
- Don't change SEO targets, headings, schema, route paths, or affiliate disclosures
  during an editorial pass.

## When unsure

Flag the passage for an editorial decision instead of guessing. A vague sentence is
recoverable; an invented number is not.
