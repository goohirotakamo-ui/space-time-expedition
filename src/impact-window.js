// Published numerical results, displayed in the cockpit without invented motion.
// Playback of an existing fixed-camera visualization is not a new SPH calculation.
export const NASA_MOVIE='https://images-assets.nasa.gov/video/ARC-20221004-AAV3443-MoonOrigin-Social-NASAWeb-1080p/ARC-20221004-AAV3443-MoonOrigin-Social-NASAWeb-1080p~medium.mp4';
export const IMPACT_MOVIE=NASA_MOVIE;
const CLIP_START=31,CLIP_END=82,CLIP_DURATION=CLIP_END-CLIP_START;
const CAPTIONS=[
  [31,'衝突すると、地球と衝突天体の物質が大きく変形して広がります。'],
  [40,'この計算では、飛び出した物質から大小のかたまりができます。'],
  [53,'小さいかたまりが、月になる天体の候補です。'],
  [64,'かたまり同士に働く重力によって、小さいかたまりの進む道が変わります。'],
  [72,'この研究では、月になる天体が短時間で地球から離れた軌道へ移ります。月の形成を説明するモデルの一つです。']
];

export function impactSourcesHtml(){return `<section><h3>仮説に基づく研究シミュレーション</h3><p>NASAが紹介したKegerreisら（2022）の研究計算の映像を、コックピットの窓に表示しています。NASA公式紹介映像の0:31〜1:22の区間を再生します。このアプリで粒子の運動を再計算したものではなく、実際の撮影映像でもありません。</p><p>この計算では、斜めに衝突した物質が伸びて大小の塊に分かれます。大きい塊との重力のやり取りで、小さい塊が地球から離れた軌道へ進みます。大きい塊は地球へ戻ります。これは月形成を説明する仮説の一例で、衝突条件により結果は変わります。</p><p>研究映像は視点固定です。宇宙船からの自由な見回し・写真・採集は「探検に戻る」で再開できます。この映像を写真やPDFに記録する機能は未対応です。色は可視化の表現で、肉眼で見える色を確定したものではありません。日本語の補足は学習用の要約です。</p><p>映像：NASA / Durham University / Jacob Kegerreis（2022）。<span lang="en">New Supercomputer Simulation Sheds Light on Moon’s Origin</span>。映像ファイルは編集せず、NASAの配信先から読み込みます。</p></section><section><h3>参考資料</h3><ul><li><a href="https://www.nasa.gov/solar-system/collision-may-have-formed-the-moon-in-mere-hours-simulations-reveal/" target="_blank" rel="noopener noreferrer">NASA：月が短時間でできる可能性を調べた研究</a></li><li><a href="https://www.youtube.com/watch?v=kRlhlCWplqk" target="_blank" rel="noopener noreferrer">NASA公式紹介映像の全編</a></li><li><a href="https://arxiv.org/html/2210.01814" target="_blank" rel="noopener noreferrer">Kegerreisらの論文・図1・データ公開範囲</a></li><li><a href="https://doi.org/10.3847/2041-8213/ac8d96" target="_blank" rel="noopener noreferrer">出版された研究論文</a></li><li><a href="https://astro.dur.ac.uk/ICC/giant_impacts/" target="_blank" rel="noopener noreferrer">Durham大学の研究紹介</a></li><li><a href="https://astro.dur.ac.uk/ICC/giant_impacts/moon_wide_orbit_houdini.mp4" target="_blank" rel="noopener noreferrer">論文図1の著者による研究映像</a></li></ul></section>`;}

