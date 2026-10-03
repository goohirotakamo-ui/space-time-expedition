import {particleStage} from './early-universe-particles.js';

// Learning prose is separate from rendering notes and measured-record metadata.
// These are general scientific explanations, never laboratory results for an
// individual game sample. Sources and the limits of past/future inference are
// documented in docs/pdf-learning-sources.md (reviewed 2026-10-02).
const source=(title,url)=>Object.freeze({title,url});
export const LEARNING_ANALYSIS_SOURCES=Object.freeze({
  universe:source('NASA — The Universe’s Baby Picture','https://science.nasa.gov/universe/stories/quick-reads/what-can-we-learn-from-the-universes-baby-picture/'),
  nuclei:source('NASA WMAP — Cosmology','https://map.gsfc.nasa.gov/universe/WMAP_Universe.pdf'),
  formation:source('NASA — How Do Planets Form?','https://science.nasa.gov/exoplanets/how-do-planets-form/'),
  disk:source('NASA — How Did Our Solar System Form?','https://science.nasa.gov/astrobiology/learning-resources/alp/how-did-our-solar-system-form/'),
  rockyFormation:source('NASA — A Rocky Planet Forms','https://science.nasa.gov/resource/a-rocky-planet-forms/'),
  stars:source('NASA — Stars','https://science.nasa.gov/universe/stars/'),
  sun:source('NASA — Sun Facts','https://science.nasa.gov/sun/facts/'),
  mercury:source('NASA — Mercury Facts','https://science.nasa.gov/mercury/facts/'),
  venus:source('NASA — Venus Facts','https://science.nasa.gov/venus/venus-facts/'),
  earth:source('NASA — Earth Facts','https://science.nasa.gov/earth/facts/'),
  mars:source('NASA — Mars Facts','https://science.nasa.gov/mars/facts/'),
  jupiter:source('NASA — Jupiter Facts','https://science.nasa.gov/jupiter/jupiter-facts/'),
  saturn:source('NASA — Saturn Facts','https://science.nasa.gov/saturn/facts/'),
  uranus:source('NASA — Uranus Facts','https://science.nasa.gov/uranus/facts/'),
  neptune:source('NASA — Uranus and Neptune','https://science.nasa.gov/asset/hubble/uranus-and-neptune/'),
  iceGiants:source('NASA — Examining Ice Giants','https://science.nasa.gov/missions/webb/examining-ice-giants-with-nasas-webb-telescope/'),
  moon:source('NASA — Moon Composition and Structure','https://science.nasa.gov/moon/composition/'),
  moonFormation:source('NASA — Moon Formation','https://science.nasa.gov/moon/formation/'),
  moonMotion:source('NASA — Moon Facts','https://science.nasa.gov/moon/facts/'),
  io:source('NASA — Io Facts','https://science.nasa.gov/jupiter/jupiter-moons/io/facts/'),
  europa:source('NASA — Europa Facts','https://science.nasa.gov/jupiter/jupiter-moons/europa/europa-facts/'),
  ganymede:source('NASA — Ganymede Facts','https://science.nasa.gov/jupiter/jupiter-moons/ganymede/facts/'),
  callisto:source('NASA — Callisto Facts','https://science.nasa.gov/jupiter/jupiter-moons/callisto/facts/'),
  titan:source('NASA — Titan Facts','https://science.nasa.gov/saturn/moons/titan/facts/'),
  marsMoons:source('NASA — Mars Moons Facts','https://science.nasa.gov/mars/moons/facts/'),
  moonOrigins:source('NASA — MMX','https://science.nasa.gov/mission/mmx/'),
  ceres:source('NASA — Dawn: Science Highlights','https://science.nasa.gov/mission/dawn/toolkit/highlights/'),
  vesta:source('NASA — Vesta’s Internal Structure','https://science.nasa.gov/photojournal/vestas-internal-structure/'),
  vestaMeteorites:source('NASA Dawn — Vesta','https://science.nasa.gov/mission/dawn/science/vesta/'),
  pluto:source('NASA — Pluto Facts','https://science.nasa.gov/dwarf-planets/pluto/facts/'),
  asteroids:source('NASA — Asteroid Facts','https://science.nasa.gov/solar-system/asteroids/facts/'),
  itokawa:source('NASA — 25143 Itokawa','https://science.nasa.gov/solar-system/asteroids/25143-itokawa/'),
  itokawaMinerals:source('JAXA — Hayabusa Sample Curation','https://curation.isas.jaxa.jp/en/sample-curation/itokawa/'),
  halley:source('NASA — 1P/Halley','https://science.nasa.gov/solar-system/comets/1p-halley/'),
  comets:source('NASA — Comet Facts','https://science.nasa.gov/solar-system/comets/facts/'),
  cometIce:source('NASA — Genesis of a Comet','https://science.nasa.gov/photojournal/genesis-of-a-comet-artists-concept/'),
  whiteDwarf:source('NASA — White Dwarf Composition','https://science.nasa.gov/missions/hubble/nasas-hubble-uncovers-rare-white-dwarf-merger-remnant/'),
  whiteDwarfStructure:source('NASA — Stellar Evolution Questions','https://imagine.gsfc.nasa.gov/ask_astro/stars.html'),
  survivors:source('NASA — Possible Survivor Planet Around a White Dwarf','https://www.nasa.gov/news-release/nasa-missions-spy-first-possible-survivor-planet-hugging-white-dwarf-star/'),
  futureOrbits:source('NASA — Aging Into Gianthood','https://science.nasa.gov/exoplanets/resources/life-and-death/chapter-6/'),
  inverseSquare:source('NASA JPL — Calculating Solar Power in Space','https://www.jpl.nasa.gov/edu/resources/lesson-plan/calculating-solar-power-in-space/'),
  spectra:source('NASA — Continuous, Emission, and Absorption Spectra','https://science.nasa.gov/asset/webb/types-of-spectra-continuous-emission-and-absorption/'),
  nebula:source('NASA — Hubble Captures Stars Going Out in Style','https://science.nasa.gov/missions/hubble/hubble-captures-stars-going-out-in-style/'),
  galaxy:source('NASA — Hubble’s Galaxies','https://science.nasa.gov/mission/hubble/science/universe-uncovered/hubble-galaxies/'),
  minerals:source('NASA — Exploring the Moon: Rock ABCs','https://science.nasa.gov/wp-content/uploads/2024/01/exploring-the-moon-teachers-guide.pdf')
});

