import {mediaFor, type MediaSlotId, type VisualTreatment} from "../media/library";

export type StillKind = "recipe" | "pin" | "carousel" | "story" | "cover" | "reference";

export interface StillSpec {
  id: string;
  kind: StillKind;
  width: number;
  height: number;
  eyebrow: string;
  headline: string;
  subhead: string;
  cta?: string;
  mediaSlot: MediaSlotId;
  image: string | null;
  imageAlt: string;
  preferredTreatment: VisualTreatment;
  tone?: "forest" | "ivory" | "cranberry" | "photo";
  slide?: string;
  footer?: string;
  clean?: boolean;
  rows?: Array<{label: string; value: string; note?: string}>;
  composition?: 0 | 1 | 2;
  imagePosition?: string;
}

const date = "20260823";
const visual = (mediaSlot: MediaSlotId) => {
  const media = mediaFor(mediaSlot);
  return {mediaSlot, image: media.path, imageAlt: media.alt, preferredTreatment: media.treatment};
};

export const pinSpecs: StillSpec[] = [
  {id:`DD-LEARN-duck-temp-PIN-${date}-v01`,kind:"pin",width:1000,height:1500,eyebrow:"REFERENCE · DUCK BREAST",headline:"Duck Breast Temperature Guide",subhead:"Pull temperature, carryover and the official safety minimum—one clear reference.",cta:"Read the full temperature guide",...visual("appetiteHeroPhoto"),tone:"forest",composition:0,imagePosition:"44% center"},
  {id:`DD-LEARN-where-to-probe-PIN-${date}-v01`,kind:"pin",width:1000,height:1500,eyebrow:"TECHNIQUE · 20 SECONDS",headline:"Where the probe actually goes",subhead:"Enter from the side. Aim for the centre of the thickest part—not the fat cap or pan.",cta:"See the placement guide",...visual("technicalProbePlacement"),tone:"ivory"},
  {id:`DD-LEARN-doneness-cues-PIN-${date}-v01`,kind:"pin",width:1000,height:1500,eyebrow:"DECISION GUIDE",headline:"Duck Doneness: What Temperature Actually Means",subhead:"Culinary texture targets and the 165°F safety minimum answer different questions.",cta:"Compare every target",...visual("appetiteHeroPhoto"),tone:"photo",composition:1,imagePosition:"63% center"},
  {id:`DD-LEARN-crisp-failures-PIN-${date}-v01`,kind:"pin",width:1000,height:1500,eyebrow:"TROUBLESHOOTING",headline:"Why Duck Skin Won’t Get Crispy",subhead:"Match the symptom: wet skin, hot start, crowding, pooled fat or a bad rest.",cta:"Diagnose the failure",...visual("finishedRecipePhoto"),tone:"photo",composition:2,imagePosition:"26% center"},
  {id:`DD-COOK-cold-pan-PIN-${date}-v01`,kind:"pin",width:1000,height:1500,eyebrow:"COUNTERINTUITIVE, BUT RIGHT",headline:"Start Duck Breast in a Cold Pan",subhead:"Give the fat time to render before the exterior burns.",cta:"Learn the cold-pan method",...visual("finishedRecipePhoto"),tone:"photo",composition:1,imagePosition:"74% center"},
  {id:`DD-LEARN-crisp-checklist-PIN-${date}-v01`,kind:"pin",width:1000,height:1500,eyebrow:"SAVE THIS CHECKLIST",headline:"Crisp-skin checklist",subhead:"Dry. Score. Start cold. Pour off fat. Flip on colour. Rest skin-up.",cta:"Keep the full checklist",...visual("scoringDepthAnatomy"),tone:"ivory"},
  {id:`DD-RECIPE-pan-seared-PIN-${date}-v01`,kind:"pin",width:1000,height:1500,eyebrow:"PAN-SEARED DUCK BREAST",headline:"Crisp skin. Rosy centre. No restaurant theatre.",subhead:"A cold-pan recipe with exact timing, temperature context and a five-minute rest.",cta:"Cook the recipe",...visual("finishedRecipePhoto"),tone:"photo",composition:0,imagePosition:"center"},
  {id:`DD-COOK-render-cold-PIN-${date}-v01`,kind:"pin",width:1000,height:1500,eyebrow:"THE METHOD",headline:"Cold-Pan Rendering Method",subhead:"Render gradually, pour off fat, then finish on colour and temperature.",cta:"Follow the method",...visual("finishedRecipePhoto"),tone:"photo",composition:2,imagePosition:"78% center"},
  {id:`DD-RECIPE-beginner-breast-PIN-${date}-v01`,kind:"pin",width:1000,height:1500,eyebrow:"BEGINNER CONFIDENCE",headline:"Your first duck breast can be this good",subhead:"One pan, one thermometer, and cues you can actually see.",cta:"Start with the recipe",...visual("appetiteHeroPhoto"),tone:"photo",composition:1,imagePosition:"58% center"}
];

