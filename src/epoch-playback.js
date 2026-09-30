// The chosen epoch is a fixed research model. Only rotation and orbital clocks
// run during exploration; the teaching-event clock never advances by itself.
import {advanceWorld,normalizeSolar} from './solar-system.js';

export function defaultPlayback(){return {version:1,playing:true};}

export function normalizePlayback(value,legacyTour){
  const playing=typeof value?.playing==='boolean'?value.playing:legacyTour?.playing!==false;
  return {version:1,playing};
}

// Apply only to live worlds, never saved photographs or sample observations.
// The young-Earth scene now shows the fixed post-formation model; the separate
// research video explains the giant impact instead of replaying the old event.
export function fixedEpochWorld(world,{playing=true}={}){
  const next=normalizeSolar(world);
  next.eventPlaying=false;
  if(next.era==='young-earth')next.eventProgress=1;
  next.motion=playing?(next.motion==='paused'?'evolving':next.motion):'paused';
  return advanceWorld(next,0);
}
