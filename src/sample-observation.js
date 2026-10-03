import {defaultSolar,lookAt,sub} from './solar-system.js';
import {getRecordedSampleLocation} from './sample-locations.js';

// Particle animation has its own clock. Missing fields mean the older sky,
// never the latest live default; use the same bounded values at every boundary.
export function sampleParticleFields(world={}){
  if(world.era!=='early-universe')return {};
  return {particleModelVersion:[1,2].includes(world.particleModelVersion)?world.particleModelVersion:0,
    particleSeconds:Number.isFinite(world.particleSeconds)&&world.particleSeconds>=0?Math.min(1e6,world.particleSeconds):0,
    lightStyle:['wave','beam'].includes(world.lightStyle)?world.lightStyle:'packet'};
}

// Point the instrument at its subject, while preserving the collection position
// and clocks. Turning the ship away does not turn a Moon observation into Earth.
export function sampleObservation(record){
  const site=getRecordedSampleLocation(record);if(!site)return null;
  const s=record.sampling;
  return {...defaultSolar(s.era),...sampleParticleFields(s),modelVersion:s.modelVersion===2?2:1,colorMode:s.colorMode==='natural'?'natural':'enhanced',observationVersion:s.observationVersion,position:[...s.position],simulationDays:s.simulationDays,
    rotationDaysElapsed:s.rotationDaysElapsed??s.simulationDays,eventProgress:s.eventProgress,
    orientation:lookAt(sub(site.lookAt,s.position)),target:site.bodyId,subject:site.bodyId,
    motion:'paused',eventPlaying:false};
}
