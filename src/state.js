import {SCENES,SAMPLES,COMPARISONS,sceneById} from './content.js';
import {defaultCamera,normalizeCamera} from './camera.js';
import {defaultSolar,normalizeSolar,visibleBody,solarPhotoName,bodyById} from './solar-system.js';
import {sampleParticleFields} from './sample-observation.js';
import {getSamplingContext,getRecordedSampleLocation} from './sample-locations.js';
import {defaultPlayback,normalizePlayback,fixedEpochWorld} from './epoch-playback.js';
import {freshUfoState,normalizeUfoState} from './ufo-encounter.js';
import {createMissionAssignment,normalizeMissionAssignment,assignedMissions} from './missions.js';
export const STORAGE_KEY = 'space-time-expedition-v1';
export const PHOTO_LIMIT = 60;
const photoLimitMessage = '写真は60枚までです。アルバムで不要な写真の詳細を開き、削除してから撮影してください。';
export const freshState = ({missionSeed}={}) => ({version:1,missionAssignment:createMissionAssignment(missionSeed),playback:defaultPlayback(),ufo:freshUfoState(),started:false,currentScene:'young-earth',camera:defaultCamera(),flightMode:'solar',whiteDwarfView:'explore',solar:defaultSolar(),historySolar:defaultSolar('young-earth'),observed:[],photos:[],samples:[],selected:[],titles:{},pdfCreated:false,activeMission:'origin',sound:false,reducedMotion:false,minutes:0});
// The live overview and free flight now use one world. Legacy artwork photographs
// still retain their image and camera, but are never used as a second live sky.
export const usesDwarfArtwork = () => false;
// Scene labels on older 3D records describe the flight mode, so classify their
// saved epoch and photographed subject without changing the original snapshot.
export function photoScene(photo) {
  if(!photo.solar)return photo.scene;
  const {era='present',subject}=photo.solar;
  if(era==='early-universe')return 'early-universe';
  if(['present','earth','sun'].includes(era)&&['earth','sun'].includes(subject))return subject;
  if(era==='young-earth'&&subject==='earth')return 'young-earth';
  if(['solar-nebula','red-giant','white-dwarf'].includes(era)&&subject==='sun')return era;
  return 'solar-system';
}
export const hasPhoto = (state, scene) => state.photos.some(p=>photoScene(p)===scene);
export const hasSample = (state, id) => state.samples.some(s=>s.id===id);
export function taskDone(state, task) {
  return task.type==='observe' ? state.observed.includes(task.scene) : task.type==='photo' ? hasPhoto(state,task.scene) : hasSample(state,task.sample);
}
export function missionProgress(state) {return assignedMissions(state.missionAssignment).map(m=>({...m, count:m.tasks.filter(t=>taskDone(state,t)).length, complete:m.tasks.every(t=>taskDone(state,t))}));}
export function rankIndex(state) {
  const n=missionProgress(state).filter(m=>m.complete).length;
  if(n===3 && state.pdfCreated) return 4;
  if(n===3) return 3;
  if(n>0) return 2;
  if(state.photos.length || state.samples.length) return 1;
  return 0;
}
export const unlockedComparisons = state => COMPARISONS.filter(c=>c.scenes.every(id=>hasPhoto(state,id)));
export function items(state) {
  return [
    ...state.photos.map(p=>({key:`photo:${p.id}`,kind:'photo',scene:photoScene(p),name:p.solar?solarPhotoName(p):sceneById(p.scene).name,created:p.created,record:p})),
    ...state.samples.map(s=>({key:`sample:${s.id}`,kind:'sample',scene:SAMPLES.find(x=>x.id===s.id).scene,name:SAMPLES.find(x=>x.id===s.id).name,created:s.created,record:s})),
    ...unlockedComparisons(state).map(c=>({key:`compare:${c.id}`,kind:'compare',scene:c.scenes[0],name:c.name,record:{...c,photos:c.scenes.map(id=>state.photos.find(p=>photoScene(p)===id))}}))
  ];
}
export function nextTask(state) {
  const progress=missionProgress(state);
  const current=progress.find(m=>m.id===state.activeMission && !m.complete) || progress.find(m=>!m.complete);
  return current ? {mission:current,task:current.tasks.find(t=>!taskDone(state,t))} : null;
}
// Import only known fields. User-controlled objects never become HTML or executable code.
export function validateState(input) {
  if(!input || typeof input!=='object' || input.version!==1) throw new Error('この探検データの形式には対応していません。');
  const state=freshState({missionSeed:0});
  state.missionAssignment=normalizeMissionAssignment(input.missionAssignment);
  if(!Array.isArray(input.photos)||!Array.isArray(input.samples)||!Array.isArray(input.observed)) throw new Error('探検データが壊れています。');
  // A genuinely unopened old save has no assigned or earned work to preserve.
  // Started games, rewards and every existing observation retain the old plan.
  if(input.missionAssignment===undefined&&input.started===false&&!input.pdfCreated&&!input.ufo?.reward&&!input.photos.length&&!input.samples.length&&!input.observed.length)state.missionAssignment=createMissionAssignment();
  if(input.photos.length>PHOTO_LIMIT || input.samples.length>30) throw new Error('記録の数が多すぎます。');
  const sceneIds=new Set(SCENES.map(s=>s.id)), sampleIds=new Set(SAMPLES.map(s=>s.id));
  if(!sceneIds.has(input.currentScene)) throw new Error('不明な行き先が含まれています。');
  state.currentScene=input.currentScene;
  state.playback=normalizePlayback(input.playback,input.tour);
  state.ufo=normalizeUfoState(input.ufo);
  state.camera=normalizeCamera(input.camera);
  state.flightMode=input.flightMode==='history'?'history':'solar';
  state.whiteDwarfView='explore';
  state.solar=fixedEpochWorld({...input.solar,modelVersion:2},{playing:false});
  state.historySolar=fixedEpochWorld(input.historySolar?{...input.historySolar,era:state.currentScene,modelVersion:2}:defaultSolar(state.currentScene),{playing:false});
  if(state.currentScene==='white-dwarf'&&(input.whiteDwarfView!=='explore'||!Number.isFinite(input.historySolar?.eventProgress))){
    const overview=defaultSolar('white-dwarf');
    state.historySolar={...state.historySolar,position:overview.position,orientation:overview.orientation,target:'sun'};
  }
  const seenIds=new Set();
  state.photos=input.photos.map(p=>{
    if(!p || typeof p.id!=='string'||!/^p-[a-zA-Z0-9-]{1,80}$/.test(p.id)||seenIds.has(p.id)||(!sceneIds.has(p.scene)&&p.scene!=='solar-system')) throw new Error('写真の記録を読み込めません。');
    seenIds.add(p.id);
    if(p.scene==='solar-system'||p.solar){
      const v=p.solar;
      if(!v||v.version!==1||!Array.isArray(v.position)||v.position.length!==3||!v.position.every(n=>Number.isFinite(n)&&Math.abs(n)<=1000)||!Array.isArray(v.orientation)||v.orientation.length!==4||!v.orientation.every(Number.isFinite)||Math.hypot(...v.orientation)<1e-8)throw new Error('3D写真の記録を読み込めません。');
      const saved={...v,modelVersion:v.modelVersion===2?2:1,colorMode:v.colorMode==='natural'?'natural':'enhanced'};
      const ufo=saved.ufo?.encounter?normalizeUfoState(saved.ufo):null;
      return {id:p.id,scene:p.scene,created:validDate(p.created),solar:{...normalizeSolar(saved),subject:bodyById(saved.subject,saved)?.id||null,...(v.observationVersion===1?{observationVersion:1}:{}),...(ufo?.encounter&&ufo.encounter.era===saved.era?{ufo}:{})}};
    }
    return {id:p.id,scene:p.scene,created:validDate(p.created),...(p.camera?{camera:normalizeCamera(p.camera)}:{})};
  });
  const seenSamples=new Set();
  state.samples=input.samples.map(s=>{
    if(!s || !sampleIds.has(s.id)||seenSamples.has(s.id)) throw new Error('サンプルの記録を読み込めません。');
    seenSamples.add(s.id);
    const record={id:s.id,created:validDate(s.created)};
    if(s.sampling){
      const p=s.sampling;
      if(!['present',...sceneIds].includes(p.era)||typeof p.siteId!=='string'||!Array.isArray(p.position)||p.position.length!==3||!p.position.every(n=>Number.isFinite(n)&&Math.abs(n)<=1000)||!Number.isFinite(p.simulationDays)||p.simulationDays<0||p.simulationDays>1e9||!Number.isFinite(p.eventProgress)||p.eventProgress<0||p.eventProgress>1)throw new Error('採集地点の記録を読み込めません。');
      record.sampling={siteId:p.siteId,era:p.era,position:[...p.position],simulationDays:p.simulationDays,rotationDaysElapsed:Number.isFinite(p.rotationDaysElapsed)?Math.max(0,Math.min(1e9,p.rotationDaysElapsed)):p.simulationDays,eventProgress:p.eventProgress,...sampleParticleFields(p)};
      record.sampling.modelVersion=p.modelVersion===2?2:1;
      record.sampling.colorMode=p.colorMode==='natural'?'natural':'enhanced';
      if(p.observationVersion===1)record.sampling.observationVersion=1;
      if(!getRecordedSampleLocation(record))throw new Error('不明な採集地点が含まれています。');
    }
    return record;
  });
  if(input.observed.some(x=>!sceneIds.has(x))) throw new Error('観測地点の記録を読み込めません。');
  state.observed=[...new Set(input.observed)];
  state.started=!!input.started; state.pdfCreated=!!input.pdfCreated; state.sound=!!input.sound; state.reducedMotion=!!input.reducedMotion;
  if(state.reducedMotion)state.playback.playing=false;
  state.activeMission=assignedMissions(state.missionAssignment).some(m=>m.id===input.activeMission)?input.activeMission:'origin';
  state.minutes=Number.isFinite(input.minutes)?Math.min(1440,Math.max(0,Math.floor(input.minutes))):0;
  const keys=new Set(items(state).map(x=>x.key));
  state.selected=Array.isArray(input.selected)?[...new Set(input.selected.filter(k=>keys.has(k)))].slice(0,20):[];
  state.titles={};
  for(const [key,value] of Object.entries(input.titles||{})) if(keys.has(key)&&typeof value==='string') state.titles[key]=value.slice(0,32);
  return state;
}
function validDate(value) { if(typeof value!=='string'||!Number.isFinite(Date.parse(value))) throw new Error('記録の日付が正しくありません。'); return new Date(value).toISOString(); }
export function recordPhoto(state,id) {
  if(state.photos.length>=PHOTO_LIMIT) throw new Error(photoLimitMessage);
  state.photos.push({id,scene:state.currentScene,created:new Date().toISOString(),camera:normalizeCamera(state.camera)});
}
export function recordSolarPhoto(state,id){
  if(state.photos.length>=PHOTO_LIMIT)throw new Error(photoLimitMessage);
  const snapshot={...normalizeSolar({...state.solar,motion:'paused',eventPlaying:false}),observationVersion:1};
  state.photos.push({id,scene:'solar-system',created:new Date().toISOString(),solar:{...snapshot,subject:visibleBody(snapshot)?.id||null}});
}
export function isSceneSubject(scene,snapshot){
  return photoScene({solar:{...snapshot,subject:visibleBody(snapshot)?.id||null}})===scene;
}
export function recordWorldPhoto(state,id){
  if(state.flightMode==='solar'){recordSolarPhoto(state,id);return;}
  if(state.photos.length>=PHOTO_LIMIT)throw new Error(photoLimitMessage);
  const snapshot={...normalizeSolar({...state.historySolar,motion:'paused',eventPlaying:false}),observationVersion:1},scene=isSceneSubject(state.currentScene,snapshot)?state.currentScene:'solar-system';
  state.photos.push({id,scene,created:new Date().toISOString(),solar:{...snapshot,subject:visibleBody(snapshot)?.id||null}});
}
export function removePhoto(state,id){
  const index=state.photos.findIndex(photo=>photo.id===id);
  if(index<0)return false;
  state.photos.splice(index,1);
  // A comparison remains available if another photograph of the same era exists.
  const remainingKeys=new Set(items(state).map(item=>item.key));
  state.selected=state.selected.filter(key=>remainingKeys.has(key));
  for(const key of Object.keys(state.titles))if(!remainingKeys.has(key))delete state.titles[key];
  return true;
}
export function recordSample(state,id) {
  const sample=SAMPLES.find(s=>s.id===id);
  const world=state.flightMode==='solar'?state.solar:state.historySolar;
  const context=getSamplingContext(world);
  if(context.phaseMessage)throw new Error(context.phaseMessage);
  const site=context.available.find(location=>location.sampleId===id);
  if(!sample||!site) throw new Error('この場所では採集できません。調査地点へ移動してください。');
  if(!hasSample(state,id))state.samples.push({id,created:new Date().toISOString(),sampling:{siteId:site.id,era:world.era,position:[...world.position],simulationDays:world.simulationDays||0,rotationDaysElapsed:world.rotationDaysElapsed||0,eventProgress:world.eventProgress??1,modelVersion:world.modelVersion??2,colorMode:world.colorMode||'natural',observationVersion:1,...sampleParticleFields(world)}});
}
