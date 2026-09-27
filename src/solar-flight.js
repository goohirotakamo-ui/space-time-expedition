import {getBodies,eraConfig,advanceWorld,approachPosition,AU_KM,LIGHT_KM_S,bodyById,defaultSolar,normalizeSolar,normalizeTimeScale,nearestBody,basis,turn,lookAt,sub,add,mul,length,dot,unit,speedAU,timeRate,safeMove,stepSolar,stepAutopilot} from './solar-system.js';
import {createSolarRenderer} from './solar-renderer.js';
import {drawOrbitMap} from './orbit-map.js';
import {findSafeWaypoint,cometOverviewPose} from './solar-navigation.js';
const actions={forward:{z:1},backward:{z:-1},left:{x:-1},right:{x:1},up:{y:1},down:{y:-1},'look-left':{yaw:-1},'look-right':{yaw:1},'look-up':{pitch:1},'look-down':{pitch:-1}};
const keyMap={KeyW:'forward',KeyS:'backward',KeyA:'left',KeyD:'right',KeyE:'up',KeyQ:'down',ArrowLeft:'look-left',ArrowRight:'look-right',ArrowUp:'look-up',ArrowDown:'look-down'};
const distanceText=au=>au>=.01?`${au.toFixed(3)} AU`:`${Math.round(au*AU_KM).toLocaleString('ja-JP')} km`;
const duration=s=>s<60?`${Math.ceil(s)}秒`:s<3600?`${Math.floor(s/60)}分${Math.floor(s%60)}秒`:`${Math.floor(s/3600)}時間${Math.floor(s/60)%60}分`;

