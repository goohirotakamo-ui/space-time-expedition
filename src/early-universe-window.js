import {PARTICLE_STAGES,particleStage,drawParticleUniverse} from './early-universe-particles.js';

export function particleControls(){return `<div class="particle-stage-tabs" aria-label="初期宇宙の段階">${PARTICLE_STAGES.map((s,i)=>`<button data-particle-stage="${i}" aria-pressed="false">${s.tab}</button>`).join('')}</div>`;}

export function mountParticleUniverse(root,{state,onChange,onSave,blocked,onPause=()=>{},photograph,reducedMotion=false}){
  const canvas=root.querySelector('.solar-canvas'),ctx=canvas.getContext('2d'),abort=new AbortController();
  let current={...state,particleModelVersion:2,particleSeconds:state.particleSeconds||0,lightStyle:'wave'},disposed=false,raf=0,last=0,dirty=false;
  const update=next=>{current=next;dirty=true;onChange({...current});};
  const flush=()=>{if(dirty){dirty=false;onSave();}};
  const draw=()=>{drawParticleUniverse(ctx,current,0,0,canvas.width,canvas.height);};
  function labels(){const index=particleStage(current),stage=PARTICLE_STAGES[index];root.querySelectorAll('[data-particle-stage]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.particleStage)===index)));canvas.setAttribute('aria-label',`${stage.age}。${stage.title} ${stage.caption} 粒子と光を拡大した説明模型。`);}
  function wake(){if(!disposed&&!raf&&current.motion!=='paused'&&!blocked()&&!document.hidden)raf=requestAnimationFrame(tick);}
  function tick(now){raf=0;if(disposed||blocked()||document.hidden){last=0;return;}if(last&&now-last<33){wake();return;}const dt=last?Math.min(.1,(now-last)/1000):0;last=now;update({...current,particleSeconds:(current.particleSeconds+dt)%1000000});draw();wake();}
  function stop({keepWorld=false,notify=true}={}){if(disposed)return;if(notify)onPause();if(!keepWorld)update({...current,motion:'paused'});cancelAnimationFrame(raf);raf=0;last=0;flush();draw();}
  function resume(){if(disposed)return;update({...current,motion:'evolving'});flush();wake();}
  function resize(){canvas.width=Math.min(1100,Math.max(480,canvas.clientWidth));canvas.height=Math.round(canvas.width/Math.max(.5,canvas.clientWidth/Math.max(1,canvas.clientHeight)));update({...current,aspect:canvas.width/canvas.height});draw();}
  root.querySelectorAll('[data-particle-stage]').forEach(button=>button.addEventListener('click',()=>{if(blocked())return;update({...current,eventProgress:PARTICLE_STAGES[Number(button.dataset.particleStage)].progress,eventPlaying:false,particleSeconds:reducedMotion?8:0,motion:reducedMotion?'paused':'evolving'});labels();draw();flush();wake();},{signal:abort.signal}));
  canvas.addEventListener('keydown',event=>{if(blocked()||event.repeat)return;if(event.code==='Space'){event.preventDefault();stop();photograph();}if(event.code==='KeyX'){event.preventDefault();stop();}},{signal:abort.signal});
  document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(raf);raf=0;last=0;if(document.hidden)flush();else wake();},{signal:abort.signal});
  const observer=new ResizeObserver(resize);observer.observe(canvas);labels();resize();wake();
  return {stop,resume,dispose(){if(disposed)return;stop({keepWorld:true,notify:false});disposed=true;observer.disconnect();abort.abort();}};
}
