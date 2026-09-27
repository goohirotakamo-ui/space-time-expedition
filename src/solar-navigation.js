import {bodyById,sub,add,mul,unit,length,cross,safeMove,safeRadius,lookAt} from './solar-system.js';

// Plan only when the destination changes or automatic flight starts. Every leg
// is checked against every current body, including the moon the ship leaves.
export function findSafeWaypoint(state){
  const target=bodyById(state.target,state);if(!target)return {waypoint:null,blocked:null};
  const delta=sub(target.position,state.position),hit=safeMove(state.position,delta,state);
  const obstacle=bodyById(hit.collision,state);
  if(!obstacle||obstacle.id===target.id)return {waypoint:null,blocked:null};
  const forward=unit(delta),side=unit(cross(forward,Math.abs(forward[1])<.9?[0,1,0]:[1,0,0]));
  const other=unit(cross(forward,side)),outward=unit(sub(state.position,obstacle.position));
  const factors=[4,8,16],parent=obstacle.parent&&obstacle.parent!=='sun'?bodyById(obstacle.parent,state):null;
  // A tiny moon may hide its much larger planet immediately behind it. Include
  // a planet-scale detour while retaining the same collision checks on both legs.
  if(parent){const planetFactor=safeRadius(parent)*2/safeRadius(obstacle);if(planetFactor>16)factors.push(planetFactor);}
  let best=null,bestDistance=Infinity;
  for(const factor of factors)for(const perpendicular of [side,mul(side,-1),other,mul(other,-1)])for(const bias of [0,1]){
    const point=add(obstacle.position,mul(add(perpendicular,mul(outward,bias)),safeRadius(obstacle)*factor));
    const first=safeMove(state.position,sub(point,state.position),state);if(first.collision)continue;
    const second=safeMove(point,sub(target.position,point),state);if(second.collision&&second.collision!==target.id)continue;
    const distance=length(sub(point,state.position))+length(sub(target.position,point));
    if(distance<bestDistance){best=point;bestDistance=distance;}
  }
  return {waypoint:best,blocked:best?null:obstacle.id};
}

export function cometOverviewPose(state){
  const comet=bodyById(state.target,state);if(comet?.kind!=='comet')return null;
  const away=comet.tailDirection||unit(comet.position);
  const side=unit(cross(away,Math.abs(away[1])<.9?[0,1,0]:[1,0,0]));
  const tailLength=Math.min(.14,.16/Math.max(.5,length(comet.position)**2));
  const center=add(comet.position,mul(away,tailLength*.32));
  const position=add(center,mul(side,Math.max(.025,tailLength*1.5)));
  return {position,orientation:lookAt(sub(center,position))};
}
