// Selected formation snapshots, not an interpolated astronomical clock.
// Only the late young-Jupiter radius is tied to a quantitative research result;
// other sizes are explicit teaching representatives. See docs/formation-model.md.
const FORMATION_SOURCE='https://science.nasa.gov/exoplanets/how-do-planets-form/';
const JUPITER_SOURCE='https://www.nature.com/articles/s41550-025-02512-y';
const STAGES=[
  {id:'disk',at:0,label:'原始太陽とガス・ちりの円盤',ageLabel:'形成の初期（年代幅あり）',note:'中心の若い太陽と円盤を示します。惑星を最初から8つ並べてはいません。半径3倍の太陽、色と配置は説明用の一例です。',source:FORMATION_SOURCE},
  {id:'planetesimals',at:.26,label:'ちりから微惑星へ',ageLabel:'形成初期から最初の数百万年',note:'岩石や氷の粒からできる微惑星の代表例です。表示する数・位置・大きさは教材の設定で、特定の小天体の誕生を確定したものではありません。',source:FORMATION_SOURCE},
  {id:'embryos',at:.52,label:'岩石の原始惑星と、育つ巨大惑星',ageLabel:'最初の数百万年の一例',note:'内側の岩石の胚と、早くガスを集めた木星・土星を示します。惑星は同じ割合では育ちません。半径は成長の違いを示す教材代表値です。',source:FORMATION_SOURCE},
  {id:'young-jupiter',at:.78,label:'若い木星と、まだ育つ岩石の惑星',ageLabel:'最初の固体形成から約380万年の一例',note:'若い木星の半径は、現在の2〜2.5倍と推定した研究の一例から2倍を採用しています。他の天体の半径・配置は教材代表値です。全惑星の同時点を確定した復元ではありません。',source:JUPITER_SOURCE}
];
export const FORMATION_STAGES=Object.freeze(STAGES.map(stage=>Object.freeze(stage)));
export const normalizeModelVersion=value=>value===1?1:2;
export const normalizeColorMode=value=>value==='enhanced'?'enhanced':'natural';
const progressOf=value=>Number.isFinite(value)?Math.max(0,Math.min(1,value)):1;

export function formationStage(world={}){
  if(world.era==='young-earth')return {
    id:'earth-moon',index:0,label:'地球と月の形成期',ageLabel:'太陽系の形成開始から数千万年後を含む時期',
    note:'太陽系の円盤があった初期より後の別の時期です。月をつくった巨大衝突の年代・過程は研究中で、形と距離は説明模型です。',
    source:'https://science.nasa.gov/moon/formation/',modelVersion:normalizeModelVersion(world.modelVersion)
  };
  if(world.era!=='solar-nebula')return null;
  if(normalizeModelVersion(world.modelVersion)===1)return {
    id:'legacy-formation',index:-1,label:'保存された旧版の形成模型',ageLabel:'約46億年前（旧版の説明模型）',
    note:'以前の写真を保つため、8惑星を一律に縮めた旧模型を表示しています。この大きさや配置は研究の再現値ではありません。',source:FORMATION_SOURCE,modelVersion:1
  };
  const progress=progressOf(world.eventProgress);let index=0;
  for(let i=1;i<FORMATION_STAGES.length;i++)if(progress>=FORMATION_STAGES[i].at)index=i;
  return {...FORMATION_STAGES[index],index,progress,modelVersion:2};
}

// These radii express different growth stages without pretending that a
// radius history is measured for every planet. Units are kilometres.
const EMBRYO_RADII=Object.freeze({mercury:1200,venus:2500,earth:3000,mars:3200,jupiter:118849,saturn:75702});
const LATE_RADII=Object.freeze({mercury:1800,venus:3300,earth:3600,mars:3389.5,jupiter:139822,saturn:81525,uranus:8500,neptune:9000});
const PLANETESIMAL_RADII=Object.freeze({ceres:60,vesta:35,pluto:80,itokawa:10,'belt-1':12,'belt-2':15});
const ROCKY_NAMES=Object.freeze({mercury:'水星',venus:'金星',earth:'地球',mars:'火星'});

export function formationBodyModel(body,world={}){
  const stage=formationStage(world);
  if(!stage||stage.modelVersion!==2||world.era!=='solar-nebula')return null;
  const common={formationStageId:stage.id,formationAgeLabel:stage.ageLabel,radiusEvidence:'teaching-representative',source:FORMATION_SOURCE};
  if(body.id==='sun')return {...common,name:'原始太陽',radiusKm:body.radiusKm*3,radiusNote:'現在の太陽の3倍とした教材代表値。確定した昔の半径ではありません。'};
  if(stage.index===0||body.kind==='moon'||body.kind==='comet')return null;
  if(body.kind!=='planet'){
    const radiusKm=PLANETESIMAL_RADII[body.id];if(!radiusKm)return null;
    return {...common,radiusKm,name:`${body.orbit>3?'氷を含む微惑星':'岩石の微惑星'}の模型 ${body.index-16}`,radiusNote:'微惑星の大きさを表す教材代表値。現在の名前を持つ小天体の昔の半径ではありません。'};
  }
  const radiusKm=(stage.index===2?EMBRYO_RADII:stage.index===3?LATE_RADII:{})[body.id];if(!radiusKm)return null;
  const name=ROCKY_NAMES[body.id]?`岩石の原始惑星（${ROCKY_NAMES[body.id]}側）`:body.id==='jupiter'?(stage.index===3?'若い木星（推定例）':'成長中の木星'):body.id==='saturn'?'成長中の土星':`氷を含む原始惑星（${body.name}側）`;
  if(body.id==='jupiter'&&stage.index===3)return {...common,name,radiusKm,radiusEvidence:'research-estimate',radiusNote:'約380万年時点で現在の2〜2.5倍という研究推定の一例から2倍を採用。全形成期の確定値ではありません。',source:JUPITER_SOURCE};
  return {...common,name,radiusKm,radiusNote:'成長段階を比べるための教材代表値。この時期の半径を測定・確定したものではありません。'};
}