const PRESENT=Object.freeze({
  sun:'太陽は主に水素とヘリウムからなる恒星です。約1500万Kの中心で、水素の原子核が結びついてヘリウムになる核融合が起こり、エネルギーを生み出します。見える表面の光球は約5800Kで、黒点は周りより温度の低い場所です。',
  mercury:'水星は岩石と金属からなる地球型惑星です。内部の大きな金属の核を、ケイ酸塩を含む岩石の層が囲みます。表面には衝突でできたクレーターが多く、大気はごく薄いため昼と夜の温度差が大きくなります。自転は約59日、公転は約88日です。',
  venus:'金星は地球と似た大きさの岩石惑星で、内部には鉄を含む核があります。厚い大気の主成分は二酸化炭素で、その温室効果により地表は約460℃になります。上空の雲は主に硫酸の小さな粒でできており、地表を覆い隠しています。',
  earth:'地球は岩石と金属からなる惑星で、鉄やニッケルを主成分とする核を岩石の層が囲みます。表面には液体の水の海が広がり、白い雲は水滴や氷の粒です。現在の大気は約78％が窒素、約21％が酸素で、生命と大気は互いに関わっています。',
  mars:'火星は岩石の惑星で、中心には鉄・ニッケル・硫黄を含む核があります。地表が赤っぽいのは、岩石やちりに含まれる鉄が酸化しているためです。薄い大気の主成分は二酸化炭素です。谷や川の跡は、昔に液体の水が流れたことを示します。',
  jupiter:'木星は太陽系で最も大きな惑星で、主に水素とヘリウムからできています。見えているしま模様は大気の雲で、大赤斑は巨大な渦です。内部ほど圧力が高く、水素は液体のような状態になります。地球のような固い地面はありません。',
  saturn:'土星は主に水素とヘリウムからなる巨大な惑星で、表面のように見える部分は雲です。目立つ環は一枚の板ではなく、主に水の氷でできた無数の粒の集まりです。粒はそれぞれ土星の周りを公転しており、環にはすき間もあります。',
  uranus:'天王星の大気は主に水素とヘリウムで、少量のメタンが赤い光を吸収するため青緑色に見えます。内部には水やアンモニアなどの成分が多いと考えられています。巨大氷惑星と呼びますが、内部まで冷たい氷のかたまりではありません。自転軸が大きく傾いています。',
  neptune:'海王星は天王星と同じ巨大氷惑星です。大気は主に水素とヘリウムで、メタンによる光の吸収も青緑系の色に関係します。内部には水やアンモニアなどが多いと考えられています。上空には強い風が吹き、約165年かけて太陽を一周します。',
  moon:'月の表面は岩石で覆われ、ケイ素と酸素を含むケイ酸塩鉱物や、鉄・マグネシウムなどを含む鉱物があります。暗い「海」は水ではなく、昔の溶岩が固まった平原です。自転と地球を回る公転の周期がほぼ等しいため、地球にはほぼ同じ面を向けます。',
  io:'イオは木星の周りを回る岩石質の衛星です。木星やほかの衛星の重力で内部がくり返し変形し、その熱が活発な火山活動を支えます。表面には硫黄や硫黄の化合物があり、黄色や赤みのある色に関係します。薄い大気の主成分は二酸化硫黄です。',
  europa:'エウロパは岩石質の内部を水の氷が覆う木星の衛星です。表面にはすじのような割れ目があり、氷の下には塩分を含む海があると考えられています。鉄を含む中心核も推定されています。水があっても、それだけで生命の存在が確かめられたわけではありません。',
  ganymede:'ガニメデは太陽系で最も大きな衛星で、水星より直径が大きい天体です。中心に鉄を含む核、その外側に岩石と氷の層があると考えられています。明るいすじのある地形と暗い地形が見られ、氷の下には海があることを示す観測結果があります。',
  callisto:'カリストは岩石と水の氷を含む木星の衛星です。表面には多くのクレーターが残り、長い間に小天体が衝突してきた歴史が分かります。明るい部分には氷が関係しています。内部に液体の海がある可能性も研究されていますが、まだ確定していません。',
  titan:'タイタンは土星の衛星で、主に窒素からなる厚い大気と少量のメタンをもちます。大気でできる細かな有機物が橙色のもやになります。地表はとても低温で、水は氷として存在し、メタンやエタンは液体となって川や湖をつくっています。',
  phobos:'フォボスは火星の近くを回る小さな衛星で、丸くない形をしています。表面は岩石やちりで覆われ、大きなクレーターや溝が見られます。岩石の詳しい成分は研究中です。火星の自転より短い時間で一周し、長い時間をかけて火星へ近づいています。',
  deimos:'ダイモスはフォボスより小さく、火星から離れた所を回る衛星です。表面は岩石の細かな破片やちりで覆われ、でこぼこした形をしています。自転と公転の周期がほぼ等しく、火星には同じ面を向けます。詳しい成分や生まれ方は研究中です。',
  ceres:'ケレスは火星と木星の間の小惑星帯にある準惑星です。岩石のほかに水の氷や水を含む鉱物があり、白く明るい場所には塩類が見つかっています。探査機ドーンの調査は、内部の水と岩石が反応し、成分や地形を変えてきたことを示しています。',
  vesta:'ベスタは小惑星帯にある岩石質の天体です。誕生の初期に内部が熱くなって溶け、鉄が中心へ沈んで核をつくったと考えられています。表面には溶岩が固まった玄武岩質の岩石があります。大きな衝突で飛び出した破片の一部は、地球に隕石として届きました。',
  halley:'ハレー彗星は水の氷や岩石、ちりを含む核をもち、約76年で太陽を回ります。太陽に近づくと氷が気体になり、ちりも放出されて周りに広がります。太陽の光や太陽風の作用で尾ができます。核の表面は暗く、戻ってくるたびに少しずつ物質を失います。',
  pluto:'冥王星は太陽系の外側にある準惑星で、岩石と水の氷を多く含む天体です。地表には窒素やメタンなどの氷もあります。薄い大気の主成分は窒素です。氷が気体になることを昇華といい、地表の氷と大気の間で物質が行き来しています。',
  itokawa:'イトカワは、小さな岩や砂が重力で集まった小惑星です。「はやぶさ」が持ち帰った粒には、ケイ素と酸素を含むケイ酸塩鉱物や鉄・ニッケルの金属などが見つかりました。大きな天体が衝突で壊れ、その破片が再び集まったと考えられています。'
});
const BELT='小惑星帯には、太陽系ができたころの岩石や金属を含む天体が数多くあります。岩石の主な鉱物にはケイ素と酸素を含むケイ酸塩があり、鉄やニッケルを含む天体もあります。小惑星ごとに材料や熱を受けた歴史が異なり、衝突によって形も変わります。';
const NAMES={sun:'太陽',mercury:'水星',venus:'金星',earth:'地球',mars:'火星',jupiter:'木星',saturn:'土星',uranus:'天王星',neptune:'海王星',moon:'月',io:'イオ',europa:'エウロパ',ganymede:'ガニメデ',callisto:'カリスト',titan:'タイタン',phobos:'フォボス',deimos:'ダイモス',ceres:'ケレス',vesta:'ベスタ',halley:'彗星',pluto:'冥王星',itokawa:'小惑星'};
const ROCKY=new Set(['mercury','venus','earth','mars']);
const GAS=new Set(['jupiter','saturn']);
const ICE_GIANTS=new Set(['uranus','neptune']);
const ICY_MOONS=new Set(['europa','ganymede','callisto','titan']);

