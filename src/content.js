import {SOLAR_SCENE} from './solar-system.js';
export const SCENES = [
  { id:'early-universe', name:'宇宙の晴れ上がり', era:'宇宙誕生から約38万年後', short:'宇宙の始まり', period:'過去', number:'01', accent:'#edbc77', location:'宇宙初期の観測地点', tag:'科学に基づく想像模型',
    summary:'まだ星のない宇宙に、光が広がっている。',
    facts:['宇宙は約138億年前、高温で密度の高い状態から膨張してきました。','約38万年後、水素原子ができ、自由な電子による光の散乱が減って、光が遠くまで進みやすくなりました。','このころは約3000 Kで、まだ星も地球もありません。画面の色や明るさは説明用の模型です。'],
    question:'今の宇宙と、何がちがうだろう？', sample:'ancient-light', source:'https://science.nasa.gov/universe/overview/' },
  { id:'solar-nebula', name:'太陽系のはじまり', era:'約46億年前', short:'太陽系の誕生', period:'過去', number:'02', accent:'#e5a771', location:'若い太陽の周囲', tag:'科学に基づく想像模型',
    summary:'ガスとちりの円盤から、太陽系が生まれていく。',
    facts:['ガスとちりが重力で集まり、中心で太陽が生まれました。','周りのちりや天体が集まり、衝突を重ねて惑星になりました。画面は異なる形成段階を一緒に示す模型です。','内側には岩石や金属の粒があり、低温の外側には氷もありました。氷が残れる境界は、時期によって変わります。'],
    question:'小さなちりが集まると、何になるだろう？', sample:'stardust', extraSample:'ice', source:'https://spaceplace.nasa.gov/solar-system-formation/en/' },
  { id:'young-earth', name:'地球の誕生', era:'約46〜45億年前の形成期', short:'地球の誕生', period:'過去', number:'03', accent:'#ffac75', location:'誕生期の地球の上空', tag:'科学に基づく想像模型',
    summary:'赤く熱い地球。今の青い地球とは、ずいぶんちがう。',
    facts:['地球は約46〜45億年前、小さな天体が集まり、長い時間をかけて成長しました。','衝突で表面が大きく溶けた時期がありました。月をつくった巨大衝突は、太陽系の形成開始から数千万年後と考えられ、詳しい時期は研究中です。','この風景は形成期の想像模型です。採集する岩石は、冷えて固まった部分を模した試料です。'],
    question:'今の地球にあって、この地球に見えないものは？', sample:'rock', source:'https://science.nasa.gov/earth/facts/' },
  { id:'earth', name:'青い地球', era:'現在', short:'現在の地球', period:'現在', number:'04', accent:'#78cce4', location:'現在の地球の上空', tag:'観測をもとにした模型',
    summary:'海、雲、大地。長い時間をかけて変わってきた地球。',
    facts:['地球の表面のおよそ7割は、海に覆われています。','大気と水があり、私たちを含む多くの生物が暮らしています。','誕生期の地球の写真と並べて、色や表面の様子を比べましょう。'],
    question:'誕生期の地球から、どこが変わった？', sample:'earth-light', source:'https://science.nasa.gov/earth/facts/' },
  { id:'sun', name:'現在の太陽', era:'現在', short:'現在の太陽', period:'現在', number:'05', accent:'#f5d083', location:'太陽の観測軌道', tag:'観測をもとにした模型',
    summary:'私たちに光と熱を届ける、ひとつの恒星。',
    facts:['太陽は、自ら光を出す恒星です。','中心では水素からヘリウムができる核融合が起き、エネルギーを生み出しています。','地球は太陽の周りを回っています。太陽の光は地球まで約8分20秒かかります。'],
    question:'未来の太陽も、今と同じ姿だろうか？', sample:'sun-light', source:'https://science.nasa.gov/sun/facts/' },
  { id:'red-giant', name:'赤色巨星になった太陽', era:'約50億年後以降', short:'太陽の未来', period:'未来', number:'06', accent:'#ef997c', location:'未来の太陽の観測軌道', tag:'研究をもとにした未来の模型',
    summary:'太陽が大きくふくらみ、赤みを帯びている。',
    facts:['太陽は将来、中心の水素を使い果たし、赤色巨星へ変わると考えられています。','今よりずっと大きくなり、表面の温度は低くなります。地球が最終的に残るかは不確かです。','画面の姿や大きさは、進化の一段階を示す模型です。比較カードの図も、同じ縮尺の実測画像ではありません。'],
    question:'色と大きさに、どんな変化がある？', sample:'giant-light', source:'https://science.nasa.gov/exoplanets/stars/' },
  { id:'white-dwarf', name:'白色矮星になった太陽', era:'赤色巨星の時代よりさらに未来', short:'太陽の一生の終末', period:'未来', number:'07', accent:'#bbd5fc', location:'太陽の晩年の観測地点', tag:'研究をもとにした未来の模型',
    summary:'外側のガスが広がり、小さな熱い中心が残る。',
    facts:['太陽は外側のガスを放出し、小さく密度の高い白色矮星を残すと考えられています。超新星爆発やブラックホールにはなりません。','画面は外層を放出した後の短い時期を描く一案です。太陽がこのように見える星雲をつくるか、色や形がどうなるかは確定していません。','ガスは広がって薄れます。その後も白色矮星は、残った熱で光りながら、長い時間をかけて冷えていきます。'],
    question:'太陽の一生を、どんな言葉で伝えたい？', sample:'dwarf-light', source:'https://science.nasa.gov/resource/the-life-cycle-of-a-sun-like-star-annotated/' }
].map(s => ({...s, image:`assets/scenes/${s.id}.png`}));

