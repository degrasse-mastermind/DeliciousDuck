import path from "node:path";
import {fileURLToPath} from "node:url";
import {mkdir, writeFile} from "node:fs/promises";
import {bundle} from "@remotion/bundler";
import {renderStill, selectComposition} from "@remotion/renderer";
import sharp from "sharp";
import {allStillSpecs, carouselSpecs, coverSpecs, masterSpecs, pinSpecs, referenceSpecs, type StillSpec} from "../content/asset-specs";
import {manifestSchema, type AssetManifest} from "../manifests/schema";
import {videoSpecs} from "../video/content";
import {assertApprovedMedia} from "../media/library";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const output=path.join(root,"output");
const entry=path.join(root,"src/video/index.ts");

const folderFor=(spec:StillSpec)=> spec.kind==="pin"?"pinterest":spec.kind==="carousel"?"instagram/carousels":spec.kind==="cover"?"video/covers":spec.kind==="reference"?"reference":spec.kind==="story"?"stories":"instagram/masters";

await mkdir(output,{recursive:true});
assertApprovedMedia(allStillSpecs.map((spec)=>spec.mediaSlot));
assertApprovedMedia(videoSpecs.flatMap((video)=>video.scenes.map((scene)=>scene.mediaSlot)));
const serveUrl=await bundle({entryPoint:entry,webpackOverride:(config)=>config});

for(const spec of allStillSpecs){
  const targetDir=path.join(output,folderFor(spec)); await mkdir(targetDir,{recursive:true});
  const target=path.join(targetDir,`${spec.id}.png`);
  const composition=await selectComposition({serveUrl,id:"EditorialStill",inputProps:{spec}});
  await renderStill({serveUrl,composition,output:target,inputProps:{spec},imageFormat:"png",logLevel:"warn"});
  process.stdout.write(`rendered ${path.relative(root,target)}\n`);
}

const safe={left:80,right:80,top:100,bottom:220};
const makeManifest=(id:string,platform:AssetManifest["platform"],format:AssetManifest["format"],source:string,url:string,headline:string,truth:string,cta:string,image:string,alt:string,dimensions:{width:number;height:number},files:string[],pillar:AssetManifest["pillar"]="LEARN",parent:string|null=null):AssetManifest=>({
  asset_id:id,source_path:source,canonical_url:url,cluster:"duck-breast",pillar,platform,format,
  content_job:platform==="pinterest"?"Earn a qualified outbound click and save":format==="CAR"?"Earn completion and saves":"Create a reusable source-backed reference",
  truth_sentence:truth,hook:headline,headline,subhead:"Source-backed DeliciousDuck editorial creative",CTA:cta,primary_image:image,image_alt:alt,series_tag:"Duck Breast Field Notes",dimensions,safe_zone:safe,output_files:files,source_claims:[truth],verification_notes:"Copy checked against source snapshot at commit 32cd7502; no unsupported claim added.",variant_parent:parent,version:1
});

