import React from "react";
import {Composition, Folder, Still} from "remotion";
import {EditorialStill} from "../visual/EditorialStill";
import {masterSpecs} from "../content/asset-specs";
import {EditorialVideo} from "./EditorialVideo";
import {videoSpecs} from "./content";

export const RemotionRoot:React.FC = ()=> <>
  <Still id="EditorialStill" component={EditorialStill} width={1080} height={1350} defaultProps={{spec:masterSpecs[0]!}} calculateMetadata={({props})=>({width:props.spec.width,height:props.spec.height})}/>
  <Folder name="Videos">
    {videoSpecs.map(video=><Composition key={video.id} id={video.id} component={EditorialVideo} width={1080} height={1920} fps={30} durationInFrames={video.durationInFrames} defaultProps={{video}} />)}
  </Folder>
</>;
