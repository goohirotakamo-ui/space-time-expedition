// AU positions and physical radii; phases, circular planetary orbits and ancient /
// future systems are teaching models, not a dated ephemeris. Sources and limits:
// docs/world-model.md (NASA/NSSDC planetary and satellite fact sheets).
import {normalizeEventProgress,normalizeEventSpeed,eventForEra} from './space-events.js';
import {formationBodyModel,planetSurfaceModel,normalizeModelVersion,normalizeColorMode} from './formation-model.js';
export const AU_KM = 149597870.7;
export const LIGHT_KM_S = 299792.458;
export const LIGHT_AU_S = LIGHT_KM_S / AU_KM;
// A classroom observation site, not a measured dust sublimation boundary.
export const INNER_DISK_SAMPLE_DISTANCE_AU = .8;
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
export const MOTION_RATES=Object.freeze({paused:0,rotation:.25,orbit:20,evolving:.25});
export function normalizeMotionRate(value){return Number.isFinite(value)?Math.max(.05,Math.min(36525,value)):.25;}
const ERAS={
  present:{label:'現在の太陽系',defaultTarget:'earth',note:'配置は模式図です。惑星は円軌道、彗星は細長い楕円軌道で、公転周期の違いを再現します。'},
  earth:{label:'現在の地球と太陽系',defaultTarget:'earth',note:'惑星・衛星・小惑星・彗星を調べます。軌道の配置は特定の日付を表しません。'},
  sun:{label:'現在の太陽と太陽系',defaultTarget:'sun',note:'自ら光る太陽と、その光を反射する惑星を比べます。軌道の配置は模式図です。'},
  'early-universe':{label:'宇宙の晴れ上がり',defaultTarget:null,note:'高温の初期宇宙から、約38万年後に水素原子ができて光が進みやすくなるまでの説明模型です。まだ恒星・銀河・太陽系はありません。宇宙の外側から見た景色ではありません。'},
  'solar-nebula':{label:'太陽系が生まれるころ',defaultTarget:'sun',note:'円盤・微惑星・原始惑星を形成段階ごとに示す想像模型です。最後の若い木星の半径2倍は研究推定の一例、他の半径は教材代表値です。配置には現在の軌道を目印に使い、当時の正確な配置・色を確定した復元ではありません。'},
  'young-earth':{label:'地球が生まれたころ',defaultTarget:'earth',note:'惑星は同じ速さで成長しません。地球は高温、火星などは冷え始めた地殻、巨大惑星は若い雲として描いています。姿・色・月の距離・衛星は想像模型です。土星の現在の環は省略しています。'},
  'red-giant':{label:'赤色巨星になった太陽',defaultTarget:'sun',note:'半径0.7AUまでの膨張途中を描く説明用の想像模型です。最大の大きさではなく、この場面では金星・地球はまだ残ります。この先、水星・金星は取り込まれると考えられ、地球の最期は研究でも未確定です。色・軌道・変化の速さは精密な未来予測ではありません。'},
  'white-dwarf':{label:'白色矮星になった太陽',defaultTarget:'sun',note:'外層放出後の短い時期に、ガスが光る場合の説明用の想像模型です。ガスを放出しても、全惑星が吹き飛ぶわけではありません。外惑星は残り得ます。地球の最期は未確定ですが、ここでは内側の惑星が失われる一案を描きます。星雲の大きさ・色と惑星の姿は確定した予測ではありません。'}
};
export function eraConfig(era='present'){const id=Object.hasOwn(ERAS,era)?era:'present';return {...ERAS[id],id};}
// Procedural materials deliberately do not reuse present-day photographic
// features (Mars' relief, Jupiter's Great Red Spot, or today's satellite maps).
// The palettes and amount of cooling are illustrative, not reconstructed maps.
const YOUNG_MATERIALS={mercury:20,venus:21,earth:12,mars:22,jupiter:23,saturn:24,uranus:25,neptune:26};
const YOUNG_FACTS={
  mercury:'岩石が集まって成長した若い水星。衝突の跡と冷え始めた地殻を表す想像模型で、現在の地形ではありません。',
  venus:'若い金星を、熱い岩石と蒸気を含む大気で表す想像模型です。当時の大気の厚さや色は確定していません。',
  earth:'衝突や重力による熱で高温になった地球。表面の岩石が溶けたマグマの海を想像してみましょう。',
  mars:'火星は地球より早く成長したと考えられます。冷え始めた暗い地殻と一部の高温域を描く想像模型で、現在の赤い地形ではありません。',
  jupiter:'木星のような巨大ガス惑星は、岩石惑星より早くガスを集めて成長したと考えられます。若い雲の模様は想像図で、現在の大赤斑は描いていません。',
  saturn:'若い土星も主にガスでできています。当時の雲・衛星の姿は未確定です。現在の明るい環をそのまま過去に置かず、省略した想像模型です。',
  uranus:'岩石や氷を含む材料とガスから成長する若い天王星の想像模型です。当時の雲の色・模様・大きさは確定していません。',
  neptune:'岩石や氷を含む材料とガスから成長する若い海王星の想像模型です。当時の雲の色・模様・大きさは確定していません。'
};
const FUTURE_MATERIALS={mars:30,jupiter:31,saturn:32,uranus:33,neptune:34};
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
  const days=positiveDays(state.simulationDays),rotationDays=positiveDays(state.rotationDaysElapsed??state.simulationDays),future=era==='red-giant'||era==='white-dwarf',progress=normalizeEventProgress(state.eventProgress);
  const smooth=value=>{const t=Math.max(0,Math.min(1,value));return t*t*(3-2*t);};
  // This is a single expansion illustration, not an RGB/He-burning/AGB track.
  // End at an intermediate .7 AU; do not remove planets beyond the photosphere.
  const giantProgress=smooth(progress),giantRadius=SOLAR_BODIES[0].radius+(.7-SOLAR_BODIES[0].radius)*giantProgress;
  const giantOrbitFactor=1+.4*giantProgress;
  const definitions=[...SOLAR_BODIES,...MOONS,...SMALL_BODIES,...BELT_BODIES],bodies=[];
  for(const source of definitions){
    if(future&&['phobos','halley','itokawa'].includes(source.id))continue;
    if(era==='white-dwarf'&&['mercury','venus','earth','moon'].includes(source.id))continue;
    if(era==='solar-nebula'&&(source.kind==='moon'||source.id==='halley'))continue;
    if(era==='young-earth'&&source.id==='moon'&&progress<.75)continue;
    const formation=era==='solar-nebula'&&normalizeModelVersion(state.modelVersion)===2?formationBodyModel(source,state):null;
    if(era==='solar-nebula'&&normalizeModelVersion(state.modelVersion)===2&&!formation)continue;
    const body={...source,hasRings:source.id==='saturn'&&!future&&!['solar-nebula','young-earth'].includes(era)};
    if(body.id==='saturn'){
      body.ringState=body.hasRings?'present-observed':future?'future-uncertain-omitted':'past-uncertain-omitted';
      body.ringNote=body.hasRings?'現在の土星の環を観測に基づいて示します。':'環の形成時期・存続は未確定のため、この時代は省略しています。環がなかったとの断定ではありません。';
    }
    if(['solar-nebula','young-earth'].includes(era)&&body.kind==='planet'){
      body.eraAppearance=YOUNG_MATERIALS[body.id];body.fact=YOUNG_FACTS[body.id];body.illustrativePast=true;
      if(era==='young-earth')body.name=`若い${body.name}`;
    }
    if(era==='solar-nebula'){
      if(body.id==='sun'){body.name='原始太陽';body.fact='重力でガスが集まり、中心が熱くなって成長します。半径は現在の太陽の約3倍とした成長途中の一例で、確定した昔の大きさではありません。';body.radius*=3;body.protostar=true;}
      else if(body.kind==='planet'){body.name=`原始${body.name}`;if(!formation)body.radius*=.55;body.appearance=body.index<5?12:body.appearance;body.forming=true;}
      else {body.name=`${body.orbit>3?'氷を含む微惑星':'岩石の微惑星'}の模型 ${body.index-16}`;body.eraAppearance=body.orbit>3?27:28;body.fact='ガスやちりから生まれ、衝突・合体して惑星の材料となる微惑星の模型です。現在の小天体そのものを再現した姿ではありません。';body.forming=true;}
      if(formation){Object.assign(body,formation);body.radius=formation.radiusKm/AU_KM;body.fact+=` ${formation.radiusNote}`;}
      else {body.radiusEvidence='legacy-model';body.radiusNote='保存された旧版の教材模型。研究から復元した半径ではありません。';}
    }
    if(era==='young-earth'&&body.kind!=='planet'&&body.id!=='sun'&&body.id!=='moon'){
      body.eraAppearance=body.kind==='moon'?['io','phobos','deimos'].includes(body.id)?28:27:body.orbit>3?27:28;body.illustrativePast=true;
      if(body.kind==='moon'){body.name=`${body.name}の形成期の模型`;body.fact='衛星が形成されたころの材料を表す想像模型です。当時の表面・大気・正確な配置を確定したものではありません。';}
      else {body.name=body.kind==='comet'?'氷を含む彗星の模型':`${body.orbit>3?'氷を含む小天体':'岩石の小天体'}の模型 ${body.index-16}`;body.fact='形成期に残った岩石や氷を表す小天体の模型です。現在の名前を持つ特定の小天体の昔の姿ではありません。';}
    }
    if(era==='young-earth'&&body.id==='earth'){body.name='誕生直後の地球';body.appearance=12;body.fact='衝突や重力による熱で高温になった地球。表面の岩石が溶けたマグマの海を想像してみましょう。';}
    if(era==='young-earth'&&body.id==='moon'){body.name='形成途中の月';body.appearance=12;body.radius*=.05+.95*smooth((progress-.75)/.25);body.orbit=80000/AU_KM;body.orbitDays=2.6;body.rotationDays=2.6;body.fact='巨大衝突で飛び散った物質から月が形成されたと考えられます。距離と姿は説明用の想像図です。';}
    if(future){
      body.illustrativeFuture=true;
      if(body.id==='sun'){body.radius=era==='red-giant'?giantRadius:6371/AU_KM;body.appearance=era==='red-giant'?13:14;body.name=era==='red-giant'?'赤色巨星の太陽':'白色矮星';body.fact=era==='red-giant'?'中心の水素が減ると、太陽は外側が大きくふくらむ段階に進みます。ここでは膨張途中の一例を描き、ヘリウム燃焼時の収縮と、その後の再膨張は連続描画していません。':'外層放出後の短い時期を表す、小さく熱い中心部の模型です。この先、星雲が薄れて見えなくなった後も、白色矮星は残った熱を放ちながら長く冷えていきます。';}
      else {
        body.eraAppearance=FUTURE_MATERIALS[body.id]??35;
        if(['mercury','venus','earth'].includes(body.id))body.fact='太陽がふくらみ始めた未来の岩石惑星を表す想像模型です。現在の海・大気・表面がそのまま残るという意味ではありません。水星・金星はやがて取り込まれると考えられ、地球が最後まで残るかは未確定です。';
        else if(body.kind==='planet')body.fact=body.id==='mars'?'外側に残った火星を、加熱で変化した地殻として描く想像模型です。太陽が質量を失うと、残った惑星の軌道は広がります。':`${body.name}のような外惑星は、太陽の外層放出後も残る可能性があります。変化した大気の色・雲と広がる軌道は想像模型です。${body.id==='saturn'?'現在の環がそのまま残るとは考えず、ここでは省略しています。':''}`;
        else body.fact='外層を放出した太陽の周りに残る天体を表す想像模型です。個々の衛星・小天体の存続や表面の姿は確定していません。';
        if(body.parent==='sun'){
          // In a slow isotropic mass-loss model a*M stays constant. Kepler's
          // law therefore scales P by factor^2, including the lighter star.
          const factor=era==='red-giant'?giantOrbitFactor:1.8;body.orbit*=factor;body.orbitDays*=factor**2;
        }
      }
    }
    const surface=planetSurfaceModel(source,state);
    if(surface){Object.assign(body,surface);if(surface.surfaceNote&&era!=='solar-nebula')body.fact+=` ${surface.surfaceNote}`;}
    if(era==='white-dwarf'&&body.id!=='sun'&&body.kind!=='planet'&&normalizeModelVersion(state.modelVersion)!==1)body.eraAppearance=48;
    // A planet is removed only when this illustrative photosphere reaches its
    // orbit. Earth remains here: its ultimate fate is not decided by this model.
    if(era==='red-giant'&&['mercury','venus','earth'].includes(body.id)&&body.orbit-body.radius<=giantRadius)continue;
    const parent=bodies.find(b=>b.id===body.parent),offset=orbitalOffset(body,days);
    if(body.kind==='moon'&&!parent)continue;
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
export function safeRadius(body){return body.radius*(body.id==='saturn'&&body.hasRings!==false?2.6:body.irregular?2.05:1.12);}
export function approachPosition(body,{aspect=16/9}={}){
  const outward=body.id==='sun'?[0,0,1]:unit(mul(body.position,-1));
  const hasRings=body.id==='saturn'&&body.hasRings!==false;
  let direction=unit(add(outward,[0,.22,0]));
  if(hasRings){
    const normal=[Math.sin(body.axialTilt||0),Math.cos(body.axialTilt||0),0];
    let planar=sub(outward,mul(normal,dot(outward,normal)));
    if(length(planar)<1e-6)planar=[0,0,1];
    direction=add(mul(unit(planar),Math.cos(Math.PI/6)),mul(normal,Math.sin(Math.PI/6)));
  }
  // Keep familiar framing on laptop screens, but fit the same physical rings
  // when the cockpit is tall/narrow. .532 is the renderer's vertical half-FOV.
  const viewAspect=Number.isFinite(aspect)?Math.max(.5,Math.min(6,aspect)):16/9;
  const frameDistance=(hasRings?2.4:1)/(.532*Math.min(1,viewAspect)*.85);
  const distance=body.radius*Math.max(hasRings?7:4,frameDistance);
  return add(body.position,mul(direction,distance));
}
export function normalizeTimeScale(value){return Number.isFinite(value)?Math.max(10,Math.min(100,Math.round(value))):10;}
export function defaultSolar(era='present'){
  const config=eraConfig(era),body=bodyById(config.defaultTarget,{era:config.id});
  const position=config.id==='white-dwarf'?[0,40,680]:config.id==='solar-nebula'?mul(unit(approachPosition(body)),INNER_DISK_SAMPLE_DISTANCE_AU):body?approachPosition(body):[0,0,0];
  return {version:1,modelVersion:2,colorMode:'natural',era:config.id,...(config.id==='early-universe'?{particleModelVersion:2,particleSeconds:0,lightStyle:'wave'}:{}),simulationDays:0,rotationDaysElapsed:0,motion:'paused',motionDaysPerSecond:.25,motionTrackTarget:true,eventProgress:1,eventPlaying:false,eventSpeed:1,position,orientation:body?lookAt(sub(body.position,position)):[0,0,0,1],target:body?.id??null,speed:'inspect',timeScale:10,elapsed:0,travelled:0,aspect:16/9};
}
export function normalizeSolar(value){
  const s=defaultSolar(value?.era);
  if(!value||typeof value!=='object')return s;
  s.modelVersion=normalizeModelVersion(value.modelVersion);s.colorMode=normalizeColorMode(value.colorMode);
  if(s.era==='early-universe'){
    s.particleModelVersion=[1,2].includes(value.particleModelVersion)?value.particleModelVersion:0;
    s.particleSeconds=Number.isFinite(value.particleSeconds)&&value.particleSeconds>=0?Math.min(1e6,value.particleSeconds):0;
    s.lightStyle=['wave','beam'].includes(value.lightStyle)?value.lightStyle:'packet';
  }
  s.simulationDays=positiveDays(value.simulationDays);s.rotationDaysElapsed=positiveDays(value.rotationDaysElapsed??value.simulationDays);
  if(Object.hasOwn(MOTION_RATES,value.motion))s.motion=value.motion;
  s.motionDaysPerSecond=normalizeMotionRate(value.motionDaysPerSecond);s.motionTrackTarget=value.motionTrackTarget!==false;
  s.eventProgress=normalizeEventProgress(value.eventProgress);s.eventSpeed=normalizeEventSpeed(value.eventSpeed);s.eventPlaying=value.eventPlaying===true&&s.eventProgress<1&&Boolean(eventForEra(s.era));
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
  const rate=state.motion==='evolving'?normalizeMotionRate(state.motionDaysPerSecond):MOTION_RATES[state.motion]||0,dt=Number.isFinite(seconds)?Math.max(0,Math.min(1,seconds)):0;
  const orbiting=state.motion==='orbit'||state.motion==='evolving';
  const simulationDays=positiveDays(state.simulationDays)+(orbiting?rate*dt:0);
  // Separate rotation is an illustration; resynchronize when orbital motion
  // resumes, so that a moon does not keep an arbitrary offset from its parent.
  let next=rate&&dt?{...state,simulationDays,rotationDaysElapsed:orbiting?simulationDays:positiveDays(state.rotationDaysElapsed??state.simulationDays)+rate*dt}:state;
  if(trackTarget&&rate&&dt){const before=bodyById(state.target,state),after=bodyById(state.target,next);if(before&&after)next.position=add(state.position,sub(after.position,before.position));}
  const bodies=getBodies(next);
  if(next.target&&!bodies.some(body=>body.id===next.target))next={...next,target:bodies[0]?.id??null};
  // Moving objects also need a safety shell when observation time advances.
  for(const body of bodies)if(length(sub(next.position,body.position))<safeRadius(body))next={...next,position:approachPosition(body)};
  return next;
}
export function timeRate(state){return state.speed==='fast-light'?normalizeTimeScale(state.timeScale):1;}
export function speedAU(state){
  if(state.speed!=='inspect')return LIGHT_AU_S*timeRate(state);
  // Observer movement is a scale-adaptive camera aid, not physical propulsion.
  // A 0.1c cap made a .7AU red giant take hours to move around. Light-speed
  // travel remains the separate 'light' / 'fast-light' calculation above.
  const b=nearestBody(state.position,state);if(!b)return LIGHT_AU_S*.02;
  const clearance=Math.max(b.radius*.1,length(sub(state.position,b.position))-b.radius);
  return Math.max(5e-10,clearance*.25);
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
      const whiteDwarfPoint=s.era==='white-dwarf'&&b.id==='sun';
      if(z>0&&Math.abs(dot(v,view.right)/z)<.5*(s.aspect||16/9)&&Math.abs(dot(v,view.up)/z)<.49&&r>size&&(r>.001||whiteDwarfPoint)){chosen=b;size=r;}}
  }
  return chosen;
}
export function solarPhotoName(photo){const snapshot=photo.solar||{},b=bodyById(snapshot.subject,snapshot),era=eraConfig(snapshot.era);return b?`${b.name}の観測写真`:era.id==='early-universe'?'宇宙の始まりの観測写真':era.id==='present'?'太陽系の星空':`${era.label}の星空`;}