const assets:AssetManifest[]=[];
for(const p of pinSpecs){
  const source=p.id.includes("crisp")?"/learn/why-duck-skin-isnt-crispy":p.id.includes("temp")||p.id.includes("probe")||p.id.includes("doneness")?"/learn/duck-breast-temperature-doneness":p.id.includes("RECIPE")||p.id.includes("beginner")?"/recipes/pan-seared-duck-breast":"/cook/how-to-cook-duck-breast";
  const url=`https://deliciousduck.com${source}`;
  const item=makeManifest(p.id,"pinterest","PIN",source,url,p.headline,p.subhead,p.cta??"Read the guide",p.image??`approval-required:${p.mediaSlot}`,p.imageAlt,{width:p.width,height:p.height},[`pinterest/${p.id}.png`],p.id.includes("RECIPE")?"RECIPE":source.startsWith("/cook")?"COOK":"LEARN");
  item.preferred_visual_treatment=p.preferredTreatment; item.media_slots=[p.mediaSlot]; assets.push(item);
}
const addGrouped=(item:AssetManifest,specs:StillSpec[],treatment:AssetManifest["preferred_visual_treatment"]="mixed-media")=>{item.preferred_visual_treatment=treatment;item.media_slots=[...new Set(specs.map(s=>s.mediaSlot))];assets.push(item);};
addGrouped(makeManifest("DD-LEARN-crisp-skin-CAR-20260823-v01","instagram","CAR","/learn/why-duck-skin-isnt-crispy","https://deliciousduck.com/learn/why-duck-skin-isnt-crispy","Why Your Duck Skin Won't Crisp","Dry, score, start cold, pour off fat, flip on colour, and rest skin-up.","Read the troubleshooting guide","assets/recipe-pan-seared.jpg","Illustrative pan-seared duck breast photograph",{width:1080,height:1350},carouselSpecs.slice(0,7).map(s=>`instagram/carousels/${s.id}.png`)),carouselSpecs.slice(0,7));
addGrouped(makeManifest("DD-LEARN-duck-temp-CAR-20260823-v01","instagram","CAR","/learn/duck-breast-temperature-doneness","https://deliciousduck.com/learn/duck-breast-temperature-doneness","Duck Doneness Is Not One Number","Texture targets and the 165°F safety minimum answer different questions.","Open the temperature reference","assets/technical-probe-placement-specimen-reference.png","Approved probe-placement technical illustration",{width:1080,height:1350},carouselSpecs.slice(7).map(s=>`instagram/carousels/${s.id}.png`)),carouselSpecs.slice(7));
addGrouped(makeManifest("DD-LEARN-duck-temp-REF-20260823-v01","web","REF","/learn/duck-breast-temperature-doneness","https://deliciousduck.com/learn/duck-breast-temperature-doneness","Duck Breast Temperature & Doneness Reference","Pull temperature anticipates the rest; final temperature describes the endpoint.","Read the full safety context","assets/technical-probe-placement-specimen-reference.png","Approved probe-placement technical illustration",{width:1600,height:900},referenceSpecs.map(s=>`reference/${s.id}.png`)),referenceSpecs,"technical-illustration");
for(const slug of ["start-it-cold","crisp-skin-finally","where-to-probe"]){
  const relevant=coverSpecs.filter(c=>c.id.includes(slug));
  addGrouped(makeManifest(`DD-COOK-${slug}-COVER-20260823-v01`,"reel","COVER",slug==="where-to-probe"?"/learn/duck-breast-temperature-doneness":slug==="crisp-skin-finally"?"/learn/why-duck-skin-isnt-crispy":"/cook/how-to-cook-duck-breast",`https://deliciousduck.com${slug==="where-to-probe"?"/learn/duck-breast-temperature-doneness":slug==="crisp-skin-finally"?"/learn/why-duck-skin-isnt-crispy":"/cook/how-to-cook-duck-breast"}`,relevant[0]?.headline??slug,"Approved source lesson; text and clean retitling versions.","Read the guide",relevant[0]?.image??"assets/logo-duck.png","Approved DeliciousDuck visual",{width:1080,height:1920},relevant.map(s=>`video/covers/${s.id}.png`),"COOK"),relevant);
}
for(const video of videoSpecs){
  const slug=video.id==="DD-Start-It-Cold"?"start-it-cold":video.id==="DD-Crisp-Skin-Finally"?"crisp-skin-finally":"where-to-probe";
  const pillar:AssetManifest["pillar"]=video.sourcePath.startsWith("/cook")?"COOK":"LEARN";
  const image=video.scenes[0]?.image??"assets/logo-duck.png";
  const item=makeManifest(`DD-${pillar}-${slug}-SHORT-20260823-v01`,"reel","SHORT",video.sourcePath,video.canonicalUrl,video.title,video.scenes[0]?.body??video.title,video.cta,image,"Approved DeliciousDuck source visual",{width:1080,height:1920},[`video/${video.id}.mp4`,`video/${video.id}.captions.json`,`video/${video.id}.srt`,`video/${video.id}.narration.md`],pillar);
  item.description_suggestion=`${video.scenes[0]?.body??video.title} ${video.cta}: ${video.canonicalUrl}`;
  item.preferred_visual_treatment="mixed-media";
  item.media_slots=[...new Set(video.scenes.map((scene)=>scene.mediaSlot))];
  assets.push(item);
}
const manifest={generated_at:new Date().toISOString(),source_commit:"32cd7502ca3d0f9fe7af54b1485872ee5dbafc66",assets};
manifestSchema.parse(manifest);
await mkdir(path.join(output,"manifests"),{recursive:true});
await writeFile(path.join(output,"manifests/creative-manifest.json"),JSON.stringify(manifest,null,2));

