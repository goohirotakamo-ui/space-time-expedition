// AU positions and physical radii; phases, circular planetary orbits and ancient /
// future systems are teaching models, not a dated ephemeris. Sources and limits:
// docs/world-model.md (NASA/NSSDC planetary and satellite fact sheets).
export const AU_KM = 149597870.7;
export const LIGHT_KM_S = 299792.458;
export const LIGHT_AU_S = LIGHT_KM_S / AU_KM;
export const SOLAR_BODIES = [
  ['sun','太陽',0,696340,0,'#ffd683','恒星。自ら光と熱を出しています。'],
  ['mercury','水星',.387,2439.4,.3,'#aa9b8b','太陽にいちばん近い惑星。表面には多くのクレーターがあります。'],
  ['venus','金星',.723,6051.8,1.15,'#e3bd80','厚い大気と雲に覆われた、表面がとても熱い惑星です。'],
  ['earth','地球',1,6371,2.1,'#57ade3','海と大気があり、私たちが暮らす惑星です。'],
  ['mars','火星',1.524,3389.5,3.2,'#d28257','表面が赤っぽく見える岩石の惑星です。'],
  ['jupiter','木星',5.203,69911,4.5,'#dfb586','太陽系で最も大きな惑星。主に水素とヘリウムでできています。'],
  ['saturn','土星',9.537,58232,5.3,'#e2cc92','氷や岩の粒からなる大きな環が目立つ惑星です。'],
  ['uranus','天王星',19.19,25362,1.5,'#95dcdf','青緑色の惑星。自転軸が大きく傾いています。'],
  ['neptune','海王星',30.07,24622,3.7,'#638eea','8つの惑星のうち、太陽から最も遠い惑星です。']
].map(([id,name,orbit,radiusKm,phase,color,fact],index)=>({id,name,orbit,radiusKm,radius:radiusKm/AU_KM,phase,color,fact,index,appearance:index,kind:index?'planet':'star',parent:index?'sun':null,
  position:[Math.cos(phase)*orbit,0,Math.sin(phase)*orbit],source:`https://science.nasa.gov/${id}/facts/`}));