const crispSlides = [
  ["01 · PATTERN INTERRUPT","Your pan is not too cold","A hot start can brown the surface before the fat underneath renders."],
  ["02 · SURFACE","Wet skin steams","Blot it fully dry immediately before cooking. Moisture delays browning."],
  ["03 · SETUP","Start cold, then climb","Skin-side down. Cold, dry, heavy pan. Raise heat gradually over 8–12 minutes."],
  ["04 · RENDER","Give the fat somewhere to go","Score the cold fat cap and leave space between breasts."],
  ["05 · PAN CUE","Pour off pooled fat","Deep fat insulates the skin. Clear it two or three times to restore pan contact."],
  ["06 · FINISH","Do not undo the crisp","Flip when matte and deep gold. Rest skin-side up, uncovered or loosely tented."],
  ["07 · SAVE THIS","The crisp-skin checklist","Dry · score · start cold · pour off fat · flip on colour · rest skin-up"]
] as const;

const tempSlides = [
  ["01 · THE IDEA","Duck doneness is not one number","Texture targets and a food-safety minimum answer different questions."],
  ["02 · TWO JOBS","Pull temperature vs final temperature","The breast keeps warming during its 5–8 minute rest."],
  ["03 · MEDIUM-RARE","125–130°F pull","Final 130–135°F. A culinary convention—not a safety clearance."],
  ["04 · MEDIUM","135–140°F pull","Final 140–145°F. Firmer, still moist; culinary convention only."],
  ["05 · SAFETY","165°F final","The USDA poultry minimum that removes the safety question."],
  ["06 · PLACEMENT","Probe from the side","Aim horizontally for the geometric centre of the thickest part."],
  ["07 · SAVE THIS","Read the number in context","Placement · carryover · rest · diner risk all matter. Use the full reference."]
] as const;

export const carouselSpecs: StillSpec[] = [
  ...crispSlides.map((s,i)=>{const slot:MediaSlotId=i===3?"scoringDepthAnatomy":i===6?"appetiteHeroPhoto":"finishedRecipePhoto";return {id:`DD-LEARN-crisp-skin-CAR-${date}-v01-s${i+1}`,kind:"carousel" as const,width:1080,height:1350,eyebrow:s[0],headline:s[1],subhead:s[2],cta:i===6?"Read the troubleshooting guide":"",...visual(slot),tone:i===0||i===6?"forest" as const:i===5?"cranberry" as const:mediaFor(slot).treatment==="photography"?"photo" as const:"ivory" as const,slide:`${i+1} / 7`,composition:(i%3) as 0|1|2,imagePosition:["28% center","72% center","center 36%"][i%3]}}),
  ...tempSlides.map((s,i)=>{const slot:MediaSlotId=i===5?"technicalProbePlacement":i===2||i===3||i===4?"technicalProbePlacement":"appetiteHeroPhoto";return {id:`DD-LEARN-duck-temp-CAR-${date}-v01-s${i+1}`,kind:"carousel" as const,width:1080,height:1350,eyebrow:s[0],headline:s[1],subhead:s[2],cta:i===6?"Open the temperature reference":"",...visual(slot),tone:i===0||i===6?"forest" as const:i===4?"cranberry" as const:mediaFor(slot).treatment==="photography"?"photo" as const:"ivory" as const,slide:`${i+1} / 7`}})
];

