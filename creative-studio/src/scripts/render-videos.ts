import path from "node:path";
import {fileURLToPath} from "node:url";
import {mkdir, writeFile} from "node:fs/promises";
import {bundle} from "@remotion/bundler";
import {renderMedia, selectComposition} from "@remotion/renderer";
import {videoSpecs} from "../video/content";
import {assertApprovedMedia} from "../media/library";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../.."); const out=path.join(root,"output/video"); await mkdir(out,{recursive:true});
assertApprovedMedia(videoSpecs.flatMap((video)=>video.scenes.map((scene)=>scene.mediaSlot)));
const serveUrl=await bundle({entryPoint:path.join(root,"src/video/index.ts"),webpackOverride:c=>c});

const selectedVideos=process.env.VIDEO_ID?videoSpecs.filter((video)=>video.id===process.env.VIDEO_ID):videoSpecs;
if(!selectedVideos.length) throw new Error(`Unknown VIDEO_ID: ${process.env.VIDEO_ID}`);
for(const video of selectedVideos){
  const composition=await selectComposition({serveUrl,id:video.id,inputProps:{video}});
  const file=path.join(out,`${video.id}.mp4`);
  await renderMedia({serveUrl,composition,codec:"h264",outputLocation:file,inputProps:{video},crf:20,pixelFormat:"yuv420p",imageFormat:"jpeg",jpegQuality:74,concurrency:1,muted:true,logLevel:"info"});
  const per=video.durationInFrames/video.scenes.length/30;
  const captions=video.narration.map((text,index)=>({text:` ${text}`,startMs:Math.round(index*per*1000),endMs:Math.round((index+1)*per*1000-120),timestampMs:null,confidence:null}));
  await writeFile(path.join(out,`${video.id}.captions.json`),JSON.stringify(captions,null,2));
  const srt=captions.map((c,index)=>`${index+1}\n${stamp(c.startMs)} --> ${stamp(c.endMs)}\n${c.text.trim()}\n`).join("\n");
  await writeFile(path.join(out,`${video.id}.srt`),srt);
  await writeFile(path.join(out,`${video.id}.narration.md`),`# ${video.title}\n\n${video.narration.map((line,i)=>`${i+1}. ${line}`).join("\n")}\n\nCTA: ${video.cta}\nSource: ${video.canonicalUrl}\n`);
  await writeFile(path.join(out,`${video.id}.on-screen-text.md`),`# ${video.title} — On-Screen Text\n\n${video.scenes.map((scene,i)=>`${i+1}. ${scene.headline}`).join("\n")}\n\nCTA: ${video.cta}\nSource: ${video.canonicalUrl}\n`);
}

function stamp(ms:number){const h=Math.floor(ms/3600000),m=Math.floor(ms%3600000/60000),s=Math.floor(ms%60000/1000),x=ms%1000;return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")},${String(x).padStart(3,"0")}`;}
