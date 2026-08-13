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
  quackFix: { symptom: string; cause: string; fixNow: string; prevent: string }[];
  leftovers: { part: string; use: string; to?: string; linkLabel?: string }[];
  faq: { q: string; a: string }[];
  /** Guide + tool paths for the Related module. */
  related: string[];
  /** Sourcing links (Buy pillar). */
  sourcing: { label: string; why: string; to: string; linkLabel?: string }[];
  sourceIds: string[];
}

export const RECIPE_CONTENT: Record<string, RecipeContent> = {
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
        watchFor: "Silence for the first minute or two is normal. A loud sizzle immediately means the pan was already hot.",
      },
      {
        title: "Render slowly for 12–18 minutes",
        body: "Keep the heat low enough that the fat bubbles gently rather than spits. Pour off the liquid fat into a heatproof bowl every few minutes — a shallow pan browns; a deep pool of fat effectively deep-fries and steams. The skin should shrink, flatten and turn a deep, even amber.",
        watchFor: "If the skin darkens fast while the fat cap is still thick, drop the heat further and extend the render.",
      },
      {
        title: "Press if the breast curls",
        body: "Duck breasts contract as connective tissue tightens and can lift at the edges, leaving pale patches. Press gently with a spatula for the first few minutes, or set a small weight on top, so the full skin surface stays in contact with the pan.",
      },
      {
        title: "Flip and finish",
        body: "Once the skin is crisp and the fat cap is thin, raise the heat slightly and flip. The meat side only needs 1–3 minutes depending on thickness — it is nearly cooked already from the long render.",
        watchFor: "Probe from the side into the thickest part, keeping the tip in the centre of the muscle.",
      },
      {
        title: "Pull early, then rest",
        body: "Pull at 130–135°F (54–57°C) for rosy, 140–145°F (60–63°C) for medium. Rest skin-side up on a rack for 5–10 minutes; carryover adds roughly 3–5°F, and resting on a plate steams the crust you just spent twenty minutes building.",
        watchFor: "USDA recommends 165°F (73.9°C) for all poultry, including duck. Cooking to a lower temperature is a common culinary practice, not a food-safety recommendation.",
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
        fixNow: "Return the breast skin-side down to a low pan for another 3–5 minutes, pouring off fat as it releases.",
        prevent: "Treat the render as the recipe, not the preamble: 12–18 minutes on low with regular fat removal.",
      },
      {
        symptom: "Skin browned fast but the fat cap is still thick",
        cause: "Heat was too high — the surface set before the fat could melt out.",
        fixNow: "Lower the heat and continue; a slightly darker crust is better than an unrendered one.",
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
        a: "USDA recommends cooking all poultry, including duck, to 165°F (73.9°C). Serving duck breast rosy is a widespread restaurant and home practice, but it is a culinary choice rather than a food-safety recommendation. Anyone pregnant, elderly, very young, or immunocompromised should follow the USDA figure.",
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
    ],
    sourcing: [
      {
        label: "Buying duck breast",
        why: "Breast weights vary widely between suppliers, so render to the look of the fat cap and check temperature rather than following a fixed time.",
        to: "/buy/where-to-buy-duck-online",
        linkLabel: "Where to buy duck online",
      },
    ],
    sourceIds: ["usdaPoultryTemp", "usdaPoultryPrep"],
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
        watchFor: "More salt is not better. Above roughly 2% by weight the meat turns noticeably salty and dense.",
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
        watchFor: "Vigorous bubbling means the fat is too hot; the meat will fray and dry out even while sitting in fat.",
      },
      {
        title: "Test for doneness",
        body: "The legs are ready when a skewer meets no resistance and the meat retracts from the drumstick bone. The internal temperature will be well past the USDA 165°F (73.9°C) minimum long before this point.",
      },
      {
        title: "Cool and store, or crisp now",
        body: "To store, cool the legs in their fat, then refrigerate submerged and use within 3–4 days. To serve, lift a leg out, scrape off excess fat, and crisp skin-side down in a dry hot pan or under a hot oven for 10–15 minutes until the skin shatters.",
        watchFor: "Fat-sealed storage is a refrigerator technique, not shelf-stable preservation. Keep it cold.",
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
        fixNow: "Serve with unsalted starch — plain potatoes, lentils, bread — and a sharp, acidic salad.",
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
    ],
    sourcing: [
      {
        label: "Buying duck legs and rendered fat",
        why: "Leg quarters are often cheaper than breast and freeze well; jarred rendered fat saves you a rendering session.",
        to: "/buy/duck-fat-buying-guide",
        linkLabel: "Duck fat buying guide",
      },
    ],
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
        why: "The bird must sit above the fat it releases, or the underside braises instead of roasting.",
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
        watchFor: "Pour off accumulated fat every 30 minutes — a deep pool spits and steams the underside.",
      },
      {
        title: "Check the legs before browning",
        body: "Probe the thickest part of the thigh, avoiding bone. Legs should be heading for 175–185°F (79–85°C), where connective tissue has broken down and the meat gives easily.",
      },
      {
        title: "Stage two: brown hot and fast",
        body: "Raise the oven to 425–450°F (220–230°C) for 15–25 minutes until the skin is deep mahogany and tight. If you are glazing, brush in the last 10–15 minutes only — sugar burns quickly at this heat.",
        watchFor: "Watch continuously in this stage; the gap between burnished and burnt is a few minutes.",
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
        ["Thigh / leg", "175–185°F (79–85°C)", "Connective tissue breaks down; meat becomes tender"],
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
        prevent: "Use the low-then-hot two-stage method, and shield the breast with foil if it runs ahead.",
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
    ],
    sourcing: [
      {
        label: "Buying a whole duck",
        why: "Most whole ducks sold in the US and UK are Pekin, sold frozen. Check the processing date and allow 24–48 hours to thaw.",
        to: "/buy/where-to-buy-duck-online",
        linkLabel: "Where to buy duck online",
      },
    ],
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
        watchFor: "If the legs lag badly behind, separate the bird into breast and leg pieces next time and smoke them apart.",
      },
      {
        title: "Make the plum sauce while it smokes",
        body: "Simmer plums, shallot, vinegar, honey, soy, star anise and chilli for 20–25 minutes until collapsed and glossy. Blend for a smooth sauce or leave it chunky. It should taste distinctly sharp on its own — against duck fat it will read as balanced.",
        watchFor: "Taste for acidity, not sweetness. Under-acidic plum sauce makes the whole plate cloying.",
      },
      {
        title: "Finish hot for the skin",
        body: "Smoked skin is rarely crisp on its own. Finish under a hot broiler or in a 450°F (230°C) oven for 5–10 minutes, or sear the breast skin-side down in a dry pan.",
        watchFor: "Sugar from the cure browns fast — stay with it.",
      },
      {
        title: "Rest and slice",
        body: "Rest 10 minutes, then slice the breast across the grain and serve with the plum sauce spooned alongside.",
        watchFor: "USDA recommends 165°F (73.9°C) for all poultry; smoking to a lower breast temperature is a culinary choice.",
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
        prevent: "Use a drip tray, fewer wood chunks, and wait for thin blue smoke before the bird goes in.",
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
};

export const recipeBySlug = (slug: string): Recipe | undefined =>
  RECIPES.find((r) => r.slug === slug);

export const recipeContentBySlug = (slug: string): RecipeContent | undefined =>
  RECIPE_CONTENT[slug];

export const recipePath = (slug: string) => `/recipes/${slug}`;