export function mountSolarFlight(root,{state,onChange,onSave,blocked,photograph,onMessage,onError}){
  const canvas=root.querySelector('.solar-canvas'),windowEl=root.querySelector('.solar-window');
  const abort=new AbortController(),opts={signal:abort.signal},keys=new Map(),pointers=new Map();
  let current=normalizeSolar(state),renderer,raf=0,last=0,lastDraw=0,dirty=false,drag=null,cruise=false,autopilot=false,waypoint=null,failed=false;
  const bind=(el,type,fn,extra={})=>el.addEventListener(type,fn,{...opts,...extra});
  try{renderer=createSolarRenderer(canvas);}catch(e){onError(e.message);return {stop(){},dispose(){}};}
  const allowed=()=>!blocked()&&!failed&&document.visibilityState==='visible';
  function update(next){current=next;dirty=true;onChange({...current,position:[...current.position],orientation:[...current.orientation]});}
  function flush(){if(dirty){dirty=false;onSave();}}
  function stop(){if(current.motion!=='paused')update({...current,motion:'paused'});keys.clear();pointers.clear();cruise=false;autopilot=false;waypoint=null;drag=null;windowEl.classList.remove('dragging');root.querySelectorAll('.held').forEach(b=>b.classList.remove('held'));cancelAnimationFrame(raf);raf=0;last=0;root.querySelector('[data-solar-cruise]').setAttribute('aria-pressed','false');flush();}
  function draw(){
    if(failed)return;
    try{renderer.draw(current);}catch(e){failed=true;stop();onError(e.message);return;}
    const near=nearestBody(current.position,current),d=near?length(sub(current.position,near.position)):Infinity;
    const destination=bodyById(current.target,current),remaining=destination?length(sub(destination.position,current.position)):0;
    root.querySelector('[data-solar-tail]').hidden=destination?.kind!=='comet';
    const arrival=destination?destination.radius*(destination.id==='saturn'?7:4):0;
    const route=waypoint?length(sub(waypoint,current.position))+Math.max(0,length(sub(destination.position,waypoint))-arrival):Math.max(0,remaining-arrival);
    root.querySelector('.solar-location').textContent=near?(d<near.radius*20?`${near.name}の周辺`:'惑星間を航行中'):'まだ星のない宇宙';
    root.querySelector('.solar-status').textContent=destination?`目的地：${destination.name} · 中心まで ${distanceText(remaining)} · 光なら ${duration(remaining*AU_KM/LIGHT_KM_S)}${autopilot?` · 自動航行中 · 到着まで約${duration(route/speedAU(current))}（画面上の目安）`:cruise?' · 前進中':' · 手動操縦'}`:'宇宙の晴れ上がりを360°で観察。まだ太陽系や恒星はありません。';
    root.querySelector('.solar-clock').textContent=`船の移動距離 ${distanceText(current.travelled)} / 航行に対応する時間 ${duration(current.elapsed)}`;
    root.querySelector('.solar-speed-note').textContent=current.speed==='inspect'?'観察速度：天体との距離に合わせてゆっくり移動':current.speed==='light'?'光速 299,792 km/s · 実時間と同じ速さ':`光速 299,792 km/s · 時間を${current.timeScale}倍に早送り`;
    root.querySelectorAll('[data-solar-speed]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.solarSpeed===current.speed)));
    const slider=root.querySelector('[data-solar-time-scale]');
    slider.value=String(current.timeScale);slider.setAttribute('aria-valuetext',`${current.timeScale}倍`);
    root.querySelector('[data-solar-time-value]').textContent=`${current.timeScale}倍`;
    root.querySelector('.solar-time-help').textContent=current.speed==='fast-light'?`実際の1秒で${current.timeScale}秒分進む · 飛行中も調整できます`:'スライダーを動かすと「光速・時間短縮」に切り替わります';
    const b=basis(current.orientation),v=destination?sub(destination.position,current.position):[0,0,-1],z=dot(v,b.forward),px=dot(v,b.right)/z,py=dot(v,b.up)/z;
    const target=root.querySelector('.solar-target-marker');
    if(destination&&z>0&&Math.abs(px)<.51*current.aspect&&Math.abs(py)<.5){target.hidden=false;target.style.left=`${50+px/(.532*current.aspect)*50}%`;target.style.top=`${50-py/.532*50}%`;target.textContent=`◇ ${destination.name}`;}else target.hidden=true;
    root.querySelector('.solar-bearing').textContent=!destination?'全方向に広がる太古の光。色や濃淡は理解を助ける再現です。':target.hidden?`目的地 ${destination.name} は画面の外。「目的地へ向く」で見つけよう。`:`${destination.name}を正面に捉えています`;
    root.querySelectorAll('[data-solar-motion]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.solarMotion===current.motion)));
    const motionText=current.motion==='rotation'?'自転を観察：1秒で6時間分（公転は停止）':current.motion==='orbit'?'公転を観察：1秒で20日分（天体を追尾）':'自転・公転の観察は停止中';
    root.querySelector('.solar-motion-status').textContent=`${motionText} · 公転の経過 ${current.simulationDays.toFixed(1)}日`;
    drawOrbitMap(root.querySelector('.orbit-map'),current);
  }
  function wake(){if(!raf&&allowed())raf=requestAnimationFrame(tick);}
  function detour(){
    const planned=findSafeWaypoint(current);waypoint=planned.waypoint;
    if(planned.blocked){stop();onMessage('安全な自動ルートを見つけられません。「観測位置へ」で移動できます。');return false;}
    return true;
  }
  function tick(now){
    raf=0;if(!allowed()){stop();return;}
    // Cap graphics work near 30 fps on classroom laptops.
    if(now-lastDraw<30){wake();return;}
    const dt=last?Math.min(.1,(now-last)/1000):1/30;last=now;lastDraw=now;
    let result;
    if(autopilot){
      if(waypoint){const delta=sub(waypoint,current.position),remaining=length(delta),step=Math.min(remaining,speedAU(current)*dt),m=safeMove(current.position,mul(unit(delta),step),current);
        result={state:{...current,position:m.position,orientation:lookAt(delta),elapsed:current.elapsed+m.distance/(speedAU(current)/timeRate(current)),travelled:current.travelled+m.distance},collision:m.collision};
        if(remaining<=step+1e-12)waypoint=null;
      }else result=stepAutopilot(current,dt);
    }else{
      const axes={};for(const a of new Set([...keys.values(),...pointers.values()]))for(const [k,v] of Object.entries(actions[a]))axes[k]=(axes[k]||0)+v;
      if(cruise)axes.z=1;result=stepSolar(current,axes,dt);
    }
    update(advanceWorld(result.state,dt,{trackTarget:!autopilot&&!cruise&&!keys.size&&!pointers.size}));draw();
    if(result.collision){stop();onMessage(result.collision==='boundary'?'観測エリアの端で停止しました。地球に戻れます。':`${bodyById(result.collision,current)?.name}の安全距離で停止しました。横や上下へ移動できます。`);draw();return;}
    if(result.arrived){stop();onMessage(`${bodyById(current.target,current).name}に到着。観察速度に切り替えました。`);draw();return;}
    if(autopilot||cruise||keys.size||pointers.size||current.motion!=='paused')wake();else{last=0;flush();}
  }
  function manualStep(action){if(current.motion!=='paused')update({...current,motion:'paused'});autopilot=false;waypoint=null;const result=stepSolar(current,actions[action],.06);update(result.state);if(result.collision)stop();draw();}
  function resize(){const aspect=Math.max(.5,Math.min(6,canvas.clientWidth/Math.max(1,canvas.clientHeight)));canvas.width=Math.min(1100,Math.max(480,Math.round(canvas.clientWidth*Math.min(devicePixelRatio||1,1.25))));canvas.height=Math.round(canvas.width/aspect);update({...current,aspect});draw();}
  const observer=new ResizeObserver(resize);observer.observe(canvas);
  bind(windowEl,'pointerdown',e=>{if(!allowed()||e.button!==0||drag)return;canvas.focus({preventScroll:true});windowEl.setPointerCapture(e.pointerId);drag={id:e.pointerId,x:e.clientX,y:e.clientY};windowEl.classList.add('dragging');autopilot=false;waypoint=null;});
  bind(windowEl,'pointermove',e=>{if(!drag||drag.id!==e.pointerId||!allowed())return;const r=canvas.getBoundingClientRect();update({...current,orientation:turn(current.orientation,-(e.clientX-drag.x)/r.width*180,(e.clientY-drag.y)/r.height*120)});drag.x=e.clientX;drag.y=e.clientY;draw();});
  const releaseDrag=e=>{if(drag?.id===e.pointerId){drag=null;windowEl.classList.remove('dragging');flush();}};
  for(const type of ['pointerup','pointercancel','lostpointercapture'])bind(windowEl,type,releaseDrag);
  bind(root,'keydown',e=>{if(e.target.matches('input,select,textarea')||e.ctrlKey||e.metaKey||e.altKey||!allowed())return;
    const action=keyMap[e.code];if(action){e.preventDefault();if(!keys.has(e.code))manualStep(action);keys.set(e.code,action);wake();}
    if(e.code==='Space'&&e.target===canvas&&!e.repeat){e.preventDefault();stop();photograph();}
    if(e.code==='KeyX'){e.preventDefault();stop();draw();}
  });
  bind(window,'keyup',e=>{if(keys.delete(e.code)){e.preventDefault();if(!keys.size&&!pointers.size&&!cruise&&!autopilot){cancelAnimationFrame(raf);raf=0;last=0;flush();}}});
  for(const b of root.querySelectorAll('[data-solar-move]')){
    let pointerStepped=false;const action=b.dataset.solarMove;
    bind(b,'pointerdown',e=>{if(!allowed()||e.button!==0)return;b.focus({preventScroll:true});b.setPointerCapture(e.pointerId);pointerStepped=true;manualStep(action);pointers.set(e.pointerId,action);b.classList.add('held');wake();});
    const release=e=>{if(pointers.delete(e.pointerId)){b.classList.remove('held');if(!keys.size&&!pointers.size&&!cruise&&!autopilot){cancelAnimationFrame(raf);raf=0;last=0;flush();}}};
    for(const type of ['pointerup','pointercancel','lostpointercapture'])bind(b,type,release);
    bind(b,'click',e=>{if((!pointerStepped||e.detail===0)&&allowed()){manualStep(action);flush();}pointerStepped=false;});
    bind(b,'pointercancel',()=>{pointerStepped=false;});
  }
  bind(root.querySelector('[data-solar-target]'),'change',e=>{if(!allowed())return;stop();update({...current,target:e.target.value});flush();draw();});
  for(const b of root.querySelectorAll('[data-solar-speed]'))bind(b,'click',()=>{if(!allowed())return;update({...current,speed:b.dataset.solarSpeed});flush();draw();});
  const timeSlider=root.querySelector('[data-solar-time-scale]');
  // Keep the current route and animation running while adjusting the multiplier.
  bind(timeSlider,'input',()=>{if(!allowed())return;update({...current,speed:'fast-light',timeScale:normalizeTimeScale(timeSlider.valueAsNumber)});draw();});
  bind(timeSlider,'change',flush);
  bind(root.querySelector('[data-solar-face]'),'click',()=>{if(!allowed()||!bodyById(current.target,current))return;update({...current,orientation:lookAt(sub(bodyById(current.target,current).position,current.position))});flush();draw();});
  bind(root.querySelector('[data-solar-go]'),'click',()=>{if(!allowed()||!bodyById(current.target,current))return;stop();update({...current,speed:current.speed==='inspect'?'fast-light':current.speed});autopilot=true;if(!detour()){draw();return;}draw();wake();});
  bind(root.querySelector('[data-solar-cruise]'),'click',()=>{if(!allowed())return;if(cruise){stop();draw();return;}autopilot=false;update({...current,motion:'paused'});cruise=true;root.querySelector('[data-solar-cruise]').setAttribute('aria-pressed','true');wake();});
  bind(root.querySelector('[data-solar-stop]'),'click',()=>{stop();draw();});
  bind(root.querySelector('[data-solar-home]'),'click',()=>{if(!allowed())return;stop();update({...defaultSolar(current.era),timeScale:current.timeScale});root.querySelector('[data-solar-target]').value=current.target;flush();draw();onMessage('この時代の出発位置に戻りました（移動支援）。');});
  bind(root.querySelector('[data-solar-near]'),'click',()=>{if(!allowed())return;const body=bodyById(current.target,current);if(!body)return;stop();const position=approachPosition(body);update({...current,position,orientation:lookAt(sub(body.position,position)),speed:'inspect'});flush();draw();onMessage(`${body.name}の観測位置へ移動しました（移動支援）。`);});
  bind(root.querySelector('[data-solar-tail]'),'click',()=>{if(!allowed())return;const pose=cometOverviewPose(current);if(!pose)return;stop();update({...current,...pose,speed:'inspect'});flush();draw();onMessage(bodyById(current.target,current).tailStrength>0?'彗星の尾を見渡す位置へ移動しました（移動支援）。尾は太陽と反対側へ伸びます。':'今は太陽から遠く、尾が目立たない位置にいます。');});
  for(const button of root.querySelectorAll('[data-solar-motion]'))bind(button,'click',()=>{if(!allowed())return;stop();update({...current,motion:button.dataset.solarMotion});root.querySelector('.orbit-details').open=true;flush();draw();if(current.motion!=='paused')wake();});
  bind(window,'blur',()=>{stop();draw();});bind(document,'visibilitychange',()=>{stop();draw();});
  bind(root,'focusout',e=>{if(!root.contains(e.relatedTarget)){stop();draw();}});
  bind(canvas,'webglcontextlost',e=>{e.preventDefault();failed=true;stop();onError('3D表示が中断されました。再読み込みで再開できます。');});
  resize();
  renderer.ready?.then(()=>{if(!abort.signal.aborted)draw();}).catch(e=>{if(!abort.signal.aborted)onError(e.message);});
  return {stop,dispose(){stop();observer.disconnect();abort.abort();renderer.dispose();}};
}

export function solarControls(s){
  const timeScale=normalizeTimeScale(s.timeScale),bodies=getBodies(s),hasBodies=bodies.length>0;
  const move=(action,label)=>`<button type="button" data-solar-move="${action}">${label}</button>`;
  return `<div class="solar-navigation"><label>目的地<select ${hasBodies?'':'disabled'} data-solar-target aria-label="太陽系の目的地">${bodies.filter(b=>b.targetable!==false).map(b=>`<option value="${b.id}" ${b.id===s.target?'selected':''}>${b.name}${b.parent&&b.parent!=='sun'?' · 衛星':b.kind==='comet'?' · 彗星':b.kind==='asteroid'?' · 小天体':''}</option>`).join('')}</select></label><button ${hasBodies?'':'disabled'} data-solar-face>目的地へ向く</button><button ${hasBodies?'':'disabled'} class="primary" data-solar-go>光速で向かう</button><button data-solar-stop>停止 X</button><button ${hasBodies?'':'disabled'} data-solar-near>観測位置へ</button><button data-solar-tail ${bodyById(s.target,s)?.kind==='comet'?'':'hidden'}>彗星の尾を見る</button><button data-solar-home>出発位置へ</button></div>
  <div class="solar-speed"><span>航行速度</span><button data-solar-speed="inspect">観察</button><button data-solar-speed="light">光速・実時間</button><button data-solar-speed="fast-light">光速・時間短縮</button><button data-solar-cruise aria-pressed="false">前進を続ける</button></div>
  <div class="solar-time-control"><label for="solar-time-scale">光速の早送り <output for="solar-time-scale" aria-live="off" data-solar-time-value>${timeScale}倍</output></label><div class="solar-time-range"><span>10倍</span><input id="solar-time-scale" data-solar-time-scale type="range" min="10" max="100" step="1" value="${timeScale}" aria-label="光速の早送り倍率" aria-valuetext="${timeScale}倍" aria-describedby="solar-time-help"><span>100倍</span></div><p id="solar-time-help" class="solar-time-help"></p></div>
  <details class="orbit-details"><summary>自転・公転を観察する</summary><div class="solar-motion"><button data-solar-motion="rotation" ${hasBodies?'':'disabled'}>自転を見る</button><button data-solar-motion="orbit" ${hasBodies?'':'disabled'}>公転を見る</button><button data-solar-motion="paused">動きを止める</button></div><p class="solar-motion-status"></p><div class="orbit-layout"><canvas class="orbit-map" width="440" height="280" role="img" aria-label="公転の様子を上から見る模式図"></canvas><p>自転＝天体が自分で回ること。<br>公転＝ほかの天体の周りを回ること。<br>動きを見やすく早送りします。観察中は選んだ天体を追いかけます。操縦・光速航行を始めると天体の動きは止まります。<br><small>軌道は学習用の近似。特定の日付の正確な配置ではありません。</small></p></div></details>
  <div class="solar-instruments"><div><div class="flight-buttons">${move('left','← A')}${move('forward','前進 W')}${move('right','D →')}${move('down','下降 Q')}${move('backward','後退 S')}${move('up','上昇 E')}</div></div><div class="camera-group"><div class="flight-buttons">${move('look-left','← 左を見る')}${move('look-up','↑ 上を見る')}${move('look-right','右を見る →')}${move('look-down','下を見る ↓')}</div></div><div class="solar-guide">ドラッグ・矢印キーで360°見回す<br>WASD・Q/Eで移動 / Spaceで撮影<br><span class="solar-speed-note"></span></div></div>
  <output class="solar-status" aria-live="off"></output><p class="solar-clock"></p><p class="solar-footnote">1 AU＝地球と太陽の平均距離。距離と天体の大きさは同じ縮尺。軌道と過去・未来の姿は学習用のモデルです。遠い恒星・天の川は背景として見渡せます（移動不可）。早送りは10〜100倍で調整できます。光速の宇宙船は架空の設定です。</p><p class="solar-footnote">画像：<a href="https://www.solarsystemscope.com/textures/" target="_blank" rel="noopener noreferrer">Solar System Scope</a> / <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>（縮小・合成・CG加工）</p>`;
}