export function impactCockpitHtml(){return `<section class="impact-window" hidden aria-label="窓から見る月形成の研究シミュレーション"><video data-impact-window-video muted playsinline preload="none" aria-label="NASAが紹介した月形成の研究計算映像"></video><div class="impact-window-top"><span>仮説に基づく再現映像 · 視点固定</span><button data-impact-sources>研究の根拠</button></div><div class="impact-window-loading" data-impact-window-status role="status"></div><div class="impact-window-bottom"><p data-impact-window-caption>${CAPTIONS[0][1]}</p><small>日本語の補足は学習用の要約</small><small data-impact-window-credit>NASA / Durham University / Jacob Kegerreis · 2022年の研究</small><div class="impact-window-controls"><button data-impact-window-toggle>一時停止</button><button data-impact-window-restart>最初から</button><input data-impact-window-seek type="range" min="0" max="1000" value="0" step="1" aria-label="衝突映像の位置"><output data-impact-window-time>0:00 / 0:51</output><button data-impact-window-exit>探検に戻る</button></div></div></section>`;}

export function mountImpactCockpit(root,{onExit=()=>{},onSources=()=>{}}={}){
  const panel=root.querySelector('.impact-window'),video=root.querySelector('[data-impact-window-video]');
  if(!panel||!video)return {active:false,start(){},pause(){},dispose(){}};
  const $=selector=>panel.querySelector(selector),events=new AbortController();
  const status=$('[data-impact-window-status]'),toggle=$('[data-impact-window-toggle]'),seek=$('[data-impact-window-seek]');
  const caption=$('[data-impact-window-caption]'),time=$('[data-impact-window-time]');
  let disposed=false,active=false,timer=0,version=0,hasSource=false,ready=false,wantsPlay=false,initialSeek=false,atEnd=false;
  let disabledButtons=[];
  const bind=(element,type,handler)=>element?.addEventListener(type,handler,{signal:events.signal});
  const clear=()=>{clearTimeout(timer);timer=0;};
  const clock=n=>`${Math.floor(n/60)}:${String(Math.floor(n%60)).padStart(2,'0')}`;
  const live=()=>active&&!disposed&&hasSource;
  function lockCommands(){
    if(disabledButtons.length)return;
    disabledButtons=[...root.querySelectorAll('[data-action="photograph"], [data-action="sample"]')].map(button=>({button,disabled:button.disabled,title:button.getAttribute('title')}));
    for(const {button} of disabledButtons){button.disabled=true;button.setAttribute('title','研究映像の記録・採集は未対応です。「探検に戻る」で写真・採集ができます。');}
  }
  function restoreCommands(){
    for(const {button,disabled,title} of disabledButtons){button.disabled=disabled;if(title===null)button.removeAttribute('title');else button.setAttribute('title',title);}
    disabledButtons=[];
  }
  function setStatus(text){status.textContent=text;status.hidden=!text;}
  function updatePosition(){
    const position=Math.max(CLIP_START,Math.min(CLIP_END,Number.isFinite(video.currentTime)?video.currentTime:CLIP_START));
    seek.value=String(Math.round((position-CLIP_START)/CLIP_DURATION*1000));
    time.textContent=clock(position-CLIP_START)+' / '+clock(CLIP_DURATION);
    let text=CAPTIONS[0][1];for(const [at,value] of CAPTIONS){if(position<at)break;text=value;}caption.textContent=text;
  }
  function release(){version++;clear();hasSource=false;ready=false;initialSeek=false;wantsPlay=false;video.pause();video.removeAttribute('src');video.load();}
  function failed(){
    if(disposed||!active)return;
    release();setStatus('映像を読み込めませんでした。「再試行」でNASAの映像を読み直すか、探検に戻れます。');toggle.disabled=false;toggle.textContent='再試行';seek.disabled=true;
  }
  function loading(){
    if(!live()||!wantsPlay)return;
    setStatus('NASAの研究映像を読み込んでいます…');
    if(!timer)timer=setTimeout(failed,20000);
  }
  function play(){
    if(!live())return;
    wantsPlay=true;toggle.textContent='一時停止';loading();if(!ready)return;
    const token=++version;
    try{Promise.resolve(video.play()).catch(()=>{if(token===version&&live()&&wantsPlay)failed();});}catch{if(token===version&&live())failed();}
  }
  function pause(){
    version++;wantsPlay=false;clear();video.pause();
    if(live()){setStatus('');toggle.textContent=atEnd?'もう一度':'続きを見る';}
  }
  function finish(){
    if(!live())return;
    atEnd=true;pause();
    if(Math.abs(video.currentTime-CLIP_END)>.01)video.currentTime=CLIP_END;
    updatePosition();setStatus('この仮説では、小さい塊が月になる軌道へ進みます。最後の場面で止めています。');
  }
  function seekTo(seconds,continuePlaying){
    if(!live()||!Number.isFinite(video.duration)||video.duration<CLIP_END)return;
    version++;clear();wantsPlay=continuePlaying;atEnd=seconds>=CLIP_END;ready=false;
    video.pause();video.currentTime=Math.max(CLIP_START,Math.min(CLIP_END,seconds));updatePosition();
    if(atEnd){finish();return;}
    toggle.textContent=wantsPlay?'一時停止':'続きを見る';
    if(!video.seeking){ready=true;initialSeek=false;seek.disabled=false;if(wantsPlay)play();}
    else if(wantsPlay)loading();
  }
  function start(){
    if(disposed)return;
    release();active=true;atEnd=false;wantsPlay=true;initialSeek=true;panel.hidden=false;root.classList.add('impact-is-active');lockCommands();
    toggle.disabled=false;toggle.textContent='一時停止';seek.disabled=true;seek.value='0';time.textContent='0:00 / 0:51';caption.textContent=CAPTIONS[0][1];
    video.muted=true;video.loop=false;video.crossOrigin='anonymous';hasSource=true;video.setAttribute('src',NASA_MOVIE);video.load();loading();
  }
  function exit(){
    if(!active)return;
    active=false;release();restoreCommands();panel.hidden=true;root.classList.remove('impact-is-active');onExit();
  }
  bind(toggle,'click',()=>{if(!hasSource)start();else if(atEnd)seekTo(CLIP_START,true);else if(wantsPlay)pause();else play();});
  bind($('[data-impact-window-restart]'),'click',()=>{if(!hasSource)start();else if(Number.isFinite(video.duration)&&video.duration>=CLIP_END)seekTo(CLIP_START,true);else{wantsPlay=true;initialSeek=true;loading();}});
  bind($('[data-impact-window-exit]'),'click',exit);
  bind($('[data-impact-sources]'),'click',()=>{pause();onSources();});
  bind(video,'loadedmetadata',()=>{
    if(!live()||!initialSeek)return;
    if(!Number.isFinite(video.duration)||video.duration<CLIP_END){failed();return;}
    seekTo(CLIP_START,wantsPlay);
  });
  bind(video,'seeked',()=>{
    if(!live())return;
    initialSeek=false;ready=true;seek.disabled=false;updatePosition();
    if(atEnd||video.currentTime>=CLIP_END){finish();return;}
    if(wantsPlay)play();else clear();
  });
  bind(video,'playing',()=>{
    if(!live())return;
    if(!wantsPlay||atEnd){video.pause();return;}
    clear();setStatus('');toggle.textContent='一時停止';seek.disabled=false;
  });
  bind(video,'waiting',loading);bind(video,'stalled',loading);
  bind(video,'error',()=>{if(live())failed();});
  bind(video,'ended',()=>{if(live())finish();});
  bind(video,'timeupdate',()=>{if(!live()||initialSeek)return;if(video.currentTime>=CLIP_END){finish();return;}updatePosition();});
  bind(seek,'input',()=>{const value=Number(seek.value);if(!seek.disabled&&Number.isFinite(value))seekTo(CLIP_START+Math.max(0,Math.min(1000,value))/1000*CLIP_DURATION,wantsPlay);});
  const doc=root.ownerDocument||globalThis.document;
  bind(doc,'visibilitychange',()=>{if(doc.hidden)pause();});
  return {get active(){return active;},start,pause,dispose(){if(disposed)return;disposed=true;active=false;events.abort();release();restoreCommands();panel.hidden=true;root.classList.remove('impact-is-active');}};
}
