import {scientificNotes} from './scientific-context.js';
import {eventForEra} from './space-events.js';
import {eraConfig} from './solar-system.js';
import {formationStage} from './formation-model.js';
import {visualProfile} from './visual-science.js';

// These are the primary sources already reviewed in the scientific audit.
// The guide changes where the explanations appear, not the model or its data.
const SOURCES={
  'early-universe':[
    {title:'NASA：電子による光の散乱と宇宙の晴れ上がり',url:'https://science.nasa.gov/universe/stories/quick-reads/what-can-we-learn-from-the-universes-baby-picture/'},
    {title:'NASA Hubble：原子核の形成と原子になるまで',url:'https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-big-bang/'},
    {title:'ESA Planck：宇宙の晴れ上がりと宇宙背景放射',url:'https://www.esa.int/Science_Exploration/Space_Science/Planck/Planck_and_the_cosmic_microwave_background'},
    {title:'Planck Collaboration（2018）：宇宙年齢と宇宙論の観測値',url:'https://arxiv.org/pdf/1807.06209'},
    {title:'Chluba・Sunyaev（2009）：水素とヘリウムの再結合',url:'https://arxiv.org/pdf/0909.2378'}
  ],
  'solar-nebula':[
    {title:'NASA：惑星の形成と成長にかかる時間',url:'https://science.nasa.gov/exoplanets/how-do-planets-form/'},
    {title:'Batygin・Adams（2025）：若い木星の大きさの推定',url:'https://www.nature.com/articles/s41550-025-02512-y'},
    {title:'ESO：若い星の円盤で観測された水の雪線',url:'https://www.eso.org/public/news/eso1626/'}
  ],
  'young-earth':[
    {title:'NASA：月の形成と巨大衝突説',url:'https://science.nasa.gov/moon/formation/'},
    {title:'Dauphas・Pourmand（2011）：同位体から推定する火星の早い成長',url:'https://www.nature.com/articles/nature10077'},
    {title:'NASA：岩石惑星と巨大惑星の成長の違い',url:'https://science.nasa.gov/exoplanets/how-do-planets-form/'}
  ],
  'red-giant':[
    {title:'NASA：太陽の巨星化と惑星の将来',url:'https://science.nasa.gov/exoplanets/resources/life-and-death/chapter-6/'},
    {title:'Esseldeursほか（2026）：太陽の巨星期における地球の運命の研究',url:'https://arxiv.org/abs/2606.19575'},
    {title:'NASA/GSFC：巨星から白色矮星へ',url:'https://imagine.gsfc.nasa.gov/science/objects/dwarfs1.html'}
  ],
  'white-dwarf':[
    {title:'Blackmanほか（2021）／NASA：白色矮星のまわりに残る木星型惑星の観測',url:'https://ntrs.nasa.gov/citations/20220003106'},
    {title:'ESA/Hubble：惑星状星雲の発光と寿命',url:'https://esahubble.org/wordbank/planetary-nebula/'},
    {title:'NASA/GSFC：白色矮星の形成と冷却',url:'https://imagine.gsfc.nasa.gov/science/objects/dwarfs1.html'},
    {title:'Gesickiほか（2018）：太陽の将来の星雲が見える条件',url:'https://pure.manchester.ac.uk/ws/files/67641659/PNLF_article_f3.pdf'}
  ]
};
const CURRENT_SOURCES=[
  {title:'NASA/JPL：惑星の平均半径と自転・公転周期',url:'https://ssd.jpl.nasa.gov/planets/phys_par.html'},
  {title:'NASA Space Place：白い太陽光と大気による色の変化',url:'https://spaceplace.nasa.gov/blue-sky/en/'},
  {title:'Irwinほか（2024）：天王星と海王星の色の復元',url:'https://academic.oup.com/mnras/article/527/4/11521/7511973'},
  {title:'NASA/JPL：距離による光の量の変化',url:'https://www.jpl.nasa.gov/edu/resources/lesson-plan/collecting-light-inverse-square-law-demo/'}
];

function uniqueParagraphs(paragraphs){
  const seen=new Set();
  return paragraphs.filter(Boolean).map(paragraph=>{
    // The existing explanation modules occasionally repeat a whole sentence.
    // Keep distinct qualifications intact instead of paraphrasing their limits.
    return (paragraph.match(/[^。]+。?/g)||[]).filter(sentence=>{
      const key=sentence.replace(/\s+/g,'').replace(/。$/,'');
      if(seen.has(key))return false;
      seen.add(key);return true;
    }).join('');
  }).filter(Boolean);
}

export function scienceGuide(world={}){
  const era=eraConfig(world.era),current=['present','earth','sun'].includes(era.id);
  const snapshot={...world,era:era.id};
  const formation=formationStage(snapshot),event=eventForEra(era.id),visual=visualProfile(snapshot);
  const notes=scientificNotes(era.id).filter(note=>{
    // The selected visual profile states the active palette, while the source
    // links still explain both normal and enhanced observational images.
    if(current&&note.startsWith('「自然な色の目安」'))return false;
    // visual.backgroundNote carries the same historical-sky qualification.
    if(!current&&note.startsWith('過去・未来の星空は'))return false;
    return true;
  });
  return {
    label:current?'観測を参考にした模型':'研究を参考にした模型',
    paragraphs:uniqueParagraphs([
      era.note,
      era.id==='early-universe'&&[1,2].includes(world.particleModelVersion)&&'粒子と光の図は、宇宙の一部を拡大した説明模型です。最初は誕生から約1秒ごろで、ビッグバン直後の未知の状態や陽子・中性子ができるまでの過程は省略しています。数分後の核反応では途中の反応を省略し、陽子と中性子からヘリウム原子核ができる結果を示します。電子が結びつく時期は元素で異なり、約38万年後の水素の原子化を中心に示しています。光はこの時に初めて生まれたのではなく、それ以前から存在します。電子の雲は惑星のような軌道を表していません。',
      formation&&`いまの形成段階：${formation.label}（${formation.ageLabel}）。${formation.note}`,
      event?.note,
      ...notes,
      `${visual.colorLabel}：${visual.colorNote}`,
      // The early-universe colour note already covers the light and absence
      // of stars; adding its background note would repeat that same content.
      era.id!=='early-universe'&&`${visual.backgroundLabel}：${visual.backgroundNote}`
    ]),
    sources:(SOURCES[era.id]||CURRENT_SOURCES).map(source=>({...source}))
  };
}