const TAU=Math.PI*2,DEG=Math.PI/180;
const PERIODS={sun:[0,25.38,7.25],mercury:[87.969,58.646,.034],venus:[224.701,-243.025,177.4],earth:[365.256,.99726968,23.44],mars:[686.98,1.025957,25.19],jupiter:[4332.59,.41354,3.13],saturn:[10759.22,.444,26.73],uranus:[30688.5,-.71833,97.77],neptune:[60182,.67125,28.32]};
for(const b of SOLAR_BODIES){const [orbitDays,rotationDays,obliquityDegrees]=PERIODS[b.id];Object.assign(b,{orbitDays,rotationDays,obliquityDegrees,axialTilt:obliquityDegrees*DEG,rotation:0,spin:0,tilt:obliquityDegrees*DEG});}
const MOONS=[
  ['moon','月','earth',384400,1737.4,27.321661,.8,9,'#b8b6af','地球の衛星。自転と公転の周期がほぼ同じで、地球にはほぼ同じ面を向けます。'],
  ['io','イオ','jupiter',421800,1821.5,1.769138,.4,10,'#c7b572','木星の衛星。火山活動が活発で、表面には硫黄などが見られます。'],
  ['europa','エウロパ','jupiter',671100,1560.8,3.551181,2.5,11,'#d5c3a2','木星の衛星。表面を氷が覆い、筋のような模様があります。'],
  ['ganymede','ガニメデ','jupiter',1070400,2631.2,7.154553,4.6,11,'#a59b8a','木星の衛星。太陽系で最も大きい衛星で、水星より直径が大きい天体です。'],
  ['titan','タイタン','saturn',1221870,2574.7,15.945421,2.2,2,'#c89c56','土星の衛星。厚い大気があり、オレンジ色のもやに包まれています。'],
  ['phobos','フォボス','mars',9378,11.3,.31891,1.2,10,'#a19990','火星の内側の衛星。不規則な形をしていて、火星の自転より短い周期で公転します。'],
  ['deimos','ダイモス','mars',23459,6.2,1.26244,4.1,10,'#b9aa94','火星の外側の衛星。フォボスより小さく、表面はちりで覆われています。'],
  ['callisto','カリスト','jupiter',1882700,2410.3,16.689017,1.8,9,'#a9a599','ガリレオが見つけた木星の4衛星のひとつ。表面にはたくさんのクレーターがあります。']
].map(([id,name,parent,distanceKm,radiusKm,orbitDays,phase,appearance,color,fact],i)=>({id,name,parent,orbit:distanceKm/AU_KM,radiusKm,radius:radiusKm/AU_KM,orbitDays,rotationDays:orbitDays,phase,appearance,color,fact,index:9+i,kind:'moon',irregular:['phobos','deimos'].includes(id)?1:0,tidallyLocked:true,obliquityDegrees:0,axialTilt:0,source:parent==='earth'?'https://science.nasa.gov/moon/facts/':`https://nssdc.gsfc.nasa.gov/planetary/factsheet/${parent==='jupiter'?'joviansatfact':parent==='saturn'?'saturniansatfact':'marsfact'}.html`}));
const SMALL_BODIES=[
  {id:'ceres',name:'ケレス',orbit:2.77,radiusKm:469.7,orbitDays:1680.5,rotationDays:.3781,phase:2.6,appearance:9,kind:'dwarf-planet',color:'#a5a299',fact:'小惑星帯にある準惑星。ほぼ球形で、表面には明るい塩の堆積物もあります。',source:'https://science.nasa.gov/dwarf-planets/ceres/facts/'},
  {id:'vesta',name:'ベスタ',orbit:2.36,radiusKm:262.7,orbitDays:1325.8,rotationDays:.22259,phase:3.8,appearance:10,kind:'asteroid',irregular:1,color:'#9b9287',fact:'小惑星帯にある大きな小惑星。表面には衝突による大きなくぼみがあります。',source:'https://science.nasa.gov/solar-system/asteroids/4-vesta/'},
  {id:'halley',name:'ハレー彗星',orbit:17.8,radiusKm:5.5,orbitDays:76.1*365.25,rotationDays:2.2,phase:.6,eccentricity:.967,inclination:162.3*DEG,appearance:10,kind:'comet',irregular:2,color:'#747577',fact:'氷や岩・ちりを含む彗星。細長い軌道を約76年で巡り、太陽に近づくと尾が発達します。',source:'https://science.nasa.gov/solar-system/comets/1p-halley/'},
  {id:'pluto',name:'冥王星',orbit:39.48,radiusKm:1188.3,orbitDays:90560,rotationDays:-6.3872,phase:2.9,eccentricity:.2488,inclination:17.16*DEG,obliquityDegrees:119.6,appearance:11,kind:'dwarf-planet',color:'#bcae9f',fact:'海王星より外側の天体のひとつで、準惑星に分類されます。細長く傾いた軌道を約248年で巡ります。',source:'https://science.nasa.gov/dwarf-planets/pluto/facts/'},
  {id:'itokawa',name:'イトカワ',orbit:1.324,radiusKm:.162,orbitDays:556.4,rotationDays:.5056,phase:5.8,eccentricity:.28,inclination:1.62*DEG,obliquityDegrees:178,appearance:10,kind:'asteroid',irregular:2,color:'#a79e8e',fact:'日本の探査機「はやぶさ」が試料を持ち帰った小惑星。小さな岩や砂が集まった、細長い天体です。',source:'https://science.nasa.gov/solar-system/asteroids/25143-itokawa/'}
].map((b,i)=>({...b,index:17+i,parent:'sun',radius:b.radiusKm/AU_KM,obliquityDegrees:b.obliquityDegrees||0,axialTilt:(b.obliquityDegrees||0)*DEG}));
// Two navigable examples, not a packed wall of rocks. The belt's many other small
// bodies are omitted to keep the classroom scene light, never enlarged here.
const BELT_BODIES=Array.from({length:2},(_,i)=>{const orbit=2.15+i*.8,radiusKm=12+i*3;return {id:`belt-${i+1}`,name:`小惑星帯の岩 ${i+1}`,index:22+i,parent:'sun',orbit,radiusKm,radius:radiusKm/AU_KM,orbitDays:365.256*orbit**1.5,rotationDays:.31+i*.027,phase:.5+i*2.047,appearance:10,kind:'asteroid',irregular:1,color:'#8a837d',obliquityDegrees:20+i*9,axialTilt:(20+i*9)*DEG,representative:true,fact:'火星と木星の間の小惑星帯を表す岩の模型です。実在する特定の小惑星ではありません。',source:'https://science.nasa.gov/solar-system/asteroids/facts/'};});
export const MOTION_RATES=Object.freeze({paused:0,rotation:.25,orbit:20});
const ERAS={
  present:{label:'現在の太陽系',defaultTarget:'earth',note:'配置は模式図です。惑星は円軌道、彗星は細長い楕円軌道で、公転周期の違いを再現します。'},
  earth:{label:'現在の地球と太陽系',defaultTarget:'earth',note:'惑星・衛星・小惑星・彗星を調べます。軌道の配置は特定の日付を表しません。'},
  sun:{label:'現在の太陽と太陽系',defaultTarget:'sun',note:'自ら光る太陽と、その光を反射する惑星を比べます。軌道の配置は模式図です。'},
  'early-universe':{label:'宇宙の晴れ上がり',defaultTarget:null,note:'宇宙誕生から約38万年後、原子ができて光が進みやすくなったころの想像図です。まだ恒星・銀河・太陽系はありません。宇宙の外側から見た景色ではありません。'},
  'solar-nebula':{label:'太陽系が生まれるころ',defaultTarget:'sun',note:'約46億年前の想像図。原始太陽のまわりでガスやちり、微惑星が集まります。原始惑星の位置・大きさは発達途中を表す模型です。'},
  'young-earth':{label:'地球が生まれたころ',defaultTarget:'earth',note:'地球形成後の高温の表面と、巨大衝突後に月が形成された段階を表す想像図です。月の距離・天体の配置や速さは説明用の模型です。'},
  'red-giant':{label:'赤色巨星になった太陽',defaultTarget:'sun',note:'太陽がふくらんだ段階の想像図です。水星・金星は取り込まれ、地球の運命も不確かなため表示していません。半径・外側の軌道や衛星の存続は説明用です。'},
  'white-dwarf':{label:'白色矮星になった太陽',defaultTarget:'sun',note:'太陽が外層を放出した後の想像図です。中心には地球ほどの大きさの白色矮星が残ります。残る惑星や軌道・衛星は確定した未来予測ではありません。'}
};
export function eraConfig(era='present'){const id=Object.hasOwn(ERAS,era)?era:'present';return {...ERAS[id],id};}
function positiveDays(value){return Number.isFinite(value)&&value>=0?Math.min(value,1e9):0;}
function phaseAt(body,days){return body.phase-(body.orbitDays?TAU*((days/body.orbitDays)%1):0);}
function orbitalOffset(body,days){
  if(body.eccentricity){
    // Solve E-e*sin(E)=M: the Sun is at a focus and motion is faster near perihelion.
    const M=TAU*((days/body.orbitDays)%1),e=body.eccentricity;
    let E=M<Math.PI?Math.PI/2:Math.PI*1.5;
    for(let i=0;i<18;i++)E-=(E-e*Math.sin(E)-M)/(1-e*Math.cos(E));
    const x=body.orbit*(Math.cos(E)-e),z=-body.orbit*Math.sqrt(1-e*e)*Math.sin(E),c=Math.cos(body.phase),s=Math.sin(body.phase),inclination=body.inclination;
    return [x*c-z*Math.cos(inclination)*s,z*Math.sin(inclination),x*s+z*Math.cos(inclination)*c];
  }
  const p=phaseAt(body,days);return [Math.cos(p)*body.orbit,0,Math.sin(p)*body.orbit];
}
export function getBodies(state={}){
  const era=eraConfig(state.era).id;if(era==='early-universe')return [];
  const days=positiveDays(state.simulationDays),rotationDays=positiveDays(state.rotationDaysElapsed??state.simulationDays),future=era==='red-giant'||era==='white-dwarf';
  const definitions=[...SOLAR_BODIES,...MOONS,...SMALL_BODIES,...BELT_BODIES],bodies=[];
  for(const source of definitions){
    if(future&&['mercury','venus','earth','moon','phobos','halley','itokawa'].includes(source.id))continue;
    if(era==='solar-nebula'&&(source.kind==='moon'||source.id==='halley'))continue;
    const body={...source};
    if(era==='solar-nebula'){
      if(body.id==='sun'){body.name='原始太陽';body.fact='周囲のガスやちりが重力で集まって原始太陽が成長します。';body.radius*=1.5;}
      else if(body.kind==='planet'){body.name=`原始${body.name}`;body.radius*=.55;body.appearance=body.index<5?12:body.appearance;body.fact='微惑星どうしが衝突・合体し、惑星へ成長する途中を表す模型です。';body.forming=true;}
      else {body.name=body.representative?'微惑星の模型':`${body.name}付近の微惑星`;body.fact='ガスやちりから生まれ、衝突・合体して惑星の材料となる微惑星の模型です。';body.forming=true;}
    }
    if(era==='young-earth'&&body.id==='earth'){body.name='誕生直後の地球';body.appearance=12;body.fact='衝突や重力による熱で高温になった地球。表面の岩石が溶けたマグマの海を想像してみましょう。';}
    if(era==='young-earth'&&body.id==='moon'){body.name='形成途中の月';body.appearance=12;body.orbit=80000/AU_KM;body.orbitDays=2.6;body.rotationDays=2.6;body.fact='巨大衝突で飛び散った物質から月が形成されたと考えられます。距離と姿は説明用の想像図です。';}
    if(future){
      body.illustrativeFuture=true;
      if(body.id==='sun'){body.radius=era==='red-giant'?.7:6371/AU_KM;body.appearance=era==='red-giant'?13:14;body.name=era==='red-giant'?'赤色巨星の太陽':'白色矮星';body.fact=era==='red-giant'?'中心の水素が減ると、太陽は外側が大きくふくらむ段階に進みます。':'外層を放出した後に残る高温で小さな中心部。新しい核融合で光る恒星とは異なり、ゆっくり冷えていきます。';}
      else if(body.parent==='sun'){const factor=era==='red-giant'?1.4:1.8;body.orbit*=factor;body.orbitDays*=factor**1.5;}
    }
    const parent=bodies.find(b=>b.id===body.parent),offset=orbitalOffset(body,days);
    body.position=parent?add(parent.position,offset):offset;
    // Tilt >90deg already encodes retrograde rotation: using a negative angle as
    // well would reverse it twice. rotationDays retains NASA's signed convention.
    body.rotation=TAU*((rotationDays/Math.abs(body.rotationDays||1))%1);
    if(body.tidallyLocked)body.rotation+=Math.PI-body.phase;
    body.spin=body.rotation;body.tilt=body.axialTilt;body.radiusKm=body.radius*AU_KM;
    if(body.kind==='comet'){body.tailDirection=unit(body.position);body.tailStrength=Math.max(0,1-length(body.position)/4);}
    bodies.push(body);
  }
  return bodies;
}
export const bodyById=(id,state)=>getBodies(state).find(b=>b.id===id);
export const SOLAR_SCENE = {id:'solar-system',name:'太陽系の自由飛行',era:'現在の太陽系（配置は模式図）',location:'太陽系の3D空間',summary:'太陽と8つの惑星を、360度の宇宙で探検する。',image:'assets/scenes/earth.png'};
export const add=(a,b)=>a.map((v,i)=>v+b[i]);
export const sub=(a,b)=>a.map((v,i)=>v-b[i]);
export const mul=(a,n)=>a.map(v=>v*n);
export const dot=(a,b)=>a.reduce((n,v,i)=>n+v*b[i],0);
export const length=a=>Math.hypot(...a);
export const unit=a=>mul(a,1/(length(a)||1));
export const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
function quatMul(a,b){const [x,y,z,w]=a,[X,Y,Z,W]=b;return [w*X+x*W+y*Z-z*Y,w*Y-x*Z+y*W+z*X,w*Z+x*Y-y*X+z*W,w*W-x*X-y*Y-z*Z];}
export function normalizeQuat(q){return Array.isArray(q)&&q.length===4&&q.every(Number.isFinite)&&length(q)>1e-8?unit(q):[0,0,0,1];}
export function rotate(q,v){const t=mul(cross(q.slice(0,3),v),2);return add(v,add(mul(t,q[3]),cross(q.slice(0,3),t)));}
export function basis(q){return {right:rotate(q,[1,0,0]),up:rotate(q,[0,1,0]),forward:rotate(q,[0,0,1])};}
export function turn(q,yaw,pitch){
  const rad=Math.PI/360;
  return normalizeQuat(quatMul(quatMul(q,[0,Math.sin(yaw*rad),0,Math.cos(yaw*rad)]),[Math.sin(-pitch*rad),0,0,Math.cos(pitch*rad)]));
}
export function lookAt(direction){
  const d=unit(direction),yaw=Math.atan2(d[0],d[2])*180/Math.PI,pitch=Math.asin(Math.max(-1,Math.min(1,d[1])))*180/Math.PI;
  return turn([0,0,0,1],yaw,pitch);
}
export function safeRadius(body){return body.radius*(body.id==='saturn'?2.6:body.irregular?2.05:1.12);}
export function approachPosition(body){
  const outward=body.id==='sun'?[0,0,1]:unit(mul(body.position,-1));
  return add(body.position,mul(unit(add(outward,[0,.22,0])),body.radius*(body.id==='saturn'?7:4)));
}
export function normalizeTimeScale(value){return Number.isFinite(value)?Math.max(10,Math.min(100,Math.round(value))):10;}
export function defaultSolar(era='present'){
  const config=eraConfig(era),body=bodyById(config.defaultTarget,{era:config.id}),position=body?approachPosition(body):[0,0,0];
  return {version:1,era:config.id,simulationDays:0,rotationDaysElapsed:0,motion:'paused',position,orientation:body?lookAt(sub(body.position,position)):[0,0,0,1],target:body?.id??null,speed:'inspect',timeScale:10,elapsed:0,travelled:0,aspect:16/9};
}
export function normalizeSolar(value){
  const s=defaultSolar(value?.era);
  if(!value||typeof value!=='object')return s;
  s.simulationDays=positiveDays(value.simulationDays);s.rotationDaysElapsed=positiveDays(value.rotationDaysElapsed??value.simulationDays);
  if(Object.hasOwn(MOTION_RATES,value.motion))s.motion=value.motion;
  if(Array.isArray(value.position)&&value.position.length===3&&value.position.every(v=>Number.isFinite(v)&&Math.abs(v)<=1000))s.position=[...value.position];
  s.orientation=normalizeQuat(value.orientation);s.target=bodyById(value.target,s)?value.target:s.target;
  if(Number.isFinite(value.aspect))s.aspect=Math.max(.5,Math.min(6,value.aspect));
  if(['inspect','light','fast-light'].includes(value.speed))s.speed=value.speed;
  s.timeScale=normalizeTimeScale(value.timeScale);
  for(const key of ['elapsed','travelled'])if(Number.isFinite(value[key])&&value[key]>=0)s[key]=Math.min(value[key],1e12);
  // Restore outside the safety shell if an imported position lies inside a body.
  for(const b of getBodies(s))if(length(sub(s.position,b.position))<safeRadius(b))s.position=approachPosition(b);
  return s;
}
export function nearestBody(position,state){return getBodies(state).reduce((a,b)=>!a||length(sub(position,b.position))-b.radius<length(sub(position,a.position))-a.radius?b:a,null);}
export function advanceWorld(state,seconds,{trackTarget=false}={}){
  const rate=MOTION_RATES[state.motion]||0,dt=Number.isFinite(seconds)?Math.max(0,Math.min(1,seconds)):0;
  if(!rate||!dt)return state;
  const simulationDays=positiveDays(state.simulationDays)+(state.motion==='orbit'?rate*dt:0);
  // Separate rotation is an illustration; resynchronize when orbital motion
  // resumes, so that a moon does not keep an arbitrary offset from its parent.
  const next={...state,simulationDays,rotationDaysElapsed:state.motion==='orbit'?simulationDays:positiveDays(state.rotationDaysElapsed??state.simulationDays)+rate*dt};
  if(trackTarget){const before=bodyById(state.target,state),after=bodyById(state.target,next);if(before&&after)next.position=add(state.position,sub(after.position,before.position));}
  // Moving objects also need a safety shell when observation time advances.
  for(const body of getBodies(next))if(length(sub(next.position,body.position))<safeRadius(body))next.position=approachPosition(body);
  return next;
}
export function timeRate(state){return state.speed==='fast-light'?normalizeTimeScale(state.timeScale):1;}
export function speedAU(state){
  if(state.speed!=='inspect')return LIGHT_AU_S*timeRate(state);
  // A scale-adaptive inspection speed, capped below light speed.
  const b=nearestBody(state.position,state);if(!b)return LIGHT_AU_S*.02;
  const clearance=Math.max(b.radius*.1,length(sub(state.position,b.position))-b.radius);
  return Math.min(LIGHT_AU_S*.1,Math.max(5e-10,clearance*.25));
}
export function safeMove(start,delta,state){
  const distance=length(delta);if(!distance)return {position:[...start],distance:0,collision:null};
  const direction=mul(delta,1/distance);let stop=distance,collision=null;
  for(const b of getBodies(state)){
    const to=sub(b.position,start),along=dot(to,direction),perp=sub(to,mul(direction,along)),r=safeRadius(b);
    if(along<=0||dot(perp,perp)>r*r)continue;
    const hit=along-Math.sqrt(Math.max(0,r*r-dot(perp,perp)));
    if(hit>=-1e-10&&hit<stop){stop=Math.max(0,hit-r*.002);collision=b.id;}
  }
  let position=add(start,mul(direction,stop));
  if(position.some(v=>Math.abs(v)>1000)){position=[...start];stop=0;collision='boundary';}
  return {position,distance:stop,collision};
}
export function stepSolar(s,axes,seconds){
  const dt=Math.max(0,Math.min(.1,seconds)),v=basis(s.orientation);
  const heading=add(add(mul(v.forward,axes.z||0),mul(v.right,axes.x||0)),mul(v.up,axes.y||0));
  const result=safeMove(s.position,mul(unit(heading),length(heading)?speedAU(s)*dt:0),s);
  return {state:{...s,position:result.position,orientation:turn(s.orientation,(axes.yaw||0)*dt*60,(axes.pitch||0)*dt*50),elapsed:s.elapsed+result.distance/(speedAU(s)/timeRate(s)),travelled:s.travelled+result.distance},collision:result.collision};
}
export function stepAutopilot(s,seconds){
  const body=bodyById(s.target,s);if(!body)return {state:s,arrived:false,collision:null};
  const offset=sub(s.position,body.position),distance=length(offset),arrival=body.radius*(body.id==='saturn'?7:4);
  const remaining=Math.max(0,distance-arrival),dt=Math.max(0,Math.min(.1,seconds));
  const direction=unit(mul(offset,-1)),step=Math.min(remaining,speedAU(s)*dt);
  const result=safeMove(s.position,mul(direction,step),s);
  const arrived=!result.collision&&remaining<=step+1e-12;
  const elapsed=step?result.distance/(speedAU(s)/timeRate(s)):0;
  return {state:{...s,position:result.position,orientation:lookAt(direction),speed:arrived?'inspect':s.speed,elapsed:s.elapsed+elapsed,travelled:s.travelled+result.distance},arrived,collision:result.collision};
}
export function visibleBody(s){
  const view=basis(s.orientation);let chosen=null,size=0;
  for(const b of getBodies(s)){
    // In a wide comet view its nucleus is subpixel, but the visible active tail
    // still identifies the photograph. Match the tail's extent in the renderer.
    const tail=b.kind==='comet'&&b.tailStrength>.05?Math.min(.14,.16/Math.max(.5,length(b.position)**2)):0;
    const regions=[{center:b.position,radius:b.radius}];
    if(tail)regions.push({center:add(b.position,mul(b.tailDirection,tail*.32)),radius:tail*.12});
    for(const region of regions){const v=sub(region.center,s.position),z=dot(v,view.forward),d=length(v),r=region.radius/d;
      if(z>0&&Math.abs(dot(v,view.right)/z)<.5*(s.aspect||16/9)&&Math.abs(dot(v,view.up)/z)<.49&&r>size&&r>.001){chosen=b;size=r;}}
  }
  return chosen;
}
export function solarPhotoName(photo){const snapshot=photo.solar||{},b=bodyById(snapshot.subject,snapshot),era=eraConfig(snapshot.era);return b?`${b.name}の観測写真`:era.id==='early-universe'?'宇宙の始まりの観測写真':era.id==='present'?'太陽系の星空':`${era.label}の星空`;}
