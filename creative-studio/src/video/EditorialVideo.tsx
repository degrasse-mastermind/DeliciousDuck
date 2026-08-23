import React from "react";
import {AbsoluteFill, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {loadFont as loadNewsreader} from "@remotion/google-fonts/Newsreader";
import {loadFont as loadManrope} from "@remotion/google-fonts/Manrope";
import type {VideoScene, VideoSpec} from "./content";
import {brand} from "../brand/tokens";

const newsreader = loadNewsreader("normal", {weights: ["500", "600"], subsets: ["latin"]}).fontFamily;
const manrope = loadManrope("normal", {weights: ["400", "600", "700"], subsets: ["latin"]}).fontFamily;

const MotionOverlay: React.FC<{slot: VideoScene["mediaSlot"]; frame:number; duration:number}> = ({slot,frame,duration}) => {
  const progress=interpolate(frame,[0,duration],[0,1],{extrapolateRight:"clamp"});
  const label=slot==="scoringDepthAnatomy"?"SKIN + FAT  ·  NOT MEAT":slot==="technicalProbePlacement"?"PROBE PATH  →  CENTRE":null;
  if(!label)return null;
  return <div style={{position:"absolute",left:48,right:48,bottom:48,padding:"18px 24px",borderRadius:999,background:"rgba(16,37,27,.9)",color:brand.color.ivory,fontFamily:manrope,fontSize:18,fontWeight:700,letterSpacing:".12em"}}><div style={{position:"absolute",left:0,bottom:0,height:4,width:`${progress*100}%`,background:brand.color.gold,borderRadius:999}}>{" "}</div>{label}</div>;
};

const Scene: React.FC<{scene: VideoScene; index: number; count: number; duration: number}> = ({scene, index, count, duration}) => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig();
  const enter = interpolate(frame, [0, .48 * fps], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(.16, 1, .3, 1)});
  const exit = interpolate(frame, [duration - .38 * fps, duration], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(.7, 0, .84, 0)});
  const drift = interpolate(frame, [0, duration], [1.01, 1.075], {extrapolateRight: "clamp", easing: Easing.bezier(.33, 1, .68, 1)});
  const isPhoto = scene.preferredTreatment === "photography"; const split = index % 3 === 1; const dark = scene.tone !== "ivory"; const bg = scene.tone === "cranberry" ? brand.color.cranberry : dark ? brand.color.forestInk : brand.color.ivory; const fg = dark || (isPhoto && split) ? brand.color.ivory : brand.color.forestInk;
  return <AbsoluteFill style={{backgroundColor: bg, color: fg, fontFamily: manrope, opacity: exit, overflow: "hidden"}}>
    <div style={{position: "absolute", inset: isPhoto ? 0 : split ? "170px 40px 170px 470px" : "80px 40px 760px 40px", overflow: "hidden", borderRadius: isPhoto ? 0 : 48, background: brand.color.paper}}>
      {scene.image ? <Img src={staticFile(scene.image)} style={{width: "100%", height: "100%", objectFit: isPhoto ? "cover" : "contain", objectPosition: "center", scale: drift, filter: isPhoto ? "brightness(1.1) saturate(1.04)" : undefined}}/> : <div style={{position: "absolute", inset: 0, display: "grid", placeItems: "center"}}><div style={{width: "68%", padding: 34, borderTop: `3px solid ${brand.color.gold}`, borderBottom: "1px solid rgba(16,37,27,.18)", color: brand.color.forestInk, fontSize: 20, lineHeight: 1.45, letterSpacing: ".14em", textTransform: "uppercase"}}>Illustration awaiting approval<br/><span style={{fontSize: 14, opacity: .62}}>Internal review placeholder</span></div></div>}
      {isPhoto && <div style={{position: "absolute", inset: 0, background: split ? "linear-gradient(90deg,rgba(16,37,27,.9) 0 48%,rgba(16,37,27,.08) 82%)" : `linear-gradient(180deg,rgba(16,37,27,.08) 24%,${bg} 82%)`}}/>}
      <MotionOverlay slot={scene.mediaSlot} frame={frame} duration={duration}/>
    </div>
    {!isPhoto && <><div style={{position: "absolute", right: -190, top: -190, width: 560, height: 560, borderRadius: "50%", border: `3px solid ${brand.color.gold}`, opacity: .16}}/><div style={{position: "absolute", left: 0, top: 0, bottom: 0, width: 14, background: brand.color.gold}}/></>}
    <div style={{position: "absolute", left: 82, right: 82, top: split ? 250 : isPhoto ? 700 : 1200, bottom: 150, display: "flex", flexDirection: "column", maxWidth: split ? 360 : undefined}}>
      <div style={{fontSize: 21, fontWeight: 700, letterSpacing: ".18em", color: dark || isPhoto ? brand.color.gold : brand.color.cranberry, opacity: enter, translate: `0 ${interpolate(enter, [0, 1], [34, 0])}px`}}>{scene.eyebrow}</div>
      <h1 style={{fontFamily: newsreader, fontWeight: 600, fontSize: split ? 84 : 104, lineHeight: .93, letterSpacing: "-.04em", margin: "34px 0 28px", opacity: enter, translate: `0 ${interpolate(enter, [0, 1], [46, 0])}px`}}>{scene.headline}</h1>
      <div style={{fontSize: split ? 34 : 41, lineHeight: 1.24, maxWidth: 890, opacity: interpolate(frame, [.16 * fps, .68 * fps], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(.16, 1, .3, 1)})}}>{scene.body}</div>
      {scene.annotation && <div style={{marginTop: 38, fontFamily: newsreader, fontSize: 44, color: brand.color.gold, opacity: enter}}>{scene.annotation}</div>}
      <div style={{marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 17, fontWeight: 700, letterSpacing: ".14em", width: split ? 916 : "auto"}}><span>DELICIOUSDUCK · FIELD NOTE</span><span>{String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}</span></div>
      <div style={{height: 4, background: dark || isPhoto ? "rgba(243,231,211,.25)" : "rgba(16,37,27,.18)", marginTop: 18, width: split ? 916 : "auto"}}><div style={{height: "100%", width: `${((index + 1) / count) * 100}%`, background: brand.color.gold}}/></div>
    </div>
  </AbsoluteFill>;
};

export const EditorialVideo: React.FC<{video: VideoSpec}> = ({video}) => {
  const per = Math.floor(video.durationInFrames / video.scenes.length);
  return <AbsoluteFill>{video.scenes.map((scene, index) => {const start = index * per; const duration = index === video.scenes.length - 1 ? video.durationInFrames - start : per; return <Sequence key={`${video.id}-${index}`} from={start} durationInFrames={duration} name={`Scene ${index + 1}`}><Scene scene={scene} index={index} count={video.scenes.length} duration={duration}/></Sequence>;})}</AbsoluteFill>;
};
