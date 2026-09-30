import {SCENES,SAMPLES,RANKS,RANK_HINTS,sceneById,sampleById} from './content.js';
import {STORAGE_KEY,freshState,validateState,missionProgress,rankIndex,items,nextTask,taskDone,hasPhoto,hasSample,recordPhoto,recordSolarPhoto,recordWorldPhoto,isSceneSubject,recordSample,removePhoto,PHOTO_LIMIT,unlockedComparisons} from './state.js';
import {icon} from './icons.js';
import {loadImage,renderSlide,createPdf} from './pdf.js';
import {defaultCamera,drawPhoto} from './camera.js';
import {mountSolarFlight,solarControls} from './solar-flight.js';
import {bodyById,nearestBody,visibleBody,length,sub,AU_KM,defaultSolar,eraConfig,approachPosition,lookAt} from './solar-system.js';
import {drawSolarPhoto,rendererReady} from './solar-renderer.js';
import {LESSONS,renderLessonFigure} from './curriculum.js';
import {recommendedSelection} from './presentation-support.js';
import {rubyText} from './reading-support.js';
import {createReadingController} from './reading-controller.js';
import {eventStage,eventForEra} from './space-events.js';
import {getSamplingContext,getSampleLocations,getRecordedSampleLocation} from './sample-locations.js';
import {sampleObservation} from './sample-observation.js';
import {scienceGuide} from './science-guide.js';
import {observeWorld} from './observations.js';
import {recordScience,recordScienceLines} from './record-science.js';
import {formationStage} from './formation-model.js';
import {fixedEpochWorld} from './epoch-playback.js';
import {impactCockpitHtml,mountImpactCockpit,impactSourcesHtml} from './impact-window.js';
import {mountDialogPager} from './dialog-pager.js';
import {mapView,collectionView,presentationView,pageWindow,collectionPageSize} from './screen-views.js';
import {flightExplanations} from './flight-explanations.js';
let flight=null,modalRevision=0,disposeModalMedia=null,disposeDialogPager=null,impactCockpit=null;
let mapChoice=null,collectionPage=0,presentationIndex=0,previewToken=0,previewTimer=0;
const worldState=()=>state.flightMode==='solar'?state.solar:state.historySolar;
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const modal=$('#modal');
const reader=createReadingController({engine:window.speechSynthesis,createUtterance:text=>new window.SpeechSynthesisUtterance(text),onStatus:({speaking})=>{
  modal.querySelectorAll('[data-action="speak"]').forEach(el=>{el.disabled=speaking;});
  modal.querySelectorAll('[data-action="stop-reading"]').forEach(el=>{el.hidden=!speaking;});
  modal.querySelectorAll('.reading-status').forEach(el=>{el.textContent=speaking?'読み上げ中':'';});
},onError:message=>toast(message,true)});
function readingControls(){return `<div class="reading-controls">${button('speak','この説明を聞く',null,'subtle small')}${button('stop-reading','読み上げを止める',null,'subtle small','hidden')}<span class="reading-status" role="status"></span></div>`;}
function readableText(root){
  const read=node=>{
    if(node.nodeType===Node.TEXT_NODE)return node.textContent;
    if(node.nodeType!==Node.ELEMENT_NODE||node.hidden||node.getAttribute('aria-hidden')==='true'||node.matches('rt,rp,button,svg,canvas,script,style,.reading-controls,.lesson-keywords,.fine'))return '';
    if(node.matches('details')&&!node.open)return '';
    const text=Array.from(node.childNodes,read).join('');
    return node.matches('p,li,h3,h4,div,summary')?`${text}\n`:text;
  };
  return root?read(root).replace(/[ \t]+/g,' ').replace(/\n+/g,'\n').trim():'';
}
let state=freshState(),view='ship',filter='photo',busy=false,pendingImport=null,skipAnimation=null,storageFailed=false,damagedSave=false,latestDownloadUrl=null;
try{const saved=localStorage.getItem(STORAGE_KEY);if(saved)state=validateState(JSON.parse(saved));}catch{storageFailed=true;damagedSave=true;}
state.started=true;
preparePlayback();
function preparePlayback(){
  const key=state.flightMode==='solar'?'solar':'historySolar';
  state[key]=fixedEpochWorld(state[key],{playing:state.playback.playing&&!state.reducedMotion});
}
function pausePlayback(){state.playback.playing=false;updatePlaybackBar();}
function syncExplorationPlayback(world){
  state.playback.playing=world.motion!=='paused';
  updatePlaybackBar();
}
function updatePlaybackBar(){
  const status=$('[data-playback-status]');if(!status)return;
  const world=worldState(),motion=world.motion==='rotation'?'自転':world.motion==='orbit'?'公転':'自転・公転';
  status.textContent=world.era==='early-universe'?'年代を固定 · まだ星のない宇宙を観察中':`年代を固定 · ${state.playback.playing?motion+'を自動再生中':'動きを一時停止中'}`;
  const toggle=$('[data-action="playback-toggle"]');toggle.textContent=state.playback.playing?'一時停止':'動きを再開';toggle.setAttribute('aria-pressed',String(state.playback.playing));
}
function toast(message,error=false){const el=document.createElement('div');el.className=`toast${error?' error':''}`;el.textContent=message;$('#toast-region').append(el);setTimeout(()=>el.remove(),4600);}
function save(){if(damagedSave)return;try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));storageFailed=false;}catch{storageFailed=true;}updateWarning();}
function updateWarning(){let w=$('#save-warning');if(storageFailed){if(!w){w=document.createElement('div');w.id='save-warning';w.className='save-warning';w.setAttribute('role','status');$('.app-header').after(w);}w.textContent=damagedSave?'以前の探検データを読み込めませんでした。自動上書きを止めています。設定からデータを保存してください。':'このブラウザに記録を保存できません。設定の「探検データを保存」で記録を持ち出してください。';}else w?.remove();}
function sound(type='success'){if(!state.sound)return;try{const C=window.AudioContext||window.webkitAudioContext,ctx=new C(),o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=type==='shutter'?700:520;g.gain.setValueAtTime(.035,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.22);o.start();o.stop(ctx.currentTime+.22);o.onended=()=>ctx.close();}catch{}}
function commit(fn,message){const rank=rankIndex(state),before=missionProgress(state),cards=unlockedComparisons(state).length;fn();save();render();if(message)toast(message);missionProgress(state).filter((m,i)=>m.complete&&!before[i].complete).forEach(m=>toast(`ミッション達成！「${m.badge}」`));if(unlockedComparisons(state).length>cards)toast('2つの時代がそろいました。比較カードが完成！');if(rankIndex(state)>rank)toast(`称号アップ！「${RANKS[rankIndex(state)]}」`);sound();}
function clearModalMedia(){disposeModalMedia?.();disposeModalMedia=null;disposeDialogPager?.();disposeDialogPager=null;modal.classList.remove('research-modal');}
function openModal(title,body,wide=false){reader.stop();clearModalMedia();modalRevision++;flight?.stop();impactCockpit?.pause();$('#modal-content').innerHTML=`<div class="modal-header"><h2>${rubyText(title)}</h2><div class="modal-fixed-actions"><button class="icon-button" data-action="speak" aria-label="このページを読む">${icon('info')}</button><button class="icon-button" data-action="stop-reading" aria-label="読み上げを止める" hidden>■</button><button class="icon-button" data-action="close" aria-label="閉じる">${icon('close')}</button></div></div><div class="modal-body">${body}</div>`;modal.classList.toggle('wide',wide);if(!modal.open)modal.showModal();modal.scrollTop=0;hydratePhotoViews(modal);disposeDialogPager=mountDialogPager(modal,{onPageChange:()=>reader.stop()});}
function closeModal(){reader.stop();clearModalMedia();modalRevision++;modal.close();}
function showImpactResearch(){
  if(worldState().era!=='young-earth')return;
  flight?.stop();closeModal();closeFlightPanels();impactCockpit?.start();
}
function closeFlightPanels(){document.querySelectorAll('[data-flight-pane]').forEach(p=>p.hidden=true);document.querySelectorAll('[data-action="flight-panel"]').forEach(b=>b.setAttribute('aria-expanded','false'));$('.flight-drawer')?.classList.remove('open');}
function toggleFlightPanel(name){
  if(!['pilot','time','display','map','observations'].includes(name)||impactCockpit?.active)return;
  const pane=document.querySelector('[data-flight-pane="'+name+'"]');if(!pane)return;
  const open=pane.hidden;closeFlightPanels();pane.hidden=!open;$('.flight-drawer')?.classList.toggle('open',open);
  document.querySelectorAll('[data-action="flight-panel"][data-panel="'+name+'"]').forEach(b=>b.setAttribute('aria-expanded',String(open)));
}

modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeModal();}});
modal.addEventListener('close',()=>{if(!modal.open){reader.stop();clearModalMedia();}});
modal.addEventListener('cancel',()=>{reader.stop();clearModalMedia();});
modal.addEventListener('toggle',event=>{if(event.target.matches('details'))reader.stop();},true);
window.addEventListener('pagehide',()=>{reader.stop();clearModalMedia();impactCockpit?.dispose();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)reader.stop();});
const button=(action,label,ic,cls='subtle',extra='')=>`<button class="button ${cls}" data-action="${action}" ${extra}>${ic?icon(ic):''}${label}</button>`;
const kindName=kind=>({photo:'写真',sample:'サンプル',compare:'比較カード'}[kind]);
const dateText=value=>new Date(value).toLocaleString('ja-JP',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'});
function render(){
  impactCockpit?.dispose();impactCockpit=null;previewToken++;flight?.dispose();flight=null;document.body.dataset.view=view;document.body.classList.toggle('reduce-motion',state.reducedMotion);
  const activeView=view==='time'?'ship':view;
  $('#navigation').innerHTML=[['ship','ship','探検'],['collection','collection','コレクション'],['presentation','pdf','発表']].map(([id,ic,label])=>`<button class="${activeView===id?'active':''}" data-view="${id}" ${activeView===id?'aria-current="page"':''}>${icon(ic)}${label}${id==='presentation'&&state.selected.length?`<span class="nav-count">${state.selected.length}</span>`:''}</button>`).join('');
  const rank=rankIndex(state);
  $('#rank-button').innerHTML=icon('star')+`<span class="research-pass-text"><small>調査員証 · ${rank+1}/5</small><strong>${RANKS[rank]}</strong></span>`;
  $('#rank-button').setAttribute('aria-label',`調査員証：${RANKS[rank]}。5段階中${rank+1}段階。称号を見る`);
  $('#rank-button').title=`調査員証：${RANKS[rank]}`;
  $('#settings-button').innerHTML=icon('settings');$('#main').innerHTML=({ship:renderShip,time:renderMap,collection:renderCollection,presentation:renderPresentation}[view])();updateWarning();hydratePhotoViews($('#main'));if(view==='ship'){const mountedState=state;const worldKey=state.flightMode==='solar'?'solar':'historySolar';flight=mountSolarFlight($('.solar-zone'),{state:mountedState[worldKey],onChange:s=>{mountedState[worldKey]=s;syncExplorationPlayback(s);updateSamplingStatus(s);},onSave:()=>{updateSamplingStatus(mountedState[worldKey],true);save();},blocked:()=>busy||modal.open||impactCockpit?.active,photograph,onMessage:toast,onError:m=>toast(m,true),onPause:pausePlayback});updatePlaybackBar();
  if(worldState().era==='young-earth')impactCockpit=mountImpactCockpit($('.solar-zone'),{onExit:()=>{updatePlaybackBar();},onSources:()=>openModal('月の形成：研究と再現の根拠',impactSourcesHtml())});
}else if(view==='presentation')hydratePresentationPreview();}
function navigate(target){if(!['ship','time','collection','presentation'].includes(target))return;if(target!=='ship')flight?.stop();closeModal();view=target;render();window.scrollTo({top:0,behavior:'instant'});}
function renderWithFocus(selector,fallback){
  render();const preferred=$(selector),target=preferred&&!preferred.disabled?preferred:fallback?$(fallback):null;
  if(target&&!target.disabled)target.focus({preventScroll:true});
}
function renderMissionGuide(){const next=nextTask(state),complete=missionProgress(state).filter(m=>m.complete).length;return `<section class="mission-strip mission-guide" aria-label="次にすること">${icon('target')}<div class="content"><small>${next?`次の調査 ・ ${complete} / 3 ミッション達成`:'3つのミッションを達成しました'}</small><p>${next?rubyText(next.task.label):'発見を発表にまとめよう。'}</p></div>${next?button('next-task','調査地点へ','rocket','small'):button('presentation','発表をつくる','pdf','small')}${button('missions','調査ノート',null,'subtle small')}</section>`;}
function renderShip(){return renderSolarShip();}
function renderMap(){const chosen=sceneById(mapChoice)||sceneById(state.currentScene);return mapView({scenes:SCENES,chosen,ruby:rubyText,button});}
function photoArt(photo, name) {return `<canvas class="photo-frame" data-photo-id="${esc(photo.id)}" width="640" height="360" role="img" aria-label="${esc(name)}"></canvas>`;}
function hydratePhotoViews(root){
  for(const canvas of root.querySelectorAll('[data-photo-id],[data-sample-id]')){
    const sample=canvas.dataset.sampleId?state.samples.find(record=>record.id===canvas.dataset.sampleId):null;
    const photo=sample?null:state.photos.find(record=>record.id===canvas.dataset.photoId);
    const snapshot=sample?sampleObservation(sample):photo?.solar;
    if(snapshot){rendererReady.then(()=>{if(canvas.isConnected)drawSolarPhoto(canvas.getContext('2d'),snapshot,0,0,640,360);}).catch(error=>canvas.setAttribute('aria-label',error.message));continue;}
    if(!photo)continue;
    loadImage(sceneById(photo.scene).image).then(image=>{if(canvas.isConnected)drawPhoto(canvas.getContext('2d'),image,photo.camera,0,0,640,360);}).catch(()=>canvas.setAttribute('aria-label','写真を読み込めません。通信を確認してください。'));
  }
}
function art(item,extra=''){if(item.kind==='compare')return `<div class="comparison-art ${extra}">${item.record.scenes.map((id,i)=>photoArt(item.record.photos[i],sceneById(id).name)).join('')}<span>${icon('compare')}</span></div>`;const sample=item.kind==='sample'?sampleById(item.record.id):null;return `<div class="record-art ${sample?.kind==='material'?'material':''} ${extra}">${item.kind==='photo'?photoArt(item.record,item.name):sample?.kind==='data'&&item.record.sampling?`<canvas class="photo-frame" data-sample-id="${esc(sample.id)}" width="640" height="360" role="img" aria-label="${esc(item.name)}"></canvas>`:`<img src="${sample?.image||sceneById(item.scene).image}" alt="${esc(item.name)}" loading="lazy">`}${sample?.kind==='data'?'<span class="art-tag">観測データ</span>':''}</div>`;}
function recordCard(item){const selected=state.selected.includes(item.key),s=recordScene(item);return `<article class="record-card"><button class="record-open" data-action="detail" data-key="${item.key}" aria-label="${esc(item.name)}の詳細">${art(item)}<div class="record-title"><span class="era">${item.kind==='compare'?'2つの時代を比較':s.era}</span><h2>${rubyText(item.name)}</h2><p>${item.kind==='compare'?item.record.hint:item.kind==='sample'?sampleById(item.record.id).type:dateText(item.created)}</p></div></button><div class="record-card-footer">${button('toggle-select',selected?'選択済み':'発表に使う',selected?'check':'pdf',selected?'selected wide':'subtle wide',`data-key="${item.key}" aria-pressed="${selected}"`)}</div></article>`;}
function renderCollection(){
 const list=items(state).filter(i=>i.kind===filter),page=pageWindow(list.length,collectionPage,collectionPageSize(innerWidth,innerHeight));collectionPage=page.index;
 return collectionView({list,window:page,filter,counts:{photo:state.photos.length,sample:state.samples.length,compare:unlockedComparisons(state).length},selectedCount:state.selected.length,card:recordCard,button,icon});
}
function selectedItems(){const all=items(state);return state.selected.map(key=>all.find(i=>i.key===key)).filter(Boolean);}
function renderPresentation(){const selected=selectedItems();presentationIndex=Math.max(0,Math.min(presentationIndex,selected.length-1));return presentationView({selected,index:presentationIndex,titles:state.titles,button,icon,kindName,recommendedCount:selected.length?0:recommendedSelection(state).length});}
async function hydratePresentationPreview(){
 const root=$('[data-slide-preview]');if(!root)return;const item=selectedItems()[presentationIndex];if(!item)return;
 const token=++previewToken,index=presentationIndex,total=state.selected.length;
 try{const canvas=await renderSlide(item,state.titles[item.key]||item.name,index+1,total,1.25);if(token!==previewToken||!root.isConnected)return;canvas.setAttribute('aria-label','手書き欄付きの発表ページ');canvas.setAttribute('role','img');root.replaceChildren(canvas);}catch(error){if(token===previewToken)root.textContent=error.message;}
}

function showMissions(){openModal('3つの調査ミッション',`<div class="mission-list">${missionProgress(state).map((m,i)=>`<article class="mission-card ${m.complete?'completed':''}"><div class="row space-between"><span class="eyebrow">MISSION 0${i+1}</span><span class="badge">${m.complete?icon('check')+' 達成':`${m.count} / ${m.tasks.length}`}</span></div><h3>${rubyText(m.title)}</h3><p class="muted">${rubyText(m.description)}</p><ul class="task-list">${m.tasks.map(t=>`<li class="${taskDone(state,t)?'done':''}">${icon(taskDone(state,t)?'check':'target')}<span>${rubyText(t.label)}</span></li>`).join('')}</ul>${m.complete?`<p class="earned-badge">${icon('star')} ${m.badge}</p>`:button('choose-mission','この調査を進める','chevron','subtle',`data-mission="${m.id}"`)}</article>`).join('')}</div><p class="fine">順番は自由です。先に集めた記録も達成になります。</p>`);}
function showRanks(){const rank=rankIndex(state);openModal('調査員証',`<div class="rank-card"><div class="rank-seal">${icon('star')}</div><div><span class="eyebrow">LEVEL ${rank+1} / 5</span><h3>${RANKS[rank]}</h3><p class="muted">${rank===4?'きみの発見が、だれかの宇宙への入り口になる。':'発見を積み重ねて、宇宙の案内人へ。'}</p></div></div><ol class="rank-ladder">${RANKS.map((name,i)=>`<li class="${i<=rank?'achieved':''} ${i===rank?'current':''}"><span class="rank-level">${i<=rank?icon('check'):i+1}</span><div><strong>${name}</strong><small>${RANK_HINTS[i]}</small></div>${i===rank?'<span class="badge">現在</span>':''}</li>`).join('')}</ol><p class="fine">PDFはいつでも作れます。先に作った場合も記録され、3ミッションを終えたときに最後の称号がもらえます。</p>`);}
function showShelf(){openModal('船内の展示棚',`<p class="muted">旅で持ち帰った、${state.samples.length}点の発見。</p><div class="shelf-grid">${SAMPLES.map(s=>{const found=hasSample(state,s.id),item=items(state).find(i=>i.key===`sample:${s.id}`);return `<button class="shelf-slot ${found?'found':''}" data-action="${found?'detail':'travel'}" ${found?`data-key="sample:${s.id}"`:`data-scene="${s.scene}"`} aria-label="${s.name}${found?'の詳細':'を探しに行く'}">${found?art(item):`<div class="unknown-specimen">${icon(s.kind==='data'?'eye':'sample')}</div>`}<strong>${found?s.name:'未発見'}</strong><small>${found?s.type:sceneById(s.scene).name+'で探す'}</small></button>`;}).join('')}</div><div class="row wrap">${missionProgress(state).filter(m=>m.complete).map(m=>`<span class="badge">${icon('star')}${m.badge}</span>`).join('')}</div>`,true);}
function showDetail(key){const item=items(state).find(i=>i.key===key);if(!item)return;const sample=item.kind==='sample'?sampleById(item.record.id):null,scene=recordScene(item),selected=state.selected.includes(key);openModal(item.name,`${art(item,'detail-art')}<section data-reading-panel>${readingControls()}<div data-reading-content><p class="detail-meta">${item.kind==='compare'?'比較カード':scene.era+' / '+(sample?getRecordedSampleLocation(item.record)?.label||scene.location:scene.location)}</p><p>${rubyText(sample?.note||item.record.hint||scene.summary)}</p>${sample?`<p class="fine">${sample.method}による${sample.kind==='data'?'模擬観測の記録です。':'ゲーム内の模擬採集。画像は生成したイメージです。'}</p>`:''}</div></section>${item.kind==='compare'?item.record.photos.map(photo=>recordSciencePanel(photo)).join(''):recordSciencePanel(item.record)}${item.kind==='compare'&&item.record.id==='sun-history'?`<div class="scale-illustration"><span class="tiny-sun"></span><span class="big-sun"></span><div>現在 = 1<span>赤色巨星：直径が数十〜数百倍<br>図は約100倍の例</span></div></div>`:''}<div class="row wrap">${button('detail-select',selected?'発表から外す':`この${item.kind==='photo'?'写真':item.kind==='sample'?'サンプル':'比較カード'}を発表に使う`,selected?'check':'pdf',selected?'subtle':'',`data-key="${key}"`)}${button('make-single','この記録でスライドを作る','chevron','subtle',`data-key="${key}"`)}${item.kind==='photo'?button('confirm-delete-photo','この写真を削除',null,'subtle',`data-key="${key}"`):''}</div>`);}
function toggleSelect(key){if(!items(state).some(i=>i.key===key))return;const n=state.selected.indexOf(key);if(n>=0)state.selected.splice(n,1);else{if(state.selected.length>=20){toast('発表は20ページまで選べます。',true);return;}state.selected.push(key);}save();render();}
function showSettings(){openModal('設定と探検データ',`<div class="setting-row"><div><strong>効果音</strong><p class="fine">撮影や達成を音で知らせます。</p></div><input aria-label="効果音を使う" type="checkbox" data-setting="sound" ${state.sound?'checked':''}></div><div class="setting-row"><div><strong>動きを少なくする</strong><p class="fine">移動や撮影の演出を短くします。</p></div><input aria-label="動きを少なくする" type="checkbox" data-setting="reducedMotion" ${state.reducedMotion?'checked':''}></div><section class="settings-section"><h3>次の授業へ、記録を持っていこう。</h3><p class="muted">写真・サンプル・称号・発表の選択を保存します。別の端末でも、このファイルを読み込めば続きから遊べます。</p><div class="row wrap">${button('export-data','探検データを保存','download','')}${button('import-data','データを読み込む','upload')}</div><p class="fine">通常はこのブラウザにも自動保存されます。ブラウザのデータを消す前に、ファイルを保存してください。</p></section><div class="row wrap">${button('help','遊び方・科学について','info')}${button('confirm-reset','新しい探検を始める',null)}</div>`);}
function showHelp(){openModal('旅のしおり',`<div class="help-steps"><div><strong>1. 時代を選ぶ</strong><p>「時代を選ぶ」で調査する年代へ移動します。年代は固定され、自転・公転だけが自動で動きます。地球の誕生では、窓の「衝突から月の形成を観察」でNASAが紹介した研究シミュレーションを観察できます。</p></div><div><strong>2. 自由に操縦して、撮影・採集</strong><p>窓をドラッグして見回し、操縦パネルやWASD・Q/Eキーで移動できます。太陽系360°では目的地を選び「光速で向かう」で飛行。「光速・実時間」と「光速・時間短縮」を選べます。時間短縮はスライダーで10〜100倍に調整でき、飛行中も変更できます。Xで停止できます。「最初の位置に戻る」で帰れます。好きな構図で写真を撮り、写真やサンプルを持ち帰りましょう。光は観測データとして記録します。</p></div><div><strong>3. 自分の発見を伝える</strong><p>コレクションで「発表に使う」を選び、PDFを作成。描画ツールで白い欄に書き込みます。</p></div></div><details><summary>先生へ・授業の進め方</summary><p>50分なら導入5分・探索30分・発表資料選びとPDF保存10分・データ保存5分が目安です。次の授業ではPDFに手書きし、発表します。未達成のミッションがあってもPDFを作れます。</p><p>学校のChromebookで公開URLとPDFの書き込み・保存を事前に確認してください。生徒の記録は各端末に保存され、外部へ送信されません。</p></details><details><summary>科学とゲームの設定</summary><p>宇宙の歴史は科学に基づく再現、未来は予測です。時代旅行・光速移動・安全な採集は架空技術です。物体を光速まで加速することはできません。</p><p>天体・試料の画像は生成したイメージです。宇宙初期の色や構造も理解を助けるための表現です。天体の表示サイズや画像の縮尺は場所によって異なります。「太陽系360°」では太陽と8つの惑星を3Dで配置し、裏側や上下にも回り込めます。軌道上の位置と惑星の表面には画像を使い、自転・公転の動きを再現しています。実際の日時の天体配置ではありません。歴史の調査地点も360度で観察できます。過去・未来の惑星配置は推定を含む学習モデルです。</p><p>太陽は赤色巨星の後、白色矮星になります。超新星爆発やブラックホールになる星とは区別しています。</p><ul class="sources"><li><a href="https://science.nasa.gov/universe/overview/" target="_blank" rel="noopener noreferrer">NASA：宇宙の歴史</a></li><li><a href="https://spaceplace.nasa.gov/solar-system-formation/en/" target="_blank" rel="noopener noreferrer">NASA：太陽系の形成</a></li><li><a href="https://science.nasa.gov/earth/facts/" target="_blank" rel="noopener noreferrer">NASA：地球</a></li><li><a href="https://science.nasa.gov/sun/facts/" target="_blank" rel="noopener noreferrer">NASA：太陽</a></li><li><a href="https://science.nasa.gov/resource/the-life-cycle-of-a-sun-like-star-annotated/" target="_blank" rel="noopener noreferrer">NASA：太陽のような星の一生</a></li></ul></details>`);}
function animate(label,duration=1300,kind='scan'){
  // Finish the previous effect before giving the overlay a new owner.
  skipAnimation?.();
  $('#transition-label').textContent=label;$('#transition').classList.toggle('epoch-transition',kind==='epoch');$('#transition').hidden=false;
  return new Promise(resolve=>{
    let finished=false;
    const finish=()=>{
      if(finished)return;finished=true;clearTimeout(timer);
      if(skipAnimation===finish){skipAnimation=null;$('#transition').hidden=true;}
      resolve();
    };
    const timer=setTimeout(finish,state.reducedMotion?40:duration);
    skipAnimation=finish;
  });
}
async function travel(id){
  const scene=sceneById(id);if(!scene||busy)return;flight?.stop();busy=true;closeModal();
  try{
    // The destination is rendered in 3D. A missing map thumbnail must not block it.
    await animate(`${scene.era} — ${scene.name}へ移動`,850,'epoch');
    const timeScale=worldState().timeScale||10,colorMode=worldState().colorMode;
    state.currentScene=id;state.flightMode='history';state.whiteDwarfView='explore';state.camera=defaultCamera();
    state.playback.playing=!state.reducedMotion;
    state.historySolar={...defaultSolar(id),timeScale,colorMode,motion:state.playback.playing?'evolving':'paused'};
    busy=false;save();view='ship';render();window.scrollTo({top:0,behavior:'instant'});
  }catch(e){toast(e.message,true);}
  finally{skipAnimation?.();busy=false;}
}
async function observe(){if(busy)return;if(impactCockpit?.active){openModal('月の形成：研究と再現の根拠',impactSourcesHtml());return;}flight?.stop();if(state.flightMode==='history'&&isSceneSubject(state.currentScene,worldState()))commit(()=>{if(!state.observed.includes(state.currentScene))state.observed.push(state.currentScene);});showSolarObservation();}
async function photograph(){if(busy)return;if(impactCockpit?.active){toast('研究映像の撮影はできません。探検に戻ると写真を撮れます。');return;}flight?.stop();busy=true;try{await rendererReady;$('.cockpit')?.classList.add('flash');sound('shutter');await delay(state.reducedMotion?30:400);commit(()=>{const id=`p-${crypto.randomUUID()}`;recordWorldPhoto(state,id);},'写真をアルバムに保存しました');}catch(e){toast(e.message,true);}finally{busy=false;}}
const sampleDistance=au=>au>=.01?`${au.toLocaleString('ja-JP',{maximumFractionDigits:2})} AU`:`${Math.round(au*AU_KM).toLocaleString('ja-JP')} km`;
function samplingStatus(world){
  const {current,nearest,phaseMessage}=getSamplingContext(world);
  if(phaseMessage)return phaseMessage;
  return current?`${current.label}：${sampleById(current.sampleId).name}${hasSample(state,current.sampleId)?'（採集済み）':''}`:nearest?`採集範囲の外です。${nearest.label}まで ${sampleDistance(length(sub(world.position,nearest.position)))}`:'この時点には調査地点がありません。';
}
let lastSamplingUpdate=0;
function updateSamplingStatus(world,force=false){
  const now=performance.now();if(!force&&now-lastSamplingUpdate<160)return;lastSamplingUpdate=now;
  const status=$('#sampling-status');if(status){const text=samplingStatus(world);if(status.textContent!==text)status.textContent=text;}
  const panel=$('#live-observations');if(panel){const html=observationPanel(world);if(panel.innerHTML!==html)panel.innerHTML=html;}
}
function observationPanel(world){
  const observation=observeWorld(world);
  return `<h3>${esc(observation.title)}</h3><div class="observation-values">${observation.rows.map(row=>`<div title="${esc(row.note)}"><small>${esc(row.label)}</small><strong>${esc(row.value)} <span>${esc(row.unit)}</span></strong></div>`).join('')}</div><p class="fine">${world.era==='early-universe'?'太陽や惑星ができる前の、宇宙全体の状態を表します。':'1 AUは地球と太陽の平均距離。光量は、同じ時期の1 AUの場所を1とした計算です。船を動かすと数値が変わります。'}</p><p class="observation-assumptions">${esc(observation.note)}</p>`;
}
function recordSciencePanel(record){
  const lines=recordScienceLines(record);if(!lines.length)return '';
  return `<section class="record-science"><h3>この記録の年代・表示・観測値</h3>${lines.map(line=>`<p>${rubyText(line)}</p>`).join('')}</section>`;
}
function chooseSample(){
  if(impactCockpit?.active){toast('研究映像の観察中です。探検に戻ると採集できます。');return;}
  flight?.stop();const world=worldState(),{locations,available,phaseMessage}=getSamplingContext(world);
  if(phaseMessage){openModal('この時点で記録できるもの',`<p>${rubyText(phaseMessage)}</p>${button('sample-final-stage','晴れ上がりの時点へ進む','time')}`);return;}
  openModal('場所を変えて採集しよう',`<p class="sampling-now">${esc(samplingStatus(world))}</p><p>場所によって、見つかるものが変わります。船を動かして調べよう。</p><div class="sample-sites">${locations.map(site=>{
    const sample=sampleById(site.sampleId),near=available.some(location=>location.id===site.id),collected=hasSample(state,sample.id);
    return `<article class="sample-site ${near?'in-range':''}">${sample.image?`<img src="${sample.image}" alt="">`:`<div class="sample-data-thumbnail">${icon('eye')}<span>光の観測データ</span></div>`}<div><span class="eyebrow">${near?'現在の調査地点':esc(sampleDistance(length(sub(world.position,site.position))))+' 先'}</span><h3>${rubyText(site.label)}</h3><strong>${rubyText(sample.name)}</strong><p>${rubyText(site.description)}</p>${collected?'<span class="sample-earned">採集済み</span>':''}<div class="row wrap">${near?button('collect',collected?'記録を見る':'ここで採集する','sample','','data-sample="'+sample.id+'"'):button('sample-face','この地点へ向く','eye','subtle','data-site="'+site.id+'"')+button('sample-site','この地点へ移動','rocket','subtle','data-site="'+site.id+'"')}</div></div></article>`;
  }).join('')}</div><p class="fine">「この地点へ向く」のあと前進して探せます。「この地点へ移動」は待たずに到着する観察用の移動補助です。光は観測データとして記録します。</p>`,true);
}
function moveToSampleSite(id,faceOnly=false){
  flight?.stop();const world=worldState(),site=getSampleLocations(world).find(location=>location.id===id);if(!site)return;
  
  state[state.flightMode==='solar'?'solar':'historySolar']={...world,position:[...(faceOnly?world.position:site.position)],orientation:lookAt(faceOnly?sub(site.position,world.position):sub(site.lookAt,site.position)),target:site.bodyId||world.target,speed:'inspect',motion:'paused',eventPlaying:false};
  closeModal();save();navigate('ship');toast(faceOnly?`${site.label}の方向を向きました。前進して近づこう。`:`${site.label}へ移動しました。サンプル採取で調べよう。`);
}
async function collectSample(id){
  if(busy)return;flight?.stop();const sample=sampleById(id);
  if(!sample||!getSamplingContext(worldState()).available.some(site=>site.sampleId===id)){toast('この場所では採集できません。調査地点へ移動してください。',true);return;}
  if(hasSample(state,id)){showDetail(`sample:${id}`);return;}
  busy=true;closeModal();
  try{
    if(sample.image)await loadImage(sample.image);
    await animate(sample.kind==='data'?'観測装置で、光の記録を取得中':'探査ドローンが、試料を回収中',1400);
    commit(()=>recordSample(state,id),`${sample.name}をコレクションに追加しました`);showDetail(`sample:${id}`);
  }catch(e){toast(e.message,true);}finally{skipAnimation?.();busy=false;}
}
async function preview(key){const item=items(state).find(i=>i.key===key);if(!item)return;openModal('発表ページのプレビュー','<p class="muted">ページを作成しています…</p>',true);const request=modalRevision;try{const page=await renderSlide(item,state.titles[key]||item.name,state.selected.indexOf(key)+1,state.selected.length,1.6);if(modal.open&&request===modalRevision){$('.modal-body').innerHTML='<div class="pdf-preview"></div><p class="fine">PDFを保存した後、Chromebookの描画ツールで白い欄に書き込めます。</p>';$('.pdf-preview').append(page);}}catch(e){if(request===modalRevision){toast(e.message,true);closeModal();}}}
async function exportPdf(){const selected=selectedItems();if(!selected.length||busy)return;busy=true;const titles={...state.titles},btn=$('[data-action="export-pdf"]'),titleInput=$('[data-title-key]');btn.disabled=true;if(titleInput)titleInput.disabled=true;try{const blob=await createPdf(selected,titles,(n,total)=>{btn.textContent=`PDFを作成中 ${n} / ${total}`;});commit(()=>{state.pdfCreated=true;});showDownload(blob,'わたしの宇宙調査.pdf','発表PDFができました','PDFをダウンロード','保存したPDFをChromebookの描画ツールで開き、白い欄に書き込んでください。');}catch(e){toast(e.message||'PDFを作成できませんでした。',true);}finally{busy=false;render();}}
function showDownload(blob,filename,title,label,note){if(latestDownloadUrl)URL.revokeObjectURL(latestDownloadUrl);latestDownloadUrl=URL.createObjectURL(blob);openModal(title,"<p>"+esc(note)+"</p><a class='button wide' href='"+latestDownloadUrl+"' download='"+esc(filename)+"'>"+icon('download')+label+"</a><p class='fine'>ファイルの保存先を確認してください。</p>");}function exportData(){showDownload(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),'時空調査船-探検データ.json','探検データを持ち出す','探検データをダウンロード','このファイルを保存すると、次の授業や別の端末で探検の続きができます。');}
async function importData(file){if(!file)return;try{if(file.size>2*1024*1024)throw new Error('ファイルが大きすぎます。探検データのJSONファイルを選んでください。');pendingImport=validateState(JSON.parse(await file.text()));openModal('探検データを読み込む',`<p>写真${pendingImport.photos.length}枚、サンプル${pendingImport.samples.length}点の探検データです。</p><p>今の探検記録が、このファイルの記録に置き換わります。</p><div class="row wrap">${button('export-data','今の記録を保存','download')}${button('confirm-import','このデータを読み込む','upload','')}</div>`);}catch(e){toast(e instanceof SyntaxError?'探検データのJSONファイルを読み込んでください。':e.message,true);}finally{$('#import-file').value='';}}

