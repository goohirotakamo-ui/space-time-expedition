// A fictional game encounter, stored separately from scientific observations.
import {eraConfig,bodyById,nearestBody,getBodies,basis,add,sub,mul,dot,unit,length,speedAU,safeMove,safeRadius} from './solar-system.js';

export const UFO_CHANCE=.1;
export const UFO_ITEM_NAME='星のともだちの証';
export const UFO_DEPARTURE_SECONDS=4;
const REWARD_ID='cosmic-friend',GREETING_SECONDS=3;
const DEPARTURE_HATCH_SECONDS=.7,DEPARTURE_RADII=600;
// Validate identity without assuming an epoch's final stage. Runtime placement
// checks the actual saved world, where a planet may not yet exist or may vanish.
const KNOWN_ANCHORS=new Set(getBodies().map(body=>body.id));
const validEra=value=>typeof value==='string'&&eraConfig(value).id===value;
const finiteVector=value=>Array.isArray(value)&&value.length===3&&value.every(n=>Number.isFinite(n)&&Math.abs(n)<=2000);
export const freshUfoState=()=>({lastEra:null,encounter:null,reward:null});

export function normalizeUfoState(value){
  const state=freshUfoState();if(!value||typeof value!=='object')return state;
  state.lastEra=validEra(value.lastEra)?value.lastEra:null;
  const reward=value.reward;
  if(reward?.id===REWARD_ID&&validEra(reward.era)&&reward.era!=='early-universe'&&typeof reward.created==='string'&&reward.created.length<=60&&Number.isFinite(Date.parse(reward.created))){
    state.reward={id:REWARD_ID,name:UFO_ITEM_NAME,created:new Date(reward.created).toISOString(),era:reward.era};
  }
  const e=value.encounter;
  if(e&&validEra(e.era)&&e.era!=='early-universe'&&e.era===state.lastEra&&KNOWN_ANCHORS.has(e.anchorId)&&finiteVector(e.offset)&&Number.isFinite(e.radius)&&e.radius>0&&e.radius<=100&&['waiting','greeting','received','departing'].includes(e.phase)){
    const seconds=Number.isFinite(e.progressSeconds)?Math.max(0,Math.min(GREETING_SECONDS,e.progressSeconds)):0;
    const validDeparture=e.phase!=='departing'||finiteVector(e.departureDirection)&&length(e.departureDirection)>1e-8;
    if(validDeparture&&(!['received','departing'].includes(e.phase)||state.reward)){
      state.encounter={era:e.era,anchorId:e.anchorId,offset:[...e.offset],radius:e.radius,phase:e.phase,progressSeconds:e.phase==='waiting'?0:seconds};
      if(e.phase==='departing')Object.assign(state.encounter,{
        departureSeconds:Number.isFinite(e.departureSeconds)?Math.max(0,Math.min(UFO_DEPARTURE_SECONDS,e.departureSeconds)):0,
        departureDirection:Math.abs(length(e.departureDirection)-1)<1e-12?[...e.departureDirection]:unit(e.departureDirection),
        departureReducedMotion:e.departureReducedMotion===true
      });
    }
    if(state.reward&&state.encounter){if(state.reward.era!==e.era)state.encounter=null;else if(state.encounter.phase!=='departing')state.encounter.phase='received';}
  }
  return state;
}

function spawnEncounter(world){
  const anchor=bodyById(world.target,world)||nearestBody(world.position,world);if(!anchor)return null;
  const view=basis(world.orientation),aspect=Number.isFinite(world.aspect)?Math.max(.5,Math.min(6,world.aspect)):16/9;
  const initialDistance=speedAU({...world,speed:'inspect'})*2.4,bodies=getBodies(world);
  // Framing scales with the nearby world; UFO dimensions are gameplay artwork,
  // never physical measurements. Try nearby alternatives if another body hides it.
  for(const fraction of [1,.75,.5])for(const side of [1,-1])for(const height of [1,-1]){
    const distance=initialDistance*fraction,radius=distance*.08*.532*aspect;
    if(!(radius>0)||radius>100)continue;
    const position=add(world.position,add(mul(view.forward,distance),add(mul(view.right,radius*.9*side),mul(view.up,radius*.25*height))));
    if(position.some(n=>Math.abs(n)>1000)||bodies.some(body=>length(sub(position,body.position))<safeRadius(body)+radius))continue;
    if(safeMove(world.position,sub(position,world.position),world).collision)continue;
    return {era:world.era,anchorId:anchor.id,offset:sub(position,anchor.position),radius,phase:'waiting',progressSeconds:0};
  }
  return null;
}

