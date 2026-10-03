import {AU_KM,add, cross, mul, unit} from './solar-system.js';

// These stages illustrate a process, not a gravitational or hydrodynamic model.
// The positions and radii of the actual solar-system bodies remain in AU.
const smooth=(a,b,v)=>{const x=Math.max(0,Math.min(1,(v-a)/(b-a)));return x*x*(3-2*x);};
export const eventProgress=state=>Number.isFinite(state.eventProgress)?Math.max(0,Math.min(1,state.eventProgress)):1;
export const WHITE_DWARF_SHELL_AXES=Object.freeze([240,260,235]);
// Main C/B/A rings only. Distances are measured from Saturn's centre, in km.
// NASA NSSDCA: https://nssdc.gsfc.nasa.gov/planetary/factsheet/satringfact.html
export const SATURN_RINGS_KM=Object.freeze({inner:74658,bRing:91975,gapInner:117507,gapOuter:122340,outer:136780});
export function saturnRingProfile(body){
  if(!body?.hasRings||body.id!=='saturn'||!(body.radius>0))return null;
  const radiusKm=body.radius*AU_KM,tilt=body.axialTilt??.467;
  return {normal:[Math.sin(tilt),Math.cos(tilt),0],edges:[SATURN_RINGS_KM.inner,SATURN_RINGS_KM.bRing,SATURN_RINGS_KM.gapInner,SATURN_RINGS_KM.gapOuter].map(km=>km/radiusKm),outer:SATURN_RINGS_KM.outer/radiusKm};
}

export function eventVisuals(state,bodies){
  const progress=eventProgress(state),earth=bodies.find(body=>body.id==='earth');
  const visuals={progress,earth,extraBodies:[],impact:0,debris:0};
  if(state.era==='solar-nebula'){
    const anchor=bodies.find(body=>body.id==='belt-1');
    if(anchor&&progress>=.52&&progress<.78){
      const sunward=unit(mul(anchor.position,-1)),tangent=unit(cross(sunward,[0,1,0]));
      const incoming=unit(add(tangent,[0,.02,0])),merger=smooth(.68,.78,progress);
      const distance=anchor.radius*(3.5-1.8*smooth(.52,.68,progress)-.9*merger);
      const remaining=1-merger;
      if(remaining>.001)visuals.extraBodies.push({id:'accretion-model',name:'合体する微惑星の模型',position:add(anchor.position,mul(incoming,distance)),radius:anchor.radius*.7*remaining,appearance:10,rotation:progress*33,axialTilt:.24,irregular:1});
    }
    return visuals;
  }
  if(state.era!=='young-earth'||!earth)return visuals;
  // A Mars-size impactor approaches a tangent point on the young Earth. Its
  // later disappearance represents merger; it is not another surviving planet.
  const sunward=unit(mul(earth.position,-1)),tangent=unit(cross(sunward,[0,1,0]));
  const incoming=unit(add(add(mul(tangent,.92),mul(sunward,.35)),[0,.05,0]));
  const distance=earth.radius*(3.8-(3.8-1.53)*smooth(0,.32,progress));
  const remaining=1-smooth(.32,.43,progress);
  if(remaining>.001)visuals.extraBodies.push({id:'impact-model',name:'衝突天体の模型',position:add(earth.position,mul(incoming,distance)),radius:earth.radius*.53*remaining,appearance:12,rotation:progress*9,axialTilt:.3,irregular:0});
  visuals.impact=smooth(.29,.34,progress)*(1-smooth(.36,.54,progress));
  visuals.debris=smooth(.34,.53,progress)*(1-smooth(.80,1,progress));
  return visuals;
}