// Interaction routing. All rendered user input is escaped or assigned via textContent.
document.addEventListener('click',async e=>{const el=e.target.closest('button,a[data-view]');if(!el)return;if(el.id==='skip-transition'){skipAnimation?.();return;}if(el.dataset.action==='close'){closeModal();return;}if(busy)return;if(el.dataset.view){navigate(el.dataset.view);return;}if(el.dataset.filter){filter=el.dataset.filter;collectionPage=0;render();return;}const a=el.dataset.action,key=el.dataset.key;try{switch(a){
case 'playback-toggle':if(state.playback.playing)flight?.stop();else{state.playback.playing=true;flight?.resume();save();updatePlaybackBar();}break;
case 'impact-research':showImpactResearch();break;
case 'flight-panel':toggleFlightPanel(el.dataset.panel);break;
case 'flight-close':closeFlightPanels();break;
case 'map-choice':mapChoice=el.dataset.scene;renderWithFocus('.time-choices [aria-pressed="true"]');break;
case 'collection-page':{const direction=Number(el.dataset.page)>collectionPage?'last':'first';collectionPage=Number(el.dataset.page);renderWithFocus(`.screen-pager button:${direction}-child`,'.screen-pager button:not(:disabled)');break;}
case 'presentation-page':{const direction=Number(el.dataset.page)>presentationIndex?'last':'first';presentationIndex=Number(el.dataset.page);renderWithFocus(`.screen-pager button:${direction}-child`,'.screen-pager button:not(:disabled)');break;}
case 'dwarf-overview':flight?.stop();state.historySolar={...state.historySolar,position:defaultSolar('white-dwarf').position,orientation:defaultSolar('white-dwarf').orientation,target:'sun'};save();closeModal();navigate('ship');break;
case 'enter-solar':case 'enter-history':flight?.stop();state.flightMode=a==='enter-solar'?'solar':'history';state.playback.playing=!state.reducedMotion;worldState().motion=state.playback.playing?'evolving':'paused';save();closeModal();navigate('ship');break;case 'ship':closeModal();navigate('ship');break;case 'collection':closeModal();navigate('collection');break;case 'presentation':closeModal();navigate('presentation');break;
case 'science-guide':showScienceGuide();break;case 'curriculum':showCurriculum(el.dataset.lesson);break;case 'lesson-travel':await goToLesson(el.dataset.lesson);break;
case 'album':filter='photo';navigate('collection');break;case 'samples':filter='sample';navigate('collection');break;case 'missions':showMissions();break;case 'shelf':showShelf();break;case 'help':showHelp();break;
case 'observe':await observe();break;case 'photograph':await photograph();break;case 'sample':chooseSample();break;case 'collect':await collectSample(el.dataset.sample);break;case 'travel':await travel(el.dataset.scene);break;case 'next':navigate('time');break;case 'next-task':{const next=nextTask(state);if(next)await travel(next.task.scene);else navigate('presentation');break;}
case 'sample-site':moveToSampleSite(el.dataset.site);break;
case 'sample-face':moveToSampleSite(el.dataset.site,true);break;
case 'sample-final-stage':{const key=state.flightMode==='solar'?'solar':'historySolar';if(state[key].era==='early-universe'){flight?.stop();state[key]={...state[key],eventProgress:1,eventPlaying:false};closeModal();save();navigate('ship');chooseSample();}break;}
case 'choose-mission':state.activeMission=el.dataset.mission;mapChoice=nextTask(state)?.task.scene||state.currentScene;save();closeModal();navigate('time');break;case 'detail':showDetail(key);break;case 'toggle-select':toggleSelect(key);break;case 'detail-select':toggleSelect(key);showDetail(key);break;
case 'confirm-delete-photo':{const photo=state.photos.find(p=>`photo:${p.id}`===key);if(photo)openModal('この写真を削除しますか？',`<p>この写真をアルバムと発表の選択から削除します。使っている比較カードやミッションが未達成に戻る場合があります。</p><p>必要な記録は、先に設定から探検データを保存してください。</p><div class="row wrap">${button('close','キャンセル',null,'subtle')}${button('delete-photo','写真を削除する',null,'danger',`data-key="${key}"`)}</div>`);break;}
case 'delete-photo':if(state.photos.some(p=>`photo:${p.id}`===key)){commit(()=>removePhoto(state,key.slice(6)),'写真を削除しました。新しい写真を撮れます。');closeModal();}break;
case 'recommend-slides':if(!state.selected.length){const keys=recommendedSelection(state);if(keys.length)commit(()=>{state.selected=keys;},`おすすめ${keys.length}枚を選びました。順番や内容は自由に変えられます。`);}break;
case 'make-single':if(!state.selected.includes(key))toggleSelect(key);if(state.selected.includes(key)){presentationIndex=state.selected.indexOf(key);closeModal();navigate('presentation');}break;case 'remove-selected':toggleSelect(key);break;
case 'move-up':case 'move-down':{const i=state.selected.indexOf(key),j=i+(a==='move-up'?-1:1);if(i>=0&&j>=0&&j<state.selected.length){[state.selected[i],state.selected[j]]=[state.selected[j],state.selected[i]];presentationIndex=j;save();renderWithFocus(`[data-action="${a}"]`,'.slide-order button:not(:disabled)');}break;}
case 'preview':await preview(key);break;case 'export-pdf':await exportPdf();break;case 'export-data':exportData();break;case 'import-data':$('#import-file').click();break;
case 'confirm-import':if(pendingImport){flight?.dispose();flight=null;state=pendingImport;pendingImport=null;preparePlayback();damagedSave=false;save();closeModal();navigate('ship');toast('探検データを読み込みました');}break;
case 'confirm-reset':openModal('新しい探検を始めますか？',`<p>今の写真・サンプル・称号がリセットされます。続きから遊びたい場合は、先に探検データを保存してください。</p><div class="row wrap">${button('export-data','今の記録を保存','download')}${button('reset','リセットして始める',null,'danger')}</div>`);break;
case 'reset':flight?.dispose();flight=null;state=freshState();state.started=true;preparePlayback();damagedSave=false;save();closeModal();navigate('ship');toast('新しい探検を始めました');break;
case 'speak':reader.start(readableText(modal.querySelector('.dialog-page:not([hidden])')||el.closest('[data-reading-panel]')?.querySelector('[data-reading-content]')));break;case 'stop-reading':reader.stop();break;
}}catch(err){toast(err.message||'操作を完了できませんでした。',true);}});
document.addEventListener('input',e=>{if(e.target.dataset.titleKey&&!busy){state.titles[e.target.dataset.titleKey]=e.target.value.slice(0,32);save();clearTimeout(previewTimer);previewTimer=setTimeout(()=>{if(view==='presentation')hydratePresentationPreview();},250);}});
document.addEventListener('change',e=>{if(e.target.matches('[data-lesson-select]'))showCurriculum(e.target.value);if(e.target.dataset.setting){state[e.target.dataset.setting]=e.target.checked;if(state.reducedMotion)flight?.stop();save();document.body.classList.toggle('reduce-motion',state.reducedMotion);}if(e.target.id==='import-file')importData(e.target.files[0]);});
document.querySelector('.brand').addEventListener('click',e=>{e.preventDefault();if(!busy)navigate('ship');});$('#rank-button').onclick=()=>{if(!busy)showRanks();};$('#settings-button').onclick=()=>{if(!busy)showSettings();};
window.addEventListener('error',e=>{if(e.target instanceof HTMLImageElement){e.target.classList.add('image-failed');e.target.alt='画像を読み込めません。通信を確認してページを開き直してください。';}},true);
setInterval(()=>{if(document.visibilityState==='visible'){state.minutes++;save();const stats=$('#ship-statistics');if(stats)stats.textContent=`写真 ${state.photos.length}枚 ・ サンプル ${state.samples.length}点 ・ 画面表示 ${state.minutes}分`;if(state.minutes===30)toast('画面表示30分。発表に使う記録を選び始めよう。');}},60000);
let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(view==='collection')render();},160);});
save();render();

