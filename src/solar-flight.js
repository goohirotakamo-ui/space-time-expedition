import {getBodies,advanceWorld,approachPosition,AU_KM,LIGHT_KM_S,bodyById,defaultSolar,normalizeSolar,normalizeTimeScale,nearestBody,visibleBody,basis,turn,lookAt,sub,add,mul,length,dot,unit,speedAU,timeRate,safeMove,stepSolar,stepAutopilot} from './solar-system.js';
import {createSolarRenderer} from './solar-renderer.js';
import {drawOrbitMap} from './orbit-map.js';
import {findSafeWaypoint,cometOverviewPose,advanceFlightWorld} from './solar-navigation.js';
import {eventForEra,eventStage} from './space-events.js';
import {earlyUniverseDiagram} from './event-diagram.js';
import {formationStage} from './formation-model.js';
import {visualProfile} from './visual-science.js';
import {createSelectValueSync,isFlightEditingTarget} from './flight-input.js';
const actions={forward:{z:1},backward:{z:-1},left:{x:-1},right:{x:1},up:{y:1},down:{y:-1},'look-left':{yaw:-1},'look-right':{yaw:1},'look-up':{pitch:1},'look-down':{pitch:-1}};
const keyMap={KeyW:'forward',KeyS:'backward',KeyA:'left',KeyD:'right',KeyE:'up',KeyQ:'down',ArrowLeft:'look-left',ArrowRight:'look-right',ArrowUp:'look-up',ArrowDown:'look-down'};
const distanceText=au=>au>=.01?`${au.toFixed(3)} AU`:`${Math.round(au*AU_KM).toLocaleString('ja-JP')} km`;
const duration=s=>s<60?`${Math.ceil(s)}秒`:s<3600?`${Math.floor(s/60)}分${Math.floor(s%60)}秒`:`${Math.floor(s/3600)}時間${Math.floor(s/60)%60}分`;
const WORLD_RATES=[.05,.1,.25,.5,1,2,5,10,20,30,100,365.25,3652.5,36525];
const worldRateIndex=value=>WORLD_RATES.reduce((best,rate,index)=>Math.abs(Math.log(rate/(value||.25)))<Math.abs(Math.log(WORLD_RATES[best]/(value||.25)))?index:best,0);
const daysText=days=>days>=365.25?`${(days/365.25).toLocaleString('ja-JP',{maximumFractionDigits:1})}年`:days<1?`${(days*24).toLocaleString('ja-JP',{maximumFractionDigits:1})}時間`:`${days.toLocaleString('ja-JP',{maximumFractionDigits:2})}日`;
const bodyOptions=s=>getBodies(s).filter(body=>body.targetable!==false&&body.kind!=='moon');
const planetLabels={mercury:'水星',venus:'金星',earth:'地球',mars:'火星',jupiter:'木星',saturn:'土星',uranus:'天王星',neptune:'海王星'};
const optionList=(bodies,selected)=>bodies.map(b=>`<option value="${b.id}" ${b.id===selected?'selected':''}>${b.name}${b.name==='微惑星の模型'&&b.id.startsWith('belt-')?` ${b.id.slice(5)}`:''}${b.kind==='comet'?' · 彗星':b.kind==='asteroid'?' · 小天体':''}</option>`).join('');
// Each option is a still stage, not a playback position. Keep the final view
// identical to the existing completed model; sample the other stages midway.
const stageProgress=(event,index)=>index===event.stages.length-1?1:(event.stages[index].at+event.stages[index+1].at)/2;

