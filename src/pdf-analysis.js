import {sceneById,sampleById} from './content.js';
import {bodyById,defaultSolar,length,sub} from './solar-system.js';
import {recordScience} from './record-science.js';
import {getRecordedSampleLocation} from './sample-locations.js';
import {bodyLearningText,sampleLearningText} from './learning-analysis-content.js';

// Dates, subjects and observations come from the saved expedition record.
// Learning prose is source-reviewed content, never an inferred assay of pixels.
function sceneFor(item,science){
  return science&&science.world.era!=='present'?sceneById(science.world.era):sceneById(item.scene==='solar-system'?'earth':item.scene);
}
function subjectOf(science){return science?bodyById(science.world.subject,science.world):null;}
const subjectName=body=>body.name.replace(/の模型/g,'');
const recordedAge=(science,scene)=>science?.legacy&&science.world.era==='solar-nebula'?scene?.era:science?.age||scene?.era||'年代未記録';
function location(science,site){
  if(site)return site.label;
  if(science.world.era==='early-universe')return 'まだ星のない宇宙の一部';
  const body=subjectOf(science),position=science.world.position;
  if(body&&Array.isArray(position)&&position.length===3&&position.every(Number.isFinite)&&length(sub(position,body.position))<=body.radius*30)return `${subjectName(body)}の近く`;
  return '太陽系内の観測地点';
}
function observationSentence(science){
  const o=science?.observation;
  if(!o)return '';
  const value=id=>o.rows.find(row=>row.id===id)?.value;
  if(o.status==='early-universe')return value('temperature-k')==='約3,000'?'晴れ上がりのころの宇宙の温度は約3,000 Kでした。':'';
  if(o.status==='calculated'){
    return `恒星の中心から${value('distance-au')} AUの地点です。光がこの距離を真空中で進む時間は${value('light-time-seconds')}秒です。吸収や遮りがなければ、届く光量は同じ時期のこの星の1 AU地点の${value('relative-flux')}倍になります。`;
  }
  if(o.status==='inside-star')return `恒星の中心から${value('distance-au')} AUの地点です。恒星内部では光が物質と何度もぶつかるため、外へ出るまでに長い時間がかかります。`;
  return '';
}
function feature(science,scene){
  const world=science?.world||defaultSolar(scene?.id||'present');
  const body=science?subjectOf(science):bodyById(world.target,world);
  return bodyLearningText(world,body);
}
function stageSentence(science){
  return science?.world.era==='solar-nebula'&&!science.legacy?`「${science.stage}」の段階です。`:'';
}
function singleAnalysis(item){
  const science=recordScience(item.record),scene=sceneFor(item,science),sample=item.kind==='sample'?sampleById(item.record.id):null;
  const name=science?.world.era==='early-universe'?'宇宙の始まり':scene?.name||'宇宙',age=recordedAge(science,scene);
  if(!science){
    const action=sample?`「${sample.name}」を${sample.kind==='material'?'採集':'観測'}しました`:'宇宙の様子を撮影しました';
    const knowledge=sample?sampleLearningText(sample.id,defaultSolar(scene?.id||'present')):feature(null,scene);
    return `「${name}」（${age}）で、${action}。詳しい観測地点は記録されていません。${knowledge}`;
  }
  const site=sample?getRecordedSampleLocation(item.record):null,body=subjectOf(science);
  const action=sample?`「${sample.name}」を${sample.kind==='material'?'採集':'観測'}しました`:`${body?subjectName(body):'宇宙の様子'}を撮影しました`;
  return `「${name}」（${age}）の${location(science,site)}で、${action}。${stageSentence(science)}${sample?sampleLearningText(sample.id,science.world):feature(science,scene)}${observationSentence(science)}`;
}
function shortFeature(science,scene){
  const parts=feature(science,scene).match(/[^。]+。/g)||[];
  return parts.slice(0,parts.length>1&&parts[0].length+parts[1].length<=95?2:1).join('');
}
function comparisonAnalysis(item){
  return (item.record.scenes||[]).map((id,index)=>{
    const record=item.record.photos?.[index],science=recordScience(record),scene=sceneById(id);
    const where=science?`の${location(science)}で`:'で';
    return `${index===0?'左':'右'}は「${scene?.name||'宇宙'}」（${recordedAge(science,scene)}）${where}撮影しました。${shortFeature(science,scene)}`;
  }).join('');
}
export function presentationAnalysis(item){return item.kind==='compare'?comparisonAnalysis(item):singleAnalysis(item);}