const context=document.modelContext;
if(context?.registerTool){const lifecycle=new AbortController();window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});const tools=[
{name:'read_expedition',title:'探検記録を読む',description:'現在の場所、称号、ミッション達成、収集物を読み取る。',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute:()=>({scene:state.currentScene,flightMode:state.flightMode,solar:state.solar,historySolar:state.historySolar,rank:RANKS[rankIndex(state)],missions:missionProgress(state).map(m=>({id:m.id,complete:m.complete})),records:items(state).map(i=>({key:i.key,name:i.name})),selected:[...state.selected]})},
{name:'open_expedition_view',title:'探検の画面を開く',description:'船内、時代マップ、コレクション、発表の画面を表示する。記録の作成やPDFの保存は行わない。',inputSchema:{type:'object',properties:{view:{type:'string',enum:['ship','time','collection','presentation']}},required:['view'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:input=>{if(busy||!input||!['ship','time','collection','presentation'].includes(input.view))throw new Error('表示先を指定してください。');navigate(input.view);return {view};}}
];for(const tool of tools)try{Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}}


function renderSolarShip(){
 const world=worldState(),history=state.flightMode==='history',scene=history?sceneById(state.currentScene):null,complete=missionProgress(state).filter(m=>m.complete).length;
 return `<div class="page ship-page solar-zone compact-page"><header class="ship-toolbar"><h1>${scene?rubyText(scene.name):'現在の太陽系'}</h1><div class="row">${button('missions','調査 '+complete+'/3','target','subtle small')}${button('curriculum','学習ノート','info','subtle small')}${history?button('enter-solar','現在へ','rocket','subtle small'):button('enter-history','歴史へ','time','subtle small')}</div></header>
 <section class="cockpit solar-cockpit" aria-label="宇宙船の窓"><div class="solar-window"><canvas class="solar-canvas" tabindex="0" width="1100" height="620" aria-label="360度の宇宙。ドラッグで見回す。WASDとQ/Eで移動。Xで停止。スペースで撮影。"></canvas><span class="solar-target-marker" hidden></span></div>${world.era==='young-earth'?impactCockpitHtml():''}<img class="cockpit-overlay" src="assets/cockpit.png" alt="" aria-hidden="true"><div class="scene-label"><span class="location-kicker">${scene?(eventStage(world.era,world.eventProgress)?.label||scene.era):'現在'} / 360°</span><h2 class="solar-location">観測場所を確認中</h2></div><button class="scene-tag science-badge" data-action="science-guide" aria-label="この風景の科学的な根拠を開く">${icon('info')}<span>${esc(scienceGuide(world).label)}</span><span class="science-badge-link">根拠</span></button><div class="cockpit-caption solar-bearing">ドラッグで見回せます</div>
 <div class="window-tools">${world.era==='young-earth'?button('impact-research','衝突から月の形成を観察','eye','subtle small'):''}${button('flight-panel','操縦','rocket','subtle small','data-panel="pilot" aria-expanded="false"')}${button('flight-panel','時間','time','subtle small','data-panel="time" aria-expanded="false"')}${button('flight-panel','表示',null,'subtle small','data-panel="display" aria-expanded="false"')}</div>
 ${solarControls(world)}
 <div class="cockpit-controls"><button class="command" data-action="observe">${icon('eye')}<span>観察</span></button><button class="command" data-action="photograph">${icon('camera')}<span>撮影</span></button><button class="command" data-action="sample">${icon('sample')}<span>採集</span></button><button class="command" data-view="time">${icon('time')}<span>時代</span></button></div></section>
 <footer class="ship-statusbar"><button class="sampling-status-button" data-action="sample" title="採集地点を見る"><span id="sampling-status">${esc(samplingStatus(world))}</span></button><span data-playback-status></span>${button('playback-toggle','一時停止',null,'subtle small','aria-pressed="true"')}</footer>
 <section id="live-observations" hidden>${observationPanel(world)}</section><span id="ship-statistics" hidden>写真 ${state.photos.length}枚 ・ サンプル ${state.samples.length}点 ・ 画面表示 ${state.minutes}分</span></div>`;
}

function showScienceGuide(){
  const world=worldState(),guide=scienceGuide(world),formation=formationStage(world),stage=eventStage(world.era,world.eventProgress);
  openModal('この風景の科学的な根拠',`<section class="science-guide" data-reading-panel>${readingControls()}<div data-reading-content><p class="detail-meta">${rubyText(formation?.ageLabel||eraConfig(world.era).label)}${stage?` / ${rubyText(stage.label)}`:''}</p><p class="science-guide-intro">確認されていることと、模型で表している部分を確かめよう。</p>${guide.paragraphs.map(note=>`<p>${rubyText(note)}</p>`).join('')}</div></section>${flightExplanations(world,bodyById(world.target,world),stage)}<section class="science-guide-sources"><h3>参考にした観測・研究</h3><ul>${guide.sources.map(source=>`<li><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)}</a></li>`).join('')}</ul><p class="fine">リンク先は別のタブで開きます。本文が英語の資料もあります。</p></section>`);
}
function showSolarObservation(sampling=false){
  const world=worldState(),body=visibleBody(world)||nearestBody(world.position,world),history=state.flightMode==='history',scene=history?sceneById(state.currentScene):null;
  const distance=body?length(sub(world.position,body.position))*AU_KM:0,era=eraConfig(world.era);
  const stage=eventStage(world.era,world.eventProgress);
  const facts=[...(formationStage(world)?[formationStage(world).ageLabel,formationStage(world).note]:[]),...(body?.radiusNote?[body.radiusNote]:[]),...(stage?[stage.description]:[]),...(scene&&isSceneSubject(scene.id,world)&&world.eventProgress>=1?scene.facts:[]),...(body?[body.fact]:[]),...(body?.rotationDays?[`自転周期は約${Math.abs(body.rotationDays).toFixed(2)}日。自転の観察で回る様子を確かめよう。`]:[]),...(body?.orbitDays?[`公転周期は約${body.orbitDays.toFixed(1)}日。${body.parent&&body.parent!=='sun'?'親の惑星':'太陽'}の周りを回ります。`]:[])];
  openModal(sampling?'採集の案内':`${body?body.name:era.label}を観察`,`${sampling?'':'<div class="solar-observation"><canvas width="960" height="540" role="img" aria-label="現在の宇宙船からの風景"></canvas></div>'}<section data-reading-panel>${readingControls()}<div data-reading-content>${sampling?`<p>${rubyText('時代の調査地点で、探査ドローンによる試料採取や光の記録ができます。自由飛行では天体の全球を好きな方向から撮影しましょう。')}</p>`:''}<p class="detail-meta">${rubyText(stage?.label||era.label)}${body?` / ${body.name}の中心まで約${Math.round(distance).toLocaleString('ja-JP')} km`:''}</p><ul class="facts">${facts.map(f=>`<li>${rubyText(f)}</li>`).join('')}</ul><p>${rubyText(era.note)}</p>${observationPanel(world)}</div></section><div class="row wrap">${button('photograph','今の方向を写真に撮る','camera','')}${button('curriculum','授業の内容とつなげる','info','subtle')}${sampling?button('travel','誕生期の地球で岩石を採る','sample','subtle','data-scene="young-earth"')+button('travel','太陽系のはじまりでちりを採る','sample','subtle','data-scene="solar-nebula"'):''}</div>${body?`<p class="fine"><a href="${body.source}" target="_blank" rel="noopener noreferrer">科学の参考資料</a></p>`:''}`);
  const c=$('.solar-observation canvas'),snapshot=JSON.parse(JSON.stringify(world));if(c){c.height=Math.round(c.width/(snapshot.aspect||16/9));}if(c)rendererReady.then(()=>{if(c.isConnected)drawSolarPhoto(c.getContext('2d'),snapshot,0,0,c.width,c.height);}).catch(e=>toast(e.message,true));
}
function showCurriculum(id){
  const selected=LESSONS.find(l=>l.id===id)||LESSONS[0];
  openModal('宇宙の学習ノート 001〜010',`<p class="muted">授業の言葉を確かめて、宇宙船の窓から探してみよう。</p><div class="lesson-layout"><label class="lesson-selector">単元<select data-lesson-select aria-label="学習する単元">${LESSONS.map(l=>`<option value="${l.id}" ${l.id===selected.id?'selected':''}>${l.id} ${esc(l.title)}</option>`).join('')}</select></label><article class="lesson-content" data-reading-panel>${readingControls()}<div data-reading-content><p class="eyebrow">LESSON ${selected.id}</p><h3>${rubyText(selected.title)}</h3><p>${rubyText(selected.summary)}</p><div class="lesson-keywords">${selected.keywords.map(k=>`<span>${rubyText(k)}</span>`).join('')}</div><div class="lesson-figure">${renderLessonFigure(selected.id)}</div><ul class="facts">${selected.facts.map(f=>`<li>${rubyText(f)}</li>`).join('')}</ul>${selected.details?.length?`<details><summary>もう少し知る</summary>${selected.details.map(d=>`<h4>${rubyText(d.title)}</h4><p>${rubyText(d.text)}</p>`).join('')}</details>`:''}<div class="observation-question"><strong>${rubyText(selected.question)}</strong></div><p>${rubyText(selected.activity)}</p>${button('lesson-travel','この内容を観察しに行く','rocket','','data-lesson="'+selected.id+'"')}<p class="fine">授業プリント No.${selected.id} に対応。図は学習用の模式図です。</p></div></article></div>`,true);
}
async function goToLesson(id){
  const lesson=LESSONS.find(l=>l.id===id);if(!lesson)return;
  if(lesson.scene==='present'||lesson.scene==='solar-system'){closeModal();const previous=worldState();state.flightMode='solar';state.solar={...defaultSolar(),timeScale:previous.timeScale||10,colorMode:previous.colorMode};}
  else await travel(lesson.scene||'earth');
  const world=worldState(),body=bodyById(lesson.target,world);
  if(body){world.target=body.id;world.position=approachPosition(body);world.orientation=lookAt(sub(body.position,world.position));}
  state.playback.playing=!state.reducedMotion;world.motion=state.playback.playing?'evolving':'paused';world.eventPlaying=false;
  save();navigate('ship');toast(lesson.activity);
}

function recordScene(item){
  const scene=sceneById(item.scene),science=recordScience(item.record),snapshot=science?.world;
  if(!snapshot)return scene;
  const era=eraConfig(snapshot.era),body=bodyById(snapshot.subject,snapshot),stage=eventStage(snapshot.era,snapshot.eventProgress);
  return {...scene,era:`${science.age} / ${science.stage}`,location:body?.name||'宇宙の全天',summary:stage?`${stage.description} ${eventForEra(snapshot.era).note}`:body?.fact||era.note};
}