export function mountSolarFlight(root,{state,onChange,onSave,blocked,photograph,onMessage,onError,onPause=()=>{}}){
  const canvas=root.querySelector('.solar-canvas'),windowEl=root.querySelector('.solar-window');
  const abort=new AbortController(),opts={signal:abort.signal},keys=new Map(),syncSelect=createSelectValueSync();
  let current={...normalizeSolar(state),eventPlaying:false},renderer,raf=0,last=0,lastDraw=0,dirty=false,drag=null,cruise=false,autopilot=false,waypoint=null,failed=false,disposed=false,windowSuspended=false,lastDiagramStage=-1,lastBodyOptions='';
  const bind=(el,type,fn,extra={})=>el.addEventListener(type,fn,{...opts,...extra});
  try{renderer=createSolarRenderer(canvas);}catch(e){onError(e.message);return {stop(){},resume(){},dispose(){}};}
  const allowed=()=>!disposed&&root.isConnected&&!windowSuspended&&!blocked()&&!failed&&document.visibilityState==='visible';
  const animated=()=>autopilot||cruise||keys.size||current.motion!=='paused';
  function update(next){current={...next,eventPlaying:false};dirty=true;onChange({...current,position:[...current.position],orientation:[...current.orientation]});}
  function flush(){if(dirty){dirty=false;onSave();}}
  function stop({keepWorld=false,notify=true}={}){if(disposed)return;if(notify)onPause();if(!keepWorld&&current.motion!=='paused')update({...current,motion:'paused'});keys.clear();cruise=false;autopilot=false;waypoint=null;drag=null;windowEl.classList.remove('dragging');cancelAnimationFrame(raf);raf=0;last=0;root.querySelector('[data-solar-cruise]').setAttribute('aria-pressed','false');flush();if(notify&&!failed)draw();}
  // A hidden tab or a remount is not a request to pause the saved universe.
  function suspend(){stop({notify:false,keepWorld:true});}
  function continueAnimation(){if(animated())wake();}
  function resume(){if(disposed||failed)return;update({...current,motion:'evolving'});flush();draw();wake();}
  function manualControl(){update({...current,eventPlaying:false});}
  function releaseManualInputs(){stop({notify:false,keepWorld:true});}
  function draw(){
    if(failed)return;
    try{renderer.draw(current);}catch(e){failed=true;stop();onError(e.message);return;}
    const destination=bodyById(current.target,current),remaining=destination?length(sub(destination.position,current.position)):0,subject=visibleBody(current);
    const event=eventForEra(current.era),stage=eventStage(current.era,current.eventProgress);
    const formation=formationStage(current),visual=visualProfile(current);
    root.querySelector('.solar-era-age').textContent=formation?`${formation.ageLabel} · ${formation.label}`:'';
    root.querySelector('.solar-formation-note').textContent=formation?.note||'';
    syncSelect(root.querySelector('[data-solar-color-mode]'),current.colorMode);
    root.querySelector('.solar-color-note').textContent=visual.colorNote;
    root.querySelector('.solar-background-note').textContent=`${visual.backgroundLabel}。${visual.backgroundNote}`;
    const observable=bodyOptions(current),targetSelect=root.querySelector('[data-solar-target]');
    const optionKey=observable.map(body=>`${body.id}:${body.name}`).join('|');
    const optionsChanged=optionKey!==lastBodyOptions;
    if(optionsChanged){
      targetSelect.innerHTML='<option value="" disabled>行き先を選ぶ</option>'+optionList(observable,current.target);
      targetSelect.disabled=observable.length===0;
      const routeSelect=root.querySelector('[data-solar-route]'),routeValue=routeSelect.value;
      routeSelect.innerHTML=optionList(observable,observable.some(body=>body.id===routeValue)?routeValue:current.target);
      routeSelect.disabled=observable.length===0;
      root.querySelectorAll('[data-solar-near],[data-solar-face],[data-solar-go]').forEach(button=>{button.disabled=observable.length===0;});
      lastBodyOptions=optionKey;
    }
    syncSelect(targetSelect,destination?.kind==='moon'?'':current.target||'',{refresh:optionsChanged});
    root.querySelector('[data-solar-tail]').hidden=destination?.kind!=='comet';
    const arrival=destination?destination.radius*(destination.id==='saturn'?7:4):0;
    const route=waypoint?length(sub(waypoint,current.position))+Math.max(0,length(sub(destination.position,waypoint))-arrival):Math.max(0,remaining-arrival);
    root.querySelector('.solar-status').textContent=destination?`目的地：${destination.name} · 中心まで ${distanceText(remaining)} · 光なら ${duration(remaining*AU_KM/LIGHT_KM_S)}${autopilot?` · 自動航行中 · 到着まで約${duration(route/speedAU(current))}（画面上の目安）`:cruise?' · 前進中':' · 探索中'}`:'選んだ宇宙の段階を360°で観察。まだ太陽系や恒星はありません。';
    root.querySelector('.solar-clock').textContent=`船の移動距離 ${distanceText(current.travelled)} / 航行に対応する時間 ${duration(current.elapsed)}`;
    root.querySelector('.solar-speed-note').textContent=current.speed==='inspect'?'観察用の移動：天体との距離に合わせた移動補助':current.speed==='light'?'光速 299,792 km/s · 実時間と同じ速さ':`光速 299,792 km/s · 航行時間を${current.timeScale}倍に早送り`;
    root.querySelectorAll('[data-solar-speed]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.solarSpeed===current.speed)));
    const slider=root.querySelector('[data-solar-time-scale]');
    slider.value=String(current.timeScale);slider.setAttribute('aria-valuetext',`${current.timeScale}倍`);
    root.querySelector('[data-solar-time-value]').textContent=`${current.timeScale}倍`;
    root.querySelector('#solar-time-help').textContent=current.speed==='fast-light'?`1秒で${current.timeScale}秒分進む · 飛行中も変更できます`:'倍率を動かすと「光速・時間短縮」になります';
    const b=basis(current.orientation),v=destination?sub(destination.position,current.position):[0,0,-1],z=dot(v,b.forward),px=dot(v,b.right)/z,py=dot(v,b.up)/z;
    const target=root.querySelector('.solar-target-marker');
    const planetLabel=destination?.kind==='planet'?planetLabels[destination.id]:null;
    if(planetLabel&&z>0&&Math.abs(px)<.51*current.aspect&&Math.abs(py)<.5){target.hidden=false;target.style.left=`${50+px/(.532*current.aspect)*50}%`;target.style.top=`${50-py/.532*50}%`;target.textContent=planetLabel;}else target.hidden=true;
    const scale=root.querySelector('.solar-body-scale');
    const diameter=destination?.radiusKm*2,ratio=destination?.radiusKm/6371;
    scale.textContent=destination?`${destination.name}：直径 約${diameter.toLocaleString('ja-JP',{maximumFractionDigits:diameter<10?2:0})} km（現在の地球の約${ratio.toLocaleString('ja-JP',{maximumSignificantDigits:3})}倍）。表面まで ${distanceText(Math.max(0,remaining-destination.radius))}。写る主な天体：${subject?.name||'星空'}。`:'まだ太陽や惑星はありません。選んだ宇宙の段階を観察します。';
    root.querySelectorAll('[data-solar-motion]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.solarMotion===current.motion)));
    const motionText=current.motion==='evolving'?`自転・公転：1秒で${daysText(current.motionDaysPerSecond)}進む`:current.motion==='rotation'?'自転のみ：1秒で6時間分（公転は停止）':current.motion==='orbit'?'公転を観察：1秒で20日分':'自転・公転の観察は停止中';
    root.querySelector('.solar-motion-status').textContent=`${motionText} · 公転の経過 ${current.simulationDays.toFixed(1)}日`;
    const worldSlider=root.querySelector('[data-solar-world-rate]');worldSlider.value=String(worldRateIndex(current.motionDaysPerSecond));worldSlider.setAttribute('aria-valuetext',`1秒で${daysText(current.motionDaysPerSecond)}進む`);
    root.querySelector('[data-solar-world-value]').textContent=`1秒＝${daysText(current.motionDaysPerSecond)}`;
    root.querySelector('[data-solar-track]').checked=current.motionTrackTarget!==false;
    root.querySelector('[data-solar-motion="evolving"]').textContent=current.motion==='evolving'?'自転・公転を再生中':'自転・公転を再生';
    if(event&&current.era!=='young-earth'){
      syncSelect(root.querySelector('[data-solar-event-stage]'),stageProgress(event,stage.index));
      root.querySelector('.solar-event-stage').textContent=stage?.label||event.title;
      root.querySelector('.solar-event-description').textContent=stage?.description||'';
      if(current.era==='early-universe'&&stage&&stage.index!==lastDiagramStage){
        root.querySelector('[data-solar-event-diagram]').innerHTML=earlyUniverseDiagram(stage.index);lastDiagramStage=stage.index;
      }
    }
    drawOrbitMap(root.querySelector('.orbit-map'),current);
  }
  function wake(){if(!raf&&allowed())raf=requestAnimationFrame(tick);}
  function detour(){
    const planned=findSafeWaypoint(current);waypoint=planned.waypoint;
    if(planned.blocked){stop();onMessage('安全な自動ルートを見つけられません。「観測位置へ」で移動できます。');return false;}
    return true;
  }
  function tick(now){
    raf=0;if(!allowed()){suspend();return;}
    // Cap graphics work near 30 fps on classroom laptops.
    if(now-lastDraw<30){wake();return;}
    const worldDt=last?Math.max(0,Math.min(1,(now-last)/1000)):1/30,dt=Math.min(.1,worldDt);last=now;lastDraw=now;
    let result;
    if(autopilot){
      if(waypoint){const delta=sub(waypoint,current.position),remaining=length(delta),step=Math.min(remaining,speedAU(current)*dt),m=safeMove(current.position,mul(unit(delta),step),current);
        result={state:{...current,position:m.position,orientation:lookAt(delta),elapsed:current.elapsed+m.distance/(speedAU(current)/timeRate(current)),travelled:current.travelled+m.distance},collision:m.collision};
        if(remaining<=step+1e-12)waypoint=null;
      }else result=stepAutopilot(current,dt);
    }else{
      const axes={};for(const a of new Set(keys.values()))for(const [k,v] of Object.entries(actions[a]))axes[k]=(axes[k]||0)+v;
      if(cruise)axes.z=1;result=stepSolar(current,axes,dt);
    }
    update(advanceFlightWorld(result.state,worldDt,{autopilot,cruise}));draw();
    if(disposed||failed)return;
    if(result.collision){releaseManualInputs();onMessage(result.collision==='boundary'?'観測エリアの端で停止しました。地球に戻れます。':`${bodyById(result.collision,current)?.name}の安全距離で停止しました。横や上下へ移動できます。`);draw();continueAnimation();return;}
    if(result.arrived){releaseManualInputs();onMessage(`${bodyById(current.target,current).name}に到着。観察速度に切り替えました。`);draw();continueAnimation();return;}
    if(animated())wake();else{last=0;flush();}
  }
  function manualStep(action){manualControl();autopilot=false;waypoint=null;const result=stepSolar(current,actions[action],.06);update(result.state);if(result.collision)releaseManualInputs();draw();continueAnimation();}
  function resize(){const aspect=Math.max(.5,Math.min(6,canvas.clientWidth/Math.max(1,canvas.clientHeight)));canvas.width=Math.min(1100,Math.max(480,Math.round(canvas.clientWidth*Math.min(devicePixelRatio||1,1.25))));canvas.height=Math.round(canvas.width/aspect);update({...current,aspect});draw();}
  const observer=new ResizeObserver(resize);observer.observe(canvas);
  bind(windowEl,'pointerdown',e=>{if(!allowed()||e.button!==0||drag)return;manualControl();canvas.focus({preventScroll:true});windowEl.setPointerCapture(e.pointerId);drag={id:e.pointerId,x:e.clientX,y:e.clientY};windowEl.classList.add('dragging');autopilot=false;waypoint=null;continueAnimation();});
  bind(windowEl,'pointermove',e=>{if(!drag||drag.id!==e.pointerId||!allowed())return;const r=canvas.getBoundingClientRect();update({...current,orientation:turn(current.orientation,-(e.clientX-drag.x)/r.width*180,(e.clientY-drag.y)/r.height*120)});drag.x=e.clientX;drag.y=e.clientY;draw();});
  const releaseDrag=e=>{if(drag?.id===e.pointerId){drag=null;windowEl.classList.remove('dragging');flush();}};
  for(const type of ['pointerup','pointercancel','lostpointercapture'])bind(windowEl,type,releaseDrag);
  bind(window,'keydown',e=>{if(isFlightEditingTarget(e.target)||e.isComposing||e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey||!allowed())return;
    // Arrow keys inside a control panel belong to its controls, not the camera.
    if(e.code.startsWith('Arrow')&&e.target.closest('[data-flight-pane],[role="tab"]'))return;
    const action=keyMap[e.code];if(action){e.preventDefault();if(!keys.has(e.code))manualStep(action);keys.set(e.code,action);wake();}
    if(e.code==='Space'&&e.target===canvas&&!e.repeat){e.preventDefault();stop();photograph();}
    if(e.code==='KeyX'){e.preventDefault();stop();draw();}
  });
  bind(window,'keyup',e=>{if(keys.delete(e.code)){e.preventDefault();if(!animated()){cancelAnimationFrame(raf);raf=0;last=0;}flush();continueAnimation();}});
  bind(document,'focusin',e=>{if(isFlightEditingTarget(e.target)&&keys.size){keys.clear();flush();continueAnimation();}});
  function observeNear(id=current.target){
    const body=bodyById(id,current);if(!body)return;
    manualControl();releaseManualInputs();const position=approachPosition(body,{aspect:current.aspect});
    update({...current,target:body.id,position,orientation:lookAt(sub(body.position,position)),speed:'inspect'});flush();draw();continueAnimation();onMessage(`${body.name}の近くへ移動しました（観察用の移動補助）。`);
  }
  bind(root.querySelector('[data-solar-target]'),'change',e=>{if(allowed())observeNear(e.target.value);});
  for(const b of root.querySelectorAll('[data-solar-speed]'))bind(b,'click',()=>{if(!allowed())return;manualControl();update({...current,speed:b.dataset.solarSpeed});flush();draw();continueAnimation();});
  bind(root.querySelector('[data-solar-color-mode]'),'change',e=>{if(!allowed())return;update({...current,colorMode:e.target.value==='enhanced'?'enhanced':'natural'});flush();draw();});
  const timeSlider=root.querySelector('[data-solar-time-scale]');
  // Keep the current route and animation running while adjusting the multiplier.
  bind(timeSlider,'input',()=>{if(!allowed())return;manualControl();update({...current,speed:'fast-light',timeScale:normalizeTimeScale(timeSlider.valueAsNumber)});draw();continueAnimation();});
  bind(timeSlider,'change',flush);
  bind(root.querySelector('[data-solar-face]'),'click',()=>{if(!allowed()||!bodyById(current.target,current))return;manualControl();update({...current,orientation:lookAt(sub(bodyById(current.target,current).position,current.position))});flush();draw();continueAnimation();});
  bind(root.querySelector('[data-solar-go]'),'click',()=>{const target=bodyById(root.querySelector('[data-solar-route]').value,current);if(!allowed()||!target)return;manualControl();releaseManualInputs();update({...current,target:target.id,orientation:lookAt(sub(target.position,current.position)),speed:current.speed==='inspect'?'fast-light':current.speed});autopilot=true;if(!detour()){draw();return;}draw();wake();});
  bind(root.querySelector('[data-solar-cruise]'),'click',()=>{if(!allowed())return;manualControl();if(cruise){releaseManualInputs();draw();continueAnimation();return;}autopilot=false;cruise=true;root.querySelector('[data-solar-cruise]').setAttribute('aria-pressed','true');wake();});
  bind(root.querySelector('[data-solar-stop]'),'click',()=>{stop();draw();});
  bind(root.querySelector('[data-solar-home]'),'click',()=>{if(!allowed())return;manualControl();releaseManualInputs();update(advanceWorld({...defaultSolar(current.era),eventProgress:current.eventProgress,motion:current.motion,motionDaysPerSecond:current.motionDaysPerSecond,timeScale:current.timeScale,colorMode:current.colorMode},0));root.querySelector('[data-solar-target]').value=current.target;flush();draw();continueAnimation();onMessage('この段階の出発位置に戻りました（移動支援）。');});
  bind(root.querySelector('[data-solar-near]'),'click',()=>{if(allowed())observeNear();});
  bind(root.querySelector('[data-solar-tail]'),'click',()=>{if(!allowed())return;const pose=cometOverviewPose(current);if(!pose)return;manualControl();releaseManualInputs();update({...current,...pose,speed:'inspect'});flush();draw();continueAnimation();onMessage(bodyById(current.target,current).tailStrength>0?'彗星の尾を見渡す位置へ移動しました（移動支援）。尾は太陽と反対側へ伸びます。':'今は太陽から遠く、尾が目立たない位置にいます。');});
  for(const button of root.querySelectorAll('[data-solar-motion]'))bind(button,'click',()=>{if(!allowed())return;manualControl();stop({notify:button.dataset.solarMotion==='paused'});update({...current,motion:button.dataset.solarMotion});flush();draw();continueAnimation();});
  const worldSlider=root.querySelector('[data-solar-world-rate]');
  bind(worldSlider,'input',()=>{if(!allowed())return;manualControl();update({...current,motion:'evolving',motionDaysPerSecond:WORLD_RATES[worldSlider.valueAsNumber]||.25});draw();continueAnimation();});
  bind(worldSlider,'change',flush);
  bind(root.querySelector('[data-solar-track]'),'change',e=>{if(!allowed())return;manualControl();update({...current,motionTrackTarget:e.target.checked});flush();draw();continueAnimation();});
  if(eventForEra(current.era)&&current.era!=='young-earth'){
    bind(root.querySelector('[data-solar-event-stage]'),'change',e=>{
      if(!allowed())return;
      const event=eventForEra(current.era),progress=Number(e.target.value);
      if(!event.stages.some((_,index)=>stageProgress(event,index)===progress))return;
      manualControl();releaseManualInputs();
      update(advanceWorld({...current,eventProgress:progress,eventPlaying:false},0));
      flush();draw();continueAnimation();
      onMessage('観察する段階を切り替えました。この段階のまま自転・公転を観察できます。');
    });
  }
  bind(window,'blur',()=>{windowSuspended=true;suspend();});
  bind(window,'focus',()=>{windowSuspended=false;continueAnimation();});
  bind(document,'visibilitychange',()=>{if(document.visibilityState==='hidden')suspend();else{windowSuspended=false;continueAnimation();}});
  bind(root,'focusout',e=>{if(!root.contains(e.relatedTarget)){suspend();continueAnimation();}});
  bind(canvas,'webglcontextlost',e=>{e.preventDefault();failed=true;stop();onError('3D表示が中断されました。再読み込みで再開できます。');});
  resize();continueAnimation();
  renderer.ready?.then(()=>{if(!abort.signal.aborted)draw();}).catch(e=>{if(!abort.signal.aborted)onError(e.message);});
  return {stop,resume,continueAnimation,dispose(){suspend();disposed=true;observer.disconnect();abort.abort();renderer.dispose();}};
}

export function solarControls(s){
  const timeScale=normalizeTimeScale(s.timeScale),bodies=bodyOptions(s),hasBodies=bodies.length>0,event=eventForEra(s.era);
  const header=(pane,title)=>`<header class="flight-pane-heading"><h2>${title}</h2><button class="flight-pane-close" data-action="flight-panel" data-panel="${pane}" aria-label="${title}を閉じる">×</button></header>`;
  const guideButton='<button class="subtle small" data-action="science-guide">詳しい説明・科学の根拠</button>';
  const fixedStage=eventStage(s.era,s.eventProgress);
  const eventControls=event&&s.era!=='young-earth'?`<div class="flight-stage-control"><label>観察する段階<select data-solar-event-stage aria-label="観察する段階">${event.stages.map((stage,index)=>`<option value="${stageProgress(event,index)}" ${fixedStage.index===index?'selected':''}>${stage.label}</option>`).join('')}</select></label><p class="solar-event-stage" hidden></p><p class="solar-event-description" hidden></p></div>`:'';
  return `<div class="flight-drawer">
  <section class="flight-pane" data-flight-pane="pilot" aria-label="操縦パネル" hidden>
    ${header('pilot','操縦')}
    <label class="flight-target-control">調べる天体<select ${hasBodies?'':'disabled'} data-solar-target aria-label="調べる天体"><option value="" disabled>天体を選ぶ</option>${optionList(bodies,s.target)}</select></label>
    <p class="flight-target-help">選ぶと近くへ移動します（観察用の移動補助）。</p>
    <div class="flight-route-actions"><button ${hasBodies?'':'disabled'} class="primary" data-solar-near>近くで見る</button><button ${hasBodies?'':'disabled'} data-solar-face>正面へ</button><button data-solar-home>出発位置</button><button data-solar-tail ${bodyById(s.target,s)?.kind==='comet'?'':'hidden'}>彗星の尾</button></div>
    <details class="flight-light-route"><summary>光速の旅</summary><label>行き先<select data-solar-route aria-label="光速の旅の行き先">${optionList(bodies,s.target)}</select></label><button ${hasBodies?'':'disabled'} data-solar-go>光速で向かう</button></details>
    <div class="solar-speed flight-speed-options" aria-label="航行速度"><button data-solar-speed="inspect">観察</button><button data-solar-speed="light">光速</button><button data-solar-speed="fast-light">光速・時間短縮</button></div>
    <div class="solar-time-control flight-compact-range"><label for="solar-time-scale">光速の早送り <output for="solar-time-scale" aria-live="off" data-solar-time-value>${timeScale}倍</output></label><input id="solar-time-scale" data-solar-time-scale type="range" min="10" max="100" step="1" value="${timeScale}" aria-label="光速の早送り倍率" aria-valuetext="${timeScale}倍" aria-describedby="solar-time-help"><p id="solar-time-help" class="solar-time-help" hidden></p></div>
    <p class="flight-keyboard-help">W・S：前後 ／ A・D：左右 ／ Q・E：下降・上昇<br>窓をドラッグ・矢印キーで見回す。選択後は窓をクリックして操縦。</p>
    <div class="flight-pilot-actions"><button data-solar-cruise aria-pressed="false">前進を続ける</button><button data-solar-stop>すべて停止 X</button></div>
    <output class="solar-status" aria-live="off"></output>
  </section>
  <section class="flight-pane" data-flight-pane="time" aria-label="時間パネル" hidden>
    ${header('time','時間')}
    <div class="solar-motion"><button class="primary" data-solar-motion="evolving" ${hasBodies?'':'disabled'}>自転・公転を再生</button><button data-solar-motion="paused">一時停止</button></div>
    <div class="solar-time-control flight-compact-range"><label for="solar-world-rate">自転・公転の速さ <output for="solar-world-rate" data-solar-world-value>1秒＝${daysText(s.motionDaysPerSecond||.25)}</output></label><input id="solar-world-rate" data-solar-world-rate type="range" min="0" max="${WORLD_RATES.length-1}" step="1" value="${worldRateIndex(s.motionDaysPerSecond)}" ${hasBodies?'':'disabled'} aria-label="自転・公転の時間の速さ"></div>
    <label class="solar-track-control"><input type="checkbox" data-solar-track ${s.motionTrackTarget!==false?'checked':''}>選んだ天体を追いかける</label>
    ${eventControls}
    <p class="solar-motion-status"></p>
    <p class="flight-fixed-epoch-note">年代・成長段階は固定。自転・公転だけが進みます。</p>
    <div class="flight-pane-actions"><button data-action="flight-panel" data-panel="map">${s.era==='early-universe'?'粒子の模式図':'公転の地図'}</button>${guideButton}</div>
  </section>
  <section class="flight-pane" data-flight-pane="display" aria-label="表示パネル" hidden>
    ${header('display','表示')}
    <label class="flight-color-control">色の表示<select data-solar-color-mode aria-label="色の表示"><option value="natural" ${s.colorMode!=='enhanced'?'selected':''}>自然な色の目安</option><option value="enhanced" ${s.colorMode==='enhanced'?'selected':''}>模様を見やすくした色</option></select></label>
    <p class="solar-era-age"></p><p class="solar-body-scale" aria-live="off"></p><p class="solar-clock"></p>
    ${guideButton}
  </section>
  <section class="flight-pane flight-map-pane" data-flight-pane="map" aria-label="${s.era==='early-universe'?'粒子の模式図':'公転の地図'}" hidden>
    ${header('map',s.era==='early-universe'?'粒子の模式図':'公転の地図')}
    <canvas class="orbit-map" width="320" height="170" role="img" aria-label="公転の様子を上から見る模式図" ${s.era==='early-universe'?'hidden':''}></canvas>
    ${s.era==='early-universe'?'<figure class="solar-event-diagram"><div data-solar-event-diagram></div><figcaption>粒子の大きさ・間隔は模型です。赤＝陽子、灰＝中性子、青＝電子、黄＝光。</figcaption></figure>':`<div class="solar-motion"><button data-solar-motion="rotation" ${hasBodies?'':'disabled'}>自転だけ</button><button data-solar-motion="orbit" ${hasBodies?'':'disabled'}>公転を速く見る</button></div>`}
    <div class="flight-pane-actions"><button data-action="flight-panel" data-panel="time">時間に戻る</button>${guideButton}</div>
  </section>
  <div class="flight-technical-readouts" hidden aria-hidden="true"><p class="solar-formation-note"></p><p class="solar-color-note"></p><p class="solar-background-note"></p><span class="solar-speed-note"></span></div>
  </div>`;
}
