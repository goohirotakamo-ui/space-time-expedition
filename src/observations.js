import {AU_KM,LIGHT_KM_S,getBodies,eraConfig} from './solar-system.js';
import {eventStage} from './space-events.js';

// These are calculations from a saved model position, not pixel measurements.
// No inferred absolute luminosity or ancient/future temperature is supplied.
const number=value=>value.toLocaleString('ja-JP',{maximumSignificantDigits:4});
const row=(id,label,value,unit='',note='',numericValue=null)=>({id,label,value,unit,note,numericValue});
const result=(status,title,rows,summaryLines,note)=>({version:1,status,title,rows,summaryLines,note});
const unavailable=message=>result('unavailable','観測値を計算できません',
  [row('availability','計算の状態','未計算','',message)],
  ['観測値：未計算',message,'観測できる地点へ移動してください。'],message);

function earlyObservation(world){
  const stage=eventStage('early-universe',world.eventProgress),clear=stage.index===3;
  const temperature=clear?'約3,000':'とても高温';
  const light=clear?'遠くへ進みやすい':'電子に散らされる';
  const note=clear
    ?'約3000 Kは晴れ上がりのころの代表値です。地点ごとの実測値ではありません。恒星がないので星からの距離や逆二乗則は使いません。'
    :'高温だったことを表す段階です。演出の進み具合から温度や経過年数を計算していません。恒星はまだありません。';
  return result('early-universe','初期宇宙の観測メモ',[
    row('epoch','見ている段階',stage.label,'','演出の段階に対応する時代です。'),
    row('temperature-k','宇宙の代表温度',temperature,clear?'K':'',clear?'晴れ上がりのころの概数。画面の色から測った温度ではありません。':'数値ではなく、高温だったことを示す説明です。',clear?3000:null),
    row('stars','恒星','まだない','','太陽や地球、天の川もまだありません。'),
    row('light-state','光の進み方',light,'',clear?'水素原子ができ、自由な電子が少なくなります。':'自由な電子が多く、光は長い距離を直進しにくい状態です。')
  ],[stage.label,`代表温度：${temperature}${clear?' K':''}`,'恒星・太陽系：まだない',`光：${light}`],note);
}

/**
 * Return stable, JSON-safe teaching observations from the supplied world.
 * rows[].value is ready to display; numericValue retains unrounded quantities.
 * The caller can persist this versioned result alongside its world snapshot.
 */
export function observeWorld(world){
  if(!world||typeof world!=='object'||Array.isArray(world))return unavailable('観測地点の記録がありません。');
  const era=world.era??'present',config=eraConfig(era);
  if(typeof era!=='string'||config.id!==era)return unavailable('この時代の計算モデルはありません。');
  if(era==='early-universe')return earlyObservation(world);
  if(!Array.isArray(world.position)||world.position.length!==3||!world.position.every(Number.isFinite))return unavailable('観測地点の座標を確認できません。');
  const star=getBodies(world).find(body=>body.id==='sun');
  if(!star||!Number.isFinite(star.radius)||star.radius<=0)return unavailable('この時代の恒星を確認できません。');
  const distance=Math.hypot(...world.position.map((value,index)=>value-star.position[index]));
  if(!Number.isFinite(distance))return unavailable('観測地点が計算できる距離の範囲外です。');
  const distanceRow=row('distance-au',`${star.name}の中心からの距離`,number(distance),'AU','この記録の宇宙船の位置から計算。表面からの高さではありません。',distance);
  if(distance<=star.radius){
    const note='恒星の表面上・内部では、この真空の光量・到達時間モデルを使いません。恒星の外側へ移動してください。';
    return result('inside-star',`${star.name}の観測値`,[
      distanceRow,row('light-time-seconds','光の時間（距離÷光速）','計算対象外'),
      row('relative-flux','同じ時期の1 AUに対する光量','計算対象外')
    ],[`${star.name}の中心から ${number(distance)} AU`,'恒星の表面上または内部です。','光量・到達時間：計算対象外'],note);
  }
  const seconds=distance*(AU_KM/LIGHT_KM_S),relativeFlux=(1/distance)**2;
  if(!Number.isFinite(seconds)||!Number.isFinite(relativeFlux)||relativeFlux<=0)return unavailable('観測地点が計算できる距離の範囲外です。');
  const note='同じ時期・同じ恒星の1 AUでの光量を1とした計算値です。真空で全方向に均等に光る模型を使い、ちりの吸収や天体の影は含めません。時代をまたぐ光度の比較や、画面の明るさの測定値ではありません。';
  return result('calculated',`${star.name}の観測値`,[
    distanceRow,
    row('light-time-seconds','光の時間（距離÷光速）',number(seconds),'秒','中心からの距離を真空の光速で進む計算上の時間です。恒星内部で光が外へ出る時間は含みません。',seconds),
    row('relative-flux','同じ時期の1 AUに対する光量',number(relativeFlux),'倍','光に正面を向けた単位面積に届く量。1÷距離（AU）の2乗で計算します。',relativeFlux)
  ],[
    `${star.name}の中心から ${number(distance)} AU`,
    `光の時間：${number(seconds)} 秒（距離÷光速）`,
    `同じ時期の1 AUの光量を1：${number(relativeFlux)}`,
    '真空の計算値。画面の明るさとは別。'
  ],note);
}

export const observationLines=world=>observeWorld(world).summaryLines;
