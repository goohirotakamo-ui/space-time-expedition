// A narrated, non-linear sequence of stages, not an astronomical clock or a
// hydrodynamic simulation. The renderer and caption always share this progress.
import {FORMATION_STAGES} from './formation-model.js';
const EVENTS={
  'early-universe':{
    id:'early-universe',title:'ビッグバンから宇宙の晴れ上がり',durationSeconds:32,
    note:'出来事ごとに時間を縮めた説明用の再現です。宇宙の外から見た爆発ではありません。',
    source:'https://science.nasa.gov/universe/overview/',
    stages:[
      {at:0,label:'ビッグバン：高温・高密度の宇宙',description:'約138億年前。宇宙はとても熱く密度が高い状態から膨張し、冷えていきます。宇宙の中心から外へ飛び散る爆発ではありません。'},
      {at:.22,label:'誕生から数分：原子核ができる',description:'陽子と中性子が結びつき、主にヘリウムの原子核ができます。まだ原子核と電子がばらばらで、原子にはなっていません。'},
      {at:.5,label:'光がまっすぐ進みにくい宇宙',description:'自由に動く電子が光を散らします。宇宙は膨張しながらさらに冷えます。原子核ができる時期と、原子ができる時期は異なります。'},
      {at:.78,label:'約38万年後：原子ができて晴れ上がる',description:'原子核と電子が結びついて原子になります。光が遠くへ進みやすくなります。まだ恒星・銀河・太陽系はありません。'}
    ]
  },
  'solar-nebula':{
    id:'solar-nebula',title:'原始太陽と惑星の成長',durationSeconds:28,
    note:'形成段階を切り替える説明模型です。再生の秒数は実際の年数と比例しません。木星の2倍半径は約380万年時点の研究推定の一例で、他の半径や位置は教材代表値です。',
    source:'https://science.nasa.gov/exoplanets/how-do-planets-form/',
    stages:FORMATION_STAGES.map(stage=>({at:stage.at,label:stage.label,ageLabel:stage.ageLabel,description:`${stage.ageLabel}。${stage.note}`}))
  },
  'young-earth':{
    id:'young-earth',title:'ジャイアントインパクトと月の形成',durationSeconds:24,
    note:'太陽系の形成開始から数千万年後を含む別の時期の模型です。月の起源について有力な巨大衝突説を描きます。詳しい年代は研究中で、衝突の形・速さ・時間は説明用です。',
    source:'https://science.nasa.gov/moon/formation/',
    stages:[
      {at:0,label:'原始地球に天体が近づく',description:'若い地球に、火星ほどの大きさの天体が近づきます。これは月の形成を説明する有力な説の一つです。'},
      {at:.32,label:'巨大衝突：ジャイアントインパクト',description:'大きな衝突で熱が生じ、地球や衝突した天体の物質が宇宙へ飛び散ります。'},
      {at:.52,label:'飛び散った物質が地球のまわりへ',description:'地球のまわりに残った物質が回転します。地球へ戻る物質や、外へ飛び去る物質もあります。'},
      {at:.8,label:'物質が集まり月へ',description:'地球のまわりに残った物質から月が形成されたと考えられます。月の形成過程や時間には、複数の研究モデルがあります。'}
    ]
  },
  'red-giant':{
    id:'red-giant',title:'太陽が赤色巨星になる',durationSeconds:26,
    note:'半径0.7AUまでの膨張途中の模型で、最大半径の予測ではありません。実際にはヘリウムを燃やす時期に縮み、その後また膨らみます。この連続過程や正確な時刻は再現していません。',
    source:'https://science.nasa.gov/sun/facts/',
    stages:[
      {at:0,label:'中心の水素が減る',description:'長い時間がたつと、太陽の中心で核融合に使われる水素が減っていきます。'},
      {at:.28,label:'中心と外側の様子が変わる',description:'中心のまわりで水素の核融合が続き、外側が膨らみます。表面の温度は下がりますが、星全体が出す光は強くなります。'},
      {at:.62,label:'膨張途中の赤色巨星',description:'この模型では、太陽の表面が達した惑星を表示から外します。金星・地球はこの途中の場面では残ります。これは惑星の最期を精密に計算したものではありません。'},
      {at:.88,label:'この先：再び膨張し、外層を失う',description:'実際の太陽は、中心でヘリウムの核融合が始まると一度縮み、さらに後で再び巨星になります。この過程は画面では省略しています。その後、外側のガスを失って白色矮星へ向かいます。地球の最期は未確定です。'}
    ]
  },
  'white-dwarf':{
    id:'white-dwarf',title:'外層放出後の短い時期',durationSeconds:24,
    note:'ガスが光る場合を描く想像模型です。太陽の星雲の明るさは未確定で、形・色・広がりは説明用に調整しています。中心は地球ほどの大きさです。長い冷却期ずっと星雲が光るわけではありません。',
    source:'https://science.nasa.gov/sun/facts/',
    stages:[
      {at:0,label:'外側のガスが離れていく',description:'太陽の外側の層が宇宙へ流れ出します。太陽は超新星爆発を起こすほど重い恒星ではありません。'},
      {at:.3,label:'放出されたガスが広がる',description:'中心が十分に高温になると、紫外線を受けたガスが光り、惑星状星雲になります。将来の太陽でも星雲が光る場合を描いていますが、その明るさや姿は確定していません。'},
      {at:.7,label:'中心に白色矮星が残る',description:'地球ほどの小さい高温の中心部が白色矮星です。新しい核融合を続けて光るのではなく、残った熱で光っています。'},
      {at:.9,label:'若い白色矮星と星雲を観察',description:'画面は外層放出後の短い時期の模型です。この先、星雲はおおむね数万年で薄れ、見えなくなります。その後も白色矮星は長い時間をかけて冷えます。この長期の変化は描画していません。'}
    ]
  }
};
for(const event of Object.values(EVENTS)){for(const stage of event.stages)Object.freeze(stage);Object.freeze(event.stages);Object.freeze(event);}
export function eventForEra(era){return Object.hasOwn(EVENTS,era)?EVENTS[era]:null;}
export function normalizeEventProgress(value){return Number.isFinite(value)?Math.max(0,Math.min(1,value)):1;}
export function normalizeEventSpeed(value){return Number.isFinite(value)?Math.max(.25,Math.min(4,value)):1;}
export function eventStage(era,progress=1){
  const event=eventForEra(era);if(!event)return null;
  const p=normalizeEventProgress(progress);let index=0;
  for(let i=1;i<event.stages.length;i++)if(p>=event.stages[i].at)index=i;
  return {...event.stages[index],index,progress:p};
}
export function advanceEvent(state,seconds){
  const event=eventForEra(state.era),dt=Number.isFinite(seconds)?Math.max(0,Math.min(1,seconds)):0;
  if(!event||!state.eventPlaying||!dt)return state;
  const advanced=normalizeEventProgress(state.eventProgress)+dt*normalizeEventSpeed(state.eventSpeed)/event.durationSeconds;
  const eventProgress=advanced>=1-1e-12?1:advanced;
  return {...state,eventProgress,eventPlaying:eventProgress<1};
}
