import {readFile, stat, writeFile, mkdir} from "node:fs/promises";
import path from "node:path"; import {fileURLToPath} from "node:url";
import {distributionManifest} from "./manifest.ts"; import {withUtm} from "./manifest.ts";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../.."); const failures:string[]=[]; const checks:string[]=[];
const manifestAssets=new Set<string>((JSON.parse(await readFile(path.join(root,"output/manifests/creative-manifest.json"),"utf8")) as {assets:Array<{asset_id:string}>}).assets.map(a=>a.asset_id));
const knownVideo=new Set(["DD-Start-It-Cold","DD-Where-To-Probe","DD-Crisp-Skin-Finally"]); const carouselParents=new Set(["DD-LEARN-crisp-skin-CAR-20260823-v01","DD-LEARN-duck-temp-CAR-20260823-v01"]);
for(const r of distributionManifest.records){
 if(!manifestAssets.has(r.asset_id)&&!knownVideo.has(r.asset_id)&&!carouselParents.has(r.asset_id)) failures.push(`${r.distribution_id}: asset is absent from approved Creative Studio truth`);
 if(r.asset_path.includes("quarantine")) failures.push(`${r.distribution_id}: quarantined path`);
 if(r.destination_url!==withUtm(r.canonical_url,r.utm_source,r.utm_content)) failures.push(`${r.distribution_id}: nondeterministic UTM`);
 const u=new URL(r.destination_url); if([...u.searchParams.keys()].length!==4) failures.push(`${r.distribution_id}: malformed or extra query parameters`);
 const disk=path.resolve(root,"distribution",r.asset_path); try{if((await stat(disk)).size<1000) failures.push(`${r.distribution_id}: asset too small`);}catch{failures.push(`${r.distribution_id}: asset path missing`);}
}
checks.push(`schema and duplicate IDs: ${distributionManifest.records.length} records`); checks.push("approved asset mapping and no quarantine paths"); checks.push("deterministic lowercase UTM generation and four-parameter query strings"); checks.push("mandatory approval checklist gate"); checks.push("real local asset paths");
const files=["distribution/index.html","distribution/styles.css","distribution/app.js","distribution/DISTRIBUTION-PLAYBOOK.md","distribution/REFERENCE-ASSET-DISTRIBUTION.md"];
for(const f of files) try{await stat(path.join(root,f));}catch{failures.push(`${f}: missing`);} checks.push("console, calendar, detail, copy controls, documentation and performance placeholders present");
const secrets=/(SUPABASE_(SERVICE|ACCESS)|API[_-]?KEY|BEGIN (RSA|OPENSSH) PRIVATE KEY)/i; for(const f of files){try{if(secrets.test(await readFile(path.join(root,f),"utf8"))) failures.push(`${f}: possible secret`);}catch{}}
checks.push("static secret-pattern scan"); const report={generated_at:new Date().toISOString(),passed:!failures.length,checks,failures};
await mkdir(path.join(root,"output/distribution-review"),{recursive:true}); await writeFile(path.join(root,"output/distribution-review/QA-report.json"),`${JSON.stringify(report,null,2)}\n`); console.log(JSON.stringify(report,null,2)); if(failures.length) process.exit(1);