const pinCopy = pinSpecs.map((pin) => {
  const asset = assets.find((item) => item.asset_id === pin.id)!;
  const job = pin.id.includes("temp") || pin.id.includes("probe") || pin.id.includes("checklist") ? "reference/save" : pin.id.includes("failures") ? "problem/solution" : pin.id.includes("beginner") ? "beginner confidence" : pin.id.includes("RECIPE") ? "outcome/recipe" : "technique";
  return {asset_id:pin.id,pin_title:pin.headline,pin_description:`${pin.subhead} ${pin.cta}.`,destination_url:asset.canonical_url,primary_search_intent:pin.headline.toLowerCase(),secondary_search_intent:"duck breast technique",content_job:job,visual_treatment:pin.preferredTreatment,variant_hypothesis:`${job} framing should earn qualified saves or clicks from viewers seeking ${pin.headline.toLowerCase()}.`,alt_text:pin.imageAlt};
});
const videoCopy = videoSpecs.map((video) => ({
  asset_id:video.id,
  source_url:video.canonicalUrl,
  tiktok:{hook:video.scenes[0]?.headline,description:`${video.scenes[0]?.body} ${video.cta}.`,hashtags:video.id.includes("Probe")?["#DuckBreast","#CookingTemperature","#FoodSafety"]:["#DuckBreast","#CookingTips","#CrispySkin"],cta_strategy:`Link in bio to ${video.canonicalUrl}`},
  instagram:{first_line_hook:video.scenes[0]?.headline,reel_caption:`${video.scenes[0]?.body}\n\n${video.cta}: ${video.canonicalUrl}`,cta:video.cta},
  youtube_shorts:{title:`${video.title} | Duck Breast Technique`,description:`${video.scenes[0]?.body} ${video.cta}: ${video.canonicalUrl}`,destination_url:video.canonicalUrl},
  facebook_reels:{caption:`${video.scenes[0]?.headline} ${video.cta}: ${video.canonicalUrl}`},
}));
const carouselCopy = [
  {asset_id:"DD-LEARN-crisp-skin-CAR-20260823-v01",first_line_hook:"If your duck skin stays chewy, diagnose the setup—not just the heat.",caption:"Five crisp-skin failures, the cue for each, and the checklist worth saving.",cta:"Save this, then read the troubleshooting guide.",destination_url:"https://deliciousduck.com/learn/why-duck-skin-isnt-crispy"},
  {asset_id:"DD-LEARN-duck-temp-CAR-20260823-v01",first_line_hook:"Duck doneness is not one number.",caption:"Pull temperature, final temperature, placement and the official poultry safety minimum—kept distinct.",cta:"Save the reference and open the full safety context.",destination_url:"https://deliciousduck.com/learn/duck-breast-temperature-doneness"},
];
await writeFile(path.join(output,"manifests/platform-copy-manifest.json"),JSON.stringify({generated_at:new Date().toISOString(),pinterest:pinCopy,short_form_video:videoCopy,instagram_facebook_carousels:carouselCopy},null,2));

const sheet=async(name:string,specs:StillSpec[])=>{
  const thumbW=300,thumbH=420,gap=24,cols=Math.min(3,specs.length),rows=Math.ceil(specs.length/cols);
  const canvas=sharp({create:{width:cols*thumbW+(cols+1)*gap,height:rows*thumbH+(rows+1)*gap,channels:4,background:"#F5F2EC"}});
  const comps=[] as sharp.OverlayOptions[];
  for(let i=0;i<specs.length;i++){const s=specs[i]!;const buf=await sharp(path.join(output,folderFor(s),`${s.id}.png`)).resize(thumbW,thumbH,{fit:"contain",background:"#FFFFFF"}).png().toBuffer();comps.push({input:buf,left:gap+(i%cols)*(thumbW+gap),top:gap+Math.floor(i/cols)*(thumbH+gap)});}
  await mkdir(path.join(output,"contact-sheets"),{recursive:true}); await canvas.composite(comps).png().toFile(path.join(output,"contact-sheets",`${name}.png`));
};
await sheet("pinterest-launch-set",pinSpecs);
await sheet("carousel-crisp-skin",carouselSpecs.slice(0,7));
await sheet("carousel-doneness",carouselSpecs.slice(7));
await sheet("reference-and-masters",[...referenceSpecs,...masterSpecs]);
await sheet("video-covers",coverSpecs);

const cropPreviews:StillSpec[]=[];
for(const spec of coverSpecs.filter(s=>!s.clean)){
  const source=path.join(output,"video/covers",`${spec.id}.png`);
  const image=sharp(source); const meta=await image.metadata(); const width=meta.width!,height=meta.height!;
  const crop45={width, height:Math.round(width*5/4), left:0, top:Math.round((height-width*5/4)/2)};
  const cropSquare={width, height:width, left:0, top:Math.round((height-width)/2)};
  const cropDir=path.join(output,"qa/cover-crops"); await mkdir(cropDir,{recursive:true});
  await sharp(source).extract(crop45).png().toFile(path.join(cropDir,`${spec.id}-center-4x5.png`));
  await sharp(source).extract(cropSquare).png().toFile(path.join(cropDir,`${spec.id}-grid-square.png`));
  cropPreviews.push({...spec,id:`${spec.id}-center-4x5`,width:crop45.width,height:crop45.height},{...spec,id:`${spec.id}-grid-square`,width:cropSquare.width,height:cropSquare.height});
}
const cropFiles=await Promise.all(cropPreviews.map(async(s)=>({spec:s,buf:await sharp(path.join(output,"qa/cover-crops",`${s.id}.png`)).resize(300,360,{fit:"contain",background:"#fff"}).png().toBuffer()})));
const cols=3,tw=300,th=360,gap=24,rows=Math.ceil(cropFiles.length/cols);
await sharp({create:{width:cols*tw+(cols+1)*gap,height:rows*th+(rows+1)*gap,channels:4,background:"#F5F2EC"}}).composite(cropFiles.map(({buf},i)=>({input:buf,left:gap+(i%cols)*(tw+gap),top:gap+Math.floor(i/cols)*(th+gap)}))).png().toFile(path.join(output,"contact-sheets/cover-crop-validation.png"));
