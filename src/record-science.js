import {PARTICLE_STAGES,particleStage,isParticleView} from './early-universe-particles.js';
import {sceneById} from './content.js';
import {eventStage} from './space-events.js';
import {formationStage} from './formation-model.js';
import {visualProfile} from './visual-science.js';
import {observeWorld} from './observations.js';
import {sampleObservation} from './sample-observation.js';

// Records reconstruct their own model, clock, position and display mode. Never
// borrow the live ship's current settings for a collection item or PDF page.
export function recordScience(record){
  const world=record?.solar||sampleObservation(record);
  if(!world)return null;
  const formation=formationStage(world),event=eventStage(world.era,world.eventProgress);
  const scene=sceneById(world.era==='present'?'earth':world.era);
  const particle=isParticleView(world)?PARTICLE_STAGES[particleStage(world)]:null;
  const age=particle?.age||formation?.ageLabel||(world.era==='early-universe'&&event?.index<3?'約138億年前・晴れ上がりより前':scene.era);
  const stage=particle?.title||(world.era==='solar-nebula'?formation.label:event?.label||'現在の太陽系');
  const visual=visualProfile(world);
  const observation=world.observationVersion===1?observeWorld(world):null;
  return {world,age,stage,visual,observation,legacy:world.modelVersion===1};
}
export function recordScienceLines(record){
  const science=recordScience(record);if(!science)return [];
  return [
    `年代：${science.age}`,
    `段階：${science.stage}`,
    `表示：${science.visual.colorLabel} ／ ${science.visual.backgroundLabel}`,
    ...(science.observation?science.observation.summaryLines:['観測値：この旧記録では保存していません。'])
  ];
}