export function startUfoVisit(ufo,world,random=Math.random){
  if(world&&ufo?.lastEra===world.era)return ufo;
  const state=normalizeUfoState(ufo);if(!world||!validEra(world.era))return ufo&&typeof ufo==='object'?ufo:state;
  state.lastEra=world.era;state.encounter=null;
  if(state.reward||world.era==='early-universe')return state;
  const draw=random();
  if(Number.isFinite(draw)&&draw>=0&&draw<UFO_CHANCE)state.encounter=spawnEncounter(world);
  return state;
}

export function ufoPosition(encounter,world){
  if(!encounter||encounter.era!==world?.era||!finiteVector(encounter.offset))return null;
  const anchor=bodyById(encounter.anchorId,world);if(!anchor)return null;
  const origin=add(anchor.position,encounter.offset);
  if(encounter.phase!=='departing'||encounter.departureReducedMotion)return origin;
  if(!finiteVector(encounter.departureDirection)||!Number.isFinite(encounter.radius))return null;
  const t=Number.isFinite(encounter.departureSeconds)?Math.max(0,Math.min(UFO_DEPARTURE_SECONDS,encounter.departureSeconds)):0;
  const progress=Math.max(0,(t-DEPARTURE_HATCH_SECONDS)/(UFO_DEPARTURE_SECONDS-DEPARTURE_HATCH_SECONDS));
  return add(origin,mul(encounter.departureDirection,encounter.radius*DEPARTURE_RADII*progress**2));
}

function departureDirection(encounter,world,position){
  const view=basis(world.orientation),distance=encounter.radius*DEPARTURE_RADII,bodies=getBodies(world);
  // Depart beyond the ship's navigable boundary if needed, but never through a
  // body's safety shell. Expand the clearance by the visitor's own radius.
  for(const [side,rise] of [[.6,.4],[-.6,.4],[.6,.8],[-.6,.8],[1.2,.8],[-1.2,.8],[2,1.5],[-2,1.5]]){
    const direction=unit(add(view.forward,add(mul(view.right,side),mul(view.up,rise))));
    const clear=bodies.every(body=>{
      const center=sub(body.position,position),along=Math.max(0,Math.min(distance,dot(center,direction)));
      return length(sub(center,mul(direction,along)))>=safeRadius(body)+encounter.radius;
    });
    if(clear)return direction;
  }
  return null;
}

export function advanceUfoEncounter(ufo,world,dt,{blocked=false,reducedMotion=false}={}){
  const state=normalizeUfoState(ufo),e=state.encounter,unchanged=ufo&&typeof ufo==='object'?ufo:state;
  if(blocked||!e||e.era!==world?.era||!finiteVector(world?.position))return unchanged;
  const position=ufoPosition(e,world);
  if(!position){if(state.reward){state.encounter=null;return state;}return unchanged;}
  const elapsed=Number.isFinite(dt)?Math.max(0,Math.min(1,dt)):0;
  if(state.reward){
    if(e.phase==='received'){
      const direction=departureDirection(e,world,position);
      state.encounter={...e,phase:'departing',departureSeconds:0,departureDirection:direction||unit(basis(world.orientation).forward),departureReducedMotion:reducedMotion||!direction};
      return state;
    }
    if(e.phase==='departing'){
      const departureSeconds=Math.min(UFO_DEPARTURE_SECONDS,e.departureSeconds+elapsed*(e.departureReducedMotion?10:1));
      if(departureSeconds>=UFO_DEPARTURE_SECONDS){state.encounter=null;return state;}
      if(!elapsed)return unchanged;
      state.encounter={...e,departureSeconds};return state;
    }
    return unchanged;
  }
  // Looking is insufficient: the ship must actually approach. Three radii also
  // keep the original spawn outside the trigger even in a very wide window.
  if(length(sub(world.position,position))>e.radius*3)return unchanged;
  if(e.phase==='waiting'){state.encounter={...e,phase:'greeting',progressSeconds:0};return state;}
  if(!elapsed)return unchanged;
  const duration=reducedMotion?.25:GREETING_SECONDS,progressSeconds=Math.min(duration,e.progressSeconds+elapsed);
  state.encounter={...e,progressSeconds};
  if(progressSeconds>=duration){state.encounter.phase='received';state.reward={id:REWARD_ID,name:UFO_ITEM_NAME,created:new Date().toISOString(),era:e.era};}
  return state;
}