export const SAMPLES = [
  { id:'ancient-light', name:'太古の光の記録', scene:'early-universe', type:'観測データ', method:'光の観測装置', note:'約3000 Kだった晴れ上がりのころの光を模擬観測した記録です。宇宙の膨張で光の波長が伸び、現在は約2.7 Kの宇宙背景放射として観測されます。光を容器に入れたものではありません。', kind:'data', color:'#efc485' },
  { id:'ancient-light-b', name:'別の地点の太古の光', scene:'early-universe', type:'観測データ', method:'光の観測装置', note:'別の地点からも、ほぼ同じ性質の光を得る模擬観測です。初期の宇宙はほぼ一様でした。地点ごとに違う元素がかたまっているという意味ではありません。', kind:'data', color:'#ebc28c' },
  { id:'stardust', name:'太陽系のちり', scene:'solar-nebula', type:'物質サンプル', method:'集じんドローン', note:'惑星の材料になった、小さな固体の粒を模したサンプル。粒の色や大きさを見てみよう。', kind:'material', image:'assets/samples/stardust.png' },
  { id:'ice', name:'円盤の外側の氷', scene:'solar-nebula', type:'物質サンプル', method:'低温域への探査ドローン', note:'太陽から遠い冷たい領域で採集する設定。外側には岩石や金属の粒だけでなく氷もありました。ちりを含んだ氷の模擬サンプルです。', kind:'material', image:'assets/samples/ice.png' },
  { id:'rock', name:'地球の岩石', scene:'young-earth', type:'物質サンプル', method:'探査ドローン', note:'熱い地球で冷えて固まった部分を模した岩石。ざらつきや小さな粒、割れ目を観察しよう。', kind:'material', image:'assets/samples/rock.png' },
  { id:'planet-fragments', name:'地球の周辺の岩片', scene:'young-earth', type:'物質サンプル', method:'集じんドローン', note:'惑星の材料になった小さな天体の岩片を模した試料です。地球の周辺に残る物質を調べる設定で、特定の巨大衝突から来たと断定したものではありません。画像は岩の粒を表す共通の模型です。', kind:'material', image:'assets/samples/stardust.png' },
  { id:'earth-light', name:'青い地球の観測記録', scene:'earth', type:'観測データ', method:'光の観測装置', note:'海や雲がある現在の地球の姿を記録。誕生期の地球と比べる手がかりになります。', kind:'data', color:'#77d1e5' },
  { id:'moon-light', name:'月の表面の観測記録', scene:'earth', type:'観測データ', method:'光の観測装置', note:'月の近くで岩石の表面を観測した記録。月には、現在の地球のような広い海や厚い大気はありません。月が反射する太陽の光を記録しています。', kind:'data', color:'#c8c4b9' },
  { id:'sun-light', name:'現在の太陽の光', scene:'sun', type:'観測データ', method:'光の観測装置', note:'現在の太陽の光を観測した記録。未来の太陽の光と見比べよう。', kind:'data', color:'#f5d185' },
  { id:'far-sun-light', name:'離れた地点の太陽の光', scene:'sun', type:'観測データ', method:'光の観測装置', note:'同じ太陽を離れた場所から観測した記録。遠いほど単位面積に届く光は弱くなります。離れたからといって太陽そのものの色や表面温度が変わるわけではありません。', kind:'data', color:'#f5d185' },
  { id:'giant-light', name:'赤色巨星の光', scene:'red-giant', type:'観測データ', method:'光の観測装置', note:'未来の太陽の光の模擬観測。現在より表面温度が低く、赤みを帯びると考えられています。', kind:'data', color:'#ee9674' },
  { id:'far-giant-light', name:'離れた地点の赤色巨星の光', scene:'red-giant', type:'観測データ', method:'光の観測装置', note:'赤色巨星を離れた場所から模擬観測した記録。近い地点と比べると星が小さく見え、単位面積に届く光も弱くなります。同じ時期の同じ星なので、表面温度が場所ごとに変わるわけではありません。', kind:'data', color:'#ee9674' },
  { id:'dwarf-light', name:'白色矮星の観測記録', scene:'white-dwarf', type:'観測データ', method:'光の観測装置', note:'太陽の中心に残る、小さく熱い天体を模擬観測した記録です。', kind:'data', color:'#b8d4ff' },
  { id:'nebula-light', name:'放出されたガスの光', scene:'white-dwarf', type:'観測データ', method:'光のスペクトル観測装置', note:'放出されたガスが中心の高温の天体に照らされて光る、一つの予測例の模擬記録です。星雲が見える期間は限られ、太陽の星雲の姿は未確定です。ガスを容器に回収したものではありません。', kind:'data', color:'#91cee2' }
];