export const referenceSpecs: StillSpec[] = [
  {id:`DD-LEARN-duck-temp-REF-${date}-v01-landscape`,kind:"reference",width:1600,height:900,eyebrow:"DUCK BREAST · TEMPERATURE & DONENESS",headline:"Two numbers. Two different jobs.",subhead:"Pull temperature anticipates the rest. Final temperature describes the endpoint.",cta:"deliciousduck.com/learn/duck-breast-temperature-doneness",...visual("technicalProbePlacement"),tone:"ivory",rows:[{label:"Medium-rare",value:"125–130°F pull",note:"130–135°F final · culinary convention"},{label:"Medium",value:"135–140°F pull",note:"140–145°F final · culinary convention"},{label:"USDA minimum",value:"165°F final",note:"Official poultry safety minimum"}]},
  {id:`DD-LEARN-duck-temp-REF-${date}-v01-mobile`,kind:"reference",width:1080,height:1350,eyebrow:"SAVEABLE REFERENCE",headline:"Duck breast temperature & doneness",subhead:"Probe from the side into the centre of the thickest part.",cta:"Read the safety context",...visual("technicalProbePlacement"),tone:"ivory",rows:[{label:"Medium-rare",value:"125–130°F pull",note:"130–135°F final · culinary convention"},{label:"Medium",value:"135–140°F pull",note:"140–145°F final · culinary convention"},{label:"USDA minimum",value:"165°F final",note:"Official poultry safety minimum"}]},
  {id:`DD-LEARN-duck-temp-REF-${date}-v01-pinterest`,kind:"reference",width:1000,height:1500,eyebrow:"DUCK BREAST REFERENCE",headline:"Pull temp, final temp, safety minimum",subhead:"The chart to save before the pan gets hot.",cta:"Get the complete guide",...visual("technicalProbePlacement"),tone:"forest",rows:[{label:"Medium-rare",value:"125–130°F pull",note:"130–135°F final"},{label:"Medium",value:"135–140°F pull",note:"140–145°F final"},{label:"USDA minimum",value:"165°F final",note:"Official poultry safety minimum"}]},
  {id:`DD-LEARN-duck-temp-REF-${date}-v01-print`,kind:"reference",width:2400,height:3000,eyebrow:"PRINTABLE KITCHEN REFERENCE",headline:"Duck breast temperature & doneness",subhead:"Rest 5–8 minutes. Carryover varies with breast size and heat intensity.",cta:"Source and full context: deliciousduck.com/learn/duck-breast-temperature-doneness",...visual("technicalProbePlacement"),tone:"ivory",rows:[{label:"Medium-rare",value:"125–130°F pull",note:"130–135°F final · culinary convention only"},{label:"Medium",value:"135–140°F pull",note:"140–145°F final · culinary convention only"},{label:"USDA minimum",value:"165°F final",note:"Official poultry safety minimum"}]}
];

export const coverSpecs: StillSpec[] = [
  ...[["start-it-cold","START IT COLD","finishedRecipePhoto"],["crisp-skin-finally","CRISP SKIN, FINALLY","finishedRecipePhoto"],["where-to-probe","WHERE TO PROBE","technicalProbePlacement"]].flatMap(([slug,title,slot])=>[
    {id:`DD-COOK-${slug}-COVER-${date}-v01`,kind:"cover" as const,width:1080,height:1920,eyebrow:"DUCK BREAST · FIELD NOTE",headline:title,subhead:"",cta:"",...visual(slot as MediaSlotId),tone:mediaFor(slot as MediaSlotId).treatment==="photography"?"photo" as const:"forest" as const},
    {id:`DD-COOK-${slug}-COVER-${date}-v01-clean`,kind:"cover" as const,width:1080,height:1920,eyebrow:"",headline:"",subhead:"",cta:"",...visual(slot as MediaSlotId),tone:mediaFor(slot as MediaSlotId).treatment==="photography"?"photo" as const:"forest" as const,clean:true}
  ])
];

export const masterSpecs: StillSpec[] = [
  {id:`DD-RECIPE-pan-seared-RECIPE-${date}-v01`,kind:"recipe",width:1080,height:1350,eyebrow:"PAN-SEARED DUCK BREAST",headline:"Crisp skin, rosy centre",subhead:"Cold-pan rendering · 2 servings · 5-minute rest",cta:"Cook the full recipe",...visual("finishedRecipePhoto"),tone:"photo"},
  {id:`DD-LEARN-crisp-skin-STORY-${date}-v01`,kind:"story",width:1080,height:1920,eyebrow:"STORY MASTER · FRAME 1",headline:"What killed the crisp?",subhead:"Reserve this lower field for a native poll or link sticker.",cta:"",...visual("finishedRecipePhoto"),tone:"photo"},
  pinSpecs[0]!, carouselSpecs[0]!, coverSpecs[0]!
];

export const allStillSpecs = [...masterSpecs, ...pinSpecs, ...carouselSpecs, ...referenceSpecs, ...coverSpecs]
  .filter((spec,index,array)=>array.findIndex((candidate)=>candidate.id===spec.id)===index);