const EARLY=[
  '宇宙の誕生から約1秒ごろは非常に高温で、陽子・中性子・電子などが動き回っていました。水素の原子核は陽子1個です。原子核に電子が結びついた原子はまだ安定して存在できません。宇宙は膨張するとともに冷え、光と物質が強く関わり合っていました。',
  '誕生から初めの数分で、陽子と中性子が結びつき、ヘリウムなどの原子核ができました。主な元素は水素とヘリウムで、酸素や鉄などが多くつくられるのは後の恒星の中です。電子はまだ原子核から離れて動いており、原子核と原子は違う状態です。',
  '原子核ができた後も宇宙は高温で、電子は原子核に結びつかず動いていました。光は自由な電子にくり返し散らされるため、遠くへまっすぐ進みにくい状態です。宇宙が膨張して温度が下がると、やがて電子が原子核に結びつけるようになります。',
  '宇宙誕生から約38万年後、宇宙が冷えて水素の原子核と電子が結びつき、原子ができました。光を散らす自由な電子が減り、光が遠くまで進みやすくなった出来事を宇宙の晴れ上がりといいます。このころの主な元素は水素とヘリウムで、まだ恒星や太陽系はありません。'
];
function earlyText(world){
  // particleSeconds animates a fixed teaching stage; it is not cosmic age.
  const stage=particleStage(world);
  if(stage===0&&![1,2].includes(world.particleModelVersion))return '約138億年前、宇宙は非常に高温で密度の高い状態から膨張し、冷えてきました。最初から原子や星がそろっていたわけではありません。初めに陽子・中性子・電子などが現れ、その後に原子核、さらに原子ができました。元素の種類も、宇宙の歴史とともに増えていきます。';
  return EARLY[stage];
}
function starText(era){
  if(era==='solar-nebula')return '約46億年前、主に水素とヘリウムからなるガスが重力で集まり、原始太陽ができました。初めはガスが落ち込み、縮むときのエネルギーで熱くなります。中心の温度が十分に上がると水素の核融合が始まり、長い間安定して光る恒星へ育っていきます。';
  if(era==='young-earth')return '若い太陽は、主に水素とヘリウムでできた高温の天体です。中心で水素の原子核が結びつく核融合が始まると、ヘリウムとエネルギーが生まれます。その光や熱は周りの惑星の環境にも影響します。太陽と惑星は同じガスやちりの雲から生まれました。';
  if(era==='red-giant')return '約50億年後以降、太陽の中心で水素の核融合が続けられなくなると、外側が大きく広がる赤色巨星の段階に入ります。表面温度が下がるため赤みが増します。外側には水素やヘリウムが多くあり、さらに進むと中心でヘリウムから炭素や酸素をつくる反応が起こります。';
  if(era==='white-dwarf')return '太陽が外側のガスを失うと、地球ほどの大きさの白色矮星が残ると考えられています。内部は主に炭素と酸素で、外側には薄い水素やヘリウムの層があります。主系列星のように核融合で光り続けるのではなく、残った熱を放ちながら長い時間をかけて冷えていきます。';
  return PRESENT.sun;
}
function formingText(world,body){
  const name=NAMES[body.id]||'小天体';
  if(ROCKY.has(body.id))return `${name}のような岩石惑星は、ちりや微惑星が衝突して集まり、長い時間をかけて成長します。材料には、ケイ素と酸素を含むケイ酸塩の岩石や鉄・ニッケルなどの金属があります。衝突や放射性元素による熱で内部が溶けると、重い金属は中心へ沈み、核をつくります。`;
  if(GAS.has(body.id))return `${name}は、岩石や氷を含む材料から育ち、周りの水素やヘリウムのガスを大量に集めたと考えられています。巨大ガス惑星は円盤のガスがなくなる前に成長する必要があり、岩石惑星より早く育ったと考えられます。地球のような岩石だけの天体とは材料の割合が違います。`;
  if(ICE_GIANTS.has(body.id))return `${name}の材料には岩石に加え、水やアンモニア、メタンなどの氷が関わったと考えられています。冷たい場所では、気体になりやすい物質も固体として集まれます。さらに水素やヘリウムも取り込みますが、詳しい成長の順序や移動の道筋は研究中です。`;
  const icy=body.orbit>3||body.kind==='comet';
  return icy?'冷たい円盤の外側では、水などの氷が岩石やちりと一緒に集まり、微惑星へ育ったと考えられています。水は水素と酸素からなる物質です。小天体は衝突で合体したり壊れたりし、惑星の材料にもなります。現在の彗星や氷の多い天体は、この時代を調べる手がかりです。':'温かい円盤の内側では、岩石や金属の粒が集まり、微惑星へ成長したと考えられています。岩石にはケイ素と酸素を含むケイ酸塩鉱物、金属には鉄やニッケルなどがあります。衝突をくり返して大きくなったものが原始惑星となり、残った小天体も太陽の周りを回ります。';
}
function youngText(world,body){
  const name=NAMES[body.id]||'小天体';
  if(body.id==='earth')return '約46〜45億年前、地球は小天体との衝突を重ねて成長し、表面の岩石が広く溶ける時期がありました。材料のケイ酸塩は岩石の層に、鉄やニッケルは主に中心の核に分かれます。月は若い地球への巨大衝突で生まれたという説が有力で、詳しい過程は研究されています。';
  if(body.id==='moon')return '月は若い地球と大きな天体との衝突で飛び出した物質から生まれた、という説が有力です。初期には表面を溶けた岩石の海が覆い、冷えるにつれて鉱物が固まりました。岩石にはケイ素・酸素・マグネシウム・鉄などが含まれます。月の岩石の分析が、その歴史を調べる手がかりです。';
  if(ROCKY.has(body.id))return `若い${name}は岩石と金属を材料に成長しました。衝突や内部の熱によって岩石が溶け、鉄などの重い成分が中心へ沈むことで、核と岩石の層が分かれます。冷えると表面に固い地殻ができますが、成長や冷え方の速さは惑星ごとに違います。当時の大気の詳しい成分は研究中です。`;
  if(GAS.has(body.id))return `若い${name}は、水素とヘリウムを多く含む巨大な惑星です。周りのガスや固体の材料を集めて育ち、内部には形成のときの熱が残っています。上空には雲ができ、深い所ほど温度や圧力が高くなります。雲の模様は大気の動きによって変わり続けます。`;
  if(ICE_GIANTS.has(body.id))return `若い${name}は、岩石と、水・アンモニア・メタンなどを含む材料から育ったと考えられています。水素やヘリウムの大気ももちます。内部では温度と圧力が高いため、集まった氷がそのまま冷たい固体で残るとは限りません。初期の大気や成長の詳しい過程は研究中です。`;
  if(body.kind==='moon'){
    if(['phobos','deimos'].includes(body.id))return `${name}の起源には、小惑星が火星に捕らえられたという考えや、巨大衝突の破片が集まったという考えがあります。岩石に含まれる鉱物や元素を調べることが、起源を見分ける手がかりです。いつ生まれ、どのような材料が集まったかは、まだ確定していません。`;
    if(body.id==='io')return '木星の周りにもガスやちりの円盤があり、そこから大きな衛星が育ったと考えられています。イオは岩石を主な材料とする衛星です。ケイ素や酸素を含む鉱物や、鉄などを含む物質が材料になります。形成時の熱や重力による変形は、その後の内部と表面の変化に関わります。';
    if(body.id==='titan')return 'タイタンの材料には岩石や水の氷が含まれ、太陽系初期の冷たいガスとちりの円盤に由来すると考えられています。現在の窒素を多く含む大気も、材料の歴史を調べる手がかりです。岩石・氷・大気がいつどのように集まったか、詳しい形成過程はまだ研究中です。';
    return `${name}のような木星の大きな衛星は、木星の周りに残った円盤の物質から育ったと考えられています。材料には岩石と水の氷が含まれます。成長の熱や内部の放射性元素による熱で材料が変化し、岩石や氷の層が分かれることがあります。当時の表面の詳しい状態は研究中です。`;
  }
  return formingText(world,body);
}
function futureText(era,body){
  const name=NAMES[body.id]||'小惑星帯の天体',white=era==='white-dwarf';
  if(ROCKY.has(body.id))return white?`${name}のような岩石惑星が残る場合、赤色巨星となった太陽からの加熱を受けた後も、ケイ酸塩の岩石や鉄などが主な材料になります。太陽が外側のガスを失うと重力が弱まり、惑星の軌道は外へ広がります。個々の惑星が残るか、大気や地表がどう変わるかは研究中です。`:`${name}はケイ酸塩の岩石や鉄などを含む惑星です。太陽が赤色巨星になると、強い光や熱を受けて地表や大気が変化します。太陽に近い惑星は大きくふくらむ太陽に取り込まれる可能性があります。地球まで最後に取り込まれるかどうかなど、詳しい最期はまだ研究中です。`;
  if(GAS.has(body.id))return `${name}のような外側の巨大惑星は、太陽が外層を失った後も残る可能性があります。主な材料は水素とヘリウムです。${white?'残った高温の白色矮星からの光':'赤色巨星からの強い光'}は大気の温度や化学変化に影響します。太陽の質量が減ると軌道は外へ広がり、将来の雲や大気の状態は研究中です。`;
  if(ICE_GIANTS.has(body.id))return `${name}は、水やアンモニアなどを多く含む内部と、水素・ヘリウムを多く含む大気をもつ惑星です。太陽の変化による加熱で、大気や雲も変わると考えられます。外層放出後にも残る可能性があり、太陽の質量が減ると軌道は外へ広がります。将来の詳しい成分の割合は研究中です。`;
  const icy=ICY_MOONS.has(body.id)||body.id==='pluto'||body.id==='ceres'||body.kind==='comet';
  if(icy)return `${name}は、現在は岩石と水の氷などを含む天体です。太陽が赤色巨星になると、強い光による加熱で氷が溶けたり気体になったりし、表面が変わる可能性があります。岩石や氷がどれほど残るかは、太陽からの距離や天体の大きさにも関係し、個々の天体の将来は研究中です。`;
  return `${name}の主な材料は岩石で、ケイ素と酸素を含む鉱物や、鉄などを含む物質があります。赤色巨星からの加熱や、その後の軌道の変化によって、表面や運動が変わる可能性があります。太陽がガスを放出しても、周りの天体が必ず全部なくなるわけではなく、個々の運命は研究中です。`;
}
function skyText(era){
  if(era==='solar-nebula'||era==='young-earth')return '太陽系は約46億年前、天の川銀河の中にあるガスやちりから生まれました。ガスの主な成分は水素とヘリウムです。岩石や金属をつくるケイ素・酸素・鉄などの元素は、それより前の世代の星がつくった物質にも由来します。星の一生と惑星の材料はつながっています。';
  if(era==='white-dwarf')return '太陽のような星が外側のガスを放出すると、小さく熱い白色矮星が残ります。放出されたガスには水素やヘリウムなどが含まれ、中心からの紫外線を受けて光ることがあります。このようなガスの広がりを惑星状星雲と呼びます。ガスは広がりながら薄くなっていきます。';
  return '太陽系は天の川銀河の中にあります。銀河には多くの恒星と、ガスやちりがあり、恒星の主な材料は水素とヘリウムです。恒星の内部や最期の段階では、炭素・酸素・鉄などの元素もつくられます。宇宙へ戻った物質は、次の世代の星や惑星の材料になります。';
}
export function bodyLearningText(world={},body=null){
  const era=world?.era||'present';
  if(era==='early-universe')return earlyText(world);
  if(!body)return skyText(era);
  if(body.id==='sun')return starText(era);
  if(era==='solar-nebula')return formingText(world,body);
  if(era==='young-earth')return youngText(world,body);
  if(era==='red-giant'||era==='white-dwarf')return futureText(era,body);
  return PRESENT[body.id]||BELT;
}

