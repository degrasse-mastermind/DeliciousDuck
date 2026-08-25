import {mkdir, writeFile, copyFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {distributionManifest} from "./manifest.ts";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const data=path.join(root,"distribution/data"); const review=path.join(root,"output/distribution-review");
await mkdir(data,{recursive:true}); await mkdir(review,{recursive:true});
const json=`${JSON.stringify(distributionManifest,null,2)}\n`;
await writeFile(path.join(data,"launch-manifest.json"),json); await writeFile(path.join(review,"launch-manifest.json"),json);
const performance={version:1,generated_at:new Date().toISOString(),status:"awaiting-real-data",warning:"No performance conclusions are available until real platform and site metrics are imported.",dimensions:["topic","hook","visual_treatment","platform","content_job","source_path","cta","utm_campaign"],records:distributionManifest.records.map(r=>({distribution_id:r.distribution_id,asset_id:r.asset_id,platform:r.platform,topic:r.headline,hook:r.platform_title,visual_treatment:r.visual_treatment,content_job:r.content_job,source_path:r.source_path,cta:r.cta,utm_campaign:r.utm_campaign,primary_metric:r.primary_metric,secondary_metric:r.secondary_metric,performance_status:r.performance_status,metrics:r.performance}))};
await writeFile(path.join(data,"performance-summary.json"),`${JSON.stringify(performance,null,2)}\n`);
await writeFile(path.join(review,"platform-copy-export.json"),`${JSON.stringify(distributionManifest.records.map(({distribution_id,platform,platform_title,platform_caption,description,alt_text,hashtags,cta,destination_url})=>({distribution_id,platform,platform_title,platform_caption,description,alt_text,hashtags,cta,destination_url})),null,2)}\n`);
await writeFile(path.join(review,"utm-map.json"),`${JSON.stringify(distributionManifest.records.map(({distribution_id,canonical_url,destination_url,utm_source,utm_medium,utm_campaign,utm_content})=>({distribution_id,canonical_url,destination_url,utm_source,utm_medium,utm_campaign,utm_content})),null,2)}\n`);
for(const file of ["DISTRIBUTION-PLAYBOOK.md","REFERENCE-ASSET-DISTRIBUTION.md"]) await copyFile(path.join(root,"distribution",file),path.join(review,file));
console.log(`Generated ${distributionManifest.records.length} distribution records.`);
