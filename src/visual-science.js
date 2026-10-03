// Visual choices are saved with the world photograph. A missing version is a
// legacy photograph and must keep the former palette and present-day sky map.
const HISTORICAL_SKIES=Object.freeze({
  'solar-nebula':{seed:17,label:'形成期の星空の想像模型'},
  'young-earth':{seed:31,label:'若い太陽系の星空の想像模型'},
  'red-giant':{seed:53,label:'遠い未来の星空の想像模型'},
  'white-dwarf':{seed:71,label:'外層放出後の星空の想像模型'}
});

export const NATURAL_TINTS=Object.freeze({
  sun:Object.freeze([1,.98,.95]),
  neptune:Object.freeze([.58,.77,.79]),
  recombination:Object.freeze([1,.694,.431])
});

export function visualProfile(world={}){
  if(world.era==='early-universe'&&[1,2].includes(world.particleModelVersion))return {modelVersion:2,colorMode:'diagram',colorLabel:'粒子と光の拡大模型',colorNote:'肉眼では見えない粒子を色分けしています。色・大きさ・個数の割合・間隔・動く速さは説明用です。電子の雲は位置の広がりの記号で、惑星のような軌道ではありません。',backgroundKind:'starless',backgroundLabel:'まだ星のない宇宙の一部',backgroundNote:'枠は宇宙の端ではありません。最初の場面は誕生から約1秒ごろで、それより前は省略しています。',skySeed:0,natural:false};
  const modern=world.modelVersion>=2,colorMode=modern&&world.colorMode!=='enhanced'?'natural':'enhanced';
  const historical=modern?HISTORICAL_SKIES[world.era]:null;
  const starless=world.era==='early-universe';
  return {
    modelVersion:modern?2:1,colorMode,
    colorLabel:!modern?'保存時の色':colorMode==='natural'?'自然な色の目安':'模様を見やすくした色',
    colorNote:!modern?'この写真は保存時の色と背景を保っています。':colorMode==='natural'?(starless?'晴れ上がりのころの約3000 Kの光を色の目安にしています。高温の初期段階も含め、画面の色と明るさは説明用に調整しています。':historical?'この時代の表面やガスの色は、研究を参考にした想像模型です。肉眼での見え方を確定した色ではありません。':'現在の太陽は白系、海王星は淡い青緑を目安にしています。画像資料を調整した表示で、較正した実測色ではありません。'):'色やコントラストを強めた教材用の表示です。画面の明るさは測定値ではありません。',
    backgroundKind:starless?'starless':historical?'illustrated':'image-map',
    backgroundLabel:starless?'まだ星のない宇宙':historical?historical.label:'現在の星空の画像を使った模型',
    backgroundNote:starless?'晴れ上がりごろの光は約3000K。色と明るさは画面で観察できるよう調整しています。':historical?'当時の星座や星の数を復元したものではありません。恒星の分布と銀河面を表す想像模型で、背景には移動できません。':'Solar System Scopeの全天画像を使用しています。明るさを調整した背景で、背景の星には移動できません。',
    skySeed:historical?.seed??0,
    natural:modern&&colorMode==='natural'
  };
}

// Palette transforms keep the source texture's cloud/spot contrast. These RGB
// values express a colour tendency, not a spectrophotometric reconstruction.
export function naturalSurfaceColor(id,rgb){
  const y=rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
  if(id==='sun')return NATURAL_TINTS.sun.map(v=>v*(.40+.60*Math.sqrt(Math.max(0,y))));
  if(id==='neptune')return NATURAL_TINTS.neptune.map(v=>v*(.68+.52*y));
  return [...rgb];
}

const vec3=values=>`vec3(${values.map(value=>Number.isInteger(value)?`${value}.`:String(value)).join(',')})`;
export const NATURAL_COLOR_GLSL=`
vec3 naturalSurface(float id,vec3 color){
 float y=dot(color,vec3(.2126,.7152,.0722));
 if(id<.5)return ${vec3(NATURAL_TINTS.sun)}*(.40+.60*sqrt(max(0.,y)));
 if(abs(id-8.)<.1)return ${vec3(NATURAL_TINTS.neptune)}*(.68+.52*y);
 return color;
}`;
export const RECOMBINATION_COLOR_GLSL=vec3(NATURAL_TINTS.recombination);
