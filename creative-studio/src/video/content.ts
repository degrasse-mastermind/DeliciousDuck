import {mediaFor, type MediaSlotId, type VisualTreatment} from "../media/library";

export interface VideoScene { eyebrow: string; headline: string; body: string; image: string | null; mediaSlot: MediaSlotId; preferredTreatment: VisualTreatment; tone?: "forest"|"ivory"|"cranberry"; annotation?: string; }
export interface VideoSpec { id:string; title:string; durationInFrames:number; sourcePath:string; canonicalUrl:string; cta:string; scenes:VideoScene[]; narration:string[]; }

const visual = (mediaSlot: MediaSlotId) => {
  const media = mediaFor(mediaSlot);
  return {mediaSlot, image: media.path, preferredTreatment: media.treatment};
};

export const videoSpecs: VideoSpec[] = [
  {
    id:"DD-Start-It-Cold",title:"Start It Cold",durationInFrames:720,sourcePath:"/cook/how-to-cook-duck-breast",canonicalUrl:"https://deliciousduck.com/cook/how-to-cook-duck-breast",cta:"Read the cold-pan method",
    scenes:[
      {eyebrow:"THE MISTAKE",headline:"Your pan is probably too hot.",body:"Duck breast needs a quiet start so the fat can render before the skin burns.",...visual("finishedRecipePhoto"),tone:"forest"},
      {eyebrow:"WHY IT WORKS",headline:"Hot browns first. Cold renders first.",body:"A screaming-hot pan can seize the surface before the fat underneath liquefies.",...visual("finishedRecipePhoto"),tone:"ivory",annotation:"HOT PAN ≠ CONTROLLED RENDER"},
      {eyebrow:"THE SETUP",headline:"Skin-side down. Cold, dry pan.",body:"No oil. Raise the heat gradually over 8–12 minutes.",...visual("scoringDepthAnatomy"),tone:"forest"},
      {eyebrow:"WATCH THE PAN",headline:"Pour off pooled fat",body:"Clear it two or three times so the skin keeps direct contact with the pan.",...visual("finishedRecipePhoto"),tone:"ivory",annotation:"POOLED FAT → CLEAR → CONTACT"},
      {eyebrow:"THE CUE",headline:"Matte. Deep gold. Firm.",body:"Flip on appearance—not a fixed timer—then check the centre with a probe.",...visual("finishedRecipePhoto"),tone:"forest"},
      {eyebrow:"THE RESULT",headline:"Render cold. Finish on colour.",body:"Read the complete method and safety context.",...visual("appetiteHeroPhoto"),tone:"forest"}
    ],
    narration:["Your duck pan should not hiss at the start.","A hot pan browns the skin before the fat underneath can render.","Put the breast skin-side down in a cold, dry pan, then raise the heat gradually over eight to twelve minutes.","Pour off pooled fat two or three times so the skin keeps contact with the pan.","Flip when the skin is matte, deep gold and firm—then check the centre with a probe.","Render cold. Finish hot. The full method is on DeliciousDuck."]
  },
  {
    id:"DD-Crisp-Skin-Finally",title:"Crisp Skin, Finally",durationInFrames:840,sourcePath:"/learn/why-duck-skin-isnt-crispy",canonicalUrl:"https://deliciousduck.com/learn/why-duck-skin-isnt-crispy",cta:"Diagnose the crisp-skin failure",
    scenes:[
      {eyebrow:"FAST DIAGNOSIS",headline:"CRISP SKIN, FINALLY",body:"Five failure signals you can actually fix.",...visual("finishedRecipePhoto"),tone:"forest"},
      {eyebrow:"01 · WET",headline:"The skin glistens",body:"Blot it fully dry. Surface moisture steams before it browns.",...visual("finishedRecipePhoto"),tone:"ivory",annotation:"DRY SURFACE → BETTER BROWNING"},
      {eyebrow:"02 · TOO HOT",headline:"It browned fast, but stayed chewy",body:"Lower the heat. Next time, start cold and climb gradually.",...visual("finishedRecipePhoto"),tone:"cranberry",annotation:"START COLD → CLIMB"},
      {eyebrow:"03 · CROWDED",headline:"Some pieces crisp. Others stay soft.",body:"Leave visible gaps or cook in batches.",...visual("appetiteHeroPhoto"),tone:"ivory"},
      {eyebrow:"04 · POOLED FAT",headline:"The skin is frying, not touching",body:"Pour off pooled fat to restore direct pan contact.",...visual("finishedRecipePhoto"),tone:"forest",annotation:"POUR OFF → CONTACT"},
      {eyebrow:"05 · BAD REST",headline:"It was crisp—then went soft",body:"Rest skin-side up, uncovered or loosely tented.",...visual("finishedRecipePhoto"),tone:"cranberry"},
      {eyebrow:"SAVE THE CHECKLIST",headline:"Dry · score · start cold",body:"Pour off fat · flip on colour · rest skin-up.",...visual("appetiteHeroPhoto"),tone:"forest"}
    ],
    narration:["If your duck skin will not crisp, match the symptom.","If the skin glistens, blot it dry. Moisture steams before it browns.","If it browned fast but stayed chewy, the pan started too hot.","If some pieces crisp and others do not, the pan is crowded.","If fat pools around the breast, pour it off to restore pan contact.","If it was crisp off the pan but soft on the plate, it rested the wrong way.","Dry, score, start cold, pour off fat, flip on colour, and rest skin-up."]
  },
  {
    id:"DD-Where-To-Probe",title:"Where To Probe",durationInFrames:720,sourcePath:"/learn/duck-breast-temperature-doneness",canonicalUrl:"https://deliciousduck.com/learn/duck-breast-temperature-doneness",cta:"Use the temperature reference",
    scenes:[
      {eyebrow:"A SMALL PLACEMENT ERROR",headline:"Where you probe changes the number.",body:"The target matters as much as what the thermometer says.",...visual("technicalProbePlacement"),tone:"forest",annotation:"SIDE ENTRY → CENTRE"},
      {eyebrow:"THE RIGHT PATH",headline:"Enter from the side",body:"Keep the probe horizontal.",...visual("technicalProbePlacement"),tone:"ivory",annotation:"→ centre"},
      {eyebrow:"THE TARGET",headline:"Thickest part. Geometric centre.",body:"Avoid the fat cap, pan surface and tapered thin edge.",...visual("technicalProbePlacement"),tone:"forest"},
      {eyebrow:"THEN INTERPRET",headline:"Pull is not final",body:"The breast continues warming during a 5–8 minute rest.",...visual("appetiteHeroPhoto"),tone:"ivory",annotation:"PULL → REST → FINAL"},
      {eyebrow:"SAFETY CONTEXT",headline:"165°F final is the USDA minimum",body:"Lower doneness bands are culinary conventions—not safety clearances.",...visual("technicalProbePlacement"),tone:"cranberry",annotation:"OFFICIAL POULTRY MINIMUM"},
      {eyebrow:"SAVE THE REFERENCE",headline:"Placement. Carryover. Context.",body:"Use the complete temperature and doneness guide.",...visual("appetiteHeroPhoto"),tone:"forest"}
    ],
    narration:["Where you probe can change the number.","Enter through the side and keep the thermometer horizontal.","Aim for the geometric centre of the thickest part, avoiding the fat cap, pan and thin edge.","Then remember: pull temperature is not final temperature. The breast keeps warming during a five-to-eight-minute rest.","A final temperature of one hundred sixty-five degrees Fahrenheit is the USDA poultry minimum. Lower doneness bands are culinary conventions, not safety clearances.","Placement, carryover, context. Use the complete DeliciousDuck reference."]
  }
];
