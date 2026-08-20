import { RECIPES, type Recipe } from "./recipes";

/**
 * Full page content for each recipe at /recipes/<slug>.
 *
 * Ingredients and steps are written to map cleanly onto schema.org/Recipe
 * (recipeIngredient + HowToStep), so the JSON-LD is built from the same data
 * the page renders — never a separate, drifting copy.
 */
export interface RecipeStep {
  title: string;
  body: string;
  watchFor?: string;
}

export interface RecipeContent {
  slug: string;
  /** One-paragraph editorial intro under the H1. */
  intro: string;
  /**
   * Optional two-to-three sentence answer to the question the page is found
   * for ("how do I cook this?"), placed above the recipe body. Every fact in
   * it must already appear in the steps and temperature table below — it is a
   * summary of this page, never a new claim.
   */
  answerFirst?: string;
  confidence: {
    cut: string;
    biggestRisk: string;
    essentialTechnique: string;
    targetResult: string;
    essentialTool: string;
    saveAfterwards: string;
  };
  ingredientGroups: { heading: string; items: string[] }[];
  equipment: { label: string; why: string; to?: string; linkLabel?: string }[];
  before: { heading: string; body: string }[];
  steps: RecipeStep[];
  temperatures: { caption: string; columns: string[]; rows: string[][] };
  /**
   * Callout under the timings table. Meat recipes inherit the default
   * thermometer-led wording; recipes with no internal target temperature (a
   * vegetable side, say) supply their own, so no page tells a reader to probe
   * something that has no doneness temperature.
   */
  verifyNote?: { label: string; body: string };
  /**
   * Caption under the recipe photograph, for anything shown in the shot that
   * the ingredients do not include — so no garnish or sauce is implied to be
   * part of the recipe.
   */
  imageCaption?: { text: string; to?: string; linkLabel?: string };
  /** Overrides the method-basis line's "how to read the numbers" clause. */
  guidanceNote?: string;
  quackFix: { symptom: string; cause: string; fixNow: string; prevent: string }[];
  leftovers: { part: string; use: string; to?: string; linkLabel?: string }[];
  /** Heading/intro for the leftovers module, when "the whole duck" doesn't fit. */
  leftoversHeading?: string;
  leftoversIntro?: string;
  faq: { q: string; a: string }[];
  /** Guide + tool paths for the Related module. */
  related: string[];
  /** Sourcing links (Buy pillar). */
  sourcing: { label: string; why: string; to: string; linkLabel?: string }[];
  /**
   * When true, the page's commercial destinations are linked in exactly one
   * place: the dedicated conversion module, placed after the cooking answer.
   * The equipment list stays a plain list and the sourcing modules are omitted,
   * so no destination appears twice on the page.
   */
  linksInModuleOnly?: boolean;
  sourceIds: string[];
}

