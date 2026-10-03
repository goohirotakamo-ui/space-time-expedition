// Selected formation snapshots, not an interpolated astronomical clock.
// Only the late young-Jupiter radius is tied to a quantitative research result;
// other sizes are explicit teaching representatives. See docs/formation-model.md.
const FORMATION_SOURCE='https://science.nasa.gov/exoplanets/how-do-planets-form/';
const JUPITER_SOURCE='https://www.nature.com/articles/s41550-025-02512-y';
const STAGES=[
  {id:'disk',at:0,label:'原始太陽とガス・ちりの円盤',ageLabel:'形成の初期（年代幅あり）',note:'中心の若い太陽と円盤を示します。惑星を最初から8つ並べてはいません。半径3倍の太陽、色と配置は説明用の一例です。',source:FORMATION_SOURCE},
  {id:'planetesimals',at:.26,label:'ちりから微惑星へ',ageLabel:'形成初期から最初の数百万年',note:'岩石や氷の粒からできる微惑星の代表例です。表示する数・位置・大きさは教材の設定で、特定の小天体の誕生を確定したものではありません。',source:FORMATION_SOURCE},
  {id:'embryos',at:.52,label:'岩石の原始惑星と、育つ巨大惑星',ageLabel:'最初の数百万年の一例',note:'内側の岩石の胚と、早くガスを集めた木星・土星を示します。惑星は同じ割合では育ちません。半径は成長の違いを示す教材代表値です。',source:FORMATION_SOURCE},
  {id:'young-jupiter',at:.78,label:'太陽系誕生初期',ageLabel:'最初の固体形成から約380万年の一例',note:'若い木星の半径は、現在の2〜2.5倍と推定した研究の一例から2倍を採用しています。他の天体の半径・配置は教材代表値です。全惑星の同時点を確定した復元ではありません。',source:JUPITER_SOURCE}
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

// Material identifiers describe different physical regimes, not measured maps.
// In particular, an ice-rich embryo must not inherit a mature blue atmosphere.
const FORMING_SURFACES={
  mercury:[36,'hot-rocky-embryo','rock-vapour-uncertain','衝突で熱くなった岩石の胚と冷え始めた部分を示します。現在の水星のクレーター地図を過去へ戻したものではありません。'],
  venus:[37,'steam-rocky-embryo','steam-envelope-illustration','熱い岩石と蒸気を含む大気の一例です。現在の金星の硫酸の雲ではなく、初期大気の模型です。厚さや色は未確定です。'],
  earth:[12,'magma-rocky-embryo','steam-envelope-illustration','衝突で高温になった岩石の原始惑星です。この形成段階では、現在の海や大陸を描いていません。'],
  mars:[38,'cooling-rocky-embryo','degassing-envelope-uncertain','比較的早く育った火星側の胚を、熱い岩石と冷え始めた地殻で示します。現在の赤い砂漠や地形を再現したものではありません。'],
  jupiter:[39,'accreting-gas-giant','accreting-hydrogen-helium','水素・ヘリウムを早く集めた若い巨大ガス惑星です。厚く乱れた雲は形成中を表す模型で、現在の大赤斑や帯の地図ではありません。'],
  saturn:[40,'accreting-gas-giant','accreting-hydrogen-helium','ガスを集めて育つ土星の模型です。木星と同じ半径の歴史を当てはめず、成長中の雲を描きます。'],
  uranus:[41,'ice-rock-embryo','forming-envelope-unresolved','岩石と氷を含む材料から育つ惑星胚です。厚い大気の形はまだ定めず、現在の青緑色の雲をそのまま置いていません。内部まで冷たい氷だけでできた球という意味ではありません。'],
  neptune:[42,'ice-rock-embryo','forming-envelope-unresolved','外側で育つ岩石・氷を含む惑星胚です。現在の海王星の青い大気や暗斑を流用せず、固体材料が集まる段階の一例を示します。']
};
const LATER_SURFACES={mercury:'cooling-rocky-crust',venus:'steam-atmosphere',earth:'magma-ocean',mars:'early-rocky-crust',jupiter:'young-gas-clouds',saturn:'young-gas-clouds',uranus:'young-ice-giant-clouds',neptune:'young-ice-giant-clouds'};
const REMNANT_MATERIALS={mars:43,jupiter:44,saturn:45,uranus:46,neptune:47};
const SATURN_RING_NOTE='土星の環の形成時期には異なる研究結果があり、確定していません。この時代には現在の環を移植せず省略しています。環が存在しなかったと断定するものではありません。';

export function planetSurfaceModel(body,world={}){
  if(normalizeModelVersion(world.modelVersion)===1)return null;
  const {era}=world;
  if(!['solar-nebula','young-earth','red-giant','white-dwarf'].includes(era)||body.kind!=='planet')return null;
  const common={surfaceEvidence:'research-informed-illustration',appearanceSource:FORMATION_SOURCE};
  if(era==='solar-nebula'){
    const material=FORMING_SURFACES[body.id];if(!material)return null;
    const [eraAppearance,surfaceVariant,atmosphereState,note]=material;
    const surfaceNote=note+(body.id==='saturn'?` ${SATURN_RING_NOTE}`:'');
    return {...common,eraAppearance,surfaceVariant,atmosphereState,surfaceNote,fact:surfaceNote};
  }
  const radiusNote='表示半径は現在の天体の大きさを比較基準に使っています。この時代の半径を測定・確定した値ではありません。';
  if(era==='young-earth')return {...common,surfaceVariant:LATER_SURFACES[body.id],atmosphereState:['jupiter','saturn'].includes(body.id)?'young-hydrogen-helium':['uranus','neptune'].includes(body.id)?'young-volatile-envelope':['venus','earth'].includes(body.id)?'steam-envelope-illustration':'early-atmosphere-uncertain',radiusEvidence:'present-radius-reference',radiusNote,...(body.id==='saturn'?{surfaceNote:SATURN_RING_NOTE}:{})};
  const gas=['jupiter','saturn','uranus','neptune'].includes(body.id);
  const remnant=era==='white-dwarf';
  const surfaceNote=remnant
    ?`${gas?'熱い白色矮星の紫外線で、残った巨大惑星の大気も変化し得ます。外層放出の直後に、全惑星が急に凍るという意味ではありません。':'強い加熱を受けた後に残る岩石の姿を表します。冷え方や表面の変化は確定していません。'} 色と模様は研究を踏まえた説明用の一例です。`
    :`${gas?'赤色巨星から受ける強い放射で、雲や大気が変化する未来の模型です。':'ふくらんだ太陽による加熱で、地殻や大気が変化する未来の模型です。'} 現在の模様や地形がそのまま残るとはしていません。`;
  return {...common,...(remnant?{eraAppearance:REMNANT_MATERIALS[body.id]??48}:{}),surfaceVariant:remnant?(gas?'post-giant-clouds':'post-giant-crust'):(gas?'irradiated-giant-clouds':'irradiated-rocky-crust'),atmosphereState:gas?(remnant?'hot-remnant-irradiated-envelope':'red-giant-irradiated-envelope'):'future-atmosphere-uncertain',surfaceNote:surfaceNote+(body.id==='saturn'?` ${SATURN_RING_NOTE}`:''),radiusEvidence:'present-radius-reference',radiusNote,appearanceSource:remnant?'https://arxiv.org/abs/1912.02345':'https://science.nasa.gov/exoplanets/resources/life-and-death/chapter-7/'};
}

export function formationBodyModel(body,world={}){
  const stage=formationStage(world);
  if(!stage||stage.modelVersion!==2||world.era!=='solar-nebula')return null;
  const common={formationStageId:stage.id,formationAgeLabel:stage.ageLabel,radiusEvidence:'teaching-representative',source:FORMATION_SOURCE,...planetSurfaceModel(body,world)};
  if(body.id==='sun')return {...common,name:'原始太陽',radiusKm:body.radiusKm*3,radiusNote:'現在の太陽の3倍とした教材代表値。確定した昔の半径ではありません。'};
  if(stage.index===0||body.kind==='moon'||body.kind==='comet')return null;
  if(body.kind!=='planet'){
    const radiusKm=PLANETESIMAL_RADII[body.id];if(!radiusKm)return null;
    return {...common,radiusKm,name:`${body.orbit>3?'氷を含む微惑星':'岩石の微惑星'}の模型 ${body.index-16}`,radiusNote:'微惑星の大きさを表す教材代表値。現在の名前を持つ小天体の昔の半径ではありません。'};
  }
  const radiusKm=(stage.index===2?EMBRYO_RADII:stage.index===3?LATE_RADII:{})[body.id];if(!radiusKm)return null;
  const name=ROCKY_NAMES[body.id]?`岩石の原始惑星（${ROCKY_NAMES[body.id]}）`:body.id==='jupiter'?(stage.index===3?'若い木星（推定例）':'成長中の木星'):body.id==='saturn'?'成長中の土星':`氷を含む原始惑星（${body.name}）`;
  if(body.id==='jupiter'&&stage.index===3)return {...common,name,radiusKm,radiusEvidence:'research-estimate',radiusNote:'約380万年時点で現在の2〜2.5倍という研究推定の一例から2倍を採用。全形成期の確定値ではありません。',source:JUPITER_SOURCE};
  return {...common,name,radiusKm,radiusNote:'成長段階を比べるための教材代表値。この時期の半径を測定・確定したものではありません。'};
}
