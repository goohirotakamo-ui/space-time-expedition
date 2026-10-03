import {advanceUfoEncounter} from './ufo-encounter.js';
import {drawUfo} from './ufo-visual.js';

// A separate transparent layer keeps the research-based sky and its clocks intact.
export function mountUfoWindow(root,{getWorld,getUfo,onChange,onSave,onGreeting,onReward,blocked,reducedMotion=false}){
  const canvas=root.querySelector('.ufo-overlay'),sky=root.querySelector('.solar-canvas');
  if(!canvas||!getUfo().encounter)return {dispose(){}};
  const ctx=canvas.getContext('2d'),abort=new AbortController();
  let raf=0,last=0,lastDraw=0,disposed=false,dirty=false,drawnWorld=null,drawnUfo=null;
  function flush(){if(dirty){dirty=false;onSave();}}
  function wake(){if(!disposed&&!raf&&!document.hidden&&getUfo().encounter)raf=requestAnimationFrame(tick);}
  function tick(now){
    raf=0;if(disposed||document.hidden){last=0;return;}
    if(now-lastDraw<33){wake();return;}
    const dt=last?Math.min(.1,Math.max(0,(now-last)/1000)):0;last=now;lastDraw=now;
    const world=getWorld(),before=getUfo(),suspended=blocked();
    const next=advanceUfoEncounter(before,world,dt,{blocked:suspended,reducedMotion});
    if(next!==before){onChange(next);dirty=true;}
    const resized=canvas.width!==sky.width||canvas.height!==sky.height;
    if(canvas.width!==sky.width)canvas.width=sky.width;
    if(canvas.height!==sky.height)canvas.height=sky.height;
    canvas.hidden=suspended;
    if(!suspended&&(resized||world!==drawnWorld||next!==drawnUfo)){
      drawUfo(ctx,world,next,canvas.width,canvas.height);drawnWorld=world;drawnUfo=next;
    }
    if(before.encounter?.phase!==next.encounter?.phase){
      flush();
      if(next.encounter?.phase==='greeting')onGreeting();
    }
    if(!before.reward&&next.reward){flush();onReward(next.reward);}
    wake();
  }
  document.addEventListener('visibilitychange',()=>{
    cancelAnimationFrame(raf);raf=0;last=0;if(document.hidden)flush();else wake();
  },{signal:abort.signal});
  window.addEventListener('pagehide',flush,{signal:abort.signal});
  wake();
  return {dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(raf);abort.abort();flush();}};
}
