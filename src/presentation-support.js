import {items} from './state.js';

const kindOrder={photo:0,sample:1,compare:2};
function scenesFor(item){
  if(item.kind==='compare')return item.record.scenes;
  if(item.scene==='solar-system')return [`solar:${item.record.solar?.era||'present'}:${item.record.solar?.subject||'sky'}`];
  return [item.scene];
}
function topicFor(scene){
  if(scene==='early-universe')return 'origin';
  if(['solar-nebula','young-earth','earth'].includes(scene))return 'formation';
  if(['sun','red-giant','white-dwarf'].includes(scene))return 'sun-life';
  return 'solar-exploration';
}
function score(selection){
  const scenes=selection.flatMap(scenesFor),uniqueScenes=new Set(scenes);
  // Compare these priorities in order, so more photographs of one scene cannot
  // outweigh having a photograph, a sample, and a comparison card.
  return [new Set(selection.map(item=>item.kind)).size,new Set(scenes.map(topicFor)).size,-(scenes.length-uniqueScenes.size),uniqueScenes.size];
}
function isBetter(a,b){for(let i=0;i<a.length;i++){if(a[i]!==b[i])return a[i]>b[i];}return false;}

/** Suggest up to three owned records without changing the learner's selection. */
export function recommendedSelection(state){
  const owned=[...new Map(items(state).map(item=>[item.key,item])).values()];
  const count=Math.min(3,owned.length);
  if(!count)return [];
  let best=[],bestScore=null;
  function visit(start,selection){
    if(selection.length===count){
      const candidate=score(selection);
      if(!bestScore||isBetter(candidate,bestScore)){best=[...selection];bestScore=candidate;}
      return;
    }
    for(let i=start;i<=owned.length-(count-selection.length);i++)visit(i+1,[...selection,owned[i]]);
  }
  visit(0,[]);
  return best.sort((a,b)=>kindOrder[a.kind]-kindOrder[b.kind]).map(item=>item.key);
}