export const RECIPE_CONTENT: Record<string, RecipeContent> = {
  "peking-duck-at-home": {
    slug: "peking-duck-at-home",
    intro:
      "Restaurant Peking duck runs on equipment no home kitchen has: a vertical oven, an air pump, days of hanging space. What travels home is the sequence — scald the skin, dry it hard, glaze it thin, roast it in two stages — and that sequence gets you genuinely lacquered, shatter-crisp skin off a domestic oven and a wire rack.",
    confidence: {
      cut: "Whole Pekin duck, 2–2.5 kg (4.5–5.5 lb)",
      biggestRisk: "Rushing the drying stage — damp skin steams instead of lacquering",
      essentialTechnique: "Boiling-water scald, then 12–24 hours uncovered in the fridge",
      targetResult: "Glassy mahogany skin; thigh meat fully tender at 175–185°F (79–85°C)",
      essentialTool: "A wire rack set over a deep roasting tray",
      saveAfterwards: "The rendered fat in the tray, and the carcass for broth",
    },
    ingredientGroups: [
      {
        heading: "For the duck",
        items: [
          "1 whole Pekin duck, 2–2.5 kg (4.5–5.5 lb), fully thawed",
          "2 litres (8 cups) water, for scalding",
          "2 tbsp maltose or honey",
          "1 tbsp Shaoxing wine (or dry sherry)",
          "1 tbsp rice vinegar",
          "1 tsp fine sea salt",
        ],
      },
      {
        heading: "To serve",
        items: [
          "12–16 thin Mandarin pancakes, steamed",
          "6 scallions, cut into fine batons",
          "½ cucumber, seeded and cut into batons",
          "60 ml (¼ cup) hoisin or sweet bean sauce",
        ],
      },
    ],
    equipment: [
      {
        label: "Deep roasting tray and wire rack",
        why: "The duck has to sit clear of its own rendering fat for the whole roast, and a domestic tray needs the depth to hold it.",
        to: "/gear/best-roasting-pan-for-duck",
        linkLabel: "Roasting pan buying guide",
      },
      {
        label: "Instant-read thermometer",
        why: "Whole-bird timings vary with weight and oven. Thigh temperature is the only reliable signal that the legs are done.",
        to: "/gear/best-thermometer-for-duck",
        linkLabel: "Thermometer buying guide",
      },
      {
        label: "Fridge shelf space, uncovered",
        why: "The drying stage is the recipe. Twelve to twenty-four hours of cold, moving air is what makes the skin lacquer rather than steam.",
      },
    ],
    before: [
      {
        heading: "Loosen the skin, then scald it",
        body: "Pat the duck dry and slide a finger or the handle of a spoon between skin and breast meat to separate them where you can, without tearing. Set the duck on a rack in the sink and ladle boiling water over it for a minute or two, turning, until the skin tightens and turns opaque. The scald shrinks the skin away from the fat and opens it to the glaze.",
      },
      {
        heading: "Glaze and dry",
        body: "Warm the maltose or honey with the wine, vinegar and salt until pourable, then brush a thin coat over the whole bird. Set it breast-up on a rack over a tray and refrigerate uncovered for 12–24 hours. The skin should feel dry and parchment-like before it goes near the oven — tacky skin means it needs longer.",
      },
    ],
    steps: [
      {
        title: "Bring the duck to room temperature briefly",
        body: "Take the duck out 30 minutes before roasting so the surface is not fridge-cold going in, and give it a second thin coat of glaze. Do not leave a whole bird out longer than that; perishable food should not sit between 40°F and 140°F for more than two hours in total.",
      },
      {
        title: "Roast hot to set the skin",
        body: "Heat the oven to 425°F (220°C) convection off. Roast the duck breast-up on the rack for 25 minutes, until the skin is tightening and colouring at the edges.",
        watchFor:
          "A little smoke from fat hitting the tray is normal. If it is more than a little, add a cup of water to the tray.",
      },
      {
        title: "Drop the heat and render",
        body: "Reduce to 325°F (165°C) and continue for 60–75 minutes, pouring the fat out of the tray twice along the way. This is where the fat cap leaves and the legs turn tender.",
        watchFor:
          "If the breast skin is racing ahead of the legs, tent the breast loosely with foil.",
      },
      {
        title: "Finish hot for lacquer",
        body: "Raise the heat back to 425°F (220°C) for a final 10–15 minutes to bring the skin to a deep, even mahogany with a glassy surface.",
        watchFor:
          "The sugars in the glaze can go from mahogany to bitter in a couple of minutes. Watch it, do not time it.",
      },
      {
        title: "Check the thigh, then rest",
        body: "Probe the thickest part of the thigh, avoiding bone: 175–185°F (79–85°C) means the legs are properly tender rather than merely safe. Rest, uncovered, on a rack for 15 minutes so the skin stays crisp.",
        watchFor:
          "The safe minimum internal temperature for all poultry, duck included, is 165°F (73.9°C). Whole-bird legs simply eat better well past it.",
      },
      {
        title: "Carve skin first, then meat",
        body: "Slice the crisp skin off in broad pieces and serve it separately — this is the part guests are waiting for. Then carve the breast into thin slices and pull the leg meat. Build pancakes with a smear of hoisin, scallion, cucumber, a slice of meat and a shard of skin.",
      },
    ],
    temperatures: {
      caption: "Oven stages and target temperatures",
      columns: ["Stage", "Oven", "Time or target"],
      rows: [
        ["Set the skin", "425°F (220°C)", "25 minutes"],
        ["Render", "325°F (165°C)", "60–75 minutes, drain fat twice"],
        ["Lacquer", "425°F (220°C)", "10–15 minutes, watch closely"],
        ["Thigh, for tenderness", "—", "175–185°F (79–85°C)"],
        ["Poultry safe minimum", "—", "165°F (73.9°C)"],
      ],
    },
    quackFix: [
      {
        symptom: "Skin is leathery rather than crisp",
        cause: "Not dry enough before roasting, so the first stage steamed it.",
        fixNow:
          "Give it a further 8–10 minutes at 425°F (220°C) and serve the skin separately from the meat.",
        prevent: "Let the glazed bird dry uncovered in the fridge for a full 24 hours next time.",
      },
      {
        symptom: "Glaze turned dark and bitter",
        cause: "Sugar burned during the final high-heat stage.",
        fixNow: "Trim the darkest patches; the rest of the skin is still good.",
        prevent:
          "Glaze thinly, and treat the last stage as a watched 10 minutes rather than a set 15.",
      },
      {
        symptom: "Breast dry by the time the legs were tender",
        cause:
          "Whole-bird cooking always pulls the breast past rosy — the fix is protection, not timing.",
        fixNow: "Slice the breast thin and serve it with the pan juices and plenty of skin.",
        prevent:
          "Tent the breast with foil through the render stage, and carve legs and breast separately.",
      },
      {
        symptom: "Kitchen filled with smoke",
        cause: "Rendered fat pooling and overheating in the tray.",
        fixNow: "Carefully pour the fat off and add a cup of water to the tray.",
        prevent: "Drain the tray twice during the render stage, every time.",
      },
    ],
    leftovers: [
      {
        part: "Rendered fat",
        use: "Strain and keep it — this is the best batch of duck fat you will get all year.",
        to: "/cook/ways-to-use-duck-fat",
        linkLabel: "Fifteen uses for duck fat",
      },
      {
        part: "Carcass",
        use: "Simmer into a deep broth for noodles; the bones from a glazed bird make a darker stock than usual.",
      },
      {
        part: "Leg and shoulder meat",
        use: "Shred into pancakes, fried rice, or a cold salad the next day.",
      },
    ],
    faq: [
      {
        q: "Can you make Peking duck without a special oven?",
        a: "Yes. What a Peking oven gives you is fierce radiant heat and hanging airflow; a domestic oven with the bird on a wire rack over a deep tray gets close, provided you do the scald and the long uncovered dry.",
      },
      {
        q: "Do I need maltose?",
        a: "No. Maltose gives the most authentic glassy lacquer, but honey thinned with wine and vinegar browns very similarly. Use whichever you can get.",
      },
      {
        q: "How long does the skin need to dry?",
        a: "Twelve hours uncovered in the fridge is the minimum; twenty-four is better. The test is touch, not the clock — the skin should feel dry and papery, with no tackiness.",
      },
      {
        q: "What duck should I buy?",
        a: "A whole Pekin duck of 2–2.5 kg (4.5–5.5 lb). It is the breed the dish was built around and the one sold in most US supermarkets and online duck suppliers.",
      },
      {
        q: "Is it safe to serve Peking duck with pink meat near the bone?",
        a: "Cook whole duck until the thigh reads at least 165°F (73.9°C), the safe minimum for all poultry. In practice the legs taste better at 175–185°F (79–85°C), which puts safety well behind you.",
      },
    ],
    related: [
      "/cook/whole-roast-duck",
      "/learn/why-duck-skin-isnt-crispy",
      "/learn/how-to-render-duck-fat",
      "/tools/whole-duck-serving-calculator",
      "/tools/duck-doneness-guide",
      "/recipes/roasted-whole-duck",
      "/recipes/duck-a-lorange",
    ],
    sourcing: [
      {
        label: "Buying a whole duck",
        why: "Pekin at 2–2.5 kg is the size this method is written for, and frozen whole birds need a full day or more of fridge thawing before the drying stage begins.",
        to: "/buy/where-to-buy-duck-online",
        linkLabel: "Where to buy duck online",
      },
    ],
    sourceIds: ["usdaPoultryTemp", "usdaPoultryPrep", "usdaThawing", "usdaDangerZone"],
  },

  "oven-roasted-duck-breast": {
    slug: "oven-roasted-duck-breast",
    intro:
      "A skillet is the best way to cook two duck breasts and a stressful way to cook six. Rendering on the stovetop and finishing in the oven splits the job: you control the crisp by hand, then let steady oven heat bring four breasts to the same rosy centre at the same time.",
    confidence: {
      cut: "Skin-on duck breasts, 170–250 g (6–9 oz) each",
      biggestRisk: "Moving to the oven before the fat cap has actually rendered",
      essentialTechnique: "Low skillet render skin-side down, then a short oven finish",
      targetResult: "Crisp rendered skin; centre pulled at 130–135°F (54–57°C) for rosy",
      essentialTool: "An instant-read thermometer",
      saveAfterwards: "The rendered fat, strained into a jar",
    },
    ingredientGroups: [
      {
        heading: "For the duck",
        items: [
          "4 skin-on duck breasts, about 170–250 g (6–9 oz) each",
          "2 tsp fine sea salt (roughly 1% of the breast weight)",
          "Freshly cracked black pepper, to finish",
        ],
      },
      {
        heading: "Optional pan jus",
        items: [
          "1 shallot, finely diced",
          "80 ml (⅓ cup) red wine or cherry juice",
          "160 ml (⅔ cup) chicken or duck stock",
          "1 tsp red wine vinegar",
          "20 g (1½ tbsp) cold unsalted butter",
        ],
      },
    ],
    equipment: [
      {
        label: "Oven-safe heavy skillet",
        why: "The same pan renders on the stovetop and goes into the oven, so the skin never leaves the surface that crisped it.",
        to: "/gear/best-pan-for-duck-breast",
        linkLabel: "Pan buying guide",
      },
      {
        label: "Instant-read thermometer",
        why: "Four breasts of different thicknesses will not finish together. Probing each one is the only way to pull them all right.",
        to: "/gear/best-thermometer-for-duck",
        linkLabel: "Thermometer buying guide",
      },
      {
        label: "Wire rack",
        why: "Resting skin-side up on a rack keeps the crust you just built; a plate steams it soft.",
      },
    ],
    before: [
      {
        heading: "Dry the skin and salt it",
        body: "Pat the skin bone-dry and salt it. If you have a few hours, leave the breasts uncovered on a rack in the fridge — a drier surface renders faster and browns better. Heat the oven to 400°F (200°C) before you start rendering, so it is ready when the skin is.",
      },
      {
        heading: "Score the fat cap",
        body: "Cut a shallow 1 cm (⅜ in) crosshatch through skin and fat only, stopping short of the meat, to open drainage channels. If the knife shows red, you have gone too deep.",
      },
    ],
    steps: [
      {
        title: "Render in a cold, dry pan",
        body: "Lay the breasts skin-side down in an unheated, unoiled oven-safe skillet, then set the heat to low. Render for 10–15 minutes, pouring the fat off into a heatproof bowl every few minutes so the skin fries in a thin film rather than a pool.",
        watchFor:
          "The skin should be a deep, even amber and the fat cap noticeably thinner before the pan goes anywhere near the oven.",
      },
      {
        title: "Transfer the pan to the oven",
        body: "Leave the breasts skin-side down and slide the whole skillet into the 400°F (200°C) oven for 6–10 minutes, depending on thickness. Oven heat surrounds the meat, so thick and thin breasts even out instead of racing each other.",
        watchFor:
          "Thin breasts under 180 g can be done in as little as 5 minutes. Start checking early.",
      },
      {
        title: "Probe every breast",
        body: "Pull the pan out and probe each breast from the side into the centre of the thickest part. Take out any that have reached 130–135°F (54–57°C) for rosy, or 140–145°F (60–63°C) for medium, and return the rest for another two minutes.",
      },
      {
        title: "Rest skin-side up",
        body: "Rest on a wire rack for 5–10 minutes, skin-side up and uncovered. Carryover adds roughly 3–5°F, which is already counted in the pull temperatures above.",
        watchFor:
          "The safe minimum for all poultry, duck included, is 165°F (73.9°C). A rosy centre is a common culinary practice rather than a food-safety recommendation.",
      },
      {
        title: "Optional: build a jus while they rest",
        body: "Pour off all but a teaspoon of fat, soften the shallot, deglaze with wine or juice, reduce by half, add stock and reduce until it coats a spoon. Off the heat, whisk in the vinegar and cold butter. Slice the breasts across the grain and spoon the jus under the slices, not over the skin.",
      },
    ],
    temperatures: {
      caption: "Pull temperatures, before carryover",
      columns: ["Result", "Pull temperature", "After rest"],
      rows: [
        ["Rare", "125–128°F (52–53°C)", "≈130°F (54°C)"],
        ["Medium-rare (most common)", "130–135°F (54–57°C)", "≈135–138°F (57–59°C)"],
        ["Medium", "140–145°F (60–63°C)", "≈145–150°F (63–66°C)"],
        ["Poultry safe minimum", "165°F (73.9°C)", "Fully cooked through"],
      ],
    },
    quackFix: [
      {
        symptom: "Skin softened in the oven",
        cause:
          "The breasts went in before the fat cap had rendered, so fat melted out under set skin.",
        fixNow:
          "Return the pan to low stovetop heat, skin-side down, for 3–5 minutes and pour off the fat.",
        prevent: "Judge the move to the oven by the look of the fat cap, not the clock.",
      },
      {
        symptom: "Some breasts overcooked while others were rare",
        cause: "Mixed thicknesses pulled at the same moment.",
        fixNow: "Nothing to fix afterwards — slice the overcooked ones thinner and serve with jus.",
        prevent: "Probe each breast individually and remove them one at a time.",
      },
      {
        symptom: "Grey band under the skin",
        cause: "The render ran too hot, cooking the meat inward from the surface.",
        fixNow: "Slice thin and serve with something sharp.",
        prevent: "Keep the render on low; the oven supplies all the heat the meat needs.",
      },
      {
        symptom: "Pan smoked in the oven",
        cause: "Too much rendered fat left in the skillet.",
        fixNow: "Drain the fat and continue.",
        prevent: "Pour the fat off two or three times during the stovetop render.",
      },
    ],
    leftovers: [
      {
        part: "Rendered fat",
        use: "Strain and refrigerate. Four breasts give you a serious jar of it.",
        to: "/cook/ways-to-use-duck-fat",
        linkLabel: "Fifteen uses for duck fat",
      },
      {
        part: "Cold cooked breast",
        use: "Slice thin for sandwiches or a warm salad; avoid hard reheating.",
      },
      {
        part: "Trimmed skin edges",
        use: "Fry slowly into cracklings and salt them while hot.",
      },
    ],
    faq: [
      {
        q: "What oven temperature is best for duck breast?",
        a: "400°F (200°C) after a stovetop render. It is hot enough to finish a breast in 6–10 minutes without driving a thick grey band in from the surface.",
      },
      {
        q: "Can I roast duck breast without searing it first?",
        a: "You can, but the skin will not be as crisp. Duck skin needs slow, direct contact with a pan to render its fat; oven air alone leaves more of it behind.",
      },
      {
        q: "How long does duck breast take in the oven?",
        a: "6–10 minutes at 400°F (200°C) after a 10–15 minute stovetop render, depending on thickness. Times are a guide; the thermometer decides.",
      },
      {
        q: "Is this better than pan-searing?",
        a: "It is better for four or more breasts, or for thick Moulard breasts where a pan alone overcooks the outside. For two ordinary Pekin breasts, the skillet method is simpler.",
      },
      {
        q: "Do I cover duck breast in the oven?",
        a: "No. Covering traps steam and undoes the crisp skin you just spent fifteen minutes rendering.",
      },
    ],
    related: [
      "/cook/how-to-cook-duck-breast",
      "/learn/duck-breast-temperature-doneness",
      "/learn/why-duck-skin-isnt-crispy",
      "/learn/how-to-score-duck-breast",
      "/cook/best-sauces-for-duck-breast",
      "/tools/duck-doneness-guide",
      "/recipes/pan-seared-duck-breast",
      "/recipes/air-fryer-duck-breast",
    ],
    sourcing: [
      {
        label: "Buying duck breast",
        why: "Breast weights vary widely between suppliers, and cooking four at once makes matched sizes worth asking about. The cut guide covers formats and what to check on arrival.",
        to: "/buy/where-to-buy-duck-breast-online",
        linkLabel: "Where to buy duck breast online",
      },
    ],
    sourceIds: ["usdaPoultryTemp", "usdaPoultryPrep"],
  },

  "pan-seared-duck-breast": {
    slug: "pan-seared-duck-breast",
    intro:
      "Duck breast is a fat problem before it is a meat problem. Nearly everything that separates flabby, greasy skin from a crisp, glassy crust happens in the first ten minutes, at a temperature far lower than most people expect. Start the breast in a cold, dry pan, render patiently, and the finish takes care of itself.",
    confidence: {
      cut: "Skin-on duck breast, 170–250 g (6–9 oz) each",
      biggestRisk: "Starting hot — the skin seizes and traps unrendered fat underneath",
      essentialTechnique: "Cold-pan rendering, skin-side down, over low heat",
      targetResult: "Skin fully rendered and crisp; centre pulled at 130–135°F (54–57°C) for rosy",
      essentialTool: "A fast instant-read thermometer",
      saveAfterwards: "The rendered fat — strain it and keep it for potatoes",
    },
    ingredientGroups: [
      {
        heading: "For the duck",
        items: [
          "2 skin-on duck breasts, about 170–250 g (6–9 oz) each",
          "1 tsp fine sea salt (or roughly 1% of the breast weight)",
          "Freshly cracked black pepper, to finish",
        ],
      },
      {
        heading: "Optional pan sauce",
        items: [
          "1 small shallot, finely diced",
          "60 ml (¼ cup) dry red wine, port, or cherry juice",
          "120 ml (½ cup) chicken or duck stock",
          "1 tsp red wine vinegar",
          "15 g (1 tbsp) cold unsalted butter",
        ],
      },
    ],
    equipment: [
      {
        label: "Instant-read thermometer",
        why: "The window between rosy and grey on a duck breast is a few degrees wide. Colour and touch are not reliable substitutes.",
        to: "/gear/best-thermometer-for-duck",
        linkLabel: "Thermometer buying guide",
      },
      {
        label: "Heavy skillet, 10–12 in",
        why: "Cast iron or thick stainless holds a steady low temperature through a long render and browns evenly at the finish.",
        to: "/gear/best-pan-for-duck-breast",
        linkLabel: "Pan buying guide",
      },
      {
        label: "Sharp, thin-bladed knife",
        why: "Scoring is a controlled cut through skin and fat only. A dull blade drags into the meat and lets juices leak during the render.",
        to: "/gear/best-knife-for-scoring-duck",
        linkLabel: "Knife buying guide",
      },
    ],
    before: [
      {
        heading: "Temper and dry the skin",
        body: "Take the breasts out of the fridge 20–30 minutes ahead and pat the skin bone-dry with paper towel. Surface moisture has to boil off before rendering begins, and every minute spent evaporating water is a minute the meat is cooking without the skin crisping. If you have time, salt the skin and leave the breasts uncovered in the fridge for a few hours — a drier surface renders faster.",
      },
      {
        heading: "Score the fat cap",
        body: "Cut a 1 cm (⅜ in) crosshatch or parallel lines through the skin and fat, stopping just short of the meat. The cuts open channels for fat to escape and multiply the surface area that can brown. If the knife hits red, you have gone too deep.",
      },
    ],
    steps: [
      {
        title: "Start cold and dry",
        body: "Lay the breasts skin-side down in an unheated, unoiled pan and only then turn the heat to low. There is enough fat in the skin to fry the breast in itself; adding oil just delays the render.",
        watchFor:
          "Silence for the first minute or two is normal. A loud sizzle immediately means the pan was already hot.",
      },
      {
        title: "Render slowly for 12–18 minutes",
        body: "Keep the heat low enough that the fat bubbles gently rather than spits. Pour off the liquid fat into a heatproof bowl every few minutes — a shallow pan browns; a deep pool of fat effectively deep-fries and steams. The skin should shrink, flatten and turn a deep, even amber.",
        watchFor:
          "If the skin darkens fast while the fat cap is still thick, drop the heat further and extend the render.",
      },
      {
        title: "Press if the breast curls",
        body: "Duck breasts contract as connective tissue tightens and can lift at the edges, leaving pale patches. Press gently with a spatula for the first few minutes, or set a small weight on top, so the full skin surface stays in contact with the pan.",
      },
      {
        title: "Flip and finish",
        body: "Once the skin is crisp and the fat cap is thin, raise the heat slightly and flip. The meat side only needs 1–3 minutes depending on thickness — it is nearly cooked already from the long render.",
        watchFor:
          "Probe from the side into the thickest part, keeping the tip in the centre of the muscle.",
      },
      {
        title: "Pull early, then rest",
        body: "Pull at 130–135°F (54–57°C) for rosy, 140–145°F (60–63°C) for medium. Rest skin-side up on a rack for 5–10 minutes; carryover adds roughly 3–5°F, and resting on a plate steams the crust you just spent twenty minutes building.",
        watchFor:
          "The safe minimum for all poultry, duck included, is 165°F (73.9°C). Cooking to a lower temperature is a common culinary practice, not a food-safety recommendation.",
      },
      {
        title: "Optional: build a pan sauce while it rests",
        body: "Pour off all but a teaspoon of fat, soften the shallot, deglaze with wine or juice, reduce by half, add stock and reduce again until it coats a spoon. Off the heat, whisk in vinegar and cold butter. Slice the breast across the grain at a slight angle and spoon the sauce under, not over, the skin.",
      },
    ],
    temperatures: {
      caption: "Pull temperatures, before carryover",
      columns: ["Result", "Pull temperature", "After rest"],
      rows: [
        ["Rare", "125–128°F (52–53°C)", "≈130°F (54°C)"],
        ["Medium-rare (most common)", "130–135°F (54–57°C)", "≈135–138°F (57–59°C)"],
        ["Medium", "140–145°F (60–63°C)", "≈145–150°F (63–66°C)"],
        ["USDA recommendation", "165°F (73.9°C)", "Fully cooked through"],
      ],
    },
    quackFix: [
      {
        symptom: "Skin is soft and rubbery, not crisp",
        cause: "The render was too short or too hot, leaving fat under the skin.",
        fixNow:
          "Return the breast skin-side down to a low pan for another 3–5 minutes, pouring off fat as it releases.",
        prevent:
          "Treat the render as the recipe, not the preamble: 12–18 minutes on low with regular fat removal.",
      },
      {
        symptom: "Skin browned fast but the fat cap is still thick",
        cause: "Heat was too high — the surface set before the fat could melt out.",
        fixNow:
          "Lower the heat and continue; a slightly darker crust is better than an unrendered one.",
        prevent: "Start in a cold pan and never let the fat spit.",
      },
      {
        symptom: "Grey band under the skin",
        cause: "Prolonged high heat drove overcooking inward from the surface.",
        fixNow: "Nothing to be done after the fact — slice thinly and serve with a sharp sauce.",
        prevent: "Low heat for the render, brief high heat only at the flip.",
      },
      {
        symptom: "Meat is tough and dry",
        cause: "Overcooked past medium, or sliced with the grain.",
        fixNow: "Slice thinner, across the grain, and serve with pan juices.",
        prevent: "Pull by thermometer, rest 5–10 minutes, and carve at an angle.",
      },
    ],
    leftovers: [
      {
        part: "Rendered fat",
        use: "Strain through a fine sieve and refrigerate. It is the single best roasting fat in the kitchen.",
        to: "/cook/ways-to-use-duck-fat",
        linkLabel: "Fifteen uses for duck fat",
      },
      {
        part: "Trimmed skin edges",
        use: "Dice and fry slowly into cracklings; salt while hot and scatter over salad.",
      },
      {
        part: "Cold cooked breast",
        use: "Slice thin the next day for sandwiches or a warm salad — do not reheat it hard.",
      },
    ],
    faq: [
      {
        q: "Do I need to add oil to the pan?",
        a: "No. Skin-on duck breast renders more than enough of its own fat. Added oil raises the fat level early, which fries the skin before it has rendered.",
      },
      {
        q: "Can I cook duck breast from frozen?",
        a: "Thaw it first. A frozen breast cooks unevenly and releases water into the pan, which stops the skin from crisping. Thaw in the fridge for 24 hours.",
      },
      {
        q: "Is pink duck breast safe?",
        a: "The safe minimum for all poultry, duck included, is 165°F (73.9°C). Serving duck breast rosy is a widespread restaurant and home practice, but it is a culinary choice rather than a food-safety recommendation. Anyone pregnant, elderly, very young, or immunocompromised should cook to the full 165°F.",
      },
      {
        q: "Should I score in a crosshatch or in lines?",
        a: "Either works. Crosshatch gives slightly more surface area and drainage; parallel lines are easier to keep shallow. Depth matters far more than pattern.",
      },
    ],
    related: [
      "/cook/how-to-cook-duck-breast",
      "/learn/how-to-score-duck-breast",
      "/learn/duck-breast-temperature-doneness",
      "/learn/why-duck-skin-isnt-crispy",
      "/cook/best-sauces-for-duck-breast",
      "/cook/what-to-serve-with-duck-breast",
      "/tools/duck-doneness-guide",
      "/tools/recipe-scaler",
      "/recipes/air-fryer-duck-breast",
      "/recipes/duck-a-lorange",
      "/recipes/oven-roasted-duck-breast",
    ],
    sourcing: [
      {
        label: "Buying duck breast",
        why: "Breast weights vary widely between suppliers, so render to the look of the fat cap and check temperature rather than following a fixed time. The cut-specific guide covers formats, weights, and what to check when the box arrives.",
        to: "/buy/where-to-buy-duck-breast-online",
        linkLabel: "Where to buy duck breast online",
      },
    ],
    sourceIds: ["usdaPoultryTemp", "usdaPoultryPrep"],
  },

  "air-fryer-duck-breast": {
    slug: "air-fryer-duck-breast",
    imageCaption: {
      text: "Shown with an optional dark cherry sauce, which is not part of the recipe below.",
      to: "/ingredients/cherry-plum-with-duck",
      linkLabel: "Cherry and plum with duck",
    },
    intro:
      "An air fryer crisps duck skin differently from a skillet: hot moving air browns the surface while the fat cap drains instead of frying. The method below renders low first, crisps hot briefly, and finishes on a thermometer rather than a timer.",
    confidence: {
      cut: "Skin-on duck breast, 170–250 g (6–9 oz) each",
      biggestRisk: "The meat climbing past your target before the fat cap has rendered",
      essentialTechnique: "Low render stage, then a short high-heat crisping stage, skin-side up",
      targetResult:
        "Skin rendered and crisp in patches, centre pulled at 130–135°F (54–57°C) for rosy",
      essentialTool: "A fast instant-read thermometer",
      saveAfterwards: "The fat collected in the drawer — strain it once cool",
    },
    ingredientGroups: [
      {
        heading: "For the duck",
        items: [
          "2 skin-on duck breasts, about 170–250 g (6–9 oz) each",
          "1 tsp fine sea salt (or roughly 1% of the breast weight)",
          "Freshly cracked black pepper, to finish",
        ],
      },
    ],
    equipment: [
      {
        label: "Instant-read thermometer",
        why: "Air fryers vary by basket design, wattage, fan strength and preheat behaviour, so the timings here are starting ranges. A probe reading is the only thing that tells you where the centre actually is.",
        to: "/gear/best-thermometer-for-duck",
        linkLabel: "Thermometer buying guide",
      },
      {
        label: "Sharp, thin-bladed knife",
        why: "Scoring is a controlled cut through skin and fat only. A dull blade drags into the meat, which leaks juice into a basket you cannot deglaze.",
        to: "/gear/best-knife-for-scoring-duck",
        linkLabel: "Knife buying guide",
      },
      {
        label: "Tongs and a heatproof container",
        why: "Rendered fat pools under the basket while it is still dangerously hot. You want to move breasts with tongs and pour fat into something that will not soften or tip.",
      },
    ],
    before: [
      {
        heading: "Dry the skin, then salt it",
        body: "Pat the skin bone-dry with paper towel and salt it. Surface moisture has to boil off before browning starts, and in an air fryer that steam has nowhere useful to go. If you have a few hours, salt the skin and leave the breasts uncovered on a rack in the fridge — a drier surface browns sooner, which shortens the time the meat spends heating up.",
      },
      {
        heading: "Score the fat cap, shallowly",
        body: "Cut a 1 cm (⅜ in) crosshatch or parallel lines through skin and fat, stopping short of the meat. If the knife shows red you have gone too deep, and the cut will leak. The channels matter more here than in a pan: draining is the only way fat leaves an air fryer basket.",
      },
      {
        heading: "Skip the preheat, and check your manual",
        body: "A cold start buys the fat cap a few extra minutes of gentle rendering before the meat climbs, which is the whole difficulty of this cook. If your machine's instructions require a preheat, preheat at the lowest setting it allows and expect the render stage to run shorter. Do not add water to the drawer unless the manufacturer explicitly permits it.",
      },
      {
        heading: "Cook two at most, with air between them",
        body: "Duck breast needs airflow on all sides and room for fat to drain. Two breasts in a standard basket, not touching, is the practical limit for most machines; a crowded basket steams instead of browning and the two pieces finish at different times.",
      },
    ],
    steps: [
      {
        title: "Set the breasts skin-side up",
        body: "Lay the breasts in the basket skin-side up, not touching, and do not oil them. Skin-side up puts the fan directly on the surface you want dry and brown, and lets melted fat run down and away rather than sitting under the skin.",
        watchFor:
          "Any part of a breast touching the basket wall will brown differently. Give each piece a clear gap before you start.",
      },
      {
        title: "Render low: 300–325°F (150–160°C) for 8–12 minutes",
        body: "Run the low stage until the fat cap has visibly thinned, the skin has shrunk back and the surface has gone from pale and slack to matte, tacky and faintly golden. This is the stage that decides the result; rushing it is the single most common reason air-fried duck skin stays rubbery.",
        watchFor:
          "Fat should render steadily without spitting or smoking. Heavy smoke at this point means the setting is too high — drop it and add time.",
      },
      {
        title: "Pause and drain the fat",
        body: "Open the basket, lift the breasts onto a plate with tongs, and tip the collected fat into a heatproof container. Standing fat is what smokes, spits and eventually flares; draining it once mid-cook removes most of that risk. Let the fat cool before you cover or move it, and never pour hot fat into a sink or a thin plastic tub.",
        watchFor:
          "If the drawer is close to full at this point, drain it again before the crisping stage rather than after.",
      },
      {
        title: "Crisp high: 390–400°F (200–205°C) for 3–6 minutes",
        body: "Return the breasts skin-side up and raise the setting. This short window is where the crust forms. Check at three minutes and then every minute or so — the difference between deep amber and burnt is about ninety seconds at this temperature, and the meat is climbing fast now.",
        watchFor:
          "Pull the basket early if the thinnest edges darken ahead of the centre; those edges will keep browning on residual heat.",
      },
      {
        title: "Measure, don't guess",
        body: "Probe from the side into the thickest part, keeping the tip in the middle of the muscle and clear of the fat layer. Pull at 130–135°F (54–57°C) for rosy or 140–145°F (60–63°C) for medium. If the skin is not where you want it but the centre is close, stop cooking: the crust cannot be recovered from an overcooked breast, and a short pass under a hot grill afterwards is the safer trade.",
        watchFor:
          "The safe minimum for all poultry, duck included, is 165°F (73.9°C). Cooking to a lower temperature is a widespread culinary practice, not a food-safety recommendation.",
      },
      {
        title: "Rest 5–10 minutes, skin-side up",
        body: "Rest on a rack, uncovered, skin-side up. Carryover adds roughly 3–5°F, and resting on a plate or under foil traps steam against the crust you just built. Slice across the grain at a slight angle and season with pepper and flaky salt at the table.",
        watchFor:
          "A crust that softens during the rest was never fully rendered — extend the low stage next time rather than the high one.",
      },
    ],
    temperatures: {
      caption: "Starting ranges by breast thickness. Your machine will differ.",
      columns: ["Breast", "Low render stage", "High crisp stage", "Pull at"],
      rows: [
        [
          "Small, 170–190 g / thin fat cap",
          "300–325°F (150–160°C), 8–9 min",
          "390–400°F (200–205°C), 3–4 min",
          "130–135°F (54–57°C) for rosy",
        ],
        [
          "Medium, 190–220 g",
          "300–325°F (150–160°C), 10–12 min",
          "390–400°F (200–205°C), 4–5 min",
          "130–135°F (54–57°C) for rosy",
        ],
        [
          "Large, 220–250 g / thick fat cap",
          "300–325°F (150–160°C), 12–14 min",
          "390–400°F (200–205°C), 5–6 min",
          "130–135°F (54–57°C) for rosy",
        ],
        ["Cooked through", "As above", "As above", "165°F (73.9°C), the safe minimum for poultry"],
      ],
    },
    verifyNote: {
      label: "Treat every time here as a starting point",
      body: "Basket design, wattage, fan strength, preheat behaviour, breast size, skin thickness and fridge temperature all move these numbers, and small drawer machines run hotter at the top of the basket than large ones. Read the skin and the probe rather than the clock: the low stage ends when the fat cap has thinned and the surface has gone matte, and the cook ends at your pull temperature.",
    },
    guidanceNote:
      "Times are starting ranges for a domestic basket air fryer; the thermometer and the look of the skin decide the finish.",
    quackFix: [
      {
        symptom: "Skin is pale and rubbery when the meat is done",
        cause:
          "The low render stage was too short, so fat was still under the skin when the meat hit temperature.",
        fixNow:
          "Slice the breast, then crisp the skin side alone for a minute or two under a hot grill or in a dry pan. Do not put a cooked breast back into a 400°F basket.",
        prevent:
          "Judge the low stage by the fat cap, not the clock — matte, shrunken, faintly golden before you raise the heat.",
      },
      {
        symptom: "Meat overcooked before the skin crisped",
        cause: "Too much time at the high setting, or a machine that runs hotter than its dial.",
        fixNow:
          "Nothing recovers a grey breast. Slice thin, across the grain, and serve with something sharp.",
        prevent:
          "Start probing at the beginning of the crisping stage and accept a lighter crust when the centre reaches your target.",
      },
      {
        symptom: "The kitchen fills with smoke",
        cause: "Fat pooling in the drawer and hitting its smoke point, usually late in the cook.",
        fixNow:
          "Stop the machine, let it settle for a moment, then drain the fat with tongs and a heatproof container before continuing.",
        prevent:
          "Drain between stages as a matter of course, and keep the render stage at or below 325°F (160°C). Add water to the drawer only if the manufacturer says you may.",
      },
      {
        symptom: "Skin sticks to the basket",
        cause: "The breast was started skin-side down, or moved before the surface had set.",
        fixNow:
          "Slide a thin spatula under the whole piece rather than pulling with tongs, and lift it flat.",
        prevent: "Cook skin-side up throughout, and leave the breasts alone during the low stage.",
      },
      {
        symptom: "Browning is uneven across one breast",
        cause: "Fan hot spots, a curling breast, or a piece too close to the basket wall.",
        fixNow: "Rotate the breast 180° at the halfway point of the crisping stage.",
        prevent:
          "Leave a clear gap around each piece, and press a curling breast flat with a spatula early in the low stage.",
      },
      {
        symptom: "Fat spatters up onto the element or the food",
        cause: "A deep pool of hot fat plus high fan speed.",
        fixNow:
          "Pause, drain, and wipe the inside of the lid or shield once the machine has cooled. Do not throw liquid at hot fat.",
        prevent: "Drain mid-cook, and do not run the high stage with a full drawer.",
      },
      {
        symptom: "Two breasts finish minutes apart",
        cause: "Different weights or thicknesses, or unequal airflow in the basket.",
        fixNow:
          "Pull the smaller one when it reaches temperature and let it rest while the larger finishes.",
        prevent:
          "Buy breasts of a similar weight where you can, probe each one separately, and never treat one reading as covering both.",
      },
    ],
    leftovers: [
      {
        part: "Fat from the drawer",
        use: "Strain it once cool and refrigerate it — how much you get depends on the size and breed of the breast.",
        to: "/cook/ways-to-use-duck-fat",
        linkLabel: "Ways to use duck fat",
      },
      {
        part: "Cold cooked breast",
        use: "Slice thin the next day for sandwiches or a warm salad. Refrigerate within two hours and use within 3–4 days.",
      },
      {
        part: "Trimmed skin and edges",
        use: "Render them slowly into cracklings while the breasts rest; salt while hot.",
      },
    ],
    leftoversHeading: "Waste nothing from the basket",
    leftoversIntro:
      "The fat is the second reason to cook duck breast, and an air fryer collects it in one place for you.",
    faq: [
      {
        q: "Should I preheat the air fryer for duck breast?",
        a: "Not if your machine allows a cold start. Starting cold gives the fat cap a few extra minutes of gentle rendering before the meat climbs, which is the hardest part of this cook to get right. If the manufacturer's instructions require preheating, preheat at the lowest setting available and expect the low stage to run shorter.",
      },
      {
        q: "Skin-side up or skin-side down?",
        a: "Skin-side up throughout. The fan works on the top surface, so skin-side up dries and browns the skin while melted fat drains away from it. Skin-side down puts the skin in the fat that has just left it, and it tends to stick to the basket.",
      },
      {
        q: "Is an air fryer better than a skillet for duck breast?",
        a: "It is different, not better. The air fryer is more hands-off, contains most of the mess and needs no fat management beyond draining. A skillet gives you direct contact browning, continuous control of the render, and a pan you can build a sauce in. If crust quality is the priority, the skillet still has the advantage.",
      },
      {
        q: "Can I put water in the drawer to stop the smoke?",
        a: "Only if your manufacturer explicitly permits it — many do not, and water meeting hot fat or a heating element is a real hazard. Draining the rendered fat between stages solves the same problem without that risk.",
      },
      {
        q: "How long does air fryer duck breast take?",
        a: "Roughly 12–20 minutes of cooking for most breasts, split between a low render stage and a short high-heat stage, plus a 5–10 minute rest. Treat that as a starting range: basket design, wattage, fan strength, breast size and starting temperature all move it, which is why the finish is decided by a thermometer.",
      },
      {
        q: "Can I cook duck breast from frozen in an air fryer?",
        a: "Thaw it in the refrigerator first. A frozen breast releases water as it cooks, which stops the skin from browning, and the outside overcooks long before the centre is where you want it.",
      },
      {
        q: "Do I need to add oil?",
        a: "No. Skin-on duck breast releases plenty of its own fat, and added oil only increases what pools in the drawer — which is what smokes and spatters.",
      },
    ],
    related: [
      "/cook/how-to-cook-duck-breast",
      "/learn/how-to-score-duck-breast",
      "/learn/duck-breast-temperature-doneness",
      "/learn/why-duck-skin-isnt-crispy",
      "/cook/best-sauces-for-duck-breast",
      "/cook/what-to-serve-with-duck-breast",
      "/tools/duck-doneness-guide",
      "/recipes/pan-seared-duck-breast",
      "/recipes/duck-fat-roasted-potatoes",
      "/recipes/oven-roasted-duck-breast",
    ],
    sourcing: [
      {
        label: "Buying duck breast",
        why: "Breast weights and fat-cap thickness vary widely between suppliers, and both change the render stage. The cut-specific guide covers formats, weights and what to check when the box arrives.",
        to: "/buy/where-to-buy-duck-breast-online",
        linkLabel: "Where to buy duck breast online",
      },
    ],
    linksInModuleOnly: true,
    sourceIds: ["usdaPoultryTemp", "usdaPoultryPrep", "usdaLeftovers"],
  },

  "duck-leg-confit": {
    slug: "duck-leg-confit",
    intro:
      "Confit is the most forgiving duck there is: a salt cure, a long poach well below a simmer, and a hot finish whenever you are ready to eat. The cook is almost entirely hands-off, and the result improves after a night in the fridge — which makes it the rare duck dish you can serve to guests without standing over a pan.",
    confidence: {
      cut: "Duck leg quarters, thigh and drumstick attached",
      biggestRisk: "Poaching too hot, which shreds the meat and fries rather than confits it",
      essentialTechnique: "Dry salt cure, then a submerged poach at 190–210°F (88–99°C)",
      targetResult: "Meat that pulls cleanly from the bone, then crisped skin at service",
      essentialTool: "A snug oven-safe pot that lets the legs sit fully submerged",
      saveAfterwards: "The strained poaching fat — reusable for the next batch",
    },
    ingredientGroups: [
      {
        heading: "Cure",
        items: [
          "4 duck leg quarters, about 1.2 kg (2.6 lb) total",
          "18–24 g (1–1½ tbsp) coarse sea salt, roughly 1.5–2% of the leg weight",
          "4 garlic cloves, crushed",
          "6 sprigs thyme",
          "2 bay leaves, torn",
          "1 tsp cracked black pepper",
        ],
      },
      {
        heading: "Poach",
        items: [
          "1–1.5 L (4–6 cups) rendered duck fat, enough to submerge the legs",
          "Neutral oil to top up, if you are short on duck fat",
        ],
      },
    ],
    equipment: [
      {
        label: "Snug, deep oven-safe pot",
        why: "The narrower the vessel, the less fat you need to keep the legs fully covered.",
        to: "/gear/best-dutch-oven-for-duck-confit",
        linkLabel: "How to judge whether your pot fits the legs",
      },
      {
        label: "Instant-read thermometer",
        why: "Domestic ovens are least accurate at low settings — measure the fat, not the dial.",
        to: "/gear/best-thermometer-for-duck",
        linkLabel: "Thermometer buying guide",
      },
    ],
    before: [
      {
        heading: "Plan backwards from dinner",
        body: "Cure overnight (12–24 hours), poach for 2.5–3.5 hours, then either serve immediately or cool and refrigerate under the fat for 3–4 days. The crisping step at the end takes 10–15 minutes.",
      },
      {
        heading: "Build a fat supply",
        body: "Confit needs a lot of fat. Save the rendered fat from every duck breast and roast you cook — see the rendering guide — and top up with neutral oil if you are short. The legs must stay submerged, but they do not have to be submerged in duck fat alone.",
      },
    ],
    steps: [
      {
        title: "Cure the legs",
        body: "Mix salt, garlic, thyme, bay and pepper. Rub over the legs, lay them skin-side up in a single layer, cover, and refrigerate 12–24 hours. Shorter gives lighter seasoning; longer gives a firmer, more intense result.",
        watchFor:
          "More salt is not better. Above roughly 2% by weight the meat turns noticeably salty and dense.",
      },
      {
        title: "Rinse and dry thoroughly",
        body: "Rinse off the cure completely and pat the legs dry. Residual surface salt concentrates unevenly over three hours of poaching.",
      },
      {
        title: "Submerge in warm fat",
        body: "Melt the fat gently and pour it over the legs in your pot until they are fully covered. Any part sticking out will roast rather than confit.",
      },
      {
        title: "Poach low and slow",
        body: "Hold the fat at 190–210°F (88–99°C) for 2.5–3.5 hours — an oven set to 200–225°F (93–107°C) usually gets there. You want the occasional lazy bubble, never a simmer.",
        watchFor:
          "Vigorous bubbling means the fat is too hot; the meat will fray and dry out even while sitting in fat.",
      },
      {
        title: "Test for doneness",
        body: "The legs are ready when a skewer meets no resistance and the meat retracts from the drumstick bone. The internal temperature will be well past the USDA 165°F (73.9°C) minimum long before this point.",
      },
      {
        title: "Cool and store, or crisp now",
        body: "To store, cool the legs in their fat, then refrigerate submerged and use within 3–4 days. To serve, lift a leg out, scrape off excess fat, and crisp skin-side down in a dry hot pan or under a hot oven for 10–15 minutes until the skin shatters.",
        watchFor:
          "Fat-sealed storage is a refrigerator technique, not shelf-stable preservation. Keep it cold.",
      },
    ],
    temperatures: {
      caption: "Confit timing at a glance",
      columns: ["Stage", "Temperature", "Time"],
      rows: [
        ["Cure", "Refrigerated, 4°C / 39°F", "12–24 hours"],
        ["Poach", "190–210°F (88–99°C) fat", "2.5–3.5 hours"],
        ["Crisp to serve", "400–425°F (205–220°C) oven or hot pan", "10–15 minutes"],
        ["Fridge storage under fat", "Below 4°C (39°F)", "3–4 days (USDA cooked-poultry guidance)"],
      ],
    },
    quackFix: [
      {
        symptom: "Meat is stringy and dry despite sitting in fat",
        cause: "The poach ran too hot and squeezed moisture out of the muscle.",
        fixNow: "Shred it and use it in rillettes, ragù or hash, where texture matters less.",
        prevent: "Measure the fat temperature directly and keep it under 210°F (99°C).",
      },
      {
        symptom: "Finished legs taste too salty",
        cause: "Over-long cure, too much salt, or cure not rinsed off.",
        fixNow:
          "Serve with unsalted starch — plain potatoes, lentils, bread — and a sharp, acidic salad.",
        prevent: "Weigh the salt at 1.5–2% of leg weight and rinse thoroughly.",
      },
      {
        symptom: "Skin will not crisp at service",
        cause: "Too much clinging fat, or a pan that was not hot enough.",
        fixNow: "Scrape the skin clean, blot it dry, and start in a properly hot dry pan.",
        prevent: "Bring legs to room temperature and dry the skin before crisping.",
      },
    ],
    leftovers: [
      {
        part: "Poaching fat",
        use: "Strain and refrigerate — it improves with each batch and can be reused several times.",
        to: "/cook/ways-to-use-duck-fat",
        linkLabel: "Fifteen uses for duck fat",
      },
      {
        part: "Jelly at the bottom of the pot",
        use: "That is concentrated duck stock. Spoon it into sauces, beans or a ragù.",
      },
      {
        part: "Picked confit meat",
        use: "Fold into rillettes, cassoulet, hash or a tart with sharp greens.",
      },
    ],
    faq: [
      {
        q: "Can I confit duck legs without enough duck fat?",
        a: "Yes. Use a pot narrow enough to reduce the volume needed and top up with a neutral oil. Full submersion matters more than the fat being 100% duck.",
      },
      {
        q: "How long does confit keep?",
        a: "Treat it as cooked poultry: 3–4 days in the refrigerator, fully submerged in fat and held below 4°C (39°F). Traditional cellar-stored confit kept far longer, but we do not publish those durations as safe advice — freeze portions (under fat, up to 2–3 months) if you need to keep them longer, and never hold confit at room temperature.",
      },
      {
        q: "Can I confit in a slow cooker?",
        a: "Yes, if the low setting holds the fat below a simmer. Verify with a thermometer; some slow cookers run hotter than 210°F (99°C) on low.",
      },
    ],
    related: [
      "/cook/duck-leg-confit",
      "/learn/how-to-render-duck-fat",
      "/cook/ways-to-use-duck-fat",
      "/buy/duck-fat-buying-guide",
      "/tools/duck-fat-substitution-calculator",
      "/recipes/duck-fat-roasted-potatoes",
      "/recipes/roasted-whole-duck",
      "/recipes/oven-roasted-duck-breast",
    ],
    sourcing: [
      {
        label: "Buying duck legs and rendered fat",
        why: "Confit needs enough fat to submerge the legs, and jarred rendered fat saves you a rendering session — the guide covers formats and how much a batch actually takes.",
        to: "/buy/duck-fat-buying-guide",
        linkLabel: "Duck fat buying guide",
      },
      {
        label: "Buying duck leg quarters",
        why: "Leg quarters are often cheaper than breast and freeze well, but few supermarkets carry them — the guide compares sellers who list cuts by name.",
        to: "/buy/where-to-buy-duck-online",
        linkLabel: "Where to buy duck online",
      },
    ],
    linksInModuleOnly: true,
    sourceIds: ["usdaPoultryTemp", "usdaPoultryPrep"],
  },

  "roasted-whole-duck": {
    slug: "roasted-whole-duck",
    intro:
      "A whole duck asks you to solve two problems at once: legs that want a long cook and a breast that does not. The two-stage roast — a long, low fat-rendering phase followed by a short, hot browning phase — is the most reliable way to get both right in a domestic oven.",
    confidence: {
      cut: "Whole duck, typically 2–2.7 kg (4.5–6 lb)",
      biggestRisk: "Roasting hot the whole way, which dries the breast before the legs are tender",
      essentialTechnique: "Low fat-rendering stage, then a short high-heat browning stage",
      targetResult: "Legs tender at 175–185°F (79–85°C); breast still juicy",
      essentialTool: "A roasting rack that keeps the bird out of its own fat",
      saveAfterwards: "A jar of rendered fat and a carcass for stock",
    },
    ingredientGroups: [
      {
        heading: "For the bird",
        items: [
          "1 whole duck, 2–2.7 kg (4.5–6 lb), giblets removed",
          "2 tsp fine sea salt",
          "1 tsp cracked black pepper",
          "1 lemon or orange, halved",
          "4 garlic cloves, crushed",
          "A few sprigs thyme or rosemary",
        ],
      },
      {
        heading: "Optional glaze, last 20 minutes",
        items: [
          "2 tbsp honey or maple syrup",
          "1 tbsp soy sauce or cider vinegar",
          "1 tsp orange zest",
        ],
      },
    ],
    equipment: [
      {
        label: "Roasting tin with a rack",
        why: "The bird must sit above the fat it releases, or the underside braises instead of roasting — and the tin has to hold a lot of rendered fat without warping at 450°F.",
        to: "/gear/best-roasting-pan-for-duck",
        linkLabel: "Roasting pan buying guide",
      },
      {
        label: "Instant-read thermometer",
        why: "Breast and thigh finish at very different temperatures; you need to check both.",
        to: "/gear/best-thermometer-for-duck",
        linkLabel: "Thermometer buying guide",
      },
    ],
    before: [
      {
        heading: "Dry the bird, ideally overnight",
        body: "Pat it dry inside and out, salt the skin, and leave it uncovered on a rack in the fridge overnight. A dry skin is the single biggest factor in a crisp finish.",
      },
      {
        heading: "Prick, do not slash",
        body: "Prick the fattiest areas — breast sides, thighs, the fat pad at the tail — at an angle with a skewer or sharp knife tip so fat drains without cutting into the meat.",
      },
      {
        heading: "Work out timing and quantity",
        body: "Use the cooking-time planner for a weight-based range, and the serving calculator if you are buying for a crowd.",
      },
    ],
    steps: [
      {
        title: "Season and fill the cavity",
        body: "Salt the skin and cavity, add the citrus halves, garlic and herbs. Do not stuff a duck with stuffing — the cavity contents are aromatics only, and a packed cavity slows the cook badly.",
      },
      {
        title: "Stage one: render low, breast-side up",
        body: "Roast at 300–325°F (150–165°C) for roughly 60–90 minutes depending on weight. Fat should collect steadily in the tin.",
        watchFor:
          "Pour off accumulated fat every 30 minutes — a deep pool spits and steams the underside.",
      },
      {
        title: "Check the legs before browning",
        body: "Probe the thickest part of the thigh, avoiding bone. Legs should be heading for 175–185°F (79–85°C), where connective tissue has broken down and the meat gives easily.",
      },
      {
        title: "Stage two: brown hot and fast",
        body: "Raise the oven to 425–450°F (220–230°C) for 15–25 minutes until the skin is deep mahogany and tight. If you are glazing, brush in the last 10–15 minutes only — sugar burns quickly at this heat.",
        watchFor:
          "Watch continuously in this stage; the gap between burnished and burnt is a few minutes.",
      },
      {
        title: "Rest properly",
        body: "Rest 15–20 minutes, loosely tented, before carving. A whole bird carries a lot of heat and the juices need time to redistribute.",
      },
      {
        title: "Carve breast and legs separately",
        body: "Remove the legs at the joint, take the breasts off the crown whole, then slice them across the grain. Carving straight down through the bird gives you ragged, uneven slices.",
      },
    ],
    temperatures: {
      caption: "Target temperatures for whole duck",
      columns: ["Part", "Target", "Why"],
      rows: [
        [
          "Thigh / leg",
          "175–185°F (79–85°C)",
          "Connective tissue breaks down; meat becomes tender",
        ],
        ["Breast (culinary)", "135–145°F (57–63°C)", "Still juicy; commonly served slightly pink"],
        ["USDA recommendation", "165°F (73.9°C) throughout", "Food-safety minimum for all poultry"],
        ["Rest", "15–20 minutes", "Juice redistribution; carryover of several degrees"],
      ],
    },
    quackFix: [
      {
        symptom: "Breast is dry by the time the legs are done",
        cause: "The whole roast ran too hot, so the breast overshot while the legs caught up.",
        fixNow: "Slice the breast thin and serve with the pan juices or a sharp fruit sauce.",
        prevent:
          "Use the low-then-hot two-stage method, and shield the breast with foil if it runs ahead.",
      },
      {
        symptom: "Skin is pale and soft",
        cause: "Skin was damp going in, or the high-heat stage was skipped or too short.",
        fixNow: "Return the bird to a 450°F (230°C) oven for 10 more minutes, watching closely.",
        prevent: "Dry the skin uncovered in the fridge overnight and commit to the hot finish.",
      },
      {
        symptom: "Kitchen filled with smoke",
        cause: "Fat pooled in the tin and hit the high-heat stage.",
        fixNow: "Pour off the fat carefully into a heatproof container and continue.",
        prevent: "Drain fat at every check during the low stage.",
      },
    ],
    leftovers: [
      {
        part: "Rendered fat",
        use: "Strain and jar it. One whole duck typically yields several hundred millilitres.",
        to: "/cook/ways-to-use-duck-fat",
        linkLabel: "Fifteen uses for duck fat",
      },
      {
        part: "Carcass",
        use: "Simmer with aromatics for a stock far richer than chicken.",
      },
      {
        part: "Picked meat",
        use: "Duck hash, fried rice, tacos, or a quick ragù.",
      },
      {
        part: "Neck and giblets",
        use: "Brown them and add to the stock pot, or make a small gravy while the bird rests.",
      },
    ],
    faq: [
      {
        q: "How long does a whole duck take to roast?",
        a: "Broadly 2–2.5 hours for a 2–2.7 kg (4.5–6 lb) bird using the two-stage method, but weight, oven accuracy and starting temperature all shift it. Use the cooking-time planner for a range and confirm with a thermometer.",
      },
      {
        q: "Should I stuff a whole duck?",
        a: "No. Stuffing insulates the cavity, extends the cook, and soaks up fat. Use citrus, garlic and herbs as aromatics instead.",
      },
      {
        q: "How many people does one duck serve?",
        a: "A whole duck usually serves 3–4 as a main because the carcass-to-meat ratio is lower than chicken. The serving calculator accounts for appetite and leftovers.",
      },
    ],
    related: [
      "/cook/whole-roast-duck",
      "/learn/whole-duck-cooking-time",
      "/learn/how-to-carve-a-duck",
      "/learn/how-to-thaw-duck",
      "/tools/duck-cooking-time-planner",
      "/tools/whole-duck-serving-calculator",
      "/recipes/duck-fat-roasted-potatoes",
      "/recipes/duck-a-lorange",
      "/ingredients/best-herbs-spices-for-duck",
      "/recipes/peking-duck-at-home",
    ],
    sourcing: [
      {
        label: "Buying a whole duck",
        why: "Most whole ducks sold in the US and UK are Pekin, sold frozen. Check the processing date and allow 24–48 hours to thaw.",
        to: "/buy/where-to-buy-duck-online",
        linkLabel: "Where to buy duck online",
      },
    ],
    linksInModuleOnly: true,
    sourceIds: ["usdaPoultryTemp", "usdaPoultryPrep"],
  },

  "smoked-duck-with-plum-sauce": {
    slug: "smoked-duck-with-plum-sauce",
    intro:
      "Smoke and duck fat are an easy pairing to overdo. The goal here is restraint: a light cure for seasoning, a moderate smoke that flavours without tanning the skin into leather, and a sharp plum reduction that cuts through the richness rather than sweetening it further.",
    confidence: {
      cut: "Whole duck or bone-in duck breast",
      biggestRisk: "Over-smoking — heavy smoke plus duck fat turns acrid quickly",
      essentialTechnique: "Low, clean smoke at 225–250°F (107–121°C) with a hot finish",
      targetResult: "Breast around 135–145°F (57–63°C); a thin, dry, mahogany skin",
      essentialTool: "A leave-in probe thermometer",
      saveAfterwards: "Smoked drippings — a small amount transforms beans and greens",
    },
    ingredientGroups: [
      {
        heading: "Duck and cure",
        items: [
          "1 whole duck (2–2.7 kg / 4.5–6 lb) or 2 bone-in duck breasts",
          "2 tbsp coarse salt",
          "1 tbsp brown sugar",
          "1 tsp cracked black pepper",
          "½ tsp five-spice powder (optional)",
        ],
      },
      {
        heading: "Plum sauce",
        items: [
          "500 g (1 lb) ripe plums, stoned and quartered",
          "1 small shallot, sliced",
          "2 tbsp rice vinegar or cider vinegar",
          "1–2 tbsp honey, to taste",
          "1 tsp soy sauce",
          "1 star anise",
          "A pinch of chilli flakes",
        ],
      },
      {
        heading: "Smoke",
        items: ["Fruitwood chunks — cherry, apple or plum — not mesquite or heavy hickory"],
      },
    ],
    equipment: [
      {
        label: "Leave-in probe thermometer",
        why: "Opening a smoker to check temperature costs heat and time. A probe lets you track the breast without lifting the lid.",
        to: "/gear/best-thermometer-for-duck",
        linkLabel: "Thermometer buying guide",
      },
      {
        label: "Drip tray",
        why: "Duck renders a lot of fat. Fat on coals means flare-ups and acrid smoke.",
      },
    ],
    before: [
      {
        heading: "Dry-cure, then air-dry",
        body: "Rub the salt, sugar, pepper and optional five-spice over the bird and refrigerate uncovered for 8–12 hours. Rinse lightly, pat dry, and leave uncovered another 2–4 hours so the surface forms a dry pellicle that smoke adheres to.",
      },
      {
        heading: "Pick the right wood",
        body: "Fruitwoods complement duck; heavy woods overwhelm it. Aim for thin blue smoke, never thick white smoke.",
      },
    ],
    steps: [
      {
        title: "Score and set up the smoker",
        body: "Score the fat cap shallowly to help it render. Bring the smoker to a steady 225–250°F (107–121°C) with a drip tray under the bird.",
      },
      {
        title: "Smoke to temperature, not to time",
        body: "Smoke for roughly 1.5–2.5 hours depending on cut and size. Breast should reach 130–140°F (54–60°C); legs on a whole bird want 175–185°F (79–85°C).",
        watchFor:
          "If the legs lag badly behind, separate the bird into breast and leg pieces next time and smoke them apart.",
      },
      {
        title: "Make the plum sauce while it smokes",
        body: "Simmer plums, shallot, vinegar, honey, soy, star anise and chilli for 20–25 minutes until collapsed and glossy. Blend for a smooth sauce or leave it chunky. It should taste distinctly sharp on its own — against duck fat it will read as balanced.",
        watchFor:
          "Taste for acidity, not sweetness. Under-acidic plum sauce makes the whole plate cloying.",
      },
      {
        title: "Finish hot for the skin",
        body: "Smoked skin is rarely crisp on its own. Finish under a hot broiler or in a 450°F (230°C) oven for 5–10 minutes, or sear the breast skin-side down in a dry pan.",
        watchFor: "Sugar from the cure browns fast — stay with it.",
      },
      {
        title: "Rest and slice",
        body: "Rest 10 minutes, then slice the breast across the grain and serve with the plum sauce spooned alongside.",
        watchFor:
          "The safe minimum for all poultry is 165°F (73.9°C); smoking to a lower breast temperature is a culinary choice.",
      },
    ],
    temperatures: {
      caption: "Smoking targets",
      columns: ["Stage", "Target", "Notes"],
      rows: [
        ["Smoker chamber", "225–250°F (107–121°C)", "Steady and clean; thin blue smoke"],
        ["Breast pull", "130–140°F (54–60°C)", "Before the hot finish"],
        ["Leg / thigh", "175–185°F (79–85°C)", "Needs longer than the breast"],
        ["USDA recommendation", "165°F (73.9°C)", "Food-safety minimum for poultry"],
      ],
    },
    quackFix: [
      {
        symptom: "Bitter, ashy flavour",
        cause: "Thick white smoke, or fat dripping onto coals.",
        fixNow: "Serve with extra plum sauce and acidic sides; the sharpness masks a lot.",
        prevent:
          "Use a drip tray, fewer wood chunks, and wait for thin blue smoke before the bird goes in.",
      },
      {
        symptom: "Skin is leathery, not crisp",
        cause: "Low-temperature smoke dries skin without crisping it.",
        fixNow: "Blast under a hot broiler for a few minutes.",
        prevent: "Always plan a hot finishing stage into the cook.",
      },
      {
        symptom: "Sauce tastes flat and sugary",
        cause: "Not enough acid to balance the honey and the fat.",
        fixNow: "Add vinegar a teaspoon at a time until it tastes slightly too sharp on the spoon.",
        prevent: "Season the sauce against a bite of duck, not on its own.",
      },
    ],
    leftovers: [
      {
        part: "Smoked drippings",
        use: "Strain and use sparingly — a spoonful flavours a whole pot of beans or greens.",
        to: "/cook/ways-to-use-duck-fat",
        linkLabel: "Fifteen uses for duck fat",
      },
      {
        part: "Smoked carcass",
        use: "A smoked duck stock makes an exceptional base for noodle soup.",
      },
      {
        part: "Extra plum sauce",
        use: "Keeps 3–4 days in the fridge; excellent with pork, cheese, or cold duck sandwiches.",
      },
    ],
    faq: [
      {
        q: "What wood is best for smoking duck?",
        a: "Fruitwoods — cherry, apple, plum. They are mild enough to sit behind the duck rather than dominate it. Mesquite and heavy hickory tend to overwhelm poultry fat.",
      },
      {
        q: "Can I smoke duck in a kettle grill?",
        a: "Yes. Bank the coals to one side, add a wood chunk, put a drip tray under the duck on the cool side, and manage the vents to hold 225–250°F (107–121°C).",
      },
      {
        q: "Do I need to cure the duck first?",
        a: "It is not mandatory, but a short dry cure seasons the meat through and dries the surface so smoke adheres and skin finishes better.",
      },
    ],
    related: [
      "/cook/best-sauces-for-duck-breast",
      "/learn/duck-breast-temperature-doneness",
      "/learn/why-duck-skin-isnt-crispy",
      "/cook/what-to-serve-with-duck-breast",
      "/tools/duck-doneness-guide",
      "/recipes/pan-seared-duck-breast",
      "/recipes/duck-a-lorange",
      "/ingredients/best-herbs-spices-for-duck",
    ],
    sourcing: [
      {
        label: "Buying duck for smoking",
        why: "Bone-in breast and whole birds smoke better than boneless breast, which dries out over a long cook.",
        to: "/buy/where-to-buy-duck-online",
        linkLabel: "Where to buy duck online",
      },
    ],
    sourceIds: ["usdaPoultryTemp", "usdaPoultryPrep"],
  },
  "duck-a-lorange": {
    slug: "duck-a-lorange",
    linksInModuleOnly: true,
    intro:
      "Duck à l'orange earned its reputation twice: once as the best thing a bitter orange can do to a rich bird, and once as a sticky, sweet parody of itself. The difference is the sauce. Build it as a gastrique — sugar taken to a proper caramel, then stopped with vinegar and citrus juice — and it stays sharp, glossy and savoury enough to cut a whole roast duck. Everything else is the two-stage roast: render low, brown hot, sauce at the end.",
    confidence: {
      cut: "Whole duck, 2–2.7 kg (4.5–6 lb)",
      biggestRisk: "A sauce that turns into marmalade — too much sugar, not enough acid",
      essentialTechnique: "Low render, hot finish, gastrique built on the drippings",
      targetResult: "Thigh at 175–185°F (79–85°C), mahogany skin, a sauce that coats a spoon",
      essentialTool: "An instant-read thermometer and a heavy saucepan",
      saveAfterwards:
        "Rendered fat for potatoes, carcass for stock, orange zest strips for the sauce",
    },
    ingredientGroups: [
      {
        heading: "For the duck",
        items: [
          "1 whole duck, 2–2.7 kg (4.5–6 lb), giblets removed and reserved",
          "2 tsp fine sea salt",
          "1 tsp cracked black pepper",
          "1 orange, halved, plus 2 bay leaves for the cavity",
        ],
      },
      {
        heading: "For the orange gastrique",
        items: [
          "Zest of 2 oranges, removed in wide strips with no white pith",
          "300 ml (1¼ cups) fresh orange juice, from about 4 oranges",
          "60 g (¼ cup) caster or granulated sugar",
          "60 ml (¼ cup) red wine vinegar",
          "250 ml (1 cup) duck or chicken stock",
          "2 tsp lemon juice or extra red wine vinegar, to sharpen at the end",
          "1 tsp Seville orange marmalade (optional) — for bitter-orange depth, bearing in mind it also adds sweetness",
          "15 g (1 tbsp) cold unsalted butter",
          "Salt, to taste",
        ],
      },
      {
        heading: "Optional garnish",
        items: ["1 orange, peeled and cut into segments, pith removed", "A few sprigs thyme"],
      },
    ],
    equipment: [
      {
        label: "Instant-read thermometer",
        why: "The legs and the breast finish 40°F apart on the same bird. A probe is the only way to know which one is holding you up.",
        to: "/gear/best-thermometer-for-duck",
        linkLabel: "Thermometer buying guide",
      },
      {
        label: "Roasting tin with a rack",
        why: "The duck has to sit above the fat it renders, and the tin has to leave air on all four sides or the skin steams instead of browning.",
        to: "/gear/best-roasting-pan-for-duck",
        linkLabel: "Roasting pan buying guide",
      },
      {
        label: "Heavy-based saucepan",
        why: "Caramel scorches in thin pans. A heavy base gives you a few seconds of margin between amber and burnt.",
      },
    ],
    before: [
      {
        heading: "Dry the skin, ideally overnight",
        body: "Pat the bird dry inside and out, salt the skin, and leave it uncovered on a rack in the fridge overnight. Nothing else you do matters as much for the finish: a damp skin spends its first half-hour evaporating water instead of rendering fat.",
      },
      {
        heading: "Prick the fat, don't cut it",
        body: "Angle a skewer or the tip of a sharp knife into the breast sides, thighs and tail fat pad. You want channels for fat to drain, not openings for juice to leak.",
      },
      {
        heading: "Zest before you juice",
        body: "Take the zest off in wide strips while the oranges are still whole, avoiding the white pith. Pith is where the harsh bitterness lives; the coloured skin is where the aromatic bitterness you want lives.",
      },
      {
        heading: "Plan the timing",
        body: "Work out the roast window from the bird's weight before you start, and decide how much duck you actually need if you are buying for a table.",
      },
    ],
    steps: [
      {
        title: "Season and fill the cavity",
        body: "Salt the skin and cavity, then put the halved orange and bay leaves inside. Aromatics only — a packed cavity slows the roast and soaks up the fat you are trying to render out.",
      },
      {
        title: "Stage one: render low, breast-side up",
        body: "Roast at 300–325°F (150–165°C) for roughly 60–90 minutes depending on weight, on a rack over a tin. Fat should collect steadily rather than spit.",
        watchFor:
          "Pour the fat off into a heatproof bowl every 30 minutes. A deep pool in the tin smokes later and steams the underside now.",
      },
      {
        title: "Make the gastrique while the duck renders",
        body: "Melt the sugar in the dry saucepan over medium heat, without stirring, until it turns a deep amber caramel. Stand back and pour in the vinegar — it will seize and spit — then the orange juice and zest strips. Simmer until the caramel dissolves, add the stock, and reduce to roughly 250 ml (1 cup). Set aside off the heat.",
        watchFor:
          "Pale caramel gives a flat, sweet sauce. Take it to the colour of dark honey, one shade before it smells acrid.",
      },
      {
        title: "Check the legs before you brown",
        body: "Probe the thickest part of a thigh, avoiding bone. The legs should be heading for 175–185°F (79–85°C), where the connective tissue has broken down and the meat gives easily. If they are lagging, extend the low stage rather than rushing the hot one.",
      },
      {
        title: "Stage two: brown hot and fast",
        body: "Raise the oven to 425–450°F (220–230°C) for 15–25 minutes until the skin is deep mahogany and tight. Do not brush the sauce on the bird — the sugar in it will burn at this heat and you will lose both the skin and the sauce.",
        watchFor:
          "Stay in the kitchen. The gap between burnished and bitter is a few minutes at this temperature.",
      },
      {
        title: "Rest the duck, finish the sauce",
        body: "Rest the bird 15–20 minutes, loosely tented. Spoon a tablespoon of the tin drippings into the gastrique and reduce until it coats a spoon, then taste: it should read sharp first and sweet second. Sharpen with lemon juice or a little more vinegar — those are the acid. If it tastes sharp but thin on bitter-orange character, a teaspoon of Seville marmalade adds that depth, though it adds sweetness with it, so re-taste and re-sharpen after. Whisk in the cold butter off the heat and season.",
        watchFor:
          "If it tastes like dessert, add vinegar or lemon in half-teaspoons until the edge comes back.",
      },
      {
        title: "Carve and sauce the plate",
        body: "Take the legs off at the joint, lift the breasts off the crown whole, then slice them across the grain. Spoon the sauce onto the plate and set the duck on top — sauce over the skin undoes twenty minutes of browning. Scatter orange segments and thyme if you are using them.",
      },
    ],
    temperatures: {
      caption: "Target temperatures and stages",
      columns: ["Stage or part", "Target", "Why"],
      rows: [
        ["Low render", "300–325°F (150–165°C), 60–90 min", "Fat melts out before the skin sets"],
        ["Hot finish", "425–450°F (220–230°C), 15–25 min", "Skin tightens and browns"],
        ["Thigh / leg", "175–185°F (79–85°C)", "Connective tissue breaks down; the meat gives"],
        ["Breast (culinary)", "135–145°F (57–63°C)", "Juicy; commonly served slightly pink"],
        ["USDA recommendation", "165°F (73.9°C) throughout", "Food-safety minimum for all poultry"],
        ["Rest", "15–20 minutes", "Juices redistribute; several degrees of carryover"],
      ],
    },
    quackFix: [
      {
        symptom: "The sauce tastes like marmalade",
        cause: "Too much sugar, under-caramelised, or not enough acid to balance it.",
        fixNow:
          "Add red wine vinegar or lemon juice half a teaspoon at a time, reducing briefly between additions, until the sharpness leads. Marmalade will not fix this — it adds sweetness along with its bitter-orange depth.",
        prevent:
          "Take the caramel to dark honey, keep the juice fresh rather than from concentrate, and taste before the butter goes in.",
      },
      {
        symptom: "The sauce is bitter in a harsh, chemical way",
        cause: "White pith went in with the zest, or the caramel went past amber into burnt.",
        fixNow:
          "Strain out the zest, then soften what's left with a spoonful of stock and, if you have it, a teaspoon of marmalade for rounder bitterness.",
        prevent: "Peel wide strips with no pith, and pull the caramel one shade early.",
      },
      {
        symptom: "Skin is pale and soft",
        cause: "The bird went in damp, or the hot stage was cut short.",
        fixNow: "Return it to a 450°F (230°C) oven for up to 10 minutes, watching closely.",
        prevent:
          "Dry the skin uncovered in the fridge overnight and commit to the full hot finish.",
      },
      {
        symptom: "Breast is dry by the time the legs are tender",
        cause: "The roast ran too hot, so the breast overshot while the legs caught up.",
        fixNow: "Slice the breast thin and serve it generously sauced.",
        prevent:
          "Keep the low stage low, shield the breast with foil if it runs ahead, and probe both parts.",
      },
    ],
    leftovers: [
      {
        part: "Rendered fat",
        use: "Strain and jar it. How much you get depends on the size and breed of the bird, but it is the best roasting fat in the kitchen however much lands in the jar.",
        to: "/cook/ways-to-use-duck-fat",
        linkLabel: "Fifteen uses for duck fat",
      },
      {
        part: "Carcass and giblets",
        use: "Brown them and simmer with aromatics for a stock richer than chicken — the base for next time's sauce.",
      },
      {
        part: "Leftover gastrique",
        use: "Cool it quickly, seal it, and use it within 3–4 days refrigerated. Warm gently for cold sliced duck, pork, or roast carrots.",
      },
      {
        part: "Picked meat",
        use: "Duck and orange salad with bitter leaves, or a quick ragù.",
      },
    ],
    faq: [
      {
        q: "What is a gastrique, and why use one for duck à l'orange?",
        a: "A gastrique is caramelised sugar stopped with vinegar, then built out with juice and stock. It gives you the sweetness of the classic sauce with a sharp backbone, which is what keeps it from sliding into marmalade against a rich bird.",
      },
      {
        q: "Can I make this with duck breasts instead of a whole duck?",
        a: "Yes. Render the breasts skin-side down in a cold pan, pull them at 130–135°F (54–57°C) for rosy, and make the gastrique separately, finishing it with a spoonful of the rendered fat rather than tin drippings. That pull temperature is a culinary convention, not a safety one: the official safe minimum for poultry is 165°F (73.9°C), and cooking below it carries added risk.",
      },
      {
        q: "Which oranges work best?",
        a: "Seville or other bitter oranges are the traditional choice and need less vinegar. With ordinary sweet oranges, keep the vinegar as written and sharpen at the end with lemon juice or a little more vinegar; a teaspoon of Seville marmalade can add the missing bitter-orange depth, but it sweetens as well, so adjust the acid afterwards.",
      },
      {
        q: "Can I make the sauce ahead?",
        a: "Make it up to two days ahead through the stock reduction and refrigerate it. Add the drippings, final sharpening and cold butter while the duck rests.",
      },
      {
        q: "Should I glaze the duck with the sauce?",
        a: "No. The sugar in the sauce burns at browning temperatures. Sauce the plate, not the bird.",
      },
    ],
    related: [
      "/cook/whole-roast-duck",
      "/ingredients/orange-with-duck",
      "/cook/best-sauces-for-duck-breast",
      "/learn/whole-duck-cooking-time",
      "/learn/how-to-carve-a-duck",
      "/tools/duck-cooking-time-planner",
      "/tools/whole-duck-serving-calculator",
      "/recipes/roasted-whole-duck",
      "/recipes/pan-seared-duck-breast",
      "/recipes/peking-duck-at-home",
    ],
    sourcing: [
      {
        label: "Buying a whole duck",
        why: "Most whole ducks are Pekin and sold frozen, so allow 24–48 hours in the fridge to thaw and check the weight against your tin.",
        to: "/buy/where-to-buy-duck-online",
        linkLabel: "Where to buy duck online",
      },
    ],
    sourceIds: ["usdaPoultryTemp", "usdaPoultryPrep"],
  },

  "duck-fat-roasted-potatoes": {
    slug: "duck-fat-roasted-potatoes",
    linksInModuleOnly: true,
    intro:
      "Roast potatoes are a surface problem. The inside only has to be cooked and fluffy; everything people actually queue up for happens in the outer two millimetres. Duck fat helps there for two reasons — it is nearly pure fat, so there is no water to steam the surface soft, and it carries a savoury, roasted flavour that oil does not. The rest is mechanical: parboil, rough up the edges, and get the fat properly hot before the potatoes touch it.",
    confidence: {
      cut: "Floury or all-rounder potatoes, 1.2 kg (2½ lb)",
      biggestRisk: "Cold fat and a crowded tray — both steam the potatoes instead of frying them",
      essentialTechnique: "Parboil, dry, rough the edges, then into preheated fat",
      targetResult:
        "A shatter-crisp shell over a fluffy centre, evenly browned on two or three faces",
      essentialTool: "A heavy metal roasting tray, not glass or ceramic",
      saveAfterwards:
        "Strain and chill the fat left in the tray — it is good for at least one more roast",
    },
    ingredientGroups: [
      {
        heading: "For the potatoes",
        items: [
          "1.2 kg (2½ lb) floury or all-rounder potatoes — Maris Piper, King Edward, russet, or Yukon Gold",
          "90 g (about ⅓ cup) rendered duck fat",
          "1 tbsp fine salt, for the parboiling water",
          "Flaky sea salt, to finish",
        ],
      },
      {
        heading: "Optional aromatics",
        items: [
          "4 garlic cloves, unpeeled and lightly crushed",
          "3 sprigs rosemary or thyme",
          "Freshly cracked black pepper, to finish",
        ],
      },
    ],
    equipment: [
      {
        label: "Heavy metal roasting tray",
        why: "Metal takes and gives back heat fast, which is what fries the cut faces on contact. Glass and ceramic heat slowly and tend to steam the undersides.",
      },
      {
        label: "Large saucepan and a colander",
        why: "The parboil needs room for the potatoes to move; draining well and letting them steam dry is what makes the roughing-up step work.",
      },
      {
        label: "Fish slice or thin metal spatula",
        why: "Turning potatoes that have bonded to the tray is how the crust gets torn off. A thin edge lifts them cleanly.",
      },
    ],
    before: [
      {
        heading: "Choose the right potato",
        body: "Floury varieties — Maris Piper, King Edward, russet — break down slightly at the surface during the parboil, which is exactly the rough, starchy layer that crisps. Waxy potatoes hold their shape and stay smooth, so they roast pleasantly but never get that craggy shell. All-rounders like Yukon Gold sit in between and work well. Cut into even 4–5 cm (1½–2 in) pieces so they finish together.",
      },
      {
        heading: "Preheat the fat, not just the oven",
        body: "Put the duck fat in the tray and slide it into the oven while it comes up to temperature. Potatoes dropped into hot fat start frying immediately; potatoes sitting in cold fat as it warms release moisture and steam their own surfaces soft. This one step accounts for more of the difference than any brand of fat.",
      },
      {
        heading: "Salt the water, finish with salt too",
        body: "Salting the parboiling water seasons the potato all the way through — you cannot fix that later from the outside. Salt on the surface, though, draws moisture, so hold the flaky salt back until the potatoes come out of the oven, when it stays on the crust rather than softening it.",
      },
    ],
    steps: [
      {
        title: "Heat the oven and the fat",
        body: "Heat the oven to 220°C / 425°F (200°C / 400°F fan). Spoon the duck fat into a heavy metal roasting tray large enough to hold the potatoes in a single layer with gaps, and put the tray in the oven to heat.",
        watchFor:
          "If the tray looks tight for 1.2 kg of potatoes, use two trays. Crowding is the most common reason roast potatoes come out pale.",
      },
      {
        title: "Parboil for 8–10 minutes",
        body: "Put the cut potatoes in a large pan, cover with cold water, add the tablespoon of salt, and bring to a boil. Simmer 8–10 minutes from boiling — until a knife tip slides into the outer layer but meets resistance in the centre.",
        watchFor:
          "Edges starting to fluff and blur is the signal you want. Pieces collapsing mean you have gone too far; drain immediately and handle them gently.",
      },
      {
        title: "Drain and steam dry",
        body: "Drain thoroughly in a colander and leave them for 3–4 minutes. The residual heat drives off surface water, and a dry surface is what lets the fat get to work instead of boiling moisture away.",
      },
      {
        title: "Rough up the edges",
        body: "Put the lid on the pan or the colander and shake firmly two or three times, or scuff each piece with a fork. You want a fuzzy, broken outer layer on every face — that ragged starch is the future crust, and smooth potatoes simply cannot produce it.",
        watchFor: "Fuzzy, not mashed. If pieces are falling apart, one gentle shake is enough.",
      },
      {
        title: "Into the hot fat",
        body: "Pull the tray out and add the potatoes in one layer, turning each piece so it is coated, with a cut face against the metal. Leave a finger's width between pieces. Add the garlic and herbs now if you are using them.",
        watchFor:
          "You should hear an immediate sizzle. Silence means the fat was not hot enough — give the tray a few more minutes in the oven next time.",
      },
      {
        title: "Roast 25 minutes, then turn",
        body: "Roast undisturbed for 25 minutes, then turn each potato onto a fresh face and roast for another 20–30 minutes, turning once more if the browning looks uneven.",
        watchFor:
          "Do not turn early. Potatoes need to release from the tray on their own; forcing them at 10 minutes tears the crust off.",
      },
      {
        title: "Finish and serve",
        body: "The potatoes are done when they are deep golden brown, sound hollow and hard when tapped with a spoon, and give no resistance to a skewer through the middle. Lift them out of the fat onto a warm dish, season with flaky salt and pepper, and serve straight away.",
        watchFor:
          "Left sitting in the fat or covered with foil, the crust softens within minutes. Serve them uncovered.",
      },
    ],
    temperatures: {
      caption: "Timings and temperatures for 4–5 cm potato pieces",
      columns: ["Stage", "Setting", "Time", "What you are looking for"],
      rows: [
        ["Preheat fat in tray", "220°C / 425°F", "10–15 min", "Fat fully liquid and shimmering"],
        [
          "Parboil",
          "Simmering water, salted",
          "8–10 min",
          "Knife enters the edge, centre still firm",
        ],
        ["Steam dry", "Off heat, in the colander", "3–4 min", "Surface matte and dry to the touch"],
        ["First roast", "220°C / 425°F", "25 min", "Undersides set and releasing from the tray"],
        [
          "After turning",
          "220°C / 425°F",
          "20–30 min",
          "Deep golden on two or three faces, hollow-sounding",
        ],
      ],
    },
    guidanceNote: "Go by the visual and texture cues in the method rather than by the clock.",
    verifyNote: {
      label: "Go by the potatoes, not the clock",
      body: "Every number here is a starting range. Most home ovens run 10–15°C / 20–25°F off their dial, and a heavy metal tray, a thin one, or a crowded one will all brown at different rates — so read the tray rather than the timer. Cut to a consistent 4–5 cm and expect smaller pieces to finish sooner. They are ready when the crust is deep golden on two or three faces, the undersides lift off the metal without tearing, and a skewer slides through the centre with no resistance. If they stick, they need more time, not more force.",
    },
    quackFix: [
      {
        symptom: "Pale and greasy rather than crisp",
        cause:
          "The fat was cold when the potatoes went in, so they absorbed it instead of frying in it.",
        fixNow:
          "Turn the oven up 10°C / 25°F and give them another 10–15 minutes, turning once. Some crust usually still comes.",
        prevent:
          "Preheat the fat in the tray while the oven heats, and listen for a sizzle as the potatoes land.",
      },
      {
        symptom: "Smooth, hard shells with no craggy crust",
        cause: "Either a waxy potato or the roughing-up step was skipped.",
        fixNow:
          "Nothing rescues the surface mid-roast; roast them to deep gold and enjoy them as they are.",
        prevent:
          "Use a floury or all-rounder variety and shake the drained potatoes until the edges look fuzzy.",
      },
      {
        symptom: "Insides gluey or waterlogged",
        cause: "Overboiled, or drained and dressed while still wet.",
        fixNow:
          "Spread them further apart and keep roasting — extra time drives off some of the moisture.",
        prevent:
          "Parboil to firm-centred only, then let them steam dry in the colander before the fat.",
      },
      {
        symptom: "Some burnt, some still pale",
        cause: "Uneven piece sizes, an overcrowded tray, or oven hot spots.",
        fixNow:
          "Move the darkest pieces to the cooler edge of the tray and rotate the tray front to back.",
        prevent:
          "Cut to an even size, leave gaps between pieces, and use two trays for larger batches.",
      },
    ],
    leftoversHeading: "Save what's left",
    leftoversIntro:
      "Two things are worth keeping after this tray comes out, and one of them is worth more than the potatoes.",
    leftovers: [
      {
        part: "Fat left in the tray",
        use: "Strain it through a fine sieve into a clean jar while warm, then refrigerate. It has picked up potato starch and salt, so use it for another tray of potatoes or vegetables rather than a delicate sauce, and discard it once it smells anything but clean.",
        to: "/learn/how-to-render-duck-fat",
        linkLabel: "Straining and storing rendered fat",
      },
      {
        part: "Cold roast potatoes",
        use: "Refrigerate within two hours in a shallow container and eat within 3–4 days. Reheat spread out on a hot tray at 200°C / 400°F for 10–12 minutes; a microwave will make them soft.",
      },
      {
        part: "Garlic and herbs from the tray",
        use: "Squeeze the soft garlic into a mayonnaise or mash it into butter for whatever you are serving alongside.",
      },
    ],
    faq: [
      {
        q: "Do I have to parboil the potatoes?",
        a: "You can roast them raw, but you will not get the same shell. Parboiling gelatinises the starch at the surface so the roughing-up step produces a rough, starchy layer that fries crisp. Raw potatoes roast to a smoother, denser surface and take longer to cook through.",
      },
      {
        q: "How much duck fat do I need for a tray of potatoes?",
        a: "For 1.2 kg of potatoes, about 90 g (roughly ⅓ cup) is enough to coat everything and leave a shallow film in the tray. You are frying the contact faces, not deep-frying, so more fat mostly means more fat to strain afterwards.",
      },
      {
        q: "Can I use a different fat?",
        a: "Yes — beef dripping, lard, or a high-heat neutral oil all crisp well, since all of them are close to pure fat. What changes is flavour: duck fat brings a savoury, roasted note the others do not. Butter on its own is the poor choice here, because its water and milk solids steam the surface and burn before the potatoes are done.",
      },
      {
        q: "Can I get these ready in advance?",
        a: "Partly. Parboil, drain, rough up and refrigerate the potatoes uncovered on a tray up to a day ahead — the extra drying time in the fridge helps rather than hurts. Roast them from cold in preheated fat and allow about five extra minutes. Fully roasting ahead and reheating gives you a good potato, not a great one.",
      },
      {
        q: "Why did my potatoes stick to the tray?",
        a: "Almost always because they were turned too early. Potatoes bond to hot metal while the crust is forming and release on their own once it sets. Leave the first side a full 25 minutes and use a thin metal spatula rather than tongs.",
      },
      {
        q: "Can I reuse the fat from the tray?",
        a: "Once or twice, if you strain it while it is still warm and keep it refrigerated. It carries starch and salt from the potatoes, which shortens how long it keeps, so use it for roasting rather than saving it long-term, and throw it out if it smells sour or sharp.",
      },
    ],
    related: [
      "/cook/ways-to-use-duck-fat",
      "/learn/how-to-render-duck-fat",
      "/ingredients/duck-fat-vs-butter-oil",
      "/tools/recipe-scaler",
      "/recipes/duck-leg-confit",
      "/recipes/roasted-whole-duck",
      "/recipes/peking-duck-at-home",
    ],
    sourcing: [],
    sourceIds: [],
  },
};

export const recipeBySlug = (slug: string): Recipe | undefined =>
  RECIPES.find((r) => r.slug === slug);

export const recipeContentBySlug = (slug: string): RecipeContent | undefined =>
  RECIPE_CONTENT[slug];

export const recipePath = (slug: string) => `/recipes/${slug}`;

/**
 * True when a recipe's own ingredient list calls for rendered duck fat.
 *
 * Drives whether a recipe page may show a duck-fat seller CTA. Derived from the
 * ingredients rather than hardcoded per slug, so a recipe that stops calling for
 * duck fat stops showing the fat link automatically.
 */
export const recipeNeedsDuckFat = (slug: string): boolean => {
  const content = RECIPE_CONTENT[slug];
  if (!content) return false;
  return content.ingredientGroups.some((group) =>
    group.items.some((item) => /duck fat/i.test(item)),
  );
};
