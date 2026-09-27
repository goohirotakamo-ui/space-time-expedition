import {SOLAR_SCENE} from './solar-system.js';
export const SCENES = [
  { id:'early-universe', name:'宇宙の夜明け', era:'宇宙誕生から約38万年後', short:'宇宙の始まり', period:'過去', number:'01', accent:'#edbc77', location:'宇宙初期の観測地点', tag:'科学に基づく再現',
    summary:'まだ星のない宇宙に、光が広がっている。',
    facts:['宇宙は約138億年前、高温で密度の高い状態から膨張してきました。','誕生から約38万年後、光が遠くまで進めるようになりました。','このころはまだ、星も地球もありません。画面の色や明るさは理解を助ける再現です。'],
    question:'今の宇宙と、何がちがうだろう？', sample:'ancient-light', source:'https://science.nasa.gov/universe/overview/' },
  { id:'solar-nebula', name:'太陽系のはじまり', era:'約46億年前', short:'太陽系の誕生', period:'過去', number:'02', accent:'#e5a771', location:'若い太陽の周囲', tag:'科学に基づく再現',
    summary:'ガスとちりの円盤から、太陽系が生まれていく。',
    facts:['ガスとちりが重力で集まり、中心で太陽が生まれました。','周りを回るちりが集まり、衝突を繰り返して惑星ができていきました。','太陽から遠い、低温の場所には氷もありました。'],
    question:'小さなちりが集まると、何になるだろう？', sample:'stardust', extraSample:'ice', source:'https://spaceplace.nasa.gov/solar-system-formation/en/' },
  { id:'young-earth', name:'地球の誕生', era:'約46億年前ごろ', short:'地球の誕生', period:'過去', number:'03', accent:'#ffac75', location:'誕生期の地球の上空', tag:'科学に基づく再現',
    summary:'赤く熱い地球。今の青い地球とは、ずいぶんちがう。',
    facts:['地球は約46億年前ごろ、小さな天体が集まってできました。','衝突などで熱くなり、表面が大きく溶けた時期がありました。','この風景は誕生期の一場面の再現です。岩石は冷えて固まった部分を模した試料です。'],
    question:'今の地球にあって、この地球に見えないものは？', sample:'rock', source:'https://science.nasa.gov/earth/facts/' },
  { id:'earth', name:'青い地球', era:'現在', short:'現在の地球', period:'現在', number:'04', accent:'#78cce4', location:'現在の地球の上空', tag:'観測をもとにした再現',
    summary:'海、雲、大地。長い時間をかけて変わってきた地球。',
    facts:['地球の表面のおよそ7割は、海に覆われています。','大気と水があり、私たちを含む多くの生物が暮らしています。','誕生期の地球の写真と並べて、色や表面の様子を比べましょう。'],
    question:'誕生期の地球から、どこが変わった？', sample:'earth-light', source:'https://science.nasa.gov/earth/facts/' },
  { id:'sun', name:'現在の太陽', era:'現在', short:'現在の太陽', period:'現在', number:'05', accent:'#f5d083', location:'太陽の観測軌道', tag:'観測をもとにした再現',
    summary:'私たちに光と熱を届ける、ひとつの恒星。',
    facts:['太陽は、自ら光を出す恒星です。','中心では水素からヘリウムができる核融合が起き、エネルギーを生み出しています。','地球は太陽の周りを回っています。太陽の光は地球まで約8分20秒かかります。'],
    question:'未来の太陽も、今と同じ姿だろうか？', sample:'sun-light', source:'https://science.nasa.gov/sun/facts/' },
  { id:'red-giant', name:'赤色巨星になった太陽', era:'約50億年後以降', short:'太陽の未来', period:'未来', number:'06', accent:'#ef997c', location:'未来の太陽の観測軌道', tag:'科学に基づく未来の予測',
    summary:'太陽が大きくふくらみ、赤みを帯びている。',
    facts:['太陽は将来、中心の水素を使い果たし、赤色巨星へ変わると考えられています。','今よりずっと大きくなり、表面の温度は低くなります。','画像は見やすい大きさに調整しています。現在の太陽との実際の大きさは比較カードで確認できます。'],
    question:'色と大きさに、どんな変化がある？', sample:'giant-light', source:'https://science.nasa.gov/exoplanets/stars/' },
  { id:'white-dwarf', name:'白色矮星になった太陽', era:'赤色巨星の時代よりさらに未来', short:'太陽の一生の終末', period:'未来', number:'07', accent:'#bbd5fc', location:'太陽の晩年の観測地点', tag:'科学に基づく未来の予測',
    summary:'外側のガスが広がり、小さな熱い中心が残る。',
    facts:['太陽は外側のガスを宇宙へ放出し、中心に白色矮星が残ると考えられています。','白色矮星は小さく、とても密度の高い天体です。長い時間をかけて冷えていきます。','太陽は超新星爆発を起こさず、ブラックホールにもなりません。'],
    question:'太陽の一生を、どんな言葉で伝えたい？', sample:'dwarf-light', source:'https://science.nasa.gov/resource/the-life-cycle-of-a-sun-like-star-annotated/' }
].map(s => ({...s, image:`assets/scenes/${s.id}.png`}));