export const COMPARISONS = [
  {id:'earth-history', name:'地球の昔と今', scenes:['young-earth','earth'], hint:'色・雲・海の有無を見比べよう。'},
  {id:'sun-history', name:'太陽の今と未来', scenes:['sun','red-giant'], hint:'色と大きさの変化に注目しよう。画像の縮尺は同じではありません。'}
];
export const RANKS = ['見習い調査員','宇宙探検家','星の調査員','時空調査員','宇宙の案内人'];
export const RANK_HINTS = ['旅を始める','初めての撮影・採集','ミッションを1つ達成','3つのミッションを達成','3ミッションを終えて発表PDFを作成'];
// Retained for saved expeditions that started before individual assignments.
export const MISSIONS = [
  { id:'origin', title:'宇宙の始まりを記録しよう', badge:'宇宙の記録係', description:'まだ星のない宇宙を観察して、写真に残す。', tasks:[
    {type:'observe', scene:'early-universe', label:'宇宙の晴れ上がりを観察する'},
    {type:'photo', scene:'early-universe', label:'宇宙の晴れ上がりを撮影する'}]},
  { id:'formation', title:'太陽系と地球の誕生を調べよう', badge:'太陽系の調査員', description:'惑星の材料と、誕生期の地球を調べる。', tasks:[
    {type:'sample', sample:'stardust', scene:'solar-nebula', label:'太陽系のちりを採集する'},
    {type:'photo', scene:'young-earth', label:'誕生期の地球を撮影する'},
    {type:'sample', sample:'rock', scene:'young-earth', label:'地球の岩石を採集する'}]},
  { id:'sun-life', title:'太陽の今と未来を比べよう', badge:'太陽の観測員', description:'今の太陽から、赤色巨星、白色矮星へ。', tasks:[
    {type:'photo', scene:'sun', label:'現在の太陽を撮影する'},
    {type:'photo', scene:'red-giant', label:'赤色巨星の太陽を撮影する'},
    {type:'observe', scene:'white-dwarf', label:'白色矮星を観察する'}]}
];
// Each slot offers equivalent ways to investigate the same part of the unit.
// Fixed era groups keep every assignment at eight tasks across all seven stops.
export const MISSION_POOLS = [
  {id:'origin',title:'宇宙の始まりから惑星の材料へ',badge:'宇宙の記録係',description:'まだ星のない宇宙と、惑星の材料が集まる時代を調べる。',taskChoices:[
    [
      {type:'photo',scene:'early-universe',label:'宇宙の晴れ上がりを撮影する'},
      {type:'sample',scene:'early-universe',sample:'ancient-light',label:'晴れ上がりの観測点Aで太古の光を記録する'},
      {type:'sample',scene:'early-universe',sample:'ancient-light-b',label:'晴れ上がりの観測点Bで太古の光を記録する'}
    ],
    [
      {type:'sample',scene:'solar-nebula',sample:'stardust',label:'太陽系のはじまりで内側のちりを採集する'},
      {type:'sample',scene:'solar-nebula',sample:'ice',label:'太陽系のはじまりで外側の氷を採集する'}
    ]
  ]},
  {id:'formation',title:'地球の昔と今を比べよう',badge:'太陽系の調査員',description:'誕生期と現在の地球を撮影し、指定された場所のサンプルも集める。',taskChoices:[
    [{type:'photo',scene:'young-earth',label:'誕生期の地球を撮影する'}],
    [{type:'photo',scene:'earth',label:'現在の青い地球を撮影する'}],
    [
      {type:'sample',scene:'young-earth',sample:'rock',label:'誕生期の地球の上空で岩石を採集する'},
      {type:'sample',scene:'young-earth',sample:'planet-fragments',label:'誕生期の地球の周辺で岩片を採集する'},
      {type:'sample',scene:'earth',sample:'earth-light',label:'現在の地球の観測点で海や雲を記録する'},
      {type:'sample',scene:'earth',sample:'moon-light',label:'現在の月の観測点で岩石の表面を記録する'}
    ]
  ]},
  {id:'sun-life',title:'太陽の一生をたどろう',badge:'太陽の観測員',description:'現在の太陽、赤色巨星、白色矮星の3つの時代に記録を残す。',taskChoices:[
    [
      {type:'photo',scene:'sun',label:'現在の太陽を撮影する'},
      {type:'sample',scene:'sun',sample:'sun-light',label:'現在の太陽に近い観測点で光を記録する'},
      {type:'sample',scene:'sun',sample:'far-sun-light',label:'現在の太陽から離れた観測点で光を記録する'}
    ],
    [
      {type:'photo',scene:'red-giant',label:'赤色巨星の太陽を撮影する'},
      {type:'sample',scene:'red-giant',sample:'giant-light',label:'赤色巨星に近い観測点で光を記録する'},
      {type:'sample',scene:'red-giant',sample:'far-giant-light',label:'赤色巨星から離れた観測点で光を記録する'}
    ],
    [
      {type:'photo',scene:'white-dwarf',label:'白色矮星を撮影する'},
      {type:'sample',scene:'white-dwarf',sample:'dwarf-light',label:'白色矮星の観測点で光を記録する'},
      {type:'sample',scene:'white-dwarf',sample:'nebula-light',label:'白色矮星の周囲に放出されたガスの光を記録する'}
    ]
  ]}
];
export const sceneById = id => id==='solar-system'?SOLAR_SCENE:SCENES.find(s => s.id === id);
export const sampleById = id => SAMPLES.find(s => s.id === id);
