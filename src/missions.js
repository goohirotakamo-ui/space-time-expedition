import {MISSIONS,MISSION_POOLS} from './content.js';

function variantsFor(pool){
  const variants=[];
  function add(slot,tasks,indices){
    if(slot===pool.taskChoices.length){
      const {taskChoices,...mission}=pool;
      variants.push(Object.freeze({...mission,variantId:`${pool.id}:${indices.join('-')}`,tasks:Object.freeze(tasks)}));
      return;
    }
    pool.taskChoices[slot].forEach((task,index)=>add(slot+1,[...tasks,Object.freeze({...task})],[...indices,index]));
  }
  add(0,[],[]);return Object.freeze(variants);
}
// Version 1 catalogue order is part of the saved assignment contract.
export const MISSION_VARIANTS=Object.freeze(MISSION_POOLS.map(variantsFor));
function newSeed(){
  if(globalThis.crypto?.getRandomValues){const value=new Uint32Array(1);globalThis.crypto.getRandomValues(value);return value[0];}
  return Math.floor(Math.random()*0x100000000);
}
function seededRandom(seed){
  let value=seed>>>0;
  return ()=>{value=(value+0x6D2B79F5)>>>0;let n=Math.imul(value^(value>>>15),1|value);n^=n+Math.imul(n^(n>>>7),61|n);return ((n^(n>>>14))>>>0)/0x100000000;};
}
export function createMissionAssignment(seed=newSeed()){
  if(!Number.isInteger(seed)||seed<0||seed>0xffffffff)throw new Error('調査ミッションの番号が正しくありません。');
  const random=seededRandom(seed);
  return {version:1,seed,variants:MISSION_VARIANTS.map(variants=>variants[Math.floor(random()*variants.length)].variantId)};
}
export function normalizeMissionAssignment(value){
  // An absent field is an old expedition. Never reroll unfinished or earned work.
  if(value===undefined||value?.version===0)return {version:0};
  if(!value||value.version!==1||!Number.isInteger(value.seed)||value.seed<0||value.seed>0xffffffff||!Array.isArray(value.variants)||value.variants.length!==MISSION_VARIANTS.length||!MISSION_VARIANTS.every((variants,index)=>variants.some(mission=>mission.variantId===value.variants[index])))throw new Error('調査ミッションの記録を読み込めません。');
  return {version:1,seed:value.seed,variants:[...value.variants]};
}
export function assignedMissions(assignment){
  if(!assignment||assignment.version===0)return MISSIONS;
  return MISSION_VARIANTS.map((variants,index)=>variants.find(mission=>mission.variantId===assignment.variants[index]));
}