export const SAMPLES = [
  { id:'ancient-light', name:'太古の光の記録', scene:'early-universe', type:'観測データ', method:'光の観測装置', note:'光が進めるようになったころの宇宙を、観測データとして記録。光を容器に入れたものではありません。', kind:'data', color:'#efc485' },
  { id:'stardust', name:'太陽系のちり', scene:'solar-nebula', type:'物質サンプル', method:'集じんドローン', note:'惑星の材料になった、小さな固体の粒を模したサンプル。粒の色や大きさを見てみよう。', kind:'material', image:'assets/samples/stardust.png' },
  { id:'ice', name:'円盤の外側の氷', scene:'solar-nebula', type:'物質サンプル', method:'低温域への探査ドローン', note:'太陽から遠い冷たい領域で採集する設定。ちりを含んだ氷の模擬サンプルです。', kind:'material', image:'assets/samples/ice.png' },
  { id:'rock', name:'地球の岩石', scene:'young-earth', type:'物質サンプル', method:'探査ドローン', note:'熱い地球で冷えて固まった部分を模した岩石。ざらつきや小さな粒、割れ目を観察しよう。', kind:'material', image:'assets/samples/rock.png' },
  { id:'earth-light', name:'青い地球の観測記録', scene:'earth', type:'観測データ', method:'光の観測装置', note:'海や雲がある現在の地球の姿を記録。誕生期の地球と比べる手がかりになります。', kind:'data', color:'#77d1e5' },
  { id:'sun-light', name:'現在の太陽の光', scene:'sun', type:'観測データ', method:'光の観測装置', note:'現在の太陽の光を観測した記録。未来の太陽の光と見比べよう。', kind:'data', color:'#f5d185' },
  { id:'giant-light', name:'赤色巨星の光', scene:'red-giant', type:'観測データ', method:'光の観測装置', note:'未来の太陽の光の模擬観測。現在より表面温度が低く、赤みを帯びると考えられています。', kind:'data', color:'#ee9674' },
  { id:'dwarf-light', name:'白色矮星の観測記録', scene:'white-dwarf', type:'観測データ', method:'光の観測装置', note:'太陽の中心に残る、小さく熱い天体を模擬観測した記録です。', kind:'data', color:'#b8d4ff' }
];

export const COMPARISONS = [
  {id:'earth-history', name:'地球の昔と今', scenes:['young-earth','earth'], hint:'色・雲・海の有無を見比べよう。'},
  {id:'sun-history', name:'太陽の今と未来', scenes:['sun','red-giant'], hint:'色と大きさの変化に注目しよう。画像の縮尺は同じではありません。'}
];
export const RANKS = ['見習い調査員','宇宙探検家','星の調査員','時空調査員','宇宙の案内人'];
export const RANK_HINTS = ['旅を始める','初めての撮影・採集','ミッションを1つ達成','3つのミッションを達成','3ミッションを終えて発表PDFを作成'];
export const MISSIONS = [
  { id:'origin', title:'宇宙の始まりを記録しよう', badge:'宇宙の記録係', description:'まだ星のない宇宙を観察して、写真に残す。', tasks:[
    {type:'observe', scene:'early-universe', label:'宇宙の夜明けを観察する'},
    {type:'photo', scene:'early-universe', label:'宇宙の夜明けを撮影する'}]},
  { id:'formation', title:'太陽系と地球の誕生を調べよう', badge:'太陽系の調査員', description:'惑星の材料と、誕生期の地球を調べる。', tasks:[
    {type:'sample', sample:'stardust', scene:'solar-nebula', label:'太陽系のちりを採集する'},
    {type:'photo', scene:'young-earth', label:'誕生期の地球を撮影する'},
    {type:'sample', sample:'rock', scene:'young-earth', label:'地球の岩石を採集する'}]},
  { id:'sun-life', title:'太陽の今と未来を比べよう', badge:'太陽の観測員', description:'今の太陽から、赤色巨星、白色矮星へ。', tasks:[
    {type:'photo', scene:'sun', label:'現在の太陽を撮影する'},
    {type:'photo', scene:'red-giant', label:'赤色巨星の太陽を撮影する'},
    {type:'observe', scene:'white-dwarf', label:'白色矮星を観察する'}]}
];
export const sceneById = id => id==='solar-system'?SOLAR_SCENE:SCENES.find(s => s.id === id);
export const sampleById = id => SAMPLES.find(s => s.id === id);