const SAMPLE_TEXT=Object.freeze({
  'ancient-light':'この光は、宇宙が晴れ上がったころの様子を知る手がかりです。約38万年後、水素の原子核と電子が結びつき、光を散らす自由な電子が減りました。その後、宇宙の膨張で光の波長が伸び、現在は宇宙背景放射として観測されます。光そのものは水素やヘリウムという物質ではありません。',
  'ancient-light-b':'宇宙の晴れ上がりで進みやすくなった光は、初期宇宙の温度や密度を調べる手がかりです。現在観測される宇宙背景放射は、空の方向を変えてもほぼ同じ性質ですが、わずかな温度差もあります。この小さな違いは、後に恒星や銀河が育つもとになった密度の違いと関係します。',
  stardust:'太陽系が生まれた円盤のちりには、岩石の鉱物や金属の粒が含まれていたと考えられています。岩石の主な成分はケイ素と酸素を含むケイ酸塩で、金属には鉄やニッケルなどがあります。小さな粒が集まり、微惑星や惑星の材料になりました。高温の内側では水の氷は残りにくくなります。',
  ice:'円盤の冷たい外側では、岩石や金属のちりに加えて、水などの氷も集まることができました。水は水素と酸素からなる物質です。氷を含む粒が集まると、微惑星や巨大惑星の材料になります。太陽からの距離だけでなく、円盤の温度の変化によっても氷が残れる場所は変わります。',
  rock:'若い地球では、衝突などの熱で溶けた岩石が冷えると、鉱物が固まって固い岩石になりました。岩石にはケイ素と酸素を含むケイ酸塩鉱物が多く、鉄やマグネシウムなども含まれます。粒の大きさや組み合わせは冷え方を調べる手がかりになり、見た目だけで詳しい成分比は決められません。',
  'planet-fragments':'惑星が成長するころ、岩石や金属を含む小天体は衝突で合体したり、砕けて岩片になったりしました。材料にはケイ酸塩鉱物や鉄・ニッケルなどがあります。岩片の鉱物や元素を調べると、熱を受けた歴史や、もとの天体を考える手がかりが得られます。すべての岩片の起源が同じとは限りません。',
  'earth-light':'地球の海や陸、雲は太陽の光を反射しています。海の水は水素と酸素からなり、白い雲は水滴や氷の粒の集まりです。現在の大気は主に窒素と酸素です。反射した光を波長ごとに分けて調べると、大気中の水蒸気や二酸化炭素などが光を吸収する特徴を調べられます。',
  'moon-light':'月は太陽の光を反射して明るく見えます。月の岩石には、ケイ素・酸素・鉄・マグネシウムなどを含む鉱物があります。暗い「海」は、昔の溶岩が固まった場所です。反射光を波長ごとに分けたスペクトルは、どのような鉱物が表面にあるかを調べる手がかりになります。',
  'sun-light':'太陽は主に水素とヘリウムででき、中心の核融合が光や熱のエネルギーを生み出しています。光を波長ごとに分けたスペクトルには、太陽の大気が特定の波長を吸収した暗い線が見られます。線の位置を調べると、大気に含まれる元素を知る手がかりが得られます。',
  'far-sun-light':'同じ太陽でも、離れるほど小さく見え、単位面積に届く光は弱くなります。途中で光が吸収されない場合、太陽の中心からの距離が2倍になると届く光の強さは4分の1です。光のスペクトルを調べると、太陽の大気に含まれる元素の特徴が分かります。距離が変わっても太陽そのものの成分は変わりません。',
  'giant-light':'太陽が赤色巨星になると外側が大きく広がり、表面温度が下がるため赤みを帯びます。星の外側には水素やヘリウムが多く含まれます。光の色は温度、スペクトルの吸収線は大気の元素を調べる手がかりです。見かけの赤さだけで、どの元素がどれだけあるかを決めることはできません。',
  'far-giant-light':'赤色巨星から離れるほど見かけの大きさと届く光の強さは小さくなりますが、星の表面温度や成分が観測する場所によって変わるわけではありません。赤みは比較的低い表面温度に関係します。水素やヘリウムなどの元素を調べるには、光を波長ごとに分けたスペクトルが手がかりになります。',
  'dwarf-light':'白色矮星は、太陽が外側のガスを失った後に残る小さく熱い天体です。内部は主に炭素と酸素、外側の薄い大気は水素やヘリウムからなると考えられています。届く光のスペクトルから直接調べるのは主に大気の成分です。中心の成分は、星の進化の研究などと合わせて推定します。',
  'nebula-light':'星から放出されたガスは、中心に残った高温の天体の紫外線を受けて光ることがあります。惑星状星雲の光を波長ごとに分けると、水素や酸素などが出す、元素に特徴的な明るい線を調べられます。光の違いはガスの成分や温度を知る手がかりで、星が物質を宇宙へ返す過程を示します。'
});
export function sampleLearningText(id,world={}){
  // The two ancient-light samples are available at recombination, regardless of
  // the animation phase captured inside that fixed epoch.
  return SAMPLE_TEXT[id]||bodyLearningText(world,null);
}

