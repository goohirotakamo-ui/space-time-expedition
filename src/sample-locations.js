// Sampling zones are classroom observation areas, not sharp physical boundaries.
// Coordinates share the world's AU space. Availability depends only on the ship's
// position, so selecting a planet or turning the camera cannot collect remotely.
import {bodyById,approachPosition,add,sub,mul,unit,length,eraConfig,INNER_DISK_SAMPLE_DISTANCE_AU} from './solar-system.js';
import {eventStage} from './space-events.js';

function bodyLocation(world,{id,label,sampleId,scene,bodyId,description,distance=4,distanceAU,radiusAU}){
  const body=bodyById(bodyId,world);if(!body)return null;
  // Keep the observation area's offset stable as its body orbits. The flight
  // controller tracks a body by translation, not by rotating the observer too.
  const reference=bodyById(bodyId,{...world,simulationDays:0});
  const direction=unit(sub(approachPosition(reference),reference.position));
  const position=add(body.position,mul(direction,distanceAU??body.radius*distance));
  return {id,label,sampleId,scene,bodyId,description,position,radius:radiusAU??body.radius*1.15,lookAt:[...body.position]};
}
const defs={
  earth:[
    {id:'earth-orbit',label:'地球の観測点',sampleId:'earth-light',scene:'earth',bodyId:'earth',description:'海や雲のある地球を、上空から記録します。'},
    {id:'moon-orbit',label:'月の観測点',sampleId:'moon-light',scene:'earth',bodyId:'moon',description:'月の岩石の表面を光で調べ、地球の海や雲と比べます。'}
  ],
  sun:[
    {id:'sun-near',label:'太陽に近い観測点',sampleId:'sun-light',scene:'sun',bodyId:'sun',description:'太陽の光を装置で観測します。太陽そのものを採りません。'},
    {id:'sun-far',label:'太陽から離れた観測点',sampleId:'far-sun-light',scene:'sun',bodyId:'sun',distance:8,description:'同じ太陽を離れて観測し、届く光の強さを比べます。'}
  ],
  'solar-nebula':[
    {id:'disk-inner',label:'円盤の内側・ちりの調査点',sampleId:'stardust',scene:'solar-nebula',bodyId:'sun',distanceAU:INNER_DISK_SAMPLE_DISTANCE_AU,radiusAU:.08,description:'内側の円盤で、惑星の材料になる岩石や金属の粒を調べます。中心から約0.8 AUの代表地点です。粒が蒸発する境界を計算した位置ではありません。'},
    {id:'disk-outer',label:'円盤の外側・氷の調査点',sampleId:'ice',scene:'solar-nebula',bodyId:'jupiter',description:'冷たい外側の円盤には、岩石や金属の粒に加えて氷もあります。氷が存在できる境界は時期によって変わります。木星の大気から採る試料ではありません。'}
  ],
  'young-earth':[
    {id:'young-earth-rock',label:'若い地球の上空',sampleId:'rock',scene:'young-earth',bodyId:'earth',description:'冷えて固まった部分を模した岩石を、探査ドローンで回収します。'},
    {id:'young-earth-fragments',label:'地球の周辺・岩片の調査点',sampleId:'planet-fragments',scene:'young-earth',bodyId:'earth',distance:8,description:'地球の周辺に残る、惑星の材料となった小さな岩片を調べます。'}
  ],
  'red-giant':[
    {id:'giant-near',label:'赤色巨星に近い観測点',sampleId:'giant-light',scene:'red-giant',bodyId:'sun',description:'大きくふくらんだ太陽の色を、光で調べます。'},
    {id:'giant-far',label:'赤色巨星から離れた観測点',sampleId:'far-giant-light',scene:'red-giant',bodyId:'sun',distance:8,description:'離れた場所から同じ星を観測し、色と届く光の強さを比べます。'}
  ]
};

export function getSampleLocations(world={}){
  const era=eraConfig(world.era).id;
  if(era==='early-universe')return [
    {id:'ancient-light-a',label:'太古の光・観測点A',sampleId:'ancient-light',scene:era,bodyId:null,position:[0,0,0],radius:.000055,lookAt:[0,0,1],description:'まだ星のない宇宙の光を記録します。'},
    {id:'ancient-light-b',label:'太古の光・観測点B',sampleId:'ancient-light-b',scene:era,bodyId:null,position:[.00016,0,.00012],radius:.000055,lookAt:[1,0,.00012],description:'別の観測点からも似た光を記録し、宇宙がほぼ一様だったことを比べます。観測点の間隔は操作用の模型です。'}
  ];
  if(era==='white-dwarf')return [
    {id:'dwarf-overview',label:'白色矮星の観測点',sampleId:'dwarf-light',scene:era,bodyId:'sun',position:[0,40,680],radius:65,lookAt:[0,0,0],description:'中心に残る、小さく熱い白色矮星の光を記録します。'},
    {id:'dwarf-gas',label:'放出されたガスの観測点',sampleId:'nebula-light',scene:era,bodyId:null,position:[220,90,420],radius:65,lookAt:[0,0,0],description:'星の外層から広がったガスが出す光の模擬記録です。観測点の配置とガスの広がりは模型です。'}
  ];
  const entries=era==='present'?[...defs.earth,...defs.sun]:defs[era]||[];
  if(era==='solar-nebula'&&world.modelVersion!==1){
    // Ice belongs to the disk, including stages before Jupiter has formed.
    const sun=bodyById('sun',world),outer=defs['solar-nebula'][1];
    const position=add(sun.position,[Math.cos(4.5)*5.2,.06,Math.sin(4.5)*5.2]);
    return [bodyLocation(world,entries[0]),{...outer,bodyId:'sun',position,radius:.08,lookAt:[...sun.position]}];
  }
  return entries.map(def=>bodyLocation(world,def)).filter(Boolean);
}

export function getSamplingContext(world={}){
  const locations=getSampleLocations(world),position=world.position;
  const valid=Array.isArray(position)&&position.length===3&&position.every(Number.isFinite);
  const measured=locations.map(location=>({...location,distance:valid?length(sub(position,location.position)):Infinity}));
  // Keep sites resolvable for old saved records; gate only new observations.
  const phaseBlocked=world.era==='early-universe'&&eventStage(world.era,world.eventProgress).index<3;
  const phaseMessage=phaseBlocked?'この記録は約38万年後の晴れ上がりで採ります。「④ 晴れ上がり」を選ぶと採集できます。':'';
  const available=phaseBlocked?[]:measured.filter(location=>location.distance<=location.radius+Math.max(1e-12,location.radius*1e-9)).sort((a,b)=>a.distance-b.distance);
  const nearest=measured.reduce((best,location)=>!best||location.distance<best.distance?location:best,null);
  return {locations:measured,current:available[0]||null,nearest,distance:nearest?.distance??Infinity,available,phaseMessage};
}

// A saved identifier resolves to trusted content instead of imported free text.
// Older collections have no sampling field and remain readable without a site.
export function getRecordedSampleLocation(record){
  const sampling=record?.sampling;if(!sampling||typeof sampling!=='object')return null;
  return getSampleLocations({...sampling,modelVersion:sampling.modelVersion===2?2:1}).find(location=>location.id===sampling.siteId&&location.sampleId===record.id)||null;
}