const BODY_SOURCE_KEYS={sun:['sun','stars'],mercury:['mercury','minerals'],venus:['venus'],earth:['earth'],mars:['mars'],jupiter:['jupiter'],saturn:['saturn'],uranus:['uranus'],neptune:['neptune','iceGiants'],moon:['moon','moonMotion','moonFormation'],io:['io'],europa:['europa'],ganymede:['ganymede'],callisto:['callisto'],titan:['titan'],phobos:['marsMoons','moonOrigins'],deimos:['marsMoons','moonOrigins'],ceres:['ceres'],vesta:['vesta','vestaMeteorites'],halley:['halley','comets'],pluto:['pluto'],itokawa:['itokawa','itokawaMinerals']};
const SAMPLE_SOURCE_KEYS={
  'ancient-light':['universe','nuclei'],'ancient-light-b':['universe','nuclei'],stardust:['disk','formation','asteroids','minerals'],ice:['disk','formation','cometIce'],rock:['rockyFormation','earth','minerals'],'planet-fragments':['formation','asteroids','itokawaMinerals'],
  'earth-light':['earth','spectra'],'moon-light':['moon','moonFormation','spectra'],'sun-light':['sun','spectra'],'far-sun-light':['sun','spectra','inverseSquare'],'giant-light':['sun','stars','spectra'],'far-giant-light':['stars','spectra','inverseSquare'],'dwarf-light':['stars','whiteDwarf','whiteDwarfStructure','spectra'],'nebula-light':['nebula','spectra']
};
const resolveSources=keys=>[...new Set(keys)].map(key=>LEARNING_ANALYSIS_SOURCES[key]).filter(Boolean);
export function bodyLearningSources(world={},body=null){
  if(world?.era==='early-universe')return resolveSources(['universe','nuclei']);
  const keys=body?BODY_SOURCE_KEYS[body.id]||['asteroids']:['galaxy','disk','stars'];
  if(['solar-nebula','young-earth'].includes(world?.era))return resolveSources([...keys,'formation','disk','rockyFormation']);
  if(['red-giant','white-dwarf'].includes(world?.era))return resolveSources([...keys,'sun','stars','whiteDwarf','whiteDwarfStructure','survivors','futureOrbits','nebula']);
  return resolveSources(keys);
}
export function sampleLearningSources(id,world={}){return SAMPLE_SOURCE_KEYS[id]?resolveSources(SAMPLE_SOURCE_KEYS[id]):bodyLearningSources(world,null);}
